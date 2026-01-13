'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Check, ShieldCheck, TrendingUp, Database, Zap, Clock, BarChart3, Target, Globe, Layers, ArrowDownRight } from 'lucide-react';
import Link from 'next/link';

export default function ApresentacaoV1() {
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
                {/* SLIDE 1: Hero - Value Proposition */}
                <section className="min-h-[85vh] flex flex-col justify-center border-b border-slate-100 mb-20">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-900 px-4 py-2 rounded-full text-sm font-semibold">
                                <Zap className="w-4 h-4" />
                                Janeiro 2026
                            </div>

                            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 leading-[1.1]">
                                Bitrix<span className="text-blue-600">Enhancer</span>
                            </h1>

                            <p className="text-2xl md:text-3xl text-slate-600 leading-relaxed font-medium">
                                A camada de IA que transforma o seu CRM em máquina de vendas automatizada
                            </p>

                            <div className="space-y-4 pt-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Check className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-lg text-slate-700">Sem substituir o seu Bitrix24</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Check className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-lg text-slate-700">Funcionalidades comprovadas (não vaporware)</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <TrendingUp className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-lg text-slate-700">ROI em 8 semanas</span>
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
                                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                                <Database className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-900">Bitrix24 CRM</div>
                                                <div className="text-xs text-slate-500">24.000 contactos</div>
                                            </div>
                                        </div>
                                        <ArrowDownRight className="w-5 h-5 text-blue-600" />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                                <Layers className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-900">AI Layer</div>
                                                <div className="text-xs text-slate-500">Análise & Matchmaking</div>
                                            </div>
                                        </div>
                                        <ArrowDownRight className="w-5 h-5 text-emerald-600" />
                                    </div>

                                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-xl shadow-lg">
                                        <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                                            <TrendingUp className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-white">Leads Qualificados</div>
                                            <div className="text-xs text-blue-100">Prontos para venda</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating badge */}
                            <div className="absolute -bottom-6 -right-6 bg-emerald-600 text-white px-6 py-4 rounded-xl shadow-xl">
                                <div className="text-3xl font-bold">8</div>
                                <div className="text-xs uppercase tracking-wider opacity-90">semanas</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SLIDE 2: Problem Statement - Dores Reais */}
                <section className="min-h-[80vh] flex flex-col justify-center border-b border-slate-100 mb-20 py-20">
                    <div className="grid lg:grid-cols-2 gap-16">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-red-50 text-red-900 px-4 py-2 rounded-full text-sm font-semibold mb-8">
                                <Target className="w-4 h-4" />
                                O PROBLEMA
                            </div>

                            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-8">
                                O seu CRM tem dados,<br />
                                <span className="text-slate-400">mas não gera receita</span>
                            </h2>
                        </div>

                        <div className="space-y-6">
                            {/* Pain Point 1 */}
                            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl">
                                <h3 className="text-lg font-bold text-slate-900 mb-2">
                                    "Tenho 24.000 contactos, mas não sei quais vender"
                                </h3>
                                <p className="text-slate-600">
                                    Manualmente é impossível cruzar elegibilidade de fundos com a base de dados. Perdem-se oportunidades diariamente.
                                </p>
                            </div>

                            {/* Pain Point 2 */}
                            <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-xl">
                                <h3 className="text-lg font-bold text-slate-900 mb-2">
                                    "A minha equipa perde tempo a qualificar leads manualmente"
                                </h3>
                                <p className="text-slate-600">
                                    Consultores a fazer trabalho administrativo em vez de vender. Custo de oportunidade enorme.
                                </p>
                            </div>

                            {/* Pain Point 3 */}
                            <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-r-xl">
                                <h3 className="text-lg font-bold text-slate-900 mb-2">
                                    "Novos avisos de fundos abrem e eu só sei dias depois"
                                </h3>
                                <p className="text-slate-600">
                                    Sem vigilância automatizada, perdem-se os primeiros dias críticos de cada aviso. Concorrência mais rápida ganha.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SLIDE 3: Solution - 3 Pilares */}
                <section className="min-h-[80vh] flex flex-col justify-center border-b border-slate-100 mb-20 py-20">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-900 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                            <Layers className="w-4 h-4" />
                            A SOLUÇÃO
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                            3 Pilares Comprovados
                        </h2>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                            Não é uma nova plataforma. É uma camada de inteligência sobre o Bitrix que já têm.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Pilar 1 */}
                        <div className="group bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-xl hover:border-blue-200 transition-all">
                            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Database className="w-7 h-7 text-blue-600" />
                            </div>
                            <div className="text-sm font-bold text-blue-600 mb-2">01</div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">Deep Sync</h3>
                            <p className="text-slate-600 leading-relaxed mb-6">
                                Conectamos ao Bitrix24 e enriquecemos cada contacto com dados de elegibilidade em tempo real.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-2 text-sm text-slate-700">
                                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                    Sync bidirecional API
                                </li>
                                <li className="flex items-center gap-2 text-sm text-slate-700">
                                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                    Enriquecimento NIF/CAE
                                </li>
                                <li className="flex items-center gap-2 text-sm text-slate-700">
                                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                    Histórico preservado
                                </li>
                            </ul>
                        </div>

                        {/* Pilar 2 */}
                        <div className="group bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-xl hover:border-emerald-200 transition-all">
                            <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Globe className="w-7 h-7 text-emerald-600" />
                            </div>
                            <div className="text-sm font-bold text-emerald-600 mb-2">02</div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">Portal Scraper</h3>
                            <p className="text-slate-600 leading-relaxed mb-6">
                                Monitorização 24/7 de 6 portais de fundos. Alertas apenas quando há match comercial real.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-2 text-sm text-slate-700">
                                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                    PT2030 + PRR + República
                                </li>
                                <li className="flex items-center gap-2 text-sm text-slate-700">
                                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                    Matching automático
                                </li>
                                <li className="flex items-center gap-2 text-sm text-slate-700">
                                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                    Alertas prioritários
                                </li>
                            </ul>
                        </div>

                        {/* Pilar 3 */}
                        <div className="group bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-xl hover:border-violet-200 transition-all">
                            <div className="w-14 h-14 bg-violet-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Zap className="w-7 h-7 text-violet-600" />
                            </div>
                            <div className="text-sm font-bold text-violet-600 mb-2">03</div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">Matchmaker AI</h3>
                            <p className="text-slate-600 leading-relaxed mb-6">
                                Motor de RAG que cruza critérios de elegibilidade com a base de clientes instantaneamente.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-2 text-sm text-slate-700">
                                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                    Análise semântica
                                </li>
                                <li className="flex items-center gap-2 text-sm text-slate-700">
                                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                    Score de elegibilidade
                                </li>
                                <li className="flex items-center gap-2 text-sm text-slate-700">
                                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                    Lista de ex-clientes
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-12 text-center">
                        <Link href="/diagnostico-fundos" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold">
                            Ver demo do Matchmaker AI
                            <ArrowRight className="w-4 h-4" />
                        </Link>
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
                            Do Aviso à Venda em 4 Passos
                        </h2>
                    </div>

                    <div className="relative">
                        {/* Connection line */}
                        <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-emerald-200 to-violet-200 -translate-y-1/2 z-0"></div>

                        <div className="grid lg:grid-cols-4 gap-8 relative z-10">
                            {/* Step 1 */}
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

                            {/* Step 2 */}
                            <div className="text-center">
                                <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                    <Database className="w-10 h-10 text-white" />
                                </div>
                                <div className="text-sm font-bold text-slate-400 mb-2">PASSO 2</div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">Análise IA</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    Matchmaker AI processa critérios e compara com 24k contactos
                                </p>
                            </div>

                            {/* Step 3 */}
                            <div className="text-center">
                                <div className="w-20 h-20 bg-violet-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                    <Target className="w-10 h-10 text-white" />
                                </div>
                                <div className="text-sm font-bold text-slate-400 mb-2">PASSO 3</div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">Levs Qualificados</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    Sistema gera lista de empresas elegíveis com score de confiança
                                </p>
                            </div>

                            {/* Step 4 */}
                            <div className="text-center">
                                <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                    <TrendingUp className="w-10 h-10 text-white" />
                                </div>
                                <div className="text-sm font-bold text-slate-400 mb-2">PASSO 4</div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">Venda</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    Consultor recebe lista pronta e começa a contactar imediatamente
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Visual diagram of data flow */}
                    <div className="mt-16 bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-8 border border-slate-200">
                        <div className="flex items-center justify-center gap-4 md:gap-8 flex-wrap">
                            <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-lg border border-slate-200 shadow-sm">
                                <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center">
                                    <Globe className="w-4 h-4 text-slate-600" />
                                </div>
                                <span className="text-sm font-medium">Portais</span>
                            </div>

                            <ArrowRight className="w-6 h-6 text-blue-600" />

                            <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-lg border border-blue-200 shadow-sm">
                                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                                    <Zap className="w-4 h-4 text-blue-600" />
                                </div>
                                <span className="text-sm font-medium">Scraper</span>
                            </div>

                            <ArrowRight className="w-6 h-6 text-emerald-600" />

                            <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-lg border border-emerald-200 shadow-sm">
                                <div className="w-8 h-8 bg-emerald-100 rounded flex items-center justify-center">
                                    <Layers className="w-4 h-4 text-emerald-600" />
                                </div>
                                <span className="text-sm font-medium">AI Layer</span>
                            </div>

                            <ArrowRight className="w-6 h-6 text-violet-600" />

                            <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-lg border border-violet-200 shadow-sm">
                                <div className="w-8 h-8 bg-violet-100 rounded flex items-center justify-center">
                                    <Database className="w-4 h-4 text-violet-600" />
                                </div>
                                <span className="text-sm font-medium">Bitrix</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SLIDE 5: Features - O que funciona */}
                <section className="min-h-[80vh] flex flex-col justify-center border-b border-slate-100 mb-20 py-20">
                    <div className="grid lg:grid-cols-2 gap-16">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-900 px-4 py-2 rounded-full text-sm font-semibold mb-8">
                                <Check className="w-4 h-4" />
                                FUNCIONALIDADES
                            </div>

                            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-8">
                                O que já<br />
                                <span className="text-blue-600">funciona hoje</span>
                            </h2>

                            <p className="text-lg text-slate-600 leading-relaxed mb-8">
                                Sem promessas futuristas. Estas são as capacidades operacionais e comprovadas.
                            </p>

                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <Check className="w-5 h-5 text-emerald-600" />
                                    <span className="font-bold text-emerald-900">Zero Vaporware</span>
                                </div>
                                <p className="text-sm text-emerald-800">
                                    Tudo o que apresentamos está implementado e pronto para usar. Não vendemos promessas, entregamos resultados.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* Feature 1 */}
                            <div className="bg-white border border-slate-200 rounded-xl p-6 hover:border-blue-300 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Database className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">Bitrix Sincronização</h3>
                                        <p className="text-slate-600 text-sm leading-relaxed">
                                            Leitura e escrita via API. Preservamos todo o histórico e enriquecemos contactos com elegibilidade.
                                        </p>
                                        <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                                            <Check className="w-3 h-3" />
                                            Operacional
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Feature 2 */}
                            <div className="bg-white border border-slate-200 rounded-xl p-6 hover:border-emerald-300 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Globe className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">Multi-Portal Scraper</h3>
                                        <p className="text-slate-600 text-sm leading-relaxed">
                                            Monitorização de PT2030, PRR e Diário da República. Parsing estruturado e normalizado.
                                        </p>
                                        <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                                            <Check className="w-3 h-3" />
                                            Operacional
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Feature 3 */}
                            <div className="bg-white border border-slate-200 rounded-xl p-6 hover:border-violet-300 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Target className="w-6 h-6 text-violet-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">RAG Matchmaker</h3>
                                        <p className="text-slate-600 text-sm leading-relaxed">
                                            Motor semântico que entende critérios de elegibilidade e cruza com base de clientes.
                                        </p>
                                        <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                                            <Check className="w-3 h-3" />
                                            Operacional
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Feature 4 */}
                            <div className="bg-white border border-slate-200 rounded-xl p-6 hover:border-amber-300 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <BarChart3 className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">Intelligence Dashboard</h3>
                                        <p className="text-slate-600 text-sm leading-relaxed">
                                            Visualização de avisos, matches e oportunidades em tempo real.
                                        </p>
                                        <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                                            <Check className="w-3 h-3" />
                                            Operacional
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SLIDE 6: Pricing */}
                <section className="min-h-[80vh] flex flex-col justify-center border-b border-slate-100 mb-20 py-20">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-900 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                            <TrendingUp className="w-4 h-4" />
                            INVESTIMENTO
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                            Modelo Transparente
                        </h2>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            Sem custos escondidos. Sem surpresas. Saber exatamente o que paga e o que recebe.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {/* Setup */}
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>

                            <div className="relative">
                                <div className="text-sm font-semibold text-blue-400 mb-2 uppercase tracking-wider">Setup Único</div>
                                <div className="flex items-baseline gap-2 mb-6">
                                    <span className="text-6xl font-bold">€5.000</span>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="flex items-start gap-3">
                                        <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <div className="font-semibold">Implementação completa</div>
                                            <div className="text-sm text-slate-400">Conexão Bitrix + setup Scraper + AI Layer</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <div className="font-semibold">Migração de dados</div>
                                            <div className="text-sm text-slate-400">Enriquecimento dos 24k contactos</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <div className="font-semibold">Treino da equipa</div>
                                            <div className="text-sm text-slate-400">Sessão presencial de onboarding</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <div className="font-semibold">8 semanas de acompanhamento</div>
                                            <div className="text-sm text-slate-400">Até ao MVP funcional</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-700">
                                    <div className="text-xs text-slate-400">Pagamento único</div>
                                </div>
                            </div>
                        </div>

                        {/* Retainer */}
                        <div className="bg-white border-2 border-blue-600 rounded-2xl p-8 relative">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                                RECOMENDADO
                            </div>

                            <div className="text-sm font-semibold text-blue-600 mb-2 uppercase tracking-wider">Retainer Mensal</div>
                            <div className="flex items-baseline gap-2 mb-6">
                                <span className="text-6xl font-bold text-slate-900">€600</span>
                                <span className="text-slate-500">/mês</span>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <div className="font-semibold text-slate-900">10h banco de horas</div>
                                        <div className="text-sm text-slate-600">Desenvolvimento de features</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <div className="font-semibold text-slate-900">1 visita presencial/mês</div>
                                        <div className="text-sm text-slate-600">Estratégia e roadmap</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <div className="font-semibold text-slate-900">Manutenção incluída</div>
                                        <div className="text-sm text-slate-600">Servidores, scraping, updates</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <div className="font-semibold text-slate-900">Suporte prioritário</div>
                                        <div className="text-sm text-slate-600">Resposta em 24h</div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-200">
                                <div className="text-xs text-slate-500">Sem compromisso de longo prazo</div>
                            </div>
                        </div>
                    </div>

                    {/* ROI Calculator */}
                    <div className="mt-16 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl p-8 border border-emerald-200">
                        <div className="grid md:grid-cols-3 gap-8 text-center">
                            <div>
                                <div className="text-sm text-slate-600 mb-2">Custo anual total</div>
                                <div className="text-3xl font-bold text-slate-900">€12.200</div>
                                <div className="text-xs text-slate-500 mt-1">Setup + 12 meses</div>
                            </div>
                            <div>
                                <div className="text-sm text-slate-600 mb-2">Se fechar 1 projeto/mês</div>
                                <div className="text-3xl font-bold text-emerald-600">€1.016</div>
                                <div className="text-xs text-slate-500 mt-1">Custo por projeto</div>
                            </div>
                            <div>
                                <div className="text-sm text-slate-600 mb-2">ROI se valor médio = €5k</div>
                                <div className="text-3xl font-bold text-blue-600">410%</div>
                                <div className="text-xs text-slate-500 mt-1">Retorno no primeiro ano</div>
                            </div>
                        </div>
                    </div>

                    <p className="mt-8 text-center text-sm text-slate-500">
                        * Valores acrescem IVA à taxa legal em vigor
                    </p>
                </section>

                {/* SLIDE 7: Timeline */}
                <section className="min-h-[80vh] flex flex-col justify-center border-b border-slate-100 mb-20 py-20">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-900 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                            <Clock className="w-4 h-4" />
                            TIMELINE
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                            8 Semanas para MVP
                        </h2>
                        <h3 className="text-xl text-slate-600 max-w-2xl mx-auto">
                            Do contrato ao primeiro lead qualificado gerado pelo sistema
                        </h3>
                    </div>

                    <div className="relative max-w-4xl mx-auto">
                        {/* Timeline line */}
                        <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 via-emerald-600 to-violet-600"></div>

                        <div className="space-y-12">
                            {/* Week 1-2 */}
                            <div className="relative flex items-center md:justify-center">
                                <div className="absolute left-8 md:left-1/2 w-4 h-4 bg-blue-600 rounded-full -translate-x-1/2 border-4 border-white shadow-lg"></div>
                                <div className="ml-16 md:ml-0 md:w-1/2 md:pr-12 md:text-right">
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                                        <div className="text-sm font-bold text-blue-600 mb-1">SEMANA 1-2</div>
                                        <h4 className="text-xl font-bold text-slate-900 mb-3">Setup & Conexão</h4>
                                        <ul className="text-sm text-slate-600 space-y-1">
                                            <li>• Acesso API Bitrix24</li>
                                            <li>• Configuração Scrapers</li>
                                            <li>• Setup infraestrutura cloud</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Week 3-4 */}
                            <div className="relative flex items-center md:justify-center">
                                <div className="absolute left-8 md:left-1/2 w-4 h-4 bg-emerald-600 rounded-full -translate-x-1/2 border-4 border-white shadow-lg"></div>
                                <div className="ml-16 md:ml-0 md:w-1/2 md:pl-12">
                                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
                                        <div className="text-sm font-bold text-emerald-600 mb-1">SEMANA 3-4</div>
                                        <h4 className="text-xl font-bold text-slate-900 mb-3">Enriquecimento</h4>
                                        <ul className="text-sm text-slate-600 space-y-1">
                                            <li>• Sincronização inicial 24k contactos</li>
                                            <li>• Treino modelo AI</li>
                                            <li>• Testes de matching</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Week 5-6 */}
                            <div className="relative flex items-center md:justify-center">
                                <div className="absolute left-8 md:left-1/2 w-4 h-4 bg-violet-600 rounded-full -translate-x-1/2 border-4 border-white shadow-lg"></div>
                                <div className="ml-16 md:ml-0 md:w-1/2 md:pr-12 md:text-right">
                                    <div className="bg-violet-50 border border-violet-200 rounded-xl p-6">
                                        <div className="text-sm font-bold text-violet-600 mb-1">SEMANA 5-6</div>
                                        <h4 className="text-xl font-bold text-slate-900 mb-3">Integração</h4>
                                        <ul className="text-sm text-slate-600 space-y-1">
                                            <li>• Dashboard personalizado</li>
                                            <li>• Workflows de notificação</li>
                                            <li>• Treino da equipa</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Week 7-8 */}
                            <div className="relative flex items-center md:justify-center">
                                <div className="absolute left-8 md:left-1/2 w-4 h-4 bg-amber-500 rounded-full -translate-x-1/2 border-4 border-white shadow-lg"></div>
                                <div className="ml-16 md:ml-0 md:w-1/2 md:pl-12">
                                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-300 rounded-xl p-6 shadow-lg">
                                        <div className="text-sm font-bold text-amber-700 mb-1">SEMANA 7-8</div>
                                        <h4 className="text-xl font-bold text-slate-900 mb-3">Go Live</h4>
                                        <ul className="text-sm text-slate-600 space-y-1">
                                            <li>• Produção ativa</li>
                                            <li>• Primeiras notificações reais</li>
                                            <li>• Ajustes finos</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-16 text-center">
                        <div className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-full font-semibold">
                            <Check className="w-5 h-5" />
                            MVP funcional em 2 meses
                        </div>
                    </div>
                </section>

                {/* SLIDE 8: Why Now */}
                <section className="min-h-[80vh] flex flex-col justify-center border-b border-slate-100 mb-20 py-20">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-red-50 text-red-900 px-4 py-2 rounded-full text-sm font-semibold mb-8">
                                <TrendingUp className="w-4 h-4" />
                                URGÊNCIA
                            </div>

                            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-8">
                                Porquê<br />
                                <span className="text-red-600">agora?</span>
                            </h2>

                            <div className="space-y-6">
                                <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl">
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                                        PT2030 está a acelerar
                                    </h3>
                                    <p className="text-slate-600">
                                        2026 vai trazer mais avisos e prazos mais apertados. Quem tiver a melhor tecnologia ganha.
                                    </p>
                                </div>

                                <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-xl">
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                                        Concorrência não dorme
                                    </h3>
                                    <p className="text-slate-600">
                                        Outras consultoras estão a automatizar. A vantagem competitiva é temporal.
                                    </p>
                                </div>

                                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl">
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                                        ROI imediato
                                    </h3>
                                    <p className="text-slate-600">
                                        Em 8 semanas tem o sistema a gerar leads. O payback acontece no primeiro ano.
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
                                            <div className="text-sm text-slate-400">Janela fechada</div>
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

                {/* SLIDE 9: CTA */}
                <section className="min-h-[70vh] flex flex-col justify-center py-20">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-900 px-4 py-2 rounded-full text-sm font-semibold mb-8">
                            <Zap className="w-4 h-4" />
                            PRÓXIMO PASSO
                        </div>

                        <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-8">
                            Pronto para transformar<br />
                            <span className="text-blue-600">o seu CRM?</span>
                        </h2>

                        <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
                            Agende uma demonstração e veja o Bitrix Enhancer em ação. Sem compromisso, sem sales pitch - apenas código funcional.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
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

                        <div className="mt-16 grid md:grid-cols-3 gap-8 text-left">
                            <div className="bg-slate-50 rounded-xl p-6">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                    <Clock className="w-5 h-5 text-blue-600" />
                                </div>
                                <h4 className="font-bold text-slate-900 mb-2">45 min</h4>
                                <p className="text-sm text-slate-600">Demo focada no seu caso de uso</p>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-6">
                                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                                    <Check className="w-5 h-5 text-emerald-600" />
                                </div>
                                <h4 className="font-bold text-slate-900 mb-2">Zero compromisso</h4>
                                <p className="text-sm text-slate-600">Sem pressão, apenas valor</p>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-6">
                                <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center mb-4">
                                    <Database className="w-5 h-5 text-violet-600" />
                                </div>
                                <h4 className="font-bold text-slate-900 mb-2">Dados reais</h4>
                                <p className="text-sm text-slate-600">Testamos com a sua base</p>
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
