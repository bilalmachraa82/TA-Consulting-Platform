
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/exportar/analytics
// Exportar estatísticas e analytics para CSV
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar analytics
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

    // Combinar dados
    const dados = taxaSucessoPorPortal.map((t: any) => {
      const roi = roiPorPortal.find((r: any) => r.portal === t.portal);
      return {
        portal: t.portal,
        totalCandidaturas: Number(t.total_candidaturas),
        aprovadas: Number(t.aprovadas),
        taxaSucesso: Number(t.taxa_sucesso || 0),
        totalSolicitado: Number(roi?.total_solicitado || 0),
        totalAprovado: Number(roi?.total_aprovado || 0),
        taxaAprovacao: Number(roi?.taxa_aprovacao || 0),
      };
    });

    // Gerar CSV
    const csvHeader = 'Portal,Total Candidaturas,Aprovadas,Taxa Sucesso (%),Valor Solicitado,Valor Aprovado,Taxa Aprovação (%)\n';
    const csvRows = dados.map((d) => {
      return [
        d.portal,
        d.totalCandidaturas,
        d.aprovadas,
        d.taxaSucesso,
        d.totalSolicitado.toFixed(2),
        d.totalAprovado.toFixed(2),
        d.taxaAprovacao,
      ].join(',');
    }).join('\n');

    const csv = csvHeader + csvRows;

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="analytics_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Erro ao exportar analytics:', error);
    return NextResponse.json(
      { error: 'Erro ao exportar analytics' },
      { status: 500 }
    );
  }
}
