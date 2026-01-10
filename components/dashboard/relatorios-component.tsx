
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'
import {
  TrendingUp,
  Users,
  FileText,
  Euro,
  Calendar,
  Download,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Building2,
  AlertTriangle
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface RelatoriosData {
  periodo: {
    tipo: string
    dataInicio: string
    dataFim: string
    ano: number
    mes: number
  }
  kpis: {
    totalAvisos: number
    avisosUrgentes: number
    totalCandidaturas: number
    candidaturasAprovadas: number
    taxaAprovacao: number
    montanteTotal: number
    novasEmpresas: number
    documentosAdicionados: number
    execucoesWorkflow: number
    sucessoWorkflows: number
  }
  graficos: {
    evolucaoAvisos: { mes: string; avisos: number }[]
    distribuicaoPortal: { portal: string; count: number }[]
    candidaturasPorEstado: { estado: string; count: number }[]
    topEmpresas: { nome: string; candidaturas: number }[]
    roiPorPrograma: { programa: string; montante: number; candidaturas: number }[]
  }
}

const COLORS = ['#60B5FF', '#FF9149', '#FF9898', '#FF90BB', '#FF6363', '#80D8C3', '#A19AD3', '#72BF78']

const ESTADOS_NOMES = {
  A_PREPARAR: 'A Preparar',
  SUBMETIDA: 'Submetida',
  EM_ANALISE: 'Em Análise',
  APROVADA: 'Aprovada',
  REJEITADA: 'Rejeitada'
}

export function RelatoriosComponent() {
  const [data, setData] = useState<RelatoriosData | null>(null)
  const [loading, setLoading] = useState(true)

  // Filtros
  const [filtros, setFiltros] = useState({
    periodo: 'mes',
    ano: new Date().getFullYear(),
    mes: new Date().getMonth() + 1
  })

  const fetchRelatorios = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        periodo: filtros.periodo,
        ano: filtros.ano.toString(),
        mes: filtros.mes.toString()
      })

      const response = await fetch(`/api/relatorios?${params}`)
      if (!response.ok) throw new Error('Erro ao carregar relatórios')

      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao carregar relatórios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRelatorios()
  }, [filtros])

  const handleFiltroChange = (key: string, value: any) => {
    setFiltros(prev => ({ ...prev, [key]: value }))
  }

  const handleExportPDF = () => {
    window.open('/dashboard/relatorios/print', '_blank')
  }

  const handleExportExcel = () => {
    toast.success('Funcionalidade de export Excel será implementada')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-gray-500">Gerando relatórios...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar relatórios</h3>
        <p className="text-gray-500">Tente novamente mais tarde.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controlos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Período de Análise
            </CardTitle>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportPDF}>
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline" onClick={handleExportExcel}>
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Período */}
            <div>
              <Select value={filtros.periodo} onValueChange={(value) => handleFiltroChange('periodo', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mes">Mensal</SelectItem>
                  <SelectItem value="trimestre">Trimestral</SelectItem>
                  <SelectItem value="ano">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Ano */}
            <div>
              <Select value={filtros.ano.toString()} onValueChange={(value) => handleFiltroChange('ano', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2023, 2022].map(ano => (
                    <SelectItem key={ano} value={ano.toString()}>{ano}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Mês (só se período for mensal ou trimestral) */}
            {filtros.periodo !== 'ano' && (
              <div>
                <Select value={filtros.mes.toString()} onValueChange={(value) => handleFiltroChange('mes', parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {new Date(2024, i).toLocaleDateString('pt-PT', { month: 'long' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="text-sm text-gray-600">
            Análise do período: {new Date(data.periodo.dataInicio).toLocaleDateString('pt-PT')} a {new Date(data.periodo.dataFim).toLocaleDateString('pt-PT')}
          </div>
        </CardContent>
      </Card>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-500" />
                Avisos Monitorizados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data.kpis.totalAvisos}</div>
              {data.kpis.avisosUrgentes > 0 && (
                <div className="text-sm text-red-600 flex items-center gap-1 mt-1">
                  <AlertTriangle className="h-3 w-3" />
                  {data.kpis.avisosUrgentes} urgentes
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Building2 className="h-4 w-4 text-green-500" />
                Candidaturas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data.kpis.totalCandidaturas}</div>
              <div className="text-sm text-green-600 mt-1">
                {data.kpis.candidaturasAprovadas} aprovadas
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-yellow-500" />
                Taxa Aprovação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data.kpis.taxaAprovacao}%</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Euro className="h-4 w-4 text-purple-500" />
                Financiamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                €{data.kpis.montanteTotal.toLocaleString('pt-PT')}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-red-500" />
                Novas Empresas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data.kpis.novasEmpresas}</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução de Avisos */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Evolução de Avisos ({data.periodo.ano})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.graficos.evolucaoAvisos}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="mes"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                  />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="avisos"
                    stroke="#60B5FF"
                    strokeWidth={2}
                    dot={{ fill: '#60B5FF', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Distribuição por Portal */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" />
                Distribuição por Portal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.graficos.distribuicaoPortal}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ portal, percent }: any) => `${portal} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {data.graficos.distribuicaoPortal.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Candidaturas por Estado */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Pipeline de Candidaturas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.graficos.candidaturasPorEstado.map(item => ({
                  ...item,
                  estado: ESTADOS_NOMES[item.estado as keyof typeof ESTADOS_NOMES] || item.estado
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="estado"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill="#FF9149" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Empresas */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Top 5 Empresas Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.graficos.topEmpresas} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="nome"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    width={120}
                  />
                  <Tooltip />
                  <Bar dataKey="candidaturas" fill="#80D8C3" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ROI por Programa */}
      {data.graficos.roiPorPrograma.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Euro className="h-5 w-5" />
                Montantes Aprovados por Programa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.graficos.roiPorPrograma}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="programa"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value) => [`€${Number(value).toLocaleString('pt-PT')}`, 'Montante']}
                  />
                  <Bar dataKey="montante" fill="#FF90BB" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Resumo Executivo */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Resumo Executivo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Performance do Período</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• {data.kpis.totalAvisos} avisos monitorizados</li>
                  <li>• {data.kpis.totalCandidaturas} candidaturas processadas</li>
                  <li>• Taxa de aprovação de {data.kpis.taxaAprovacao}%</li>
                  <li>• €{data.kpis.montanteTotal.toLocaleString('pt-PT')} em financiamentos aprovados</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Atividade da Plataforma</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• {data.kpis.novasEmpresas} novas empresas adicionadas</li>
                  <li>• {data.kpis.documentosAdicionados} documentos carregados</li>
                  <li>• {data.kpis.execucoesWorkflow} execuções de workflows</li>
                  <li>• {data.kpis.sucessoWorkflows}% de sucesso em automações</li>
                </ul>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Recomendações</h4>
              <div className="text-sm text-gray-600 space-y-1">
                {data.kpis.avisosUrgentes > 0 && (
                  <p>⚠️ Atenção: {data.kpis.avisosUrgentes} avisos com deadline próximo necessitam de ação imediata.</p>
                )}
                {data.kpis.taxaAprovacao < 50 && (
                  <p>📈 Considere revisar critérios de elegibilidade - taxa de aprovação abaixo de 50%.</p>
                )}
                {data.kpis.sucessoWorkflows < 80 && (
                  <p>🔧 Workflows necessitam de otimização - taxa de sucesso abaixo de 80%.</p>
                )}
                {data.kpis.montanteTotal > 100000 && (
                  <p>🎉 Excelente performance! Mais de €100.000 em financiamentos aprovados.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
