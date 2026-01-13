import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { AvisosClientWrapper } from '@/components/dashboard/avisos-client-wrapper'

export const dynamic = "force-dynamic"

export const metadata = {
  title: 'Avisos & Oportunidades - TA Consulting',
  description: 'Gestão de avisos de fundos europeus e oportunidades de financiamento',
}

async function getAvisosIniciais(searchParams: Promise<{ [key: string]: string | string[] | undefined }>) {
  const params = await searchParams
  const portal = params.portal as string || 'TODOS'
  const page = parseInt(params.page as string || '1')
  const limit = 100

  const where: any = { ativo: true }
  if (portal && portal !== 'TODOS') {
    where.portal = portal
  }

  const [avisos, total] = await Promise.all([
    prisma.aviso.findMany({
      where,
      orderBy: { dataFimSubmissao: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.aviso.count({ where })
  ])

  const now = new Date()
  const avisosComDias = avisos.map((aviso) => {
    const dataFim = new Date(aviso.dataFimSubmissao)
    const diasRestantes = Math.ceil((dataFim.getTime() - now.getTime()) / (1000 * 3600 * 24))

    return {
      ...aviso,
      diasRestantes,
      urgencia: diasRestantes <= 7 ? 'alta' : diasRestantes <= 15 ? 'media' : 'baixa',
      totalCandidaturas: 0
    }
  })

  return {
    avisos: avisosComDias,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      page,
      limit
    }
  }
}

export default async function AvisosPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // DEMO MODE: Auth disabled for demo
  // const session = await getServerSession(authOptions)
  // if (!session) {
  //   redirect('/auth/login')
  // }

  const initialData = await getAvisosIniciais(searchParams)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Avisos & Oportunidades</h1>
        <p className="text-gray-600 mt-2">
          Monitorize e gerencie avisos de fundos europeus em tempo real
        </p>
      </div>

      <AvisosClientWrapper
        initialData={initialData}
        initialFiltros={{
          portal: 'TODOS',
          programa: 'TODOS',
          diasMin: 0,
          diasMax: 365,
          pesquisa: '',
          sortBy: 'dataFimSubmissao',
          sortOrder: 'asc',
          page: 1
        }}
      />
    </div>
  )
}
