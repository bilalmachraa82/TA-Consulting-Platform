import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dataProvider, isPrismaAvailable } from '@/lib/db';
import {
  getCachedMetricas,
  getCachedAvisosUrgentes,
  getCachedOrcamentoDisponivel,
  getCachedAvisosPorPortal,
  getCachedTopEmpresas,
  getCacheHeaders
} from '@/lib/cache';

// Cache: Revalida a cada 1 minuto para métricas
export const revalidate = 60;

export async function GET(request: NextRequest) {
  try {
    // Auth guard - métricas são dados de negócio
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Buscar dados com cache
    const [cachedMetricas, avisosUrgentes, orcamentoDisponivel, avisosPorPortal, topEmpresas] = await Promise.all([
      getCachedMetricas(),
      getCachedAvisosUrgentes(),
      getCachedOrcamentoDisponivel(),
      getCachedAvisosPorPortal(),
      getCachedTopEmpresas(5)
    ]);

    // Buscar avisos e empresas adicionais para cálculos específicos
    const avisos = await dataProvider.avisos.findMany({ where: { ativo: true } });
    const empresas = await dataProvider.empresas.findMany({});

    // Dados simulados para demo (estas partes não mudam com frequência)
    const candidaturasPorStatus = [
      { status: 'A_PREPARAR', total: 3 },
      { status: 'SUBMETIDA', total: 2 },
      { status: 'EM_ANALISE', total: 4 },
      { status: 'APROVADA', total: 5 },
      { status: 'REJEITADA', total: 1 },
    ];

    const candidaturasPorMes = [
      { mes: '2025-11', total: 4 },
      { mes: '2025-10', total: 6 },
      { mes: '2025-09', total: 3 },
      { mes: '2025-08', total: 5 },
      { mes: '2025-07', total: 2 },
      { mes: '2025-06', total: 4 },
    ];

    return NextResponse.json({
      resumo: {
        totalAvisos: cachedMetricas.totalAvisos,
        totalEmpresas: cachedMetricas.totalEmpresas,
        totalCandidaturas: cachedMetricas.totalCandidaturas,
        totalDocumentos: 8, // Demo value
        avisosUrgentes: avisosUrgentes.length,
        orcamentoDisponivel,
        valorSolicitado: 4750000, // Demo value
        lastUpdated: cachedMetricas.timestamp
      },
      graficos: {
        candidaturasPorStatus,
        avisosPorPortal,
        candidaturasPorMes,
        topEmpresas,
      },
      source: isPrismaAvailable() ? 'database' : 'json-files'
    }, {
      headers: getCacheHeaders(30, 60) // Cache: 30s, SWR: 1min
    });
  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar métricas', details: String(error) },
      { status: 500 }
    );
  }
}
