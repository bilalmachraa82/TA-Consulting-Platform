import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * PATCH /api/integrations/[id]
 * Atualiza uma integração (ativar/desativar)
 */
export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await req.json();
        const { isActive } = body;

        const integration = await prisma.integration.updateMany({
            where: {
                id: params.id,
                userId: session.user.id,
            },
            data: { isActive },
        });

        if (integration.count === 0) {
            return new NextResponse('Not found', { status: 404 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Integration update error:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}

/**
 * DELETE /api/integrations/[id]
 * Remove uma integração
 */
export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const result = await prisma.integration.deleteMany({
            where: {
                id: params.id,
                userId: session.user.id,
            },
        });

        if (result.count === 0) {
            return new NextResponse('Not found', { status: 404 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Integration delete error:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
