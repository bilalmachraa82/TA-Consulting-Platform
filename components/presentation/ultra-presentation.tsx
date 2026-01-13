"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ChevronRight,
    ChevronLeft,
    Play,
    Database,
    MessageSquare,
    FileText,
    Globe,
    Zap,
    Brain,
    CheckCircle2,
    Lock,
    ArrowRight,
    Search,
    Target,
    Bot,
    Share2,
    BarChart
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// --- Slide Data ---
const slides = [
    {
        id: 'intro',
        title: "TA Consulting Platform",
        subtitle: "Consultancy Operating System (v2.0)",
        type: "hero",
        content: "Transformar dados estáticos em inteligência competitiva ativa.",
    },
    {
        id: 'problem',
        title: "O Ponto de Situação",
        subtitle: "Bitrix Power Users vs Excel Reality",
        type: "split",
        left: {
            title: "O Ativo Adormecido",
            icon: <Database className="w-12 h-12 text-blue-400" />,
            text: "24.000 empresas na vossa base de dados. Atualmente, são apenas registos estáticos à espera de serem contactados manualmente."
        },
        right: {
            title: "A Oportunidade",
            icon: <Zap className="w-12 h-12 text-yellow-400" />,
            text: "Transformar este arquivo num motor de leads ativo que reage automaticamente a cada novo Aviso do Portugal 2030."
        }
    },
    // === MÓDULO 1: CORE (Tiros de Canhão) ===
    {
        id: 'tier-1',
        title: 'Tier 1: The Engine',
        subtitle: 'Infraestrutura Base & Dados',
        content: [
            { icon: <Database className="w-6 h-6 text-blue-400" />, text: 'Bitrix24 Deep Sync (24k Empresas)' },
            { icon: <Search className="w-6 h-6 text-blue-400" />, text: 'Scraping Universal (Portugal 2030, PRR)' },
            { icon: <Target className="w-6 h-6 text-blue-400" />, text: 'Matchmaking Check de Elegibilidade' }
        ],
        image: 'https://cdn.abacus.ai/images/ef252f45-064a-4dd4-a3fd-88a16e7eca05.png',
        type: 'tier',
        price: '€5.000',
        retainer: '€600/mês'
    },

    // === MÓDULO 2: AI (O Consultor Infinito) ===
    {
        id: 'tier-2',
        title: 'Tier 2: The Intelligence',
        subtitle: 'Camada de AI Generativa',
        content: [
            { icon: <Bot className="w-6 h-6 text-green-400" />, text: 'AI Technical Writer (Memórias Descritivas)' },
            { icon: <FileText className="w-6 h-6 text-green-400" />, text: 'Chat Documental (RAG Histórico)' },
            { icon: <Zap className="w-6 h-6 text-green-400" />, text: 'Style Transfer (Tom "TA Consulting")' }
        ],
        image: 'https://cdn.abacus.ai/images/7994875e-28f2-4e86-b4e9-fd1c1c2d8e3a.jpg',
        type: 'tier',
        price: '+€3.500',
        retainer: '(Incluído)'
    },

    // === MÓDULO 3: AUTOMAÇÃO (A Máquina de Vendas) ===
    {
        id: 'tier-3',
        title: "Tier 3: Growth Infrastructure",
        subtitle: "Lead Capture & Client Portal",
        description: "Infraestrutura para captar e qualificar leads automaticamente.",
        price: "+€2.500",
        content: [
            { icon: <Target className="w-6 h-6 text-amber-500" />, text: 'Lead Magnet System (Quiz/Form)' },
            { icon: <FileText className="w-6 h-6 text-amber-500" />, text: 'Portal do Cliente (Docs & Status)' },
            { icon: <Share2 className="w-6 h-6 text-amber-500" />, text: 'Gestão de Leads (CRM Lite)' },
            { icon: <Globe className="w-6 h-6 text-amber-500" />, text: 'Roadmap: LinkedIn Automation (Q3)' },
        ],
        image: 'https://cdn.abacus.ai/images/7676b629-024a-47c5-8f5b-14b85380d8e1.jpg',
        type: 'tier',
        retainer: '(Incluído)'
    },

    // === BENCHMARK (MCKINSEY STYLE) ===
    {
        id: 'benchmark',
        title: 'Análise de Mercado',
        subtitle: 'Comparative Value Analysis',
        type: 'benchmark', // Custom type handled in render
        content: 'Benchmark visual do TCO',
    },

    // === RESUMO DE VALOR (11K) ===
    {
        id: 'summary',
        title: 'Ecossistema Completo',
        subtitle: 'Valor Total do Investimento',
        content: [
            { text: 'Tier 1 (Engine): €5.000', highlight: false },
            { text: 'Tier 2 (Intelligence): €3.500', highlight: false },
            { text: 'Tier 3 (Automation): €2.500', highlight: false },
            { text: 'TOTAL: €11.000', highlight: true }
        ],
        image: 'https://cdn.abacus.ai/images/a3b465f6-4b27-41b7-b85d-1b4ed4dfec26.jpg',
        type: 'summary',
        price: '€11.000'
    },
    {
        id: 'modules-intro',
        title: "Eco-sistema de 5 Módulos",
        subtitle: "Uma solução integrada, não apenas uma ferramenta.",
        type: "list",
        items: [
            { id: 1, title: "Strategic Matchmaking", desc: "O motor de receita recorrente." },
            { id: 2, title: "Bitrix24 Deep Sync", desc: "A verdade única dos dados." },
            { id: 3, title: "Conversational Funnel", desc: "Qualificação progressiva." },
            { id: 4, title: "AI Technical Writer", desc: "Memórias descritivas automáticas." },
            { id: 5, title: "Website Automation", desc: "Atualização automática de avisos." },
        ]
    },
    {
        id: 'module-1',
        title: "Módulo 1: Strategic Matchmaking",
        subtitle: "The Cash Cow Engine",
        type: "feature",
        icon: <Brain className="w-16 h-16 text-indigo-400" />,
        features: [
            "Input: Novos Avisos PT2030 (diário)",
            "Processo: Cruzamento com 24k empresas (CAE, Região)",
            "Output: 'Top 100 Prospects' com raciocínio de match",
            "Ação: Sugestão automática de campanha marketing"
        ]
    },
    {
        id: 'module-2',
        title: "Módulo 2: Bitrix24 Integration",
        subtitle: "Single Source of Truth",
        type: "feature",
        icon: <Database className="w-16 h-16 text-blue-500" />,
        features: [
            "Sincronização Bidirecional em tempo real",
            "Leads do Chatbot entram diretamente no Pipeline",
            "Enriquecimento de dados automático",
            "Awareness: A IA sabe se o cliente já está em proposta"
        ]
    },
    {
        id: 'module-3',
        title: "Módulo 3: Conversational Funnel",
        subtitle: "Give Value First",
        type: "feature",
        icon: <MessageSquare className="w-16 h-16 text-emerald-400" />,
        features: [
            "Substituição de formulários estáticos",
            "Diagnóstico instantâneo pré-contacto",
            "Captura progressiva de dados (NIF só no fim)",
            "Demo disponível hoje"
        ]
    },
    {
        id: 'module-4',
        title: "Módulo 4: AI Technical Writer",
        subtitle: "Style Transfer Technology",
        type: "feature",
        icon: <FileText className="w-16 h-16 text-amber-400" />,
        features: [
            "Treinado em 291 candidaturas históricas da TA",
            "Não escreve 'genérico', escreve como a TA",
            "Gera drafts de Memórias Descritivas em segundos",
            "Reduz tempo de escrita técnica em 70%"
        ]
    },
    {
        id: 'module-5',
        title: "Módulo 5: Website Automation",
        subtitle: "Zero Maintenance",
        type: "feature",
        icon: <Globe className="w-16 h-16 text-cyan-400" />,
        features: [
            "Widget 'Oportunidades Abertas' auto-atualizável",
            "Sync direto com o Scraper de Avisos",
            "Elimina a necessidade de atualização manual do site",
            "SEO Otimizado automaticamente"
        ]
    },
    {
        id: 'commercial',
        title: "Proposta Comercial",
        subtitle: "Partnership Model",
        type: "pricing",
        price: "€5.000",
        description: "Investimento Único (Implementação Global)",
        retainer: {
            amount: "€600",
            period: "/mês",
            features: [
                "1 Visita Presencial Mensal (Estratégia)",
                "10h Banco de Desenvolvimento (Melhorias)",
                "Manutenção de Servidores & Scrapers",
                "Formação contínua da equipa"
            ]
        }
    },
    {
        id: 'demo',
        title: "Demonstração Real",
        subtitle: "Prova de Conceito",
        type: "action",
        actionText: "Iniciar Visita Guiada ao Dashboard",
        link: "/dashboard" // Or /diagnostico-fundos, prioritizing Dashboard as requested implicity
    }
]

