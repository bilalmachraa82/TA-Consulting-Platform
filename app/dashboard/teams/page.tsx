'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
    Users,
    Plus,
    UserPlus,
    Settings,
    Crown,
    Mail,
    Building2,
    Trash2,
    Copy,
    Check
} from 'lucide-react';

interface TeamMember {
    id: string;
    role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
    user: {
        id: string;
        name: string | null;
        email: string;
        image?: string | null;
    };
}

interface Team {
    id: string;
    nome: string;
    membros: TeamMember[];
    empresas: { id: string; nome: string; nipc: string }[];
    memberCount: number;
    empresaCount: number;
    createdAt: string;
}

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
    OWNER: { label: 'Proprietário', color: 'bg-yellow-500/20 text-yellow-400' },
    ADMIN: { label: 'Admin', color: 'bg-purple-500/20 text-purple-400' },
    MEMBER: { label: 'Membro', color: 'bg-blue-500/20 text-blue-400' },
    VIEWER: { label: 'Visualizador', color: 'bg-gray-500/20 text-gray-400' },
};

export default function TeamsPage() {
    const { data: session } = useSession();
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [newTeamName, setNewTeamName] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<'ADMIN' | 'MEMBER' | 'VIEWER'>('MEMBER');
    const [copiedLink, setCopiedLink] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTeams();
    }, []);

    async function fetchTeams() {
        try {
            const res = await fetch('/api/teams');
            const data = await res.json();
            if (data.success) {
                setTeams(data.teams);
            }
        } catch (e) {
            console.error('Erro ao carregar equipas:', e);
        } finally {
            setLoading(false);
        }
    }

    async function createTeam() {
        if (!newTeamName.trim()) return;

        setError('');
        try {
            const res = await fetch('/api/teams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome: newTeamName }),
            });
            const data = await res.json();

            if (data.success) {
                setTeams([...teams, { ...data.team, memberCount: 1, empresaCount: 0 }]);
                setNewTeamName('');
                setShowCreateModal(false);
            } else {
                setError(data.error || 'Erro ao criar equipa');
            }
        } catch (e: any) {
            setError(e.message);
        }
    }

    async function inviteMember() {
        if (!selectedTeam || !inviteEmail.trim()) return;

        setError('');
        try {
            const res = await fetch(`/api/teams/${selectedTeam.id}/invite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
            });
            const data = await res.json();

            if (data.success) {
                setInviteEmail('');
                setShowInviteModal(false);
                fetchTeams(); // Refresh
            } else {
                setError(data.error || 'Erro ao convidar membro');
            }
        } catch (e: any) {
            setError(e.message);
        }
    }

    function copyInviteLink(teamId: string) {
        const link = `${window.location.origin}/join/${teamId}`;
        navigator.clipboard.writeText(link);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Users className="w-8 h-8 text-blue-400" />
                        Equipas
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Colabore com a sua equipa em candidaturas
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Nova Equipa
                </button>
            </div>

            {/* Teams Grid */}
            {teams.length === 0 ? (
                <div className="bg-[#12121a] rounded-xl border border-white/10 p-12 text-center">
                    <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Sem equipas</h2>
                    <p className="text-gray-400 mb-6">
                        Crie uma equipa para começar a colaborar
                    </p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                        Criar Primeira Equipa
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teams.map((team) => (
                        <div
                            key={team.id}
                            className="bg-[#12121a] rounded-xl border border-white/10 p-6 hover:border-blue-500/50 transition-all group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-xl font-semibold">{team.nome}</h3>
                                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white/5 rounded-lg">
                                    <Settings className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            {/* Stats */}
                            <div className="flex gap-4 mb-6">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Users className="w-4 h-4" />
                                    <span>{team.memberCount} membros</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Building2 className="w-4 h-4" />
                                    <span>{team.empresaCount} empresas</span>
                                </div>
                            </div>

                            {/* Members Preview */}
                            <div className="mb-4">
                                <p className="text-sm text-gray-500 mb-2">Membros</p>
                                <div className="flex -space-x-2">
                                    {team.membros.slice(0, 5).map((member) => (
                                        <div
                                            key={member.id}
                                            className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-medium border-2 border-[#12121a]"
                                            title={member.user.name || member.user.email}
                                        >
                                            {member.role === 'OWNER' && (
                                                <Crown className="w-4 h-4 text-yellow-400" />
                                            )}
                                            {member.role !== 'OWNER' && (
                                                member.user.name?.charAt(0) || member.user.email.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                    ))}
                                    {team.memberCount > 5 && (
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs border-2 border-[#12121a]">
                                            +{team.memberCount - 5}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-4 border-t border-white/5">
                                <button
                                    onClick={() => {
                                        setSelectedTeam(team);
                                        setShowInviteModal(true);
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-sm"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    Convidar
                                </button>
                                <button
                                    onClick={() => copyInviteLink(team.id)}
                                    className="flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-sm"
                                >
                                    {copiedLink ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Team Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#12121a] rounded-xl border border-white/10 p-6 w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4">Criar Nova Equipa</h2>

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <input
                            type="text"
                            value={newTeamName}
                            onChange={(e) => setNewTeamName(e.target.value)}
                            placeholder="Nome da equipa..."
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500 mb-4"
                            autoFocus
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setError('');
                                }}
                                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={createTeam}
                                disabled={!newTeamName.trim()}
                                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                            >
                                Criar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Invite Member Modal */}
            {showInviteModal && selectedTeam && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#12121a] rounded-xl border border-white/10 p-6 w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-2">Convidar para {selectedTeam.nome}</h2>
                        <p className="text-gray-400 text-sm mb-4">
                            Convide membros por email
                        </p>

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="block text-sm text-gray-400 mb-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="email@exemplo.pt"
                                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm text-gray-400 mb-1">Função</label>
                            <select
                                value={inviteRole}
                                onChange={(e) => setInviteRole(e.target.value as any)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500"
                            >
                                <option value="ADMIN">Admin - Pode gerir equipa</option>
                                <option value="MEMBER">Membro - Pode editar candidaturas</option>
                                <option value="VIEWER">Visualizador - Apenas leitura</option>
                            </select>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowInviteModal(false);
                                    setError('');
                                    setSelectedTeam(null);
                                }}
                                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={inviteMember}
                                disabled={!inviteEmail.trim()}
                                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                            >
                                Enviar Convite
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
