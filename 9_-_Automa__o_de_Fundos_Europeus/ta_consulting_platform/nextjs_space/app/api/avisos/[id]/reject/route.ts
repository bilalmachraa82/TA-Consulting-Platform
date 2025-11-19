import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { logReject } from '@/lib/audit'

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        // Apenas ADMIN pode rejeitar
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { reason } = await req.json().catch(() => ({ reason: undefined }))
        const avisoId = params.id

        // Verificar se aviso existe
        const aviso = await prisma.aviso.findUnique({
            where: { id: avisoId }
        })

        if (!aviso) {
            return NextResponse.json({ error: 'Aviso not found' }, { status: 404 })
        }

        // Atualizar status para REJECTED (ou equivalente, aqui assumimos FAILED ou mantemos PENDING mas com flag)
        // Como não temos status REJECTED explícito no schema original, vamos usar FAILED ou manter PENDING e adicionar nota
        // Ajuste conforme schema: enrichmentStatus enum: PENDING, ENRICHED, FAILED, MANUAL_VERIFIED

        const updatedAviso = await prisma.aviso.update({
            where: { id: avisoId },
            data: {
                enrichmentStatus: 'FAILED', // Usando FAILED para indicar rejeição/problema
                dataAtualizacao: new Date()
            }
        })

        // Log audit
        await logReject({
            userId: session.user.id,
            userName: session.user.name || 'Admin',
            userEmail: session.user.email || '',
            entity: 'Aviso',
            entityId: avisoId,
            reason: reason || 'Rejeitado manualmente pelo administrador',
            request: req
        })

        return NextResponse.json(updatedAviso)

    } catch (error) {
        console.error('Error rejecting aviso:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
