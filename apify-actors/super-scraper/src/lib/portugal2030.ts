/**
 * Portugal 2030 Scraper (simplified, benchmark-ready)
 *
 * Uses WordPress REST endpoint `/wp/v2/aviso-2024` which includes ACF fields.
 * This is sufficient to fetch real open avisos and (when available) resolve the main PDF.
 */

import axios from 'axios';
import { AvisoNormalized, Documento, PORTAIS } from './types';
import {
    normalizeDate,
    normalizeDotacao,
    normalizeStatus,
    decodeHtmlEntities,
    stripHtml,
    toArray,
} from './normalizers';

export interface Portugal2030Input {
    maxItems: number;
    onlyOpen: boolean;
}

type WpPost = {
    id: number;
    link?: string;
    date?: string;
    title?: { rendered?: string };
    excerpt?: { rendered?: string };
    content?: { rendered?: string };
    acf?: Record<string, unknown>;
};

const WP_AVISO_ENDPOINT = 'https://portugal2030.pt/wp-json/wp/v2/aviso-2024';
const WP_MEDIA_ENDPOINT = 'https://portugal2030.pt/wp-json/wp/v2/media';

/**
 * Scrape Portugal 2030 avisos (open by default).
 */
export async function scrapePortugal2030(input: Portugal2030Input): Promise<AvisoNormalized[]> {
    console.log('    📡 Portugal 2030: Fetching avisos via WP REST...');

    const avisos: AvisoNormalized[] = [];
    const pdfCache = new Map<number, string>();

    const perPage = 100;
    const maxPages = Math.max(1, Math.ceil(input.maxItems / perPage));

    for (let page = 1; page <= maxPages; page++) {
        const resp = await axios.get<WpPost[]>(WP_AVISO_ENDPOINT, {
            params: { per_page: perPage, page, orderby: 'date', order: 'desc' },
            headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
            timeout: 30000,
        });

        const posts = Array.isArray(resp.data) ? resp.data : [];
        if (posts.length === 0) break;

        for (const post of posts) {
            const aviso = await parsePortugal2030Post(post, pdfCache);
            if (!aviso) continue;
            if (input.onlyOpen && aviso.status !== 'Aberto') continue;

            avisos.push(aviso);
            if (avisos.length >= input.maxItems) break;
        }

        if (avisos.length >= input.maxItems) break;
        if (posts.length < perPage) break;
        await new Promise(r => setTimeout(r, 150));
    }

    console.log(`    ✅ Portugal 2030: ${avisos.length} avisos extraídos`);
    return avisos;
}

async function parsePortugal2030Post(
    post: WpPost,
    pdfCache: Map<number, string>
): Promise<AvisoNormalized | null> {
    const acf = post.acf || {};

    const titulo = stripHtml(decodeHtmlEntities(post.title?.rendered || '')).trim();
    if (!titulo) return null;

    const codigoRaw = typeof acf['codigo'] === 'string' ? acf['codigo'] : '';
    const codigo = codigoRaw || `PT2030-${post.id}`;

    const programaArr = (toArray(acf['programa']) || []).map(v => String(v)).filter(Boolean);
    const programa = programaArr.length > 0 ? programaArr.join(', ') : 'Portugal 2030';

    const dataAbertura = normalizeDate(typeof acf['data_inicio'] === 'string' ? acf['data_inicio'] : post.date);
    const dataFecho = normalizeDate(typeof acf['data_fim'] === 'string' ? acf['data_fim'] : '');

    const dotacao = normalizeDotacao(acf['dotacao'] as any);
    const status = normalizeStatus(dataFecho || dataAbertura);

    const beneficiarios = (toArray(acf['beneficiario']) || []).map(v => String(v)).filter(Boolean);
    const modalidade = (toArray(acf['modalidade']) || []).map(v => String(v)).filter(Boolean);
    const fundos = (toArray(acf['fundo']) || []).map(v => String(v)).filter(Boolean);

    const taxaRaw = acf['comparticipacao'];
    const taxaNum = typeof taxaRaw === 'number' ? taxaRaw : undefined;

    const url = post.link || `https://portugal2030.pt/avisos/?codigo=${encodeURIComponent(codigo)}`;

    const documentos: Documento[] = [];
    const pdfId = typeof acf['pdf'] === 'number' ? (acf['pdf'] as number) : undefined;
    if (pdfId) {
        const pdfUrl = await resolvePdfUrl(pdfId, pdfCache);
        if (pdfUrl) {
            documentos.push({
                id: String(pdfId),
                nome: `${codigo}.pdf`,
                tipo: 'Aviso',
                url: pdfUrl,
                formato: 'pdf',
            });
        }
    }

    const descricao =
        stripHtml(decodeHtmlEntities(post.excerpt?.rendered || '')) ||
        stripHtml(decodeHtmlEntities(post.content?.rendered || '')).slice(0, 800);

    return {
        id: `PT2030-${post.id}`,
        codigo,
        titulo,
        programa,
        dataAbertura,
        dataFecho,
        dotacao,
        status,
        url,
        fonte: PORTAIS.PORTUGAL2030,
        scrapedAt: new Date().toISOString(),
        descricao: descricao || undefined,
        beneficiarios: beneficiarios.length > 0 ? beneficiarios : undefined,
        modalidade: modalidade.length > 0 ? modalidade : undefined,
        fundo: fundos.length > 0 ? fundos : undefined,
        taxa: taxaNum,
        documentos,
    };
}

async function resolvePdfUrl(mediaId: number, cache: Map<number, string>): Promise<string | undefined> {
    if (cache.has(mediaId)) return cache.get(mediaId);

    try {
        const resp = await axios.get(`${WP_MEDIA_ENDPOINT}/${mediaId}`, {
            headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
            timeout: 20000,
        });

        const sourceUrl = resp.data?.source_url;
        const url = typeof sourceUrl === 'string' ? sourceUrl : undefined;
        if (url) cache.set(mediaId, url);
        return url;
    } catch {
        return undefined;
    }
}
