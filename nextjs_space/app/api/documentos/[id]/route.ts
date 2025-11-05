
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

    const data = await request.json()

    const documento = await prisma.documento.findUnique({
      where: { id: params.id }
    })

    if (!documento) {
      return NextResponse.json({ error: 'Documento não encontrado' }, { status: 404 })
    }

    const documentoAtualizado = await prisma.documento.update({
      where: { id: params.id },
      data: {
        nome: data.nome || documento.nome,
        dataEmissao: data.dataEmissao ? new Date(data.dataEmissao) : documento.dataEmissao,
        dataValidade: data.dataValidade ? new Date(data.dataValidade) : documento.dataValidade,
        statusValidade: data.statusValidade || documento.statusValidade,
        observacoes: data.observacoes || documento.observacoes
      },
      include: {
        empresa: {
          select: {
            nome: true,
            nipc: true,
            dimensao: true
          }
        }
      }
    })

    return NextResponse.json(documentoAtualizado)

  } catch (error) {
    console.error('Erro ao atualizar documento:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.documento.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Documento removido com sucesso' })

  } catch (error) {
    console.error('Erro ao remover documento:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
