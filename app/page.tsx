'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Sparkles, Check, Menu, X } from 'lucide-react'

// Contador que sobe suave quando entra em vista.
function Stat({ value, label, prefix = '', suffix = '' }: { value: number; label: string; prefix?: string; suffix?: string }) {
  const [n, setN] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const dur = 1100
      const start = performance.now()
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / dur)
        const eased = 1 - Math.pow(1 - p, 3)
        setN(Math.round(value * eased))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.4 })
    io.observe(el)
    return () => io.disconnect()
  }, [value])
  return (
    <div ref={ref}>
      <div className="font-display text-4xl md:text-5xl text-white tabular-nums">{prefix}{n}{suffix}</div>
      <div className="text-sm text-slate-500 mt-1.5">{label}</div>
    </div>
  )
}

const PORTAIS = ['Portugal 2030', 'PRR', 'PEPAC', 'Horizon Europe', 'Turismo de Portugal', 'IPDJ', 'Fundo Ambiental']

// Setores reais — empresas como a tua. Fotografia ilustrativa.
const SETORES = [
  { img: '/generated/web-founder-food.jpg', setor: 'Mercearia & retalho artesanal', linha: 'PT2030 · Comércio e digitalização', alt: 'Dona de uma mercearia artesanal portuguesa na sua loja' },
  { img: '/generated/web-ceramica.jpg', setor: 'Cerâmica & ofício', linha: 'PRR · Indústria e economia criativa', alt: 'Ceramista portuguesa no seu atelier' },
  { img: '/generated/web-turismo.jpg', setor: 'Alojamento & turismo', linha: 'Turismo de Portugal · Valorizar', alt: 'Proprietário de alojamento local português' },
  { img: '/generated/web-industria.jpg', setor: 'Indústria & oficinas', linha: 'PT2030 · Inovação produtiva', alt: 'Artesão numa pequena oficina industrial portuguesa' },
]

const PASSOS = [
  { n: '01', t: 'Diz-nos o perfil', d: 'Setor, CAE, região e dimensão da empresa. Meio minuto, sem registo.' },
  { n: '02', t: 'Cruzamos 10 portais', d: 'Nacionais e europeus, varridos por robots todos os dias. Só avisos abertos.' },
  { n: '03', t: 'Vês o que é teu', d: 'A análise critério a critério — e o próximo passo concreto para te candidatares.' },
]

const FAQ = [
  { q: 'É mesmo grátis?', a: 'Sim. A análise de elegibilidade pública é grátis e sem registo. Só pagas se quiseres o acompanhamento da candidatura.' },
  { q: 'De onde vêm os dados?', a: '10 portais oficiais — Portugal 2030, PRR, PEPAC, Turismo de Portugal, Horizon Europe e mais — varridos automaticamente todos os dias. Nunca vês um aviso já fechado.' },
  { q: 'Como sabem que sou elegível?', a: 'Cruzamos o perfil da tua empresa com os critérios de cada aviso e mostramos-te o porquê, critério a critério: setor, CAE, região, dimensão e prazo. Nada de scores cegos.' },
  { q: 'O que fazem com os meus dados?', a: 'O perfil serve só para a análise. Cumprimos o RGPD e não partilhamos os teus dados com terceiros.' },
]

