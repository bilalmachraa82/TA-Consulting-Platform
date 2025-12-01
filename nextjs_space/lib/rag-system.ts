/**
 * RAG System - Retrieval Augmented Generation
 *
 * Sistema de pesquisa semântica para avisos de financiamento
 * Utiliza embeddings e similarity search para encontrar avisos relevantes
 */

import * as fs from 'fs';
import * as path from 'path';

// Tipos
export interface AvisoEmbedding {
  id: string;
  titulo: string;
  descricao: string;
  content: string;  // Texto completo para embedding
  embedding?: number[];
  metadata: {
    fonte: string;
    programa: string;
    setor: string;
    regiao: string;
    montante_max: number;
    taxa_apoio: number;
    data_fecho: string;
    url: string;
    pdf_url?: string;
    keywords: string[];
  };
}

export interface SearchResult {
  aviso: AvisoEmbedding;
  score: number;
  highlights: string[];
}

export interface RAGContext {
  query: string;
  results: SearchResult[];
  generatedAnswer?: string;
}

// Cache de embeddings em memória
let embeddingsCache: Map<string, AvisoEmbedding> = new Map();
let isInitialized = false;

/**
 * Carregar todos os avisos dos ficheiros JSON
 */
export async function loadAllAvisos(): Promise<AvisoEmbedding[]> {
  const dataDir = path.join(process.cwd(), 'data', 'scraped');
  const files = ['portugal2030_avisos.json', 'pepac_avisos.json', 'prr_avisos.json'];
  const avisos: AvisoEmbedding[] = [];

  for (const file of files) {
    try {
      const filePath = path.join(dataDir, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content);

        for (const aviso of data) {
          // Criar texto completo para pesquisa
          const fullContent = [
            aviso.titulo || '',
            aviso.descricao || '',
            aviso.programa || '',
            aviso.setor || '',
            aviso.elegibilidade || '',
            (aviso.keywords || []).join(' '),
          ].join(' ').toLowerCase();

          avisos.push({
            id: aviso.id,
            titulo: aviso.titulo,
            descricao: aviso.descricao,
            content: fullContent,
            metadata: {
              fonte: aviso.fonte,
              programa: aviso.programa,
              setor: aviso.setor,
              regiao: aviso.regiao,
              montante_max: parseInt(aviso.montante_max) || 0,
              taxa_apoio: parseInt(aviso.taxa_apoio) || 0,
              data_fecho: aviso.data_fecho,
              url: aviso.url,
              pdf_url: aviso.pdf_url,
              keywords: aviso.keywords || [],
            },
          });
        }
      }
    } catch (error) {
      console.warn(`Aviso: não foi possível carregar ${file}`);
    }
  }

  console.log(`📚 Carregados ${avisos.length} avisos para RAG`);
  return avisos;
}

/**
 * Inicializar o sistema RAG
 */
export async function initRAG(): Promise<void> {
  if (isInitialized) return;

  console.log('🔧 Inicializando sistema RAG...');
  const avisos = await loadAllAvisos();

  // Adicionar ao cache
  for (const aviso of avisos) {
    embeddingsCache.set(aviso.id, aviso);
  }

  isInitialized = true;
  console.log('✅ Sistema RAG inicializado');
}

/**
 * Calcular similaridade entre textos usando TF-IDF simplificado
 */
function calculateSimilarity(query: string, document: string): number {
  // Normalizar textos
  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);
  };

  const queryWords = normalizeText(query);
  const docWords = normalizeText(document);

  if (queryWords.length === 0 || docWords.length === 0) return 0;

  // Calcular frequência de palavras do documento
  const docFreq: Map<string, number> = new Map();
  for (const word of docWords) {
    docFreq.set(word, (docFreq.get(word) || 0) + 1);
  }

  // Calcular score
  let matchCount = 0;
  let totalWeight = 0;

  for (const word of queryWords) {
    const freq = docFreq.get(word) || 0;
    if (freq > 0) {
      matchCount++;
      totalWeight += Math.log(1 + freq); // Log frequency para evitar bias
    }
  }

  // Normalizar pelo tamanho da query
  const matchRatio = matchCount / queryWords.length;
  const weightedScore = totalWeight / queryWords.length;

  // Combinar métricas
  return (matchRatio * 0.6) + (Math.min(weightedScore, 1) * 0.4);
}

/**
 * Pesquisar avisos relevantes
 */
