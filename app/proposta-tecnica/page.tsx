'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Download, Printer, FileText, Check, X, Crown, Star, Award, Zap, Clock, Shield, TrendingUp, Target, Globe, Database, BarChart3, Wrench, Lightbulb, AlertTriangle, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

// ============================================================================
// DATA
// ============================================================================

const SECTIONS = [
    {
        id: 'visao-geral',
        title: 'Visão Geral',
        subtitle: 'Contexto do Projeto',
        icon: <Lightbulb className="w-6 h-6" />,
        color: 'blue',
        content: (
            <div className="space-y-6">
                <p className="text-lg text-blue-100 leading-relaxed">
                    A TA Consulting enfrenta um desafio crítico: a captação de fundos europeus é um processo manual, fragmentado e intensivo em recursos. Com milhares de avisos publicados anualmente em múltiplos portais, a identificação de oportunidades relevantes para cada cliente torna-se uma tarefa que consome horas preciosas de trabalho qualificado.
                </p>
                <div className="bg-gradient-to-r from-blue-500/20 to-emerald-500/20 border border-blue-400/30 rounded-2xl p-6">
                    <h4 className="text-xl font-bold text-white mb-3">Objetivo</h4>
                    <p className="text-blue-100">
                        A <span className="text-emerald-400 font-semibold">TA Consulting Platform</span> automatiza todo o fluxo de captação e qualificação de candidaturas a fundos europeus, desde a deteção de novos avisos até à notificação proativa de oportunidades relevantes para cada cliente da base de <span className="text-white font-bold">24.000 empresas</span>.
                    </p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <h5 className="text-sm font-semibold text-blue-300 uppercase mb-2">Centraliza</h5>
                        <p className="text-blue-100 text-sm">Informação dispersa por múltiplos portais</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <h5 className="text-sm font-semibold text-blue-300 uppercase mb-2">Estrutura</h5>
                        <p className="text-blue-100 text-sm">Dados de Excel não estruturados</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <h5 className="text-sm font-semibold text-blue-300 uppercase mb-2">Automatiza</h5>
                        <p className="text-blue-100 text-sm">Processos manuais de pesquisa</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <h5 className="text-sm font-semibold text-blue-300 uppercase mb-2">Preserva</h5>
                        <p className="text-blue-100 text-sm">Conhecimento tácito da equipa</p>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'dores',
        title: 'Análise das Dores',
        subtitle: 'Oportunidade Subutilizada',
        icon: <AlertTriangle className="w-6 h-6" />,
        color: 'red',
        content: (
            <div className="space-y-6">
                <div className="space-y-4">
                    <div className="bg-red-500/20 border-l-4 border-red-500 p-5 rounded-r-xl">
                        <p className="text-xl text-white italic mb-2">"Temos 24.000 empresas na base de dados, mas apenas uma fração é contactada ativamente para oportunidades."</p>
                        <p className="text-red-300 text-sm">— Fernando, TA Consulting</p>
                    </div>
                    <div className="bg-orange-500/20 border-l-4 border-orange-500 p-5 rounded-r-xl">
                        <p className="text-xl text-white italic mb-2">"Hoje tudo se faz com Excel, pesquisas manuais no website da Paula, e muito copy-paste entre sistemas."</p>
                        <p className="text-orange-300 text-sm">— Fernando, TA Consulting</p>
                    </div>
                    <div className="bg-amber-500/20 border-l-4 border-amber-500 p-5 rounded-r-xl">
                        <p className="text-xl text-white italic mb-2">"Temos 291 candidaturas históricas que poderiam servir de referência, mas estão em ficheiros dispersos."</p>
                        <p className="text-amber-300 text-sm">— Fernando, TA Consulting</p>
                    </div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                    <h4 className="text-xl font-bold text-white mb-4">Consequências</h4>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <X className="w-5 h-5 text-red-400 flex-shrink-0" />
                            <span className="text-blue-100">Tempo gasto em pesquisa manual = menos tempo para candidaturas de valor</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <X className="w-5 h-5 text-red-400 flex-shrink-0" />
                            <span className="text-blue-100">Oportunidades perdidas = avisos não detetados atempadamente</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <X className="w-5 h-5 text-red-400 flex-shrink-0" />
                            <span className="text-blue-100">Base subutilizada = receita potencial não realizada</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <X className="w-5 h-5 text-red-400 flex-shrink-0" />
                            <span className="text-blue-100">Dependência de conhecimento tácito = risco de perda de know-how</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'starter',
        title: 'STARTER',
        subtitle: '€5.000 + €600/mês • 8 semanas',
        icon: <Star className="w-6 h-6" />,
        color: 'blue',
        badge: 'Básico',
        content: (
            <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <Globe className="w-5 h-5 text-blue-400" />
                            <h4 className="font-bold text-white">Scraping 3 Portais</h4>
                        </div>
                        <p className="text-blue-100 text-sm">PT2030, PRR, PEPAC • Verificação a cada 6 horas</p>
                    </div>
                    <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <Target className="w-5 h-5 text-blue-400" />
                            <h4 className="font-bold text-white">Matchmaking Básico</h4>
                        </div>
                        <p className="text-blue-100 text-sm">CAE (2 dígitos) + Região • Exportação CSV</p>
                    </div>
                    <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <BarChart3 className="w-5 h-5 text-blue-400" />
                            <h4 className="font-bold text-white">Dashboard</h4>
                        </div>
                        <p className="text-blue-100 text-sm">Avisos recentes • Filtros simples • Marcação</p>
                    </div>
                    <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <Database className="w-5 h-5 text-blue-400" />
                            <h4 className="font-bold text-white">RAG Básico</h4>
                        </div>
                        <p className="text-blue-100 text-sm">Keyword search • Títulos e descrições</p>
                    </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-400" />
                        Formação Incluída
                    </h4>
                    <p className="text-blue-100">2 sessões de 2 horas cada • Utilização do dashboard • Leitura de avisos</p>
                </div>
            </div>
        )
    },
    {
        id: 'professional',
        title: 'PROFESSIONAL',
        subtitle: '€7.500 + €800/mês • 10-12 semanas',
        icon: <Award className="w-6 h-6" />,
        color: 'emerald',
        badge: 'RECOMENDADO',
        content: (
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-emerald-500/30 to-blue-500/30 border border-emerald-400/50 rounded-xl p-5 mb-4">
                    <div className="flex items-center gap-3">
                        <Crown className="w-6 h-6 text-amber-400" />
                        <div>
                            <p className="text-emerald-300 font-semibold">TUDO do Starter +</p>
                            <p className="text-white text-sm">Funcionalidades avançadas para crescer</p>
                        </div>
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <Globe className="w-5 h-5 text-emerald-400" />
                            <h4 className="font-bold text-white">Scraping 6 Portais</h4>
                        </div>
                        <p className="text-emerald-100 text-sm">+ Europa Criativa, IPDJ, Horizon Europe</p>
                    </div>
                    <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <Target className="w-5 h-5 text-emerald-400" />
                            <h4 className="font-bold text-white">Matchmaking Avançado</h4>
                        </div>
                        <p className="text-emerald-100 text-sm">Score 0-100 • CAE 4 dígitos • Histórico</p>
                    </div>
                    <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <Database className="w-5 h-5 text-emerald-400" />
                            <h4 className="font-bold text-white">RAG Gemini</h4>
                        </div>
                        <p className="text-emerald-100 text-sm">291 candidaturas • Pesquisa semântica</p>
                    </div>
                    <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <Shield className="w-5 h-5 text-emerald-400" />
                            <h4 className="font-bold text-white">Sync Bitrix Bidirecional</h4>
                        </div>
                        <p className="text-emerald-100 text-sm">API completa • Leitura e escrita • Sincronização horária</p>
                    </div>
                    <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <Zap className="w-5 h-5 text-emerald-400" />
                            <h4 className="font-bold text-white">Chatbot IA</h4>
                        </div>
                        <p className="text-emerald-100 text-sm">Conversacional • Baseado em RAG • Personalizável</p>
                    </div>
                    <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                            <h4 className="font-bold text-white">Email Drip</h4>
                        </div>
                        <p className="text-emerald-100 text-sm">4 sequências automáticas • Personalização</p>
                    </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                        <Wrench className="w-5 h-5 text-emerald-400" />
                        Suporte Prioritário
                    </h4>
                    <p className="text-emerald-100">2 horas/mês dedicadas • SLA 2 dias úteis • 4 sessões de formação gravadas</p>
                </div>
            </div>
        )
    },
    {
        id: 'premium',
        title: 'PREMIUM',
        subtitle: '€11.000 + €1.000/mês • 16-20 semanas',
        icon: <Crown className="w-6 h-6" />,
        color: 'amber',
        badge: 'PREMIUM',
        content: (
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-amber-500/30 to-orange-500/30 border border-amber-400/50 rounded-xl p-5 mb-4">
                    <div className="flex items-center gap-3">
                        <Crown className="w-6 h-6 text-amber-400" />
                        <div>
                            <p className="text-amber-300 font-semibold">TUDO do Professional +</p>
                            <p className="text-white text-sm">Automatização completa para dominar o mercado</p>
                        </div>
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-amber-500/20 border border-amber-400/30 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <FileText className="w-5 h-5 text-amber-400" />
                            <h4 className="font-bold text-white">AI Writer</h4>
                        </div>
                        <p className="text-amber-100 text-sm">Gera rascunhos de memórias • ~50% economia de tempo</p>
                    </div>
                    <div className="bg-amber-500/20 border border-amber-400/30 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <BarChart3 className="w-5 h-5 text-amber-400" />
                            <h4 className="font-bold text-white">Post-Award Management</h4>
                        </div>
                        <p className="text-amber-100 text-sm">Dashboard projetos • Milestones • Alertas reporting</p>
                    </div>
                    <div className="bg-amber-500/20 border border-amber-400/30 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <TrendingUp className="w-5 h-5 text-amber-400" />
                            <h4 className="font-bold text-white">Email Drip Avançado</h4>
                        </div>
                        <p className="text-amber-100 text-sm">Sequências personalizadas • A/B testing • Segmentação</p>
                    </div>
                    <div className="bg-amber-500/20 border border-amber-400/30 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <Shield className="w-5 h-5 text-amber-400" />
                            <h4 className="font-bold text-white">AI Critic</h4>
                        </div>
                        <p className="text-amber-100 text-sm">Revisão automática • Consistência • Sugestões de melhoria</p>
                    </div>
                    <div className="bg-amber-500/20 border border-amber-400/30 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <Globe className="w-5 h-5 text-amber-400" />
                            <h4 className="font-bold text-white">Website Auto-Update</h4>
                        </div>
                        <p className="text-amber-100 text-sm">Sincronização automática • ~30 min/semana poupados</p>
                    </div>
                    <div className="bg-amber-500/20 border border-amber-400/30 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <Target className="w-5 h-5 text-amber-400" />
                            <h4 className="font-bold text-white">Marketing Mix AI</h4>
                        </div>
                        <p className="text-amber-100 text-sm">Recomendações de canais • Análise de performance</p>
                    </div>
                </div>
                <div className="bg-white/5 border border-amber-400/30 rounded-xl p-5">
                    <p className="text-amber-200 text-sm flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Nota:</strong> O plano Premium contém funcionalidades "nice to have". A maioria pode ser adicionada posteriormente como módulos separados após implementação do plano Professional.</span>
                    </p>
                </div>
            </div>
        )
    },
    {
        id: 'comparacao',
        title: 'Comparação Lado a Lado',
        subtitle: 'Escolha o nível certo para o teu negócio',
        icon: <BarChart3 className="w-6 h-6" />,
        color: 'violet',
        content: (
            <div className="space-y-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/20">
                                <th className="text-left py-3 px-4 text-blue-300 font-semibold">Feature</th>
                                <th className="text-center py-3 px-4 text-blue-400 font-semibold">Starter</th>
                                <th className="text-center py-3 px-4 text-emerald-400 font-semibold">Professional</th>
                                <th className="text-center py-3 px-4 text-amber-400 font-semibold">Premium</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-white/10">
                                <td className="py-3 px-4 text-white font-medium">Scraping Portais</td>
                                <td className="text-center py-3 px-4 text-blue-300">3</td>
                                <td className="text-center py-3 px-4 text-emerald-300">6</td>
                                <td className="text-center py-3 px-4 text-amber-300">6</td>
                            </tr>
                            <tr className="border-b border-white/10">
                                <td className="py-3 px-4 text-white font-medium">Sync Bitrix</td>
                                <td className="text-center py-3 px-4 text-blue-300">CSV manual</td>
                                <td className="text-center py-3 px-4 text-emerald-300">Automático</td>
                                <td className="text-center py-3 px-4 text-amber-300">Automático</td>
                            </tr>
                            <tr className="border-b border-white/10">
                                <td className="py-3 px-4 text-white font-medium">RAG Docs</td>
                                <td className="text-center py-3 px-4 text-blue-300">Keyword</td>
                                <td className="text-center py-3 px-4 text-emerald-300">Gemini</td>
                                <td className="text-center py-3 px-4 text-amber-300">+ Re-ranking</td>
                            </tr>
                            <tr className="border-b border-white/10">
                                <td className="py-3 px-4 text-white font-medium">Matchmaking Score</td>
                                <td className="text-center py-3 px-4 text-blue-300"><X className="w-4 h-4 mx-auto" /></td>
                                <td className="text-center py-3 px-4 text-emerald-300"><Check className="w-4 h-4 mx-auto" /></td>
                                <td className="text-center py-3 px-4 text-amber-300">+ Histórico</td>
                            </tr>
                            <tr className="border-b border-white/10">
                                <td className="py-3 px-4 text-white font-medium">Chatbot AI</td>
                                <td className="text-center py-3 px-4 text-blue-300"><X className="w-4 h-4 mx-auto" /></td>
                                <td className="text-center py-3 px-4 text-emerald-300"><Check className="w-4 h-4 mx-auto" /></td>
                                <td className="text-center py-3 px-4 text-amber-300">+ Avançado</td>
                            </tr>
                            <tr className="border-b border-white/10">
                                <td className="py-3 px-4 text-white font-medium">Email Drip</td>
                                <td className="text-center py-3 px-4 text-blue-300"><X className="w-4 h-4 mx-auto" /></td>
                                <td className="text-center py-3 px-4 text-emerald-300">4 fixas</td>
                                <td className="text-center py-3 px-4 text-amber-300">Custom</td>
                            </tr>
                            <tr className="border-b border-white/10">
                                <td className="py-3 px-4 text-white font-medium">AI Writer</td>
                                <td className="text-center py-3 px-4 text-blue-300"><X className="w-4 h-4 mx-auto" /></td>
                                <td className="text-center py-3 px-4 text-emerald-300"><X className="w-4 h-4 mx-auto" /></td>
                                <td className="text-center py-3 px-4 text-amber-300"><Check className="w-4 h-4 mx-auto" /></td>
                            </tr>
                            <tr className="border-b border-white/10">
                                <td className="py-3 px-4 text-white font-medium">Post-Award</td>
                                <td className="text-center py-3 px-4 text-blue-300"><X className="w-4 h-4 mx-auto" /></td>
                                <td className="text-center py-3 px-4 text-emerald-300"><X className="w-4 h-4 mx-auto" /></td>
                                <td className="text-center py-3 px-4 text-amber-300"><Check className="w-4 h-4 mx-auto" /></td>
                            </tr>
                            <tr className="border-b border-white/10">
                                <td className="py-3 px-4 text-white font-medium">Website Auto-Update</td>
                                <td className="text-center py-3 px-4 text-blue-300"><X className="w-4 h-4 mx-auto" /></td>
                                <td className="text-center py-3 px-4 text-emerald-300"><X className="w-4 h-4 mx-auto" /></td>
                                <td className="text-center py-3 px-4 text-amber-300"><Check className="w-4 h-4 mx-auto" /></td>
                            </tr>
                            <tr className="border-b border-white/10">
                                <td className="py-3 px-4 text-white font-medium">AI Critic</td>
                                <td className="text-center py-3 px-4 text-blue-300"><X className="w-4 h-4 mx-auto" /></td>
                                <td className="text-center py-3 px-4 text-emerald-300"><X className="w-4 h-4 mx-auto" /></td>
                                <td className="text-center py-3 px-4 text-amber-300"><Check className="w-4 h-4 mx-auto" /></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-4 text-center">
                        <p className="text-3xl font-bold text-white mb-1">€5.000</p>
                        <p className="text-blue-300 text-sm">+ €600/mês</p>
                        <p className="text-blue-200 text-xs mt-2">Total Ano 1: €12.200</p>
                    </div>
                    <div className="bg-emerald-500/20 border-2 border-emerald-400/50 rounded-xl p-4 text-center relative">
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">RECOMENDADO</span>
                        <p className="text-3xl font-bold text-white mb-1">€7.500</p>
                        <p className="text-emerald-300 text-sm">+ €800/mês</p>
                        <p className="text-emerald-200 text-xs mt-2">Total Ano 1: €17.100</p>
                    </div>
                    <div className="bg-amber-500/20 border border-amber-400/30 rounded-xl p-4 text-center">
                        <p className="text-3xl font-bold text-white mb-1">€11.000</p>
                        <p className="text-amber-300 text-sm">+ €1.000/mês</p>
                        <p className="text-amber-200 text-xs mt-2">Total Ano 1: €23.000</p>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'retainer',
        title: 'Retainer Mensal',
        subtitle: 'O que está incluído em cada plano',
        icon: <Shield className="w-6 h-6" />,
        color: 'cyan',
        content: (
            <div className="space-y-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/20">
                                <th className="text-left py-3 px-4 text-cyan-300 font-semibold">Serviço</th>
                                <th className="text-center py-3 px-4 text-blue-400 font-semibold">Starter €600</th>
                                <th className="text-center py-3 px-4 text-emerald-400 font-semibold">Professional €800</th>
                                <th className="text-center py-3 px-4 text-amber-400 font-semibold">Premium €1000</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-white/10">
                                <td className="py-3 px-4 text-white">Manutenção scrapers</td>
                                <td className="text-center py-3 px-4"><Check className="w-4 h-4 mx-auto text-emerald-400" /></td>
                                <td className="text-center py-3 px-4"><Check className="w-4 h-4 mx-auto text-emerald-400" /></td>
                                <td className="text-center py-3 px-4"><Check className="w-4 h-4 mx-auto text-emerald-400" /></td>
                            </tr>
                            <tr className="border-b border-white/10">
                                <td className="py-3 px-4 text-white">Suporte email</td>
                                <td className="text-center py-3 px-4"><Check className="w-4 h-4 mx-auto text-emerald-400" /></td>
                                <td className="text-center py-3 px-4"><Check className="w-4 h-4 mx-auto text-emerald-400" /></td>
                                <td className="text-center py-3 px-4"><Check className="w-4 h-4 mx-auto text-emerald-400" /></td>
                            </tr>
                            <tr className="border-b border-white/10">
                                <td className="py-3 px-4 text-white">Horas dedicadas</td>
                                <td className="text-center py-3 px-4 text-blue-300">-</td>
                                <td className="text-center py-3 px-4 text-emerald-300">2h/mês</td>
                                <td className="text-center py-3 px-4 text-amber-300">5h/mês</td>
                            </tr>
                            <tr className="border-b border-white/10">
                                <td className="py-3 px-4 text-white">Monitoramento 24/7</td>
                                <td className="text-center py-3 px-4"><X className="w-4 h-4 mx-auto text-red-400" /></td>
                                <td className="text-center py-3 px-4"><Check className="w-4 h-4 mx-auto text-emerald-400" /></td>
                                <td className="text-center py-3 px-4"><Check className="w-4 h-4 mx-auto text-emerald-400" /></td>
                            </tr>
                            <tr className="border-b border-white/10">
                                <td className="py-3 px-4 text-white">SLA resposta</td>
                                <td className="text-center py-3 px-4 text-blue-300">3 dias</td>
                                <td className="text-center py-3 px-4 text-emerald-300">2 dias</td>
                                <td className="text-center py-3 px-4 text-amber-300">1 dia</td>
                            </tr>
                            <tr className="border-b border-white/10">
                                <td className="py-3 px-4 text-white">Backup diário</td>
                                <td className="text-center py-3 px-4"><Check className="w-4 h-4 mx-auto text-emerald-400" /></td>
                                <td className="text-center py-3 px-4"><Check className="w-4 h-4 mx-auto text-emerald-400" /></td>
                                <td className="text-center py-3 px-4"><Check className="w-4 h-4 mx-auto text-emerald-400" /></td>
                            </tr>
                            <tr className="border-b border-white/10">
                                <td className="py-3 px-4 text-white">Retenção 1 ano</td>
                                <td className="text-center py-3 px-4"><X className="w-4 h-4 mx-auto text-red-400" /></td>
                                <td className="text-center py-3 px-4"><X className="w-4 h-4 mx-auto text-red-400" /></td>
                                <td className="text-center py-3 px-4"><Check className="w-4 h-4 mx-auto text-emerald-400" /></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 rounded-xl p-5">
                    <h4 className="font-bold text-white mb-3">O que garante o retainer</h4>
                    <ul className="space-y-2 text-cyan-100 text-sm">
                        <li className="flex items-start gap-2">
                            <Shield className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                            <span><strong>Platform stability:</strong> Scrapers adaptados quando portais mudam</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Shield className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                            <span><strong>Suporte contínuo:</strong> Dúvidas e problemas resolvidos recorrentemente</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Shield className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                            <span><strong>Evolução:</strong> Plataforma melhora com novas features</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Shield className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                            <span><strong>Segurança:</strong> Atualizações aplicadas de imediato</span>
                        </li>
                    </ul>
                </div>
            </div>
        )
    },
    {
        id: 'timeline',
        title: 'Timeline de Implementação',
        subtitle: 'Cada plano tem o seu ritmo',
        icon: <Clock className="w-6 h-6" />,
        color: 'blue',
        content: (
            <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-white">STARTER</h4>
                            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">8 semanas</span>
                        </div>
                        <ul className="space-y-2 text-blue-100 text-sm">
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-400" /> Sem 1-2: Scraping + Dashboard</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-400" /> Sem 3-4: Matchmaking + Chatbot</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-400" /> Sem 5-6: RAG + Testes</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-400" /> Sem 7-8: Deploy + Formação</li>
                        </ul>
                    </div>
                    <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-white">PROFESSIONAL</h4>
                            <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">12 semanas</span>
                        </div>
                        <ul className="space-y-2 text-emerald-100 text-sm">
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Sem 1-4: TUDO do Starter</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Sem 5-8: Extensões Core</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Sem 9-10: Automação Avançada</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Sem 11-12: Deploy + Testes</li>
                        </ul>
                    </div>
                    <div className="bg-amber-500/20 border border-amber-400/30 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-white">PREMIUM</h4>
                            <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full">20 semanas</span>
                        </div>
                        <ul className="space-y-2 text-amber-100 text-sm">
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Sem 1-12: TUDO do Professional</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Sem 13-16: AI Writer + Post-Award</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Sem 17-18: AI Critic + Web Auto</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Sem 19-20: Deploy + Formação</li>
                        </ul>
                    </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-amber-400" />
                        Upgrade Flexível
                    </h4>
                    <p className="text-blue-100">Podes começar no Starter e fazer upgrade depois. O investimento inicial é deduzido do novo plano.</p>
                    <div className="flex gap-4 mt-3 text-sm">
                        <span className="text-blue-300">→ Starter → Professional: +4-6 semanas</span>
                        <span className="text-blue-300">→ Professional → Premium: +8-10 semanas</span>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'faq',
        title: 'Perguntas Frequentes',
        subtitle: 'Dúvidas comuns respondidas',
        icon: <FileText className="w-6 h-6" />,
        color: 'violet',
        content: (
            <div className="space-y-4">
                {[
                    {
                        q: "Posso começar no Starter e fazer upgrade depois?",
                        a: "Sim. O upgrade é possível e o investimento inicial é deduzido. Starter → Professional: +4-6 semanas. Professional → Premium: +8-10 semanas."
                    },
                    {
                        q: "O que acontece se um scraper quebrar?",
                        a: "Starter: 24-48h após report. Professional: até 4h com monitoramento 24/7. Premium: até 2h com alertas imediatos."
                    },
                    {
                        q: "Os dados do Bitrix estão seguros?",
                        a: "Sim. Acesso read-only por defeito. Escrita condicionada. Revogação a qualquer momento. HTTPS + logs para auditoria."
                    },
                    {
                        q: "Preciso de fornecer as 291 candidaturas?",
                        a: "Sim, para o RAG funcionar bem. Formatos: Google Drive, upload (PDF, DOCX), ou exportação de outro sistema."
                    },
                    {
                        q: "Qual é o tempo mínimo de contrato?",
                        a: "Setup: pagamento único. Retainer: mínimo 12 meses. Cancelamento: após 12 meses, 30 dias de aviso prévio."
                    }
                ].map((faq, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white/5 border border-white/10 rounded-xl p-5"
                    >
                        <h4 className="font-bold text-white mb-2">{faq.q}</h4>
                        <p className="text-violet-200 text-sm">{faq.a}</p>
                    </motion.div>
                ))}
            </div>
        )
    }
];

const colorMap = {
    blue: { bg: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-400', bgLight: 'bg-blue-500/20' },
    emerald: { bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-400', bgLight: 'bg-emerald-500/20' },
    amber: { bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-400', bgLight: 'bg-amber-500/20' },
    red: { bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-400', bgLight: 'bg-red-500/20' },
    violet: { bg: 'bg-violet-500', text: 'text-violet-400', border: 'border-violet-400', bgLight: 'bg-violet-500/20' },
    cyan: { bg: 'bg-cyan-500', text: 'text-cyan-400', border: 'border-cyan-400', bgLight: 'bg-cyan-500/20' },
};

// ============================================================================
// COMPONENTS
// ============================================================================

function SectionCard({ section, index }) {
    const colors = colorMap[section.color] || colorMap.blue;

    return (
        <motion.div
            id={section.id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="mb-16 scroll-mt-24"
        >
            <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 ${colors.bgLight} border ${colors.border} rounded-xl flex items-center justify-center ${colors.text}`}>
                    {section.icon}
                </div>
                <div>
                    <span className={`text-sm font-semibold tracking-widest ${colors.text} uppercase`}>
                        {section.subtitle}
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-white">{section.title}</h2>
                </div>
                {section.badge && (
                    <span className={`ml-auto ${colors.bg} text-white text-xs px-3 py-1 rounded-full font-semibold`}>
                        {section.badge}
                    </span>
                )}
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 md:p-8">
                {section.content}
            </div>
        </motion.div>
    );
}

function TableOfContents({ sections, activeSection }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block fixed left-8 top-1/2 -translate-y-1/2 w-48"
        >
            <nav className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
                <h3 className="text-xs font-semibold tracking-widest text-blue-300 uppercase mb-3">Índice</h3>
                <ul className="space-y-2">
                    {sections.map((section) => (
                        <li key={section.id}>
                            <a
                                href={`#${section.id}`}
                                className={`text-sm py-1 px-2 rounded-lg block transition-colors ${
                                    activeSection === section.id
                                        ? 'bg-blue-500/30 text-white'
                                        : 'text-blue-200 hover:bg-white/5'
                                }`}
                            >
                                {section.title}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
        </motion.div>
    );
}

export default function PropostaTecnicaPage() {
    const [activeSection, setActiveSection] = useState('visao-geral');

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        window.open('/docs/proposta-tecnica-completa.md', '_blank');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/apresentacao-v5" className="text-slate-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <Image src="/logo-ta.png" alt="TA Consulting" width={40} height={40} priority />
                        <div>
                            <h1 className="text-lg font-bold text-white">Proposta Técnica</h1>
                            <p className="text-xs text-slate-400">Janeiro 2026</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors border border-white/10"
                        >
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">MD</span>
                        </button>
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            <Printer className="w-4 h-4" />
                            <span className="hidden sm:inline">PDF</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative py-20 px-4 text-center"
            >
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mb-8"
                    >
                        <Image src="/logo-ta.png" alt="TA Consulting" width={100} height={100} priority />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-4xl md:text-6xl font-bold text-white mb-4"
                    >
                        Proposta Técnica
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-xl text-blue-200 mb-8"
                    >
                        Documento de Acompanhamento Comercial
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-wrap justify-center gap-6"
                    >
                        <div className="flex items-center gap-2 text-white">
                            <div className="w-12 h-12 bg-blue-500/20 border border-blue-400/30 rounded-lg flex items-center justify-center">
                                <Globe className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="text-left">
                                <p className="text-xs text-blue-300">3 Planos</p>
                                <p className="font-semibold">Starter a Premium</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-white">
                            <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-400/30 rounded-lg flex items-center justify-center">
                                <Clock className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div className="text-left">
                                <p className="text-xs text-emerald-300">Timeline</p>
                                <p className="font-semibold">8-20 semanas</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-white">
                            <div className="w-12 h-12 bg-amber-500/20 border border-amber-400/30 rounded-lg flex items-center justify-center">
                                <Shield className="w-5 h-5 text-amber-400" />
                            </div>
                            <div className="text-left">
                                <p className="text-xs text-amber-300">Suporte</p>
                                <p className="font-semibold">SLA garantido</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.section>

            {/* Table of Contents */}
            <TableOfContents sections={SECTIONS} activeSection={activeSection} />

            {/* Content */}
            <main className="relative max-w-4xl mx-auto px-4 pb-20">
                {SECTIONS.map((section, index) => (
                    <SectionCard key={section.id} section={section} index={index} />
                ))}
            </main>

            {/* Footer */}
            <footer className="relative border-t border-white/10 py-8">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <p className="text-slate-400 text-sm">
                        Este documento é confidencial e destina-se exclusivamente ao uso da TA Consulting.
                    </p>
                    <p className="text-slate-500 text-xs mt-2">Janeiro 2026</p>
                </div>
            </footer>

            {/* Print styles */}
            <style jsx global>{`
                @media print {
                    header button, .fixed { display: none !important; }
                    body { background: white !important; }
                    .bg-white\\/5 { background: #f5f5f5 !important; }
                }
            `}</style>
        </div>
    );
}
