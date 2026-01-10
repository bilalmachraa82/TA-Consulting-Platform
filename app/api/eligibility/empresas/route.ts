import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        // Fetch all empresas for the current user
        const empresas = await prisma.empresa.findMany({
            where: {
                consultorId: session.user.id as string,
            },
            select: {
                id: true,
                nome: true,
                nipc: true,
                cae: true,
                dimensao: true,
                distrito: true,
            },
            orderBy: {
                nome: 'asc',
            },
        });

        return NextResponse.json({ empresas });

    } catch (error) {
        console.error('[Empresas API Error]:', error);
        return NextResponse.json(
            { error: 'Erro ao carregar empresas' },
            { status: 500 }
        );
    }
}
