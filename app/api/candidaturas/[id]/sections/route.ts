/**
 * Candidatura Section States API
 * 
 * GET /api/candidaturas/[id]/sections - List all section states
 * PUT /api/candidaturas/[id]/sections - Update a section state
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Schema for updating a section
const UpdateSectionSchema = z.object({
    sectionId: z.string().min(1),
    status: z.enum(['PENDING', 'DRAFT', 'REVIEW', 'APPROVED', 'REJECTED']).optional(),
    content: z.string().optional(),
    aiSuggestion: z.string().optional(),
    approvedBy: z.string().optional(),
});

// GET - List all section states for a candidatura
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const candidaturaId = params.id;

        // Get candidatura with section states
        const candidatura = await prisma.candidatura.findUnique({
            where: { id: candidaturaId },
            include: {
                sectionStates: {
                    orderBy: { createdAt: 'asc' },
                },
                empresa: {
                    select: { nome: true, nipc: true },
                },
                aviso: {
                    select: { nome: true, programa: true },
                },
            },
        });

        if (!candidatura) {
            return NextResponse.json({ error: 'Candidatura não encontrada' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            candidatura: {
                id: candidatura.id,
                programId: candidatura.programId,
                estado: candidatura.estado,
                empresa: candidatura.empresa,
                aviso: candidatura.aviso,
            },
            sectionStates: candidatura.sectionStates.map((s: any) => ({
                sectionId: s.sectionId,
                status: s.status.toLowerCase(),
                content: s.content,
                aiSuggestion: s.aiSuggestion,
                approvedBy: s.approvedBy,
                approvedAt: s.approvedAt,
                version: s.version,
                updatedAt: s.updatedAt,
            })),
        });

    } catch (error) {
        console.error('[Section States GET Error]:', error);
        return NextResponse.json(
            { error: 'Erro ao obter estados das secções' },
            { status: 500 }
        );
    }
}

// PUT - Update a section state
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const candidaturaId = params.id;
        const body = await request.json();

        const parseResult = UpdateSectionSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(
                { error: 'Dados inválidos', details: parseResult.error.flatten() },
                { status: 400 }
            );
        }

        const { sectionId, status, content, aiSuggestion, approvedBy } = parseResult.data;

        // Check if candidatura exists
        const candidatura = await prisma.candidatura.findUnique({
            where: { id: candidaturaId },
        });

        if (!candidatura) {
            return NextResponse.json({ error: 'Candidatura não encontrada' }, { status: 404 });
        }

        // Upsert section state
        const updateData: Record<string, unknown> = {};
        if (status) updateData.status = status;
        if (content !== undefined) updateData.content = content;
        if (aiSuggestion !== undefined) updateData.aiSuggestion = aiSuggestion;
        if (approvedBy !== undefined) {
            updateData.approvedBy = approvedBy;
            updateData.approvedAt = new Date();
        }

        // Check if state exists
        const existingState = await prisma.candidaturaSectionState.findUnique({
            where: {
                candidaturaId_sectionId: { candidaturaId, sectionId },
            },
        });

        let sectionState;
        if (existingState) {
            sectionState = await prisma.candidaturaSectionState.update({
                where: { id: existingState.id },
                data: {
                    ...updateData,
                    version: { increment: 1 },
                },
            });
        } else {
            sectionState = await prisma.candidaturaSectionState.create({
                data: {
                    candidaturaId,
                    sectionId,
                    status: status || 'PENDING',
                    content,
                    aiSuggestion,
                    approvedBy,
                    approvedAt: approvedBy ? new Date() : undefined,
                },
            });
        }

        return NextResponse.json({
            success: true,
            sectionState: {
                sectionId: sectionState.sectionId,
                status: sectionState.status.toLowerCase(),
                content: sectionState.content,
                aiSuggestion: sectionState.aiSuggestion,
                approvedBy: sectionState.approvedBy,
                approvedAt: sectionState.approvedAt,
                version: sectionState.version,
            },
        });

    } catch (error) {
        console.error('[Section States PUT Error]:', error);
        return NextResponse.json(
            { error: 'Erro ao atualizar estado da secção' },
            { status: 500 }
        );
    }
}
