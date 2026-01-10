
import { scrapePRR } from './apify-actors/super-scraper/src/lib/prr';

async function testPRR() {
    console.log('🔍 Iniciando debug do PRR Scraper...');

    try {
        const avisos = await scrapePRR({
            maxItems: 50,
            onlyOpen: true
        });

        console.log(`\n✅ Resultado: ${avisos.length} avisos encontrados`);

        if (avisos.length > 0) {
            console.log('--- Exemplo do primeiro aviso ---');
            console.log(JSON.stringify(avisos[0], null, 2));

            // Verificar contagem de abertos vs fechados (se onlyOpen=false)
            // mas aqui pedimos onlyOpen=true
        }

        if (avisos.length === 1) {
            console.log('\n⚠️ ALERTA: Apenas 1 aviso retornado. Possível falha no parser ou na fonte.');
        }

    } catch (error) {
        console.error('❌ Erro fatal:', error);
    }
}

testPRR();
