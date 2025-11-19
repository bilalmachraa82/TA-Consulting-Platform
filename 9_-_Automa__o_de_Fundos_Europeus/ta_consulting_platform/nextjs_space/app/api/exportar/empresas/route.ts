
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/exportar/empresas?formato=csv|json
// Exportar empresas para CSV ou JSON
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const formato = searchParams.get('formato') || 'csv';

    const empresas = await prisma.empresa.findMany({
      where: { ativa: true },
      include: {
        candidaturas: {
          select: {
            estado: true,
            montanteSolicitado: true,
            montanteAprovado: true,
          },
        },
      },
      orderBy: { nome: 'asc' },
    });

    // Calcular estatísticas por empresa
    const dados = empresas.map((e) => {
      const totalCandidaturas = e.candidaturas.length;
      const aprovadas = e.candidaturas.filter((c) => c.estado === 'APROVADA').length;
      const valorSolicitado = e.candidaturas.reduce((acc, c) => acc + (c.montanteSolicitado || 0), 0);
      const valorAprovado = e.candidaturas.reduce((acc, c) => acc + (c.montanteAprovado || 0), 0);

      return {
        ...e,
        totalCandidaturas,
        aprovadas,
        valorSolicitado,
        valorAprovado,
        taxaSucesso: totalCandidaturas > 0 ? ((aprovadas / totalCandidaturas) * 100).toFixed(2) : 0,
      };
    });

    if (formato === 'json') {
      return NextResponse.json({
        success: true,
        total: dados.length,
        dados,
      });
    }

    // Gerar CSV
    const csvHeader = 'Nome,NIPC,Setor,Dimensão,Total Candidaturas,Aprovadas,Taxa Sucesso (%),Valor Solicitado,Valor Aprovado,Email,Telefone\n';
    const csvRows = dados.map((e) => {
      return [
        `"${e.nome}"`,
        e.nipc,
        `"${e.setor}"`,
        e.dimensao,
        e.totalCandidaturas,
        e.aprovadas,
        e.taxaSucesso,
        e.valorSolicitado.toFixed(2),
        e.valorAprovado.toFixed(2),
        e.email,
        e.telefone || '-',
      ].join(',');
    }).join('\n');

    const csv = csvHeader + csvRows;

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="empresas_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Erro ao exportar empresas:', error);
    return NextResponse.json(
      { error: 'Erro ao exportar empresas' },
      { status: 500 }
    );
  }
}
