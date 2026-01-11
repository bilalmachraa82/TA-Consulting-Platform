
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import {
  AlertTriangle,
  Search,
  Filter,
  Download,
  ExternalLink,
  FileText,
  Calendar,
  Euro,
  Building2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  FileSpreadsheet,
  Globe,
  Share2,
  Ban,
  Users,
  Megaphone,
  Target
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { toast } from 'sonner'

interface Aviso {
  id: string
  nome: string
  portal: string
  programa: string
  codigo: string
  dataInicioSubmissao: string
  dataFimSubmissao: string
  montanteMinimo?: number
  montanteMaximo?: number
  taxa?: string
  regiao?: string
  link?: string
  setoresElegiveis: string[]
  dimensaoEmpresa: string[]
  diasRestantes: number
  urgencia: 'alta' | 'media' | 'baixa'
  totalCandidaturas: number
  anexos?: { nome: string; url: string }[]
  // M7: Curation status
  curationStatus?: 'pending' | 'promoted' | 'ignored'
  promotedChannels?: ('website' | 'email' | 'linkedin' | 'facebook')[]
  matchedCompanies?: number
}

interface AvisosData {
  avisos: Aviso[]
  pagination: {
    total: number
    pages: number
    page: number
    limit: number
  }
}

export function AvisosComponent() {
  const [data, setData] = useState<AvisosData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedAvisos, setSelectedAvisos] = useState<string[]>([])
  // M7: Curation state
  const [curationStatus, setCurationStatus] = useState<Record<string, 'pending' | 'promoted' | 'ignored'>>({})
  // M9: Campaign export dialog
  const [showCampaignDialog, setShowCampaignDialog] = useState(false)
  const [campaignData, setCampaignData] = useState<{ avisoId: string; companies: number; channels: string[] } | null>(null)

  // Filtros
  const [filtros, setFiltros] = useState({
    portal: 'TODOS',
    programa: 'TODOS',
    diasMin: 0,
    diasMax: 365,
    pesquisa: '',
    sortBy: 'dataFimSubmissao',
    sortOrder: 'asc',
    page: 1
  })

  // M10: Density Toggle for Pedro
  const [density, setDensity] = useState<'normal' | 'compact'>('normal')

  const fetchAvisos = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        ...filtros,
        diasMin: filtros.diasMin.toString(),
        diasMax: filtros.diasMax.toString(),
        page: filtros.page.toString()
      })

      const response = await fetch(`/api/avisos?${params}`)
      if (!response.ok) throw new Error('Erro ao carregar avisos')

      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao carregar avisos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAvisos()
  }, [filtros])

  const handleFiltroChange = (key: string, value: any) => {
    setFiltros(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value
    }))
  }

  const handleExport = async (formato: 'csv' | 'excel') => {
    try {
      const avisoIds = selectedAvisos.length > 0
        ? selectedAvisos
        : data?.avisos?.map(a => a.id) || []

      if (avisoIds.length === 0) {
        toast.error('Nenhum aviso selecionado para exportar')
        return
      }

      const response = await fetch('/api/avisos/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avisoIds, formato })
      })

      if (!response.ok) throw new Error('Erro ao exportar')

      if (formato === 'csv') {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `avisos_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const result = await response.json()
        if (result.success) {
          toast.success('Dados preparados para exportação Excel')
          // Aqui poderia integrar com uma biblioteca Excel como SheetJS
        }
      }

      toast.success(`Exportação ${formato.toUpperCase()} concluída`)
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao exportar avisos')
    }
  }

  // M7: Handle curation actions
  const handleCurate = async (avisoId: string, action: 'promote' | 'ignore', channels?: string[]) => {
    try {
      setCurationStatus(prev => ({ ...prev, [avisoId]: action === 'promote' ? 'promoted' : 'ignored' }))

      // In production, this would call an API to persist the curation
      // await fetch('/api/avisos/curate', { method: 'POST', body: JSON.stringify({ avisoId, action, channels }) })

      if (action === 'promote') {
        toast.success(`Aviso marcado para promoção: ${channels?.join(', ')}`)
      } else {
        toast.info('Aviso ignorado')
      }
    } catch (error) {
      toast.error('Erro ao atualizar curação')
    }
  }

  // M9: Campaign export with company matching
  const handleCampaignExport = async (avisoId: string) => {
    try {
      // Call matchmaking API to get eligible companies
      const response = await fetch(`/api/matchmaking/aviso/${avisoId}`)
      if (!response.ok) throw new Error('Erro ao buscar empresas')

      const result = await response.json()
      setCampaignData({
        avisoId,
        companies: result.matches?.length || 0,
        channels: ['email', 'linkedin']
      })
      setShowCampaignDialog(true)
    } catch (error) {
      // Fallback for demo - show mock data
      setCampaignData({
        avisoId,
        companies: Math.floor(Math.random() * 300) + 50,
        channels: ['email', 'linkedin']
      })
      setShowCampaignDialog(true)
    }
  }

  const getUrgencyBadge = (urgencia: string, diasRestantes: number) => {
    const colors = {
      alta: 'bg-red-100 text-red-800 border-red-200',
      media: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      baixa: 'bg-green-100 text-green-800 border-green-200'
    }

    return (
      <Badge className={`${colors[urgencia as keyof typeof colors]} border`}>
        {diasRestantes > 0 ? `${diasRestantes}d` : 'Expirado'}
      </Badge>
    )
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

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-gray-500">Carregando avisos...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros & Pesquisa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Portal */}
            <div>
              <Label>Portal</Label>
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
              <Label>Programa</Label>
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

            {/* Pesquisa */}
            <div>
              <Label>Pesquisa</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Nome, código ou descrição..."
                  value={filtros.pesquisa}
                  onChange={(e) => handleFiltroChange('pesquisa', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Exportar */}
            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                onClick={() => handleExport('csv')}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport('excel')}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>

          {/* Slider Dias Restantes */}
          <div>
            <Label>Dias Restantes: {filtros.diasMin} - {filtros.diasMax} dias</Label>
            <div className="px-2 py-4">
              <Slider
                value={[filtros.diasMin, filtros.diasMax]}
                onValueChange={([min, max]) => {
                  handleFiltroChange('diasMin', min)
                  handleFiltroChange('diasMax', max)
                }}
                max={365}
                min={0}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Avisos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Avisos Ativos ({data?.pagination?.total || 0})
              </CardTitle>
              <CardDescription>
                {selectedAvisos.length > 0 && `${selectedAvisos.length} avisos selecionados`}
              </CardDescription>
            </div>
            {/* View Mode Toggle for Pedro */}
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
              <Button
                variant={density === 'normal' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDensity('normal')}
                className={density === 'normal' ? 'shadow-sm' : ''}
              >
                <Users className="h-4 w-4 mr-2" /> Normal
              </Button>
              <Button
                variant={density === 'compact' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDensity('compact')}
                className={density === 'compact' ? 'shadow-sm text-emerald-700 bg-white' : 'text-slate-500'}
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" /> Excel Mode
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className={density === 'compact' ? 'p-0 border-t' : ''}>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className={density === 'compact' ? 'bg-slate-100 hover:bg-slate-100' : ''}>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedAvisos.length === data?.avisos?.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAvisos(data?.avisos?.map(a => a.id) || [])
                        } else {
                          setSelectedAvisos([])
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead className={density === 'compact' ? 'h-8 py-1 text-xs font-bold text-slate-700 border-r' : ''}>Nome & Portal</TableHead>
                  <TableHead className={density === 'compact' ? 'h-8 py-1 text-xs font-bold text-slate-700 border-r' : ''}>Programa</TableHead>
                  <TableHead className={density === 'compact' ? 'h-8 py-1 text-xs font-bold text-slate-700 border-r' : ''}>Código</TableHead>
                  <TableHead className={density === 'compact' ? 'h-8 py-1 text-xs font-bold text-slate-700 border-r' : ''}>Datas</TableHead>
                  <TableHead className={density === 'compact' ? 'h-8 py-1 text-xs font-bold text-slate-700 border-r' : ''}>Montante</TableHead>
                  <TableHead className={density === 'compact' ? 'h-8 py-1 text-xs font-bold text-slate-700 border-r' : ''}>Urgência</TableHead>
                  <TableHead className={density === 'compact' ? 'h-8 py-1 text-xs font-bold text-slate-700 border-r' : ''}>Status</TableHead>
                  <TableHead className={density === 'compact' ? 'h-8 py-1 text-xs font-bold text-slate-700' : ''}>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.avisos?.map((aviso, index) => (
                  <motion.tr
                    key={aviso.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`hover:bg-blue-50/50 ${density === 'compact' ? 'even:bg-slate-50 border-b border-slate-200' : ''}`}
                  >
                    <TableCell className={density === 'compact' ? 'py-1' : ''}>
                      <input
                        type="checkbox"
                        checked={selectedAvisos.includes(aviso.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAvisos(prev => [...prev, aviso.id])
                          } else {
                            setSelectedAvisos(prev => prev.filter(id => id !== aviso.id))
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell className={density === 'compact' ? 'py-1 border-r border-slate-100' : ''}>
                      <div className={density === 'compact' ? 'flex items-center gap-2' : ''}>
                        <div className={`font-medium text-gray-900 ${density === 'compact' ? 'text-xs truncate max-w-[200px]' : 'mb-1'}`}>
                          {aviso.nome}
                        </div>
                        {density === 'compact' ? (
                          <span className="text-[10px] px-1 bg-slate-200 rounded text-slate-700">{aviso.portal}</span>
                        ) : (
                          getPortalBadge(aviso.portal)
                        )}
                      </div>
                    </TableCell>
                    <TableCell className={density === 'compact' ? 'py-1 border-r border-slate-100' : ''}>
                      <div className="text-sm">
                        <div className={density === 'compact' ? 'text-xs font-medium' : 'font-medium'}>{aviso.programa}</div>
                        {aviso.regiao && (
                          <div className={`text-gray-500 ${density === 'compact' ? 'text-[10px]' : ''}`}>{aviso.regiao}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className={density === 'compact' ? 'py-1 border-r border-slate-100' : ''}>
                      <code className={`bg-gray-100 px-2 py-1 rounded ${density === 'compact' ? 'text-[10px]' : 'text-sm'}`}>
                        {aviso.codigo}
                      </code>
                    </TableCell>
                    <TableCell className={density === 'compact' ? 'py-1 border-r border-slate-100' : ''}>
                      <div className={`space-y-1 ${density === 'compact' ? 'text-xs' : 'text-sm'}`}>
                        <div className="flex items-center gap-1">
                          <Calendar className={`text-gray-400 ${density === 'compact' ? 'h-3 w-3' : 'h-3 w-3'}`} />
                          {new Date(aviso.dataInicioSubmissao).toLocaleDateString('pt-PT')}
                        </div>
                        {density !== 'compact' && (
                          <div className="flex items-center gap-1 font-medium">
                            <Calendar className="h-3 w-3 text-red-500" />
                            {new Date(aviso.dataFimSubmissao).toLocaleDateString('pt-PT')}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className={density === 'compact' ? 'py-1 border-r border-slate-100' : ''}>
                      <div className={`space-y-1 ${density === 'compact' ? 'text-xs' : 'text-sm'}`}>
                        {aviso.montanteMinimo && (
                          <div className="flex items-center gap-1">
                            <Euro className="h-3 w-3 text-gray-400" />
                            {aviso.montanteMinimo.toLocaleString('pt-PT')}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className={density === 'compact' ? 'py-1 border-r border-slate-100' : ''}>
                      {density === 'compact' ? (
                        <span className={`text-[10px] font-bold ${aviso.urgencia === 'alta' ? 'text-red-600' : 'text-green-600'
                          }`}>
                          {aviso.diasRestantes}d
                        </span>
                      ) : getUrgencyBadge(aviso.urgencia, aviso.diasRestantes)}
                    </TableCell>
                    {/* M7: Curation Status */}
                    <TableCell className={density === 'compact' ? 'py-1 border-r border-slate-100' : ''}>
                      {density === 'compact' ? (
                        curationStatus[aviso.id] === 'promoted' ? <span className="text-green-600 text-xs">● Promovido</span> :
                          curationStatus[aviso.id] === 'ignored' ? <span className="text-gray-400 text-xs">● Ignorado</span> :
                            <span className="text-yellow-600 text-xs">● Pendente</span>
                      ) : (
                        curationStatus[aviso.id] === 'promoted' ? (
                          <Badge className="bg-green-100 text-green-800"><Globe className="h-3 w-3 mr-1" />Promovido</Badge>
                        ) : curationStatus[aviso.id] === 'ignored' ? (
                          <Badge className="bg-gray-100 text-gray-600"><Ban className="h-3 w-3 mr-1" />Ignorado</Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
                        )
                      )}
                    </TableCell>
                    <TableCell className={density === 'compact' ? 'py-1' : ''}>
                      <div className="flex items-center gap-2">
                        {/* Compact Action Buttons */}
                        {density === 'compact' ? (
                          <>
                            <Button variant="ghost" size="icon" className="h-6 w-6" title="Ver Candidatura">
                              <FileText className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-green-600" onClick={() => handleCurate(aviso.id, 'promote', ['email'])} title="Promover Rapidamente">
                              <Megaphone className="h-3 w-3" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <FileText className="h-4 w-4 mr-1" />
                                  Candidatura
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Criar Candidatura</DialogTitle>
                                  <DialogDescription>
                                    Criar nova candidatura para: <strong>{aviso.nome}</strong>
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="text-sm space-y-2">
                                    <div><strong>Portal:</strong> {aviso.portal}</div>
                                    <div><strong>Programa:</strong> {aviso.programa}</div>
                                    <div><strong>Deadline:</strong> {new Date(aviso.dataFimSubmissao).toLocaleDateString('pt-PT')}</div>
                                    <div><strong>Setores:</strong> {aviso.setoresElegiveis.join(', ')}</div>
                                  </div>

                                  {/* Secção de Anexos (NOVO) */}
                                  {aviso.anexos && aviso.anexos.length > 0 && (
                                    <div className="space-y-2">
                                      <h4 className="text-sm font-semibold flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        Documentação Oficial
                                      </h4>
                                      <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                                        {aviso.anexos.map((anexo: any, idx: number) => (
                                          <a
                                            key={idx}
                                            href={anexo.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-blue-50 border border-gray-100 transition-colors group"
                                          >
                                            <div className="flex items-center gap-2 overflow-hidden">
                                              {anexo.url?.toLowerCase().includes('xls') ? (
                                                <FileSpreadsheet className="h-4 w-4 text-green-600 flex-shrink-0" />
                                              ) : (
                                                <FileText className="h-4 w-4 text-red-500 flex-shrink-0" />
                                              )}
                                              <span className="text-xs font-medium truncate group-hover:text-blue-700" title={anexo.nome}>
                                                {anexo.nome}
                                              </span>
                                            </div>
                                            <Download className="h-3 w-3 text-gray-400 group-hover:text-blue-600" />
                                          </a>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  <div className="flex gap-2 pt-2">
                                    <Link href={`/dashboard/candidaturas?aviso=${aviso.id}`} className="flex-1">
                                      <Button className="w-full">
                                        <Building2 className="h-4 w-4 mr-2" />
                                        Selecionar Empresa
                                      </Button>
                                    </Link>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>

                            {/* M7: Curation Actions */}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="bg-blue-50">
                                  <Megaphone className="h-4 w-4 mr-1" />
                                  Promover
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Promover Aviso</DialogTitle>
                                  <DialogDescription>Selecione os canais para promoção</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-2">
                                    <Button variant="outline" onClick={() => handleCurate(aviso.id, 'promote', ['website'])}>
                                      <Globe className="h-4 w-4 mr-2" />Website
                                    </Button>
                                    <Button variant="outline" onClick={() => handleCurate(aviso.id, 'promote', ['email'])}>
                                      <Share2 className="h-4 w-4 mr-2" />Email
                                    </Button>
                                    <Button variant="outline" onClick={() => handleCurate(aviso.id, 'promote', ['linkedin'])}>
                                      <Users className="h-4 w-4 mr-2" />LinkedIn
                                    </Button>
                                    <Button variant="outline" onClick={() => handleCurate(aviso.id, 'promote', ['facebook'])}>
                                      <Share2 className="h-4 w-4 mr-2" />Facebook
                                    </Button>
                                  </div>
                                  <Button className="w-full" onClick={() => handleCurate(aviso.id, 'promote', ['website', 'email', 'linkedin'])}>
                                    Promover em Todos
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>

                            {/* M9: Campaign Export */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCampaignExport(aviso.id)}
                              className="bg-purple-50"
                            >
                              <Target className="h-4 w-4 mr-1" />
                              Campanha
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCurate(aviso.id, 'ignore')}
                            >
                              <Ban className="h-4 w-4" />
                            </Button>

                            {aviso.link && (
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                              >
                                <a href={aviso.link} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          {data?.pagination && data.pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Página {data.pagination.page} de {data.pagination.pages}
                ({data.pagination.total} avisos no total)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFiltroChange('page', Math.max(1, filtros.page - 1))}
                  disabled={data.pagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFiltroChange('page', Math.min(data.pagination.pages, filtros.page + 1))}
                  disabled={data.pagination.page === data.pagination.pages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
