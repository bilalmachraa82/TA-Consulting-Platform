/**
 * Base Agent
 * 
 * Abstract base class for all council agents.
 * Handles tool invocation, message formatting, and LLM calls.
 */

import { openrouter } from '@/lib/openrouter';
import { executeTool, type ToolParams } from '../tools';
import type {
    AgentId,
    AgentConfig,
    AgentMessage,
    ToolResult,
    ToolName,
    ToolCallRequest,
} from '../types';

export interface AgentContext {
    topic: string;
    initialContext: string;
    previousMessages: AgentMessage[];
    currentRound: number;
    phase: 'INITIAL' | 'CROSS_EXAM' | 'CONVERGENCE' | 'SYNTHESIS';
}

export interface AgentResponse {
    message: AgentMessage;
    toolCalls: ToolResult[];
    rawResponse: string;
    tokensUsed: number;
}

/**
 * Base Agent Class
 */
export abstract class BaseAgent {
    protected config: AgentConfig;
    protected verbose: boolean;

    constructor(config: AgentConfig, verbose = false) {
        this.config = config;
        this.verbose = verbose;
    }

    get id(): AgentId {
        return this.config.id;
    }

    get name(): string {
        return this.config.name;
    }

    get emoji(): string {
        return this.config.emoji;
    }

    /**
     * Generate response for the current round
     */
    async respond(context: AgentContext): Promise<AgentResponse> {
        const startTime = Date.now();
        const toolCalls: ToolResult[] = [];

        // Build prompt based on phase
        const prompt = this.buildPrompt(context);

        if (this.verbose) {
            console.log(`\n${this.emoji} ${this.name} thinking...`);
        }

        // Call LLM
        const response = await this.callLLM(prompt);

        // Parse response for tool requests
        const toolRequests = this.parseToolRequests(response);

        // Execute requested tools
        for (const request of toolRequests) {
            if (this.config.tools.includes(request.tool)) {
                const result = await executeTool(request.tool, request.params);
                toolCalls.push(result);

                if (this.verbose) {
                    console.log(`  🔧 ${request.tool}: ${result.success ? '✓' : '✗'}`);
                }
            }
        }

        // If tools were called, do a follow-up call with tool results
        let finalResponse = response;
        if (toolCalls.length > 0) {
            const toolContext = this.formatToolResults(toolCalls);
            const followUpPrompt = `${prompt}\n\nTOOL RESULTS:\n${toolContext}\n\nBased on these results, provide your final analysis:`;
            finalResponse = await this.callLLM(followUpPrompt);
        }

        // Parse final response
        const parsedContent = this.parseResponse(finalResponse);

        const message: AgentMessage = {
            agentId: this.config.id,
            round: context.currentRound,
            timestamp: new Date(),
            content: parsedContent,
            toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        };

        return {
            message,
            toolCalls,
            rawResponse: finalResponse,
            tokensUsed: this.estimateTokens(prompt + finalResponse),
        };
    }

    /**
     * Build prompt for the agent
     */
    protected buildPrompt(context: AgentContext): string {
        const { topic, initialContext, previousMessages, currentRound, phase } = context;

        let prompt = `${this.config.systemPrompt}\n\n`;
        prompt += `# CONTEXTO\n${initialContext}\n\n`;
        prompt += `# TÓPICO EM DEBATE\n${topic}\n\n`;
        prompt += `# ROUND ${currentRound} - FASE: ${phase}\n\n`;

        // Add previous messages from other agents
        if (previousMessages.length > 0) {
            prompt += `# POSIÇÕES DOS OUTROS AGENTES\n`;
            for (const msg of previousMessages) {
                if (msg.agentId !== this.config.id) {
                    prompt += `\n## ${msg.agentId.toUpperCase()}\n${msg.content}\n`;
                }
            }
            prompt += '\n';
        }

        // Phase-specific instructions
        prompt += this.getPhaseInstructions(phase);

        return prompt;
    }

