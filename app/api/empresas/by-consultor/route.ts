import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/empresas/by-consultor
 * Returns all companies managed by the authenticated consultant
 * Includes: relevant notices, expiring documents, active applications
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Não autenticado' },
                { status: 401 }
            );
        }

        // Get the current user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, role: true }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Utilizador não encontrado' },
                { status: 404 }
            );
        }

        // Get all companies managed by this consultant
        const empresas = await prisma.empresa.findMany({
            where: {
                consultorId: user.id,
                ativa: true
            },
            include: {
                candidaturas: {
                    where: {
                        estado: {
                            in: ['A_PREPARAR', 'SUBMETIDA', 'EM_ANALISE']
                        }
                    },
                    include: {
                        aviso: {
                            select: {
                                id: true,
                                nome: true,
                                dataFimSubmissao: true,
                                urgente: true
                            }
                        }
                    }
                },
                documentos: {
                    where: {
                        statusValidade: {
                            in: ['A_EXPIRAR', 'EXPIRADO', 'EM_FALTA']
                        }
                    }
                }
            },
            orderBy: {
                nome: 'asc'
            }
        });

        // Get urgent notices that match any of the consultant's companies
        const now = new Date();
        const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const avisosUrgentes = await prisma.aviso.findMany({
            where: {
                ativo: true,
                dataFimSubmissao: {
                    gte: now,
                    lte: oneWeekFromNow
                }
            },
            orderBy: {
                dataFimSubmissao: 'asc'
            },
            take: 10
        });

        // Aggregate stats
        const stats = {
            totalEmpresas: empresas.length,
            candidaturasAtivas: empresas.reduce(
                (acc, emp) => acc + emp.candidaturas.length,
                0
            ),
            documentosProblematicos: empresas.reduce(
                (acc, emp) => acc + emp.documentos.length,
                0
            ),
            avisosUrgentes: avisosUrgentes.length
        };

        return NextResponse.json({
            empresas,
            avisosUrgentes,
            stats
        });

    } catch (error) {
        console.error('Error fetching consultant companies:', error);
        return NextResponse.json(
            { error: 'Erro ao carregar empresas do consultor' },
            { status: 500 }
        );
    }
}
