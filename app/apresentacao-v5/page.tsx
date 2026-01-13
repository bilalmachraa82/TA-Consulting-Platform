'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, BarChart3, AlertTriangle, Lightbulb, Target, Globe, Zap, Database, TrendingUp, Clock, Check, Shield, X, FileText, Sparkles, Star, Award, Wrench, ChevronRight, Download, Crown } from 'lucide-react';
import Image from 'next/image';

// ============================================================================
// SLIDE COMPONENTS
// ============================================================================

// SLIDE 1: HERO
const HeroSlide = () => (
    <div className="flex flex-col justify-center items-center h-full text-center px-8 md:px-20">
        {/* Logo TA Consulting - Official */}
        <div className="mb-8">
            <Image src="/logo-ta.png" alt="TA Consulting" width={120} height={120} priority />
        </div>

        <div className="mb-6">
            <span className="text-base font-semibold tracking-widest text-blue-300 uppercase">Janeiro 2026</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
            Transformem 24.000 Empresas<br />
            <span className="text-blue-400">em Oportunidades</span>
        </h1>

        <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl leading-relaxed">
            A camada de Inteligência Artificial que o vosso Bitrix24 precisa para captar fundos europeus
        </p>

        <div className="flex items-center gap-8 text-blue-100 text-lg">
            <div className="text-center">
                <div className="text-5xl font-bold text-white">€3.5B+</div>
                <div className="text-sm mt-1">Fundos Disponíveis</div>
            </div>
            <div className="w-px h-12 bg-blue-400"></div>
            <div className="text-center">
                <div className="text-5xl font-bold text-white">24k+</div>
                <div className="text-sm mt-1">Empresas na Base</div>
            </div>
            <div className="w-px h-12 bg-blue-400"></div>
            <div className="text-center">
                <div className="text-5xl font-bold text-white">291</div>
                <div className="text-sm mt-1">Candidaturas Históricas</div>
            </div>
        </div>
    </div>
);

// SLIDE 2: CONTEXTO - A Oportunidade
const ContextSlide = () => (
    <div className="flex flex-col justify-center h-full px-8 md:px-20">
        <span className="text-base font-semibold tracking-widest text-blue-300 uppercase mb-4">Contexto de Mercado</span>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-12">A Janela de Oportunidade é 2026</h2>

        <div className="grid grid-cols-3 gap-6 mb-10">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                <div className="text-5xl font-bold text-white mb-2">€3.5B</div>
                <div className="text-lg text-blue-200">Europa 2021-2027</div>
                <div className="text-sm text-blue-300 mt-2">Fundos para empresas portuguesas</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                <div className="text-5xl font-bold text-emerald-400 mb-2">82%</div>
                <div className="text-lg text-blue-200">Não Aproveitados</div>
                <div className="text-sm text-blue-300 mt-2">Empresas deixam dinheiro na mesa</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                <div className="text-5xl font-bold text-amber-400 mb-2">2026</div>
                <div className="text-lg text-blue-200">Pico de Avisos</div>
                <div className="text-sm text-blue-300 mt-2">PT2030 acelera lançamentos</div>
            </div>
        </div>

        <div className="bg-amber-500/20 border-l-4 border-amber-500 p-6 rounded-r-xl">
            <p className="text-lg text-blue-100">
                <span className="font-bold text-amber-400">Oportunidade:</span> Quem automatizar primeiro em 2026 ganha vantagem competitiva duradoura. A janela está a 75% ocupada.
            </p>
        </div>
    </div>
);

