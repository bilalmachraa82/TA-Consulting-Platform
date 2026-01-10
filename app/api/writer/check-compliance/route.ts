/**
 * Keyword Compliance API
 * 
 * POST /api/writer/check-compliance
 * Checks keyword compliance for generated text
 */

import { NextRequest, NextResponse } from 'next/server';
import { quickComplianceCheck, getKeywordsForTemplate, extractKeywordsFromAviso } from '@/lib/keywords/compliance';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const { text, templateId, avisoId } = await request.json();

        if (!text || !templateId) {
            return NextResponse.json(
                { error: 'Texto e templateId são obrigatórios' },
                { status: 400 }
            );
        }

        // Get aviso description if provided
        let avisoDescription = '';
        if (avisoId) {
            const aviso = await prisma.aviso.findUnique({
                where: { id: avisoId },
                select: { nome: true, descricao: true },
            });
            if (aviso) {
                avisoDescription = `${aviso.nome} ${aviso.descricao || ''}`;
            }
        }

        // Run compliance check
        const result = quickComplianceCheck(text, templateId, avisoDescription);

        return NextResponse.json({
            success: true,
            compliance: result,
            template: templateId,
            avisoId: avisoId || null,
        });

    } catch (error: any) {
        console.error('[Compliance Check] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Erro ao verificar compliance' },
            { status: 500 }
        );
    }
}

// GET - Get keywords for a template
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('templateId');

    if (!templateId) {
        return NextResponse.json(
            { error: 'templateId é obrigatório' },
            { status: 400 }
        );
    }

    const keywords = getKeywordsForTemplate(templateId);

    return NextResponse.json({
        templateId,
        keywords,
        count: keywords.length,
    });
}
