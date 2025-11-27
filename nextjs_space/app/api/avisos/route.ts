
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    
    // Filtros
    const portal = searchParams.get('portal')
    const programa = searchParams.get('programa') 
    const diasMin = searchParams.get('diasMin')
    const diasMax = searchParams.get('diasMax')
    const pesquisa = searchParams.get('pesquisa')
    const sortBy = searchParams.get('sortBy') || 'dataFimSubmissao'
    const sortOrder = searchParams.get('sortOrder') || 'asc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Construir filtros Prisma
    const where: any = { ativo: true }
    
    if (portal && portal !== 'TODOS') {
      where.portal = portal
    }
    
    if (programa && programa !== 'TODOS') {
      where.programa = { contains: programa, mode: 'insensitive' }
    }
    
    if (pesquisa) {
      where.OR = [
        { nome: { contains: pesquisa, mode: 'insensitive' } },
        { codigo: { contains: pesquisa, mode: 'insensitive' } },
        { descrição: { contains: pesquisa, mode: 'insensitive' } }
      ]
    }

    // Filtro por dias restantes
    if (diasMin || diasMax) {
      const now = new Date()
      
      if (diasMin) {
        const dateMin = new Date(now.getTime() + parseInt(diasMin) * 24 * 60 * 60 * 1000)
        where.dataFimSubmissao = { ...where.dataFimSubmissao, gte: dateMin }
      }
      
      if (diasMax) {
        const dateMax = new Date(now.getTime() + parseInt(diasMax) * 24 * 60 * 60 * 1000)
        where.dataFimSubmissao = { ...where.dataFimSubmissao, lte: dateMax }
      }
    }

    // Buscar avisos com paginação
    const [avisos, total] = await Promise.all([
      prisma.aviso.findMany({
        where,
        orderBy: { [sortBy]: sortOrder === 'desc' ? 'desc' : 'asc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          candidaturas: {
            select: { id: true }
          }
        }
      }),
      prisma.aviso.count({ where })
    ])

    // Calcular dias restantes para cada aviso
    const now = new Date()
    const avisosComDias = avisos.map((aviso: { dataFimSubmissao: Date; candidaturas: { id: string }[] } & Record<string, unknown>) => {
      const diasRestantes = Math.ceil((aviso.dataFimSubmissao.getTime() - now.getTime()) / (1000 * 3600 * 24))
      
      return {
        ...aviso,
        diasRestantes,
        urgencia: diasRestantes <= 7 ? 'alta' : diasRestantes <= 15 ? 'media' : 'baixa',
        totalCandidaturas: aviso.candidaturas.length
      }
    })

    return NextResponse.json({
      avisos: avisosComDias,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      }
    })

  } catch (error) {
    console.error('Erro ao buscar avisos:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// Criar novo aviso
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    // Validações obrigatórias
    if (!data.nome || !data.portal || !data.codigo || !data.dataInicioSubmissao || !data.dataFimSubmissao) {
      return NextResponse.json({
        error: 'Campos obrigatórios: nome, portal, codigo, dataInicioSubmissao, dataFimSubmissao'
      }, { status: 400 })
    }

    // Verificar se código já existe
    const avisoExistente = await prisma.aviso.findFirst({
      where: { codigo: data.codigo }
    })

    if (avisoExistente) {
      return NextResponse.json({ error: 'Já existe um aviso com este código' }, { status: 409 })
    }

    const novoAviso = await prisma.aviso.create({
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
        descrição: data.descricao || null,
        link: data.link || null,
        taxa: data.taxa || null,
        regiao: data.regiao || null,
        setoresElegiveis: data.setoresElegiveis || [],
        dimensaoEmpresa: data.dimensaoEmpresa || [],
        urgente: data.urgente || false,
        ativo: true
      }
    })

    return NextResponse.json(novoAviso, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar aviso:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// Atualizar aviso existente
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    if (!data.id) {
      return NextResponse.json({ error: 'ID do aviso é obrigatório' }, { status: 400 })
    }

    // Verificar se aviso existe
    const avisoExistente = await prisma.aviso.findUnique({
      where: { id: data.id }
    })

    if (!avisoExistente) {
      return NextResponse.json({ error: 'Aviso não encontrado' }, { status: 404 })
    }

    const avisoAtualizado = await prisma.aviso.update({
      where: { id: data.id },
      data: {
        nome: data.nome ?? avisoExistente.nome,
        portal: data.portal ?? avisoExistente.portal,
        programa: data.programa ?? avisoExistente.programa,
        linha: data.linha !== undefined ? data.linha : avisoExistente.linha,
        codigo: data.codigo ?? avisoExistente.codigo,
        dataInicioSubmissao: data.dataInicioSubmissao ? new Date(data.dataInicioSubmissao) : avisoExistente.dataInicioSubmissao,
        dataFimSubmissao: data.dataFimSubmissao ? new Date(data.dataFimSubmissao) : avisoExistente.dataFimSubmissao,
        montanteMinimo: data.montanteMinimo !== undefined ? parseFloat(data.montanteMinimo) : avisoExistente.montanteMinimo,
        montanteMaximo: data.montanteMaximo !== undefined ? parseFloat(data.montanteMaximo) : avisoExistente.montanteMaximo,
        descrição: data.descricao !== undefined ? data.descricao : avisoExistente.descrição,
        link: data.link !== undefined ? data.link : avisoExistente.link,
        taxa: data.taxa !== undefined ? data.taxa : avisoExistente.taxa,
        regiao: data.regiao !== undefined ? data.regiao : avisoExistente.regiao,
        setoresElegiveis: data.setoresElegiveis ?? avisoExistente.setoresElegiveis,
        dimensaoEmpresa: data.dimensaoEmpresa ?? avisoExistente.dimensaoEmpresa,
        urgente: data.urgente ?? avisoExistente.urgente,
        ativo: data.ativo ?? avisoExistente.ativo
      }
    })

    return NextResponse.json(avisoAtualizado)

  } catch (error) {
    console.error('Erro ao atualizar aviso:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// Eliminar aviso (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID do aviso é obrigatório' }, { status: 400 })
    }

    // Verificar se aviso existe
    const avisoExistente = await prisma.aviso.findUnique({
      where: { id },
      include: { candidaturas: { select: { id: true } } }
    })

    if (!avisoExistente) {
      return NextResponse.json({ error: 'Aviso não encontrado' }, { status: 404 })
    }

    // Soft delete - marcar como inativo
    await prisma.aviso.update({
      where: { id },
      data: { ativo: false }
    })

    return NextResponse.json({
      message: 'Aviso desativado com sucesso',
      candidaturasAfetadas: avisoExistente.candidaturas.length
    })

  } catch (error) {
    console.error('Erro ao eliminar aviso:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
