/**
 * Advanced RAG Functions - Best Practices 2025
 * 
 * Este módulo implementa técnicas avançadas de RAG:
 * 1. RRF (Reciprocal Rank Fusion) - Combina resultados SQL + RAG
 * 2. Re-ranking com Gemini - Segunda passagem de relevância
 * 3. Query Decomposition - Divide queries complexas em sub-queries
 * 4. Evaluation Metrics - Logging e métricas para Golden Set
 */

import { generateContentWithFileSearch, RECOMMENDED_MODEL } from './gemini-file-search';

// ============================================
// 1. RECIPROCAL RANK FUSION (RRF)
// ============================================

interface RankedItem {
    id: string;
    content: string;
    source: 'SQL' | 'RAG';
    originalRank: number;
    metadata?: Record<string, any>;
}

interface FusedResult {
    id: string;
    content: string;
    rrfScore: number;
    sources: ('SQL' | 'RAG')[];
    metadata?: Record<string, any>;
}

/**
 * Reciprocal Rank Fusion - Combina rankings de múltiplas fontes
 * 
 * Fórmula: RRF(d) = Σ 1/(k + rank_i(d))
 * onde k = 60 (constante de suavização, padrão da literatura)
 * 
 * @param rankings - Array de rankings de diferentes fontes
 * @param k - Constante de suavização (default: 60)
 * @returns Array de resultados fusionados ordenados por RRF score
 */
export function reciprocalRankFusion(
    sqlResults: RankedItem[],
    ragResults: RankedItem[],
    k: number = 60
): FusedResult[] {
    const scoreMap = new Map<string, FusedResult>();

    // Processar resultados SQL
    sqlResults.forEach((item, rank) => {
        const existing = scoreMap.get(item.id);
        const rrfScore = 1 / (k + rank);

        if (existing) {
            existing.rrfScore += rrfScore;
            if (!existing.sources.includes('SQL')) {
                existing.sources.push('SQL');
            }
        } else {
            scoreMap.set(item.id, {
                id: item.id,
                content: item.content,
                rrfScore: rrfScore,
                sources: ['SQL'],
                metadata: item.metadata,
            });
        }
    });

    // Processar resultados RAG
    ragResults.forEach((item, rank) => {
        const existing = scoreMap.get(item.id);
        const rrfScore = 1 / (k + rank);

        if (existing) {
            existing.rrfScore += rrfScore;
            if (!existing.sources.includes('RAG')) {
                existing.sources.push('RAG');
            }
        } else {
            scoreMap.set(item.id, {
                id: item.id,
                content: item.content,
                rrfScore: rrfScore,
                sources: ['RAG'],
                metadata: item.metadata,
            });
        }
    });

    // Ordenar por RRF score (descendente)
    return Array.from(scoreMap.values())
        .sort((a, b) => b.rrfScore - a.rrfScore);
}

// ============================================
// 2. RE-RANKING COM GEMINI
// ============================================

interface RerankedResult {
    id: string;
    content: string;
    relevanceScore: number;
    reasoning: string;
}

/**
 * Re-ranking usando Gemini como cross-encoder
 * 
 * Pede ao LLM para avaliar a relevância de cada resultado
 * em relação à query original (0-100).
 * 
 * @param query - Query original do utilizador
 * @param results - Resultados a re-ranquear
 * @param topK - Número de resultados a considerar (default: 10)
 */
export async function rerankWithGemini(
    query: string,
    results: FusedResult[],
    topK: number = 10
): Promise<RerankedResult[]> {
    // Limitar a topK resultados para eficiência
    const candidates = results.slice(0, topK);

    if (candidates.length === 0) {
        return [];
    }

    const prompt = `Avalia a relevância de cada documento para a pergunta do utilizador.
Para cada documento, dá um score de 0 a 100 onde:
- 100 = Responde perfeitamente à pergunta
- 75 = Muito relevante
- 50 = Parcialmente relevante
- 25 = Pouco relevante
- 0 = Irrelevante

PERGUNTA: "${query}"

DOCUMENTOS:
${candidates.map((c, i) => `[${i + 1}] ${c.content.slice(0, 300)}...`).join('\n\n')}

Responde APENAS em formato JSON:
{
  "rankings": [
    {"doc": 1, "score": 85, "reason": "Razão curta"},
    {"doc": 2, "score": 60, "reason": "Razão curta"}
  ]
}`;

    try {
        // Usar Gemini Flash para re-ranking (rápido e barato)
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': process.env.GEMINI_API_KEY || '',
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0 },
            }),
        });

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Extrair JSON da resposta
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.warn('⚠️ Re-ranking: Não conseguiu extrair JSON');
            return candidates.map((c, i) => ({
                id: c.id,
                content: c.content,
                relevanceScore: 100 - i * 10, // Fallback: usar ordem original
                reasoning: 'Ordem original mantida',
            }));
        }

        const parsed = JSON.parse(jsonMatch[0]);

        // Mapear scores para resultados
        const reranked: RerankedResult[] = [];
        for (const ranking of parsed.rankings || []) {
            const docIndex = ranking.doc - 1;
            if (docIndex >= 0 && docIndex < candidates.length) {
                reranked.push({
                    id: candidates[docIndex].id,
                    content: candidates[docIndex].content,
                    relevanceScore: ranking.score,
                    reasoning: ranking.reason || '',
                });
            }
        }

        // Ordenar por relevância
        return reranked.sort((a, b) => b.relevanceScore - a.relevanceScore);

    } catch (error: any) {
        console.error('❌ Re-ranking falhou:', error.message);
        // Fallback: retornar ordem original
        return candidates.map((c, i) => ({
            id: c.id,
            content: c.content,
            relevanceScore: 100 - i * 10,
            reasoning: 'Fallback - ordem original',
        }));
    }
}

