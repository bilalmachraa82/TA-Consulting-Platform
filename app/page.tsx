'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'

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

const FEATURES = [
  {
    n: '01',
    titulo: 'Elegibilidade explicável',
    texto: 'Não um score cego. Vês porque és (ou não) elegível, critério a critério — setor, CAE, região, dimensão, prazo.',
    dots: ['bg-emerald-400', 'bg-emerald-400', 'bg-emerald-400', 'bg-amber-400', 'bg-slate-600', 'bg-slate-600'],
  },
  {
    n: '02',
    titulo: 'Base viva, não uma lista velha',
    texto: '10 portais nacionais e europeus, varridos por robots todos os dias. Nunca vês um aviso já fechado nem perdes um que abriu ontem.',
    badge: 'Atualizado hoje',
  },
  {
    n: '03',
    titulo: 'Assistente que cita as fontes',
    texto: 'Pergunta em linguagem natural. Responde com os avisos reais e o link oficial — zero invenções. É venda, não decoração.',
    quote: '“Existem 94 avisos do PRR abertos.” — com fontes',
  },
]

export default function HomePage() {
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
          <nav className="flex items-center gap-6 md:gap-8 text-sm text-slate-400">
            <Link href="#como" className="hidden md:inline hover:text-white transition-colors">Como funciona</Link>
            <Link href="/pricing" className="hidden md:inline hover:text-white transition-colors">Preços</Link>
            <Link href="/auth/login" className="hidden sm:inline hover:text-white transition-colors">Entrar</Link>
            <Link href="/encontrar-fundos">
              <span className="bg-white text-[#0a0b0f] font-medium px-4 py-2 rounded-lg hover:bg-emerald-400 transition-colors inline-block">Ver os meus fundos</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] max-w-[120vw] h-[560px] bg-emerald-500/15 blur-[150px] rounded-full" />
          <div className="grain-overlay" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-6 pt-16 pb-14 md:pt-24 md:pb-20 grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-10 items-center">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 text-xs font-medium tracking-wide text-emerald-300 border border-emerald-500/20 bg-emerald-500/[0.06] rounded-full px-3 py-1 mb-6">
              <Sparkles className="w-3.5 h-3.5" /> Análise grátis · sem registo
            </div>
            <h1 className="font-display text-[2.7rem] leading-[1.03] sm:text-6xl lg:text-[4.5rem] text-white tracking-tight">
              Sabe a que fundos<br className="hidden sm:block" /> a tua empresa <span className="text-emerald-400 italic">tem direito</span>.
            </h1>
            <p className="mt-6 text-lg text-slate-400 max-w-xl leading-relaxed">
              Diz-nos o perfil da empresa e vê, em 30 segundos, os fundos europeus abertos a que és elegível — com a análise critério a critério. Grátis, sem registo.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Link href="/encontrar-fundos">
                <span className="group inline-flex items-center gap-2 bg-emerald-500 text-[#0a0b0f] font-semibold px-6 py-3.5 rounded-xl hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20">
                  Ver os meus fundos <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
              <Link href="#como" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">Como funciona →</Link>
            </div>
          </div>

          {/* HERO PRODUTO — a ferramenta real (credibilidade > stock) */}
          <div className="relative animate-fade-in-up animate-stagger-2">
            <div className="absolute -inset-8 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />
            <div className="relative animate-float">
              <div className="bg-white/[0.05] border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl shadow-black/40">
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

      {/* STATS */}
      <section className="max-w-6xl mx-auto px-6 py-16 md:py-20 grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-6 text-center">
        <Stat value={683} suffix="+" label="Avisos abertos" />
        <Stat value={10} label="Portais monitorizados" />
        <Stat value={30} suffix="s" label="Análise de elegibilidade" />
        <Stat prefix="€" value={0} label="Para começar" />
      </section>

      {/* FEATURES */}
      <section id="como" className="max-w-6xl mx-auto px-5 sm:px-6 py-16 md:py-20 border-t border-white/5">
        <div className="max-w-2xl mb-12 md:mb-14">
          <div className="text-emerald-400 text-sm font-medium mb-3">Porque é diferente</div>
          <h2 className="font-display text-4xl md:text-5xl text-white leading-[1.08]">
            Não é mais uma lista de avisos. É saber o que é teu.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div key={f.n} className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors">
              <div className="text-emerald-400/90 font-display text-2xl mb-4">{f.n}</div>
              <h3 className="text-lg font-semibold text-white mb-2.5">{f.titulo}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.texto}</p>
              <div className="mt-5 pt-4 border-t border-white/5">
                {f.dots && <div className="flex gap-2 items-center">{f.dots.map((d, i) => <span key={i} className={`w-2 h-2 rounded-full ${d}`} />)}<span className="ml-2 text-[11px] text-slate-500">6 critérios</span></div>}
                {f.badge && <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-300"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> {f.badge}</span>}
                {f.quote && <p className="text-[12px] text-slate-500 italic leading-relaxed">{f.quote}</p>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-[-30%] left-1/2 -translate-x-1/2 w-[720px] max-w-[120vw] h-[420px] bg-emerald-500/15 blur-[140px] rounded-full" />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 py-24 md:py-28 text-center">
          <h2 className="font-display text-4xl md:text-6xl text-white leading-[1.05]">Os teus fundos estão à espera.</h2>
          <p className="mt-5 text-lg text-slate-400">30 segundos. Sem registo. Sem compromisso.</p>
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
