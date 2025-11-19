
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

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

    const empresa = await prisma.empresa.findUnique({
      where: { id: params.id },
      include: {
        candidaturas: {
          include: {
            aviso: {
              select: { nome: true, portal: true, programa: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        documentos: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!empresa) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    }

    return NextResponse.json(empresa)

  } catch (error) {
    console.error('Erro ao buscar empresa:', error)
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

    // Verificar se empresa existe
    const empresaExistente = await prisma.empresa.findUnique({
      where: { id: params.id }
    })

    if (!empresaExistente) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    }

    // Se NIPC foi alterado, verificar se não existe outro com o mesmo NIPC
    if (data.nipc && data.nipc !== empresaExistente.nipc) {
      const nipcExiste = await prisma.empresa.findUnique({
        where: { nipc: data.nipc }
      })

      if (nipcExiste) {
        return NextResponse.json({ error: 'NIPC já existe na base de dados' }, { status: 409 })
      }
    }

    const empresaAtualizada = await prisma.empresa.update({
      where: { id: params.id },
      data: {
        nome: data.nome || empresaExistente.nome,
        nipc: data.nipc || empresaExistente.nipc,
        cae: data.cae || empresaExistente.cae,
        setor: data.setor || empresaExistente.setor,
        dimensao: data.dimensao || empresaExistente.dimensao,
        email: data.email || empresaExistente.email,
        telefone: data.telefone || empresaExistente.telefone,
        morada: data.morada || empresaExistente.morada,
        localidade: data.localidade || empresaExistente.localidade,
        codigoPostal: data.codigoPostal || empresaExistente.codigoPostal,
        distrito: data.distrito || empresaExistente.distrito,
        regiao: data.regiao || empresaExistente.regiao,
        contactoNome: data.contactoNome || empresaExistente.contactoNome,
        contactoEmail: data.contactoEmail || empresaExistente.contactoEmail,
        contactoTelefone: data.contactoTelefone || empresaExistente.contactoTelefone,
        notas: data.notas || empresaExistente.notas,
        ativa: data.ativa !== undefined ? data.ativa : empresaExistente.ativa
      }
    })

    return NextResponse.json(empresaAtualizada)

  } catch (error) {
    console.error('Erro ao atualizar empresa:', error)
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

    // Soft delete - marcar como inativa
    const empresa = await prisma.empresa.update({
      where: { id: params.id },
      data: { ativa: false }
    })

    return NextResponse.json({ message: 'Empresa desativada com sucesso', empresa })

  } catch (error) {
    console.error('Erro ao desativar empresa:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
