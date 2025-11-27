import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Buscar métricas gerais
    const [
      totalAvisos,
      totalEmpresas,
      totalCandidaturas,
      totalDocumentos,
      avisosUrgentes,
      candidaturasPorEstado,
      avisosPorPortal,
      candidaturasPorMes,
      topEmpresas,
    ] = await Promise.all([
      prisma.aviso.count(),
      prisma.empresa.count(),
      prisma.candidatura.count(),
      prisma.documento.count(),
      prisma.aviso.count({
        where: {
          ativo: true,
          dataFimSubmissao: {
            gte: new Date(),
            lte: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.candidatura.groupBy({
        by: ['estado'],
        _count: { estado: true },
      }),
      prisma.aviso.groupBy({
        by: ['portal'],
        _count: { portal: true },
      }),
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', "createdAt") as mes,
          COUNT(*) as total
        FROM "candidaturas"
        WHERE "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY mes
        ORDER BY mes DESC
      `,
      prisma.empresa.findMany({
        take: 5,
        include: {
          candidaturas: {
            select: { montanteSolicitado: true },
          },
        },
      }),
    ]);

    // Calcular montante total disponível
    const montanteTotal = await prisma.aviso.aggregate({
      _sum: { montanteMaximo: true },
      where: { ativo: true },
    });

    // Calcular valor total solicitado
    const valorTotalSolicitado = await prisma.candidatura.aggregate({
      _sum: { montanteSolicitado: true },
    });

    // Processar top empresas
    type EmpresaWithCandidaturas = typeof topEmpresas[number];
    type CandidaturaItem = { montanteSolicitado: number | null };
    const empresasProcessadas = topEmpresas.map((empresa: EmpresaWithCandidaturas) => ({
      ...empresa,
      valorTotal: empresa.candidaturas.reduce((acc: number, c: CandidaturaItem) => acc + (c.montanteSolicitado || 0), 0),
    })).sort((a: { valorTotal: number }, b: { valorTotal: number }) => b.valorTotal - a.valorTotal);

    return NextResponse.json({
      resumo: {
        totalAvisos,
        totalEmpresas,
        totalCandidaturas,
        totalDocumentos,
        avisosUrgentes,
        orcamentoDisponivel: Number(montanteTotal._sum.montanteMaximo || 0),
        valorSolicitado: Number(valorTotalSolicitado._sum.montanteSolicitado || 0),
      },
      graficos: {
        candidaturasPorStatus: candidaturasPorEstado.map((c: { estado: string; _count: { estado: number } }) => ({
          status: c.estado,
          total: c._count.estado,
        })),
        avisosPorPortal: avisosPorPortal.map((a: { portal: string; _count: { portal: number } }) => ({
          portal: a.portal,
          total: a._count.portal,
        })),
        candidaturasPorMes: (candidaturasPorMes as any[]).map((m: any) => ({
          mes: m.mes,
          total: Number(m.total),
        })),
        topEmpresas: empresasProcessadas.slice(0, 5).map((e: EmpresaWithCandidaturas & { valorTotal: number }) => ({
          ...e,
          valorTotal: Number(e.valorTotal),
          candidaturas: e.candidaturas.map((c: CandidaturaItem) => ({
            ...c,
            montanteSolicitado: Number(c.montanteSolicitado || 0),
          })),
        })),
      },
    });
  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar métricas' },
      { status: 500 }
    );
  }
}
