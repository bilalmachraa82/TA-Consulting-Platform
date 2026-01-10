
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
import { Textarea } from '@/components/ui/textarea'
import { 
  FileText,
  Upload,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Building2,
  Calendar,
  Plus,
  Edit,
  Trash2,
  Download,
  Eye
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface Documento {
  id: string
  tipoDocumento: string
  nome: string
  cloudStoragePath: string
  dataEmissao?: string
  dataValidade?: string
  statusValidade: 'VALIDO' | 'A_EXPIRAR' | 'EXPIRADO' | 'EM_FALTA'
  observacoes?: string
  empresa: {
    nome: string
    nipc: string
    dimensao: string
  }
  createdAt: string
}

interface DocumentosData {
  documentos: Documento[]
  stats: {
    total: number
    validos: number
    aExpirar: number
    expirados: number
    emFalta: number
  }
}

const TIPOS_DOCUMENTO = {
  CERTIDAO_AT: 'Certidão AT',
  CERTIDAO_SS: 'Certidão SS',
  CERTIFICADO_PME: 'Certificado PME',
  LICENCA_ATIVIDADE: 'Licença de Atividade',
  BALANCO: 'Balanço',
  DEMONSTRACOES_FINANCEIRAS: 'Demonstrações Financeiras',
  OUTRO: 'Outro'
}

const STATUS_COLORS = {
  VALIDO: 'bg-green-100 text-green-800 border-green-200',
  A_EXPIRAR: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  EXPIRADO: 'bg-red-100 text-red-800 border-red-200',
  EM_FALTA: 'bg-gray-100 text-gray-800 border-gray-200'
}

const STATUS_ICONS = {
  VALIDO: CheckCircle,
  A_EXPIRAR: Clock,
  EXPIRADO: XCircle,
  EM_FALTA: AlertTriangle
}

export function DocumentacaoComponent() {
  const [data, setData] = useState<DocumentosData | null>(null)
  const [empresas, setEmpresas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [modoEdicao, setModoEdicao] = useState(false)
  const [documentoSelecionado, setDocumentoSelecionado] = useState<Documento | null>(null)
  const [formData, setFormData] = useState<any>({})
  
  // Filtros
  const [filtros, setFiltros] = useState({
    empresa: 'TODAS',
    tipo: 'TODOS',
    status: 'TODOS',
    pesquisa: ''
  })

  const fetchDocumentos = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams(filtros)
      
      const response = await fetch(`/api/documentos?${params}`)
      if (!response.ok) throw new Error('Erro ao carregar documentos')
      
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao carregar documentos')
    } finally {
      setLoading(false)
    }
  }

  const fetchEmpresas = async () => {
    try {
      const response = await fetch('/api/empresas')
      if (!response.ok) throw new Error('Erro ao carregar empresas')
      
      const result = await response.json()
      setEmpresas(result.empresas || [])
    } catch (error) {
      console.error('Erro:', error)
    }
  }

  useEffect(() => {
    fetchDocumentos()
  }, [filtros])

  useEffect(() => {
    fetchEmpresas()
  }, [])

  const handleFiltroChange = (key: string, value: any) => {
    setFiltros(prev => ({ ...prev, [key]: value }))
  }

  const handleSalvarDocumento = async () => {
    try {
      const url = modoEdicao ? `/api/documentos/${documentoSelecionado?.id}` : '/api/documentos'
      const method = modoEdicao ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao salvar documento')
      }

      toast.success(modoEdicao ? 'Documento atualizado com sucesso' : 'Documento adicionado com sucesso')
      setModalAberto(false)
      setFormData({})
      fetchDocumentos()
    } catch (error: any) {
      console.error('Erro:', error)
      toast.error(error.message || 'Erro ao salvar documento')
    }
  }

  const handleRemoverDocumento = async (id: string) => {
    if (!confirm('Tem a certeza que pretende remover este documento?')) {
      return
    }

    try {
      const response = await fetch(`/api/documentos/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Erro ao remover documento')

      toast.success('Documento removido com sucesso')
      fetchDocumentos()
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao remover documento')
    }
  }

  const abrirModalCriacao = () => {
    setDocumentoSelecionado(null)
    setFormData({
      empresaId: '',
      tipoDocumento: '',
      nome: '',
      dataEmissao: '',
      dataValidade: '',
      statusValidade: 'VALIDO',
      observacoes: ''
    })
    setModoEdicao(false)
    setModalAberto(true)
  }

  const abrirModalEdicao = (documento: Documento) => {
    setDocumentoSelecionado(documento)
    setFormData({
      empresaId: documento.empresa ? documento.empresa.nome : '',
      tipoDocumento: documento.tipoDocumento,
      nome: documento.nome,
      dataEmissao: documento.dataEmissao ? documento.dataEmissao.split('T')[0] : '',
      dataValidade: documento.dataValidade ? documento.dataValidade.split('T')[0] : '',
      statusValidade: documento.statusValidade,
      observacoes: documento.observacoes || ''
    })
    setModoEdicao(true)
    setModalAberto(true)
  }

  const getStatusBadge = (status: string) => {
    const statusNames = {
      VALIDO: 'Válido',
      A_EXPIRAR: 'A Expirar',
      EXPIRADO: 'Expirado',
      EM_FALTA: 'Em Falta'
    }
    
    const Icon = STATUS_ICONS[status as keyof typeof STATUS_ICONS]
    
    return (
      <Badge className={`${STATUS_COLORS[status as keyof typeof STATUS_COLORS]} border flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {statusNames[status as keyof typeof statusNames]}
      </Badge>
    )
  }

  const getDiasParaExpirar = (dataValidade: string) => {
    if (!dataValidade) return null
    
    const hoje = new Date()
    const expira = new Date(dataValidade)
    const diff = Math.ceil((expira.getTime() - hoje.getTime()) / (1000 * 3600 * 24))
    
    return diff
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-gray-500">Carregando documentos...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data?.stats.total || 0}</div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Válidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{data?.stats.validos || 0}</div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-1">
              <Clock className="h-4 w-4 text-yellow-600" />
              A Expirar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{data?.stats.aExpirar || 0}</div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-1">
              <XCircle className="h-4 w-4 text-red-600" />
              Expirados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{data?.stats.expirados || 0}</div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-gray-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-gray-600" />
              Em Falta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-600">{data?.stats.emFalta || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Ações */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Filtros
            </CardTitle>
            <Button onClick={abrirModalCriacao}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Documento
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Empresa */}
            <div>
              <Label>Empresa</Label>
              <Select value={filtros.empresa} onValueChange={(value) => handleFiltroChange('empresa', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODAS">Todas as Empresas</SelectItem>
                  {empresas.map(empresa => (
                    <SelectItem key={empresa.id} value={empresa.id}>
                      {empresa.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tipo */}
            <div>
              <Label>Tipo de Documento</Label>
              <Select value={filtros.tipo} onValueChange={(value) => handleFiltroChange('tipo', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos os Tipos</SelectItem>
                  {Object.entries(TIPOS_DOCUMENTO).map(([key, nome]) => (
                    <SelectItem key={key} value={key}>{nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div>
              <Label>Status</Label>
              <Select value={filtros.status} onValueChange={(value) => handleFiltroChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos os Status</SelectItem>
                  <SelectItem value="VALIDO">Válidos</SelectItem>
                  <SelectItem value="A_EXPIRAR">A Expirar</SelectItem>
                  <SelectItem value="EXPIRADO">Expirados</SelectItem>
                  <SelectItem value="EM_FALTA">Em Falta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Pesquisa */}
            <div>
              <Label>Pesquisa</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Nome do documento..."
                  value={filtros.pesquisa}
                  onChange={(e) => handleFiltroChange('pesquisa', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Documentos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data?.documentos?.map((documento, index) => {
          const diasParaExpirar = getDiasParaExpirar(documento.dataValidade || '')
          
          return (
            <motion.div
              key={documento.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`hover:shadow-lg transition-shadow ${
                documento.statusValidade === 'EXPIRADO' ? 'border-red-200' :
                documento.statusValidade === 'A_EXPIRAR' ? 'border-yellow-200' :
                'border-gray-200'
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{documento.nome}</CardTitle>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {TIPOS_DOCUMENTO[documento.tipoDocumento as keyof typeof TIPOS_DOCUMENTO]}
                          </Badge>
                          {getStatusBadge(documento.statusValidade)}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => abrirModalEdicao(documento)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoverDocumento(documento.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {/* Empresa */}
                  <div className="text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{documento.empresa.nome}</span>
                    </div>
                    <div className="text-gray-500 ml-6">
                      NIPC: {documento.empresa.nipc} • {documento.empresa.dimensao}
                    </div>
                  </div>

                  {/* Datas */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {documento.dataEmissao && (
                      <div>
                        <div className="text-gray-500">Emissão</div>
                        <div className="font-medium flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(documento.dataEmissao).toLocaleDateString('pt-PT')}
                        </div>
                      </div>
                    )}
                    
                    {documento.dataValidade && (
                      <div>
                        <div className="text-gray-500">Validade</div>
                        <div className={`font-medium flex items-center gap-1 ${
                          documento.statusValidade === 'EXPIRADO' ? 'text-red-600' :
                          documento.statusValidade === 'A_EXPIRAR' ? 'text-yellow-600' : 'text-gray-900'
                        }`}>
                          <Calendar className="h-3 w-3" />
                          {new Date(documento.dataValidade).toLocaleDateString('pt-PT')}
                          {diasParaExpirar !== null && diasParaExpirar <= 30 && (
                            <span className="text-xs ml-1">
                              ({diasParaExpirar > 0 ? `${diasParaExpirar}d` : 'expirado'})
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Alertas */}
                  {documento.statusValidade === 'EXPIRADO' && (
                    <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-700 font-medium">
                        Documento expirado! Renovação necessária.
                      </span>
                    </div>
                  )}

                  {documento.statusValidade === 'A_EXPIRAR' && diasParaExpirar !== null && diasParaExpirar <= 15 && (
                    <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <Clock className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-yellow-700 font-medium">
                        Expira em {diasParaExpirar} dias. Considere renovar.
                      </span>
                    </div>
                  )}

                  {/* Observações */}
                  {documento.observacoes && (
                    <div className="text-sm">
                      <div className="text-gray-500">Observações</div>
                      <div className="text-gray-700 italic">&quot;{documento.observacoes}&quot;</div>
                    </div>
                  )}

                  {/* Ações */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      Visualizar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {(!data?.documentos || data.documentos.length === 0) && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum documento encontrado</h3>
          <p className="text-gray-500">Comece adicionando documentos das empresas.</p>
        </div>
      )}

      {/* Modal de Criação/Edição */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {modoEdicao ? 'Editar Documento' : 'Novo Documento'}
            </DialogTitle>
            <DialogDescription>
              {modoEdicao 
                ? 'Atualize as informações do documento' 
                : 'Adicione um novo documento ao sistema'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Empresa */}
            <div>
              <Label htmlFor="empresa">Empresa *</Label>
              <Select 
                value={formData.empresaId || ''} 
                onValueChange={(value) => setFormData((prev: any) => ({ ...prev, empresaId: value }))}
                disabled={modoEdicao}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a empresa..." />
                </SelectTrigger>
                <SelectContent>
                  {empresas.map(empresa => (
                    <SelectItem key={empresa.id} value={empresa.id}>
                      {empresa.nome} ({empresa.nipc})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tipo */}
              <div>
                <Label htmlFor="tipo">Tipo de Documento *</Label>
                <Select 
                  value={formData.tipoDocumento || ''} 
                  onValueChange={(value) => setFormData((prev: any) => ({ ...prev, tipoDocumento: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TIPOS_DOCUMENTO).map(([key, nome]) => (
                      <SelectItem key={key} value={key}>{nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.statusValidade || 'VALIDO'} 
                  onValueChange={(value) => setFormData((prev: any) => ({ ...prev, statusValidade: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VALIDO">Válido</SelectItem>
                    <SelectItem value="A_EXPIRAR">A Expirar</SelectItem>
                    <SelectItem value="EXPIRADO">Expirado</SelectItem>
                    <SelectItem value="EM_FALTA">Em Falta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Nome */}
            <div>
              <Label htmlFor="nome">Nome do Documento *</Label>
              <Input
                id="nome"
                value={formData.nome || ''}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, nome: e.target.value }))}
                placeholder="Ex: Certidão AT - Janeiro 2024"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Data Emissão */}
              <div>
                <Label htmlFor="dataEmissao">Data de Emissão</Label>
                <Input
                  id="dataEmissao"
                  type="date"
                  value={formData.dataEmissao || ''}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, dataEmissao: e.target.value }))}
                />
              </div>

              {/* Data Validade */}
              <div>
                <Label htmlFor="dataValidade">Data de Validade</Label>
                <Input
                  id="dataValidade"
                  type="date"
                  value={formData.dataValidade || ''}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, dataValidade: e.target.value }))}
                />
              </div>
            </div>

            {/* Observações */}
            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes || ''}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Informações adicionais sobre o documento..."
                rows={3}
              />
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setModalAberto(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSalvarDocumento}
                disabled={!formData.empresaId || !formData.tipoDocumento || !formData.nome}
              >
                {modoEdicao ? 'Atualizar' : 'Adicionar'} Documento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
