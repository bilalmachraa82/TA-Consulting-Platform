/**
 * PEPAC/IFAP Apify Actor
 * 
 * Scraper para extrair avisos do portal IFAP (agricultura)
 * URL: https://www.ifap.pt/
 * 
 * Estratégia: Monitorar secção "Notícias" para avisos de candidaturas
 */

import { Actor } from 'apify';
import { PlaywrightCrawler, Dataset } from 'crawlee';
import { Page } from 'playwright';
import {
    Aviso,
    Anexo,
    ScrapingResult,
    generateId,
    parseDate,
    parseMontante,
    extractKeywords
} from './types';

const BASE_URL = 'https://www.ifap.pt';
const NEWS_URL = `${BASE_URL}/portal/noticias`;

// Palavras-chave para identificar avisos de candidaturas
const AVISO_KEYWORDS = [
    'candidatura', 'abertura', 'aviso', 'concurso',
    'apoio', 'período', 'prazo', 'beneficiários'
];

interface Input {
    maxNews?: number;
    downloadPdfs?: boolean;
}

Actor.main(async () => {
    const startTime = Date.now();
    const input = await Actor.getInput<Input>() || {};
    const { maxNews = 50, downloadPdfs = true } = input;

    const avisos: Aviso[] = [];
    const errors: string[] = [];

    console.log('🌾 Iniciando scraping PEPAC/IFAP...');

    const crawler = new PlaywrightCrawler({
        launchContext: {
            launchOptions: { headless: true },
        },
        maxRequestsPerCrawl: maxNews,

        async requestHandler({ page, request, enqueueLinks }) {
            const url = request.url;
            console.log(`📄 Processando: ${url}`);

            if (url.includes('/noticias') && !url.includes('/noticia/')) {
                await processNewsListPage(page, enqueueLinks);
            } else if (url.includes('/noticia/') || request.userData.isDetail) {
                await processNewsDetailPage(page, url, avisos, errors, downloadPdfs);
            }
        },

        failedRequestHandler({ request }, error) {
            errors.push(`Erro em ${request.url}: ${error.message}`);
        },
    });

    await crawler.run([NEWS_URL]);

    const result: ScrapingResult = {
        success: errors.length === 0,
        fonte: 'PEPAC',
        avisos,
        errors,
        scraped_at: new Date().toISOString(),
        duration_ms: Date.now() - startTime,
    };

    console.log(`\n✅ Scraping IFAP concluído!`);
    console.log(`📊 Avisos encontrados: ${avisos.length}`);

    await Dataset.pushData(result);
    for (const aviso of avisos) {
        await Dataset.pushData({ type: 'aviso', ...aviso });
    }
});

async function processNewsListPage(page: Page, enqueueLinks: any) {
    await page.waitForLoadState('networkidle');

    // Procurar notícias na lista
    const newsItems = await page.$$('.noticia, article, .news-item, .list-item');
    console.log(`  📰 Encontradas ${newsItems.length} notícias`);

    for (const item of newsItems) {
        try {
            const titulo = await item.$eval('h2, h3, .titulo, a',
                (el: Element) => el.textContent?.trim() || '').catch(() => '');
            const link = await item.$eval('a',
                (el: HTMLAnchorElement) => el.href).catch(() => '');

            // Verificar se parece ser um aviso de candidatura
            const isAviso = AVISO_KEYWORDS.some(kw =>
                titulo.toLowerCase().includes(kw)
            );

            if (isAviso && link) {
                console.log(`  🎯 Possível aviso: ${titulo.substring(0, 50)}...`);
                await enqueueLinks({
                    urls: [link],
                    userData: { isDetail: true }
                });
            }
        } catch (err) {
            // Continuar com próximo item
        }
    }

    // Paginação
    const nextPage = await page.$('a.next, .pagination a:last-child, [rel="next"]');
    if (nextPage) {
        const nextUrl = await nextPage.getAttribute('href');
        if (nextUrl) {
            await enqueueLinks({ urls: [nextUrl] });
        }
    }
}

