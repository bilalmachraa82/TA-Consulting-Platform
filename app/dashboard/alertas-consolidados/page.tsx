'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    AlertTriangle,
    FileText,
    Calendar,
    TrendingUp,
    RefreshCw,
    ChevronRight,
    Bell
} from 'lucide-react'
import Link from 'next/link'

interface Alerta {
    id: string
    tipo: 'AVISO_URGENTE' | 'DOCUMENTO_EXPIRA' | 'CANDIDATURA_PRAZO'
    prioridade: 'ALTA' | 'MEDIA' | 'BAIXA'
    titulo: string
    descricao: string
    empresa: {
        id: string
        nome: string
    }
    dataLimite?: string
    link?: string
}

interface Resumo {
    total: number
    alta: number
    media: number
    baixa: number
}

export default function AlertasConsolidadosPage() {
    const [alertas, setAlertas] = useState<Alerta[]>([])
    const [resumo, setResumo] = useState<Resumo | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [filtro, setFiltro] = useState<'TODOS' | 'ALTA' | 'MEDIA' | 'BAIXA'>('TODOS')

    const fetchData = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/alertas/consolidados')
            if (!response.ok) throw new Error('Erro ao carregar alertas')
            const data = await response.json()
            setAlertas(data.alertas)
            setResumo(data.resumo)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const getAlertIcon = (tipo: string) => {
        switch (tipo) {
            case 'AVISO_URGENTE':
                return <TrendingUp className="h-5 w-5" />
            case 'DOCUMENTO_EXPIRA':
                return <FileText className="h-5 w-5" />
            case 'CANDIDATURA_PRAZO':
                return <Calendar className="h-5 w-5" />
            default:
                return <AlertTriangle className="h-5 w-5" />
        }
    }

    const getPrioridadeColor = (prioridade: string) => {
        switch (prioridade) {
            case 'ALTA':
                return 'bg-red-100 text-red-800 border-red-200'
            case 'MEDIA':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'BAIXA':
                return 'bg-green-100 text-green-800 border-green-200'
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const getCardBorder = (prioridade: string) => {
        switch (prioridade) {
            case 'ALTA':
                return 'border-l-4 border-l-red-500'
            case 'MEDIA':
                return 'border-l-4 border-l-yellow-500'
            case 'BAIXA':
                return 'border-l-4 border-l-green-500'
            default:
                return ''
        }
    }

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return null
        const date = new Date(dateStr)
        const now = new Date()
        const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        if (diffDays < 0) return 'Expirado'
        if (diffDays === 0) return 'Hoje'
        if (diffDays === 1) return 'Amanhã'
        if (diffDays <= 7) return `${diffDays} dias`
        return date.toLocaleDateString('pt-PT')
    }

    const alertasFiltrados = filtro === 'TODOS'
        ? alertas
        : alertas.filter(a => a.prioridade === filtro)

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-600">{error}</p>
                <Button onClick={fetchData} className="mt-4">
                    Tentar novamente
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Alertas Consolidados</h1>
                    <p className="text-gray-500">
                        Todos os alertas das suas empresas num só lugar
                    </p>
                </div>
                <Button onClick={fetchData} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Atualizar
                </Button>
            </div>

            {/* Summary Cards */}
            {resumo && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card
                        className={`cursor-pointer transition-all ${filtro === 'TODOS' ? 'ring-2 ring-blue-500' : ''}`}
                        onClick={() => setFiltro('TODOS')}
                    >
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Total</p>
                                    <p className="text-2xl font-bold">{resumo.total}</p>
                                </div>
                                <Bell className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        className={`cursor-pointer transition-all ${filtro === 'ALTA' ? 'ring-2 ring-red-500' : ''}`}
                        onClick={() => setFiltro('ALTA')}
                    >
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Prioridade Alta</p>
                                    <p className="text-2xl font-bold text-red-600">{resumo.alta}</p>
                                </div>
                                <AlertTriangle className="h-8 w-8 text-red-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        className={`cursor-pointer transition-all ${filtro === 'MEDIA' ? 'ring-2 ring-yellow-500' : ''}`}
                        onClick={() => setFiltro('MEDIA')}
                    >
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Prioridade Média</p>
                                    <p className="text-2xl font-bold text-yellow-600">{resumo.media}</p>
                                </div>
                                <Calendar className="h-8 w-8 text-yellow-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        className={`cursor-pointer transition-all ${filtro === 'BAIXA' ? 'ring-2 ring-green-500' : ''}`}
                        onClick={() => setFiltro('BAIXA')}
                    >
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Prioridade Baixa</p>
                                    <p className="text-2xl font-bold text-green-600">{resumo.baixa}</p>
                                </div>
                                <FileText className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Alerts List */}
            <div className="space-y-3">
                {alertasFiltrados.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">
                                {filtro === 'TODOS' ? 'Sem alertas' : `Sem alertas de prioridade ${filtro.toLowerCase()}`}
                            </h3>
                            <p className="text-gray-500 mt-1">
                                Excelente! Não há nada que necessite da sua atenção imediata.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    alertasFiltrados.map((alerta) => (
                        <Card
                            key={alerta.id}
                            className={`hover:shadow-md transition-shadow ${getCardBorder(alerta.prioridade)}`}
                        >
                            <CardContent className="py-4">
                                <div className="flex items-center gap-4">
                                    {/* Icon */}
                                    <div className={`p-2 rounded-lg ${getPrioridadeColor(alerta.prioridade)}`}>
                                        {getAlertIcon(alerta.tipo)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium text-gray-900 truncate">
                                                {alerta.titulo}
                                            </h3>
                                            <Badge className={getPrioridadeColor(alerta.prioridade)}>
                                                {alerta.prioridade}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-500 truncate">{alerta.descricao}</p>
                                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                                            <span>Empresa: {alerta.empresa.nome}</span>
                                            {alerta.dataLimite && (
                                                <span className="font-medium">
                                                    Prazo: {formatDate(alerta.dataLimite)}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action */}
                                    {alerta.link && (
                                        <Button asChild variant="ghost" size="sm">
                                            <Link href={alerta.link}>
                                                <ChevronRight className="h-5 w-5" />
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
