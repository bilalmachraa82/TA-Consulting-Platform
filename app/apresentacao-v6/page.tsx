'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, BarChart3, AlertTriangle, Lightbulb, Target, Globe, Zap, Database, Clock, Check, Shield, X, FileText, Sparkles, Star, Award, ChevronRight, Crown, Users, TrendingUp, Play, Download, Printer, Mail } from 'lucide-react';
import Image from 'next/image';

// ============================================================================
// DATA - APRESENTAÇÃO v6: 2 FASES
// ============================================================================

const SECTIONS = [
    {
        id: 'hero',
        title: 'Motor de Oportunidades Europeias',
        subtitle: 'TA Consulting Intelligence Core',
        icon: <Sparkles className="w-6 h-6" />,
        color: 'blue',
        content: (
            <div className="flex flex-col justify-center items-center h-full text-center px-8">
                {/* Logo TA Consulting */}
                <div className="mb-8">
                    <Image src="/logo-ta.png" alt="TA Consulting" width={120} height={120} priority />
                </div>

                <div className="mb-6">
                    <span className="text-lg font-semibold tracking-widest text-blue-300 uppercase">Janeiro 2026</span>
                </div>

                <h1 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
                    Do Aviso à Lead em <span className="text-blue-400">Minutos</span>
                </h1>

                <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl leading-relaxed">
                    O motor de inteligência que o vosso Bitrix24 precisa para captar fundos europeus
                </p>

                <div className="flex items-center gap-8 text-blue-100 text-lg">
                    <div className="text-center">
                        <div className="text-5xl font-bold text-white">24k+</div>
                        <div className="text-sm mt-1">Empresas na Base</div>
                    </div>
                    <div className="w-px h-12 bg-blue-400"></div>
                    <div className="text-center">
                        <div className="text-5xl font-bold text-white">291</div>
                        <div className="text-sm mt-1">Candidaturas Históricas</div>
                    </div>
                    <div className="w-px h-12 bg-blue-400"></div>
                    <div className="text-center">
                        <div className="text-5xl font-bold text-white">95%</div>
                        <div className="text-sm mt-1">Avisos sem CAE</div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'problema',
        title: 'O Desafio Atual',
        subtitle: 'Dores que Reconhecemos',
        icon: <AlertTriangle className="w-6 h-6" />,
        color: 'red',
        content: (
            <div className="px-8 md:px-20">
                <h2 className="text-4xl font-bold text-white mb-8">"Temos 24.000 empresas, mas saber quem são não é saber quem são leads"</h2>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="bg-red-500/20 border-l-4 border-red-500 p-5 rounded-r-xl">
                            <p className="text-xl text-white italic mb-2">"Manualmente é impossível cruzar elegibilidades. Oportunidades perdem-se diariamente."</p>
                            <p className="text-red-300 text-sm">— Fernando, TA Consulting</p>
                        </div>

                        <div className="bg-orange-500/20 border-l-4 border-orange-500 p-5 rounded-r-xl">
                            <h3 className="text-xl font-bold text-white mb-2">95% dos avisos NÃO têm CAE</h3>
                            <p className="text-blue-100 text-base">O matching atual baseado em CAE deixa escapar a maioria das oportunidades. A alternativa: NUT + TIP.</p>
                        </div>

                        <div className="bg-amber-500/20 border-l-4 border-amber-500 p-5 rounded-r-xl">
                            <h3 className="text-xl font-bold text-white mb-2">Excel verde/vermelho todas as semanas</h3>
                            <p className="text-blue-100 text-base">Processo manual de marketing mix. Tempo perdido em tarefas repetitivas.</p>
                        </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                        <h3 className="text-2xl font-bold text-white mb-4">O Custo do Manual</h3>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <X className="w-5 h-5 text-red-400" />
                                <span className="text-blue-100">Avisos encontrados tarde (competidores)</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <X className="w-5 h-5 text-red-400" />
                                <span className="text-blue-100">Empresas não qualificadas</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <X className="w-5 h-5 text-red-400" />
                                <span className="text-blue-100">291 candidaturas subutilizadas</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <X className="w-5 h-5 text-red-400" />
                                <span className="text-blue-100">Conhecimento táctico perdido</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'solucao-motor',
        title: 'A Solução: O Motor',
        subtitle: 'Fase 1 - Inteligência Core',
        icon: <Target className="w-6 h-6" />,
        color: 'emerald',
        content: (
            <div className="px-8 md:px-20">
                <h2 className="text-4xl font-bold text-white mb-8">Focamos no Motor, Não no Carro</h2>
                <p className="text-xl text-blue-200 mb-10">Nós não substituímos o Bitrix. Nós potenciamos com IA o que o Bitrix não faz.</p>

                <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-400/30 rounded-xl p-6 mb-8">
                    <h3 className="text-2xl font-bold text-white mb-4">O Motor de Oportunidades</h3>
                    <p className="text-blue-100 text-lg mb-4">Três componentes que trabalham juntos:</p>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-white/10 rounded-xl p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <Globe className="w-6 h-6 text-blue-400" />
                                <h4 className="font-bold text-white">1. Scraping</h4>
                            </div>
                            <p className="text-blue-100 text-sm">PT2030, PRR, PEPAC • Avisos abertos e planeados</p>
                        </div>
                        <div className="bg-white/10 rounded-xl p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <Target className="w-6 h-6 text-emerald-400" />
                                <h4 className="font-bold text-white">2. Matching</h4>
                            </div>
                            <p className="text-blue-100 text-sm">NUT + TIP → Empresas compatíveis (95% dos avisos)</p>
                        </div>
                        <div className="bg-white/10 rounded-xl p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <Database className="w-6 h-6 text-violet-400" />
                                <h4 className="font-bold text-white">3. RAG</h4>
                            </div>
                            <p className="text-blue-100 text-sm">Falar com 291 candidaturas históricas</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                    <h4 className="text-xl font-bold text-white mb-4">O Fluxo Simplificado</h4>
                    <div className="flex flex-wrap items-center justify-center gap-4 text-center">
                        <div className="bg-blue-600 px-4 py-2 rounded-lg">
                            <span className="text-white text-sm font-semibold">Aviso Aberto</span>
                        </div>
                        <ArrowRight className="text-blue-400" />
                        <div className="bg-blue-600 px-4 py-2 rounded-lg">
                            <span className="text-white text-sm font-semibold">Scraper</span>
                        </div>
                        <ArrowRight className="text-blue-400" />
                        <div className="bg-emerald-600 px-4 py-2 rounded-lg">
                            <span className="text-white text-sm font-semibold">NUT+TIP</span>
                        </div>
                        <ArrowRight className="text-blue-400" />
                        <div className="bg-emerald-600 px-4 py-2 rounded-lg">
                            <span className="text-white text-sm font-semibold">Matching</span>
                        </div>
                        <ArrowRight className="text-blue-400" />
                        <div className="bg-violet-600 px-4 py-2 rounded-lg">
                            <span className="text-white text-sm font-semibold">50 Empresas</span>
                        </div>
                        <ArrowRight className="text-blue-400" />
                        <div className="bg-amber-600 px-4 py-2 rounded-lg">
                            <span className="text-white text-sm font-semibold">Export CSV</span>
                        </div>
                        <ArrowRight className="text-blue-400" />
                        <div className="bg-amber-600 px-4 py-2 rounded-lg">
                            <span className="text-white text-sm font-semibold">Campanha</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'fase1-scope',
        title: 'Fase 1 - O Que Entregamos',
        subtitle: '€4.500 + IVA • 8 Semanas',
        icon: <Check className="w-6 h-6" />,
        color: 'blue',
        badge: 'FASE 1',
        content: (
            <div className="px-8 md:px-20">
                <h2 className="text-4xl font-bold text-white mb-8">Scope Fase 1 - Motor de Oportunidades</h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <Globe className="w-6 h-6 text-blue-400" />
                            <h4 className="font-bold text-white">Scraping 3 Portais</h4>
                        </div>
                        <ul className="space-y-2 text-blue-100 text-sm">
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> PT2030 (abertos + planeados)</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> PRR</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> PEPAC</li>
                            <li className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-400" /> Verificação a cada 6h</li>
                        </ul>
                    </div>

                    <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <Target className="w-6 h-6 text-emerald-400" />
                            <h4 className="font-bold text-white">Matching NUT+TIP</h4>
                        </div>
                        <ul className="space-y-2 text-blue-100 text-sm">
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> NUT (Norte, Centro, Lisboa...)</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> TIP (IPSS, Associação, Poder Local)</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Contador de empresas compatíveis</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-400" /> CAE como fallback (5% dos avisos)</li>
                        </ul>
                    </div>

                    <div className="bg-violet-500/20 border border-violet-400/30 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <Database className="w-6 h-6 text-violet-400" />
                            <h4 className="font-bold text-white">RAG Interno</h4>
                        </div>
                        <ul className="space-y-2 text-blue-100 text-sm">
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Index 291 candidaturas</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Chatbot para perguntas</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Pesquisa semântica</li>
                        </ul>
                    </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                    <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-blue-400" />
                        Interface Limpa
                    </h4>
                    <ul className="space-y-2 text-blue-100 text-sm">
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Lista de avisos com filtros (abertos/planear)</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Colunas: NUT, TIP, Contador de Empresas</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Filtro "Interessa/Não Interessa"</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Resumo do aviso ao clicar</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Export CSV para Bitrix</li>
                    </ul>
                </div>

                <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-4">
                    <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                        <X className="w-5 h-5 text-red-400" />
                        O Que NÃO Inclui
                    </h4>
                    <ul className="space-y-1 text-blue-200 text-sm">
                        <li className="flex items-center gap-2"><X className="w-3 h-3 text-red-400" /> Dashboard KPIs (Power BI do Bitrix já faz)</li>
                        <li className="flex items-center gap-2"><X className="w-3 h-3 text-red-400" /> Chatbot público para clientes</li>
                        <li className="flex items-center gap-2"><X className="w-3 h-3 text-red-400" /> AI Writer (Fase 2)</li>
                        <li className="flex items-center gap-2"><X className="w-3 h-3 text-red-400" /> Email Drip</li>
                    </ul>
                </div>
            </div>
        )
    },
    {
        id: 'fase2-futuro',
        title: 'Fase 2 - O Futuro',
        subtitle: 'Trigger: Candidatura Aprovada',
        icon: <TrendingUp className="w-6 h-6" />,
        color: 'amber',
        badge: 'UPSELL',
        content: (
            <div className="px-8 md:px-20">
                <h2 className="text-4xl font-bold text-white mb-4">Fase 2: Plataforma Completa</h2>
                <p className="text-xl text-blue-200 mb-8">Se a vossa candidatura interna for aprovada, expandimos para a plataforma completa.</p>

                <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-2 border-orange-500/50 rounded-xl p-6 mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <Crown className="w-8 h-8 text-orange-400" />
                        <div>
                            <p className="text-2xl font-bold text-white">Investimento Adicional: €13.500 + IVA</p>
                            <p className="text-orange-200">TOTAL DO PROJETO: €18.000 + IVA</p>
                        </div>
                    </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-6">Deliverables Fase 2:</h3>

                <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl border border-white/20">
                        <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-orange-400" />
                            AI Writer
                        </h4>
                        <p className="text-blue-100 text-sm">Gera rascunhos de memórias descritivas baseado nas 291 candidaturas históricas.</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl border border-white/20">
                        <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-orange-400" />
                            Post-Award Management
                        </h4>
                        <p className="text-blue-100 text-sm">Dashboard de projetos aprovados, milestones, alertas de reporting.</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl border border-white/20">
                        <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-orange-400" />
                            Marketing Mix AI
                        </h4>
                        <p className="text-blue-100 text-sm">Recomendações de canais e análise de performance de campanhas.</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl border border-white/20">
                        <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                            <Globe className="w-5 h-5 text-orange-400" />
                            Website Auto-Update
                        </h4>
                        <p className="text-blue-100 text-sm">Sincronização automática de avisos no website da TA Consulting.</p>
                    </div>
                </div>

                <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-xl p-5">
                    <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-emerald-400" />
                        RISCO ZERO
                    </h4>
                    <p className="text-blue-100">Se a candidatura não for aprovada, ficam apenas com o valor da Fase 1. Partilham o risco do sucesso.</p>
                </div>
            </div>
        )
    },
    {
        id: 'investimento',
        title: 'Investimento & Timeline',
        subtitle: 'Transparente e Clara',
        icon: <Users className="w-6 h-6" />,
        color: 'cyan',
        content: (
            <div className="px-8 md:px-20">
                <h2 className="text-4xl font-bold text-white mb-10">Investimento em Duas Fases</h2>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* FASE 1 */}
                    <div className="bg-gradient-to-br from-blue-600 to-blue-800 border-2 border-blue-400 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-bold text-lg">1</span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">FASE 1</h3>
                                <p className="text-blue-200 text-sm">Motor de Oportunidades</p>
                            </div>
                        </div>

                        <div className="text-5xl font-bold text-white mb-4">€4.500<span className="text-lg font-normal text-blue-300">+ IVA</span></div>
                        <p className="text-blue-200 text-sm mb-4">Pagamento único</p>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between items-center">
                                <span className="text-blue-100">Retainer:</span>
                                <span className="text-xl font-bold text-white">€350/mês + IVA</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-blue-100">Mínimo:</span>
                                <span className="text-xl font-bold text-white">3 meses</span>
                            </div>
                        </div>

                        <div className="bg-blue-900/50 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <Clock className="w-5 h-5 text-blue-400" />
                                <span className="font-semibold text-blue-200">Timeline</span>
                            </div>
                            <div className="space-y-2 text-sm text-blue-100">
                                <div className="flex items-start gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                                    <span>Sem 1-2: Scraping + Bitrix integration</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                                    <span>Sem 3-4: Matching NUT/TIP + UI</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                                    <span>Sem 5-6: RAG + Testes</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5"></div>
                                    <span>Sem 7-8: Deploy + Formação</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-sm text-blue-300 italic mt-4">
                            ✅ Setup core + RAG + Matching + Export CSV
                        </div>
                    </div>

                    {/* FASE 2 */}
                    <div className="bg-gradient-to-br from-amber-600 to-orange-800 border-2 border-orange-400 rounded-xl p-6 relative">
                        <div className="absolute -top-3 right-4 bg-orange-500 text-white text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                            <Crown className="w-3 h-3" />
                            SE APROVADO
                        </div>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                                <span className="text-orange-600 font-bold text-lg">2</span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">FASE 2</h3>
                                <p className="text-orange-200 text-sm">Plataforma Completa</p>
                            </div>
                        </div>

                        <div className="text-5xl font-bold text-white mb-2">€13.500<span className="text-lg font-normal text-orange-300">+ IVA</span></div>
                        <div className="text-xl text-orange-300 mb-4">adicional ao Fase 1</div>

                        <div className="bg-orange-900/50 rounded-lg p-4 mb-4">
                            <div className="text-2xl font-bold text-white mb-2">TOTAL: €18.000 + IVA</div>
                            <p className="text-orange-200 text-sm">Investimento completo</p>
                        </div>

                        <div className="space-y-3">
                            <h4 className="font-bold text-white mb-2">Novos Deliverables:</h4>
                            <ul className="space-y-2 text-sm text-blue-100">
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-orange-400" /> AI Writer (memórias)</li>
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-orange-400" /> Post-Award Management</li>
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-orange-400" /> Marketing Mix AI</li>
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-orange-400" /> Website Auto-Update</li>
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-orange-400" /> AI Critic</li>
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-orange-400" /> E "algo mais" (extras)</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'timeline',
        title: 'Timeline Detalhada',
        subtitle: '8 Semanas para Go-Live',
        icon: <Clock className="w-6 h-6" />,
        color: 'blue',
        content: (
            <div className="px-8 md:px-20">
                <h2 className="text-4xl font-bold text-white mb-8">Timeline de Implementação</h2>

                <div className="border border-blue-500/50 rounded-xl p-5">
                    <div className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-sm font-bold text-white">F1</div>
                        Fase 1 - 8 Semanas
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4 text-base">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0">1</div>
                                <div>
                                    <div className="font-semibold text-blue-200">Semana 1-2</div>
                                    <div className="text-sm text-blue-300">Scraping + Bitrix integration</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0">2</div>
                                <div>
                                    <div className="font-semibold text-blue-200">Semana 3-4</div>
                                    <div className="text-sm text-blue-300">Matching NUT/TIP + UI básica</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0">3</div>
                                <div>
                                    <div className="font-semibold text-blue-200">Semana 5-6</div>
                                    <div className="text-sm text-blue-300">RAG + Index 291 docs + Testes</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0">4</div>
                                <div>
                                    <div className="font-semibold text-blue-200">Semana 7-8</div>
                                    <div className="text-sm text-blue-300">Deploy produção + Formação</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                            <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                                <Play className="w-5 h-5 text-blue-400" />
                                Milestones
                            </h4>
                            <ul className="space-y-2 text-sm text-blue-100">
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Sem 2: Primeira demo funcional</li>
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Sem 4: Avisos em tempo real</li>
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Sem 6: Matching operacional</li>
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Sem 8: Go-live + Formação equipa</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="mt-6 bg-emerald-500/20 border border-emerald-400/30 rounded-xl p-5">
                    <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-emerald-400" />
                        Garantias
                    </h4>
                    <div className="grid md:grid-cols-3 gap-4 text-sm text-emerald-100">
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span>Manutenção scrapers incluída</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span>Bug fixes incluídos</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span>Retainer opcional após 8 sem</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'cta',
        title: 'Próximos Passos',
        subtitle: 'Começamos Hoje?',
        icon: <ArrowRight className="w-6 h-6" />,
        color: 'emerald',
        content: (
            <div className="flex flex-col justify-center items-center h-full px-8 text-center">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Vamos Testar o Motor?</h2>
                <p className="text-xl text-blue-200 mb-12">Em 2 semanas temos uma demo funcional para validar o approach.</p>

                <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-400/30 rounded-xl p-8 mb-8">
                    <h3 className="text-2xl font-bold text-white mb-6">Call-to-Action</h3>
                    <div className="space-y-4 text-left">
                        <div className="flex items-center gap-3 text-blue-100">
                            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-sm font-bold text-white">1</div>
                            <span>Revisão proposta com sócios</span>
                        </div>
                        <div className="flex items-center gap-3 text-blue-100">
                            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-sm font-bold text-white">2</div>
                            <span>Aprovação e kickoff</span>
                        </div>
                        <div className="flex items-center gap-3 text-blue-100">
                            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-sm font-bold text-white">3</div>
                            <span>Entrega Fase 1 em 8 semanas</span>
                        </div>
                        <div className="flex items-center gap-3 text-blue-100">
                            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-sm font-bold text-white">4</div>
                            <span>Fase 2 se (e só se) aprovado</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 justify-center">
                    <Link href="/proposta-tecnica" className="bg-white/10 hover:bg-white/20 border border-white/30 px-6 py-3 rounded-lg text-white font-medium transition-colors flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Ver Proposta Técnica
                    </Link>
                    <a href="mailto:geral@taconsulting.pt?subject=TA%20Platform%20v6" className="bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded-lg text-white font-medium transition-colors flex items-center gap-2">
                        <Mail className="w-5 h-5" />
                        Falar Connosco
                    </a>
                </div>

                <div className="text-center mt-8">
                    <Link href="/" className="text-blue-300 hover:text-white flex items-center gap-2 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Voltar
                    </Link>
                </div>
            </div>
        )
    }
];

const colorMap = {
    blue: { bg: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-400', bgLight: 'bg-blue-500/20' },
    emerald: { bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-400', bgLight: 'bg-emerald-500/20' },
    amber: { bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-400', bgLight: 'bg-amber-500/20' },
    red: { bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-400', bgLight: 'bg-red-500/20' },
    cyan: { bg: 'bg-cyan-500', text: 'text-cyan-400', border: 'border-cyan-400', bgLight: 'bg-cyan-500/20' },
    violet: { bg: 'bg-violet-500', text: 'text-violet-400', border: 'border-violet-400', bgLight: 'bg-violet-500/20' },
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
                    <h2 className="text-2xl md:text-3xl font-bold text-white">{section.title}</h2>
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

function TableOfContents({ sections, activeSection, onNavigate }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block fixed left-8 top-1/2 -translate-y-1/2 w-56 z-40"
        >
            <nav className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
                <h3 className="text-xs font-semibold tracking-widest text-blue-300 uppercase mb-3">Índice</h3>
                <ul className="space-y-2">
                    {sections.map((section) => (
                        <li key={section.id}>
                            <button
                                onClick={() => onNavigate(section.id)}
                                className={`w-full text-left py-1 px-2 rounded-lg block transition-colors ${
                                    activeSection === section.id
                                        ? 'bg-blue-500/30 text-white'
                                        : 'text-blue-200 hover:bg-white/5'
                                }`}
                            >
                                <span className="text-sm">{section.title}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </motion.div>
    );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function ApresentacaoV6Page() {
    const [activeSection, setActiveSection] = useState('hero');

    useEffect(() => {
        const handleScroll = () => {
            const sections = SECTIONS.map(s => document.getElementById(s.id));
            for (let i = sections.length - 1; i >= 0; i--) {
                const section = sections[i];
                if (section) {
                    const rect = section.getBoundingClientRect();
                    if (rect.top <= 150) {
                        setActiveSection(SECTIONS[i].id);
                        break;
                    }
                }
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navigateToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-xl border-b border-white/10">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/apresentacao-v5" className="text-slate-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <Image src="/logo-ta.png" alt="TA Consulting" width={40} height={40} />
                        <div>
                            <h1 className="text-base font-bold text-white">Proposta v6</h1>
                            <p className="text-xs text-slate-400">2 Fases • Modelo Híbrido</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            <Printer className="w-4 h-4" />
                            <span className="hidden sm:inline">PDF</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Table of Contents */}
            <TableOfContents sections={SECTIONS} activeSection={activeSection} onNavigate={navigateToSection} />

            {/* Content */}
            <main className="relative max-w-5xl mx-auto px-4 pb-20">
                {SECTIONS.map((section, index) => (
                    <SectionCard key={section.id} section={section} index={index} />
                ))}
            </main>

            {/* Footer */}
            <footer className="border-t border-white/10 py-8">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <p className="text-slate-400 text-sm">
                        Proposta confidencial • TA Consulting • Janeiro 2026
                    </p>
                    <p className="text-slate-500 text-xs mt-2">Versão 6.0 - Modelo de 2 Fases</p>
                </div>
            </footer>

            {/* Print styles */}
            <style jsx global>{`
                @media print {
                    @page { margin: 1.5cm; size: A4; }
                    body { background: white !important; color: black !important; -webkit-print-color-adjust: exact; }
                    .no-print { display: none !important; }
                    .fixed { display: none !important; }
                    header { display: none !important; }
                    footer { page-break-before: always; }
                    .bg-blue-500\\/20 { background: #e3f2fd !important; }
                    .bg-emerald-500\\/20 { background: #e8f5e9 !important; }
                    .bg-amber-500\\/20 { background: #fff8e1 !important; }
                    .bg-cyan-500\\/20 { background: #e0f7fa !important; }
                    .bg-red-500\\/20 { background: #ffebee !important; }
                    .border { border-color: #dee2e6 !important; }
                    .text-white { color: #1a1a1a !important; }
                    .text-blue-100, .text-blue-200, .text-blue-300 { color: #0d47a1 !important; }
                    .text-emerald-100, .text-emerald-200, .text-emerald-300 { color: #1b5e20 !important; }
                    .text-amber-100, .text-amber-200, .text-amber-300 { color: #f57f17 !important; }
                    .text-cyan-100, .text-cyan-200, .text-cyan-300 { color: #006064 !important; }
                    .from-slate-900, .via-blue-950, .to-slate-900 { background: white !important; }
                    .mb-16 { page-break-inside: avoid; margin-bottom: 1rem !important; }
                    .space-y-6 > * { page-break-inside: avoid; }
                }
            `}</style>
        </div>
    );
}
