
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    const empresasProcessadas = topEmpresas.map(empresa => ({
      ...empresa,
      valorTotal: empresa.candidaturas.reduce((acc, c) => acc + (c.montanteSolicitado || 0), 0),
    })).sort((a, b) => b.valorTotal - a.valorTotal);

    // ========== ANALYTICS AVANÇADO ==========

    // 1. Taxa de sucesso por portal
    const taxaSucessoPorPortal = await prisma.$queryRaw<any[]>`
      SELECT 
        a.portal,
        COUNT(DISTINCT c.id) as total_candidaturas,
        COUNT(DISTINCT CASE WHEN c.estado = 'APROVADA' THEN c.id END) as aprovadas,
        CAST(ROUND(
          (COUNT(DISTINCT CASE WHEN c.estado = 'APROVADA' THEN c.id END)::numeric / 
          NULLIF(COUNT(DISTINCT c.id), 0)::numeric * 100), 
          2
        ) AS numeric) as taxa_sucesso
      FROM candidaturas c
      INNER JOIN avisos a ON c."avisoId" = a.id
      GROUP BY a.portal
    `;

    // 2. Taxa de sucesso por programa
    const taxaSucessoPorPrograma = await prisma.$queryRaw<any[]>`
      SELECT 
        a.programa,
        COUNT(DISTINCT c.id) as total_candidaturas,
        COUNT(DISTINCT CASE WHEN c.estado = 'APROVADA' THEN c.id END) as aprovadas,
        CAST(ROUND(
          (COUNT(DISTINCT CASE WHEN c.estado = 'APROVADA' THEN c.id END)::numeric / 
          NULLIF(COUNT(DISTINCT c.id), 0)::numeric * 100), 
          2
        ) AS numeric) as taxa_sucesso
      FROM candidaturas c
      INNER JOIN avisos a ON c."avisoId" = a.id
      WHERE a.programa IS NOT NULL AND a.programa != ''
      GROUP BY a.programa
    `;

    // 3. Tempo médio de candidatura (da criação à submissão)
    const tempoMedioCandidatura = await prisma.$queryRaw<any[]>`
      SELECT 
        CAST(AVG(EXTRACT(DAY FROM ("dataSubmissao" - "createdAt"))) AS numeric) as tempo_medio_dias
      FROM candidaturas
      WHERE "dataSubmissao" IS NOT NULL
    `;

    // 4. ROI por portal (montante aprovado vs solicitado)
    const roiPorPortal = await prisma.$queryRaw<any[]>`
      SELECT 
        a.portal,
        COALESCE(SUM(c."montanteSolicitado"), 0) as total_solicitado,
        COALESCE(SUM(c."montanteAprovado"), 0) as total_aprovado,
        CAST(ROUND(
          (COALESCE(SUM(c."montanteAprovado"), 0)::numeric / 
          NULLIF(SUM(c."montanteSolicitado"), 0)::numeric * 100), 
          2
        ) AS numeric) as taxa_aprovacao
      FROM candidaturas c
      INNER JOIN avisos a ON c."avisoId" = a.id
      WHERE c."montanteSolicitado" IS NOT NULL
      GROUP BY a.portal
    `;

    // 5. Previsão de montantes aprovados (baseado em candidaturas em análise)
    const previsaoMontantes = await prisma.$queryRaw<any[]>`
      SELECT 
        COUNT(*) as candidaturas_em_analise,
        COALESCE(SUM("montanteSolicitado"), 0) as valor_em_analise,
        CAST(ROUND(
          (COALESCE(SUM("montanteSolicitado"), 0)::numeric * 0.7::numeric), 
          2
        ) AS numeric) as previsao_aprovacao
      FROM candidaturas
      WHERE estado IN ('SUBMETIDA', 'EM_ANALISE')
    `;

    // 6. Comparação ano-a-ano
    const comparacaoAnoAno = await prisma.$queryRaw<any[]>`
      SELECT 
        EXTRACT(YEAR FROM "createdAt") as ano,
        COUNT(*) as total_candidaturas,
        COALESCE(SUM("montanteSolicitado"), 0) as valor_total,
        COUNT(CASE WHEN estado = 'APROVADA' THEN 1 END) as aprovadas
      FROM candidaturas
      WHERE "createdAt" >= NOW() - INTERVAL '3 years'
      GROUP BY ano
      ORDER BY ano DESC
    `;

    // 7. Distribuição de candidaturas por dimensão de empresa
    const candidaturasPorDimensao = await prisma.$queryRaw<any[]>`
      SELECT 
        e.dimensao,
        COUNT(c.id) as total_candidaturas,
        COUNT(CASE WHEN c.estado = 'APROVADA' THEN 1 END) as aprovadas,
        COALESCE(SUM(c."montanteSolicitado"), 0) as valor_solicitado,
        COALESCE(SUM(c."montanteAprovado"), 0) as valor_aprovado
      FROM candidaturas c
      INNER JOIN empresas e ON c."empresaId" = e.id
      GROUP BY e.dimensao
      ORDER BY total_candidaturas DESC
    `;

    // 8. Top 10 empresas por valor aprovado
    const topEmpresasAprovado = await prisma.$queryRaw<any[]>`
      SELECT 
        e.nome,
        e.nipc,
        COUNT(c.id) as total_candidaturas,
        COALESCE(SUM(c."montanteAprovado"), 0) as valor_aprovado
      FROM candidaturas c
      INNER JOIN empresas e ON c."empresaId" = e.id
      WHERE c."montanteAprovado" IS NOT NULL
      GROUP BY e.id, e.nome, e.nipc
      ORDER BY valor_aprovado DESC
      LIMIT 10
    `;

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
        candidaturasPorStatus: candidaturasPorEstado.map(c => ({
          status: c.estado,
          total: c._count.estado,
        })),
        avisosPorPortal: avisosPorPortal.map(a => ({
          portal: a.portal,
          total: a._count.portal,
        })),
        candidaturasPorMes: (candidaturasPorMes as any[]).map((m: any) => ({
          mes: m.mes,
          total: Number(m.total),
        })),
        topEmpresas: empresasProcessadas.slice(0, 5).map(e => ({
          ...e,
          valorTotal: Number(e.valorTotal),
          candidaturas: e.candidaturas.map((c: any) => ({
            ...c,
            montanteSolicitado: Number(c.montanteSolicitado || 0),
          })),
        })),
      },
      analytics: {
        taxaSucessoPorPortal: taxaSucessoPorPortal.map((t: any) => ({
          portal: t.portal,
          totalCandidaturas: Number(t.total_candidaturas),
          aprovadas: Number(t.aprovadas),
          taxaSucesso: Number(t.taxa_sucesso || 0),
        })),
        taxaSucessoPorPrograma: taxaSucessoPorPrograma.map((t: any) => ({
          programa: t.programa,
          totalCandidaturas: Number(t.total_candidaturas),
          aprovadas: Number(t.aprovadas),
          taxaSucesso: Number(t.taxa_sucesso || 0),
        })),
        tempoMedioCandidatura: Number(tempoMedioCandidatura[0]?.tempo_medio_dias || 0),
        roiPorPortal: roiPorPortal.map((r: any) => ({
          portal: r.portal,
          totalSolicitado: Number(r.total_solicitado),
          totalAprovado: Number(r.total_aprovado),
          taxaAprovacao: Number(r.taxa_aprovacao || 0),
        })),
        previsaoMontantes: {
          candidaturasEmAnalise: Number(previsaoMontantes[0]?.candidaturas_em_analise || 0),
          valorEmAnalise: Number(previsaoMontantes[0]?.valor_em_analise || 0),
          previsaoAprovacao: Number(previsaoMontantes[0]?.previsao_aprovacao || 0),
        },
        comparacaoAnoAno: comparacaoAnoAno.map((c: any) => ({
          ano: Number(c.ano),
          totalCandidaturas: Number(c.total_candidaturas),
          valorTotal: Number(c.valor_total),
          aprovadas: Number(c.aprovadas),
        })),
        candidaturasPorDimensao: candidaturasPorDimensao.map((d: any) => ({
          dimensao: d.dimensao,
          totalCandidaturas: Number(d.total_candidaturas),
          aprovadas: Number(d.aprovadas),
          valorSolicitado: Number(d.valor_solicitado),
          valorAprovado: Number(d.valor_aprovado),
        })),
        topEmpresasAprovado: topEmpresasAprovado.map((e: any) => ({
          nome: e.nome,
          nipc: e.nipc,
          totalCandidaturas: Number(e.total_candidaturas),
          valorAprovado: Number(e.valor_aprovado),
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
