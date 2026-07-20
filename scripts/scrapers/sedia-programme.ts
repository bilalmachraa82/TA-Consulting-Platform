/**
 * Scraper genérico SEDIA (Funding & Tenders Portal da UE).
 *
 * Generaliza o padrão do super-scraper/europa-criativa.ts para qualquer
 * programa da UE cujos identifiers de call sigam o padrão `<PREFIX>-...`
 * (DIGITAL-, LIFE-, CREA-, HORIZON-, EMFAF-, ...). Uma única fonte de
 * verdade para todos os programas EU fora do Horizon/CREA já cobertos
 * pelo super-scraper.
 */

import axios from 'axios';

export interface SEDIAProgrammeInput {
    /** Prefixo dos call identifiers, sem hífen final (ex.: "DIGITAL", "LIFE") */
    prefix: string;
    /** Nome legível do programa gravado em Aviso.programa */
    programa: string;
    maxItems: number;
    onlyOpen: boolean;
    /**
     * Limite de páginas SEDIA a varrer (default 20 = 2.000 resultados).
     * Necessário porque prefixos como "LIFE" são palavras comuns no texto
     * pesquisado — sem limite, a paginação varre o índice inteiro.
     */
    maxPages?: number;
}

export interface ScrapedAvisoOutput {
    id: string;
    codigo: string;
    titulo: string;
    programa: string;
    dataAbertura?: string;
    dataFecho?: string;
    dotacao: number;
    status: string;
    url: string;
    fonte: string;
    descricao?: string;
}

const SEDIA_API = 'https://api.tech.ec.europa.eu/search-api/prod/rest/search';
const OPEN_STATUS = '31094501';
const FORTHCOMING_STATUS = '31094502';
const CLOSED_STATUS = '31094503';

function firstString(value: unknown): string | undefined {
    if (!value) return undefined;
    if (typeof value === 'string') return value;
    if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
    return undefined;
}

function stripHtml(value: string): string {
    return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export async function scrapeSEDIAProgramme(input: SEDIAProgrammeInput): Promise<ScrapedAvisoOutput[]> {
    console.log(`    📡 ${input.programa}: Fetching via SEDIA API (${input.prefix}-*)...`);

    const avisos: ScrapedAvisoOutput[] = [];
    const seen = new Set<string>();
    const now = new Date();
    const pageSize = 100;
    const maxPages = input.maxPages ?? 20;
    let pageNumber = 1;

    while (avisos.length < input.maxItems && pageNumber <= maxPages) {
        const response = await axios.post(SEDIA_API, null, {
            params: {
                apiKey: 'SEDIA',
                text: input.prefix,
                status: input.onlyOpen ? `${OPEN_STATUS},${FORTHCOMING_STATUS}` : undefined,
                pageSize,
                pageNumber,
                sortBy: 'deadlineDate',
                sortOrder: 'ASC',
            },
            headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' },
            timeout: 30000,
        });

        const results: unknown[] = Array.isArray(response.data?.results) ? response.data.results : [];
        const totalResults = parseInt(String(response.data?.totalResults || '0'), 10);
        if (results.length === 0) break;

        for (const item of results) {
            const record = item as { metadata?: Record<string, unknown>; title?: unknown; summary?: unknown };
            const meta = record.metadata || {};

            const identifier = firstString(meta['callIdentifier']) || firstString(meta['identifier']) || '';
            if (!identifier || !identifier.toUpperCase().startsWith(`${input.prefix.toUpperCase()}-`)) continue;
            if (seen.has(identifier)) continue;
            seen.add(identifier);

            const rawStatus = firstString(meta['status']) || '';
            const dataAbertura = firstString(meta['startDate']) || undefined;
            const dataFecho = firstString(meta['deadlineDate']) || undefined;

            const titulo =
                firstString(meta['callTitle']) ||
                firstString(meta['title']) ||
                String(record.title || record.summary || identifier);

            const deadline = dataFecho ? new Date(dataFecho) : null;
            const isFutureDeadline = Boolean(deadline && !Number.isNaN(deadline.getTime()) && deadline >= now);
            const status =
                rawStatus === CLOSED_STATUS
                    ? 'Fechado'
                    : rawStatus === OPEN_STATUS || rawStatus === FORTHCOMING_STATUS
                        ? 'Aberto'
                        : dataFecho
                            ? (isFutureDeadline ? 'Aberto' : 'Fechado')
                            : 'Desconhecido';

            if (input.onlyOpen && status !== 'Aberto') continue;

            avisos.push({
                id: `${input.prefix}-${identifier}`,
                codigo: identifier,
                titulo: stripHtml(String(titulo)),
                programa: input.programa,
                dataAbertura,
                dataFecho,
                dotacao: 0,
                status,
                url: `https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities/topic-details/${identifier}`,
                fonte: input.programa,
                descricao: stripHtml(String(firstString(meta['descriptionByte']) || '')).slice(0, 800) || undefined,
            });

            if (avisos.length >= input.maxItems) break;
        }

        if (results.length < pageSize) break;
        pageNumber += 1;
        if (totalResults > 0 && pageNumber > Math.ceil(totalResults / pageSize)) break;
        await new Promise((r) => setTimeout(r, 200));
    }

    console.log(`    ✅ ${input.programa}: ${avisos.length} calls extraídas`);
    return avisos;
}
