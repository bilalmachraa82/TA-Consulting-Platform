
import { PrismaClient } from '@prisma/client';
import { generateContentWithFileSearch, RECOMMENDED_MODEL } from './rag/gemini-file-search';
import { prisma } from './db';

const MODEL_CLASSIFIER = 'gemini-2.0-flash-exp'; // Rápido e barato para classificar

interface Intent {
    type: 'DB_SEARCH' | 'RAG_QUERY' | 'HYBRID' | 'GENERAL' | 'HISTORICO_SEARCH';
    entities?: {
        programa?: string;
        aviso?: string;
        data?: boolean;
        temas?: string[];
        cliente?: string;
        ano?: number;
    };
    reasoning: string;
}

// Programas reconhecidos para extração de entidades
const PROGRAMAS_CONHECIDOS = ['prr', 'p2030', 'p2020', 'pdr2020', 'pepac', 'sifide', 'ipdj', 'pares', 'horizon'];

/**
 * Extrai entidades da mensagem (programa, ano, cliente)
 */
function extractEntities(message: string): Intent['entities'] {
    const lower = message.toLowerCase();
    const entities: Intent['entities'] = {};

    // Extrair programa
    for (const prog of PROGRAMAS_CONHECIDOS) {
        if (lower.includes(prog)) {
            entities.programa = prog.toUpperCase();
            break;
        }
    }

    // Extrair ano (2020-2025)
    const yearMatch = message.match(/20(2[0-5])/);
    if (yearMatch) {
        entities.ano = parseInt(yearMatch[0], 10);
    }

    return entities;
}

/**
 * Classifica a intenção do utilizador para decidir a fonte de dados.
 * V2.0: Adicionado HISTORICO_SEARCH para queries sobre candidaturas passadas
 */
export async function classifyIntent(message: string): Promise<Intent> {
    const lower = message.toLowerCase();
    const entities = extractEntities(message);

    // ============================================
    // PRIORIDADE 1: Padrões HYBRID (detectar primeiro - mais específicos)
    // ============================================
    if (
        (lower.includes('quantos') && lower.includes('como')) ||
        (lower.includes('montante') && lower.includes('justificar')) ||
        (lower.includes('lista') && lower.includes('exemplo')) ||
        (lower.includes('candidaturas') && lower.includes('exemplo')) ||
        (lower.includes('candidaturas') && lower.includes('como'))
    ) {
        return {
            type: 'HYBRID',
            entities,
            reasoning: 'User pede dados factuais + contexto qualitativo.'
        };
    }

    // ============================================
    // PRIORIDADE 2: Padrões de RAG (Conteúdo, Templates, Como)
    // ============================================
    if (
        lower.includes('resumo') ||
        lower.includes('sobre o que') ||
        lower.includes('explica') ||
        lower.includes('cpc') ||
        lower.includes('cae') ||
        lower.includes('despesas') ||
        lower.includes('elegíveis') ||
        lower.includes('documentos necessários') ||
        lower.includes('guia') ||
        lower.includes('como escrever') ||
        lower.includes('template') ||
        lower.includes('exemplo') ||
        lower.includes('melhor prática') ||
        lower.includes('melhores práticas') ||
        lower.includes('justificar investimento') ||
        lower.includes('justificar investimentos') ||
        (lower.includes('como') && lower.includes('justificar'))
    ) {
        return {
            type: 'RAG_QUERY',
            entities,
            reasoning: 'User pede conteúdo profundo/qualitativo dos documentos.'
        };
    }

    // ============================================
    // PRIORIDADE 3: Padrões de DB (Avisos Abertos, Prazos)
    // ============================================
    if (
        lower.includes('avisos') ||
        (lower.includes('lista') && !lower.includes('candidatura')) ||
        lower.includes('abertos') ||
        lower.includes('prazos') ||
        lower.includes('datas') ||
        (lower.includes('próximos') && !lower.includes('candidatura'))
    ) {
        return {
            type: 'DB_SEARCH',
            entities,
            reasoning: 'User pede listagem de avisos ou metadados estruturados.'
        };
    }

    // ============================================
    // PRIORIDADE 4: Padrões de Histórico (Candidaturas Passadas)
    // ============================================
    if (
        lower.includes('candidatura') ||
        lower.includes('candidaturas') ||
        lower.includes('fizemos') ||
        lower.includes('fizeste') ||
        lower.includes('submetemos') ||
        lower.includes('aprovadas') ||
        lower.includes('rejeitadas') ||
        lower.includes('montante') ||
        lower.includes('quanto') ||
        lower.includes('clientes') ||
        lower.includes('histórico') ||
        lower.includes('passado') ||
        lower.includes('ano passado') ||
        lower.includes('últimas')
    ) {
        return {
            type: 'HISTORICO_SEARCH',
            entities,
            reasoning: 'User pede dados sobre candidaturas históricas (SQL exacto).'
        };
    }

    // Default: Geral
    return { type: 'GENERAL', entities, reasoning: 'Conversa genérica ou ambígua.' };
}

