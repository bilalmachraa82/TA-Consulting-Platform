/**
 * Sistema Avançado de Scraping para Fundos Portugueses
 *
 * Fontes de dados (por prioridade):
 * 1. dados.gov.pt API (oficial) - Dataset PT2030 Avisos
 * 2. transparencia.gov.pt (portal oficial)
 * 3. Scraping direto com fallback
 *
 * Suporta: Portugal 2030, PEPAC, PRR
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

// Configuração
const CONFIG = {
  dadosGov: {
    baseUrl: 'https://dados.gov.pt/api/1',
    datasetPT2030: 'dataset-pt2030-avisos',
    timeout: 30000,
  },
  transparencia: {
    baseUrl: 'https://transparencia.gov.pt',
    avisosPath: '/pt/fundos-europeus/pt2030/avisos/',
  },
  scraping: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    delay: 2000, // ms entre requests
    retries: 3,
  },
};

// Tipos
export interface AvisoScraped {
  id: string;
  codigo?: string;
  titulo: string;
  descricao: string;
  fonte: 'Portugal 2030' | 'PEPAC' | 'PRR';
  programa: string;
  linha?: string;
  componente?: string;
  data_abertura?: string;
  data_fecho?: string;
  montante_total?: number;
  montante_min?: number;
  montante_max?: number;
  taxa_apoio?: number;
  regiao?: string;
  setor?: string;
  url?: string;
  pdf_url?: string;
  status: 'Aberto' | 'Encerrado' | 'Suspenso' | 'A abrir';
  tipo_beneficiario?: string;
  elegibilidade?: string;
  documentos_necessarios?: string[];
  keywords: string[];
  scraped_at: string;
  source: 'api' | 'scraping' | 'fallback';
}

export interface ScrapingResult {
  success: boolean;
  source: string;
  avisos: AvisoScraped[];
  errors: string[];
  timestamp: string;
}

/**
 * Cliente para dados.gov.pt API
 */
