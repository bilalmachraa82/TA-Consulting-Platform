'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { PremiumCard } from '@/components/ui/premium-card'
import { Loader2, MailCheck, KeyRound } from 'lucide-react'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Não foi possível processar o pedido')
        return
      }
      setEnviado(true)
    } catch {
      toast.error('Erro de ligação. Tenta novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] max-w-[120vw] h-[520px] bg-emerald-500/10 blur-[150px] rounded-full" />
      </div>

      <PremiumCard glow className="w-full max-w-md relative z-10" variant="glass">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-slate-900/50 border border-slate-700 flex items-center justify-center shadow-lg shadow-emerald-900/20">
            {enviado
              ? <MailCheck className="w-7 h-7 text-emerald-400" />
              : <KeyRound className="w-7 h-7 text-emerald-400" />}
          </div>
          <CardTitle className="text-2xl font-bold text-white tracking-tight">
            {enviado ? 'Verifica o teu email' : 'Recuperar acesso'}
          </CardTitle>
          <CardDescription className="text-slate-400">
            {enviado
              ? 'Se existir uma conta com esse email, o link de recuperação chega em instantes.'
              : 'Indica o teu email e enviamos um link para definires uma nova palavra-passe.'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {enviado ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-400 text-center">
                O link é válido durante 1 hora e só pode ser usado uma vez.
                Não te esqueças de ver a pasta de spam.
              </p>
              <Button
                variant="outline"
                className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                onClick={() => setEnviado(false)}
              >
                Usar outro email
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Email da conta</Label>
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

              <Button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#0a0b0f] shadow-lg shadow-emerald-600/20 font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    A enviar...
                  </>
                ) : (
                  'Enviar link de recuperação'
                )}
              </Button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-slate-800 text-center text-sm text-slate-500">
            Lembraste-te?{' '}
            <Link href="/auth/login" className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
              Iniciar sessão
            </Link>
          </div>
        </CardContent>
      </PremiumCard>
    </div>
  )
}
