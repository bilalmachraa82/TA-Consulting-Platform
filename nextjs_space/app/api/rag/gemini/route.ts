/**
 * Gemini File Search RAG API Endpoint
 *
 * Pesquisa semântica usando Google Gemini com:
 * - File Search Tool (RAG gerido)
 * - Google Search Grounding (pesquisa web em tempo real)
 *
 * Documentação: https://ai.google.dev/gemini-api/docs/file-search
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getGeminiClient,
  searchWithGemini,
  initializeGeminiRAG,
} from '@/lib/gemini-file-search';

export const dynamic = 'force-dynamic';

// GET - Pesquisar com Gemini
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || searchParams.get('query') || '';
    const mode = searchParams.get('mode') || 'google'; // google, file-search
    const contextType = searchParams.get('context') || 'fundos';

    if (!query) {
      return NextResponse.json(
        {
          success: false,
          error: 'Query é obrigatória. Use ?q=sua+pesquisa',
          example: '/api/rag/gemini?q=avisos+inovacao+PME',
          modes: ['google', 'file-search'],
        },
        { status: 400 }
      );
    }

    const client = getGeminiClient();

    // Verificar configuração
    if (!client.isConfigured()) {
      return NextResponse.json({
        success: false,
        error: 'Gemini API não configurada',
        setup: {
          message: 'Adicione GEMINI_API_KEY ao ficheiro .env',
          steps: [
            '1. Vá a https://aistudio.google.com/app/apikey',
            '2. Crie uma API key',
            '3. Adicione GEMINI_API_KEY=sua-key ao .env',
          ],
        },
      });
    }

    // Enriquecer query com contexto
    let enrichedQuery = query;
    if (contextType === 'fundos') {
      enrichedQuery = `
        Contexto: Consultoria de fundos europeus em Portugal.
        Programas relevantes: Portugal 2030, PRR, PEPAC, COMPETE 2030.

        Pergunta do utilizador: ${query}

        Responde de forma estruturada com:
        - Avisos/programas relevantes
        - Datas e prazos importantes
        - Montantes e taxas de apoio
        - Elegibilidade e requisitos
        - Links oficiais quando disponíveis
      `;
    }

    let result;
    if (mode === 'file-search') {
      result = await client.search(enrichedQuery);
    } else {
      result = await client.searchWithGoogleGrounding(enrichedQuery);
    }

    return NextResponse.json({
      success: result.success,
      query,
      mode,
      answer: result.answer,
      sources: result.results.map((r) => ({
        titulo: r.titulo,
        url: r.id,
        fonte: r.fonte,
      })),
      metadata: {
        timestamp: new Date().toISOString(),
        model: 'gemini-2.5-flash',
        hasGrounding: !!result.groundingMetadata,
      },
    });
  } catch (error: any) {
    console.error('Erro na pesquisa Gemini:', error);
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

// POST - Pesquisa avançada ou inicialização
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, query, empresaContext, options = {} } = body;

    const client = getGeminiClient();

    // Ação: Inicializar RAG com documentos
    if (action === 'initialize') {
      if (!client.isConfigured()) {
        return NextResponse.json({
          success: false,
          error: 'Gemini API não configurada',
        });
      }

      const result = await initializeGeminiRAG();
      return NextResponse.json(result);
    }

    // Ação: Listar stores
    if (action === 'list-stores') {
      const stores = await client.listStores();
      return NextResponse.json({
        success: true,
        stores,
      });
    }

    // Pesquisa padrão
    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query é obrigatória' },
        { status: 400 }
      );
    }

    // Construir query contextualizada
    let contextualQuery = query;
    if (empresaContext) {
      const extras = [];
      if (empresaContext.setor) extras.push(`Setor: ${empresaContext.setor}`);
      if (empresaContext.dimensao) extras.push(`Dimensão: ${empresaContext.dimensao}`);
      if (empresaContext.regiao) extras.push(`Região: ${empresaContext.regiao}`);
      if (empresaContext.necessidades) extras.push(`Necessidades: ${empresaContext.necessidades}`);

      contextualQuery = `
        Contexto da empresa cliente:
        ${extras.join('\n')}

        Pergunta: ${query}

        Encontra os melhores programas de financiamento para esta empresa.
        Inclui: nome do programa, elegibilidade, montantes, prazos e links.
      `;
    }

    const useGoogleGrounding = options.mode !== 'file-search';
    const result = await searchWithGemini(contextualQuery, useGoogleGrounding);

    return NextResponse.json({
      success: result.success,
      query,
      empresaContext,
      answer: result.answer,
      sources: result.results,
      groundingMetadata: result.groundingMetadata,
    });
  } catch (error: any) {
    console.error('Erro POST Gemini:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao processar', details: error.message },
      { status: 500 }
    );
  }
}
