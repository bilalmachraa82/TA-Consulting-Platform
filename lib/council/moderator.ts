/**
 * Moderator Agent
 * 
 * Orchestrates the debate, identifies consensus/conflicts, and synthesizes final recommendation.
 */

import { openrouter } from '@/lib/openrouter';
import type {
    AgentMessage,
    ConsensusItem,
    ConflictItem,
    FinalRecommendation,
    DebateRound,
    AGENT_CONFIGS,
} from './types';

const MODERATOR_MODEL = 'anthropic/claude-sonnet-4';

/**
 * Moderator class
 */
export class Moderator {
    private verbose: boolean;

    constructor(verbose = false) {
        this.verbose = verbose;
    }

    /**
     * Set agenda for Round 0
     */
    async setAgenda(topic: string, context: string): Promise<string> {
        if (this.verbose) {
            console.log('\n🎩 Moderador: Definindo agenda...');
        }

        const prompt = `Tu és o Moderador de um conselho de IA com 4 agentes especializados.

TÓPICO: ${topic}

CONTEXTO:
${context}

A tua tarefa é definir a AGENDA do debate. Os 4 agentes são:
- 🔵 Estratega Comercial: Foco em pricing e modelo de negócio
- 🟢 Advogado do Cliente: Foco na perspetiva do cliente
- 🟠 Técnico/Product: Foco no esforço e valor técnico
- 🔴 Devil's Advocate: Foco em riscos e objeções

Estrutura a agenda em 3 pontos principais que devem ser debatidos.
Sê conciso e direto. Máximo 200 palavras.`;

        const response = await this.callLLM(prompt);
        return response;
    }

    /**
     * Analyze a completed round
     */
    async analyzeRound(
        round: DebateRound,
        previousConsensus: ConsensusItem[],
        previousConflicts: ConflictItem[]
    ): Promise<{ notes: string; consensus: ConsensusItem[]; conflicts: ConflictItem[] }> {
        if (this.verbose) {
            console.log(`\n🎩 Moderador: Analisando Round ${round.roundNumber}...`);
        }

        const messagesText = round.messages
            .map(m => `## ${m.agentId.toUpperCase()}\n${m.content}`)
            .join('\n\n');

        const prompt = `Analisa as posições do Round ${round.roundNumber}.

MENSAGENS DOS AGENTES:
${messagesText}

CONSENSO PRÉVIO:
${previousConsensus.length > 0 ? JSON.stringify(previousConsensus, null, 2) : 'Nenhum ainda'}

CONFLITOS PRÉVIOS:
${previousConflicts.length > 0 ? JSON.stringify(previousConflicts, null, 2) : 'Nenhum ainda'}

A TUA TAREFA:
1. Identifica pontos de CONSENSO (onde 3+ agentes concordam)
2. Identifica CONFLITOS (onde há discordância significativa)
3. Resume as notas do round

Responde em JSON:
{
  "notes": "Resumo do round em 2-3 frases",
  "consensus": [{ "topic": "...", "position": "...", "supportingAgents": ["estratega", "advogado"], "confidence": 0.8 }],
  "conflicts": [{ "topic": "...", "positions": [{ "agentId": "estratega", "position": "..." }], "severity": "MEDIUM" }]
}`;

        const response = await this.callLLM(prompt);

        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    notes: parsed.notes || 'Análise completa.',
                    consensus: parsed.consensus || [],
                    conflicts: parsed.conflicts || [],
                };
            }
        } catch {
            // Fallback
        }

        return {
            notes: response.slice(0, 200),
            consensus: previousConsensus,
            conflicts: previousConflicts,
        };
    }

    /**
     * Generate final synthesis and recommendation
     */
    async synthesize(
        topic: string,
        rounds: DebateRound[],
        consensus: ConsensusItem[],
        conflicts: ConflictItem[]
    ): Promise<FinalRecommendation> {
        if (this.verbose) {
            console.log('\n🎩 Moderador: Sintetizando recomendação final...');
        }

        // Collect all messages for analysis
        const allMessages = rounds.flatMap(r => r.messages);
        const byAgent: Record<string, AgentMessage[]> = {};

        for (const msg of allMessages) {
            if (!byAgent[msg.agentId]) byAgent[msg.agentId] = [];
            byAgent[msg.agentId].push(msg);
        }

        const agentSummaries = Object.entries(byAgent)
            .map(([id, msgs]) => `## ${id.toUpperCase()}\n${msgs.map(m => m.content).join('\n---\n')}`)
            .join('\n\n');

        const prompt = `Tu és o Moderador. O debate terminou. Produz a RECOMENDAÇÃO FINAL.

TÓPICO: ${topic}

POSIÇÕES FINAIS DOS AGENTES:
${agentSummaries}

PONTOS DE CONSENSO:
${JSON.stringify(consensus, null, 2)}

PONTOS DE CONFLITO:
${JSON.stringify(conflicts, null, 2)}

A TUA TAREFA:
Produz uma recomendação unificada que:
1. Resolve os conflitos (escolhendo a melhor posição)
2. Incorpora os pontos de consenso
3. É acionável e específica

Responde em JSON seguindo este schema:
{
  "pricing": {
    "recommended": 7760,
    "minimum": 4160,
    "maximum": 10000,
    "currency": "EUR",
    "justification": "..."
  },
  "strategy": {
    "approach": "One More Thing com upgrade opcional",
    "keyPoints": ["...", "..."],
    "risks": ["...", "..."],
    "mitigations": ["...", "..."]
  },
  "nextSteps": ["Agendar reunião", "Preparar demo", "..."],
  "unanimousPoints": ["Todos concordam que...", "..."],
  "minorityOpinions": [{ "agentId": "devils", "opinion": "..." }]
}`;

        const response = await this.callLLM(prompt);

        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]) as FinalRecommendation;
            }
        } catch {
            // Fallback
        }

        // Default fallback recommendation
        return {
            pricing: {
                recommended: 7760,
                minimum: 4160,
                maximum: 10000,
                currency: 'EUR',
                justification: 'Valor baseado no cenário 2 (upgrade platform)',
            },
            strategy: {
                approach: 'One More Thing',
                keyPoints: ['Apresentar scope original como cumprido', 'Revelar plataforma completa'],
                risks: ['Cliente pode recusar upgrade'],
                mitigations: ['Oferecer opção de manter preço original'],
            },
            nextSteps: ['Preparar demo', 'Agendar reunião'],
            unanimousPoints: ['Over-delivery cria goodwill'],
            minorityOpinions: [],
        };
    }

    /**
     * Call LLM
     */
    private async callLLM(prompt: string): Promise<string> {
        if (!openrouter) {
            throw new Error('OpenRouter not configured');
        }

        try {
            const completion = await openrouter.chat.completions.create({
                model: MODERATOR_MODEL,
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 2000,
                temperature: 0.5, // Lower temp for more consistent moderation
            });

            return completion.choices[0]?.message?.content || '';
        } catch (error: any) {
            console.error('❌ Moderator LLM call failed:', error.message);
            return '';
        }
    }
}
