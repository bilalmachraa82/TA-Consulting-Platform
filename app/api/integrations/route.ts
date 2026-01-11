import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/integrations
 * Lista todas as integrações do utilizador
 */
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const integrations = await prisma.integration.findMany({
            where: { userId: session.user.id },
            select: {
                id: true,
                type: true,
                isActive: true,
                metadata: true,
                createdAt: true,
            },
        });

        return NextResponse.json({ integrations });

    } catch (error) {
        console.error('Integrations fetch error:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
