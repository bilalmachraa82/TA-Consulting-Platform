
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  FileText, 
  TrendingUp, 
  Clock,
  ExternalLink,
  CheckCircle,
  XCircle,
  Users,
  Building2,
  Calendar,
  Download,
  Mail,
  Loader2,
  Euro,
  ClipboardList,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { StatsCard } from '@/components/modern/stats-card';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

interface KPIs {
  totalAvisos: number;
  avisosUrgentes: number;
  candidaturasEmCurso: number;
  taxaSucesso: number;
  documentosExpirados: number;
}

interface DashboardHomeProps {
  kpis: KPIs;
  avisos: any[];
  candidaturas: any[];
  notificacoes: any[];
  workflows: any[];
}

interface Metricas {
  resumo: {
    totalAvisos: number;
    totalEmpresas: number;
    totalCandidaturas: number;
    totalDocumentos: number;
    avisosUrgentes: number;
    orcamentoDisponivel: number;
    valorSolicitado: number;
  };
  graficos: {
    candidaturasPorStatus: { status: string; total: number }[];
    avisosPorPortal: { portal: string; total: number }[];
    candidaturasPorMes: { mes: string; total: number }[];
    topEmpresas: any[];
  };
}

export function DashboardHome({ kpis, avisos, candidaturas, notificacoes, workflows }: DashboardHomeProps) {
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [loadingMetricas, setLoadingMetricas] = useState(true);

  useEffect(() => {
    fetchMetricas();
  }, []);

  const fetchMetricas = async () => {
    try {
      const response = await fetch('/api/dashboard/metricas');
      const data = await response.json();
      setMetricas(data);
    } catch (error) {
      console.error('Erro ao buscar métricas:', error);
    } finally {
      setLoadingMetricas(false);
    }
  };
  const getUrgencyColor = (dataFim: Date) => {
    const now = new Date()
    const diasRestantes = Math.ceil((dataFim.getTime() - now.getTime()) / (1000 * 3600 * 24))
    
    if (diasRestantes <= 7) return 'bg-red-500'
    if (diasRestantes <= 15) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getUrgencyBadge = (dataFim: Date) => {
    const now = new Date()
    const diasRestantes = Math.ceil((dataFim.getTime() - now.getTime()) / (1000 * 3600 * 24))
    
    if (diasRestantes <= 0) return <Badge variant="destructive">Expirado</Badge>
    if (diasRestantes <= 7) return <Badge variant="destructive">Urgente ({diasRestantes}d)</Badge>
    if (diasRestantes <= 15) return <Badge variant="secondary">Atenção ({diasRestantes}d)</Badge>
    return <Badge variant="outline">{diasRestantes} dias</Badge>
  }

  const getEstadoBadge = (estado: string) => {
    const variants = {
      'A_PREPARAR': 'secondary',
      'SUBMETIDA': 'default',
      'EM_ANALISE': 'secondary',
      'APROVADA': 'default',
      'REJEITADA': 'destructive',
    } as const
    
    return <Badge variant={variants[estado as keyof typeof variants] || 'outline'}>
      {estado.replace('_', ' ')}
    </Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral dos fundos europeus em tempo real</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-blue-600">{kpis.totalAvisos}</CardTitle>
              <CardDescription className="flex items-center">
                <FileText className="w-4 h-4 mr-1" />
                Avisos Ativos
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-red-600">{kpis.avisosUrgentes}</CardTitle>
              <CardDescription className="flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                Avisos Urgentes
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-yellow-600">{kpis.candidaturasEmCurso}</CardTitle>
              <CardDescription className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Em Curso
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-green-600">{kpis.taxaSucesso}%</CardTitle>
              <CardDescription className="flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                Taxa Sucesso
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-orange-600">{kpis.documentosExpirados}</CardTitle>
              <CardDescription className="flex items-center">
                <ExternalLink className="w-4 h-4 mr-1" />
                Docs. Expirados
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>
      </div>

      {/* Gráficos Avançados */}
      {loadingMetricas ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : metricas ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Avisos por Portal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Avisos por Portal
                </CardTitle>
                <CardDescription>Distribuição dos avisos ativos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <Bar
                    data={{
                      labels: metricas.graficos.avisosPorPortal.map((a) => a.portal),
                      datasets: [
                        {
                          label: 'Avisos',
                          data: metricas.graficos.avisosPorPortal.map((a) => a.total),
                          backgroundColor: 'rgba(102, 126, 234, 0.8)',
                          borderColor: 'rgba(102, 126, 234, 1)',
                          borderWidth: 2,
                          borderRadius: 8,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          padding: 12,
                          cornerRadius: 8,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: { display: false },
                        },
                        x: { grid: { display: false } },
                      },
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Gráfico de Candidaturas por Status */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-secondary" />
                  Candidaturas por Status
                </CardTitle>
                <CardDescription>Estado atual das candidaturas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <Doughnut
                    data={{
                      labels: metricas.graficos.candidaturasPorStatus.map((c) => c.status),
                      datasets: [
                        {
                          data: metricas.graficos.candidaturasPorStatus.map((c) => c.total),
                          backgroundColor: [
                            'rgba(102, 126, 234, 0.8)',
                            'rgba(118, 75, 162, 0.8)',
                            'rgba(240, 147, 251, 0.8)',
                            'rgba(79, 172, 254, 0.8)',
                            'rgba(67, 233, 123, 0.8)',
                          ],
                          borderWidth: 0,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: { padding: 15, font: { size: 12 } },
                        },
                        tooltip: {
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          padding: 12,
                          cornerRadius: 8,
                        },
                      },
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      ) : null}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avisos Recentes */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Últimos Avisos</CardTitle>
                <CardDescription>Monitorização automática dos portais</CardDescription>
              </div>
              <Link href="/dashboard/avisos">
                <Button variant="outline" size="sm">
                  Ver todos <ExternalLink className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {avisos.slice(0, 5).map((aviso, index) => (
                <motion.div
                  key={aviso.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getUrgencyColor(aviso.dataFimSubmissao)}`} />
                      <h4 className="font-medium text-sm">{aviso.nome}</h4>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-600">
                      <span>{aviso.portal}</span>
                      <span>{aviso.programa}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    {getUrgencyBadge(aviso.dataFimSubmissao)}
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Candidaturas Recentes */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Candidaturas</CardTitle>
                <CardDescription>Estado atual</CardDescription>
              </div>
              <Link href="/dashboard/candidaturas">
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {candidaturas.slice(0, 4).map((candidatura, index) => (
                <motion.div
                  key={candidatura.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  className="p-3 rounded-lg border space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{candidatura?.empresa?.nome}</h4>
                    {getEstadoBadge(candidatura.estado)}
                  </div>
                  <p className="text-xs text-gray-600">{candidatura?.aviso?.nome}</p>
                  {candidatura.montanteSolicitado && (
                    <p className="text-xs font-medium text-green-600">
                      €{candidatura.montanteSolicitado?.toLocaleString?.()}
                    </p>
                  )}
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Workflows Status & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workflows Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Status dos Workflows</CardTitle>
              <CardDescription>Automações ativas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {workflows.map((workflow, index) => (
                <motion.div
                  key={workflow.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1 + index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center space-x-3">
                    {workflow.ativo ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <div>
                      <h4 className="font-medium text-sm">{workflow.nome}</h4>
                      <p className="text-xs text-gray-600">
                        {workflow.ultimaExecucao 
                          ? `Última: ${new Date(workflow.ultimaExecucao).toLocaleString()}`
                          : 'Nunca executado'
                        }
                      </p>
                    </div>
                  </div>
                  <Badge variant={workflow.ativo ? 'default' : 'secondary'}>
                    {workflow.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>Acesso direto às funcionalidades</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/dashboard/empresas">
                <Button variant="outline" className="w-full justify-start">
                  <Building2 className="w-4 h-4 mr-2" />
                  Gerir Empresas
                </Button>
              </Link>
              <Link href="/dashboard/calendario">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Ver Calendário
                </Button>
              </Link>
              <Link href="/dashboard/documentacao">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Documentação
                </Button>
              </Link>
              <Link href="/dashboard/relatorios">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Relatórios
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Notifications */}
      {notificacoes?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Notificações Recentes</CardTitle>
              <CardDescription>Últimas 5 notificações do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {notificacoes.map((notif, index) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.4 + index * 0.05 }}
                  className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50"
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{notif.assunto}</h4>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{notif.conteudo}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}