/**
 * Helpers for EU Funding & Tenders Portal static JSON datasets.
 *
 * Many call/topic pages are an Angular SPA, but the portal exposes a static JSON per topic:
 *   https://ec.europa.eu/info/funding-tenders/opportunities/data/topicDetails/{topicIdLower}.json
 */

import axios from 'axios';
import { Documento } from './types';
import { decodeHtmlEntities, detectDocumentFormat, stripHtml } from './normalizers';

const TOPIC_DETAILS_BASE =
    'https://ec.europa.eu/info/funding-tenders/opportunities/data/topicDetails';

export function topicDetailsJsonUrl(topicId: string): string {
    return `${TOPIC_DETAILS_BASE}/${String(topicId).toLowerCase()}.json`;
}

export async function fetchTopicDetails(topicId: string): Promise<any | null> {
    const url = topicDetailsJsonUrl(topicId);
    try {
        const resp = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
            timeout: 30000,
        });
        return resp.data?.TopicDetails || null;
    } catch {
        return null;
    }
}

export function extractDocumentsFromTopicDetails(
    topicDetails: any,
    options: { baseUrl?: string; maxDocs?: number } = {}
): Documento[] {
    if (!topicDetails || typeof topicDetails !== 'object') return [];
    const baseUrl = options.baseUrl || 'https://ec.europa.eu';
    const maxDocs = options.maxDocs ?? 25;

    const htmlFields: Array<{ name: string; value: unknown }> = [
        { name: 'description', value: topicDetails.description },
        { name: 'conditions', value: topicDetails.conditions },
        { name: 'supportInfo', value: topicDetails.supportInfo },
        { name: 'latestInfos', value: topicDetails.latestInfos },
    ];

    const docs: Documento[] = [];
    const seen = new Set<string>();

    // 1. Extração Estruturada (Preferencial)
    if (Array.isArray(topicDetails.topicDocuments)) {
        for (const category of topicDetails.topicDocuments) {
            const list = category.documentList || [];
            for (const d of list) {
                if (docs.length >= maxDocs) break;
                if (!d.documentUrl) continue;

                const url = absolutizeUrl(d.documentUrl, baseUrl);
                if (!url || seen.has(url)) continue;

                seen.add(url);
                docs.push({
                    id: url,
                    nome: d.title || url.split('/').pop() || 'Documento',
                    tipo: category.categoryTitle || 'Call Document',
                    url: url,
                    formato: detectDocumentFormat(url) || 'pdf'
                });
            }
        }
    }

    // 2. Extração via Regex (Fallback para links embutidos no texto)
    for (const { name, value } of htmlFields) {
        if (docs.length >= maxDocs) break;
        const html = typeof value === 'string' ? value : '';
        if (!html) continue;

        for (const d of extractDocumentsFromHtml(html, baseUrl, name)) {
            if (docs.length >= maxDocs) break;
            if (seen.has(d.url)) continue;
            seen.add(d.url);
            docs.push(d);
        }
    }

    return docs;
}

function extractDocumentsFromHtml(html: string, baseUrl: string, tipoHint: string): Documento[] {
    const docs: Documento[] = [];
    const linkRe = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

    for (const m of html.matchAll(linkRe)) {
        const hrefRaw = decodeHtmlEntities(m[1] || '').trim();
        if (!hrefRaw) continue;

        const url = absolutizeUrl(hrefRaw, baseUrl);
        if (!url) continue;

        const lower = url.toLowerCase();
        const hasExt = /\.(pdf|docx|doc|xlsx|xls|pptx|ppt|zip)(\?|#|$)/i.test(lower);
        const isDocsFolder = lower.includes('/opportunities/docs/');
        const looksLikeDownload = lower.includes('download.aspx') || lower.includes('/download?');
        if (!hasExt && !isDocsFolder && !looksLikeDownload) continue;

        const label = stripHtml(m[2] || '').trim();
        const formato = detectDocumentFormat(url);

        docs.push({
            id: url,
            nome: label || url.split('/').pop() || url,
            tipo: tipoHint || 'Documento',
            url,
            formato: formato !== 'unknown' ? formato : undefined,
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