// --- Components ---

const SlideHero = ({ slide }: { slide: any }) => (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="bg-blue-600/20 p-6 rounded-full border border-blue-500/30 backdrop-blur-md"
        >
            <Zap className="w-24 h-24 text-blue-400" />
        </motion.div>
        <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-blue-400 tracking-tight"
        >
            {slide.title}
        </motion.h1>
        <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl md:text-3xl text-slate-300 font-light max-w-4xl"
        >
            {slide.content}
        </motion.p>
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-blue-400 font-mono text-sm tracking-[0.2em] uppercase"
        >
            {slide.subtitle}
        </motion.div>
    </div>
)

const SlideSplit = ({ slide }: { slide: any }) => (
    <div className="grid grid-cols-2 gap-16 h-full items-center px-12">
        <div className="space-y-6 p-8 rounded-3xl bg-slate-900/40 border border-slate-800/50 backdrop-blur-sm h-full flex flex-col justify-center">
            <div className="flex items-center space-x-4 mb-4">
                {slide.left.icon}
                <h3 className="text-3xl font-bold text-slate-100">{slide.left.title}</h3>
            </div>
            <p className="text-xl text-slate-400 leading-relaxed">
                {slide.left.text}
            </p>
        </div>
        <div className="space-y-6 p-8 rounded-3xl bg-blue-900/10 border border-blue-500/20 backdrop-blur-sm h-full flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="flex items-center space-x-4 mb-4 relative z-10">
                {slide.right.icon}
                <h3 className="text-3xl font-bold text-white">{slide.right.title}</h3>
            </div>
            <p className="text-xl text-blue-100 leading-relaxed relative z-10">
                {slide.right.text}
            </p>
        </div>
    </div>
)

