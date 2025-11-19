
'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Home, Play, Pause, RotateCcw, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'

const slides = [
  {
    id: 1,
    title: 'Automação de Fundos Europeus',
    subtitle: 'TA Consulting',
    content: 'Transformando a gestão de incentivos financeiros através da tecnologia',
    image: 'https://cdn.abacus.ai/images/35a46d1c-e485-406c-918d-d6f6965aef35.png',
    type: 'cover' as const
  },
  {
    id: 2,
    title: 'O Desafio',
    subtitle: 'Problemas dos Processos Manuais',
    content: 'Monitorização manual de portais • Oportunidades perdidas por falta de tempo • Processos lentos e propensos a erros • Documentação desorganizada • Follow-up inconsistente',
    image: 'https://cdn.abacus.ai/images/63f6a798-9dca-4c09-b2f3-e41eb8d28dcb.png',
    type: 'content' as const
  },
  {
    id: 3,
    title: 'A Solução',
    subtitle: 'Visão Geral da Automação',
    content: 'Sistema integrado que automatiza todo o ciclo: Scraping automático → Validação inteligente → Pré-preenchimento → Follow-up automatizado → Relatórios em tempo real',
    image: 'https://cdn.abacus.ai/images/d932dd9a-77d1-4c25-a006-d912c540133f.jpg',
    type: 'content' as const
  },
  {
    id: 4,
    title: 'Arquitetura do Sistema',
    subtitle: 'Fluxo Completo de Dados',
    content: 'Portais Governamentais → API Scraping → Base de Dados → Dashboard → Workflows → Notificações Email → Relatórios',
    image: 'https://cdn.abacus.ai/images/22d7511e-45ba-49f3-be23-810d44aefd1a.jpg',
    type: 'content' as const
  },
  {
    id: 5,
    title: 'Workflow 1: Scraping Automático',
    subtitle: 'Monitorização 24/7 dos Portais',
    content: 'Portugal 2030 • PAPAC • PRR → Execução a cada 6 horas → Deteção automática de novos avisos → Extração de dados estruturados → Alertas para avisos urgentes (<8 dias)',
    image: 'https://cdn.abacus.ai/images/bcd8cb6f-4cdb-4410-80ec-a147a18a0e93.jpg',
    type: 'workflow' as const
  },
  {
    id: 6,
    title: 'Workflow 2: Pré-preenchimento',
    subtitle: 'Automatização de Candidaturas',
    content: 'Integração com Google Sheets → Mapeamento automático de dados → Preenchimento inteligente de formulários → Alertas para CAPTCHA → Validação antes do envio',
    image: 'https://cdn.abacus.ai/images/7994875e-28f2-4e86-b4e9-fd1c1c2d8e3a.jpg',
    type: 'workflow' as const
  },
  {
    id: 7,
    title: 'Workflow 3: Validação Documental',
    subtitle: 'Compliance Automática',
    content: 'Checklist automática por aviso → Verificação de validades → Alertas de expiração (30/15/7 dias) → Upload centralizado → Status em tempo real',
    image: 'https://cdn.abacus.ai/images/1565e341-af5a-4db2-90d8-68f89f31631d.jpg',
    type: 'workflow' as const
  },
  {
    id: 8,
    title: 'Workflow 4: Follow-up & Reporting',
    subtitle: 'Comunicação Automatizada',
    content: 'Emails automáticos para clientes → Relatórios mensais personalizados → Updates de estado de candidaturas → Dashboard em tempo real → Notificações inteligentes',
    image: 'https://cdn.abacus.ai/images/7676b629-024a-47c5-8f5b-14b85380d8e1.jpg',
    type: 'workflow' as const
  },
  {
    id: 9,
    title: 'Workflow 5: Prospecção',
    subtitle: 'Identificação Automática de Clientes',
    content: 'Scraping RACIUS/INE → Filtros por elegibilidade → Cross-matching com avisos → Outreach personalizado → Lead scoring automático',
    image: 'https://cdn.abacus.ai/images/ef252f45-064a-4dd4-a3fd-88a16e7eca05.png',
    type: 'workflow' as const
  },
  {
    id: 10,
    title: 'Best Practices',
    subtitle: 'Princípios de Automação Segura',
    content: 'Contexto detalhado em cada prompt → Instruções sequenciais claras → Robustez com fallbacks → Conformidade RGPD → Revisão humana obrigatória',
    image: 'https://cdn.abacus.ai/images/532f775c-d71b-47ed-9670-1a330ffb2172.jpg',
    type: 'content' as const
  },
  {
    id: 11,
    title: 'ROI & Benefícios',
    subtitle: 'Impacto Quantificável',
    content: 'Tempo poupado: 80% → Taxa de sucesso: +45% → Oportunidades capturadas: +200% → Erro humano: -90% → Satisfação do cliente: +60%',
    image: 'https://cdn.abacus.ai/images/e70225df-fe46-49bd-a32b-4cdd1ae917d1.jpg',
    type: 'content' as const
  },
  {
    id: 12,
    title: 'Demo do Dashboard',
    subtitle: 'Preview das Funcionalidades',
    content: 'Monitorização em tempo real → Gestão de candidaturas → Analytics avançados → Calendário de deadlines → Gestão documental → Workflows configuráveis',
    image: 'https://cdn.abacus.ai/images/a3b465f6-4b27-41b7-b85d-1b4ed4dfec26.jpg',
    type: 'demo' as const,
    hasButton: true
  },
  {
    id: 13,
    title: 'Casos Práticos',
    subtitle: 'Exemplos Reais de Sucesso',
    content: 'TechInovação Lda: €35.000 aprovados em Digitalização PME → EcoSustentável SA: €120.000 em Eficiência Energética → AgroInova: Candidatura PAPAC em preparação',
    image: 'https://cdn.abacus.ai/images/193f9e19-7368-4b0a-a03c-cae6ac075489.png',
    type: 'content' as const
  },
  {
    id: 14,
    title: 'Próximos Passos',
    subtitle: 'Como Começar',
    content: 'Formação da equipa → Configuração de workflows → Migração de dados → Testes piloto → Implementação gradual → Suporte contínuo',
    image: 'https://cdn.abacus.ai/images/cb833bef-0565-44f0-8886-933e6218cddf.jpg',
    type: 'content' as const
  }
]

