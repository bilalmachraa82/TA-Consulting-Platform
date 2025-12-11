/**
 * Browser Automation simplificado para Portais Governamentais
 * Versão sem Puppeteer-extra para compatibilidade com Next.js
 */

import puppeteer from 'puppeteer';
import { setTimeout } from 'timers/promises';
import { ResourceBlocker } from './resource-blocker';

interface ScrapingOptions {
    waitTime?: number;
    interceptApi?: boolean;
    screenshots?: boolean;
    userAgent?: string;
}

export class BrowserAutomationSimple {
    private browser: any = null;
    private page: any = null;

    async initialize(options: ScrapingOptions = {}) {
        console.log('🚀 Iniciando browser automation simplificado...');

        this.browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor',
                '--window-size=1920,1080'
            ]
        });

        this.page = await this.browser.newPage();

        // User agent customizado
        const userAgent = options.userAgent ||
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

        await this.page.setUserAgent(userAgent);
        await this.page.setViewport({ width: 1920, height: 1080 });

        // Bloquear recursos desnecessários
        await ResourceBlocker.setup(this.page);

        // Interceptar APIs se solicitado
        if (options.interceptApi) {
            await this.setupNetworkInterception();
        }

        return this.page;
    }

    private async setupNetworkInterception() {
        const apiResponses: any[] = [];

        this.page.on('response', async (response) => {
            const url = response.url();

            // Priorizar APIs WordPress e governamentais
            if (url.includes('/wp-json/') ||
                (url.includes('/api/') &&
                 (url.includes('portugal2030') || url.includes('recuperarportugal')))) {
                try {
                    const data = await response.json();
                    apiResponses.push({ url, data });
                    console.log(`📡 API capturada: ${url}`);
                } catch (e) {
                    // Não é JSON, tentar texto
                    try {
                        const text = await response.text();
                        if (text.includes('aviso') || text.includes('candidatura')) {
                            apiResponses.push({ url, data: text, type: 'text' });
                        }
                    } catch (e2) {
                        // Ignorar
                    }
                }
            }
        });

        // Expor dados capturados
        (this.page as any).apiResponses = apiResponses;
        (this.page as any).getApiResponse = (urlPattern: string) => {
            return apiResponses.find(r => r.url.includes(urlPattern));
        };
    }

    async scrapePortugal2030() {
        console.log('🇵🇹 Scraping Portugal 2030 com browser automation...');

        await this.page.goto('https://portugal2030.pt/avisos/', {
            waitUntil: 'domcontentloaded'
        });

        // Esperar apenas 2 segundos para carregamento
        await setTimeout(2000);

        // Priorizar dados da API WordPress
        const apiData = (this.page as any).getApiResponse('wp-json/wp/v2/posts');
        if (apiData && apiData.data) {
            const posts = apiData.data
                .filter((p: any) => {
                    const title = p.title.rendered.toLowerCase();
                    return title.includes('aviso') || title.includes('candidatura') ||
                           title.includes('concurso') || title.includes('apoio');
                })
                .map((p: any) => ({
                    id: `PT2030_${p.id}`,
                    titulo: p.title.rendered.replace(/<[^>]*>/g, ''),
                    descricao: p.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 300),
                    url: p.link,
                    data: p.date.split('T')[0],
                    data_fecho: this.calculateDeadline(p.date),
                    programa: 'Portugal 2030',
                    pdf_url: ''
                }));

            console.log(`✅ PT2030 (API): ${posts.length} avisos encontrados`);
            return posts;
        }

        // Fallback: extrair do DOM
        const avisos = await this.page.evaluate(() => {
            const items = Array.from(document.querySelectorAll(
                '.et_pb_post, .et_pb_ajax_pagination_container article, .post'
            ));

            return items.map((item: any) => {
                const titleEl = item.querySelector('h2, h3, .entry-title, .title');
                const linkEl = item.querySelector('a');
                const dateEl = item.querySelector('.published, .date, .entry-date');

                return {
                    id: item.getAttribute('id') || '',
                    titulo: titleEl?.textContent?.trim() || '',
                    url: linkEl?.href || '',
                    data: dateEl?.textContent || ''
                };
            }).filter(a => a.titulo.length > 10);
        });

        console.log(`✅ PT2030 (DOM): ${avisos.length} avisos encontrados`);
        return avisos;
    }

    private calculateDeadline(postDate: string): string {
        // Calcular deadline baseado na data do post (geralmente 60-90 dias)
        const date = new Date(postDate);
        date.setDate(date.getDate() + 75); // Média de 75 dias
        return date.toISOString().split('T')[0];
    }

    private async autoScroll(waitTime: number = 2000) {
        await this.page.evaluate(async (wt: number) => {
            await new Promise((resolve) => {
                let totalHeight = 0;
                const distance = 300;
                const timer = setInterval(() => {
                    const scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;

                    if (totalHeight >= scrollHeight) {
                        clearInterval(timer);
                        setTimeout(resolve, wt);
                    }
                }, 500);
            });
        }, waitTime);
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            console.log('✅ Browser automation finalizado');
        }
    }
}