/**
 * Scraping Completo - Testa cobertura total de todos os portais
 * 
 * @usage npx ts-node src/scrape-full.ts
 */

import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { scrapePortugal2030 } from './lib/portugal2030';
import { scrapePRR, scrapeCORDIS, scrapeEuropaCriativa } from './lib';

interface FullScrapingResult {
    portal: string;
    count: number;
    duration: number;
    avisos: any[];
}

async function runFullScraping(): Promise<void> {
    console.log('\n' + '═'.repeat(60));
    console.log('🚀 SCRAPING COMPLETO - COBERTURA TOTAL');
    console.log('═'.repeat(60) + '\n');

    const results: FullScrapingResult[] = [];
    const allAvisos: any[] = [];

    // Portugal 2030
    console.log('📡 Scraping Portugal 2030...');
    const pt2030Start = Date.now();
    try {
        const pt2030Avisos = await scrapePortugal2030({ maxItems: 500, onlyOpen: false });
        results.push({
            portal: 'Portugal 2030',
            count: pt2030Avisos.length,
            duration: Date.now() - pt2030Start,
            avisos: pt2030Avisos
        });
        allAvisos.push(...pt2030Avisos);
        console.log(`   ✅ PT2030: ${pt2030Avisos.length} avisos`);
    } catch (err: any) {
        console.log(`   ❌ PT2030: ${err.message}`);
        results.push({ portal: 'Portugal 2030', count: 0, duration: Date.now() - pt2030Start, avisos: [] });
    }

    // PRR
    console.log('📡 Scraping PRR...');
    const prrStart = Date.now();
    try {
        const prrAvisos = await scrapePRR({ maxItems: 600, onlyOpen: false });
        results.push({
            portal: 'PRR',
            count: prrAvisos.length,
            duration: Date.now() - prrStart,
            avisos: prrAvisos
        });
        allAvisos.push(...prrAvisos);
        console.log(`   ✅ PRR: ${prrAvisos.length} avisos`);
    } catch (err: any) {
        console.log(`   ❌ PRR: ${err.message}`);
        results.push({ portal: 'PRR', count: 0, duration: Date.now() - prrStart, avisos: [] });
    }

    // Horizon Europe
    console.log('📡 Scraping Horizon Europe (pode demorar)...');
    const hzStart = Date.now();
    try {
        const hzAvisos = await scrapeCORDIS({ maxItems: 500, onlyOpen: true, includeDocuments: false });
        results.push({
            portal: 'Horizon Europe',
            count: hzAvisos.length,
            duration: Date.now() - hzStart,
            avisos: hzAvisos
        });
        allAvisos.push(...hzAvisos);
        console.log(`   ✅ Horizon: ${hzAvisos.length} avisos`);
    } catch (err: any) {
        console.log(`   ❌ Horizon: ${err.message}`);
        results.push({ portal: 'Horizon Europe', count: 0, duration: Date.now() - hzStart, avisos: [] });
    }

    // Europa Criativa
    console.log('📡 Scraping Europa Criativa...');
    const ecStart = Date.now();
    try {
        const ecAvisos = await scrapeEuropaCriativa({ maxItems: 50, onlyOpen: false, includeDocuments: true });
        results.push({
            portal: 'Europa Criativa',
            count: ecAvisos.length,
            duration: Date.now() - ecStart,
            avisos: ecAvisos
        });
        allAvisos.push(...ecAvisos);
        console.log(`   ✅ Europa Criativa: ${ecAvisos.length} avisos`);
    } catch (err: any) {
        console.log(`   ❌ Europa Criativa: ${err.message}`);
        results.push({ portal: 'Europa Criativa', count: 0, duration: Date.now() - ecStart, avisos: [] });
    }

    // Summary
    console.log('\n' + '═'.repeat(60));
    console.log('📊 RESULTADOS FINAIS');
    console.log('═'.repeat(60));

    let totalCount = 0;
    let totalDuration = 0;
    for (const r of results) {
        console.log(`${r.count > 0 ? '✅' : '❌'} ${r.portal.padEnd(20)} | ${r.count.toString().padStart(4)} avisos | ${(r.duration / 1000).toFixed(1)}s`);
        totalCount += r.count;
        totalDuration += r.duration;
    }

    console.log('─'.repeat(60));
    console.log(`📈 TOTAL: ${totalCount} avisos em ${(totalDuration / 1000).toFixed(1)}s`);
    console.log('═'.repeat(60) + '\n');

    // Save results
    const outputDir = path.join(__dirname, '../storage');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    fs.writeFileSync(
        path.join(outputDir, 'full-scraping-results.json'),
        JSON.stringify({
            timestamp: new Date().toISOString(),
            totalAvisos: totalCount,
            byPortal: results.map(r => ({ portal: r.portal, count: r.count, duration: r.duration })),
        }, null, 2)
    );

    fs.writeFileSync(
        path.join(outputDir, 'all-avisos.json'),
        JSON.stringify(allAvisos, null, 2)
    );

    console.log(`💾 Resultados guardados em: ${outputDir}/`);
}

runFullScraping()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('❌ Erro fatal:', err);
        process.exit(1);
    });
