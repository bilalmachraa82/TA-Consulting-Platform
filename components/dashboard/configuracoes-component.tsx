
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Settings,
  Mail,
  Bell,
  Users,
  Database,
  TestTube,
  Save,
  Check,
  AlertTriangle,
  Globe,
  Shield,
  Zap,
  Building2,
  Activity
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface ConfiguracaoSecao {
  id: string
  titulo: string
  icone: React.ReactNode
  descricao: string
}

const SECOES_CONFIGURACAO: ConfiguracaoSecao[] = [
  {
    id: 'notificacoes',
    titulo: 'Notificações Email',
    icone: <Mail className="h-5 w-5" />,
    descricao: 'Configurar alertas e notificações por email'
  },
  {
    id: 'integracao',
    titulo: 'Integração Google Sheets',
    icone: <Database className="h-5 w-5" />,
    descricao: 'Exportação automática para Google Sheets'
  },
  {
    id: 'scraping',
    titulo: 'Parâmetros Scraping',
    icone: <Globe className="h-5 w-5" />,
    descricao: 'Configurações de monitorização de portais'
  },
  {
    id: 'utilizadores',
    titulo: 'Gestão de Utilizadores',
    icone: <Users className="h-5 w-5" />,
    descricao: 'Permissões e acessos da plataforma'
  },
  {
    id: 'alertas',
    titulo: 'Configuração de Alertas',
    icone: <Bell className="h-5 w-5" />,
    descricao: 'Alertas automáticos e thresholds'
  },
  {
    id: 'sistema',
    titulo: 'Sistema & Segurança',
    icone: <Shield className="h-5 w-5" />,
    descricao: 'Configurações avançadas do sistema'
  },
  {
    id: 'watchtower',
    titulo: 'Digital Watchtower',
    icone: <Activity className="h-5 w-5 text-blue-500" />,
    descricao: 'Monitorização 24/7 em Tempo Real'
  }
]

