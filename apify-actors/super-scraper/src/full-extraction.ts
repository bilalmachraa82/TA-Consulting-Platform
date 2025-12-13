/**
 * FULL DATA EXTRACTION - All 6 Portals
 * Tests the actual scraper functions from main.ts
 */

import { scrapePRR, scrapeCORDIS, scrapePEPAC } from './lib';
import axios from 'axios';

// SEDIA API for Europa Criativa
const SEDIA_API = 'https://api.tech.ec.europa.eu/search-api/prod/rest/search';

async function fullExtraction() {
    console.log('🚀 EXTRAÇÃO COMPLETA - TODOS OS PORTAIS');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');

    const results: any = {};

    // 1. PORTUGAL 2030
    console.log('📗 1. PORTUGAL 2030 - Buscando TODOS...');
    try {
        const resp = await axios.get('https://portugal2030.pt/wp-json/wp/v2/aviso-2024?per_page=100', {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 30000,
        });
        const total = resp.headers['x-wp-total'];
        results.pt2030 = { avisos: parseInt(total || '0') };
        console.log(`   ✅ PT2030: ${total} avisos`);
    } catch (e: any) {
        console.log(`   ❌ PT2030 ERRO: ${e.message}`);
        results.pt2030 = { error: e.message };
    }

    // 2. PRR
    console.log('');
    console.log('📘 2. PRR - Buscando TODOS...');
    try {
        const avisos = await scrapePRR({ maxItems: 2000, onlyOpen: false });
        const abertos = avisos.filter(a => a.status === 'Aberto');
        const docs = avisos.reduce((sum, a) => sum + (a.documentos?.length || 0), 0);
        results.prr = { avisos: avisos.length, abertos: abertos.length, docs };
        console.log(`   ✅ PRR: ${avisos.length} avisos (${abertos.length} abertos, ${docs} docs)`);
    } catch (e: any) {
        console.log(`   ❌ PRR ERRO: ${e.message}`);
        results.prr = { error: e.message };
    }

    // 3. PEPAC
    console.log('');
    console.log('📙 3. PEPAC - Buscando TODOS...');
    try {
        const avisos = await scrapePEPAC({ maxItems: 500, onlyOpen: false });
        const docs = avisos.reduce((sum, a) => sum + (a.documentos?.length || 0), 0);
        results.pepac = { avisos: avisos.length, docs };
        console.log(`   ✅ PEPAC: ${avisos.length} avisos (${docs} docs)`);
    } catch (e: any) {
        console.log(`   ❌ PEPAC ERRO: ${e.message}`);
        results.pepac = { error: e.message };
    }

    // 4. HORIZON EUROPE (with expanded years)
    console.log('');
    console.log('📕 4. HORIZON EUROPE - Buscando OPEN + FORTHCOMING...');
    try {
        const avisos = await scrapeCORDIS({ maxItems: 500, onlyOpen: true });
        results.horizon = { avisos: avisos.length };
        console.log(`   ✅ HORIZON: ${avisos.length} calls`);
    } catch (e: any) {
        console.log(`   ❌ HORIZON ERRO: ${e.message}`);
        results.horizon = { error: e.message };
    }

    // 5. EUROPA CRIATIVA via SEDIA API
    console.log('');
    console.log('🎭 5. EUROPA CRIATIVA - SEDIA API com CREA-*...');
    try {
        const response = await axios.post(SEDIA_API, null, {
            params: {
                apiKey: 'SEDIA',
                text: 'CREA',
                status: '31094501,31094502', // Open + Forthcoming
                pageSize: 100,
                pageNumber: 1,
            },
            headers: { 'Accept': 'application/json' },
            timeout: 30000,
        });

        const allResults = response.data?.results || [];
        const creaCalls = allResults.filter((r: any) =>
            r.metadata?.identifier?.[0]?.startsWith('CREA-')
        );
        results.europaCriativa = { total: allResults.length, creaCalls: creaCalls.length };
        console.log(`   ✅ EUROPA CRIATIVA: ${creaCalls.length} calls CREA-* (de ${allResults.length} resultados)`);
    } catch (e: any) {
        console.log(`   ❌ EUROPA CRIATIVA ERRO: ${e.message}`);
        results.europaCriativa = { error: e.message };
    }

    // 6. IPDJ
    console.log('');
    console.log('🏃 6. IPDJ - Páginas de Apoios...');
    const ipdjPages = [
        'https://ipdj.gov.pt/apoio-e-financiamento-jovem',
        'https://ipdj.gov.pt/apoio-e-financiamento-ao-desporto',
        'https://ipdj.gov.pt/apoio-financeiro-ao-desporto-federado',
        'https://ipdj.gov.pt/pae-programa-de-apoio-estudantil',
    ];
    let ipdjSuccess = 0;
    let ipdjDocs = 0;
    for (const url of ipdjPages) {
        try {
            const resp = await axios.get(url, {
                headers: { 'User-Agent': 'Mozilla/5.0' },
                timeout: 15000
            });
            const pdfCount = (resp.data.match(/\.pdf/gi) || []).length;
            ipdjSuccess++;
            ipdjDocs += pdfCount;
        } catch (e: any) {
            console.log(`   ⚠️ ${url}: ${e.message}`);
        }
    }
    results.ipdj = { pages: ipdjSuccess, docs: ipdjDocs };
    console.log(`   ✅ IPDJ: ${ipdjSuccess} páginas OK (${ipdjDocs} refs a PDFs)`);

    // Summary
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📊 RESUMO FINAL');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('| Portal          | Avisos | Docs | Status |');
    console.log('|-----------------|--------|------|--------|');
    console.log(`| PT2030          | ${results.pt2030?.avisos || '?'}     | -    | ${results.pt2030?.error ? '❌' : '✅'} |`);
    console.log(`| PRR             | ${results.prr?.avisos || '?'}    | ${results.prr?.docs || '?'}  | ${results.prr?.error ? '❌' : '✅'} |`);
    console.log(`| PEPAC           | ${results.pepac?.avisos || '?'}     | ${results.pepac?.docs || '?'}    | ${results.pepac?.error ? '❌' : '✅'} |`);
    console.log(`| Horizon         | ${results.horizon?.avisos || '?'}    | -    | ${results.horizon?.error ? '❌' : '✅'} |`);
    console.log(`| Europa Criativa | ${results.europaCriativa?.creaCalls || '?'}      | -    | ${results.europaCriativa?.error ? '❌' : '✅'} |`);
    console.log(`| IPDJ            | ${results.ipdj?.pages || '?'}      | ${results.ipdj?.docs || '?'}    | ${results.ipdj?.pages ? '✅' : '❌'} |`);
    console.log('');

    // Total
    const totalAvisos = (results.pt2030?.avisos || 0) + (results.prr?.avisos || 0) +
        (results.pepac?.avisos || 0) + (results.horizon?.avisos || 0) +
        (results.europaCriativa?.creaCalls || 0) + (results.ipdj?.pages || 0);
    const totalDocs = (results.prr?.docs || 0) + (results.pepac?.docs || 0) + (results.ipdj?.docs || 0);

    console.log(`🎯 TOTAIS: ${totalAvisos} avisos | ${totalDocs} documentos`);
    console.log('');

    return results;
}

fullExtraction().catch(console.error);
