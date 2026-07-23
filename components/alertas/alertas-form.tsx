'use client'

/**
 * Form de subscrição de alertas por setor (fase B, double opt-in passo 0).
 * Usado nos hubs /fundos/* e nas páginas de aviso fechado.
 */
import { useState } from 'react'
import { Bell, Loader2, MailCheck } from 'lucide-react'

export function AlertasForm({ setorSlug, setorLabel, origem }: { setorSlug: string; setorLabel: string; origem?: string }) {
    const [email, setEmail] = useState('')
    const [consent, setConsent] = useState(false)
    const [estado, setEstado] = useState<'idle' | 'loading' | 'pendente' | 'ativo' | 'erro'>('idle')
    const [erro, setErro] = useState('')

    const submeter = async (e: React.FormEvent) => {
        e.preventDefault()
        if (estado === 'loading') return
        setEstado('loading')
        setErro('')
        try {
            const res = await fetch('/api/alertas/subscrever', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, setor: setorSlug, consent, origem }),
            })
            const j = await res.json()
            if (!res.ok) { setErro(j.error || 'Erro ao subscrever.'); setEstado('erro'); return }
            setEstado(j.estado === 'ATIVO' ? 'ativo' : 'pendente')
        } catch {
            setErro('Erro de ligação.'); setEstado('erro')
        }
    }

    if (estado === 'pendente') {
        return (
            <div className="flex items-center gap-3 bg-emerald-500/[0.08] border border-emerald-500/25 rounded-xl p-4 text-sm">
                <MailCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <p className="text-slate-300">Quase! Enviámos-te um email — <b className="text-white">clica no link para confirmar</b> os alertas de {setorLabel}.</p>
            </div>
        )
    }
    if (estado === 'ativo') {
        return (
            <div className="flex items-center gap-3 bg-emerald-500/[0.08] border border-emerald-500/25 rounded-xl p-4 text-sm">
                <MailCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <p className="text-slate-300">Os teus alertas de {setorLabel} já estavam ativos — atualizámos a preferência. ✓</p>
            </div>
        )
    }

    return (
        <form onSubmit={submeter} className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-1.5">
                <Bell className="w-4 h-4 text-emerald-400" />
                <h3 className="font-semibold text-slate-100 text-sm">Avisa-me quando abrir um fundo de {setorLabel}</h3>
            </div>
            <p className="text-xs text-slate-500 mb-3">Resumo semanal, só quando há novidades. Cancelas com 1 clique.</p>
            <div className="flex flex-col sm:flex-row gap-2">
                <input
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="o-teu@email.pt" aria-label="Email para alertas"
                    className="flex-1 h-10 rounded-md bg-white/[0.04] border border-white/15 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button type="submit" disabled={estado === 'loading' || !consent}
                    className="h-10 px-5 rounded-md bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-[#0a0b0f] font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors">
                    {estado === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Subscrever'}
                </button>
            </div>
            <label className="flex items-start gap-2 text-xs text-slate-500 mt-3 cursor-pointer">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 accent-emerald-500" />
                Aceito receber alertas de fundos por email. Os dados servem só para os alertas (RGPD) e posso cancelar em qualquer email.
            </label>
            {erro && <p className="text-xs text-red-400 mt-2">{erro}</p>}
        </form>
    )
}