export async function searchAvisos(
  query: string,
  filters?: {
    fonte?: string;
    setor?: string;
    regiao?: string;
    montanteMin?: number;
    montanteMax?: number;
  },
  limit: number = 10
): Promise<SearchResult[]> {
  await initRAG();

  const results: SearchResult[] = [];
  const avisos = Array.from(embeddingsCache.values());

  for (const aviso of avisos) {
    // Aplicar filtros
    if (filters) {
      if (filters.fonte && aviso.metadata.fonte !== filters.fonte) continue;
      if (filters.setor && !aviso.metadata.setor.toLowerCase().includes(filters.setor.toLowerCase())) continue;
      if (filters.regiao && aviso.metadata.regiao !== filters.regiao) continue;
      if (filters.montanteMin && aviso.metadata.montante_max < filters.montanteMin) continue;
      if (filters.montanteMax && aviso.metadata.montante_max > filters.montanteMax) continue;
    }

    // Calcular similaridade
    const score = calculateSimilarity(query, aviso.content);

    // Adicionar score baseado em keywords
    let keywordBoost = 0;
    const queryLower = query.toLowerCase();
    for (const keyword of aviso.metadata.keywords) {
      if (queryLower.includes(keyword.toLowerCase())) {
        keywordBoost += 0.1;
      }
    }

    const finalScore = Math.min(score + keywordBoost, 1);

    if (finalScore > 0.1) {  // Threshold mínimo
      // Extrair highlights
      const highlights = extractHighlights(query, aviso.descricao);

      results.push({
        aviso,
        score: finalScore,
        highlights,
      });
    }
  }

  // Ordenar por score e limitar
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Extrair highlights (trechos relevantes)
 */
function extractHighlights(query: string, text: string): string[] {
  const highlights: string[] = [];
  const queryWords = query.toLowerCase().split(/\s+/);
  const sentences = text.split(/[.!?]+/);

  for (const sentence of sentences) {
    const sentenceLower = sentence.toLowerCase();
    for (const word of queryWords) {
      if (word.length > 3 && sentenceLower.includes(word)) {
        const trimmed = sentence.trim();
        if (trimmed.length > 20 && !highlights.includes(trimmed)) {
          highlights.push(trimmed);
        }
        break;
      }
    }
  }

  return highlights.slice(0, 3);
}

/**
 * RAG Query - Pesquisar e gerar resposta contextualizada
 */
export async function ragQuery(
  userQuery: string,
  empresaContext?: {
    setor?: string;
    dimensao?: string;
    regiao?: string;
  }
): Promise<RAGContext> {
  // Enriquecer query com contexto da empresa
  let enrichedQuery = userQuery;
  if (empresaContext) {
    const contextParts = [];
    if (empresaContext.setor) contextParts.push(empresaContext.setor);
    if (empresaContext.dimensao) contextParts.push(`empresa ${empresaContext.dimensao}`);
    if (empresaContext.regiao) contextParts.push(`região ${empresaContext.regiao}`);
    if (contextParts.length > 0) {
      enrichedQuery = `${userQuery} ${contextParts.join(' ')}`;
    }
  }

  // Pesquisar avisos
  const results = await searchAvisos(enrichedQuery, {
    setor: empresaContext?.setor,
    regiao: empresaContext?.regiao,
  }, 5);

  // Gerar contexto para LLM
  const context: RAGContext = {
    query: userQuery,
    results,
  };

  return context;
}

/**
 * Gerar prompt para LLM com contexto RAG
 */
export function generateRAGPrompt(context: RAGContext): string {
  if (context.results.length === 0) {
    return `O utilizador perguntou: "${context.query}"

Não foram encontrados avisos específicos para esta pesquisa. Por favor, sugira ao utilizador que reformule a pesquisa ou verifique os filtros aplicados.`;
  }

  let prompt = `Com base nos seguintes avisos de financiamento relevantes, responde à pergunta do utilizador de forma completa e útil.

AVISOS ENCONTRADOS:
`;

  for (let i = 0; i < context.results.length; i++) {
    const result = context.results[i];
    const aviso = result.aviso;
    prompt += `
---
${i + 1}. ${aviso.titulo}
   Fonte: ${aviso.metadata.fonte}
   Programa: ${aviso.metadata.programa}
   Setor: ${aviso.metadata.setor}
   Montante Máximo: €${aviso.metadata.montante_max.toLocaleString('pt-PT')}
   Taxa de Apoio: ${aviso.metadata.taxa_apoio}%
   Data Limite: ${aviso.metadata.data_fecho}
   Descrição: ${aviso.descricao.substring(0, 300)}...
   URL: ${aviso.metadata.url}
   Relevância: ${Math.round(result.score * 100)}%
`;
  }

  prompt += `
---

PERGUNTA DO UTILIZADOR: "${context.query}"

Responde de forma clara e estruturada, mencionando os avisos mais relevantes e explicando porque são adequados. Inclui os links dos avisos na resposta.`;

  return prompt;
}

/**
 * Sincronizar avisos com a base de dados
 */
export async function syncToDatabase(): Promise<void> {
  console.log('🔄 Sincronizando avisos com a base de dados...');

  const avisos = await loadAllAvisos();

  // Importar prisma client
  const { prisma, isPrismaAvailable } = await import('./db');

  if (!isPrismaAvailable()) {
    console.log('⚠️ Prisma não disponível, guardando apenas em JSON');
    return;
  }

  let created = 0;
  let updated = 0;

  for (const aviso of avisos) {
    try {
      const result = await prisma.aviso.upsert({
        where: { codigo: aviso.id },
        create: {
          id: aviso.id,
          nome: aviso.titulo,
          codigo: aviso.id,
          portal: aviso.metadata.fonte as any,
          programa: aviso.metadata.programa,
          linha: aviso.metadata.setor,
          dataInicioSubmissao: new Date(),
          dataFimSubmissao: new Date(aviso.metadata.data_fecho),
          montanteMaximo: aviso.metadata.montante_max,
          descrição: aviso.descricao,
          link: aviso.metadata.url,
          taxa: `${aviso.metadata.taxa_apoio}%`,
          regiao: aviso.metadata.regiao,
          setoresElegiveis: aviso.metadata.keywords,
          dimensaoEmpresa: ['MICRO', 'PEQUENA', 'MEDIA', 'GRANDE'],
          urgente: false,
          ativo: true,
        },
        update: {
          nome: aviso.titulo,
          descrição: aviso.descricao,
          dataFimSubmissao: new Date(aviso.metadata.data_fecho),
          montanteMaximo: aviso.metadata.montante_max,
        },
      });

      if (result) {
        updated++;
      } else {
        created++;
      }
    } catch (error) {
      console.warn(`⚠️ Erro ao sincronizar ${aviso.id}`);
    }
  }

  console.log(`✅ Sincronização completa: ${created} criados, ${updated} atualizados`);
}

// Exportar funções principais
export default {
  initRAG,
  searchAvisos,
  ragQuery,
  generateRAGPrompt,
  loadAllAvisos,
  syncToDatabase,
};
