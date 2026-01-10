
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// POST /api/notifications/[id]/read - Marcar como lida
export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return new NextResponse('User not found', { status: 404 });
        }

        await prisma.notificationLog.updateMany({
            where: {
                id: params.id,
                userId: user.id // Ensure user owns this notification
            },
            data: { readAt: new Date() }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Mark as read error:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
