/**
 * PRR (Plano de Recuperação e Resiliência) Scraper
 *
 * Fonte principal: UI "candidaturas-prr" com endpoint admin-ajax:
 *   POST https://recuperarportugal.gov.pt/wp-admin/admin-ajax.php
 *   action=getCandidaturas
 *
 * Este endpoint devolve os mesmos dados que a UI (componentes, beneficiários,
 * estado, tipologia), e um painel HTML por aviso.
 *
 * Fallback: WordPress REST /candidatura (mantido para resiliência).
 *
 * Nota: dotação raramente existe no HTML; fica 0 salvo quando detectável.
 */

import axios from 'axios';
import { AvisoNormalized, Documento, PORTAIS } from './types';
import {
    normalizeDate,
    normalizeDotacao,
    normalizeStatus,
    stripHtml,
    decodeHtmlEntities,
    extractDatesFromText,
} from './normalizers';

const AJAX_URL = 'https://recuperarportugal.gov.pt/wp-admin/admin-ajax.php';
const REST_BASE_URL = 'https://recuperarportugal.gov.pt/wp-json/wp/v2';

export interface PRRInput {
    maxItems: number;
    onlyOpen: boolean;
}

type PRRAjaxItem = {
    id: number;
    url: string;
    componente?: { value?: string; label?: string };
    sub_componente?: { name?: string };
    beneficiario?: Array<{ value?: string; label?: string }>;
    avisos?: string; // 'aberto' | 'fechado'
    tipo?: { value?: string; label?: string };
    content?: {
        title?: string;
        panel?: string;
    };
};

/**
 * Scrape PRR candidaturas
 */
export async function scrapePRR(input: PRRInput): Promise<AvisoNormalized[]> {
    // 1) Primary: admin-ajax UI endpoint
    try {
        console.log('    📡 PRR: Fetching candidaturas via admin-ajax...');
        const items = await fetchPRRAjaxItems(input.onlyOpen);
        const avisos = items
            .map(parsePRRAjaxItem)
            .filter(Boolean) as AvisoNormalized[];

        if (avisos.length > 0) {
            console.log(`    ✅ PRR: ${avisos.length} avisos extraídos (ajax)`);
            return avisos.slice(0, input.maxItems);
        }
        console.log('    ⚠️ PRR: admin-ajax retornou 0 avisos, a usar fallback...');
    } catch (error: any) {
        console.log(`    ⚠️ PRR: admin-ajax falhou - ${error.message}`);
    }

    // 2) Fallback: REST /candidatura
    return scrapePRRRest(input);
}

async function fetchPRRAjaxItems(onlyOpen: boolean): Promise<PRRAjaxItem[]> {
    const params = new URLSearchParams();
    params.set('action', 'getCandidaturas');
    params.append('params[tipo][]', 'aviso_abr_cand');
    if (onlyOpen) {
        params.append('params[avisos][]', 'aberto');
    }

    // Componentes C1..C21
    for (let i = 1; i <= 21; i++) {
        params.append('params[componente][]', `C${i}`);
    }

    // Beneficiários (todos)
    const beneficiarios = [
        'familias',
        'solidariaSocial',
        'empresas',
        'tecnologico',
        'ensinosuperior',
        'escolas',
        'autarquias',
        'entidadespublicas',
        'empresaspublicas',
    ];
    for (const b of beneficiarios) {
        params.append('params[beneficiarios][]', b);
    }

    const response = await axios.post(AJAX_URL, params.toString(), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'User-Agent': 'Mozilla/5.0',
            'Accept': 'application/json, text/plain, */*',
        },
        timeout: 30000,
    });

    const data = response.data;
    if (Array.isArray(data)) return data as PRRAjaxItem[];

    if (typeof data === 'string') {
        try {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed)) return parsed as PRRAjaxItem[];
        } catch {
            // ignore
        }
    }

    return [];
}

/**
 * Parse PRR ajax item to AvisoNormalized
 */
