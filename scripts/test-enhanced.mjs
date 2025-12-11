#!/usr/bin/env node

/**
 * Test script para endpoint enhanced
 */

async function testPortal(portalId, forceQuality = false) {
    const response = await fetch('http://localhost:3001/api/scraper/firecrawl/enhanced', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ portal: portalId, forceQuality })
    });

    const result = await response.json();

    console.log(`\n=== ${portalId.toUpperCase()} ===`);
    console.log(`✅ Success: ${result.success}`);
    console.log(`📊 Count: ${result.count || 0}`);
    console.log(`🔧 Method: ${result.method || 'N/A'}`);
    if (result.error) console.log(`❌ Error: ${result.error}`);

    if (result.data && result.data.length > 0) {
        console.log(`\n📋 Sample (${result.data.length} total):`);
        result.data.slice(0, 2).forEach((item, i) => {
            console.log(`\n${i + 1}. ${item.titulo || item.title || 'Sem título'}`);
            if (item.descricao || item.description) {
                console.log(`   ${item.descricao || item.description}`.substring(0, 100) + '...');
            }
            if (item.url) console.log(`   URL: ${item.url}`);
        });
    }
}

async function main() {
    console.log('🧪 Testando Endpoint Enhanced...\n');

    const portais = ['portugal2030', 'prr', 'pepac', 'europa-criativa', 'ipdj'];

    for (const portal of portais) {
        try {
            await testPortal(portal, true);
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2s entre requisições
        } catch (error) {
            console.log(`\n💥 Erro em ${portal}: ${error.message}`);
        }
    }
}

main().catch(console.error);