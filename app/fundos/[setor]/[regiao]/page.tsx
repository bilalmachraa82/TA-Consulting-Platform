/**
 * Hub setor×região /fundos/[setor]/[regiao] (fase B) — ex.: /fundos/turismo/norte.
 * Regras iguais ao hub de setor; combos vazios ficam noindex e fora do sitemap.
 */
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SITE_URL } from '@/lib/site-url'
import { SETORES, REGIOES_HUB, setorPorSlug, regiaoPorSlug } from '@/lib/setores'
import { avisosAbertos, filtrarPorSetor, filtrarPorRegiao } from '@/lib/hub-data'
import { HubAvisos } from '@/components/fundos/hub-avisos'

export const revalidate = 3600
export const dynamicParams = false

export function generateStaticParams() {
    return SETORES.flatMap((s) => REGIOES_HUB.map((r) => ({ setor: s.slug, regiao: r.slug })))
}

export async function generateMetadata({ params }: { params: { setor: string; regiao: string } }): Promise<Metadata> {
    const setor = setorPorSlug(params.setor)
    const regiao = regiaoPorSlug(params.regiao)
    if (!setor || !regiao) return {}
    const avisos = filtrarPorRegiao(filtrarPorSetor(await avisosAbertos(), setor), regiao.nuts)
    return {
        title: `Fundos para ${setor.label.toLowerCase()} no ${regiao.label} (${avisos.length}) — 2026`,
        description: `Avisos abertos de ${setor.label.toLowerCase()} elegíveis na região ${regiao.label}, com prazos e montantes. Atualizado diariamente.`,
        alternates: { canonical: `${SITE_URL}/fundos/${setor.slug}/${regiao.slug}` },
        robots: avisos.length === 0 ? { index: false, follow: true } : undefined,
    }
}

export default async function SetorRegiaoHubPage({ params }: { params: { setor: string; regiao: string } }) {
    const setor = setorPorSlug(params.setor)
    const regiao = regiaoPorSlug(params.regiao)
    if (!setor || !regiao) notFound()
    const avisos = filtrarPorRegiao(filtrarPorSetor(await avisosAbertos(), setor), regiao.nuts)
    return <HubAvisos setor={setor} regiaoLabel={regiao.label} avisos={avisos} />
}
