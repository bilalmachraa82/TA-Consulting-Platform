/**
 * Página pública de aviso — o coração da máquina de leads (fase B).
 *
 * Arquitetura (eng review 23/07):
 * - ISR on-demand: pré-gera os 100 abertos com prazo mais próximo; o resto ao
 *   1º pedido (dynamicParams). revalidate 1h.
 * - Prisma DIRETO (nunca o fallback JSON do lib/db — não tem slugs; falhar
 *   ruidosamente > 404 silencioso).
 * - Estado aberto/fechado: client-side (<EstadoAviso/>) — o HTML ISR é cache.
 * - Avisos fechados FICAM live (SEO histórico) com CTA para o verificador.
 * - D7.2 (founder): TODOS os campos enriquecidos são públicos.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
import { SITE_URL } from '@/lib/site-url'
import { criteriosDoAviso } from '@/lib/aviso-criterios'
import { EstadoAviso } from '@/components/aviso/estado-aviso'
import { JsonLdScript } from '@/components/seo/json-ld-script'
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react'

export const revalidate = 3600
export const dynamicParams = true

const prisma = new PrismaClient()

const PORTAL_LABELS: Record<string, string> = {
    PORTUGAL2030: 'Portugal 2030', PRR: 'PRR', PEPAC: 'PEPAC',
    TURISMO_PORTUGAL: 'Turismo de Portugal', HORIZON_EUROPE: 'Horizon Europe',
    IPDJ: 'IPDJ', FUNDO_AMBIENTAL: 'Fundo Ambiental', ACORES2030: 'Açores 2030',
    LIFE: 'LIFE', EUROPA_CRIATIVA: 'Europa Criativa', DIGITAL_EUROPE: 'Digital Europe',
}
const portalLabel = (p: string) => PORTAL_LABELS[p] ?? p.replace(/_/g, ' ')

async function getAviso(slug: string) {
    return prisma.aviso.findUnique({ where: { slug } })
}

/** Pré-gera os 100 abertos com prazo mais próximo — o resto é on-demand. */
export async function generateStaticParams() {
    const avisos = await prisma.aviso.findMany({
        where: { slug: { not: null }, dataFimSubmissao: { gte: new Date() } },
        orderBy: { dataFimSubmissao: 'asc' },
        take: 100,
        select: { slug: true },
    })
    return avisos.map((a) => ({ slug: a.slug as string }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const aviso = await getAviso(params.slug)
    if (!aviso) return {}
    const desc = (aviso.descricao ?? `Aviso ${aviso.codigo} do ${portalLabel(aviso.portal)}: elegibilidade, montantes e prazos.`).slice(0, 155)
    return {
        title: `${aviso.nome.slice(0, 60)} — elegibilidade e prazos`,
        description: desc,
        alternates: { canonical: `${SITE_URL}/avisos/${params.slug}` },
        openGraph: { title: aviso.nome, description: desc, url: `${SITE_URL}/avisos/${params.slug}`, locale: 'pt_PT' },
    }
}

export default async function AvisoPage({ params }: { params: { slug: string } }) {
    const aviso = await getAviso(params.slug)
    if (!aviso) notFound()

    const criterios = criteriosDoAviso({
        ...aviso,
        tiposBeneficiarios: aviso.tiposBeneficiarios as unknown as string[],
    })
    const setorPrincipal = aviso.setoresElegiveis?.[0] ?? ''
    const verificadorHref = setorPrincipal
        ? `/encontrar-fundos?setor=${encodeURIComponent(setorPrincipal)}`
        : '/encontrar-fundos'

    // JSON-LD MonetaryGrant — o tipo schema.org exato para apoios financeiros
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'MonetaryGrant',
        name: aviso.nome,
        identifier: aviso.codigo,
        description: aviso.descricao ?? undefined,
        url: `${SITE_URL}/avisos/${aviso.slug}`,
        funder: { '@type': 'Organization', name: portalLabel(aviso.portal) },
        amount: aviso.montanteMaximo
            ? { '@type': 'MonetaryAmount', currency: 'EUR', maxValue: aviso.montanteMaximo }
            : undefined,
    }

    return (
        <div className="min-h-screen bg-[#0a0b0f] text-slate-100 antialiased">
            <JsonLdScript data={jsonLd} />
            {/* Header consistente com o site público */}
            <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0a0b0f]/70 border-b border-white/5">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                            <span className="text-[#0a0b0f] font-bold">e</span>
                        </div>
                        <span className="font-display text-xl text-white">Eligivo</span>
                    </Link>
                    <Link href="/encontrar-fundos" className="text-sm text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1.5">
                        <ArrowLeft className="w-4 h-4" /> Todos os fundos
                    </Link>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
                <div className="mb-4 flex flex-wrap items-center gap-2 text-[11px] font-medium">
                    <span className="text-slate-400 bg-white/5 rounded-full px-2.5 py-1">{portalLabel(aviso.portal)}</span>
                    {/* programa só quando acrescenta informação (≠ nome do portal) */}
                    {aviso.programa && aviso.programa !== portalLabel(aviso.portal) && (
                        <span className="text-slate-500">{aviso.programa}</span>
                    )}
                </div>

                <h1 className="font-display text-3xl md:text-4xl text-white leading-tight [text-wrap:balance] mb-4">
                    {aviso.nome}
                </h1>

                <EstadoAviso
                    dataFim={aviso.dataFimSubmissao?.toISOString() ?? null}
                    atualizadoEm={aviso.updatedAt.toISOString()}
                />

                {aviso.dataFimSubmissao && (
                    <p className="mt-4 text-slate-400">
                        Prazo de candidatura: <b className="text-slate-200">{aviso.dataFimSubmissao.toLocaleDateString('pt-PT')}</b>
                        {aviso.dataInicioSubmissao && <> · desde {aviso.dataInicioSubmissao.toLocaleDateString('pt-PT')}</>}
                    </p>
                )}

                {aviso.descricao && (
                    <p className="mt-6 text-slate-300 leading-relaxed max-w-[68ch]">{aviso.descricao}</p>
                )}

                {/* Critérios de elegibilidade — tudo público (D7.2) */}
                {criterios.length > 0 && (
                    <section className="mt-8 bg-white/[0.03] border border-white/10 rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Quem é elegível</h2>
                        <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
                            {criterios.map((c) => (
                                <div key={c.rotulo} className="flex flex-col">
                                    <dt className="text-xs uppercase tracking-wide text-slate-500">{c.rotulo}</dt>
                                    <dd className={c.destaque ? 'text-emerald-300 font-semibold' : 'text-slate-200'}>{c.valor}</dd>
                                </div>
                            ))}
                        </dl>
                    </section>
                )}

                {/* CTA — o clique que vira lead */}
                <section className="mt-8 bg-emerald-500/[0.07] border border-emerald-500/25 rounded-2xl p-6 text-center">
                    <h2 className="font-display text-2xl text-white mb-2">A tua empresa é elegível?</h2>
                    <p className="text-slate-400 mb-4">Verifica em 30 segundos, grátis e sem registo — com a análise critério a critério.</p>
                    <Link
                        href={verificadorHref}
                        className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-[#0a0b0f] font-semibold px-6 py-3 rounded-lg transition-colors"
                    >
                        Verificar elegibilidade <ArrowRight className="w-4 h-4" />
                    </Link>
                </section>

                <div className="mt-8 flex flex-wrap items-center gap-4 text-sm">
                    {aviso.link && (
                        <a href={aviso.link} target="_blank" rel="noopener noreferrer"
                            className="text-slate-400 hover:text-slate-200 inline-flex items-center gap-1.5">
                            Aviso oficial <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    )}
                    <span className="text-slate-600">Código: {aviso.codigo}</span>
                </div>
            </main>

            <footer className="border-t border-white/5 py-10 px-4 sm:px-6 mt-10">
                <div className="max-w-3xl mx-auto flex items-center justify-between text-sm text-slate-500">
                    <span>© 2026 Eligivo · Inteligência de fundos europeus</span>
                    <Link href="/encontrar-fundos" className="text-emerald-400 hover:text-emerald-300">Ver todos os fundos</Link>
                </div>
            </footer>
        </div>
    )
}
