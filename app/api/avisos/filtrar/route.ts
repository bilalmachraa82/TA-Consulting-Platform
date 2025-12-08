import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const pesquisa = searchParams.get('pesquisa') || '';
    const portal = searchParams.get('portal') || '';
    const programa = searchParams.get('programa') || '';
    const status = searchParams.get('status') || '';
    const dataInicio = searchParams.get('dataInicio') || '';
    const dataFim = searchParams.get('dataFim') || '';
    const montanteMin = searchParams.get('orcamentoMin') || '';
    const montanteMax = searchParams.get('orcamentoMax') || '';

    // Construir filtros dinâmicos
    const where: any = {};

    // Filtro de pesquisa (nome, código ou descrição)
    if (pesquisa) {
      where.OR = [
        { nome: { contains: pesquisa, mode: 'insensitive' } },
        { codigo: { contains: pesquisa, mode: 'insensitive' } },
        { descrição: { contains: pesquisa, mode: 'insensitive' } },
      ];
    }

    // Filtros específicos
    if (portal && portal !== 'todos') where.portal = portal;
    if (programa && programa !== 'todos') where.programa = { contains: programa, mode: 'insensitive' };
    
    // Filtro de status
    if (status === 'Aberto') {
      where.ativo = true;
    } else if (status === 'Fechado') {
      where.ativo = false;
    }

    // Filtro de data
    if (dataInicio || dataFim) {
      where.dataFimSubmissao = {};
      if (dataInicio) where.dataFimSubmissao.gte = new Date(dataInicio);
      if (dataFim) where.dataFimSubmissao.lte = new Date(dataFim);
    }

    // Filtro de montante
    if (montanteMin || montanteMax) {
      where.montanteMaximo = {};
      if (montanteMin) where.montanteMaximo.gte = parseFloat(montanteMin);
      if (montanteMax) where.montanteMaximo.lte = parseFloat(montanteMax);
    }

    // Buscar avisos filtrados
    const avisos = await prisma.aviso.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // Buscar opções únicas para os filtros (autocomplete)
    const [portais, programas, linhas] = await Promise.all([
      prisma.aviso.groupBy({
        by: ['portal'],
        _count: { portal: true },
      }),
      prisma.aviso.groupBy({
        by: ['programa'],
        where: { programa: { not: '' } },
        _count: { programa: true },
      }),
      prisma.aviso.groupBy({
        by: ['linha'],
        where: { linha: { not: null } },
        _count: { linha: true },
      }),
    ]);

    return NextResponse.json({
      avisos,
      filtros: {
        portais: portais.map((p: { portal: string; _count: { portal: number } }) => ({ valor: p.portal, total: p._count.portal })),
        programas: programas.map((p: { programa: string; _count: { programa: number } }) => ({ valor: p.programa, total: p._count.programa })),
        entidades: linhas.map((l: { linha: string | null; _count: Record<string, number> }) => ({ valor: l.linha || 'N/A', total: l._count.linha || 0 })),
        areas: [], // Não existe no schema atual
      },
    });
  } catch (error) {
    console.error('Erro ao filtrar avisos:', error);
    return NextResponse.json(
      { error: 'Erro ao filtrar avisos' },
      { status: 500 }
    );
  }
}
