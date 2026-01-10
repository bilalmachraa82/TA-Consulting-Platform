/**
 * Team Members API
 * 
 * GET    /api/teams/[id]/members - List members
 * PATCH  /api/teams/[id]/members - Update member role
 * DELETE /api/teams/[id]/members - Remove member
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface RouteParams {
    params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Autenticação necessária' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) {
            return NextResponse.json({ error: 'Utilizador não encontrado' }, { status: 404 });
        }

        // Check if user is member
        const isMember = await prisma.teamMember.findFirst({
            where: { teamId: params.id, userId: user.id }
        });

        if (!isMember) {
            return NextResponse.json({ error: 'Sem acesso a esta equipa' }, { status: 403 });
        }

        const members = await prisma.teamMember.findMany({
            where: { teamId: params.id },
            include: {
                user: {
                    select: { id: true, name: true, email: true, image: true }
                }
            },
            orderBy: [
                { role: 'asc' }, // OWNER first
                { createdAt: 'asc' }
            ]
        });

        return NextResponse.json({ success: true, members });

    } catch (error: any) {
        console.error('Members GET error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Autenticação necessária' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) {
            return NextResponse.json({ error: 'Utilizador não encontrado' }, { status: 404 });
        }

        // Check if user is OWNER or ADMIN
        const membership = await prisma.teamMember.findFirst({
            where: {
                teamId: params.id,
                userId: user.id,
                role: { in: ['OWNER', 'ADMIN'] }
            }
        });

        if (!membership) {
            return NextResponse.json({ error: 'Sem permissão para alterar membros' }, { status: 403 });
        }

        const { memberId, role } = await request.json();

        // Cannot change OWNER role unless you are OWNER
        const targetMember = await prisma.teamMember.findUnique({ where: { id: memberId } });
        if (targetMember?.role === 'OWNER' && membership.role !== 'OWNER') {
            return NextResponse.json({ error: 'Não pode alterar o proprietário' }, { status: 403 });
        }

        // Cannot set someone as OWNER unless you transfer ownership
        if (role === 'OWNER') {
            return NextResponse.json({ error: 'Use a opção de transferir propriedade' }, { status: 400 });
        }

        const updated = await prisma.teamMember.update({
            where: { id: memberId },
            data: { role },
            include: {
                user: { select: { id: true, name: true, email: true } }
            }
        });

        return NextResponse.json({ success: true, member: updated });

    } catch (error: any) {
        console.error('Members PATCH error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Autenticação necessária' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) {
            return NextResponse.json({ error: 'Utilizador não encontrado' }, { status: 404 });
        }

        const { memberId } = await request.json();

        // Check if user is OWNER or ADMIN
        const membership = await prisma.teamMember.findFirst({
            where: {
                teamId: params.id,
                userId: user.id,
                role: { in: ['OWNER', 'ADMIN'] }
            }
        });

        // Check if removing self (anyone can leave)
        const targetMember = await prisma.teamMember.findUnique({ where: { id: memberId } });
        const isRemovingSelf = targetMember?.userId === user.id;

        if (!membership && !isRemovingSelf) {
            return NextResponse.json({ error: 'Sem permissão para remover membros' }, { status: 403 });
        }

        // Cannot remove OWNER
        if (targetMember?.role === 'OWNER') {
            return NextResponse.json({ error: 'O proprietário não pode ser removido' }, { status: 400 });
        }

        await prisma.teamMember.delete({ where: { id: memberId } });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Members DELETE error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
