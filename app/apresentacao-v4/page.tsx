'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, BarChart3, AlertTriangle, Lightbulb, Target, Globe, Zap, Database, TrendingUp, Clock, Check, Shield } from 'lucide-react';

// ============================================================================
// SLIDE COMPONENTS
// ============================================================================

// SLIDE 1: HERO
const HeroSlide = () => (
    <div className="flex flex-col justify-center items-center h-full text-center px-8 md:px-20">
        {/* Logo TA Consulting */}
        <div className="mb-8">
            <svg className="w-16 h-16 mx-auto" viewBox="0 0 256 256">
                <rect width="256" height="256" fill="#0066CC" rx="32"/>
                <path d="M64 80h128v24H152v96h-24V104H64z" fill="#ffffff"/>
                <path d="M176 128l32 72h-26l-6-14h-28l-6 14h-26l32-72h28zm-14 42h16l-8-18z" fill="#00AA66"/>
            </svg>
        </div>

        <div className="mb-6">
            <span className="text-sm font-semibold tracking-widest text-blue-300 uppercase">Janeiro 2026</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Transformem 24.000 Empresas<br />
            <span className="text-blue-400">em Oportunidades</span>
        </h1>

        <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl leading-relaxed">
            A camada de Inteligência Artificial que o vosso Bitrix24 precisa para captar fundos europeus
        </p>

        <div className="flex items-center gap-8 text-blue-100">
            <div className="text-center">
                <div className="text-4xl font-bold text-white">€3.5B+</div>
                <div className="text-sm">Fundos Disponíveis</div>
            </div>
            <div className="w-px h-12 bg-blue-400"></div>
            <div className="text-center">
                <div className="text-4xl font-bold text-white">24k+</div>
                <div className="text-sm">Empresas na Base</div>
            </div>
            <div className="w-px h-12 bg-blue-400"></div>
            <div className="text-center">
                <div className="text-4xl font-bold text-white">291</div>
                <div className="text-sm">Candidaturas Históricas</div>
            </div>
        </div>
    </div>
);

