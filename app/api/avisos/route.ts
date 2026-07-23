
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma, isPrismaAvailable } from '@/lib/db'
import { getCacheHeaders } from '@/lib/cache'
import { revalidateAvisos } from '@/lib/revalidate'
import { Prisma, Portal } from '@prisma/client'
import { gerarSlugAviso, slugUnico } from '@/lib/slug'

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
    const now = new Date()

    // Filtros
    const portal = searchParams.get('portal')
    const search = (searchParams.get('search') || '').trim()
    const diasMin = parseInt(searchParams.get('diasMin') || '0')
    const diasMax = parseInt(searchParams.get('diasMax') || '365')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const showAll = searchParams.get('all') === 'true'

    // Query paginada direta ao Prisma (o unstable_cache não aguentava 2168
    // avisos × 100 colunas: passava o limite de 2MB, daí a lista vinha vazia).
    // Condições combinadas com AND — cada bloco é independente para o OR de
    // texto (search) não colidir com o OR de datas.
    const and: Prisma.AvisoWhereInput[] = []
    if (portal && portal !== 'TODOS') and.push({ portal: portal as Portal })
    if (search) {
      and.push({
        OR: [
          { nome: { contains: search, mode: 'insensitive' } },
          { codigo: { contains: search, mode: 'insensitive' } },
          { descricao: { contains: search, mode: 'insensitive' } },
        ],
      })
    }
    if (!showAll) {
      // Abertos: ativo E (prazo por confirmar OU dentro da janela de dias)
      const limiteFim = new Date(now.getTime() + diasMax * 24 * 60 * 60 * 1000)
      const limiteInicio = new Date(now.getTime() + diasMin * 24 * 60 * 60 * 1000)
      and.push({ ativo: true })
      and.push({
        OR: [
          { dataFimSubmissao: null },
          { dataFimSubmissao: { gte: limiteInicio, lte: limiteFim } },
        ],
      })
    }
    const where: Prisma.AvisoWhereInput = and.length > 0 ? { AND: and } : {}

    const [avisosRaw, total] = await Promise.all([
      prisma.aviso.findMany({
        where,
        orderBy: [{ dataFimSubmissao: { sort: 'asc', nulls: 'last' } }],
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, nome: true, portal: true, programa: true, codigo: true,
          dataInicioSubmissao: true, dataFimSubmissao: true, montanteMinimo: true,
          montanteMaximo: true, link: true, regiao: true, setoresElegiveis: true,
          descricao: true, urgente: true, anexos: true,
        },
      }),
      prisma.aviso.count({ where }),
    ])

    // Enriquecer com diasRestantes e urgência (o componente lê estes campos)
    const avisos = avisosRaw.map((a) => {
      const diasRestantes = a.dataFimSubmissao
        ? Math.ceil((a.dataFimSubmissao.getTime() - now.getTime()) / (1000 * 3600 * 24))
        : null
      const urgencia = diasRestantes === null ? 'normal' : diasRestantes <= 7 ? 'alta' : diasRestantes <= 15 ? 'media' : 'normal'
      return { ...a, diasRestantes, urgencia }
    })

    return NextResponse.json({
      avisos,
      pagination: { total, pages: Math.ceil(total / limit), page, limit },
      source: 'database',
    }, { headers: getCacheHeaders(60, 300) })

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

    // slug SEO imutável, único contra a BD (fase B)
    const slugBase = gerarSlugAviso(data.nome, data.codigo);
    const usados = slugBase
        ? new Set((await prisma.aviso.findMany!({ where: { slug: { startsWith: slugBase } }, select: { slug: true } })).map((a: { slug: string | null }) => a.slug as string))
        : new Set<string>();
    const slug = slugBase ? slugUnico(slugBase, usados) : null;
    const novoAviso = await prisma.aviso.create!({
      data: {
        slug,
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
