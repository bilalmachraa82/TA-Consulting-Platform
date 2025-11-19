
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { 
  Workflow,
  Play,
  Pause,
  Settings,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  Calendar,
  Zap,
  Cog
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface WorkflowLog {
  id: string
  dataExecucao: string
  sucesso: boolean
  mensagem?: string
  dados?: any
}

interface WorkflowData {
  id: string
  nome: string
  tipo: string
  ativo: boolean
  frequencia: string
  ultimaExecucao?: string
  proximaExecucao?: string
  parametros?: any
  estatisticas: {
    totalExecucoes: number
    execucoesSucesso: number
    taxaSucesso: number
    ultimaExecucaoSucesso?: string
  }
  logsRecentes: WorkflowLog[]
}

const TIPOS_WORKFLOW = {
  SCRAPING_PORTUGAL2030: {
    nome: 'Scraping Portugal 2030',
    icone: '🔍',
    cor: 'bg-blue-100 text-blue-800'
  },
  SCRAPING_PAPAC: {
    nome: 'Scraping PAPAC',
    icone: '🌾',
    cor: 'bg-green-100 text-green-800'
  },
  SCRAPING_PRR: {
    nome: 'Scraping PRR',
    icone: '🏗️',
    cor: 'bg-purple-100 text-purple-800'
  },
  NOTIFICACAO_EMAIL: {
    nome: 'Notificações Email',
    icone: '📧',
    cor: 'bg-yellow-100 text-yellow-800'
  },
  VALIDACAO_DOCUMENTOS: {
    nome: 'Validação Documentos',
    icone: '📋',
    cor: 'bg-red-100 text-red-800'
  },
  RELATORIO_MENSAL: {
    nome: 'Relatório Mensal',
    icone: '📊',
    cor: 'bg-indigo-100 text-indigo-800'
  }
}

const FREQUENCIAS = {
  '0 */6 * * *': 'A cada 6 horas',
  '0 9 * * *': 'Diariamente às 9h',
  '0 2 * * *': 'Diariamente às 2h',
  '0 9 * * 1': 'Semanalmente (Segunda às 9h)',
  '0 9 1 * *': 'Mensalmente (dia 1 às 9h)'
}

export function WorkflowsComponent() {
  const [workflows, setWorkflows] = useState<WorkflowData[]>([])
  const [loading, setLoading] = useState(true)
  const [workflowSelecionado, setWorkflowSelecionado] = useState<WorkflowData | null>(null)
  const [modalConfiguracao, setModalConfiguracao] = useState(false)
  const [modalLogs, setModalLogs] = useState(false)

  const fetchWorkflows = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/workflows')
      if (!response.ok) throw new Error('Erro ao carregar workflows')
      
      const result = await response.json()
      setWorkflows(result.workflows)
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao carregar workflows')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkflows()
  }, [])

  const handleToggleWorkflow = async (workflowId: string) => {
    try {
      const response = await fetch('/api/workflows', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          workflowId, 
          acao: 'toggle'
        })
      })

      if (!response.ok) throw new Error('Erro ao alterar status do workflow')

      toast.success('Status do workflow alterado com sucesso')
      fetchWorkflows()
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao alterar workflow')
    }
  }

  const handleExecutarManual = async (workflowId: string) => {
    try {
      const response = await fetch('/api/workflows', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          workflowId, 
          acao: 'executar_manual'
        })
      })

      if (!response.ok) throw new Error('Erro ao executar workflow')

      toast.success('Workflow executado manualmente com sucesso')
      fetchWorkflows()
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao executar workflow')
    }
  }

  const handleAtualizarFrequencia = async (workflowId: string, novaFrequencia: string) => {
    try {
      const response = await fetch('/api/workflows', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          workflowId, 
          acao: 'atualizar_frequencia',
          frequencia: novaFrequencia
        })
      })

      if (!response.ok) throw new Error('Erro ao atualizar frequência')

      toast.success('Frequência atualizada com sucesso')
      setModalConfiguracao(false)
      fetchWorkflows()
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao atualizar frequência')
    }
  }

  const getStatusBadge = (workflow: WorkflowData) => {
    if (!workflow.ativo) {
      return (
        <Badge className="bg-gray-100 text-gray-600 border-gray-300">
          <Pause className="h-3 w-3 mr-1" />
          Inativo
        </Badge>
      )
    }

    const ultimaExecucaoSucesso = workflow.estatisticas.ultimaExecucaoSucesso
    if (!ultimaExecucaoSucesso) {
      return (
        <Badge className="bg-yellow-100 text-yellow-600 border-yellow-300">
          <Clock className="h-3 w-3 mr-1" />
          Aguardando
        </Badge>
      )
    }

    if (workflow.estatisticas.taxaSucesso >= 80) {
      return (
        <Badge className="bg-green-100 text-green-600 border-green-300">
          <CheckCircle className="h-3 w-3 mr-1" />
          Funcionando
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-red-100 text-red-600 border-red-300">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Com Problemas
        </Badge>
      )
    }
  }

  const formatarDataHora = (dataString?: string) => {
    if (!dataString) return 'Nunca'
    
    const data = new Date(dataString)
    return data.toLocaleString('pt-PT')
  }

  const calcularProximaExecucao = (ultimaExecucao?: string, frequencia?: string) => {
    if (!ultimaExecucao || !frequencia) return 'Não agendado'
    
    const ultima = new Date(ultimaExecucao)
    const agora = new Date()
    
    // Cálculo simplificado baseado na frequência
    let proximaData = new Date(ultima)
    
    if (frequencia.includes('*/6')) {
      proximaData.setHours(proximaData.getHours() + 6)
    } else if (frequencia.includes('9 * * *')) {
      proximaData.setDate(proximaData.getDate() + 1)
      proximaData.setHours(9, 0, 0, 0)
    } else if (frequencia.includes('2 * * *')) {
      proximaData.setDate(proximaData.getDate() + 1)
      proximaData.setHours(2, 0, 0, 0)
    }
    
    if (proximaData <= agora) {
      return 'Em atraso'
    }
    
    return proximaData.toLocaleString('pt-PT')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-gray-500">Carregando workflows...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas Globais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Workflows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{workflows.length}</div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {workflows.filter(w => w.ativo).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Taxa Sucesso Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {workflows.length > 0 
                ? Math.round(workflows.reduce((acc, w) => acc + w.estatisticas.taxaSucesso, 0) / workflows.length)
                : 0}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Execuções Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {workflows.reduce((acc, w) => {
                const hoje = new Date().toDateString()
                const execucoesHoje = w.logsRecentes.filter(log => 
                  new Date(log.dataExecucao).toDateString() === hoje
                ).length
                return acc + execucoesHoje
              }, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Workflows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {workflows.map((workflow, index) => {
          const tipoConfig = TIPOS_WORKFLOW[workflow.tipo as keyof typeof TIPOS_WORKFLOW]
          
          return (
            <motion.div
              key={workflow.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2 mb-2">
                        <span className="text-2xl">{tipoConfig?.icone}</span>
                        {workflow.nome}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={tipoConfig?.cor}>
                          {tipoConfig?.nome}
                        </Badge>
                        {getStatusBadge(workflow)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={workflow.ativo}
                        onCheckedChange={() => handleToggleWorkflow(workflow.id)}
                      />
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Estatísticas */}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-lg">{workflow.estatisticas.totalExecucoes}</div>
                      <div className="text-gray-500">Execuções</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-lg text-green-600">{workflow.estatisticas.taxaSucesso}%</div>
                      <div className="text-gray-500">Sucesso</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-lg">{workflow.estatisticas.execucoesSucesso}</div>
                      <div className="text-gray-500">OK</div>
                    </div>
                  </div>

                  {/* Informações de Execução */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Frequência:</span>
                      <span className="font-medium">
                        {FREQUENCIAS[workflow.frequencia as keyof typeof FREQUENCIAS] || workflow.frequencia}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Última Execução:</span>
                      <span className="font-medium">
                        {formatarDataHora(workflow.ultimaExecucao)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Próxima Execução:</span>
                      <span className="font-medium">
                        {calcularProximaExecucao(workflow.ultimaExecucao, workflow.frequencia)}
                      </span>
                    </div>
                  </div>

                  {/* Último Log */}
                  {workflow.logsRecentes.length > 0 && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        {workflow.logsRecentes[0].sucesso ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-sm font-medium">
                          {formatarDataHora(workflow.logsRecentes[0].dataExecucao)}
                        </span>
                      </div>
                      {workflow.logsRecentes[0].mensagem && (
                        <div className="text-sm text-gray-600 truncate">
                          {workflow.logsRecentes[0].mensagem}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Ações */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExecutarManual(workflow.id)}
                      disabled={!workflow.ativo}
                      className="flex-1"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Executar
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setWorkflowSelecionado(workflow)
                        setModalLogs(true)
                      }}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Logs
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setWorkflowSelecionado(workflow)
                        setModalConfiguracao(true)
                      }}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Modal de Configuração */}
      <Dialog open={modalConfiguracao} onOpenChange={setModalConfiguracao}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configurar Workflow</DialogTitle>
            <DialogDescription>
              {workflowSelecionado?.nome}
            </DialogDescription>
          </DialogHeader>

          {workflowSelecionado && (
            <div className="space-y-6">
              {/* Configuração de Frequência */}
              <div>
                <Label htmlFor="frequencia">Frequência de Execução</Label>
                <Select 
                  defaultValue={workflowSelecionado.frequencia}
                  onValueChange={(value) => handleAtualizarFrequencia(workflowSelecionado.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(FREQUENCIAS).map(([cron, descricao]) => (
                      <SelectItem key={cron} value={cron}>{descricao}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Parâmetros específicos do workflow */}
              {workflowSelecionado.parametros && (
                <div>
                  <Label>Parâmetros Atuais</Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                      {JSON.stringify(workflowSelecionado.parametros, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setModalConfiguracao(false)}
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Logs */}
      <Dialog open={modalLogs} onOpenChange={setModalLogs}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Histórico de Execuções</DialogTitle>
            <DialogDescription>
              {workflowSelecionado?.nome} - Últimas 10 execuções
            </DialogDescription>
          </DialogHeader>

          {workflowSelecionado && (
            <div className="space-y-4">
              {workflowSelecionado.logsRecentes.length > 0 ? (
                workflowSelecionado.logsRecentes.map((log, index) => (
                  <div
                    key={log.id}
                    className={`p-4 rounded-lg border ${
                      log.sucesso ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {log.sucesso ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className="font-medium">
                        {formatarDataHora(log.dataExecucao)}
                      </span>
                      <Badge variant="outline" className={log.sucesso ? 'border-green-300' : 'border-red-300'}>
                        {log.sucesso ? 'Sucesso' : 'Erro'}
                      </Badge>
                    </div>
                    
                    {log.mensagem && (
                      <div className="text-sm text-gray-700 mb-2">
                        {log.mensagem}
                      </div>
                    )}
                    
                    {log.dados && (
                      <details className="text-sm">
                        <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                          Ver dados detalhados
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                          {JSON.stringify(log.dados, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma execução registrada</h3>
                  <p className="text-gray-500">Este workflow ainda não foi executado.</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setModalLogs(false)}
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
