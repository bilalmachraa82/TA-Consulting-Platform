/**
 * Test script for Super Scraper - All Portals
 * Testa: PT2030, PRR (admin-ajax + fallback), Horizon/SEDIA, PEPAC/PEPACC
 */

import axios from 'axios';
import { scrapePRR } from './lib/prr';
import { scrapeCORDIS } from './lib/cordis';
import { scrapePEPAC } from './lib/pepac';

async function testAll() {
    console.log('🧪 TESTES DO SUPER SCRAPER - TODOS OS PORTAIS\n');
    console.log('═'.repeat(60));

    // Test 1: Portugal 2030 API
    console.log('\n📡 1. PORTUGAL 2030');
    console.log('─'.repeat(40));
    try {
        console.log('  ⏳ Testando API /avisos/query...');
        const response = await axios.get('https://portugal2030.pt/wp-json/avisos/query', {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 30000,
        });
        const avisos = response.data?.avisos || [];
        console.log(`  ✅ Avisos com docs: ${avisos.length}`);
        if (avisos[0]?.documentos) {
            console.log(`  📎 Docs no 1º aviso: ${avisos[0].documentos.length}`);
        }

        // aviso-2024
        const acfHead = await axios.head('https://portugal2030.pt/wp-json/wp/v2/aviso-2024?per_page=1', {
            headers: { 'User-Agent': 'Mozilla/5.0' },
        });
        console.log(`  ✅ API aviso-2024: ${acfHead.headers['x-wp-total']} avisos`);

    } catch (error: any) {
        console.log(`  ❌ Erro: ${error.message}`);
    }

    // Test 2: PRR
    console.log('\n📡 2. PRR (Plano de Recuperação e Resiliência)');
    console.log('─'.repeat(40));
    try {
        console.log('  ⏳ Testando scraper PRR (10 avisos)...');
        const avisos = await scrapePRR({ maxItems: 10, onlyOpen: false });
        console.log(`  📊 Scraper retornou: ${avisos.length} avisos`);
        if (avisos[0]) {
            console.log(`  📋 Exemplo: ${avisos[0].titulo.slice(0, 50)}...`);
            console.log(`     Código: ${avisos[0].codigo}`);
            if ((avisos[0] as any).linha) {
                console.log(`     Linha: ${(avisos[0] as any).linha}`);
            }
            if ((avisos[0] as any).subLinha) {
                console.log(`     SubLinha: ${(avisos[0] as any).subLinha}`);
            }
            if ((avisos[0] as any).dataAviso) {
                console.log(`     Data Aviso: ${(avisos[0] as any).dataAviso}`);
            }
            console.log(`     Abertura: ${avisos[0].dataAbertura}`);
            console.log(`     Fecho: ${avisos[0].dataFecho}`);
            console.log(`     Docs: ${avisos[0].documentos?.length || 0}`);
        }

    } catch (error: any) {
        console.log(`  ❌ Erro: ${error.message}`);
    }

    // Test 3: Horizon Europe via SEDIA Search API
    console.log('\n📡 3. HORIZON EUROPE (SEDIA)');
    console.log('─'.repeat(40));
    try {
        console.log('  ⏳ Testando SEDIA API (onlyOpen=true, 20 calls)...');
        let avisos = await scrapeCORDIS({ maxItems: 20, onlyOpen: true });
        if (avisos.length === 0) {
            console.log('  ⚠️  Sem calls com deadline futuro; a testar histórico (onlyOpen=false)...');
            avisos = await scrapeCORDIS({ maxItems: 20, onlyOpen: false });
        }
        console.log(`  📊 Scraper retornou: ${avisos.length} avisos`);
        if (avisos[0]) {
            console.log(`  📋 Exemplo: ${avisos[0].titulo.slice(0, 50)}...`);
            console.log(`     Código: ${avisos[0].codigo}`);
            console.log(`     Deadline: ${avisos[0].dataFecho}`);
        }

    } catch (error: any) {
        console.log(`  ❌ Erro: ${error.message}`);
    }

    // Test 4: PEPAC (PEPACC) API + URLs curadas
    console.log('\n📡 4. PEPAC (PEPACC)');
    console.log('─'.repeat(40));
    try {
        console.log('  ⏳ Testando scraper PEPAC (PEPACC API)...');
        const avisos = await scrapePEPAC({ maxItems: 10, onlyOpen: false });
        console.log(`  📊 Scraper retornou: ${avisos.length} avisos`);
        if (avisos[0]) {
            console.log(`  📋 Exemplo: ${avisos[0].titulo.slice(0, 50)}...`);
            console.log(`     Docs: ${avisos[0].documentos?.length || 0}`);
        }

    } catch (error: any) {
        console.log(`  ❌ PEPAC erro: ${error.message}`);
    }

    console.log('\n' + '═'.repeat(60));
    console.log('✅ TESTES CONCLUÍDOS');

    // Summary
    console.log('\n📊 RESUMO DE COBERTURA:');
    console.log('   PT2030: API /avisos/query + aviso-2024');
    console.log('   PRR: UI admin-ajax getCandidaturas (+ fallback REST)');
    console.log('   Horizon: 93K+ calls via SEDIA API');
    console.log('   PEPAC: concursos via PEPACC API (+ URLs curadas)');
}

testAll().catch(console.error);
