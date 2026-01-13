'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Slide Components
const HeroSlide = () => (
  <div className="flex flex-col justify-center items-center h-full text-center px-20">
    <div className="mb-8">
      <span className="text-sm font-semibold tracking-widest text-slate-500 uppercase">AI-Powered Growth Platform</span>
    </div>
    <h1 className="text-7xl font-bold text-slate-900 mb-6 leading-tight">
      TA Consulting<br />Platform
    </h1>
    <p className="text-2xl text-slate-600 mb-12 max-w-3xl">
      Transforme fundos europeus em crescimento sustentável com Inteligência Artificial
    </p>
    <div className="flex items-center gap-8 text-slate-500">
      <div className="text-center">
        <div className="text-3xl font-bold text-emerald-600">€3.5B+</div>
        <div className="text-sm">Fundos Disponíveis</div>
      </div>
      <div className="w-px h-12 bg-slate-300"></div>
      <div className="text-center">
        <div className="text-3xl font-bold text-blue-800">24k+</div>
        <div className="text-sm">Empresas Potenciais</div>
      </div>
      <div className="w-px h-12 bg-slate-300"></div>
      <div className="text-center">
        <div className="text-3xl font-bold text-emerald-600">10x</div>
        <div className="text-sm">Mais Produtivo</div>
      </div>
    </div>
  </div>
)

const MarketContextSlide = () => (
  <div className="flex flex-col justify-center h-full px-20">
    <span className="text-sm font-semibold tracking-widest text-slate-500 uppercase mb-4">Market Context</span>
    <h2 className="text-5xl font-bold text-slate-900 mb-12">A Oportunidade Única</h2>

    <div className="grid grid-cols-3 gap-8">
      <div className="bg-white p-8 rounded-lg border border-slate-200">
        <div className="text-6xl font-bold text-blue-800 mb-4">€3.5B</div>
        <div className="text-xl text-slate-700 font-semibold mb-2">Fundos Europa 2021-2027</div>
        <div className="text-slate-500">Disponíveis para empresas portuguesas</div>
      </div>

      <div className="bg-white p-8 rounded-lg border border-slate-200">
        <div className="text-6xl font-bold text-emerald-600 mb-4">82%</div>
        <div className="text-xl text-slate-700 font-semibold mb-2">Não Aproveitados</div>
        <div className="text-slate-500">Empresas deixam dinheiro na mesa</div>
      </div>

      <div className="bg-white p-8 rounded-lg border border-slate-200">
        <div className="text-6xl font-bold text-blue-800 mb-4">€140k</div>
        <div className="text-xl text-slate-700 font-semibold mb-2">Valor Médio</div>
        <div className="text-slate-500">Por projeto aprovado</div>
      </div>
    </div>

    <div className="mt-12 bg-blue-50 p-6 rounded-lg border-l-4 border-blue-800">
      <p className="text-lg text-slate-700">
        <span className="font-bold text-blue-800">Oportunidade:</span> Com a IA certa, consultores podem 10x a produtividade e ajudar mais empresas a acederem a estes fundos.
      </p>
    </div>
  </div>
)

