
import { openrouter, AI_MODELS, PT_PT_SYSTEM_PROMPT } from '@/lib/openrouter';
import { CandidaturaSection, CANDIDATURA_SECTIONS } from './sections';

export interface GeneratorContext {
    empresa: any;
    aviso: any;
    chunks?: any[];
    docsContext?: string;
    historico?: any;
    userInstructions?: string;
}

export interface GeneratedContent {
    content: string | null;
    confidence: 'high' | 'medium' | 'low';
    usedSources: string[];
    modelUsed: string;
}

export class CandidaturaGenerator {

    async generateSectionStream(
        sectionId: string,
        context: GeneratorContext,
        useOpus: boolean = false
    ): Promise<ReadableStream> {
        if (!openrouter) {
            throw new Error('OpenRouter client not configured.');
        }

        const section = CANDIDATURA_SECTIONS.find(s => s.id === sectionId);
        if (!section) throw new Error(`Section ${sectionId} not found`);

        const modelConfig = useOpus ? AI_MODELS['claude-opus-4-5'] : AI_MODELS['claude-4-5-sonnet'];
        const prompt = this.buildPrompt(section, context);

        const response = await openrouter.chat.completions.create({
            model: modelConfig.id,
            messages: [
                {
                    role: 'system',
                    content: PT_PT_SYSTEM_PROMPT + "\n\nCRITICAL: You must cite your sources using the format [ID: XX] whenever you use information from the provided Aviso Chunks. This is essential for transparency."
                },
                { role: 'user', content: prompt }
            ],
            stream: true,
            temperature: 0.7,
            max_tokens: section.maxTokens || 2000
        });

        // Convert OpenAI stream to standard ReadableStream
        return new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                try {
                    for await (const chunk of response) {
                        const content = chunk.choices[0]?.delta?.content || "";
                        if (content) {
                            controller.enqueue(encoder.encode(content));
                        }
                    }
                } catch (err) {
                    controller.error(err);
                } finally {
                    controller.close();
                }
            },
        });
    }

    private buildPrompt(section: CandidaturaSection, context: GeneratorContext): string {
        let prompt = section.promptTemplate;

        // Substituições directas
        prompt = prompt.replace('{{aviso_nome}}', context.aviso?.nome || 'Aviso PT2030');
        prompt = prompt.replace('{{empresa_nome}}', context.empresa?.nome || 'Empresa');
        prompt = prompt.replace('{{empresa_setor}}', context.empresa?.setor || 'Geral');
        prompt = prompt.replace('{{investimento_total}}', '150.000'); // Placeholder
        prompt = prompt.replace('{{duracao_meses}}', '18');

        // Injetar Contexto de RAG do Aviso
        if (context.chunks && context.chunks.length > 0) {
            const chunksText = context.chunks.map(c => `[ID: ${c.id}] ${c.content}`).join('\n\n');
            prompt += `\n\n--- CONTEXTO DO AVISO (REGRAS OFICIAIS) ---\nUsa estes IDs para citações:\n${chunksText}\n--- FIM DO CONTEXTO DO AVISO ---`;
        }

        // Injetar Contexto da Empresa (Documentos/Histórico)
        if (context.docsContext) {
            prompt += `\n\n--- CONTEXTO DA EMPRESA (MEMÓRIA DESCRITIVA / DADOS) ---\n${context.docsContext}\n--- FIM DO CONTEXTO DA EMPRESA ---`;
        }

        // Adicionar contexto extra se fornecido
        if (context.userInstructions) {
            prompt += `\n\nInstruções adicionais do utilizador: ${context.userInstructions}`;
        }

        prompt += "\n\nIMPORTANTE: Escreve de forma profissional, em PT-PT, e fundamenta sempre as tuas afirmações com os dados do aviso usando [ID: XX].";

        return prompt;
    }

    private calculateConfidence(text: string, section: CandidaturaSection): 'high' | 'medium' | 'low' {
        if (text.length < 100) return 'low';
        if (text.includes('[') && text.includes(']')) return 'medium'; // Possíveis placeholders
        return 'high';
    }
}
