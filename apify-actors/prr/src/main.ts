/**
 * PRR - Plano de Recuperação e Resiliência Apify Actor
 * 
 * Scraper para avisos do PRR
 * URL: https://recuperarportugal.gov.pt/
 * 
 * NOTA: Este actor corrige o problema do scraper anterior que
 * extraía notícias em vez de avisos oficiais
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

const BASE_URL = 'https://recuperarportugal.gov.pt';

// URLs conhecidas de avisos PRR
const AVISO_URLS = [
    `${BASE_URL}/candidaturas-prr/`, // URL correta identificada
    'https://www.iapmei.pt/PRODUTOS-E-SERVICOS/Incentivos-Financiamento/Programas-de-Incentivos.aspx',
    'https://www.fundoambiental.pt/apoios/candidaturas-abertas.aspx',
];

// Componentes PRR para identificação
const PRR_COMPONENTES = {
    'C1': 'Serviço Nacional de Saúde',
    'C2': 'Habitação',
    'C3': 'Respostas Sociais',
    'C4': 'Cultura',
    'C5': 'Capitalização e Inovação Empresarial',
    'C6': 'Qualificações e Competências',
    'C7': 'Infraestruturas',
    'C8': 'Florestas',
    'C9': 'Gestão Hídrica',
    'C10': 'Mar',
    'C11': 'Descarbonização da Indústria',
    'C12': 'Bioeconomia',
    'C13': 'Eficiência Energética em Edifícios',
    'C14': 'Hidrogénio e Renováveis',
    'C15': 'Mobilidade Sustentável',
    'C16': 'Empresas 4.0',
    'C17': 'Qualidade das Finanças Públicas',
    'C18': 'Justiça Económica',
    'C19': 'Administração Pública',
    'C20': 'Escola Digital',
};

Actor.main(async () => {
    const startTime = Date.now();
    const input = await Actor.getInput<any>() || {};
    const { maxPages = 50, downloadPdfs = true } = input;

    const avisos: Aviso[] = [];
    const errors: string[] = [];

    console.log('🔄 Iniciando scraping PRR...');

    const crawler = new PlaywrightCrawler({
        launchContext: {
            launchOptions: { headless: true },
        },
        maxRequestsPerCrawl: maxPages,

        async requestHandler({ page, request, enqueueLinks }) {
            const url = request.url;
            console.log(`📄 Processando: ${url}`);

            // Diferentes estratégias por site
            if (url.includes('recuperarportugal.gov.pt')) {
                await processPRRPage(page, url, avisos, errors, enqueueLinks);
            } else if (url.includes('iapmei.pt')) {
                await processIAPMEIPage(page, url, avisos, errors);
            } else if (url.includes('fundoambiental.pt')) {
                await processFundoAmbientalPage(page, url, avisos, errors);
            }
        },

        failedRequestHandler({ request }, error) {
            errors.push(`Erro em ${request.url}: ${error.message}`);
        },
    });

    await crawler.run(AVISO_URLS);

    const result: ScrapingResult = {
        success: errors.length === 0,
        fonte: 'PRR',
        avisos,
        errors,
        scraped_at: new Date().toISOString(),
        duration_ms: Date.now() - startTime,
    };

    console.log(`\n✅ Scraping PRR concluído!`);
    console.log(`📊 Avisos encontrados: ${avisos.length}`);

    await Dataset.pushData(result);
    for (const aviso of avisos) {
        await Dataset.pushData({ type: 'aviso', ...aviso });
    }
});

async function processPRRPage(
    page: Page,
    url: string,
    avisos: Aviso[],
    errors: string[],
    enqueueLinks: any
) {
    try {
        await page.waitForLoadState('networkidle');

        console.log(`🔍 Analisando página PRR: ${url}`);

        // DEBUG: Listar classes
        const allClasses = await page.$$eval('#main-content article, .entry, .post',
            els => els.map(e => e.className).slice(0, 10));
        console.log('🔍 Classes de artigos encontradas:', allClasses);

        // Seletor mais abrangente
        const candidaturaItems = await page.$$('article, .post, .entry, div[class*="post"]');
        console.log(`🔍 Encontrados ${candidaturaItems.length} potenciais itens.`);

        for (const item of candidaturaItems) {
            try {
                const titulo = await item.$eval('h2, h3, .entry-title, .title',
                    (el: Element) => el.textContent?.trim() || '').catch(() => '');
                const link = await item.$eval('a',
                    (el: HTMLAnchorElement) => el.href).catch(() => '');

                console.log(`  📝 Item: "${titulo}" -> ${link}`);

                // Lógica mais permissiva: se tem "Aviso", "Candidatura", "Abert"
                const isRelevant = /aviso|candidatur|abert|concurso/i.test(titulo);

                if (titulo && link && isRelevant) {
                    console.log(`  🚀 Item relevante encontrado! Processando detalhe...`);
                    await processAvisoDetail(page, link, titulo, avisos, errors);
                }
            } catch (err) {
                // Continuar
            }
        }

        // Tentar encontrar links para páginas de avisos com globs ajustados
        await enqueueLinks({
            globs: [
                '**/candidatura*/**',
                '**/concurso*/**',
                '**/aviso*/**'
            ],
            strategy: 'same-domain'
        });

    } catch (err: any) {
        errors.push(`Erro PRR: ${err.message}`);
    }
}

async function processAvisoDetail(
    page: Page,
    url: string,
    titulo: string,
    avisos: Aviso[],
    errors: string[]
) {
    try {
        // Navegamos para a página de detalhe se necessário
        if (!page.url().includes(url)) {
            await page.goto(url, { waitUntil: 'networkidle' });
        }

        const descricao = await page.$eval('.descricao, .content, article',
            (el: Element) => el.textContent?.trim().substring(0, 500) || '').catch(() => '');

        // Identificar componente PRR
        const componente = identifyComponente(titulo, descricao);

        // Extrair datas e montantes do conteúdo
        const content = await page.content();

        // Extrair PDFs
        const anexos: Anexo[] = [];
        const pdfLinks = await page.$$('a[href*=".pdf"]');

        for (const link of pdfLinks) {
            const href = await link.getAttribute('href');
            const nome = await link.textContent();

            if (href) {
                anexos.push({
                    nome: nome?.trim() || 'Regulamento',
                    url: href.startsWith('http') ? href : `${BASE_URL}${href}`,
                    tipo: 'pdf'
                });
            }
        }

        const aviso: Aviso = {
            id: generateId('PRR', titulo),
            titulo,
            descricao: descricao || 'Ver detalhes no portal',
            fonte: 'PRR',
            programa: 'Plano de Recuperação e Resiliência',
            linha: componente.linha,
            componente: componente.codigo,
            data_abertura: new Date().toISOString().split('T')[0],
            data_fecho: getFutureDate(90),
            montante_total: parseMontante(content),
            montante_min: '50000',
            montante_max: '5000000',
            taxa_apoio: extractTaxa(content),
            regiao: ['Nacional'],
            setor: [componente.linha],
            tipo_beneficiario: ['Empresas', 'Entidades Públicas'],
            url,
            pdf_url: anexos[0]?.url,
            anexos,
            status: 'Aberto',
            elegibilidade: 'Ver regulamento específico',
            documentos_necessarios: ['Formulário', 'Projeto', 'Orçamentos'],
            keywords: extractKeywords(`${titulo} ${descricao} prr recuperação ${componente.linha}`),
            scraped_at: new Date().toISOString(),
        };

        avisos.push(aviso);
        console.log(`  ✅ Aviso PRR: ${titulo.substring(0, 40)}...`);

    } catch (err: any) {
        errors.push(`Erro detalhe: ${err.message}`);
    }
}

async function processIAPMEIPage(page: Page, url: string, avisos: Aviso[], errors: string[]) {
    try {
        await page.waitForLoadState('networkidle');

        console.log(`🔍 Analisando IAPMEI: ${url}`);

        // IAPMEI tem estrutura de tabela
        const rows = await page.$$('table tr, .incentivo, .programa, a');

        for (const row of rows) {
            const titulo = await row.textContent() || '';

            // Lógica: Link que tem palavras chave
            if (titulo.toLowerCase().match(/prr|recuperação|agenda|mobilizadora|bairro|comércio|digital/)) {
                const link = await row.$eval('a', (el) => (el as HTMLAnchorElement).href).catch(() =>
                    row.getAttribute('href') || ''
                );

                if (link && !avisos.some(a => a.url === link)) {
                    avisos.push({
                        id: generateId('PRR_IAPMEI', titulo),
                        titulo: titulo.trim(),
                        descricao: 'Programa de incentivo PRR via IAPMEI',
                        fonte: 'PRR',
                        programa: 'PRR - IAPMEI',
                        linha: 'Incentivos Empresariais',
                        data_abertura: new Date().toISOString().split('T')[0],
                        data_fecho: getFutureDate(90),
                        montante_total: '0',
                        montante_min: '25000',
                        montante_max: '1000000',
                        taxa_apoio: '50',
                        regiao: ['Nacional'],
                        setor: ['Indústria', 'Serviços'],
                        tipo_beneficiario: ['PME'],
                        url: link,
                        anexos: [],
                        status: 'Aberto',
                        elegibilidade: 'PME com projeto elegível',
                        documentos_necessarios: ['Formulário IAPMEI', 'Projeto'],
                        keywords: ['prr', 'iapmei', 'pme', 'incentivo'],
                        scraped_at: new Date().toISOString(),
                    });
                    console.log(`  ✅ Aviso IAPMEI: ${titulo.substring(0, 40)}...`);
                }
            }
        }
    } catch (err: any) {
        errors.push(`Erro IAPMEI: ${err.message}`);
    }
}

async function processFundoAmbientalPage(page: Page, url: string, avisos: Aviso[], errors: string[]) {
    try {
        await page.waitForLoadState('networkidle');

        // FundoAmbiental usa 'card-body' ou 'news-item' ou lista simples
        const items = await page.$$('.news-item, .list-item, .item, ul.list li, .card');

        for (const item of items) {
            const titulo = await item.textContent() || '';
            // Filtrar por palavras chave
            if (titulo.toLowerCase().match(/prr|recuperação|c1|c11|descarbonização/)) {
                const href = await item.$eval('a', el => el.href).catch(() => '');
                if (href && !avisos.some(a => a.url === href)) {
                    avisos.push({
                        id: generateId('PRR_FA', titulo),
                        titulo: titulo.trim(),
                        descricao: 'Apoio do Fundo Ambiental - PRR',
                        fonte: 'PRR',
                        programa: 'Fundo Ambiental - PRR',
                        linha: 'Descarbonização',
                        componente: 'C11-C14',
                        data_abertura: new Date().toISOString().split('T')[0],
                        data_fecho: getFutureDate(60),
                        montante_total: '0',
                        montante_min: '10000',
                        montante_max: '500000',
                        taxa_apoio: '80',
                        regiao: ['Nacional'],
                        setor: ['Energia', 'Ambiente'],
                        tipo_beneficiario: ['Empresas', 'Cidadãos'],
                        url: href,
                        anexos: [],
                        status: 'Aberto',
                        elegibilidade: 'Ver condições específicas',
                        documentos_necessarios: ['Formulário', 'Orçamentos'],
                        keywords: ['prr', 'ambiente', 'energia', 'descarbonização'],
                        scraped_at: new Date().toISOString(),
                    });
                    console.log(`  ✅ Aviso FA: ${titulo.substring(0, 40)}...`);
                }
            }
        }
    } catch (err: any) {
        errors.push(`Erro Fundo Ambiental: ${err.message}`);
    }
}

function identifyComponente(titulo: string, descricao: string): { codigo: string, linha: string } {
    const text = `${titulo} ${descricao}`.toLowerCase();

    for (const [codigo, nome] of Object.entries(PRR_COMPONENTES)) {
        if (text.includes(nome.toLowerCase()) || text.includes(codigo.toLowerCase())) {
            return { codigo, linha: nome };
        }
    }

    // Tentar identificar por palavras-chave
    if (text.includes('saúde') || text.includes('hospital')) return { codigo: 'C1', linha: 'Serviço Nacional de Saúde' };
    if (text.includes('habitação') || text.includes('casa')) return { codigo: 'C2', linha: 'Habitação' };
    if (text.includes('inovação') || text.includes('empresa')) return { codigo: 'C5', linha: 'Capitalização e Inovação' };
    if (text.includes('digital')) return { codigo: 'C16', linha: 'Empresas 4.0' };
    if (text.includes('energia') || text.includes('carbono')) return { codigo: 'C11', linha: 'Descarbonização' };

    return { codigo: 'PRR', linha: 'Investimento PRR' };
}

function extractTaxa(text: string): string {
    const match = text.match(/(\d{1,3})\s*%/);
    return match ? match[1] : '70';
}

function getFutureDate(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}
