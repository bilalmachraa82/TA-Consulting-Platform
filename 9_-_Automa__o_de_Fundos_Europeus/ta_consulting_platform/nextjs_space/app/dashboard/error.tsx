'use client'

import { useEffect } from 'react'
import { AlertCircle, Home, RefreshCw } from 'lucide-react'

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Dashboard Error:', error)
    }, [error])

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
            <div className="max-w-lg w-full">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-slate-700">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="rounded-full bg-amber-100 dark:bg-amber-900/20 p-3">
                            <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                Erro no Dashboard
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Não foi possível carregar esta página
                            </p>
                        </div>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 mb-6">
                        Ocorreu um erro ao processar os teus dados. Isto pode ser temporário.
                        Por favor, tenta uma das opções abaixo:
                    </p>

                    {process.env.NODE_ENV === 'development' && error.message && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-xs font-semibold text-red-800 dark:text-red-400 mb-2">
                                Detalhes do erro (Dev only):
                            </p>
                            <p className="text-xs font-mono text-red-700 dark:text-red-300 break-all">
                                {error.message}
                            </p>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => reset()}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Tentar novamente
                        </button>

                        <a
                            href="/dashboard"
                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-900 font-medium rounded-lg hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-100 dark:hover:bg-slate-600 transition-colors"
                        >
                            <Home className="h-4 w-4" />
                            Dashboard Inicial
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