    /**
     * Get phase-specific instructions
     */
    protected getPhaseInstructions(phase: string): string {
        switch (phase) {
            case 'INITIAL':
                return `\n# A TUA TAREFA
Apresenta a tua análise inicial do tópico.
Se precisares de dados, pede ferramentas.
Foca nos pontos mais importantes para a tua perspetiva.`;

            case 'CROSS_EXAM':
                return `\n# A TUA TAREFA
Leste as posições dos outros agentes.
- Responde aos pontos com que discordas
- Reforça os teus argumentos com novos dados
- Identifica lacunas nas análises dos outros`;

            case 'CONVERGENCE':
                return `\n# A TUA TAREFA
Procura pontos de consenso.
- O que podes aceitar das outras posições?
- Mantém firme nos teus pontos críticos
- Propõe compromissos viáveis`;

            case 'SYNTHESIS':
                return `\n# A TUA TAREFA
É o momento final.
- Resume a tua posição final
- Indica explicitamente o que recomenidas
- Faz concessões onde possível`;

            default:
                return '';
        }
    }

    /**
     * Call the LLM via OpenRouter
     */
    protected async callLLM(prompt: string): Promise<string> {
        if (!openrouter) {
            throw new Error('OpenRouter not configured');
        }

        try {
            const completion = await openrouter.chat.completions.create({
                model: this.config.model,
                messages: [
                    { role: 'user', content: prompt },
                ],
                max_tokens: 2000,
                temperature: 0.7,
            });

            return completion.choices[0]?.message?.content || '';
        } catch (error: any) {
            console.error(`❌ LLM call failed for ${this.name}:`, error.message);
            return `{ "error": "${error.message}" }`;
        }
    }

    /**
     * Parse tool requests from response
     */
    protected parseToolRequests(response: string): ToolCallRequest[] {
        const requests: ToolCallRequest[] = [];

        try {
            // Try to parse JSON from response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);

                if (parsed.toolRequests && Array.isArray(parsed.toolRequests)) {
                    for (const req of parsed.toolRequests) {
                        if (req.tool && req.params) {
                            requests.push({
                                tool: req.tool as ToolName,
                                params: req.params as ToolParams,
                                reason: req.reason || '',
                            });
                        }
                    }
                }
            }
        } catch {
            // No valid JSON tool requests
        }

        return requests;
    }

    /**
     * Format tool results for context
     */
    protected formatToolResults(results: ToolResult[]): string {
        return results.map(r => {
            if (r.success) {
                return `[${r.tool}] SUCCESS:\n${JSON.stringify(r.data, null, 2)}`;
            } else {
                return `[${r.tool}] FAILED: ${r.error}`;
            }
        }).join('\n\n');
    }

    /**
     * Parse and clean the response content
     */
    protected parseResponse(response: string): string {
        // Try to extract structured content
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);

                // Format as readable text
                const parts: string[] = [];

                if (parsed.position) parts.push(`**Posição:** ${parsed.position}`);
                if (parsed.keyArguments) parts.push(`**Argumentos:** ${parsed.keyArguments.join(', ')}`);
                if (parsed.pricingSuggestion) parts.push(`**Sugestão Pricing:** ${JSON.stringify(parsed.pricingSuggestion)}`);
                if (parsed.risks) parts.push(`**Riscos:** ${parsed.risks.join(', ')}`);
                if (parsed.recommendations) parts.push(`**Recomendações:** ${parsed.recommendations.join(', ')}`);

                if (parts.length > 0) {
                    return parts.join('\n\n');
                }
            }
        } catch {
            // Not JSON, return as-is
        }

        return response;
    }

    /**
     * Estimate token count
     */
    protected estimateTokens(text: string): number {
        // Rough estimate: 1 token ≈ 4 characters
        return Math.ceil(text.length / 4);
    }
}
