/**
 * PEPAC (PEPACC) Scraper
 *
 * Fonte principal: https://pepacc.pt (PEPAC no Continente)
 * API pública: https://pepacc.pt/wp-json/pepac/v1/competitions
 *
 * - status=current  → concursos abertos
 * - status=archive  → concursos encerrados
 *
 * Esta fonte é mais completa e estruturada para avisos PEPAC do que o IFAP RSS.
 */

import axios from 'axios';
import { AvisoNormalized, Documento, PORTAIS } from './types';
import {
    normalizeDate,
    normalizeStatus,
    stripHtml,
    extractDatesFromText,
    decodeHtmlEntities,
} from './normalizers';

const PEPACC_API_BASE = 'https://pepacc.pt/wp-json/pepac/v1/competitions';

export interface PEPACInput {
    maxItems: number;
    onlyOpen: boolean;
    // Lista curada de páginas PEPAC adicionais (opcional)
    sourceUrls?: string[];
    // Cookie header opcional (não necessário para pepacc.pt, mas útil para fontes privadas)
    cookieHeader?: string;
}

type PepaccApiItem = {
    id: number;
    title: string;
    created_on?: string;
    modified_on?: string;
    excerpt?: string;
    link: string;
    final_date?: string;
};

type CuratedItem = {
    title: string;
    link: string;
    forced: boolean;
};

/**
 * Scrape PEPAC avisos via pepacc.pt API + URLs curadas opcionais
 */
export async function scrapePEPAC(input: PEPACInput): Promise<AvisoNormalized[]> {
    const avisos: AvisoNormalized[] = [];
    const seen = new Set<string>();

    const statuses = input.onlyOpen ? ['current'] : ['current', 'archive'];

    console.log('    📡 PEPAC/PEPACC: Fetching concursos via API...');

    try {
        for (const status of statuses) {
            let page = 1;
            let pages = 1;
            const perPage = 50;

            while (page <= pages && avisos.length < input.maxItems) {
                const url = `${PEPACC_API_BASE}?page=${page}&per_page=${perPage}&status=${status}`;
                const response = await axios.post(url, null, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0',
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    timeout: 20000,
                });

                const data: PepaccApiItem[] = response.data?.data || [];
                pages = parseInt(response.data?.pages || '1', 10);

                for (const item of data) {
                    const aviso = parsePepaccItem(item, status);
                    if (!aviso) continue;

                    const key = aviso.codigo || aviso.url;
                    if (seen.has(key)) continue;
                    seen.add(key);
                    avisos.push(aviso);
                    if (avisos.length >= input.maxItems) break;
                }

                page += 1;
            }
        }

        // Adicionar URLs curadas, se fornecidas
        if (input.sourceUrls && input.sourceUrls.length > 0 && avisos.length < input.maxItems) {
            console.log(`    🔗 PEPAC/PEPACC: Adicionando ${input.sourceUrls.length} páginas curadas...`);
            for (const url of input.sourceUrls) {
                const curated = await fetchCuratedItem(url, input.cookieHeader);
                if (!curated) continue;
                const aviso = parseCuratedItem(curated);
                const key = aviso.codigo || aviso.url;
                if (seen.has(key)) continue;
                seen.add(key);
                avisos.push(aviso);
                if (avisos.length >= input.maxItems) break;
            }
        }

        // Extrair documentos reais das páginas dos concursos (há muitos PDFs no pepacc.pt)
        await enrichPepaccDocuments(avisos, input.cookieHeader);

        console.log(`    ✅ PEPAC/PEPACC: ${avisos.length} avisos extraídos`);
    } catch (error: any) {
        console.log(`    ❌ PEPAC/PEPACC: Erro - ${error.message}`);
    }

    return avisos.slice(0, input.maxItems);
}

function parsePepaccItem(item: PepaccApiItem, status: string): AvisoNormalized | null {
    if (!item?.title || !item?.link) return null;

    const titulo = decodeHtmlEntities(item.title);
    const excerpt = item.excerpt || '';

    // Datas principais vêm do excerpt + final_date
    const datesFromExcerpt = extractDatesFromText(excerpt);
    const aberturaFromCreated = normalizePepaccDate(item.created_on) || normalizePepaccDate(item.modified_on);
    const fechoFromFinal = item.final_date
        ? normalizeDate(String(item.final_date).split(' ')[0])
        : '';

    const dataAbertura = datesFromExcerpt.abertura || aberturaFromCreated || '';
    const dataFecho = datesFromExcerpt.fecho || fechoFromFinal || '';

    const statusNorm =
        dataFecho ? normalizeStatus(dataFecho) : (status === 'current' ? 'Aberto' : 'Fechado');

    const aviso: AvisoNormalized = {
        id: `PEPACC-${item.id}`,
        codigo: `PEPACC-${item.id}`,
        titulo: stripHtml(titulo),
        programa: 'PEPAC Continente',
        dataAbertura,
        dataFecho,
        dotacao: 0,
        status: statusNorm,
        url: item.link,
        fonte: PORTAIS.PEPAC,
        scrapedAt: new Date().toISOString(),
        descricao: stripHtml(excerpt),
        documentos: [] as Documento[],
    };

    return aviso;
}