// SLIDE 2: CONTEXTO - A Oportunidade
const ContextSlide = () => (
    <div className="flex flex-col justify-center h-full px-8 md:px-20">
        <span className="text-sm font-semibold tracking-widest text-blue-300 uppercase mb-4">Contexto de Mercado</span>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-12">A Janela de Oportunidade é 2026</h2>

        <div className="grid grid-cols-3 gap-6 mb-10">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                <div className="text-5xl font-bold text-white mb-2">€3.5B</div>
                <div className="text-blue-200">Europa 2021-2027</div>
                <div className="text-sm text-blue-300 mt-2">Fundos para empresas portuguesas</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                <div className="text-5xl font-bold text-emerald-400 mb-2">82%</div>
                <div className="text-blue-200">Não Aproveitados</div>
                <div className="text-sm text-blue-300 mt-2">Empresas deixam dinheiro na mesa</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                <div className="text-5xl font-bold text-amber-400 mb-2">2026</div>
                <div className="text-blue-200">Pico de Avisos</div>
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
        <span className="text-sm font-semibold tracking-widest text-red-300 uppercase mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            O Problema
        </span>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-12">As Dores que Reconhecem</h2>

        <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
                <div className="bg-red-500/20 border-l-4 border-red-500 p-5 rounded-r-xl">
                    <h3 className="text-lg font-bold text-white mb-2">"24.000 contactos, mas não sei quais vender"</h3>
                    <p className="text-blue-200 text-sm">Manualmente é impossível cruzar elegibilidades. Oportunidades perdem-se diariamente.</p>
                </div>

                <div className="bg-orange-500/20 border-l-4 border-orange-500 p-5 rounded-r-xl">
                    <h3 className="text-lg font-bold text-white mb-2">"Excel verde/vermelho todas as semanas"</h3>
                    <p className="text-blue-200 text-sm">Processo manual de marketing mix. Tempo perdido em tarefas repetitivas.</p>
                </div>

                <div className="bg-amber-500/20 border-l-4 border-amber-500 p-5 rounded-r-xl">
                    <h3 className="text-lg font-bold text-white mb-2">"Paula atualiza o website manualmente"</h3>
                    <p className="text-blue-200 text-sm">Quando avisos mudam, alguém tem que ir ao site. Não é escalável.</p>
                </div>

                <div className="bg-yellow-500/20 border-l-4 border-yellow-500 p-5 rounded-r-xl">
                    <h3 className="text-lg font-bold text-white mb-2">"Leads que se vão embora"</h3>
                    <p className="text-blue-200 text-sm">Formulários longos à cabeça afastam potenciais clientes.</p>
                </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-6">O Custo do Manual</h3>

                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="text-blue-200">Base de dados ativa</span>
                            <span className="font-bold text-red-400">&lt;5%</span>
                        </div>
                        <div className="h-2 bg-blue-900 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 rounded-full" style={{ width: '5%' }}></div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="text-blue-200">Tempo em tarefas manuais</span>
                            <span className="font-bold text-red-400">60%</span>
                        </div>
                        <div className="h-2 bg-blue-900 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 rounded-full" style={{ width: '60%' }}></div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="text-blue-200">291 candidaturas subutilizadas</span>
                            <span className="font-bold text-amber-400">0%</span>
                        </div>
                        <div className="h-2 bg-blue-900 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: '0%' }}></div>
                        </div>
                        <p className="text-xs text-blue-300 mt-2">Conhecimento não estruturado = não utilizável</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// SLIDE 4: O PEDIDO - O que Fernando pediu
const RequestSlide = () => (
    <div className="flex flex-col justify-center h-full px-8 md:px-20">
        <span className="text-sm font-semibold tracking-widest text-emerald-300 uppercase mb-4 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            A Visão
        </span>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">O que Foi Pedido</h2>
        <p className="text-xl text-blue-200 mb-12">Baseado na reunião com Fernando - prioridades reais, não vaporware</p>

        <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl border border-white/20 flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Database className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white">"Quero falar com os meus documentos"</h3>
                        <p className="text-blue-200 text-sm mt-1">RAG sobre 291 candidaturas históricas - pesquisar e reutilizar conhecimento</p>
                    </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl border border-white/20 flex items-start gap-4">
                    <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white">Matchmaking automático</h3>
                        <p className="text-blue-200 text-sm mt-1">CAE + Região + Dimensão ↔ Avisos. Top matches em segundos.</p>
                    </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl border border-white/20 flex items-start gap-4">
                    <div className="w-10 h-10 bg-violet-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white">Lead capture progressivo</h3>
                        <p className="text-blue-200 text-sm mt-1">Dar valor primeiro (fundos disponíveis), pedir dados depois.</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl border border-white/20 flex items-start gap-4">
                    <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Database className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white">Integração Bitrix24</h3>
                        <p className="text-blue-200 text-sm mt-1">Não substituir, potenciar. Sync bidirecional com CRM existente.</p>
                    </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl border border-white/20 flex items-start gap-4">
                    <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white">Dashboard integrado</h3>
                        <p className="text-blue-200 text-sm mt-1">Plataforma unificada, não Custom GPT isolado. Avisos, leads, pipeline.</p>
                    </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl border border-white/20 flex items-start gap-4">
                    <div className="w-10 h-10 bg-rose-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Globe className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white">Scraping multi-portal</h3>
                        <p className="text-blue-200 text-sm mt-1">PT2030 + PRR + PEPAC monitorizados 24/7. Avisos novos em tempo real.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// SLIDE 5: A SOLUÇÃO
const SolutionSlide = () => (
    <div className="flex flex-col justify-center h-full px-8 md:px-20">
        <span className="text-sm font-semibold tracking-widest text-emerald-300 uppercase mb-4 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            A Solução
        </span>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">ConsultancyOS</h2>
        <p className="text-xl text-blue-200 mb-10">Não é um CRM novo. É AI Layer sobre o Bitrix que já têm.</p>

        <div className="grid grid-cols-2 gap-6 mb-10">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4">
                    <Globe className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Multi-Portal Scraper</h3>
                <p className="text-blue-200 text-sm">PT2030, PRR, PEPAC monitorizados 24/7. Parsing estruturado e normalizado.</p>
                <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded">
                    <Check className="w-3 h-3" />
                    80% implementado
                </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mb-4">
                    <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Matchmaking Engine</h3>
                <p className="text-blue-200 text-sm">CAE (50pts) + Região (30pts) + Dimensão (20pts). Score de elegibilidade 0-100%.</p>
                <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded">
                    <Check className="w-3 h-3" />
                    90% implementado
                </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                <div className="w-12 h-12 bg-violet-500 rounded-xl flex items-center justify-center mb-4">
                    <Database className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">RAG Technical Writer</h3>
                <p className="text-blue-200 text-sm">IA que aprende com 291 candidaturas históricas. Escreve no vosso estilo.</p>
                <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-500/20 px-2 py-1 rounded">
                    <Clock className="w-3 h-3" />
                    75% implementado
                </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center mb-4">
                    <Database className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Bitrix Sync</h3>
                <p className="text-blue-200 text-sm">Leitura dos 24.000 contactos + write-back de leads. Integração nativa.</p>
                <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-500/20 px-2 py-1 rounded">
                    <Clock className="w-3 h-3" />
                    70% implementado
                </div>
            </div>
        </div>

        {/* CTAs duplicados do Slide 7 removido */}
        <div className="flex gap-4">
            <Link href="/diagnostico-fundos" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors">
                Demo Lead Magnet
                <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/dashboard" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors">
                Demo Dashboard
                <ArrowRight className="w-4 h-4" />
            </Link>
        </div>
    </div>
);

// SLIDE 6: COMO FUNCIONA - STORYTELLING ANTES vs DEPOIS
const HowItWorksSlide = () => (
    <div className="flex flex-col justify-center h-full px-8 md:px-20">
        <span className="text-sm font-semibold tracking-widest text-blue-300 uppercase mb-4">A Vossa Jornada</span>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">De Manual... para Automático</h2>
        <p className="text-xl text-blue-200 mb-10">O que mudava no dia-a-dia da equipa</p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* ANTES - VERMELHO/AMARELO */}
            <div className="bg-red-950/30 backdrop-blur-sm rounded-2xl p-6 border border-red-500/30">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-red-400 uppercase tracking-wider">ANTES</div>
                        <h3 className="text-xl font-bold text-white">O Processo Manual</h3>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-red-400">1</span>
                        </div>
                        <div>
                            <p className="text-white font-medium mb-1">"Segunda-feira. Mais um aviso aberto."</p>
                            <p className="text-blue-300 text-sm">Alguém tem que ir ao portal PT2030, fazer print, PDF, copiar critérios...</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-red-400">2</span>
                        </div>
                        <div>
                            <p className="text-white font-medium mb-1">"Agora cruzar com 24.000 empresas..."</p>
                            <p className="text-blue-300 text-sm">Excel aberto. Filtros manuais. CAE? Região? Quem tem menos de 50 trabalhadores?</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-red-400">3</span>
                        </div>
                        <div>
                            <p className="text-white font-medium mb-1">"Paula, atualiza o site?"</p>
                            <p className="text-blue-300 text-sm">Mais uma tarefa manual. HTML, WordPress, formatação...</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-red-400">4</span>
                        </div>
                        <div>
                            <p className="text-white font-medium mb-1">"E os leads de ontem?"</p>
                            <p className="text-blue-300 text-sm">Formulários longos. Empresas desistem antes de submeter.</p>
                        </div>
                    </div>
                </div>

                <div className="mt-5 pt-4 border-t border-red-500/20">
                    <div className="flex items-center gap-2 text-red-400 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>2-3 dias por aviso. Oportunidades perdidas.</span>
                    </div>
                </div>
            </div>

            {/* DEPOIS - VERDE/AZUL */}
            <div className="bg-emerald-950/30 backdrop-blur-sm rounded-2xl p-6 border border-emerald-500/30">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                        <Zap className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">DEPOIS</div>
                        <h3 className="text-xl font-bold text-white">O Processo Automático</h3>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-emerald-400">1</span>
                        </div>
                        <div>
                            <p className="text-white font-medium mb-1">"Segunda-feira. Café na mesa."</p>
                            <p className="text-blue-300 text-sm">O scraper já detetou o aviso. Parsing feito. Critérios extraídos.</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-emerald-400">2</span>
                        </div>
                        <div>
                            <p className="text-white font-medium mb-1">"Dashboard aberto. Top 50 empresas."</p>
                            <p className="text-blue-300 text-sm">Score de elegibilidade calculado. CAE + Região + Dimensão. Ordenado.</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-emerald-400">3</span>
                        </div>
                        <div>
                            <p className="text-white font-medium mb-1">"Site atualizado automaticamente."</p>
                            <p className="text-blue-300 text-sm">Lead Magnet ChatWizard a responder perguntas. Capturando dados.</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-emerald-400">4</span>
                        </div>
                        <div>
                            <p className="text-white font-medium mb-1">"Leads qualificados no Bitrix."</p>
                            <p className="text-blue-300 text-sm">Sync automático. Pipeline atualizado. Só falta contactar.</p>
                        </div>
                    </div>
                </div>

                <div className="mt-5 pt-4 border-t border-emerald-500/20">
                    <div className="flex items-center gap-2 text-emerald-400 text-sm">
                        <Check className="w-4 h-4" />
                        <span>Minutos. Foco no que importa: vender.</span>
                    </div>
                </div>
            </div>
        </div>

        {/* RESUMO VISUAL */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
            <div className="text-sm font-semibold text-blue-300 uppercase tracking-wider mb-4 text-center">O Fluxo que Passa a Existir</div>
            <div className="flex items-center justify-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 bg-blue-900 px-4 py-2.5 rounded-lg">
                    <Globe className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-white font-medium">Novo Aviso</span>
                </div>
                <ArrowRight className="w-5 h-5 text-emerald-400" />
                <div className="flex items-center gap-2 bg-blue-800 px-4 py-2.5 rounded-lg">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-white font-medium">Scraper Automático</span>
                </div>
                <ArrowRight className="w-5 h-5 text-emerald-400" />
                <div className="flex items-center gap-2 bg-emerald-800 px-4 py-2.5 rounded-lg">
                    <Target className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-white font-medium">Matchmaker IA</span>
                </div>
                <ArrowRight className="w-5 h-5 text-violet-400" />
                <div className="flex items-center gap-2 bg-violet-800 px-4 py-2.5 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-violet-400" />
                    <span className="text-sm text-white font-medium">Vendas</span>
                </div>
            </div>
        </div>
    </div>
);

// SLIDE 7 REMOVIDO - Era redundante com Slide 5 (ConsultancyOS)
// O conteúdo foi fundido no Slide 5 que já mostra % de implementação
// Os CTAs de demo foram adicionados ao final do Slide 5

// SLIDE 8: BENCHMARK (agora Slide 7 após remoção)
const BenchmarkSlide = () => (
    <div className="flex flex-col justify-center h-full px-6 md:px-12">
        <span className="text-sm font-semibold tracking-widest text-blue-300 uppercase mb-4">Análise de Mercado</span>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Alternativas no Mercado</h2>
        <p className="text-lg md:text-xl text-blue-200 mb-8">Custo de implementar solução similar por vias tradicionais</p>

        <div className="grid grid-cols-3 gap-4 md:gap-5">
            {/* OPCAO A - DEV CUSTOM */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-5">
                <div className="text-sm font-bold text-blue-300 uppercase tracking-wider mb-3">Opção A</div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-4">Dev Custom In-House</h3>

                <div className="space-y-2.5 mb-5 text-base">
                    <div className="flex justify-between items-center">
                        <span className="text-blue-100">Developer (3 meses)</span>
                        <span className="font-bold text-white text-base">€15.000</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-blue-100">Infraestrutura</span>
                        <span className="font-bold text-white text-base">€2.400</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-blue-100">APIs externas</span>
                        <span className="font-bold text-white text-base">€1.200</span>
                    </div>
                </div>

                <div className="pt-4 border-t border-white/20">
                    <div className="text-3xl md:text-4xl font-bold text-white">€18.600</div>
                    <div className="text-sm text-blue-200 mt-1">Setup + 1º ano</div>
                </div>

                <div className="mt-4 text-sm text-amber-400 bg-amber-500/10 px-3 py-2 rounded-lg">
                    <span className="font-semibold">⚠️ Risco:</span> dependência de 1 dev
                </div>
            </div>

            {/* OPCAO B - FERRAMENTAS SAAS */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-5">
                <div className="text-sm font-bold text-blue-300 uppercase tracking-wider mb-3">Opção B</div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-4">Ferramentas SaaS</h3>

                <div className="space-y-2.5 mb-5 text-base">
                    <div className="flex justify-between items-center">
                        <span className="text-blue-100">HubSpot Sales</span>
                        <span className="font-bold text-white text-base">€720/ano</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-blue-100">Apollo.io</span>
                        <span className="font-bold text-white text-base">€600/ano</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-blue-100">ChatGPT Team</span>
                        <span className="font-bold text-white text-base">$300/ano</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-blue-100">Scraper (Apify)</span>
                        <span className="font-bold text-white text-base">€500/ano</span>
                    </div>
                </div>

                <div className="pt-4 border-t border-white/20">
                    <div className="text-3xl md:text-4xl font-bold text-white">€2.500+</div>
                    <div className="text-sm text-blue-200 mt-1">Por ano (recorrente)</div>
                </div>

                <div className="mt-4 text-sm text-amber-400 bg-amber-500/10 px-3 py-2 rounded-lg">
                    <span className="font-semibold">⚠️ Problema:</span> sem integração Bitrix
                </div>
            </div>

            {/* NOSSA SOLUCAO - DESTAQUE */}
            <div className="bg-gradient-to-br from-blue-700 to-blue-900 border-2 border-emerald-500 rounded-2xl p-5 relative shadow-2xl">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1.5 rounded-full text-sm font-bold">
                    -35% CUSTO
                </div>

                <div className="text-sm font-bold text-blue-100 uppercase tracking-wider mb-3">Nossa Solução</div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-4">ConsultancyOS</h3>

                <div className="space-y-2.5 mb-5 text-base">
                    <div className="flex justify-between items-center">
                        <span className="text-blue-100">Setup Professional</span>
                        <span className="font-bold text-white text-base">€7.500</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-blue-100">Retainer (12 meses)</span>
                        <span className="font-bold text-white text-base">€9.600</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-blue-100">Infraestrutura</span>
                        <span className="font-bold text-emerald-300 text-base">Incluído</span>
                    </div>
                </div>

                <div className="pt-4 border-t border-blue-500">
                    <div className="text-3xl md:text-4xl font-bold text-white">€17.100</div>
                    <div className="text-sm text-blue-100 mt-1">Setup + 1º ano</div>
                </div>

                <div className="mt-4 text-sm text-emerald-300 bg-emerald-500/20 px-3 py-2 rounded-lg border border-emerald-500/30">
                    <span className="font-semibold">✓ Vantagem:</span> integração Bitrix nativa
                </div>
            </div>
        </div>
    </div>
);

// SLIDE 9: 3 TIERS
const PricingSlide = () => (
    <div className="flex flex-col justify-center h-full px-4 md:px-8 overflow-y-auto">
        <span className="text-sm font-semibold tracking-widest text-blue-300 uppercase mb-3">Investimento</span>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">Escolham o Nivel Certo</h2>

        {/* Retainer Mensal - Destaque CLARO */}
        <div className="bg-emerald-500/20 border border-emerald-500/50 rounded-xl p-3 mb-4 max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300 font-bold text-xs uppercase tracking-wider">Retainer Mensal inclui:</span>
            </div>
            <div className="grid grid-cols-4 gap-3 text-center">
                <div>
                    <div className="text-white font-bold text-sm">10h</div>
                    <div className="text-blue-200 text-xs">Suporte tecnico</div>
                </div>
                <div>
                    <div className="text-white font-bold text-sm">1 visita</div>
                    <div className="text-blue-200 text-xs">Presencial/remota</div>
                </div>
                <div>
                    <div className="text-white font-bold text-sm">ate 100 EUR</div>
                    <div className="text-blue-200 text-xs">Ferramentas/mes</div>
                </div>
                <div>
                    <div className="text-white font-bold text-sm">Updates</div>
                    <div className="text-blue-200 text-xs">Melhorias incluidas</div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
            {/* STARTER */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-4 flex flex-col">
                <div className="mb-3">
                    <div className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-1">Starter</div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-white">5.000</span>
                    </div>
                    <div className="text-blue-300 text-sm">+ 600/mes</div>
                </div>

                <div className="bg-blue-900/50 rounded-lg p-2 mb-3">
                    <div className="text-xs text-blue-200">Timeline</div>
                    <div className="text-lg font-bold text-white">8 semanas</div>
                </div>

                <div className="space-y-1.5 mb-3 flex-1 text-xs">
                    <div className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-blue-100">Scraping PT2030/PRR</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-blue-100">Matchmaking CAE + Regiao</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-blue-100">Sync Bitrix (read-only)</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-blue-100">Dashboard basico</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-blue-100">Treino inicial (4h)</span>
                    </div>
                </div>

                <div className="text-xs text-blue-400 text-center pt-2 border-t border-white/10 bg-white/5 rounded p-2">
                    <span className="font-semibold text-white">Ideal para:</span> Automatizar o essencial
                </div>
            </div>

            {/* PROFESSIONAL */}
            <div className="bg-gradient-to-b from-blue-700 to-blue-800 border-2 border-emerald-500 rounded-xl p-4 flex flex-col relative shadow-xl">
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                    RECOMENDADO
                </div>

                <div className="mb-3 mt-1">
                    <div className="text-xs font-semibold text-blue-200 uppercase tracking-wider mb-1">Professional</div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-white">7.500</span>
                    </div>
                    <div className="text-blue-200 text-sm">+ 800/mes</div>
                </div>

                <div className="bg-white/10 rounded-lg p-2 mb-3">
                    <div className="text-xs text-blue-200">Timeline</div>
                    <div className="text-lg font-bold text-white">10-12 semanas</div>
                </div>

                <div className="space-y-1.5 mb-3 flex-1 text-xs">
                    <div className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-white font-semibold">TUDO do Starter, mais:</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-blue-100"><strong className="text-white">RAG Technical Writer</strong> - IA que escreve propostas</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-blue-100"><strong className="text-white">Sync Bidirecional</strong> Bitrix (write-back)</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-blue-100"><strong className="text-white">Dashboard avancado</strong> com alertas</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-blue-100"><strong className="text-white">291 docs</strong> no RAG (know-how historico)</span>
                    </div>
                </div>

                <div className="text-xs text-blue-200 text-center pt-2 border-t border-blue-600 bg-blue-900/30 rounded p-2">
                    <span className="font-semibold text-white">Ideal para:</span> Consultoria com volume de propostas
                </div>
            </div>

            {/* PREMIUM */}
            <div className="bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-600 rounded-xl p-4 flex flex-col">
                <div className="mb-3">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Premium</div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-white">11.000</span>
                    </div>
                    <div className="text-slate-400 text-sm">+ 1.000/mes</div>
                </div>

                <div className="bg-white/5 rounded-lg p-2 mb-3">
                    <div className="text-xs text-slate-400">Timeline</div>
                    <div className="text-lg font-bold text-white">16-20 semanas</div>
                </div>

                <div className="space-y-1.5 mb-3 flex-1 text-xs">
                    <div className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-white font-semibold">TUDO do Professional, mais:</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300"><strong className="text-white">Post-Award</strong> - Gestao pos-aprovacao</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300"><strong className="text-white">AI Proposal Critic</strong> - Auto-revisao</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300"><strong className="text-white">Email Drip</strong> - Automacao nurturing</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300"><strong className="text-white">SLA Prioritario</strong> - Resposta &lt;24h</span>
                    </div>
                </div>

                <div className="text-xs text-slate-400 text-center pt-2 border-t border-slate-700 bg-slate-800/50 rounded p-2">
                    <span className="font-semibold text-white">Ideal para:</span> Dominar o mercado
                </div>
            </div>
        </div>

        {/* Tabela Comparativa CLARA */}
        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="text-xs font-semibold text-blue-300 mb-2 text-center uppercase tracking-wider">Comparativo Rapido: O que diferencia cada tier</div>
            <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="text-slate-400 font-medium">Funcionalidade</div>
                <div className="text-center text-blue-300 font-bold">Starter</div>
                <div className="text-center text-emerald-400 font-bold">Professional</div>
                <div className="text-center text-slate-300 font-bold">Premium</div>

                <div className="text-slate-300">Propostas com IA</div>
                <div className="text-center text-red-400"></div>
                <div className="text-center text-emerald-400">RAG Writer</div>
                <div className="text-center text-emerald-400">RAG + Critic</div>

                <div className="text-slate-300">Sync Bitrix</div>
                <div className="text-center text-amber-400">Read</div>
                <div className="text-center text-emerald-400">Bidirecional</div>
                <div className="text-center text-emerald-400">Bidirecional</div>

                <div className="text-slate-300">Automacao leads</div>
                <div className="text-center text-amber-400">Manual</div>
                <div className="text-center text-amber-400">Semi-auto</div>
                <div className="text-center text-emerald-400">Drip completo</div>

                <div className="text-slate-300">Suporte SLA</div>
                <div className="text-center text-blue-300">48h</div>
                <div className="text-center text-blue-300">36h</div>
                <div className="text-center text-emerald-400">&lt;24h</div>
            </div>
        </div>
    </div>
);

// SLIDE 10: TIMELINE
const TimelineSlide = () => (
    <div className="flex flex-col justify-center h-full px-8 md:px-20">
        <span className="text-sm font-semibold tracking-widest text-blue-300 uppercase mb-4">Implementação</span>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-10">Timeline por Tier</h2>

        <div className="grid grid-cols-3 gap-5">
            <div className="border border-blue-500/50 rounded-xl p-5">
                <div className="text-base font-bold text-white mb-4 flex items-center gap-2">
                    <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-xs font-bold text-white">S</div>
                    Starter - 8 semanas
                </div>
                <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <div>
                            <div className="font-semibold text-blue-200">Sem 1-2</div>
                            <div className="text-xs text-blue-300">Setup scrapers + API Bitrix</div>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <div>
                            <div className="font-semibold text-blue-200">Sem 3-4</div>
                            <div className="text-xs text-blue-300">Matchmaking + testes</div>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <div>
                            <div className="font-semibold text-blue-200">Sem 5-6</div>
                            <div className="text-xs text-blue-300">Dashboard + notificações</div>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <div>
                            <div className="font-semibold text-blue-200">Sem 7-8</div>
                            <div className="text-xs text-blue-300">Go-live + treino</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-2 border-emerald-500 rounded-xl p-5 bg-emerald-500/10">
                <div className="text-base font-bold text-white mb-4 flex items-center gap-2">
                    <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center text-xs font-bold text-white">P</div>
                    Professional - 12 semanas
                </div>
                <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <div>
                            <div className="font-semibold text-blue-200">Sem 1-4</div>
                            <div className="text-xs text-blue-300">TUDO do Starter</div>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <div>
                            <div className="font-semibold text-blue-200">Sem 5-8</div>
                            <div className="text-xs text-blue-300">RAG setup + 291 docs</div>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <div>
                            <div className="font-semibold text-blue-200">Sem 9-10</div>
                            <div className="text-xs text-blue-300">Write-back Bitrix</div>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <div>
                            <div className="font-semibold text-blue-200">Sem 11-12</div>
                            <div className="text-xs text-blue-300">Produção completa</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border border-slate-600 rounded-xl p-5 bg-slate-800/50">
                <div className="text-base font-bold text-white mb-4 flex items-center gap-2">
                    <div className="w-7 h-7 bg-slate-600 rounded-lg flex items-center justify-center text-xs font-bold text-white">P+</div>
                    Premium - 20 semanas
                </div>
                <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <div>
                            <div className="font-semibold text-slate-300">Sem 1-12</div>
                            <div className="text-xs text-slate-400">TUDO do Professional</div>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <div>
                            <div className="font-semibold text-slate-300">Sem 13-16</div>
                            <div className="text-xs text-slate-400">AI Critic + Drip emails</div>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <div>
                            <div className="font-semibold text-slate-300">Sem 17-20</div>
                            <div className="text-xs text-slate-400">Post-Award + refinamentos</div>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-slate-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <div>
                            <div className="font-semibold text-slate-500">Q2-Q3</div>
                            <div className="text-xs text-slate-500">Grant GPT + Auto-Web</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// SLIDE 11: ROI PROFISSIONAL
const ROISlide = () => (
    <div className="flex flex-col justify-center h-full px-6 md:px-12 overflow-y-auto">
        <span className="text-sm font-semibold tracking-widest text-emerald-300 uppercase mb-3">Retorno</span>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Analise de ROI</h2>
        <p className="text-blue-200 text-sm mb-5 text-center">Calculado sobre metricas reais de consultoria de fundos comunitarios</p>

        {/* Metricas de Base - Fundamentacao */}
        <div className="bg-white/5 rounded-xl p-4 mb-4 border border-white/10">
            <div className="text-xs font-semibold text-blue-300 mb-2 text-center uppercase tracking-wider">Metricas de Base (Conservadoras)</div>
            <div className="grid grid-cols-5 gap-2 text-center text-xs">
                <div>
                    <div className="text-white font-bold text-sm">150</div>
                    <div className="text-blue-200">Custo atual/lead</div>
                </div>
                <div>
                    <div className="text-white font-bold text-sm">3%</div>
                    <div className="text-blue-200">Conversao atual</div>
                </div>
                <div>
                    <div className="text-white font-bold text-sm">5.000</div>
                    <div className="text-blue-200">Ticket medio</div>
                </div>
                <div>
                    <div className="text-white font-bold text-sm">8h</div>
                    <div className="text-blue-200">Horas/proposta</div>
                </div>
                <div>
                    <div className="text-white font-bold text-sm">75</div>
                    <div className="text-blue-200">Custo hora/homem</div>
                </div>
            </div>
        </div>

        {/* Tabela ROI - Before/After */}
        <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                <div className="text-xs font-semibold text-blue-300 mb-2">STARTER</div>
                <div className="text-xl font-bold text-white mb-2">12.200</div>
                <div className="text-xs text-blue-300 mb-3">Investimento 1º ano</div>

                <div className="space-y-1.5 text-xs mb-3">
                    <div className="flex justify-between">
                        <span className="text-blue-200">Custo/lead com IA</span>
                        <span className="font-bold text-white">35</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-blue-200">Nova conversao</span>
                        <span className="font-bold text-emerald-400">5%</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-blue-200">Horas poupadas/proposta</span>
                        <span className="font-bold text-white">4h</span>
                    </div>
                </div>

                <div className="pt-2 border-t border-white/10 text-center">
                    <div className="text-xs text-blue-300">Payback</div>
                    <div className="text-2xl font-bold text-emerald-400">4.2 meses</div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-blue-700 to-blue-800 border-2 border-emerald-500 rounded-xl p-4 relative">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                    MELHOR ROI
                </div>

                <div className="text-xs font-semibold text-blue-200 mb-2">PROFESSIONAL</div>
                <div className="text-xl font-bold text-white mb-2">17.100</div>
                <div className="text-xs text-blue-200 mb-3">Investimento 1º ano</div>

                <div className="space-y-1.5 text-xs mb-3">
                    <div className="flex justify-between">
                        <span className="text-blue-100">Custo/lead com IA</span>
                        <span className="font-bold text-white">25</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-blue-100">Nova conversao</span>
                        <span className="font-bold text-emerald-400">8%</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-blue-100">Horas poupadas/proposta</span>
                        <span className="font-bold text-white">6h</span>
                    </div>
                </div>

                <div className="pt-2 border-t border-blue-600 text-center">
                    <div className="text-xs text-blue-200">Payback</div>
                    <div className="text-2xl font-bold text-emerald-400">3.4 meses</div>
                </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                <div className="text-xs font-semibold text-slate-400 mb-2">PREMIUM</div>
                <div className="text-xl font-bold text-white mb-2">23.000</div>
                <div className="text-xs text-slate-400 mb-3">Investimento 1º ano</div>

                <div className="space-y-1.5 text-xs mb-3">
                    <div className="flex justify-between">
                        <span className="text-slate-300">Custo/lead com IA</span>
                        <span className="font-bold text-white">18</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-300">Nova conversao</span>
                        <span className="font-bold text-emerald-400">12%</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-300">Horas poupadas/proposta</span>
                        <span className="font-bold text-white">7h</span>
                    </div>
                </div>

                <div className="pt-2 border-t border-white/10 text-center">
                    <div className="text-xs text-slate-400">Payback</div>
                    <div className="text-2xl font-bold text-emerald-400">3.8 meses</div>
                </div>
            </div>
        </div>

        {/* Detalhe do Calculo - Para Gestores Comerciais */}
        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="text-xs font-semibold text-blue-300 mb-2 text-center uppercase tracking-wider">Exemplo de Calculo - Professional (conservador)</div>

            <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1.5">
                    <div className="text-emerald-400 font-semibold mb-1">Ganhos Mensais (apos implementacao)</div>
                    <div className="flex justify-between">
                        <span className="text-blue-200">Economia de tempo (6h x 20 props)</span>
                        <span className="text-white">= 120h x 75 = <span className="font-bold">9.000</span></span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-blue-200">Aumento conversao (3% {'->'} 8%)</span>
                        <span className="text-white">= +5 projetos x 5.000 = <span className="font-bold">25.000</span></span>
                    </div>
                    <div className="flex justify-between pt-1.5 border-t border-white/10">
                        <span className="text-emerald-400 font-semibold">Ganho total mensal</span>
                        <span className="text-emerald-400 font-bold">34.000</span>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <div className="text-amber-400 font-semibold mb-1">Custo e Payback</div>
                    <div className="flex justify-between">
                        <span className="text-blue-200">Investimento Professional</span>
                        <span className="text-white font-bold">17.100</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-blue-200">Custo mensal retainer</span>
                        <span className="text-white">800</span>
                    </div>
                    <div className="flex justify-between pt-1.5 border-t border-white/10">
                        <span className="text-amber-400 font-semibold">Payback</span>
                        <span className="text-amber-400 font-bold">~2 semanas</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-blue-200">ROI anual</span>
                        <span className="text-emerald-400 font-bold">2.286%</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// SLIDE 12: PORQUÊ AGORA
const UrgencySlide = () => (
    <div className="flex flex-col justify-center h-full px-8 md:px-20">
        <span className="text-sm font-semibold tracking-widest text-red-300 uppercase mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Urgência
        </span>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-10">Porquê Começar Agora?</h2>

        <div className="grid md:grid-cols-3 gap-5 mb-8">
            <div className="bg-red-500/20 border-l-4 border-red-500 p-5 rounded-r-xl">
                <h3 className="text-lg font-bold text-white mb-2">PT2030 Acelera</h3>
                <p className="text-blue-200 text-sm">2026-2027 serão os anos com mais avisos e prazos apertados. Quem tiver melhor tecnologia ganha.</p>
            </div>

            <div className="bg-orange-500/20 border-l-4 border-orange-500 p-5 rounded-r-xl">
                <h3 className="text-lg font-bold text-white mb-2">Vantagem Temporal</h3>
                <p className="text-blue-200 text-sm">Outras consultoras estão a automatizar. Ser o primeiro dá vantagem duradoura.</p>
            </div>

            <div className="bg-amber-500/20 border-l-4 border-amber-500 p-5 rounded-r-xl">
                <h3 className="text-lg font-bold text-white mb-2">ROI Imediato</h3>
                <p className="text-blue-200 text-sm">Em 10-12 semanas tem o sistema a gerar leads. Payback no primeiro ano.</p>
            </div>
        </div>

        <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-2xl p-8">
            <div className="text-center mb-6">
                <div className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">Janela de Oportunidade</div>

                <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden mb-6 max-w-md mx-auto">
                    <div className="absolute left-0 top-0 h-full w-3/4 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"></div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                        <div className="text-4xl font-bold text-white mb-2">75%</div>
                        <div className="text-sm text-slate-400">Janela ocupada</div>
                    </div>
                    <div>
                        <div className="text-4xl font-bold text-emerald-400 mb-2">2026</div>
                        <div className="text-sm text-slate-400">Ano crítico</div>
                    </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-lg leading-relaxed text-blue-100">
                        "A primeira consultora a dominar IA em fundos comunitários vai dominar o mercado nos próximos 5 anos."
                    </p>
                </div>
            </div>
        </div>
    </div>
);

// SLIDE 13: CTA
const CTASlide = () => (
    <div className="flex flex-col justify-center items-center h-full text-center px-8 md:px-20">
        <svg className="w-12 h-12 mb-6" viewBox="0 0 256 256">
            <rect width="256" height="256" fill="#0066CC" rx="32"/>
            <path d="M64 80h128v24H152v96h-24V104H64z" fill="#ffffff"/>
            <path d="M176 128l32 72h-26l-6-14h-28l-6 14h-26l32-72h28zm-14 42h16l-8-18z" fill="#00AA66"/>
        </svg>

        <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Prontos para Transformar<br />
            <span className="text-blue-400">a Vossa Consultoria?</span>
        </h2>

        <p className="text-xl text-blue-200 mb-10 max-w-2xl leading-relaxed">
            Agendem uma demonstração e vejam o ConsultancyOS em ação. Sem compromisso, sem sales pitch - apenas código funcional.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors">
                Agendar Demo
                <ArrowRight className="inline ml-2 w-5 h-5" />
            </button>

            <Link href="/dashboard" className="border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 rounded-xl font-semibold text-lg transition-colors">
                Ver Dashboard
            </Link>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 max-w-xl">
            <h3 className="text-lg font-bold text-white mb-4">Não sabem qual tier escolher?</h3>
            <div className="space-y-2 text-sm text-left">
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                    <span className="text-blue-100"><strong className="text-white">Starter:</strong> Querem automatizar scraping e matching básico</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
                    <span className="text-blue-100"><strong className="text-white">Professional:</strong> Querem RAG para propostas e sync completo</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-slate-500 rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
                    <span className="text-blue-100"><strong className="text-white">Premium:</strong> Querem dominar com features avançadas</span>
                </div>
            </div>
        </div>

        <div className="mt-10 flex items-center gap-3 text-sm text-blue-300">
            <Shield className="w-4 h-4" />
            <span>CONFIDENCIAL - Preparado exclusivamente para TA Consulting</span>
        </div>
    </div>
);

// ============================================================================
// MAIN PRESENTATION COMPONENT
// ============================================================================

const slides = [
    HeroSlide,          // 1
    ContextSlide,       // 2
    ProblemSlide,       // 3
    RequestSlide,       // 4
    SolutionSlide,      // 5
    HowItWorksSlide,    // 6
    // WhatWorksSlide REMOVIDO - redundante com SolutionSlide
    BenchmarkSlide,     // 7 (era 8)
    PricingSlide,       // 8 (era 9)
    TimelineSlide,      // 9 (era 10)
    ROISlide,           // 10 (era 11)
    UrgencySlide,       // 11 (era 12)
    CTASlide            // 12 (era 13)
];

export default function ApresentacaoV4Page() {
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
                <div className="h-1 bg-blue-950">
                    <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-emerald-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>

                {/* Navigation Footer */}
                <div className="bg-blue-950/80 backdrop-blur-sm border-t border-white/10 px-6 py-4 flex items-center justify-between">
                    <button
                        onClick={prevSlide}
                        disabled={currentSlide === 0}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-blue-200 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Anterior
                    </button>

                    <div className="flex items-center gap-4">
                        <span className="text-sm text-blue-300">
                            {currentSlide + 1} de {totalSlides}
                        </span>
                        <div className="flex gap-1.5">
                            {slides.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToSlide(index)}
                                    className={`transition-all ${
                                        index === currentSlide
                                            ? 'bg-emerald-500 w-8 h-2 rounded-full'
                                            : 'bg-blue-700 hover:bg-blue-600 w-2 h-2 rounded-full'
                                    }`}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={nextSlide}
                        disabled={currentSlide === totalSlides - 1}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-blue-200 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        Próximo
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Keyboard hint */}
            <div className="fixed top-6 right-6 z-50 text-xs text-blue-300 bg-blue-950/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10">
                Use ← → ou Espaço para navegar
            </div>
        </div>
    );
}
