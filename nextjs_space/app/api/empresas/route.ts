
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
    const pesquisa = searchParams.get('pesquisa')
    const setor = searchParams.get('setor')
    const dimensao = searchParams.get('dimensao')
    const regiao = searchParams.get('regiao')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = { ativa: true }

    if (pesquisa) {
      where.OR = [
        { nome: { contains: pesquisa, mode: 'insensitive' } },
        { nipc: { contains: pesquisa, mode: 'insensitive' } },
        { email: { contains: pesquisa, mode: 'insensitive' } }
      ]
    }

    if (setor && setor !== 'TODOS') {
      where.setor = { contains: setor, mode: 'insensitive' }
    }

    if (dimensao && dimensao !== 'TODOS') {
      where.dimensao = dimensao
    }

    if (regiao && regiao !== 'TODOS') {
      where.regiao = { contains: regiao, mode: 'insensitive' }
    }

    const [empresas, total] = await Promise.all([
      prisma.empresa.findMany({
        where,
        orderBy: { nome: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          candidaturas: {
            select: { 
              id: true, 
              estado: true,
              montanteSolicitado: true,
              montanteAprovado: true
            }
          },
          documentos: {
            select: {
              id: true,
              statusValidade: true,
              tipoDocumento: true
            }
          }
        }
      }),
      prisma.empresa.count({ where })
    ])

    // Enriquecer dados das empresas
    type EmpresaWithRelations = typeof empresas[number];
    type CandidaturaItem = { id: string; estado: string; montanteSolicitado: number | null; montanteAprovado: number | null };
    type DocumentoItem = { id: string; statusValidade: string; tipoDocumento: string };

    const empresasEnriquecidas = empresas.map((empresa: EmpresaWithRelations) => {
      const candidaturasAprovadas = empresa.candidaturas.filter((c: CandidaturaItem) => c.estado === 'APROVADA')
      const totalFinanciamento = candidaturasAprovadas.reduce((sum: number, c: CandidaturaItem) => sum + (c.montanteAprovado || 0), 0)

      const documentosExpirados = empresa.documentos.filter((d: DocumentoItem) =>
        d.statusValidade === 'EXPIRADO' || d.statusValidade === 'A_EXPIRAR'
      ).length

      return {
        ...empresa,
        estatisticas: {
          totalCandidaturas: empresa.candidaturas.length,
          candidaturasAprovadas: candidaturasAprovadas.length,
          totalFinanciamento,
          documentosExpirados
        }
      }
    })

    return NextResponse.json({
      empresas: empresasEnriquecidas,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      }
    })

  } catch (error) {
    console.error('Erro ao buscar empresas:', error)
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

    // Validações básicas
    if (!data.nome || !data.nipc || !data.email) {
      return NextResponse.json({ error: 'Campos obrigatórios: nome, nipc, email' }, { status: 400 })
    }

    // Verificar se NIPC já existe
    const empresaExistente = await prisma.empresa.findUnique({
      where: { nipc: data.nipc }
    })

    if (empresaExistente) {
      return NextResponse.json({ error: 'NIPC já existe na base de dados' }, { status: 409 })
    }

    const novaEmpresa = await prisma.empresa.create({
      data: {
        nome: data.nome,
        nipc: data.nipc,
        cae: data.cae || '',
        setor: data.setor || '',
        dimensao: data.dimensao || 'MICRO',
        email: data.email,
        telefone: data.telefone || '',
        morada: data.morada || '',
        localidade: data.localidade || '',
        codigoPostal: data.codigoPostal || '',
        distrito: data.distrito || '',
        regiao: data.regiao || '',
        contactoNome: data.contactoNome || '',
        contactoEmail: data.contactoEmail || '',
        contactoTelefone: data.contactoTelefone || '',
        notas: data.notas || ''
      }
    })

    return NextResponse.json(novaEmpresa, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar empresa:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
