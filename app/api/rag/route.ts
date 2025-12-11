import { NextRequest, NextResponse } from 'next/server';
import { searchAvisosWeb } from '@/lib/google-search-rag';
import { loadLocalAvisos, searchLocalAvisos } from '@/lib/rag-local';

export const dynamic = 'force-dynamic';

type RAGResult = {
  id: string;
  titulo: string;
  descricao: string;
  fonte: string;
  portal: string;
  url?: string | null;
  data_fecho?: string | null;
  score: number;
  source: 'local' | 'web';
};

// GET - Pesquisa combinada (local + Google Search)
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

    const combined: RAGResult[] = [];
    const seen = new Set<string>();

    // 1) Local (JSON/dataProvider)
    const localResults = await searchLocalAvisos(query, Math.ceil(limit / 2));
    for (const r of localResults) {
      const key = r.url || r.id;
      if (key) seen.add(key);
      combined.push({ ...r, fonte: r.fonte, portal: r.portal, source: 'local' });
    }

    // 2) Web (Google Search / fallback)
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
      sources: { local: localResults.length, web: includeWeb ? finalResults.filter(r => r.source === 'web').length : 0 },
    });
  } catch (error: any) {
    console.error('Erro na pesquisa RAG:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao pesquisar avisos', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Pesquisa com filtros e opção web
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, includeWeb = true, portal, limit = 20 } = body;

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query é obrigatória' },
        { status: 400 }
      );
    }

    const combined: RAGResult[] = [];
    const seen = new Set<string>();

    const localResults = await searchLocalAvisos(query, Math.ceil(limit / 2), { portal });
    for (const r of localResults) {
      const key = r.url || r.id;
      if (key) seen.add(key);
      combined.push({ ...r, fonte: r.fonte, portal: r.portal, source: 'local' });
    }

    let webCount = 0;
    if (includeWeb) {
      const webResults = await searchAvisosWeb(query, { maxResults: Math.ceil(limit / 2) });
      for (const r of webResults) {
        const key = r.url || r.id;
        if (key && seen.has(key)) continue;
        if (portal && r.portal !== portal && portal !== 'OUTRO') continue;
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
      sources: { local: localResults.length, web: webCount },
    });
  } catch (error: any) {
    console.error('Erro na query RAG:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao processar query', details: error.message },
      { status: 500 }
    );
  }
}
