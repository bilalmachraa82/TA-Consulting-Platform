
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { empresas } = await request.json()

    if (!Array.isArray(empresas) || empresas.length === 0) {
      return NextResponse.json({ error: 'Dados de empresas inválidos' }, { status: 400 })
    }

    const resultados = {
      sucesso: 0,
      erros: 0,
      detalhes: [] as any[]
    }

    // Processar cada empresa
    for (const empresaData of empresas) {
      try {
        // Validações básicas
        if (!empresaData.nome || !empresaData.nipc || !empresaData.email) {
          resultados.erros++
          resultados.detalhes.push({
            linha: resultados.sucesso + resultados.erros,
            erro: 'Campos obrigatórios em falta: nome, nipc, email',
            dados: empresaData
          })
          continue
        }

        // Verificar se NIPC já existe
        const empresaExistente = await prisma.empresa.findUnique({
          where: { nipc: empresaData.nipc }
        })

        if (empresaExistente) {
          resultados.erros++
          resultados.detalhes.push({
            linha: resultados.sucesso + resultados.erros,
            erro: `NIPC ${empresaData.nipc} já existe`,
            dados: empresaData
          })
          continue
        }

        // Criar nova empresa
        await prisma.empresa.create({
          data: {
            nome: empresaData.nome,
            nipc: empresaData.nipc,
            cae: empresaData.cae || '',
            setor: empresaData.setor || '',
            dimensao: empresaData.dimensao || 'MICRO',
            email: empresaData.email,
            telefone: empresaData.telefone || '',
            morada: empresaData.morada || '',
            localidade: empresaData.localidade || '',
            codigoPostal: empresaData.codigoPostal || '',
            distrito: empresaData.distrito || '',
            regiao: empresaData.regiao || '',
            contactoNome: empresaData.contactoNome || '',
            contactoEmail: empresaData.contactoEmail || '',
            contactoTelefone: empresaData.contactoTelefone || '',
            notas: empresaData.notas || ''
          }
        })

        resultados.sucesso++

      } catch (error) {
        resultados.erros++
        resultados.detalhes.push({
          linha: resultados.sucesso + resultados.erros,
          erro: `Erro interno: ${error}`,
          dados: empresaData
        })
      }
    }

    return NextResponse.json({
      message: `Import concluído: ${resultados.sucesso} sucessos, ${resultados.erros} erros`,
      resultados
    })

  } catch (error) {
    console.error('Erro no import de empresas:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
