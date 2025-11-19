'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
            <div className="flex items-center space-x-2 text-destructive">
                <AlertTriangle className="h-6 w-6" />
                <h2 className="text-xl font-bold">Algo correu mal no simulador!</h2>
            </div>
            <p className="text-muted-foreground">{error.message || "Erro desconhecido."}</p>
            <Button onClick={() => reset()}>Tentar Novamente</Button>
        </div>
    )
}
