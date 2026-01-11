'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Home, Play, Pause, RotateCcw, Check, Star, Database, Bot, messagesSquare, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'

const slides = [
    // === SLIDE 1: CAPA PREMIUM ===
    {
        id: 1,
        title: 'TA Consulting OS',
        subtitle: 'O Sistema Operativo da Consultoria',
        content: 'Não é apenas software. É a evolução da sua empresa para uma "Agência de Consultoria Híbrida".',
        image: 'https://cdn.abacus.ai/images/35a46d1c-e485-406c-918d-d6f6965aef35.png',
        type: 'cover' as const
    },

    // === SLIDE 2: O CONTEXTO (Realidade Atual) ===
    {
        id: 2,
        title: 'O Tesouro Adormecido',
        subtitle: 'Bitrix24: 24.000 Empresas à Espera',
        content: 'Hoje: Dados estáticos que dependem de pesquisa manual. • O Problema: Excel interminável, oportunidades perdidas e muito tempo gasto em tarefas repetitivas. • A Oportunidade: Transformar este "cemitério de dados" numa mina de ouro ativa.',
        image: 'https://cdn.abacus.ai/images/63f6a798-9dca-4c09-b2f3-e41eb8d28dcb.png',
        type: 'content' as const,
        phase: 1
    },

    // === SLIDE 3: A SOLUÇÃO (Visão Geral) ===
    {
        id: 3,
        title: 'Consultancy OS',
        subtitle: 'A Máquina de Leads Automática',
        content: '✅ 1. Entrada: Chatbot qualifica leads automaticamente. • ✅ 2. Motor: Scraping diário de avisos cruza com o Bitrix. • ✅ 3. Saída: Lista "Top 50" empresas prontas para contactar. • Resultado: O Fernando foca-se em fechar negócios, não em pesquisar.',
        image: 'https://cdn.abacus.ai/images/d932dd9a-77d1-4c25-a006-d912c540133f.jpg',
        type: 'content' as const,
        phase: 2
    },

    // === SLIDE 4: TIER 1 (A Oferta Core) ===
    {
        id: 4,
        title: 'TIER 1 - A Fundação',
        subtitle: 'Scraping + Matchmaking + Bitrix Sync',
        content: '🚀 O Motor Principal: • Monitorização diária (Portugal 2030, PRR, etc). • Algoritmo de Matchmaking (CAE, Região, Dimensão). • Sincronização Bidirecional com Bitrix. • Dashboard de Decisão em Tempo Real. • O essencial para parar de usar Excel.',
        image: 'https://cdn.abacus.ai/images/ef252f45-064a-4dd4-a3fd-88a16e7eca05.png',
        type: 'module' as const,
        phase: 1
    },

    // === SLIDE 5: PREÇO TIER 1 (O Ask) ===
    {
        id: 5,
        title: 'Investimento - TIER 1',
        subtitle: 'Setup & Implementação',
        content: '💰 Valor de Setup: €5.000 • O que inclui: • Integração total API Bitrix. • 6 Scrapers Oficiais. • Dashboard "Consultancy OS". • Treino da Equipa. • (Este é o valor de uma agência, mas com entrega de software proprietário).',
        image: 'https://cdn.abacus.ai/images/cb833bef-0565-44f0-8886-933e6218cddf.jpg',
        type: 'price' as const,
        phase: 1
    },

    // === SLIDE 6: TIER 2 (Upsell Futuro) ===
    {
        id: 6,
        title: 'TIER 2 - AI Writer (Futuro)',
        subtitle: 'Memórias Descritivas em Autopilot',
        content: '✍️ O "Cérebro" Criativo: • RAG sobre 291 candidaturas históricas. • Style Transfer (escreve como a TA Consulting). • Redução de 4h para 30min na escrita. • Upgrade sugerido para Fase 2.',
        image: 'https://cdn.abacus.ai/images/7994875e-28f2-4e86-b4e9-fd1c1c2d8e3a.jpg',
        type: 'module' as const,
        phase: 2
    },

    // === SLIDE 7: PREÇO TIER 2 ===
    {
        id: 7,
        title: 'Investimento - TIER 2',
        subtitle: 'Expansão de Capacidade',
        content: '💰 Upgrade: +€3.500 • Retorno: Multiplica a capacidade de entrega da equipa técnica sem contratar mais pessoas.',
        image: 'https://cdn.abacus.ai/images/cb833bef-0565-44f0-8886-933e6218cddf.jpg',
        type: 'price' as const,
        phase: 2
    },

    // === SLIDE 8: MODELO DE PARCERIA (Retainer) ===
    {
        id: 8,
        title: 'Modelo de Parceria',
        subtitle: 'Evolução Contínua',
        content: '🔄 Retainer Mensal: €600/mês • Não é "manutenção", é Evolução: • Ajuste constante dos algoritmos de match. • Novos scrapers à medida que abrem novos portais. • Melhoria dos prompts da IA. • A TA Consulting nunca fica obsoleta.',
        image: 'https://cdn.abacus.ai/images/532f775c-d71b-47ed-9670-1a330ffb2172.jpg',
        type: 'content' as const,
        phase: 3
    },

    // === SLIDE 9: DEMONSTRAÇÃO BITRIX ===
    {
        id: 9,
        title: 'Demo: O "Cérebro" em Ação',
        subtitle: 'Integração Bitrix ao Vivo',
        content: 'Cenário: Novo aviso "Inovação Produtiva" abre. • 1. O sistema deteta em 24h. • 2. Cruza com os 24k registos Bitrix. • 3. Identifica "Metalomecânica do Norte, PME". • 4. Envia notificação ao comercial responsável: "Ligar a estas 10 empresas hoje".',
        image: 'https://cdn.abacus.ai/images/a3b465f6-4b27-41b7-b85d-1b4ed4dfec26.jpg',
        type: 'demo' as const,
        hasButton: true
    },

    // === SLIDE 10: COMPARATIVO DE MERCADO ===
    {
        id: 10,
        title: 'Porquê Agora?',
        subtitle: 'Benchmark de Mercado',
        content: 'Consultora Big 4: €40k-€80k • Agência AI Boutique: €15k-€20k • Freelancer: €6k-€9k • TA Consulting OS: €5.000 (Tier 1) • Estamos a posicionar isto como uma parceria estratégica, não como um custo de TI.',
        image: 'https://cdn.abacus.ai/images/e70225df-fe46-49bd-a32b-4cdd1ae917d1.jpg',
        type: 'comparison' as const
    },

    // === SLIDE 11: NEXT STEPS ===
    {
        id: 11,
        title: 'Próximos Passos',
        subtitle: 'Go-Live em 4 Semanas',
        content: '1️⃣ Aprovação Tier 1 (€5k + Retainer). • 2️⃣ Acesso API Bitrix (Esta semana). • 3️⃣ Deploy do Matchmaking Engine (Semana 3). • 4️⃣ Formação da Equipa e Go-Live (Semana 4).',
        image: 'https://cdn.abacus.ai/images/7676b629-024a-47c5-8f5b-14b85380d8e1.jpg',
        type: 'next' as const
    }
]

