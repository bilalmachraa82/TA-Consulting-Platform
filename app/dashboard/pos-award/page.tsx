'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
    Target,
    Calendar,
    DollarSign,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Plus,
    ChevronRight,
    FileText,
    TrendingUp,
    Banknote,
} from 'lucide-react';

interface Milestone {
    id: string;
    titulo: string;
    descricao?: string;
    dataLimite: string;
    estado: 'PENDENTE' | 'EM_PROGRESSO' | 'CONCLUIDO' | 'ATRASADO';
    candidaturaId: string;
}

interface PedidoPagamento {
    id: string;
    numero: number;
    montante: number;
    estado: 'RASCUNHO' | 'SUBMETIDO' | 'EM_ANALISE' | 'APROVADO' | 'REJEITADO' | 'PAGO';
    dataSubmissao?: string;
    candidaturaId: string;
}

interface Candidatura {
    id: string;
    empresa: { nome: string };
    aviso: { nome: string; programa: string };
    estado: string;
    montanteAprovado?: number;
    milestones: Milestone[];
    pedidosPagamento: PedidoPagamento[];
}

const ESTADO_MILESTONE: Record<string, { label: string; color: string; icon: any }> = {
    PENDENTE: { label: 'Pendente', color: 'bg-gray-500/20 text-gray-400', icon: Clock },
    EM_PROGRESSO: { label: 'Em Progresso', color: 'bg-blue-500/20 text-blue-400', icon: TrendingUp },
    CONCLUIDO: { label: 'Concluído', color: 'bg-green-500/20 text-green-400', icon: CheckCircle2 },
    ATRASADO: { label: 'Atrasado', color: 'bg-red-500/20 text-red-400', icon: AlertTriangle },
};

