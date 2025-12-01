import './globals.css'
import { Providers } from '@/components/providers'

export const dynamic = "force-dynamic"

export const metadata = {
  title: 'TA Consulting - Automação de Fundos Europeus',
  description: 'Plataforma completa de automação para gestão de avisos, candidaturas e clientes de fundos europeus (Portugal 2030, PEPAC, PRR)',
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    title: 'TA Consulting - Automação de Fundos Europeus',
    description: 'Plataforma completa de automação para gestão de avisos, candidaturas e clientes de fundos europeus',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt">
      <body className="font-sans antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
