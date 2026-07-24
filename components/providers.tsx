
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
      {/* forcedTheme: a app é dark-committed (design system Eligivo). O light
          mode estava meio-temático (sidebar escura em fundo claro, contraste
          quebrado) — força-se dark até existir um tema claro completo (TODOS.md). */}
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        forcedTheme="dark"
        disableTransitionOnChange
      >
        {children}
        <Toaster />
      </ThemeProvider>
    </SessionProvider>
  )
}
