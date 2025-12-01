import { NextRequest, NextResponse } from 'next/server';
import { dataProvider, isPrismaAvailable } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Use data provider for metrics
    const metrics = await dataProvider.metrics.get();

    const avisos = await dataProvider.avisos.findMany({ where: { ativo: true } });
    const empresas = await dataProvider.empresas.findMany({});

    // Calculate derived metrics
    const now = new Date();
    const avisosUrgentes = avisos.filter(a => {
      const diasRestantes = Math.ceil((new Date(a.dataFimSubmissao).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diasRestantes <= 14 && diasRestantes > 0;
    }).length;

    const orcamentoDisponivel = avisos.reduce((sum, a) => sum + (a.montanteMaximo || 0), 0);

    // Group by portal
    const avisosPorPortal = [
      { portal: 'PORTUGAL2030', total: avisos.filter(a => a.portal === 'PORTUGAL2030').length },
      { portal: 'PEPAC', total: avisos.filter(a => a.portal === 'PEPAC').length },
      { portal: 'PRR', total: avisos.filter(a => a.portal === 'PRR').length },
    ];

    // Simulated candidaturas data for demo
    const candidaturasPorStatus = [
      { status: 'A_PREPARAR', total: 3 },
      { status: 'SUBMETIDA', total: 2 },
      { status: 'EM_ANALISE', total: 4 },
      { status: 'APROVADA', total: 5 },
      { status: 'REJEITADA', total: 1 },
    ];

    // Simulated monthly data
    const candidaturasPorMes = [
      { mes: '2025-11', total: 4 },
      { mes: '2025-10', total: 6 },
      { mes: '2025-09', total: 3 },
      { mes: '2025-08', total: 5 },
      { mes: '2025-07', total: 2 },
      { mes: '2025-06', total: 4 },
    ];

    // Top empresas with random values for demo
    const topEmpresas = empresas.slice(0, 5).map(e => ({
      id: e.id,
      nome: e.nome,
      setor: e.setor,
      valorTotal: Math.floor(Math.random() * 1000000) + 100000,
      totalCandidaturas: Math.floor(Math.random() * 5) + 1,
    })).sort((a, b) => b.valorTotal - a.valorTotal);

    return NextResponse.json({
      resumo: {
        totalAvisos: avisos.length,
        totalEmpresas: empresas.length,
        totalCandidaturas: 15, // Demo value
        totalDocumentos: 8, // Demo value
        avisosUrgentes,
        orcamentoDisponivel,
        valorSolicitado: 4750000, // Demo value
      },
      graficos: {
        candidaturasPorStatus,
        avisosPorPortal,
        candidaturasPorMes,
        topEmpresas,
      },
      source: isPrismaAvailable() ? 'database' : 'json-files'
    });
  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar métricas', details: String(error) },
      { status: 500 }
    );
  }
}
