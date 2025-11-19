
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { StatusValidade } from '@prisma/client';

// API para retornar documentos com alertas (para o dashboard)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const hoje = new Date();

    // Buscar documentos expirados ou a expirar
    const documentosComAlertas = await prisma.documento.findMany({
      where: {
        OR: [
          { statusValidade: StatusValidade.EXPIRADO },
          { statusValidade: StatusValidade.A_EXPIRAR },
        ],
      },
      include: {
        empresa: {
          select: {
            id: true,
            nome: true,
            nipc: true,
          },
        },
      },
      orderBy: {
        dataValidade: 'asc',
      },
    });

    // Categorizar alertas por urgência
    const alertas = {
      expirados: documentosComAlertas.filter(
        (doc) => doc.dataValidade && new Date(doc.dataValidade) < hoje
      ),
      expiramEm7Dias: documentosComAlertas.filter((doc) => {
        if (!doc.dataValidade) return false;
        const dataValidade = new Date(doc.dataValidade);
        const em7Dias = new Date(hoje);
        em7Dias.setDate(em7Dias.getDate() + 7);
        return dataValidade >= hoje && dataValidade <= em7Dias;
      }),
      expiramEm15Dias: documentosComAlertas.filter((doc) => {
        if (!doc.dataValidade) return false;
        const dataValidade = new Date(doc.dataValidade);
        const em7Dias = new Date(hoje);
        em7Dias.setDate(em7Dias.getDate() + 7);
        const em15Dias = new Date(hoje);
        em15Dias.setDate(em15Dias.getDate() + 15);
        return dataValidade > em7Dias && dataValidade <= em15Dias;
      }),
      expiramEm30Dias: documentosComAlertas.filter((doc) => {
        if (!doc.dataValidade) return false;
        const dataValidade = new Date(doc.dataValidade);
        const em15Dias = new Date(hoje);
        em15Dias.setDate(em15Dias.getDate() + 15);
        const em30Dias = new Date(hoje);
        em30Dias.setDate(em30Dias.getDate() + 30);
        return dataValidade > em15Dias && dataValidade <= em30Dias;
      }),
    };

    // Estatísticas resumidas
    const resumo = {
      total: documentosComAlertas.length,
      expirados: alertas.expirados.length,
      expiramEm7Dias: alertas.expiramEm7Dias.length,
      expiramEm15Dias: alertas.expiramEm15Dias.length,
      expiramEm30Dias: alertas.expiramEm30Dias.length,
    };

    return NextResponse.json({
      success: true,
      alertas,
      resumo,
    });
  } catch (error) {
    console.error('Erro ao buscar alertas de documentos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar alertas de documentos' },
      { status: 500 }
    );
  }
}
