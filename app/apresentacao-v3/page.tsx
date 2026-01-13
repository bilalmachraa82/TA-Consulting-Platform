'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Check, ShieldCheck, TrendingUp, Database, Zap, Clock, BarChart3, Target, Globe, Layers, ArrowDownRight, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function ApresentacaoV3() {
    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-900 selection:text-white">
            {/* Fixed Navigation */}
            <nav className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-sm border-b border-slate-200 z-50">
                <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="text-sm font-bold tracking-wider text-slate-900">
                        TA Consulting
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>CONFIDENCIAL</span>
                    </div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-6 pt-24 pb-20">
                {/* SLIDE 1: Hero */}
                <section className="min-h-[85vh] flex flex-col justify-center border-b border-slate-100 mb-20">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-900 px-4 py-2 rounded-full text-sm font-semibold">
                                <Zap className="w-4 h-4" />
                                Janeiro 2026
                            </div>

                            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 leading-[1.1]">
                                Consultancy<span className="text-blue-600">OS</span>
                            </h1>

                            <p className="text-2xl md:text-3xl text-slate-600 leading-relaxed font-medium">
                                A plataforma que transforma o seu Bitrix24 em máquina de vendas para fundos comunitários
                            </p>

                            <div className="space-y-4 pt-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Check className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-lg text-slate-700">Scrapping diário de 6 portais de fundos</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Check className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-lg text-slate-700">Matchmaking automático com 24k empresas</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <TrendingUp className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-lg text-slate-700">Propostas geradas por IA com vosso estilo</span>
                                </div>
                            </div>

                            <div className="pt-6">
                                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg">
                                    Agendar Demo
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Hero Visual */}
                        <div className="relative">
                            <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-12 border border-slate-200">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                                                <Globe className="w-5 h-5 text-slate-600" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-900">Portais PT2030</div>
                                                <div className="text-xs text-slate-500">Avisos diários</div>
                                            </div>
                                        </div>
                                        <ArrowDownRight className="w-5 h-5 text-blue-600" />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                                <Layers className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-900">Matchmaking AI</div>
                                                <div className="text-xs text-slate-500">CAE + Região</div>
                                            </div>
                                        </div>
                                        <ArrowDownRight className="w-5 h-5 text-emerald-600" />
                                    </div>

                                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-xl shadow-lg">
                                        <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                                            <Database className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-white">Bitrix24 + Leads</div>
                                            <div className="text-xs text-blue-100">Prontos para contactar</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats badge */}
                            <div className="absolute -bottom-6 -right-6 bg-slate-900 text-white px-6 py-4 rounded-xl shadow-xl">
                                <div className="text-3xl font-bold">€3.5B+</div>
                                <div className="text-xs uppercase tracking-wider opacity-90">Fundos disponíveis</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SLIDE 2: Market Context */}
                <section className="min-h-[80vh] flex flex-col justify-center border-b border-slate-100 mb-20 py-20">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-900 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                            <BarChart3 className="w-4 h-4" />
                            CONTEXTO DE MERCADO
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                            A janela de oportunidade é 2026
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mb-12">
                        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
                            <div className="text-5xl font-bold text-blue-600 mb-3">€3.5B</div>
                            <div className="text-lg font-semibold text-slate-900 mb-2">Europa 2021-2027</div>
                            <div className="text-slate-600 text-sm">Fundos disponíveis para empresas portuguesas</div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
                            <div className="text-5xl font-bold text-emerald-600 mb-3">82%</div>
                            <div className="text-lg font-semibold text-slate-900 mb-2">Não aproveitados</div>
                            <div className="text-slate-600 text-sm">Empresas deixam dinheiro na mesa</div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
                            <div className="text-5xl font-bold text-amber-600 mb-3">2026</div>
                            <div className="text-lg font-semibold text-slate-900 mb-2">Pico de avisos</div>
                            <div className="text-slate-600 text-sm">PT2030 acelera lançamentos</div>
                        </div>
                    </div>

                    <div className="bg-blue-50 border-l-4 border-blue-600 rounded-r-2xl p-8">
                        <h3 className="text-xl font-bold text-slate-900 mb-4">O Problema do Consultor Hoje</h3>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div>
                                <div className="text-sm text-slate-600 mb-1">Tempo a qualificar leads</div>
                                <div className="text-2xl font-bold text-red-600">60%</div>
                                <div className="text-xs text-slate-500">do tempo perdido</div>
                            </div>
                            <div>
                                <div className="text-sm text-slate-600 mb-1">Base de dados ativa</div>
                                <div className="text-2xl font-bold text-red-600">&lt;5%</div>
                                <div className="text-xs text-slate-500">dos 24.000 contactos</div>
                            </div>
                            <div>
                                <div className="text-sm text-slate-600 mb-1">Conversão típica</div>
                                <div className="text-2xl font-bold text-amber-600">1:15</div>
                                <div className="text-xs text-slate-500">propostas vs aprovações</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SLIDE 3: Solution - What We Actually Have */}
                <section className="min-h-[80vh] flex flex-col justify-center border-b border-slate-100 mb-20 py-20">
                    <div className="grid lg:grid-cols-2 gap-16">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-900 px-4 py-2 rounded-full text-sm font-semibold mb-8">
                                <Check className="w-4 h-4" />
                                A SOLUÇÃO
                            </div>

                            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-8">
                                O que já<br />
                                <span className="text-blue-600">está operacional</span>
                            </h2>

                            <p className="text-lg text-slate-600 leading-relaxed mb-8">
                                Não vendemos promessas. Estas são as capacidades que hoje funcionam na plataforma.
                            </p>

                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <Check className="w-5 h-5 text-emerald-600" />
                                    <span className="font-bold text-emerald-900">Zero Vaporware</span>
                                </div>
                                <p className="text-sm text-emerald-800">
                                    Todas as funcionalidades apresentadas estão implementadas e testadas.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* Feature 1 */}
                            <div className="bg-white border border-slate-200 rounded-xl p-6 hover:border-blue-300 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Globe className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">Multi-Portal Scraper</h3>
                                        <p className="text-slate-600 text-sm leading-relaxed">
                                            Monitorização 24/7 de PT2030, PRR, PAPAC e Diário da República. Parsing estruturado e normalizado.
                                        </p>
                                        <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                                            <Check className="w-3 h-3" />
                                            70% implementado
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Feature 2 */}
                            <div className="bg-white border border-slate-200 rounded-xl p-6 hover:border-emerald-300 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Target className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">Matchmaking Engine</h3>
                                        <p className="text-slate-600 text-sm leading-relaxed">
                                            Motor que cruza CAE, Região e Dimensão com critérios de elegibilidade. Score de 0-100%.
                                        </p>
                                        <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                                            <Check className="w-3 h-3" />
                                            85% implementado
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Feature 3 */}
                            <div className="bg-white border border-slate-200 rounded-xl p-6 hover:border-violet-300 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Database className="w-6 h-6 text-violet-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">Bitrix Integration</h3>
                                        <p className="text-slate-600 text-sm leading-relaxed">
                                            Leitura via API dos 24.000 contactos. Enriquecimento com dados de elegibilidade.
                                        </p>
                                        <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded">
                                            <Clock className="w-3 h-3" />
                                            Read-only (write-back roadmap)
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Feature 4 */}
                            <div className="bg-white border border-slate-200 rounded-xl p-6 hover:border-blue-300 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Layers className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">RAG Technical Writer</h3>
                                        <p className="text-slate-600 text-sm leading-relaxed">
                                            IA que aprende com 291 candidaturas históricas para escrever no vosso estilo.
                                        </p>
                                        <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                                            <Check className="w-3 h-3" />
                                            60% implementado
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SLIDE 4: How It Works */}
                <section className="min-h-[80vh] flex flex-col justify-center border-b border-slate-100 mb-20 py-20">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-900 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                            <BarChart3 className="w-4 h-4" />
                            COMO FUNCIONA
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                            Do Aviso ao Lead em 4 Passos
                        </h2>
                    </div>

                    <div className="relative">
                        <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-emerald-200 to-violet-200 -translate-y-1/2 z-0"></div>

                        <div className="grid lg:grid-cols-4 gap-8 relative z-10">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                    <Globe className="w-10 h-10 text-white" />
                                </div>
                                <div className="text-sm font-bold text-slate-400 mb-2">PASSO 1</div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">Aviso Aberto</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    Scraper deteta novo aviso no portal PT2030 automaticamente
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                    <Target className="w-10 h-10 text-white" />
                                </div>
                                <div className="text-sm font-bold text-slate-400 mb-2">PASSO 2</div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">Análise IA</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    Matchmaker processa elegibilidade e compara com 24k contactos
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="w-20 h-20 bg-violet-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                    <Database className="w-10 h-10 text-white" />
                                </div>
                                <div className="text-sm font-bold text-slate-400 mb-2">PASSO 3</div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">Top Matches</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    Lista de empresas elegíveis com score e razões de match
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                    <TrendingUp className="w-10 h-10 text-white" />
                                </div>
                                <div className="text-sm font-bold text-slate-400 mb-2">PASSO 4</div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">Contacto</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    Consultor recebe lista pronta e começa a contactar
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SLIDE 5: Benchmark - Market Study */}
                <section className="min-h-[80vh] flex flex-col justify-center border-b border-slate-100 mb-20 py-20">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-900 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                            <BarChart3 className="w-4 h-4" />
                            BENCHMARK
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                            Alternativas no Mercado
                        </h2>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            Análise comparativa de custo para implementar solução similar
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {/* Option 1: Dev Custom */}
                        <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-8">
                            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Opção A</div>
                            <h3 className="text-xl font-bold text-slate-900 mb-6">Dev Custom In-House</h3>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Developer (3 meses)</span>
                                    <span className="font-semibold">€15.000</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Infraestrutura (1º ano)</span>
                                    <span className="font-semibold">€2.400</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">APIs externas</span>
                                    <span className="font-semibold">€1.200</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-200">
                                <div className="text-3xl font-bold text-slate-900">€18.600</div>
                                <div className="text-xs text-slate-500">Setup + 1º ano</div>
                            </div>

                            <div className="mt-4 space-y-2 text-xs text-slate-600">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                                    <span>Risco: dependência de 1 dev</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                                    <span>Timeline: 3-6 meses</span>
                                </div>
                            </div>
                        </div>

                        {/* Option 2: SaaS Tools */}
                        <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-8">
                            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Opção B</div>
                            <h3 className="text-xl font-bold text-slate-900 mb-6">Ferramentas SaaS</h3>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">HubSpot Sales</span>
                                    <span className="font-semibold">€720/ano</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Apollo.io (enrichment)</span>
                                    <span className="font-semibold">€600/ano</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">ChatGPT Team</span>
                                    <span className="font-semibold">$300/ano</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Scraper (Apify)</span>
                                    <span className="font-semibold">€500/ano</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-200">
                                <div className="text-3xl font-bold text-slate-900">€2.500+</div>
                                <div className="text-xs text-slate-500">Por ano (sem setup)</div>
                            </div>

                            <div className="mt-4 space-y-2 text-xs text-slate-600">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                                    <span>Sem integração Bitrix</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                                    <span>Sem matching de fundos PT</span>
                                </div>
                            </div>
                        </div>

                        {/* Option 3: Consultancy OS - HIGHLIGHTED */}
                        <div className="bg-gradient-to-br from-blue-600 to-blue-800 border-2 border-blue-400 rounded-2xl p-8 text-white relative shadow-xl">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                                -35% CUSTO
                            </div>

                            <div className="text-sm font-semibold text-blue-200 uppercase tracking-wider mb-4">Nossa Solução</div>
                            <h3 className="text-xl font-bold text-white mb-6">Consultancy OS</h3>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-blue-100">Setup Professional</span>
                                    <span className="font-semibold text-white">€7.500</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-blue-100">Retainer (12 meses)</span>
                                    <span className="font-semibold text-white">€9.600</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-blue-100">Infraestrutura</span>
                                    <span className="font-semibold text-white">Incluído</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-blue-500">
                                <div className="text-3xl font-bold text-white">€17.100</div>
                                <div className="text-xs text-blue-200">Setup + 1º ano</div>
                            </div>

                            <div className="mt-4 space-y-2 text-xs text-blue-100">
                                <div className="flex items-center gap-2">
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span>Integração Bitrix nativa</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span>Matching específico fundos PT</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SLIDE 6: 3 TIERS PRICING */}
                <section className="min-h-[90vh] flex flex-col justify-center border-b border-slate-100 mb-20 py-20">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-900 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                            <TrendingUp className="w-4 h-4" />
                            INVESTIMENTO
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                            Escolha o nível certo para si
                        </h2>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            Três opções com funcionalidades comprovadas. Sem surpresas, sem vaporware.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* STARTER */}
                        <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 flex flex-col">
                            <div className="mb-6">
                                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Starter</div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-slate-900">€5.000</span>
                                </div>
                                <div className="text-slate-500 text-sm">+ €600/mês</div>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-4 mb-6">
                                <div className="text-sm font-semibold text-slate-700 mb-1">Timeline</div>
                                <div className="text-2xl font-bold text-blue-600">8 semanas</div>
                            </div>

                            <div className="space-y-3 mb-6 flex-1">
                                <div className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-slate-700">Scraping PT2030/PRR</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-slate-700">Matchmaking CAE + Região</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-slate-700">Sync Bitrix (read-only)</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-slate-700">Dashboard básico</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-slate-700">Treino (4h)</span>
                                </div>
                            </div>

                            <div className="text-xs text-slate-500 text-center pt-4 border-t border-slate-200">
                                Para começar a automatizar
                            </div>
                        </div>

                        {/* PROFESSIONAL - RECOMMENDED */}
                        <div className="bg-gradient-to-b from-blue-600 to-blue-700 border-2 border-blue-500 rounded-2xl p-6 flex flex-col text-white relative shadow-xl">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                                RECOMENDADO
                            </div>

                            <div className="mb-6">
                                <div className="text-sm font-semibold text-blue-200 uppercase tracking-wider mb-2">Professional</div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-white">€7.500</span>
                                </div>
                                <div className="text-blue-200 text-sm">+ €800/mês</div>
                            </div>

                            <div className="bg-white/10 rounded-xl p-4 mb-6">
                                <div className="text-sm font-semibold text-blue-100 mb-1">Timeline</div>
                                <div className="text-2xl font-bold text-white">10-12 semanas</div>
                            </div>

                            <div className="space-y-3 mb-6 flex-1">
                                <div className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-white"><strong>TUDO do Starter</strong></span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-blue-100">RAG Technical Writer</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-blue-100">Sync Bidirecional Bitrix</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-blue-100">Dashboard avançado</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-blue-100">Email templates personalizados</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-blue-100">1 visita/mês (on-site)</span>
                                </div>
                            </div>

                            <div className="text-xs text-blue-200 text-center pt-4 border-t border-blue-500">
                                Solução completa para crescer
                            </div>
                        </div>

                        {/* PREMIUM */}
                        <div className="bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-slate-600 rounded-2xl p-6 flex flex-col text-white relative">
                            <div className="mb-6">
                                <div className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Premium</div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-white">€11.000</span>
                                </div>
                                <div className="text-slate-400 text-sm">+ €1.000/mês</div>
                            </div>

                            <div className="bg-white/10 rounded-xl p-4 mb-6">
                                <div className="text-sm font-semibold text-slate-300 mb-1">Timeline</div>
                                <div className="text-2xl font-bold text-amber-400">16-20 semanas</div>
                                <div className="text-xs text-slate-400"> roadmap + implementação</div>
                            </div>

                            <div className="space-y-3 mb-6 flex-1">
                                <div className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-white"><strong>TUDO do Professional</strong></span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-slate-300">Post-Award Management</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-slate-300">AI Proposal Critic</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-slate-300">Email Drip Automation</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Clock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-amber-300">Grant GPT (roadmap Q2)</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Clock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-amber-300">Auto-Website (roadmap Q3)</span>
                                </div>
                            </div>

                            <div className="text-xs text-slate-400 text-center pt-4 border-t border-slate-700">
                                Para dominar o mercado
                            </div>
                        </div>
                    </div>

                    {/* Honest Note */}
                    <div className="mt-12 bg-amber-50 border border-amber-200 rounded-xl p-6 max-w-3xl mx-auto">
                        <div className="flex items-start gap-4">
                            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <div className="font-bold text-amber-900 mb-2">Transparência sobre timelines</div>
                                <p className="text-sm text-amber-800">
                                    O Premium inclui funcionalidades em desenvolvimento. As features marcadas com "roadmap" serão entregues ao longo dos próximos 6-12 meses. Se precisa de tudo funcional imediatamente, recomendamos o Professional.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SLIDE 7: Timeline by Tier */}
                <section className="min-h-[80vh] flex flex-col justify-center border-b border-slate-100 mb-20 py-20">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-900 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                            <Clock className="w-4 h-4" />
                            IMPLEMENTAÇÃO
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                            Timeline por Tier
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Starter Timeline */}
                        <div className="border border-slate-200 rounded-xl p-6">
                            <div className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-sm font-bold text-blue-600">S</div>
                                Starter - 8 semanas
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                                    <div>
                                        <div className="text-sm font-semibold text-slate-900">Sem 1-2</div>
                                        <div className="text-xs text-slate-600">Setup scrapers + API Bitrix</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                                    <div>
                                        <div className="text-sm font-semibold text-slate-900">Sem 3-4</div>
                                        <div className="text-xs text-slate-600">Matchmaking engine + testes</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                                    <div>
                                        <div className="text-sm font-semibold text-slate-900">Sem 5-6</div>
                                        <div className="text-xs text-slate-600">Dashboard + notificações</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-emerald-600 rounded-full mt-1.5 flex-shrink-0"></div>
                                    <div>
                                        <div className="text-sm font-semibold text-slate-900">Sem 7-8</div>
                                        <div className="text-xs text-slate-600">Go-live + treino</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Professional Timeline */}
                        <div className="border-2 border-blue-600 rounded-xl p-6 bg-blue-50">
                            <div className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-sm font-bold text-white">P</div>
                                Professional - 12 semanas
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                                    <div>
                                        <div className="text-sm font-semibold text-slate-900">Sem 1-4</div>
                                        <div className="text-xs text-slate-600">TUDO do Starter</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                                    <div>
                                        <div className="text-sm font-semibold text-slate-900">Sem 5-8</div>
                                        <div className="text-xs text-slate-600">RAG setup + 291 docs</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                                    <div>
                                        <div className="text-sm font-semibold text-slate-900">Sem 9-10</div>
                                        <div className="text-xs text-slate-600">Write-back Bitrix</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-emerald-600 rounded-full mt-1.5 flex-shrink-0"></div>
                                    <div>
                                        <div className="text-sm font-semibold text-slate-900">Sem 11-12</div>
                                        <div className="text-xs text-slate-600">Produção completa</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Premium Timeline */}
                        <div className="border border-slate-300 rounded-xl p-6 bg-slate-50">
                            <div className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center text-sm font-bold text-white">P+</div>
                                Premium - 20 semanas
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                                    <div>
                                        <div className="text-sm font-semibold text-slate-900">Sem 1-12</div>
                                        <div className="text-xs text-slate-600">TUDO do Professional</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                    <div>
                                        <div className="text-sm font-semibold text-slate-900">Sem 13-16</div>
                                        <div className="text-xs text-slate-600">AI Critic + Drip emails</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                    <div>
                                        <div className="text-sm font-semibold text-slate-900">Sem 17-20</div>
                                        <div className="text-xs text-slate-600">Post-Award + refinamentos</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-slate-400 rounded-full mt-1.5 flex-shrink-0"></div>
                                    <div>
                                        <div className="text-sm font-semibold text-slate-600">Q2-Q3</div>
                                        <div className="text-xs text-slate-500">Grant GPT + Auto-Web (roadmap)</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SLIDE 8: ROI Calculator */}
                <section className="min-h-[80vh] flex flex-col justify-center border-b border-slate-100 mb-20 py-20">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-900 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                            <TrendingUp className="w-4 h-4" />
                            RETORNO
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                            Análise de ROI
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Starter ROI */}
                        <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">
                            <div className="text-sm font-semibold text-slate-500 mb-2">STARTER</div>
                            <div className="text-2xl font-bold text-slate-900 mb-4">€12.200</div>
                            <div className="text-xs text-slate-500 mb-6">Investimento 1º ano</div>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Se fechar 1 projeto/mês</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Custo por projeto</span>
                                    <span className="font-bold text-slate-900">€1.016</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Valor médio projeto</span>
                                    <span className="font-bold text-emerald-600">€5.000</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-200">
                                <div className="text-3xl font-bold text-emerald-600">391%</div>
                                <div className="text-xs text-slate-500">ROI no primeiro ano</div>
                            </div>
                        </div>

                        {/* Professional ROI */}
                        <div className="bg-blue-600 text-white rounded-xl p-6 text-center">
                            <div className="text-sm font-semibold text-blue-200 mb-2">PROFESSIONAL</div>
                            <div className="text-2xl font-bold text-white mb-4">€17.100</div>
                            <div className="text-xs text-blue-200 mb-6">Investimento 1º ano</div>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-blue-100">Se fechar 2 projetos/mês</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-blue-100">Custo por projeto</span>
                                    <span className="font-bold text-white">€712</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-blue-100">Valor médio projeto</span>
                                    <span className="font-bold text-emerald-400">€5.000</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-blue-500">
                                <div className="text-3xl font-bold text-emerald-400">600%</div>
                                <div className="text-xs text-blue-200">ROI no primeiro ano</div>
                            </div>
                        </div>

                        {/* Premium ROI */}
                        <div className="bg-slate-800 text-white rounded-xl p-6 text-center">
                            <div className="text-sm font-semibold text-slate-400 mb-2">PREMIUM</div>
                            <div className="text-2xl font-bold text-white mb-4">€23.000</div>
                            <div className="text-xs text-slate-400 mb-6">Investimento 1º ano</div>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-300">Se fechar 3 projetos/mês</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-300">Custo por projeto</span>
                                    <span className="font-bold text-white">€639</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-300">Valor médio projeto</span>
                                    <span className="font-bold text-emerald-400">€5.000</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-600">
                                <div className="text-3xl font-bold text-emerald-400">682%</div>
                                <div className="text-xs text-slate-400">ROI no primeiro ano</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SLIDE 9: Why Now */}
                <section className="min-h-[80vh] flex flex-col justify-center border-b border-slate-100 mb-20 py-20">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-red-50 text-red-900 px-4 py-2 rounded-full text-sm font-semibold mb-8">
                                <TrendingUp className="w-4 h-4" />
                                URGÊNCIA
                            </div>

                            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-8">
                                Porquê<br />
                                <span className="text-red-600">começar em 2026?</span>
                            </h2>

                            <div className="space-y-6">
                                <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl">
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                                        PT2030 entra em fase acelerada
                                    </h3>
                                    <p className="text-slate-600">
                                        2026-2027 serão os anos com mais avisos e prazos mais apertados. Quem tiver a melhor tecnologia ganha.
                                    </p>
                                </div>

                                <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-xl">
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                                        Vantagem competitiva é temporal
                                    </h3>
                                    <p className="text-slate-600">
                                        Outras consultoras estão a automatizar. Ser o primeiro dá vantagem duradoura no mercado.
                                    </p>
                                </div>

                                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl">
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                                        ROI imediato com Professional
                                    </h3>
                                    <p className="text-slate-600">
                                        Em 10-12 semanas tem o sistema a gerar leads qualificados. Payback no primeiro ano.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-12 text-white">
                                <div className="text-center">
                                    <div className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">
                                        Janela de Oportunidade
                                    </div>

                                    <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden mb-8">
                                        <div className="absolute left-0 top-0 h-full w-3/4 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"></div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8 mb-8">
                                        <div>
                                            <div className="text-4xl font-bold text-white mb-2">75%</div>
                                            <div className="text-sm text-slate-400">Janela ocupada</div>
                                        </div>
                                        <div>
                                            <div className="text-4xl font-bold text-emerald-400 mb-2">2026</div>
                                            <div className="text-sm text-slate-400">Ano crítico</div>
                                        </div>
                                    </div>

                                    <div className="bg-white/10 rounded-xl p-6">
                                        <p className="text-lg leading-relaxed text-slate-200">
                                            "A primeira consultora a dominar IA em fundos comunitários vai dominar o mercado nos próximos 5 anos."
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SLIDE 10: CTA */}
                <section className="min-h-[70vh] flex flex-col justify-center py-20">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-900 px-4 py-2 rounded-full text-sm font-semibold mb-8">
                            <Zap className="w-4 h-4" />
                            PRÓXIMO PASSO
                        </div>

                        <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-8">
                            Pronto para transformar<br />
                            <span className="text-blue-600">a sua consultoria?</span>
                        </h2>

                        <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
                            Agende uma demonstração e veja o ConsultancyOS em ação. Sem compromisso, sem sales pitch - apenas código funcional.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg h-auto">
                                Agendar Demo
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>

                            <Link href="/dashboard">
                                <Button size="lg" variant="outline" className="px-8 py-6 text-lg h-auto border-2">
                                    Ver Dashboard
                                </Button>
                            </Link>
                        </div>

                        {/* Tier Recommendation */}
                        <div className="bg-blue-50 rounded-2xl p-8 max-w-2xl mx-auto">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Não sabe qual tier escolher?</h3>
                            <div className="space-y-3 text-sm text-left">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                                    <span className="text-slate-700"><strong>Starter:</strong> Quer automatizar o scraping e matching básico</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
                                    <span className="text-slate-700"><strong>Professional:</strong> Quer RAG para propostas e sync completo</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
                                    <span className="text-slate-700"><strong>Premium:</strong> Quer dominar com features avançadas</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-slate-200 pt-12 text-center">
                    <div className="flex justify-center items-center gap-2 mb-6">
                        <ShieldCheck className="w-5 h-5 text-amber-600" />
                        <span className="text-sm font-semibold text-amber-700">CONFIDENCIAL</span>
                    </div>
                    <p className="text-slate-400 text-sm mb-2">
                        Preparado exclusivamente para TA Consulting | Janeiro 2026
                    </p>
                    <p className="text-slate-300 text-xs">
                        TA Consulting Platform © 2026
                    </p>
                </footer>
            </main>
        </div>
    );
}
