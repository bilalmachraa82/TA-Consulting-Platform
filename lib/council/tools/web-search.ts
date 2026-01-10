/**
 * Web Search Tool
 * 
 * Searches the web for market data, competitor info, and pricing benchmarks.
 * Uses SerpAPI or falls back to mock data for development.
 */

import type { WebSearchParams, WebSearchResult, ToolResult } from '../types';

const SERP_API_KEY = process.env.SERP_API_KEY;

/**
 * Execute web search
 */
export async function executeWebSearch(params: WebSearchParams): Promise<ToolResult> {
    const startTime = Date.now();

    try {
        let result: WebSearchResult;

        if (SERP_API_KEY) {
            result = await serpApiSearch(params);
        } else {
            // Fallback to curated knowledge for common queries
            result = await mockSearch(params);
        }

        return {
            tool: 'web_search',
            success: true,
            data: result,
            executionTimeMs: Date.now() - startTime,
        };
    } catch (error: any) {
        return {
            tool: 'web_search',
            success: false,
            data: null,
            error: error.message,
            executionTimeMs: Date.now() - startTime,
        };
    }
}

/**
 * Real SerpAPI search
 */
async function serpApiSearch(params: WebSearchParams): Promise<WebSearchResult> {
    const { query, region, maxResults = 5 } = params;

    const regionMap: Record<string, string> = {
        pt: 'pt',
        eu: 'eu',
        global: 'us',
    };

    const url = new URL('https://serpapi.com/search.json');
    url.searchParams.set('q', query);
    url.searchParams.set('api_key', SERP_API_KEY!);
    url.searchParams.set('gl', regionMap[region] || 'us');
    url.searchParams.set('num', String(maxResults));

    const response = await fetch(url.toString());

    if (!response.ok) {
        throw new Error(`SerpAPI error: ${response.status}`);
    }

    const data = await response.json();

    const snippets = (data.organic_results || []).map((r: any) => ({
        title: r.title || '',
        content: r.snippet || '',
        url: r.link || '',
    }));

    return { snippets };
}

/**
 * Mock search with curated knowledge for common queries
 * Used when SerpAPI key is not available
 */
async function mockSearch(params: WebSearchParams): Promise<WebSearchResult> {
    const { query, region } = params;
    const lowerQuery = query.toLowerCase();

    // Curated knowledge base for Portuguese market
    const knowledgeBase: Record<string, WebSearchResult> = {
        // Pricing benchmarks Portugal
        pricing_portugal: {
            snippets: [
                {
                    title: 'Tarifas de Desenvolvimento Web em Portugal 2025',
                    content: 'Developers seniores em Portugal cobram entre €40-80/hora. Freelancers de elite podem cobrar €100+/hora. Projetos de plataformas SaaS completas variam entre €15,000-50,000.',
                    url: 'https://example.com/pt-dev-rates',
                },
                {
                    title: 'Mercado de Software Empresarial Portugal',
                    content: 'PMEs portuguesas investem em média €5,000-15,000 em ferramentas de gestão. Soluções SaaS mensais variam de €99-499/mês por utilizador.',
                    url: 'https://example.com/pt-saas-market',
                },
            ],
        },

        // Granter.AI competitor
        granter: {
            snippets: [
                {
                    title: 'Granter.AI - AI Grant Writing Platform',
                    content: 'Granter.AI oferece assistência por IA para candidaturas a fundos. Preços a partir de $49/mês. Foco no mercado US/EU. Não tem presença forte em Portugal.',
                    url: 'https://granter.ai',
                },
                {
                    title: 'Alternativas a Granter.AI',
                    content: 'Mercado fragmentado com poucas soluções especializadas para fundos europeus. A maioria das consultoras usa Excel e processos manuais.',
                    url: 'https://example.com/grant-tools',
                },
            ],
        },

        // European funds market
        fundos_europeus: {
            snippets: [
                {
                    title: 'PT2030 - Orçamento e Oportunidades',
                    content: 'Portugal 2030 dispõe de €23 mil milhões em fundos europeus. Principal foco: inovação, digitalização, transição climática. Milhares de PMEs candidatam-se anualmente.',
                    url: 'https://portugal2030.pt',
                },
                {
                    title: 'Consultoras de Fundos em Portugal',
                    content: 'Existem centenas de consultoras a operar em Portugal. Taxas típicas: 3-8% do valor aprovado ou fees fixos de €2,000-10,000 por candidatura.',
                    url: 'https://example.com/consultoras-pt',
                },
            ],
        },

        // Default fallback
        default: {
            snippets: [
                {
                    title: 'Mercado de Tecnologia Portugal 2025',
                    content: 'Ecossistema tech português em crescimento. Startups e PMEs cada vez mais recetivas a soluções de automação e IA.',
                    url: 'https://example.com/pt-tech-2025',
                },
            ],
        },
    };

    // Match query to knowledge base
    let key = 'default';

    if (lowerQuery.includes('preço') || lowerQuery.includes('pricing') || lowerQuery.includes('custo')) {
        key = 'pricing_portugal';
    } else if (lowerQuery.includes('granter') || lowerQuery.includes('concorrente') || lowerQuery.includes('competitor')) {
        key = 'granter';
    } else if (lowerQuery.includes('fundo') || lowerQuery.includes('pt2030') || lowerQuery.includes('prr')) {
        key = 'fundos_europeus';
    }

    // Add region context
    const result = { ...knowledgeBase[key] };

    if (region === 'pt') {
        result.snippets = result.snippets.map(s => ({
            ...s,
            content: `[Contexto PT] ${s.content}`,
        }));
    }

    return result;
}

/**
 * Quick benchmark lookup for common scenarios
 */
export async function getMarketBenchmarks(): Promise<Record<string, any>> {
    return {
        developerRates: {
            junior: '€25-40/h',
            mid: '€40-60/h',
            senior: '€60-100/h',
            specialist: '€100-150/h',
        },
        saasProjects: {
            mvp: '€5,000-15,000',
            professional: '€15,000-50,000',
            enterprise: '€50,000-150,000',
        },
        monthlySubscriptions: {
            micro: '€29-99/mês',
            professional: '€99-299/mês',
            enterprise: '€299-999/mês',
        },
        grantConsulting: {
            successFee: '3-8% do valor aprovado',
            fixedFee: '€2,000-10,000 por candidatura',
        },
    };
}
