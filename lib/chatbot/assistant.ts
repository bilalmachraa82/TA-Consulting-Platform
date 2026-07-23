/**
 * Loop do assistente de avisos — tool-calling sobre a BD fresca.
 *
 * O modelo (via OpenRouter) decide chamar search_avisos/get_aviso_detail;
 * nós executamos as ferramentas tipadas (lib/chatbot/tools.ts) e devolvemos
 * os resultados até ele produzir a resposta final. Máximo 4 rondas de
 * ferramentas — proteção contra loops e contra custo descontrolado.
 *
 * Separado da rota Next para ser testável e reutilizável (dashboard, futuro
 * relatório semanal, etc.).
 */

import { chatCompletion, type ChatMessage } from '@/lib/llm-client';
import {
    TOOL_DEFINITIONS,
    executeSearchAvisos,
    executeGetAvisoDetail,
    getAvisosStatsTexto,
    type AvisoCitation,
} from './tools';

const MAX_TOOL_ROUNDS = 4;

export interface AssistantAnswer {
    answer: string;
    citations: AvisoCitation[];
    tokensIn: number;
    tokensOut: number;
    toolCallsUsed: number;
}

export interface HistoryItem {
    role: 'user' | 'assistant';
    content: string;
}

async function executeTool(name: string, argsJson: string): Promise<{ payload: unknown; citations: AvisoCitation[] }> {
    let args: unknown = {};
    try {
        args = argsJson ? JSON.parse(argsJson) : {};
    } catch {
        return { payload: { erro: 'argumentos JSON inválidos' }, citations: [] };
    }

    try {
        if (name === 'search_avisos') {
            const { resultados, citations, totalDisponivel } = await executeSearchAvisos(args);
            if (resultados.length === 0) {
                return {
                    payload: {
                        total: 0,
                        sugestao: 'Zero resultados. Repete a pesquisa com menos filtros: remove tipoApoio/regiaoNUTS2/montante (só preenchidos numa minoria dos avisos) e usa 1 palavra-chave mais genérica no texto.',
                    },
                    citations: [],
                };
            }
            return {
                payload: {
                    totalDisponivel,
                    devolvidosNestaPagina: resultados.length,
                    nota: totalDisponivel > resultados.length
                        ? `Existem ${totalDisponivel} avisos que satisfazem os critérios; estes são os ${resultados.length} com prazo mais próximo. Ao indicar quantidades usa SEMPRE ${totalDisponivel}, nunca ${resultados.length}.`
                        : undefined,
                    resultados,
                },
                citations,
            };
        }
        if (name === 'get_aviso_detail') {
            const { aviso, citations } = await executeGetAvisoDetail(args);
            return { payload: aviso ? { aviso } : { erro: 'aviso não encontrado' }, citations };
        }
        return { payload: { erro: `ferramenta desconhecida: ${name}` }, citations: [] };
    } catch (error: unknown) {
        // Erros de validação zod voltam ao modelo em formato acionável — ele
        // corrige os parâmetros na ronda seguinte em vez de desistir.
        if (error && typeof error === 'object' && 'issues' in error) {
            const issues = (error as { issues: Array<{ path: unknown[]; message: string }> }).issues
                .slice(0, 3)
                .map((i) => `${i.path.join('.')}: ${i.message}`)
                .join('; ');
            return {
                payload: { erro: `parâmetros inválidos (${issues}). Corrige os parâmetros e chama a ferramenta outra vez.` },
                citations: [],
            };
        }
        const message = error instanceof Error ? error.message : 'erro na ferramenta';
        return { payload: { erro: message.slice(0, 200) }, citations: [] };
    }
}

export async function runAssistant(userMessage: string, history: HistoryItem[] = []): Promise<AssistantAnswer> {
    const stats = await getAvisosStatsTexto();

    const systemPrompt = `És o assistente de fundos da Eligivo, uma consultora portuguesa de fundos europeus.

REGRAS:
- Responde SEMPRE em português de Portugal, claro e direto.
- Para QUALQUER pergunta sobre avisos/fundos/prazos, usa as ferramentas — nunca inventes avisos, códigos, montantes ou datas.
- Pesquisa com POUCOS filtros: 1-2 palavras-chave genéricas chegam. Não adiciones tipoApoio/região/montante a não ser que o utilizador os peça explicitamente.
- Se uma pesquisa devolver 0 resultados, REPETE com critérios mais largos (menos filtros, palavra mais genérica) antes de concluir que não há nada — só desistes após 2 tentativas.
- Cita sempre os avisos que referes com o código entre parênteses, ex.: (FA0006/2026).
- Datas no formato DD/MM/AAAA na resposta final.
- Sê conciso: o utilizador é um consultor com pressa.
- Responde SEMPRE diretamente à ÚLTIMA pergunta do utilizador. NUNCA respondas apenas com um cumprimento ou "como posso ajudar" — se há uma pergunta, ela exige pesquisa e resposta.
- Se o detalhe pedido (ex.: despesas elegíveis) não estiver nos dados do aviso, diz o que SABES do aviso (prazo, beneficiários, montante) e remete para o link oficial para esse detalhe específico.

CONTEXTO GERAL (apenas para orientação — NUNCA respondas a partir destes números;
para responder a qualquer pergunta concreta TENS de chamar search_avisos primeiro):
${stats}`;

    const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        ...history.slice(-10).map((h): ChatMessage => ({ role: h.role, content: h.content })),
        { role: 'user', content: userMessage },
    ];

    const allCitations = new Map<string, AvisoCitation>();
    let tokensIn = 0;
    let tokensOut = 0;
    let toolCallsUsed = 0;

    for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
        const lastRound = round === MAX_TOOL_ROUNDS;
        const result = await chatCompletion({
            messages,
            // na última ronda não oferecemos ferramentas — força a resposta final
            ...(lastRound ? {} : { tools: TOOL_DEFINITIONS }),
            temperature: 0.2,
            maxTokens: 1200,
        });
        tokensIn += result.tokensIn;
        tokensOut += result.tokensOut;

        const toolCalls = result.message.tool_calls;
        if (!toolCalls || toolCalls.length === 0) {
            return {
                answer: result.message.content || 'Não consegui gerar resposta.',
                citations: [...allCitations.values()],
                tokensIn,
                tokensOut,
                toolCallsUsed,
            };
        }

        messages.push(result.message);
        for (const call of toolCalls) {
            toolCallsUsed++;
            const { payload, citations } = await executeTool(call.function.name, call.function.arguments);
            citations.forEach((c) => allCitations.set(c.codigo, c));
            messages.push({
                role: 'tool',
                tool_call_id: call.id,
                content: JSON.stringify(payload),
            });
        }
    }

    return {
        answer: 'Não consegui concluir a pesquisa — tenta reformular a pergunta.',
        citations: [...allCitations.values()],
        tokensIn,
        tokensOut,
        toolCallsUsed,
    };
}
