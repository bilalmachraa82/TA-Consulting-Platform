import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ta-consulting-platform.vercel.app'

// Sitemap das páginas PÚBLICAS (indexáveis). O dashboard e áreas com login ficam
// de fora. /encontrar-fundos é a página-chave para captação → prioridade máxima.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const paginas: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
    { path: '', priority: 1.0, freq: 'weekly' },
    { path: '/encontrar-fundos', priority: 0.9, freq: 'daily' },
    { path: '/diagnostico-fundos', priority: 0.7, freq: 'weekly' },
    { path: '/pricing', priority: 0.6, freq: 'monthly' },
  ]
  return paginas.map((p) => ({
    url: `${SITE_URL}${p.path}`,
    lastModified: now,
    changeFrequency: p.freq,
    priority: p.priority,
  }))
}