/**
 * Executa query sobre candidaturas históricas (SQL puro, zero alucinação)
     */
export async function executeHistoricoQuery(message: string, entities: Intent['entities']): Promise<string> {
    console.log('📊 Roteamento: SQL Histórico (CandidaturaHistorica)');

    const lower = message.toLowerCase();

    try {
        // Query: Contagem por programa
        if (lower.includes('quantas') || lower.includes('quantos')) {
            const where: any = {};
            if (entities?.programa) where.programa = entities.programa;
            if (entities?.ano) where.ano = entities.ano;

            const count = await prisma.candidaturaHistorica.count({ where });
            const byPrograma = await prisma.candidaturaHistorica.groupBy({
                by: ['programa'],
                _count: { id: true },
                where,
                orderBy: { _count: { id: 'desc' } },
            });

            let response = `📊 **Total de candidaturas**: ${count}\n\n`;
            if (byPrograma.length > 1) {
                response += '**Por programa:**\n';
                byPrograma.forEach(p => {
                    response += `- ${p.programa}: ${p._count.id}\n`;
                });
            }
            return response;
        }

        // Query: Lista de clientes
        if (lower.includes('clientes') || lower.includes('empresas')) {
            const where: any = {};
            if (entities?.programa) where.programa = entities.programa;

            const clientes = await prisma.candidaturaHistorica.findMany({
                where,
                select: { cliente: true, programa: true, ano: true },
                distinct: ['cliente'],
                take: 20,
                orderBy: { cliente: 'asc' },
            });

            let response = `👥 **Clientes com candidaturas** (${clientes.length} mostrados):\n\n`;
            clientes.forEach((c, i) => {
                response += `${i + 1}. ${c.cliente} (${c.programa}${c.ano ? `, ${c.ano}` : ''})\n`;
            });
            return response;
        }

        // Query: Candidaturas por ano
        if (entities?.ano) {
            const candidaturas = await prisma.candidaturaHistorica.findMany({
                where: { ano: entities.ano },
                select: { cliente: true, programa: true, subPrograma: true, totalDocumentos: true },
                take: 15,
            });

            let response = `📅 **Candidaturas de ${entities.ano}**: ${candidaturas.length} encontradas\n\n`;
            candidaturas.forEach((c, i) => {
                response += `${i + 1}. ${c.cliente} - ${c.programa}${c.subPrograma ? `/${c.subPrograma}` : ''} (${c.totalDocumentos} docs)\n`;
            });
            return response;
        }

        // Query genérica: últimas candidaturas
        const recentes = await prisma.candidaturaHistorica.findMany({
            select: { cliente: true, programa: true, ano: true, prioridade: true },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });

        let response = '📋 **Últimas candidaturas registadas**:\n\n';
        recentes.forEach((c, i) => {
            response += `${i + 1}. ${c.cliente} - ${c.programa} (${c.ano || 'N/A'}) [${c.prioridade}]\n`;
        });
        return response;

    } catch (error: any) {
        console.error('❌ Erro SQL Histórico:', error.message);
        return 'Ocorreu um erro ao consultar as candidaturas históricas.';
    }
}

