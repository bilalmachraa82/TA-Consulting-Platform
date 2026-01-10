/**
 * AI Writer API
 * 
 * POST /api/writer/generate - Generate section content using AI
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getTemplateById } from '@/lib/templates';
import { prisma } from '@/lib/db';
import { openrouter, AI_MODELS, PT_PT_SYSTEM_PROMPT, type AIModelId } from '@/lib/openrouter';
import { fetchSectionExamples, isRAGAvailable } from '@/lib/rag/candidaturas-rag';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Autenticação necessária' },
                { status: 401 }
            );
        }

        // Fetch user plan FRESH from DB
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, plan: true }
        });

        // PLAN GUARD: AI Writer requer STARTER no mínimo
        const { canAccessFeature } = await import('@/lib/plans');
        if (!user || !canAccessFeature(user.plan, 'STARTER')) {
            return NextResponse.json(
                { error: 'Funcionalidade exclusiva para planos Starter, Pro e Enterprise. Faça upgrade para aceder.' },
                { status: 403 }
            );
        }

        const {
            templateId,
            sectionId,
            empresaId,
            avisoId,
            customContext,
            modelId = 'claude-4-5-sonnet' // Default model (Updated Post-AoT)
        } = await request.json();

        // Validate model
        const selectedModel = AI_MODELS[modelId as AIModelId];
        if (!selectedModel) {
            return NextResponse.json(
                { error: 'Modelo de IA inválido' },
                { status: 400 }
            );
        }

        // Validate inputs
        if (!templateId || !sectionId) {
            return NextResponse.json(
                { error: 'Template e secção são obrigatórios' },
                { status: 400 }
            );
        }

        // Get template
        const template = getTemplateById(templateId);
        if (!template) {
            return NextResponse.json(
                { error: 'Template não encontrado' },
                { status: 404 }
            );
        }

        // Get section
        const section = template.sections.find(s => s.id === sectionId);
        if (!section) {
            return NextResponse.json(
                { error: 'Secção não encontrada' },
                { status: 404 }
            );
        }

        // Get empresa data if provided
        let empresa = null;
        if (empresaId) {
            empresa = await prisma.empresa.findUnique({
                where: { id: empresaId }
            });
        }

        // Get aviso data if provided
        let aviso = null;
        if (avisoId) {
            aviso = await prisma.aviso.findUnique({
                where: { id: avisoId }
            });
        }

        // Build context for AI
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

        // Replace placeholders in prompt
        let prompt = section.aiPrompt;
        Object.entries(context).forEach(([category, values]) => {
            Object.entries(values as Record<string, any>).forEach(([key, value]) => {
                prompt = prompt.replace(`{{${category}.${key}}}`, String(value || 'N/A'));
            });
        });

        // Fetch examples from historical candidaturas (RAG)
        let ragContext = '';
        if (isRAGAvailable()) {
            try {
                const ragResult = await fetchSectionExamples(
                    section.title,
                    section.description,
                    templateId,
                    3
                );

                if (ragResult.examples.length > 0) {
                    ragContext = `\n\nEXEMPLOS DE CANDIDATURAS APROVADAS:\n${ragResult.examples.map((ex, i) =>
                        `[Exemplo ${i + 1} - ${ex.source}]\n${ex.content}\n`
                    ).join('\n')}`;
                    console.log(`[AI Writer] RAG: ${ragResult.examples.length} exemplos em ${ragResult.latencyMs}ms`);
                }
            } catch (error: any) {
                console.warn('[AI Writer] RAG fallback:', error.message);
            }
        }

        // Add custom notes to prompt
        const fullUserPrompt = `
TAREFA: Escrever a secção "${section.title}"
DESCRIÇÃO: ${section.description}
LIMITE: ${section.maxLength} caracteres

CONTEXTO DO PONTO:
${prompt}
${ragContext}

NOTAS ADICIONAIS DO UTILIZADOR:
${customContext?.notes || 'Nenhuma nota adicional.'}

INSTRUÇÃO FINAL:
Escreve APENAS o texto da secção. Nada de "Aqui está o texto" ou introduções.
Inspira-te nos exemplos de candidaturas aprovadas quando disponíveis.
`;

        // Generate with OpenRouter
        if (!openrouter) {
            return NextResponse.json(
                { error: 'OpenRouter não configurado - OPENROUTER_API_KEY em falta' },
                { status: 503 }
            );
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
            throw new Error('Falha ao gerar conteúdo (resposta vazia)');
        }

        return NextResponse.json({
            success: true,
            section: {
                id: section.id,
                title: section.title,
            },
            content: generatedText,
            characterCount: generatedText.length,
            maxLength: section.maxLength,
            model: selectedModel.name,
            provider: selectedModel.provider,
        });

    } catch (error: any) {
        console.error('AI Writer error:', error);
        return NextResponse.json(
            { error: error.message || 'Erro ao gerar conteúdo' },
            { status: 500 }
        );
    }
}

// GET - List available templates
export async function GET() {
    const { TEMPLATES } = await import('@/lib/templates');

    const templates = Object.values(TEMPLATES).map(t => ({
        id: t.id,
        name: t.name,
        portal: t.portal,
        description: t.description,
        sectionsCount: t.sections.length,
    }));

    return NextResponse.json({ templates });
}
