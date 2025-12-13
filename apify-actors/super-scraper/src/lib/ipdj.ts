/**
 * IPDJ (Instituto Português do Desporto e Juventude) Scraper
 *
 * IPDJ pages are mostly evergreen program pages (often without explicit deadlines).
 * We extract page title/description and any linked documents (PDF/DOCX/XLSX/ZIP).
 */

import axios from 'axios';
import { AvisoNormalized, Documento, PORTAIS } from './types';
import { stripHtml, decodeHtmlEntities, detectDocumentFormat } from './normalizers';

export interface IPDJInput {
    maxItems: number;
    onlyOpen: boolean;
}

const IPDJ_PAGES: Array<{ url: string; programa: string }> = [
    // Juventude
    { url: 'https://ipdj.gov.pt/apoio-e-financiamento-jovem', programa: 'Apoio Jovem' },
    { url: 'https://ipdj.gov.pt/paj-programa-de-apoio-juvenil', programa: 'PAJ' },
    { url: 'https://ipdj.gov.pt/paacj-programa-de-apoio-as-associacoes-de-carater-juvenil', programa: 'PAACJ' },
    { url: 'https://ipdj.gov.pt/pae-programa-de-apoio-estudantil', programa: 'PAE' },
    { url: 'https://ipdj.gov.pt/pai-programa-de-apoio-infraestrutural', programa: 'PAI' },
    // Desporto
    { url: 'https://ipdj.gov.pt/apoio-e-financiamento-ao-desporto', programa: 'Apoio Desporto' },
    { url: 'https://ipdj.gov.pt/apoio-financeiro-ao-desporto-federado', programa: 'Desporto Federado' },
    { url: 'https://ipdj.gov.pt/medida-1-apoio-personalizado', programa: 'Apoio Personalizado' },
    { url: 'https://ipdj.gov.pt/medidas-de-apoio/medidas-de-apoio', programa: 'Medidas Gerais' },
];

export async function scrapeIPDJ(input: IPDJInput): Promise<AvisoNormalized[]> {
    console.log('    📡 IPDJ: Fetching páginas de apoios...');

    const avisos: AvisoNormalized[] = [];
    const seen = new Set<string>();

    for (const page of IPDJ_PAGES) {
        if (avisos.length >= input.maxItems) break;

        try {
            const response = await axios.get(page.url, {
                headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html' },
                timeout: 25000,
            });

            const html = sanitizeHtml(String(response.data));

            const title = extractTitle(html) || page.programa;
            const description = extractMetaDescription(html) || '';

            const documentos = extractDocumentsFromHtml(html, page.url);

            const idSlug = page.url.split('/').filter(Boolean).slice(-1)[0] || page.programa.replace(/\s+/g, '-');
            const id = `IPDJ-${idSlug}`;
            if (seen.has(id)) continue;
            seen.add(id);

            avisos.push({
                id,
                codigo: id.replace(/^IPDJ-/, 'IPDJ-'),
                titulo: title,
                programa: page.programa,
                dataAbertura: '',
                dataFecho: '',
                dotacao: 0,
                status: 'Aberto',
                url: page.url,
                fonte: PORTAIS.IPDJ,
                scrapedAt: new Date().toISOString(),
                descricao: description || stripHtml(html).slice(0, 800) || undefined,
                documentos,
            });
        } catch (e: any) {
            console.log(`    ⚠️ IPDJ página ${page.url} erro: ${e.message}`);
        }
    }

    console.log(`    ✅ IPDJ: ${avisos.length} programas extraídos`);
    return avisos;
}

function sanitizeHtml(html: string): string {
    return html
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<!--[\s\S]*?-->/g, ' ');
}

function extractTitle(html: string): string | '' {
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1Match) return stripHtml(h1Match[1]);
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (titleMatch) return stripHtml(titleMatch[1]);
    return '';
}

function extractMetaDescription(html: string): string | '' {
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    return descMatch ? decodeHtmlEntities(descMatch[1]).trim() : '';
}

function extractDocumentsFromHtml(html: string, baseUrl: string): Documento[] {
    const docs: Documento[] = [];
    const seen = new Set<string>();

    const linkRe = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    for (const m of html.matchAll(linkRe)) {
        const hrefRaw = decodeHtmlEntities(m[1] || '').trim();
        if (!hrefRaw) continue;

        const url = absolutizeUrl(hrefRaw, baseUrl);
        if (!url) continue;

        const lower = url.toLowerCase();
        const isDoc = /\.(pdf|docx|doc|xlsx|xls|zip)(\?|#|$)/i.test(lower);
        if (!isDoc) continue;

        if (seen.has(url)) continue;
        seen.add(url);

        const label = stripHtml(m[2] || '').trim();
        const formato = detectDocumentFormat(url);
        const tipo = formato ? formato.toUpperCase() : 'DOC';

        docs.push({
            id: url,
            nome: label || url.split('/').pop() || url,
            tipo,
            url,
            formato: formato || undefined,
        });
    }

    return docs;
}

function absolutizeUrl(href: string, baseUrl: string): string | null {
    try {
        if (href.startsWith('http://') || href.startsWith('https://')) return href;
        if (href.startsWith('//')) return `https:${href}`;
        return new URL(href, baseUrl).toString();
    } catch {
        return null;
    }
}
