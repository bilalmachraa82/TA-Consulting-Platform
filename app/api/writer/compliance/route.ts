/**
 * Compliance Check API
 *
 * POST /api/writer/compliance - Check keyword compliance for a section
 * GET  /api/writer/compliance?templateId=x - Keywords esperadas para um template
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limiter';
import { quickComplianceCheck, getKeywordsForTemplate, type ComplianceResult } from '@/lib/keywords/compliance';
import { prisma } from '@/lib/db';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const ComplianceRequestSchema = z.object({
    text: z.string().min(10, 'Texto muito curto para análise'),
    templateId: z.string().min(1),
    avisoDescription: z.string().optional(),
    // Alternativa a avisoDescription: buscar nome+descrição do aviso à BD
    avisoId: z.string().optional(),
});

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const ip = getClientIP(request);
        const rateLimit = checkRateLimit(`writer-compliance:${ip}`, RATE_LIMITS.API_GENERAL);
        if (!rateLimit.success) {
            return NextResponse.json(
                { error: 'Demasiadas requisições. Tente novamente mais tarde.' },
                { status: 429 }
            );
        }

        const body = await request.json();
        const parseResult = ComplianceRequestSchema.safeParse(body);

        if (!parseResult.success) {
            return NextResponse.json(
                { error: 'Dados inválidos', details: parseResult.error.flatten() },
                { status: 400 }
            );
        }

        const { text, templateId, avisoId } = parseResult.data;
        let { avisoDescription } = parseResult.data;

        if (!avisoDescription && avisoId) {
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

        // Add grade based on score
        let grade: 'A' | 'B' | 'C' | 'D' | 'F';
        if (result.score >= 90) grade = 'A';
        else if (result.score >= 75) grade = 'B';
        else if (result.score >= 60) grade = 'C';
        else if (result.score >= 40) grade = 'D';
        else grade = 'F';

        return NextResponse.json({
            success: true,
            compliance: {
                ...result,
                grade,
                message: getComplianceMessage(grade, result),
            },
        });

    } catch (error: any) {
        console.error('[Compliance Check Error]:', error);
        return NextResponse.json(
            { error: 'Erro ao verificar compliance' },
            { status: 500 }
        );
    }
}

// GET - keywords esperadas para um template (absorvido de check-compliance)
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

function getComplianceMessage(grade: string, result: ComplianceResult): string {
    switch (grade) {
        case 'A':
            return 'Excelente! O texto está muito bem alinhado com os critérios do aviso.';
        case 'B':
            return 'Bom! O texto cobre a maioria dos critérios importantes.';
        case 'C':
            return 'Razoável. Considere adicionar mais referências aos critérios.';
        case 'D':
            return 'Atenção! O texto precisa de melhorias significativas.';
        case 'F':
            return 'O texto não está alinhado com os critérios. Reveja as sugestões.';
        default:
            return '';
    }
}
