import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface Alerta {
    id: string;
    tipo: 'AVISO_URGENTE' | 'DOCUMENTO_EXPIRA' | 'CANDIDATURA_PRAZO';
    prioridade: 'ALTA' | 'MEDIA' | 'BAIXA';
    titulo: string;
    descricao: string;
    empresa: {
        id: string;
        nome: string;
    };
    dataLimite?: Date;
    link?: string;
}

/**
 * GET /api/alertas/consolidados
 * Aggregates alerts from all companies managed by the consultant
 * Types: AVISO_URGENTE, DOCUMENTO_EXPIRA, CANDIDATURA_PRAZO
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

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Utilizador não encontrado' },
                { status: 404 }
            );
        }

        const alertas: Alerta[] = [];
        const now = new Date();
        const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        // Get consultant's companies
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
                        aviso: true
                    }
                },
                documentos: {
                    where: {
                        OR: [
                            { statusValidade: 'A_EXPIRAR' },
                            { statusValidade: 'EXPIRADO' },
                            { statusValidade: 'EM_FALTA' }
                        ]
                    }
                }
            }
        });

        // Generate alerts for each company
        for (const empresa of empresas) {
            // Document alerts
            for (const doc of empresa.documentos) {
                const prioridade = doc.statusValidade === 'EXPIRADO' || doc.statusValidade === 'EM_FALTA'
                    ? 'ALTA'
                    : 'MEDIA';

                alertas.push({
                    id: `doc-${doc.id}`,
                    tipo: 'DOCUMENTO_EXPIRA',
                    prioridade,
                    titulo: `Documento ${doc.statusValidade === 'EXPIRADO' ? 'expirado' : doc.statusValidade === 'EM_FALTA' ? 'em falta' : 'a expirar'}`,
                    descricao: `${doc.tipoDocumento}: ${doc.nome}`,
                    empresa: {
                        id: empresa.id,
                        nome: empresa.nome
                    },
                    dataLimite: doc.dataValidade || undefined
                });
            }

            // Application deadline alerts
            for (const candidatura of empresa.candidaturas) {
                const aviso = candidatura.aviso;
                const diasRestantes = Math.ceil(
                    (aviso.dataFimSubmissao.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                );

                if (diasRestantes <= 7 && diasRestantes >= 0) {
                    alertas.push({
                        id: `cand-${candidatura.id}`,
                        tipo: 'CANDIDATURA_PRAZO',
                        prioridade: diasRestantes <= 3 ? 'ALTA' : 'MEDIA',
                        titulo: `Candidatura com prazo em ${diasRestantes} dias`,
                        descricao: aviso.nome,
                        empresa: {
                            id: empresa.id,
                            nome: empresa.nome
                        },
                        dataLimite: aviso.dataFimSubmissao,
                        link: `/dashboard/candidaturas?id=${candidatura.id}`
                    });
                }
            }
        }

        // Get urgent notices (general, not company-specific)
        const avisosUrgentes = await prisma.aviso.findMany({
            where: {
                ativo: true,
                urgente: true,
                dataFimSubmissao: {
                    gte: now,
                    lte: oneWeekFromNow
                }
            },
            take: 5
        });

        for (const aviso of avisosUrgentes) {
            // Check if any consultant's company could benefit
            const empresasElegiveis = empresas.filter(emp =>
                aviso.setoresElegiveis.length === 0 ||
                aviso.setoresElegiveis.some((s: string) => emp.setor.includes(s)) ||
                aviso.dimensaoEmpresa.length === 0 ||
                aviso.dimensaoEmpresa.includes(emp.dimensao)
            );

            if (empresasElegiveis.length > 0) {
                alertas.push({
                    id: `aviso-${aviso.id}`,
                    tipo: 'AVISO_URGENTE',
                    prioridade: 'ALTA',
                    titulo: `Aviso urgente: ${aviso.nome}`,
                    descricao: `${empresasElegiveis.length} empresa(s) potencialmente elegível(eis)`,
                    empresa: empresasElegiveis[0] ? {
                        id: empresasElegiveis[0].id,
                        nome: empresasElegiveis.length > 1
                            ? `${empresasElegiveis[0].nome} (+${empresasElegiveis.length - 1})`
                            : empresasElegiveis[0].nome
                    } : { id: '', nome: 'Múltiplas empresas' },
                    dataLimite: aviso.dataFimSubmissao,
                    link: `/dashboard/avisos?id=${aviso.id}`
                });
            }
        }

        // Sort by priority and date
        alertas.sort((a, b) => {
            const prioridadeOrder = { ALTA: 0, MEDIA: 1, BAIXA: 2 };
            if (prioridadeOrder[a.prioridade] !== prioridadeOrder[b.prioridade]) {
                return prioridadeOrder[a.prioridade] - prioridadeOrder[b.prioridade];
            }
            if (a.dataLimite && b.dataLimite) {
                return a.dataLimite.getTime() - b.dataLimite.getTime();
            }
            return 0;
        });

        return NextResponse.json({
            alertas,
            resumo: {
                total: alertas.length,
                alta: alertas.filter(a => a.prioridade === 'ALTA').length,
                media: alertas.filter(a => a.prioridade === 'MEDIA').length,
                baixa: alertas.filter(a => a.prioridade === 'BAIXA').length
            }
        });

    } catch (error) {
        console.error('Error fetching consolidated alerts:', error);
        return NextResponse.json(
            { error: 'Erro ao carregar alertas' },
            { status: 500 }
        );
    }
}
