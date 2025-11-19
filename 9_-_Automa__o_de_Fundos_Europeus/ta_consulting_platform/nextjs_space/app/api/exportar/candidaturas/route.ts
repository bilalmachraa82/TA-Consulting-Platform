
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/exportar/candidaturas?formato=csv|json
// Exportar candidaturas para CSV ou JSON
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const formato = searchParams.get('formato') || 'csv';
    const portal = searchParams.get('portal');
    const estado = searchParams.get('estado');

    const where: any = {};
    if (estado) where.estado = estado;

    const candidaturas = await prisma.candidatura.findMany({
      where,
      include: {
        empresa: {
          select: {
            nome: true,
            nipc: true,
            setor: true,
            dimensao: true,
          },
        },
        aviso: {
          select: {
            nome: true,
            codigo: true,
            portal: true,
            programa: true,
            dataFimSubmissao: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filtrar por portal se especificado
    let dados = candidaturas;
    if (portal) {
      dados = candidaturas.filter((c) => c.aviso.portal === portal);
    }

    if (formato === 'json') {
      return NextResponse.json({
        success: true,
        total: dados.length,
        dados,
      });
    }

    // Gerar CSV
    const csvHeader = 'ID,Empresa,NIPC,Aviso,Portal,Programa,Estado,Montante Solicitado,Montante Aprovado,Data Submissão,Data Criação\n';
    const csvRows = dados.map((c) => {
      return [
        c.id,
        `"${c.empresa.nome}"`,
        c.empresa.nipc,
        `"${c.aviso.nome}"`,
        c.aviso.portal,
        `"${c.aviso.programa || '-'}"`,
        c.estado,
        c.montanteSolicitado || 0,
        c.montanteAprovado || 0,
        c.dataSubmissao ? new Date(c.dataSubmissao).toLocaleDateString('pt-PT') : '-',
        new Date(c.createdAt).toLocaleDateString('pt-PT'),
      ].join(',');
    }).join('\n');

    const csv = csvHeader + csvRows;

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="candidaturas_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Erro ao exportar candidaturas:', error);
    return NextResponse.json(
      { error: 'Erro ao exportar candidaturas' },
      { status: 500 }
    );
  }
}
