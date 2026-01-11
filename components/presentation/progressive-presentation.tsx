'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Home, Play, Pause, RotateCcw, Check, Star } from 'lucide-react'
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
    subtitle: 'Consultancy OS - Automação IA',
    content: 'Transforme a gestão de fundos europeus com inteligência artificial',
    image: 'https://cdn.abacus.ai/images/35a46d1c-e485-406c-918d-d6f6965aef35.png',
    type: 'cover' as const
  },

  // === O PEDIDO ===
  {
    id: 2,
    title: 'O Pedido',
    subtitle: 'Sistema Inteligente em 3 Módulos Progressivos',
    content: 'MÓDULO 1: IA de Dados Internos • Consulta inteligente da pasta "Candidaturas" (~532GB) • Sistema RAG com citações automáticas • MÓDULO 2: Scraping Automático • 6 sites de financiamentos (Portugal 2030, PRR, PEPAC, Europa Criativa, Horizon Europe, IPDJ) • Avisos detectados em <24h • MÓDULO 3: IA Profunda • Análise completa de PDFs • Q&A sobre requisitos e critérios',
    image: 'https://cdn.abacus.ai/images/22d7511e-45ba-49f3-be23-810d44aefd1a.jpg',
    type: 'content' as const
  },

  // === STACK TECNOLÓGICO ===
  {
    id: 3,
    title: 'Stack Tecnológico',
    subtitle: 'Ferramentas Modernas e Robustas',
    content: 'Google File Search API + Gemini 2.0 Flash → RAG gerido, zero manutenção • Apify Actors → Scraping robusto (Portugal 2030 JÁ existe!) • Next.js 14 + TypeScript → Interface moderna e rápida • PostgreSQL → Base de dados confiável • Vantagem: Stack simplificado, manutenção mínima, implementação rápida',
    image: 'https://cdn.abacus.ai/images/d932dd9a-77d1-4c25-a006-d912c540133f.jpg',
    type: 'content' as const
  },

  // === MÓDULO 1 ===
  {
    id: 4,
    title: 'MÓDULO 1 - IA de Dados Internos',
    subtitle: 'Consulta Inteligente do Google Drive',
    content: '✅ O que é: Sistema RAG sobre pasta "Candidaturas" (~532GB) • ✅ Funcionalidades: Busca semântica • Citações automáticas • Chat interface • Atualização dinâmica • ✅ Tecnologias: Google File Search API + Gemini 2.0 Flash • ✅ Entregas: Script indexing + Interface chat + Documentação • ✅ Prazo: 1 semana (5 dias úteis)',
    image: 'https://cdn.abacus.ai/images/bcd8cb6f-4cdb-4410-80ec-a147a18a0e93.jpg',
    type: 'module' as const,
    phase: 1
  },

  // === MÓDULO 1 PREÇO ===
  {
    id: 5,
    title: 'Investimento - MÓDULO 1',
    subtitle: 'Primeiro passo da jornada',
    content: '💰 Setup: €1,600 (desenvolvimento) + €100 (APIs) = €1,700 • 📊 Custos mensais: €30-60 (Gemini API) • ⏱️ Prazo: 1 semana • 🎯 Inclui: Script indexing + Chat interface + Documentação completa + 1 mês suporte',
    image: 'https://cdn.abacus.ai/images/cb833bef-0565-44f0-8886-933e6218cddf.jpg',
    type: 'price' as const,
    phase: 1
  },

  // === MÓDULO 2 ===
  {
    id: 6,
    title: 'MÓDULO 2 - Scraping Automático',
    subtitle: '6 Sites de Financiamento',
    content: '✅ O que é: Extração automática de avisos de 6 sites • ✅ Sites cobertos: Portugal 2030 (Actor JÁ existe!) • PRR • PEPAC • Europa Criativa • Horizon Europe • IPDJ • ✅ Funcionalidades: Deteção <24h • Schedules automáticos • Webhooks • Dashboard PostgreSQL • ✅ Prazo: 2 semanas (após Módulo 1)',
    image: 'https://cdn.abacus.ai/images/ef252f45-064a-4dd4-a3fd-88a16e7eca05.png',
    type: 'module' as const,
    phase: 2
  },

  // === MÓDULO 2 PREÇO ===
  {
    id: 7,
    title: 'Investimento - MÓDULO 2',
    subtitle: 'Segundo passo - Expandir horizontes',
    content: '💰 Setup: €2,180 (desenvolvimento) + €0 (reutiliza APIs) = €2,180 • 📊 Custos mensais: +€10-20 (Apify) • ⏱️ Prazo: 2 semanas • 🎯 Inclui: 6 Apify Actors + Schedules + Webhooks + Dashboard + 1 mês suporte • 📌 NOTA: Requer Módulo 1 implementado',
    image: 'https://cdn.abacus.ai/images/cb833bef-0565-44f0-8886-933e6218cddf.jpg',
    type: 'price' as const,
    phase: 2
  },

  // === MÓDULO 3 ===
  {
    id: 8,
    title: 'MÓDULO 3 - IA de Conteúdo Aprofundado',
    subtitle: 'Análise Profunda de PDFs',
    content: '✅ O que é: Processamento completo de PDFs dos avisos • ✅ Funcionalidades: Q&A especializado • Extração de requisitos • Análise de taxas e elegibilidade • Busca em documentos regulamentares • ✅ Tecnologias: Reutiliza File Search do Módulo 1 • ✅ Prazo: 1.5 semanas (após Módulo 2)',
    image: 'https://cdn.abacus.ai/images/7994875e-28f2-4e86-b4e9-fd1c1c2d8e3a.jpg',
    type: 'module' as const,
    phase: 3
  },

  // === MÓDULO 3 PREÇO ===
  {
    id: 9,
    title: 'Investimento - MÓDULO 3',
    subtitle: 'Terceiro passo - IA Profunda',
    content: '💰 Setup adicional: €380 (desenvolvimento) • 📊 TOTAL M1+M2+M3: €4,260 • 📊 Custos mensais: €45-90 (todas APIs) • ⏱️ Prazo: 1.5 semanas • 🎯 Inclui: Pipeline PDFs + Interface Q&A + Extração requisitos + 1 mês suporte • 📌 NOTA: Requer Módulos 1 e 2 implementados',
    image: 'https://cdn.abacus.ai/images/cb833bef-0565-44f0-8886-933e6218cddf.jpg',
    type: 'price' as const,
    phase: 3
  },

  // === PACOTE COMPLETO ===
  {
    id: 10,
    title: 'PACOTE COMPLETO - Todos os Módulos',
    subtitle: 'Implementação End-to-End ⭐ MELHOR VALOR',
    content: '✅ Inclui: Módulo 1 + Módulo 2 + Módulo 3 • 💰 Setup: €4,260 (64h desenvolvimento a €65/h + €100 APIs) • 📊 Custos mensais: €45-90 • ⏱️ Prazo total: 3.5 semanas • 🎯 Vantagens: Preço reduzido (€65/h vs €80/h) • Sistema completo testado • 3 meses suporte incluído • Treinamento 4h • Documentação completa',
    image: 'https://cdn.abacus.ai/images/e70225df-fe46-49bd-a32b-4cdd1ae917d1.jpg',
    type: 'package' as const
  },

  // === RESUMO INVESTIMENTO ===
  {
    id: 11,
    title: 'Resumo de Investimento',
    subtitle: 'Comparativo de Opções',
    content: 'PROPOSTA A - Módulo 1: €1,700 setup | €30-60/mês | 1 semana • PROPOSTA B - Módulos 1+2: €3,880 setup | €40-80/mês | 2 semanas • PROPOSTA C - Todos os Módulos: €4,260 setup | €45-90/mês | 3.5 semanas ⭐ MELHOR VALOR • 🎯 Recomendação: Proposta C traz sistema completo com economia de €960 vs comprar separadamente',
    image: 'https://cdn.abacus.ai/images/a3b465f6-4b27-41b7-b85d-1b4ed4dfec26.jpg',
    type: 'comparison' as const
  },

  // === TIMELINE ===
  {
    id: 12,
    title: 'Timeline de Implementação',
    subtitle: 'Cronograma Progressivo',
    content: 'SEMANA 1: Módulo 1 - Setup Google File Search + Indexing + Chat • SEMANA 2-3: Módulo 2 - Criar Actors PRR + PEPAC + Outros sites + Schedules • SEMANA 4-5: Módulo 3 - Pipeline PDFs + Q&A Interface + Extração requisitos • SEMANA 6: Integração final + Testes end-to-end + Deploy produção • Total: 6 semanas para sistema completo',
    image: 'https://cdn.abacus.ai/images/532f775c-d71b-47ed-9670-1a330ffb2172.jpg',
    type: 'timeline' as const
  },

  // === VALOR AGREGADO ===
  {
    id: 13,
    title: 'Valor Incluído',
    subtitle: 'O que recebes em cada fase',
    content: '✅ Google File Search - RAG gerido, zero manutenção • ✅ Apify Actor Portugal2030 JÁ implementado • ✅ Código-fonte 100% funcional • ✅ Documentação técnica completa • ✅ Suporte pós-entrega (1-3 meses) • ✅ Treinamento da equipa (2-4h) • ✅ Atualizações e melhorias contínuas',
    image: 'https://cdn.abacus.ai/images/7676b629-024a-47c5-8f5b-14b85380d8e1.jpg',
    type: 'content' as const
  },

  // === PRÓXIMOS PASSOS ===
  {
    id: 14,
    title: 'Próximos Passos',
    subtitle: 'Como começar',
    content: '1️⃣ Escolher ponto de partida (Módulo 1 ou Pacote) • 2️⃣ Assinatura de contrato/ acordo • 3️⃣ 40% pagamento inicial • 4️⃣ Kick-off meeting - Definição detalhada do scope • 5️⃣ Desenvolvimento iterativo com demos semanais • 6️⃣ 30% entrega de cada módulo • 7️⃣ 30% final após integração completa',
    image: 'https://cdn.abacus.ai/images/cb833bef-0565-44f0-8886-933e6218cddf.jpg',
    type: 'next' as const
  },

  // === CONTACTO ===
  {
    id: 15,
    title: 'Vamos Começar?',
    subtitle: 'Contacto',
    content: '📧 Email: bilal.machraa@gmail.com • 🏢 Empresa: AiParaTi • 📅 Disponibilidade: Imediata • 💬 Estou disponível para uma reunião de esclarecimentos ou para ajustar a proposta às vossas necessidades específicas.',
    image: 'https://cdn.abacus.ai/images/35a46d1c-e485-406c-918d-d6f6965aef35.png',
    type: 'contact' as const,
    hasButton: true
  }
]

