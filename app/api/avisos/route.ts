
import { NextRequest, NextResponse } from 'next/server'
import { prisma, dataProvider, isPrismaAvailable } from '@/lib/db'

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    // Allow unauthenticated access for demo purposes
    const { searchParams } = new URL(request.url)

    // Filtros
    const portal = searchParams.get('portal')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    let avisos: any[] = []
    let total = 0

    // Use data provider directly (works without Prisma)
    const where: any = { ativo: true }
    if (portal && portal !== 'TODOS') {
      where.portal = portal
    }

    avisos = await dataProvider.avisos.findMany({
      where,
      orderBy: { dataFimSubmissao: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    })

    total = await dataProvider.avisos.count({ where })

    // Calcular dias restantes para cada aviso
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

    return NextResponse.json({
      avisos: avisosComDias,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      },
      source: isPrismaAvailable() ? 'database' : 'json-files'
    })

  } catch (error) {
    console.error('Erro ao buscar avisos:', error)
    return NextResponse.json({ error: 'Internal Server Error', details: String(error) }, { status: 500 })
  }
}

// Criar novo aviso
export async function POST(request: NextRequest) {
  try {
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

    return NextResponse.json(avisoAtualizado)

  } catch (error) {
    console.error('Erro ao atualizar aviso:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// Eliminar aviso (soft delete)
export async function DELETE(request: NextRequest) {
  try {
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

    return NextResponse.json({ message: 'Aviso desativado com sucesso' })

  } catch (error) {
    console.error('Erro ao eliminar aviso:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
