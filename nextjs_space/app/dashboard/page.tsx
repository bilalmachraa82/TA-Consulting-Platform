
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { DashboardHome } from '@/components/dashboard/dashboard-home'

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/login')
  }

  // Fetch dashboard data
  const [avisos, empresas, candidaturas, documentos, workflows, notificacoes] = await Promise.all([
    prisma.aviso.findMany({
      where: { ativo: true },
      orderBy: { dataFimSubmissao: 'asc' },
      take: 10,
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
  const avisos7Dias = avisos.filter(aviso => {
    const diasRestantes = Math.ceil((aviso.dataFimSubmissao.getTime() - now.getTime()) / (1000 * 3600 * 24))
    return diasRestantes <= 7 && diasRestantes > 0
  }).length

  const candidaturasEmCurso = candidaturas.filter(c => 
    ['A_PREPARAR', 'SUBMETIDA', 'EM_ANALISE'].includes(c.estado)
  ).length

  const taxaSucesso = candidaturas.length > 0 
    ? Math.round((candidaturas.filter(c => c.estado === 'APROVADA').length / candidaturas.length) * 100)
    : 0

  const documentosExpirados = documentos.filter(doc => 
    doc.statusValidade === 'EXPIRADO' || doc.statusValidade === 'A_EXPIRAR'
  ).length

  return (
    <DashboardHome
      kpis={{
        totalAvisos: avisos.length,
        avisosUrgentes: avisos7Dias,
        candidaturasEmCurso,
        taxaSucesso,
        documentosExpirados,
      }}
      avisos={avisos}
      candidaturas={candidaturas}
      notificacoes={notificacoes}
      workflows={workflows}
    />
  )
}