const ESTADO_PAGAMENTO: Record<string, { label: string; color: string }> = {
    RASCUNHO: { label: 'Rascunho', color: 'bg-gray-500/20 text-gray-400' },
    SUBMETIDO: { label: 'Submetido', color: 'bg-blue-500/20 text-blue-400' },
    EM_ANALISE: { label: 'Em Análise', color: 'bg-yellow-500/20 text-yellow-400' },
    APROVADO: { label: 'Aprovado', color: 'bg-green-500/20 text-green-400' },
    REJEITADO: { label: 'Rejeitado', color: 'bg-red-500/20 text-red-400' },
    PAGO: { label: 'Pago', color: 'bg-emerald-500/20 text-emerald-400' },
};

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value);
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function PostAwardPage() {
    const { data: session } = useSession();
    const [candidaturas, setCandidaturas] = useState<Candidatura[]>([]);
    const [selectedCandidatura, setSelectedCandidatura] = useState<Candidatura | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'milestones' | 'pagamentos'>('milestones');

    useEffect(() => {
        fetchCandidaturas();
    }, []);

    async function fetchCandidaturas() {
        try {
            const res = await fetch('/api/candidaturas?estado=APROVADA&include=milestones,pedidosPagamento');
            const data = await res.json();
            if (data.candidaturas) {
                setCandidaturas(data.candidaturas);
                if (data.candidaturas.length > 0) {
                    setSelectedCandidatura(data.candidaturas[0]);
                }
            }
        } catch (e) {
            console.error('Erro ao carregar candidaturas:', e);
        } finally {
            setLoading(false);
        }
    }

    // Calcular métricas
    const totalAprovado = candidaturas.reduce((sum, c) => sum + (c.montanteAprovado || 0), 0);
    const totalRecebido = candidaturas.reduce((sum, c) => {
        return sum + (c.pedidosPagamento || [])
            .filter(p => p.estado === 'PAGO')
            .reduce((s, p) => s + p.montante, 0);
    }, 0);
    const percentRecebido = totalAprovado > 0 ? (totalRecebido / totalAprovado) * 100 : 0;

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
            <div className="mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Target className="w-8 h-8 text-emerald-400" />
                    Gestão Pós-Aprovação
                </h1>
                <p className="text-gray-400 mt-1">
                    Acompanhe milestones, despesas e pedidos de pagamento
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-[#12121a] rounded-xl border border-white/10 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <FileText className="w-5 h-5 text-blue-400" />
                        </div>
                        <span className="text-gray-400">Projectos Activos</span>
                    </div>
                    <p className="text-3xl font-bold">{candidaturas.length}</p>
                </div>

                <div className="bg-[#12121a] rounded-xl border border-white/10 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-500/20 rounded-lg">
                            <DollarSign className="w-5 h-5 text-emerald-400" />
                        </div>
                        <span className="text-gray-400">Total Aprovado</span>
                    </div>
                    <p className="text-3xl font-bold">{formatCurrency(totalAprovado)}</p>
                </div>

                <div className="bg-[#12121a] rounded-xl border border-white/10 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                            <Banknote className="w-5 h-5 text-green-400" />
                        </div>
                        <span className="text-gray-400">Total Recebido</span>
                    </div>
                    <p className="text-3xl font-bold">{formatCurrency(totalRecebido)}</p>
                </div>

                <div className="bg-[#12121a] rounded-xl border border-white/10 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-purple-400" />
                        </div>
                        <span className="text-gray-400">Taxa Execução</span>
                    </div>
                    <p className="text-3xl font-bold">{percentRecebido.toFixed(1)}%</p>
                    {/* Progress bar */}
                    <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-purple-500 to-emerald-500 rounded-full transition-all"
                            style={{ width: `${percentRecebido}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Projects List */}
                <div className="bg-[#12121a] rounded-xl border border-white/10 p-4">
                    <h2 className="text-lg font-semibold mb-4">Projectos Aprovados</h2>

                    {candidaturas.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>Sem projectos aprovados</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {candidaturas.map((c) => (
                                <button
                                    key={c.id}
                                    onClick={() => setSelectedCandidatura(c)}
                                    className={`w-full text-left p-4 rounded-lg transition-all ${selectedCandidatura?.id === c.id
                                            ? 'bg-blue-500/20 border border-blue-500/50'
                                            : 'bg-white/5 hover:bg-white/10 border border-transparent'
                                        }`}
                                >
                                    <p className="font-medium truncate">{c.empresa.nome}</p>
                                    <p className="text-sm text-gray-400 truncate">{c.aviso.nome}</p>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-xs bg-white/10 px-2 py-1 rounded">
                                            {c.aviso.programa}
                                        </span>
                                        <span className="text-sm text-emerald-400">
                                            {formatCurrency(c.montanteAprovado || 0)}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Detail Panel */}
                <div className="lg:col-span-2 bg-[#12121a] rounded-xl border border-white/10 p-6">
                    {selectedCandidatura ? (
                        <>
                            {/* Tabs */}
                            <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-4">
                                <button
                                    onClick={() => setActiveTab('milestones')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === 'milestones'
                                            ? 'bg-blue-500/20 text-blue-400'
                                            : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    <Calendar className="w-4 h-4" />
                                    Milestones
                                </button>
                                <button
                                    onClick={() => setActiveTab('pagamentos')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === 'pagamentos'
                                            ? 'bg-blue-500/20 text-blue-400'
                                            : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    <DollarSign className="w-4 h-4" />
                                    Pedidos de Pagamento
                                </button>
                            </div>

                            {/* Milestones Tab */}
                            {activeTab === 'milestones' && (
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold">Timeline de Milestones</h3>
                                        <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors">
                                            <Plus className="w-4 h-4" />
                                            Novo
                                        </button>
                                    </div>

                                    {(selectedCandidatura.milestones || []).length === 0 ? (
                                        <div className="text-center py-12 text-gray-500 border border-dashed border-white/10 rounded-lg">
                                            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                            <p>Sem milestones definidos</p>
                                            <p className="text-sm mt-1">Adicione marcos para acompanhar o progresso</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {selectedCandidatura.milestones.map((m, i) => {
                                                const estado = ESTADO_MILESTONE[m.estado];
                                                const Icon = estado.icon;
                                                return (
                                                    <div
                                                        key={m.id}
                                                        className="flex gap-4 p-4 bg-white/5 rounded-lg border border-white/10"
                                                    >
                                                        <div className={`p-2 rounded-lg ${estado.color}`}>
                                                            <Icon className="w-5 h-5" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-medium">{m.titulo}</p>
                                                            {m.descricao && (
                                                                <p className="text-sm text-gray-400 mt-1">{m.descricao}</p>
                                                            )}
                                                            <div className="flex items-center gap-4 mt-2">
                                                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                                                    <Calendar className="w-3 h-3" />
                                                                    {formatDate(m.dataLimite)}
                                                                </span>
                                                                <span className={`text-xs px-2 py-0.5 rounded ${estado.color}`}>
                                                                    {estado.label}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <ChevronRight className="w-5 h-5 text-gray-500" />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Pagamentos Tab */}
                            {activeTab === 'pagamentos' && (
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold">Pedidos de Pagamento</h3>
                                        <button className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm transition-colors">
                                            <Plus className="w-4 h-4" />
                                            Novo Pedido
                                        </button>
                                    </div>

                                    {(selectedCandidatura.pedidosPagamento || []).length === 0 ? (
                                        <div className="text-center py-12 text-gray-500 border border-dashed border-white/10 rounded-lg">
                                            <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                            <p>Sem pedidos de pagamento</p>
                                            <p className="text-sm mt-1">Crie pedidos para receber financiamento</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {selectedCandidatura.pedidosPagamento.map((p) => {
                                                const estado = ESTADO_PAGAMENTO[p.estado];
                                                return (
                                                    <div
                                                        key={p.id}
                                                        className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10"
                                                    >
                                                        <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                                            <span className="text-emerald-400 font-bold">#{p.numero}</span>
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-medium">{formatCurrency(p.montante)}</p>
                                                            {p.dataSubmissao && (
                                                                <p className="text-xs text-gray-500">
                                                                    Submetido em {formatDate(p.dataSubmissao)}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <span className={`text-xs px-3 py-1 rounded-full ${estado.color}`}>
                                                            {estado.label}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Progress Summary */}
                                    {(selectedCandidatura.pedidosPagamento || []).length > 0 && (
                                        <div className="mt-6 p-4 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-lg border border-emerald-500/20">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-gray-400">Progresso de Pagamentos</span>
                                                <span className="font-bold text-emerald-400">
                                                    {formatCurrency(
                                                        selectedCandidatura.pedidosPagamento
                                                            .filter(p => p.estado === 'PAGO')
                                                            .reduce((s, p) => s + p.montante, 0)
                                                    )}
                                                    {' / '}
                                                    {formatCurrency(selectedCandidatura.montanteAprovado || 0)}
                                                </span>
                                            </div>
                                            <div className="h-3 bg-black/30 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full"
                                                    style={{
                                                        width: `${selectedCandidatura.montanteAprovado
                                                                ? (selectedCandidatura.pedidosPagamento
                                                                    .filter(p => p.estado === 'PAGO')
                                                                    .reduce((s, p) => s + p.montante, 0) /
                                                                    selectedCandidatura.montanteAprovado) *
                                                                100
                                                                : 0
                                                            }%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            <div className="text-center">
                                <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p>Selecione um projecto para ver detalhes</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
