#!/usr/bin/env node

/**
 * Test script para browser automation endpoint
 */

async function testBrowserAutomation() {
    console.log('🧪 Testando Browser Automation Endpoint...\n');

    const portais = ['portugal2030', 'prr', 'pepac', 'ipdj'];

    for (const portal of portais) {
        console.log(`\n=== ${portal.toUpperCase()} ===`);

        const startTime = Date.now();

        try {
            const response = await fetch('http://localhost:3001/api/scraper/browser-automation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    portal: portal,
                    options: {
                        interceptApi: true,
                        waitTime: 5000
                    }
                })
            });

            const duration = Date.now() - startTime;
            const result = await response.json();

            console.log(`✅ Success: ${result.success}`);
            console.log(`📊 Count: ${result.count || 0}`);
            console.log(`⏱️ Duration: ${duration}ms`);
            console.log(`🔧 Method: ${result.method || 'N/A'}`);

            if (result.error) {
                console.log(`❌ Error: ${result.error}`);
            }

            if (result.data && result.data.length > 0) {
                console.log(`\n📋 Sample (${result.data.length} total):`);
                result.data.slice(0, 2).forEach((item, i) => {
                    console.log(`\n${i + 1}. ${item.titulo || 'Sem título'}`);
                    if (item.descricao) {
                        console.log(`   ${item.descricao.substring(0, 100)}...`);
                    }
                    if (item.url) console.log(`   URL: ${item.url}`);
                });
            }

        } catch (error) {
            console.log(`💥 Erro: ${error.message}`);
        }

        // Delay entre testes
        await new Promise(resolve => setTimeout(resolve, 3000));
    }
}

testBrowserAutomation().catch(console.error);