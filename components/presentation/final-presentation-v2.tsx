'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Home, Play, Pause, RotateCcw, Check, Star, Database, Bot, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'

const slides = [
    // === CAPA ===
    {
        id: 1,
        title: 'TA Consulting Platform',
        subtitle: 'Consultancy OS - A Evolução',
        content: 'De "Ferramenta de RAG" para "Sistema Operativo de Consultoria" integrado com Bitrix24.',
        image: 'https://cdn.abacus.ai/images/35a46d1c-e485-406c-918d-d6f6965aef35.png',
        type: 'cover' as const
    },

    // === O PEDIDO V2 (FERNANDO 2ª REUNIÃO) ===
    {
        id: 2,
        title: 'O Novo Pedido (V2)',
        subtitle: 'Requisitos da 2ª Reunião',
        content: '1. Integração Bitrix Bidirecional • As 24.000 empresas "mortas" têm de ser ativadas automaticamente. • 2. Não é só um software, é uma parceria • Modelo de avença mensal para melhoria contínua. • 3. Preço Premium • Solução chave-na-mão, sem configurações manuais.',
        image: 'https://cdn.abacus.ai/images/532f775c-d71b-47ed-9670-1a330ffb2172.jpg',
        type: 'content' as const
    },

    // === MÓDULO 1: BASE ===
    {
        id: 3,
        title: 'TIER 1 - "The Engine"',
        subtitle: 'Scraping + Matchmaking + Bitrix',
        content: '✅ Scraping Multi-Portal: Portugal 2030, PRR, PEPAC. • ✅ Bitrix Deep Sync: Lê as 24k empresas, cruza com avisos e devolve leads prontas. • ✅ Matchmaking Engine: Algoritmo de elegibilidade (CAE, Região, Dimensão). • 🎯 Objetivo: Eliminar a folha de Excel do Fernando.',
        image: 'https://cdn.abacus.ai/images/ef252f45-064a-4dd4-a3fd-88a16e7eca05.png',
        type: 'module' as const,
        phase: 1
    },

    // === PREÇO TIER 1 ===
    {
        id: 4,
        title: 'Investimento - TIER 1',
        subtitle: 'A Base do Sistema',
        content: '💰 Setup: €5.000 (Chave na mão) • 📊 Mensalidade: €600 (Retainer Parceria) • ⏱️ Prazo: 3 semanas • 🎯 Inclui: Integração Bitrix Completa + Scraping 4 Portais + Dashboard + Formação Equipa',
        image: 'https://cdn.abacus.ai/images/cb833bef-0565-44f0-8886-933e6218cddf.jpg',
        type: 'price' as const,
        phase: 1
    },

    // === MÓDULO 2: AI ===
    {
        id: 5,
        title: 'TIER 2 - "The Consultant"',
        subtitle: 'RAG Knowledge + AI Writer',
        content: '✅ AI Style Transfer: Treinado nas 291 candidaturas históricas da TA. • ✅ Chat Documental: "Qual foi o orçamento do projeto X em 2023?" • ✅ Geração de Memórias: Escreve rascunhos baseados no tom da consultora. • 🎯 Objetivo: Reduzir tempo de escrita de 4h para 30min.',
        image: 'https://cdn.abacus.ai/images/7994875e-28f2-4e86-b4e9-fd1c1c2d8e3a.jpg',
        type: 'module' as const,
        phase: 2
    },

    // === PREÇO TIER 2 ===
    {
        id: 6,
        title: 'Investimento - TIER 2',
        subtitle: 'Upgrade de Inteligência',
        content: '💰 Setup Adicional: +€3.500 • 📊 Mensalidade Total (T1+T2): €850 • ⏱️ Prazo: +2 semanas • 🎯 Inclui: Indexação 532GB Drive + AI Writer Customizado + Interface Chat',
        image: 'https://cdn.abacus.ai/images/cb833bef-0565-44f0-8886-933e6218cddf.jpg',
        type: 'price' as const,
        phase: 2
    },

    // === MÓDULO 3: AUTOMAÇÃO ===
    {
        id: 7,
        title: 'TIER 3 - "Automation"',
        subtitle: 'Marketing & Web Sync',
        content: '✅ Marketing Planner: Sugere canais e copy para cada aviso. • ✅ Web Auto-Publish: Publica "Key Facts" de novos avisos no site da TA. • ✅ Relatórios Automáticos do Bitrix: KPIs de conversão em tempo real. • 🎯 Objetivo: A máquina vende sozinha.',
        image: 'https://cdn.abacus.ai/images/7676b629-024a-47c5-8f5b-14b85380d8e1.jpg',
        type: 'module' as const,
        phase: 3
    },

    // === PREÇO TIER 3 ===
    {
        id: 8,
        title: 'Investimento - TIER 3',
        subtitle: 'Automação Total',
        content: '💰 Setup Adicional: +€2.500 • 📊 Mensalidade Total (T1+T2+T3): €1.200 • ⏱️ Prazo: +2 semanas • 🎯 Inclui: Webhooks Website + Marketing Engine + Dashboards Avançados',
        image: 'https://cdn.abacus.ai/images/e70225df-fe46-49bd-a32b-4cdd1ae917d1.jpg',
        type: 'price' as const,
        phase: 3
    },

    // === VALOR TOTAL ===
    {
        id: 9,
        title: 'Resumo Proposta V2',
        subtitle: 'Qual o valor total?',
        content: '🚀 TIER 1 (Essencial): €5.000 Setup • ⭐ TIER 2 (Recomendado): €8.500 Setup • 👑 TIER 3 (Completo): €11.000 Setup • 🤝 Modelo: 40% Adjudicação + 30% Beta + 30% Final',
        image: 'https://cdn.abacus.ai/images/a3b465f6-4b27-41b7-b85d-1b4ed4dfec26.jpg',
        type: 'comparison' as const
    },

    // === BITRIX DEEP DIVE ===
    {
        id: 10,
        title: 'Detalhe: Integração Bitrix',
        subtitle: 'Como funciona o "Deep Sync"?',
        content: '1. Leitura Diária: O sistema puxa NIF, CAE e Faturação do Bitrix via API. • 2. Cruzamento: Aplica regras dos Avisos do dia. • 3. Escrita: Devolve ao Bitrix uma "Atividade" ou "Lead" para o comercial responsável. • Resultado: O CRM ganha vida.',
        image: 'https://cdn.abacus.ai/images/22d7511e-45ba-49f3-be23-810d44aefd1a.jpg',
        type: 'workflow' as const
    },

    // === PRÓXIMOS PASSOS ===
    {
        id: 11,
        title: 'Próximos Passos',
        subtitle: 'Roadmap de Implementação',
        content: 'Semana 1: Acesso API Bitrix + Setup Servidor. • Semana 2-3: Scraping + Matchmaking (Tier 1). • Semana 4: Indexação AI + Testes RAG (Tier 2). • Semana 6: Go-Live + Formação.',
        image: 'https://cdn.abacus.ai/images/cb833bef-0565-44f0-8886-933e6218cddf.jpg',
        type: 'next' as const
    },

    // === CONTACTO ===
    {
        id: 12,
        title: 'Vamos Avançar?',
        subtitle: 'Aprovação Proposta',
        content: 'Prontos para iniciar a transformação digital com a TA Consulting.',
        image: 'https://cdn.abacus.ai/images/35a46d1c-e485-406c-918d-d6f6965aef35.png',
        type: 'contact' as const,
        hasButton: true
    }
]