const SlideList = ({ slide }: { slide: any }) => (
    <div className="h-full flex flex-col justify-center px-24">
        <h2 className="text-5xl font-bold text-white mb-4">{slide.title}</h2>
        <p className="text-2xl text-slate-400 mb-16">{slide.subtitle}</p>
        <div className="grid gap-6">
            {slide.items.map((item: any, idx: number) => (
                <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:bg-slate-700/50 transition-colors"
                >
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xl mr-6">
                        {item.id}
                    </div>
                    <div>
                        <h3 className="text-2xl font-semibold text-white">{item.title}</h3>
                        <p className="text-lg text-slate-400">{item.desc}</p>
                    </div>
                </motion.div>
            ))}
        </div>
    </div>
)

const SlideFeature = ({ slide }: { slide: any }) => (
    <div className="h-full flex flex-col items-center justify-center text-center px-12">
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mb-12 bg-slate-800/50 p-8 rounded-3xl border border-slate-700 shadow-2xl"
        >
            {slide.icon}
        </motion.div>
        <h2 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight">{slide.title}</h2>
        <p className="text-blue-400 text-2xl font-mono uppercase tracking-widest mb-16">{slide.subtitle}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
            {slide.features.map((feat: string, idx: number) => (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + (idx * 0.1) }}
                    className="flex items-start space-x-3 text-left bg-slate-900/30 p-4 rounded-xl"
                >
                    <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                    <span className="text-xl text-slate-200">{feat}</span>
                </motion.div>
            ))}
        </div>
    </div>
)

