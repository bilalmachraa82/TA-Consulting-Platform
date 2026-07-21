/**
 * Structured data (JSON-LD) para SEO + GEO.
 *
 * O que o Google (rich results / AI Overviews) e os motores de IA
 * (ChatGPT, Claude, Perplexity) leem para perceber e CITAR o site: quem somos
 * (Organization), o site (WebSite) e a ferramenta pública (WebApplication).
 *
 * Injetado via children do <script> (texto puro): os dados são 100% estáticos e
 * sem caracteres HTML especiais (& < >), pelo que o React escreve JSON-LD válido
 * e seguro, sem qualquer injeção de HTML cru.
 */

export function JsonLd({ siteUrl }: { siteUrl: string }) {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#org`,
        name: 'Eligivo',
        url: siteUrl,
        logo: `${siteUrl}/favicon.svg`,
        description:
          'Plataforma de inteligência de fundos europeus para PME e consultoras em Portugal: descoberta de avisos, análise de elegibilidade explicável e apoio à candidatura.',
        areaServed: 'PT',
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        name: 'Eligivo',
        url: siteUrl,
        publisher: { '@id': `${siteUrl}/#org` },
        inLanguage: 'pt-PT',
      },
      {
        '@type': 'WebApplication',
        name: 'Eligivo — Encontrar fundos elegíveis',
        url: `${siteUrl}/encontrar-fundos`,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        inLanguage: 'pt-PT',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
        description:
          'Indica o perfil da empresa (setor, dimensão, região, CAE) e vê os avisos de fundos europeus abertos a que é elegível, com a análise critério a critério.',
      },
    ],
  }

  return <script type="application/ld+json">{JSON.stringify(graph)}</script>
}
