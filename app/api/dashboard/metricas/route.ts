import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dataProvider, isPrismaAvailable, prisma } from '@/lib/db';
import {
  getCachedMetricas,
  getCachedAvisosUrgentes,
  getCachedOrcamentoDisponivel,
  getCachedAvisosPorPortal,
} from '@/lib/cache';
import { candidaturaScope, empresaScope } from '@/lib/auth/tenant';

// Top empresas é por-tenant → dinâmico, sem cache partilhada de CDN.
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Auth guard - métricas são dados de negócio
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Buscar dados com cache
    const [cachedMetricas, avisosUrgentes, orcamentoDisponivel, avisosPorPortal] = await Promise.all([
      getCachedMetricas(),
      getCachedAvisosUrgentes(),
      getCachedOrcamentoDisponivel(),
      getCachedAvisosPorPortal(),
    ]);

    // Top empresas — scoped por tenant (o cache global expunha nomes de clientes de outros tenants).
    const topGroups = await prisma.candidatura.groupBy({
      by: ['empresaId'],
      _count: { empresaId: true },
      where: candidaturaScope(session),
      orderBy: { _count: { empresaId: 'desc' } },
      take: 5,
    });
    const topInfo = await prisma.empresa.findMany({
      where: { AND: [empresaScope(session), { id: { in: topGroups.map((g: { empresaId: string }) => g.empresaId) } }] },
      select: { id: true, nome: true },
    });
    const topEmpresas = topGroups.map((g: { empresaId: string; _count: { empresaId: number } }) => ({
      nome: topInfo.find((e: { id: string; nome: string }) => e.id === g.empresaId)?.nome || 'Empresa',
      candidaturas: g._count.empresaId,
    }));

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
      headers: { 'Cache-Control': 'private, no-store' }
    });
  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar métricas', details: String(error) },
      { status: 500 }
    );
  }
}