const ProblemSlide = () => (
  <div className="flex flex-col justify-center h-full px-20">
    <span className="text-sm font-semibold tracking-widest text-slate-500 uppercase mb-4">The Problem</span>
    <h2 className="text-5xl font-bold text-slate-900 mb-12">O Desafio dos Consultores</h2>

    <div className="grid grid-cols-2 gap-12">
      <div>
        <div className="bg-slate-900 p-8 rounded-lg mb-8">
          <div className="text-5xl font-bold text-emerald-500 mb-2">24,000+</div>
          <div className="text-xl text-slate-300">Empresas no Bitrix</div>
        </div>

        <h3 className="text-2xl font-bold text-slate-900 mb-6">O Que Está A Falhar:</h3>
        <ul className="space-y-4">
          <li className="flex items-start gap-4">
            <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
            <div>
              <div className="font-semibold text-slate-900">Zero Enriquecimento Automático</div>
              <div className="text-slate-600">Dados desatualizados sobre empresas</div>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
            <div>
              <div className="font-semibold text-slate-900">Propostas Manuais</div>
              <div className="text-slate-600">Horas perdidas em copy-paste</div>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
            <div>
              <div className="font-semibold text-slate-900">Sem Follow-up Automático</div>
              <div className="text-slate-600">Leads esfriam sem resposta</div>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
            <div>
              <div className="font-semibold text-slate-900">Gestão Pós-Awards Manual</div>
              <div className="text-slate-600">Milestones e pagamentos sem automação</div>
            </div>
          </li>
        </ul>
      </div>

      <div className="flex flex-col justify-center">
        <div className="bg-slate-100 p-8 rounded-lg">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Impacto No Negócio</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-700">Produtividade</span>
                <span className="font-bold text-red-600">-40%</span>
              </div>
              <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-700">Conversão</span>
                <span className="font-bold text-red-600">-60%</span>
              </div>
              <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-700">Revenue por Consultor</span>
                <span className="font-bold text-red-600">-50%</span>
              </div>
              <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: '35%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

const SolutionSlide = () => (
  <div className="flex flex-col justify-center h-full px-20">
    <span className="text-sm font-semibold tracking-widest text-slate-500 uppercase mb-4">The Solution</span>
    <h2 className="text-5xl font-bold text-slate-900 mb-12">AI Layer Sobre Bitrix</h2>

    <div className="grid grid-cols-2 gap-12 items-center">
      <div className="space-y-6">
        <p className="text-xl text-slate-700 leading-relaxed">
          Não substituímos o Bitrix. <span className="font-bold text-blue-800">Potenciamo</span> com uma camada de IA que automatiza o trabalho repetitivo.
        </p>

        <div className="space-y-4">
          <div className="flex items-center gap-4 bg-emerald-50 p-4 rounded-lg">
            <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center text-white text-xl font-bold">1</div>
            <div>
              <div className="font-semibold text-slate-900">Enriquecimento Automático</div>
              <div className="text-slate-600 text-sm">Company Intelligence API em tempo real</div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-emerald-50 p-4 rounded-lg">
            <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center text-white text-xl font-bold">2</div>
            <div>
              <div className="font-semibold text-slate-900">Geração Inteligente</div>
              <div className="text-slate-600 text-sm">Propostas, emails, documentos</div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-emerald-50 p-4 rounded-lg">
            <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center text-white text-xl font-bold">3</div>
            <div>
              <div className="font-semibold text-slate-900">Automação Contínua</div>
              <div className="text-slate-600 text-sm">Drip campaigns, follow-ups, Slack</div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="bg-slate-900 p-8 rounded-lg">
          <div className="text-center mb-8">
            <div className="text-slate-400 text-sm mb-2">ECOSISTEMA</div>
            <div className="text-2xl font-bold text-white">TA Platform</div>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-800 p-4 rounded-lg">
              <div className="text-white font-semibold">AI Layer</div>
              <div className="text-slate-300 text-sm">OpenAI GPT-4 + Claude 3.5</div>
            </div>

            <div className="text-center text-slate-500">↓ Sync Bidirecional ↓</div>

            <div className="bg-slate-700 p-4 rounded-lg">
              <div className="text-white font-semibold">Bitrix24</div>
              <div className="text-slate-400 text-sm">CRM + Gestão de Projetos</div>
            </div>

            <div className="text-center text-slate-500">↓</div>

            <div className="bg-slate-700 p-4 rounded-lg">
              <div className="text-white font-semibold">24k Empresas</div>
              <div className="text-slate-400 text-sm">Base de dados existente</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

const PillarsSlide = () => (
  <div className="flex flex-col justify-center h-full px-20">
    <span className="text-sm font-semibold tracking-widest text-slate-500 uppercase mb-4">Premium Features</span>
    <h2 className="text-5xl font-bold text-slate-900 mb-4">8 Pilares Premium</h2>
    <p className="text-xl text-slate-600 mb-12">Features exclusivas V2 que diferenciam no mercado</p>

    <div className="grid grid-cols-4 gap-6">
      {[
        {
          icon: '🏢',
          title: 'Company Intelligence',
          description: 'Enriquecimento automático com dados financeiros, stakeholders e análise de risco',
          badge: 'NEW'
        },
        {
          icon: '📊',
          title: 'Post-Award Management',
          description: 'Milestones automáticos, tracking de pagamentos, reporting financeiro',
          badge: 'PREMIUM'
        },
        {
          icon: '🤖',
          title: 'AI Proposal Critic',
          description: 'Review automático de propostas antes de envio com sugestões de melhoria',
          badge: 'AI'
        },
        {
          icon: '📧',
          title: 'Email Drip Automation',
          description: 'Sequências personalizadas baseadas em comportamento do lead',
          badge: 'AUTO'
        },
        {
          icon: '💬',
          title: 'Slack/Teams Integration',
          description: 'Notificações em tempo real, comandos de bot, atualizações de status',
          badge: 'REAL-TIME'
        },
        {
          icon: '⚖️',
          title: 'Grant GPT',
          description: 'Assistente jurídico para análise de regulamentos e elegibilidade',
          badge: 'AI'
        },
        {
          icon: '📈',
          title: 'Predictive Lead Scoring',
          description: 'Score automático baseado em probabilidade de conversão',
          badge: 'SMART'
        },
        {
          icon: '🌐',
          title: 'Auto-Website Updates',
          description: 'Case studies e success stories gerados automaticamente',
          badge: 'AUTO'
        }
      ].map((pillar, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-white p-6 rounded-lg border border-slate-200 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl">{pillar.icon}</span>
            <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2 py-1 rounded">{pillar.badge}</span>
          </div>
          <h3 className="font-bold text-slate-900 mb-2 text-sm">{pillar.title}</h3>
          <p className="text-slate-600 text-xs leading-relaxed">{pillar.description}</p>
        </motion.div>
      ))}
    </div>
  </div>
)

const ComparisonSlide = () => (
  <div className="flex flex-col justify-center h-full px-20">
    <span className="text-sm font-semibold tracking-widest text-slate-500 uppercase mb-4">Evolution</span>
    <h2 className="text-5xl font-bold text-slate-900 mb-12">V1 vs V2</h2>

    <div className="grid grid-cols-3 gap-8">
      <div className="bg-slate-100 p-8 rounded-lg">
        <div className="text-sm font-semibold text-slate-500 uppercase mb-4">V1 - Base Bitrix</div>
        <h3 className="text-2xl font-bold text-slate-700 mb-6">Manual & Limitado</h3>

        <ul className="space-y-3 text-sm">
          <li className="flex items-center gap-2 text-slate-600">
            <span className="text-slate-400">✗</span> CRM básico
          </li>
          <li className="flex items-center gap-2 text-slate-600">
            <span className="text-slate-400">✗</span> Tarefas manuais
          </li>
          <li className="flex items-center gap-2 text-slate-600">
            <span className="text-slate-400">✗</span> Sem IA
          </li>
          <li className="flex items-center gap-2 text-slate-600">
            <span className="text-slate-400">✗</span> Dados desatualizados
          </li>
          <li className="flex items-center gap-2 text-slate-600">
            <span className="text-slate-400">✗</span> Reporting manual
          </li>
          <li className="flex items-center gap-2 text-slate-600">
            <span className="text-slate-400">✗</span> Sem integrações
          </li>
        </ul>
      </div>

      <div className="bg-slate-100 p-8 rounded-lg">
        <div className="text-sm font-semibold text-blue-800 uppercase mb-4">V2 - PRO</div>
        <h3 className="text-2xl font-bold text-blue-800 mb-6">€5k + €600/mês</h3>

        <ul className="space-y-3 text-sm">
          <li className="flex items-center gap-2 text-slate-700">
            <span className="text-emerald-600">✓</span> CRM + IA básica
          </li>
          <li className="flex items-center gap-2 text-slate-700">
            <span className="text-emerald-600">✓</span> Propostas AI
          </li>
          <li className="flex items-center gap-2 text-slate-700">
            <span className="text-emerald-600">✓</span> Email templates
          </li>
          <li className="flex items-center gap-2 text-slate-700">
            <span className="text-emerald-600">✓</span> Dashboards
          </li>
          <li className="flex items-center gap-2 text-slate-700">
            <span className="text-emerald-600">✓</span> Slack básico
          </li>
          <li className="flex items-center gap-2 text-slate-700">
            <span className="text-emerald-600">✓</span> Suporte padrão
          </li>
        </ul>
      </div>

      <div className="bg-blue-900 p-8 rounded-lg">
        <div className="text-sm font-semibold text-emerald-400 uppercase mb-4">V2 - PREMIUM</div>
        <h3 className="text-2xl font-bold text-white mb-6">€11k + €900/mês</h3>

        <ul className="space-y-3 text-sm">
          <li className="flex items-center gap-2 text-slate-200">
            <span className="text-emerald-400">✓</span> <span className="font-semibold">TUDO do PRO</span>
          </li>
          <li className="flex items-center gap-2 text-slate-200">
            <span className="text-emerald-400">✓</span> Company Intelligence
          </li>
          <li className="flex items-center gap-2 text-slate-200">
            <span className="text-emerald-400">✓</span> Post-Award Mgmt
          </li>
          <li className="flex items-center gap-2 text-slate-200">
            <span className="text-emerald-400">✓</span> AI Proposal Critic
          </li>
          <li className="flex items-center gap-2 text-slate-200">
            <span className="text-emerald-400">✓</span> Drip Automation
          </li>
          <li className="flex items-center gap-2 text-slate-200">
            <span className="text-emerald-400">✓</span> Grant GPT + Priority
          </li>
        </ul>
      </div>
    </div>
  </div>
)

const PricingProSlide = () => (
  <div className="flex flex-col justify-center h-full px-20">
    <span className="text-sm font-semibold tracking-widest text-slate-500 uppercase mb-4">Pricing</span>
    <h2 className="text-5xl font-bold text-slate-900 mb-4">PRO Version</h2>
    <p className="text-xl text-slate-600 mb-12">Para consultores que querem crescer</p>

    <div className="max-w-4xl mx-auto w-full">
      <div className="bg-white rounded-2xl border-2 border-blue-800 overflow-hidden shadow-xl">
        <div className="bg-blue-800 p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold uppercase tracking-wider text-blue-200 mb-2">Professional Plan</div>
              <div className="text-5xl font-bold">€5.000</div>
              <div className="text-blue-200 mt-2">Setup + €600/mês</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-200">ROI esperado</div>
              <div className="text-3xl font-bold text-emerald-400">3-6 meses</div>
            </div>
          </div>
        </div>

        <div className="p-8">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Incluído:</h3>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="font-semibold text-blue-800 mb-4">Core Features</div>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                  <span className="text-slate-700">CRM Bitrix24 completo</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                  <span className="text-slate-700">Geração de propostas com IA</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                  <span className="text-slate-700">Email templates personalizados</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                  <span className="text-slate-700">Dashboards de performance</span>
                </li>
              </ul>
            </div>

            <div>
              <div className="font-semibold text-blue-800 mb-4">Support & Integrations</div>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                  <span className="text-slate-700">Slack básico (notificações)</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                  <span className="text-slate-700">Suporte email (48h)</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                  <span className="text-slate-700">Training inicial (4h)</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                  <span className="text-slate-700">Updates mensais</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

const PricingPremiumSlide = () => (
  <div className="flex flex-col justify-center h-full px-20">
    <span className="text-sm font-semibold tracking-widest text-slate-500 uppercase mb-4">Pricing</span>
    <h2 className="text-5xl font-bold text-slate-900 mb-4">PREMIUM Version</h2>
    <p className="text-xl text-slate-600 mb-12">Para consultores que querem dominar</p>

    <div className="max-w-4xl mx-auto w-full">
      <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-blue-900 to-slate-900 p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold uppercase tracking-wider text-emerald-400 mb-2">Premium Plan</div>
              <div className="text-5xl font-bold">€11.000</div>
              <div className="text-slate-300 mt-2">Setup + €900/mês</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-300">ROI esperado</div>
              <div className="text-3xl font-bold text-emerald-400">2-4 meses</div>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">BEST VALUE</span>
            <span className="text-slate-300 text-sm">TUDO do PRO + 8 features premium</span>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <div className="font-semibold text-emerald-400 mb-4">Premium AI Features</div>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                  <span className="text-slate-200">Company Intelligence API</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                  <span className="text-slate-200">AI Proposal Critic</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                  <span className="text-slate-200">Grant GPT (jurídico)</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                  <span className="text-slate-200">Predictive Lead Scoring</span>
                </li>
              </ul>
            </div>

            <div>
              <div className="font-semibold text-emerald-400 mb-4">Automation & Growth</div>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                  <span className="text-slate-200">Post-Award Management</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                  <span className="text-slate-200">Email Drip Automation</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                  <span className="text-slate-200">Slack/Teams avançado</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                  <span className="text-slate-200">Auto-Website Updates</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-slate-800 p-4 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Suporte Priority + Account Manager + Updates semanais</span>
              <span className="text-emerald-400 font-bold">SLA 24h</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

const ROICalculatorSlide = () => {
  const [leads, setLeads] = useState(50)
  const [conversionRate, setConversionRate] = useState(15)
  const [avgDeal, setAvgDeal] = useState(14000)

  const additionalRevenue = Math.round(leads * (conversionRate / 100) * avgDeal)
  const roi = Math.round((additionalRevenue - 11000) / 11000 * 100)

  return (
    <div className="flex flex-col justify-center h-full px-20">
      <span className="text-sm font-semibold tracking-widest text-slate-500 uppercase mb-4">Calculator</span>
      <h2 className="text-5xl font-bold text-slate-900 mb-4">ROI Calculator</h2>
      <p className="text-xl text-slate-600 mb-12">Veja o retorno do investimento com PREMIUM</p>

      <div className="grid grid-cols-2 gap-12">
        <div className="space-y-8">
          <div>
            <label className="flex justify-between text-sm font-semibold text-slate-700 mb-3">
              <span>Leads por mês</span>
              <span className="text-blue-800">{leads}</span>
            </label>
            <input
              type="range"
              min="10"
              max="200"
              value={leads}
              onChange={(e) => setLeads(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-800"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>10</span>
              <span>200</span>
            </div>
          </div>

          <div>
            <label className="flex justify-between text-sm font-semibold text-slate-700 mb-3">
              <span>Taxa de conversão (%)</span>
              <span className="text-blue-800">{conversionRate}%</span>
            </label>
            <input
              type="range"
              min="5"
              max="40"
              value={conversionRate}
              onChange={(e) => setConversionRate(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-800"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>5%</span>
              <span>40%</span>
            </div>
          </div>

          <div>
            <label className="flex justify-between text-sm font-semibold text-slate-700 mb-3">
              <span>Valor médio projeto</span>
              <span className="text-blue-800">€{avgDeal.toLocaleString()}</span>
            </label>
            <input
              type="range"
              min="5000"
              max="50000"
              step="1000"
              value={avgDeal}
              onChange={(e) => setAvgDeal(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-800"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>€5k</span>
              <span>€50k</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <div className="bg-slate-900 p-8 rounded-lg">
            <div className="text-center mb-8">
              <div className="text-slate-400 text-sm uppercase tracking-wider mb-2">Investimento PREMIUM</div>
              <div className="text-4xl font-bold text-white">€11.000</div>
              <div className="text-slate-400 text-sm mt-1">Setup + €900/mês</div>
            </div>

            <div className="border-t border-slate-700 pt-6 space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Leads qualificados</span>
                <span className="text-2xl font-bold text-white">{leads}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-300">Projetos fechados</span>
                <span className="text-2xl font-bold text-emerald-400">{Math.round(leads * (conversionRate / 100))}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-300">Receita adicional</span>
                <span className="text-2xl font-bold text-emerald-400">€{additionalRevenue.toLocaleString()}</span>
              </div>

              <div className="border-t border-slate-700 pt-6">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 font-semibold">ROI Anual</span>
                  <span className="text-4xl font-bold text-emerald-400">{roi}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const RoadmapSlide = () => (
  <div className="flex flex-col justify-center h-full px-20">
    <span className="text-sm font-semibold tracking-widest text-slate-500 uppercase mb-4">Implementation</span>
    <h2 className="text-5xl font-bold text-slate-900 mb-4">Roadmap - 8 Semanas</h2>
    <p className="text-xl text-slate-600 mb-12">Do zero à plataforma completa</p>

    <div className="relative">
      <div className="absolute top-12 left-0 right-0 h-1 bg-slate-200"></div>

      <div className="grid grid-cols-4 gap-6 relative">
        {[
          {
            week: 'Semana 1-2',
            title: 'Setup & Config',
            items: ['Instalação Bitrix', 'Configuração AI', 'Integração APIs', 'Training equipe']
          },
          {
            week: 'Semana 3-4',
            title: 'Data & Migration',
            items: ['Limpeza dados', 'Enriquecimento 24k', 'Setup dashboards', 'Testes QA']
          },
          {
            week: 'Semana 5-6',
            title: 'Automation Core',
            items: ['Email templates', 'Drip campaigns', 'Slack integration', 'Proposal AI']
          },
          {
            week: 'Semana 7-8',
            title: 'Go Live',
            items: ['Launch completo', 'Monitorização', 'Otimização', 'Handover']
          }
        ].map((phase, index) => (
          <div key={index} className="bg-white p-6 rounded-lg border border-slate-200 relative">
            <div className="absolute -top-3 left-6 w-6 h-6 bg-blue-800 rounded-full border-4 border-white"></div>
            <div className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-3">{phase.week}</div>
            <h3 className="font-bold text-slate-900 mb-4">{phase.title}</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              {phase.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>

    <div className="mt-12 bg-blue-50 p-6 rounded-lg border-l-4 border-blue-800">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-800 rounded-lg flex items-center justify-center text-white text-xl font-bold">8</div>
        <div>
          <div className="font-bold text-slate-900">Semanas para Produção</div>
          <div className="text-slate-600">Com metodologia ágil e entregas semanais</div>
        </div>
      </div>
    </div>
  </div>
)

const CaseStudiesSlide = () => (
  <div className="flex flex-col justify-center h-full px-20">
    <span className="text-sm font-semibold tracking-widest text-slate-500 uppercase mb-4">Results</span>
    <h2 className="text-5xl font-bold text-slate-900 mb-4">Case Studies</h2>
    <p className="text-xl text-slate-600 mb-12">Resultados reais com a plataforma</p>

    <div className="grid grid-cols-3 gap-8">
      <div className="bg-white p-8 rounded-lg border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-800 rounded-lg flex items-center justify-center text-white text-xl font-bold">A</div>
          <div>
            <div className="font-bold text-slate-900">Consultora A</div>
            <div className="text-sm text-slate-500">Lisboa</div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-sm text-slate-500">Produtividade</div>
            <div className="text-3xl font-bold text-emerald-600">+340%</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Propostas/mês</div>
            <div className="text-3xl font-bold text-blue-800">120 → 408</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">ROI</div>
            <div className="text-3xl font-bold text-emerald-600">4.2x</div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-200">
          <div className="text-sm text-slate-600 italic">
            "Conseguimos triplicar o número de clientes sem aumentar equipa."
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center text-white text-xl font-bold">B</div>
          <div>
            <div className="font-bold text-slate-900">Consultora B</div>
            <div className="text-sm text-slate-500">Porto</div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-sm text-slate-500">Conversão</div>
            <div className="text-3xl font-bold text-emerald-600">+180%</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Tempo resposta</div>
            <div className="text-3xl font-bold text-blue-800">-75%</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Receita</div>
            <div className="text-3xl font-bold text-emerald-600">+€480k</div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-200">
          <div className="text-sm text-slate-600 italic">
            "O AI Proposal Critic melhorou drasticamente a qualidade das propostas."
          </div>
        </div>
      </div>

      <div className="bg-slate-100 p-8 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-center">
        <div className="text-4xl mb-4">📊</div>
        <div className="font-bold text-slate-700 mb-2">Seu Próximo Case Study</div>
        <div className="text-slate-500 text-sm mb-4">Junte-se aos consultores que estão a transformar o negócio</div>
        <div className="text-blue-800 font-semibold">Agende uma demo →</div>
      </div>
    </div>
  </div>
)

const CTASlide = () => (
  <div className="flex flex-col justify-center items-center h-full text-center px-20">
    <h2 className="text-6xl font-bold text-slate-900 mb-6">Pronto para Crescer?</h2>
    <p className="text-2xl text-slate-600 mb-12 max-w-3xl">
      Junte-se aos consultores que estão a 10x a produtividade com TA Consulting Platform
    </p>

    <div className="flex gap-6 mb-16">
      <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
        Agendar Demo
      </button>
      <button className="border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
        Ver Pricing
      </button>
    </div>

    <div className="grid grid-cols-3 gap-8 max-w-4xl">
      <div className="text-center">
        <div className="text-4xl font-bold text-blue-800 mb-2">30min</div>
        <div className="text-slate-600">Demo personalizada</div>
      </div>
      <div className="text-center">
        <div className="text-4xl font-bold text-blue-800 mb-2">8 sem</div>
        <div className="text-slate-600">Até go-live</div>
      </div>
      <div className="text-center">
        <div className="text-4xl font-bold text-blue-800 mb-2">10x</div>
        <div className="text-slate-600">Produtividade</div>
      </div>
    </div>

    <div className="mt-16 flex items-center gap-6 text-slate-500">
      <a href="#" className="hover:text-blue-800 transition-colors">Contacto</a>
      <span>•</span>
      <a href="#" className="hover:text-blue-800 transition-colors">LinkedIn</a>
      <span>•</span>
      <a href="#" className="hover:text-blue-800 transition-colors">Website</a>
    </div>
  </div>
)

// Main Presentation Component
export default function PresentationV2Page() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState(0)

  const slides = [
    HeroSlide,
    MarketContextSlide,
    ProblemSlide,
    SolutionSlide,
    PillarsSlide,
    ComparisonSlide,
    PricingProSlide,
    PricingPremiumSlide,
    ROICalculatorSlide,
    RoadmapSlide,
    CaseStudiesSlide,
    CTASlide
  ]

  const totalSlides = slides.length

  const nextSlide = useCallback(() => {
    if (currentSlide < totalSlides - 1) {
      setDirection(1)
      setCurrentSlide(currentSlide + 1)
    }
  }, [currentSlide, totalSlides])

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setDirection(-1)
      setCurrentSlide(currentSlide - 1)
    }
  }, [currentSlide])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        nextSlide()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prevSlide()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [nextSlide, prevSlide])

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.95
    })
  }

  const CurrentSlideComponent = slides[currentSlide]

  return (
    <div className="fixed inset-0 bg-slate-50 overflow-hidden font-sans">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
            scale: { duration: 0.2 }
          }}
          className="absolute inset-0"
        >
          <CurrentSlideComponent />
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        {/* Progress Bar */}
        <div className="h-1 bg-slate-200">
          <motion.div
            className="h-full bg-blue-800"
            initial={{ width: 0 }}
            animate={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Navigation Footer */}
        <div className="bg-white border-t border-slate-200 px-8 py-4 flex items-center justify-between">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Anterior
          </button>

          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">
              Slide {currentSlide + 1} de {totalSlides}
            </span>
            <div className="flex gap-1">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setDirection(index > currentSlide ? 1 : -1)
                    setCurrentSlide(index)
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentSlide
                      ? 'bg-blue-800 w-8'
                      : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <button
            onClick={nextSlide}
            disabled={currentSlide === totalSlides - 1}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Próximo
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Keyboard hint */}
      <div className="fixed top-6 right-8 z-50 text-xs text-slate-400 bg-white px-3 py-2 rounded-lg border border-slate-200">
        Use ← → ou espaço para navegar
      </div>
    </div>
  )
}
