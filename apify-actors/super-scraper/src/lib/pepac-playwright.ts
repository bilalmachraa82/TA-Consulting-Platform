/**
 * PEPAC Playwright Scraper
 * 
 * Usa Playwright para bypass do BlogVault Firewall no pepacc.pt
 * 
 * @usage npx ts-node src/lib/pepac-playwright.ts
 */

import { chromium, Browser, Page } from 'playwright';
import { AvisoNormalized, Documento, PORTAIS } from './types';
import { normalizeDate, normalizeStatus, stripHtml, decodeHtmlEntities } from './normalizers';

export interface PEPACPlaywrightInput {
    maxItems: number;
    onlyOpen: boolean;
    headless?: boolean;
}

interface PepaccConcurso {
    id: string;
    titulo: string;
    excerpt: string;
    url: string;
    dataFecho?: string;
    status: string;
}

/**
 * Scrape PEPAC/PEPACC usando Playwright para bypass de firewall
 */
export async function scrapePEPACPlaywright(input: PEPACPlaywrightInput): Promise<AvisoNormalized[]> {
    console.log('    📡 PEPAC/Playwright: Iniciando browser...');

    const avisos: AvisoNormalized[] = [];
    let browser: Browser | null = null;

    try {
        // Launch browser with stealth settings
        browser = await chromium.launch({
            headless: input.headless !== false,
            args: [
                '--disable-blink-features=AutomationControlled',
                '--disable-features=IsolateOrigins,site-per-process',
            ]
        });

        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            viewport: { width: 1920, height: 1080 },
            locale: 'pt-PT',
        });

        // Add extra headers to look more like a real browser
        await context.setExtraHTTPHeaders({
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'pt-PT,pt;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        });

        const page = await context.newPage();

        // Navigate to PEPAC homepage first (to get cookies)
        console.log('    🌐 PEPAC/Playwright: Navegando para pepacc.pt...');
        await page.goto('https://pepacc.pt/', {
            waitUntil: 'networkidle',
            timeout: 30000
        });

        // Wait a bit to simulate human behavior
        await page.waitForTimeout(1000);

        // Navigate to concursos page
        console.log('    📋 PEPAC/Playwright: Navegando para concursos...');
        await page.goto('https://pepacc.pt/concursos/', {
            waitUntil: 'networkidle',
            timeout: 30000
        });

        // Wait for content to load
        await page.waitForTimeout(2000);

        // Extract concursos from the page
        const concursos = await extractConcursosFromPage(page);
        console.log(`    ✅ PEPAC/Playwright: ${concursos.length} concursos encontrados`);

        // Convert to AvisoNormalized format
        for (const concurso of concursos.slice(0, input.maxItems)) {
            const dataFecho = concurso.dataFecho ? normalizeDate(concurso.dataFecho) : '';
            const status = input.onlyOpen
                ? (concurso.status === 'current' ? 'Aberto' : 'Fechado')
                : normalizeStatus(dataFecho);

            // Skip closed if onlyOpen
            if (input.onlyOpen && status !== 'Aberto') continue;

            const aviso: AvisoNormalized = {
                id: `PEPACC-PW-${concurso.id}`,
                codigo: `PEPACC-${concurso.id}`,
                titulo: stripHtml(decodeHtmlEntities(concurso.titulo)),
                programa: 'PEPAC Continente',
                dataAbertura: '',
                dataFecho,
                dotacao: 0,
                status,
                url: concurso.url,
                fonte: PORTAIS.PEPAC,
                scrapedAt: new Date().toISOString(),
                descricao: stripHtml(decodeHtmlEntities(concurso.excerpt)),
                documentos: [] as Documento[],
            };

            avisos.push(aviso);
        }

        // Optionally enrich with documents from individual pages
        if (avisos.length > 0 && avisos.length <= 20) {
            console.log('    📎 PEPAC/Playwright: Extraindo documentos...');
            await enrichWithDocuments(page, avisos);
        }

        console.log(`    ✅ PEPAC/Playwright: ${avisos.length} avisos extraídos`);

    } catch (error: any) {
        console.log(`    ❌ PEPAC/Playwright: Erro - ${error.message}`);
    } finally {
        if (browser) {
            await browser.close();
        }
    }

    return avisos;
}

/**
 * Extract concursos from the loaded page
 */
