
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  FileText,
  Building2,
  AlertTriangle,
  Calendar,
  Euro,
  Eye,
  Edit,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Banknote
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface Candidatura {
  id: string
  estado: string
  montanteSolicitado?: number
  montanteAprovado?: number
  dataSubmissao?: string
  dataDecisao?: string
  observacoes?: string
  documentosAnexos: string[]
  timeline: any[]
  empresa: {
    nome: string
    nipc: string
    setor: string
    dimensao: string
  }
  aviso: {
    nome: string
    portal: string
    programa: string
    codigo: string
    dataFimSubmissao: string
    montanteMaximo?: number
  }
}

interface KanbanData {
  A_PREPARAR: Candidatura[]
  SUBMETIDA: Candidatura[]
  EM_ANALISE: Candidatura[]
  APROVADA: Candidatura[]
  REJEITADA: Candidatura[]
}

export function CandidaturasComponent() {
  const [kanbanData, setKanbanData] = useState<KanbanData | null>(null)
  const [loading, setLoading] = useState(true)
  const [candidaturaSelecionada, setCandidaturaSelecionada] = useState<Candidatura | null>(null)
  const [modalDetalhes, setModalDetalhes] = useState(false)
  const [draggedItem, setDraggedItem] = useState<Candidatura | null>(null)

  const fetchCandidaturas = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/candidaturas')
      if (!response.ok) throw new Error('Erro ao carregar candidaturas')
      
      const result = await response.json()
      setKanbanData(result.kanban)
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao carregar candidaturas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCandidaturas()
  }, [])

  const handleMoverCandidatura = async (candidaturaId: string, novoEstado: string, observacoes?: string) => {
    try {
      const response = await fetch(`/api/candidaturas/${candidaturaId}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ novoEstado, observacoes })
      })

      if (!response.ok) throw new Error('Erro ao mover candidatura')

      toast.success('Estado da candidatura atualizado')
      fetchCandidaturas() // Recarregar dados
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao atualizar candidatura')
    }
  }

  const handleDragStart = (candidatura: Candidatura) => {
    setDraggedItem(candidatura)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, novoEstado: string) => {
    e.preventDefault()
    
    if (draggedItem && draggedItem.estado !== novoEstado) {
      handleMoverCandidatura(draggedItem.id, novoEstado, `Movido via drag & drop para ${getEstadoNome(novoEstado)}`)
    }
    
    setDraggedItem(null)
  }

  const getEstadoNome = (estado: string) => {
    const nomes = {
      A_PREPARAR: 'A Preparar',
      SUBMETIDA: 'Submetida',
      EM_ANALISE: 'Em Análise',
      APROVADA: 'Aprovada',
      REJEITADA: 'Rejeitada'
    }
    return nomes[estado as keyof typeof nomes] || estado
  }

  const getEstadoColor = (estado: string) => {
    const colors = {
      A_PREPARAR: 'bg-gray-100 border-gray-300',
      SUBMETIDA: 'bg-blue-100 border-blue-300',
      EM_ANALISE: 'bg-yellow-100 border-yellow-300',
      APROVADA: 'bg-green-100 border-green-300',
      REJEITADA: 'bg-red-100 border-red-300'
    }
    return colors[estado as keyof typeof colors] || 'bg-gray-100 border-gray-300'
  }

  const getEstadoBadge = (estado: string) => {
    const configs = {
      A_PREPARAR: { color: 'bg-gray-500', icon: Clock },
      SUBMETIDA: { color: 'bg-blue-500', icon: ArrowRight },
      EM_ANALISE: { color: 'bg-yellow-500', icon: Eye },
      APROVADA: { color: 'bg-green-500', icon: CheckCircle },
      REJEITADA: { color: 'bg-red-500', icon: XCircle }
    }
    
    const config = configs[estado as keyof typeof configs] || configs.A_PREPARAR
    const Icon = config.icon
    
    return (
      <Badge className={`${config.color} text-white border-0`}>
        <Icon className="h-3 w-3 mr-1" />
        {getEstadoNome(estado)}
      </Badge>
    )
  }

  const getDiasRestantes = (dataFim: string) => {
    const hoje = new Date()
    const deadline = new Date(dataFim)
    const diff = Math.ceil((deadline.getTime() - hoje.getTime()) / (1000 * 3600 * 24))
    return diff
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-gray-500">Carregando candidaturas...</div>
      </div>
    )
  }

  if (!kanbanData) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma candidatura encontrada</h3>
        <p className="text-gray-500">Comece criando uma nova candidatura.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(kanbanData).map(([estado, candidaturas]) => (
          <Card key={estado} className={`${getEstadoColor(estado)} border-2`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-center">
                {getEstadoNome(estado)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-center mb-1">
                {candidaturas.length}
              </div>
              {estado === 'APROVADA' && (
                <div className="text-xs text-center text-green-700">
                  €{candidaturas.reduce((sum: number, c: Candidatura) => sum + (c.montanteAprovado || 0), 0).toLocaleString('pt-PT')}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-[600px]">
        {Object.entries(kanbanData).map(([estado, candidaturas]) => (
          <div
            key={estado}
            className={`${getEstadoColor(estado)} rounded-lg p-4 border-2`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, estado)}
          >
            <h3 className="font-semibold text-lg mb-4 text-center sticky top-0 bg-white rounded px-2 py-1">
              {getEstadoNome(estado)} ({candidaturas.length})
            </h3>
            
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              <AnimatePresence>
                {candidaturas.map((candidatura: Candidatura, index: number) => (
                  <motion.div
                    key={candidatura.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    draggable
                    onDragStart={() => handleDragStart(candidatura)}
                    className="cursor-move"
                  >
                    <Card className="hover:shadow-lg transition-shadow bg-white">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-sm font-medium leading-tight mb-2">
                              {candidatura.empresa.nome}
                            </CardTitle>
                            <div className="space-y-1">
                              <div className="text-xs text-gray-600 flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {candidatura.empresa.setor}
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {candidatura.empresa.dimensao}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-3">
                        {/* Aviso */}
                        <div className="text-sm">
                          <div className="font-medium text-gray-900 mb-1 line-clamp-2">
                            {candidatura.aviso.nome}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {candidatura.aviso.portal}
                            </Badge>
                            <code className="text-xs bg-gray-100 px-1 rounded">
                              {candidatura.aviso.codigo}
                            </code>
                          </div>
                        </div>

                        {/* Montante */}
                        {candidatura.montanteSolicitado && (
                          <div className="text-sm space-y-1">
                            <div className="flex items-center gap-1">
                              <Euro className="h-3 w-3 text-blue-500" />
                              <span className="font-medium">
                                €{candidatura.montanteSolicitado.toLocaleString('pt-PT')}
                              </span>
                              <span className="text-gray-500">solicitado</span>
                            </div>
                            {candidatura.montanteAprovado && (
                              <div className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                <span className="font-medium text-green-700">
                                  €{candidatura.montanteAprovado.toLocaleString('pt-PT')}
                                </span>
                                <span className="text-gray-500">aprovado</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Deadline */}
                        <div className="text-xs">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Deadline: {new Date(candidatura.aviso.dataFimSubmissao).toLocaleDateString('pt-PT')}</span>
                          </div>
                          {getDiasRestantes(candidatura.aviso.dataFimSubmissao) <= 7 && (
                            <div className="flex items-center gap-1 text-red-600 mt-1">
                              <AlertTriangle className="h-3 w-3" />
                              <span className="font-medium">
                                {getDiasRestantes(candidatura.aviso.dataFimSubmissao)} dias restantes
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Ações */}
                        <div className="flex gap-2 pt-2 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              setCandidaturaSelecionada(candidatura)
                              setModalDetalhes(true)
                            }}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Ver
                          </Button>
                          
                          {candidatura.estado === 'A_PREPARAR' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleMoverCandidatura(candidatura.id, 'SUBMETIDA', 'Candidatura submetida')}
                            >
                              <ArrowRight className="h-3 w-3 mr-1" />
                              Submeter
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Detalhes */}
      <Dialog open={modalDetalhes} onOpenChange={setModalDetalhes}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Candidatura</DialogTitle>
            <DialogDescription>
              {candidaturaSelecionada?.empresa.nome} - {candidaturaSelecionada?.aviso.nome}
            </DialogDescription>
          </DialogHeader>

          {candidaturaSelecionada && (
            <div className="space-y-6">
              {/* Status e Montante */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Estado Atual</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {getEstadoBadge(candidaturaSelecionada.estado)}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Montante Solicitado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      €{(candidaturaSelecionada.montanteSolicitado || 0).toLocaleString('pt-PT')}
                    </div>
                  </CardContent>
                </Card>

                {candidaturaSelecionada.montanteAprovado && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Montante Aprovado</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        €{candidaturaSelecionada.montanteAprovado.toLocaleString('pt-PT')}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Informações da Empresa */}
              <Card>
                <CardHeader>
                  <CardTitle>Empresa</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong>Nome:</strong> {candidaturaSelecionada.empresa.nome}</div>
                  <div><strong>NIPC:</strong> {candidaturaSelecionada.empresa.nipc}</div>
                  <div><strong>Setor:</strong> {candidaturaSelecionada.empresa.setor}</div>
                  <div><strong>Dimensão:</strong> {candidaturaSelecionada.empresa.dimensao}</div>
                </CardContent>
              </Card>

              {/* Informações do Aviso */}
              <Card>
                <CardHeader>
                  <CardTitle>Aviso</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong>Nome:</strong> {candidaturaSelecionada.aviso.nome}</div>
                  <div><strong>Código:</strong> {candidaturaSelecionada.aviso.codigo}</div>
                  <div><strong>Portal:</strong> {candidaturaSelecionada.aviso.portal}</div>
                  <div><strong>Programa:</strong> {candidaturaSelecionada.aviso.programa}</div>
                  <div><strong>Deadline:</strong> {new Date(candidaturaSelecionada.aviso.dataFimSubmissao).toLocaleDateString('pt-PT')}</div>
                  {candidaturaSelecionada.aviso.montanteMaximo && (
                    <div><strong>Montante Máximo:</strong> €{candidaturaSelecionada.aviso.montanteMaximo.toLocaleString('pt-PT')}</div>
                  )}
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {candidaturaSelecionada.timeline.map((evento: any, index: number) => (
                      <div key={index} className="flex items-start gap-3 pb-4 border-b last:border-b-0">
                        <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{evento.evento}</div>
                          <div className="text-xs text-gray-500 mb-1">
                            {new Date(evento.data).toLocaleString('pt-PT')}
                          </div>
                          <div className="text-sm text-gray-700">{evento.detalhes}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Observações */}
              {candidaturaSelecionada.observacoes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Observações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {candidaturaSelecionada.observacoes}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Ações Rápidas */}
              <div className="flex gap-3 pt-4 border-t">
                <Select 
                  onValueChange={(novoEstado) => {
                    if (novoEstado !== candidaturaSelecionada.estado) {
                      handleMoverCandidatura(candidaturaSelecionada.id, novoEstado)
                      setModalDetalhes(false)
                    }
                  }}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Alterar estado..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A_PREPARAR">A Preparar</SelectItem>
                    <SelectItem value="SUBMETIDA">Submetida</SelectItem>
                    <SelectItem value="EM_ANALISE">Em Análise</SelectItem>
                    <SelectItem value="APROVADA">Aprovada</SelectItem>
                    <SelectItem value="REJEITADA">Rejeitada</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" onClick={() => setModalDetalhes(false)}>
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
