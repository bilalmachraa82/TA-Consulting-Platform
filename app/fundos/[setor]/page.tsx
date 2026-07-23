/**
 * Hub setorial /fundos/[setor] (fase B) — ex.: /fundos/turismo.
 * ISR 1h; 12 setores pré-gerados; setor inválido → 404; hub vazio → noindex.
 */
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SITE_URL } from '@/lib/site-url'
import { SETORES, setorPorSlug } from '@/lib/setores'
import { avisosAbertos, filtrarPorSetor } from '@/lib/hub-data'
import { HubAvisos } from '@/components/fundos/hub-avisos'

export const revalidate = 3600
export const dynamicParams = false // só os 12 setores conhecidos

export function generateStaticParams() {
    return SETORES.map((s) => ({ setor: s.slug }))
}

export async function generateMetadata({ params }: { params: { setor: string } }): Promise<Metadata> {
    const setor = setorPorSlug(params.setor)
    if (!setor) return {}
    const avisos = filtrarPorSetor(await avisosAbertos(), setor)
    return {
        title: `Fundos abertos para ${setor.label.toLowerCase()} (${avisos.length}) — 2026`,
        description: `${setor.descricao} Lista atualizada diariamente com prazos, montantes e elegibilidade.`,
        alternates: { canonical: `${SITE_URL}/fundos/${setor.slug}` },
        // hub vazio: fica navegável mas fora do índice (evita soft-404 em massa)
        robots: avisos.length === 0 ? { index: false, follow: true } : undefined,
    }
}

export default async function SetorHubPage({ params }: { params: { setor: string } }) {
    const setor = setorPorSlug(params.setor)
    if (!setor) notFound()
    const avisos = filtrarPorSetor(await avisosAbertos(), setor)
    return <HubAvisos setor={setor} avisos={avisos} />
}
