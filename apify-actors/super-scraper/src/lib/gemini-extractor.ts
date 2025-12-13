/**
 * Gemini Flash-Lite based extraction for operational fields
 * Uses Google Generative AI SDK for structured extraction
 * 
 * Cost estimate: ~$0.55/month for 500 avisos
 */

import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

// Initialize client (uses GEMINI_API_KEY from env)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Model configuration
const MODEL_NAME = 'gemini-2.0-flash-lite';

// JSON Schema for structured output
const OPERATIONAL_FIELDS_SCHEMA = {
    type: SchemaType.OBJECT,
    properties: {
        canal_submissao: {
            type: SchemaType.STRING,
            description: 'Canal de submissão de candidaturas (ex: Área Reservada IFAP, Balcão de Candidaturas)',
            nullable: true,
        },
        caminho_menu: {
            type: SchemaType.STRING,
            description: 'Caminho de navegação no portal',
            nullable: true,
        },
        pre_requisitos: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: 'Lista de requisitos para candidatura',
        },
        links_legislacao: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: 'URLs para legislação (Portarias, DRE)',
        },
        contacto_email: {
            type: SchemaType.STRING,
            description: 'Email de contacto',
            nullable: true,
        },
        contacto_telefone: {
            type: SchemaType.STRING,
            description: 'Telefone de contacto',
            nullable: true,
        },
        notas_adicionais: {
            type: SchemaType.STRING,
            description: 'Notas importantes para consultores',
            nullable: true,
        },
    },
    required: ['pre_requisitos', 'links_legislacao'],
};

export interface GeminiOperationalFields {
    canal_submissao?: string;
    caminho_menu?: string;
    pre_requisitos: string[];
    links_legislacao: string[];
    contacto?: {
        email?: string;
        telefone?: string;
    };
    notas_adicionais?: string;
}

/**
 * Extract operational fields from aviso HTML/text using Gemini Flash-Lite
 */
export async function extractWithGemini(
    html: string,
    titulo?: string
): Promise<GeminiOperationalFields> {
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('placeholder')) {
        console.warn('    ⚠️ GEMINI_API_KEY não configurada, a usar fallback regex');
        return { pre_requisitos: [], links_legislacao: [] };
    }

    const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        generationConfig: {
            responseMimeType: 'application/json',
        },
    });

    // Truncate HTML to avoid token limits (keep first 40K chars)
    const truncatedHtml = html.slice(0, 40000);

    const prompt = `Analisa o seguinte texto de um aviso de fundos portugueses e extrai informações operacionais.

TÍTULO DO AVISO: ${titulo || 'Não especificado'}

CONTEÚDO HTML (truncado):
${truncatedHtml}

Extrai os seguintes campos (se existirem no texto):

1. **canal_submissao**: Onde se submetem as candidaturas?
   - Exemplos válidos: "Área Reservada IFAP", "Balcão de Candidaturas", "Balcão dos Fundos", "Portal COMPETE", "Formulário Eletrónico"

2. **caminho_menu**: Qual o caminho de navegação no portal?
   - Exemplo: "O Meu Processo » Candidaturas » VITIS » Campanha 2025/2026"

3. **pre_requisitos**: Lista de requisitos para candidatura
   - Procura termos como: "devem", "obrigatório", "necessário", "registo", "NIFAP", "iSIP"

4. **links_legislacao**: URLs para legislação
   - Procura links que contenham: dre.pt, portaria, despacho

5. **contacto_email**: Email de contacto (se existir)

6. **contacto_telefone**: Telefone de contacto (se existir)

7. **notas_adicionais**: Informações importantes para consultores (datas limite, avisos)

Devolve apenas campos que encontres explicitamente no texto.`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        const parsed = JSON.parse(text);

        return {
            canal_submissao: parsed.canal_submissao || undefined,
            caminho_menu: parsed.caminho_menu || undefined,
            pre_requisitos: Array.isArray(parsed.pre_requisitos) ? parsed.pre_requisitos : [],
            links_legislacao: Array.isArray(parsed.links_legislacao) ? parsed.links_legislacao : [],
            contacto: (parsed.contacto_email || parsed.contacto_telefone) ? {
                email: parsed.contacto_email || undefined,
                telefone: parsed.contacto_telefone || undefined,
            } : undefined,
            notas_adicionais: parsed.notas_adicionais || undefined,
        };
    } catch (error: any) {
        console.error(`    ❌ Gemini extraction error: ${error.message}`);
        return { pre_requisitos: [], links_legislacao: [] };
    }
}

/**
 * Batch extract operational fields for multiple avisos with rate limiting
 */
export async function batchExtractWithGemini(
    items: Array<{ html: string; titulo?: string }>,
    options: {
        maxConcurrent?: number;
        delayMs?: number;
        onProgress?: (done: number, total: number) => void;
    } = {}
): Promise<GeminiOperationalFields[]> {
    const { maxConcurrent = 3, delayMs = 500, onProgress } = options;
    const results: GeminiOperationalFields[] = [];

    console.log(`    🤖 Extraindo campos operacionais via Gemini (${items.length} itens)...`);

    for (let i = 0; i < items.length; i += maxConcurrent) {
        const batch = items.slice(i, i + maxConcurrent);

        const batchResults = await Promise.all(
            batch.map(item => extractWithGemini(item.html, item.titulo))
        );

        results.push(...batchResults);

        // Progress callback
        if (onProgress) {
            onProgress(Math.min(i + maxConcurrent, items.length), items.length);
        }

        // Rate limiting
        if (i + maxConcurrent < items.length) {
            await new Promise(r => setTimeout(r, delayMs));
        }
    }

    const successCount = results.filter(r => r.canal_submissao || r.pre_requisitos.length > 0).length;
    console.log(`    ✅ Gemini: ${successCount}/${items.length} avisos com campos extraídos`);

    return results;
}

/**
 * Estimate cost for batch extraction
 */
export function estimateCost(itemCount: number, avgTokensPerItem: number = 8000): {
    inputTokens: number;
    outputTokens: number;
    estimatedCostUsd: number;
} {
    const inputTokens = itemCount * avgTokensPerItem;
    const outputTokens = itemCount * 500; // ~500 tokens per JSON response

    // Gemini 2.5 Flash-Lite pricing: $0.10/1M input, $0.40/1M output
    const inputCost = (inputTokens / 1_000_000) * 0.10;
    const outputCost = (outputTokens / 1_000_000) * 0.40;

    return {
        inputTokens,
        outputTokens,
        estimatedCostUsd: inputCost + outputCost,
    };
}

export default extractWithGemini;
