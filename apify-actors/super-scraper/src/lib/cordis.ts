/**
 * Horizon Europe / Funding & Tenders (SEDIA) Scraper
 *
 * Nota: A pesquisa CORDIS via `cordis.europa.eu/search?format=json`
 * deixou de aceitar as queries antigas (contenttype/frameworkProgramme).
 * A fonte pública estável para calls é o Search API do Funding & Tenders (SEDIA).
 *
 * API: https://api.tech.ec.europa.eu/search-api/prod/rest/search
 * Método: POST sem body, parâmetros na query string (apiKey, text, pageSize, etc.)
 */

import axios from 'axios';
import { AvisoNormalized, PORTAIS } from './types';
import {
    normalizeDate,
    normalizeDotacao,
    normalizeStatus,
    stripHtml
} from './normalizers';
import { extractDocumentsFromTopicDetails, fetchTopicDetails } from './funding-tenders';

const SEDIA_SEARCH_API = 'https://api.tech.ec.europa.eu/search-api/prod/rest/search';

interface CORDISInput {
    maxItems: number;
    onlyOpen: boolean;
    includeDocuments?: boolean;
    maxDocumentsPerAviso?: number;
}

/**
 * Scrape calls Horizon Europe via SEDIA Search API
 * 
 * Status codes: 31094501=Open, 31094502=Forthcoming, 31094503=Closed
 * API retorna 93K+ calls, filtramos por status e ano
 */
export async function scrapeCORDIS(input: CORDISInput): Promise<AvisoNormalized[]> {
    const avisos: AvisoNormalized[] = [];
    const seenCodigos = new Set<string>();

    console.log('    📡 HORIZON/SEDIA: Fetching calls...');

    // Status codes for SEDIA API
    const OPEN_STATUS = '31094501';
    const FORTHCOMING_STATUS = '31094502';
    const CLOSED_STATUS = '31094503';

    try {
        const now = new Date();
        const currentYear = now.getFullYear();
        // Expanded to include previous year and next 2 years for better coverage
        // Also search without year for calls with identifiers like HORIZON-HLTH-2025
        const textQueries = input.onlyOpen
            ? [`HORIZON ${currentYear}`, `HORIZON ${currentYear + 1}`, `HORIZON ${currentYear + 2}`, `HORIZON ${currentYear - 1}`]
            : ['HORIZON'];

        const pageSize = 100;

        for (const textQuery of textQueries) {
            let pageNumber = 1;
            let totalResults = 0;

            while (avisos.length < input.maxItems) {
                const response = await axios.post(SEDIA_SEARCH_API, null, {
                    params: {
                        apiKey: 'SEDIA',
                        text: textQuery,
                        // Hint server-side (nem sempre fiável)
                        status: input.onlyOpen ? `${OPEN_STATUS},${FORTHCOMING_STATUS}` : undefined,
                        pageSize,
                        pageNumber,
                        sortBy: 'deadlineDate',
                        sortOrder: 'ASC',
                    },
                    headers: {
                        'User-Agent': 'Mozilla/5.0',
                        'Accept': 'application/json',
                    },
                    timeout: 30000,
                });

                const results = response.data?.results || [];
                totalResults = parseInt(response.data?.totalResults || '0', 10);

                if (results.length === 0) break;

	                for (const result of results) {
	                    const aviso = parseSEDIAResult(result);
	                    if (!aviso) continue;

                    const md = result?.metadata || {};
                    const first = (key: string): any => {
                        const v = md[key];
                        return Array.isArray(v) ? v[0] : v;
	                    };
	                    const rawStatusCode = String(first('status') || '');

	                    if (input.onlyOpen) {
	                        // Server-side status filtering isn't fully reliable; enforce it here too.
	                        if (rawStatusCode && rawStatusCode !== OPEN_STATUS && rawStatusCode !== FORTHCOMING_STATUS) {
	                            continue;
	                        }

	                        // Practical rule:
	                        // - Open: must have a future deadline
	                        // - Forthcoming: may not have a deadline; allow it
	                        if (aviso.dataFecho) {
	                            const deadline = new Date(aviso.dataFecho);
	                            if (!Number.isNaN(deadline.getTime()) && deadline < now) continue;
	                        } else if (rawStatusCode !== FORTHCOMING_STATUS) {
	                            continue;
	                        }
	                    }

	                    const key = aviso.codigo || aviso.id;
	                    if (!seenCodigos.has(key)) {
	                        seenCodigos.add(key);
                        avisos.push(aviso);
                    }

                    if (avisos.length >= input.maxItems) break;
                }

                if (results.length < pageSize) break;
                pageNumber += 1;
                if (pageNumber > Math.ceil(totalResults / pageSize)) break;
            }

            if (avisos.length >= input.maxItems) break;
        }

        // Ordenar por deadline (mais próximo primeiro) quando onlyOpen
        if (input.onlyOpen) {
            avisos.sort((a, b) => (a.dataFecho || '').localeCompare(b.dataFecho || ''));
        }

        console.log(`    ✅ HORIZON/SEDIA: ${avisos.length} avisos extraídos`);

    } catch (error: any) {
        console.log(`    ❌ HORIZON/SEDIA: Erro - ${error.message}`);
        // Fallback to EU Open Data Portal
        await fetchEUOpenData(avisos, input.maxItems);
    }

    if (input.includeDocuments) {
        await enrichHorizonWithTopicDetails(avisos, input.maxDocumentsPerAviso ?? 25);
    }

    return avisos;
}