export class DadosGovClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = CONFIG.dadosGov.baseUrl;
  }

  /**
   * Buscar dataset de avisos PT2030
   */
  async getAvisosPT2030(): Promise<AvisoScraped[]> {
    try {
      console.log('📡 Fetching dados.gov.pt API...');

      // Tentar endpoint direto do dataset
      const datasetUrl = `${this.baseUrl}/datasets/${CONFIG.dadosGov.datasetPT2030}/`;
      const response = await axios.get(datasetUrl, {
        timeout: CONFIG.dadosGov.timeout,
        headers: {
          Accept: 'application/json',
          'User-Agent': CONFIG.scraping.userAgent,
        },
      });

      const dataset = response.data;

      // Buscar recursos do dataset (CSV, JSON, etc.)
      if (dataset.resources && dataset.resources.length > 0) {
        for (const resource of dataset.resources) {
          if (resource.format?.toLowerCase() === 'json' || resource.url?.includes('.json')) {
            const dataResponse = await axios.get(resource.url, {
              timeout: CONFIG.dadosGov.timeout,
            });
            return this.parseAvisosFromAPI(dataResponse.data);
          }
          if (resource.format?.toLowerCase() === 'csv' || resource.url?.includes('.csv')) {
            const csvResponse = await axios.get(resource.url, {
              timeout: CONFIG.dadosGov.timeout,
            });
            return this.parseAvisosFromCSV(csvResponse.data);
          }
        }
      }

      console.log('⚠️ No JSON/CSV resources found in dataset');
      return [];
    } catch (error: any) {
      console.error('❌ dados.gov.pt API error:', error.message);
      return [];
    }
  }

  private parseAvisosFromAPI(data: any): AvisoScraped[] {
    // Adaptar conforme estrutura real do dataset
    if (Array.isArray(data)) {
      return data.map((item, index) => ({
        id: item.id || item.codigo || `PT2030_API_${index}`,
        codigo: item.codigo,
        titulo: item.titulo || item.designacao || 'Sem título',
        descricao: item.descricao || item.resumo || '',
        fonte: 'Portugal 2030' as const,
        programa: item.programa || 'Portugal 2030',
        data_abertura: item.data_abertura || item.inicio,
        data_fecho: item.data_fecho || item.fim,
        montante_total: parseFloat(item.dotacao) || undefined,
        taxa_apoio: parseFloat(item.taxa_cofinanciamento) || undefined,
        regiao: item.regiao || 'Nacional',
        setor: item.setor || item.area,
        url: item.url || item.link,
        status: this.parseStatus(item.estado || item.status),
        keywords: this.extractKeywords(item),
        scraped_at: new Date().toISOString(),
        source: 'api' as const,
      }));
    }
    return [];
  }

  private parseAvisosFromCSV(csvData: string): AvisoScraped[] {
    const lines = csvData.split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(';').map((h) => h.trim().toLowerCase());
    const avisos: AvisoScraped[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(';');
      if (values.length < 3) continue;

      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx]?.trim() || '';
      });

      avisos.push({
        id: row['id'] || row['codigo'] || `PT2030_CSV_${i}`,
        codigo: row['codigo'],
        titulo: row['titulo'] || row['designacao'] || 'Sem título',
        descricao: row['descricao'] || row['resumo'] || '',
        fonte: 'Portugal 2030',
        programa: row['programa'] || 'Portugal 2030',
        data_abertura: row['data_abertura'] || row['inicio'],
        data_fecho: row['data_fecho'] || row['fim'],
        montante_total: parseFloat(row['dotacao']) || undefined,
        taxa_apoio: parseFloat(row['taxa']) || undefined,
        regiao: row['regiao'] || 'Nacional',
        setor: row['setor'] || row['area'],
        url: row['url'] || row['link'],
        status: this.parseStatus(row['estado'] || row['status']),
        keywords: [],
        scraped_at: new Date().toISOString(),
        source: 'api',
      });
    }

    return avisos;
  }

  private parseStatus(status?: string): AvisoScraped['status'] {
    if (!status) return 'Aberto';
    const s = status.toLowerCase();
    if (s.includes('encerr') || s.includes('fechad')) return 'Encerrado';
    if (s.includes('suspen')) return 'Suspenso';
    if (s.includes('abrir') || s.includes('previst')) return 'A abrir';
    return 'Aberto';
  }

  private extractKeywords(item: any): string[] {
    const keywords: string[] = [];
    const text = `${item.titulo || ''} ${item.descricao || ''} ${item.setor || ''}`.toLowerCase();

    const keywordMap = [
      'inovação',
      'digital',
      'sustentabilidade',
      'energia',
      'internacionalização',
      'PME',
      'I&D',
      'formação',
      'emprego',
      'agricultura',
      'turismo',
      'indústria',
    ];

    for (const kw of keywordMap) {
      if (text.includes(kw.toLowerCase())) {
        keywords.push(kw);
      }
    }

    return keywords;
  }
}

/**
 * Scraper para transparencia.gov.pt
 */
export class TransparenciaScraper {
  private baseUrl: string;

  constructor() {
    this.baseUrl = CONFIG.transparencia.baseUrl;
  }

  async scrapeAvisos(): Promise<AvisoScraped[]> {
    try {
      console.log('📡 Scraping transparencia.gov.pt...');

      const url = `${this.baseUrl}${CONFIG.transparencia.avisosPath}`;
      const response = await axios.get(url, {
        timeout: 30000,
        headers: {
          'User-Agent': CONFIG.scraping.userAgent,
          Accept: 'text/html,application/xhtml+xml',
        },
      });

      const $ = cheerio.load(response.data);
      const avisos: AvisoScraped[] = [];

      // Procurar por elementos de avisos (adaptar selectores conforme site)
      $('article, .aviso, .card, tr[data-id], .item').each((index, element) => {
        const titulo =
          $(element).find('h2, h3, .titulo, .title, td:first-child').first().text().trim() ||
          $(element).find('a').first().text().trim();

        if (titulo && titulo.length > 10) {
          const link = $(element).find('a').first().attr('href');
          const descricao = $(element).find('p, .descricao, .summary').first().text().trim();

          avisos.push({
            id: `TRANSP_${index}_${Date.now()}`,
            titulo,
            descricao: descricao || titulo,
            fonte: 'Portugal 2030',
            programa: 'Portugal 2030',
            status: 'Aberto',
            url: link ? (link.startsWith('http') ? link : `${this.baseUrl}${link}`) : undefined,
            keywords: [],
            scraped_at: new Date().toISOString(),
            source: 'scraping',
          });
        }
      });

      console.log(`✅ Encontrados ${avisos.length} avisos via scraping`);
      return avisos;
    } catch (error: any) {
      console.error('❌ Scraping error:', error.message);
      return [];
    }
  }
}