const SlidePricing = ({ slide }: { slide: any }) => (
    <div className="h-full flex flex-col lg:flex-row items-center justify-center px-12 gap-12">
        {/* Base Price Card */}
        <div className="flex-1 bg-slate-900/80 border border-slate-700 p-10 rounded-3xl max-w-md w-full relative group">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent rounded-3xl pointer-events-none" />
            <h3 className="text-2xl font-semibold text-slate-400 mb-2">Implementação Global</h3>
            <div className="text-6xl font-black text-white mb-4">{slide.price}</div>
            <p className="text-slate-400 mb-8 h-12">{slide.description}</p>
            <ul className="space-y-4 mb-8">
                {['Setup Inicial', 'Configuração Bitrix', 'Treino IA (291 Docs)', 'Deployment'].map((i) => (
                    <li key={i} className="flex items-center text-slate-300">
                        <CheckCircle2 className="w-5 h-5 text-blue-500 mr-3" /> {i}
                    </li>
                ))}
            </ul>
            <div className="text-center py-2 bg-slate-800 rounded-lg text-sm text-slate-500">Pagamento Único</div>
        </div>

        {/* Retainer Card */}
        <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex-1 bg-gradient-to-b from-blue-900/40 to-slate-900/80 border border-blue-500/50 p-10 rounded-3xl max-w-md w-full shadow-2xl shadow-blue-900/20 relative"
        >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold tracking-wide">
                PARCERIA CONTÍNUA
            </div>
            <h3 className="text-2xl font-semibold text-blue-200 mb-2">Retainer Mensal</h3>
            <div className="flex items-baseline mb-4">
                <span className="text-6xl font-black text-white">{slide.retainer.amount}</span>
                <span className="text-xl text-slate-400 ml-2">{slide.retainer.period}</span>
            </div>
            <p className="text-blue-200/80 mb-8 h-12">Acompanhamento e evolução constante da plataforma.</p>
            <ul className="space-y-4 mb-8">
                {slide.retainer.features.map((f: string, i: number) => (
                    <li key={i} className="flex items-center text-white">
                        <CheckCircle2 className="w-5 h-5 text-green-400 mr-3" /> {f}
                    </li>
                ))}
            </ul>
            <div className="text-center py-2 bg-blue-600/20 text-blue-300 rounded-lg text-sm border border-blue-500/30">
                Faturação Mensal
            </div>
        </motion.div>
    </div>
)

const SlideAction = ({ slide }: { slide: any }) => (
    <div className="h-full flex flex-col items-center justify-center text-center">
        <h1 className="text-7xl font-black text-white mb-12">{slide.title}</h1>
        <Button
            size="lg"
            className="text-2xl h-24 px-12 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-105"
            onClick={() => window.open(slide.link, '_blank')}
        >
            {slide.actionText} <ArrowRight className="ml-4 w-8 h-8" />
        </Button>
    </div>
)

const SlideTier = ({ slide }: { slide: any }) => (
    <div className="h-full flex flex-col items-center justify-center px-12">
        <div className="inline-block px-4 py-1 rounded-full bg-blue-900/50 border border-blue-500/30 text-blue-300 text-sm font-bold tracking-widest mb-8 uppercase">
            Módulo Especializado
        </div>
        <h2 className="text-6xl font-black text-white mb-2">{slide.title}</h2>
        <p className="text-2xl text-blue-400 mb-12 font-light">{slide.subtitle}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mb-16">
            {slide.content.map((item: any, idx: number) => (
                <div key={idx} className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 flex flex-col items-center text-center hover:bg-slate-800/50 transition-colors">
                    <div className="mb-6 p-4 bg-slate-800 rounded-full">
                        {item.icon}
                    </div>
                    <span className="text-xl text-slate-200 font-medium">{item.text}</span>
                </div>
            ))}
        </div>

        <div className="flex items-center gap-8 bg-slate-900/80 p-6 rounded-2xl border border-slate-700">
            <div className="text-right border-r border-slate-700 pr-8">
                <div className="text-sm text-slate-500 uppercase tracking-widest">Valor do Módulo</div>
                <div className="text-4xl font-bold text-white">{slide.price}</div>
            </div>
            <div className="pl-2">
                <div className="text-sm text-slate-500 uppercase tracking-widest">Retainer</div>
                <div className="text-xl font-bold text-blue-300">{slide.retainer}</div>
            </div>
        </div>
    </div>
)

