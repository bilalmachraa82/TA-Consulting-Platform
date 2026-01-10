
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { notificationEngine, NotificationType } from '@/lib/notifications/engine';

/**
 * Cron Job para processar notificações proativas.
 * Chamado via Vercel Cron ou similar (ex: cada hora).
 */
export async function GET(req: Request) {
    try {
        // Verificar autenticação do cron
        const authHeader = req.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const now = new Date();
        const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        let processed = 0;

        // 1. Avisos a expirar em 7 dias
        const expiringAvisos = await prisma.aviso.findMany({
            where: {
                ativo: true,
                dataFimSubmissao: {
                    gte: now,
                    lte: in7Days,
                },
            },
            include: {
                candidaturas: {
                    where: { estado: 'A_PREPARAR' },
                    include: { empresa: { include: { consultor: true } } }
                }
            }
        });

        for (const aviso of expiringAvisos) {
            for (const candidatura of aviso.candidaturas) {
                if (candidatura.empresa.consultor?.id) {
                    await notificationEngine.send({
                        type: 'AVISO_PRAZO_7D',
                        userId: candidatura.empresa.consultor.id,
                        title: `Prazo a terminar: ${aviso.nome}`,
                        message: `O aviso ${aviso.codigo} expira em ${Math.ceil((aviso.dataFimSubmissao.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} dias.`,
                        link: `/dashboard/candidaturas`,
                        metadata: { avisoId: aviso.id, candidaturaId: candidatura.id }
                    });
                    processed++;
                }
            }
        }

        // 2. Documentos a expirar em 30 dias
        const expiringDocs = await prisma.documento.findMany({
            where: {
                dataValidade: {
                    gte: now,
                    lte: in30Days,
                },
                statusValidade: { not: 'EXPIRADO' }
            },
            include: {
                empresa: { include: { consultor: true } }
            }
        });

        for (const doc of expiringDocs) {
            if (doc.empresa.consultor?.id) {
                await notificationEngine.send({
                    type: 'DOCUMENTO_EXPIRA_30D',
                    userId: doc.empresa.consultor.id,
                    title: `Documento a expirar: ${doc.nome}`,
                    message: `O documento ${doc.tipoDocumento} da empresa ${doc.empresa.nome} expira em breve.`,
                    link: `/dashboard/documentacao`,
                    metadata: { documentoId: doc.id, empresaId: doc.empresaId }
                });
                processed++;
            }
        }

        // 3. Milestones atrasados
        const overdueMilestones = await prisma.milestone.findMany({
            where: {
                dataLimite: { lt: now },
                estado: { in: ['PENDENTE', 'EM_PROGRESSO'] }
            },
            include: {
                candidatura: {
                    include: {
                        empresa: { include: { consultor: true } }
                    }
                }
            }
        });

        for (const milestone of overdueMilestones) {
            if (milestone.candidatura.empresa.consultor?.id) {
                await notificationEngine.send({
                    type: 'MILESTONE_ATRASADO',
                    userId: milestone.candidatura.empresa.consultor.id,
                    title: `Milestone em atraso: ${milestone.titulo}`,
                    message: `O milestone da candidatura ${milestone.candidatura.empresa.nome} está atrasado.`,
                    link: `/dashboard/candidaturas`,
                    metadata: { milestoneId: milestone.id }
                });
                processed++;
            }
        }

        return NextResponse.json({
            success: true,
            processed,
            timestamp: now.toISOString()
        });

    } catch (error) {
        console.error('Notification cron error:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
