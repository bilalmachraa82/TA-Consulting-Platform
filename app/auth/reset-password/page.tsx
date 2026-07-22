'use client'

import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { PremiumCard } from '@/components/ui/premium-card'
import { Eye, EyeOff, Loader2, ShieldCheck, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams?.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const curta = password.length > 0 && password.length < 10
  const naoCoincide = confirmacao.length > 0 && password !== confirmacao

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmacao) {
      toast.error('As palavras-passe não coincidem')
      return
    }
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Não foi possível repor a palavra-passe')
        return
      }

      toast.success('Palavra-passe alterada. Vamos entrar.')
      router.replace('/auth/login')
    } catch {
      toast.error('Erro de ligação. Tenta novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <PremiumCard glow className="w-full max-w-md relative z-10" variant="glass">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-slate-900/50 border border-slate-700 flex items-center justify-center">
            <ShieldAlert className="w-7 h-7 text-amber-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Link inválido</CardTitle>
          <CardDescription className="text-slate-400">
            Este endereço não tem um token de recuperação válido.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/auth/forgot-password">
            <Button className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#0a0b0f]">
              Pedir novo link
            </Button>
          </Link>
        </CardContent>
      </PremiumCard>
    )
  }

  return (
    <PremiumCard glow className="w-full max-w-md relative z-10" variant="glass">
      <CardHeader className="text-center pb-2">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-slate-900/50 border border-slate-700 flex items-center justify-center">
          <ShieldCheck className="w-7 h-7 text-emerald-400" />
        </div>
        <CardTitle className="text-2xl font-bold text-white tracking-tight">Nova palavra-passe</CardTitle>
        <CardDescription className="text-slate-400">
          Mínimo 10 caracteres, com letras e números.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-300">Nova palavra-passe</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-white hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            {curta && <p className="text-xs text-amber-400">Ainda faltam {10 - password.length} caracteres.</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmacao" className="text-slate-300">Confirmar</Label>
            <Input
              id="confirmacao"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••"
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
              required
              disabled={isLoading}
              className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
            />
            {naoCoincide && <p className="text-xs text-amber-400">As palavras-passe não coincidem.</p>}
          </div>

          <Button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#0a0b0f] shadow-lg shadow-emerald-600/20 font-medium"
            disabled={isLoading || curta || naoCoincide || password.length === 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                A guardar...
              </>
            ) : (
              'Definir palavra-passe'
            )}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center text-sm text-slate-500">
          <Link href="/auth/login" className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
            Voltar ao início de sessão
          </Link>
        </div>
      </CardContent>
    </PremiumCard>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] max-w-[120vw] h-[520px] bg-emerald-500/10 blur-[150px] rounded-full" />
      </div>
      <Suspense fallback={<Loader2 className="w-6 h-6 animate-spin text-emerald-400 relative z-10" />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}
