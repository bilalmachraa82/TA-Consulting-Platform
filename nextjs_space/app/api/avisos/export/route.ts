
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

    const { avisoIds, formato } = await request.json()

    // Buscar avisos selecionados
    const avisos = await prisma.aviso.findMany({
      where: {
        id: { in: avisoIds },
        ativo: true
      },
      orderBy: { dataFimSubmissao: 'asc' }
    })

    const now = new Date()

    interface AvisoExport {
      nome: string;
      portal: string;
      programa: string;
      codigo: string;
      dataInicioSubmissao: Date;
      dataFimSubmissao: Date;
      montanteMinimo: number | null;
      montanteMaximo: number | null;
      taxa: string | null;
      regiao: string | null;
      setoresElegiveis: string[];
      link: string | null;
    }

    const dadosExport = avisos.map((aviso: AvisoExport) => {
      const diasRestantes = Math.ceil((aviso.dataFimSubmissao.getTime() - now.getTime()) / (1000 * 3600 * 24))
      
      return {
        Nome: aviso.nome,
        Portal: aviso.portal,
        Programa: aviso.programa,
        Código: aviso.codigo,
        'Data Início': aviso.dataInicioSubmissao.toLocaleDateString('pt-PT'),
        'Data Fim': aviso.dataFimSubmissao.toLocaleDateString('pt-PT'),
        'Dias Restantes': diasRestantes > 0 ? diasRestantes : 'Expirado',
        'Montante Mín.': aviso.montanteMinimo ? `€${aviso.montanteMinimo.toLocaleString('pt-PT')}` : 'N/A',
        'Montante Máx.': aviso.montanteMaximo ? `€${aviso.montanteMaximo.toLocaleString('pt-PT')}` : 'N/A',
        Taxa: aviso.taxa || 'N/A',
        Região: aviso.regiao || 'Nacional',
        'Setores Elegíveis': aviso.setoresElegiveis.join('; '),
        Link: aviso.link || ''
      }
    })

    if (formato === 'excel') {
      // Para Excel, retornamos os dados estruturados
      return NextResponse.json({
        dados: dadosExport,
        filename: `avisos_${new Date().toISOString().split('T')[0]}.xlsx`,
        success: true
      })
    } else {
      // Para CSV, retornamos uma string CSV
      const headers = Object.keys(dadosExport[0] || {})
      const csvContent = [
        headers.join(','),
        ...dadosExport.map((row: Record<string, string | number>) =>
          headers.map(header =>
            typeof row[header] === 'string' && row[header].toString().includes(',')
              ? `"${row[header]}"`
              : row[header]
          ).join(',')
        )
      ].join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename=avisos_${new Date().toISOString().split('T')[0]}.csv`
        }
      })
    }

  } catch (error) {
    console.error('Erro ao exportar avisos:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
