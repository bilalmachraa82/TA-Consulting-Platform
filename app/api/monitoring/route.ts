
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
    const start = performance.now()
    let dbStatus = 'ok'
    let dbLatency = 0

    try {
        await prisma.$executeRaw`SELECT 1`
        dbLatency = Math.round(performance.now() - start)
    } catch (e) {
        dbStatus = 'error'
    }

    // Scraper Status (Mocked based on recent activity in DB)
    // Check if we have recent Avisos (last 24h)
    const recentAvisos = await prisma.aviso.count({
        where: {
            createdAt: {
                gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
        }
    })

    // Check if we have leads
    const totalLeads = await prisma.lead.count()

    return NextResponse.json({
        timestamp: new Date().toISOString(),
        services: {
            database: {
                status: dbStatus,
                latency: `${dbLatency}ms`,
                message: dbStatus === 'ok' ? 'Connected' : 'Connection Failed'
            },
            scrapers: {
                status: recentAvisos > 0 ? 'operational' : 'idle',
                lastRun: new Date().toISOString(), // In real app, fetch from logs
                itemsFetched24h: recentAvisos
            },
            api: {
                status: 'operational',
                uptime: process.uptime()
            },
            leads: {
                count: totalLeads,
                status: 'active'
            }
        }
    })
}
