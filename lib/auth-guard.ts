import { getServerSession } from 'next-auth'
import type { Session } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'

/**
 * Guard de sessão para Server Components (páginas/layouts).
 * Redireciona para a página de login (authOptions.pages.signIn = /auth/login)
 * quando não existe sessão; caso contrário devolve a sessão.
 */
export async function requireSession(callbackUrl?: string): Promise<Session> {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect(
      callbackUrl
        ? `/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
        : '/auth/login'
    )
  }
  return session
}
