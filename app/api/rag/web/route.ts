/**
 * Web Search RAG API Endpoint
 * Pesquisa de avisos em tempo real usando Google Search
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  searchAvisosWeb,
  searchWithGoogle,
  searchWithSerpAPI,
  searchWithFallback,
  WebSearchResult
} from '@/lib/google-search-rag';

export const dynamic = 'force-dynamic';

// GET - Pesquisar avisos na web
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || searchParams.get('query') || '';
    const source = searchParams.get('source') || 'auto'; // auto, google, serpapi, fallback
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query) {
      return NextResponse.json(
        {
          success: false,
          error: 'Query é obrigatória. Use ?q=sua+pesquisa',
          example: '/api/rag/web?q=inovacao+digital+pme'
        },
        { status: 400 }
      );
    }

    let results: WebSearchResult[] = [];
    let searchSource = source;

    switch (source) {
      case 'google':
        results = await searchWithGoogle(query, { maxResults: limit });
        searchSource = 'google';
        break;
      case 'serpapi':
        results = await searchWithSerpAPI(query, { maxResults: limit });
        searchSource = 'serpapi';
        break;
      case 'fallback':
        results = await searchWithFallback(query);
        searchSource = 'fallback-scraping';
        break;
      default:
        // Auto: tenta todas as fontes
        results = await searchAvisosWeb(query, { maxResults: limit });
        searchSource = results.length > 0 ?
          (results[0].id.startsWith('GSEARCH') ? 'google' :
           results[0].id.startsWith('SERP') ? 'serpapi' : 'fallback-scraping')
          : 'none';
    }

    return NextResponse.json({
      success: true,
      query,
      results: results.slice(0, limit).map(r => ({
        id: r.id,
        titulo: r.titulo,
        descricao: r.descricao,
        fonte: r.fonte,
        url: r.url,
        portal: r.portal,
        dataEncontrado: r.dataEncontrado,
        relevancia: r.relevancia,
        snippet: r.snippet,
      })),
      total: results.length,
      source: searchSource,
      metadata: {
        timestamp: new Date().toISOString(),
        apiConfigured: {
          googleSearch: !!process.env.GOOGLE_SEARCH_API_KEY,
          serpApi: !!process.env.SERPAPI_KEY,
        },
      },
    });
  } catch (error: any) {
    console.error('Erro na pesquisa web:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao pesquisar na web',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// POST - Pesquisa avançada com configuração
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      query,
      portals = ['PORTUGAL2030', 'PEPAC', 'PRR'],
      maxResults = 10,
      config = {},
    } = body;

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query é obrigatória' },
        { status: 400 }
      );
    }

    // Pesquisar com configuração personalizada
    const results = await searchAvisosWeb(query, {
      ...config,
      maxResults,
    });

    // Filtrar por portais se especificado
    const filteredResults = results.filter(r =>
      portals.includes(r.portal) || portals.includes('OUTRO')
    );

    return NextResponse.json({
      success: true,
      query,
      filters: { portals, maxResults },
      results: filteredResults.map(r => ({
        id: r.id,
        titulo: r.titulo,
        descricao: r.descricao,
        fonte: r.fonte,
        url: r.url,
        portal: r.portal,
        dataEncontrado: r.dataEncontrado,
        relevancia: r.relevancia,
        snippet: r.snippet,
      })),
      total: filteredResults.length,
      metadata: {
        timestamp: new Date().toISOString(),
        totalBeforeFilter: results.length,
      },
    });
  } catch (error: any) {
    console.error('Erro na pesquisa web avançada:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao processar pesquisa',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
