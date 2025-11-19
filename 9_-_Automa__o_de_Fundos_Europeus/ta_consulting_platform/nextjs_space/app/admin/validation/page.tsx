import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, AlertTriangle, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ValidationPage() {
    // Buscar avisos pendentes de validação ou com enriquecimento básico
    const avisosPendentes = await prisma.aviso.findMany({
        where: {
            OR: [
                { enrichmentStatus: 'BASIC' },
                { enrichmentStatus: 'AI_ENRICHED' }
            ],
            ativo: true
        },
        orderBy: { createdAt: 'desc' },
        take: 50
    })

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Validação de Dados</h2>
                    <p className="text-muted-foreground">
                        Confirme a qualidade dos dados extraídos pela IA antes de publicar.
                    </p>
                </div>
                <Badge variant="outline" className="text-lg px-4 py-1">
                    {avisosPendentes.length} Pendentes
                </Badge>
            </div>

            <div className="grid gap-4">
                {avisosPendentes.map((aviso) => (
                    <Card key={aviso.id} className="border-l-4 border-l-amber-500">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg font-semibold text-blue-900">
                                        {aviso.nome}
                                    </CardTitle>
                                    <div className="flex gap-2 mt-2">
                                        <Badge variant="secondary">{aviso.portal}</Badge>
                                        <Badge variant="outline">{aviso.codigo}</Badge>
                                        <Badge className={
                                            aviso.enrichmentStatus === 'AI_ENRICHED' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                                        }>
                                            {aviso.enrichmentStatus}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50">
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Aprovar
                                    </Button>
                                    <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                                        <XCircle className="h-4 w-4 mr-1" />
                                        Rejeitar
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-2 gap-4 text-sm mt-2">
                                <div className="space-y-1">
                                    <p className="text-gray-500">Resumo:</p>
                                    <p className="line-clamp-2">{aviso.descrição || 'Sem descrição'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-gray-500">Metadados Financeiros:</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-slate-50 p-2 rounded">
                                            <span className="text-xs text-gray-400">Min:</span>
                                            <div className="font-mono">€{aviso.montanteMinimo?.toLocaleString() || '-'}</div>
                                        </div>
                                        <div className="bg-slate-50 p-2 rounded">
                                            <span className="text-xs text-gray-400">Max:</span>
                                            <div className="font-mono">€{aviso.montanteMaximo?.toLocaleString() || '-'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {aviso.link && (
                                <div className="mt-4 pt-4 border-t flex justify-end">
                                    <a
                                        href={aviso.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                        Ver Fonte Original <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}

                {avisosPendentes.length === 0 && (
                    <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Tudo Limpo!</h3>
                        <p className="text-gray-500">Não há avisos pendentes de validação.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
