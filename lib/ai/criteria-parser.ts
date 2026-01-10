import { openrouter, AI_MODELS } from '@/lib/openrouter';
import type { AvisoCriteria } from '@/lib/eligibility-engine';

interface ParsedCriteria {
    dimensao?: string[];
    caePrefixos?: string[];
    regioes?: string[];
    tiposProjeto?: string[];
    investimentoMin?: number;
    investimentoMax?: number;
}

export async function parseCriteriaFromText(text: string): Promise<ParsedCriteria> {
    if (!openrouter) {
        throw new Error('OpenRouter client not initialized (missing API key)');
    }

    const systemPrompt = `You are an expert in analyzing EU funding tender notices (Portugal 2030).
Your task is to extract eligibility criteria from the provided text into a strict JSON format.

JSON Structure:
{
  "dimensao": ["MICRO", "PEQUENA", "MEDIA", "GRANDE"], // Allowed values. Extract only what is mentioned as eligible.
  "caePrefixos": ["10", "62", ...], // List of eligible CAE prefixes (2 digits). If "All", return explicit list if possible or specific keywords.
  "regioes": ["Norte", "Centro", "Lisboa", "Alentejo", "Algarve", "Açores", "Madeira"], // NUTS II regions.
  "tiposProjeto": ["inovacao", "digital", "internacionalizacao", "qualificacao", "verde"], // Infer likely type.
  "investimentoMin": number, // Minimum eligible investment in Euros.
  "investimentoMax": number // Maximum eligible investment in Euros.
}

Rules:
1. Return ONLY the JSON object. No markdown, no comments.
2. If a field is not found/specified, omit it or return null.
3. For CAE, if the text says "Industry", infer valid CAEs like 10-33. If "IT", infer 62-63.
4. Be conservative. Only include what is strictly supported by the text.`;

    try {
        const response = await openrouter.chat.completions.create({
            model: AI_MODELS['claude-4-5-sonnet'].id,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Analyze this text:\n\n${text}` }
            ],
            temperature: 0,
            response_format: { type: 'json_object' }
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error('Empty response from AI');
        }

        const parsed = JSON.parse(content) as ParsedCriteria;
        return parsed;

    } catch (error) {
        console.error('Error parsing criteria with AI:', error);
        throw error;
    }
}
