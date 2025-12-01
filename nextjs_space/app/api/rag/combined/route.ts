/**
 * Combined RAG API Endpoint
 * Combina pesquisa local (TF-IDF) com pesquisa web (Google)
 * para máxima cobertura de resultados
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchAvisos, loadAllAvisos } from '@/lib/rag-system';
import { searchAvisosWeb, WebSearchResult } from '@/lib/google-search-rag';

export const dynamic = 'force-dynamic';

interface CombinedResult {
  id: string;
  titulo: string;
  descricao: string;
  fonte: string;
  url: string | null;
  portal: string;
  score: number;
  source: 'local' | 'web';
  dataFecho?: string;
  montante?: string | number;
  taxa?: string | number;
}

// GET - Pesquisa combinada
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || searchParams.get('query') || '';
    const includeWeb = searchParams.get('web') !== 'false'; // Por defeito inclui web
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query) {
      // Sem query, retornar todos os avisos locais
      const allAvisos = await loadAllAvisos();
      return NextResponse.json({
        success: true,
        query: '',
        results: allAvisos.map(a => ({
          id: a.id,
          titulo: a.titulo,
          descricao: a.descricao,
          fonte: a.metadata.fonte,
          url: a.metadata.url,
          portal: a.metadata.fonte,
          score: 100,
          source: 'local' as const,
          dataFecho: a.metadata.data_fecho,
          montante: a.metadata.montante_max,
          taxa: a.metadata.taxa_apoio,
        })),
        total: allAvisos.length,
        sources: { local: allAvisos.length, web: 0 },
      });
    }

    const combinedResults: CombinedResult[] = [];
    const seenUrls = new Set<string>();

    // 1. Pesquisa local (RAG TF-IDF)
    console.log(`🔍 Pesquisa local: "${query}"`);
    const localResults = await searchAvisos(query, {}, Math.ceil(limit / 2));

    for (const r of localResults) {
      const result: CombinedResult = {
        id: r.aviso.id,
        titulo: r.aviso.titulo,
        descricao: r.aviso.descricao,
        fonte: r.aviso.metadata.fonte || 'Local',
        url: r.aviso.metadata.url || null,
        portal: r.aviso.metadata.fonte || 'LOCAL',
        score: Math.round(r.score * 100),
        source: 'local',
        dataFecho: r.aviso.metadata.data_fecho,
        montante: r.aviso.metadata.montante_max,
        taxa: r.aviso.metadata.taxa_apoio,
      };

      if (result.url) seenUrls.add(result.url);
      combinedResults.push(result);
    }

    // 2. Pesquisa web (Google Search)
    let webResultsCount = 0;
    if (includeWeb) {
      console.log(`🌐 Pesquisa web: "${query}"`);
      try {
        const webResults = await searchAvisosWeb(query, { maxResults: Math.ceil(limit / 2) });

        for (const r of webResults) {
          // Evitar duplicados (mesmo URL)
          if (r.url && seenUrls.has(r.url)) continue;

          const result: CombinedResult = {
            id: r.id,
            titulo: r.titulo,
            descricao: r.descricao,
            fonte: r.fonte,
            url: r.url,
            portal: r.portal,
            score: r.relevancia,
            source: 'web',
          };

          if (r.url) seenUrls.add(r.url);
          combinedResults.push(result);
          webResultsCount++;
        }
      } catch (webError: any) {
        console.error('Erro pesquisa web:', webError.message);
      }
    }

    // 3. Ordenar por score
    combinedResults.sort((a, b) => b.score - a.score);

    // 4. Limitar resultados
    const finalResults = combinedResults.slice(0, limit);

    return NextResponse.json({
      success: true,
      query,
      results: finalResults,
      total: finalResults.length,
      sources: {
        local: localResults.length,
        web: webResultsCount,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        webSearchEnabled: includeWeb,
        deduplicatedUrls: seenUrls.size,
      },
    });
  } catch (error: any) {
    console.error('Erro na pesquisa combinada:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao pesquisar',
        details: error.message,
      },
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

    // Enriquecer query com contexto da empresa
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

    const combinedResults: CombinedResult[] = [];
    const seenUrls = new Set<string>();

    // 1. Pesquisa local
    const localResults = await searchAvisos(enrichedQuery, filters, Math.ceil(maxResults / 2));

    for (const r of localResults) {
      combinedResults.push({
        id: r.aviso.id,
        titulo: r.aviso.titulo,
        descricao: r.aviso.descricao,
        fonte: r.aviso.metadata.fonte || 'Local',
        url: r.aviso.metadata.url || null,
        portal: r.aviso.metadata.fonte || 'LOCAL',
        score: Math.round(r.score * 100),
        source: 'local',
        dataFecho: r.aviso.metadata.data_fecho,
        montante: r.aviso.metadata.montante_max,
        taxa: r.aviso.metadata.taxa_apoio,
      });
      if (r.aviso.metadata.url) seenUrls.add(r.aviso.metadata.url);
    }

    // 2. Pesquisa web
    let webCount = 0;
    if (includeWeb) {
      try {
        const webResults = await searchAvisosWeb(enrichedQuery, { maxResults: Math.ceil(maxResults / 2) });

        for (const r of webResults) {
          if (r.url && seenUrls.has(r.url)) continue;

          combinedResults.push({
            id: r.id,
            titulo: r.titulo,
            descricao: r.descricao,
            fonte: r.fonte,
            url: r.url,
            portal: r.portal,
            score: r.relevancia,
            source: 'web',
          });
          webCount++;
          if (r.url) seenUrls.add(r.url);
        }
      } catch (e: any) {
        console.log('Web search skipped:', e.message);
      }
    }

    // Ordenar e limitar
    combinedResults.sort((a, b) => b.score - a.score);
    const finalResults = combinedResults.slice(0, maxResults);

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