export function PitchFernandoPremium() {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [isAutoPlay, setIsAutoPlay] = useState(false)

    const nextSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, [])

    const prevSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    }, [])

    const goToSlide = (index: number) => {
        setCurrentSlide(index)
    }

    const resetPresentation = () => {
        setCurrentSlide(0)
        setIsAutoPlay(false)
    }

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            switch (event.key) {
                case 'ArrowRight':
                case ' ':
                    nextSlide()
                    break
                case 'ArrowLeft':
                    prevSlide()
                    break
                case 'Home':
                    setCurrentSlide(0)
                    break
                case 'End':
                    setCurrentSlide(slides.length - 1)
                    break
                case 'Escape':
                    setIsAutoPlay(false)
                    break
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [nextSlide, prevSlide])

    // Auto-play functionality
    useEffect(() => {
        if (isAutoPlay) {
            const interval = setInterval(() => {
                setCurrentSlide((prev) => {
                    if (prev === slides.length - 1) {
                        setIsAutoPlay(false)
                        return prev
                    }
                    return prev + 1
                })
            }, 5000)
            return () => clearInterval(interval)
        }
    }, [isAutoPlay])

    const currentSlideData = slides[currentSlide]

    const getPhaseColor = (phase?: number) => {
        if (!phase) return 'from-gray-400 to-gray-500'
        const colors = {
            1: 'from-blue-400 to-blue-600',
            2: 'from-purple-400 to-purple-600',
            3: 'from-pink-400 to-pink-600'
        }
        return colors[phase as keyof typeof colors]
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden font-sans">
            {/* Header Controls */}
            <div className="absolute top-0 left-0 right-0 z-20 bg-black/30 backdrop-blur-md border-b border-white/10">
                <div className="flex items-center justify-between p-4 max-w-[1920px] mx-auto">
                    <div className="flex items-center space-x-6">
                        <Link href="/">
                            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 transition-colors">
                                <Home className="w-5 h-5 mr-2" />
                                <span className="font-medium">Início</span>
                            </Button>
                        </Link>
                        <div className="h-6 w-px bg-white/20" />
                        <div className="text-sm font-medium text-blue-200 tracking-wide uppercase">
                            Proposta Comercial V3 • TA Consulting OS
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsAutoPlay(!isAutoPlay)}
                            className={`text-white transition-all ${isAutoPlay ? 'bg-blue-500/20 text-blue-300' : 'hover:bg-white/10'}`}
                            title={isAutoPlay ? 'Pausar' : 'Reproduzir'}
                        >
                            {isAutoPlay ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={resetPresentation}
                            className="text-white hover:bg-white/10"
                            title="Reiniciar"
                        >
                            <RotateCcw className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Slide Area */}
            <div className="relative h-screen flex items-center justify-center pt-16">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="w-full h-full flex items-center justify-center p-8 lg:p-16"
                    >
                        <div className="max-w-[1600px] w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center h-full">

                            {/* Content Side */}
                            <div className={`space-y-8 ${currentSlideData.type === 'cover' ? 'lg:order-1 text-center lg:text-left' : ''}`}>
                                {currentSlideData.type === 'cover' ? (
                                    <div className="space-y-8">
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 font-medium text-sm tracking-wider uppercase mb-4"
                                        >
                                            Apresentação Executiva
                                        </motion.div>
                                        <motion.h1
                                            initial={{ opacity: 0, y: 50 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
                                            className="text-7xl lg:text-9xl font-extrabold tracking-tight"
                                        >
                                            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-green-400 bg-clip-text text-transparent">
                                                TA
                                            </span>
                                            <span className="block text-white mt-2">Consulting OS</span>
                                        </motion.h1>
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.6 }}
                                            className="h-1 w-32 bg-gradient-to-r from-blue-500 to-green-500 rounded-full my-6 mx-auto lg:mx-0"
                                        />
                                        <motion.p
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.7 }}
                                            className="text-2xl lg:text-3xl font-light text-blue-100 max-w-2xl leading-relaxed"
                                        >
                                            {currentSlideData.content}
                                        </motion.p>
                                    </div>
                                ) : (
                                    <>
                                        <motion.div
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            {currentSlideData.phase && (
                                                <div className={`inline-flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r ${getPhaseColor(currentSlideData.phase)} text-white text-xs font-bold tracking-widest uppercase mb-6 shadow-lg shadow-blue-900/20`}>
                                                    Fase {currentSlideData.phase}
                                                    {currentSlideData.phase === 1 && " • Fundação"}
                                                    {currentSlideData.phase === 2 && " • Expansão"}
                                                    {currentSlideData.phase === 3 && " • Consistência"}
                                                </div>
                                            )}

                                            <h1 className="text-5xl lg:text-7xl font-bold mb-4 text-white tracking-tight leading-tight">
                                                {currentSlideData.title}
                                            </h1>
                                            <h2 className="text-2xl lg:text-3xl font-medium text-blue-300 mb-8 flex items-center">
                                                <span className="w-8 h-px bg-blue-300 mr-4 opacity-50"></span>
                                                {currentSlideData.subtitle}
                                            </h2>
                                        </motion.div>

                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.4 }}
                                            className="space-y-6"
                                        >
                                            {currentSlideData.content.split('•').map((point, index) => {
                                                const trimmed = point.trim()
                                                if (!trimmed) return null

                                                const isPrice = trimmed.includes('💰') || trimmed.includes('€')
                                                const isCheck = trimmed.includes('✅')
                                                const isHighlight = trimmed.includes('🚀') || trimmed.includes('✨')

                                                return (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ opacity: 0, x: -30 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.5 + index * 0.1 }}
                                                        className={`flex items-start p-4 rounded-xl transition-all ${isPrice
                                                                ? 'bg-gradient-to-r from-green-900/40 to-emerald-900/20 border border-green-500/30'
                                                                : isHighlight
                                                                    ? 'bg-blue-900/20 border border-blue-500/20'
                                                                    : 'hover:bg-white/5'
                                                            }`}
                                                    >
                                                        <div className={`mt-1.5 p-1.5 rounded-full mr-4 flex-shrink-0 ${isPrice
                                                                ? 'bg-green-500 text-green-950'
                                                                : isCheck
                                                                    ? 'bg-blue-500 text-blue-50'
                                                                    : 'bg-slate-700 text-slate-300'
                                                            }`}>
                                                            {isPrice ? <Star className="w-4 h-4" /> : isCheck ? <Check className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                        </div>
                                                        <p className={`text-lg lg:text-xl leading-relaxed ${isPrice ? 'text-green-100 font-semibold' : 'text-slate-200'}`}>
                                                            {trimmed}
                                                        </p>
                                                    </motion.div>
                                                )
                                            })}
                                        </motion.div>

                                        {currentSlideData.hasButton && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 30 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.8 }}
                                                className="pt-8"
                                            >
                                                <Link href="/dashboard">
                                                    <Button
                                                        size="lg"
                                                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-10 py-8 text-xl rounded-2xl shadow-xl shadow-blue-900/20 transform hover:-translate-y-1 transition-all"
                                                    >
                                                        <Play className="w-6 h-6 mr-3 fill-current" />
                                                        Ver Demonstração ao Vivo
                                                    </Button>
                                                </Link>
                                            </motion.div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Image Side */}
                            <div className={`relative h-full flex items-center justify-center ${currentSlideData.type === 'cover' ? 'lg:order-0' : ''}`}>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
                                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                    transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
                                    className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 group"
                                >
                                    <Image
                                        src={currentSlideData.image}
                                        alt={currentSlideData.title}
                                        fill
                                        className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                        priority={currentSlide <= 2}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/60 via-transparent to-transparent pointer-events-none" />

                                    {/* Decorative Elements */}
                                    {currentSlideData.type === 'cover' && (
                                        <div className="absolute bottom-6 left-6 flex space-x-2">
                                            <div className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-xs font-mono text-white/70 border border-white/10">v3.0.0</div>
                                            <div className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-xs font-mono text-white/70 border border-white/10">Enterprise Edition</div>
                                        </div>
                                    )}

                                    {currentSlideData.type === 'demo' && (
                                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-2xl animate-pulse">
                                                <Play className="w-8 h-8 text-white fill-current" />
                                            </div>
                                        </div>
                                    )}
                                </motion.div>

                                {/* Background Blobs */}
                                <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen animate-pulse" />
                                <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen animate-pulse delay-1000" />
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Arrows */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={prevSlide}
                    className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white hover:bg-white/10 w-16 h-16 rounded-full transition-all"
                    disabled={currentSlide === 0}
                >
                    <ChevronLeft className="w-10 h-10" />
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={nextSlide}
                    className="absolute right-6 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white hover:bg-white/10 w-16 h-16 rounded-full transition-all"
                    disabled={currentSlide === slides.length - 1}
                >
                    <ChevronRight className="w-10 h-10" />
                </Button>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent pt-20 pb-8">
                <div className="max-w-[1920px] mx-auto px-8">
                    <div className="flex flex-col space-y-4">
                        {/* Text Indicators */}
                        <div className="flex justify-between items-end px-2">
                            <div className="text-white/60 text-sm font-medium">
                                {currentSlideData.title}
                            </div>
                            <div className="text-white/60 text-sm font-mono">
                                {currentSlide + 1} <span className="text-white/30">/</span> {slides.length}
                            </div>
                        </div>

                        {/* Progress Bar Container */}
                        <div className="relative w-full h-1.5 bg-gray-800/50 rounded-full overflow-hidden backdrop-blur-sm">
                            <motion.div
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400 rounded-full"
                                layoutId="progressBar"
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
                            />
                        </div>

                        {/* Slide Dots */}
                        <div className="flex items-center justify-center space-x-3 pt-2">
                            {slides.map((slide, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToSlide(index)}
                                    className={`group relative transition-all duration-300 focus:outline-none ${index === currentSlide ? 'w-12' : 'w-2 hover:w-4'
                                        }`}
                                    title={slide.title}
                                >
                                    <div className={`h-1.5 rounded-full transition-colors ${index === currentSlide
                                            ? 'bg-blue-400 shadow-lg shadow-blue-500/50'
                                            : slide.phase === 1 ? 'bg-blue-800/60 group-hover:bg-blue-500'
                                                : slide.phase === 2 ? 'bg-purple-800/60 group-hover:bg-purple-500'
                                                    : 'bg-slate-800/60 group-hover:bg-slate-500'
                                        }`} />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