function parsePRRAjaxItem(item: PRRAjaxItem): AvisoNormalized | null {
    const tituloRaw = item.content?.title || '';
    if (!tituloRaw) return null;

    const titulo = stripHtml(decodeHtmlEntities(tituloRaw));
    const codigo = extractPRRCodigo(titulo) || `PRR-${item.id}`;

    const panelHtml = item.content?.panel || '';
    const panelText = stripHtml(panelHtml);

    // Datas de submissão (abertura/fecho)
    let dataAbertura = '';
    let dataFecho = '';
    const interval = extractIntervalDates(panelText);
    if (interval) {
        dataAbertura = interval.abertura;
        dataFecho = interval.fecho;
    } else if (/submiss[aã]o|candidatur|prazo/i.test(panelText)) {
        const extracted = extractDatesFromText(panelText);
        dataAbertura = extracted.abertura;
        dataFecho = extracted.fecho;
    }

    const dataAviso = extractAvisoPublicationDate(panelText);
    const dotacao = extractDotacaoFromText(panelText);
    const documentos = extractPRRDocuments(panelHtml);

    const componenteLabel =
        item.componente?.label ||
        item.componente?.value ||
        'PRR';

    const subLinha = item.sub_componente?.name || undefined;

    const beneficiarios =
        Array.isArray(item.beneficiario)
            ? item.beneficiario
                .map(b => b.label || b.value)
                .filter((v): v is string => Boolean(v))
            : undefined;

    let statusNorm: AvisoNormalized['status'] =
        item.avisos === 'fechado'
            ? 'Fechado'
            : 'Aberto';

    if (dataFecho) {
        statusNorm = normalizeStatus(normalizeDate(dataFecho));
    }

    return {
        id: `PRR-${item.id}`,
        codigo,
        titulo,
        programa: 'Plano de Recuperação e Resiliência',
        dataAbertura: normalizeDate(dataAbertura),
        dataFecho: normalizeDate(dataFecho),
        dotacao,
        status: statusNorm,
        url: item.url || '',
        fonte: PORTAIS.PRR,
        scrapedAt: new Date().toISOString(),

        descricao: panelText ? panelText.slice(0, 800) : undefined,
        fundo: ['PRR'],
        beneficiarios,
        objetivoEstrategico: componenteLabel,
        objetivoEspecifico: subLinha,

        // Campos específicos PRR/UI
        linha: componenteLabel,
        subLinha,
        dataAviso,

        documentos,
    };
}

function extractPRRCodigo(titulo: string): string | '' {
    const m = titulo.match(/(\d+\s*\/\s*C\d{1,2}-i\d{1,2}(?:\.\d+)?(?:-[A-Z0-9]+)*\s*\/\s*\d{4})/i);
    if (m) return m[1].replace(/\s+/g, '');
    return '';
}

function extractAvisoPublicationDate(text: string): string {
    const DATE_PART = '(?:\\d{1,2}[\\/\\-\\.]\\d{1,2}[\\/\\-\\.]\\d{2,4}|\\d{1,2}\\s*de\\s*\\w+(?:\\s*de\\s*\\d{4})?)';
    const re = new RegExp(`(Data[^:]{0,80}):\\s*(${DATE_PART})`, 'ig');
    let last = '';
    for (const m of text.matchAll(re)) {
        const label = (m[1] || '').toLowerCase();
        if (label.includes('aviso') || label.includes('publica') || label.includes('republica')) {
            const norm = normalizeDate(m[2]);
            if (norm) last = norm;
        }
    }
    return last;
}

function extractDotacaoFromText(text: string): number {
    const m = text.match(/(?:dotação|envelope|montante|orçamento)[:\s]*([\d\s.,]+)\s*(?:€|eur|euros?|m€)/i);
    if (!m) return 0;
    let value = m[1].replace(/\s/g, '');
    if (/m€|milh/i.test(text)) {
        const num = parseFloat(value.replace(',', '.'));
        if (!isNaN(num)) return num * 1_000_000;
    }
    return normalizeDotacao(value);
}

// ============================================================================
// Fallback: WP REST /candidatura
// ============================================================================

