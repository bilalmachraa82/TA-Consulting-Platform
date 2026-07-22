
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { candidaturaScope } from '@/lib/auth/tenant'

export const dynamic = "force-dynamic"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const candidatura = await prisma.candidatura.findFirst({
      where: { AND: [{ id: params.id }, candidaturaScope(session)] },
      include: {
        empresa: true,
        aviso: true
      }
    })

    if (!candidatura) {
      return NextResponse.json({ error: 'Candidatura não encontrada' }, { status: 404 })
    }

    return NextResponse.json(candidatura)

  } catch (error) {
    console.error('Erro ao buscar candidatura:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    // Confirma que a candidatura é do tenant antes de atualizar.
    const existente = await prisma.candidatura.findFirst({
      where: { AND: [{ id: params.id }, candidaturaScope(session)] },
      select: { id: true },
    })
    if (!existente) {
      return NextResponse.json({ error: 'Candidatura não encontrada' }, { status: 404 })
    }

    const candidaturaAtualizada = await prisma.candidatura.update({
      where: { id: params.id },
      data: {
        montanteSolicitado: data.montanteSolicitado,
        montanteAprovado: data.montanteAprovado,
        observacoes: data.observacoes,
        documentosAnexos: data.documentosAnexos || []
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
    console.error('Erro ao atualizar candidatura:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
