
'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { PremiumCard } from '@/components/ui/premium-card'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('Credenciais inválidas')
      } else {
        const session = await getSession()
        toast.success('Login efetuado com sucesso')
        router.replace('/dashboard')
      }
    } catch (error) {
      toast.error('Erro no login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fundo consistente com a marca Eligivo (homepage / encontrar-fundos) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] max-w-[120vw] h-[520px] bg-emerald-500/10 blur-[150px] rounded-full" />
      </div>

      <PremiumCard glow className="w-full max-w-md relative z-10" variant="glass">
        <CardHeader className="text-center pb-2">
          <div className="w-14 h-14 mx-auto mb-6 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-900/30">
            <span className="text-[#0a0b0f] font-bold text-2xl">e</span>
          </div>
          <CardTitle className="font-display text-3xl font-normal text-white tracking-tight">Bem-vindo de volta</CardTitle>
          <CardDescription className="text-slate-400">
            Entra na tua conta Eligivo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Email Profissional</Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-300">Palavra-passe</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Esqueceste-te?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
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
            </div>

            <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#0a0b0f] shadow-lg shadow-emerald-600/20 font-medium" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  A validar...
                </>
              ) : (
                'Iniciar Sessão'
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800 text-center text-sm text-slate-500">
            Não tem acesso?{' '}
            <Link href="/auth/register" className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
              Solicitar conta
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
              ← Voltar ao site
            </Link>
          </div>
        </CardContent>
      </PremiumCard>
    </div>
  )
}
