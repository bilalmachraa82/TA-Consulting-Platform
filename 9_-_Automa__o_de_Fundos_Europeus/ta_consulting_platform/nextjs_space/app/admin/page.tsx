import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/db'
import {
    AlertTriangle,
    CheckCircle,
    FileText,
    Users,
    Activity,
    Server
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
    // Fetch stats
    const [
        avisosTotal,
        avisosPendentes,
        usersTotal,
        memoriasTotal
    ] = await Promise.all([
        prisma.aviso.count(),
        prisma.aviso.count({ where: { enrichmentStatus: 'BASIC' } }),
        prisma.user.count(),
        prisma.memoriaDescritiva.count()
    ])

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard Administrativo</h2>
                <p className="text-muted-foreground">
                    Visão geral do sistema e estado da plataforma.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avisos Totais</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{avisosTotal}</div>
                        <p className="text-xs text-muted-foreground">
                            Base de dados de oportunidades
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pendentes Validação</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">{avisosPendentes}</div>
                        <p className="text-xs text-muted-foreground">
                            Avisos a aguardar enriquecimento
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Utilizadores</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{usersTotal}</div>
                        <p className="text-xs text-muted-foreground">
                            Contas ativas na plataforma
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Memórias Geradas</CardTitle>
                        <Activity className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{memoriasTotal}</div>
                        <p className="text-xs text-muted-foreground">
                            Processadas por IA
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* System Status */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Server className="h-5 w-5" />
                            Estado dos Serviços
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-green-500" />
                                <span className="font-medium text-green-900">Base de Dados</span>
                            </div>
                            <span className="text-xs text-green-700">Operacional</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-green-500" />
                                <span className="font-medium text-green-900">API Google Gemini</span>
                            </div>
                            <span className="text-xs text-green-700">Ligado</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                                <span className="font-medium text-yellow-900">Scrapers (Cron)</span>
                            </div>
                            <span className="text-xs text-yellow-700">Verificar Logs</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