function normalizePepaccDate(input?: string): string {
    if (!input) return '';
    const cleaned = input.replace(',', '').trim();
    const m = cleaned.match(/(\d{1,2})\s*de\s*(\w+)\s*(\d{4})/i);
    if (m) {
        return normalizeDate(`${m[1]} de ${m[2]} de ${m[3]}`);
    }
    return normalizeDate(cleaned);
}

function parseCuratedItem(item: CuratedItem): AvisoNormalized {
    return {
        id: `PEPAC-${canonicalItemKey(item.link)}`,
        codigo: canonicalItemKey(item.link),
        titulo: stripHtml(item.title),
        programa: 'PEPAC',
        dataAbertura: '',
        dataFecho: '',
        dotacao: 0,
        status: 'Desconhecido',
        url: item.link,
        fonte: PORTAIS.PEPAC,
        scrapedAt: new Date().toISOString(),
        documentos: [],
        descricao: undefined,
    };
}

function canonicalItemKey(link: string): string {
    const m = link.match(/\/content\/id\/(\d+)/i) || link.match(/id\/(\d+)/i);
    if (m) return m[1];
    const slug = link.split('/').filter(Boolean).slice(-1)[0];
    return slug || link;
}

async function fetchCuratedItem(url: string, cookieHeader?: string): Promise<CuratedItem | null> {
    try {
        const headers: Record<string, string> = { 'User-Agent': 'Mozilla/5.0' };
        if (cookieHeader) headers['Cookie'] = cookieHeader;

        const { data: htmlRaw } = await axios.get(url, {
            headers,
            timeout: 20000,
        });

        const html = String(htmlRaw)
            .replace(/<script[\s\S]*?<\/script>/gi, ' ')
            .replace(/<style[\s\S]*?<\/style>/gi, ' ')
            .replace(/<!--[\s\S]*?-->/g, ' ');

        let title = '';
        const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
        if (h1Match) title = stripHtml(h1Match[1]);
        if (!title) {
            const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
            if (titleMatch) title = stripHtml(titleMatch[1]);
        }
        if (!title) title = url;

        return { title: title.slice(0, 200), link: url, forced: true };
    } catch {
        return null;
    }
}

async function enrichPepaccDocuments(avisos: AvisoNormalized[], cookieHeader?: string): Promise<void> {
    const targets = avisos.filter(a => !a.documentos || a.documentos.length === 0);
    if (targets.length === 0) return;

    const maxConcurrent = 4;
    for (let i = 0; i < targets.length; i += maxConcurrent) {
        const batch = targets.slice(i, i + maxConcurrent);
        await Promise.all(batch.map(async (aviso) => {
            try {
                const headers: Record<string, string> = { 'User-Agent': 'Mozilla/5.0' };
                if (cookieHeader) headers['Cookie'] = cookieHeader;

                const { data: htmlRaw } = await axios.get(aviso.url, {
                    headers,
                    timeout: 20000,
                });

                const html = String(htmlRaw)
                    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
                    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
                    .replace(/<!--[\s\S]*?-->/g, ' ');

                const docs = extractDocumentsFromHtml(html, aviso.url);
                if (docs.length > 0) {
                    aviso.documentos = docs;
                }
            } catch {
                // ignore page fetch failures
            }
        }));

        if (i + maxConcurrent < targets.length) {
            await new Promise(r => setTimeout(r, 250));
        }
    }
}

function extractDocumentsFromHtml(html: string, baseUrl: string): Documento[] {
    const docs: Documento[] = [];
    const seen = new Set<string>();

    const hrefMatches = html.matchAll(/href=["']([^"']+)["']/gi);
    for (const match of hrefMatches) {
        const href = match[1];
        const docMatch = href.match(/\.(pdf|docx?|xlsx?|zip|rar)(?:\?|#|$)/i);
        if (!docMatch) continue;

        let fullUrl = href;
        try {
            if (href.startsWith('/')) {
                const urlObj = new URL(baseUrl);
                fullUrl = `${urlObj.origin}${href}`;
            } else if (!href.startsWith('http')) {
                fullUrl = new URL(href, baseUrl).href;
            }
        } catch {
            continue;
        }

        if (seen.has(fullUrl)) continue;
        seen.add(fullUrl);

        const format = docMatch[1].toLowerCase();
        const filename = decodeURIComponent(fullUrl.split('/').pop()?.split('?')[0] || `documento.${format}`);

        docs.push({
            id: `PEPACC-doc-${docs.length + 1}`,
            nome: filename,
            tipo: format.toUpperCase(),
            url: fullUrl,
            formato: format,
            path: '',
        });

        if (docs.length >= 20) break;
    }

    return docs;
}

export default scrapePEPAC;