async function scrapePRRRest(input: PRRInput): Promise<AvisoNormalized[]> {
    const avisos: AvisoNormalized[] = [];

    console.log('    📡 PRR: Fallback REST /candidatura...');

    try {
        const headResponse = await axios.head(`${REST_BASE_URL}/candidatura?per_page=1`, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 15000,
        });

        const total = parseInt(headResponse.headers['x-wp-total'] || '0', 10);
        const totalPages = parseInt(headResponse.headers['x-wp-totalpages'] || '1', 10);
        console.log(`    📊 PRR REST: ${total} candidaturas em ${totalPages} páginas`);

        const maxPages = Math.min(totalPages, Math.ceil(input.maxItems / 100));

        for (let page = 1; page <= maxPages; page++) {
            const response = await axios.get(`${REST_BASE_URL}/candidatura`, {
                params: {
                    per_page: 100,
                    page,
                    orderby: 'date',
                    order: 'desc',
                },
                headers: { 'User-Agent': 'Mozilla/5.0' },
                timeout: 30000,
            });

            for (const post of response.data) {
                const aviso = parsePRRRestPost(post);
                if (!aviso) continue;
                if (input.onlyOpen && aviso.status !== 'Aberto') continue;
                avisos.push(aviso);
            }

            if (page < maxPages) {
                await new Promise(r => setTimeout(r, 300));
            }
        }

        console.log(`    ✅ PRR REST: ${avisos.length} avisos extraídos`);
    } catch (error: any) {
        console.log(`    ❌ PRR REST: Erro - ${error.message}`);
    }

    return avisos;
}

function parsePRRRestPost(post: any): AvisoNormalized | null {
    if (!post.title?.rendered) return null;

    const titulo = decodeHtmlEntities(post.title.rendered);
    const content = post.content?.rendered || '';
    const excerpt = post.excerpt?.rendered || '';

    const codigo = extractPRRCodigo(titulo) || `PRR-${post.id}`;

    const parsedData = parsePRRContentFromHtml(content);
    const documentos = extractPRRDocuments(content);

    return {
        id: `PRR-${post.id}`,
        codigo,
        titulo: stripHtml(titulo),
        programa: 'Plano de Recuperação e Resiliência',
        dataAbertura: normalizeDate(parsedData.dataAbertura) || normalizeDate(post.date),
        dataFecho: normalizeDate(parsedData.dataFecho) || '',
        dotacao: normalizeDotacao(parsedData.dotacao),
        status: normalizeStatus(parsedData.dataFecho),
        url: post.link || '',
        fonte: PORTAIS.PRR,
        scrapedAt: new Date().toISOString(),

        descricao: stripHtml(excerpt).slice(0, 500),
        fundo: ['PRR'],
        natureza: parsedData.natureza,
        objetivoEspecifico: parsedData.componente,
        documentos,
    };
}

function parsePRRContentFromHtml(html: string): {
    dataAbertura?: string;
    dataFecho?: string;
    dotacao?: string;
    natureza?: string;
    componente?: string;
} {
    const result: any = {};
    const text = stripHtml(html);

    const interval = extractIntervalDates(text);
    if (interval) {
        result.dataAbertura = interval.abertura;
        result.dataFecho = interval.fecho;
    } else if (/submiss[aã]o|candidatur|prazo/i.test(text)) {
        const { abertura, fecho } = extractDatesFromText(text);
        if (abertura) result.dataAbertura = abertura;
        if (fecho) result.dataFecho = fecho;
    }

    const dotacaoMatch = text.match(/(?:dotação|envelope|montante)[:\s]*([\d\s.,]+)\s*(?:€|eur|euros?|m€)/i);
    if (dotacaoMatch) result.dotacao = dotacaoMatch[1];

    const componenteMatch = text.match(/(?:componente|C\d+)[:\s-]*([^\<\n]{5,50})/i);
    if (componenteMatch) result.componente = stripHtml(componenteMatch[1]).trim();

    return result;
}

/**
 * Try to extract explicit candidature interval dates from PRR text.
 * Handles patterns like:
 *  - "decorre de dia X até ... limite Y"
 *  - "de X até Y"
 *  - "entre o dia X e Y"
 *  - "a partir do dia X ... até Y"
 */
