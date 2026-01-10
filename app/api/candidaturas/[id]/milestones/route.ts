/**
 * Milestones API for Candidaturas
 * 
 * GET  /api/candidaturas/[id]/milestones - List milestones
 * POST /api/candidaturas/[id]/milestones - Create milestone
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

        // Verify candidatura exists and user has access
        const candidatura = await prisma.candidatura.findUnique({
            where: { id: candidaturaId },
            include: { empresa: true }
        });

        if (!candidatura) {
            return NextResponse.json({ error: 'Candidatura não encontrada' }, { status: 404 });
        }

        const milestones = await prisma.milestone.findMany({
            where: { candidaturaId },
            orderBy: { dataLimite: 'asc' }
        });

        // Calculate progress
        const total = milestones.length;
        const completed = milestones.filter(m => m.estado === 'CONCLUIDO').length;
        const overdue = milestones.filter(m =>
            m.estado !== 'CONCLUIDO' && new Date(m.dataLimite) < new Date()
        ).length;

        return NextResponse.json({
            success: true,
            milestones,
            stats: {
                total,
                completed,
                overdue,
                progress: total > 0 ? Math.round((completed / total) * 100) : 0
            }
        });

    } catch (error: any) {
        console.error('Milestones GET error:', error);
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
        const { titulo, descricao, dataLimite, valorAssociado } = body;

        if (!titulo || !dataLimite) {
            return NextResponse.json(
                { error: 'Título e data limite são obrigatórios' },
                { status: 400 }
            );
        }

        // Verify candidatura exists
        const candidatura = await prisma.candidatura.findUnique({
            where: { id: candidaturaId }
        });

        if (!candidatura) {
            return NextResponse.json({ error: 'Candidatura não encontrada' }, { status: 404 });
        }

        if (candidatura.estado !== 'APROVADA') {
            return NextResponse.json(
                { error: 'Só é possível adicionar milestones a candidaturas aprovadas' },
                { status: 400 }
            );
        }

        const milestone = await prisma.milestone.create({
            data: {
                candidaturaId,
                titulo,
                descricao,
                dataLimite: new Date(dataLimite),
                valorAssociado: valorAssociado ? parseFloat(valorAssociado) : null,
                estado: 'PENDENTE'
            }
        });

        return NextResponse.json({
            success: true,
            milestone
        }, { status: 201 });

    } catch (error: any) {
        console.error('Milestones POST error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
