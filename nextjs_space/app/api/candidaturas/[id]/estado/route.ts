
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { novoEstado, observacoes } = await request.json()

    if (!novoEstado) {
      return NextResponse.json({ error: 'Novo estado é obrigatório' }, { status: 400 })
    }

    // Validar estados possíveis
    const estadosValidos = ['A_PREPARAR', 'SUBMETIDA', 'EM_ANALISE', 'APROVADA', 'REJEITADA', 'CANCELADA']
    if (!estadosValidos.includes(novoEstado)) {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
    }

    // Buscar candidatura atual
    const candidaturaAtual = await prisma.candidatura.findUnique({
      where: { id: params.id }
    })

    if (!candidaturaAtual) {
      return NextResponse.json({ error: 'Candidatura não encontrada' }, { status: 404 })
    }

    // Preparar timeline entry
    const estadosNomes = {
      A_PREPARAR: 'Em Preparação',
      SUBMETIDA: 'Submetida',
      EM_ANALISE: 'Em Análise',
      APROVADA: 'Aprovada',
      REJEITADA: 'Rejeitada',
      CANCELADA: 'Cancelada'
    }

    const novoEventoTimeline = {
      data: new Date().toISOString(),
      evento: `Estado alterado para ${estadosNomes[novoEstado as keyof typeof estadosNomes]}`,
      detalhes: observacoes || `Candidatura marcada como ${estadosNomes[novoEstado as keyof typeof estadosNomes].toLowerCase()}`
    }

    // Atualizar candidatura
    const candidaturaAtualizada = await prisma.candidatura.update({
      where: { id: params.id },
      data: {
        estado: novoEstado,
        observacoes: observacoes || candidaturaAtual.observacoes,
        timeline: [
          ...(candidaturaAtual.timeline as any[]),
          novoEventoTimeline
        ],
        dataSubmissao: novoEstado === 'SUBMETIDA' && candidaturaAtual.estado === 'A_PREPARAR' 
          ? new Date() 
          : candidaturaAtual.dataSubmissao,
        dataDecisao: ['APROVADA', 'REJEITADA'].includes(novoEstado) && !candidaturaAtual.dataDecisao
          ? new Date()
          : candidaturaAtual.dataDecisao
      },
      include: {
        empresa: {
          select: {
            nome: true,
            nipc: true,
            setor: true,
            dimensao: true
          }
        },
        aviso: {
          select: {
            nome: true,
            portal: true,
            programa: true,
            codigo: true,
            dataFimSubmissao: true,
            montanteMaximo: true
          }
        }
      }
    })

    return NextResponse.json(candidaturaAtualizada)

  } catch (error) {
    console.error('Erro ao atualizar estado da candidatura:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
