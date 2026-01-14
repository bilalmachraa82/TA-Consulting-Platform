'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, BarChart3, AlertTriangle, Lightbulb, Target, Globe, Zap, Database, Clock, Check, Shield, X, FileText, Sparkles, Star, Award, ChevronRight, Crown, Users, TrendingUp, Play, Download, Printer, Mail } from 'lucide-react';
import Image from 'next/image';

// ============================================================================
// DATA - APRESENTAÇÃO v6: 2 FASES (SLIDE-BASED)
// ============================================================================

const SLIDES = [
    {
        id: 'hero',
        title: 'Motor de Oportunidades Europeias',
        subtitle: 'TA Consulting Intelligence Core',
        color: 'blue',
        content: (
            <div className="flex flex-col justify-center items-center h-full text-center px-8">
                <div className="mb-8">
                    <Image src="/logo-ta.png" alt="TA Consulting" width={120} height={120} priority />
                </div>

                <div className="mb-6">
                    <span className="text-lg font-semibold tracking-widest text-blue-300 uppercase">Janeiro 2026</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
                    Do Aviso à Lead em <span className="text-blue-400">Minutos</span>
                </h1>

                <p className="text-2xl md:text-3xl text-blue-100 mb-12 max-w-3xl leading-relaxed">
                    O motor de inteligência que o vosso Bitrix24 precisa para captar fundos europeus
                </p>

                <div className="flex items-center gap-10 text-blue-100 text-xl">
                    <div className="text-center">
                        <div className="text-6xl font-bold text-white">24k+</div>
                        <div className="text-sm mt-2">Empresas na Base</div>
                    </div>
                    <div className="w-px h-16 bg-blue-400"></div>
                    <div className="text-center">
                        <div className="text-6xl font-bold text-white">291</div>
                        <div className="text-sm mt-2">Candidaturas Históricas</div>
                    </div>
                    <div className="w-px h-16 bg-blue-400"></div>
                    <div className="text-center">
                        <div className="text-6xl font-bold text-white">95%</div>
                        <div className="text-sm mt-2">Avisos sem CAE</div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'problema',
        title: 'O Desafio Atual',
        subtitle: 'Dores que Reconhecemos',
        color: 'red',
        content: (
            <div className="px-12 md:px-24 h-full flex flex-col justify-center">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-10 leading-tight">"Temos 24.000 empresas, mas saber quem são não é saber quem são leads"</h2>

                <div className="grid md:grid-cols-2 gap-8 flex-1">
                    <div className="space-y-6">
                        <div className="bg-red-500/20 border-l-4 border-red-500 p-6 rounded-r-xl">
                            <p className="text-xl text-white italic mb-2">"Manualmente é impossível cruzar elegibilidades. Oportunidades perdem-se diariamente."</p>
                            <p className="text-red-300 text-sm">— Fernando, TA Consulting</p>
                        </div>

                        <div className="bg-orange-500/20 border-l-4 border-orange-500 p-6 rounded-r-xl">
                            <h3 className="text-2xl font-bold text-white mb-3">95% dos avisos NÃO têm CAE</h3>
                            <p className="text-blue-100 text-lg">O matching atual baseado em CAE deixa escapar a maioria das oportunidades. A alternativa: NUT + TIP.</p>
                        </div>

                        <div className="bg-amber-500/20 border-l-4 border-amber-500 p-6 rounded-r-xl">
                            <h3 className="text-2xl font-bold text-white mb-3">Excel verde/vermelho todas as semanas</h3>
                            <p className="text-blue-100 text-lg">Processo manual de marketing mix. Tempo perdido em tarefas repetitivas.</p>
                        </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                        <h3 className="text-3xl font-bold text-white mb-6">O Custo do Manual</h3>

                        <div className="space-y-5 text-lg">
                            <div className="flex items-center gap-4">
                                <X className="w-6 h-6 text-red-400" />
                                <span className="text-blue-100">Avisos encontrados tarde (competidores)</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <X className="w-6 h-6 text-red-400" />
                                <span className="text-blue-100">Empresas não qualificadas</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <X className="w-6 h-6 text-red-400" />
                                <span className="text-blue-100">291 candidaturas subutilizadas</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <X className="w-6 h-6 text-red-400" />
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
        color: 'emerald',
        content: (
            <div className="px-12 md:px-24 h-full flex flex-col justify-center">
                <h2 className="text-5xl font-bold text-white mb-6">Focamos no Motor, Não no Carro</h2>
                <p className="text-2xl text-blue-200 mb-12">Nós não substituímos o Bitrix. Nós potenciamos com IA o que o Bitrix não faz.</p>

                <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-400/30 rounded-xl p-8 mb-10">
                    <h3 className="text-3xl font-bold text-white mb-6">O Motor de Oportunidades</h3>
                    <p className="text-blue-100 text-xl mb-6">Três componentes que trabalham juntos:</p>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-white/10 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <Globe className="w-8 h-8 text-blue-400" />
                                <h4 className="font-bold text-white text-xl">1. Scraping</h4>
                            </div>
                            <p className="text-blue-100">PT2030, PRR, PEPAC • Avisos abertos e planeados</p>
                        </div>
                        <div className="bg-white/10 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <Target className="w-8 h-8 text-emerald-400" />
                                <h4 className="font-bold text-white text-xl">2. Matching</h4>
                            </div>
                            <p className="text-blue-100">NUT + TIP → Empresas compatíveis (95% dos avisos)</p>
                        </div>
                        <div className="bg-white/10 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <Database className="w-8 h-8 text-violet-400" />
                                <h4 className="font-bold text-white text-xl">3. RAG</h4>
                            </div>
                            <p className="text-blue-100">Falar com 291 candidaturas históricas</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
                    <h4 className="text-2xl font-bold text-white mb-6">O Fluxo Simplificado</h4>
                    <div className="flex flex-wrap items-center justify-center gap-4 text-xl">
                        <div className="bg-blue-600 px-6 py-3 rounded-lg font-semibold">
                            <span className="text-white">Aviso Aberto</span>
                        </div>
                        <ArrowRight className="text-blue-400" />
                        <div className="bg-blue-600 px-6 py-3 rounded-lg font-semibold">
                            <span className="text-white">Scraper</span>
                        </div>
                        <ArrowRight className="text-blue-400" />
                        <div className="bg-emerald-600 px-6 py-3 rounded-lg font-semibold">
                            <span className="text-white">NUT+TIP</span>
                        </div>
                        <ArrowRight className="text-blue-400" />
                        <div className="bg-emerald-600 px-6 py-3 rounded-lg font-semibold">
                            <span className="text-white">Matching</span>
                        </div>
                        <ArrowRight className="text-blue-400" />
                        <div className="bg-violet-600 px-6 py-3 rounded-lg font-semibold">
                            <span className="text-white">50 Empresas</span>
                        </div>
                        <ArrowRight className="text-blue-400" />
                        <div className="bg-amber-600 px-6 py-3 rounded-lg font-semibold">
                            <span className="text-white">Export CSV</span>
                        </div>
                        <ArrowRight className="text-blue-400" />
                        <div className="bg-amber-600 px-6 py-3 rounded-lg font-semibold">
                            <span className="text-white">Campanha</span>
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
        color: 'blue',
        badge: 'FASE 1',
        content: (
            <div className="px-12 md:px-24 h-full flex flex-col justify-center">
                <h2 className="text-5xl font-bold text-white mb-10">Scope Fase 1 - Motor de Oportunidades</h2>

                <div className="grid md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Globe className="w-8 h-8 text-blue-400" />
                            <h4 className="font-bold text-white text-xl">Scraping 3 Portais</h4>
                        </div>
                        <ul className="space-y-3 text-blue-100">
                            <li className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-400" /> PT2030 (abertos + planeados)</li>
                            <li className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-400" /> PRR</li>
                            <li className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-400" /> PEPAC</li>
                            <li className="flex items-center gap-2"><Clock className="w-5 h-5 text-blue-400" /> Verificação a cada 6h</li>
                        </ul>
                    </div>

                    <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Target className="w-8 h-8 text-emerald-400" />
                            <h4 className="font-bold text-white text-xl">Matching NUT+TIP</h4>
                        </div>
                        <ul className="space-y-3 text-blue-100">
                            <li className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-400" /> NUT (Norte, Centro, Lisboa...)</li>
                            <li className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-400" /> TIP (IPSS, Associação, Poder Local)</li>
                            <li className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-400" /> Contador de empresas compatíveis</li>
                            <li className="flex items-center gap-2"><Check className="w-5 h-5 text-blue-400" /> CAE como fallback (5% dos avisos)</li>
                        </ul>
                    </div>

                    <div className="bg-violet-500/20 border border-violet-400/30 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Database className="w-8 h-8 text-violet-400" />
                            <h4 className="font-bold text-white text-xl">RAG Interno</h4>
                        </div>
                        <ul className="space-y-3 text-blue-100">
                            <li className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-400" /> Index 291 candidaturas</li>
                            <li className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-400" /> Chatbot para perguntas</li>
                            <li className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-400" /> Pesquisa semântica</li>
                        </ul>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <h4 className="text-xl font-bold text-white mb-5 flex items-center gap-3">
                            <Zap className="w-6 h-6 text-blue-400" />
                            Interface Limpa
                        </h4>
                        <ul className="space-y-3 text-blue-100">
                            <li className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-400" /> Lista de avisos com filtros</li>
                            <li className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-400" /> Colunas: NUT, TIP, Contador</li>
                            <li className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-400" /> Filtro "Interessa/Não Interessa"</li>
                            <li className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-400" /> Resumo do aviso ao clicar</li>
                            <li className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-400" /> Export CSV para Bitrix</li>
                        </ul>
                    </div>

                    <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-6">
                        <h4 className="text-xl font-bold text-white mb-5 flex items-center gap-3">
                            <X className="w-6 h-6 text-red-400" />
                            O Que NÃO Inclui
                        </h4>
                        <ul className="space-y-3 text-blue-200">
                            <li className="flex items-center gap-2"><X className="w-4 h-4 text-red-400" /> Dashboard KPIs (Power BI já faz)</li>
                            <li className="flex items-center gap-2"><X className="w-4 h-4 text-red-400" /> Chatbot público para clientes</li>
                            <li className="flex items-center gap-2"><X className="w-4 h-4 text-red-400" /> AI Writer (Fase 2)</li>
                            <li className="flex items-center gap-2"><X className="w-4 h-4 text-red-400" /> Email Drip</li>
                        </ul>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'fase2-futuro',
        title: 'Fase 2 - O Futuro',
        subtitle: 'Trigger: Candidatura Aprovada',
        color: 'amber',
        badge: 'UPSELL',
        content: (
            <div className="px-12 md:px-24 h-full flex flex-col justify-center">
                <h2 className="text-5xl font-bold text-white mb-6">Fase 2: Plataforma Completa</h2>
                <p className="text-xl text-blue-200 mb-10">Se a vossa candidatura interna for aprovada, expandimos para a plataforma completa.</p>

                <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-2 border-orange-500/50 rounded-xl p-8 mb-10">
                    <div className="flex items-center gap-6 mb-6">
                        <Crown className="w-12 h-12 text-orange-400" />
                        <div>
                            <p className="text-3xl font-bold text-white">Investimento Adicional: €13.500 + IVA</p>
                            <p className="text-orange-200 text-xl mt-2">TOTAL DO PROJETO: €18.000 + IVA</p>
                        </div>
                    </div>
                </div>

                <h3 className="text-3xl font-bold text-white mb-8">Deliverables Fase 2:</h3>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                        <h4 className="font-bold text-white mb-4 flex items-center gap-3 text-xl">
                            <FileText className="w-6 h-6 text-orange-400" />
                            AI Writer
                        </h4>
                        <p className="text-blue-100">Gera rascunhos de memórias descritivas baseado nas 291 candidaturas históricas.</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                        <h4 className="font-bold text-white mb-4 flex items-center gap-3 text-xl">
                            <BarChart3 className="w-6 h-6 text-orange-400" />
                            Post-Award Management
                        </h4>
                        <p className="text-blue-100">Dashboard de projetos aprovados, milestones, alertas de reporting.</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                        <h4 className="font-bold text-white mb-4 flex items-center gap-3 text-xl">
                            <TrendingUp className="w-6 h-6 text-orange-400" />
                            Marketing Mix AI
                        </h4>
                        <p className="text-blue-100">Recomendações de canais e análise de performance de campanhas.</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                        <h4 className="font-bold text-white mb-4 flex items-center gap-3 text-xl">
                            <Globe className="w-6 h-6 text-orange-400" />
                            Website Auto-Update
                        </h4>
                        <p className="text-blue-100">Sincronização automática de avisos no website da TA Consulting.</p>
                    </div>
                </div>

                <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-xl p-6 mt-8">
                    <h4 className="font-bold text-white mb-4 flex items-center gap-3 text-xl">
                        <Shield className="w-6 h-6 text-emerald-400" />
                        RISCO ZERO
                    </h4>
                    <p className="text-emerald-100 text-lg">Se a candidatura não for aprovada, ficam apenas com o valor da Fase 1. Partilham o risco do sucesso.</p>
                </div>
            </div>
        )
    },
    {
        id: 'investimento',
        title: 'Investimento & Timeline',
        subtitle: 'Transparente e Clara',
        color: 'cyan',
        content: (
            <div className="px-12 md:px-24 h-full flex flex-col justify-center">
                <h2 className="text-5xl font-bold text-white mb-12">Investimento em Duas Fases</h2>

                <div className="grid md:grid-cols-2 gap-10">
                    {/* FASE 1 */}
                    <div className="bg-gradient-to-br from-blue-600 to-blue-800 border-2 border-blue-400 rounded-xl p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-bold text-xl">1</span>
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-white">FASE 1</h3>
                                <p className="text-blue-200">Motor de Oportunidades</p>
                            </div>
                        </div>

                        <div className="text-6xl font-bold text-white mb-4">€4.500<span className="text-xl font-normal text-blue-300">+ IVA</span></div>
                        <p className="text-blue-200 mb-6">Pagamento único</p>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center text-xl">
                                <span className="text-blue-100">Retainer:</span>
                                <span className="font-bold text-white">€350/mês + IVA</span>
                            </div>
                            <div className="flex justify-between items-center text-xl">
                                <span className="text-blue-100">Mínimo:</span>
                                <span className="font-bold text-white">3 meses</span>
                            </div>
                        </div>

                        <div className="bg-blue-900/50 rounded-lg p-5">
                            <div className="flex items-center gap-3 mb-4">
                                <Clock className="w-6 h-6 text-blue-400" />
                                <span className="font-semibold text-blue-200 text-lg">Timeline</span>
                            </div>
                            <div className="space-y-3 text-blue-100">
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                    <span>Sem 1-2: Scraping + Bitrix integration</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                    <span>Sem 3-4: Matching NUT/TIP + UI</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                    <span>Sem 5-6: RAG + Testes</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                                    <span>Sem 7-8: Deploy + Formação</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FASE 2 */}
                    <div className="bg-gradient-to-br from-amber-600 to-orange-800 border-2 border-orange-400 rounded-xl p-8 relative">
                        <div className="absolute -top-3 right-6 bg-orange-500 text-white text-sm px-4 py-1 rounded-full font-semibold flex items-center gap-2">
                            <Crown className="w-4 h-4" />
                            SE APROVADO
                        </div>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                                <span className="text-orange-600 font-bold text-xl">2</span>
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-white">FASE 2</h3>
                                <p className="text-orange-200">Plataforma Completa</p>
                            </div>
                        </div>

                        <div className="text-6xl font-bold text-white mb-2">€13.500<span className="text-xl font-normal text-orange-300">+ IVA</span></div>
                        <div className="text-xl text-orange-300 mb-6">adicional ao Fase 1</div>

                        <div className="bg-orange-900/50 rounded-lg p-5 mb-6">
                            <div className="text-3xl font-bold text-white mb-2">TOTAL: €18.000 + IVA</div>
                            <p className="text-orange-200">Investimento completo</p>
                        </div>

                        <div className="space-y-3">
                            <h4 className="font-bold text-white text-lg mb-3">Novos Deliverables:</h4>
                            <ul className="space-y-2 text-blue-100">
                                <li className="flex items-center gap-2"><Check className="w-5 h-5 text-orange-400" /> AI Writer (memórias)</li>
                                <li className="flex items-center gap-2"><Check className="w-5 h-5 text-orange-400" /> Post-Award Management</li>
                                <li className="flex items-center gap-2"><Check className="w-5 h-5 text-orange-400" /> Marketing Mix AI</li>
                                <li className="flex items-center gap-2"><Check className="w-5 h-5 text-orange-400" /> Website Auto-Update</li>
                                <li className="flex items-center gap-2"><Check className="w-5 h-5 text-orange-400" /> AI Critic</li>
                            </ul>
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
        color: 'emerald',
        content: (
            <div className="flex flex-col justify-center items-center h-full px-12 text-center">
                <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">Vamos Testar o Motor?</h2>
                <p className="text-2xl text-blue-200 mb-16">Em 2 semanas temos uma demo funcional para validar o approach.</p>

                <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-400/30 rounded-xl p-10 mb-12">
                    <h3 className="text-3xl font-bold text-white mb-8">Call-to-Action</h3>
                    <div className="space-y-5 text-left">
                        <div className="flex items-center gap-4 text-blue-100 text-xl">
                            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-white">1</div>
                            <span>Revisão proposta com sócios</span>
                        </div>
                        <div className="flex items-center gap-4 text-blue-100 text-xl">
                            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-white">2</div>
                            <span>Aprovação e kickoff</span>
                        </div>
                        <div className="flex items-center gap-4 text-blue-100 text-xl">
                            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-white">3</div>
                            <span>Entrega Fase 1 em 8 semanas</span>
                        </div>
                        <div className="flex items-center gap-4 text-blue-100 text-xl">
                            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-white">4</div>
                            <span>Fase 2 se (e só se) aprovado</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-6 justify-center">
                    <Link href="/proposta-tecnica" className="bg-white/10 hover:bg-white/20 border border-white/30 px-8 py-4 rounded-lg text-white font-medium transition-colors flex items-center gap-3 text-lg">
                        <FileText className="w-6 h-6" />
                        Ver Proposta
                    </Link>
                    <a href="mailto:geral@taconsulting.pt?subject=TA%20Platform%20v6" className="bg-emerald-600 hover:bg-emerald-700 px-8 py-4 rounded-lg text-white font-medium transition-colors flex items-center gap-3 text-lg">
                        <Mail className="w-6 h-6" />
                        Falar Connosco
                    </a>
                </div>

                <div className="text-center mt-12">
                    <Link href="/" className="text-blue-300 hover:text-white flex items-center gap-2 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        Voltar ao Dashboard
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
// MAIN COMPONENT - SLIDE-BASED PRESENTATION
// ============================================================================

export default function ApresentacaoV6Page() {
    const [currentSlide, setCurrentSlide] = useState(0);

    // Navigation functions
    const nextSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, []);

    const prevSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
    }, []);

    const goToSlide = useCallback((index: number) => {
        setCurrentSlide(index);
    }, []);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === ' ') {
                e.preventDefault();
                nextSlide();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                prevSlide();
            } else if (e.key === 'Home') {
                e.preventDefault();
                goToSlide(0);
            } else if (e.key === 'End') {
                e.preventDefault();
                goToSlide(SLIDES.length - 1);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [nextSlide, prevSlide, goToSlide]);

    const handlePrint = () => {
        window.print();
    };

    const currentSlideData = SLIDES[currentSlide];
    const colors = colorMap[currentSlideData.color] || colorMap.blue;

    // Slide variants for animation
    const slideVariants = {
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

    const [direction, setDirection] = useState(0);

    const handleNext = () => {
        setDirection(1);
        nextSlide();
    };

    const handlePrev = () => {
        setDirection(-1);
        prevSlide();
    };

    const handleGoTo = (index: number) => {
        setDirection(index > currentSlide ? 1 : -1);
        goToSlide(index);
    };

    return (
        <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
            </div>

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-xl border-b border-white/10 no-print">
                <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/apresentacao-v5" className="text-slate-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <Image src="/logo-ta.png" alt="TA Consulting" width={40} height={40} />
                        <div>
                            <h1 className="text-base font-bold text-white">Proposta v6</h1>
                            <p className="text-xs text-slate-400">2 Fases • PowerPoint Mode</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-slate-400 text-sm">
                            {currentSlide + 1} / {SLIDES.length}
                        </span>
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

            {/* Slides Container */}
            <div className="h-screen pt-16 pb-20 relative">
                <AnimatePresence initial={false} custom={direction} mode="wait">
                    <motion.div
                        key={currentSlide}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 },
                            scale: { duration: 0.2 }
                        }}
                        className="absolute inset-16 pt-16 pb-20 overflow-hidden"
                    >
                        <div className="h-full overflow-y-auto px-4">
                            {currentSlideData.content}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Slide Indicators */}
            <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 no-print">
                <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
                    {SLIDES.map((slide, index) => (
                        <button
                            key={slide.id}
                            onClick={() => handleGoTo(index)}
                            className={`w-3 h-3 rounded-full transition-all ${
                                index === currentSlide
                                    ? 'bg-blue-500 w-8'
                                    : 'bg-slate-600 hover:bg-slate-500'
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>

            {/* Navigation Arrows */}
            <div className="fixed bottom-20 right-8 z-40 flex items-center gap-2 no-print">
                <button
                    onClick={handlePrev}
                    disabled={currentSlide === 0}
                    className="p-3 bg-slate-800/80 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-sm rounded-lg border border-white/10 transition-colors"
                    aria-label="Previous slide"
                >
                    <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <button
                    onClick={handleNext}
                    disabled={currentSlide === SLIDES.length - 1}
                    className="p-3 bg-slate-800/80 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-sm rounded-lg border border-white/10 transition-colors"
                    aria-label="Next slide"
                >
                    <ArrowRight className="w-5 h-5 text-white" />
                </button>
            </div>

            {/* Keyboard Hint */}
            <div className="fixed bottom-20 left-8 z-40 no-print hidden md:block">
                <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10">
                    <p className="text-slate-400 text-xs">
                        <span className="font-semibold text-white">←</span> anterior
                        <span className="mx-2">•</span>
                        <span className="font-semibold text-white">→</span> próximo
                    </p>
                </div>
            </div>

            {/* Footer */}
            <footer className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-xl border-t border-white/10 py-3 no-print">
                <div className="px-6 flex items-center justify-between">
                    <p className="text-slate-400 text-sm">
                        Proposta confidencial • TA Consulting • Janeiro 2026
                    </p>
                    <p className="text-slate-500 text-xs">
                        Versão 6.0 - Modelo de 2 Fases
                    </p>
                </div>
            </footer>

            {/* Print styles */}
            <style jsx global>{`
                @media print {
                    @page { margin: 0.5cm; size: landscape; }
                    body { background: white !important; color: black !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .no-print { display: none !important; }
                    .fixed { display: none !important; }
                    header { display: none !important; }
                    footer { display: none !important; }
                    .h-screen { height: auto !important; }
                    .w-screen { width: 100% !important; }
                    .overflow-hidden { overflow: visible !important; }
                    .absolute { position: relative !important; }
                    .bg-blue-500\\/20 { background: #e3f2fd !important; }
                    .bg-emerald-500\\/20 { background: #e8f5e9 !important; }
                    .bg-amber-500\\/20 { background: #fff8e1 !important; }
                    .bg-cyan-500\\/20 { background: #e0f7fa !important; }
                    .bg-red-500\\/20 { background: #ffebee !important; }
                    .bg-orange-500\\/20 { background: #fff3e0 !important; }
                    .bg-violet-500\\/20 { background: #f3e5f5 !important; }
                    .border { border-color: #dee2e6 !important; }
                    .text-white { color: #1a1a1a !important; }
                    .text-blue-100, .text-blue-200, .text-blue-300 { color: #0d47a1 !important; }
                    .text-emerald-100, .text-emerald-200, .text-emerald-300 { color: #1b5e20 !important; }
                    .text-amber-100, .text-amber-200, .text-amber-300 { color: #f57f17 !important; }
                    .text-orange-100, .text-orange-200, .text-orange-300 { color: #e65100 !important; }
                    .text-cyan-100, .text-cyan-200, .text-cyan-300 { color: #006064 !important; }
                    .text-violet-100, .text-violet-200, .text-violet-300 { color: #4a148c !important; }
                    .from-slate-900, .via-blue-950, .to-slate-900 { background: white !important; }
                }

                /* Scrollbar styling for slide content */
                .overflow-y-auto::-webkit-scrollbar {
                    width: 6px;
                }
                .overflow-y-auto::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 3px;
                }
                .overflow-y-auto::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 3px;
                }
                .overflow-y-auto::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.3);
                }
            `}</style>
        </div>
    );
}