function extractIntervalDates(text: string): { abertura: string; fecho: string } | null {
    const DATE_PART = '(?:\\d{1,2}[\\/\\-\\.]\\d{1,2}[\\/\\-\\.]\\d{2,4}|\\d{1,2}\\s*de\\s*\\w+(?:\\s*de\\s*\\d{4})?)';

    const patterns = [
        new RegExp(`decorre\\s+de\\s+(?:dia\\s+)?(${DATE_PART})[\\s\\S]{0,100}?até[\\s\\S]{0,120}?(${DATE_PART})`, 'ig'),
        new RegExp(`a\\s+partir\\s+do\\s+dia\\s+(${DATE_PART})[\\s\\S]{0,80}?até\\s+(${DATE_PART})`, 'ig'),
        new RegExp(`de\\s+(${DATE_PART})\\s+(?:até|a)\\s+(${DATE_PART})`, 'ig'),
        new RegExp(`entre\\s+(?:os\\s+dias|o\\s+dia)?\\s*(${DATE_PART})[\\s\\S]{0,60}?\\se\\s+[\\s\\S]{0,60}?(${DATE_PART})`, 'ig'),
    ];

    const intervals: { abertura: string; fecho: string }[] = [];

    for (const re of patterns) {
        for (const m of text.matchAll(re)) {
            const rawAbertura = m[1]?.trim() || '';
            const rawFecho = m[2]?.trim() || '';

            let abertura = normalizeDate(rawAbertura);
            const fallbackYear = abertura ? abertura.slice(0, 4) : String(new Date().getFullYear());
            if (!abertura) abertura = normalizeDateWithFallbackYear(rawAbertura, fallbackYear);

            let fecho = normalizeDate(rawFecho);
            if (!fecho) fecho = normalizeDateWithFallbackYear(rawFecho, fallbackYear);

            if (abertura || fecho) {
                intervals.push({ abertura, fecho });
            }
        }
    }

    if (intervals.length === 0) return null;

    // Escolher o intervalo com fecho mais tardio (republicações)
    intervals.sort((a, b) => (a.fecho || '').localeCompare(b.fecho || ''));
    return intervals[intervals.length - 1];
}

function normalizeDateWithFallbackYear(raw: string, year: string): string {
    if (!raw) return '';

    // Portuguese without year: "10 de dezembro"
    const ptNoYear = raw.match(/(\d{1,2})\s*de\s*(\w+)/i);
    if (ptNoYear) {
        return normalizeDate(`${ptNoYear[1]} de ${ptNoYear[2]} de ${year}`);
    }

    // Numeric without year: "10/12"
    const numNoYear = raw.match(/(\d{1,2})[\\/\\-\\.](\d{1,2})/);
    if (numNoYear) {
        const [, d, m] = numNoYear;
        return `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }

    return '';
}

/**
 * Extract document links from PRR content
 */
function extractPRRDocuments(html: string): Documento[] {
    const docs: Documento[] = [];

    // Match PDF and document links
    const linkRegex = /href="([^"]+\.(pdf|docx?|xlsx?|zip))"[^>]*>([^<]+)/gi;
    let match;

    while ((match = linkRegex.exec(html)) !== null) {
        const url = match[1];
        const format = match[2].toLowerCase();
        let name = stripHtml(match[3]).trim();

        // Improve naming for generic text
        const genericTerms = ['aqui', 'ver', 'clique', 'download', 'pdf', 'documento', 'ficheiro', 'link'];
        if (!name || name.length < 5 || genericTerms.includes(name.toLowerCase())) {
            // Try to get filename from URL
            const filename = url.split('/').pop()?.split('#')[0].split('?')[0];
            if (filename) {
                // Remove extension and decode
                try {
                    name = decodeURIComponent(filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
                } catch {
                    name = filename;
                }
            } else {
                name = `Documento ${format.toUpperCase()}`;
            }
        }

        // Capitalize first letter
        name = name.charAt(0).toUpperCase() + name.slice(1);

        // Skip duplicates
        if (docs.some(d => d.url === url)) continue;

        docs.push({
            id: `PRR-doc-${docs.length}`,
            nome: name,
            tipo: format === 'pdf' ? 'PDF' : 'Anexo',
            url,
            formato: format,
        });
    }

    return docs;
}

export default scrapePRR;
