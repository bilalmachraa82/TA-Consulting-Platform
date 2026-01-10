
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/notifications/preferences - Obter preferências do utilizador
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { notificationPreferences: true }
        });

        if (!user) {
            return new NextResponse('User not found', { status: 404 });
        }

        // Transform to frontend format
        const preferences = user.notificationPreferences.map((p: any) => ({
            type: p.type,
            enabled: p.enabled,
            channels: p.channels,
            quietFrom: p.quietFrom,
            quietTo: p.quietTo,
        }));

        // Extract global quiet hours from first preference (or defaults)
        const firstPref = user.notificationPreferences[0];

        return NextResponse.json({
            preferences,
            quietFrom: firstPref?.quietFrom || '22:00',
            quietTo: firstPref?.quietTo || '08:00',
        });

    } catch (error) {
        console.error('Preferences GET error:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}

// POST /api/notifications/preferences - Guardar preferências
export async function POST(req: Request) {
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

        const body = await req.json();
        const { preferences, quietFrom, quietTo } = body;

        // Upsert each preference
        for (const pref of preferences) {
            await prisma.notificationPreference.upsert({
                where: {
                    userId_type: { userId: user.id, type: pref.type }
                },
                update: {
                    enabled: pref.enabled,
                    channels: pref.channels,
                    quietFrom: quietFrom,
                    quietTo: quietTo,
                },
                create: {
                    userId: user.id,
                    type: pref.type,
                    enabled: pref.enabled,
                    channels: pref.channels,
                    quietFrom: quietFrom,
                    quietTo: quietTo,
                }
            });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Preferences POST error:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
