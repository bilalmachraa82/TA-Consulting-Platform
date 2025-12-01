
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Presentation, BarChart3, Users, FileText, Clock, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-sm border-b shadow-sm z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">TA</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">TA Consulting</h1>
                <p className="text-sm text-gray-600">Automação de Fundos Europeus</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
                Início
              </Link>
              <Link href="/apresentacao" className="text-gray-700 hover:text-blue-600 transition-colors">
                Apresentação
              </Link>
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 transition-colors">
                Dashboard
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
              <CheckCircle className="w-4 h-4 mr-2" />
              Solução Completa de Automação
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Automatize os seus{' '}
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Fundos Europeus
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Plataforma inteligente para monitorização automática de avisos, pré-preenchimento de candidaturas 
              e gestão completa dos seus clientes nos portais Portugal 2030, PEPAC e PRR.
            </p>
          </div>

          {/* Hero Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/apresentacao">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
                <Presentation className="w-5 h-5 mr-2" />
                Ver Apresentação
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="border-green-600 text-green-700 hover:bg-green-50 px-8 py-4 text-lg">
                <BarChart3 className="w-5 h-5 mr-2" />
                Aceder ao Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Hero Image */}
          <div className="relative max-w-4xl mx-auto">
            <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl bg-white">
              <Image
                src="https://cdn.abacus.ai/images/a3b465f6-4b27-41b7-b85d-1b4ed4dfec26.jpg"
                alt="Dashboard de Automação TA Consulting"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Dois Componentes, Uma Solução Completa
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Conheça a nossa formação interativa e explore o dashboard funcional 
              para gestão completa de fundos europeus.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Componente A - Apresentação */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center mb-4">
                  <Presentation className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Apresentação Interativa</CardTitle>
                <CardDescription className="text-gray-600 text-base">
                  Formação completa sobre automação de fundos europeus
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative aspect-video rounded-lg overflow-hidden mb-4">
                  <Image
                    src="https://cdn.abacus.ai/images/35a46d1c-e485-406c-918d-d6f6965aef35.png"
                    alt="Apresentação TA Consulting"
                    fill
                    className="object-cover"
                  />
                </div>
                <ul className="space-y-2 text-sm text-gray-600 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    14 slides profissionais com navegação interativa
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    Workflows detalhados de automação
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    Best practices e casos práticos
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    ROI e análise de benefícios
                  </li>
                </ul>
                <Link href="/apresentacao" className="block">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 group-hover:shadow-lg transition-all">
                    <Presentation className="w-4 h-4 mr-2" />
                    Iniciar Apresentação
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Componente B - Dashboard */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-lg bg-green-600 flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Dashboard Funcional</CardTitle>
                <CardDescription className="text-gray-600 text-base">
                  Plataforma completa para gestão de fundos europeus
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative aspect-video rounded-lg overflow-hidden mb-4">
                  <Image
                    src="https://cdn.abacus.ai/images/22d7511e-45ba-49f3-be23-810d44aefd1a.jpg"
                    alt="Dashboard TA Consulting"
                    fill
                    className="object-cover"
                  />
                </div>
                <ul className="space-y-2 text-sm text-gray-600 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    Monitorização automática de avisos
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    Gestão de empresas e candidaturas
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    Workflows de automação configuráveis
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    Relatórios e analytics detalhados
                  </li>
                </ul>
                <Link href="/dashboard" className="block">
                  <Button className="w-full bg-green-600 hover:bg-green-700 group-hover:shadow-lg transition-all">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Abrir Dashboard
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="text-white">
              <div className="flex items-center justify-center mb-2">
                <FileText className="w-8 h-8" />
              </div>
              <div className="text-3xl font-bold mb-1">3</div>
              <div className="text-blue-100 text-sm">Portais Monitorizados</div>
            </div>
            <div className="text-white">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-8 h-8" />
              </div>
              <div className="text-3xl font-bold mb-1">5+</div>
              <div className="text-blue-100 text-sm">Empresas Clientes</div>
            </div>
            <div className="text-white">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-8 h-8" />
              </div>
              <div className="text-3xl font-bold mb-1">24/7</div>
              <div className="text-blue-100 text-sm">Monitorização</div>
            </div>
            <div className="text-white">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div className="text-3xl font-bold mb-1">5</div>
              <div className="text-blue-100 text-sm">Workflows Ativos</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Pronto para Automatizar?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Explore a apresentação de formação ou teste o dashboard funcional 
            para descobrir como podemos transformar os seus processos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/apresentacao">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4">
                <Presentation className="w-5 h-5 mr-2" />
                Começar pela Apresentação
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="border-green-600 text-green-700 hover:bg-green-50 px-8 py-4">
                <BarChart3 className="w-5 h-5 mr-2" />
                Testar o Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold">TA</span>
              </div>
              <div>
                <div className="font-semibold text-gray-900">TA Consulting</div>
                <div className="text-sm text-gray-600">Automação de Fundos Europeus</div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              © 2024 TA Consulting. Especialistas em incentivos financeiros.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
