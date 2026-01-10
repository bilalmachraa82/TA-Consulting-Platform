/**
 * Team Detail API
 * 
 * GET    /api/teams/[id] - Get team details
 * PATCH  /api/teams/[id] - Update team
 * DELETE /api/teams/[id] - Delete team
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface RouteParams {
    params: { id: string };
}

// Helper to check team membership
async function checkTeamAccess(teamId: string, userEmail: string, requiredRole?: string[]) {
    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) return null;

    const membership = await prisma.teamMember.findFirst({
        where: {
            teamId,
            userId: user.id,
        },
        include: {
            team: {
                include: {
                    membros: {
                        include: {
                            user: { select: { id: true, name: true, email: true, image: true } }
                        }
                    },
                    empresas: { select: { id: true, nome: true, nipc: true } }
                }
            }
        }
    });

    if (!membership) return null;
    if (requiredRole && !requiredRole.includes(membership.role)) return null;

    return { user, membership, team: membership.team };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Autenticação necessária' }, { status: 401 });
        }

        const access = await checkTeamAccess(params.id, session.user.email);
        if (!access) {
            return NextResponse.json({ error: 'Equipa não encontrada ou sem acesso' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            team: access.team,
            role: access.membership.role,
        });

    } catch (error: any) {
        console.error('Team GET error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Autenticação necessária' }, { status: 401 });
        }

        const access = await checkTeamAccess(params.id, session.user.email, ['OWNER', 'ADMIN']);
        if (!access) {
            return NextResponse.json({ error: 'Sem permissão para editar esta equipa' }, { status: 403 });
        }

        const { nome } = await request.json();

        const updated = await prisma.team.update({
            where: { id: params.id },
            data: { nome },
        });

        return NextResponse.json({ success: true, team: updated });

    } catch (error: any) {
        console.error('Team PATCH error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Autenticação necessária' }, { status: 401 });
        }

        const access = await checkTeamAccess(params.id, session.user.email, ['OWNER']);
        if (!access) {
            return NextResponse.json({ error: 'Apenas o proprietário pode eliminar a equipa' }, { status: 403 });
        }

        // Delete team members first
        await prisma.teamMember.deleteMany({ where: { teamId: params.id } });

        // Delete team
        await prisma.team.delete({ where: { id: params.id } });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Team DELETE error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
