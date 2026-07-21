import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { JsonLd } from '@/components/seo/json-ld'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  adjustFontFallback: true,
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const dynamic = "force-dynamic"

// URL canónico do site para SEO/OG/sitemap. Aponta para eligivo.com quando o
// domínio estiver ligado — basta definir NEXT_PUBLIC_SITE_URL no Vercel.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ta-consulting-platform.vercel.app'

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Eligivo — Sabe a que fundos europeus a tua empresa é elegível',
    template: '%s | Eligivo',
  },
  description: 'Descobre grátis a que fundos europeus (Portugal 2030, PRR, PEPAC, Horizon…) a tua empresa é elegível, com análise de elegibilidade critério a critério. Base atualizada diariamente de 10 portais nacionais e europeus.',
  applicationName: 'Eligivo',
  keywords: ['fundos europeus', 'Portugal 2030', 'PRR', 'PEPAC', 'Horizon Europe', 'incentivos', 'subsídios', 'candidaturas a fundos', 'elegibilidade', 'apoios PME', 'consultoria de fundos'],
  authors: [{ name: 'Eligivo' }],
  alternates: { canonical: '/' },
  icons: { icon: '/favicon.svg', shortcut: '/favicon.svg' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: {
    type: 'website',
    locale: 'pt_PT',
    url: SITE_URL,
    siteName: 'Eligivo',
    title: 'Eligivo — Sabe a que fundos europeus a tua empresa é elegível',
    description: 'Descobre grátis a que fundos europeus a tua empresa é elegível, com análise critério a critério. 10 portais, atualização diária.',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eligivo — Sabe a que fundos europeus a tua empresa é elegível',
    description: 'Descobre grátis a que fundos europeus a tua empresa é elegível, com análise critério a critério.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <JsonLd siteUrl={SITE_URL} />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
