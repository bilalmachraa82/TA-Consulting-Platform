'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log error to monitoring service (Sentry, etc.)
        console.error('Application Error:', error)
    }, [error])

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-900 p-4">
            <div className="max-w-md w-full text-center">
                <div className="flex justify-center mb-6">
                    <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-4">
                        <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                    Algo correu mal!
                </h2>

                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Ocorreu um erro inesperado ao carregar a aplicação.
                    Por favor, tenta novamente.
                </p>

                {process.env.NODE_ENV === 'development' && (
                    <div className="mb-6 p-4 bg-gray-100 dark:bg-slate-800 rounded-lg text-left">
                        <p className="text-xs font-mono text-red-600 dark:text-red-400 break-all">
                            {error.message}
                        </p>
                    </div>
                )}

                <div className="flex gap-3 justify-center">
                    <button
                        onClick={() => reset()}
                        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
                    >
                        Tentar novamente
                    </button>

                    <a
                        href="/dashboard"
                        className="px-6 py-3 bg-gray-200 text-gray-900 font-medium rounded-lg hover:bg-gray-300 dark:bg-slate-700 dark:text-gray-100 dark:hover:bg-slate-600 transition-colors"
                    >
                        Voltar ao Dashboard
                    </a>
                </div>
            </div>
        </div>
    )
}
