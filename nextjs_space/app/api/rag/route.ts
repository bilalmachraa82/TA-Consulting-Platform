/**
 * RAG API Endpoint
 * Pesquisa semântica de avisos com inteligência artificial
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchAvisos, ragQuery, generateRAGPrompt, loadAllAvisos } from '@/lib/rag-system';

export const dynamic = 'force-dynamic';

// GET - Pesquisar avisos
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || searchParams.get('query') || '';
    const fonte = searchParams.get('fonte') || undefined;
    const setor = searchParams.get('setor') || undefined;
    const regiao = searchParams.get('regiao') || undefined;
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query) {
      // Se não há query, retornar todos os avisos
      const allAvisos = await loadAllAvisos();
      return NextResponse.json({
        success: true,
        query: '',
        results: allAvisos.map(a => ({
          id: a.id,
          titulo: a.titulo,
          descricao: a.descricao,
          fonte: a.metadata.fonte,
          programa: a.metadata.programa,
          setor: a.metadata.setor,
          regiao: a.metadata.regiao,
          montante_max: a.metadata.montante_max,
          taxa_apoio: a.metadata.taxa_apoio,
          data_fecho: a.metadata.data_fecho,
          url: a.metadata.url,
          pdf_url: a.metadata.pdf_url,
          keywords: a.metadata.keywords,
        })),
        total: allAvisos.length,
        source: 'rag-system',
      });
    }

    // Pesquisar com RAG
    const results = await searchAvisos(query, {
      fonte,
      setor,
      regiao,
    }, limit);

    return NextResponse.json({
      success: true,
      query,
      results: results.map(r => ({
        id: r.aviso.id,
        titulo: r.aviso.titulo,
        descricao: r.aviso.descricao,
        fonte: r.aviso.metadata.fonte,
        programa: r.aviso.metadata.programa,
        setor: r.aviso.metadata.setor,
        regiao: r.aviso.metadata.regiao,
        montante_max: r.aviso.metadata.montante_max,
        taxa_apoio: r.aviso.metadata.taxa_apoio,
        data_fecho: r.aviso.metadata.data_fecho,
        url: r.aviso.metadata.url,
        pdf_url: r.aviso.metadata.pdf_url,
        keywords: r.aviso.metadata.keywords,
        score: Math.round(r.score * 100),
        highlights: r.highlights,
      })),
      total: results.length,
      source: 'rag-system',
    });
  } catch (error: any) {
    console.error('Erro na pesquisa RAG:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao pesquisar avisos' },
      { status: 500 }
    );
  }
}

// POST - Query RAG completa com contexto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, empresaContext, generateAnswer = false } = body;

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query é obrigatória' },
        { status: 400 }
      );
    }

    // Executar query RAG
    const ragContext = await ragQuery(query, empresaContext);

    const response: any = {
      success: true,
      query,
      results: ragContext.results.map(r => ({
        id: r.aviso.id,
        titulo: r.aviso.titulo,
        descricao: r.aviso.descricao,
        metadata: r.aviso.metadata,
        score: Math.round(r.score * 100),
        highlights: r.highlights,
      })),
      total: ragContext.results.length,
    };

    // Gerar prompt para LLM se solicitado
    if (generateAnswer) {
      response.prompt = generateRAGPrompt(ragContext);
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Erro na query RAG:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao processar query' },
      { status: 500 }
    );
  }
}
