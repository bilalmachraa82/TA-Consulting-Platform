import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { EmpresasClientWrapper } from '@/components/dashboard/empresas-client-wrapper'

export const dynamic = "force-dynamic"

export const metadata = {
  title: 'Empresas Clientes - TA Consulting',
  description: 'Gestão de empresas clientes e perfis de elegibilidade',
}

async function getEmpresasIniciais(searchParams: Promise<{ [key: string]: string | string[] | undefined }>) {
  const params = await searchParams
  const dimensao = params.dimensao as string || 'TODOS'
  const regiao = params.regiao as string || 'TODOS'
  const page = parseInt(params.page as string || '1')
  const limit = 50

  const where: any = { ativa: true }
  if (dimensao && dimensao !== 'TODOS') {
    where.dimensao = dimensao
  }
  if (regiao && regiao !== 'TODOS') {
    where.regiao = regiao
  }

  const [empresas, total] = await Promise.all([
    prisma.empresa.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.empresa.count({ where })
  ])

  const empresasEnriquecidas = empresas.map((empresa) => ({
    ...empresa,
    estatisticas: {
      totalCandidaturas: Math.floor(Math.random() * 5),
      candidaturasAprovadas: Math.floor(Math.random() * 3),
      totalFinanciamento: Math.floor(Math.random() * 500000),
      documentosExpirados: Math.floor(Math.random() * 2)
    }
  }))

  return {
    empresas: empresasEnriquecidas,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      page,
      limit
    }
  }
}

export default async function EmpresasPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // DEMO MODE: Auth disabled for demo
  // const session = await getServerSession(authOptions)
  // if (!session) {
  //   redirect('/auth/login')
  // }

  const initialData = await getEmpresasIniciais(searchParams)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Empresas Clientes</h1>
        <p className="text-gray-600 mt-2">
          Gerencie o portfólio de empresas e perfis de elegibilidade
        </p>
      </div>

      <EmpresasClientWrapper
        initialData={initialData}
        initialFiltros={{
          pesquisa: '',
          setor: 'TODOS',
          dimensao: 'TODOS',
          regiao: 'TODOS',
          page: 1
        }}
      />
    </div>
  )
}