async function processNewsDetailPage(
    page: Page,
    url: string,
    avisos: Aviso[],
    errors: string[],
    downloadPdfs: boolean
) {
    try {
        await page.waitForLoadState('networkidle');

        const titulo = await page.$eval('h1, .titulo-noticia',
            (el: Element) => el.textContent?.trim() || '').catch(() => '');

        // Verificar novamente se é realmente um aviso
        const isAviso = AVISO_KEYWORDS.some(kw =>
            titulo.toLowerCase().includes(kw)
        );

        if (!isAviso || !titulo) {
            console.log('  ⏭️ Não é um aviso, pulando...');
            return;
        }

        // Extrair conteúdo
        const conteudo = await page.$eval('.conteudo, .content, article',
            (el: Element) => el.textContent?.trim() || '').catch(() => '');

        // Procurar datas no conteúdo
        const datas = conteudo.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/g) || [];

        // Extrair PDFs
        const anexos: Anexo[] = [];
        const pdfLinks = await page.$$('a[href*=".pdf"]');

        for (const link of pdfLinks) {
            const href = await link.getAttribute('href');
            const nome = await link.textContent();

            if (href) {
                anexos.push({
                    nome: nome?.trim() || 'Documento',
                    url: href.startsWith('http') ? href : `${BASE_URL}${href}`,
                    tipo: 'pdf'
                });
            }
        }

        // Identificar tipo de apoio PEPAC
        const linha = extractLinhaPEPAC(titulo, conteudo);
        const campanha = extractCampanha(titulo, conteudo);

        const aviso: Aviso = {
            id: generateId('PEPAC', titulo),
            titulo,
            descricao: conteudo.substring(0, 500) + '...',
            fonte: 'PEPAC',
            programa: 'PEPAC 2023-2027',
            linha,
            componente: campanha,
            data_abertura: datas[0] ? parseDate(datas[0]) || new Date().toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            data_fecho: datas[1] ? parseDate(datas[1]) || getFutureDate(60) : getFutureDate(60),
            montante_total: parseMontante(conteudo),
            montante_min: '5000',
            montante_max: '500000',
            taxa_apoio: extractTaxa(conteudo),
            regiao: ['Nacional'],
            setor: ['Agricultura'],
            tipo_beneficiario: extractBeneficiarios(titulo, conteudo),
            url,
            pdf_url: anexos[0]?.url,
            anexos,
            status: 'Aberto',
            elegibilidade: 'Agricultores registados no IFAP',
            documentos_necessarios: ['Formulário IFAP', 'Parcelário', 'Plano de exploração'],
            keywords: extractKeywords(`${titulo} ${conteudo} agricultura pepac`),
            scraped_at: new Date().toISOString(),
        };

        avisos.push(aviso);
        console.log(`  ✅ Aviso PEPAC extraído: ${titulo.substring(0, 40)}...`);
        console.log(`     📎 Anexos: ${anexos.length}`);

    } catch (err: any) {
        errors.push(`Erro em ${url}: ${err.message}`);
    }
}

// Funções auxiliares específicas para PEPAC
function extractLinhaPEPAC(titulo: string, conteudo: string): string {
    const text = `${titulo} ${conteudo}`.toLowerCase();

    if (text.includes('jovens agricultores')) return 'Jovens Agricultores';
    if (text.includes('investimento')) return 'Investimento Agrícola';
    if (text.includes('vitis') || text.includes('vinha')) return 'VITIS';
    if (text.includes('regadio')) return 'Regadio';
    if (text.includes('floresta')) return 'Floresta';
    if (text.includes('biológic')) return 'Agricultura Biológica';
    if (text.includes('transformação')) return 'Transformação';
    if (text.includes('pecuári')) return 'Produção Pecuária';

    return 'Apoio Agrícola';
}

function extractCampanha(titulo: string, conteudo: string): string {
    const text = `${titulo} ${conteudo}`;
    const match = text.match(/campanha\s*(\d{4})[\/\-]?(\d{4})?/i);
    return match ? `Campanha ${match[1]}${match[2] ? '/' + match[2] : ''}` : '';
}

function extractBeneficiarios(titulo: string, conteudo: string): string[] {
    const text = `${titulo} ${conteudo}`.toLowerCase();
    const beneficiarios: string[] = [];

    if (text.includes('jovens')) beneficiarios.push('Jovens Agricultores');
    if (text.includes('agricultor')) beneficiarios.push('Agricultores');
    if (text.includes('associação') || text.includes('organização')) beneficiarios.push('Organizações de Produtores');
    if (text.includes('empresa')) beneficiarios.push('Empresas Agrícolas');

    return beneficiarios.length > 0 ? beneficiarios : ['Agricultores'];
}

function extractTaxa(text: string): string {
    const match = text.match(/(\d{1,3})\s*%/);
    return match ? match[1] : '50';
}

function getFutureDate(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}