/**
 * Executa a estratégia híbrida.
 */
/**
 * Executa a estratégia híbrida.
 */
export async function executeHybridQuery(message: string, intent: Intent, history: any[]): Promise<string> {

    // 0. NOVO: Caminho Histórico (SQL Candidaturas Passadas)
    if (intent.type === 'HISTORICO_SEARCH') {
        return await executeHistoricoQuery(message, intent.entities);
    }

    // 1. Caminho RAG (Gemini Files)
    if (intent.type === 'RAG_QUERY') {
        console.log('🤖 Roteamento: Gemini RAG');

        const storeName = process.env.GEMINI_RAG_STORE_ID;
        if (!storeName) {
            console.error('❌ GEMINI_RAG_STORE_ID não configurado na ENV.');
            return "Desculpe, o sistema de pesquisa documental está em manutenção (Store ID em falta).";
        }

        try {
            const { AUDITOR_SYSTEM_PROMPT } = require('./rag/prompts');
            const result = await generateContentWithFileSearch({
                model: RECOMMENDED_MODEL,
                prompt: `${AUDITOR_SYSTEM_PROMPT}\n\nPERGUNTA: ${message}`,
                storeName: storeName,
                temperature: 0.1
            });

            // Format citations if available
            let answer = result.text;
            if (result.citations && result.citations.citedSources.length > 0) {
                answer += '\n\n📚 Fontes consultadas:';
                result.citations.citedSources.forEach(s => {
                    const title = s.title || s.uri?.split('/').pop() || 'Documento';
                    answer += `\n- ${title}`;
                });
            }
            return answer;

        } catch (e: any) {
            console.error('❌ Erro RAG Gemini:', e.message);
            return "Desculpe, o sistema de pesquisa está temporariamente indisponível (Gemini RAG). Por favor, tente novamente em alguns minutos.";
        }
    }

    // 2. Caminho DB (Prisma - avisos abertos)
    if (intent.type === 'DB_SEARCH') {
        console.log('💾 Roteamento: SQL DB (Avisos)');
        return "DB_DELEGATE"; // Sinal para o route.ts usar a lógica DB padrão
    }

    // 3. ADVANCED HYBRID V2.0 (SQL + RAG + RRF + Re-ranking)
    if (intent.type === 'HYBRID') {
        console.log('🔀 Roteamento: ADVANCED HYBRID (SQL + RAG + RRF + Re-ranking)');
        const startTime = Date.now();

        // Importar funções avançadas
        const {
            reciprocalRankFusion,
            rerankWithGemini,
            decomposeQuery,
            logRAGMetrics
        } = require('./rag/advanced-rag');

        // 3.1 Query Decomposition
        const decomposed = decomposeQuery(message);
        console.log(`   📝 Decomposição: ${decomposed.needsDecomposition ? 'SIM' : 'NÃO'} (${decomposed.subQueries.length} sub-queries)`);

        // 3.2 Executar sub-queries em paralelo
        const sqlResults: any[] = [];
        const ragResults: any[] = [];

        // Buscar SQL (candidaturas históricas)
        try {
            const candidaturas = await prisma.candidaturaHistorica.findMany({
                where: intent.entities?.programa ? { programa: intent.entities.programa } : {},
                select: { id: true, cliente: true, programa: true, ano: true, totalDocumentos: true },
                take: 20,
                orderBy: { createdAt: 'desc' },
            });

            candidaturas.forEach((c: any, i: number) => {
                sqlResults.push({
                    id: c.id,
                    content: `${c.cliente} - ${c.programa} (${c.ano || 'N/A'}) [${c.totalDocumentos} docs]`,
                    source: 'SQL',
                    originalRank: i,
                    metadata: c,
                });
            });
        } catch (e) {
            console.warn('⚠️ SQL query falhou, continuando com RAG');
        }

        // Buscar RAG
        const storeName = process.env.GEMINI_RAG_STORE_ID || process.env.GEMINI_CANDIDATURAS_STORE_ID;
        if (storeName) {
            try {
                const { AUDITOR_SYSTEM_PROMPT } = require('./rag/prompts');
                const result = await generateContentWithFileSearch({
                    model: RECOMMENDED_MODEL,
                    prompt: `${AUDITOR_SYSTEM_PROMPT}\n\nPERGUNTA (Procura documentos relevantes): ${message}`,
                    storeName: storeName,
                    temperature: 0,
                });

                // Extrair citações como resultados RAG
                if (result.citations?.citedSources) {
                    result.citations.citedSources.forEach((s: any, i: number) => {
                        ragResults.push({
                            id: s.uri || `rag-${i}`,
                            content: s.title || s.source || 'Documento RAG',
                            source: 'RAG',
                            originalRank: i,
                            metadata: s,
                        });
                    });
                }
            } catch (e) {
                console.warn('⚠️ RAG query falhou, continuando com SQL');
            }
        }

        // 3.3 RRF Fusion
        console.log(`   🔗 RRF Fusion: ${sqlResults.length} SQL + ${ragResults.length} RAG`);
        const fusedResults = reciprocalRankFusion(sqlResults, ragResults, 60);

        // 3.4 Re-ranking com Gemini (top 10)
        let finalResults = fusedResults;
        if (fusedResults.length > 3) {
            console.log('   🔄 Re-ranking com Gemini...');
            try {
                const reranked = await rerankWithGemini(message, fusedResults.slice(0, 10));
                if (reranked.length > 0) {
                    finalResults = reranked.map((r: any) => ({
                        ...fusedResults.find((f: any) => f.id === r.id),
                        relevanceScore: r.relevanceScore,
                    }));
                }
            } catch (e) {
                console.warn('⚠️ Re-ranking falhou, usando ordem RRF');
            }
        }

        // 3.5 Gerar resposta final
        let response = '📊 **Resultados (Hybrid SQL+RAG com RRF)**\n\n';

        // SQL Summary
        if (sqlResults.length > 0) {
            response += `**📋 Dados estruturados (${sqlResults.length} candidaturas):**\n`;
            sqlResults.slice(0, 5).forEach((r: any, i: number) => {
                response += `${i + 1}. ${r.content}\n`;
            });
            response += '\n';
        }

        // RAG Context
        if (ragResults.length > 0) {
            response += `**📖 Documentos relevantes (${ragResults.length} fontes):**\n`;
            ragResults.slice(0, 3).forEach((r: any, i: number) => {
                response += `- ${r.content}\n`;
            });
            response += '\n';
        }

        // Fusion quality indicator
        const dualSourceCount = finalResults.filter((r: any) => r.sources?.length > 1).length;
        if (dualSourceCount > 0) {
            response += `\n✨ ${dualSourceCount} resultados confirmados em ambas as fontes (SQL + RAG)\n`;
        }

        // 3.6 Log métricas
        const latencyMs = Date.now() - startTime;
        logRAGMetrics({
            queryId: `hybrid-${Date.now()}`,
            query: message,
            timestamp: new Date(),
            intent: 'HYBRID',
            decomposed: decomposed.needsDecomposition,
            retrievalCount: sqlResults.length + ragResults.length,
            rrfApplied: true,
            rerankApplied: finalResults !== fusedResults,
            responseLatencyMs: latencyMs,
            citationCount: ragResults.length,
            sources: ['SQL', 'RAG'],
        });

        console.log(`   ⏱️ Latência total: ${latencyMs}ms`);
        return response;
    }

    // 4. Geral
    return "GENERAL_DELEGATE";
}

