/**
 * Teams API
 * 
 * GET  /api/teams - List user's teams
 * POST /api/teams - Create new team
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Autenticação necessária' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'Utilizador não encontrado' }, { status: 404 });
        }

        const teams = await prisma.team.findMany({
            where: {
                membros: {
                    some: { userId: user.id }
                }
            },
            include: {
                membros: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true, image: true }
                        }
                    }
                },
                empresas: {
                    select: { id: true, nome: true, nipc: true }
                }
            }
        });

        return NextResponse.json({
            success: true,
            teams: teams.map(team => ({
                ...team,
                memberCount: team.membros.length,
                empresaCount: team.empresas.length
            }))
        });

    } catch (error: any) {
        console.error('Teams GET error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Autenticação necessária' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'Utilizador não encontrado' }, { status: 404 });
        }

        const { nome } = await request.json();

        if (!nome || nome.trim().length < 2) {
            return NextResponse.json(
                { error: 'Nome da equipa é obrigatório (mínimo 2 caracteres)' },
                { status: 400 }
            );
        }

        // Create team with user as owner
        const team = await prisma.team.create({
            data: {
                nome: nome.trim(),
                membros: {
                    create: {
                        userId: user.id,
                        role: 'OWNER'
                    }
                }
            },
            include: {
                membros: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true }
                        }
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            team
        }, { status: 201 });

    } catch (error: any) {
        console.error('Teams POST error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
