'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Banknote,
    Plus,
    Euro,
    FileText,
    Clock,
    CheckCircle,
    Send,
    XCircle
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface Pagamento {
    id: string
    numero: number
    montante: number
    dataSubmissao?: string
    dataPagamento?: string
    estado: 'RASCUNHO' | 'SUBMETIDO' | 'EM_ANALISE' | 'APROVADO' | 'REJEITADO' | 'PAGO'
    observacoes?: string
}

interface PagamentoStats {
    count: number
    totalSolicitado: number
    totalPago: number
    pendente: number
    montanteAprovado: number
    percentagemRecebida: number
}

interface PagamentosTabProps {
    candidaturaId: string
}

export function PagamentosTab({ candidaturaId }: PagamentosTabProps) {
    const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
    const [stats, setStats] = useState<PagamentoStats>({
        count: 0,
        totalSolicitado: 0,
        totalPago: 0,
        pendente: 0,
        montanteAprovado: 0,
        percentagemRecebida: 0
    })
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        montante: '',
        observacoes: ''
    })

    // Calculate available budget
    const disponivel = stats.montanteAprovado - stats.totalSolicitado;

    const fetchPagamentos = async () => {
        try {
            const response = await fetch(`/api/candidaturas/${candidaturaId}/pagamentos`)
            if (!response.ok) throw new Error('Erro ao carregar pagamentos')
            const data = await response.json()
            setPagamentos(data.pagamentos)
            setStats(data.stats)
        } catch (error) {
            console.error('Error:', error)
            toast.error('Erro ao carregar pagamentos')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPagamentos()
    }, [candidaturaId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            const response = await fetch(`/api/candidaturas/${candidaturaId}/pagamentos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (!response.ok) {
                toast.error(data.error || 'Erro ao criar pedido')
                return
            }

            toast.success('Pedido de pagamento criado')
            setDialogOpen(false)
            setFormData({ montante: '', observacoes: '' })
            fetchPagamentos()
        } catch (error) {
            console.error('Error:', error)
            toast.error('Erro ao criar pedido de pagamento')
        } finally {
            setSubmitting(false)
        }
    }

    const getEstadoBadge = (estado: string) => {
        const configs: Record<string, { color: string; icon: any; label: string }> = {
            RASCUNHO: { color: 'bg-gray-500', icon: FileText, label: 'Rascunho' },
            SUBMETIDO: { color: 'bg-blue-500', icon: Send, label: 'Submetido' },
            EM_ANALISE: { color: 'bg-yellow-500', icon: Clock, label: 'Em Análise' },
            APROVADO: { color: 'bg-green-500', icon: CheckCircle, label: 'Aprovado' },
            REJEITADO: { color: 'bg-red-500', icon: XCircle, label: 'Rejeitado' },
            PAGO: { color: 'bg-emerald-600', icon: Banknote, label: 'Pago' }
        }
        const config = configs[estado] || configs.RASCUNHO
        const Icon = config.icon
        return (
            <Badge className={`${config.color} text-white`}>
                <Icon className="h-3 w-3 mr-1" />
                {config.label}
            </Badge>
        )
    }

    if (loading) {
        return <div className="animate-pulse p-4 text-center text-gray-500">Carregando pagamentos...</div>
    }

    return (
        <div className="space-y-6">
            {/* Financial Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-blue-700">Montante Aprovado</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-900">
                            €{stats.montanteAprovado.toLocaleString('pt-PT')}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-green-700">Total Recebido</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-900">
                            €{stats.totalPago.toLocaleString('pt-PT')}
                        </div>
                        <div className="text-sm text-green-600 mt-1">
                            {stats.percentagemRecebida}% do total
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-orange-700">Pendente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-900">
                            €{(stats.totalSolicitado - stats.totalPago).toLocaleString('pt-PT')}
                        </div>
                        <div className="text-sm text-orange-600 mt-1">
                            {stats.pendente} pedidos em curso
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Budget Utilization Bar */}
            {stats.montanteAprovado > 0 && (
                <Card className="border-gray-200">
                    <CardContent className="py-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">Utilização do Orçamento</span>
                            <span className={`text-sm font-bold ${(stats.totalSolicitado / stats.montanteAprovado) > 0.9
                                    ? 'text-red-600'
                                    : (stats.totalSolicitado / stats.montanteAprovado) > 0.7
                                        ? 'text-orange-600'
                                        : 'text-green-600'
                                }`}>
                                {Math.round((stats.totalSolicitado / stats.montanteAprovado) * 100)}%
                            </span>
                        </div>
                        <Progress
                            value={Math.min((stats.totalSolicitado / stats.montanteAprovado) * 100, 100)}
                            className={`h-2 ${(stats.totalSolicitado / stats.montanteAprovado) > 0.9
                                    ? '[&>div]:bg-red-500'
                                    : (stats.totalSolicitado / stats.montanteAprovado) > 0.7
                                        ? '[&>div]:bg-orange-500'
                                        : '[&>div]:bg-green-500'
                                }`}
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Solicitado: €{stats.totalSolicitado.toLocaleString('pt-PT')}</span>
                            <span>Disponível: €{disponivel.toLocaleString('pt-PT')}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Add Payment Button */}
            <div className="flex justify-end">
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Novo Pedido de Pagamento
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Criar Pedido de Pagamento</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label>Montante (€) *</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={formData.montante}
                                    onChange={(e) => setFormData({ ...formData, montante: e.target.value })}
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                            <div>
                                <Label>Observações</Label>
                                <Textarea
                                    value={formData.observacoes}
                                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                                    placeholder="Notas sobre este pedido..."
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit">Criar</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Payments Table */}
            {pagamentos.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="py-12 text-center">
                        <Banknote className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="font-medium text-gray-700 mb-2">Sem pedidos de pagamento</h3>
                        <p className="text-sm text-gray-500">
                            Crie pedidos de pagamento para receber o financiamento aprovado.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Banknote className="h-5 w-5" />
                                Pedidos de Pagamento
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-20">#</TableHead>
                                        <TableHead>Montante</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Data Submissão</TableHead>
                                        <TableHead>Data Pagamento</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pagamentos.map((pagamento) => (
                                        <TableRow key={pagamento.id}>
                                            <TableCell className="font-medium">
                                                PP-{String(pagamento.numero).padStart(3, '0')}
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-semibold">
                                                    €{pagamento.montante.toLocaleString('pt-PT')}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {getEstadoBadge(pagamento.estado)}
                                            </TableCell>
                                            <TableCell>
                                                {pagamento.dataSubmissao
                                                    ? new Date(pagamento.dataSubmissao).toLocaleDateString('pt-PT')
                                                    : '-'
                                                }
                                            </TableCell>
                                            <TableCell>
                                                {pagamento.dataPagamento
                                                    ? new Date(pagamento.dataPagamento).toLocaleDateString('pt-PT')
                                                    : '-'
                                                }
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </div>
    )
}
