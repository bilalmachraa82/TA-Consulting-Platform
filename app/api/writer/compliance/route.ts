/**
 * Compliance Check API
 * 
 * POST /api/writer/compliance - Check keyword compliance for a section
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { quickComplianceCheck, type ComplianceResult } from '@/lib/keywords/compliance';
import { z } from 'zod';

const ComplianceRequestSchema = z.object({
    text: z.string().min(10, 'Texto muito curto para análise'),
    templateId: z.string().min(1),
    avisoDescription: z.string().optional(),
});

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const body = await request.json();
        const parseResult = ComplianceRequestSchema.safeParse(body);

        if (!parseResult.success) {
            return NextResponse.json(
                { error: 'Dados inválidos', details: parseResult.error.flatten() },
                { status: 400 }
            );
        }

        const { text, templateId, avisoDescription } = parseResult.data;

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
