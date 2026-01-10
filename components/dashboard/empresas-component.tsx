
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
import {
  Building2,
  Search,
  Plus,
  Upload,
  Phone,
  Mail,
  MapPin,
  FileText,
  TrendingUp,
  AlertTriangle,
  Edit,
  Eye,
  ChevronLeft,
  ChevronRight,
  Star,
  Euro
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Textarea } from '@/components/ui/textarea'

interface Empresa {
  id: string
  nome: string
  nipc: string
  cae: string
  setor: string
  dimensao: string
  email: string
  telefone?: string
  morada?: string
  localidade?: string
  codigoPostal?: string
  distrito?: string
  regiao?: string
  contactoNome?: string
  contactoEmail?: string
  contactoTelefone?: string
  notas?: string
  ativa: boolean
  createdAt: string
  estatisticas: {
    totalCandidaturas: number
    candidaturasAprovadas: number
    totalFinanciamento: number
    documentosExpirados: number
  }
}

interface EmpresasData {
  empresas: Empresa[]
  pagination: {
    total: number
    pages: number
    page: number
    limit: number
  }
}

export function EmpresasComponent() {
  const [data, setData] = useState<EmpresasData | null>(null)
  const [loading, setLoading] = useState(true)
  const [empresaSelecionada, setEmpresaSelecionada] = useState<Empresa | null>(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [modoEdicao, setModoEdicao] = useState(false)
  const [formData, setFormData] = useState<Partial<Empresa>>({})

  // Filtros
  const [filtros, setFiltros] = useState({
    pesquisa: '',
    setor: 'TODOS',
    dimensao: 'TODOS',
    regiao: 'TODOS',
    page: 1
  })

  const fetchEmpresas = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        ...filtros,
        page: filtros.page.toString()
      })

      const response = await fetch(`/api/empresas?${params}`)
      if (!response.ok) throw new Error('Erro ao carregar empresas')

      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao carregar empresas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmpresas()
  }, [filtros])

  const handleFiltroChange = (key: string, value: any) => {
    setFiltros(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value
    }))
  }

  const handleSalvarEmpresa = async () => {
    try {
      const url = modoEdicao ? `/api/empresas/${empresaSelecionada?.id}` : '/api/empresas'
      const method = modoEdicao ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao salvar empresa')
      }

      toast.success(modoEdicao ? 'Empresa atualizada com sucesso' : 'Empresa criada com sucesso')
      setModalAberto(false)
      setFormData({})
      fetchEmpresas()
    } catch (error: any) {
      console.error('Erro:', error)
      toast.error(error.message || 'Erro ao salvar empresa')
    }
  }

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())

      if (lines.length < 2) {
        toast.error('Arquivo CSV deve ter pelo menos um cabeçalho e uma linha de dados')
        return
      }

      const headers = lines[0].split(',').map(h => h.trim())
      const empresas = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim())
        const empresa: any = {}

        headers.forEach((header, index) => {
          empresa[header.toLowerCase()] = values[index] || ''
        })

        return empresa
      })

      const response = await fetch('/api/empresas/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresas })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(result.message)
        fetchEmpresas()
      } else {
        toast.error(result.error || 'Erro no import')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao processar arquivo CSV')
    }

    // Limpar input
    event.target.value = ''
  }

  const getDimensaoBadge = (dimensao: string) => {
    const colors = {
      MICRO: 'bg-blue-100 text-blue-800',
      PEQUENA: 'bg-green-100 text-green-800',
      MEDIA: 'bg-yellow-100 text-yellow-800',
      GRANDE: 'bg-red-100 text-red-800'
    }

    return (
      <Badge className={colors[dimensao as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {dimensao}
      </Badge>
    )
  }

  const abrirModalEdicao = (empresa: Empresa) => {
    setEmpresaSelecionada(empresa)
    setFormData({ ...empresa })
    setModoEdicao(true)
    setModalAberto(true)
  }

  const abrirModalCriacao = () => {
    setEmpresaSelecionada(null)
    setFormData({
      nome: '',
      nipc: '',
      email: '',
      cae: '',
      setor: '',
      dimensao: 'MICRO'
    })
    setModoEdicao(false)
    setModalAberto(true)
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-gray-500">Carregando empresas...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtros e Ações */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Filtros & Ações
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={abrirModalCriacao}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Empresa
              </Button>

              <div className="relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImportCSV}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Import CSV
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Pesquisa */}
            <div>
              <Label>Pesquisa</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Nome, NIPC ou email..."
                  value={filtros.pesquisa}
                  onChange={(e) => handleFiltroChange('pesquisa', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Setor */}
            <div>
              <Label>Setor</Label>
              <Select value={filtros.setor} onValueChange={(value) => handleFiltroChange('setor', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos os Setores</SelectItem>
                  <SelectItem value="Tecnologias de Informação">Tecnologias de Informação</SelectItem>
                  <SelectItem value="Energia Renovável">Energia Renovável</SelectItem>
                  <SelectItem value="Agricultura">Agricultura</SelectItem>
                  <SelectItem value="Metalurgia">Metalurgia</SelectItem>
                  <SelectItem value="Turismo e Hotelaria">Turismo e Hotelaria</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dimensão */}
            <div>
              <Label>Dimensão</Label>
              <Select value={filtros.dimensao} onValueChange={(value) => handleFiltroChange('dimensao', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todas as Dimensões</SelectItem>
                  <SelectItem value="MICRO">Micro Empresa</SelectItem>
                  <SelectItem value="PEQUENA">Pequena Empresa</SelectItem>
                  <SelectItem value="MEDIA">Média Empresa</SelectItem>
                  <SelectItem value="GRANDE">Grande Empresa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Região */}
            <div>
              <Label>Região</Label>
              <Select value={filtros.regiao} onValueChange={(value) => handleFiltroChange('regiao', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todas as Regiões</SelectItem>
                  <SelectItem value="Norte">Norte</SelectItem>
                  <SelectItem value="Centro">Centro</SelectItem>
                  <SelectItem value="Lisboa">Lisboa</SelectItem>
                  <SelectItem value="Alentejo">Alentejo</SelectItem>
                  <SelectItem value="Algarve">Algarve</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Empresas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.empresas?.map((empresa, index) => (
          <motion.div
            key={empresa.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="card-premium hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{empresa.nome}</CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">{empresa.nipc}</code>
                      {getDimensaoBadge(empresa.dimensao)}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => abrirModalEdicao(empresa)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span>{empresa.setor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{empresa.email}</span>
                  </div>
                  {empresa.telefone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{empresa.telefone}</span>
                    </div>
                  )}
                  {empresa.localidade && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{empresa.localidade}, {empresa.regiao}</span>
                    </div>
                  )}
                </div>

                {/* Estatísticas */}
                <div className="border-t pt-3 grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span>{empresa.estatisticas.totalCandidaturas} candidaturas</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span>{empresa.estatisticas.candidaturasAprovadas} aprovadas</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Euro className="h-4 w-4 text-yellow-600" />
                    <span>€{empresa.estatisticas.totalFinanciamento.toLocaleString('pt-PT')}</span>
                  </div>
                  {empresa.estatisticas.documentosExpirados > 0 && (
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span>{empresa.estatisticas.documentosExpirados} docs expirados</span>
                    </div>
                  )}
                </div>

                {/* Contacto Principal */}
                {empresa.contactoNome && (
                  <div className="border-t pt-2 text-sm">
                    <div className="font-medium">{empresa.contactoNome}</div>
                    {empresa.contactoEmail && (
                      <div className="text-gray-500">{empresa.contactoEmail}</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Paginação */}
      {data?.pagination && data.pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Página {data.pagination.page} de {data.pagination.pages}
            ({data.pagination.total} empresas no total)
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

      {/* Modal de Edição/Criação */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900/95 backdrop-blur-xl border-slate-700">
          <DialogHeader>
            <DialogTitle>
              {modoEdicao ? 'Editar Empresa' : 'Nova Empresa'}
            </DialogTitle>
            <DialogDescription>
              {modoEdicao
                ? 'Atualize os dados da empresa selecionada'
                : 'Preencha os dados para criar uma nova empresa'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Dados Gerais */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Dados Gerais</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome da Empresa *</Label>
                  <Input
                    id="nome"
                    value={formData.nome || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Nome completo da empresa"
                  />
                </div>

                <div>
                  <Label htmlFor="nipc">NIPC *</Label>
                  <Input
                    id="nipc"
                    value={formData.nipc || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, nipc: e.target.value }))}
                    placeholder="Número de identificação"
                  />
                </div>

                <div>
                  <Label htmlFor="cae">CAE</Label>
                  <Input
                    id="cae"
                    value={formData.cae || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, cae: e.target.value }))}
                    placeholder="Código de Atividade Económica"
                  />
                </div>

                <div>
                  <Label htmlFor="setor">Setor</Label>
                  <Input
                    id="setor"
                    value={formData.setor || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, setor: e.target.value }))}
                    placeholder="Setor de atividade"
                  />
                </div>

                <div>
                  <Label>Dimensão da Empresa</Label>
                  <Select value={formData.dimensao || 'MICRO'} onValueChange={(value) => setFormData(prev => ({ ...prev, dimensao: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MICRO">Micro Empresa</SelectItem>
                      <SelectItem value="PEQUENA">Pequena Empresa</SelectItem>
                      <SelectItem value="MEDIA">Média Empresa</SelectItem>
                      <SelectItem value="GRANDE">Grande Empresa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@empresa.pt"
                  />
                </div>
              </div>
            </div>

            {/* Morada */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Morada</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="morada">Morada</Label>
                  <Input
                    id="morada"
                    value={formData.morada || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, morada: e.target.value }))}
                    placeholder="Rua, Avenida, etc."
                  />
                </div>

                <div>
                  <Label htmlFor="localidade">Localidade</Label>
                  <Input
                    id="localidade"
                    value={formData.localidade || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, localidade: e.target.value }))}
                    placeholder="Cidade ou localidade"
                  />
                </div>

                <div>
                  <Label htmlFor="codigoPostal">Código Postal</Label>
                  <Input
                    id="codigoPostal"
                    value={formData.codigoPostal || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, codigoPostal: e.target.value }))}
                    placeholder="0000-000"
                  />
                </div>

                <div>
                  <Label htmlFor="distrito">Distrito</Label>
                  <Input
                    id="distrito"
                    value={formData.distrito || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, distrito: e.target.value }))}
                    placeholder="Distrito"
                  />
                </div>

                <div>
                  <Label htmlFor="regiao">Região</Label>
                  <Select value={formData.regiao || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, regiao: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a região" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Norte">Norte</SelectItem>
                      <SelectItem value="Centro">Centro</SelectItem>
                      <SelectItem value="Lisboa">Lisboa</SelectItem>
                      <SelectItem value="Alentejo">Alentejo</SelectItem>
                      <SelectItem value="Algarve">Algarve</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Contactos */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Contactos</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                    placeholder="213 000 000"
                  />
                </div>

                <div>
                  <Label htmlFor="contactoNome">Nome do Contacto</Label>
                  <Input
                    id="contactoNome"
                    value={formData.contactoNome || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactoNome: e.target.value }))}
                    placeholder="Nome da pessoa de contacto"
                  />
                </div>

                <div>
                  <Label htmlFor="contactoEmail">Email do Contacto</Label>
                  <Input
                    id="contactoEmail"
                    type="email"
                    value={formData.contactoEmail || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactoEmail: e.target.value }))}
                    placeholder="contacto@empresa.pt"
                  />
                </div>

                <div>
                  <Label htmlFor="contactoTelefone">Telefone do Contacto</Label>
                  <Input
                    id="contactoTelefone"
                    value={formData.contactoTelefone || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactoTelefone: e.target.value }))}
                    placeholder="96x xxx xxx"
                  />
                </div>
              </div>
            </div>

            {/* Notas */}
            <div>
              <Label htmlFor="notas">Notas</Label>
              <Textarea
                id="notas"
                value={formData.notas || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, notas: e.target.value }))}
                placeholder="Observações adicionais sobre a empresa..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setModalAberto(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSalvarEmpresa}
                disabled={!formData.nome || !formData.nipc || !formData.email}
              >
                {modoEdicao ? 'Atualizar' : 'Criar'} Empresa
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
