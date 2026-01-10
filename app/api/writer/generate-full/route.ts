/**
 * Full Application Generator API
 * 
 * POST /api/writer/generate-full
 * Generates ALL sections of a template in one request with progress streaming
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getTemplateById, type ApplicationTemplate, type TemplateSection } from '@/lib/templates';
import { prisma } from '@/lib/db';
import { openrouter, AI_MODELS, PT_PT_SYSTEM_PROMPT, type AIModelId } from '@/lib/openrouter';
import { canAccessFeature } from '@/lib/plans';

export const dynamic = 'force-dynamic';
export const maxDuration = 120; // 2 minutes for full generation

interface GeneratedSection {
    id: string;
    title: string;
    content: string;
    characterCount: number;
    maxLength: number;
    status: 'success' | 'error';
    error?: string;
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Autenticação necessária' },
                { status: 401 }
            );
        }

        // Fetch user and validate plan
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, plan: true }
        });

        // PLAN GUARD: Full App Generator requer STARTER+
        if (!user || !canAccessFeature(user.plan, 'STARTER')) {
            return NextResponse.json(
                { error: 'Funcionalidade exclusiva para planos Starter, Pro e Enterprise.' },
                { status: 403 }
            );
        }

        const {
            templateId,
            empresaId,
            avisoId,
            customContext = {},
            modelId = 'claude-4-5-sonnet',
            sectionsToGenerate // Optional: array of section IDs to generate (if empty, generate all)
        } = await request.json();

        // Validate model
        const selectedModel = AI_MODELS[modelId as AIModelId];
        if (!selectedModel) {
            return NextResponse.json(
                { error: 'Modelo de IA inválido' },
                { status: 400 }
            );
        }

        // Validate template
        if (!templateId) {
            return NextResponse.json(
                { error: 'Template é obrigatório' },
                { status: 400 }
            );
        }

        const template = getTemplateById(templateId);
        if (!template) {
            return NextResponse.json(
                { error: 'Template não encontrado' },
                { status: 404 }
            );
        }

        // Get empresa data
        let empresa: any = null;
        if (empresaId) {
            empresa = await prisma.empresa.findUnique({
                where: { id: empresaId }
            });
        }

        // Get aviso data
        let aviso: any = null;
        if (avisoId) {
            aviso = await prisma.aviso.findUnique({
                where: { id: avisoId }
            });
        }

        // Build context
        const context = {
            empresa: empresa ? {
                nome: empresa.nome,
                nipc: empresa.nipc,
                setor: empresa.setor,
                dimensao: empresa.dimensao,
                regiao: empresa.regiao,
                cae: empresa.cae || '',
                emprego: empresa.numeroTrabalhadores || 0,
                volumeNegocios: empresa.volumeNegocios || 0,
            } : {},
            aviso: aviso ? {
                nome: aviso.nome,
                portal: aviso.portal,
                programa: aviso.programa,
                taxa: aviso.taxa || '50%',
            } : {},
            projeto: customContext?.projeto || {},
        };

        // Determine which sections to generate
        const sectionsQueue: TemplateSection[] = sectionsToGenerate && sectionsToGenerate.length > 0
            ? template.sections.filter(s => sectionsToGenerate.includes(s.id))
            : template.sections;

        // Generate all sections
        const results: GeneratedSection[] = [];
        let successCount = 0;
        let errorCount = 0;

        for (const section of sectionsQueue) {
            try {
                // Replace placeholders in prompt
                let prompt = section.aiPrompt;
                Object.entries(context).forEach(([category, values]) => {
                    Object.entries(values as Record<string, any>).forEach(([key, value]) => {
                        prompt = prompt.replace(`{{${category}.${key}}}`, String(value || 'N/A'));
                    });
                });

                const fullUserPrompt = `
TAREFA: Escrever a secção "${section.title}"
DESCRIÇÃO: ${section.description}
LIMITE: ${section.maxLength} caracteres

CONTEXTO DO PONTO:
${prompt}

NOTAS ADICIONAIS:
${customContext?.notes || 'Nenhuma nota adicional.'}

INSTRUÇÃO: Escreve APENAS o texto da secção. Nada de "Aqui está o texto" ou introduções.
`;

                // Generate with OpenRouter
                if (!openrouter) {
                    throw new Error('OpenRouter não configurado');
                }

                const completion = await openrouter.chat.completions.create({
                    model: selectedModel.id,
                    messages: [
                        { role: 'system', content: PT_PT_SYSTEM_PROMPT },
                        { role: 'user', content: fullUserPrompt }
                    ],
                    temperature: 0.7,
                    max_tokens: 4000,
                });

                const generatedText = completion.choices[0]?.message?.content || '';

                if (!generatedText) {
                    throw new Error('Resposta vazia do modelo');
                }

                results.push({
                    id: section.id,
                    title: section.title,
                    content: generatedText,
                    characterCount: generatedText.length,
                    maxLength: section.maxLength,
                    status: 'success',
                });
                successCount++;

            } catch (sectionError: any) {
                console.error(`[Full Gen] Error generating section ${section.id}:`, sectionError.message);
                results.push({
                    id: section.id,
                    title: section.title,
                    content: '',
                    characterCount: 0,
                    maxLength: section.maxLength,
                    status: 'error',
                    error: sectionError.message,
                });
                errorCount++;
            }
        }

        // Log usage (for future analytics)
        console.log(`[Full Gen] Completed: ${successCount}/${sectionsQueue.length} sections for user ${user.id}`);

        return NextResponse.json({
            success: true,
            template: {
                id: template.id,
                name: template.name,
                portal: template.portal,
            },
            sections: results,
            summary: {
                total: sectionsQueue.length,
                success: successCount,
                errors: errorCount,
                totalCharacters: results.reduce((sum, s) => sum + s.characterCount, 0),
            },
            model: selectedModel.name,
            empresa: empresa ? { id: empresa.id, nome: empresa.nome } : null,
            aviso: aviso ? { id: aviso.id, nome: aviso.nome } : null,
        });

    } catch (error: any) {
        console.error('[Full Gen] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Erro ao gerar candidatura' },
            { status: 500 }
        );
    }
}
