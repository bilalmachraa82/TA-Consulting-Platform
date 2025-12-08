/**
 * Google Search RAG - Pesquisa de Avisos em Tempo Real
 *
 * Sistema de RAG que utiliza pesquisa web para encontrar avisos
 * de financiamento atualizados diretamente dos portais oficiais.
 *
 * Suporta:
 * - Google Custom Search API
 * - SerpAPI (alternativa)
 * - Fallback para dados locais
 */

import axios from 'axios';
import * as cheerio from 'cheerio';

// Tipos
export interface GoogleSearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
  formattedUrl: string;
  pagemap?: {
    metatags?: any[];
    cse_thumbnail?: any[];
  };
}

export interface SearchConfig {
  apiKey?: string;
  searchEngineId?: string;
  serpApiKey?: string;
  maxResults?: number;
}

export interface WebSearchResult {
  id: string;
  titulo: string;
  descricao: string;
  fonte: string;
  url: string;
  portal: 'PORTUGAL2030' | 'PEPAC' | 'PRR' | 'OUTRO';
  dataEncontrado: string;
  relevancia: number;
  snippet: string;
}

// Configuração
const DEFAULT_CONFIG: SearchConfig = {
  maxResults: 10,
};

// Sites oficiais para pesquisa
const OFFICIAL_SITES = [
  'site:portugal2030.pt',
  'site:compete2030.gov.pt',
  'site:pdr.pt',
  'site:dgadr.gov.pt',
  'site:ifap.pt',
  'site:recuperarportugal.gov.pt',
  'site:fundoambiental.pt',
  'site:iapmei.pt',
  'site:anihub.pt',
];

/**
 * Pesquisar avisos usando Google Custom Search API
 */
export async function searchWithGoogle(
  query: string,
  config: SearchConfig = DEFAULT_CONFIG
): Promise<WebSearchResult[]> {
  const apiKey = config.apiKey || process.env.GOOGLE_SEARCH_API_KEY;
  const searchEngineId = config.searchEngineId || process.env.GOOGLE_SEARCH_ENGINE_ID;

  if (!apiKey || !searchEngineId) {
    console.log('⚠️ Google Search API não configurada, usando fallback');
    return searchWithFallback(query);
  }

  try {
    const siteRestriction = OFFICIAL_SITES.join(' OR ');
    const fullQuery = `${query} avisos financiamento (${siteRestriction})`;

    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: apiKey,
        cx: searchEngineId,
        q: fullQuery,
        num: config.maxResults || 10,
        lr: 'lang_pt',
        gl: 'pt',
      },
      timeout: 10000,
    });

    const items = response.data.items || [];
    return items.map((item: GoogleSearchResult, index: number) => ({
      id: `GSEARCH_${Date.now()}_${index}`,
      titulo: item.title,
      descricao: item.snippet,
      fonte: identifySource(item.displayLink),
      url: item.link,
      portal: identifyPortal(item.displayLink),
      dataEncontrado: new Date().toISOString(),
      relevancia: 100 - (index * 10),
      snippet: item.snippet,
    }));
  } catch (error: any) {
    console.error('❌ Erro Google Search:', error.message);
    return searchWithFallback(query);
  }
}

/**
 * Pesquisar usando SerpAPI (alternativa)
 */
export async function searchWithSerpAPI(
  query: string,
  config: SearchConfig = DEFAULT_CONFIG
): Promise<WebSearchResult[]> {
  const apiKey = config.serpApiKey || process.env.SERPAPI_KEY;

  if (!apiKey) {
    console.log('⚠️ SerpAPI não configurada, usando fallback');
    return searchWithFallback(query);
  }

  try {
    const response = await axios.get('https://serpapi.com/search', {
      params: {
        api_key: apiKey,
        engine: 'google',
        q: `${query} avisos financiamento Portugal`,
        location: 'Portugal',
        hl: 'pt',
        gl: 'pt',
        num: config.maxResults || 10,
      },
      timeout: 10000,
    });

    const results = response.data.organic_results || [];
    return results.map((item: any, index: number) => ({
      id: `SERP_${Date.now()}_${index}`,
      titulo: item.title,
      descricao: item.snippet,
      fonte: identifySource(item.displayed_link),
      url: item.link,
      portal: identifyPortal(item.displayed_link),
      dataEncontrado: new Date().toISOString(),
      relevancia: 100 - (index * 10),
      snippet: item.snippet,
    }));
  } catch (error: any) {
    console.error('❌ Erro SerpAPI:', error.message);
    return searchWithFallback(query);
  }
}

/**
 * Scraping direto dos portais oficiais (fallback)
 */
