/**
 * Diagnóstico de Scrapers - Testa cada portal individualmente
 * 
 * @usage npx ts-node src/diagnose.ts
 */

import 'dotenv/config';
import axios from 'axios';
import {
    scrapePRR,
    scrapeCORDIS,
    scrapePEPAC,
    scrapeEuropaCriativa,
} from './lib';

interface DiagnosticResult {
    portal: string;
    status: 'OK' | 'FALLBACK' | 'FAIL';
    count: number;
    duration: number;
    error?: string;
    sample?: any;
}

const results: DiagnosticResult[] = [];

async function diagnosePortugal2030(): Promise<DiagnosticResult> {
    const start = Date.now();
    try {
        // Test WordPress REST endpoint (the one that actually works)
        const response = await axios.get(
            'https://portugal2030.pt/wp-json/wp/v2/aviso-2024',
            {
                params: { per_page: 10, page: 1, orderby: 'date', order: 'desc' },
                headers: {
                    'User-Agent': 'Mozilla/5.0',
                    'Accept': 'application/json',
                },
                timeout: 30000,
            }
        );

        const avisos = Array.isArray(response.data) ? response.data : [];
        const sample = avisos[0];

        return {
            portal: 'Portugal 2030',
            status: avisos.length > 0 ? 'OK' : 'FAIL',
            count: avisos.length,
            duration: Date.now() - start,
            sample: sample ? {
                codigo: sample.acf?.codigo || `PT2030-${sample.id}`,
                titulo: (sample.title?.rendered || '').substring(0, 50)
            } : undefined,
        };
    } catch (err: any) {
        return {
            portal: 'Portugal 2030',
            status: 'FAIL',
            count: 0,
            duration: Date.now() - start,
            error: err.message,
        };
    }
}

async function diagnosePRR(): Promise<DiagnosticResult> {
    const start = Date.now();
    try {
        const avisos = await scrapePRR({ maxItems: 10, onlyOpen: false });

        // Check if it's fallback data
        const isFallback = avisos.some(a => a.id?.includes('FB-'));

        return {
            portal: 'PRR',
            status: isFallback ? 'FALLBACK' : avisos.length > 0 ? 'OK' : 'FAIL',
            count: avisos.length,
            duration: Date.now() - start,
            sample: avisos[0] ? { id: avisos[0].id, titulo: avisos[0].titulo?.substring(0, 50) } : undefined,
        };
    } catch (err: any) {
        return {
            portal: 'PRR',
            status: 'FAIL',
            count: 0,
            duration: Date.now() - start,
            error: err.message,
        };
    }
}

async function diagnosePEPAC(): Promise<DiagnosticResult> {
    const start = Date.now();
    try {
        const avisos = await scrapePEPAC({ maxItems: 10, onlyOpen: false });

        const isFallback = avisos.some(a => a.id?.includes('FB-'));

        return {
            portal: 'PEPAC',
            status: isFallback ? 'FALLBACK' : avisos.length > 0 ? 'OK' : 'FAIL',
            count: avisos.length,
            duration: Date.now() - start,
            sample: avisos[0] ? { id: avisos[0].id, titulo: avisos[0].titulo?.substring(0, 50) } : undefined,
        };
    } catch (err: any) {
        return {
            portal: 'PEPAC',
            status: 'FAIL',
            count: 0,
            duration: Date.now() - start,
            error: err.message,
        };
    }
}

async function diagnoseHorizon(): Promise<DiagnosticResult> {
    const start = Date.now();
    try {
        const avisos = await scrapeCORDIS({ maxItems: 10, onlyOpen: true });

        return {
            portal: 'Horizon Europe (CORDIS)',
            status: avisos.length > 0 ? 'OK' : 'FAIL',
            count: avisos.length,
            duration: Date.now() - start,
            sample: avisos[0] ? { id: avisos[0].id, titulo: avisos[0].titulo?.substring(0, 50) } : undefined,
        };
    } catch (err: any) {
        return {
            portal: 'Horizon Europe (CORDIS)',
            status: 'FAIL',
            count: 0,
            duration: Date.now() - start,
            error: err.message,
        };
    }
}