// ============================================
// 3. QUERY DECOMPOSITION
// ============================================

interface DecomposedQuery {
    original: string;
    subQueries: {
        query: string;
        type: 'SQL' | 'RAG' | 'HYBRID';
        intent: string;
    }[];
    needsDecomposition: boolean;
}

/**
 * Decompõe uma query complexa em sub-queries mais simples
 * 
 * Detecta padrões como:
 * - "X e Y" → duas sub-queries
 * - "quanto...e como" → SQL + RAG
 * - "lista...com exemplos" → HYBRID
 */
export function decomposeQuery(message: string): DecomposedQuery {
    const lower = message.toLowerCase();

    // Padrões de decomposição
    const conjunctions = [' e ', ' com ', ' além de ', ' também '];
    const quantitativeKeywords = ['quanto', 'quantos', 'quantas', 'montante', 'valor', 'total', 'média'];
    const qualitativeKeywords = ['como', 'exemplo', 'explica', 'justifica', 'detalhe'];

    // Detectar se precisa decomposição
    const hasConjunction = conjunctions.some(c => lower.includes(c));
    const hasQuantitative = quantitativeKeywords.some(k => lower.includes(k));
    const hasQualitative = qualitativeKeywords.some(k => lower.includes(k));

    // Se tem ambos tipos, precisa decomposição
    if (hasQuantitative && hasQualitative) {
        // Tentar dividir pela conjunção
        for (const conj of conjunctions) {
            if (lower.includes(conj)) {
                const parts = message.split(new RegExp(conj, 'i'));
                if (parts.length >= 2) {
                    return {
                        original: message,
                        subQueries: [
                            {
                                query: parts[0].trim(),
                                type: hasQuantitative ? 'SQL' : 'RAG',
                                intent: 'Parte quantitativa/factual',
                            },
                            {
                                query: parts[1].trim(),
                                type: 'RAG',
                                intent: 'Parte qualitativa/contextual',
                            },
                        ],
                        needsDecomposition: true,
                    };
                }
            }
        }
    }

    // Sem decomposição necessária
    return {
        original: message,
        subQueries: [{
            query: message,
            type: hasQuantitative ? 'SQL' : (hasQualitative ? 'RAG' : 'HYBRID'),
            intent: 'Query simples',
        }],
        needsDecomposition: false,
    };
}

// ============================================
// 4. EVALUATION METRICS & LOGGING
// ============================================

interface RAGMetrics {
    queryId: string;
    query: string;
    timestamp: Date;
    intent: string;
    decomposed: boolean;
    retrievalCount: number;
    rrfApplied: boolean;
    rerankApplied: boolean;
    responseLatencyMs: number;
    citationCount: number;
    sources: string[];
}

// Armazenamento em memória (para demo; em prod usar DB ou analytics)
const metricsLog: RAGMetrics[] = [];

/**
 * Regista métricas de uma query RAG para avaliação posterior
 */
export function logRAGMetrics(metrics: RAGMetrics): void {
    metricsLog.push(metrics);

    // Log para console em desenvolvimento
    console.log(`📊 RAG Metrics: ${metrics.queryId}`, {
        intent: metrics.intent,
        decomposed: metrics.decomposed,
        rrfApplied: metrics.rrfApplied,
        rerankApplied: metrics.rerankApplied,
        latencyMs: metrics.responseLatencyMs,
        citations: metrics.citationCount,
    });
}

/**
 * Obtém métricas agregadas para análise
 */
