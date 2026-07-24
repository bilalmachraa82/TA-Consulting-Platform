'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Search, ExternalLink, Sparkles, ArrowLeft, X, Send, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

type Estado = 'ok' | 'atencao' | 'falha' | 'desconhecido'
interface Criterio { dimensao: string; estado: Estado; explicacao: string }
interface Resultado {
  id: string; nome: string; portal: string; programa: string; link: string | null
  prazo: string | null; montanteMaximo: number | null
  elegibilidade: {
    veredicto: string; resumo: string; score: number
    criterios: Criterio[]; criteriosAvaliados: number; criteriosTotal: number
  }
}

// Semáforo por critério. "desconhecido" = neutro (o aviso não especifica), não falha.
const DOT: Record<Estado, string> = { ok: 'bg-emerald-400', atencao: 'bg-amber-400', falha: 'bg-red-400', desconhecido: 'bg-slate-600' }

// Veredicto → cor funcional (badge + faixa lateral + score). Cor SEMPRE acompanhada
// de texto (o badge), nunca só cor — legível para daltónicos.
const VEREDICTO: Record<string, { label: string; badge: string; accent: string; score: string }> = {
  elegivel: { label: 'Elegível', badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', accent: 'border-l-emerald-400', score: 'text-emerald-400' },
  elegivel_com_reservas: { label: 'Elegível com reservas', badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30', accent: 'border-l-amber-400', score: 'text-amber-400' },
  dados_insuficientes: { label: 'A confirmar', badge: 'bg-white/5 text-slate-400 border-white/10', accent: 'border-l-slate-600', score: 'text-slate-400' },
}

const REGIOES = ['Norte', 'Centro', 'Lisboa', 'Alentejo', 'Algarve', 'Açores', 'Madeira']
const DIMENSOES = [
  { v: 'MICRO', l: 'Micro (até 10)' }, { v: 'PEQUENA', l: 'Pequena (até 50)' },
  { v: 'MEDIA', l: 'Média (até 250)' }, { v: 'GRANDE', l: 'Grande (250+)' },
]

const INPUT_CLS = 'bg-white/[0.04] border-white/15 text-slate-100 placeholder:text-slate-500 focus-visible:ring-emerald-500'
const SELECT_CLS = 'w-full h-10 rounded-md bg-white/[0.04] border border-white/15 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'

type AvisoRef = { id: string; nome: string; portal: string }

export default function EncontrarFundosPage() {
  const [cae, setCae] = useState('')
  const [setor, setSetor] = useState('')
  const [dimensao, setDimensao] = useState('')
  const [regiao, setRegiao] = useState('')
  const [loading, setLoading] = useState(false)
  const [dados, setDados] = useState<{ resumo: { totalAvisosAbertos: number; elegiveis: number; comReservas: number }; resultados: Resultado[] } | null>(null)

  // Captura de lead: o funil só vale se converter. Modal aberto pelo CTA geral
  // ou por "Quero ajuda" num aviso concreto.
  const [contacto, setContacto] = useState<{ aberto: boolean; aviso: AvisoRef | null; enviando: boolean; enviado: boolean }>({ aberto: false, aviso: null, enviando: false, enviado: false })
  // Atribuição (fase B): ?setor= pré-preenche vindo das páginas públicas;
  // ?origem= identifica a página de aviso que originou o lead.
  const [origem, setOrigem] = useState<string | null>(null)
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search)
    const s = sp.get('setor'); const o = sp.get('origem')
    if (s) setSetor(s)
    if (o) setOrigem(o)
  }, [])
  const [form, setForm] = useState({ nome: '', email: '', nif: '', telefone: '', mensagem: '', consent: false })
  const setF = (k: keyof typeof form, v: string | boolean) => setForm((p) => ({ ...p, [k]: v }))
  const abrirContacto = (aviso?: AvisoRef) => setContacto({ aberto: true, aviso: aviso ?? null, enviando: false, enviado: false })
  const fecharContacto = () => setContacto((c) => ({ ...c, aberto: false }))

  const submeter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cae && !setor && !dimensao && !regiao) { toast.error('Indica pelo menos um critério.'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/fundos-elegiveis', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cae: cae || undefined, setor: setor || undefined, dimensao: dimensao || undefined, regiao: regiao || undefined }),
      })
      const j = await res.json()
      if (!res.ok) { toast.error(j.error || 'Erro'); return }
      setDados(j)
    } catch { toast.error('Erro de ligação.') } finally { setLoading(false) }
  }

  const submeterContacto = async (e: React.FormEvent) => {
    e.preventDefault()
    // NIF é opcional (conversão primeiro); valida formato só se preenchido.
    if (form.nif && !/^\d{9}$/.test(form.nif)) { toast.error('NIF deve ter 9 dígitos.'); return }
    setContacto((c) => ({ ...c, enviando: true }))
    try {
      const res = await fetch('/api/leads/contacto', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: form.nome, email: form.email, nif: form.nif || undefined, telefone: form.telefone || undefined,
          mensagem: form.mensagem || undefined, consentMarketing: form.consent,
          setor: setor || undefined, dimensao: dimensao || undefined, regiao: regiao || undefined, cae: cae || undefined,
          aviso: contacto.aviso ?? undefined,
          origem: origem ?? undefined,
        }),
      })
      const j = await res.json()
      if (!res.ok) { toast.error(j.error || 'Erro'); setContacto((c) => ({ ...c, enviando: false })); return }
      setContacto((c) => ({ ...c, enviando: false, enviado: true }))
    } catch { toast.error('Erro de ligação.'); setContacto((c) => ({ ...c, enviando: false })) }
  }

  return (
    <div className="min-h-screen bg-[#0a0b0f] text-slate-100 antialiased overflow-x-clip">
      {/* Header — consistente com a homepage */}
      <header className="sticky top-0 z-50 glass">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <span className="text-[#0a0b0f] font-bold">e</span>
            </div>
            <span className="font-display text-xl text-white">Eligivo</span>
          </Link>
          <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Início
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] max-w-[120vw] h-[520px] bg-emerald-500/12 blur-[150px] rounded-full" />
          <div className="grain-overlay" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-14 md:py-20">
          <div className="text-center mb-9">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-emerald-300 glass-chip rounded-full px-3 py-1 mb-5">
              <Sparkles className="w-3.5 h-3.5" /> Análise grátis, sem registo
            </div>
            <h1 className="font-display text-3xl md:text-5xl text-white tracking-tight [text-wrap:balance]">
              Encontra os fundos a que a tua empresa é elegível
            </h1>
            <p className="text-slate-400 mt-4 max-w-2xl mx-auto text-lg leading-relaxed">
              Base atualizada diariamente de 10 portais (Portugal 2030, PRR, PEPAC, Turismo de Portugal, Horizon…).
              Indica o perfil da empresa e vê os avisos abertos, com a análise de elegibilidade critério a critério.
            </p>
          </div>

          <form onSubmit={submeter} className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 shadow-2xl shadow-black/30 space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              {/* htmlFor/id: liga rótulo↔campo (leitores de ecrã + clique no rótulo foca o campo) */}
              <div className="space-y-1.5">
                <Label htmlFor="ef-cae" className="text-slate-300 font-medium">CAE (opcional)</Label>
                <Input id="ef-cae" value={cae} onChange={(e) => setCae(e.target.value)} placeholder="ex.: 62010" className={INPUT_CLS} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ef-setor" className="text-slate-300 font-medium">Setor (opcional)</Label>
                <Input id="ef-setor" value={setor} onChange={(e) => setSetor(e.target.value)} placeholder="ex.: Software, Turismo, Indústria" className={INPUT_CLS} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ef-dimensao" className="text-slate-300 font-medium">Dimensão</Label>
                <select id="ef-dimensao" value={dimensao} onChange={(e) => setDimensao(e.target.value)} className={SELECT_CLS}>
                  <option value="">Qualquer</option>
                  {DIMENSOES.map((d) => <option key={d.v} value={d.v}>{d.l}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ef-regiao" className="text-slate-300 font-medium">Região (NUTS II)</Label>
                <select id="ef-regiao" value={regiao} onChange={(e) => setRegiao(e.target.value)} className={SELECT_CLS}>
                  <option value="">Qualquer</option>
                  {REGIOES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full h-11 bg-emerald-500 hover:bg-emerald-400 text-[#0a0b0f] font-semibold text-base">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> A analisar…</> : <><Search className="w-4 h-4 mr-2" /> Encontrar fundos elegíveis</>}
            </Button>
          </form>
        </div>
      </section>

      {dados && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm mb-4">
            <span className="text-slate-500">{dados.resumo.totalAvisosAbertos} avisos abertos analisados</span>
            <span className="text-slate-700">·</span>
            <span className="text-emerald-400 font-semibold">{dados.resumo.elegiveis} elegíveis</span>
            <span className="text-amber-400 font-semibold">{dados.resumo.comReservas} com reservas</span>
          </div>

          {dados.resultados.length === 0 ? (
            <div className="text-center text-slate-400 py-12 px-6 bg-white/[0.03] border border-white/10 rounded-2xl">
              Não encontrámos avisos claramente elegíveis com estes critérios. Tenta alargar (ex.: sem CAE) ou fala connosco.
            </div>
          ) : (
            <div className="space-y-4">
              {dados.resultados.map((r) => {
                const v = VEREDICTO[r.elegibilidade.veredicto] ?? VEREDICTO.dados_insuficientes
                return (
                  <div key={r.id} className={`bg-white/[0.03] border border-white/10 border-l-2 ${v.accent} rounded-xl p-5 hover:border-white/20 transition-colors`}>
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${v.badge}`}>{v.label}</span>
                          <span className="text-[11px] font-medium text-slate-400 bg-white/5 rounded-full px-2 py-0.5">{r.portal}</span>
                        </div>
                        <h3 className="font-semibold text-slate-100 leading-snug">{r.nome}</h3>
                      </div>
                      <div className="text-right shrink-0" title="Score calculado sobre os critérios que o aviso especifica — os restantes ficam por confirmar.">
                        {/* Honestidade do score: com <3 critérios avaliáveis, um "100%" verde
                            lê-se como certeza que não temos — cor neutra + rótulo explícito. */}
                        <div className={`text-2xl font-bold tabular-nums ${r.elegibilidade.criteriosAvaliados >= 3 ? v.score : 'text-slate-400'}`}>{r.elegibilidade.score}%</div>
                        <div className="text-[10px] text-slate-500">com base em {r.elegibilidade.criteriosAvaliados} de {r.elegibilidade.criteriosTotal} critérios</div>
                      </div>
                    </div>
                    <ul className="space-y-1.5 mb-3">
                      {r.elegibilidade.criterios.map((c, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${DOT[c.estado]}`} />
                          <span className="text-slate-400"><span className="font-medium text-slate-200">{c.dimensao}:</span> {c.explicacao}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 border-t border-white/5 pt-3">
                      {r.prazo && <span>Prazo: {r.prazo.split('-').reverse().join('/')}</span>}
                      {r.montanteMaximo && <span className="font-semibold text-amber-300/90">Até €{r.montanteMaximo.toLocaleString('pt-PT')}</span>}
                      <div className="flex items-center gap-3 ml-auto">
                        <button type="button" onClick={() => abrirContacto({ id: r.id, nome: r.nome, portal: r.portal })} className="text-emerald-400 hover:text-emerald-300 font-semibold">Quero ajuda</button>
                        {r.link && <a href={r.link} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-200 inline-flex items-center gap-1">Aviso oficial <ExternalLink className="w-3 h-3" /></a>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="text-center pt-8">
            <p className="text-slate-400 mb-3">Queres ajuda de um especialista a preparar a candidatura?</p>
            <Button onClick={() => abrirContacto()} className="bg-emerald-500 hover:bg-emerald-400 text-[#0a0b0f] font-semibold px-6">Falar com um consultor</Button>
          </div>
        </div>
      )}

      {contacto.aberto && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={fecharContacto}>
          <div className="glass-panel rounded-2xl w-full max-w-md p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={fecharContacto} aria-label="Fechar" className="absolute top-4 right-4 text-slate-500 hover:text-slate-200"><X className="w-5 h-5" /></button>
            {contacto.enviado ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white">Pedido recebido!</h3>
                <p className="text-slate-400 mt-1 text-sm">Um consultor especialista entra em contacto em breve.</p>
                <Button onClick={fecharContacto} className="mt-4 bg-emerald-500 hover:bg-emerald-400 text-[#0a0b0f] font-semibold">Fechar</Button>
              </div>
            ) : (
              <form onSubmit={submeterContacto} className="space-y-3">
                <div>
                  <h3 className="font-display text-xl text-white">Falar com um consultor</h3>
                  {contacto.aviso
                    ? <p className="text-sm text-slate-400 mt-0.5">Sobre: <span className="font-medium text-slate-200">{contacto.aviso.nome}</span></p>
                    : <p className="text-sm text-slate-400 mt-0.5">Ajudamos-te a preparar a candidatura, do início ao fim.</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label htmlFor="lead-nome" className="text-slate-300 text-sm">Nome*</Label><Input id="lead-nome" value={form.nome} onChange={(e) => setF('nome', e.target.value)} required className={INPUT_CLS} /></div>
                  <div className="space-y-1"><Label htmlFor="lead-nif" className="text-slate-300 text-sm">NIF (opcional)</Label><Input id="lead-nif" value={form.nif} onChange={(e) => setF('nif', e.target.value)} inputMode="numeric" placeholder="9 dígitos" className={INPUT_CLS} /></div>
                </div>
                <div className="space-y-1"><Label htmlFor="lead-email" className="text-slate-300 text-sm">Email*</Label><Input id="lead-email" type="email" value={form.email} onChange={(e) => setF('email', e.target.value)} required className={INPUT_CLS} /></div>
                <div className="space-y-1"><Label htmlFor="lead-telefone" className="text-slate-300 text-sm">Telefone</Label><Input id="lead-telefone" value={form.telefone} onChange={(e) => setF('telefone', e.target.value)} className={INPUT_CLS} /></div>
                <div className="space-y-1"><Label htmlFor="lead-mensagem" className="text-slate-300 text-sm">Mensagem (opcional)</Label><textarea id="lead-mensagem" value={form.mensagem} onChange={(e) => setF('mensagem', e.target.value)} rows={2} className="w-full rounded-md bg-white/[0.04] border border-white/15 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none" /></div>
                <label className="flex items-start gap-2 text-xs text-slate-500"><input type="checkbox" checked={form.consent} onChange={(e) => setF('consent', e.target.checked)} className="mt-0.5 accent-emerald-500" /> Aceito ser contactado e receber alertas de novos fundos relevantes.</label>
                <Button type="submit" disabled={contacto.enviando} className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#0a0b0f] font-semibold">{contacto.enviando ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> A enviar…</> : <><Send className="w-4 h-4 mr-2" /> Enviar pedido</>}</Button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