export function CommercialPresentationComponent() {
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
            <div className="text-sm text-gray-300">
              Proposta Comercial - Módulos Progressivos
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
                          FASE {currentSlideData.phase}
                        </div>
                      )}
                      {currentSlideData.type === 'package' && (
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-medium mb-4">
                          <Star className="w-4 h-4 mr-1 fill-current" />
                          MELHOR VALOR
                        </div>
                      )}
                      <h1 className="text-4xl lg:text-5xl font-bold mb-3 text-white">
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

                        const isPrice = trimmed.includes('💰') || trimmed.includes('Setup:') || trimmed.includes('setup')
                        const isHighlight = trimmed.startsWith('✅') || trimmed.includes('🎁') || trimmed.includes('⏱️')
                        const isDiscount = trimmed.includes('DESCONTO') || trimmed.includes('Economia')

                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + index * 0.08 }}
                            className={`flex items-start space-x-3 ${
                              isDiscount ? 'bg-amber-500/20 -mx-4 px-4 py-2 rounded-lg border-l-4 border-amber-500' : ''
                            }`}
                          >
                            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                              isPrice ? 'bg-green-400' : isDiscount ? 'bg-amber-400' : isHighlight ? 'bg-blue-400' : 'bg-gray-400'
                            }`} />
                            <p className="text-gray-300 leading-relaxed text-sm lg:text-base whitespace-pre-line">
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
                        <a href="mailto:bilal.machraa@gmail.com?subject=TA Consulting Platform - Proposta Comercial">
                          <Button
                            size="lg"
                            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-4 text-lg"
                          >
                            Contactar para Fechar Proposta
                          </Button>
                        </a>
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
          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-1.5 mb-4">
            <div
              className="bg-gradient-to-r from-blue-400 to-green-400 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
            />
          </div>

          {/* Slide Indicators */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {slides.map((slide, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentSlide
                      ? 'bg-blue-400 scale-125'
                      : slide.phase ? `bg-${slide.phase === 1 ? 'blue' : slide.phase === 2 ? 'purple' : 'pink'}-600` : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                  title={`Fase ${slide.phase || 'Slide ' + (index + 1)}`}
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
