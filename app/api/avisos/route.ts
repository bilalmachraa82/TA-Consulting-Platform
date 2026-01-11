
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma, isPrismaAvailable } from '@/lib/db'
import { getCachedAvisosWithFilters, getCachedAvisosCount, getCacheHeaders } from '@/lib/cache'
import { revalidateAvisos } from '@/lib/revalidate'

// Cache: Revalida a cada 5 minutos para GET
export const revalidate = 300

// POST/PUT/DELETE continuam dinâmicos

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

    // Filtros
    const portal = searchParams.get('portal')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100')
    const showAll = searchParams.get('all') === 'true'

    // Buscar avisos com cache
    const allAvisos = await getCachedAvisosWithFilters({
      portal: portal || undefined,
      showAll
    })

    // Paginar em memória (já temos os dados em cache)
    const start = (page - 1) * limit
    const end = start + limit
    const paginatedAvisos = allAvisos.slice(start, end)

    // Buscar total com cache
    const total = await getCachedAvisosCount()

    return NextResponse.json({
      avisos: paginatedAvisos,
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
    console.error('Erro ao buscar avisos:', error)
    return NextResponse.json({ error: 'Internal Server Error', details: String(error) }, { status: 500 })
  }
}

// Criar novo aviso
export async function POST(request: NextRequest) {
  try {
    // Auth guard - apenas admin/consultor
    const authResult = await checkWritePermission()
    if (!authResult.authorized) return authResult.error

    const data = await request.json()

    // Validações obrigatórias
    if (!data.nome || !data.portal || !data.codigo || !data.dataInicioSubmissao || !data.dataFimSubmissao) {
      return NextResponse.json({
        error: 'Campos obrigatórios: nome, portal, codigo, dataInicioSubmissao, dataFimSubmissao'
      }, { status: 400 })
    }

    if (!isPrismaAvailable()) {
      return NextResponse.json({
        error: 'Create operations require database connection (Prisma not available in demo mode)',
        suggestion: 'Deploy to production environment with PostgreSQL'
      }, { status: 503 })
    }

    // Verificar se código já existe
    const avisoExistente = await prisma.aviso.findUnique({
      where: { codigo: data.codigo }
    })

    if (avisoExistente) {
      return NextResponse.json({ error: 'Já existe um aviso com este código' }, { status: 409 })
    }

    const novoAviso = await prisma.aviso.create!({
      data: {
        nome: data.nome,
        portal: data.portal,
        programa: data.programa || '',
        linha: data.linha || null,
        codigo: data.codigo,
        dataInicioSubmissao: new Date(data.dataInicioSubmissao),
        dataFimSubmissao: new Date(data.dataFimSubmissao),
        montanteMinimo: data.montanteMinimo ? parseFloat(data.montanteMinimo) : null,
        montanteMaximo: data.montanteMaximo ? parseFloat(data.montanteMaximo) : null,
        descricao: data.descricao || null,
        link: data.link || null,
        taxa: data.taxa || null,
        regiao: data.regiao || null,
        setoresElegiveis: data.setoresElegiveis || [],
        dimensaoEmpresa: data.dimensaoEmpresa || [],
        urgente: data.urgente || false,
        ativo: true
      }
    })

    // Revalidar cache após criação
    revalidateAvisos()

    return NextResponse.json(novoAviso, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar aviso:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// Atualizar aviso existente
export async function PUT(request: NextRequest) {
  try {
    // Auth guard - apenas admin/consultor
    const authResult = await checkWritePermission()
    if (!authResult.authorized) return authResult.error

    const data = await request.json()

    if (!data.id) {
      return NextResponse.json({ error: 'ID do aviso é obrigatório' }, { status: 400 })
    }

    if (!isPrismaAvailable()) {
      return NextResponse.json({
        error: 'Update operations require database connection',
        suggestion: 'Deploy to production environment with PostgreSQL'
      }, { status: 503 })
    }

    const avisoExistente = await prisma.aviso.findUnique({
      where: { id: data.id }
    })

    if (!avisoExistente) {
      return NextResponse.json({ error: 'Aviso não encontrado' }, { status: 404 })
    }

    const avisoAtualizado = await prisma.aviso.update!({
      where: { id: data.id },
      data: {
        nome: data.nome ?? avisoExistente.nome,
        portal: data.portal ?? avisoExistente.portal,
        programa: data.programa ?? avisoExistente.programa,
        urgente: data.urgente ?? avisoExistente.urgente,
        ativo: data.ativo ?? avisoExistente.ativo
      }
    })

    // Revalidar cache após atualização
    revalidateAvisos()

    return NextResponse.json(avisoAtualizado)

  } catch (error) {
    console.error('Erro ao atualizar aviso:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// Eliminar aviso (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    // Auth guard - apenas admin/consultor
    const authResult = await checkWritePermission()
    if (!authResult.authorized) return authResult.error

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID do aviso é obrigatório' }, { status: 400 })
    }

    if (!isPrismaAvailable()) {
      return NextResponse.json({
        error: 'Delete operations require database connection',
        suggestion: 'Deploy to production environment with PostgreSQL'
      }, { status: 503 })
    }

    const avisoExistente = await prisma.aviso.findUnique({
      where: { id }
    })

    if (!avisoExistente) {
      return NextResponse.json({ error: 'Aviso não encontrado' }, { status: 404 })
    }

    await prisma.aviso.update!({
      where: { id },
      data: { ativo: false }
    })

    // Revalidar cache após deleção
    revalidateAvisos()

    return NextResponse.json({ message: 'Aviso desativado com sucesso' })

  } catch (error) {
    console.error('Erro ao eliminar aviso:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
