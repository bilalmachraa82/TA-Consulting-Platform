
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isPrismaAvailable, prisma } from '@/lib/db'
import { revalidateEmpresas } from '@/lib/revalidate'
import { Prisma, DimensaoEmpresa } from '@prisma/client'
import { empresaScope } from '@/lib/auth/tenant'

// Dados por-tenant → dinâmico, sem cache partilhada (o CDN não pode servir
// as empresas de um consultor a outro).
export const dynamic = 'force-dynamic'

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
    const setor = searchParams.get('setor')
    const search = (searchParams.get('search') || '').trim()
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')))

    // Scoping por tenant: cada consultor vê as suas empresas (+ legacy sem dono);
    // admin vê tudo. Sem isto, a lista devolvia as empresas de todos os clientes.
    const session = await getServerSession(authOptions)

    // Query paginada direta (o cache com take:100 quebrava a paginação além da
    // página 2 e ignorava os filtros setor/search que o componente envia).
    const and: Prisma.EmpresaWhereInput[] = [{ ativa: true }, empresaScope(session)]
    if (dimensao && dimensao !== 'TODOS') and.push({ dimensao: dimensao as DimensaoEmpresa })
    if (regiao && regiao !== 'TODOS') and.push({ regiao })
    if (setor && setor !== 'TODOS') and.push({ setor: { contains: setor, mode: 'insensitive' } })
    if (search) {
      and.push({
        OR: [
          { nome: { contains: search, mode: 'insensitive' } },
          { nipc: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      })
    }
    const where: Prisma.EmpresaWhereInput = { AND: and }

    const [empresas, total] = await Promise.all([
      prisma.empresa.findMany({
        where,
        orderBy: { nome: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.empresa.count({ where }),
    ])

    return NextResponse.json({
      empresas,
      pagination: { total, pages: Math.ceil(total / limit), page, limit },
      source: 'database',
    }, { headers: { 'Cache-Control': 'private, no-store' } })

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
        // Dono = consultor que cria. Fecha a fuga "linhas nascem sem dono".
        consultorId: authResult.session!.user.id,
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
