'use client'

/**
 * Estado aberto/fechado do aviso calculado NO BROWSER (fase B, decisão do eng
 * review revista pela voz externa: com ISR o HTML É cache — só o cliente
 * garante o estado à data real; o primeiro visitante pós-deadline nunca vê
 * "aberto" falso).
 */
import { useEffect, useState } from 'react'

export function EstadoAviso({ dataFim, atualizadoEm }: { dataFim: string | null; atualizadoEm: string }) {
    // null até montar: SSR e 1º paint não afirmam estado (evita mismatch + estado stale)
    const [aberto, setAberto] = useState<boolean | null>(null)
    const [dias, setDias] = useState<number | null>(null)

    useEffect(() => {
        if (!dataFim) { setAberto(null); return }
        const fim = new Date(dataFim).getTime()
        const d = Math.ceil((fim - Date.now()) / 86_400_000)
        setDias(d)
        setAberto(d >= 0)
    }, [dataFim])

    const atualizado = new Date(atualizadoEm).toLocaleDateString('pt-PT')

    return (
        <div className="flex flex-wrap items-center gap-3">
            {dataFim === null ? (
                <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1 rounded-full border bg-white/5 text-slate-400 border-white/10">
                    Prazo por confirmar
                </span>
            ) : aberto === null ? (
                <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1 rounded-full border bg-white/5 text-slate-400 border-white/10">
                    A verificar prazo…
                </span>
            ) : aberto ? (
                <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1 rounded-full border bg-emerald-500/15 text-emerald-300 border-emerald-500/30">
                    ● Aberto{dias !== null && dias <= 30 ? ` — faltam ${dias} dias` : ''}
                </span>
            ) : (
                <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1 rounded-full border bg-red-500/10 text-red-300 border-red-500/30">
                    Fechado
                </span>
            )}
            <span className="text-xs text-slate-500">Atualizado a {atualizado} · varrimento diário</span>
        </div>
    )
}
