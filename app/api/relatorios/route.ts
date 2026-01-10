
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
    const periodo = searchParams.get('periodo') || 'mes' // mes, trimestre, ano
    const ano = parseInt(searchParams.get('ano') || new Date().getFullYear().toString())
    const mes = parseInt(searchParams.get('mes') || (new Date().getMonth() + 1).toString())

    // Calcular período de análise
    let dataInicio: Date
    let dataFim: Date

    if (periodo === 'mes') {
      dataInicio = new Date(ano, mes - 1, 1)
      dataFim = new Date(ano, mes, 0, 23, 59, 59)
    } else if (periodo === 'trimestre') {
      const trimestreInicio = Math.floor((mes - 1) / 3) * 3
      dataInicio = new Date(ano, trimestreInicio, 1)
      dataFim = new Date(ano, trimestreInicio + 3, 0, 23, 59, 59)
    } else { // ano
      dataInicio = new Date(ano, 0, 1)
      dataFim = new Date(ano, 11, 31, 23, 59, 59)
    }

    // Buscar dados estatísticos
    const [
      avisos,
      candidaturas,
      empresas,
      documentos,
      workflows
    ] = await Promise.all([
      prisma.aviso.findMany({
        where: {
          createdAt: {
            gte: dataInicio,
            lte: dataFim
          }
        }
      }),
      prisma.candidatura.findMany({
        where: {
          createdAt: {
            gte: dataInicio,
            lte: dataFim
          }
        },
        include: {
          empresa: {
            select: { nome: true, setor: true }
          },
          aviso: {
            select: { portal: true, programa: true }
          }
        }
      }),
      prisma.empresa.findMany({
        where: {
          createdAt: {
            gte: dataInicio,
            lte: dataFim
          }
        }
      }),
      prisma.documento.findMany({
        where: {
          createdAt: {
            gte: dataInicio,
            lte: dataFim
          }
        }
      }),
      prisma.workflowLog.findMany({
        where: {
          dataExecucao: {
            gte: dataInicio,
            lte: dataFim
          }
        },
        include: {
          workflow: {
            select: { nome: true, tipo: true }
          }
        }
      })
    ])

    // Calcular KPIs principais
    type AvisoType = typeof avisos[number];
    type CandidaturaType = typeof candidaturas[number];
    type WorkflowLogType = typeof workflows[number];

    const kpis = {
      totalAvisos: avisos.length,
      avisosUrgentes: avisos.filter((aviso: AvisoType) => {
        const diasRestantes = Math.ceil((aviso.dataFimSubmissao.getTime() - new Date().getTime()) / (1000 * 3600 * 24))
        return diasRestantes <= 7 && diasRestantes > 0
      }).length,
      totalCandidaturas: candidaturas.length,
      candidaturasAprovadas: candidaturas.filter((c: CandidaturaType) => c.estado === 'APROVADA').length,
      taxaAprovacao: candidaturas.length > 0
        ? Math.round((candidaturas.filter((c: CandidaturaType) => c.estado === 'APROVADA').length / candidaturas.length) * 100)
        : 0,
      montanteTotal: candidaturas
        .filter((c: CandidaturaType) => c.estado === 'APROVADA')
        .reduce((sum: number, c: CandidaturaType) => sum + (c.montanteAprovado || 0), 0),
      novasEmpresas: empresas.length,
      documentosAdicionados: documentos.length,
      execucoesWorkflow: workflows.length,
      sucessoWorkflows: workflows.length > 0
        ? Math.round((workflows.filter((w: WorkflowLogType) => w.sucesso).length / workflows.length) * 100)
        : 0
    }

    // Dados para gráficos

    // 1. Evolução mensal de avisos
    const evolucaoAvisos = []
    for (let i = 0; i < 12; i++) {
      const mesData = new Date(ano, i, 1)
      const proximoMes = new Date(ano, i + 1, 0, 23, 59, 59)
      const avisosDoMes = await prisma.aviso.count({
        where: {
          createdAt: {
            gte: mesData,
            lte: proximoMes
          }
        }
      })
      evolucaoAvisos.push({
        mes: mesData.toLocaleDateString('pt-PT', { month: 'short' }),
        avisos: avisosDoMes
      })
    }

    // 2. Distribuição por portal
    const distribuicaoPortal = await prisma.aviso.groupBy({
      by: ['portal'],
      _count: { portal: true },
      where: {
        createdAt: {
          gte: dataInicio,
          lte: dataFim
        }
      }
    })

    // 3. Candidaturas por estado
    const candidaturasPorEstado = await prisma.candidatura.groupBy({
      by: ['estado'],
      _count: { estado: true },
      where: {
        createdAt: {
          gte: dataInicio,
          lte: dataFim
        }
      }
    })

    // 4. Top 5 empresas por candidaturas
    const topEmpresas = await prisma.candidatura.groupBy({
      by: ['empresaId'],
      _count: { empresaId: true },
      where: {
        createdAt: {
          gte: dataInicio,
          lte: dataFim
        }
      },
      orderBy: {
        _count: {
          empresaId: 'desc'
        }
      },
      take: 5
    })

    // Obter nomes das empresas
    type TopEmpresaItem = { empresaId: string; _count: { empresaId: number } };
    const empresasInfo = await prisma.empresa.findMany({
      where: {
        id: { in: topEmpresas.map((e: TopEmpresaItem) => e.empresaId) }
      },
      select: { id: true, nome: true }
    })

    type EmpresaInfoItem = { id: string; nome: string };
    const topEmpresasComNomes = topEmpresas.map((item: TopEmpresaItem) => {
      const empresa = empresasInfo.find((e: EmpresaInfoItem) => e.id === item.empresaId)
      return {
        nome: empresa?.nome || 'Empresa não encontrada',
        candidaturas: item._count.empresaId
      }
    })

    // 5. ROI e montantes por programa
    const montantesPorPrograma = await prisma.candidatura.findMany({
      where: {
        estado: 'APROVADA',
        createdAt: {
          gte: dataInicio,
          lte: dataFim
        }
      },
      include: {
        aviso: {
          select: { programa: true }
        }
      }
    })

    type MontanteItem = typeof montantesPorPrograma[number];
    const programas: { [key: string]: number } = {}
    montantesPorPrograma.forEach((candidatura: MontanteItem) => {
      const programa = candidatura.aviso.programa
      if (!programas[programa]) {
        programas[programa] = 0
      }
      programas[programa] += candidatura.montanteAprovado || 0
    })

    const roiPorPrograma = Object.entries(programas).map(([programa, montante]) => ({
      programa,
      montante,
      candidaturas: montantesPorPrograma.filter((c: MontanteItem) => c.aviso.programa === programa).length
    }))

    return NextResponse.json({
      periodo: {
        tipo: periodo,
        dataInicio: dataInicio.toISOString(),
        dataFim: dataFim.toISOString(),
        ano,
        mes
      },
      kpis,
      graficos: {
        evolucaoAvisos,
        distribuicaoPortal: distribuicaoPortal.map((item: { portal: string; _count: { portal: number } }) => ({
          portal: item.portal,
          count: item._count.portal
        })),
        candidaturasPorEstado: candidaturasPorEstado.map((item: { estado: string; _count: { estado: number } }) => ({
          estado: item.estado,
          count: item._count.estado
        })),
        topEmpresas: topEmpresasComNomes,
        roiPorPrograma
      }
    })

  } catch (error) {
    console.error('Erro ao gerar relatórios:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