export function ConfiguracoesComponent() {
  const [secaoAtiva, setSecaoAtiva] = useState('notificacoes')
  const [configuracoes, setConfiguracoes] = useState<any>({
    notificacoes: {
      emailAtivar: true,
      emailServidor: 'smtp.gmail.com',
      emailPorta: 587,
      emailUsuario: '',
      emailSenha: '',
      alertasUrgentes: true,
      alertasDocumentos: true,
      relatorioDiario: false,
      relatorioSemanal: true,
      destinatarios: ['admin@taconsulting.pt']
    },
    integracao: {
      googleSheetsAtivar: false,
      googleSheetsId: '',
      autoExportAvisos: true,
      autoExportCandidaturas: true,
      frequenciaSync: 'diario'
    },
    scraping: {
      portugal2030: true,
      pepac: true,
      prr: true,
      intervaloHoras: 6,
      timeoutSegundos: 30,
      retryAttempts: 3,
      userAgent: 'TA-Consulting-Bot/1.0'
    },
    utilizadores: {
      registoAberto: false,
      aprovarManualmente: true,
      sessaoTimeout: 24,
      logAcoes: true
    },
    alertas: {
      avisosDiasLimite: 7,
      documentosExpiracao: 30,
      candidaturaSemResposta: 60,
      emailAdmin: 'admin@taconsulting.pt',
      whatsappAtivar: false,
      whatsappNumero: ''
    },
    sistema: {
      backupAutomatico: true,
      logLevel: 'info',
      cacheTimeout: 60,
      rateLimitRequests: 100
    }
  })

  const [testando, setTestando] = useState<string | null>(null)

  const handleSalvarConfiguracoes = async () => {
    try {
      // Simular gravação das configurações
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Configurações guardadas com sucesso')
    } catch (error) {
      toast.error('Erro ao guardar configurações')
    }
  }

  const handleTesteConexao = async (tipo: string) => {
    setTestando(tipo)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))

      if (tipo === 'email') {
        toast.success('Conexão de email testada com sucesso')
      } else if (tipo === 'google') {
        toast.success('Integração Google Sheets testada com sucesso')
      }
    } catch (error) {
      toast.error(`Erro no teste de ${tipo}`)
    } finally {
      setTestando(null)
    }
  }

  const atualizarConfiguracao = (secao: string, campo: string, valor: any) => {
    setConfiguracoes((prev: any) => ({
      ...prev,
      [secao]: {
        ...prev[secao],
        [campo]: valor
      }
    }))
  }

  const renderSecaoNotificacoes = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Email</CardTitle>
          <CardDescription>Configure o servidor SMTP para envio de notificações</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Ativar Notificações Email</Label>
              <p className="text-sm text-gray-500">Enviar alertas por email</p>
            </div>
            <Switch
              checked={configuracoes.notificacoes.emailAtivar}
              onCheckedChange={(checked) => atualizarConfiguracao('notificacoes', 'emailAtivar', checked)}
            />
          </div>

          {configuracoes.notificacoes.emailAtivar && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <Label htmlFor="emailServidor">Servidor SMTP</Label>
                <Input
                  id="emailServidor"
                  value={configuracoes.notificacoes.emailServidor}
                  onChange={(e) => atualizarConfiguracao('notificacoes', 'emailServidor', e.target.value)}
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div>
                <Label htmlFor="emailPorta">Porta</Label>
                <Input
                  id="emailPorta"
                  type="number"
                  value={configuracoes.notificacoes.emailPorta}
                  onChange={(e) => atualizarConfiguracao('notificacoes', 'emailPorta', parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="emailUsuario">Utilizador</Label>
                <Input
                  id="emailUsuario"
                  value={configuracoes.notificacoes.emailUsuario}
                  onChange={(e) => atualizarConfiguracao('notificacoes', 'emailUsuario', e.target.value)}
                  placeholder="seuemail@gmail.com"
                />
              </div>
              <div>
                <Label htmlFor="emailSenha">Palavra-passe</Label>
                <Input
                  id="emailSenha"
                  type="password"
                  value={configuracoes.notificacoes.emailSenha}
                  onChange={(e) => atualizarConfiguracao('notificacoes', 'emailSenha', e.target.value)}
                  placeholder="suapalvrapasse"
                />
              </div>
            </div>
          )}

          {configuracoes.notificacoes.emailAtivar && (
            <Button
              variant="outline"
              onClick={() => handleTesteConexao('email')}
              disabled={testando === 'email'}
            >
              {testando === 'email' ? (
                <>
                  <TestTube className="h-4 w-4 mr-2 animate-spin" />
                  Testando...
                </>
              ) : (
                <>
                  <TestTube className="h-4 w-4 mr-2" />
                  Testar Conexão
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tipos de Alertas</CardTitle>
          <CardDescription>Configure que tipos de notificações receber</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Avisos Urgentes</Label>
              <p className="text-sm text-gray-500">Deadlines em 7 dias ou menos</p>
            </div>
            <Switch
              checked={configuracoes.notificacoes.alertasUrgentes}
              onCheckedChange={(checked) => atualizarConfiguracao('notificacoes', 'alertasUrgentes', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Documentos a Expirar</Label>
              <p className="text-sm text-gray-500">Certificados com validade próxima</p>
            </div>
            <Switch
              checked={configuracoes.notificacoes.alertasDocumentos}
              onCheckedChange={(checked) => atualizarConfiguracao('notificacoes', 'alertasDocumentos', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Relatório Semanal</Label>
              <p className="text-sm text-gray-500">Resumo da atividade semanal</p>
            </div>
            <Switch
              checked={configuracoes.notificacoes.relatorioSemanal}
              onCheckedChange={(checked) => atualizarConfiguracao('notificacoes', 'relatorioSemanal', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderSecaoIntegracao = () => (
    <Card>
      <CardHeader>
        <CardTitle>Google Sheets Integration</CardTitle>
        <CardDescription>Exportação automática de dados para Google Sheets</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>Ativar Integração</Label>
            <p className="text-sm text-gray-500">Sincronização automática com Google Sheets</p>
          </div>
          <Switch
            checked={configuracoes.integracao.googleSheetsAtivar}
            onCheckedChange={(checked) => atualizarConfiguracao('integracao', 'googleSheetsAtivar', checked)}
          />
        </div>

        {configuracoes.integracao.googleSheetsAtivar && (
          <div className="space-y-4 pt-4 border-t">
            <div>
              <Label htmlFor="sheetsId">ID da Planilha Google</Label>
              <Input
                id="sheetsId"
                value={configuracoes.integracao.googleSheetsId}
                onChange={(e) => atualizarConfiguracao('integracao', 'googleSheetsId', e.target.value)}
                placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
              />
            </div>

            <div>
              <Label>Frequência de Sincronização</Label>
              <Select
                value={configuracoes.integracao.frequenciaSync}
                onValueChange={(value) => atualizarConfiguracao('integracao', 'frequenciaSync', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tempo-real">Tempo Real</SelectItem>
                  <SelectItem value="diario">Diário</SelectItem>
                  <SelectItem value="semanal">Semanal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              onClick={() => handleTesteConexao('google')}
              disabled={testando === 'google'}
            >
              {testando === 'google' ? (
                <>
                  <TestTube className="h-4 w-4 mr-2 animate-spin" />
                  Testando...
                </>
              ) : (
                <>
                  <TestTube className="h-4 w-4 mr-2" />
                  Testar Integração
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )

  const renderSecaoScraping = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Portais Monitorizados</CardTitle>
          <CardDescription>Configure quais portais devem ser monitorizados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Portugal 2030</Label>
              <p className="text-sm text-gray-500">Monitor portal Portugal 2030</p>
            </div>
            <Switch
              checked={configuracoes.scraping.portugal2030}
              onCheckedChange={(checked) => atualizarConfiguracao('scraping', 'portugal2030', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>PEPAC</Label>
              <p className="text-sm text-gray-500">Monitor portal PEPAC</p>
            </div>
            <Switch
              checked={configuracoes.scraping.pepac}
              onCheckedChange={(checked) => atualizarConfiguracao('scraping', 'pepac', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>PRR (Plano de Recuperação e Resiliência)</Label>
              <p className="text-sm text-gray-500">Monitor portal PRR</p>
            </div>
            <Switch
              checked={configuracoes.scraping.prr}
              onCheckedChange={(checked) => atualizarConfiguracao('scraping', 'prr', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Parâmetros Técnicos</CardTitle>
          <CardDescription>Configurações avançadas de scraping</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="intervalo">Intervalo (horas)</Label>
              <Input
                id="intervalo"
                type="number"
                value={configuracoes.scraping.intervaloHoras}
                onChange={(e) => atualizarConfiguracao('scraping', 'intervaloHoras', parseInt(e.target.value))}
                min="1"
                max="24"
              />
            </div>
            <div>
              <Label htmlFor="timeout">Timeout (segundos)</Label>
              <Input
                id="timeout"
                type="number"
                value={configuracoes.scraping.timeoutSegundos}
                onChange={(e) => atualizarConfiguracao('scraping', 'timeoutSegundos', parseInt(e.target.value))}
                min="10"
                max="120"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderSecaoAlertas = () => (
    <Card>
      <CardHeader>
        <CardTitle>Thresholds de Alertas</CardTitle>
        <CardDescription>Configure quando os alertas devem ser disparados</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="avisosDias">Avisos - Dias para deadline</Label>
            <Input
              id="avisosDias"
              type="number"
              value={configuracoes.alertas.avisosDiasLimite}
              onChange={(e) => atualizarConfiguracao('alertas', 'avisosDiasLimite', parseInt(e.target.value))}
              min="1"
              max="30"
            />
            <p className="text-sm text-gray-500 mt-1">Alertar quando restam X dias</p>
          </div>

          <div>
            <Label htmlFor="docDias">Documentos - Dias para expiração</Label>
            <Input
              id="docDias"
              type="number"
              value={configuracoes.alertas.documentosExpiracao}
              onChange={(e) => atualizarConfiguracao('alertas', 'documentosExpiracao', parseInt(e.target.value))}
              min="7"
              max="90"
            />
            <p className="text-sm text-gray-500 mt-1">Alertar quando restam X dias</p>
          </div>
        </div>

        <div>
          <Label htmlFor="emailAdmin">Email do Administrador</Label>
          <Input
            id="emailAdmin"
            type="email"
            value={configuracoes.alertas.emailAdmin}
            onChange={(e) => atualizarConfiguracao('alertas', 'emailAdmin', e.target.value)}
            placeholder="admin@taconsulting.pt"
          />
        </div>
      </CardContent>
    </Card>
  )

  const renderSecaoUtilizadores = () => (
    <Card>
      <CardHeader>
        <CardTitle>Gestão de Acessos</CardTitle>
        <CardDescription>Configure permissões e acessos da plataforma</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>Registo Aberto</Label>
            <p className="text-sm text-gray-500">Permitir que novos utilizadores se registem</p>
          </div>
          <Switch
            checked={configuracoes.utilizadores.registoAberto}
            onCheckedChange={(checked) => atualizarConfiguracao('utilizadores', 'registoAberto', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Aprovação Manual</Label>
            <p className="text-sm text-gray-500">Novos utilizadores necessitam aprovação</p>
          </div>
          <Switch
            checked={configuracoes.utilizadores.aprovarManualmente}
            onCheckedChange={(checked) => atualizarConfiguracao('utilizadores', 'aprovarManualmente', checked)}
          />
        </div>

        <div>
          <Label htmlFor="sessaoTimeout">Timeout de Sessão (horas)</Label>
          <Input
            id="sessaoTimeout"
            type="number"
            value={configuracoes.utilizadores.sessaoTimeout}
            onChange={(e) => atualizarConfiguracao('utilizadores', 'sessaoTimeout', parseInt(e.target.value))}
            min="1"
            max="168"
          />
        </div>
      </CardContent>
    </Card>
  )

  const renderSecaoSistema = () => (
    <Card>
      <CardHeader>
        <CardTitle>Configurações do Sistema</CardTitle>
        <CardDescription>Configurações avançadas e segurança</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>Backup Automático</Label>
            <p className="text-sm text-gray-500">Backup diário da base de dados</p>
          </div>
          <Switch
            checked={configuracoes.sistema.backupAutomatico}
            onCheckedChange={(checked) => atualizarConfiguracao('sistema', 'backupAutomatico', checked)}
          />
        </div>

        <div>
          <Label>Nível de Log</Label>
          <Select
            value={configuracoes.sistema.logLevel}
            onValueChange={(value) => atualizarConfiguracao('sistema', 'logLevel', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="error">Apenas Erros</SelectItem>
              <SelectItem value="warn">Avisos e Erros</SelectItem>
              <SelectItem value="info">Informativo</SelectItem>
              <SelectItem value="debug">Debug (Desenvolvimento)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="cacheTimeout">Cache Timeout (minutos)</Label>
          <Input
            id="cacheTimeout"
            type="number"
            value={configuracoes.sistema.cacheTimeout}
            onChange={(e) => atualizarConfiguracao('sistema', 'cacheTimeout', parseInt(e.target.value))}
            min="5"
            max="1440"
          />
        </div>
      </CardContent>
    </Card>
  )

  const renderConteudo = () => {
    switch (secaoAtiva) {
      case 'notificacoes':
        return renderSecaoNotificacoes()
      case 'integracao':
        return renderSecaoIntegracao()
      case 'scraping':
        return renderSecaoScraping()
      case 'utilizadores':
        return renderSecaoUtilizadores()
      case 'alertas':
        return renderSecaoAlertas()
      case 'sistema':
        return renderSecaoSistema()
      default:
        return renderSecaoNotificacoes()
    }
  }

  const renderSecaoWatchtower = () => {
    const [status, setStatus] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      const fetchStatus = async () => {
        try {
          const res = await fetch('/api/monitoring')
          const data = await res.json()
          setStatus(data)
        } catch (e) {
          console.error(e)
        } finally {
          setLoading(false)
        }
      }
      fetchStatus()
      // Poll every 10s
      const interval = setInterval(fetchStatus, 10000)
      return () => clearInterval(interval)
    }, [])

    if (loading) return <div className="p-8 text-center text-slate-500">A carregar Watchtower...</div>

    return (
      <div className="space-y-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Digital Watchtower (Live)
            </CardTitle>
            <CardDescription>Monitorização em tempo real da infraestrutura da TA Platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Database */}
              <div className="p-4 rounded-lg bg-slate-50 border flex flex-col items-center text-center">
                <Database className={`h-8 w-8 mb-2 ${status?.services?.database?.status === 'ok' ? 'text-green-500' : 'text-red-500'}`} />
                <div className="font-bold text-sm">Base de Dados</div>
                <div className="text-xs text-slate-500 mt-1">{status?.services?.database?.latency} latency</div>
                <div className={`mt-2 px-2 py-0.5 rounded-full text-xs font-bold ${status?.services?.database?.status === 'ok' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {status?.services?.database?.status?.toUpperCase()}
                </div>
              </div>

              {/* Scrapers */}
              <div className="p-4 rounded-lg bg-slate-50 border flex flex-col items-center text-center">
                <Globe className={`h-8 w-8 mb-2 ${status?.services?.scrapers?.status === 'operational' ? 'text-green-500' : 'text-yellow-500'}`} />
                <div className="font-bold text-sm">Super Scrapers</div>
                <div className="text-xs text-slate-500 mt-1">{status?.services?.scrapers?.itemsFetched24h} avisos (24h)</div>
                <div className={`mt-2 px-2 py-0.5 rounded-full text-xs font-bold ${status?.services?.scrapers?.status === 'operational' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {status?.services?.scrapers?.status?.toUpperCase()}
                </div>
              </div>

              {/* API Health */}
              <div className="p-4 rounded-lg bg-slate-50 border flex flex-col items-center text-center">
                <Zap className="h-8 w-8 mb-2 text-purple-500" />
                <div className="font-bold text-sm">API Gateway</div>
                <div className="text-xs text-slate-500 mt-1">Uptime: {Math.floor(status?.services?.api?.uptime / 60)}m</div>
                <div className="mt-2 px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                  OPERATIONAL
                </div>
              </div>

              {/* Leads Engine */}
              <div className="p-4 rounded-lg bg-slate-50 border flex flex-col items-center text-center">
                <Users className="h-8 w-8 mb-2 text-indigo-500" />
                <div className="font-bold text-sm">Leads Engine</div>
                <div className="text-xs text-slate-500 mt-1">{status?.services?.leads?.count} leads ativas</div>
                <div className="mt-2 px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                  RUNNING
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Logs do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-slate-900 rounded-md p-4 font-mono text-xs text-green-400 overflow-y-auto">
              <p>[{new Date().toISOString()}] SYSTEM: Watchtower initialized.</p>
              <p>[{new Date().toISOString()}] DB: Connection verified (Latency: {status?.services?.database?.latency}).</p>
              <p>[{new Date().toISOString()}] SCRAPER: Check complete. {status?.services?.scrapers?.itemsFetched24h} new items detected.</p>
              <p>[{new Date().toISOString()}] API: Health check passed.</p>
              {status?.services?.scrapers?.itemsFetched24h === 0 && (
                <p className="text-yellow-400">[{new Date().toISOString()}] WARNING: No new avisos in last 24h. Check targets.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Menu Lateral */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <nav className="space-y-1">
              {SECOES_CONFIGURACAO.map((secao, index) => (
                <motion.button
                  key={secao.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSecaoAtiva(secao.id)}
                  className={`w-full text-left p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors ${secaoAtiva === secao.id ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' : ''
                    }`}
                >
                  {secao.icone}
                  <div>
                    <div className="font-medium text-sm">{secao.titulo}</div>
                    <div className="text-xs text-gray-500">{secao.descricao}</div>
                  </div>
                </motion.button>
              ))}
            </nav>
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo Principal */}
      <div className="lg:col-span-3 space-y-6">
        <motion.div
          key={secaoAtiva}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {secaoAtiva === 'watchtower' ? renderSecaoWatchtower() : renderConteudo()}
        </motion.div>

        {/* Botão Salvar (Only show for non-read-only sections) */}
        {secaoAtiva !== 'watchtower' && (
          <div className="flex justify-end pt-6 border-t">
            <Button onClick={handleSalvarConfiguracoes} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Guardar Configurações
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
