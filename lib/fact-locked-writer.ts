/**
 * Fact-Locked Writer
 * 
 * AI writing with mandatory citations from empresa documents.
 * Every factual claim must reference a specific Documento.
 * 
 * V2.0 Feature - Anti-hallucination competitive advantage
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/db';

// ============ Types ============

export interface FactSource {
    documentoId: string;
    documentoNome: string;
    tipoDocumento: string;
    dataEmissao?: Date;
    dataValidade?: Date;
    extractedFacts: string[];
}

export interface Citation {
    index: number;
    claim: string;
    source: {
        documentoId: string;
        documentoNome: string;
        tipoDocumento: string;
    };
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface FactLockedOutput {
    content: string;
    citations: Citation[];
    sourcesSection: string;
    uncitedClaims: string[];
    factCoverage: number;
    totalClaims: number;
}

export interface FactLockedInput {
    empresaId: string;
    sectionPrompt: string;
    customContext?: Record<string, any>;
}

// ============ Constants ============

const FACT_EXTRACTOR_PROMPT = `Extrai os factos-chave deste documento empresarial.
Retorna um array JSON com os factos mais importantes (máximo 10).
Cada facto deve ser uma afirmação concreta e verificável.

Exemplos de factos:
- "Volume de negócios de €2.5M em 2023"
- "45 colaboradores a tempo inteiro"
- "CAE principal: 62010"
- "Sede em Lisboa"

Retorna APENAS o array JSON, sem markdown.`;

const FACT_LOCKED_SYSTEM_PROMPT = `És um redator técnico de candidaturas a fundos europeus.

REGRA CRÍTICA: Só podes fazer afirmações baseadas nos FACTOS FORNECIDOS.
Cada afirmação factual DEVE incluir uma citação no formato [N] onde N é o número do facto.

FACTOS DISPONÍVEIS (usa APENAS estes):
{{FACT_BANK}}

INSTRUÇÕES:
1. Usa linguagem formal portuguesa
2. Cada afirmação numérica ou factual DEVE ter citação [N]
3. Se não tens facto para suportar uma afirmação, NÃO a faças
4. Podes fazer afirmações genéricas sem citação (ex: "O projeto visa...")
5. No final, lista todas as fontes usadas

FORMATO DE OUTPUT:
<CONTENT>
[Conteúdo com citações inline]
</CONTENT>

<SOURCES>
[1] Nome do documento - detalhe
[2] Nome do documento - detalhe
</SOURCES>

<UNCITED>
[Lista de afirmações que fizeste sem fonte, se houver]
</UNCITED>`;

// ============ Fact Extraction ============

async function extractFactsFromDocuments(empresaId: string): Promise<FactSource[]> {
    const documentos = await prisma.documento.findMany({
        where: {
            empresaId,
            statusValidade: { in: ['VALIDO', 'A_EXPIRAR'] }
        },
        orderBy: { dataEmissao: 'desc' },
    });

    const empresa = await prisma.empresa.findUnique({
        where: { id: empresaId },
    });

    if (!empresa) {
        throw new Error(`Empresa não encontrada: ${empresaId}`);
    }

    // Build fact sources from empresa data + documents
    const factSources: FactSource[] = [];

    // Core empresa facts (always available)
    factSources.push({
        documentoId: 'empresa-base',
        documentoNome: 'Dados Cadastrais',
        tipoDocumento: 'CADASTRO',
        extractedFacts: [
            `Nome da empresa: ${empresa.nome}`,
            `NIPC: ${empresa.nipc}`,
            `CAE principal: ${empresa.cae}`,
            `Setor de atividade: ${empresa.setor}`,
            `Dimensão: ${empresa.dimensao}`,
            empresa.regiao ? `Região: ${empresa.regiao}` : null,
            empresa.distrito ? `Distrito: ${empresa.distrito}` : null,
            empresa.localidade ? `Localidade: ${empresa.localidade}` : null,
        ].filter(Boolean) as string[],
    });

    // Add facts from each document
    for (const doc of documentos) {
        const facts: string[] = [];

        switch (doc.tipoDocumento) {
            case 'CERTIDAO_AT':
                facts.push('Situação tributária regularizada perante a Autoridade Tributária');
                if (doc.dataValidade) {
                    facts.push(`Certidão AT válida até ${doc.dataValidade.toLocaleDateString('pt-PT')}`);
                }
                break;
            case 'CERTIDAO_SS':
                facts.push('Situação contributiva regularizada perante a Segurança Social');
                if (doc.dataValidade) {
                    facts.push(`Certidão SS válida até ${doc.dataValidade.toLocaleDateString('pt-PT')}`);
                }
                break;
            case 'CERTIFICADO_PME':
                facts.push('Empresa certificada como PME pelo IAPMEI');
                facts.push(`Classificação PME: ${empresa.dimensao}`);
                break;
            case 'BALANCO':
            case 'DEMONSTRACOES_FINANCEIRAS':
                facts.push(`Demonstrações financeiras disponíveis (${doc.nome})`);
                if (doc.dataEmissao) {
                    facts.push(`Período de referência: ${doc.dataEmissao.getFullYear()}`);
                }
                break;
            case 'LICENCA_ATIVIDADE':
                facts.push('Empresa licenciada para exercer atividade');
                break;
            default:
                facts.push(`Documento: ${doc.nome}`);
        }

        if (facts.length > 0) {
            factSources.push({
                documentoId: doc.id,
                documentoNome: doc.nome,
                tipoDocumento: doc.tipoDocumento,
                dataEmissao: doc.dataEmissao ?? undefined,
                dataValidade: doc.dataValidade ?? undefined,
                extractedFacts: facts,
            });
        }
    }

    return factSources;
}

function buildFactBank(factSources: FactSource[]): string {
    let factBank = '';
    let factIndex = 1;

    for (const source of factSources) {
        for (const fact of source.extractedFacts) {
            factBank += `[${factIndex}] ${fact} (Fonte: ${source.documentoNome})\n`;
            factIndex++;
        }
    }

    return factBank;
}

// ============ Content Generation ============

function parseAIResponse(response: string): { content: string; sources: string; uncited: string[] } {
    const contentMatch = response.match(/<CONTENT>([\s\S]*?)<\/CONTENT>/);
    const sourcesMatch = response.match(/<SOURCES>([\s\S]*?)<\/SOURCES>/);
    const uncitedMatch = response.match(/<UNCITED>([\s\S]*?)<\/UNCITED>/);

    const content = contentMatch?.[1]?.trim() || response;
    const sources = sourcesMatch?.[1]?.trim() || '';
    const uncitedRaw = uncitedMatch?.[1]?.trim() || '';

    const uncited = uncitedRaw
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && line !== 'Nenhuma' && line !== 'N/A');

    return { content, sources, uncited };
}

function extractCitations(content: string, factSources: FactSource[]): Citation[] {
    const citationRegex = /\[(\d+)\]/g;
    const citations: Citation[] = [];
    const seenIndexes = new Set<number>();

    let match;
    while ((match = citationRegex.exec(content)) !== null) {
        const index = parseInt(match[1], 10);
        if (seenIndexes.has(index)) continue;
        seenIndexes.add(index);

        // Find the corresponding fact
        let currentIndex = 1;
        let foundSource: FactSource | null = null;
        let foundFact = '';

        for (const source of factSources) {
            for (const fact of source.extractedFacts) {
                if (currentIndex === index) {
                    foundSource = source;
                    foundFact = fact;
                    break;
                }
                currentIndex++;
            }
            if (foundSource) break;
        }

        if (foundSource) {
            citations.push({
                index,
                claim: foundFact,
                source: {
                    documentoId: foundSource.documentoId,
                    documentoNome: foundSource.documentoNome,
                    tipoDocumento: foundSource.tipoDocumento,
                },
                confidence: 'HIGH',
            });
        }
    }

    return citations.sort((a, b) => a.index - b.index);
}

function countTotalClaims(content: string): number {
    // Count sentences that likely contain factual claims (with numbers or specific data)
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const factualSentences = sentences.filter(s =>
        /\d+/.test(s) || // Contains numbers
        /€/.test(s) ||   // Contains currency
        /\[[\d]+\]/.test(s) // Already has citation
    );
    return Math.max(factualSentences.length, 1);
}

// ============ Main Entry Point ============

export async function generateFactLockedContent(input: FactLockedInput): Promise<FactLockedOutput> {
    const { empresaId, sectionPrompt, customContext } = input;

    // 1. Extract facts from documents
    const factSources = await extractFactsFromDocuments(empresaId);
    const factBank = buildFactBank(factSources);

    if (factSources.length === 0 || (factSources.length === 1 && factSources[0].documentoId === 'empresa-base')) {
        // Only base empresa data, no actual documents
        return {
            content: '',
            citations: [],
            sourcesSection: '',
            uncitedClaims: [],
            factCoverage: 0,
            totalClaims: 0,
            error: 'Empresa não tem documentos carregados. Por favor, carregue certidões e outros documentos antes de usar o AI Writer.',
        } as FactLockedOutput & { error: string };
    }

    // 2. Build prompt
    const systemPrompt = FACT_LOCKED_SYSTEM_PROMPT.replace('{{FACT_BANK}}', factBank);

    let userPrompt = sectionPrompt;
    if (customContext) {
        userPrompt += '\n\nContexto adicional:\n';
        for (const [key, value] of Object.entries(customContext)) {
            userPrompt += `- ${key}: ${value}\n`;
        }
    }

    // 3. Generate with AI
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY não configurada');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const result = await model.generateContent([
        { text: systemPrompt },
        { text: userPrompt },
    ]);

    const responseText = result.response.text();

    // 4. Parse response
    const { content, sources, uncited } = parseAIResponse(responseText);

    // 5. Extract and validate citations
    const citations = extractCitations(content, factSources);
    const totalClaims = countTotalClaims(content);
    const factCoverage = totalClaims > 0 ? (citations.length / totalClaims) * 100 : 0;

    // 6. Build sources section
    let sourcesSection = '---\n**Fontes:**\n';
    for (const citation of citations) {
        sourcesSection += `[${citation.index}] ${citation.source.documentoNome} - ${citation.claim}\n`;
    }

    return {
        content,
        citations,
        sourcesSection,
        uncitedClaims: uncited,
        factCoverage: Math.round(factCoverage),
        totalClaims,
    };
}
