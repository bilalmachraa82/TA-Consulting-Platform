
// API para operações em Memória Descritiva específica
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

// GET: Obter memória por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const memoria = await prisma.memoriaDescritiva.findUnique({
      where: { id: params.id },
      include: {
        empresa: true,
        aviso: true,
        seccoes: {
          orderBy: {
            numeroSeccao: 'asc',
          },
        },
      },
    });

    if (!memoria) {
      return NextResponse.json({ error: 'Memória não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ memoria });
  } catch (error) {
    console.error('Erro ao buscar memória:', error);
    return NextResponse.json({ error: 'Erro ao buscar memória' }, { status: 500 });
  }
}

// PUT: Atualizar memória (editar secções, status, etc.)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { titulo, status, seccoes } = body;

    // Atualizar memória
    const updateData: any = {};
    if (titulo) updateData.titulo = titulo;
    if (status) updateData.status = status;

    const memoria = await prisma.memoriaDescritiva.update({
      where: { id: params.id },
      data: updateData,
    });

    // Atualizar secções se fornecidas
    if (seccoes && Array.isArray(seccoes)) {
      for (const seccao of seccoes) {
        if (seccao.id) {
          await prisma.memoriaSecao.update({
            where: { id: seccao.id },
            data: {
              conteudo: seccao.conteudo,
              status: seccao.editado ? 'EDITADA_MANUAL' : seccao.status,
            },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      memoria,
    });
  } catch (error) {
    console.error('Erro ao atualizar memória:', error);
    return NextResponse.json({ error: 'Erro ao atualizar memória' }, { status: 500 });
  }
}

// DELETE: Eliminar memória
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    await prisma.memoriaDescritiva.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao eliminar memória:', error);
    return NextResponse.json({ error: 'Erro ao eliminar memória' }, { status: 500 });
  }
}
