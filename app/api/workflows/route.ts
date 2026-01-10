
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

    const workflows = await prisma.workflow.findMany({
      include: {
        logs: {
          orderBy: { dataExecucao: 'desc' },
          take: 10 // Últimos 10 logs
        }
      },
      orderBy: { nome: 'asc' }
    })

    // Enriquecer workflows com estatísticas
    type WorkflowWithLogs = typeof workflows[number];
    type LogItem = { sucesso: boolean; dataExecucao: Date };

    const workflowsEnriquecidos = workflows.map((workflow: WorkflowWithLogs) => {
      const logsRecentes = workflow.logs.slice(0, 5)
      const totalExecucoes = workflow.logs.length
      const execucoesSucesso = workflow.logs.filter((log: LogItem) => log.sucesso).length
      const taxaSucesso = totalExecucoes > 0 ? Math.round((execucoesSucesso / totalExecucoes) * 100) : 0

      return {
        ...workflow,
        estatisticas: {
          totalExecucoes,
          execucoesSucesso,
          taxaSucesso,
          ultimaExecucaoSucesso: workflow.logs.find((log: LogItem) => log.sucesso)?.dataExecucao || null
        },
        logsRecentes
      }
    })

    return NextResponse.json({
      workflows: workflowsEnriquecidos
    })

  } catch (error) {
    console.error('Erro ao buscar workflows:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { workflowId, acao, ...dadosAtualizacao } = await request.json()

    if (!workflowId || !acao) {
      return NextResponse.json({ error: 'workflowId e acao são obrigatórios' }, { status: 400 })
    }

    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId }
    })

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow não encontrado' }, { status: 404 })
    }

    let dadosAtualizados = {}

    switch (acao) {
      case 'toggle':
        dadosAtualizados = { ativo: !workflow.ativo }
        break
      
      case 'atualizar_frequencia':
        if (!dadosAtualizacao.frequencia) {
          return NextResponse.json({ error: 'Frequência é obrigatória' }, { status: 400 })
        }
        dadosAtualizados = { 
          frequencia: dadosAtualizacao.frequencia,
          proximaExecucao: calcularProximaExecucao(dadosAtualizacao.frequencia)
        }
        break
      
      case 'executar_manual':
        // Simular execução manual
        await criarLogExecucao(workflowId, true, 'Execução manual realizada com sucesso')
        dadosAtualizados = { 
          ultimaExecucao: new Date(),
          proximaExecucao: calcularProximaExecucao(workflow.frequencia)
        }
        break
      
      case 'atualizar_parametros':
        dadosAtualizados = { 
          parametros: dadosAtualizacao.parametros || workflow.parametros
        }
        break
      
      default:
        return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
    }

    const workflowAtualizado = await prisma.workflow.update({
      where: { id: workflowId },
      data: dadosAtualizados,
      include: {
        logs: {
          orderBy: { dataExecucao: 'desc' },
          take: 10
        }
      }
    })

    return NextResponse.json(workflowAtualizado)

  } catch (error) {
    console.error('Erro ao atualizar workflow:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// Função auxiliar para calcular próxima execução
function calcularProximaExecucao(frequencia: string): Date {
  const agora = new Date()
  
  // Parsing básico de cron (simplificado)
  if (frequencia === '0 */6 * * *') { // A cada 6 horas
    return new Date(agora.getTime() + 6 * 60 * 60 * 1000)
  } else if (frequencia === '0 9 * * *') { // Diariamente às 9h
    const proxima = new Date(agora)
    proxima.setHours(9, 0, 0, 0)
    if (proxima <= agora) {
      proxima.setDate(proxima.getDate() + 1)
    }
    return proxima
  } else if (frequencia === '0 2 * * *') { // Diariamente às 2h
    const proxima = new Date(agora)
    proxima.setHours(2, 0, 0, 0)
    if (proxima <= agora) {
      proxima.setDate(proxima.getDate() + 1)
    }
    return proxima
  } else {
    // Default: próxima hora
    return new Date(agora.getTime() + 60 * 60 * 1000)
  }
}

// Função auxiliar para criar log de execução
async function criarLogExecucao(workflowId: string, sucesso: boolean, mensagem: string) {
  return await prisma.workflowLog.create({
    data: {
      workflowId,
      dataExecucao: new Date(),
      sucesso,
      mensagem,
      dados: {
        executadoManualmente: true,
        timestamp: new Date().toISOString()
      }
    }
  })
}
