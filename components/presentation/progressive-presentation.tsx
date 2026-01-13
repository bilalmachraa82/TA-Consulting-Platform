'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Home, Play, Pause, RotateCcw, Check, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { toast } from 'sonner'

const slides = [
  // === CAPA ===
  {
    id: 1,
    title: 'TA Consulting Platform',
    subtitle: 'Consultancy OS - Automação IA',
    content: 'Transforme a gestão de fundos europeus com inteligência artificial',
    type: 'cover' as const
  },

  // === O PEDIDO ===
  {
    id: 2,
    title: 'O Pedido',
    subtitle: 'Sistema Inteligente em 3 Módulos Progressivos',
    content: 'MÓDULO 1: IA de Dados Internos • Consulta inteligente da pasta "Candidaturas" (~532GB) • Sistema RAG com citações automáticas\n\nMÓDULO 2: Scraping Automático • 6 sites de financiamentos (Portugal 2030, PRR, PEPAC, Europa Criativa, Horizon Europe, IPDJ) • Avisos detectados em <24h\n\nMÓDULO 3: IA Profunda • Análise completa de PDFs • Q&A sobre requisitos e critérios',
    type: 'content' as const
  },

  // === STACK TECNOLÓGICO ===
  {
    id: 3,
    title: 'Stack Tecnológico',
    subtitle: 'Ferramentas Modernas e Robustas',
    content: 'Google File Search API + Gemini 2.0 Flash → RAG gerido, zero manutenção • Apify Actors → Scraping robusto (Portugal 2030 JÁ existe!) • Next.js 14 + TypeScript → Interface moderna e rápida • PostgreSQL → Base de dados confiável • Vantagem: Stack simplificado, manutenção mínima, implementação rápida',
    type: 'content' as const
  },

  // === MÓDULO 1 ===
  {
    id: 4,
    title: 'MÓDULO 1 - IA de Dados Internos',
    subtitle: 'Consulta Inteligente do Google Drive',
    content: '✅ O que é: Sistema RAG sobre pasta "Candidaturas" (~532GB) • ✅ Funcionalidades: Busca semântica • Citações automáticas • Chat interface • Atualização dinâmica • ✅ Tecnologias: Google File Search API + Gemini 2.0 Flash • ✅ Entregas: Script indexing + Interface chat + Documentação • ✅ Prazo: 1 semana (5 dias úteis)',
    type: 'module' as const,
    phase: 1
  },

  // === MÓDULO 1 PREÇO ===
  {
    id: 5,
    title: 'Investimento - MÓDULO 1',
    subtitle: 'Primeiro passo da jornada',
    content: '💰 Setup: €1,600 (desenvolvimento) + €100 (APIs) = €1,700 • 📊 Custos mensais: €30-60 (Gemini API) • ⏱️ Prazo: 1 semana • 🎯 Inclui: Script indexing + Chat interface + Documentação completa + 1 mês suporte',
    type: 'price' as const,
    phase: 1
  },

  // === MÓDULO 2 ===
  {
    id: 6,
    title: 'MÓDULO 2 - Scraping Automático',
    subtitle: '6 Sites de Financiamento',
    content: '✅ O que é: Extração automática de avisos de 6 sites • ✅ Sites cobertos: Portugal 2030 (Actor JÁ existe!) • PRR • PEPAC • Europa Criativa • Horizon Europe • IPDJ • ✅ Funcionalidades: Deteção <24h • Schedules automáticos • Webhooks • Dashboard PostgreSQL • ✅ Prazo: 2 semanas (após Módulo 1)',
    type: 'module' as const,
    phase: 2
  },

  // === MÓDULO 2 PREÇO ===
  {
    id: 7,
    title: 'Investimento - MÓDULO 2',
    subtitle: 'Segundo passo - Expandir horizontes',
    content: '💰 Setup: €2,180 (desenvolvimento) + €0 (reutiliza APIs) = €2,180 • 📊 Custos mensais: +€10-20 (Apify) • ⏱️ Prazo: 2 semanas • 🎯 Inclui: 6 Apify Actors + Schedules + Webhooks + Dashboard + 1 mês suporte • 📌 NOTA: Requer Módulo 1 implementado',
    type: 'price' as const,
    phase: 2
  },

  // === MÓDULO 3 ===
  {
    id: 8,
    title: 'MÓDULO 3 - IA de Conteúdo Aprofundado',
    subtitle: 'Análise Profunda de PDFs',
    content: '✅ O que é: Processamento completo de PDFs dos avisos • ✅ Funcionalidades: Q&A especializado • Extração de requisitos • Análise de taxas e elegibilidade • Busca em documentos regulamentares • ✅ Tecnologias: Reutiliza File Search do Módulo 1 • ✅ Prazo: 1.5 semanas (após Módulo 2)',
    type: 'module' as const,
    phase: 3
  },

  // === MÓDULO 3 PREÇO ===
  {
    id: 9,
    title: 'Investimento - MÓDULO 3',
    subtitle: 'Terceiro passo - IA Profunda',
    content: '💰 Setup adicional: €380 (desenvolvimento) • 📊 TOTAL M1+M2+M3: €4,260 • 📊 Custos mensais: €45-90 (todas APIs) • ⏱️ Prazo: 1.5 semanas • 🎯 Inclui: Pipeline PDFs + Q&A Interface + Extração requisitos + 1 mês suporte • 📌 NOTA: Requer Módulos 1 e 2 implementados',
    type: 'price' as const,
    phase: 3
  },

  // === PACOTE COMPLETO ===
  {
    id: 10,
    title: 'PACOTE COMPLETO - Todos os Módulos',
    subtitle: 'Implementação End-to-End ⭐ MELHOR VALOR',
    content: '✅ Inclui: Módulo 1 + Módulo 2 + Módulo 3 • 💰 Setup: €4,260 (64h desenvolvimento a €65/h + €100 APIs) • 📊 Custos mensais: €45-90 • ⏱️ Prazo total: 3.5 semanas • 🎯 Vantagens: Preço reduzido (€65/h vs €80/h) • Sistema completo testado • 3 meses suporte incluído • Treinamento 4h • Documentação completa',
    type: 'package' as const
  },

  // === RESUMO INVESTIMENTO ===
  {
    id: 11,
    title: 'Resumo de Investimento',
    subtitle: 'Comparativo de Opções',
    content: 'PROPOSTA A - Módulo 1: €1,700 setup | €30-60/mês | 1 semana • PROPOSTA B - Módulos 1+2: €3,880 setup | €40-80/mês | 2 semanas • PROPOSTA C - Todos os Módulos: €4,260 setup | €45-90/mês | 3.5 semanas ⭐ MELHOR VALOR • 🎯 Recomendação: Proposta C traz sistema completo com economia de €960 vs comprar separadamente',
    type: 'comparison' as const
  },

  // === TIMELINE ===
  {
    id: 12,
    title: 'Timeline de Implementação',
    subtitle: 'Cronograma Progressivo',
    content: 'SEMANA 1: Módulo 1 - Setup Google File Search + Indexing + Chat • SEMANA 2-3: Módulo 2 - Criar Actors PRR + PEPAC + Outros sites + Schedules • SEMANA 4-5: Módulo 3 - Pipeline PDFs + Q&A Interface + Extração requisitos • SEMANA 6: Integração final + Testes end-to-end + Deploy produção • Total: 6 semanas para sistema completo',
    type: 'timeline' as const
  },

  // === VALOR AGREGADO ===
  {
    id: 13,
    title: 'Valor Incluído',
    subtitle: 'O que recebes em cada fase',
    content: '✅ Google File Search - RAG gerido, zero manutenção • ✅ Apify Actor Portugal2030 JÁ implementado • ✅ Código-fonte 100% funcional • ✅ Documentação técnica completa • ✅ Suporte pós-entrega (1-3 meses) • ✅ Treinamento da equipa (2-4h) • ✅ Atualizações e melhorias contínuas',
    type: 'content' as const
  },

  // === PRÓXIMOS PASSOS ===
  {
    id: 14,
    title: 'Próximos Passos',
    subtitle: 'Como começar',
    content: '1️⃣ Escolher ponto de partida (Módulo 1 ou Pacote) • 2️⃣ Assinatura de contrato/ acordo • 3️⃣ 40% pagamento inicial • 4️⃣ Kick-off meeting - Definição detalhada do scope • 5️⃣ Desenvolvimento iterativo com demos semanais • 6️⃣ 30% entrega de cada módulo • 7️⃣ 30% final após integração completa',
    type: 'next' as const
  },

  // === CONTACTO ===
  {
    id: 15,
    title: 'Vamos Começar?',
    subtitle: 'Contacto',
    content: '📧 Email: bilal.machraa@gmail.com • 🏢 Empresa: AiParaTi • 📅 Disponibilidade: Imediata • 💬 Estou disponível para uma reunião de esclarecimentos ou para ajustar a proposta às vossas necessidades específicas.',
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden flex flex-col">
      {/* Header Controls */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center justify-between p-4 max-w-7xl mx-auto w-full">
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
      <div className="flex-1 relative flex items-center justify-center p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="w-full max-w-5xl mx-auto"
          >
            <div className="text-center space-y-8">
              {/* Header / Title Section */}
              <div className="space-y-4">
                {currentSlideData.phase && (
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className={`inline-flex items-center px-6 py-2 rounded-full bg-gradient-to-r ${getPhaseColor(currentSlideData.phase)} text-white font-semibold shadow-lg`}
                  >
                    FASE {currentSlideData.phase}
                  </motion.div>
                )}

                {currentSlideData.type === 'package' && (
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="inline-flex items-center px-6 py-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold shadow-lg"
                  >
                    <Star className="w-5 h-5 mr-2 fill-current" />
                    MELHOR VALOR
                  </motion.div>
                )}

                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-blue-200 via-white to-blue-200 bg-clip-text text-transparent"
                >
                  {currentSlideData.title}
                </motion.h1>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl lg:text-3xl font-medium text-blue-300"
                >
                  {currentSlideData.subtitle}
                </motion.h2>
              </div>

              {/* Content Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="max-w-4xl mx-auto mt-8 bg-white/5 backdrop-blur-sm rounded-3xl p-8 lg:p-12 border border-white/10 shadow-2xl"
              >
                <div className="space-y-6 text-left">
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
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className={`flex items-start p-4 rounded-xl transition-colors hover:bg-white/5 ${isDiscount ? 'bg-amber-500/10 border border-amber-500/30' :
                            isPrice ? 'bg-green-500/10 border border-green-500/30' : ''
                          }`}
                      >
                        <div className={`w-3 h-3 rounded-full mt-2 mr-4 flex-shrink-0 ${isPrice ? 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]' :
                            isDiscount ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]' :
                              isHighlight ? 'bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]' : 'bg-gray-400'
                          }`} />
                        <p className="text-gray-200 text-lg lg:text-xl leading-relaxed whitespace-pre-line">
                          {trimmed}
                        </p>
                      </motion.div>
                    )
                  })}
                </div>

                {currentSlideData.hasButton && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-12 text-center"
                  >
                    <a href="mailto:bilal.machraa@gmail.com?subject=TA Consulting Platform - Proposta Comercial">
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-500 hover:to-green-500 text-white px-12 py-6 text-xl rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
                      >
                        Contactar para Fechar Proposta
                      </Button>
                    </a>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <Button
          variant="ghost"
          size="icon"
          onClick={prevSlide}
          className="absolute left-4 lg:left-8 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white hover:bg-white/10 w-16 h-16 rounded-full"
          disabled={currentSlide === 0}
        >
          <ChevronLeft className="w-10 h-10" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={nextSlide}
          className="absolute right-4 lg:right-8 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white hover:bg-white/10 w-16 h-16 rounded-full"
          disabled={currentSlide === slides.length - 1}
        >
          <ChevronRight className="w-10 h-10" />
        </Button>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-black/30 backdrop-blur-sm border-t border-white/10">
        <div className="max-w-7xl mx-auto px-8 py-4">
          {/* Progress Bar */}
          <div className="w-full bg-gray-700/50 rounded-full h-1.5 mb-4 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-blue-400 to-green-400 h-1.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Slide Indicators */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide max-w-[80vw]">
              {slides.map((slide, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`flex-shrink-0 transition-all duration-300 ${index === currentSlide
                      ? 'w-8 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(96,165,250,0.5)]'
                      : 'w-2 h-2 rounded-full ' + (slide.phase ? `bg-${slide.phase === 1 ? 'blue' : slide.phase === 2 ? 'purple' : 'pink'}-600/70` : 'bg-gray-600/70 hover:bg-gray-500')
                    }`}
                  title={`${slide.title}`}
                />
              ))}
            </div>

            <div className="text-sm font-medium text-blue-300 ml-4 whitespace-nowrap">
              Slide {currentSlide + 1} <span className="text-gray-500 mx-1">/</span> {slides.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
