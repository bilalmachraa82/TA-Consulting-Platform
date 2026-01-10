
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Calendar,
  Clock,
  AlertTriangle,
  List,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Building2,
  Euro,
  FileText
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import Link from 'next/link'

interface EventoCalendario {
  id: string
  avisoId: string
  tipo: 'inicio' | 'deadline'
  titulo: string
  data: string
  aviso: {
    nome: string
    codigo: string
    portal: string
    programa: string
    montanteMaximo?: number
    link?: string
  }
  diasRestantes: number
  urgencia: 'alta' | 'media' | 'baixa'
  candidaturas: number
}

interface CalendarioData {
  view: 'calendario' | 'lista'
  eventosPorData?: { [key: string]: EventoCalendario[] }
  eventos?: EventoCalendario[]
  totalEventos: number
}

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

export function CalendarioComponent() {
  const [data, setData] = useState<CalendarioData | null>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'calendario' | 'lista'>('calendario')
  const [mesAtual, setMesAtual] = useState(new Date())
  
  // Filtros
  const [filtros, setFiltros] = useState({
    portal: 'TODOS',
    programa: 'TODOS'
  })

  const fetchEventos = async () => {
    try {
      setLoading(true)
      const mesFormatado = `${mesAtual.getFullYear()}-${String(mesAtual.getMonth() + 1).padStart(2, '0')}`
      
      const params = new URLSearchParams({
        ...filtros,
        view,
        mes: view === 'calendario' ? mesFormatado : ''
      })

      const response = await fetch(`/api/calendario?${params}`)
      if (!response.ok) throw new Error('Erro ao carregar calendário')
      
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao carregar calendário')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEventos()
  }, [view, mesAtual, filtros])

  const handleFiltroChange = (key: string, value: any) => {
    setFiltros(prev => ({ ...prev, [key]: value }))
  }

  const navegarMes = (direcao: 'anterior' | 'proximo') => {
    setMesAtual(prev => {
      const novaData = new Date(prev)
      if (direcao === 'anterior') {
        novaData.setMonth(novaData.getMonth() - 1)
      } else {
        novaData.setMonth(novaData.getMonth() + 1)
      }
      return novaData
    })
  }

  const getUrgencyColor = (urgencia: string) => {
    const colors = {
      alta: 'bg-red-500 text-white',
      media: 'bg-yellow-500 text-white',
      baixa: 'bg-green-500 text-white'
    }
    return colors[urgencia as keyof typeof colors] || 'bg-gray-500 text-white'
  }

  const getPortalBadge = (portal: string) => {
    const colors = {
      PORTUGAL2030: 'bg-blue-100 text-blue-800',
      PRR: 'bg-green-100 text-green-800',
      PEPAC: 'bg-purple-100 text-purple-800'
    }
    
    return (
      <Badge className={colors[portal as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {portal}
      </Badge>
    )
  }

  const renderCalendario = () => {
    if (!data?.eventosPorData) return null

    // Gerar dias do calendário
    const primeiroDia = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1)
    const ultimoDia = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0)
    const diasNoMes = ultimoDia.getDate()
    const diaSemanaPrimeiro = primeiroDia.getDay()

    const dias = []
    
    // Dias do mês anterior (espaços vazios)
    for (let i = 0; i < diaSemanaPrimeiro; i++) {
      dias.push(null)
    }

    // Dias do mês atual
    for (let dia = 1; dia <= diasNoMes; dia++) {
      const dataKey = `${mesAtual.getFullYear()}-${String(mesAtual.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
      const eventosNoDia = data.eventosPorData[dataKey] || []
      
      dias.push({
        dia,
        dataKey,
        eventos: eventosNoDia,
        temEventos: eventosNoDia.length > 0
      })
    }

    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Cabeçalho dos dias da semana */}
        {DIAS_SEMANA.map(dia => (
          <div key={dia} className="p-3 text-center font-medium text-gray-500 bg-gray-50">
            {dia}
          </div>
        ))}
        
        {/* Dias do calendário */}
        {dias.map((item, index) => (
          <div
            key={index}
            className={`min-h-[100px] border p-2 ${
              item ? 'bg-white hover:bg-gray-50' : 'bg-gray-100'
            } ${item?.temEventos ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}
          >
            {item && (
              <>
                <div className="font-medium text-sm mb-1">{item.dia}</div>
                <div className="space-y-1">
                  {item.eventos.slice(0, 2).map(evento => (
                    <div
                      key={evento.id}
                      className={`text-xs p-1 rounded truncate ${
                        evento.tipo === 'deadline' 
                          ? getUrgencyColor(evento.urgencia)
                          : 'bg-blue-100 text-blue-800'
                      }`}
                      title={evento.titulo}
                    >
                      {evento.tipo === 'deadline' ? '⏰' : '📅'} {evento.aviso.nome.substring(0, 15)}...
                    </div>
                  ))}
                  {item.eventos.length > 2 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{item.eventos.length - 2} mais
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    )
  }

  const renderLista = () => {
    if (!data?.eventos) return null

    return (
      <div className="space-y-4">
        {data.eventos.map((evento, index) => (
          <motion.div
            key={evento.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className={`border-l-4 ${
              evento.urgencia === 'alta' ? 'border-l-red-500' : 
              evento.urgencia === 'media' ? 'border-l-yellow-500' : 'border-l-green-500'
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{evento.aviso.nome}</CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      {getPortalBadge(evento.aviso.portal)}
                      <Badge variant="outline">{evento.aviso.codigo}</Badge>
                      <Badge className={getUrgencyColor(evento.urgencia)}>
                        {evento.diasRestantes > 0 ? `${evento.diasRestantes} dias` : 'Expirado'}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {new Date(evento.data).getDate()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {MESES[new Date(evento.data).getMonth()].substring(0, 3)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="text-sm space-y-1">
                  <div><strong>Programa:</strong> {evento.aviso.programa}</div>
                  <div><strong>Deadline:</strong> {new Date(evento.data).toLocaleDateString('pt-PT')}</div>
                  {evento.aviso.montanteMaximo && (
                    <div><strong>Montante Máximo:</strong> €{evento.aviso.montanteMaximo.toLocaleString('pt-PT')}</div>
                  )}
                </div>

                {evento.diasRestantes <= 7 && evento.diasRestantes > 0 && (
                  <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-700 font-medium">
                      Urgente: Deadline em {evento.diasRestantes} dias!
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>{evento.candidaturas} candidaturas</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link href={`/dashboard/candidaturas?aviso=${evento.avisoId}`}>
                      <Button variant="outline" size="sm">
                        <Building2 className="h-4 w-4 mr-1" />
                        Criar Candidatura
                      </Button>
                    </Link>
                    
                    {evento.aviso.link && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={evento.aviso.link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Ver Aviso
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-gray-500">Carregando calendário...</div>
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
              <Calendar className="h-5 w-5" />
              Filtros & Vista
            </CardTitle>
            
            {/* Toggle Vista */}
            <div className="flex gap-2">
              <Button
                variant={view === 'calendario' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('calendario')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Calendário
              </Button>
              <Button
                variant={view === 'lista' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('lista')}
              >
                <List className="h-4 w-4 mr-2" />
                Lista
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Portal */}
            <div>
              <Select value={filtros.portal} onValueChange={(value) => handleFiltroChange('portal', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos os Portais</SelectItem>
                  <SelectItem value="PORTUGAL2030">Portugal 2030</SelectItem>
                  <SelectItem value="PRR">PRR</SelectItem>
                  <SelectItem value="PEPAC">PEPAC</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Programa */}
            <div>
              <Select value={filtros.programa} onValueChange={(value) => handleFiltroChange('programa', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos os Programas</SelectItem>
                  <SelectItem value="Valorizar">Programa Valorizar</SelectItem>
                  <SelectItem value="Competir">Programa Competir+</SelectItem>
                  <SelectItem value="Componente">Componente PRR</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Navegação de Mês (só para calendário) */}
            {view === 'calendario' && (
              <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" onClick={() => navegarMes('anterior')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="font-medium">
                  {MESES[mesAtual.getMonth()]} {mesAtual.getFullYear()}
                </span>
                <Button variant="outline" size="sm" onClick={() => navegarMes('proximo')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data?.totalEventos || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Urgentes (≤7 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {view === 'lista' 
                ? data?.eventos?.filter(e => e.urgencia === 'alta').length || 0
                : Object.values(data?.eventosPorData || {}).flat().filter(e => e.urgencia === 'alta').length
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-1">
              <Clock className="h-4 w-4 text-yellow-500" />
              Médio Prazo (≤15 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {view === 'lista' 
                ? data?.eventos?.filter(e => e.urgencia === 'media').length || 0
                : Object.values(data?.eventosPorData || {}).flat().filter(e => e.urgencia === 'media').length
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Sem Pressa (&gt;15 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {view === 'lista' 
                ? data?.eventos?.filter(e => e.urgencia === 'baixa').length || 0
                : Object.values(data?.eventosPorData || {}).flat().filter(e => e.urgencia === 'baixa').length
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo Principal */}
      <Card>
        <CardHeader>
          <CardTitle>
            {view === 'calendario' 
              ? `Calendário - ${MESES[mesAtual.getMonth()]} ${mesAtual.getFullYear()}` 
              : 'Lista de Deadlines'}
          </CardTitle>
          <CardDescription>
            {view === 'calendario' 
              ? 'Vista mensal com todos os deadlines e eventos' 
              : 'Lista cronológica dos próximos deadlines ordenados por data'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {view === 'calendario' ? renderCalendario() : renderLista()}
          
          {(!data || (view === 'lista' && data.eventos?.length === 0) || 
            (view === 'calendario' && Object.keys(data.eventosPorData || {}).length === 0)) && (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum evento encontrado</h3>
              <p className="text-gray-500">
                {view === 'calendario' 
                  ? 'Não há eventos neste mês com os filtros selecionados.' 
                  : 'Não há deadlines próximos com os filtros selecionados.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
