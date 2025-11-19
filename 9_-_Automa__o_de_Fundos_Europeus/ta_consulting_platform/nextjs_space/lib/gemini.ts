import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

// Configuração do Modelo
const MODEL_NAME = 'gemini-3-pro-preview' // Slug oficial da documentação
const API_KEY = process.env.GEMINI_API_KEY || ''

if (!API_KEY) {
    console.error('GEMINI_API_KEY não configurada!')
}

const genAI = new GoogleGenerativeAI(API_KEY)

export const geminiClient = genAI.getGenerativeModel({
    model: MODEL_NAME,
    safetySettings: [
        {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
    ],
})

export interface GeminiGenerationOptions {
    temperature?: number
    maxOutputTokens?: number
    topP?: number
    topK?: number
    thinkingLevel?: 'low' | 'high' // Novo parâmetro Gemini 3
}

/**
 * Gera texto usando o Google Gemini (Substituto do Claude)
 */
export async function generateText(
    prompt: string,
    options: GeminiGenerationOptions = {}
): Promise<string> {
    try {
        const {
            temperature = 1.0, // Recomendado 1.0 para Gemini 3
            maxOutputTokens = 8192,
            topP = 0.95,
            topK = 40,
            thinkingLevel = 'high' // Padrão High para raciocínio profundo
        } = options

        const model = genAI.getGenerativeModel({
            model: MODEL_NAME,
            generationConfig: {
                temperature,
                maxOutputTokens,
                topP,
                topK,
                // @ts-ignore - Parâmetro novo ainda não tipado no SDK estável
                thinking_level: thinkingLevel,
            }
        })

        const result = await model.generateContent(prompt)
        const response = await result.response
        return response.text()
    } catch (error) {
        console.error('Erro na geração Gemini:', error)
        throw error
    }
}

/**
 * Gera texto em stream (para respostas longas como Memórias Descritivas)
 */
export async function* generateTextStream(
    prompt: string,
    options: GeminiGenerationOptions = {}
) {
    try {
        const {
            temperature = 1.0, // Recomendado 1.0 para Gemini 3
            maxOutputTokens = 8192, // Gemini suporta janelas enormes
            thinkingLevel = 'high'
        } = options

        const model = genAI.getGenerativeModel({
            model: MODEL_NAME,
            generationConfig: {
                temperature,
                maxOutputTokens,
                // @ts-ignore
                thinking_level: thinkingLevel,
            }
        })

        const result = await model.generateContentStream(prompt)

        for await (const chunk of result.stream) {
            const chunkText = chunk.text()
            yield chunkText
        }
    } catch (error) {
        console.error('Erro no stream Gemini:', error)
        throw error
    }
}
