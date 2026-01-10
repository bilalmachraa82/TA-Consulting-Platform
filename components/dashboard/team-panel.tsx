'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
    Users,
    Plus,
    UserPlus,
    Crown,
    Shield,
    Eye,
    User
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface TeamMember {
    id: string
    role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'
    user: {
        id: string
        name: string | null
        email: string
        image: string | null
    }
    joinedAt: string
}

interface Team {
    id: string
    nome: string
    membros: TeamMember[]
    memberCount: number
    empresaCount: number
}

export function TeamPanel() {
    const [teams, setTeams] = useState<Team[]>([])
    const [loading, setLoading] = useState(true)
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
    const [newTeamName, setNewTeamName] = useState('')
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviteRole, setInviteRole] = useState<'ADMIN' | 'MEMBER' | 'VIEWER'>('MEMBER')
    const [submitting, setSubmitting] = useState(false)

    const fetchTeams = async () => {
        try {
            const response = await fetch('/api/teams')
            if (!response.ok) throw new Error('Erro ao carregar equipas')
            const data = await response.json()
            setTeams(data.teams || [])
        } catch (error) {
            console.error('Error:', error)
            toast.error('Erro ao carregar equipas')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTeams()
    }, [])

    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            const response = await fetch('/api/teams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome: newTeamName })
            })

            const data = await response.json()
            if (!response.ok) {
                toast.error(data.error || 'Erro ao criar equipa')
                return
            }

            toast.success('Equipa criada com sucesso')
            setCreateDialogOpen(false)
            setNewTeamName('')
            fetchTeams()
        } catch (error) {
            console.error('Error:', error)
            toast.error('Erro ao criar equipa')
        } finally {
            setSubmitting(false)
        }
    }

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedTeam) return

        setSubmitting(true)
        try {
            const response = await fetch(`/api/teams/${selectedTeam.id}/invite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: inviteEmail, role: inviteRole })
            })

            const data = await response.json()
            if (!response.ok) {
                toast.error(data.error || 'Erro ao convidar')
                return
            }

            toast.success(data.message || 'Membro adicionado')
            setInviteDialogOpen(false)
            setInviteEmail('')
            setInviteRole('MEMBER')
            fetchTeams()
        } catch (error) {
            console.error('Error:', error)
            toast.error('Erro ao convidar membro')
        } finally {
            setSubmitting(false)
        }
    }

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'OWNER': return <Crown className="h-3 w-3 text-yellow-500" />
            case 'ADMIN': return <Shield className="h-3 w-3 text-blue-500" />
            case 'VIEWER': return <Eye className="h-3 w-3 text-gray-500" />
            default: return <User className="h-3 w-3 text-green-500" />
        }
    }

    const getRoleBadge = (role: string) => {
        const configs: Record<string, string> = {
            OWNER: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            ADMIN: 'bg-blue-100 text-blue-800 border-blue-300',
            MEMBER: 'bg-green-100 text-green-800 border-green-300',
            VIEWER: 'bg-gray-100 text-gray-800 border-gray-300'
        }
        return (
            <Badge variant="outline" className={`text-xs ${configs[role] || configs.MEMBER}`}>
                {getRoleIcon(role)}
                <span className="ml-1">{role}</span>
            </Badge>
        )
    }

    if (loading) {
        return (
            <Card>
                <CardContent className="py-8 text-center">
                    <div className="animate-pulse text-gray-500">Carregando equipas...</div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Equipas
                </h2>
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="gap-1">
                            <Plus className="h-4 w-4" />
                            Nova Equipa
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Criar Equipa</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateTeam} className="space-y-4">
                            <div>
                                <Label>Nome da Equipa</Label>
                                <Input
                                    value={newTeamName}
                                    onChange={(e) => setNewTeamName(e.target.value)}
                                    placeholder="Ex: Equipa Comercial"
                                    required
                                    minLength={2}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setCreateDialogOpen(false)}
                                    disabled={submitting}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? 'A criar...' : 'Criar'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Teams List */}
            {teams.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="py-8 text-center">
                        <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="font-medium text-gray-700 mb-2">Sem equipas</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Crie uma equipa para colaborar com outros utilizadores.
                        </p>
                        <Button
                            size="sm"
                            onClick={() => setCreateDialogOpen(true)}
                            className="gap-1"
                        >
                            <Plus className="h-4 w-4" />
                            Criar Primeira Equipa
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <AnimatePresence>
                    {teams.map((team, index) => (
                        <motion.div
                            key={team.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Users className="h-4 w-4 text-primary" />
                                            {team.nome}
                                        </CardTitle>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="gap-1"
                                            onClick={() => {
                                                setSelectedTeam(team)
                                                setInviteDialogOpen(true)
                                            }}
                                        >
                                            <UserPlus className="h-3 w-3" />
                                            Convidar
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {team.membros?.slice(0, 5).map((member) => (
                                            <div
                                                key={member.id}
                                                className="flex items-center gap-2 bg-gray-50 rounded-lg px-2 py-1"
                                            >
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src={member.user.image || undefined} />
                                                    <AvatarFallback className="text-xs">
                                                        {(member.user.name?.[0] || member.user.email[0]).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm text-gray-700">
                                                    {member.user.name || member.user.email.split('@')[0]}
                                                </span>
                                                {getRoleBadge(member.role)}
                                            </div>
                                        ))}
                                        {team.membros?.length > 5 && (
                                            <Badge variant="outline">+{team.membros.length - 5}</Badge>
                                        )}
                                    </div>
                                    <div className="mt-3 flex gap-4 text-xs text-gray-500">
                                        <span>{team.memberCount || team.membros?.length || 0} membros</span>
                                        <span>{team.empresaCount || 0} empresas</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            )}

            {/* Invite Dialog */}
            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Convidar para {selectedTeam?.nome}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleInvite} className="space-y-4">
                        <div>
                            <Label>Email do utilizador</Label>
                            <Input
                                type="email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="utilizador@exemplo.com"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                O utilizador precisa de estar registado na plataforma.
                            </p>
                        </div>
                        <div>
                            <Label>Permissão</Label>
                            <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as any)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ADMIN">Admin - Pode gerir membros</SelectItem>
                                    <SelectItem value="MEMBER">Membro - Pode editar</SelectItem>
                                    <SelectItem value="VIEWER">Visualizador - Apenas ver</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setInviteDialogOpen(false)}
                                disabled={submitting}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? 'A convidar...' : 'Convidar'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
