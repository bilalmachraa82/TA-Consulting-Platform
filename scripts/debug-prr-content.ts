
import { BrowserAutomation } from '../lib/scraper/browser-automation';
import fs from 'fs';

async function main() {
    console.log('🔍 Debugging PRR Content...');
    const scraper = new BrowserAutomation();
    const page = await scraper.initialize({ screenshots: true });

    try {
        await page.goto('https://recuperarportugal.gov.pt/candidaturas-prr/', {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });

        await new Promise(r => setTimeout(r, 5000));

        // Capture HTML
        const content = await page.content();
        fs.writeFileSync('prr_dump.html', content);
        console.log('📄 Saved HTML to prr_dump.html');

        // Capture Screenshot
        await page.screenshot({ path: 'prr_debug.png', fullPage: true });
        console.log('📸 Saved Screenshot to prr_debug.png');

    } catch (e) {
        console.error(e);
    } finally {
        await scraper.close();
    }
}

main();
