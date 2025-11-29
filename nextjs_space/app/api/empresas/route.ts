
import { NextRequest, NextResponse } from 'next/server'
import { dataProvider, isPrismaAvailable, prisma } from '@/lib/db'

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dimensao = searchParams.get('dimensao')
    const regiao = searchParams.get('regiao')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = { ativa: true }

    if (dimensao && dimensao !== 'TODOS') {
      where.dimensao = dimensao
    }

    if (regiao && regiao !== 'TODOS') {
      where.regiao = regiao
    }

    // Use data provider for demo mode
    const empresas = await dataProvider.empresas.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
    })

    const total = await dataProvider.empresas.count()

    // Enrich with statistics (simulated in demo mode)
    const empresasEnriquecidas = empresas.map((empresa) => ({
      ...empresa,
      estatisticas: {
        totalCandidaturas: Math.floor(Math.random() * 5),
        candidaturasAprovadas: Math.floor(Math.random() * 3),
        totalFinanciamento: Math.floor(Math.random() * 500000),
        documentosExpirados: Math.floor(Math.random() * 2)
      }
    }))

    return NextResponse.json({
      empresas: empresasEnriquecidas,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      },
      source: isPrismaAvailable() ? 'database' : 'json-files'
    })

  } catch (error) {
    console.error('Erro ao buscar empresas:', error)
    return NextResponse.json({ error: 'Internal Server Error', details: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validações básicas
    if (!data.nome || !data.nipc || !data.email) {
      return NextResponse.json({ error: 'Campos obrigatórios: nome, nipc, email' }, { status: 400 })
    }

    if (!isPrismaAvailable()) {
      return NextResponse.json({
        error: 'Create operations require database connection',
        suggestion: 'Deploy to production environment with PostgreSQL'
      }, { status: 503 })
    }

    // Verificar se NIPC já existe
    const empresaExistente = await prisma.empresa.findUnique({
      where: { nipc: data.nipc }
    })

    if (empresaExistente) {
      return NextResponse.json({ error: 'NIPC já existe na base de dados' }, { status: 409 })
    }

    const novaEmpresa = await prisma.empresa.create!({
      data: {
        nome: data.nome,
        nipc: data.nipc,
        cae: data.cae || '',
        setor: data.setor || '',
        dimensao: data.dimensao || 'MICRO',
        email: data.email,
        telefone: data.telefone || '',
        morada: data.morada || '',
        localidade: data.localidade || '',
        codigoPostal: data.codigoPostal || '',
        distrito: data.distrito || '',
        regiao: data.regiao || '',
        contactoNome: data.contactoNome || '',
        contactoEmail: data.contactoEmail || '',
        contactoTelefone: data.contactoTelefone || '',
        notas: data.notas || ''
      }
    })

    return NextResponse.json(novaEmpresa, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar empresa:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
