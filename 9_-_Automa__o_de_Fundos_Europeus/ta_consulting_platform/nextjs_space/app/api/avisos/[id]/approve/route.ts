import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { logApprove } from '@/lib/audit'

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        // Apenas ADMIN pode aprovar
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const avisoId = params.id

        // Verificar se aviso existe
        const aviso = await prisma.aviso.findUnique({
            where: { id: avisoId }
        })

        if (!aviso) {
            return NextResponse.json({ error: 'Aviso not found' }, { status: 404 })
        }

        // Atualizar status para MANUAL_VERIFIED
        const updatedAviso = await prisma.aviso.update({
            where: { id: avisoId },
            data: {
                enrichmentStatus: 'MANUAL_VERIFIED'
            }
        })

        // Log audit
        await logApprove({
            userId: session.user.id,
            userName: session.user.name || 'Admin',
            userEmail: session.user.email || '',
            entity: 'Aviso',
            entityId: avisoId,
            metadata: { previousStatus: aviso.enrichmentStatus },
            request: req
        })

        return NextResponse.json(updatedAviso)

    } catch (error) {
        console.error('Error approving aviso:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
