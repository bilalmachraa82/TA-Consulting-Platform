
import { BrowserAutomation } from '../lib/scraper/browser-automation';
import fs from 'fs';

async function main() {
    console.log('🔍 Debugging PEPAC Scraper...');
    const scraper = new BrowserAutomation();
    const page = await scraper.initialize({ screenshots: true });

    try {
        console.log('Navigating to IFAP news...');
        await page.goto('https://www.ifap.pt/portal/noticias', {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });

        await new Promise(r => setTimeout(r, 6000));

        // Capture HTML
        const content = await page.content();
        fs.writeFileSync('pepac_dump.html', content);
        console.log('📄 Saved HTML to pepac_dump.html');

        // Capture Screenshot
        await page.screenshot({ path: 'pepac_debug.png', fullPage: true });
        console.log('📸 Saved Screenshot to pepac_debug.png');

    } catch (e) {
        console.error(e);
    } finally {
        await scraper.close();
    }
}

main();
