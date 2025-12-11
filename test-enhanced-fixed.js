const portals = [
    { portal: 'portugal2030', name: 'Portugal 2030' },
    { portal: 'prr', name: 'PRR' },
    { portal: 'horizon-europe', name: 'Horizon Europe' },
    { portal: 'pepac', name: 'PEPAC' },
    { portal: 'europa-criativa', name: 'Europa Criativa' },
    { portal: 'ipdj', name: 'IPDJ' }
];

async function testPortal(portalInfo) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🚀 Testando portal: ${portalInfo.name}`);
    console.log(`${'='.repeat(60)}`);

    const startTime = Date.now();

    try {
        const response = await fetch('http://localhost:3002/api/scraper/firecrawl/enhanced', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                portal: portalInfo.portal,
                forceQuality: true
            })
        });

        const data = await response.json();
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        console.log(`\n✅ Status: ${response.status} (${response.statusText})`);
        console.log(`⏱️  Duração: ${duration}s`);
        console.log(`✅ Success: ${data.success}`);
        console.log(`📊 Count: ${data.count || 0}`);
        console.log(`🔧 Method: ${data.method || 'N/A'}`);

        if (data.error) {
            console.log(`❌ Error: ${data.error}`);
        }

        if (data.data && data.data.length > 0) {
            console.log(`\n📋 Primeira oportunidade:`);
            const first = data.data[0];
            console.log(`   Título: ${first.titulo || first.title || 'N/A'}`);
            console.log(`   URL: ${first.url || first.link || 'N/A'}`);
            if (first.data_limite || first.deadline) {
                console.log(`   Deadline: ${first.data_limite || first.deadline}`);
            }
        }

        return { success: true, data };

    } catch (error) {
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`\n❌ Falha na requisição: ${error.message}`);
        console.log(`⏱️  Duração: ${duration}s`);
        return { success: false, error: error.message };
    }
}

async function runAllTests() {
    console.log('🔥 Iniciando testes da Enhanced Route do Scraper');
    console.log(`📅 Data/Hora: ${new Date().toLocaleString('pt-BR')}`);

    const results = {};

    for (const portal of portals) {
        results[portal.portal] = await testPortal(portal);

        // Pequena pausa entre testes para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Resumo final
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 RESUMO DOS TESTES');
    console.log(`${'='.repeat(60)}`);

    let totalSuccess = 0;
    let totalAvisos = 0;

    for (const [portal, result] of Object.entries(results)) {
        const status = result.success ? '✅' : '❌';
        const count = result.data?.data?.length || 0;
        const method = result.data?.data?.method || 'N/A';

        console.log(`${status} ${portal.padEnd(15)} | ${count.toString().padStart(3)} avisos | ${method}`);

        if (result.success) {
            totalSuccess++;
            totalAvisos += count;
        }
    }

    console.log(`${'='.repeat(60)}`);
    console.log(`📈 Portais testados: ${portals.length}`);
    console.log(`✅ Portais com sucesso: ${totalSuccess}`);
    console.log(`📊 Total de avisos: ${totalAvisos}`);
    console.log(`${'='.repeat(60)}`);
}

// Executar todos os testes
runAllTests().catch(console.error);