export async function searchWithFallback(query: string): Promise<WebSearchResult[]> {
  console.log('🔄 Usando scraping direto como fallback...');
  const results: WebSearchResult[] = [];
  const queryLower = query.toLowerCase();

  // URLs para verificar
  const urlsToCheck = [
    { url: 'https://portugal2030.pt/avisos-abertos/', portal: 'PORTUGAL2030' as const },
    { url: 'https://www.compete2030.gov.pt/avisos/', portal: 'PORTUGAL2030' as const },
    { url: 'https://www.ifap.pt/web/guest/avisos-abertos', portal: 'PEPAC' as const },
    { url: 'https://recuperarportugal.gov.pt/', portal: 'PRR' as const },
  ];

  for (const { url, portal } of urlsToCheck) {
    try {
      const response = await axios.get(url, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9',
          'Accept-Language': 'pt-PT,pt;q=0.9',
        },
      });

      const $ = cheerio.load(response.data);

      // Procurar links de avisos
      $('a').each((i, el) => {
        const $el = $(el);
        const href = $el.attr('href') || '';
        const text = $el.text().trim();

        // Verificar se é relevante para a query
        if (
          text.length > 20 &&
          (text.toLowerCase().includes('aviso') ||
            text.toLowerCase().includes('concurso') ||
            text.toLowerCase().includes('apoio')) &&
          isRelevantToQuery(text, queryLower)
        ) {
          results.push({
            id: `FALLBACK_${Date.now()}_${i}`,
            titulo: text.substring(0, 200),
            descricao: $el.parent().text().trim().substring(0, 300) || text,
            fonte: portal,
            url: href.startsWith('http') ? href : new URL(href, url).toString(),
            portal,
            dataEncontrado: new Date().toISOString(),
            relevancia: calculateRelevance(text, queryLower),
            snippet: text.substring(0, 150),
          });
        }
      });
    } catch (error) {
      console.log(`  ⚠️ Erro ao acessar ${url}`);
    }
  }

  // Ordenar por relevância
  return results.sort((a, b) => b.relevancia - a.relevancia).slice(0, 10);
}

/**
 * Pesquisa combinada - tenta todas as fontes
 */
export async function searchAvisosWeb(
  query: string,
  config: SearchConfig = DEFAULT_CONFIG
): Promise<WebSearchResult[]> {
  console.log(`🌐 Pesquisando na web: "${query}"`);

  // Tentar Google primeiro
  let results = await searchWithGoogle(query, config);

  // Se não encontrou, tentar SerpAPI
  if (results.length === 0) {
    results = await searchWithSerpAPI(query, config);
  }

  // Se ainda não encontrou, usar fallback
  if (results.length === 0) {
    results = await searchWithFallback(query);
  }

  console.log(`✅ Encontrados ${results.length} resultados`);
  return results;
}

/**
 * Funções auxiliares
 */

function identifySource(domain: string): string {
  const d = domain.toLowerCase();
  if (d.includes('portugal2030') || d.includes('compete2030')) return 'Portugal 2030';
  if (d.includes('pdr') || d.includes('dgadr') || d.includes('ifap')) return 'PEPAC';
  if (d.includes('recuperarportugal') || d.includes('prr')) return 'PRR';
  if (d.includes('fundoambiental')) return 'Fundo Ambiental';
  if (d.includes('iapmei')) return 'IAPMEI';
  return 'Outro';
}

function identifyPortal(domain: string): 'PORTUGAL2030' | 'PEPAC' | 'PRR' | 'OUTRO' {
  const d = domain.toLowerCase();
  if (d.includes('portugal2030') || d.includes('compete2030')) return 'PORTUGAL2030';
  if (d.includes('pdr') || d.includes('dgadr') || d.includes('ifap')) return 'PEPAC';
  if (d.includes('recuperarportugal') || d.includes('prr')) return 'PRR';
  return 'OUTRO';
}

function isRelevantToQuery(text: string, query: string): boolean {
  const textLower = text.toLowerCase();
  const queryWords = query.split(/\s+/).filter(w => w.length > 2);

  // Pelo menos uma palavra da query deve estar no texto
  return queryWords.some(word => textLower.includes(word));
}

function calculateRelevance(text: string, query: string): number {
  const textLower = text.toLowerCase();
  const queryWords = query.split(/\s+/).filter(w => w.length > 2);

  let matches = 0;
  for (const word of queryWords) {
    if (textLower.includes(word)) matches++;
  }

  const matchRatio = queryWords.length > 0 ? matches / queryWords.length : 0;
  return Math.round(matchRatio * 100);
}

/**
 * Exportar função principal e auxiliares
 */
export default {
  searchAvisosWeb,
  searchWithGoogle,
  searchWithSerpAPI,
  searchWithFallback,
};
