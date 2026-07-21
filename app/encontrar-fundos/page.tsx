'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Search, ExternalLink, Sparkles, ArrowLeft } from 'lucide-react'
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
const DOT: Record<Estado, string> = { ok: 'bg-green-500', atencao: 'bg-amber-500', falha: 'bg-red-500', desconhecido: 'bg-slate-300' }

// Veredicto → cor funcional (badge + faixa lateral + score). Cor SEMPRE acompanhada
// de texto (o badge), nunca só cor — legível para daltónicos.
const VEREDICTO: Record<string, { label: string; badge: string; accent: string; score: string }> = {
  elegivel: { label: 'Elegível', badge: 'bg-green-50 text-green-700 border-green-200', accent: 'border-l-green-500', score: 'text-green-600' },
  elegivel_com_reservas: { label: 'Elegível com reservas', badge: 'bg-amber-50 text-amber-700 border-amber-200', accent: 'border-l-amber-500', score: 'text-amber-600' },
  dados_insuficientes: { label: 'A confirmar', badge: 'bg-slate-100 text-slate-600 border-slate-200', accent: 'border-l-slate-300', score: 'text-slate-500' },
}

const REGIOES = ['Norte', 'Centro', 'Lisboa', 'Alentejo', 'Algarve', 'Açores', 'Madeira']
const DIMENSOES = [
  { v: 'MICRO', l: 'Micro (até 10)' }, { v: 'PEQUENA', l: 'Pequena (até 50)' },
  { v: 'MEDIA', l: 'Média (até 250)' }, { v: 'GRANDE', l: 'Grande (250+)' },
]

const INPUT_CLS = 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-500'
const SELECT_CLS = 'w-full h-10 rounded-md bg-white border border-slate-300 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'

export default function EncontrarFundosPage() {
  const [cae, setCae] = useState('')
  const [setor, setSetor] = useState('')
  const [dimensao, setDimensao] = useState('')
  const [regiao, setRegiao] = useState('')
  const [loading, setLoading] = useState(false)
  const [dados, setDados] = useState<{ resumo: { totalAvisosAbertos: number; elegiveis: number; comReservas: number }; resultados: Resultado[] } | null>(null)

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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header consistente com a homepage (navegação + orientação — antes não existia) */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm shadow-blue-600/30">
              <span className="text-white font-bold">TA</span>
            </div>
            <div className="leading-tight">
              <div className="font-semibold text-slate-900">TA Consulting</div>
              <div className="text-xs text-slate-500">Fundos Europeus</div>
            </div>
          </Link>
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-900 transition-colors inline-flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Início
          </Link>
        </div>
      </header>

      <div className="relative bg-gradient-to-b from-blue-50/60 to-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-3 py-1 mb-5">
              <Sparkles className="w-3.5 h-3.5" /> Análise grátis, sem registo
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900">
              Encontra os fundos a que a tua empresa é elegível
            </h1>
            <p className="text-slate-600 mt-4 max-w-2xl mx-auto text-lg leading-relaxed">
              Base atualizada diariamente de 9 portais (Portugal 2030, PRR, PEPAC, Horizon…).
              Indica o perfil da empresa e vê os avisos abertos, com a análise de elegibilidade critério a critério.
            </p>
          </div>

          <form onSubmit={submeter} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm shadow-slate-200/60 space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label className="text-slate-700 font-medium">CAE (opcional)</Label>
                <Input value={cae} onChange={(e) => setCae(e.target.value)} placeholder="ex.: 62010" className={INPUT_CLS} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-700 font-medium">Setor (opcional)</Label>
                <Input value={setor} onChange={(e) => setSetor(e.target.value)} placeholder="ex.: Software, Turismo, Indústria" className={INPUT_CLS} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-700 font-medium">Dimensão</Label>
                <select value={dimensao} onChange={(e) => setDimensao(e.target.value)} className={SELECT_CLS}>
                  <option value="">Qualquer</option>
                  {DIMENSOES.map((d) => <option key={d.v} value={d.v}>{d.l}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-700 font-medium">Região (NUTS II)</Label>
                <select value={regiao} onChange={(e) => setRegiao(e.target.value)} className={SELECT_CLS}>
                  <option value="">Qualquer</option>
                  {REGIOES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium text-base">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> A analisar…</> : <><Search className="w-4 h-4 mr-2" /> Encontrar fundos elegíveis</>}
            </Button>
          </form>
        </div>
      </div>

      {dados && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-16 -mt-4">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm mb-4">
            <span className="text-slate-500">{dados.resumo.totalAvisosAbertos} avisos abertos analisados</span>
            <span className="text-slate-300">·</span>
            <span className="text-green-600 font-semibold">{dados.resumo.elegiveis} elegíveis</span>
            <span className="text-amber-600 font-semibold">{dados.resumo.comReservas} com reservas</span>
          </div>

          {dados.resultados.length === 0 ? (
            <div className="text-center text-slate-500 py-12 px-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
              Não encontrámos avisos claramente elegíveis com estes critérios. Tenta alargar (ex.: sem CAE) ou fala connosco.
            </div>
          ) : (
            <div className="space-y-4">
              {dados.resultados.map((r) => {
                const v = VEREDICTO[r.elegibilidade.veredicto] ?? VEREDICTO.dados_insuficientes
                return (
                  <div key={r.id} className={`bg-white border border-slate-200 border-l-4 ${v.accent} rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow`}>
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${v.badge}`}>{v.label}</span>
                          <span className="text-[11px] font-medium text-slate-500 bg-slate-100 rounded-full px-2 py-0.5">{r.portal}</span>
                        </div>
                        <h3 className="font-semibold text-slate-900 leading-snug">{r.nome}</h3>
                      </div>
                      <div className="text-right shrink-0">
                        <div className={`text-2xl font-bold tabular-nums ${v.score}`}>{r.elegibilidade.score}%</div>
                        <div className="text-[10px] text-slate-400">{r.elegibilidade.criteriosAvaliados} de {r.elegibilidade.criteriosTotal} critérios</div>
                      </div>
                    </div>
                    <ul className="space-y-1.5 mb-3">
                      {r.elegibilidade.criterios.map((c, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${DOT[c.estado]}`} />
                          <span className="text-slate-600"><span className="font-medium text-slate-900">{c.dimensao}:</span> {c.explicacao}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 border-t border-slate-100 pt-3">
                      {r.prazo && <span>Prazo: {r.prazo.split('-').reverse().join('/')}</span>}
                      {r.montanteMaximo && <span className="font-semibold text-slate-700">Até €{r.montanteMaximo.toLocaleString('pt-PT')}</span>}
                      {r.link && <a href={r.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1 ml-auto">Aviso oficial <ExternalLink className="w-3 h-3" /></a>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="text-center pt-8">
            <p className="text-slate-600 mb-3">Queres que a TA Consulting trate da candidatura por ti?</p>
            <Link href="/auth/login"><Button className="bg-blue-600 hover:bg-blue-700 text-white px-6">Falar com um consultor</Button></Link>
          </div>
        </div>
      )}
    </div>
  )
}
