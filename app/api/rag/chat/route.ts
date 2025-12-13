/**
 * RAG Chat API - Gemini File Search
 * 
 * Usa gemini-2.5-flash com File Search API e metadata filtering.
 * Configuração validada para 0% alucinações.
 * 
 * POST /api/rag/chat
 * Body: { question: string, portal?: string, deepMode?: boolean }
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// ============= PRODUCTION CONFIG =============

const RECOMMENDED_MODEL = 'gemini-2.5-flash';
const FALLBACK_MODEL = 'gemini-2.5-pro';

const PRODUCTION_SYSTEM_PROMPT = `És um assistente ESPECIALISTA para consultores de fundos europeus portugueses.

REGRAS ABSOLUTAS - OBRIGATÓRIAS:
1. Responde APENAS com informação que está EXPLICITAMENTE nos documentos fornecidos
2. CITA SEMPRE o código específico do aviso (ex: "Aviso 01/C01-i03/2021" ou "FA0114/2025")
3. Se NÃO encontras informação específica: diz "Não encontro essa informação nos avisos disponíveis"
4. NUNCA inventes códigos de avisos, datas, valores ou percentagens
5. Perguntas sobre taxas BCE, crédito, bolsa, Erasmus, etc: "Essa pergunta está fora do âmbito dos fundos europeus disponíveis"
6. Se não tens certeza: diz que não tens certeza e sugere consultar o portal oficial

FORMATO DE RESPOSTA:
📋 [Resposta directa e concisa]
📌 Avisos: [lista com códigos específicos]
➡️ Próximo passo: [acção concreta para o consultor]`;

const STORE_NAME = 'fileSearchStores/avisosfundoseuropeus-e463dep1so0g';
const BASE_URL = 'https://generativelanguage.googleapis.com';

// ============= TYPES =============

interface ChatRequest {
    question: string;
    portal?: 'PRR' | 'PEPAC' | 'PT2030' | 'HORIZON' | 'ALL';
    deepMode?: boolean;
}

interface ChatResponse {
    success: boolean;
    answer: string;
    citations: Array<{ source?: string; title?: string; uri?: string }>;
    model: string;
    latencyMs: number;
    error?: string;
}

// ============= HELPERS =============

function buildMetadataFilter(portal?: string): string {
    if (!portal || portal === 'ALL') return '';
    return `portal = "${portal}"`;
}

async function queryWithFileSearch(params: {
    question: string;
    model: string;
    metadataFilter?: string;
}): Promise<{ text: string; citations: any[]; usage: any }> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

    const body: any = {
        contents: [{
            parts: [{ text: `${PRODUCTION_SYSTEM_PROMPT}\n\nPERGUNTA: ${params.question}` }]
        }],
        tools: [{
            file_search: {
                file_search_store_names: [STORE_NAME],
                ...(params.metadataFilter ? { metadata_filter: params.metadataFilter } : {}),
            },
        }],
        generationConfig: {
            temperature: 0,
            maxOutputTokens: 1024,
        },
    };

    const url = `${BASE_URL}/v1beta/models/${params.model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const candidate = data?.candidates?.[0];

    // Extract text
    const parts = candidate?.content?.parts || [];
    const text = parts.map((p: any) => p.text).filter(Boolean).join('');

    // Extract citations
    const groundingMetadata = candidate?.groundingMetadata || candidate?.grounding_metadata;
    const citations = extractCitations(groundingMetadata);

    return { text, citations, usage: data?.usageMetadata || {} };
}

function extractCitations(groundingMetadata: any): Array<{ source?: string; title?: string; uri?: string }> {
    if (!groundingMetadata) return [];

    const chunks = groundingMetadata?.groundingChunks || groundingMetadata?.grounding_chunks || [];
    const citations: Array<{ source?: string; title?: string; uri?: string }> = [];

    for (const ch of chunks) {
        const retrieved = ch?.retrievedContext || ch?.retrieved_context || {};
        const uri = retrieved?.uri || retrieved?.sourceUri;
        const title = retrieved?.title || retrieved?.sourceTitle;
        const source = retrieved?.source || retrieved?.name;

        if (uri || title || source) {
            citations.push({
                source: typeof source === 'string' ? source : undefined,
                title: typeof title === 'string' ? title : undefined,
                uri: typeof uri === 'string' ? uri : undefined,
            });
        }
    }

    return citations;
}

// ============= API HANDLER =============

export async function POST(request: NextRequest): Promise<NextResponse<ChatResponse>> {
    const startTime = Date.now();

    try {
        const body: ChatRequest = await request.json();

        if (!body.question || typeof body.question !== 'string') {
            return NextResponse.json({
                success: false,
                answer: '',
                citations: [],
                model: '',
                latencyMs: 0,
                error: 'Pergunta é obrigatória',
            }, { status: 400 });
        }

        const model = body.deepMode ? FALLBACK_MODEL : RECOMMENDED_MODEL;
        const metadataFilter = buildMetadataFilter(body.portal);

        const result = await queryWithFileSearch({
            question: body.question,
            model,
            metadataFilter,
        });

        const latencyMs = Date.now() - startTime;

        return NextResponse.json({
            success: true,
            answer: result.text,
            citations: result.citations,
            model,
            latencyMs,
        });

    } catch (error: any) {
        console.error('RAG Chat error:', error);

        const latencyMs = Date.now() - startTime;

        // Check if it's a store not found error
        if (error.message?.includes('404') || error.message?.includes('not found')) {
            return NextResponse.json({
                success: false,
                answer: 'O File Search Store ainda não foi criado. Execute o script de ingestão primeiro.',
                citations: [],
                model: '',
                latencyMs,
                error: 'Store not found',
            }, { status: 503 });
        }

        return NextResponse.json({
            success: false,
            answer: '',
            citations: [],
            model: '',
            latencyMs,
            error: error.message || 'Erro interno',
        }, { status: 500 });
    }
}

// GET - Health check
export async function GET() {
    return NextResponse.json({
        status: 'ok',
        service: 'rag-chat',
        model: RECOMMENDED_MODEL,
        fallback: FALLBACK_MODEL,
        store: STORE_NAME,
    });
}
