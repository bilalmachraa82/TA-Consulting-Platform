
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
    const avisosComDias = avisos.map(aviso => {
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
