'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Building2,
    FileText,
    AlertTriangle,
    TrendingUp,
    ArrowRight,
    Plus,
    RefreshCw
} from 'lucide-react'
import Link from 'next/link'

interface Empresa {
    id: string
    nome: string
    nipc: string
    setor: string
    dimensao: string
    candidaturas: Array<{
        id: string
        estado: string
        aviso: {
            id: string
            nome: string
            dataFimSubmissao: string
            urgente: boolean
        }
    }>
    documentos: Array<{
        id: string
        tipoDocumento: string
        statusValidade: string
    }>
}

interface Stats {
    totalEmpresas: number
    candidaturasAtivas: number
    documentosProblematicos: number
    avisosUrgentes: number
}

export default function MinhasEmpresasPage() {
    const [empresas, setEmpresas] = useState<Empresa[]>([])
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/empresas/by-consultor')
            if (!response.ok) throw new Error('Erro ao carregar dados')
            const data = await response.json()
            setEmpresas(data.empresas)
            setStats(data.stats)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const getStatusColor = (empresa: Empresa) => {
        if (empresa.documentos.length > 0) return 'border-red-200 bg-red-50'
        if (empresa.candidaturas.some(c => c.aviso.urgente)) return 'border-yellow-200 bg-yellow-50'
        return 'border-green-200 bg-green-50'
    }

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
                    <h1 className="text-2xl font-bold text-gray-900">Minhas Empresas</h1>
                    <p className="text-gray-500">
                        Gestão centralizada de todas as empresas que acompanha
                    </p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/empresas/nova">
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Empresa
                    </Link>
                </Button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Total Empresas</p>
                                    <p className="text-2xl font-bold">{stats.totalEmpresas}</p>
                                </div>
                                <Building2 className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Candidaturas Ativas</p>
                                    <p className="text-2xl font-bold">{stats.candidaturasAtivas}</p>
                                </div>
                                <FileText className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className={stats.documentosProblematicos > 0 ? 'border-red-200' : ''}>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Docs. a Resolver</p>
                                    <p className="text-2xl font-bold text-red-600">
                                        {stats.documentosProblematicos}
                                    </p>
                                </div>
                                <AlertTriangle className="h-8 w-8 text-red-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className={stats.avisosUrgentes > 0 ? 'border-yellow-200' : ''}>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Avisos Urgentes</p>
                                    <p className="text-2xl font-bold text-yellow-600">
                                        {stats.avisosUrgentes}
                                    </p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-yellow-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Companies List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {empresas.length === 0 ? (
                    <Card className="col-span-full">
                        <CardContent className="py-12 text-center">
                            <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">
                                Ainda não tem empresas
                            </h3>
                            <p className="text-gray-500 mt-1">
                                Comece por adicionar a primeira empresa que irá gerir.
                            </p>
                            <Button asChild className="mt-4">
                                <Link href="/dashboard/empresas/nova">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Adicionar Empresa
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    empresas.map((empresa) => (
                        <Card
                            key={empresa.id}
                            className={`hover:shadow-md transition-shadow ${getStatusColor(empresa)}`}
                        >
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg">{empresa.nome}</CardTitle>
                                        <CardDescription>NIPC: {empresa.nipc}</CardDescription>
                                    </div>
                                    <Badge variant="outline">{empresa.dimensao}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">Setor:</span>
                                        <span>{empresa.setor}</span>
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">Candidaturas ativas:</span>
                                        <Badge variant={empresa.candidaturas.length > 0 ? 'default' : 'secondary'}>
                                            {empresa.candidaturas.length}
                                        </Badge>
                                    </div>

                                    {empresa.documentos.length > 0 && (
                                        <div className="flex items-center gap-2 text-sm text-red-600">
                                            <AlertTriangle className="h-4 w-4" />
                                            <span>{empresa.documentos.length} documento(s) a resolver</span>
                                        </div>
                                    )}

                                    {empresa.candidaturas.some(c => c.aviso.urgente) && (
                                        <div className="flex items-center gap-2 text-sm text-yellow-600">
                                            <TrendingUp className="h-4 w-4" />
                                            <span>Tem candidatura(s) com prazo urgente</span>
                                        </div>
                                    )}

                                    <Button asChild variant="outline" className="w-full mt-2">
                                        <Link href={`/dashboard/empresas?id=${empresa.id}`}>
                                            Ver detalhes
                                            <ArrowRight className="h-4 w-4 ml-2" />
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
