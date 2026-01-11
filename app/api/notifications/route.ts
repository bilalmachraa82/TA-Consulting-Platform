
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/notifications - Listar notificações do utilizador
export async function GET() {
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

        const notifications = await prisma.notificationLog.findMany({
            where: { userId: user.id },
            orderBy: { sentAt: 'desc' },
            take: 50,
        });

        // Map to frontend format
        const mapped = notifications.map(n => ({
            id: n.id,
            type: n.type,
            title: (n.payload as any)?.title || 'Notificação',
            message: (n.payload as any)?.message || '',
            link: (n.payload as any)?.link,
            sentAt: n.sentAt.toISOString(),
            readAt: n.readAt?.toISOString() || null,
        }));

        return NextResponse.json({ notifications: mapped });

    } catch (error) {
        console.error('Notifications GET error:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
