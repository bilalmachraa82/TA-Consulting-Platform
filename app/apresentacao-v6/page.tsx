'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, BarChart3, Lightbulb, Target, Globe, Zap, Database, Clock, Check, Shield, FileText, Sparkles, Star, Award, Crown, Users, TrendingUp, Play, Download, Printer, Mail, ChevronRight } from 'lucide-react';
import Image from 'next/image';

// ============================================================================
// DATA - APRESENTAÇÃO v6: FOCADA EM VENDER A SÓCIOS
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
                    <span className="text-lg font-semibold tracking-widest text-amber-300 uppercase">Janeiro 2026</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
                    Transforme Avisos em <span className="text-amber-400">Candidaturas</span>
                </h1>

                <p className="text-2xl md:text-3xl text-blue-100 mb-12 max-w-3xl leading-relaxed">
                    Plataforma de inteligência que identifica oportunidades e qualifica leads automaticamente
                </p>

                <div className="flex items-center gap-10 text-blue-100 text-xl">
                    <div className="text-center">
                        <div className="text-6xl font-bold text-white">24k+</div>
                        <div className="text-sm mt-2">Empresas</div>
                    </div>
                    <div className="w-px h-16 bg-blue-400"></div>
                    <div className="text-center">
                        <div className="text-6xl font-bold text-white">291</div>
                        <div className="text-sm mt-2">Candidaturas de Sucesso</div>
                    </div>
                    <div className="w-px h-16 bg-blue-400"></div>
                    <div className="text-center">
                        <div className="text-6xl font-bold text-white">3</div>
                        <div className="text-sm mt-2">Fontes de Fundos</div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'problema',
        title: 'O Desafio',
        subtitle: 'Oportunidades Perdidas Diariamente',
        color: 'red',
        content: (
            <div className="px-12 md:px-24 h-full flex flex-col justify-center">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-10 leading-tight">Como transformar 24.000 empresas em leads qualificados?</h2>

                <div className="grid md:grid-cols-2 gap-8 flex-1">
                    <div className="space-y-6">
                        <div className="bg-gradient-to-r from-red-500/30 to-orange-500/30 border-l-4 border-red-500 p-6 rounded-r-xl">
                            <p className="text-xl text-white italic mb-2">"Saber quem são as empresas não é saber quem são leads para um aviso específico."</p>
                            <p className="text-red-300 text-sm">— Desafio atual da TA Consulting</p>
                        </div>

                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                            <h3 className="text-2xl font-bold text-white mb-4">O que acontece hoje:</h3>
                            <ul className="space-y-3 text-lg text-blue-100">
                                <li className="flex items-start gap-3">
                                    <span className="text-red-400 text-2xl">•</span>
                                    <span>Pesquisa manual em múltiplos portais</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-red-400 text-2xl">•</span>
                                    <span>Cruzamento manual de elegibilidades</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-red-400 text-2xl">•</span>
                                    <span>Avisos descobertos tarde (competidores já contactaram)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-red-400 text-2xl">•</span>
                                    <span>Conhecimento de 291 candidaturas subutilizado</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500/20 to-emerald-500/20 border-2 border-emerald-400/50 rounded-2xl p-8 flex flex-col justify-center">
                        <h3 className="text-3xl font-bold text-white mb-6">A Oportunidade</h3>
                        <div className="space-y-4 text-lg">
                            <div className="flex items-center gap-4">
                                <Check className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                                <span className="text-blue-100">Avisos encontrados automaticamente</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <Check className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                                <span className="text-blue-100">Empresas qualificadas instantaneamente</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <Check className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                                <span className="text-blue-100">291 candidaturas como referência</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <Check className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                                <span className="text-blue-100">Primeiro a contactar = maior probabilidade de sucesso</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'solucao',
        title: 'A Solução',
        subtitle: 'Motor de Inteligência',
        color: 'emerald',
        content: (
            <div className="px-12 md:px-24 h-full flex flex-col justify-center">
                <h2 className="text-5xl font-bold text-white mb-6">Três Motores que Trabalham Juntos</h2>
                <p className="text-2xl text-blue-200 mb-12">Identificamos avisos, qualificamos empresas, geramos candidaturas</p>

                <div className="grid md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-gradient-to-br from-blue-500/30 to-blue-600/20 border-2 border-blue-400/50 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Globe className="w-10 h-10 text-blue-400" />
                            <h4 className="font-bold text-white text-2xl">1. Identificar</h4>
                        </div>
                        <p className="text-blue-100 text-lg mb-3">Avisos de Portugal 2030, PRR e PEPAC</p>
                        <ul className="space-y-2 text-blue-200 text-sm">
                            <li>• Avisos abertos e planeados</li>
                            <li>• Atualizado a cada 6 horas</li>
                            <li>• Alertas de novos avisos</li>
                        </ul>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-500/30 to-green-600/20 border-2 border-emerald-400/50 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Target className="w-10 h-10 text-emerald-400" />
                            <h4 className="font-bold text-white text-2xl">2. Qualificar</h4>
                        </div>
                        <p className="text-emerald-100 text-lg mb-3">Cruza aviso com empresas compatíveis</p>
                        <ul className="space-y-2 text-emerald-200 text-sm">
                            <li>• Por região (NUT)</li>
                            <li>• Por tipo de entidade (IPSS, Associação...)</li>
                            <li>• Mostra: "50 empresas qualificadas"</li>
                        </ul>
                    </div>

                    <div className="bg-gradient-to-br from-violet-500/30 to-purple-600/20 border-2 border-violet-400/50 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Sparkles className="w-10 h-10 text-violet-400" />
                            <h4 className="font-bold text-white text-2xl">3. Criar</h4>
                        </div>
                        <p className="text-violet-100 text-lg mb-3">Rascunhos baseados em candidaturas de sucesso</p>
                        <ul className="space-y-2 text-violet-200 text-sm">
                            <li>• 291 candidaturas como referência</li>
                            <li>• AI Writer gera primeiro rascunho</li>
                            <li>• Economia de 50% do tempo</li>
                        </ul>
                    </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                    <h4 className="text-2xl font-bold text-white mb-4 text-center">Resultado: Do Aviso ao Lead em Minutos</h4>
                    <div className="flex items-center justify-center gap-4 text-lg flex-wrap">
                        <span className="bg-blue-600 px-4 py-2 rounded-lg text-white font-semibold">Novo Aviso</span>
                        <ChevronRight className="text-blue-400" />
                        <span className="bg-blue-600 px-4 py-2 rounded-lg text-white font-semibold">Matching</span>
                        <ChevronRight className="text-blue-400" />
                        <span className="bg-emerald-600 px-4 py-2 rounded-lg text-white font-semibold">50 Empresas</span>
                        <ChevronRight className="text-blue-400" />
                        <span className="bg-violet-600 px-4 py-2 rounded-lg text-white font-semibold">Rascunho IA</span>
                        <ChevronRight className="text-blue-400" />
                        <span className="bg-amber-600 px-4 py-2 rounded-lg text-white font-semibold">Leads</span>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'fase1',
        title: 'Fase 1 - O Que Entregamos',
        subtitle: '€4.500 + IVA • 10 Semanas',
        color: 'blue',
        badge: 'FASE 1',
        content: (
            <div className="px-12 md:px-24 h-full flex flex-col justify-center">
                <h2 className="text-5xl font-bold text-white mb-8">Plataforma Core - €4.500 + IVA</h2>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-blue-500/20 border-2 border-blue-400/50 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Globe className="w-8 h-8 text-blue-400" />
                            <h4 className="font-bold text-white text-xl">Avisos em Tempo Real</h4>
                        </div>
                        <p className="text-blue-100 mb-3">Todos os avisos de fundos europeus num só lugar</p>
                        <ul className="space-y-2 text-blue-200 text-sm">
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Portugal 2030</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> PRR - Plano de Recuperação</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> PEPAC</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Atualizado a cada 6h</li>
                        </ul>
                    </div>

                    <div className="bg-emerald-500/20 border-2 border-emerald-400/50 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Target className="w-8 h-8 text-emerald-400" />
                            <h4 className="font-bold text-white text-xl">Matching Inteligente</h4>
                        </div>
                        <p className="text-emerald-100 mb-3">Cruza cada aviso com empresas qualificadas</p>
                        <ul className="space-y-2 text-emerald-200 text-sm">
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Por região (Norte, Centro, Lisboa...)</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Por tipo (IPSS, Associação, Poder Local...)</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Mostra número de empresas compatíveis</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Export 1-clique para Bitrix</li>
                        </ul>
                    </div>

                    <div className="bg-violet-500/20 border-2 border-violet-400/50 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Database className="w-8 h-8 text-violet-400" />
                            <h4 className="font-bold text-white text-xl">Conhecimento da TA</h4>
                        </div>
                        <p className="text-violet-100 mb-3">291 candidaturas históricas sempre disponíveis</p>
                        <ul className="space-y-2 text-violet-200 text-sm">
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Pergunte em linguagem natural</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Encontra respostas nas candidaturas</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Exemplos de linguagem aprovada</li>
                        </ul>
                    </div>

                    <div className="bg-gradient-to-br from-violet-500/30 to-purple-500/20 border-2 border-violet-400/50 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Sparkles className="w-8 h-8 text-violet-400" />
                            <h4 className="font-bold text-white text-xl">AI Writer Incluído</h4>
                            <span className="ml-auto text-xs bg-violet-500 px-3 py-1 rounded-full text-white font-bold">NOVO</span>
                        </div>
                        <p className="text-violet-100 mb-3">Primeiro rascunho gerado automaticamente</p>
                        <ul className="space-y-2 text-violet-200 text-sm">
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Upload do aviso (URL ou PDF)</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Seleciona empresa do Bitrix</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Rascunho baseado em 291 candidaturas</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Respeita limites de caracteres</li>
                        </ul>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border-2 border-emerald-400/50 rounded-xl p-6">
                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                        <TrendingUp className="w-6 h-6 text-emerald-400" />
                        Resultado: Mais Candidaturas, Menos Trabalho Manual
                    </h3>
                    <p className="text-emerald-100 text-lg">De horas de pesquisa a minutos. O foco passa a ser fechar negócios, não procurar oportunidades.</p>
                </div>
            </div>
        )
    },
    {
        id: 'fase2',
        title: 'Fase 2 - Expansão Premium',
        subtitle: 'Trigger: 1ª Candidatura Aprovada',
        color: 'gold',
        badge: 'PREMIUM',
        content: (
            <div className="px-12 md:px-24 h-full flex flex-col justify-center">
                <h2 className="text-5xl font-bold text-white mb-4">Fase 2 - Se Aprovado, Expandimos</h2>
                <p className="text-xl text-blue-200 mb-8">Se a primeira candidatura for aprovada, expandimos para automação completa.</p>

                <div className="bg-gradient-to-r from-amber-500/30 to-yellow-500/20 border-2 border-amber-400/50 rounded-xl p-6 mb-8">
                    <div className="flex items-center gap-6">
                        <Crown className="w-12 h-12 text-amber-400" />
                        <div>
                            <p className="text-3xl font-bold text-white">Investimento Adicional: €13.500 + IVA</p>
                            <p className="text-amber-200 text-xl mt-1">TOTAL DO PROJETO: €18.000 + IVA</p>
                        </div>
                    </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-6">Evolução do AI Writer e Automação Avançada:</h3>

                <div className="grid md:grid-cols-2 gap-5 mb-6">
                    <div className="bg-gradient-to-br from-violet-500/30 to-purple-500/20 border-2 border-violet-400/50 rounded-xl p-5">
                        <h4 className="font-bold text-white mb-3 flex items-center gap-3 text-lg">
                            <Sparkles className="w-6 h-6 text-violet-400" />
                            AI Writer Premium
                        </h4>
                        <p className="text-violet-200 text-sm mb-3">Evolução do V1 com templates avançados</p>
                        <ul className="space-y-1 text-blue-100 text-sm">
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Templates por tipo de aviso</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Validação automática de regras</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Revisão automática (AI Critic)</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Export para Word/PDF</li>
                        </ul>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-500/30 to-green-500/20 border-2 border-emerald-400/50 rounded-xl p-5">
                        <h4 className="font-bold text-white mb-3 flex items-center gap-3 text-lg">
                            <TrendingUp className="w-6 h-6 text-emerald-400" />
                            Marketing Mix AI
                        </h4>
                        <p className="text-emerald-200 text-sm mb-3">Automatiza decisões de campanha</p>
                        <ul className="space-y-1 text-blue-100 text-sm">
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Sugere canais (email, Facebook...)</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Análise de performance</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Identifica segmentos propensos</li>
                        </ul>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500/30 to-cyan-500/20 border-2 border-blue-400/50 rounded-xl p-5">
                        <h4 className="font-bold text-white mb-3 flex items-center gap-3 text-lg">
                            <Globe className="w-6 h-6 text-blue-400" />
                            Website Auto-Update
                        </h4>
                        <p className="text-blue-200 text-sm mb-3">Sincroniza automaticamente</p>
                        <ul className="space-y-1 text-blue-100 text-sm">
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Novos avisos no site automaticamente</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Atualização de datas em tempo real</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Apenas validação necessária</li>
                        </ul>
                    </div>

                    <div className="bg-gradient-to-br from-amber-500/30 to-yellow-500/20 border-2 border-amber-400/50 rounded-xl p-5">
                        <h4 className="font-bold text-white mb-3 flex items-center gap-3 text-lg">
                            <Database className="w-6 h-6 text-amber-400" />
                            Integração Bitrix Completa
                        </h4>
                        <p className="text-amber-200 text-sm mb-3">Escrita direta no Bitrix</p>
                        <ul className="space-y-1 text-blue-100 text-sm">
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Cria segmentos automaticamente</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Atualiza empresas</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Fim do import/export manual</li>
                        </ul>
                    </div>
                </div>

                <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-xl p-5">
                    <h4 className="font-bold text-white mb-3 flex items-center gap-3 text-lg">
                        <Shield className="w-6 h-6 text-emerald-400" />
                        Risco Zero Partilhado
                    </h4>
                    <p className="text-emerald-100">Se a candidatura não for aprovada, ficam apenas pelo valor da Fase 1. Partilhamos o risco do sucesso.</p>
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
                <h2 className="text-5xl font-bold text-white mb-10">Investimento em Duas Fases</h2>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* FASE 1 */}
                    <div className="bg-gradient-to-br from-blue-600 to-blue-800 border-2 border-blue-400 rounded-xl p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-bold text-2xl">1</span>
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-white">FASE 1</h3>
                                <p className="text-blue-200">Plataforma Core</p>
                            </div>
                        </div>

                        <div className="text-7xl font-bold text-white mb-3">€4.500<span className="text-2xl font-normal text-blue-300">+ IVA</span></div>
                        <p className="text-blue-200 mb-6 text-lg">Pagamento único • 10 semanas</p>

                        <div className="space-y-4 mb-6">
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
                                    <span>Sem 3-4: Matching + Interface</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                    <span>Sem 5-7: RAG + AI Writer V1</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                                    <span>Sem 8-10: Testes + Deploy + Formação</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FASE 2 */}
                    <div className="bg-gradient-to-br from-amber-500 via-yellow-600 to-amber-700 border-2 border-amber-400 rounded-xl p-8 relative shadow-2xl">
                        <div className="absolute -top-3 -right-3 bg-amber-400 text-amber-900 text-sm px-4 py-1 rounded-full font-bold flex items-center gap-2 shadow-lg">
                            <Crown className="w-4 h-4" />
                            SE APROVADO
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center">
                                <span className="text-amber-600 font-bold text-2xl">2</span>
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-white">FASE 2</h3>
                                <p className="text-amber-100">Premium Expansion</p>
                            </div>
                        </div>

                        <div className="text-7xl font-bold text-white mb-3">€13.500<span className="text-2xl font-normal text-amber-200">+ IVA</span></div>
                        <div className="text-xl text-amber-100 mb-6">adicional ao Fase 1</div>

                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-5 mb-6">
                            <div className="text-4xl font-bold text-white mb-2">TOTAL: €18.000 + IVA</div>
                            <p className="text-amber-100">Investimento completo</p>
                        </div>

                        <div className="space-y-3">
                            <h4 className="font-bold text-white text-lg mb-3">Novos Deliverables:</h4>
                            <ul className="space-y-2 text-amber-100">
                                <li className="flex items-center gap-2"><Check className="w-5 h-5 text-white" /> AI Writer Premium</li>
                                <li className="flex items-center gap-2"><Check className="w-5 h-5 text-white" /> Marketing Mix AI</li>
                                <li className="flex items-center gap-2"><Check className="w-5 h-5 text-white" /> Website Auto-Update</li>
                                <li className="flex items-center gap-2"><Check className="w-5 h-5 text-white" /> Bitrix Write Integration</li>
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
                <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">Vamos Conversar?</h2>
                <p className="text-2xl text-blue-200 mb-16">Estamos disponíveis para esclarecer dúvidas e ajustar a proposta.</p>

                <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-400/30 rounded-xl p-10 mb-12">
                    <h3 className="text-3xl font-bold text-white mb-8">Próximos Passos</h3>
                    <div className="space-y-5 text-left">
                        <div className="flex items-center gap-4 text-blue-100 text-xl">
                            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0">1</div>
                            <span>Revisão da proposta com sócios</span>
                        </div>
                        <div className="flex items-center gap-4 text-blue-100 text-xl">
                            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0">2</div>
                            <span>Aprovação e kickoff</span>
                        </div>
                        <div className="flex items-center gap-4 text-blue-100 text-xl">
                            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0">3</div>
                            <span>Entrega Fase 1 em 10 semanas</span>
                        </div>
                        <div className="flex items-center gap-4 text-blue-100 text-xl">
                            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0">4</div>
                            <span>Fase 2 se (e só se) aprovado</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-6 justify-center">
                    <Link href="/proposta-tecnica" className="bg-white/10 hover:bg-white/20 border border-white/30 px-8 py-4 rounded-lg text-white font-medium transition-colors flex items-center gap-3 text-lg">
                        <FileText className="w-6 h-6" />
                        Ver Proposta Detalhada
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

const colorMap: Record<string, { bg: string; text: string; border: string; bgLight: string }> = {
    blue: { bg: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-400', bgLight: 'bg-blue-500/20' },
    emerald: { bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-400', bgLight: 'bg-emerald-500/20' },
    amber: { bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-400', bgLight: 'bg-amber-500/20' },
    gold: { bg: 'bg-amber-400', text: 'text-amber-400', border: 'border-amber-300', bgLight: 'bg-amber-400/20' },
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
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl"></div>
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
                            <p className="text-xs text-slate-400">PowerPoint Mode</p>
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
                        className="absolute inset-0 pt-16 pb-20 overflow-hidden"
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
                                    ? 'bg-amber-500 w-8'
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
                        Versão 6.0
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
                    .bg-amber-500\\/20, .from-amber-500\\/30 { background: #fff8e1 !important; }
                    .bg-cyan-500\\/20 { background: #e0f7fa !important; }
                    .bg-red-500\\/20 { background: #ffebee !important; }
                    .bg-violet-500\\/20 { background: #f3e5f5 !important; }
                    .border { border-color: #dee2e6 !important; }
                    .text-white { color: #1a1a1a !important; }
                    .text-blue-100, .text-blue-200, .text-blue-300 { color: #0d47a1 !important; }
                    .text-emerald-100, .text-emerald-200, .text-emerald-300 { color: #1b5e20 !important; }
                    .text-amber-100, .text-amber-200, .text-amber-300 { color: #f57f17 !important; }
                    .text-violet-100, .text-violet-200, .text-violet-300 { color: #4a148c !important; }
                    .text-cyan-100, .text-cyan-200, .text-cyan-300 { color: #006064 !important; }
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