/**
 * Scraper para portais PEPAC
 */
export class PEPACScraper {
  async scrapeAvisos(): Promise<AvisoScraped[]> {
    const urls = [
      'https://pepacc.pt/concursos/',
      'https://www.gpp.pt/index.php/pepac/pepac-candidaturas',
    ];

    const avisos: AvisoScraped[] = [];

    for (const url of urls) {
      try {
        console.log(`📡 Scraping PEPAC: ${url}...`);
        await this.delay(CONFIG.scraping.delay);

        const response = await axios.get(url, {
          timeout: 30000,
          headers: {
            'User-Agent': CONFIG.scraping.userAgent,
          },
        });

        const $ = cheerio.load(response.data);

        // Procurar por concursos/avisos
        $('article, .concurso, .aviso, .entry, .post').each((index, element) => {
          const titulo = $(element).find('h2, h3, .title, a').first().text().trim();
          const link = $(element).find('a').first().attr('href');

          if (titulo && titulo.length > 5) {
            avisos.push({
              id: `PEPAC_${index}_${Date.now()}`,
              titulo,
              descricao: $(element).find('p, .excerpt').first().text().trim() || titulo,
              fonte: 'PEPAC',
              programa: 'PEPAC 2023-2027',
              status: 'Aberto',
              setor: 'Agricultura',
              url: link ? (link.startsWith('http') ? link : new URL(link, url).href) : undefined,
              keywords: ['agricultura', 'rural', 'PEPAC'],
              scraped_at: new Date().toISOString(),
              source: 'scraping',
            });
          }
        });
      } catch (error: any) {
        console.error(`❌ PEPAC scraping error (${url}):`, error.message);
      }
    }

    return avisos;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Scraper para PRR
 */
export class PRRScraper {
  async scrapeAvisos(): Promise<AvisoScraped[]> {
    const urls = [
      'https://recuperarportugal.gov.pt/candidaturas-prr/',
      'https://www.iapmei.pt/PRODUTOS-E-SERVICOS/Incentivos-Financiamento/Sistemas-de-Incentivos/Plano-de-Recuperacao-e-Resiliencia.aspx',
    ];

    const avisos: AvisoScraped[] = [];

    for (const url of urls) {
      try {
        console.log(`📡 Scraping PRR: ${url}...`);
        await this.delay(CONFIG.scraping.delay);

        const response = await axios.get(url, {
          timeout: 30000,
          headers: {
            'User-Agent': CONFIG.scraping.userAgent,
          },
        });

        const $ = cheerio.load(response.data);

        $('article, .aviso, .candidatura, .card, tr').each((index, element) => {
          const titulo = $(element).find('h2, h3, h4, .title, a, td:first-child').first().text().trim();
          const link = $(element).find('a').first().attr('href');

          if (titulo && titulo.length > 10 && !titulo.includes('Menu')) {
            avisos.push({
              id: `PRR_${index}_${Date.now()}`,
              titulo,
              descricao: $(element).find('p, .description').first().text().trim() || titulo,
              fonte: 'PRR',
              programa: 'Plano de Recuperação e Resiliência',
              status: 'Aberto',
              url: link ? (link.startsWith('http') ? link : new URL(link, url).href) : undefined,
              keywords: ['PRR', 'recuperação', 'resiliência'],
              scraped_at: new Date().toISOString(),
              source: 'scraping',
            });
          }
        });
      } catch (error: any) {
        console.error(`❌ PRR scraping error (${url}):`, error.message);
      }
    }

    return avisos;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Orquestrador principal de scraping
 */
export async function scrapeAllAvisos(): Promise<ScrapingResult> {
  const result: ScrapingResult = {
    success: false,
    source: 'multiple',
    avisos: [],
    errors: [],
    timestamp: new Date().toISOString(),
  };

  // 1. Tentar API oficial primeiro
  const dadosGovClient = new DadosGovClient();
  const apiAvisos = await dadosGovClient.getAvisosPT2030();

  if (apiAvisos.length > 0) {
    console.log(`✅ API dados.gov.pt: ${apiAvisos.length} avisos`);
    result.avisos.push(...apiAvisos);
    result.source = 'api';
  } else {
    result.errors.push('API dados.gov.pt não retornou dados');
  }

  // 2. Scraping de transparencia.gov.pt
  const transpScraper = new TransparenciaScraper();
  const transpAvisos = await transpScraper.scrapeAvisos();

  if (transpAvisos.length > 0) {
    console.log(`✅ Transparência: ${transpAvisos.length} avisos`);
    result.avisos.push(...transpAvisos);
  }

  // 3. Scraping PEPAC
  const pepacScraper = new PEPACScraper();
  const pepacAvisos = await pepacScraper.scrapeAvisos();

  if (pepacAvisos.length > 0) {
    console.log(`✅ PEPAC: ${pepacAvisos.length} avisos`);
    result.avisos.push(...pepacAvisos);
  }

  // 4. Scraping PRR
  const prrScraper = new PRRScraper();
  const prrAvisos = await prrScraper.scrapeAvisos();

  if (prrAvisos.length > 0) {
    console.log(`✅ PRR: ${prrAvisos.length} avisos`);
    result.avisos.push(...prrAvisos);
  }

  // 5. Se ainda sem dados, usar fallback
  if (result.avisos.length === 0) {
    console.log('⚠️ Nenhum dado obtido, usando fallback...');
    result.avisos = await loadFallbackAvisos();
    result.source = 'fallback';
  }

  // Deduplicate by title similarity
  result.avisos = deduplicateAvisos(result.avisos);
  result.success = result.avisos.length > 0;

  console.log(`\n📊 Total final: ${result.avisos.length} avisos únicos`);

  return result;
}

/**
 * Remover duplicados baseado em similaridade de título
 */
function deduplicateAvisos(avisos: AvisoScraped[]): AvisoScraped[] {
  const seen = new Map<string, AvisoScraped>();

  for (const aviso of avisos) {
    const key = normalizeTitle(aviso.titulo);
    if (!seen.has(key)) {
      seen.set(key, aviso);
    }
  }

  return Array.from(seen.values());
}

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 50);
}

/**
 * Carregar dados de fallback
 */
async function loadFallbackAvisos(): Promise<AvisoScraped[]> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'scraped', 'all_avisos.json');
    const content = fs.readFileSync(filePath, 'utf-8');
    const avisos = JSON.parse(content);
    return avisos.map((a: any) => ({
      ...a,
      source: 'fallback' as const,
    }));
  } catch (error) {
    console.error('Erro ao carregar fallback:', error);
    return [];
  }
}