function SlideSummary() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full h-full flex flex-col items-center justify-center space-y-12"
        >
            <div className="text-center space-y-4">
                <h2 className="text-6xl font-serif text-white">Ecossistema Completo</h2>
                <p className="text-xl text-slate-400 font-light tracking-wide">Valor Total do Investimento (Preço de Tabela)</p>
            </div>

            <div className="w-full max-w-4xl space-y-6">
                <div className="flex justify-between items-center p-6 bg-slate-900/50 rounded-xl border border-slate-800">
                    <span className="text-2xl text-slate-300">Tier 1 (Engine)</span>
                    <span className="text-2xl font-mono text-white">€5.000</span>
                </div>
                <div className="flex justify-between items-center p-6 bg-slate-900/50 rounded-xl border border-slate-800">
                    <span className="text-2xl text-slate-300">Tier 2 (Intelligence)</span>
                    <span className="text-2xl font-mono text-white">€3.500</span>
                </div>
                <div className="flex justify-between items-center p-6 bg-slate-900/50 rounded-xl border border-slate-800">
                    <span className="text-2xl text-slate-300">Tier 3 (Growth - Beta)</span>
                    <span className="text-2xl font-mono text-white">€2.500</span>
                </div>

                <div className="flex justify-between items-center p-8 bg-blue-900/20 rounded-xl border border-blue-500/50 shadow-[0_0_40px_rgba(59,130,246,0.1)]">
                    <span className="text-3xl font-bold text-white">TOTAL REAL</span>
                    <span className="text-4xl font-mono font-bold text-blue-400">€11.000</span>
                </div>
            </div>

            <div className="max-w-3xl text-center bg-amber-950/30 border border-amber-900/50 p-6 rounded-lg">
                <p className="text-amber-500/90 text-sm flex items-center justify-center gap-2">
                    <BarChart className="w-4 h-4" />
                    <span>
                        <strong>Oferta de Fecho:</strong> A proposta "Global v2.0" (€5k + Retainer) representa uma <strong>poupança imediata de 55%</strong> sobre este valor tabela.
                    </span>
                </p>
            </div>
        </motion.div>
    )
}

function SlideBenchmark() {
    return (
        <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="w-full h-full flex flex-col items-center justify-center space-y-8 p-12"
        >
            <div className="text-center space-y-2">
                <h2 className="text-5xl font-serif text-white">Análise de Mercado</h2>
                <p className="text-lg text-slate-400">Comparativo de TCO (Total Cost of Ownership) - 1º Ano</p>
            </div>

            <div className="flex gap-8 items-end justify-center w-full max-w-5xl h-[400px]">
                {/* Competitor Column */}
                <div className="w-1/3 flex flex-col gap-4 group">
                    <div className="h-[350px] w-full bg-slate-800 rounded-t-xl relative overflow-hidden flex flex-col justify-end p-6 border border-slate-700 group-hover:border-red-500/50 transition-colors">
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-50" />
                        <span className="z-10 text-4xl font-bold text-slate-200">€18.600+</span>
                        <span className="z-10 text-sm text-slate-400 mt-2">Solução Tradicional</span>
                        <ul className="z-10 text-xs text-slate-500 mt-4 space-y-1">
                            <li>• Dev Custom (€15k)</li>
                            <li>• Licenças CRM (€3k+)</li>
                            <li>• Ferramentas AI Separation (€600+)</li>
                        </ul>
                    </div>
                </div>

                {/* Our Solution Column */}
                <div className="w-1/3 flex flex-col gap-4 group">
                    <div className="h-[250px] w-full bg-blue-600 rounded-t-xl relative overflow-hidden flex flex-col justify-end p-6 shadow-[0_0_50px_rgba(37,99,235,0.3)] border border-blue-400 group-hover:border-white transition-colors">
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-900 via-transparent to-transparent opacity-50" />
                        <span className="z-10 text-5xl font-bold text-white">€12.200</span>
                        <span className="z-10 text-sm text-blue-100 mt-2">Consultancy OS v2.0</span>
                        <ul className="z-10 text-xs text-blue-200 mt-4 space-y-1">
                            <li>• Setup Parceiro (€5k)</li>
                            <li>• Retainer Anual (€7.2k)</li>
                            <li>• <strong>All-in-One</strong></li>
                        </ul>
                    </div>
                    <div className="bg-green-500/20 text-green-400 text-center py-2 rounded-full text-sm font-bold border border-green-500/30">
                        POUPANÇA: 35%
                    </div>
                </div>
            </div>
        </motion.div>
    )
}


