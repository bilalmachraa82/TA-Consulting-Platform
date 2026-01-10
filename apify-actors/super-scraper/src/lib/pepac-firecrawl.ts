/**
 * PEPAC Firecrawl Scraper
 * 
 * Usa Firecrawl para bypass do BlogVault Firewall no pepacc.pt
 * Firecrawl tem proxies e bypass de anti-bot integrado.
 */

import axios from 'axios';
import { AvisoNormalized, Documento, PORTAIS } from './types';
import { normalizeDate, normalizeStatus, stripHtml, decodeHtmlEntities } from './normalizers';

const FIRECRAWL_API = 'https://api.firecrawl.dev/v1';
const FC_API_KEY = process.env.FIRECRAWL_API_KEY;

export interface PEPACFirecrawlInput {
    maxItems: number;
    onlyOpen: boolean;
}

interface ConcursoLink {
    title: string;
    url: string;
    datas?: string;
}

/**
 * Scrape PEPAC via Firecrawl (bypass firewall)
 */
export async function scrapePEPACFirecrawl(input: PEPACFirecrawlInput): Promise<AvisoNormalized[]> {
    console.log('    📡 PEPAC/Firecrawl: Fetching concursos...');

    if (!FC_API_KEY) {
        console.log('    ❌ PEPAC/Firecrawl: FIRECRAWL_API_KEY não configurado');
        return [];
    }

    const avisos: AvisoNormalized[] = [];

    try {
        // 1. Scrape main concursos page
        const mainUrl = input.onlyOpen ? 'https://pepacc.pt/concursos/' : 'https://pepacc.pt/arquivo/';

        const response = await axios.post(`${FIRECRAWL_API}/scrape`, {
            url: mainUrl,
            formats: ['markdown', 'links']
        }, {
            headers: {
                'Authorization': `Bearer ${FC_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 60000
        });

        if (!response.data?.success) {
            console.log('    ❌ PEPAC/Firecrawl: Scrape falhou');
            return [];
        }

        const markdown = response.data.data?.markdown || '';
        const links = response.data.data?.links || [];

        // 2. Parse concursos from markdown
        const concursos = parseConcursosFromMarkdown(markdown, links);
        console.log(`    ✅ PEPAC/Firecrawl: ${concursos.length} concursos encontrados`);

        // 3. Convert to AvisoNormalized
        for (const c of concursos.slice(0, input.maxItems)) {
            const aviso = createAvisoFromConcurso(c, input.onlyOpen);
            avisos.push(aviso);
        }

        // 4. Enrich with documents (fetch each concurso page)
        if (avisos.length > 0 && avisos.length <= 20) {
            console.log('    📎 PEPAC/Firecrawl: Extraindo documentos...');
            await enrichWithDocuments(avisos);
        }

        console.log(`    ✅ PEPAC/Firecrawl: ${avisos.length} avisos extraídos`);

    } catch (error: any) {
        console.log(`    ❌ PEPAC/Firecrawl: Erro - ${error.message}`);
    }

    return avisos;
}

function parseConcursosFromMarkdown(markdown: string, links: string[]): ConcursoLink[] {
    const concursos: ConcursoLink[] = [];

    // Filter links to pepacc.pt/concursos/
    const concursoLinks = links.filter((link: string) =>
        link.includes('pepacc.pt/concursos/') &&
        !link.endsWith('/concursos/') &&
        !link.includes('facebook') &&
        !link.includes('twitter') &&
        !link.includes('linkedin')
    );

    // Extract titles from markdown - look for patterns like [**Title**](url)
    const titlePattern = /\[\*\*([^\]]+)\*\*[^\]]*\]\(([^)]+)\)/g;
    let match;

    while ((match = titlePattern.exec(markdown)) !== null) {
        const title = match[1].trim();
        const url = match[2].trim();

        if (url.includes('pepacc.pt/concursos/') && !url.endsWith('/concursos/')) {
            // Try to extract dates from nearby text
            const afterMatch = markdown.substring(match.index + match[0].length, match.index + match[0].length + 200);
            const datasMatch = afterMatch.match(/[Cc]andidatura[s]?\s+aberta[s]?\s+de\s+([^)]+)/i);

            concursos.push({
                title: decodeHtmlEntities(title.replace(/\\/g, '')),
                url,
                datas: datasMatch ? datasMatch[1].trim() : undefined
            });
        }
    }

    // Fallback: if no matches, use links array
    if (concursos.length === 0) {
        for (const link of concursoLinks) {
            const slug = link.split('/').filter(Boolean).pop() || '';
            concursos.push({
                title: slug.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase()),
                url: link
            });
        }
    }

    return concursos;
}

function createAvisoFromConcurso(c: ConcursoLink, onlyOpen: boolean): AvisoNormalized {
    // Parse dates from datas string like "6 de novembro de 2025 a 22 de janeiro de 2026"
    let dataAbertura = '';
    let dataFecho = '';

    if (c.datas) {
        const parts = c.datas.split(/\s+a\s+/i);
        if (parts.length === 2) {
            dataAbertura = normalizeDate(parts[0].trim());
            dataFecho = normalizeDate(parts[1].trim());
        }
    }

    const status = onlyOpen ? 'Aberto' : (dataFecho ? normalizeStatus(dataFecho) : 'Desconhecido');

    // Extract ID from URL
    const urlSlug = c.url.split('/').filter(Boolean).pop() || '';
    const id = `PEPACC-FC-${urlSlug.slice(0, 20)}`;

    return {
        id,
        codigo: `PEPACC-${urlSlug.slice(0, 30)}`,
        titulo: stripHtml(c.title),
        programa: 'PEPAC Continente',
        dataAbertura,
        dataFecho,
        dotacao: 0,
        status,
        url: c.url,
        fonte: PORTAIS.PEPAC,
        scrapedAt: new Date().toISOString(),
        descricao: c.datas ? `Candidaturas: ${c.datas}` : undefined,
        documentos: [] as Documento[]
    };
}

async function enrichWithDocuments(avisos: AvisoNormalized[]): Promise<void> {
    if (!FC_API_KEY) return;

    for (const aviso of avisos.slice(0, 10)) { // Limit to 10 to save API calls
        try {
            const response = await axios.post(`${FIRECRAWL_API}/scrape`, {
                url: aviso.url,
                formats: ['links']
            }, {
                headers: {
                    'Authorization': `Bearer ${FC_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            });

            if (!response.data?.success) continue;

            const links = response.data.data?.links || [];
            const docs: Documento[] = [];

            for (const link of links) {
                const linkLower = (link as string).toLowerCase();
                if (linkLower.match(/\.(pdf|docx?|xlsx?)(\?|$)/)) {
                    const filename = (link as string).split('/').pop()?.split('?')[0] || 'documento.pdf';
                    const ext = filename.split('.').pop()?.toUpperCase() || 'PDF';

                    docs.push({
                        id: `PEPACC-doc-${docs.length + 1}`,
                        nome: decodeURIComponent(filename),
                        tipo: ext,
                        url: link as string,
                        formato: ext.toLowerCase(),
                        path: ''
                    });

                    if (docs.length >= 10) break;
                }
            }

            if (docs.length > 0) {
                aviso.documentos = docs;
            }

            // Small delay between requests
            await new Promise(r => setTimeout(r, 500));

        } catch {
            // Skip failed pages
        }
    }
}

// CLI execution
if (require.main === module) {
    (async () => {
        console.log('\n' + '═'.repeat(50));
        console.log('🔥 PEPAC FIRECRAWL SCRAPER TEST');
        console.log('═'.repeat(50) + '\n');

        const avisos = await scrapePEPACFirecrawl({
            maxItems: 10,
            onlyOpen: true
        });

        console.log(`\n📊 Total: ${avisos.length} avisos`);
        if (avisos.length > 0) {
            console.log('\nPrimeiros 3 avisos:');
            avisos.slice(0, 3).forEach((a, i) => {
                console.log(`  ${i + 1}. ${a.titulo?.substring(0, 60)}...`);
                console.log(`     URL: ${a.url}`);
                console.log(`     Docs: ${a.documentos?.length || 0}`);
            });
        }

        console.log('\n' + '═'.repeat(50));
    })();
}

export default scrapePEPACFirecrawl;
