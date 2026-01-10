/**
 * Pagamentos API for Candidaturas
 * 
 * GET  /api/candidaturas/[id]/pagamentos - List payment requests
 * POST /api/candidaturas/[id]/pagamentos - Create payment request
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Autenticação necessária' }, { status: 401 });
        }

        const candidaturaId = params.id;

        const candidatura = await prisma.candidatura.findUnique({
            where: { id: candidaturaId }
        });

        if (!candidatura) {
            return NextResponse.json({ error: 'Candidatura não encontrada' }, { status: 404 });
        }

        const pagamentos = await prisma.pedidoPagamento.findMany({
            where: { candidaturaId },
            orderBy: { numero: 'asc' }
        });

        // Calculate totals
        const totalSolicitado = pagamentos.reduce((sum, p) => sum + p.montante, 0);
        const totalPago = pagamentos
            .filter(p => p.estado === 'PAGO')
            .reduce((sum, p) => sum + p.montante, 0);
        const pendente = pagamentos.filter(p => !['PAGO', 'REJEITADO'].includes(p.estado)).length;

        return NextResponse.json({
            success: true,
            pagamentos,
            stats: {
                count: pagamentos.length,
                totalSolicitado,
                totalPago,
                pendente,
                montanteAprovado: candidatura.montanteAprovado || 0,
                percentagemRecebida: candidatura.montanteAprovado
                    ? Math.round((totalPago / candidatura.montanteAprovado) * 100)
                    : 0
            }
        });

    } catch (error: any) {
        console.error('Pagamentos GET error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Autenticação necessária' }, { status: 401 });
        }

        const candidaturaId = params.id;
        const body = await request.json();
        const { montante, observacoes } = body;

        if (!montante || montante <= 0) {
            return NextResponse.json(
                { error: 'Montante deve ser maior que zero' },
                { status: 400 }
            );
        }

        const candidatura = await prisma.candidatura.findUnique({
            where: { id: candidaturaId }
        });

        if (!candidatura) {
            return NextResponse.json({ error: 'Candidatura não encontrada' }, { status: 404 });
        }

        if (candidatura.estado !== 'APROVADA') {
            return NextResponse.json(
                { error: 'Só é possível criar pedidos de pagamento para candidaturas aprovadas' },
                { status: 400 }
            );
        }

        // Get existing payments to validate limit
        const existingPagamentos = await prisma.pedidoPagamento.findMany({
            where: { candidaturaId }
        });

        const totalExistente = existingPagamentos.reduce((sum: number, p: { montante: number }) => sum + p.montante, 0);
        const novoMontante = parseFloat(montante);
        const montanteAprovado = candidatura.montanteAprovado || 0;

        if (montanteAprovado > 0 && totalExistente + novoMontante > montanteAprovado) {
            const disponivel = montanteAprovado - totalExistente;
            return NextResponse.json({
                error: `Limite excedido. Montante disponível: €${disponivel.toLocaleString('pt-PT')}`,
                disponivel,
                totalExistente,
                montanteAprovado
            }, { status: 400 });
        }

        // Get next number
        const lastPagamento = await prisma.pedidoPagamento.findFirst({
            where: { candidaturaId },
            orderBy: { numero: 'desc' }
        });

        const nextNumero = (lastPagamento?.numero || 0) + 1;

        const pagamento = await prisma.pedidoPagamento.create({
            data: {
                candidaturaId,
                numero: nextNumero,
                montante: parseFloat(montante),
                observacoes,
                estado: 'RASCUNHO'
            }
        });

        return NextResponse.json({
            success: true,
            pagamento
        }, { status: 201 });

    } catch (error: any) {
        console.error('Pagamentos POST error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
