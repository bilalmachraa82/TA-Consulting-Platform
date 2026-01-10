/**
 * Portugal 2030 Apify Actor
 * 
 * Scraper usando Playwright para extrair avisos do portal Portugal 2030
 * URL: https://portugal2030.pt/avisos/
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

const BASE_URL = 'https://portugal2030.pt';
const AVISOS_URL = `${BASE_URL}/avisos/`;

interface Input {
    maxPages?: number;
    downloadPdfs?: boolean;
    filterStatus?: string[];
}

Actor.main(async () => {
    const startTime = Date.now();
    const input = await Actor.getInput<Input>() || {};
    const { maxPages = 10, downloadPdfs = true, filterStatus = ['Aberto'] } = input;

    const avisos: Aviso[] = [];
    const errors: string[] = [];

    console.log('🚀 Iniciando scraping Portugal 2030...');
    console.log(`📋 Configuração: maxPages=${maxPages}, downloadPdfs=${downloadPdfs}`);

    const crawler = new PlaywrightCrawler({
        launchContext: {
            launchOptions: {
                headless: true,
            },
        },
        maxRequestsPerCrawl: maxPages * 20,

        async requestHandler({ page, request, enqueueLinks }) {
            const url = request.url;
            console.log(`📄 Processando: ${url}`);

            if (url === AVISOS_URL || url.includes('/avisos/?')) {
                // Página de listagem de avisos
                await processListPage(page, avisos, errors, enqueueLinks, filterStatus);
            } else if (url.includes('/aviso/') || url.includes('/avisos/')) {
                // Página de detalhe de aviso
                await processDetailPage(page, url, avisos, errors, downloadPdfs);
            }
        },

        failedRequestHandler({ request }, error) {
            errors.push(`Erro em ${request.url}: ${error.message}`);
        },
    });

    await crawler.run([AVISOS_URL]);

    // Resultado final
    const result: ScrapingResult = {
        success: errors.length === 0,
        fonte: 'Portugal 2030',
        avisos,
        errors,
        scraped_at: new Date().toISOString(),
        duration_ms: Date.now() - startTime,
    };

    console.log(`\n✅ Scraping concluído!`);
    console.log(`📊 Avisos extraídos: ${avisos.length}`);
    console.log(`⚠️ Erros: ${errors.length}`);
    console.log(`⏱️ Duração: ${result.duration_ms}ms`);

    // Guardar no Dataset do Apify
    await Dataset.pushData(result);

    // Também exportar os avisos individualmente
    for (const aviso of avisos) {
        await Dataset.pushData({ type: 'aviso', ...aviso });
    }
});

async function processListPage(
    page: Page,
    avisos: Aviso[],
    errors: string[],
    enqueueLinks: any,
    filterStatus: string[]
) {
    try {
        await page.waitForLoadState('networkidle');

        // Estratégia: Encontrar titulos (H2/H3) e usar o pai como container
        const candidates = await page.$$('h2, h3');
        const items: any[] = [];

        for (const h of candidates) {
            const text = await h.textContent();
            // Filtrar titulos irrelevantes
            if (text && text.trim().length > 10 && !text.includes('Filter') && !text.includes('Navegação')) {
                const parent = await h.evaluateHandle(el => el.parentElement);
                items.push(parent);
            }
        }

        console.log(`🔍 Identificados ${items.length} avisos na página.`);

        for (const item of items) {
            try {
                // Obter HTML completo do item para parsing
                // É mais robusto e rápido do que seletores individuais Playwright
                // quando a estrutura é solta (dl/dt/dd)
                const html = await item.innerHTML();
                const textContent = await item.textContent() || '';

                // 1. Título
                // Tenta extrair do H2 ou Strong
                const tituloMatch = html.match(/<h[23]>(?:<strong>)?(.*?)(?:<\/strong>)?<\/h[23]>/i);
                const titulo = tituloMatch ? tituloMatch[1].replace(/<[^>]*>/g, '').trim() : '';

                if (!titulo) continue; // Skip se não achou titulo

                // 2. Extração de Metadados via Regex no HTML ou Texto
                const programaMatch = html.match(/<dt>\s*Programa\s*<\/dt>\s*<dd>(.*?)<\/dd>/i);
                const programa = programaMatch ? programaMatch[1].replace(/<[^>]*>/g, '').trim() : 'Portugal 2030';

                const dataInicioMatch = html.match(/Data de Início.*?<dd>(.*?)<\/dd>/i);
                const dataInicio = dataInicioMatch ? dataInicioMatch[1].replace(/<[^>]*>/g, '').trim() : '';

                const dataFimMatch = html.match(/Data de Fim.*?<dd>(.*?)<\/dd>/i);
                const dataFim = dataFimMatch ? dataFimMatch[1].replace(/<[^>]*>/g, '').trim() : '';

                // 3. Montante (procurar por padrão €)
                const montanteMatch = textContent.match(/([\d\s\.]+)\s?€/);
                const montanteTotal = montanteMatch ? montanteMatch[1].replace(/\./g, '') : undefined;

                // 4. Documentos (PDFs)
                const pdfLinks = await item.$$('a[href$=".pdf"]');
                const anexos: Anexo[] = [];
                for (const link of pdfLinks) {
                    const href = await link.getAttribute('href');
                    const nome = await link.textContent();
                    if (href) {
                        anexos.push({
                            nome: nome?.trim() || 'Documento',
                            url: href.startsWith('http') ? href : `https://portugal2030.pt${href}`,
                            tipo: 'pdf'
                        });
                    }
                }

                // 5. Código do Aviso (procurar no título ou texto)
                const codigoMatch = titulo.match(/([A-Z0-9-]{5,})/);
                const codigo = codigoMatch ? codigoMatch[1] : generateId('PT2030', titulo);

                // 6. Status (Inferido pela data ou classe se existir)
                let status: Aviso['status'] = 'Aberto';
                if (dataFim) {
                    const fim = new Date(parseDate(dataFim));
                    if (fim < new Date()) status = 'Fechado';
                }

                // Verificar filtro status
                const shouldInclude = filterStatus.some(s => status.toLowerCase().includes(s.toLowerCase()));
                if (!shouldInclude && filterStatus.length > 0) continue;

                // Construir Objeto Aviso
                const aviso: Aviso = {
                    id: generateId('PT2030', titulo),
                    titulo,
                    descricao: `Aviso ${programa} - Ver documentos anexos`,
                    fonte: 'Portugal 2030',
                    programa,
                    linha: extractLinha(titulo, ''),
                    data_abertura: parseDate(dataInicio) || new Date().toISOString().split('T')[0],
                    data_fecho: parseDate(dataFim) || getFutureDate(30),
                    montante_total: parseMontante(montanteTotal || '0'),
                    montante_min: '0',
                    montante_max: '0',
                    taxa_apoio: 'Consultar PDF', // Não extraível do HTML
                    regiao: ['Nacional'], // Assumir nacional ou extrair do Programa
                    setor: extractSetor(titulo, ''),
                    tipo_beneficiario: ['Diversos'],
                    url: page.url(), // URL da listagem pois é SPA/inline
                    pdf_url: anexos.length > 0 ? anexos[0].url : undefined,
                    anexos,
                    status,
                    elegibilidade: 'Consultar regulamento',
                    documentos_necessarios: [],
                    keywords: extractKeywords(titulo),
                    scraped_at: new Date().toISOString(),
                };

                avisos.push(aviso);
                console.log(`  ✅ Extraído: ${titulo} (${status}) - ${anexos.length} docs`);

            } catch (err: any) {
                console.log(`  ⚠️ Erro parsing item: ${err.message}`);
                errors.push(`Erro item: ${err.message}`);
            }
        }

        // Paginação (se existir)
        const nextPage = await page.$('a.next-page, .pagination .next');
        if (nextPage) {
            const href = await nextPage.getAttribute('href');
            if (href) await enqueueLinks({ urls: [href] });
        }

    } catch (err: any) {
        errors.push(`Erro na página de listagem: ${err.message}`);
    }
}

// Remove processDetailPage as it is no longer needed/used
async function processDetailPage() { return; }

// Funções auxiliares
function extractLinha(titulo: string, descricao: string): string {
    const text = `${titulo} ${descricao}`.toLowerCase();
    if (text.includes('inovação')) return 'Inovação';
    if (text.includes('qualificação')) return 'Qualificação';
    if (text.includes('digital')) return 'Transição Digital';
    if (text.includes('internacional')) return 'Internacionalização';
    if (text.includes('i&d') || text.includes('investigação')) return 'I&D';
    if (text.includes('energia')) return 'Energia';
    return 'Investimento';
}

function extractSetor(titulo: string, descricao: string): string[] {
    const text = `${titulo} ${descricao}`.toLowerCase();
    const setores: string[] = [];

    if (text.includes('indústria')) setores.push('Indústria');
    if (text.includes('turismo')) setores.push('Turismo');
    if (text.includes('agricultura')) setores.push('Agricultura');
    if (text.includes('tecnologia') || text.includes('digital')) setores.push('Tecnologia');
    if (text.includes('saúde')) setores.push('Saúde');
    if (text.includes('energia')) setores.push('Energia');

    return setores.length > 0 ? setores : ['Multisectorial'];
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