export default function HomePage() {
  // Menu mobile: sem ele, "Entrar"/"Preços" ficavam inacessíveis em ecrãs pequenos.
  const [menuAberto, setMenuAberto] = useState(false)
  return (
    <div className="min-h-screen bg-[#0a0b0f] text-slate-100 antialiased overflow-x-hidden">
      {/* NAV */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0a0b0f]/70 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <span className="text-[#0a0b0f] font-bold">e</span>
            </div>
            <span className="font-display text-xl text-white">Eligivo</span>
          </Link>
          <nav className="flex items-center gap-4 md:gap-8 text-sm text-slate-400">
            <Link href="#como" className="hidden md:inline hover:text-white transition-colors">Como funciona</Link>
            <Link href="#quem" className="hidden md:inline hover:text-white transition-colors">Para quem</Link>
            <Link href="/pricing" className="hidden md:inline hover:text-white transition-colors">Preços</Link>
            <Link href="/auth/login" className="hidden md:inline hover:text-white transition-colors">Entrar</Link>
            <Link href="/encontrar-fundos">
              <span className="bg-white text-[#0a0b0f] font-medium px-4 py-2 rounded-lg hover:bg-emerald-400 transition-colors inline-block">Ver os meus fundos</span>
            </Link>
            <button
              type="button"
              onClick={() => setMenuAberto((v) => !v)}
              aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={menuAberto}
              className="md:hidden -mr-2 p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            >
              {menuAberto ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </nav>
        </div>
        {/* Painel mobile — links com alvo de toque ≥44px */}
        {menuAberto && (
          <nav className="md:hidden border-t border-white/5 bg-[#0a0b0f]/95 backdrop-blur-md">
            <div className="max-w-6xl mx-auto px-5 py-2 flex flex-col text-[15px] text-slate-300">
              <Link href="#como" onClick={() => setMenuAberto(false)} className="py-3 hover:text-white transition-colors">Como funciona</Link>
              <Link href="#quem" onClick={() => setMenuAberto(false)} className="py-3 hover:text-white transition-colors">Para quem</Link>
              <Link href="/pricing" onClick={() => setMenuAberto(false)} className="py-3 hover:text-white transition-colors">Preços</Link>
              <Link href="/auth/login" onClick={() => setMenuAberto(false)} className="py-3 hover:text-white transition-colors">Entrar</Link>
            </div>
          </nav>
        )}
      </header>

      {/* HERO — imagem humana cinematográfica, texto no espaço negativo à esquerda */}
      <section className="relative min-h-[86vh] flex items-center overflow-hidden">
        <img
          src="/generated/web-hero.jpg"
          alt="Empresária portuguesa na sua oficina, iluminada por luz quente"
          className="absolute inset-0 w-full h-full object-cover object-right"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0b0f] via-[#0a0b0f]/90 to-[#0a0b0f]/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b0f] via-transparent to-[#0a0b0f]/40" />
        <div className="grain-overlay" />

        <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-6 w-full">
          <div className="max-w-xl animate-fade-in-up">
            <div className="inline-flex items-center gap-2 text-xs font-medium tracking-wide text-emerald-300 border border-emerald-500/25 bg-emerald-500/[0.08] rounded-full px-3 py-1 mb-6 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" /> Análise grátis · sem registo
            </div>
            <h1 className="font-display text-[2.7rem] leading-[1.03] sm:text-6xl lg:text-[4.6rem] text-white tracking-tight [text-wrap:balance]">
              Sabe a que fundos a tua empresa <span className="text-emerald-400 italic">tem direito</span>.
            </h1>
            <p className="mt-6 text-lg text-slate-300 max-w-lg leading-relaxed">
              Diz-nos o perfil da empresa e vê, em 30 segundos, os fundos europeus abertos a que és elegível — com a análise critério a critério.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Link href="/encontrar-fundos">
                <span className="group inline-flex items-center gap-2 bg-emerald-500 text-[#0a0b0f] font-semibold px-6 py-3.5 rounded-xl hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20">
                  Ver os meus fundos <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
              <Link href="#como" className="text-slate-200 hover:text-white transition-colors text-sm font-medium">Como funciona →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="relative z-10 border-y border-white/5 bg-white/[0.015]">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-wrap items-center justify-center gap-x-7 gap-y-2">
          <span className="text-slate-600 text-[11px] uppercase tracking-widest">Monitorizado diariamente:</span>
          {PORTAIS.map((p) => (
            <span key={p} className="text-slate-400 text-sm font-medium">{p}</span>
          ))}
        </div>
      </section>

      {/* PRODUTO — a ferramenta real (credibilidade > stock) */}
      <section className="max-w-6xl mx-auto px-5 sm:px-6 py-20 md:py-28 grid lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16 items-center">
        <div>
          <div className="text-emerald-400 text-sm font-medium mb-3">O que vais ver</div>
          <h2 className="font-display text-4xl md:text-5xl text-white leading-[1.08]">
            Elegibilidade explicável. Não um score cego.
          </h2>
          <p className="mt-5 text-lg text-slate-400 leading-relaxed max-w-md">
            Para cada aviso vês exatamente porque és — ou não — elegível, critério a critério. É o que transforma uma lista de avisos numa decisão.
          </p>
          <ul className="mt-7 space-y-3 text-sm">
            {['Setor e CAE cruzados com o teu perfil', 'Região e dimensão da empresa', 'Prazo real, a contar a partir de hoje', 'O próximo passo concreto para avançar'].map((item) => (
              <li key={item} className="flex items-center gap-3 text-slate-300">
                <span className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-emerald-400" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="absolute -inset-8 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />
          <div className="relative bg-white/[0.05] border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl shadow-black/40">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5">
              <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
              <span className="ml-3 text-[11px] text-slate-500">eligivo.com/encontrar-fundos</span>
            </div>
            <div className="p-4 sm:p-5 space-y-3">
              <div className="bg-white/[0.03] border border-white/10 border-l-2 border-l-emerald-400 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">Elegível</span>
                      <span className="text-[10px] text-slate-500">PORTUGAL2030</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-100 leading-snug">STEP – Inovação Produtiva</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-2xl font-bold text-emerald-400 tabular-nums">100%</div>
                    <div className="text-[9px] text-slate-500">6 de 6 critérios</div>
                  </div>
                </div>
                <ul className="space-y-1.5 text-[11px]">
                  <li className="flex items-center gap-2 text-slate-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Setor: relevante para o teu</li>
                  <li className="flex items-center gap-2 text-slate-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Beneficiário: admite empresas</li>
                  <li className="flex items-center gap-2 text-slate-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Região: elegível (nacional)</li>
                  <li className="flex items-center gap-2 text-slate-400"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Prazo: 27 dias</li>
                </ul>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 flex items-center justify-between opacity-80">
                <div>
                  <span className="text-[10px] text-slate-500">TURISMO DE PORTUGAL</span>
                  <div className="text-xs font-medium text-slate-300 mt-0.5">Fundo de Investimento para o Turismo</div>
                </div>
                <div className="text-lg font-bold text-emerald-400/80 tabular-nums">92%</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA — com a imagem do dossier */}
      <section id="como" className="border-t border-white/5 bg-white/[0.015]">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-20 md:py-28 grid lg:grid-cols-2 gap-14 lg:gap-16 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="overflow-hidden rounded-2xl ring-1 ring-white/10 shadow-2xl shadow-black/50">
              <img src="/generated/web-hero-dossier.jpg" alt="Empresária a rever no portátil a análise de elegibilidade aos fundos" className="w-full h-full object-cover" loading="lazy" />
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="text-emerald-400 text-sm font-medium mb-3">Como funciona</div>
            <h2 className="font-display text-4xl md:text-5xl text-white leading-[1.08] mb-10">
              Do perfil da empresa ao fundo certo, em três passos.
            </h2>
            <div className="space-y-8">
              {PASSOS.map((p) => (
                <div key={p.n} className="flex gap-5">
                  <div className="font-display text-2xl text-emerald-400/90 shrink-0 w-10">{p.n}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{p.t}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed max-w-sm">{p.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PARA QUEM — empresas reais, humanos que se reveem */}
      <section id="quem" className="max-w-6xl mx-auto px-5 sm:px-6 py-20 md:py-28 border-t border-white/5">
        <div className="max-w-2xl mb-12 md:mb-14">
          <div className="text-emerald-400 text-sm font-medium mb-3">Para quem</div>
          <h2 className="font-display text-4xl md:text-5xl text-white leading-[1.08]">
            Feito para quem faz o país acontecer.
          </h2>
          <p className="mt-5 text-lg text-slate-400 leading-relaxed">
            Da mercearia de bairro à oficina, do atelier ao alojamento local. Há milhões de euros a abrir todas as semanas — a questão é saber quais são teus.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SETORES.map((s) => (
            <div key={s.setor} className="group relative overflow-hidden rounded-2xl ring-1 ring-white/10 aspect-[4/5]">
              <img src={s.img} alt={s.alt} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b0f] via-[#0a0b0f]/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="text-white font-semibold leading-snug">{s.setor}</div>
                <div className="mt-1 text-[12px] text-emerald-300/90 font-medium">{s.linha}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-[11px] text-slate-600">Fotografia ilustrativa. Programas indicados a título de exemplo.</p>
      </section>

      {/* STATS */}
      <section className="border-t border-white/5 bg-white/[0.015]">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-20 grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-6 text-center">
          <Stat value={683} suffix="+" label="Avisos abertos" />
          <Stat value={10} label="Portais monitorizados" />
          <Stat value={30} suffix="s" label="Análise de elegibilidade" />
          <Stat prefix="€" value={0} label="Para começar" />
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-5 sm:px-6 py-20 md:py-28 border-t border-white/5">
        <h2 className="font-display text-3xl md:text-4xl text-white mb-10 text-center">Perguntas diretas, respostas diretas.</h2>
        <div className="divide-y divide-white/5 border-y border-white/5">
          {FAQ.map((f) => (
            <div key={f.q} className="py-6">
              <h3 className="text-white font-semibold mb-2">{f.q}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA — com o momento de ajuda */}
      <section className="relative overflow-hidden border-t border-white/5">
        <img src="/generated/web-ajuda.jpg" alt="Consultor e empresária a analisar os fundos disponíveis" className="absolute inset-0 w-full h-full object-cover object-center" loading="lazy" />
        <div className="absolute inset-0 bg-[#0a0b0f]/85" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b0f] via-[#0a0b0f]/70 to-[#0a0b0f]/90" />
        <div className="grain-overlay" />
        <div className="relative max-w-3xl mx-auto px-6 py-24 md:py-32 text-center">
          <h2 className="font-display text-4xl md:text-6xl text-white leading-[1.05]">Os teus fundos estão à espera.</h2>
          <p className="mt-5 text-lg text-slate-300">30 segundos. Sem registo. Sem compromisso.</p>
          <Link href="/encontrar-fundos">
            <span className="mt-9 inline-flex items-center gap-2 bg-emerald-500 text-[#0a0b0f] font-semibold px-7 py-4 rounded-xl hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20">
              Ver os meus fundos <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center"><span className="text-[#0a0b0f] font-bold text-sm">e</span></div>
            <span className="font-display text-white">Eligivo</span>
            <span className="text-slate-600">· by aitipro</span>
          </div>
          <div>© 2026 Eligivo · Inteligência de fundos europeus</div>
        </div>
      </footer>
    </div>
  )
}
