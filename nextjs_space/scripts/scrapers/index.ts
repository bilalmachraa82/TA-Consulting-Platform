/**
 * Main Scraper Orchestrator
 * Coordena todos os scrapers, download de PDFs e sincronização
 *
 * Inclui:
 * - Portugal 2030 (COMPETE, etc.)
 * - PEPAC/PDR (Agricultura)
 * - PRR (Recuperação e Resiliência)
 * - Transparência Portugal (Agregador oficial)
 *
 * Features:
 * - Rate limiting inteligente
 * - Cache de resultados
 * - Fallback robusto
 */

import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import scrapePortugal2030 from './portugal2030-scraper';
import scrapePEPAC from './pepac-scraper';
import scrapePRR from './prr-scraper';
import scrapeTransparencia from './transparencia-scraper';
import { getScraper } from '../../lib/scraper-utils';

const DATA_DIR = path.join(process.cwd(), 'data', 'scraped');
const PDFS_DIR = path.join(process.cwd(), 'data', 'pdfs');
const CACHE_DIR = path.join(process.cwd(), 'data', 'cache');

// Garantir que os diretórios existem
function ensureDirectories() {
  [DATA_DIR, PDFS_DIR, CACHE_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// Download de PDFs
async function downloadPDF(url: string, filename: string): Promise<string | null> {
  try {
    if (!url || !url.includes('.pdf')) return null;

    const pdfPath = path.join(PDFS_DIR, filename);

    // Verificar se já existe
    if (fs.existsSync(pdfPath)) {
      console.log(`  📄 PDF já existe: ${filename}`);
      return pdfPath;
    }

    console.log(`  ⬇️ Downloading: ${filename}...`);
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 60000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    fs.writeFileSync(pdfPath, response.data);
    console.log(`  ✅ PDF downloaded: ${filename}`);
    return pdfPath;
  } catch (error: any) {
    console.log(`  ⚠️ Erro ao baixar PDF: ${error.message}`);
    return null;
  }
}

// Salvar dados em JSON
function saveToJSON(data: any[], filename: string) {
  const filepath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`💾 Guardado: ${filename} (${data.length} registos)`);
}

// Gerar ID único para aviso
function generateId(aviso: any): string {
  const portal = aviso.fonte?.replace(/\s+/g, '') || 'UNKNOWN';
  const code = aviso.titulo?.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '_') || Date.now();
  return `${portal}_${code}_${Date.now()}`.toUpperCase();
}

// Processar avisos para download de PDFs
async function processAvisosPDFs(avisos: any[]): Promise<any[]> {
  console.log('\n📥 Processando downloads de PDFs...');

  for (const aviso of avisos) {
    if (aviso.pdf_url) {
      const pdfFilename = `${aviso.id}.pdf`;
      const localPath = await downloadPDF(aviso.pdf_url, pdfFilename);
      if (localPath) {
        aviso.pdf_local = localPath;
      }
    }
  }

  return avisos;
}

// Interface de resultados
interface ScrapingResults {
  portugal2030: any[];
  pepac: any[];
  prr: any[];
  transparencia: any[];
  total: number;
  cacheStats: { size: number; oldestEntry: number | null };
}

// Função principal de scraping
export async function runAllScrapers(): Promise<ScrapingResults> {
  console.log('🚀 Iniciando processo completo de scraping...\n');
  console.log('='.repeat(50));

  ensureDirectories();

  const scraper = getScraper();
  const results: ScrapingResults = {
    portugal2030: [],
    pepac: [],
    prr: [],
    transparencia: [],
    total: 0,
    cacheStats: scraper.getCacheStats(),
  };

  try {
    // 0. Transparência Portugal (fonte principal/agregadora)
    console.log('\n🏛️ [0/4] Transparência Portugal (Agregador Oficial)');
    console.log('-'.repeat(40));
    results.transparencia = await scrapeTransparencia();
    results.transparencia = await processAvisosPDFs(results.transparencia);
    saveToJSON(results.transparencia, 'transparencia_avisos.json');

    // 1. Portugal 2030
    console.log('\n📊 [1/4] Portugal 2030');
    console.log('-'.repeat(40));
    results.portugal2030 = await scrapePortugal2030();
    results.portugal2030 = await processAvisosPDFs(results.portugal2030);
    saveToJSON(results.portugal2030, 'portugal2030_avisos.json');

    // 2. PEPAC
    console.log('\n🌾 [2/4] PEPAC/PDR');
    console.log('-'.repeat(40));
    results.pepac = await scrapePEPAC();
    results.pepac = await processAvisosPDFs(results.pepac);
    saveToJSON(results.pepac, 'pepac_avisos.json');

    // 3. PRR
    console.log('\n🔄 [3/4] PRR');
    console.log('-'.repeat(40));
    results.prr = await scrapePRR();
    results.prr = await processAvisosPDFs(results.prr);
    saveToJSON(results.prr, 'prr_avisos.json');

    // Combinar todos os avisos (com deduplicação)
    const allAvisos = deduplicateAvisos([
      ...results.transparencia,
      ...results.portugal2030,
      ...results.pepac,
      ...results.prr,
    ]);
    results.total = allAvisos.length;

    // Salvar arquivo consolidado
    saveToJSON(allAvisos, 'all_avisos.json');

    // Atualizar cache stats
    results.cacheStats = scraper.getCacheStats();

    // Salvar metadados
    const metadata = {
      lastUpdate: new Date().toISOString(),
      sources: {
        transparencia: results.transparencia.length,
        portugal2030: results.portugal2030.length,
        pepac: results.pepac.length,
        prr: results.prr.length,
      },
      total: results.total,
      pdfsDownloaded: allAvisos.filter(a => a.pdf_local).length,
      cacheStats: results.cacheStats,
    };
    saveToJSON([metadata], 'scraping_metadata.json');

    console.log('\n' + '='.repeat(50));
    console.log('✅ SCRAPING COMPLETO!');
    console.log(`   🏛️ Transparência: ${results.transparencia.length} avisos`);
    console.log(`   📊 Portugal 2030: ${results.portugal2030.length} avisos`);
    console.log(`   🌾 PEPAC: ${results.pepac.length} avisos`);
    console.log(`   🔄 PRR: ${results.prr.length} avisos`);
    console.log(`   📄 Total (deduplicado): ${results.total} avisos`);
    console.log(`   📥 PDFs: ${allAvisos.filter(a => a.pdf_local).length} ficheiros`);
    console.log(`   📦 Cache: ${results.cacheStats.size} entradas`);
    console.log('='.repeat(50));

  } catch (error: any) {
    console.error('❌ Erro durante scraping:', error.message);
  }

  return results;
}

// Deduplicar avisos por URL ou título similar
function deduplicateAvisos(avisos: any[]): any[] {
  const seen = new Map<string, any>();

  for (const aviso of avisos) {
    // Chave de deduplicação: URL ou título normalizado
    const urlKey = aviso.url?.toLowerCase().replace(/\/$/, '') || '';
    const titleKey = aviso.titulo?.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 50) || '';
    const key = urlKey || titleKey;

    if (!key) continue;

    // Se já existe, manter o com mais informação
    const existing = seen.get(key);
    if (!existing || (aviso.descricao?.length || 0) > (existing.descricao?.length || 0)) {
      seen.set(key, aviso);
    }
  }

  return Array.from(seen.values());
}

// Se executado diretamente
if (require.main === module) {
  runAllScrapers()
    .then(() => {
      console.log('\n🏁 Processo terminado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro fatal:', error);
      process.exit(1);
    });
}

export default runAllScrapers;
