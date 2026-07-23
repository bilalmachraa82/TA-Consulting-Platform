/**
 * Corpo partilhado dos hubs /fundos/[setor] e /fundos/[setor]/[regiao] (fase B).
 * Server component: recebe os avisos já filtrados e renderiza a lista viva.
 */
import Link from 'next/link'
import { ArrowRight, ExternalLink } from 'lucide-react'
import type { SetorHub } from '@/lib/setores'
import { AlertasForm } from '@/components/alertas/alertas-form'

export interface AvisoHubItem {
    slug: string | null
    nome: string
    portal: string
    dataFimSubmissao: Date | null
    montanteMaximo: number | null
    taxaCofinanciamentoMax: number | null
}

const portalLabel = (p: string) => p.replace(/_/g, ' ').replace('PORTUGAL2030', 'Portugal 2030')

export function HubAvisos({
    setor, regiaoLabel, avisos,
}: { setor: SetorHub; regiaoLabel?: string; avisos: AvisoHubItem[] }) {
    const titulo = regiaoLabel
        ? `Fundos para ${setor.label.toLowerCase()} no ${regiaoLabel}`
        : `Fundos abertos para ${setor.label.toLowerCase()}`

    return (
        <div className="min-h-screen bg-[#0a0b0f] text-slate-100 antialiased">
            <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0a0b0f]/70 border-b border-white/5">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                            <span className="text-[#0a0b0f] font-bold">e</span>
                        </div>
                        <span className="font-display text-xl text-white">Eligivo</span>
                    </Link>
                    <Link href="/encontrar-fundos" className="text-sm text-slate-400 hover:text-white transition-colors">
                        Verificador de elegibilidade
                    </Link>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-2">
                    {avisos.length} aviso{avisos.length === 1 ? '' : 's'} aberto{avisos.length === 1 ? '' : 's'} · atualizado diariamente
                </p>
                <h1 className="font-display text-3xl md:text-4xl text-white leading-tight [text-wrap:balance] mb-3">{titulo}</h1>
                <p className="text-slate-400 max-w-[65ch] mb-8">{setor.descricao}</p>

                {avisos.length === 0 ? (
                    <div className="text-center py-14 px-6 bg-white/[0.03] border border-white/10 rounded-2xl">
                        <p className="text-slate-300 font-medium mb-1">Sem avisos abertos neste momento.</p>
                        <p className="text-slate-500 text-sm mb-4">Os portais são varridos todos os dias — verifica a elegibilidade da tua empresa e fica a saber quando abrir.</p>
                        <Link href="/encontrar-fundos" className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-[#0a0b0f] font-semibold px-5 py-2.5 rounded-lg transition-colors">
                            Verificar elegibilidade <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {avisos.map((a) => (
                            <li key={a.slug} className="bg-white/[0.03] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-colors">
                                <Link href={`/avisos/${a.slug}`} className="block group">
                                    <div className="flex flex-wrap items-center gap-2 text-[11px] mb-1.5">
                                        <span className="text-slate-400 bg-white/5 rounded-full px-2 py-0.5">{portalLabel(a.portal)}</span>
                                        {a.dataFimSubmissao && (
                                            <span className="text-slate-500">até {a.dataFimSubmissao.toLocaleDateString('pt-PT')}</span>
                                        )}
                                    </div>
                                    <h2 className="font-semibold text-slate-100 group-hover:text-white leading-snug">{a.nome}</h2>
                                    <div className="mt-2 flex flex-wrap gap-x-4 text-xs">
                                        {a.montanteMaximo && <span className="text-amber-300/90 font-semibold">até €{a.montanteMaximo.toLocaleString('pt-PT')}</span>}
                                        {a.taxaCofinanciamentoMax && <span className="text-emerald-300/90">{a.taxaCofinanciamentoMax}% cofinanciamento</span>}
                                        <span className="text-emerald-400 inline-flex items-center gap-1 ml-auto">Ver elegibilidade <ArrowRight className="w-3 h-3" /></span>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}

                <section className="mt-10 bg-emerald-500/[0.07] border border-emerald-500/25 rounded-2xl p-6 text-center">
                    <h2 className="font-display text-2xl text-white mb-2">A tua empresa é elegível a estes fundos?</h2>
                    <p className="text-slate-400 mb-4">Análise critério a critério, grátis e sem registo.</p>
                    <Link href={`/encontrar-fundos?setor=${encodeURIComponent(setor.label)}`}
                        className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-[#0a0b0f] font-semibold px-6 py-3 rounded-lg transition-colors">
                        Verificar agora <ArrowRight className="w-4 h-4" />
                    </Link>
                </section>

                <div className="mt-6">
                    <AlertasForm setorSlug={setor.slug} setorLabel={setor.label} origem={regiaoLabel ? `hub-${setor.slug}-${regiaoLabel.toLowerCase()}` : `hub-${setor.slug}`} />
                </div>
            </main>

            <footer className="border-t border-white/5 py-10 px-4 sm:px-6 mt-10">
                <div className="max-w-3xl mx-auto text-sm text-slate-500">© 2026 Eligivo · Inteligência de fundos europeus</div>
            </footer>
        </div>
    )
}