export function PresentationComponent() {
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

  const copySlideContent = () => {
    const slide = slides[currentSlide]
    const content = `${slide.title}\n\n${slide.subtitle}\n\n${slide.content}`
    navigator.clipboard.writeText(content)
    toast.success('Conteúdo do slide copiado!')
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

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* Header Controls */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <Home className="w-4 h-4 mr-2" />
                Início
              </Button>
            </Link>
            <div className="text-sm text-gray-300">
              TA Consulting - Automação de Fundos Europeus
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className="text-white hover:bg-white/10"
            >
              {isAutoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetPresentation}
              className="text-white hover:bg-white/10"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={copySlideContent}
              className="text-white hover:bg-white/10"
            >
              <Copy className="w-4 h-4" />
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
              <div className={`space-y-8 ${currentSlideData.type === 'cover' ? 'lg:order-1' : ''}`}>
                {currentSlideData.type === 'cover' ? (
                  <div className="text-center lg:text-left">
                    <motion.h1
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-6xl lg:text-7xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent"
                    >
                      {currentSlideData.title}
                    </motion.h1>
                    <motion.h2
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-4xl font-semibold mb-6 text-gray-300"
                    >
                      {currentSlideData.subtitle}
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
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
                      <h1 className="text-5xl lg:text-6xl font-bold mb-4 text-white">
                        {currentSlideData.title}
                      </h1>
                      <h2 className="text-2xl lg:text-3xl font-medium text-blue-400 mb-8">
                        {currentSlideData.subtitle}
                      </h2>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="space-y-4"
                    >
                      {currentSlideData.content.split(' → ').map((point, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + index * 0.1 }}
                          className="flex items-start space-x-3"
                        >
                          <div className="w-2 h-2 bg-green-400 rounded-full mt-3 flex-shrink-0" />
                          <p className="text-lg text-gray-300 leading-relaxed">
                            {point.trim()}
                          </p>
                        </motion.div>
                      ))}
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
                            Explorar Dashboard
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
                  className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-gray-800"
                >
                  <Image
                    src={currentSlideData.image}
                    alt={currentSlideData.title}
                    fill
                    className="object-cover"
                    priority={currentSlide <= 2}
                  />
                  {/* Overlay gradient for better text contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 to-transparent" />
                </motion.div>
                
                {/* Slide type indicator */}
                {currentSlideData.type === 'workflow' && (
                  <div className="absolute -top-4 -right-4 bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                    Workflow
                  </div>
                )}
                {currentSlideData.type === 'demo' && (
                  <div className="absolute -top-4 -right-4 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                    Demo
                  </div>
                )}
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
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-black/20 backdrop-blur-sm">
        <div className="px-8 py-4">
          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-1 mb-4">
            <div
              className="bg-gradient-to-r from-blue-400 to-green-400 h-1 rounded-full transition-all duration-300"
              style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
            />
          </div>

          {/* Slide Indicators */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentSlide
                      ? 'bg-blue-400 scale-125'
                      : 'bg-gray-600 hover:bg-gray-500'
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