/**
 * Guardar resultados em ficheiro
 */
export async function saveScrapingResults(result: ScrapingResult): Promise<void> {
  const dataDir = path.join(process.cwd(), 'data', 'scraped');

  // Guardar todos os avisos
  const allPath = path.join(dataDir, 'all_avisos.json');
  fs.writeFileSync(allPath, JSON.stringify(result.avisos, null, 2));

  // Guardar por fonte
  const bySource: Record<string, AvisoScraped[]> = {};
  for (const aviso of result.avisos) {
    const fonte = aviso.fonte.toLowerCase().replace(/ /g, '_');
    if (!bySource[fonte]) bySource[fonte] = [];
    bySource[fonte].push(aviso);
  }

  for (const [fonte, avisos] of Object.entries(bySource)) {
    const filePath = path.join(dataDir, `${fonte}_avisos.json`);
    fs.writeFileSync(filePath, JSON.stringify(avisos, null, 2));
  }

  // Guardar metadata
  const metaPath = path.join(dataDir, 'scraping_metadata.json');
  fs.writeFileSync(
    metaPath,
    JSON.stringify(
      {
        lastUpdate: result.timestamp,
        source: result.source,
        totalAvisos: result.avisos.length,
        byFonte: Object.fromEntries(Object.entries(bySource).map(([k, v]) => [k, v.length])),
        errors: result.errors,
      },
      null,
      2
    )
  );

  console.log(`💾 Dados guardados em ${dataDir}`);
}
