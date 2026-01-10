/**
 * AI Council Orchestrator
 * 
 * Main entry point for running a council debate session.
 * Manages rounds, tool execution, and report generation.
 */

import { createAllAgents, type BaseAgent } from './agents';
import { Moderator } from './moderator';
import { getAllQuickStats } from './tools';
import type {
    CouncilInput,
    CouncilReport,
    DebateState,
    DebateRound,
    AgentMessage,
    MODEL_COSTS,
} from './types';

/**
 * Run a full council debate session
 */
export async function runCouncilDebate(input: CouncilInput): Promise<CouncilReport> {
    const {
        topic,
        context,
        customPrompt,
        maxRounds = 3,
        enableTools = true,
        budgetLimit = 5,
        verbose = false,
    } = input;

    console.log('\n' + '═'.repeat(60));
    console.log('🧠 AI COUNCIL - DEBATE ESTRATÉGICO');
    console.log('═'.repeat(60));
    console.log(`📋 Tópico: ${topic}`);
    console.log(`🔄 Rounds: ${maxRounds}`);
    console.log(`💰 Budget: €${budgetLimit}`);
    console.log('═'.repeat(60) + '\n');

    // Initialize state
    const state: DebateState = {
        sessionId: `council-${Date.now()}`,
        topic,
        currentRound: 0,
        maxRounds,
        rounds: [],
        consensus: [],
        conflicts: [],
        moderatorNotes: [],
        status: 'IN_PROGRESS',
        startTime: new Date(),
        totalTokens: 0,
        totalCost: 0,
    };

    // Get initial context
    let fullContext = context;
    if (enableTools) {
        try {
            const quickStats = await getAllQuickStats();
            fullContext += `\n\n# DADOS DO SISTEMA\n${JSON.stringify(quickStats, null, 2)}`;
        } catch (error: any) {
            console.warn('⚠️ Failed to get quick stats:', error.message);
        }
    }

    if (customPrompt) {
        fullContext += `\n\n# CONTEXTO ADICIONAL\n${customPrompt}`;
    }

    // Create agents and moderator
    const agents = createAllAgents(verbose);
    const moderator = new Moderator(verbose);

    // Set agenda
    const agenda = await moderator.setAgenda(topic, fullContext);
    state.moderatorNotes.push(`AGENDA: ${agenda}`);
    console.log('\n📋 AGENDA DEFINIDA:\n' + agenda);

    // Run rounds
    const phases = ['INITIAL', 'CROSS_EXAM', 'CONVERGENCE'] as const;

    for (let roundNum = 0; roundNum < maxRounds; roundNum++) {
        const phase = phases[Math.min(roundNum, phases.length - 1)];

        console.log(`\n${'─'.repeat(60)}`);
        console.log(`🔄 ROUND ${roundNum + 1}/${maxRounds} - ${phase}`);
        console.log('─'.repeat(60));

        const round: DebateRound = {
            roundNumber: roundNum + 1,
            phase,
            messages: [],
            startTime: new Date(),
        };

        // Get responses from all agents (sequential with delay to avoid rate limits)
        const previousMessages = state.rounds.flatMap(r => r.messages);
        const agentResponses = [];

        for (const agent of agents) {
            try {
                const response = await agent.respond({
                    topic,
                    initialContext: fullContext,
                    previousMessages,
                    currentRound: roundNum + 1,
                    phase,
                });
                agentResponses.push(response);

                // Add a small delay between agent calls
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (error: any) {
                console.error(`❌ ${agent.name} failed:`, error.message);
                agentResponses.push(null);
            }
        }

        // Collect responses
        for (const response of agentResponses) {
            if (response) {
                round.messages.push(response.message);
                state.totalTokens = (state.totalTokens || 0) + response.tokensUsed;

                if (verbose) {
                    console.log(`\n${response.message.agentId}:`);
                    console.log(response.message.content.slice(0, 200) + '...');
                }
            }
        }

        round.endTime = new Date();
        state.rounds.push(round);

        // Moderator analysis
        const analysis = await moderator.analyzeRound(round, state.consensus, state.conflicts);
        state.consensus = analysis.consensus;
        state.conflicts = analysis.conflicts;
        state.moderatorNotes.push(`Round ${roundNum + 1}: ${analysis.notes}`);

        console.log(`\n📊 Moderador: ${analysis.notes}`);
        console.log(`   Consensos: ${state.consensus.length} | Conflitos: ${state.conflicts.length}`);

        // Check budget
        const estimatedCost = estimateCost(state.totalTokens || 0);
        if (estimatedCost > budgetLimit) {
            console.log(`\n⚠️ Budget limit reached (€${estimatedCost.toFixed(2)} > €${budgetLimit})`);
            break;
        }
    }

    // Final synthesis
    console.log('\n' + '═'.repeat(60));
    console.log('🎯 SÍNTESE FINAL');
    console.log('═'.repeat(60));

    const recommendation = await moderator.synthesize(
        topic,
        state.rounds,
        state.consensus,
        state.conflicts
    );

    state.endTime = new Date();
    state.status = 'COMPLETED';
    state.totalCost = estimateCost(state.totalTokens || 0);

    // Generate report
    const report = generateReport(state, agents, recommendation);

    console.log('\n✅ Debate concluído!');
    console.log(`   Duração: ${formatDuration(state.startTime, state.endTime)}`);
    console.log(`   Tokens: ${state.totalTokens?.toLocaleString()}`);
    console.log(`   Custo estimado: €${state.totalCost?.toFixed(2)}`);
    console.log(`   Recomendação: €${recommendation.pricing.recommended}`);

    return report;
}

/**
 * Generate final report
 */
function generateReport(
    state: DebateState,
    agents: BaseAgent[],
    recommendation: any
): CouncilReport {
    const duration = formatDuration(state.startTime, state.endTime || new Date());

    // Build agent positions
    const agentPositions = agents.map(agent => {
        const agentMessages = state.rounds.flatMap(r =>
            r.messages.filter(m => m.agentId === agent.id)
        );

        return {
            agentId: agent.id,
            agentName: agent.name,
            emoji: agent.emoji,
            initialPosition: agentMessages[0]?.content.slice(0, 300) || 'N/A',
            finalPosition: agentMessages[agentMessages.length - 1]?.content.slice(0, 300) || 'N/A',
            keyArguments: extractKeyArguments(agentMessages),
            toolsUsed: extractToolsUsed(agentMessages),
        };
    });

    // Round summaries
    const roundSummaries = state.rounds.map((round, i) => ({
        round: round.roundNumber,
        phase: round.phase,
        highlights: [state.moderatorNotes[i + 1] || 'Debate realizado'],
    }));

    return {
        metadata: {
            sessionId: state.sessionId,
            topic: state.topic,
            duration,
            totalRounds: state.rounds.length,
            totalTokens: state.totalTokens || 0,
            estimatedCost: `€${(state.totalCost || 0).toFixed(2)}`,
            generatedAt: new Date(),
        },
        summary: state.moderatorNotes.join('\n'),
        roundSummaries,
        agentPositions,
        consensus: state.consensus,
        conflicts: state.conflicts,
        recommendation,
    };
}

/**
 * Helper functions
 */
function estimateCost(tokens: number): number {
    // Average cost across models: ~$3 per 1M tokens
    return (tokens / 1_000_000) * 3;
}

function formatDuration(start: Date, end: Date): string {
    const ms = end.getTime() - start.getTime();
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
}

function extractKeyArguments(messages: AgentMessage[]): string[] {
    // Extract key points from agent messages
    const args: string[] = [];

    for (const msg of messages) {
        try {
            const match = msg.content.match(/\*\*Argumentos:\*\*\s*([^\n]+)/);
            if (match) {
                args.push(...match[1].split(',').map(s => s.trim()));
            }
        } catch {
            // Skip
        }
    }

    return args.slice(0, 5); // Limit to 5
}

function extractToolsUsed(messages: AgentMessage[]): any[] {
    const tools: any[] = [];

    for (const msg of messages) {
        if (msg.toolCalls) {
            tools.push(...msg.toolCalls.map(t => t.tool));
        }
    }

    return [...new Set(tools)];
}

// Export for direct use
export { Moderator } from './moderator';
export { createAllAgents, createAgent } from './agents';
export * from './types';
