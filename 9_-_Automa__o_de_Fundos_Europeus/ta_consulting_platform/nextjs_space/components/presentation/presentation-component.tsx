
'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Home, Play, Pause, RotateCcw, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'

type SlideType = 'cover' | 'content' | 'workflow' | 'demo';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  content: string;
  image: string;
  type: SlideType;
  hasButton?: boolean;
}

const slides: Slide[] = [
  {
    id: 1,
    title: 'TA Consulting Platform',
    subtitle: 'Automação Inteligente de Fundos Europeus',
    content: 'A plataforma definitiva para consultoras de fundos. Potenciada por Google Gemini 3.0 Pro, com motor financeiro determinístico e compliance automatizada.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop',
    type: 'cover'
  },
  {
    id: 2,
    title: 'O Problema',
    subtitle: 'Processos Manuais e Desconexos',
    content: 'Consultores perdem 15h/semana em tarefas repetitivas → Monitorização manual de avisos → Cálculos financeiros em Excel propensos a erros → Falta de visão global da equipa → Dificuldade em escalar operações.',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2370&auto=format&fit=crop',
    type: 'content'
  },
  {
    id: 3,
    title: 'A Solução: TA Platform',
    subtitle: 'Ecossistema Integrado "All-in-One"',
    content: 'Scraping Diário de Avisos → Motor Financeiro TypeScript (VAL/TIR) → IA Generativa (Gemini 3.0) para Memórias → Gestão de Equipas (RBAC) → Compliance em Tempo Real.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2370&auto=format&fit=crop',
    type: 'content'
  },
  {
    id: 4,
    title: 'Motor Financeiro',
    subtitle: 'Precisão Determinística',
    content: 'Cálculos rigorosos em TypeScript: VAL, TIR, Payback, ROI → Rácios Financeiros Automáticos (Autonomia, Liquidez, EBITDA) → Validação de Elegibilidade Instantânea → Gráficos de Cashflow Interativos.',
    image: 'https://images.unsplash.com/photo-1543286386-713df548e9cc?q=80&w=2370&auto=format&fit=crop',
    type: 'workflow'
  },
  {
    id: 5,
    title: 'Inteligência Artificial',
    subtitle: 'Google Gemini 3.0 Pro',
    content: 'Análise Financeira Qualitativa ("Thinking Mode") → Geração de Memórias Descritivas Completas → Pareceres Técnicos Automáticos → Deteção de Inconsistências e Riscos.',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2532&auto=format&fit=crop',
    type: 'workflow'
  },
  {
    id: 6,
    title: 'Gestão de Equipas (RBAC)',
    subtitle: 'Controlo Total e Segurança',
    content: 'Perfis de Acesso: Admin, Gestor, Consultor → Isolamento de Dados: Consultores só veem as suas empresas → Atribuição dinâmica de clientes → Audit Logs de todas as ações.',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2664&auto=format&fit=crop',
    type: 'workflow'
  },
  {
    id: 7,
    title: 'Resultados Comprovados',
    subtitle: 'Eficiência Operacional',
    content: 'Redução de 80% no tempo de análise → Memórias descritivas em minutos, não dias → Zero erros de cálculo financeiro → Compliance garantida 24/7.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop',
    type: 'content'
  },
  {
    id: 8,
    title: 'Próximos Passos',
    subtitle: 'Roadmap de Inovação',
    content: 'Integração direta com AT/Segurança Social → App Mobile para Consultores → Marketplace de Consultoria → Expansão para Fundos Internacionais.',
    image: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?q=80&w=2370&auto=format&fit=crop',
    type: 'content'
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
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${index === currentSlide
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