// SLIDE 3: O PROBLEMA - Dores Reais
const ProblemSlide = () => (
    <div className="flex flex-col justify-center h-full px-8 md:px-20">
        <span className="text-base font-semibold tracking-widest text-red-300 uppercase mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            O Problema
        </span>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-12">As Dores que Reconhecem</h2>

        <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
                <div className="bg-red-500/20 border-l-4 border-red-500 p-5 rounded-r-xl">
                    <h3 className="text-xl font-bold text-white mb-2">"24.000 contactos, mas não sei quais vender"</h3>
                    <p className="text-blue-100 text-base">Manualmente é impossível cruzar elegibilidades. Oportunidades perdem-se diariamente.</p>
                </div>

                <div className="bg-orange-500/20 border-l-4 border-orange-500 p-5 rounded-r-xl">
                    <h3 className="text-xl font-bold text-white mb-2">"Excel verde/vermelho todas as semanas"</h3>
                    <p className="text-blue-100 text-base">Processo manual de marketing mix. Tempo perdido em tarefas repetitivas.</p>
                </div>

                <div className="bg-amber-500/20 border-l-4 border-amber-500 p-5 rounded-r-xl">
                    <h3 className="text-xl font-bold text-white mb-2">"Paula atualiza o website manualmente"</h3>
                    <p className="text-blue-100 text-base">Quando avisos mudam, alguém tem que ir ao site. Não é escalável.</p>
                </div>

                <div className="bg-yellow-500/20 border-l-4 border-yellow-500 p-5 rounded-r-xl">
                    <h3 className="text-xl font-bold text-white mb-2">"Leads que se vão embora"</h3>
                    <p className="text-blue-100 text-base">Formulários longos à cabeça afastam potenciais clientes.</p>
                </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <h3 className="text-2xl font-bold text-white mb-6">O Custo do Manual</h3>

                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="text-lg text-blue-100">Base de dados ativa</span>
                            <span className="font-bold text-xl text-red-400">&lt;5%</span>
                        </div>
                        <div className="h-3 bg-blue-900 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 rounded-full" style={{ width: '5%' }}></div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="text-lg text-blue-100">Tempo em tarefas manuais</span>
                            <span className="font-bold text-xl text-red-400">60%</span>
                        </div>
                        <div className="h-3 bg-blue-900 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 rounded-full" style={{ width: '60%' }}></div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="text-lg text-blue-100">291 candidaturas subutilizadas</span>
                            <span className="font-bold text-xl text-amber-400">0%</span>
                        </div>
                        <div className="h-3 bg-blue-900 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: '0%' }}></div>
                        </div>
                        <p className="text-sm text-blue-300 mt-2">Conhecimento não estruturado = não utilizável</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// SLIDE 4: O PEDIDO - O que Fernando pediu
const RequestSlide = () => (
    <div className="flex flex-col justify-center h-full px-8 md:px-20">
        <span className="text-base font-semibold tracking-widest text-emerald-300 uppercase mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            A Visão
        </span>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">O que Foi Pedido</h2>
        <p className="text-xl md:text-2xl text-blue-200 mb-12">Baseado na reunião com Fernando - prioridades reais, não vaporware</p>

        <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl border border-white/20 flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Database className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg">"Quero falar com os meus documentos"</h3>
                        <p className="text-blue-100 text-base mt-1">RAG sobre 291 candidaturas históricas - pesquisar e reutilizar conhecimento</p>
                    </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl border border-white/20 flex items-start gap-4">
                    <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg">Matchmaking automático</h3>
                        <p className="text-blue-100 text-base mt-1">CAE + Região + Dimensão ↔ Avisos. Top matches em segundos.</p>
                    </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl border border-white/20 flex items-start gap-4">
                    <div className="w-12 h-12 bg-violet-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg">Lead capture com IA conversacional</h3>
                        <p className="text-blue-100 text-base mt-1">Chatbot que dá valor primeiro (responde dúvidas, mostra fundos) e só pede dados no final. Aumenta conversão.</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl border border-white/20 flex items-start gap-4">
                    <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Database className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg">Integração Bitrix24</h3>
                        <p className="text-blue-100 text-base mt-1">Não substituir, potenciar. Sync bidirecional com CRM existente.</p>
                    </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl border border-white/20 flex items-start gap-4">
                    <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg">Dashboard integrado</h3>
                        <p className="text-blue-100 text-base mt-1">Plataforma unificada, não Custom GPT isolado. Avisos, leads, pipeline.</p>
                    </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl border border-white/20 flex items-start gap-4">
                    <div className="w-12 h-12 bg-rose-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Globe className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg">Scraping multi-portal (6 sites)</h3>
                        <p className="text-blue-100 text-base mt-1">PT2030 + PRR + PEPAC + Europa Criativa + IPDJ + Horizon Europe. Avisos novos em tempo real.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// SLIDE 5: A SOLUÇÃO
const SolutionSlide = () => (
    <div className="flex flex-col justify-center h-full px-8 md:px-20">
        <span className="text-base font-semibold tracking-widest text-emerald-300 uppercase mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            A Solução
        </span>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">ConsultancyOS</h2>
        <p className="text-xl md:text-2xl text-blue-200 mb-10">Não é um CRM novo. É AI Layer sobre o Bitrix que já têm.</p>

        <div className="grid grid-cols-2 gap-6 mb-10">
            <Link href="/dashboard" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-6 rounded-xl border border-white/20 transition-colors">
                <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center mb-4">
                    <Globe className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Multi-Portal Scraper</h3>
                <p className="text-blue-100 text-base">PT2030, PRR, PEPAC, Europa Criativa, IPDJ, Horizon Europe. Filtro de avisos em tempo real.</p>
                <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-400 bg-blue-500/20 px-3 py-2 rounded-lg">
                    Ver avisos
                    <ArrowRight className="w-4 h-4" />
                </div>
            </Link>

            <Link href="/dashboard/recomendacoes" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-6 rounded-xl border border-white/20 transition-colors">
                <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center mb-4">
                    <Target className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Matchmaking Engine</h3>
                <p className="text-blue-100 text-base">CAE + Região + Dimensão. Veja quais empresas da sua base são elegíveis para cada aviso.</p>
                <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 bg-emerald-500/20 px-3 py-2 rounded-lg">
                    Testar matching
                    <ArrowRight className="w-4 h-4" />
                </div>
            </Link>

            <Link href="/api/rag/chat" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-6 rounded-xl border border-white/20 transition-colors">
                <div className="w-14 h-14 bg-violet-500 rounded-xl flex items-center justify-center mb-4">
                    <Database className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">RAG Technical Writer</h3>
                <p className="text-blue-100 text-base">IA que aprende com as suas candidaturas históricas. Escreve no vosso estilo.</p>
                <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-violet-400 bg-violet-500/20 px-3 py-2 rounded-lg">
                    Experimentar chat
                    <ArrowRight className="w-4 h-4" />
                </div>
            </Link>

            <Link href="/empresas" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-6 rounded-xl border border-white/20 transition-colors">
                <div className="w-14 h-14 bg-cyan-500 rounded-xl flex items-center justify-center mb-4">
                    <Database className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Bitrix Sync</h3>
                <p className="text-blue-100 text-base">Integração nativa com o vosso CRM. Leitura e escrita de leads.</p>
                <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 bg-cyan-500/20 px-3 py-2 rounded-lg">
                    Ver empresas
                    <ArrowRight className="w-4 h-4" />
                </div>
            </Link>
        </div>

        <div className="flex gap-4">
            <Link href="/diagnostico-fundos" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
                <Zap className="w-5 h-5" />
                Demo Lead Magnet
                <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/dashboard" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
                <BarChart3 className="w-5 h-5" />
                Demo Dashboard
                <ArrowRight className="w-5 h-5" />
            </Link>
        </div>
    </div>
);

// SLIDE 6: COMO FUNCIONA - Antes vs Depois Storytelling
const HowItWorksSlide = () => (
    <div className="flex flex-col justify-center h-full px-8 md:px-20">
        <span className="text-base font-semibold tracking-widest text-blue-300 uppercase mb-4">Processo</span>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">Do Aviso à Venda: Antes vs Depois</h2>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* ANTES */}
            <div className="space-y-4">
                <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        <span className="text-sm font-bold text-red-400 uppercase tracking-wider">Antes - Manual</span>
                    </div>
                    <div className="space-y-3 text-base">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-red-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-red-400 font-bold text-sm">1</span>
                            </div>
                            <div>
                                <p className="text-white font-semibold">Segunda-feira. Mais um aviso aberto.</p>
                                <p className="text-blue-200 text-sm">"Vou ter que ir ao portal ver os detalhes..."</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-red-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-red-400 font-bold text-sm">2</span>
                            </div>
                            <div>
                                <p className="text-white font-semibold">"Agora cruzar com 24.000 empresas..."</p>
                                <p className="text-blue-200 text-sm">Excel aberto. Filtros manuais. Meia hora perdida.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-red-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-red-400 font-bold text-sm">3</span>
                            </div>
                            <div>
                                <p className="text-white font-semibold">"Paula, atualiza o site?"</p>
                                <p className="text-blue-200 text-sm">Alguém tem que se lembrar de atualizar manualmente.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-red-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-red-400 font-bold text-sm">4</span>
                            </div>
                            <div>
                                <p className="text-white font-semibold">"Quem é que eu contacto?"</p>
                                <p className="text-blue-200 text-sm">Lista pronta. Mas quem responde? Formulário longo afasta.</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-red-500/30">
                        <p className="text-red-300 text-sm font-semibold">2-3 dias por aviso. Oportunidades perdidas.</p>
                    </div>
                </div>
            </div>

            {/* DEPOIS */}
            <div className="space-y-4">
                <div className="bg-emerald-500/10 border border-emerald-500/50 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-5 h-5 text-emerald-400" />
                        <span className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Depois - Automático</span>
                    </div>
                    <div className="space-y-3 text-base">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-emerald-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-emerald-400 font-bold text-sm">1</span>
                            </div>
                            <div>
                                <p className="text-white font-semibold">Segunda-feira. Café na mesa.</p>
                                <p className="text-blue-200 text-sm">Notificação: "Novo aviso compatível com 47 empresas".</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-emerald-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-emerald-400 font-bold text-sm">2</span>
                            </div>
                            <div>
                                <p className="text-white font-semibold">Dashboard aberto. Top 50 empresas.</p>
                                <p className="text-blue-200 text-sm">Match score, razões de elegibilidade, contacto direto.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-emerald-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-emerald-400 font-bold text-sm">3</span>
                            </div>
                            <div>
                                <p className="text-white font-semibold">Site atualizado. Automaticamente.</p>
                                <p className="text-blue-200 text-sm">Novo aviso visível. Leads chegam sozinhos.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-emerald-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-emerald-400 font-bold text-sm">4</span>
                            </div>
                            <div>
                                <p className="text-white font-semibold">Foco no que importa: vender.</p>
                                <p className="text-blue-200 text-sm">Lead qualificado. Conversa iniciada. Proposta enviada.</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-emerald-500/30">
                        <p className="text-emerald-300 text-sm font-semibold">Minutos. Foco no que importa: vender.</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="text-center text-sm text-blue-300">
                <span className="text-red-400 font-semibold">ANTES:</span> 2-3 dias por aviso, processos manuais, oportunidades perdidas
                {" → "}
                <span className="text-emerald-400 font-semibold">DEPOIS:</span> Minutos, automação total, foco em vender
            </div>
        </div>
    </div>
);

// SLIDE 7: BENCHMARK
const BenchmarkSlide = () => (
    <div className="flex flex-col justify-center h-full px-8 md:px-16">
        <span className="text-base font-semibold tracking-widest text-blue-300 uppercase mb-4">Análise de Mercado</span>
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Alternativas no Mercado</h2>
        <p className="text-lg md:text-xl text-blue-200 mb-8">Custo de implementar solução similar por vias tradicionais</p>

        <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-5">
                <div className="text-sm font-bold text-blue-300 uppercase tracking-wider mb-3">Opção A</div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-3">Desenvolvimento de web app personalizada</h3>

                <div className="space-y-2 mb-4 text-sm md:text-base">
                    <div className="flex justify-between">
                        <span className="text-blue-100">Developer (3-6 meses)</span>
                        <span className="font-bold text-white">€15.000</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-blue-100">Infraestrutura</span>
                        <span className="font-bold text-white">€2.400</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-blue-100">APIs externas</span>
                        <span className="font-bold text-white">€1.200</span>
                    </div>
                </div>

                <div className="pt-3 border-t border-white/20">
                    <div className="text-3xl md:text-4xl font-bold text-white">€18.600</div>
                    <div className="text-sm text-blue-300 mt-1">Setup + 1º ano</div>
                </div>

                <div className="mt-3 text-xs md:text-sm text-amber-400 bg-amber-500/10 p-2 rounded">
                    ⚠️ Risco: dependência de 1 dev
                </div>
            </div>

            <div className="bg-gradient-to-br from-blue-700 to-blue-900 border-2 border-emerald-500 rounded-2xl p-5 relative shadow-2xl">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs md:text-sm font-bold text-center">
                    -35% CUSTO
                </div>

                <div className="text-sm font-bold text-blue-200 uppercase tracking-wider mb-3">Nossa Solução</div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-3">Premium - ConsultancyOS</h3>

                <div className="space-y-2 mb-4 text-sm md:text-base">
                    <div className="flex justify-between">
                        <span className="text-blue-100">Setup Premium</span>
                        <span className="font-bold text-white">€11.000 + IVA</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-blue-100">Retainer</span>
                        <span className="font-bold text-white">Opcional (3 meses min)</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-blue-100">Infraestrutura</span>
                        <span className="font-bold text-emerald-300">Incluído ✓</span>
                    </div>
                </div>

                <div className="pt-3 border-t border-blue-600">
                    <div className="text-3xl md:text-4xl font-bold text-white">€11.000 + IVA</div>
                    <div className="text-sm text-blue-200 mt-1">+ retainer opcional</div>
                </div>

                <div className="mt-3 text-xs md:text-sm text-emerald-300 bg-emerald-500/20 p-2 rounded">
                    ✓ Integração Bitrix nativa
                </div>
            </div>
        </div>
    </div>
);

// SLIDE 8: 3 TIERS
const PricingSlide = () => (
    <div className="flex flex-col justify-center h-full px-4 md:px-8 py-4">
        <span className="text-sm font-semibold tracking-widest text-blue-300 uppercase mb-2">Investimento Setup</span>
        <h2 className="text-2xl md:text-4xl font-bold text-white mb-3 text-center">Escolham o Nível de Setup</h2>

        {/* Retainer Info Bar */}
        <div className="bg-cyan-500/20 border border-cyan-400/50 rounded-xl p-2 mb-3 flex items-center justify-center gap-3 flex-wrap text-xs md:text-sm">
            <div className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span className="text-white font-semibold">Retainer separado • Escolhe na próxima slide</span>
            </div>
            <div className="w-px h-3 bg-cyan-400"></div>
            <div className="flex items-center gap-1 text-cyan-100">
                <span className="font-bold text-white">3 meses</span>
                <span>mínimo</span>
            </div>
            <div className="w-px h-3 bg-cyan-400"></div>
            <div className="flex items-center gap-1 text-cyan-100">
                <span className="text-xs">Após projeto concluído</span>
            </div>
        </div>

        {/* 3 Tiers */}
        <div className="grid grid-cols-3 gap-4">
            {/* STARTER */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-4 flex flex-col text-center">
                <div className="mb-3">
                    <div className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-1">Starter</div>
                    <div className="text-2xl md:text-3xl font-bold text-white">€5.000 <span className="text-sm font-normal text-blue-300">+ IVA</span></div>
                    <div className="text-blue-300 text-xs mt-1">Setup (projeto único)</div>
                </div>

                <div className="bg-blue-900/50 rounded-lg p-2 mb-3 text-center">
                    <div className="text-xs text-blue-200">Timeline</div>
                    <div className="text-lg font-bold text-white">8 semanas</div>
                </div>

                <div className="space-y-1.5 mb-3 flex-1 text-xs">
                    <div className="flex items-center justify-center gap-1">
                        <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span className="text-blue-100">Scraping PT2030/PRR/PEPAC</span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                        <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span className="text-blue-100">Matchmaking CAE completo</span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                        <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span className="text-blue-100">Dashboard básico</span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                        <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span className="text-blue-100">Treino (4h)</span>
                    </div>
                </div>

                <div className="text-xs text-blue-300 pt-2 border-t border-white/10">
                    Automatizar essencial
                </div>
            </div>

            {/* PROFESSIONAL */}
            <div className="bg-gradient-to-b from-blue-700 to-blue-800 border-2 border-emerald-500 rounded-xl p-4 flex flex-col relative shadow-xl text-center">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                    RECOMENDADO
                </div>

                <div className="mb-3">
                    <div className="text-xs font-semibold text-blue-200 uppercase tracking-wider mb-1">Professional</div>
                    <div className="text-2xl md:text-3xl font-bold text-white">€7.500 <span className="text-sm font-normal text-blue-300">+ IVA</span></div>
                    <div className="text-blue-200 text-xs mt-1">Setup (projeto único)</div>
                </div>

                <div className="bg-white/10 rounded-lg p-2 mb-3 text-center">
                    <div className="text-xs text-blue-200">Timeline</div>
                    <div className="text-lg font-bold text-white">10-12 sem</div>
                </div>

                <div className="space-y-1.5 mb-3 flex-1 text-xs">
                    <div className="flex items-center justify-center gap-1">
                        <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span className="text-white font-semibold">TUDO do Starter</span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                        <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span className="text-blue-100"><strong className="text-white">RAG</strong> - IA propostas</span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                        <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span className="text-blue-100"><strong className="text-white">Sync</strong> Bitrix bidirecional</span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                        <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span className="text-blue-100">Chatbot IA</span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                        <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span className="text-blue-100">Email Drip</span>
                    </div>
                </div>

                <div className="text-xs text-blue-200 pt-2 border-t border-blue-600">
                    Volume propostas
                </div>
            </div>

            {/* PREMIUM */}
            <div className="bg-gradient-to-b from-amber-700 to-amber-900 border-2 border-amber-500 rounded-xl p-4 flex flex-col relative shadow-xl text-center">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                    PREMIUM
                </div>

                <div className="mb-3">
                    <div className="text-xs font-semibold text-amber-200 uppercase tracking-wider mb-1">Premium</div>
                    <div className="text-2xl md:text-3xl font-bold text-white">€11.000 <span className="text-sm font-normal text-amber-300">+ IVA</span></div>
                    <div className="text-amber-200 text-xs mt-1">Setup (projeto único)</div>
                </div>

                <div className="bg-white/10 rounded-lg p-2 mb-3 text-center">
                    <div className="text-xs text-amber-200">Timeline</div>
                    <div className="text-lg font-bold text-white">16-20 sem</div>
                    <div className="text-xs text-amber-300">roadmap + impl</div>
                </div>

                <div className="space-y-1.5 mb-3 flex-1 text-xs">
                    <div className="flex items-center justify-center gap-1">
                        <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span className="text-white font-semibold">TUDO do Professional</span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                        <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span className="text-amber-100"><strong className="text-white">AI Writer</strong></span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                        <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span className="text-amber-100"><strong className="text-white">Post-Award</strong></span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                        <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span className="text-amber-100"><strong className="text-white">AI Critic</strong></span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400 flex-shrink-0" />
                        <span className="text-amber-300"><strong className="text-white">Website Auto</strong></span>
                    </div>
                </div>

                <div className="text-xs text-amber-200 pt-2 border-t border-amber-600">
                    Dominar mercado
                </div>
            </div>

        </div>
    </div>
);

// SLIDE 8.5: PROFESSIONAL VS PREMIUM - COMPARAÇÃO DETALHADA
const ProfissionalVsPremiumSlide = () => (
    <div className="flex flex-col justify-center h-full px-4 md:px-8 py-4 overflow-y-auto">
        <span className="text-sm font-semibold tracking-widest text-blue-300 uppercase mb-2">Comparação Detalhada</span>
        <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 text-center">Professional vs Premium - Qual a Diferença?</h2>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
            {/* PROFESSIONAL */}
            <div className="bg-gradient-to-br from-blue-700 to-blue-800 border-2 border-emerald-500 rounded-xl p-4 shadow-xl">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                        <Star className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">Professional</div>
                        <div className="text-lg font-bold text-white">O Essencial Inteligente</div>
                    </div>
                </div>

                <div className="bg-white/10 rounded-lg p-3 mb-3">
                    <div className="text-2xl md:text-3xl font-bold text-white">€7.500 <span className="text-sm font-normal text-blue-300">+ IVA</span></div>
                    <div className="text-blue-200 text-sm">Setup (projeto único)</div>
                </div>

                <div className="space-y-2 mb-3 text-sm">
                    <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-blue-100"><strong className="text-white">Scraping 6 portais</strong> em tempo real</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-blue-100"><strong className="text-white">Sync Bitrix</strong> automático (empresas + deals)</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-blue-100"><strong className="text-white">RAG</strong> com Gemini File Search (291 docs)</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-blue-100"><strong className="text-white">Chatbot</strong> com IA conversacional</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-blue-100"><strong className="text-white">Dashboard</strong> com KPIs e alertas</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-blue-100"><strong className="text-white">Email Drip</strong> (4 sequências)</span>
                    </div>
                </div>

                <div className="bg-emerald-500/20 border border-emerald-500/50 rounded-lg p-2 text-center">
                    <div className="text-xs text-emerald-300">
                        <Sparkles className="w-4 h-4 inline mr-1" />
                        Ideal para: Consultorias com volume de candidaturas
                    </div>
                </div>
            </div>

            {/* PREMIUM */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-600 rounded-xl p-4 shadow-xl relative">
                <div className="absolute -top-2 right-4 bg-amber-500 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    MAX
                </div>

                <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                        <Crown className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-amber-300 uppercase tracking-wider">Premium</div>
                        <div className="text-lg font-bold text-white">Automação Total</div>
                    </div>
                </div>

                <div className="bg-white/5 rounded-lg p-3 mb-3">
                    <div className="text-2xl md:text-3xl font-bold text-white">€11.000 <span className="text-sm font-normal text-slate-300">+ IVA</span></div>
                    <div className="text-slate-400 text-sm">Setup (projeto único)</div>
                </div>

                <div className="space-y-2 mb-3 text-sm">
                    <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300"><strong className="text-white">TUDO do Professional</strong></span>
                    </div>
                    <div className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300"><strong className="text-white">AI Writer</strong> - Gera rascunhos de memorias</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300"><strong className="text-white">Post-Award</strong> - Gestão de projetos aprovados</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300"><strong className="text-white">AI Critic</strong> - Revisão automática</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300"><strong className="text-white">Website Auto-Update</strong></span>
                    </div>
                </div>

                <div className="bg-amber-500/20 border border-amber-500/50 rounded-lg p-2 text-center">
                    <div className="text-xs text-amber-300">
                        <Award className="w-4 h-4 inline mr-1" />
                        Ideal para: Consultorias que querem dominar o mercado
                    </div>
                </div>
            </div>
        </div>

        {/* BANNER: Retainer separado */}
        <div className="bg-cyan-500/20 border border-cyan-400/50 rounded-xl p-3 mb-4 text-center">
            <p className="text-cyan-100 text-sm">
                <strong className="text-white">Retainer é separado:</strong> Escolhe o nível desejado na próxima slide (€600-€1.000/mês + IVA)
            </p>
        </div>

        {/* TABELA COMPARATIVA - O QUE REALMENTE MUDA */}
        <div className="bg-white/5 rounded-xl p-4 mb-4 border border-white/10">
            <div className="text-sm font-bold text-blue-300 mb-3 flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                O que REALMENTE muda
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-xs md:text-sm">
                    <thead>
                        <tr className="border-b border-white/20">
                            <th className="text-left py-2 text-blue-300 font-normal">Feature</th>
                            <th className="text-center py-2 text-blue-400 font-semibold">Professional</th>
                            <th className="text-center py-2 text-amber-400 font-semibold">Premium</th>
                            <th className="text-center py-2 text-emerald-300 font-semibold">Vale a pena?</th>
                        </tr>
                    </thead>
                    <tbody className="text-blue-100">
                        <tr className="border-b border-white/10">
                            <td className="py-2 font-semibold text-white">Escrita de propostas</td>
                            <td className="text-center text-blue-300">Manual</td>
                            <td className="text-center text-amber-300">IA ajuda</td>
                            <td className="text-center text-emerald-300">Se muitas candidaturas</td>
                        </tr>
                        <tr className="border-b border-white/10">
                            <td className="py-2 font-semibold text-white">Gestão pós-aprovação</td>
                            <td className="text-center text-blue-300">Excel</td>
                            <td className="text-center text-amber-300">Dashboard</td>
                            <td className="text-center text-emerald-300">Se &gt;5 projetos ativos</td>
                        </tr>
                        <tr className="border-b border-white/10">
                            <td className="py-2 font-semibold text-white">Website updates</td>
                            <td className="text-center text-blue-300">Manual</td>
                            <td className="text-center text-amber-300">Automático</td>
                            <td className="text-center text-emerald-300">Se crítico</td>
                        </tr>
                        <tr>
                            <td className="py-2 font-semibold text-white">Marketing strategy</td>
                            <td className="text-center text-blue-300">Manual</td>
                            <td className="text-center text-amber-300">AI sugestões</td>
                            <td className="text-center text-emerald-300">Se precisam de ideias</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

    </div>
);

// SLIDE 8.6: RETAINER - O QUE ESTÁ INCLUÍDO
const RetainerIncluidoSlide = () => (
    <div className="flex flex-col justify-center h-full px-4 md:px-8 py-4 overflow-y-auto">
        <span className="text-sm font-semibold tracking-widest text-cyan-300 uppercase mb-2">Retainer</span>
        <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 text-center">O que está Incluído</h2>
        <p className="text-center text-blue-200 text-sm mb-4">Suporte pós-projeto com diferentes níveis de dedicacao</p>

        {/* IMPORTANTE: Inicia APÓS conclusão do projeto */}
        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/50 rounded-xl p-3 mb-4">
            <div className="flex items-center justify-center gap-2 text-amber-100 text-sm">
                <Clock className="w-4 h-4 text-amber-400" />
                <span><strong className="text-white">Retainer inicia APÓS conclusão do projeto</strong> • Mínimo de 3 meses</span>
            </div>
        </div>

        {/* TABELA COMPARATIVA DE RETAINER */}
        <div className="bg-white/5 rounded-xl p-4 mb-4 border border-white/10">
            <div className="overflow-x-auto">
                <table className="w-full text-xs md:text-sm">
                    <thead>
                        <tr className="border-b border-white/20">
                            <th className="text-left py-2 px-3 text-cyan-300 font-semibold">Feature</th>
                            <th className="text-center py-2 px-3 text-blue-400 font-semibold">Starter</th>
                            <th className="text-center py-2 px-3 text-emerald-400 font-semibold">Professional</th>
                            <th className="text-center py-2 px-3 text-amber-400 font-semibold">Premium</th>
                        </tr>
                    </thead>
                    <tbody className="text-blue-100">
                        <tr className="border-b border-white/10">
                            <td className="py-2 px-3 font-semibold text-white">Horas Dedicadas</td>
                            <td className="text-center py-2 px-3 text-blue-300"><strong className="text-white">5h</strong>/mês</td>
                            <td className="text-center py-2 px-3 text-emerald-300"><strong className="text-white">8h</strong>/mês</td>
                            <td className="text-center py-2 px-3 text-amber-300"><strong className="text-white">12h</strong>/mês</td>
                        </tr>
                        <tr className="border-b border-white/10">
                            <td className="py-2 px-3 font-semibold text-white">SLA Resposta</td>
                            <td className="text-center py-2 px-3 text-blue-300">3 dias úteis</td>
                            <td className="text-center py-2 px-3 text-emerald-300">2 dias úteis</td>
                            <td className="text-center py-2 px-3 text-amber-300">1 dia útil</td>
                        </tr>
                        <tr className="border-b border-white/10">
                            <td className="py-2 px-3 font-semibold text-white">Monitoramento 24/7</td>
                            <td className="text-center py-2 px-3 text-blue-300"><X className="w-4 h-4 mx-auto text-red-400" /></td>
                            <td className="text-center py-2 px-3 text-emerald-300"><Check className="w-4 h-4 mx-auto text-emerald-400" /></td>
                            <td className="text-center py-2 px-3 text-amber-300"><Check className="w-4 h-4 mx-auto text-emerald-400" /></td>
                        </tr>
                        <tr className="border-b border-white/10">
                            <td className="py-2 px-3 font-semibold text-white">Reunião Mensal</td>
                            <td className="text-center py-2 px-3 text-blue-300"><Check className="w-4 h-4 mx-auto" /></td>
                            <td className="text-center py-2 px-3 text-emerald-300"><Check className="w-4 h-4 mx-auto" /></td>
                            <td className="text-center py-2 px-3 text-amber-300"><Check className="w-4 h-4 mx-auto" /></td>
                        </tr>
                        <tr className="border-b border-white/10">
                            <td className="py-2 px-3 font-semibold text-white">Manutenção Scrapers</td>
                            <td className="text-center py-2 px-3 text-blue-300"><Check className="w-4 h-4 mx-auto" /></td>
                            <td className="text-center py-2 px-3 text-emerald-300"><Check className="w-4 h-4 mx-auto" /></td>
                            <td className="text-center py-2 px-3 text-amber-300"><Check className="w-4 h-4 mx-auto" /></td>
                        </tr>
                        <tr className="border-b border-white/10">
                            <td className="py-2 px-3 font-semibold text-white">Atualizações</td>
                            <td className="text-center py-2 px-3 text-blue-300">Quando necessário</td>
                            <td className="text-center py-2 px-3 text-emerald-300">Mensais</td>
                            <td className="text-center py-2 px-3 text-amber-300">Quinzenais</td>
                        </tr>
                        <tr className="border-b border-white/10">
                            <td className="py-2 px-3 font-semibold text-white">Sessão Roadmap</td>
                            <td className="text-center py-2 px-3 text-blue-300"><X className="w-4 h-4 mx-auto text-red-400" /></td>
                            <td className="text-center py-2 px-3 text-emerald-300">Trimestral</td>
                            <td className="text-center py-2 px-3 text-amber-300">Mensal</td>
                        </tr>
                        <tr>
                            <td className="py-2 px-3 font-semibold text-white">Preço Mensal</td>
                            <td className="text-center py-2 px-3 text-blue-300"><strong className="text-white">€600</strong> + IVA</td>
                            <td className="text-center py-2 px-3 text-emerald-300"><strong className="text-white">€800</strong> + IVA</td>
                            <td className="text-center py-2 px-3 text-amber-300"><strong className="text-white">€1.000</strong> + IVA</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        {/* CARDS RESUMO */}
        <div className="grid md:grid-cols-3 gap-3">
            {/* STARTER RETAINER */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-3">
                <div className="text-center mb-2">
                    <div className="text-xs font-semibold text-blue-300 uppercase tracking-wider">Starter</div>
                    <div className="text-2xl font-bold text-white">€600 <span className="text-xs font-normal text-blue-300">/mês</span></div>
                </div>
                <div className="space-y-1 text-xs text-blue-100">
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-blue-400" />
                        <span>5h/mês dedicadas</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Shield className="w-3 h-3 text-blue-400" />
                        <span>SLA: 3 dias úteis</span>
                    </div>
                </div>
            </div>

            {/* PROFESSIONAL RETAINER */}
            <div className="bg-gradient-to-b from-emerald-700 to-emerald-800 border-2 border-emerald-500 rounded-xl p-3 relative">
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">RECOMENDADO</span>
                <div className="text-center mb-2 mt-1">
                    <div className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">Professional</div>
                    <div className="text-2xl font-bold text-white">€800 <span className="text-xs font-normal text-emerald-300">/mês</span></div>
                </div>
                <div className="space-y-1 text-xs text-emerald-100">
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        <span>8h/mês dedicadas</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Shield className="w-3 h-3 text-emerald-400" />
                        <span>SLA: 2 dias úteis</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Monitoramento 24/7</span>
                    </div>
                </div>
            </div>

            {/* PREMIUM RETAINER */}
            <div className="bg-gradient-to-b from-amber-700 to-amber-800 border border-amber-500 rounded-xl p-3 relative">
                <span className="absolute -top-2 right-3 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    MAX
                </span>
                <div className="text-center mb-2 mt-1">
                    <div className="text-xs font-semibold text-amber-200 uppercase tracking-wider">Premium</div>
                    <div className="text-2xl font-bold text-white">€1.000 <span className="text-xs font-normal text-amber-300">/mês</span></div>
                </div>
                <div className="space-y-1 text-xs text-amber-100">
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>12h/mês dedicadas</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Shield className="w-3 h-3 text-amber-400" />
                        <span>SLA: 1 dia útil</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Monitoramento 24/7</span>
                    </div>
                </div>
            </div>
        </div>

        {/* O QUE GARANTE O RETAINER */}
        <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 rounded-xl p-3 mt-4">
            <div className="text-xs font-bold text-white mb-2 flex items-center gap-2 justify-center">
                <Shield className="w-4 h-4 text-cyan-400" />
                O que garante o retainer
            </div>
            <div className="grid md:grid-cols-2 gap-2 text-cyan-100 text-xs">
                <div className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-cyan-400" />
                    <span><strong>Platform stability:</strong> Scrapers adaptados quando portais mudam</span>
                </div>
                <div className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-cyan-400" />
                    <span><strong>Suporte contínuo:</strong> Dúvidas resolvidas recorrentemente</span>
                </div>
                <div className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-cyan-400" />
                    <span><strong>Evolução:</strong> Plataforma melhora com novas features</span>
                </div>
                <div className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-cyan-400" />
                    <span><strong>Segurança:</strong> Atualizações aplicadas de imediato</span>
                </div>
            </div>
        </div>
    </div>
);

// SLIDE 8.75: RETAINER MODULES
const RetainerModulesSlide = () => (
    <div className="flex flex-col justify-center h-full px-4 md:px-8 py-4">
        <span className="text-sm font-semibold tracking-widest text-cyan-300 uppercase mb-2">Retainer Modules</span>
        <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 text-center">Escolhe o Nível de Suporte</h2>
        <p className="text-center text-blue-200 text-sm mb-4">Inicia APÓS conclusão do projeto • Mínimo 3 meses</p>

        <div className="grid md:grid-cols-3 gap-3 mb-4">
            {/* STARTER RETAINER */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-4 flex flex-col">
                <div className="mb-3">
                    <div className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-1">Starter Retainer</div>
                    <div className="text-2xl md:text-3xl font-bold text-white">€600 <span className="text-sm font-normal text-blue-300">/mês + IVA</span></div>
                </div>

                <div className="bg-blue-900/50 rounded-lg p-2 mb-3">
                    <div className="flex items-center gap-2 text-blue-200 text-sm">
                        <Users className="w-4 h-4" />
                        <span><strong className="text-white">5h/mês</strong> suporte</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-200 text-sm mt-1">
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>1 reunião mensal</span>
                    </div>
                </div>

                <div className="space-y-1 mb-3 flex-1 text-xs">
                    <div className="flex items-center gap-2 text-blue-100">
                        <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span>Manutenção scrapers</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-100">
                        <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span>Suporte email</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-100">
                        <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span>Backup diário</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-100">
                        <X className="w-3 h-3 text-red-400 flex-shrink-0" />
                        <span>Monitoramento 24/7</span>
                    </div>
                </div>

                <div className="text-center py-2 px-3 bg-blue-500/20 rounded-lg">
                    <span className="text-xs text-blue-300">SLA: 3 dias úteis</span>
                </div>
            </div>

            {/* PROFESSIONAL RETAINER */}
            <div className="bg-gradient-to-b from-emerald-700 to-emerald-800 border-2 border-emerald-500 rounded-xl p-4 flex flex-col relative shadow-xl">
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">RECOMENDADO</span>

                <div className="mb-3">
                    <div className="text-xs font-semibold text-emerald-200 uppercase tracking-wider mb-1">Professional Retainer</div>
                    <div className="text-2xl md:text-3xl font-bold text-white">€800 <span className="text-sm font-normal text-emerald-300">/mês + IVA</span></div>
                </div>

                <div className="bg-white/10 rounded-lg p-2 mb-3">
                    <div className="flex items-center gap-2 text-emerald-200 text-sm">
                        <Users className="w-4 h-4" />
                        <span><strong className="text-white">8h/mês</strong> suporte</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-200 text-sm mt-1">
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>1 reunião mensal</span>
                    </div>
                </div>

                <div className="space-y-1 mb-3 flex-1 text-xs">
                    <div className="flex items-center gap-2 text-white">
                        <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span><strong>TUDO do Starter</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-100">
                        <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span>Monitoramento 24/7</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-100">
                        <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span>Atualizações mensais</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-100">
                        <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span>Sessão trimestral roadmap</span>
                    </div>
                </div>

                <div className="text-center py-2 px-3 bg-emerald-500/30 rounded-lg">
                    <span className="text-xs text-emerald-200">SLA: 2 dias úteis</span>
                </div>
            </div>

            {/* PREMIUM RETAINER */}
            <div className="bg-gradient-to-b from-amber-700 to-amber-800 border border-amber-500 rounded-xl p-4 flex flex-col relative shadow-xl">
                <span className="absolute -top-2 right-4 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    MAX
                </span>

                <div className="mb-3">
                    <div className="text-xs font-semibold text-amber-200 uppercase tracking-wider mb-1">Premium Retainer</div>
                    <div className="text-2xl md:text-3xl font-bold text-white">€1.000 <span className="text-sm font-normal text-amber-300">/mês + IVA</span></div>
                </div>

                <div className="bg-white/10 rounded-lg p-2 mb-3">
                    <div className="flex items-center gap-2 text-amber-200 text-sm">
                        <Users className="w-4 h-4" />
                        <span><strong className="text-white">12h/mês</strong> suporte</span>
                    </div>
                    <div className="flex items-center gap-2 text-amber-200 text-sm mt-1">
                        <Check className="w-3 h-3 text-amber-400" />
                        <span>1 reunião mensal</span>
                    </div>
                </div>

                <div className="space-y-1 mb-3 flex-1 text-xs">
                    <div className="flex items-center gap-2 text-white">
                        <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span><strong>TUDO do Professional</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-amber-100">
                        <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span>SLA prioritário 1 dia</span>
                    </div>
                    <div className="flex items-center gap-2 text-amber-100">
                        <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span>Atualizações quinzenais</span>
                    </div>
                    <div className="flex items-center gap-2 text-amber-100">
                        <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span>Sessão mensal roadmap</span>
                    </div>
                </div>

                <div className="text-center py-2 px-3 bg-amber-500/30 rounded-lg">
                    <span className="text-xs text-amber-200">SLA: 1 dia útil</span>
                </div>
            </div>
        </div>

        <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 rounded-xl p-4">
            <div className="text-sm font-bold text-white mb-2 flex items-center gap-2 justify-center">
                <Shield className="w-5 h-5 text-cyan-400" />
                O que garante o retainer
            </div>
            <div className="grid md:grid-cols-4 gap-3 text-cyan-100 text-xs text-center">
                <div className="flex items-center justify-center gap-1">
                    <Check className="w-3 h-3 text-cyan-400" />
                    <span><strong>Platform stability:</strong> Scrapers adaptados quando portais mudam</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                    <Check className="w-3 h-3 text-cyan-400" />
                    <span><strong>Suporte contínuo:</strong> Dúvidas resolvidas recorrentemente</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                    <Check className="w-3 h-3 text-cyan-400" />
                    <span><strong>Evolução:</strong> Plataforma melhora com novas features</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                    <Check className="w-3 h-3 text-cyan-400" />
                    <span><strong>Segurança:</strong> Atualizações aplicadas de imediato</span>
                </div>
            </div>
        </div>
    </div>
);

// SLIDE 9: TIMELINE
const TimelineSlide = () => (
    <div className="flex flex-col justify-center h-full px-8 md:px-20">
        <span className="text-base font-semibold tracking-widest text-blue-300 uppercase mb-4">Implementação</span>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-10">Timeline por Tier</h2>

        <div className="grid grid-cols-3 gap-6">
            <div className="border border-blue-500/50 rounded-xl p-5">
                <div className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-sm font-bold text-white">S</div>
                    Starter - 8 semanas
                </div>
                <div className="space-y-3 text-base">
                    <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                            <div className="font-semibold text-blue-200">Sem 1-2</div>
                            <div className="text-sm text-blue-300">Setup scrapers + API Bitrix</div>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                            <div className="font-semibold text-blue-200">Sem 3-4</div>
                            <div className="text-sm text-blue-300">Matchmaking + testes</div>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                            <div className="font-semibold text-blue-200">Sem 5-6</div>
                            <div className="text-sm text-blue-300">Dashboard + notificações</div>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                            <div className="font-semibold text-blue-200">Sem 7-8</div>
                            <div className="text-sm text-blue-300">Go-live + treino</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-2 border-emerald-500 rounded-xl p-5 bg-emerald-500/10">
                <div className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-sm font-bold text-white">P</div>
                    Professional - 12 semanas
                </div>
                <div className="space-y-3 text-base">
                    <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                            <div className="font-semibold text-blue-200">Sem 1-4</div>
                            <div className="text-sm text-blue-300">TUDO do Starter</div>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                            <div className="font-semibold text-blue-200">Sem 5-8</div>
                            <div className="text-sm text-blue-300">RAG setup + 291 docs</div>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                            <div className="font-semibold text-blue-200">Sem 9-10</div>
                            <div className="text-sm text-blue-300">Write-back Bitrix</div>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                            <div className="font-semibold text-blue-200">Sem 11-12</div>
                            <div className="text-sm text-blue-300">Produção completa</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border border-slate-600 rounded-xl p-5 bg-slate-800/50">
                <div className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center text-sm font-bold text-white">P+</div>
                    Premium - 20 semanas
                </div>
                <div className="space-y-3 text-base">
                    <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                            <div className="font-semibold text-slate-300">Sem 1-12</div>
                            <div className="text-sm text-slate-400">TUDO do Professional</div>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                            <div className="font-semibold text-slate-300">Sem 13-16</div>
                            <div className="text-sm text-slate-400">AI Critic + Drip emails</div>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                            <div className="font-semibold text-slate-300">Sem 17-20</div>
                            <div className="text-sm text-slate-400">Post-Award + refinamentos</div>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-slate-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                            <div className="font-semibold text-slate-500">Q2-Q3</div>
                            <div className="text-sm text-slate-500">Roadmap items futuros</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// SLIDE 10: ROI (CORRIGIDO COM DADOS REAIS PORTUGAL 2026)
const ROISlide = () => (
    <div className="flex flex-col justify-center h-full px-6 md:px-16 py-4">
        <span className="text-base font-semibold tracking-widest text-emerald-300 uppercase mb-3">Retorno</span>
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Análise de ROI</h2>

        {/* Métricas de Base - Dados Reais Portugal 2026 */}
        <div className="bg-white/5 rounded-xl p-3 mb-4 border border-white/10">
            <div className="text-xs md:text-sm text-blue-300 mb-2">Métricas conservadoras baseadas em dados reais Portugal 2026:</div>
            <div className="flex flex-wrap gap-4 text-xs md:text-sm">
                <div className="flex items-center gap-1">
                    <span className="text-white">€100</span>
                    <span className="text-blue-200">custo/lead</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="text-white">3%</span>
                    <span className="text-blue-200">conversão atual</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="text-white">€5.000</span>
                    <span className="text-blue-200">ticket médio</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="text-white">€45/h</span>
                    <span className="text-blue-200">custo hora real</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="text-white">6-8h</span>
                    <span className="text-blue-200">horas/proposta</span>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
                <div className="text-xs font-semibold text-blue-300 mb-2">STARTER</div>
                <div className="text-2xl md:text-3xl font-bold text-white mb-2">€12.200 <span className="text-sm font-normal text-blue-300">+ IVA</span></div>
                <div className="text-xs md:text-sm text-blue-300 mb-3">Investimento 1º ano</div>

                <div className="space-y-1.5 text-xs md:text-sm mb-3">
                    <div className="flex justify-between">
                        <span className="text-blue-100">Novo custo/lead</span>
                        <span className="font-bold text-white">€35</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-blue-100">Nova conversão</span>
                        <span className="font-bold text-white">5%</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-blue-100">Horas poupadas</span>
                        <span className="font-bold text-white">4h/prop</span>
                    </div>
                </div>

                <div className="pt-3 border-t border-white/10">
                    <div className="text-3xl md:text-4xl font-bold text-emerald-400">4.5m</div>
                    <div className="text-xs md:text-sm text-blue-300">Payback</div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-blue-700 to-blue-800 border border-emerald-500 rounded-xl p-4 text-center">
                <div className="text-xs font-semibold text-blue-200 mb-2">PROFESSIONAL</div>
                <div className="text-2xl md:text-3xl font-bold text-white mb-2">€17.100 <span className="text-sm font-normal text-blue-300">+ IVA</span></div>
                <div className="text-xs md:text-sm text-blue-200 mb-3">Investimento 1º ano</div>

                <div className="space-y-1.5 text-xs md:text-sm mb-3">
                    <div className="flex justify-between">
                        <span className="text-blue-100">Novo custo/lead</span>
                        <span className="font-bold text-white">€25</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-blue-100">Nova conversão</span>
                        <span className="font-bold text-white">8%</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-blue-100">Horas poupadas</span>
                        <span className="font-bold text-white">6h/prop</span>
                    </div>
                </div>

                <div className="pt-3 border-t border-blue-600">
                    <div className="text-3xl md:text-4xl font-bold text-emerald-400">3.5m</div>
                    <div className="text-xs md:text-sm text-blue-200">Payback</div>
                </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
                <div className="text-xs font-semibold text-slate-400 mb-2">PREMIUM</div>
                <div className="text-2xl md:text-3xl font-bold text-white mb-2">€23.000 <span className="text-sm font-normal text-slate-300">+ IVA</span></div>
                <div className="text-xs md:text-sm text-slate-400 mb-3">Investimento 1º ano</div>

                <div className="space-y-1.5 text-xs md:text-sm mb-3">
                    <div className="flex justify-between">
                        <span className="text-slate-300">Novo custo/lead</span>
                        <span className="font-bold text-white">€18</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-300">Nova conversão</span>
                        <span className="font-bold text-white">12%</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-300">Horas poupadas</span>
                        <span className="font-bold text-white">7h/prop</span>
                    </div>
                </div>

                <div className="pt-3 border-t border-white/10">
                    <div className="text-3xl md:text-4xl font-bold text-emerald-400">4m</div>
                    <div className="text-xs md:text-sm text-slate-400">Payback</div>
                </div>
            </div>
        </div>

        {/* Exemplo de Cálculo Detalhado - Professional */}
        <div className="bg-emerald-500/10 border border-emerald-500/50 rounded-xl p-4">
            <div className="text-base md:text-lg font-bold text-white mb-3">Exemplo de Cálculo - Professional</div>
            <div className="grid md:grid-cols-2 gap-4 text-xs md:text-sm">
                <div>
                    <div className="text-emerald-400 font-semibold mb-1">Ganhos Mensais (após implementação):</div>
                    <div className="space-y-0.5 text-blue-100">
                        <div>• Economia tempo (10 props × 6h × €45) = <span className="text-white font-bold">€2.700</span></div>
                        <div>• Aumento conversão (3% → 8%) = +0.5 proj/mês = <span className="text-white font-bold">€2.500</span></div>
                        <div className="text-base text-white font-bold mt-1">Ganho total mensal: €5.200</div>
                    </div>
                </div>
                <div>
                    <div className="text-emerald-400 font-semibold mb-1">Custo e Payback:</div>
                    <div className="space-y-0.5 text-blue-100">
                        <div>• Investimento: <span className="text-white font-bold">€17.100 + IVA</span></div>
                        <div>• Retainer: <span className="text-white font-bold">€800/mês + IVA</span></div>
                        <div className="text-base text-white font-bold mt-1">Payback: ~3.3 meses | ROI anual: 280%</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// SLIDE 11: PORQUÊ AGORA
const UrgencySlide = () => (
    <div className="flex flex-col justify-center h-full px-8 md:px-20">
        <span className="text-base font-semibold tracking-widest text-red-300 uppercase mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Urgência
        </span>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-10">Porquê Começar Agora?</h2>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-red-500/20 border-l-4 border-red-500 p-5 rounded-r-xl">
                <h3 className="text-xl font-bold text-white mb-2">PT2030 Acelera</h3>
                <p className="text-blue-100 text-base">2026-2027 serão os anos com mais avisos e prazos apertados. Quem tiver melhor tecnologia ganha.</p>
            </div>

            <div className="bg-orange-500/20 border-l-4 border-orange-500 p-5 rounded-r-xl">
                <h3 className="text-xl font-bold text-white mb-2">Vantagem Temporal</h3>
                <p className="text-blue-100 text-base">Outras consultoras estão a automatizar. Ser o primeiro dá vantagem duradoura.</p>
            </div>

            <div className="bg-amber-500/20 border-l-4 border-amber-500 p-5 rounded-r-xl">
                <h3 className="text-xl font-bold text-white mb-2">ROI Imediato</h3>
                <p className="text-blue-100 text-base">Em 10-12 semanas tem o sistema a gerar leads. Payback no primeiro ano.</p>
            </div>
        </div>

        <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-2xl p-8">
            <div className="text-center mb-6">
                <div className="text-base font-semibold text-slate-400 mb-3 uppercase tracking-wider">Janela de Oportunidade</div>

                <div className="relative h-3 bg-slate-700 rounded-full overflow-hidden mb-6 max-w-md mx-auto">
                    <div className="absolute left-0 top-0 h-full w-3/4 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"></div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                        <div className="text-5xl font-bold text-white mb-2">75%</div>
                        <div className="text-base text-slate-400">Janela ocupada</div>
                    </div>
                    <div>
                        <div className="text-5xl font-bold text-emerald-400 mb-2">2026</div>
                        <div className="text-base text-slate-400">Ano crítico</div>
                    </div>
                </div>

                <div className="bg-white/5 rounded-xl p-5">
                    <p className="text-xl leading-relaxed text-blue-100">
                        "A primeira consultora a dominar IA em fundos comunitários vai dominar o mercado nos próximos 5 anos."
                    </p>
                </div>
            </div>
        </div>
    </div>
);

// SLIDE 12: CTA
const CTASlide = () => (
    <div className="flex flex-col justify-center items-center h-full text-center px-8 md:px-20">
        <Image src="/logo-ta.png" alt="TA Consulting" width={100} height={100} className="mb-8" />

        <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
            Prontos para Transformar<br />
            <span className="text-blue-400">a Vossa Consultoria?</span>
        </h2>

        <p className="text-xl md:text-2xl text-blue-200 mb-12 max-w-3xl leading-relaxed">
            Agendem uma demonstração e vejam o ConsultancyOS em ação. Sem compromisso, sem sales pitch - apenas código funcional.
        </p>

        <div className="flex flex-col sm:flex-row gap-5 mb-12">
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-5 rounded-xl font-semibold text-xl transition-colors">
                Agendar Demo
                <ArrowRight className="inline ml-3 w-6 h-6" />
            </button>

            <Link href="/dashboard" className="border-2 border-white text-white hover:bg-white hover:text-blue-900 px-10 py-5 rounded-xl font-semibold text-xl transition-colors">
                Ver Dashboard
            </Link>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 max-w-2xl">
            <h3 className="text-xl font-bold text-white mb-5">Não sabem qual tier escolher?</h3>
            <div className="space-y-3 text-base text-left">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                    <span className="text-blue-100"><strong className="text-white">Starter:</strong> Querem automatizar scraping e matching básico</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                    <span className="text-blue-100"><strong className="text-white">Professional:</strong> Querem RAG para propostas e sync completo</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-slate-500 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                    <span className="text-blue-100"><strong className="text-white">Premium:</strong> Querem dominar com features avançadas</span>
                </div>
            </div>
        </div>

        <div className="mt-12 flex items-center gap-3 text-base text-blue-300">
            <Shield className="w-5 h-5" />
            <span>CONFIDENCIAL - Preparado exclusivamente para TA Consulting</span>
        </div>
    </div>
);

// ============================================================================
// MAIN PRESENTATION COMPONENT
// ============================================================================

const slides = [
    HeroSlide,
    ContextSlide,
    ProblemSlide,
    RequestSlide,
    SolutionSlide,
    HowItWorksSlide,
    BenchmarkSlide,
    PricingSlide,
    ProfissionalVsPremiumSlide,
    RetainerIncluidoSlide,
    RetainerModulesSlide,
    TimelineSlide,
    ROISlide,
    UrgencySlide,
    CTASlide
];

export default function ApresentacaoV5Page() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [direction, setDirection] = useState(0);

    const totalSlides = slides.length;

    const nextSlide = useCallback(() => {
        if (currentSlide < totalSlides - 1) {
            setDirection(1);
            setCurrentSlide(prev => prev + 1);
        }
    }, [currentSlide, totalSlides]);

    const prevSlide = useCallback(() => {
        if (currentSlide > 0) {
            setDirection(-1);
            setCurrentSlide(prev => prev - 1);
        }
    }, [currentSlide]);

    const goToSlide = useCallback((index: number) => {
        setDirection(index > currentSlide ? 1 : -1);
        setCurrentSlide(index);
    }, [currentSlide]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                nextSlide();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                prevSlide();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [nextSlide, prevSlide]);

    // Animation variants
    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.95
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.95
        })
    };

    const CurrentSlideComponent = slides[currentSlide];

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 overflow-hidden font-sans">
            <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                    key={currentSlide}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 },
                        scale: { duration: 0.2 }
                    }}
                    className="absolute inset-0"
                >
                    <CurrentSlideComponent />
                </motion.div>
            </AnimatePresence>

            {/* Navigation Controls */}
            <div className="fixed bottom-0 left-0 right-0 z-50">
                {/* Progress Bar */}
                <div className="h-1.5 bg-blue-950">
                    <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-emerald-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>

                {/* Navigation Footer */}
                <div className="bg-blue-950/90 backdrop-blur-sm border-t border-white/10 px-6 py-4 flex items-center justify-between">
                    <button
                        onClick={prevSlide}
                        disabled={currentSlide === 0}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-blue-200 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-base"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Anterior
                    </button>

                    <div className="flex items-center gap-4">
                        <span className="text-base text-blue-300 font-semibold">
                            {currentSlide + 1} de {totalSlides}
                        </span>
                        <div className="flex gap-2">
                            {slides.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToSlide(index)}
                                    className={`transition-all ${
                                        index === currentSlide
                                            ? 'bg-emerald-500 w-10 h-2.5 rounded-full'
                                            : 'bg-blue-700 hover:bg-blue-600 w-2.5 h-2.5 rounded-full'
                                    }`}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={nextSlide}
                        disabled={currentSlide === totalSlides - 1}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-blue-200 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-base"
                    >
                        Próximo
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Keyboard hint */}
            <div className="fixed top-6 right-6 z-50 text-sm text-blue-300 bg-blue-950/90 backdrop-blur-sm px-5 py-3 rounded-xl border border-white/10">
                Use ← → ou Espaço para navegar
            </div>
        </div>
    );
}
