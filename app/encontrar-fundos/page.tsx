'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Search, ExternalLink, Sparkles } from 'lucide-react'
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

const DOT: Record<Estado, string> = { ok: 'bg-green-500', atencao: 'bg-yellow-500', falha: 'bg-red-500', desconhecido: 'bg-slate-500' }
const VEREDICTO: Record<string, { label: string; cls: string }> = {
  elegivel: { label: 'Elegível', cls: 'bg-green-500/15 text-green-400 border-green-500/30' },
  elegivel_com_reservas: { label: 'Elegível com reservas', cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  dados_insuficientes: { label: 'A confirmar', cls: 'bg-slate-500/15 text-slate-300 border-slate-500/30' },
}

const REGIOES = ['Norte', 'Centro', 'Lisboa', 'Alentejo', 'Algarve', 'Açores', 'Madeira']
const DIMENSOES = [
  { v: 'MICRO', l: 'Micro (até 10)' }, { v: 'PEQUENA', l: 'Pequena (até 50)' },
  { v: 'MEDIA', l: 'Média (até 250)' }, { v: 'GRANDE', l: 'Grande (250+)' },
]

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
    <div className="min-h-screen bg-slate-950 text-foreground">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-xs text-blue-400 border border-blue-500/30 rounded-full px-3 py-1 mb-4">
            <Sparkles className="w-3 h-3" /> TA Consulting · Fundos europeus
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Encontra os fundos a que a tua empresa é elegível</h1>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            Base atualizada diariamente de 9 portais (Portugal 2030, PRR, PEPAC, Horizon…).
            Indica o perfil da empresa e vê os avisos abertos com a análise de elegibilidade, critério a critério.
          </p>
        </div>

        <form onSubmit={submeter} className="bg-card/60 border border-border rounded-2xl p-6 backdrop-blur-xl space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">CAE (opcional)</Label>
              <Input value={cae} onChange={(e) => setCae(e.target.value)} placeholder="ex.: 62010" className="bg-slate-900/50 border-slate-700" />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Setor (opcional)</Label>
              <Input value={setor} onChange={(e) => setSetor(e.target.value)} placeholder="ex.: Software, Turismo, Indústria" className="bg-slate-900/50 border-slate-700" />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Dimensão</Label>
              <select value={dimensao} onChange={(e) => setDimensao(e.target.value)} className="w-full h-10 rounded-md bg-slate-900/50 border border-slate-700 px-3 text-sm">
                <option value="">Qualquer</option>
                {DIMENSOES.map((d) => <option key={d.v} value={d.v}>{d.l}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Região (NUTS II)</Label>
              <select value={regiao} onChange={(e) => setRegiao(e.target.value)} className="w-full h-10 rounded-md bg-slate-900/50 border border-slate-700 px-3 text-sm">
                <option value="">Qualquer</option>
                {REGIOES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> A analisar…</> : <><Search className="w-4 h-4 mr-2" /> Encontrar fundos elegíveis</>}
          </Button>
        </form>

        {dados && (
          <div className="mt-8 space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="text-muted-foreground">{dados.resumo.totalAvisosAbertos} avisos abertos analisados ·</span>
              <span className="text-green-400 font-medium">{dados.resumo.elegiveis} elegíveis</span>
              <span className="text-yellow-400 font-medium">{dados.resumo.comReservas} com reservas</span>
            </div>

            {dados.resultados.length === 0 ? (
              <div className="text-center text-muted-foreground py-10 border border-border rounded-2xl">
                Não encontrámos avisos claramente elegíveis com estes critérios. Tenta alargar (ex.: sem CAE) ou fala connosco.
              </div>
            ) : dados.resultados.map((r) => {
              const v = VEREDICTO[r.elegibilidade.veredicto] ?? VEREDICTO.dados_insuficientes
              return (
                <div key={r.id} className="bg-card/60 border border-border rounded-2xl p-5 backdrop-blur-sm">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${v.cls}`}>{v.label}</span>
                        <span className="text-[11px] text-muted-foreground border border-border rounded px-2 py-0.5">{r.portal}</span>
                      </div>
                      <h3 className="font-semibold leading-snug">{r.nome}</h3>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-bold text-blue-400">{r.elegibilidade.score}%</div>
                      <div className="text-[10px] text-muted-foreground">{r.elegibilidade.criteriosAvaliados} de {r.elegibilidade.criteriosTotal} critérios</div>
                    </div>
                  </div>
                  <ul className="space-y-1.5 mb-3">
                    {r.elegibilidade.criterios.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${DOT[c.estado]}`} />
                        <span><span className="font-medium">{c.dimensao}:</span> <span className="text-muted-foreground">{c.explicacao}</span></span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground border-t border-border pt-3">
                    {r.prazo && <span>Prazo: {r.prazo.split('-').reverse().join('/')}</span>}
                    {r.montanteMaximo && <span>Até €{r.montanteMaximo.toLocaleString('pt-PT')}</span>}
                    {r.link && <a href={r.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 ml-auto">Aviso oficial <ExternalLink className="w-3 h-3" /></a>}
                  </div>
                </div>
              )
            })}

            <div className="text-center pt-4">
              <p className="text-muted-foreground text-sm mb-3">Queres que a TA Consulting trate da candidatura por ti?</p>
              <Link href="/auth/login"><Button variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-800">Falar com um consultor</Button></Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
