
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
    const empresaId = searchParams.get('empresa')
    const tipoDocumento = searchParams.get('tipo')
    const statusValidade = searchParams.get('status')

    const where: any = {}

    if (empresaId && empresaId !== 'TODAS') {
      where.empresaId = empresaId
    }

    if (tipoDocumento && tipoDocumento !== 'TODOS') {
      where.tipoDocumento = tipoDocumento
    }

    if (statusValidade && statusValidade !== 'TODOS') {
      where.statusValidade = statusValidade
    }

    const documentos = await prisma.documento.findMany({
      where,
      include: {
        empresa: {
          select: {
            nome: true,
            nipc: true,
            dimensao: true
          }
        }
      },
      orderBy: { dataValidade: 'asc' }
    })

    // Atualizar status de validade baseado na data
    const now = new Date()
    type DocWithEmpresa = typeof documentos[number];
    const documentosAtualizados = await Promise.all(
      documentos.map(async (doc: DocWithEmpresa) => {
        if (!doc.dataValidade) return doc

        const diasParaExpirar = Math.ceil((doc.dataValidade.getTime() - now.getTime()) / (1000 * 3600 * 24))
        let novoStatus = doc.statusValidade

        if (diasParaExpirar < 0) {
          novoStatus = 'EXPIRADO'
        } else if (diasParaExpirar <= 30) {
          novoStatus = 'A_EXPIRAR'
        } else {
          novoStatus = 'VALIDO'
        }

        // Atualizar no banco se mudou
        if (novoStatus !== doc.statusValidade) {
          await prisma.documento.update({
            where: { id: doc.id },
            data: { statusValidade: novoStatus }
          })
          return { ...doc, statusValidade: novoStatus }
        }

        return doc
      })
    )

    // Estatísticas
    const stats = {
      total: documentosAtualizados.length,
      validos: documentosAtualizados.filter(d => d.statusValidade === 'VALIDO').length,
      aExpirar: documentosAtualizados.filter(d => d.statusValidade === 'A_EXPIRAR').length,
      expirados: documentosAtualizados.filter(d => d.statusValidade === 'EXPIRADO').length,
      emFalta: documentosAtualizados.filter(d => d.statusValidade === 'EM_FALTA').length
    }

    return NextResponse.json({
      documentos: documentosAtualizados,
      stats
    })

  } catch (error) {
    console.error('Erro ao buscar documentos:', error)
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

    if (!data.empresaId || !data.tipoDocumento || !data.nome) {
      return NextResponse.json({ error: 'Campos obrigatórios: empresaId, tipoDocumento, nome' }, { status: 400 })
    }

    // Simular upload - na realidade seria integrado com cloud storage
    const cloudStoragePath = `uploads/${Date.now()}-${data.nome.replace(/\s+/g, '-').toLowerCase()}`

    const novoDocumento = await prisma.documento.create({
      data: {
        empresaId: data.empresaId,
        tipoDocumento: data.tipoDocumento,
        nome: data.nome,
        cloudStoragePath,
        dataEmissao: data.dataEmissao ? new Date(data.dataEmissao) : new Date(),
        dataValidade: data.dataValidade ? new Date(data.dataValidade) : null,
        statusValidade: data.statusValidade || 'VALIDO',
        observacoes: data.observacoes || ''
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

    return NextResponse.json(novoDocumento, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar documento:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
