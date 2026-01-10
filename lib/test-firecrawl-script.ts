import 'dotenv/config';
import '../zod-v3-shim';
import { scrapeAvisos } from './firecrawl';
import { PORTAL_CONFIGS } from './scraper/portal-configs';

async function testScraping() {
    const portalArg = process.argv[2] || 'portugal2030';
    const config = PORTAL_CONFIGS[portalArg];

    if (!config) {
        console.error(`Portal inválido. Use um de: ${Object.keys(PORTAL_CONFIGS).join(', ')}`);
        process.exit(1);
    }

    console.log(`🧪 Testando scraping para ${config.name}...`);
    console.log(`URL: ${config.avisoUrls[0]}`);

    const start = Date.now();
    const avisos = await scrapeAvisos(config.avisoUrls[0], {
        prompt: config.prompt,
        actions: config.actions,
        waitFor: config.waitFor,
    });
    const duration = Date.now() - start;

    console.log(`\n✅ Resultado (${duration}ms):`);
    console.log(`Avisos encontrados: ${avisos.length}`);

    if (avisos.length > 0) {
        console.log('\nPrimeiro aviso extraído:');
        console.log(JSON.stringify(avisos[0], null, 2));
    } else {
        console.warn('\n⚠️ Nenhum aviso extraído. Verifique prompt ou ações.');
    }
}

// Executar teste
testScraping().catch(console.error);
