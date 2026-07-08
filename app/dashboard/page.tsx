import { requireSession } from '@/lib/auth-guard'
import { prisma } from '@/lib/db'
import { DashboardHome } from '@/components/dashboard/dashboard-home'

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  await requireSession('/dashboard')

  // Fetch dashboard data
  const [avisos, empresas, candidaturas, documentos, workflows, notificacoes] = await Promise.all([
    prisma.aviso.findMany({
      where: { ativo: true },
      orderBy: { dataFimSubmissao: 'asc' },
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
  const now = new Date()
  type AvisoType = typeof avisos[number];
  type CandidaturaType = typeof candidaturas[number];
  type DocumentoType = typeof documentos[number];

  const avisos7Dias = avisos.filter((aviso: AvisoType) => {
    const diasRestantes = Math.ceil((aviso.dataFimSubmissao.getTime() - now.getTime()) / (1000 * 3600 * 24))
    return diasRestantes <= 7 && diasRestantes > 0
  }).length

  const candidaturasEmCurso = candidaturas.filter((c: CandidaturaType) =>
    ['A_PREPARAR', 'SUBMETIDA', 'EM_ANALISE'].includes(c.estado)
  ).length

  const taxaSucesso = candidaturas.length > 0
    ? Math.round((candidaturas.filter((c: CandidaturaType) => c.estado === 'APROVADA').length / candidaturas.length) * 100)
    : 0

  const documentosExpirados = documentos.filter((doc: DocumentoType) =>
    doc.statusValidade === 'EXPIRADO' || doc.statusValidade === 'A_EXPIRAR'
  ).length

  // Métricas calculadas a partir dos dados reais já buscados acima
  const contagemPorEstado = candidaturas.reduce<Record<string, number>>((acc, c: CandidaturaType) => {
    acc[c.estado] = (acc[c.estado] || 0) + 1
    return acc
  }, {})

  const contagemPorPortal = avisos.reduce<Record<string, number>>((acc, a: AvisoType) => {
    acc[a.portal] = (acc[a.portal] || 0) + 1
    return acc
  }, {})

  const contagemPorMes = candidaturas.reduce<Record<string, number>>((acc, c: CandidaturaType) => {
    const mes = c.createdAt.toISOString().slice(0, 7)
    acc[mes] = (acc[mes] || 0) + 1
    return acc
  }, {})

  const candidaturasPorEmpresa = candidaturas.reduce<Record<string, number>>((acc, c: CandidaturaType) => {
    acc[c.empresaId] = (acc[c.empresaId] || 0) + 1
    return acc
  }, {})

  const metricas = {
    resumo: {
      totalAvisos: avisos.length,
      totalEmpresas: empresas.length,
      totalCandidaturas: candidaturas.length,
      totalDocumentos: documentos.length,
      avisosUrgentes: avisos7Dias,
      orcamentoDisponivel: avisos.reduce((sum: number, a: AvisoType) => sum + (a.montanteMaximo || 0), 0),
      valorSolicitado: candidaturas.reduce((sum: number, c: CandidaturaType) => sum + (c.montanteSolicitado || 0), 0),
      lastUpdated: new Date().toISOString()
    },
    graficos: {
      candidaturasPorStatus: Object.entries(contagemPorEstado).map(([status, total]) => ({ status, total })),
      avisosPorPortal: Object.entries(contagemPorPortal).map(([portal, total]) => ({ portal, total })),
      candidaturasPorMes: Object.entries(contagemPorMes).sort().slice(-6).map(([mes, total]) => ({ mes, total })),
      topEmpresas: empresas
        .map(e => ({ id: e.id, nome: e.nome, setor: e.setor, totalCandidaturas: candidaturasPorEmpresa[e.id] || 0 }))
        .sort((a, b) => b.totalCandidaturas - a.totalCandidaturas)
        .slice(0, 5)
    },
    source: 'database'
  }

  return (
    <DashboardHome
      kpis={{
        totalAvisos: avisos.length,
        avisosUrgentes: avisos7Dias,
        candidaturasEmCurso,
        taxaSucesso,
        documentosExpirados,
      }}
      avisos={avisos.slice(0, 10)}
      candidaturas={candidaturas}
      notificacoes={notificacoes}
      workflows={workflows}
      metricas={metricas}
    />
  )
}