export function getAggregatedMetrics() {
    if (metricsLog.length === 0) {
        return { count: 0, avgLatency: 0, avgCitations: 0 };
    }

    const totalLatency = metricsLog.reduce((sum, m) => sum + m.responseLatencyMs, 0);
    const totalCitations = metricsLog.reduce((sum, m) => sum + m.citationCount, 0);

    return {
        count: metricsLog.length,
        avgLatency: Math.round(totalLatency / metricsLog.length),
        avgCitations: (totalCitations / metricsLog.length).toFixed(2),
        byIntent: metricsLog.reduce((acc, m) => {
            acc[m.intent] = (acc[m.intent] || 0) + 1;
            return acc;
        }, {} as Record<string, number>),
    };
}

/**
 * Exporta métricas para Golden Set analysis
 */
export function exportMetricsForGoldenSet(): RAGMetrics[] {
    return [...metricsLog];
}

// ============================================
// 5. GOLDEN SET UTILITIES
// ============================================

interface GoldenSetItem {
    id: string;
    query: string;
    expectedIntent: string;
    expectedSources: string[];
    expectedKeywords: string[];
    category: 'factual' | 'qualitative' | 'hybrid';
}

/**
 * Golden Set inicial baseado nos testes existentes
 */
export const GOLDEN_SET: GoldenSetItem[] = [
    // Factual (SQL)
    { id: 'GS001', query: 'Quantas candidaturas PRR fizemos?', expectedIntent: 'HISTORICO_SEARCH', expectedSources: ['SQL'], expectedKeywords: ['PRR', 'candidaturas'], category: 'factual' },
    { id: 'GS002', query: 'Quais clientes temos no programa P2030?', expectedIntent: 'HISTORICO_SEARCH', expectedSources: ['SQL'], expectedKeywords: ['P2030', 'clientes'], category: 'factual' },
    { id: 'GS003', query: 'Candidaturas aprovadas em 2023', expectedIntent: 'HISTORICO_SEARCH', expectedSources: ['SQL'], expectedKeywords: ['2023', 'aprovadas'], category: 'factual' },
    { id: 'GS004', query: 'Qual o montante total das nossas candidaturas?', expectedIntent: 'HISTORICO_SEARCH', expectedSources: ['SQL'], expectedKeywords: ['montante', 'total'], category: 'factual' },

    // Qualitative (RAG)
    { id: 'GS005', query: 'Como escrever uma memória descritiva para PRR?', expectedIntent: 'RAG_QUERY', expectedSources: ['RAG'], expectedKeywords: ['memória descritiva', 'PRR'], category: 'qualitative' },
    { id: 'GS006', query: 'Quais são as melhores práticas para justificar investimentos?', expectedIntent: 'RAG_QUERY', expectedSources: ['RAG'], expectedKeywords: ['melhores práticas', 'justificar'], category: 'qualitative' },
    { id: 'GS007', query: 'Template de proposta técnica para P2030', expectedIntent: 'RAG_QUERY', expectedSources: ['RAG'], expectedKeywords: ['template', 'proposta técnica'], category: 'qualitative' },

    // Hybrid (SQL + RAG)
    { id: 'GS008', query: 'Lista de candidaturas PRR com exemplos de como justificaram', expectedIntent: 'HYBRID', expectedSources: ['SQL', 'RAG'], expectedKeywords: ['PRR', 'exemplos', 'justificaram'], category: 'hybrid' },
    { id: 'GS009', query: 'Quantas candidaturas aprovadas e como estruturaram os orçamentos?', expectedIntent: 'HYBRID', expectedSources: ['SQL', 'RAG'], expectedKeywords: ['aprovadas', 'orçamentos'], category: 'hybrid' },

    // DB Search (Avisos)
    { id: 'GS010', query: 'Quais avisos estão abertos agora?', expectedIntent: 'DB_SEARCH', expectedSources: ['DB'], expectedKeywords: ['avisos', 'abertos'], category: 'factual' },
    { id: 'GS011', query: 'Próximos prazos de candidatura', expectedIntent: 'DB_SEARCH', expectedSources: ['DB'], expectedKeywords: ['prazos'], category: 'factual' },
];

/**
 * Valida uma resposta contra o Golden Set
 */
export function validateAgainstGoldenSet(
    queryId: string,
    actualIntent: string,
    actualSources: string[]
): { passed: boolean; issues: string[] } {
    const goldenItem = GOLDEN_SET.find(g => g.id === queryId);

    if (!goldenItem) {
        return { passed: true, issues: ['Query não está no Golden Set'] };
    }

    const issues: string[] = [];

    // Validar intent
    if (actualIntent !== goldenItem.expectedIntent) {
        issues.push(`Intent: esperado ${goldenItem.expectedIntent}, obtido ${actualIntent}`);
    }

    // Validar sources
    const missingSources = goldenItem.expectedSources.filter(s => !actualSources.includes(s));
    if (missingSources.length > 0) {
        issues.push(`Sources em falta: ${missingSources.join(', ')}`);
    }

    return {
        passed: issues.length === 0,
        issues,
    };
}