async function extractConcursosFromPage(page: Page): Promise<PepaccConcurso[]> {
    return page.evaluate(() => {
        const concursos: PepaccConcurso[] = [];

        // Try multiple selectors that might match concurso cards
        const selectors = [
            '.competition-card',
            '.concurso-item',
            '.post-item',
            'article.competition',
            '[data-competition-id]',
            '.card.concurso',
        ];

        let cards: NodeListOf<Element> | null = null;
        for (const selector of selectors) {
            const found = document.querySelectorAll(selector);
            if (found.length > 0) {
                cards = found;
                break;
            }
        }

        // If no cards found, try to extract from any visible content
        if (!cards || cards.length === 0) {
            // Fallback: extract all links that look like concursos
            const links = document.querySelectorAll('a[href*="concurso"], a[href*="competition"]');
            links.forEach((link, idx) => {
                const href = (link as HTMLAnchorElement).href;
                const text = link.textContent?.trim() || '';
                if (text.length > 10 && href) {
                    concursos.push({
                        id: String(idx + 1),
                        titulo: text.substring(0, 200),
                        excerpt: '',
                        url: href,
                        status: 'current',
                    });
                }
            });
            return concursos;
        }

        // Extract from cards
        cards.forEach((card, idx) => {
            const titleEl = card.querySelector('h2, h3, .title, .competition-title');
            const linkEl = card.querySelector('a');
            const excerptEl = card.querySelector('.excerpt, .description, p');
            const dateEl = card.querySelector('.date, .deadline, [data-date]');
            const statusEl = card.querySelector('.status, .badge');

            const titulo = titleEl?.textContent?.trim() || linkEl?.textContent?.trim() || '';
            const url = (linkEl as HTMLAnchorElement)?.href || '';
            const excerpt = excerptEl?.textContent?.trim() || '';
            const dataFecho = dateEl?.textContent?.trim() || dateEl?.getAttribute('data-date') || '';
            const status = statusEl?.textContent?.toLowerCase().includes('aberto') ? 'current' : 'archive';

            if (titulo && url) {
                // Extract ID from URL or use index
                const idMatch = url.match(/\/(\d+)\/?$/) || url.match(/id[=/](\d+)/i);
                const id = idMatch ? idMatch[1] : String(idx + 1);

                concursos.push({
                    id,
                    titulo: titulo.substring(0, 200),
                    excerpt: excerpt.substring(0, 500),
                    url,
                    dataFecho,
                    status,
                });
            }
        });

        return concursos;
    });
}

/**
 * Enrich avisos with documents from their individual pages
 */
async function enrichWithDocuments(page: Page, avisos: AvisoNormalized[]): Promise<void> {
    for (const aviso of avisos) {
        try {
            await page.goto(aviso.url, { waitUntil: 'networkidle', timeout: 15000 });
            await page.waitForTimeout(500);

            const docs = await page.evaluate(() => {
                const documents: { nome: string; url: string; tipo: string }[] = [];
                const links = document.querySelectorAll('a[href$=".pdf"], a[href$=".docx"], a[href$=".xlsx"]');

                links.forEach(link => {
                    const href = (link as HTMLAnchorElement).href;
                    const text = link.textContent?.trim() || href.split('/').pop() || 'Documento';
                    const ext = href.split('.').pop()?.toUpperCase() || 'PDF';

                    documents.push({
                        nome: text.substring(0, 100),
                        url: href,
                        tipo: ext,
                    });
                });

                return documents.slice(0, 10);
            });

            if (docs.length > 0) {
                aviso.documentos = docs.map((d, idx) => ({
                    id: `PEPACC-doc-${idx + 1}`,
                    nome: d.nome,
                    tipo: d.tipo,
                    url: d.url,
                    formato: d.tipo.toLowerCase(),
                    path: '',
                }));
            }
        } catch {
            // Skip if page fails to load
        }
    }
}

// CLI execution
if (require.main === module) {
    (async () => {
        console.log('\n' + '═'.repeat(50));
        console.log('🎭 PEPAC PLAYWRIGHT SCRAPER TEST');
        console.log('═'.repeat(50) + '\n');

        const avisos = await scrapePEPACPlaywright({
            maxItems: 20,
            onlyOpen: false,
            headless: true,
        });

        console.log(`\n📊 Total: ${avisos.length} avisos`);
        if (avisos.length > 0) {
            console.log('\nPrimeiros 3 avisos:');
            avisos.slice(0, 3).forEach((a, i) => {
                console.log(`  ${i + 1}. ${a.titulo?.substring(0, 50)}...`);
                console.log(`     URL: ${a.url}`);
            });
        }

        console.log('\n' + '═'.repeat(50));
    })();
}

export default scrapePEPACPlaywright;
