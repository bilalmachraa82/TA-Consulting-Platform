
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950/0 to-slate-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-500/10 blur-[100px] rounded-full" />
      </div>

      <PremiumCard glow className="w-full max-w-md relative z-10" variant="glass">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-slate-900/50 border border-slate-700 flex items-center justify-center shadow-lg shadow-blue-900/20 group">
            <span className="text-white font-bold text-2xl group-hover:scale-110 transition-transform duration-300">TA<span className="text-blue-500">.</span></span>
          </div>
          <CardTitle className="text-2xl font-bold text-white tracking-tight">Bem-vindo de volta</CardTitle>
          <CardDescription className="text-slate-400">
            Aceda ao seu ecossistema de consultoria
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
                className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">Palavra-passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 pr-10"
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

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 font-medium" disabled={isLoading}>
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
            <Link href="/auth/register" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
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