async function diagnoseEuropaCriativa(): Promise<DiagnosticResult> {
    const start = Date.now();
    try {
        const avisos = await scrapeEuropaCriativa({ maxItems: 10, onlyOpen: false });

        return {
            portal: 'Europa Criativa',
            status: avisos.length > 0 ? 'OK' : 'FAIL',
            count: avisos.length,
            duration: Date.now() - start,
            sample: avisos[0] ? { id: avisos[0].id, titulo: avisos[0].titulo?.substring(0, 50) } : undefined,
        };
    } catch (err: any) {
        return {
            portal: 'Europa Criativa',
            status: 'FAIL',
            count: 0,
            duration: Date.now() - start,
            error: err.message,
        };
    }
}

async function diagnoseIPDJ(): Promise<DiagnosticResult> {
    const start = Date.now();
    try {
        // Test a specific IPDJ page
        const response = await axios.get('https://ipdj.gov.pt/apoio-e-financiamento-jovem', {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 15000,
        });

        const hasContent = response.data && response.data.length > 1000;

        return {
            portal: 'IPDJ',
            status: hasContent ? 'OK' : 'FAIL',
            count: hasContent ? 1 : 0,
            duration: Date.now() - start,
        };
    } catch (err: any) {
        return {
            portal: 'IPDJ',
            status: 'FAIL',
            count: 0,
            duration: Date.now() - start,
            error: err.message,
        };
    }
}

async function runDiagnostics(): Promise<void> {
    console.log('\n' + '═'.repeat(60));
    console.log('🔍 DIAGNÓSTICO DE SCRAPERS');
    console.log('═'.repeat(60) + '\n');

    console.log('📡 Testando Portugal 2030...');
    results.push(await diagnosePortugal2030());

    console.log('📡 Testando PRR...');
    results.push(await diagnosePRR());

    console.log('📡 Testando PEPAC...');
    results.push(await diagnosePEPAC());

    console.log('📡 Testando Horizon Europe...');
    results.push(await diagnoseHorizon());

    console.log('📡 Testando Europa Criativa...');
    results.push(await diagnoseEuropaCriativa());

    console.log('📡 Testando IPDJ...');
    results.push(await diagnoseIPDJ());

    // Summary
    console.log('\n' + '═'.repeat(60));
    console.log('📊 RESULTADOS');
    console.log('═'.repeat(60));

    let totalCount = 0;
    let okCount = 0;
    let fallbackCount = 0;
    let failCount = 0;

    for (const r of results) {
        const icon = r.status === 'OK' ? '✅' : r.status === 'FALLBACK' ? '⚠️' : '❌';
        console.log(`${icon} ${r.portal.padEnd(25)} | ${r.status.padEnd(8)} | ${r.count} avisos | ${r.duration}ms`);
        if (r.error) console.log(`   └── Erro: ${r.error.substring(0, 60)}`);
        if (r.sample) console.log(`   └── Amostra: ${JSON.stringify(r.sample)}`);

        totalCount += r.count;
        if (r.status === 'OK') okCount++;
        else if (r.status === 'FALLBACK') fallbackCount++;
        else failCount++;
    }

    console.log('\n' + '─'.repeat(60));
    console.log(`📈 RESUMO: ${okCount} OK, ${fallbackCount} FALLBACK, ${failCount} FAIL`);
    console.log(`📋 TOTAL AVISOS: ${totalCount}`);
    console.log('═'.repeat(60) + '\n');

    // Save results
    const fs = await import('fs');
    const path = await import('path');
    const outputPath = path.join(__dirname, '../storage/diagnostic-results.json');
    fs.writeFileSync(outputPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        results,
        summary: { total: totalCount, ok: okCount, fallback: fallbackCount, fail: failCount }
    }, null, 2));
    console.log(`💾 Resultados guardados em: ${outputPath}`);
}

runDiagnostics()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('❌ Erro fatal:', err);
        process.exit(1);
    });
