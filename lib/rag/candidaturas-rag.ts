/**
 * Candidaturas RAG Helper
 * 
 * Busca exemplos de secções similares de candidaturas históricas aprovadas
 * para alimentar o AI Writer com contexto de qualidade.
 */

import {
    generateContentWithFileSearch,
    RECOMMENDED_MODEL,
    type GenerateWithFileSearchResult,
} from './gemini-file-search';

const CANDIDATURAS_STORE_ID = process.env.GEMINI_CANDIDATURAS_STORE_ID;

export interface RAGExample {
    content: string;
    source: string;
    score: number;
}

export interface SectionRAGResult {
    examples: RAGExample[];
    citationCount: number;
    model: string;
    latencyMs: number;
}

/**
 * Busca exemplos de secções similares de candidaturas históricas
 * 
 * @param sectionTitle - Título da secção (e.g. "Caracterização da Empresa")
 * @param sectionDescription - Descrição do que a secção deve conter
 * @param programId - ID do programa (e.g. "pt2030-inovacao", "prr-vouchers")
 * @param maxExamples - Número máximo de exemplos a retornar
 */
export async function fetchSectionExamples(
    sectionTitle: string,
    sectionDescription: string,
    programId?: string,
    maxExamples: number = 3
): Promise<SectionRAGResult> {
    const startTime = Date.now();

    if (!CANDIDATURAS_STORE_ID) {
        console.warn('[RAG] GEMINI_CANDIDATURAS_STORE_ID não configurado');
        return {
            examples: [],
            citationCount: 0,
            model: 'none',
            latencyMs: 0,
        };
    }

    // Build search query focused on section examples
    const prompt = `Procura exemplos de como escrever a secção "${sectionTitle}" em candidaturas aprovadas.

DESCRIÇÃO DA SECÇÃO: ${sectionDescription}

${programId ? `PROGRAMA: ${programId.toUpperCase().replace(/-/g, ' ')}` : ''}

TAREFA: Extrai até ${maxExamples} exemplos reais de candidaturas aprovadas que mostrem como esta secção foi escrita com sucesso.

Para cada exemplo, indica:
1. O texto da secção (resumido se muito longo)
2. O programa/aviso de onde vem
3. Porque é um bom exemplo

Responde em formato estruturado.`;

    try {
        const result = await generateContentWithFileSearch({
            model: RECOMMENDED_MODEL,
            prompt,
            storeName: CANDIDATURAS_STORE_ID,
            temperature: 0,
            maxOutputTokens: 2048,
        });

        const latencyMs = Date.now() - startTime;

        // Parse examples from response
        const examples = parseExamplesFromResponse(result, maxExamples);

        console.log(`[RAG] Encontrados ${examples.length} exemplos para "${sectionTitle}" em ${latencyMs}ms`);

        return {
            examples,
            citationCount: result.citations.citationCount,
            model: RECOMMENDED_MODEL,
            latencyMs,
        };

    } catch (error: any) {
        console.error('[RAG] Erro ao buscar exemplos:', error.message);
        return {
            examples: [],
            citationCount: 0,
            model: RECOMMENDED_MODEL,
            latencyMs: Date.now() - startTime,
        };
    }
}

/**
 * Busca contexto geral para um programa específico
 */
export async function fetchProgramContext(programId: string): Promise<string | null> {
    if (!CANDIDATURAS_STORE_ID) {
        return null;
    }

    const prompt = `Quais são os elementos-chave e melhores práticas para candidaturas ao programa ${programId.toUpperCase().replace(/-/g, ' ')}?

Foca em:
- Estrutura típica de sucesso
- Erros comuns a evitar
- Elementos diferenciadores
- Pontos de avaliação prioritários`;

    try {
        const result = await generateContentWithFileSearch({
            model: RECOMMENDED_MODEL,
            prompt,
            storeName: CANDIDATURAS_STORE_ID,
            temperature: 0,
            maxOutputTokens: 1024,
        });

        return result.text;
    } catch (error: any) {
        console.error('[RAG] Erro ao buscar contexto do programa:', error.message);
        return null;
    }
}

/**
 * Parse structured examples from RAG response
 */
function parseExamplesFromResponse(
    result: GenerateWithFileSearchResult,
    maxExamples: number
): RAGExample[] {
    const examples: RAGExample[] = [];

    // Use citations as primary source of examples
    for (const citation of result.citations.citedSources.slice(0, maxExamples)) {
        examples.push({
            content: result.text.slice(0, 500), // Take relevant portion
            source: citation.title || citation.source || 'Candidatura Histórica',
            score: 0.9, // High confidence since it's from citations
        });
    }

    // If no citations, try to extract from text
    if (examples.length === 0 && result.text.length > 100) {
        // Split by numbered items or paragraphs
        const sections = result.text.split(/(?:^|\n)(?:\d+\.|Exemplo \d+:)/i);

        for (const section of sections.slice(1, maxExamples + 1)) {
            if (section.trim().length > 50) {
                examples.push({
                    content: section.trim().slice(0, 500),
                    source: 'Candidatura Histórica',
                    score: 0.7,
                });
            }
        }
    }

    return examples;
}

/**
 * Wrapper para verificar se RAG está disponível
 */
export function isRAGAvailable(): boolean {
    return !!CANDIDATURAS_STORE_ID;
}

/**
 * Get the store ID for debugging
 */
export function getStoreId(): string | undefined {
    return CANDIDATURAS_STORE_ID;
}
