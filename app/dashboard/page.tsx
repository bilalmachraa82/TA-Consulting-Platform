import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { DashboardHome } from '@/components/dashboard/dashboard-home'

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/auth/login?callbackUrl=/dashboard')
  }

  const now = new Date()
  // "Aberto" = a fonte diz ativo E (prazo futuro OU por confirmar). O NULL
  // existe porque há portais que não publicam o prazo na listagem.
  const abertoWhere = {
    ativo: true,
    OR: [{ dataFimSubmissao: null }, { dataFimSubmissao: { gte: now } }],
  }
  const daqui7Dias = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  // Fetch dashboard data
  const [avisos, totalAvisosAbertos, avisos7Dias, avisosPorPortalRaw, candidaturasPorEstadoRaw, empresas, candidaturas, documentos, workflows, notificacoes] = await Promise.all([
    // lista curta para o painel
    prisma.aviso.findMany({
      where: abertoWhere,
      orderBy: { dataFimSubmissao: 'asc' },
      take: 10,
    }),
    // COUNT real: a contagem tem de vir da BD, não do tamanho da página
    // (o dashboard mostrava "10 avisos ativos" existindo centenas)
    prisma.aviso.count({ where: abertoWhere }),
    prisma.aviso.count({
      where: { ativo: true, dataFimSubmissao: { gte: now, lte: daqui7Dias } },
    }),
    // distribuição real por portal (substitui números de demo hardcoded)
    prisma.aviso.groupBy({
      by: ['portal'],
      where: abertoWhere,
      _count: { _all: true },
    }),
    prisma.candidatura.groupBy({
      by: ['estado'],
      _count: { _all: true },
    }),
    prisma.empresa.findMany({
      where: { ativa: true },
    }),
    prisma.candidatura.findMany({
      include: {
        empresa: true,
        aviso: true,
      },
    }),
    prisma.documento.findMany({
      include: {
        empresa: true,
      },
    }),
    prisma.workflow.findMany({
      where: { ativo: true },
    }),
    prisma.notificacao.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  // Calculate KPIs
  type CandidaturaType = typeof candidaturas[number];
  type DocumentoType = typeof documentos[number];

  const candidaturasEmCurso = candidaturas.filter((c: CandidaturaType) =>
    ['A_PREPARAR', 'SUBMETIDA', 'EM_ANALISE'].includes(c.estado)
  ).length

  const taxaSucesso = candidaturas.length > 0
    ? Math.round((candidaturas.filter((c: CandidaturaType) => c.estado === 'APROVADA').length / candidaturas.length) * 100)
    : 0

  const documentosExpirados = documentos.filter((doc: DocumentoType) =>
    doc.statusValidade === 'EXPIRADO' || doc.statusValidade === 'A_EXPIRAR'
  ).length

  // Fetch metricas no servidor
  // FIX: Using port 3005 to match the current dev server instance
  // const metricasResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3005'}/api/dashboard/metricas`, {
  //   cache: 'no-store'
  // })
  // const metricas = metricasResponse.ok ? await metricasResponse.json() : null

  // Métricas dos gráficos: tudo o que é contagem vem da BD. As séries que ainda
  // não têm origem real (evolução mensal, orçamento) ficam vazias em vez de
  // inventadas — um gráfico vazio é honesto, um gráfico com números fabricados
  // destrói a confiança de quem está a ver.
  const PORTAL_LABEL: Record<string, string> = {
    PORTUGAL2030: 'Portugal 2030',
    PRR: 'PRR',
    PEPAC: 'PEPAC',
    HORIZON_EUROPE: 'Horizon Europe',
    EUROPA_CRIATIVA: 'Europa Criativa',
    IPDJ: 'IPDJ',
    BASE_GOV: 'BASE.gov',
    DIGITAL_EUROPE: 'Digital Europe',
    LIFE: 'LIFE',
    FUNDO_AMBIENTAL: 'Fundo Ambiental',
  }

  const metricas = {
    resumo: {
      totalAvisos: totalAvisosAbertos,
      totalEmpresas: empresas.length,
      totalCandidaturas: candidaturas.length,
      totalDocumentos: documentos.length,
      avisosUrgentes: avisos7Dias,
      orcamentoDisponivel: 0,
      valorSolicitado: 0,
      lastUpdated: new Date().toISOString()
    },
    graficos: {
      candidaturasPorStatus: candidaturasPorEstadoRaw
        .map((c) => ({ status: String(c.estado), total: c._count._all }))
        .sort((a, b) => b.total - a.total),
      avisosPorPortal: avisosPorPortalRaw
        .map((a) => ({ portal: PORTAL_LABEL[String(a.portal)] ?? String(a.portal), total: a._count._all }))
        .sort((a, b) => b.total - a.total),
      // sem série histórica real ainda — melhor vazio do que inventado
      candidaturasPorMes: [] as { mes: string; total: number }[],
      // contagem real de candidaturas por empresa (era "2" fixo para todas)
      topEmpresas: empresas.slice(0, 5).map(e => ({
        id: e.id,
        nome: e.nome,
        setor: e.setor,
        totalCandidaturas: candidaturas.filter((c: { empresaId: string }) => c.empresaId === e.id).length,
      }))
    },
    source: 'demo-bypassed'
  }

  return (
    <DashboardHome
      kpis={{
        totalAvisos: totalAvisosAbertos,
        avisosUrgentes: avisos7Dias,
        candidaturasEmCurso,
        taxaSucesso,
        documentosExpirados,
      }}
      avisos={avisos}
      candidaturas={candidaturas}
      notificacoes={notificacoes}
      workflows={workflows}
      metricas={metricas}
    />
  )
}
