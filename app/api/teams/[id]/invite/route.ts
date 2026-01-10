/**
 * Team Invite API
 * 
 * POST /api/teams/[id]/invite - Invite user by email
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Autenticação necessária' }, { status: 401 });
        }

        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!currentUser) {
            return NextResponse.json({ error: 'Utilizador não encontrado' }, { status: 404 });
        }

        const teamId = params.id;
        const { email, role = 'MEMBER' } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 });
        }

        // Check if current user is admin/owner of team
        const currentMembership = await prisma.teamMember.findUnique({
            where: {
                teamId_userId: {
                    teamId,
                    userId: currentUser.id
                }
            }
        });

        if (!currentMembership || !['OWNER', 'ADMIN'].includes(currentMembership.role)) {
            return NextResponse.json(
                { error: 'Apenas administradores podem convidar membros' },
                { status: 403 }
            );
        }

        // Find user to invite
        const invitedUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() }
        });

        if (!invitedUser) {
            return NextResponse.json(
                { error: 'Utilizador não encontrado. O utilizador precisa de estar registado na plataforma.' },
                { status: 404 }
            );
        }

        // Check if already member
        const existingMembership = await prisma.teamMember.findUnique({
            where: {
                teamId_userId: {
                    teamId,
                    userId: invitedUser.id
                }
            }
        });

        if (existingMembership) {
            return NextResponse.json(
                { error: 'Este utilizador já é membro da equipa' },
                { status: 400 }
            );
        }

        // Validate role
        const validRoles = ['ADMIN', 'MEMBER', 'VIEWER'];
        if (!validRoles.includes(role)) {
            return NextResponse.json({ error: 'Role inválido' }, { status: 400 });
        }

        // Add member
        const membership = await prisma.teamMember.create({
            data: {
                teamId,
                userId: invitedUser.id,
                role: role as 'ADMIN' | 'MEMBER' | 'VIEWER'
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true, image: true }
                }
            }
        });

        return NextResponse.json({
            success: true,
            message: `${invitedUser.name || invitedUser.email} adicionado à equipa`,
            member: membership
        }, { status: 201 });

    } catch (error: any) {
        console.error('Team invite error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// GET - List team members
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Autenticação necessária' }, { status: 401 });
        }

        const teamId = params.id;

        const team = await prisma.team.findUnique({
            where: { id: teamId },
            include: {
                membros: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true, image: true }
                        }
                    },
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        if (!team) {
            return NextResponse.json({ error: 'Equipa não encontrada' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            team: {
                id: team.id,
                nome: team.nome
            },
            members: team.membros.map((m: { id: string; role: string; user: any; createdAt: Date }) => ({
                id: m.id,
                role: m.role,
                user: m.user,
                joinedAt: m.createdAt
            }))
        });

    } catch (error: any) {
        console.error('Team members GET error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
