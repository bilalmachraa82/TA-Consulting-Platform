
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// POST /api/notifications/read-all - Marcar todas como lidas
export async function POST() {
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
                userId: user.id,
                readAt: null
            },
            data: { readAt: new Date() }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Mark all as read error:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
