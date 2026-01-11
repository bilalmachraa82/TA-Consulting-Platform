
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isPrismaAvailable, prisma } from '@/lib/db'
import { getCachedEmpresasWithFilters, getCachedEmpresasCount, getCacheHeaders } from '@/lib/cache'
import { revalidateEmpresas } from '@/lib/revalidate'

// Cache: Revalida a cada 5 minutos para GET
export const revalidate = 300

// POST continua dinâmico

// Helper para verificar permissões de escrita
async function checkWritePermission() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return { authorized: false, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  if (session.user.role !== 'admin' && session.user.role !== 'consultor') {
    return { authorized: false, error: NextResponse.json({ error: 'Forbidden: requires admin or consultor role' }, { status: 403 }) }
  }
  return { authorized: true, session }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dimensao = searchParams.get('dimensao')
    const regiao = searchParams.get('regiao')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const showAll = searchParams.get('all') === 'true'

    // Buscar empresas com cache
    const allEmpresas = await getCachedEmpresasWithFilters({
      dimensao: dimensao || undefined,
      regiao: regiao || undefined,
      showAll
    })

    // Paginar em memória
    const start = (page - 1) * limit
    const end = start + limit
    const paginatedEmpresas = allEmpresas.slice(start, end)

    // Buscar total com cache
    const total = await getCachedEmpresasCount()

    return NextResponse.json({
      empresas: paginatedEmpresas,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      },
      source: isPrismaAvailable() ? 'database' : 'json-files'
    }, {
      headers: getCacheHeaders(60, 300) // Cache: 1min, SWR: 5min
    })

  } catch (error) {
    console.error('Erro ao buscar empresas:', error)
    return NextResponse.json({ error: 'Internal Server Error', details: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Auth guard - apenas admin/consultor
    const authResult = await checkWritePermission()
    if (!authResult.authorized) return authResult.error

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

    // Revalidar cache após criação
    revalidateEmpresas()

    return NextResponse.json(novaEmpresa, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar empresa:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
