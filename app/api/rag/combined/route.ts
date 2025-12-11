import { NextRequest, NextResponse } from 'next/server';
import { searchLocalAvisos, loadLocalAvisos } from '@/lib/rag-local';
import { searchAvisosWeb } from '@/lib/google-search-rag';

export const dynamic = 'force-dynamic';

type CombinedResult = {
  id: string;
  titulo: string;
  descricao: string;
  fonte: string;
  portal: string;
  url?: string | null;
  score: number;
  source: 'local' | 'web';
  dataFecho?: string | null;
};

// GET - Pesquisa combinada
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || searchParams.get('query') || '';
    const includeWeb = searchParams.get('web') !== 'false';
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query) {
      const allLocal = await loadLocalAvisos();
      return NextResponse.json({
        success: true,
        query: '',
        results: allLocal.map(a => ({
          ...a,
          fonte: a.fonte || 'LOCAL',
          portal: a.portal || 'LOCAL',
          score: 100,
          source: 'local' as const,
        })),
        total: allLocal.length,
        sources: { local: allLocal.length, web: 0 },
      });
    }

    const combined: CombinedResult[] = [];
    const seen = new Set<string>();

    // Local
    const localResults = await searchLocalAvisos(query, Math.ceil(limit / 2));
    for (const r of localResults) {
      const key = r.url || r.id;
      if (key) seen.add(key);
      combined.push({ ...r, source: 'local' });
    }

    // Web
    let webCount = 0;
    if (includeWeb) {
      const webResults = await searchAvisosWeb(query, { maxResults: Math.ceil(limit / 2) });
      for (const r of webResults) {
        const key = r.url || r.id;
        if (key && seen.has(key)) continue;
        if (key) seen.add(key);
        combined.push({
          id: r.id,
          titulo: r.titulo,
          descricao: r.descricao,
          fonte: r.fonte,
          portal: r.portal,
          url: r.url,
          score: r.relevancia,
          source: 'web',
        });
        webCount++;
      }
    }

    combined.sort((a, b) => b.score - a.score);
    const finalResults = combined.slice(0, limit);

    return NextResponse.json({
      success: true,
      query,
      results: finalResults,
      total: finalResults.length,
      sources: { local: localResults.length, web: combined.filter(r => r.source === 'web').length },
      metadata: {
        timestamp: new Date().toISOString(),
        webSearchEnabled: includeWeb,
        deduplicatedUrls: seen.size,
      },
    });
  } catch (error: any) {
    console.error('Erro na pesquisa combinada:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao pesquisar', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Pesquisa combinada com contexto empresarial
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      query,
      empresa = null,
      includeWeb = true,
      filters = {},
      maxResults = 20,
    } = body;

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query é obrigatória' },
        { status: 400 }
      );
    }

    let enrichedQuery = query;
    if (empresa) {
      const extras = [];
      if (empresa.setor) extras.push(empresa.setor);
      if (empresa.dimensao) extras.push(empresa.dimensao);
      if (empresa.regiao) extras.push(empresa.regiao);
      if (extras.length > 0) {
        enrichedQuery = `${query} ${extras.join(' ')}`;
      }
    }

    const combined: CombinedResult[] = [];
    const seen = new Set<string>();

    const localResults = await searchLocalAvisos(enrichedQuery, Math.ceil(maxResults / 2), {
      portal: filters.portal,
    });

    for (const r of localResults) {
      const key = r.url || r.id;
      if (key) seen.add(key);
      combined.push({ ...r, source: 'local' });
    }

    let webCount = 0;
    if (includeWeb) {
      const webResults = await searchAvisosWeb(enrichedQuery, { maxResults: Math.ceil(maxResults / 2) });
      for (const r of webResults) {
        const key = r.url || r.id;
        if (key && seen.has(key)) continue;
        if (filters.portal && r.portal !== filters.portal && filters.portal !== 'OUTRO') continue;
        if (key) seen.add(key);
        combined.push({
          id: r.id,
          titulo: r.titulo,
          descricao: r.descricao,
          fonte: r.fonte,
          portal: r.portal,
          url: r.url,
          score: r.relevancia,
          source: 'web',
        });
        webCount++;
      }
    }

    combined.sort((a, b) => b.score - a.score);
    const finalResults = combined.slice(0, maxResults);

    return NextResponse.json({
      success: true,
      query,
      enrichedQuery,
      empresa,
      results: finalResults,
      total: finalResults.length,
      sources: { local: localResults.length, web: webCount },
    });
  } catch (error: any) {
    console.error('Erro pesquisa combinada POST:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao processar', details: error.message },
      { status: 500 }
    );
  }
}
