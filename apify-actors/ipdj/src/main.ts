/**
 * IPDJ Apify Actor
 * 
 * Scraper para programas de juventude do IPDJ
 * URL: https://ipdj.gov.pt/
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
    extractKeywords
} from './types';

const BASE_URL = 'https://ipdj.gov.pt';

// Secções relevantes do IPDJ
const TARGET_SECTIONS = [
    `${BASE_URL}/apoios`,
    `${BASE_URL}/programas`,
    `${BASE_URL}/voluntariado`,
    `${BASE_URL}/juventude`,
];

interface Input {
    maxPages?: number;
}

Actor.main(async () => {
    const startTime = Date.now();
    const input = await Actor.getInput<Input>() || {};
    const { maxPages = 30 } = input;

    const avisos: Aviso[] = [];
    const errors: string[] = [];

    console.log('👥 Iniciando scraping IPDJ...');

    const crawler = new PlaywrightCrawler({
        launchContext: {
            launchOptions: { headless: true },
        },
        maxRequestsPerCrawl: maxPages,

        async requestHandler({ page, request, enqueueLinks }) {
            const url = request.url;
            console.log(`📄 Processando: ${url}`);

            await processIPDJPage(page, url, avisos, errors, enqueueLinks);
        },

        failedRequestHandler({ request }, error) {
            errors.push(`Erro em ${request.url}: ${error.message}`);
        },
    });

    await crawler.run(TARGET_SECTIONS);

    const result: ScrapingResult = {
        success: errors.length === 0,
        fonte: 'IPDJ',
        avisos,
        errors,
        scraped_at: new Date().toISOString(),
        duration_ms: Date.now() - startTime,
    };

    console.log(`\n✅ Scraping IPDJ concluído!`);
    console.log(`📊 Programas encontrados: ${avisos.length}`);

    await Dataset.pushData(result);
    for (const aviso of avisos) {
        await Dataset.pushData({ type: 'aviso', ...aviso });
    }
});

async function processIPDJPage(
    page: Page,
    url: string,
    avisos: Aviso[],
    errors: string[],
    enqueueLinks: any
) {
    try {
        await page.waitForLoadState('networkidle');

        // Procurar por programas/apoios
        const items = await page.$$('.programa, .apoio, .card, article, .item');

        for (const item of items) {
            try {
                const titulo = await item.$eval('h2, h3, h4, .titulo, a',
                    (el: Element) => el.textContent?.trim() || '').catch(() => '');

                // Filtrar apenas programas relevantes
                if (titulo && isProgramaRelevante(titulo)) {
                    const link = await item.$eval('a',
                        (el: HTMLAnchorElement) => el.href).catch(() => url);

                    const descricao = await item.$eval('p, .descricao, .resumo',
                        (el: Element) => el.textContent?.trim() || '').catch(() => '');

                    // Identificar tipo de programa
                    const tipoPrograma = identificarTipoPrograma(titulo, descricao);

                    // Extrair PDFs
                    const anexos: Anexo[] = [];
                    const pdfLinks = await item.$$('a[href*=".pdf"]');

                    for (const pdfLink of pdfLinks) {
                        const href = await pdfLink.getAttribute('href');
                        const nome = await pdfLink.textContent();

                        if (href) {
                            anexos.push({
                                nome: nome?.trim() || 'Regulamento',
                                url: href.startsWith('http') ? href : `${BASE_URL}${href}`,
                                tipo: 'pdf'
                            });
                        }
                    }

                    const aviso: Aviso = {
                        id: generateId('IPDJ', titulo),
                        titulo,
                        descricao: descricao || 'Programa IPDJ - ver detalhes',
                        fonte: 'IPDJ',
                        programa: 'IPDJ - Instituto Português do Desporto e Juventude',
                        linha: tipoPrograma,
                        data_abertura: new Date().toISOString().split('T')[0],
                        data_fecho: getFutureDate(180), // Programas IPDJ geralmente têm prazo longo
                        montante_total: '0',
                        montante_min: '0',
                        montante_max: '50000',
                        taxa_apoio: '100',
                        regiao: ['Nacional'],
                        setor: ['Juventude', 'Desporto', 'Voluntariado'],
                        tipo_beneficiario: extractBeneficiarios(titulo, descricao),
                        url: link,
                        pdf_url: anexos[0]?.url,
                        anexos,
                        status: 'Aberto',
                        elegibilidade: extractElegibilidade(titulo, descricao),
                        documentos_necessarios: ['Formulário de candidatura', 'Identificação'],
                        keywords: extractKeywords(`${titulo} ${descricao} juventude desporto voluntariado`),
                        scraped_at: new Date().toISOString(),
                    };

                    avisos.push(aviso);
                    console.log(`  ✅ Programa: ${titulo.substring(0, 40)}...`);
                }
            } catch (err) {
                // Continuar
            }
        }

        // Procurar mais páginas
        await enqueueLinks({
            globs: [
                '**/apoios/**',
                '**/programas/**',
                '**/voluntariado/**',
                '**/candidatura*/**',
            ],
            strategy: 'same-domain',
        });

    } catch (err: any) {
        errors.push(`Erro IPDJ: ${err.message}`);
    }
}

function isProgramaRelevante(titulo: string): boolean {
    const keywords = [
        'candidatura', 'apoio', 'programa', 'voluntariado',
        'jovens', 'juventude', 'bolsa', 'desporto', 'formação'
    ];
    const lowerTitulo = titulo.toLowerCase();
    return keywords.some(kw => lowerTitulo.includes(kw));
}

function identificarTipoPrograma(titulo: string, descricao: string): string {
    const text = `${titulo} ${descricao}`.toLowerCase();

    if (text.includes('voluntariado')) return 'Voluntariado Jovem';
    if (text.includes('desporto')) return 'Desporto';
    if (text.includes('formação') || text.includes('formacao')) return 'Formação';
    if (text.includes('associativismo')) return 'Associativismo';
    if (text.includes('mobilidade')) return 'Mobilidade';
    if (text.includes('erasmus')) return 'Erasmus+';
    if (text.includes('corpo europeu')) return 'Corpo Europeu de Solidariedade';

    return 'Juventude';
}

function extractBeneficiarios(titulo: string, descricao: string): string[] {
    const text = `${titulo} ${descricao}`.toLowerCase();
    const beneficiarios: string[] = [];

    if (text.includes('jovens') || text.includes('juventude')) beneficiarios.push('Jovens (18-30 anos)');
    if (text.includes('associação') || text.includes('associacao')) beneficiarios.push('Associações Juvenis');
    if (text.includes('entidade')) beneficiarios.push('Entidades Promotoras');
    if (text.includes('escola')) beneficiarios.push('Estabelecimentos de Ensino');

    return beneficiarios.length > 0 ? beneficiarios : ['Jovens'];
}

function extractElegibilidade(titulo: string, descricao: string): string {
    const text = `${titulo} ${descricao}`.toLowerCase();

    if (text.includes('18') && text.includes('30')) return 'Jovens entre 18 e 30 anos';
    if (text.includes('15') && text.includes('30')) return 'Jovens entre 15 e 30 anos';
    if (text.includes('associação')) return 'Associações juvenis registadas';

    return 'Ver regulamento específico';
}

function getFutureDate(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}