// --- Main Layout ---

export function UltraPresentationComponent() {
    const [currentSlide, setCurrentSlide] = useState(0)

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') nextSlide()
            if (e.key === 'ArrowLeft') prevSlide()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [currentSlide])

    const nextSlide = () => {
        if (currentSlide < slides.length - 1) setCurrentSlide(curr => curr + 1)
    }

    const prevSlide = () => {
        if (currentSlide > 0) setCurrentSlide(curr => curr - 1)
    }

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center overflow-hidden p-4 md:p-8">
            {/* 16:9 Container */}
            <div
                className="w-full max-w-[1920px] aspect-video bg-slate-950 relative rounded-2xl overflow-hidden shadow-2xl border border-slate-800"
                style={{ maxHeight: '100vh' }}
            >
                {/* Background Elements */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-slate-950 to-slate-950" />
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-500 to-blue-600 opacity-50" />

                {/* Header */}
                <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-center z-50">
                    <div className="flex items-center space-x-2 text-slate-400">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-sm font-mono tracking-widest uppercase">Ultrathink Protocol v2.0</span>
                    </div>
                    <div className="text-slate-500 text-sm font-mono">
                        {currentSlide + 1} / {slides.length}
                    </div>
                </div>

                {/* Content Area */}
                <div className="absolute inset-0 pt-20 pb-20 px-8 flex flex-col">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSlide}
                            initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
                            transition={{ duration: 0.5, ease: "circOut" }}
                            className="flex-1 h-full w-full"
                        >
                            {slides[currentSlide].type === 'hero' && <SlideHero slide={slides[currentSlide]} />}
                            {slides[currentSlide].type === 'split' && <SlideSplit slide={slides[currentSlide]} />}
                            {slides[currentSlide].type === 'list' && <SlideList slide={slides[currentSlide]} />}
                            {slides[currentSlide].type === 'tier' && <SlideTier slide={slides[currentSlide]} />}
                            {slides[currentSlide].type === 'summary' && <SlideSummary />}
                            {slides[currentSlide].type === 'feature' && <SlideFeature slide={slides[currentSlide]} />}
                            {slides[currentSlide].type === 'pricing' && <SlidePricing slide={slides[currentSlide]} />}
                            {slides[currentSlide].type === 'action' && <SlideAction slide={slides[currentSlide]} />}
                            {slides[currentSlide].id === 'benchmark' && <SlideBenchmark />}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer / Controls */}
                <div className="absolute bottom-0 left-0 w-full p-8 flex justify-between items-center z-50">
                    {/* Progress Bar */}
                    <div className="flex-1 max-w-md h-1 bg-slate-900 rounded-full overflow-hidden mr-8">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
                            className="h-full bg-blue-500"
                        />
                    </div>

                    <div className="flex space-x-4">
                        <Button
                            variant="ghost"
                            onClick={prevSlide}
                            disabled={currentSlide === 0}
                            className="text-slate-400 hover:text-white hover:bg-slate-800"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </Button>
                        <Button
                            onClick={nextSlide}
                            disabled={currentSlide === slides.length - 1}
                            className="bg-blue-600 hover:bg-blue-500 text-white"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    )
}
