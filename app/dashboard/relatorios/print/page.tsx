
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { PrintReportClient } from '@/components/dashboard/print-report-client'

export const dynamic = "force-dynamic"

export default async function PrintReportPage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect('/auth/login')
    }

    // Fetch data (mirrors the logic in api/relatorios/route.ts or dashboard/page.tsx)
    // For verified speed, we fetch directly from DB here as it is a server component

    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [avisos, candidaturas, empresas] = await Promise.all([
        prisma.aviso.findMany({
            where: { ativo: true },
            orderBy: { createdAt: 'desc' },
            take: 50
        }),
        prisma.candidatura.findMany({
            include: { empresa: true, aviso: true },
            where: { createdAt: { gte: firstDayOfMonth } }
        }),
        prisma.empresa.count({
            where: { createdAt: { gte: firstDayOfMonth } }
        })
    ])

    // Calc KPIs
    const totalAvisos = await prisma.aviso.count({ where: { ativo: true } })
    const totalFinanciamento = 2500000 // Placeholder for demo or calc sum of avisos

    const data = {
        date: now.toLocaleDateString('pt-PT'),
        kpis: {
            totalAvisos,
            totalCandidaturas: candidaturas.length,
            novasEmpresas: empresas,
            totalFinanciamento
        },
        candidaturas: candidaturas.map(c => ({
            id: c.id,
            empresa: c.empresa.nome,
            aviso: c.aviso.nome,
            estado: c.estado,
            data: c.createdAt.toLocaleDateString('pt-PT')
        })),
        avisos: avisos.slice(0, 10).map(a => ({
            nome: a.nome,
            codigo: a.codigo,
            prazo: a.dataFimSubmissao.toLocaleDateString('pt-PT')
        }))
    }

    return <PrintReportClient data={data} />
}
