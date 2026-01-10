import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { findMatchesForAviso } from '@/lib/matchmaking-engine'

export const dynamic = 'force-dynamic'

/**
 * M9: Campaign Export - Get eligible companies for a given aviso
 * This endpoint calls the matchmaking engine to find companies that match the aviso criteria
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { avisoId: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const { avisoId } = params

        // Get the aviso details
        const aviso = await prisma.aviso.findUnique({
            where: { id: avisoId }
        })

        if (!aviso) {
            return NextResponse.json({ error: 'Aviso não encontrado' }, { status: 404 })
        }

        // Get all active companies
        const empresas = await prisma.empresa.findMany({
            where: { ativa: true }
        })

        // Use matchmaking engine to find matches
        const matches = await findMatchesForAviso(aviso, empresas)

        // Return matches with scoring
        return NextResponse.json({
            success: true,
            avisoId,
            avisoNome: aviso.nome,
            totalEmpresas: empresas.length,
            matches: matches.slice(0, 100), // Limit to top 100 for performance
            summary: {
                total: matches.length,
                highScore: matches.filter(m => m.score >= 80).length,
                mediumScore: matches.filter(m => m.score >= 50 && m.score < 80).length,
                lowScore: matches.filter(m => m.score < 50).length
            }
        })
    } catch (error) {
        console.error('Matchmaking error:', error)
        return NextResponse.json(
            { error: 'Erro ao processar matchmaking' },
            { status: 500 }
        )
    }
}

/**
 * M9: Export campaign list for Bitrix/CSV
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { avisoId: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const { avisoId } = params
        const body = await request.json()
        const { format = 'json', channels = [] } = body

        // Get the aviso
        const aviso = await prisma.aviso.findUnique({
            where: { id: avisoId }
        })

        if (!aviso) {
            return NextResponse.json({ error: 'Aviso não encontrado' }, { status: 404 })
        }

        // Get all active companies
        const empresas = await prisma.empresa.findMany({
            where: { ativa: true }
        })

        // Run matchmaking
        const matches = await findMatchesForAviso(aviso, empresas)

        // Filter high-score matches for campaign
        const campaignTargets = matches
            .filter(m => m.score >= 50)
            .map(m => ({
                empresaId: m.empresa.id,
                nome: m.empresa.nome,
                email: m.empresa.email || '',
                telefone: m.empresa.telefone || '',
                regiao: m.empresa.regiao || '',
                cae: m.empresa.cae || '',
                score: m.score,
                matchReasons: m.reasons || []
            }))

        if (format === 'csv') {
            // Generate CSV
            const headers = ['Nome', 'Email', 'Telefone', 'Região', 'CAE', 'Score']
            const rows = campaignTargets.map(t =>
                [t.nome, t.email, t.telefone, t.regiao, t.cae, t.score].join(',')
            )
            const csv = [headers.join(','), ...rows].join('\n')

            return new NextResponse(csv, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="campanha_${avisoId}_${new Date().toISOString().split('T')[0]}.csv"`
                }
            })
        }

        // Return JSON by default
        return NextResponse.json({
            success: true,
            avisoId,
            avisoNome: aviso.nome,
            channels,
            targets: campaignTargets,
            summary: {
                totalTargets: campaignTargets.length,
                suggestedCampaign: {
                    subject: `Oportunidade: ${aviso.nome}`,
                    deadline: aviso.dataFimSubmissao,
                    incentivo: aviso.programa
                }
            }
        })
    } catch (error) {
        console.error('Campaign export error:', error)
        return NextResponse.json(
            { error: 'Erro ao exportar campanha' },
            { status: 500 }
        )
    }
}
