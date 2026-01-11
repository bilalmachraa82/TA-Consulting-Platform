
'use client';

import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PremiumCard } from '@/components/ui/premium-card';
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
  ClipboardList,
  ArrowUpRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

// PERFORMANCE: Dynamic imports centralizados (reduz bundle size inicial)
import { ChartBar, ChartDoughnut } from '@/lib/dynamic-imports';

// Chart.js registration (singleton, não impacta bundle)
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

export function DashboardHome({ kpis, avisos, candidaturas, notificacoes, workflows, metricas }: DashboardHomeProps & { metricas?: Metricas | null }) {
  const getUrgencyColor = (dataFim: Date) => {
    const now = new Date()
    const diasRestantes = Math.ceil((dataFim.getTime() - now.getTime()) / (1000 * 3600 * 24))

    if (diasRestantes <= 7) return 'bg-red-500'
    if (diasRestantes <= 15) return 'bg-amber-500'
    return 'bg-emerald-500'
  }

  const getUrgencyBadge = (dataFim: Date) => {
    const now = new Date()
    const diasRestantes = Math.ceil((dataFim.getTime() - now.getTime()) / (1000 * 3600 * 24))

    if (diasRestantes <= 0) return <Badge variant="destructive" className="bg-red-500/10 text-red-400 border-red-500/20">Expirado</Badge>
    if (diasRestantes <= 7) return <Badge variant="destructive" className="bg-red-500/10 text-red-400 border-red-500/20">Urgente ({diasRestantes}d)</Badge>
    if (diasRestantes <= 15) return <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 border-amber-500/20">Atenção ({diasRestantes}d)</Badge>
    return <Badge variant="outline" className="text-slate-400 border-slate-700">{diasRestantes} dias</Badge>
  }

  const getEstadoBadge = (estado: string) => {
    const variants = {
      'A_PREPARAR': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      'SUBMETIDA': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      'EM_ANALISE': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      'APROVADA': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shiny-badge',
      'REJEITADA': 'bg-red-500/10 text-red-400 border-red-500/20',
    };

    const className = variants[estado as keyof typeof variants] || 'bg-slate-800 text-slate-400 border-slate-700';

    return <Badge variant="outline" className={`border ${className}`}>
      {estado.replace('_', ' ')}
    </Badge>
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">Visão geral da tua operação de fundos em tempo real</p>
        </div>
        <div className="flex gap-4">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
            <ExternalLink className="w-4 h-4 mr-2" /> Novo Aviso
          </Button>
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <PremiumCard glow className="p-6 relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <FileText className="w-24 h-24 text-blue-500" />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 text-blue-500 dark:text-blue-400">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-muted-foreground text-sm font-medium">Avisos Ativos</p>
              <h3 className="text-3xl font-bold text-foreground mt-1">{kpis.totalAvisos}</h3>
            </div>
          </PremiumCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <PremiumCard glow className="p-6 relative group overflow-hidden border-red-900/50">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <AlertTriangle className="w-24 h-24 text-red-500" />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center mb-4 text-red-500 dark:text-red-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <p className="text-muted-foreground text-sm font-medium">Urgentes</p>
              <h3 className="text-3xl font-bold text-foreground mt-1">{kpis.avisosUrgentes}</h3>
            </div>
          </PremiumCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <PremiumCard glow className="p-6 relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Clock className="w-24 h-24 text-amber-500" />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center mb-4 text-amber-500 dark:text-amber-400">
                <Clock className="w-6 h-6" />
              </div>
              <p className="text-muted-foreground text-sm font-medium">Em Curso</p>
              <h3 className="text-3xl font-bold text-foreground mt-1">{kpis.candidaturasEmCurso}</h3>
            </div>
          </PremiumCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <PremiumCard glow className="p-6 relative group overflow-hidden border-emerald-900/50">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp className="w-24 h-24 text-emerald-500" />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4 text-emerald-500 dark:text-emerald-400">
                <TrendingUp className="w-6 h-6" />
              </div>
              <p className="text-muted-foreground text-sm font-medium">Taxa Sucesso</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-foreground mt-1">{kpis.taxaSucesso}%</h3>
                <span className="text-emerald-500 text-sm">+2.4%</span>
              </div>
            </div>
          </PremiumCard>
        </motion.div>
      </div>

      {/* Analytics Section */}
      {metricas ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Avisos por Portal */}
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
            <PremiumCard className="p-1 h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <FileText className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                  Avisos por Portal
                </CardTitle>
                <CardDescription className="text-muted-foreground">Volume de oportunidades por fonte</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <ChartBar
                    data={{
                      labels: metricas.graficos.avisosPorPortal.map((a) => a.portal),
                      datasets: [
                        {
                          label: 'Avisos',
                          data: metricas.graficos.avisosPorPortal.map((a) => a.total),
                          backgroundColor: [
                            'rgba(59, 130, 246, 0.6)',
                            'rgba(16, 185, 129, 0.6)',
                            'rgba(236, 72, 153, 0.6)'
                          ],
                          borderColor: [
                            '#3b82f6',
                            '#10b981',
                            '#ec4899'
                          ],
                          borderWidth: 2,
                          borderRadius: 8,
                          hoverBackgroundColor: '#ffffff',
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: 'rgba(15, 23, 42, 0.8)',
                          padding: 16,
                          cornerRadius: 12,
                          titleColor: '#fff',
                          bodyColor: '#cbd5e1',
                          borderColor: 'rgba(255, 255, 255, 0.1)',
                          borderWidth: 1,
                          displayColors: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: { color: 'rgba(94, 114, 228, 0.1)' },
                          ticks: { color: '#64748b' },
                          border: { display: false }
                        },
                        x: {
                          grid: { display: false },
                          ticks: { color: '#64748b' },
                          border: { display: false }
                        },
                      },
                      elements: {
                        bar: {
                          backgroundColor: 'rgba(59, 130, 246, 0.5)',
                          borderRadius: 6,
                          borderWidth: 0,
                          hoverBackgroundColor: '#3b82f6'
                        }
                      }
                    }}
                  />
                </div>
              </CardContent>
            </PremiumCard>
          </motion.div>

          {/* Chart 2: Status Pipeline */}
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}>
            <PremiumCard className="p-1 h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <ClipboardList className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                  Pipeline de Candidaturas
                </CardTitle>
                <CardDescription className="text-muted-foreground">Distribuição por estado de aprovação</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <ChartDoughnut
                    data={{
                      labels: metricas.graficos.candidaturasPorStatus.map((c) => c.status),
                      datasets: [
                        {
                          data: metricas.graficos.candidaturasPorStatus.map((c) => c.total),
                          backgroundColor: [
                            'rgba(59, 130, 246, 0.8)',   // Blue
                            'rgba(168, 85, 247, 0.8)',   // Purple
                            'rgba(236, 72, 153, 0.8)',   // Pink
                            'rgba(16, 185, 129, 0.8)',   // Emerald
                            'rgba(245, 158, 11, 0.8)',   // Amber
                          ],
                          borderWidth: 0,
                          hoverOffset: 10,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      cutout: '70%',
                      plugins: {
                        legend: {
                          position: 'right',
                          labels: { padding: 20, color: '#94a3b8', font: { size: 12 } },
                        },
                        tooltip: {
                          backgroundColor: 'rgba(15, 23, 42, 0.9)',
                          padding: 12,
                          cornerRadius: 8,
                          titleColor: '#fff',
                        },
                      },
                    }}
                  />
                </div>
              </CardContent>
            </PremiumCard>
          </motion.div>
        </div>
      ) : null}

      {/* Recent Lists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recents: Avisos */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }} className="lg:col-span-2">
          <PremiumCard className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-foreground">Últimos Avisos</CardTitle>
                <CardDescription className="text-muted-foreground">Monitorização em tempo real</CardDescription>
              </div>
              <Link href="/dashboard/avisos">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-muted">
                  Ver todos <ArrowUpRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-2">
              {avisos.slice(0, 5).map((aviso, index) => (
                <motion.div
                  key={aviso.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.05 }}
                  className="group flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-transparent hover:border-border hover:bg-muted/50 transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className={`mt-1.5 w-2 h-2 rounded-full ${getUrgencyColor(aviso.dataFimSubmissao)} shadow-[0_0_8px_rgba(0,0,0,0.5)]`} />
                    <div>
                      <h4 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">{aviso.nome}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{aviso.portal}</span>
                        <span className="text-xs text-muted-foreground">{aviso.programa}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {getUrgencyBadge(aviso.dataFimSubmissao)}
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </PremiumCard>
        </motion.div>

        {/* Recents: Notifications */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }} className="flex flex-col gap-6">
          {/* Notifications */}
          <PremiumCard className="flex-1">
            <CardHeader className="pb-4">
              <CardTitle className="text-foreground text-lg">Notificações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {notificacoes?.length > 0 ? notificacoes.slice(0, 4).map((notif, i) => (
                <div key={notif.id} className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-foreground leading-tight">{notif.assunto}</p>
                    <p className="text-xs text-muted-foreground">{new Date(notif.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Sem novas notificações
                </div>
              )}
            </CardContent>
          </PremiumCard>

          {/* Quick Action */}
          <div className="grid grid-cols-2 gap-4">
            <Link href="/dashboard/empresas" className="bg-muted/50 hover:bg-blue-600/20 border border-border hover:border-blue-500/50 rounded-xl p-4 transition-all group">
              <Building2 className="w-6 h-6 text-muted-foreground group-hover:text-blue-500 mb-2" />
              <p className="text-sm font-bold text-foreground">Empresas</p>
            </Link>
            <Link href="/dashboard/candidaturas" className="bg-muted/50 hover:bg-emerald-600/20 border border-border hover:border-emerald-500/50 rounded-xl p-4 transition-all group">
              <FileText className="w-6 h-6 text-muted-foreground group-hover:text-emerald-500 mb-2" />
              <p className="text-sm font-bold text-foreground">Projetos</p>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}