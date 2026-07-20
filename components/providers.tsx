
'use client'


import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'

export function Providers({ children }: { children: React.ReactNode }) {
  // Nota: não bloquear o render até "mounted". A versão anterior devolvia null
  // no primeiro render, provocando um flash de página vazia e prejudicando o
  // conteúdo inicial. O ThemeProvider já trata a hidratação de tema sozinho.
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        <Toaster />
      </ThemeProvider>
    </SessionProvider>
  )
}
