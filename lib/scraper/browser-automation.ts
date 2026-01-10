/**
 * Browser Automation para Portais Governamentais
 * Usa Puppeteer com stealth para sites complexos
 */

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { ResourceBlocker } from './resource-blocker';

interface ScrapingOptions {
    waitTime?: number;
    interceptApi?: boolean;
    screenshots?: boolean;
    userAgent?: string;
}

export class BrowserAutomation {
    private browser: any = null;
    private page: any = null;

    constructor() {
        // Configurar stealth
        puppeteer.use(StealthPlugin());
    }

    async initialize(options: ScrapingOptions = {}) {
        console.log('🚀 Iniciando browser automation...');

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

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.page.on('response', async (response: any) => {
            const url = response.url();

            // Priorizar APIs WordPress e governamentais
            if (url.includes('/wp-json/') ||
                (url.includes('/api/') &&
                    (url.includes('portugal2030') || url.includes('recuperarportugal')))) {
                try {
                    const data = await response.json();
                    apiResponses.push({ url, data });
                    console.log(`📡 API capturada: ${url}`);
                    if (url.includes('avisos/query')) {
                        console.log('📦 Data Payload Preview:', JSON.stringify(data).substring(0, 500));
                    }
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
            waitUntil: 'networkidle0'
        });

        // Esperar carregamento dinâmico
        await new Promise(r => setTimeout(r, 2000));

        // Scroll para carregar mais conteúdo
        await this.autoScroll(3000);

        // Priorizar dados da API (Nova API Avisos ou WP Posts)
        const apiData = (this.page as any).getApiResponse('wp-json/avisos/query') ||
            (this.page as any).getApiResponse('wp-json/wp/v2/posts');

        if (apiData && apiData.data) {
            let posts = [];

            // Handler para nova API (avisos/query)
            if (apiData.url.includes('avisos/query')) {
                console.log('📦 Parsing nova API Portugal 2030...');
                const avisosList = apiData.data.avisos || [];
                posts = avisosList.map((item: any) => {
                    const aviso = item.aviso || {};
                    return {
                        id: `PT2030_${aviso.codigoAviso}`,
                        titulo: aviso.designacaoPT || '',
                        descricao: aviso.sintese || aviso.enquadramento || '',
                        url: `https://portugal2030.pt/avisos/${aviso.codigoAviso?.toLowerCase()}`, // Construção provável do URL
                        data: aviso.dataInicio || new Date().toISOString().split('T')[0],
                        data_fecho: aviso.dataFim || '',
                        programa: 'Portugal 2030',
                        pdf_url: '' // TODO: Extrair docs se disponível
                    };
                });
            } else {
                // Handler para API antiga (WP Posts)
                posts = apiData.data
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
            }

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

    async scrapePRR() {
        console.log('🏛️ Scraping PRR com browser automation...');

        await this.page.goto('https://recuperarportugal.gov.pt/candidaturas-prr/', {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });

        // Esperar conteúdo dinâmico
        await new Promise(r => setTimeout(r, 3000));

        // Scroll para carregar
        await this.autoScroll(3000);

        // Tentar encontrar tabela/lista de componentes
        const componentes = await this.page.evaluate(() => {
            // Procurar por diferentes estruturas possíveis
            const selectors = [
                'table tr',
                '.componente-item',
                '.aviso-item',
                '[data-component]',
                '.elementor-element'
            ];

            let items: any[] = [];

            for (const selector of selectors) {
                const elements = Array.from(document.querySelectorAll(selector));
                if (elements.length > 0) {
                    items = elements.map(el => ({
                        titulo: el.querySelector('td:first-child, h3, .title')?.textContent?.trim() || '',
                        descricao: el.querySelector('td:nth-child(2), .description')?.textContent?.trim() || '',
                        montante: el.querySelector('td:nth-child(3), .amount')?.textContent?.trim() || '',
                        estado: el.querySelector('td:nth-child(4), .status')?.textContent?.trim() || '',
                        link: el.querySelector('a')?.href || ''
                    })).filter(i => i.titulo.length > 5);
                    break;
                }
            }

            return items;
        });

        // Se não encontrou na página principal, verificar APIs ou PDFs
        const apiResponses = (this.page as any).apiResponses || [];
        if (componentes.length === 0) {
            console.log('📡 Verificando Plano de Avisos (PDF)...');

            // Tentar encontrar o link do PDF do Plano de Avisos
            const pdfLink = await this.page.evaluate(() => {
                const link = document.querySelector('a[href*="plano-de-avisos.pdf"]');
                return link ? (link as HTMLAnchorElement).href : null;
            });

            if (pdfLink) {
                componentes.push({
                    titulo: 'Plano de Avisos (Atualização Semanal)',
                    descricao: 'Não foram encontrados avisos abertos listados em texto. Consulte o PDF oficial do Plano de Avisos para verificação manual.',
                    montante: 'N/A',
                    estado: 'PDF',
                    link: pdfLink
                });
            }
        }

        console.log(`✅ PRR: ${componentes.length} componentes encontrados`);
        return componentes;
    }

    async scrapePEPAC() {
        console.log('🌾 Scraping PEPAC / IFAP com browser automation...');

        await this.page.goto('https://www.ifap.pt/portal/noticias', {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });

        await new Promise(r => setTimeout(r, 4000));

        const avisos = await this.page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('.asset-publisher .journal-content-article, .portlet-journal-content'));

            // Se não encontrar estrutura de artigos, tentar links de notícias
            const linkItems = Array.from(document.querySelectorAll('.news-title a, .entry-title a'));

            if (linkItems.length > 0) {
                return linkItems.map(a => ({
                    id: `PEPAC_${Math.random().toString(36).substr(2, 5)}`,
                    titulo: a.textContent?.trim() || '',
                    descricao: 'Verificar detalhe',
                    url: (a as HTMLAnchorElement).href,
                    data_fecho: '',
                    programa: 'PEPAC'
                }));
            }

            return items.map((item: any) => {
                const titleEl = item.querySelector('.h2, h3, .title');
                const linkEl = item.querySelector('a');
                const textEl = item.querySelector('.content, p');

                return {
                    id: `PEPAC_${Math.random().toString(36).substr(2, 9)}`,
                    titulo: titleEl?.textContent?.trim() || 'Sem título',
                    descricao: textEl?.textContent?.trim().substring(0, 200) || '',
                    url: linkEl?.href || window.location.href,
                    data_fecho: 'Verificar no site',
                    programa: 'PEPAC'
                };
            }).filter(a => a.titulo.length > 5);
        });

        console.log(`✅ PEPAC: ${avisos.length} avisos encontrados`);
        return avisos;
    }

    async scrapeIPDJ() {
        console.log('👥 Scraping IPDJ com browser automation...');

        await this.page.goto('https://ipdj.gov.pt/apoios', {
            waitUntil: 'networkidle0'
        });

        await new Promise(r => setTimeout(r, 3000));

        // Clicar em programas se necessário
        try {
            await this.page.click('a[href="/programas"]');
            await new Promise(r => setTimeout(r, 2000));
        } catch (e) {
            console.log('⚠️ Menu programas não encontrado');
        }

        const programas = await this.page.evaluate(() => {
            const items = Array.from(document.querySelectorAll(
                '.programa-item, .apoio-item, article, .card'
            ));

            return items.map((item: any) => ({
                id: item.getAttribute('data-id') || '',
                titulo: item.querySelector('h2, h3, .title')?.textContent?.trim() || '',
                descricao: item.querySelector('p, .description')?.textContent?.trim() || '',
                link: item.querySelector('a')?.href || '',
                area: item.querySelector('.category, .tag')?.textContent?.trim() || ''
            })).filter(p => p.titulo.length > 5);
        });

        console.log(`✅ IPDJ: ${programas.length} programas encontrados`);
        return programas;
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
                        setTimeout(() => resolve(undefined), wt);
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

