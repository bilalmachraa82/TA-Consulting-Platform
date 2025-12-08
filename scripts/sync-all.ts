#!/usr/bin/env npx tsx
/**
 * Script Principal de Sincronização
 *
 * Executa:
 * 1. Scraping de todos os portais (Portugal 2030, PEPAC, PRR)
 * 2. Download de PDFs
 * 3. Sincronização com a base de dados
 * 4. Inicialização do sistema RAG
 *
 * Uso: npx tsx scripts/sync-all.ts
 */

import * as path from 'path';
import * as fs from 'fs';

// Configurar caminho base
const BASE_DIR = path.resolve(__dirname, '..');
process.chdir(BASE_DIR);

console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║     🚀 TA CONSULTING - SISTEMA DE SINCRONIZAÇÃO             ║
║                                                              ║
║     Scraping + PDFs + RAG + Base de Dados                   ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);

async function main() {
  const startTime = Date.now();

  try {
    // 1. Importar e executar scrapers
    console.log('\n📡 FASE 1: Scraping de Avisos');
    console.log('═'.repeat(50));

    const { runAllScrapers } = await import('./scrapers');
    const scrapingResults = await runAllScrapers();

    console.log(`\n✅ Scraping concluído: ${scrapingResults.total} avisos`);

    // 2. Verificar dados scraped
    console.log('\n📂 FASE 2: Verificação de Dados');
    console.log('═'.repeat(50));

    const dataDir = path.join(BASE_DIR, 'data', 'scraped');
    const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));

    for (const file of files) {
      const filePath = path.join(dataDir, file);
      const stats = fs.statSync(filePath);
      const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const count = Array.isArray(content) ? content.length : 1;
      console.log(`  📄 ${file}: ${count} registos (${(stats.size / 1024).toFixed(1)}KB)`);
    }

    // 3. Inicializar RAG
    console.log('\n🧠 FASE 3: Inicialização do Sistema RAG');
    console.log('═'.repeat(50));

    const ragSystem = await import('../lib/rag-system');
    await ragSystem.initRAG();

    // Testar pesquisa RAG
    console.log('\n  🔍 Testando pesquisa RAG...');
    const testResults = await ragSystem.searchAvisos('inovação digital PME', {}, 3);
    console.log(`  ✅ Pesquisa teste: ${testResults.length} resultados encontrados`);

    if (testResults.length > 0) {
      console.log(`     Top resultado: "${testResults[0].aviso.titulo}" (${Math.round(testResults[0].score * 100)}%)`);
    }

    // 4. Sincronizar com base de dados
    console.log('\n💾 FASE 4: Sincronização com Base de Dados');
    console.log('═'.repeat(50));

    try {
      await ragSystem.syncToDatabase();
    } catch (dbError: any) {
      console.log(`  ⚠️ Sincronização DB skipped: ${dbError.message}`);
      console.log('     (Os dados estão disponíveis via JSON fallback)');
    }

    // 5. Estatísticas finais
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(1);

    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║     ✅ SINCRONIZAÇÃO COMPLETA!                               ║
║                                                              ║
║     📊 Portugal 2030: ${String(scrapingResults.portugal2030.length).padStart(3)} avisos                        ║
║     🌾 PEPAC:         ${String(scrapingResults.pepac.length).padStart(3)} avisos                        ║
║     🔄 PRR:           ${String(scrapingResults.prr.length).padStart(3)} avisos                        ║
║     ─────────────────────────────────                        ║
║     📋 TOTAL:         ${String(scrapingResults.total).padStart(3)} avisos                        ║
║                                                              ║
║     ⏱️ Tempo total: ${duration}s                               ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);

    // Gerar relatório
    const report = {
      timestamp: new Date().toISOString(),
      duration: `${duration}s`,
      results: {
        portugal2030: scrapingResults.portugal2030.length,
        pepac: scrapingResults.pepac.length,
        prr: scrapingResults.prr.length,
        total: scrapingResults.total,
      },
      ragInitialized: true,
      testSearch: {
        query: 'inovação digital PME',
        resultsCount: testResults.length,
      },
    };

    const reportPath = path.join(dataDir, 'sync_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📝 Relatório guardado: ${reportPath}\n`);

  } catch (error: any) {
    console.error('\n❌ ERRO na sincronização:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Executar
main()
  .then(() => {
    console.log('🏁 Processo terminado com sucesso!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
