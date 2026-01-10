
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
    const aviso = searchParams.get('aviso')
    const empresa = searchParams.get('empresa')
    const estado = searchParams.get('estado')

    const where: any = {}

    if (aviso) {
      where.avisoId = aviso
    }

    if (empresa) {
      where.empresaId = empresa
    }

    if (estado) {
      where.estado = estado
    }

    const candidaturas = await prisma.candidatura.findMany({
      where,
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
      },
      orderBy: { updatedAt: 'desc' }
    })

    // Agrupar por estado para o kanban
    type CandidaturaWithRelations = typeof candidaturas[number];
    const kanbanData = {
      A_PREPARAR: candidaturas.filter((c: CandidaturaWithRelations) => c.estado === 'A_PREPARAR'),
      SUBMETIDA: candidaturas.filter((c: CandidaturaWithRelations) => c.estado === 'SUBMETIDA'),
      EM_ANALISE: candidaturas.filter((c: CandidaturaWithRelations) => c.estado === 'EM_ANALISE'),
      APROVADA: candidaturas.filter((c: CandidaturaWithRelations) => c.estado === 'APROVADA'),
      REJEITADA: candidaturas.filter((c: CandidaturaWithRelations) => c.estado === 'REJEITADA')
    }

    return NextResponse.json({
      candidaturas,
      kanban: kanbanData
    })

  } catch (error) {
    console.error('Erro ao buscar candidaturas:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    if (!data.empresaId || !data.avisoId) {
      return NextResponse.json({ error: 'Empresa e Aviso são obrigatórios' }, { status: 400 })
    }

    // Verificar se já existe candidatura para esta empresa neste aviso
    const candidaturaExistente = await prisma.candidatura.findFirst({
      where: {
        empresaId: data.empresaId,
        avisoId: data.avisoId
      }
    })

    if (candidaturaExistente) {
      return NextResponse.json({ error: 'Já existe candidatura desta empresa para este aviso' }, { status: 409 })
    }

    const novaCandidatura = await prisma.candidatura.create({
      data: {
        empresaId: data.empresaId,
        avisoId: data.avisoId,
        estado: 'A_PREPARAR',
        montanteSolicitado: data.montanteSolicitado || 0,
        observacoes: data.observacoes || '',
        documentosAnexos: data.documentosAnexos || [],
        timeline: [
          {
            data: new Date().toISOString(),
            evento: 'Candidatura criada',
            detalhes: 'Candidatura iniciada no sistema TA Consulting'
          }
        ]
      },
      include: {
        empresa: true,
        aviso: true
      }
    })

    return NextResponse.json(novaCandidatura, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar candidatura:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
