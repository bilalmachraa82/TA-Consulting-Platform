import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { LeadTable } from '@/components/leads/lead-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CheckCircle, Clock, TrendingUp } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function LeadsPage() {
    const session = await getServerSession(authOptions);

    // TODO: Uncomment for production protection
    // if (!session) {
    //     redirect('/api/auth/signin');
    // }

    // Fetch all leads
    const leads = await prisma.lead.findMany({
        orderBy: { createdAt: 'desc' }
    });

    // Calculate Stats
    const totalLeads = leads.length;
    const novos = leads.filter(l => l.status === 'NOVO').length;
    const qualified = leads.filter(l => (l.scoreElegibilidade || 0) >= 70).length;
    const qualifiedRate = totalLeads > 0 ? Math.round((qualified / totalLeads) * 100) : 0;

    return (
        <div className="min-h-screen bg-slate-950 p-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Gestão de Leads</h1>
                        <p className="text-slate-400 mt-1">Monitorização e qualificação de oportunidades.</p>
                    </div>
                    {session?.user && (
                        <div className="text-sm text-slate-500">
                            Logado como <span className="text-slate-300">{session.user.email}</span>
                        </div>
                    )}
                </div>

                {/* KPI Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Total Leads</CardTitle>
                            <Users className="h-4 w-4 text-slate-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{totalLeads}</div>
                            <p className="text-xs text-slate-500">+100% este mês</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Novos</CardTitle>
                            <Clock className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-400">{novos}</div>
                            <p className="text-xs text-slate-500">A aguardar contacto</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Qualificados (+70)</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-400">{qualified}</div>
                            <p className="text-xs text-slate-500">Alta prioridade</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Taxa Qualificação</CardTitle>
                            <TrendingUp className="h-4 w-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-400">{qualifiedRate}%</div>
                            <p className="text-xs text-slate-500">Média global</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Table */}
                <div className="space-y-4">
                    <LeadTable leads={leads} />
                </div>
            </div>
        </div>
    );
}
