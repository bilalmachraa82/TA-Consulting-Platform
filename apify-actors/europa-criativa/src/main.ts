/**
 * Europa Criativa Apify Actor
 * 
 * Scraper para concursos do programa Europa Criativa
 * URL: https://www.europacriativa.eu/concursos
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

const BASE_URL = 'https://www.europacriativa.eu';
const CONCURSOS_URL = `${BASE_URL}/concursos`;

interface Input {
    maxConcursos?: number;
    subprogramas?: string[];
}

Actor.main(async () => {
    const startTime = Date.now();
    const input = await Actor.getInput<Input>() || {};
    const { maxConcursos = 50, subprogramas = ['Culture', 'Media', 'Cross-Sector'] } = input;

    const avisos: Aviso[] = [];
    const errors: string[] = [];

    console.log('🎭 Iniciando scraping Europa Criativa...');

    const crawler = new PlaywrightCrawler({
        launchContext: {
            launchOptions: { headless: true },
        },
        maxRequestsPerCrawl: maxConcursos,

        async requestHandler({ page, request, enqueueLinks }) {
            const url = request.url;
            console.log(`📄 Processando: ${url}`);

            if (url === CONCURSOS_URL || url.includes('/concursos?')) {
                await processListPage(page, enqueueLinks, subprogramas);
            } else if (url.includes('/concurso/') || request.userData.isDetail) {
                await processDetailPage(page, url, avisos, errors);
            }
        },

        failedRequestHandler({ request }, error) {
            errors.push(`Erro em ${request.url}: ${error.message}`);
        },
    });

    await crawler.run([CONCURSOS_URL]);

    const result: ScrapingResult = {
        success: errors.length === 0,
        fonte: 'Europa Criativa',
        avisos,
        errors,
        scraped_at: new Date().toISOString(),
        duration_ms: Date.now() - startTime,
    };

    console.log(`\n✅ Scraping Europa Criativa concluído!`);
    console.log(`📊 Concursos encontrados: ${avisos.length}`);

    await Dataset.pushData(result);
    for (const aviso of avisos) {
        await Dataset.pushData({ type: 'aviso', ...aviso });
    }
});

async function processListPage(page: Page, enqueueLinks: any, subprogramas: string[]) {
    await page.waitForLoadState('networkidle');

    const concursos = await page.$$('.concurso, .call, article, .card');
    console.log(`  🎬 Encontrados ${concursos.length} concursos`);

    for (const item of concursos) {
        try {
            const titulo = await item.$eval('h2, h3, .titulo, a',
                (el: Element) => el.textContent?.trim() || '').catch(() => '');
            const link = await item.$eval('a',
                (el: HTMLAnchorElement) => el.href).catch(() => '');
            const subprograma = await item.$eval('.subprograma, .category',
                (el: Element) => el.textContent?.trim() || '').catch(() => '');

            if (titulo && link) {
                console.log(`  📌 Concurso: ${titulo.substring(0, 50)}...`);
                await enqueueLinks({
                    urls: [link],
                    userData: { isDetail: true, subprograma }
                });
            }
        } catch (err) {
            // Continuar
        }
    }
}

async function processDetailPage(
    page: Page,
    url: string,
    avisos: Aviso[],
    errors: string[]
) {
    try {
        await page.waitForLoadState('networkidle');

        const titulo = await page.$eval('h1, .titulo-concurso',
            (el: Element) => el.textContent?.trim() || '').catch(() => '');

        if (!titulo) return;

        const descricao = await page.$eval('.descricao, .content, article p',
            (el: Element) => el.textContent?.trim() || '').catch(() => '');

        const deadline = await page.$eval('.deadline, .prazo, [class*="date"]',
            (el: Element) => el.textContent?.trim() || '').catch(() => '');

        const budget = await page.$eval('.budget, .orcamento, [class*="budget"]',
            (el: Element) => el.textContent?.trim() || '').catch(() => '');

        const subprograma = await page.$eval('.subprograma, .programme',
            (el: Element) => el.textContent?.trim() || 'Culture').catch(() => 'Culture');

        // Extrair anexos
        const anexos: Anexo[] = [];
        const pdfLinks = await page.$$('a[href*=".pdf"], a[href*="document"]');

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

        const aviso: Aviso = {
            id: generateId('EC', titulo),
            titulo,
            descricao: descricao || 'Ver detalhes no portal Europa Criativa',
            fonte: 'Europa Criativa',
            programa: 'Europa Criativa 2021-2027',
            linha: subprograma,
            data_abertura: new Date().toISOString().split('T')[0],
            data_fecho: parseDate(deadline) || getFutureDate(90),
            montante_total: parseMontante(budget),
            montante_min: '50000',
            montante_max: '2000000',
            taxa_apoio: '60',
            regiao: ['União Europeia'],
            setor: ['Cultura', 'Media', 'Audiovisual'],
            tipo_beneficiario: ['Entidades Culturais', 'Produtoras', 'Festivais'],
            url,
            pdf_url: anexos[0]?.url,
            anexos,
            status: 'Aberto',
            elegibilidade: 'Entidades culturais e criativas da UE',
            documentos_necessarios: ['Formulário EU', 'Descrição do projeto', 'Orçamento'],
            keywords: extractKeywords(`${titulo} ${descricao} cultura media cinema audiovisual`),
            scraped_at: new Date().toISOString(),
        };

        avisos.push(aviso);
        console.log(`  ✅ Concurso extraído: ${titulo.substring(0, 40)}...`);

    } catch (err: any) {
        errors.push(`Erro em ${url}: ${err.message}`);
    }
}

function getFutureDate(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}
