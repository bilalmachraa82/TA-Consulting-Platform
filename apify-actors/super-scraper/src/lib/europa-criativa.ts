/**
 * Europa Criativa (Creative Europe) Scraper
 *
 * Uses the SEDIA Search API and filters for call identifiers starting with "CREA-".
 */

import axios from 'axios';
import { AvisoNormalized, PORTAIS } from './types';
import { normalizeDate, stripHtml } from './normalizers';
import { extractDocumentsFromTopicDetails, fetchTopicDetails } from './funding-tenders';

export interface EuropaCriativaInput {
    maxItems: number;
    onlyOpen: boolean;
    includeDocuments?: boolean;
    maxDocumentsPerAviso?: number;
}

const SEDIA_API = 'https://api.tech.ec.europa.eu/search-api/prod/rest/search';
const OPEN_STATUS = '31094501';
const FORTHCOMING_STATUS = '31094502';
const CLOSED_STATUS = '31094503';

export async function scrapeEuropaCriativa(input: EuropaCriativaInput): Promise<AvisoNormalized[]> {
    console.log('    📡 Europa Criativa: Fetching via SEDIA API (CREA-*)...');

    const avisos: AvisoNormalized[] = [];
    const seen = new Set<string>();
    const now = new Date();

    const pageSize = 100;
    let pageNumber = 1;
    let totalResults = 0;

    while (avisos.length < input.maxItems) {
        const response = await axios.post(SEDIA_API, null, {
            params: {
                apiKey: 'SEDIA',
                text: 'CREA',
                status: input.onlyOpen ? `${OPEN_STATUS},${FORTHCOMING_STATUS}` : undefined,
                pageSize,
                pageNumber,
                sortBy: 'deadlineDate',
                sortOrder: 'ASC',
            },
            headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
            timeout: 30000,
        });

        const results = Array.isArray(response.data?.results) ? response.data.results : [];
        totalResults = parseInt(String(response.data?.totalResults || '0'), 10);
        if (results.length === 0) break;

        for (const item of results) {
            const meta = (item?.metadata || {}) as Record<string, unknown>;

            const identifier =
                firstString(meta['callIdentifier']) ||
                firstString(meta['identifier']) ||
                '';

            if (!identifier || !identifier.startsWith('CREA-')) continue;
            if (seen.has(identifier)) continue;
            seen.add(identifier);

            const rawStatus = firstString(meta['status']) || '';
            const dataAbertura = normalizeDate(firstString(meta['startDate']) || '');
            const dataFecho = normalizeDate(firstString(meta['deadlineDate']) || '');

            const titulo =
                firstString(meta['callTitle']) ||
                firstString(meta['title']) ||
                String(item?.title || item?.summary || identifier);

            const descricaoRaw =
                firstString(meta['descriptionByte']) ||
                firstString(meta['additionalInfos']) ||
                '';

            const hasDeadline = Boolean(dataFecho);
            const deadlineDate = hasDeadline ? new Date(dataFecho) : null;
            const hasValidDeadline = Boolean(deadlineDate && !Number.isNaN(deadlineDate.getTime()));
            const isFutureDeadline = Boolean(hasValidDeadline && deadlineDate && deadlineDate >= now);

            const status: AvisoNormalized['status'] =
                rawStatus === CLOSED_STATUS
                    ? 'Fechado'
                    : rawStatus === OPEN_STATUS || rawStatus === FORTHCOMING_STATUS
                        ? 'Aberto'
                        : hasDeadline
                            ? (isFutureDeadline ? 'Aberto' : 'Fechado')
                            : 'Desconhecido';

            if (input.onlyOpen && status !== 'Aberto') continue;

            avisos.push({
                id: `EC-${identifier}`,
                codigo: identifier,
                titulo: stripHtml(String(titulo)),
                programa: 'Europa Criativa',
                dataAbertura,
                dataFecho,
                dotacao: 0,
                status,
                url: `https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities/topic-details/${identifier}`,
                fonte: PORTAIS.EUROPA_CRIATIVA,
                scrapedAt: new Date().toISOString(),
                descricao: stripHtml(String(descricaoRaw)).slice(0, 800) || undefined,
                documentos: [],
            });

            if (avisos.length >= input.maxItems) break;
        }

        if (results.length < pageSize) break;
        pageNumber += 1;
        if (totalResults > 0 && pageNumber > Math.ceil(totalResults / pageSize)) break;
        await new Promise(r => setTimeout(r, 200));
    }

    console.log(`    ✅ Europa Criativa: ${avisos.length} calls extraídas`);

    if (input.includeDocuments) {
        await enrichEuropaCriativaWithTopicDetails(avisos, input.maxDocumentsPerAviso ?? 25);
    }

    return avisos;
}

function firstString(value: unknown): string | undefined {
    if (!value) return undefined;
    if (typeof value === 'string') return value;
    if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
    return undefined;
}

async function enrichEuropaCriativaWithTopicDetails(avisos: AvisoNormalized[], maxDocsPerAviso: number): Promise<void> {
    if (avisos.length === 0) return;

    console.log(`    📎 Europa Criativa: Enriquecendo documentos via topicDetails JSON...`);

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
