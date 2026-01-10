/**
 * The Critic API
 * 
 * POST /api/critic - Run mock audit on Empresa + Aviso pair
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { runCriticAudit, type CriticInput } from '@/lib/critic-agent';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Autenticação necessária' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { empresaId, avisoId, projetoProposto } = body;

        // Validate required fields
        if (!empresaId || !avisoId) {
            return NextResponse.json(
                { error: 'empresaId e avisoId são obrigatórios' },
                { status: 400 }
            );
        }

        const input: CriticInput = {
            empresaId,
            avisoId,
            projetoProposto,
        };

        const verdict = await runCriticAudit(input);

        return NextResponse.json({
            success: true,
            verdict,
            timestamp: new Date().toISOString(),
        });

    } catch (error: any) {
        console.error('Critic API error:', error);
        return NextResponse.json(
            { error: error.message || 'Erro ao executar análise' },
            { status: 500 }
        );
    }
}
