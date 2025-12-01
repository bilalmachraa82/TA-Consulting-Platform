/**
 * Main Scraper Orchestrator
 * Coordena todos os scrapers, download de PDFs e sincronização
 */

import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import scrapePortugal2030 from './portugal2030-scraper';
import scrapePAPAC from './papac-scraper';
import scrapePRR from './prr-scraper';

const DATA_DIR = path.join(process.cwd(), 'data', 'scraped');
const PDFS_DIR = path.join(process.cwd(), 'data', 'pdfs');

// Garantir que os diretórios existem
function ensureDirectories() {
  [DATA_DIR, PDFS_DIR].forEach(dir => {
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

// Função principal de scraping
export async function runAllScrapers(): Promise<{
  portugal2030: any[];
  papac: any[];
  prr: any[];
  total: number;
}> {
  console.log('🚀 Iniciando processo completo de scraping...\n');
  console.log('=' .repeat(50));

  ensureDirectories();

  const results = {
    portugal2030: [] as any[],
    papac: [] as any[],
    prr: [] as any[],
    total: 0,
  };

  try {
    // 1. Portugal 2030
    console.log('\n📊 [1/3] Portugal 2030');
    console.log('-'.repeat(40));
    results.portugal2030 = await scrapePortugal2030();
    results.portugal2030 = await processAvisosPDFs(results.portugal2030);
    saveToJSON(results.portugal2030, 'portugal2030_avisos.json');

    // 2. PAPAC
    console.log('\n🌾 [2/3] PAPAC/PDR');
    console.log('-'.repeat(40));
    results.papac = await scrapePAPAC();
    results.papac = await processAvisosPDFs(results.papac);
    saveToJSON(results.papac, 'papac_avisos.json');

    // 3. PRR
    console.log('\n🔄 [3/3] PRR');
    console.log('-'.repeat(40));
    results.prr = await scrapePRR();
    results.prr = await processAvisosPDFs(results.prr);
    saveToJSON(results.prr, 'prr_avisos.json');

    // Combinar todos os avisos
    const allAvisos = [...results.portugal2030, ...results.papac, ...results.prr];
    results.total = allAvisos.length;

    // Salvar arquivo consolidado
    saveToJSON(allAvisos, 'all_avisos.json');

    // Salvar metadados
    const metadata = {
      lastUpdate: new Date().toISOString(),
      sources: {
        portugal2030: results.portugal2030.length,
        papac: results.papac.length,
        prr: results.prr.length,
      },
      total: results.total,
      pdfsDownloaded: allAvisos.filter(a => a.pdf_local).length,
    };
    saveToJSON([metadata], 'scraping_metadata.json');

    console.log('\n' + '='.repeat(50));
    console.log('✅ SCRAPING COMPLETO!');
    console.log(`   📊 Portugal 2030: ${results.portugal2030.length} avisos`);
    console.log(`   🌾 PAPAC: ${results.papac.length} avisos`);
    console.log(`   🔄 PRR: ${results.prr.length} avisos`);
    console.log(`   📄 Total: ${results.total} avisos`);
    console.log(`   📥 PDFs: ${allAvisos.filter(a => a.pdf_local).length} ficheiros`);
    console.log('='.repeat(50));

  } catch (error: any) {
    console.error('❌ Erro durante scraping:', error.message);
  }

  return results;
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
