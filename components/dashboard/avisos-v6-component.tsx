/**
 * Avisos Component v6 - Simplificado
 *
 * Focus no essencial: NUT + TIP matching
 * - Lista de avisos com colunas NUT, TIP, Count Empresas
 * - Marcação "Interessa/Não Interessa"
 * - Export CSV para importação Bitrix
 * - Filtros: Abertos/Planear, NUT, TIP
 */

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
import {
    AlertTriangle,
    Search,
    Filter,
    Download,
    ExternalLink,
    FileText,
    Calendar,
    Euro,
    Check,
    X,
    MapPin,
    Tag,
    Building2,
    ChevronLeft,
    ChevronRight,
    Users,
    FileSpreadsheet,
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { toast } from 'sonner'

// ============================================================================
// INTERFACES
// ============================================================================

interface AvisoV6 {
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
    // v6: NUT + TIP
    nutsCompativeis?: string[]
    tipCompativeis?: string[]
    caeCompativeis?: string | null
    link?: string
    ativo: boolean
    // Calculated fields
    diasRestantes: number
    matchedCompanies?: number
    // User curation
    interesse?: 'interessa' | 'nao_interessa' | 'por_decidir'
}

interface AvisosDataV6 {
    avisos: AvisoV6[]
    pagination: {
        total: number
        pages: number
        page: number
        limit: number
    }
}

// ============================================================================
// CONSTANTS
// ============================================================================

const NUT_OPTIONS = [
    'Todos',
    'Norte',
    'Centro',
    'Lisboa',
    'Alentejo',
    'Algarve',
    'Açores',
    'Madeira'
]

const TIP_OPTIONS = [
    'Todos',
    'Empresa',
    'IPSS',
    'Associação',
    'Poder Central',
    'Poder Local',
    'Agricultura',
    'Educação',
    'Regulador'
]

const INTERESSE_OPTIONS = [
    { value: 'todos', label: 'Todos', icon: null },
    { value: 'por_decidir', label: 'Por Decidir', icon: null },
    { value: 'interessa', label: 'Interessa', icon: Check },
    { value: 'nao_interessa', label: 'Não Interessa', icon: X },
]

// ============================================================================
// COMPONENT
// ============================================================================

export function AvisosV6Component() {
    const [data, setData] = useState<AvisosDataV6 | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedAvisos, setSelectedAvisos] = useState<string[]>([])
    const [interesseFilter, setInteresseFilter] = useState<string>('todos')

    // Filtros v6
    const [filtros, setFiltros] = useState({
        portal: 'TODOS',
        programa: 'TODOS',
        nut: 'Todos',
        tip: 'Todos',
        interesse: 'todos' as 'todos' | 'interessa' | 'nao_interessa' | 'por_decidir',
        pesquisa: '',
        sortBy: 'dataFimSubmissao',
        sortOrder: 'asc',
        page: 1
    })

    // Local state for interesse (persist in localStorage in production)
    const [interesseState, setInteresseState] = useState<Record<string, 'interessa' | 'nao_interessa' | 'por_decidir'>>({})

    // Load interesse state from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('avisosInteresse')
        if (saved) {
            setInteresseState(JSON.parse(saved))
        }
    }, [])

    // Save interesse state to localStorage
    const saveInteresseState = (avisoId: string, value: 'interessa' | 'nao_interessa' | 'por_decidir') => {
        const newState = { ...interesseState, [avisoId]: value }
        setInteresseState(newState)
        localStorage.setItem('avisosInteresse', JSON.stringify(newState))
    }

    const fetchAvisos = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams()

            // Build query params
            Object.entries(filtros).forEach(([key, value]) => {
                if (key === 'nut' && value === 'Todos') return
                if (key === 'tip' && value === 'Todos') return
                if (key === 'interesse' && value === 'todos') return
                if (value && value !== 'TODOS') {
                    params.append(key, String(value))
                }
            })

            const response = await fetch(`/api/avisos?${params}`)
            if (!response.ok) throw new Error('Erro ao carregar avisos')

            const result = await response.json()

            // Add NUT/TIP fields and calculated fields to each aviso
            const enrichedAvisos = (result.avisos || []).map((aviso: any) => ({
                ...aviso,
                nutsCompativeis: aviso.nutsCompativeis || ['Nacional'],
                tipCompativeis: aviso.tipCompativeis || ['Empresa'],
                diasRestantes: Math.ceil(
                    (new Date(aviso.dataFimSubmissao).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                ),
                interesse: interesseState[aviso.id] || 'por_decidir',
                matchedCompanies: Math.floor(Math.random() * 300) + 20 // Mock - replace with real API
            }))

            setData({
                avisos: enrichedAvisos,
                pagination: result.pagination || { total: enrichedAvisos.length, pages: 1, page: 1, limit: 50 }
            })
        } catch (error) {
            console.error('Erro:', error)
            toast.error('Erro ao carregar avisos')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAvisos()
    }, [filtros, interesseState])

    const handleFiltroChange = (key: string, value: any) => {
        setFiltros(prev => ({
            ...prev,
            [key]: value,
            page: key !== 'page' ? 1 : value
        }))
    }

    // Export CSV para Bitrix
    const handleExportCSV = async (avisoId?: string) => {
        try {
            const avisoIds = avisoId
                ? [avisoId]
                : selectedAvisos.length > 0
                    ? selectedAvisos
                    : data?.avisos?.filter(a => a.interesse === 'interessa').map(a => a.id) || []

            if (avisoIds.length === 0) {
                toast.error('Nenhum aviso selecionado para exportar')
                return
            }

            const response = await fetch('/api/avisos/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    avisoIds,
                    formato: 'csv',
                    includeMatches: true // Include empresas matched
                })
            })

            if (!response.ok) throw new Error('Erro ao exportar')

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `avisos_bitrix_${new Date().toISOString().split('T')[0]}.csv`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

            toast.success('CSV exportado com sucesso - pronto para importar no Bitrix')
        } catch (error) {
            console.error('Erro:', error)
            toast.error('Erro ao exportar CSV')
        }
    }

    const getUrgencyBadge = (diasRestantes: number) => {
        if (diasRestantes < 0) {
            return <Badge className="bg-gray-100 text-gray-600 border-gray-300">Expirado</Badge>
        }
        if (diasRestantes <= 14) {
            return <Badge className="bg-red-100 text-red-800 border-red-200">{diasRestantes}d</Badge>
        }
        if (diasRestantes <= 30) {
            return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">{diasRestantes}d</Badge>
        }
        return <Badge className="bg-green-100 text-green-800 border-green-200">{diasRestantes}d</Badge>
    }

    const getPortalBadge = (portal: string) => {
        const colors: Record<string, string> = {
            PORTUGAL2030: 'bg-blue-100 text-blue-800',
            PRR: 'bg-green-100 text-green-800',
            PEPAC: 'bg-purple-100 text-purple-800',
        }
        return (
            <Badge className={colors[portal] || 'bg-gray-100 text-gray-800'}>
                {portal}
            </Badge>
        )
    }

    const getInteresseBadge = (interesse: 'interessa' | 'nao_interessa' | 'por_decidir') => {
        switch (interesse) {
            case 'interessa':
                return (
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                        <Check className="h-3 w-3 mr-1" /> Interessa
                    </Badge>
                )
            case 'nao_interessa':
                return (
                    <Badge className="bg-slate-100 text-slate-600 border-slate-200">
                        <X className="h-3 w-3 mr-1" /> Não
                    </Badge>
                )
            default:
                return (
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                        Por Decidir
                    </Badge>
                )
        }
    }

    const filteredAvisos = data?.avisos?.filter(aviso => {
        if (filtros.nut !== 'Todos' && aviso.nutsCompativeis) {
            if (!aviso.nutsCompativeis.includes(filtros.nut)) return false
        }
        if (filtros.tip !== 'Todos' && aviso.tipCompativeis) {
            if (!aviso.tipCompativeis.includes(filtros.tip)) return false
        }
        if (filtros.interesse !== 'todos') {
            if (aviso.interesse !== filtros.interesse) return false
        }
        if (filtros.pesquisa) {
            const searchLower = filtros.pesquisa.toLowerCase()
            if (!aviso.nome.toLowerCase().includes(searchLower) &&
                !aviso.codigo.toLowerCase().includes(searchLower)) {
                return false
            }
        }
        return true
    }) || []

    if (loading && !data) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-pulse text-gray-500">Carregando avisos...</div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header v6 */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Avisos v6</h2>
                    <p className="text-sm text-gray-500">
                        Matching NUT + TIP • {filteredAvisos.length} avisos •{' '}
                        {filteredAvisos.filter(a => a.interesse === 'interessa').length} interessam
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => handleExportCSV()}
                        disabled={filteredAvisos.filter(a => a.interesse === 'interessa').length === 0}
                    >
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Export CSV (Interessam)
                    </Button>
                </div>
            </div>

            {/* Filtros v6 - Simplificado */}
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Filter className="h-5 w-5" />
                        Filtros Rápidos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                        {/* NUT Filter */}
                        <div>
                            <Label className="text-xs text-gray-500">NUT (Região)</Label>
                            <Select value={filtros.nut} onValueChange={(v) => handleFiltroChange('nut', v)}>
                                <SelectTrigger className="h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {NUT_OPTIONS.map(opt => (
                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* TIP Filter */}
                        <div>
                            <Label className="text-xs text-gray-500">TIP (Tipo)</Label>
                            <Select value={filtros.tip} onValueChange={(v) => handleFiltroChange('tip', v)}>
                                <SelectTrigger className="h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {TIP_OPTIONS.map(opt => (
                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Interesse Filter */}
                        <div>
                            <Label className="text-xs text-gray-500">Interesse</Label>
                            <Select value={filtros.interesse} onValueChange={(v) => handleFiltroChange('interesse', v)}>
                                <SelectTrigger className="h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todos">Todos</SelectItem>
                                    <SelectItem value="por_decidir">Por Decidir</SelectItem>
                                    <SelectItem value="interessa">Interessa</SelectItem>
                                    <SelectItem value="nao_interessa">Não Interessa</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Portal Filter */}
                        <div>
                            <Label className="text-xs text-gray-500">Portal</Label>
                            <Select value={filtros.portal} onValueChange={(v) => handleFiltroChange('portal', v)}>
                                <SelectTrigger className="h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TODOS">Todos</SelectItem>
                                    <SelectItem value="PORTUGAL2030">PT2030</SelectItem>
                                    <SelectItem value="PRR">PRR</SelectItem>
                                    <SelectItem value="PEPAC">PEPAC</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Search */}
                        <div className="col-span-2">
                            <Label className="text-xs text-gray-500">Pesquisa</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Nome ou código..."
                                    value={filtros.pesquisa}
                                    onChange={(e) => handleFiltroChange('pesquisa', e.target.value)}
                                    className="pl-9 h-9"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabela v6 - Focada em NUT/TIP */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50">
                                    <TableHead className="w-10">Interesse</TableHead>
                                    <TableHead>Nome & Portal</TableHead>
                                    <TableHead className="w-24">Código</TableHead>
                                    <TableHead className="w-32">NUTs</TableHead>
                                    <TableHead className="w-32">TIPs</TableHead>
                                    <TableHead className="w-20">Empresas</TableHead>
                                    <TableHead className="w-20">Prazo</TableHead>
                                    <TableHead className="w-24">Montante</TableHead>
                                    <TableHead className="w-16">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAvisos.map((aviso, index) => (
                                    <motion.tr
                                        key={aviso.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        className={`hover:bg-blue-50/30 border-b ${
                                            aviso.interesse === 'interessa' ? 'bg-emerald-50/30' :
                                            aviso.interesse === 'nao_interessa' ? 'bg-slate-50/50' : ''
                                        }`}
                                    >
                                        {/* Interesse Toggle */}
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => saveInteresseState(aviso.id, 'interessa')}
                                                    className={`p-1 rounded transition-colors ${
                                                        aviso.interesse === 'interessa'
                                                            ? 'bg-emerald-500 text-white'
                                                            : 'bg-gray-100 text-gray-400 hover:bg-emerald-100'
                                                    }`}
                                                    title="Interessa"
                                                >
                                                    <Check className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => saveInteresseState(aviso.id, 'nao_interessa')}
                                                    className={`p-1 rounded transition-colors ${
                                                        aviso.interesse === 'nao_interessa'
                                                            ? 'bg-slate-600 text-white'
                                                            : 'bg-gray-100 text-gray-400 hover:bg-slate-200'
                                                    }`}
                                                    title="Não interessa"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </TableCell>

                                        {/* Nome & Portal */}
                                        <TableCell>
                                            <div className="max-w-xs">
                                                <div className="font-medium text-gray-900 truncate text-sm">
                                                    {aviso.nome}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {getPortalBadge(aviso.portal)}
                                                    {getInteresseBadge(aviso.interesse)}
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Código */}
                                        <TableCell>
                                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                {aviso.codigo}
                                            </code>
                                        </TableCell>

                                        {/* NUTs */}
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {aviso.nutsCompativeis?.slice(0, 2).map((nut, i) => (
                                                    <Badge key={i} variant="outline" className="text-xs">
                                                        <MapPin className="h-2.5 w-2.5 mr-1" />
                                                        {nut}
                                                    </Badge>
                                                ))}
                                                {(aviso.nutsCompativeis?.length ?? 0) > 2 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{aviso.nutsCompativeis!.length - 2}
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>

                                        {/* TIPs */}
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {aviso.tipCompativeis?.slice(0, 2).map((tip, i) => (
                                                    <Badge key={i} variant="outline" className="text-xs">
                                                        <Tag className="h-2.5 w-2.5 mr-1" />
                                                        {tip}
                                                    </Badge>
                                                ))}
                                                {(aviso.tipCompativeis?.length ?? 0) > 2 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{aviso.tipCompativeis!.length - 2}
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>

                                        {/* Empresas Matched */}
                                        <TableCell>
                                            <div className="flex items-center gap-1 text-sm">
                                                <Users className="h-3 w-3 text-blue-500" />
                                                <span className="font-medium text-blue-700">
                                                    {aviso.matchedCompanies}
                                                </span>
                                            </div>
                                        </TableCell>

                                        {/* Prazo */}
                                        <TableCell>
                                            {getUrgencyBadge(aviso.diasRestantes)}
                                        </TableCell>

                                        {/* Montante */}
                                        <TableCell>
                                            <div className="text-sm">
                                                {aviso.montanteMaximo ? (
                                                    <span className="font-medium">
                                                        €{(aviso.montanteMaximo / 1000).toFixed(0)}k
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </div>
                                        </TableCell>

                                        {/* Ações */}
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                {/* Export CSV for this aviso */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() => handleExportCSV(aviso.id)}
                                                    title="Export CSV para Bitrix"
                                                >
                                                    <FileSpreadsheet className="h-3.5 w-3.5 text-green-600" />
                                                </Button>

                                                {/* View details */}
                                                {aviso.link && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7"
                                                        asChild
                                                    >
                                                        <a href={aviso.link} target="_blank" rel="noopener noreferrer">
                                                            <ExternalLink className="h-3.5 w-3.5" />
                                                        </a>
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </motion.tr>
                                ))}

                                {filteredAvisos.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                                            Nenhum aviso encontrado com os filtros selecionados
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Paginação Simplificada */}
                    {data?.pagination && data.pagination.pages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t">
                            <div className="text-sm text-gray-500">
                                {filteredAvisos.length} de {data.pagination.total} avisos
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleFiltroChange('page', Math.max(1, filtros.page - 1))}
                                    disabled={filtros.page === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="flex items-center px-3 text-sm">
                                    Página {filtros.page}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleFiltroChange('page', Math.min(data.pagination.pages, filtros.page + 1))}
                                    disabled={filtros.page === data.pagination.pages}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Resumo */}
            <div className="grid grid-cols-3 gap-4">
                <Card className={filteredAvisos.filter(a => a.interesse === 'interessa').length > 0 ? 'bg-emerald-50 border-emerald-200' : ''}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                <Check className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Interessam</p>
                                <p className="text-2xl font-bold text-emerald-700">
                                    {filteredAvisos.filter(a => a.interesse === 'interessa').length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className={filteredAvisos.filter(a => a.interesse === 'por_decidir').length > 0 ? 'bg-amber-50 border-amber-200' : ''}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                                <AlertTriangle className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Por Decidir</p>
                                <p className="text-2xl font-bold text-amber-700">
                                    {filteredAvisos.filter(a => a.interesse === 'por_decidir').length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Empresas Matched</p>
                                <p className="text-2xl font-bold text-blue-700">
                                    {filteredAvisos.reduce((sum, a) => sum + (a.matchedCompanies || 0), 0).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
