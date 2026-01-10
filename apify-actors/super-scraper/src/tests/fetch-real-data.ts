/**
 * Fetch Real Data from Portals for V2 Benchmark
 * 
 * Obtém avisos reais dos portais PRR, PEPAC e CORDIS
 * 
 * @usage npx ts-node src/tests/fetch-real-data.ts
 */

import { scrapePRR } from '../lib/prr';
import { scrapePEPAC } from '../lib/pepac';
import { scrapeCORDIS } from '../lib/cordis';
import { AvisoNormalized } from '../lib/types';
import * as fs from 'fs';
import * as path from 'path';

interface RealDataResult {
    prr: AvisoNormalized[];
    pepac: AvisoNormalized[];
    cordis: AvisoNormalized[];
    timestamp: string;
    summary: {
        total: number;
        withDocs: number;
        totalDocs: number;
    };
}

async function fetchRealData(): Promise<RealDataResult> {
    console.log('\n🚀 Fetching REAL data from portals for V2 Benchmark\n');
    console.log('═'.repeat(60));

    const results: RealDataResult = {
        prr: [],
        pepac: [],
        cordis: [],
        timestamp: new Date().toISOString(),
        summary: { total: 0, withDocs: 0, totalDocs: 0 }
    };

    // PRR - Plano de Recuperação e Resiliência
    try {
        console.log('\n🔵 PRR - recuperarportugal.gov.pt');
        console.log('-'.repeat(40));
        const prrData = await scrapePRR({ maxItems: 15, onlyOpen: true });
        results.prr = prrData;
        console.log(`   ✅ ${prrData.length} avisos encontrados`);

        if (prrData.length > 0) {
            const sample = prrData[0];
            console.log(`   📋 Exemplo: ${sample.titulo?.substring(0, 50)}...`);
            console.log(`      Código: ${sample.codigo}`);
            console.log(`      Status: ${sample.status}`);
            console.log(`      Documentos: ${sample.documentos?.length || 0}`);
        }
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        console.log(`   ❌ PRR error: ${msg}`);
    }

    // PEPAC - Plano Estratégico PAC
    try {
        console.log('\n🟢 PEPAC - pepacc.pt');
        console.log('-'.repeat(40));
        const pepacData = await scrapePEPAC({ maxItems: 15, onlyOpen: true });
        results.pepac = pepacData;
        console.log(`   ✅ ${pepacData.length} concursos encontrados`);

        if (pepacData.length > 0) {
            const sample = pepacData[0];
            console.log(`   📋 Exemplo: ${sample.titulo?.substring(0, 50)}...`);
            console.log(`      Código: ${sample.codigo}`);
            console.log(`      Status: ${sample.status}`);
        }
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        console.log(`   ❌ PEPAC error: ${msg}`);
    }

    // CORDIS - Horizon Europe
    try {
        console.log('\n🟠 CORDIS/Horizon Europe - ec.europa.eu');
        console.log('-'.repeat(40));
        const cordisData = await scrapeCORDIS({ maxItems: 15, onlyOpen: true });
        results.cordis = cordisData;
        console.log(`   ✅ ${cordisData.length} calls encontradas`);

        if (cordisData.length > 0) {
            const sample = cordisData[0];
            console.log(`   📋 Exemplo: ${sample.titulo?.substring(0, 50)}...`);
            console.log(`      Código: ${sample.codigo}`);
            console.log(`      Dotação: €${sample.dotacao?.toLocaleString()}`);
        }
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        console.log(`   ❌ CORDIS error: ${msg}`);
    }

    // Calculate summary
    const allAvisos = [...results.prr, ...results.pepac, ...results.cordis];
    results.summary.total = allAvisos.length;
    results.summary.withDocs = allAvisos.filter(a => a.documentos && a.documentos.length > 0).length;
    results.summary.totalDocs = allAvisos.reduce((sum, a) => sum + (a.documentos?.length || 0), 0);

    console.log('\n' + '═'.repeat(60));
    console.log('📊 SUMMARY');
    console.log('═'.repeat(60));
    console.log(`   Total avisos: ${results.summary.total}`);
    console.log(`   Com documentos: ${results.summary.withDocs}`);
    console.log(`   Total documentos: ${results.summary.totalDocs}`);

    // Save to file
    const outputPath = path.join(__dirname, 'real-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`\n💾 Saved to: ${outputPath}`);

    return results;
}

// Run
fetchRealData()
    .then((data) => {
        console.log('\n✨ Fetch complete!');
        process.exit(0);
    })
    .catch((err) => {
        console.error('Fatal error:', err);
        process.exit(1);
    });
