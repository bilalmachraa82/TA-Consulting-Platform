
import { BrowserAutomation } from '../lib/scraper/browser-automation';

async function main() {
    console.log('🚀 Starting Puppeteer Scraper Validation...');

    const scraper = new BrowserAutomation();

    try {
        await scraper.initialize({
            screenshots: true,
            interceptApi: true
        });

        console.log('\n🌾 Testing PEPAC Scraper...');
        const avisos = await scraper.scrapePEPAC();

        console.log(`\n✅ Result: ${avisos.length} avisos found.`);
        if (avisos.length > 0) {
            console.log('📋 First Result Sample:', JSON.stringify(avisos[0], null, 2));
        }

    } catch (error) {
        console.error('💥 Scraper Validation Failed:', error);
    } finally {
        await scraper.close();
    }
}

main();
