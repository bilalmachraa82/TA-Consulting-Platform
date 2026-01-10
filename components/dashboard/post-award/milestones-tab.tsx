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
    Dialog,
    DialogContent,
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
import {
    Target,
    Plus,
    Calendar,
    CheckCircle,
    Clock,
    AlertTriangle,
    Euro
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface Milestone {
    id: string
    titulo: string
    descricao?: string
    dataLimite: string
    dataConclusao?: string
    estado: 'PENDENTE' | 'EM_PROGRESSO' | 'CONCLUIDO' | 'ATRASADO'
    valorAssociado?: number
}

interface MilestoneStats {
    total: number
    completed: number
    overdue: number
    progress: number
}

interface MilestonesTabProps {
    candidaturaId: string
}

export function MilestonesTab({ candidaturaId }: MilestonesTabProps) {
    const [milestones, setMilestones] = useState<Milestone[]>([])
    const [stats, setStats] = useState<MilestoneStats>({ total: 0, completed: 0, overdue: 0, progress: 0 })
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [formData, setFormData] = useState({
        titulo: '',
        descricao: '',
        dataLimite: '',
        valorAssociado: ''
    })

    const fetchMilestones = async () => {
        try {
            const response = await fetch(`/api/candidaturas/${candidaturaId}/milestones`)
            if (!response.ok) throw new Error('Erro ao carregar milestones')
            const data = await response.json()
            setMilestones(data.milestones)
            setStats(data.stats)
        } catch (error) {
            console.error('Error:', error)
            toast.error('Erro ao carregar milestones')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMilestones()
    }, [candidaturaId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const response = await fetch(`/api/candidaturas/${candidaturaId}/milestones`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (!response.ok) throw new Error('Erro ao criar milestone')

            toast.success('Milestone criado com sucesso')
            setDialogOpen(false)
            setFormData({ titulo: '', descricao: '', dataLimite: '', valorAssociado: '' })
            fetchMilestones()
        } catch (error) {
            console.error('Error:', error)
            toast.error('Erro ao criar milestone')
        }
    }

    const getEstadoBadge = (estado: string) => {
        const configs: Record<string, { color: string; icon: any }> = {
            PENDENTE: { color: 'bg-gray-500', icon: Clock },
            EM_PROGRESSO: { color: 'bg-blue-500', icon: Target },
            CONCLUIDO: { color: 'bg-green-500', icon: CheckCircle },
            ATRASADO: { color: 'bg-red-500', icon: AlertTriangle }
        }
        const config = configs[estado] || configs.PENDENTE
        const Icon = config.icon
        return (
            <Badge className={`${config.color} text-white`}>
                <Icon className="h-3 w-3 mr-1" />
                {estado.replace('_', ' ')}
            </Badge>
        )
    }

    const getDaysUntil = (date: string) => {
        const today = new Date()
        const target = new Date(date)
        return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    }

    if (loading) {
        return <div className="animate-pulse p-4 text-center text-gray-500">Carregando milestones...</div>
    }

    return (
        <div className="space-y-6">
            {/* Progress Overview */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="h-5 w-5 text-blue-600" />
                        Progresso do Projeto
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <Progress value={stats.progress} className="h-3" />
                        <div className="flex justify-between text-sm">
                            <span className="text-green-600 font-medium">{stats.completed} concluídos</span>
                            <span className="text-gray-600">{stats.total} total</span>
                            {stats.overdue > 0 && (
                                <span className="text-red-600 font-medium">{stats.overdue} atrasados</span>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Add Milestone Button */}
            <div className="flex justify-end">
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Novo Milestone
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Criar Milestone</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label>Título *</Label>
                                <Input
                                    value={formData.titulo}
                                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                                    placeholder="Ex: Entrega do 1º Relatório"
                                    required
                                />
                            </div>
                            <div>
                                <Label>Descrição</Label>
                                <Textarea
                                    value={formData.descricao}
                                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                                    placeholder="Detalhes do milestone..."
                                />
                            </div>
                            <div>
                                <Label>Data Limite *</Label>
                                <Input
                                    type="date"
                                    value={formData.dataLimite}
                                    onChange={(e) => setFormData({ ...formData, dataLimite: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label>Valor Associado (€)</Label>
                                <Input
                                    type="number"
                                    value={formData.valorAssociado}
                                    onChange={(e) => setFormData({ ...formData, valorAssociado: e.target.value })}
                                    placeholder="0"
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

            {/* Milestones Timeline */}
            {milestones.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="py-12 text-center">
                        <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="font-medium text-gray-700 mb-2">Sem milestones definidos</h3>
                        <p className="text-sm text-gray-500">
                            Adicione milestones para acompanhar o progresso do projeto.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence>
                        {milestones.map((milestone, index) => {
                            const daysUntil = getDaysUntil(milestone.dataLimite)
                            const isOverdue = daysUntil < 0 && milestone.estado !== 'CONCLUIDO'

                            return (
                                <motion.div
                                    key={milestone.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className={`
                                        border-l-4 transition-all hover:shadow-md
                                        ${milestone.estado === 'CONCLUIDO' ? 'border-l-green-500 bg-green-50/50' : ''}
                                        ${isOverdue ? 'border-l-red-500 bg-red-50/50' : ''}
                                        ${milestone.estado === 'EM_PROGRESSO' ? 'border-l-blue-500' : ''}
                                        ${milestone.estado === 'PENDENTE' && !isOverdue ? 'border-l-gray-300' : ''}
                                    `}>
                                        <CardContent className="py-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h4 className="font-semibold">{milestone.titulo}</h4>
                                                        {getEstadoBadge(isOverdue ? 'ATRASADO' : milestone.estado)}
                                                    </div>
                                                    {milestone.descricao && (
                                                        <p className="text-sm text-gray-600 mb-2">{milestone.descricao}</p>
                                                    )}
                                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-4 w-4" />
                                                            {new Date(milestone.dataLimite).toLocaleDateString('pt-PT')}
                                                        </span>
                                                        {milestone.valorAssociado && (
                                                            <span className="flex items-center gap-1">
                                                                <Euro className="h-4 w-4" />
                                                                €{milestone.valorAssociado.toLocaleString('pt-PT')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                {daysUntil > 0 && daysUntil <= 7 && milestone.estado !== 'CONCLUIDO' && (
                                                    <Badge variant="outline" className="text-orange-600 border-orange-300">
                                                        {daysUntil} dias
                                                    </Badge>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </div>
            )}
        </div>
    )
}
