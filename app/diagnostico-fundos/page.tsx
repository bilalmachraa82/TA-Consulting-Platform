'use client';

import React, { useState } from 'react';
import ChatWizard from '@/components/lead-magnet/chat-wizard';
import ResultCard from '@/components/lead-magnet/result-card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Calendar, Sparkles, Shield, Clock, TrendingUp } from 'lucide-react';

interface MatchResult {
    avisoId: string;
    avisoNome: string;
    portal: string;
    link?: string;
    taxa?: string;
    diasRestantes: number;
    score: number;
    confidence: 'ALTA' | 'MEDIA' | 'BAIXA';
    reasons: string[];
    missing: string[];
}

export default function DiagnosticoFundosPage() {
    const [leadId, setLeadId] = useState<string | null>(null);
    const [matches, setMatches] = useState<MatchResult[]>([]);
    const [showResults, setShowResults] = useState(false);

    const handleComplete = (newLeadId: string, newMatches: MatchResult[]) => {
        setLeadId(newLeadId);
        setMatches(newMatches);
        setShowResults(true);
    };

    const handleReset = () => {
        setShowResults(false);
        setLeadId(null);
        setMatches([]);
    };

    // ============ Results View ============
    if (showResults) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
                <div className="max-w-4xl mx-auto px-4 py-12">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Resultados do Pré-Diagnóstico
                        </h1>
                        <p className="text-slate-400">
                            Encontrámos <span className="text-green-400 font-semibold">{matches.length}</span> avisos compatíveis com o seu perfil
                        </p>
                    </div>

                    {/* Results Grid */}
                    {matches.length > 0 ? (
                        <div className="space-y-4 mb-8">
                            {matches.map((match, index) => (
                                <ResultCard key={match.avisoId} match={match} rank={index + 1} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-slate-800/50 rounded-2xl mb-8">
                            <p className="text-slate-400 mb-4">
                                Não encontrámos avisos abertos compatíveis neste momento.
                            </p>
                            <p className="text-slate-500 text-sm">
                                Ative os alertas para ser notificado quando abrir um aviso relevante.
                            </p>
                        </div>
                    )}

                    {/* CTA Section */}
                    <div className="grid md:grid-cols-2 gap-4 mb-8">
                        <Button
                            size="lg"
                            className="w-full bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-600 h-14 shadow-[0_0_20px_-5px_hsl(var(--primary)/0.5)]"
                        >
                            <Calendar className="w-5 h-5 mr-2" />
                            Agendar Consulta Gratuita
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="w-full border-slate-600 text-slate-300 hover:bg-slate-800 h-14"
                        >
                            <Download className="w-5 h-5 mr-2" />
                            Descarregar Relatório PDF
                        </Button>
                    </div>

                    {/* Trust Badges */}
                    <div className="grid grid-cols-3 gap-4 text-center text-slate-400 text-sm">
                        <div>
                            <Shield className="w-5 h-5 mx-auto mb-1" />
                            Dados Seguros
                        </div>
                        <div>
                            <Clock className="w-5 h-5 mx-auto mb-1" />
                            Atualização Diária
                        </div>
                        <div>
                            <TrendingUp className="w-5 h-5 mx-auto mb-1" />
                            +500 Empresas Apoiadas
                        </div>
                    </div>

                    {/* Reset Link */}
                    <div className="text-center mt-8">
                        <button
                            onClick={handleReset}
                            className="text-slate-500 hover:text-slate-300 text-sm flex items-center gap-1 mx-auto"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Fazer novo diagnóstico
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ============ Form View ============
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-400 px-4 py-1.5 rounded-full text-sm mb-6">
                        <Sparkles className="w-4 h-4" />
                        Atualizado para PT2030 e CAE Rev 4 (2025)
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                        Pré-Diagnóstico de<br />
                        <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                            Elegibilidade a Fundos
                        </span>
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Descubra os avisos PT2030, PRR e PEPAC mais relevantes para a sua empresa em menos de 3 minutos. Grátis e sem compromisso.
                    </p>
                </div>

                {/* Conversational Bot */}
                <ChatWizard onComplete={handleComplete} />

                {/* Features */}
                <div className="grid md:grid-cols-3 gap-6 mt-16 text-center">
                    <div className="p-6 rounded-xl bg-slate-800/30">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <Clock className="w-5 h-5 text-blue-400" />
                        </div>
                        <h3 className="text-white font-medium mb-1">3 Minutos</h3>
                        <p className="text-slate-500 text-sm">Resultados instantâneos</p>
                    </div>
                    <div className="p-6 rounded-xl bg-slate-800/30">
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <Shield className="w-5 h-5 text-green-400" />
                        </div>
                        <h3 className="text-white font-medium mb-1">100% Seguro</h3>
                        <p className="text-slate-500 text-sm">Dados protegidos por RGPD</p>
                    </div>
                    <div className="p-6 rounded-xl bg-slate-800/30">
                        <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <TrendingUp className="w-5 h-5 text-cyan-400" />
                        </div>
                        <h3 className="text-white font-medium mb-1">Multi-Portal</h3>
                        <p className="text-slate-500 text-sm">PT2030 + PRR + PEPAC</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