/**
 * Parse SEDIA Search API result to AvisoNormalized
 */
function parseSEDIAResult(result: any): AvisoNormalized | null {
    const md = result?.metadata || {};

    const first = (key: string): any => {
        const v = md[key];
        return Array.isArray(v) ? v[0] : v;
    };

    const codigo = first('identifier') || '';
    // Horizon calls têm sempre identifier HORIZON-..., descartar resto
    if (!codigo || !codigo.toUpperCase().startsWith('HORIZON-')) {
        return null;
    }
    const titulo =
        first('title') ||
        result.title ||
        result.summary ||
        result.content ||
        '';

    if (!titulo) return null;

    const dataAberturaRaw = first('startDate') || first('openingDate') || '';
    const dataFechoRaw = first('deadlineDate') || '';

    const descricaoHtml =
        first('descriptionByte') ||
        first('additionalInfos') ||
        '';

    const dotacao = extractBudgetFromMetadata(md);

    const normalizedUrl = `https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities/topic-details/${encodeURIComponent(codigo)}`;

    const aviso: AvisoNormalized = {
        id: `HE-${codigo}`,
        codigo,
        titulo: stripHtml(titulo),
        programa: 'Horizon Europe',
        dataAbertura: normalizeDate(dataAberturaRaw),
        dataFecho: normalizeDate(dataFechoRaw),
        dotacao,
        status: normalizeStatus(normalizeDate(dataFechoRaw)),
        url: normalizedUrl,
        fonte: PORTAIS.HORIZON,
        scrapedAt: new Date().toISOString(),

        descricao: stripHtml(descricaoHtml).slice(0, 500),
        fundo: ['Horizon Europe'],

        documentos: [],
    };

    return aviso;
}

async function enrichHorizonWithTopicDetails(avisos: AvisoNormalized[], maxDocsPerAviso: number): Promise<void> {
    if (avisos.length === 0) return;

    console.log(`    📎 HORIZON: Enriquecendo documentos via topicDetails JSON...`);

    const CONCURRENCY = 6;
    for (let i = 0; i < avisos.length; i += CONCURRENCY) {
        const batch = avisos.slice(i, i + CONCURRENCY);
        await Promise.all(batch.map(async (aviso) => {
            const topicId = aviso.codigo;
            const details = await fetchTopicDetails(topicId);
            if (!details) return;

            const docs = extractDocumentsFromTopicDetails(details, { baseUrl: 'https://ec.europa.eu', maxDocs: maxDocsPerAviso });
            if (docs.length > 0) {
                aviso.documentos = docs;
            }
        }));

        if (i + CONCURRENCY < avisos.length) {
            await new Promise(r => setTimeout(r, 150));
        }
    }
}

/**
 * Fetch specific Horizon Europe calls
 */
function extractBudgetFromMetadata(md: any): number {
    const rawBudget = Array.isArray(md?.budgetOverview) ? md.budgetOverview[0] : md?.budgetOverview;
    if (typeof rawBudget === 'string') {
        try {
            const obj = JSON.parse(rawBudget);
            let total = 0;
            const walk = (v: any) => {
                if (typeof v === 'number') total += v;
                else if (Array.isArray(v)) v.forEach(walk);
                else if (v && typeof v === 'object') Object.values(v).forEach(walk);
            };
            walk(obj);
            return total;
        } catch {
            // fallback regex for "EUR 900 000"
            const m = rawBudget.match(/EUR\s*([\d\s.,]+)/i);
            if (m) return normalizeDotacao(m[1]);
        }
    }
    return 0;
}

/**
 * Fallback: Fetch from EU Open Data Portal
 */
async function fetchEUOpenData(avisos: AvisoNormalized[], maxItems: number): Promise<void> {
    if (maxItems <= 0) return;

    try {
        console.log('    📡 CORDIS: Tentando EU Open Data Portal...');

        const response = await axios.get('https://data.europa.eu/api/hub/search/search', {
            params: {
                q: 'horizon europe funding calls',
                limit: Math.min(maxItems, 20),
            },
            headers: { 'Accept': 'application/json' },
            timeout: 20000,
        });

        if (response.data?.result?.results) {
            console.log(`    📊 EU Open Data: ${response.data.result.results.length} datasets`);

            for (const result of response.data.result.results) {
                avisos.push({
                    id: `EUDATA-${result.id}`,
                    codigo: result.id || '',
                    titulo: result.title?.en || result.title || '',
                    programa: 'Horizon Europe',
                    dataAbertura: normalizeDate(result.issued),
                    dataFecho: '',
                    dotacao: 0,
                    status: 'Aberto',
                    url: result.landingPage || `https://data.europa.eu/data/datasets/${result.id}`,
                    fonte: PORTAIS.HORIZON,
                    scrapedAt: new Date().toISOString(),

                    descricao: stripHtml(result.description?.en || '').slice(0, 500),
                    fundo: ['Horizon Europe'],

                    documentos: [],
                });
            }
        }
    } catch (error: any) {
        console.log(`    ❌ EU Open Data: ${error.message}`);
    }
}

export default scrapeCORDIS;
