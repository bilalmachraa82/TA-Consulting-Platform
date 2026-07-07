/**
 * Keyword Compliance API
 * 
 * POST /api/writer/check-compliance
 * Checks keyword compliance for generated text
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limiter';
import { quickComplianceCheck, getKeywordsForTemplate, extractKeywordsFromAviso } from '@/lib/keywords/compliance';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
        }

        const ip = getClientIP(request);
        const rateLimit = checkRateLimit(`writer-check-compliance:${ip}`, RATE_LIMITS.API_GENERAL);
        if (!rateLimit.success) {
            return NextResponse.json(
                { error: 'Demasiadas requisições. Tente novamente mais tarde.' },
                { status: 429 }
            );
        }

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
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

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
