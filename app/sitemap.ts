import type { MetadataRoute } from 'next'
import { PrismaClient } from '@prisma/client'
import { SITE_URL } from '@/lib/site-url'

/**
 * Sitemap das páginas PÚBLICAS (fase B): estáticas + 2.190 páginas de aviso.
 * - SITE_URL vem da fonte única lib/site-url.ts (fix da regressão: esta cópia
 *   local apontava ao domínio antigo ta-consulting-platform).
 * - Avisos ABERTOS: priority alta + daily. FECHADOS: ficam no sitemap (SEO
 *   histórico) com priority baixa — exceto fechados há >6 meses (noindex na
 *   página em T9; aqui simplesmente omitidos para não diluir o crawl budget).
 * - Hubs setor/região entram com o T4.
 */

const prisma = new PrismaClient()

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date()
    const seisMesesAtras = new Date(now.getTime() - 183 * 86_400_000)

    const estaticas: MetadataRoute.Sitemap = [
        { url: `${SITE_URL}`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
        { url: `${SITE_URL}/encontrar-fundos`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
        { url: `${SITE_URL}/pricing`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    ]

    const avisos = await prisma.aviso.findMany({
        where: {
            slug: { not: null },
            OR: [
                { dataFimSubmissao: { gte: seisMesesAtras } }, // abertos + fechados recentes
                { dataFimSubmissao: null },                    // prazo por confirmar
            ],
        },
        select: { slug: true, updatedAt: true, dataFimSubmissao: true },
    })

    const paginasAvisos: MetadataRoute.Sitemap = avisos.map((a) => {
        const aberto = a.dataFimSubmissao ? a.dataFimSubmissao >= now : false
        return {
            url: `${SITE_URL}/avisos/${a.slug}`,
            lastModified: a.updatedAt,
            changeFrequency: aberto ? ('daily' as const) : ('monthly' as const),
            priority: aberto ? 0.8 : 0.3,
        }
    })

    return [...estaticas, ...paginasAvisos]
}