export function FinalPresentationComponent() {
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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden">
            {/* Header Controls */}
            <div className="absolute top-0 left-0 right-0 z-20 bg-black/30 backdrop-blur-sm border-b border-white/10">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-4">
                        <Link href="/">
                            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                                <Home className="w-4 h-4 mr-2" />
                                Início
                            </Button>
                        </Link>
                        <div className="text-sm text-gray-300 font-medium">
                            Proposta Comercial V2 - Pós-Reunião Fernando
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsAutoPlay(!isAutoPlay)}
                            className="text-white hover:bg-white/10"
                            title={isAutoPlay ? 'Pausar' : 'Reproduzir'}
                        >
                            {isAutoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={resetPresentation}
                            className="text-white hover:bg-white/10"
                            title="Reiniciar"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Slide Area */}
            <div className="relative h-screen flex items-center justify-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, x: 300 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -300 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="w-full h-full flex items-center justify-center"
                    >
                        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center h-full">
                            {/* Content Side */}
                            <div className={`space-y-6 ${currentSlideData.type === 'cover' ? 'lg:order-1 text-center lg:text-left' : ''}`}>
                                {currentSlideData.type === 'cover' ? (
                                    <div>
                                        <motion.h1
                                            initial={{ opacity: 0, y: 50 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="text-6xl lg:text-7xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400 bg-clip-text text-transparent"
                                        >
                                            {currentSlideData.title}
                                        </motion.h1>
                                        <motion.h2
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 }}
                                            className="text-3xl lg:text-4xl font-semibold mb-6 text-gray-200"
                                        >
                                            {currentSlideData.subtitle}
                                        </motion.h2>
                                        <motion.p
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 }}
                                            className="text-xl text-gray-400 max-w-2xl"
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
                                                <div className={`inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r ${getPhaseColor(currentSlideData.phase)} text-white text-sm font-medium mb-4`}>
                                                    TIER {currentSlideData.phase}
                                                </div>
                                            )}

                                            <h1 className="text-4xl lg:text-4xl font-bold mb-3 text-white">
                                                {currentSlideData.title}
                                            </h1>
                                            <h2 className="text-xl lg:text-2xl font-medium text-blue-400 mb-4">
                                                {currentSlideData.subtitle}
                                            </h2>
                                        </motion.div>

                                        <motion.div
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 }}
                                            className="space-y-3"
                                        >
                                            {currentSlideData.content.split('•').map((point, index) => {
                                                const trimmed = point.trim()
                                                if (!trimmed) return null

                                                const isPrice = trimmed.includes('💰') || trimmed.includes('€')
                                                const isHighlight = trimmed.startsWith('✅')
                                                const isTotal = trimmed.includes('TIER 3')

                                                return (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.5 + index * 0.08 }}
                                                        className={`flex items-start space-x-3 ${isTotal ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/20 -mx-4 px-4 py-3 rounded-lg border-l-4 border-amber-500' : ''
                                                            }`}
                                                    >
                                                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${isPrice ? 'bg-green-400' : isHighlight ? 'bg-blue-400' : 'bg-gray-400'
                                                            }`} />
                                                        <p className={`text-gray-300 leading-relaxed text-sm lg:text-lg whitespace-pre-line ${isPrice ? 'font-bold text-white text-xl' : ''
                                                            }`}>
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
                                                className="pt-4"
                                            >
                                                <Link href="/dashboard">
                                                    <Button
                                                        size="lg"
                                                        className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-4 text-lg"
                                                    >
                                                        Ir para Dashboard
                                                    </Button>
                                                </Link>
                                            </motion.div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Image Side */}
                            <div className={`relative ${currentSlideData.type === 'cover' ? 'lg:order-0' : ''}`}>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.3, duration: 0.7 }}
                                    className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-slate-800 border border-white/10"
                                >
                                    <Image
                                        src={currentSlideData.image}
                                        alt={currentSlideData.title}
                                        fill
                                        className="object-cover"
                                        priority={currentSlide <= 2}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />

                                    {/* Floating Elements for specialized slides */}
                                    {currentSlideData.phase === 1 && (
                                        <div className="absolute bottom-4 right-4 bg-blue-600/90 backdrop-blur px-4 py-2 rounded-lg shadow-lg">
                                            <div className="flex items-center gap-2">
                                                <Database className="w-5 h-5" />
                                                <span className="font-bold">Bitrix Connected</span>
                                            </div>
                                        </div>
                                    )}
                                    {currentSlideData.phase === 2 && (
                                        <div className="absolute bottom-4 right-4 bg-purple-600/90 backdrop-blur px-4 py-2 rounded-lg shadow-lg">
                                            <div className="flex items-center gap-2">
                                                <Bot className="w-5 h-5" />
                                                <span className="font-bold">AI Active</span>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Arrows */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={prevSlide}
                    className="absolute left-8 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/10 w-12 h-12"
                    disabled={currentSlide === 0}
                >
                    <ChevronLeft className="w-8 h-8" />
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={nextSlide}
                    className="absolute right-8 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/10 w-12 h-12"
                    disabled={currentSlide === slides.length - 1}
                >
                    <ChevronRight className="w-8 h-8" />
                </Button>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 z-20 bg-black/30 backdrop-blur-sm border-t border-white/10">
                <div className="px-8 py-4">
                    <div className="w-full bg-gray-700 rounded-full h-1.5 mb-4">
                        <div
                            className="bg-gradient-to-r from-blue-400 to-green-400 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            {slides.map((slide, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToSlide(index)}
                                    className={`w-3 h-3 rounded-full transition-all duration-200 ${index === currentSlide
                                            ? 'bg-blue-400 scale-125'
                                            : slide.phase ? `bg-${slide.phase === 1 ? 'blue' : slide.phase === 2 ? 'purple' : 'pink'}-600` : 'bg-gray-600 hover:bg-gray-500'
                                        }`}
                                />
                            ))}
                        </div>

                        <div className="text-sm text-gray-400">
                            {currentSlide + 1} / {slides.length}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
