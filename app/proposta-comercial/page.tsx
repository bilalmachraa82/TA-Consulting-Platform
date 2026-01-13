import { Button } from '@/components/ui/button';
import { ArrowRight, Check, ExternalLink, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
    title: 'Proposta Estratégica | TA Consulting',
    robots: 'noindex, nofollow',
};

export default function CommercialProposal() {
    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-slate-900 selection:text-white pb-32">
            {/* Confidential Header */}
            <div className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-sm border-b border-slate-200 z-50">
                <div className="max-w-5xl mx-auto px-8 py-4 flex justify-between items-center text-xs uppercase tracking-widest text-slate-500">
                    <span>TA Consulting Intelligence</span>
                    <span className="flex items-center gap-1 text-amber-600 font-bold">
                        <ShieldCheck className="w-3 h-3" />
                        Confidencial
                    </span>
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-8 pt-32">
                {/* Title Section */}
                <header className="mb-24 border-b border-slate-900 pb-12">
                    <p className="text-slate-500 text-sm tracking-widest mb-4 uppercase">
                        Preparado para: Fernando [Apelido] | Janeiro 2026
                    </p>
                    <h1 className="text-5xl md:text-7xl font-serif font-medium text-slate-900 leading-tight mb-8">
                        Ativação Estratégica <br />
                        <span className="text-slate-500 italic">24k Enterprise Database</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-600 font-serif leading-relaxed max-w-3xl">
                        Uma proposta para transformar 24.000 registos estáticos num ativo de inteligência competitiva, gerando novas receitas através de automação e hiper-segmentação.
                    </p>
                </header>

                {/* Executive Summary */}
                <section className="mb-24 grid md:grid-cols-12 gap-12">
                    <div className="md:col-span-4">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 border-t border-slate-200 pt-4">
                            Sumário Executivo
                        </h2>
                    </div>
                    <div className="md:col-span-8 space-y-6 text-lg leading-relaxed text-slate-800">
                        <p>
                            A TA Consulting detém um ativo subaproveitado: uma base de dados proprietária de 24.000 empresas.
                            Atualmente, a prospeção depende de esforço manual e reativo.
                        </p>
                        <p>
                            A nossa solução propõe a implementação de uma camada de <strong>Inteligência Artificial</strong> sobre o vosso CRM (Bitrix24), permitindo:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-slate-700">
                            <li><strong>Reativação Automática:</strong> Identificar ex-clientes elegíveis para novos fundos (PT2030, PRR).</li>
                            <li><strong>Prospeção "Zero-Touch":</strong> Captura e qualificação de leads sem intervenção humana inicial.</li>
                            <li><strong>Vigilância de Mercado:</strong> Dashboards que cruzam diariamente avisos abertos com o CAE/Região dos vossos clientes.</li>
                        </ul>
                    </div>
                </section>

                {/* The Architecture (Text-Based) */}
                <section className="mb-24">
                    <div className="bg-slate-50 p-12 border border-slate-200 rounded-none">
                        <h3 className="font-serif text-3xl mb-8">Arquitetura da Solução</h3>

                        <div className="grid md:grid-cols-3 gap-12">
                            <div className="space-y-4">
                                <div className="text-4xl font-serif text-slate-300">01</div>
                                <h4 className="font-bold uppercase tracking-wide text-sm">Deep Sync (Bitrix)</h4>
                                <p className="text-slate-600">
                                    Lemos e sincronizamos a vossa base atual. Cada NIF é enriquecido com dados de elegibilidade em tempo real.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="text-4xl font-serif text-slate-300">02</div>
                                <h4 className="font-bold uppercase tracking-wide text-sm">Portal Scraper</h4>
                                <p className="text-slate-600">
                                    Monitorizamos 6 portais de fundos diariamente. Quando abre um aviso, o sistema sabe exatamente a quem vender.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="text-4xl font-serif text-slate-300">03</div>
                                <h4 className="font-bold uppercase tracking-wide text-sm">Autonomous Agent</h4>
                                <p className="text-slate-600">
                                    Um consultor AI que pré-qualifica leads e agenda reuniões apenas com decisores interessados.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Investment Table */}
                <section className="mb-24">
                    <h2 className="text-4xl font-serif mb-12">Protocolo de Investimento</h2>

                    {/* Tabela de Preço */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden mb-12">
                        <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
                            <span className="font-semibold text-slate-700">Descrição do Investimento</span>
                            <span className="font-semibold text-slate-700">Valor</span>
                        </div>

                        <div className="p-6 bg-white space-y-6">
                            {/* Linha Implementação */}
                            <div className="flex justify-between items-start border-b border-slate-100 pb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Implementação Global v2.0</h3>
                                    <p className="text-slate-500 mt-1 max-w-lg">
                                        Setup inicial do "Sistema Operativo de Consultoria". Inclui os 5 módulos base (Matchmaking, Bitrix Sync, Funil Conversacional, AI Writer, Website Auto), importação de dados históricos e treino inicial dos modelos.
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-black text-slate-900">€5.000</div>
                                    <div className="text-sm text-slate-400">Pagamento Único</div>
                                </div>
                            </div>

                            {/* Linha Retainer */}
                            <div className="flex justify-between items-start bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <h3 className="text-xl font-bold text-blue-900">Parceria de Evolução Contínua</h3>
                                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">Novo</span>
                                    </div>
                                    <p className="text-blue-700/80 mt-1 max-w-lg text-sm">
                                        Garantia de que a plataforma não estagna.
                                    </p>
                                    <ul className="mt-3 space-y-2">
                                        <li className="flex items-center text-sm text-blue-800">
                                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                                            1 Visita Presencial Mensal (Estratégia & Acompanhamento)
                                        </li>
                                        <li className="flex items-center text-sm text-blue-800">
                                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                                            10h Banco de Horas (Desenvolvimento de novas features)
                                        </li>
                                        <li className="flex items-center text-sm text-blue-800">
                                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                                            Manutenção de Servidores & Scraper (Custos incluídos)
                                        </li>
                                    </ul>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-black text-blue-900">€600</div>
                                    <div className="text-sm text-blue-600 font-medium"> Mensal (Retainer)</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className="mt-4 text-xs text-slate-400 uppercase tracking-widest text-right">
                        * Valores acrescem IVA à taxa legal em vigor.
                    </p>
                </section>

                {/* Capability Validation (Promise vs Proof) */}
                < section className="mb-32" >
                    <h2 className="text-2xl font-serif mb-12 border-b border-black pb-4">
                        Validação de Capacidades (Prova de Conceito)
                    </h2>

                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Capability 1: Matching */}
                        <div className="space-y-4">
                            <div className="h-px w-12 bg-amber-600 mb-6"></div>
                            <h3 className="text-xl font-bold text-slate-900">
                                1. O Problema de Matching
                            </h3>
                            <p className="text-slate-600 leading-relaxed min-h-[80px]">
                                <span className="font-serif italic text-slate-500 block mb-2">"Como saber quais das 24k empresas são elegíveis para o Aviso X?"</span>
                                A nossa resposta não é humana, é algorítmica. O sistema cruza NIFs/CAEs com critérios de elegibilidade em tempo real.
                            </p>

                            <Link href="/diagnostico-fundos" className="group flex items-center justify-between border border-slate-200 p-6 mt-4 hover:border-slate-900 transition-all hover:bg-slate-50">
                                <div>
                                    <div className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-1">Live Demo</div>
                                    <div className="font-medium text-slate-900">Simulador de Elegibilidade</div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-amber-600" />
                            </Link>
                        </div>

                        {/* Capability 2: Surveillance */}
                        <div className="space-y-4">
                            <div className="h-px w-12 bg-amber-600 mb-6"></div>
                            <h3 className="text-xl font-bold text-slate-900">
                                2. Vigilância de Mercado
                            </h3>
                            <p className="text-slate-600 leading-relaxed min-h-[80px]">
                                <span className="font-serif italic text-slate-500 block mb-2">"Como monitorizar milhares de avisos sem uma equipa dedicada?"</span>
                                O nosso motor monitoriza PT2030, PRR e Diário da República, alertando apenas quando há match comercial.
                            </p>

                            <Link href="/dashboard" className="group flex items-center justify-between border border-slate-200 p-6 mt-4 hover:border-slate-900 transition-all hover:bg-slate-50">
                                <div>
                                    <div className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-1">Live Demo</div>
                                    <div className="font-medium text-slate-900">Intelligence Dashboard</div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-amber-600" />
                            </Link>
                        </div>
                    </div>
                </section >

                {/* Footer */}
                < footer className="border-t border-slate-200 pt-12 pb-24 text-center" >
                    <p className="font-serif text-2xl italic text-slate-400 mb-8">
                        "Better to sell a heart to someone who already went to the bakery."
                    </p>
                    <div className="inline-block border-b border-slate-900 pb-2 mb-4">
                        <span className="font-bold tracking-widest text-xs uppercase">Aprovado para Execução</span>
                    </div>
                    <p className="text-xs text-slate-400 uppercase tracking-widest">
                        TA Consulting Platform © 2026
                    </p>
                </footer >
            </main >
        </div >
    );
}
