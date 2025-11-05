
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
    const portal = searchParams.get('portal')
    const programa = searchParams.get('programa')
    const mes = searchParams.get('mes') // YYYY-MM format
    const view = searchParams.get('view') || 'calendario' // calendario or lista

    // Construir filtros
    const where: any = { ativo: true }
    
    if (portal && portal !== 'TODOS') {
      where.portal = portal
    }
    
    if (programa && programa !== 'TODOS') {
      where.programa = { contains: programa, mode: 'insensitive' }
    }

    // Filtro por mês se especificado
    if (mes) {
      const [year, month] = mes.split('-').map(Number)
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0, 23, 59, 59)
      
      where.OR = [
        {
          dataInicioSubmissao: {
            gte: startDate,
            lte: endDate
          }
        },
        {
          dataFimSubmissao: {
            gte: startDate,
            lte: endDate
          }
        }
      ]
    }

    const avisos = await prisma.aviso.findMany({
      where,
      orderBy: { dataFimSubmissao: 'asc' },
      include: {
        candidaturas: {
          select: { id: true, estado: true }
        }
      }
    })

    // Processar avisos para incluir dias restantes
    const now = new Date()
    const eventosCalendario = avisos.flatMap(aviso => {
      const diasRestantes = Math.ceil((aviso.dataFimSubmissao.getTime() - now.getTime()) / (1000 * 3600 * 24))
      
      const eventos = []
      
      // Evento de início
      eventos.push({
        id: `${aviso.id}-inicio`,
        avisoId: aviso.id,
        tipo: 'inicio',
        titulo: `📅 Início: ${aviso.nome}`,
        data: aviso.dataInicioSubmissao,
        aviso: {
          nome: aviso.nome,
          codigo: aviso.codigo,
          portal: aviso.portal,
          programa: aviso.programa,
          montanteMaximo: aviso.montanteMaximo,
          link: aviso.link
        },
        diasRestantes,
        urgencia: diasRestantes <= 7 ? 'alta' : diasRestantes <= 15 ? 'media' : 'baixa',
        candidaturas: aviso.candidaturas.length
      })

      // Evento de fim (deadline)
      eventos.push({
        id: `${aviso.id}-fim`,
        avisoId: aviso.id,
        tipo: 'deadline',
        titulo: `⏰ Deadline: ${aviso.nome}`,
        data: aviso.dataFimSubmissao,
        aviso: {
          nome: aviso.nome,
          codigo: aviso.codigo,
          portal: aviso.portal,
          programa: aviso.programa,
          montanteMaximo: aviso.montanteMaximo,
          link: aviso.link
        },
        diasRestantes,
        urgencia: diasRestantes <= 7 ? 'alta' : diasRestantes <= 15 ? 'media' : 'baixa',
        candidaturas: aviso.candidaturas.length
      })

      return eventos
    })

    // Se for vista de calendário, agrupar por data
    if (view === 'calendario') {
      const eventosPorData: { [key: string]: any[] } = {}
      
      eventosCalendario.forEach(evento => {
        const dataKey = evento.data.toISOString().split('T')[0]
        if (!eventosPorData[dataKey]) {
          eventosPorData[dataKey] = []
        }
        eventosPorData[dataKey].push(evento)
      })

      return NextResponse.json({
        view: 'calendario',
        eventosPorData,
        totalEventos: eventosCalendario.length
      })
    } else {
      // Vista de lista - ordenada por data de deadline
      const eventosOrdenados = eventosCalendario
        .filter(evento => evento.tipo === 'deadline')
        .sort((a, b) => a.data.getTime() - b.data.getTime())

      return NextResponse.json({
        view: 'lista',
        eventos: eventosOrdenados,
        totalEventos: eventosOrdenados.length
      })
    }

  } catch (error) {
    console.error('Erro ao buscar eventos do calendário:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
