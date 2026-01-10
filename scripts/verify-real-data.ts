
import axios from 'axios';
import { HorizonEuropeScraper } from '../lib/scraper/strategies/horizon';
import scrapePortugal2030 from './scrapers/portugal2030-scraper';
import { scrapePRR } from './scrapers/prr-scraper';
import scrapePEPAC from './scrapers/pepac-scraper';

async function verifyAll() {
    console.log("🔍 STARTING LIVE DATA VERIFICATION (NO MOCKS)...\n");

    const results: any[] = [];

    // 1. HORIZON EUROPE
    try {
        console.log("1️⃣  Testing HORIZON EUROPE (API)...");
        const horizon = new HorizonEuropeScraper();
        const data = await horizon.scrape();
        const isFallback = data.length > 0 && data[0].id.includes('CLUSTER');
        results.push({
            portal: 'Horizon Europe',
            status: data.length > 0 ? '✅ OK' : '❌ FAIL',
            count: data.length,
            sample: data[0]?.title,
            mode: isFallback ? '⚠️ FALLBACK (Static)' : '✅ LIVE API'
        });
    } catch (e) {
        results.push({ portal: 'Horizon Europe', status: '❌ ERROR', error: String(e) });
    }

    // 2. PORTUGAL 2030
    try {
        console.log("\n2️⃣  Testing PORTUGAL 2030 (Puppeteer)...");
        // Mock the next response object/params if needed, or just run logic
        // The script exports a default function
        const data = await scrapePortugal2030();
        results.push({
            portal: 'Portugal 2030',
            status: data && data.length > 0 ? '✅ OK' : '⚠️ EMPTY',
            count: data?.length || 0,
            sample: data?.[0]?.titulo,
            mode: '✅ LIVE SCRAPE'
        });
    } catch (e) {
        results.push({ portal: 'Portugal 2030', status: '❌ ERROR', error: String(e) });
    }

    // 3. PRR
    try {
        console.log("\n3️⃣  Testing PRR (Puppeteer)...");
        const data = await scrapePRR();
        results.push({
            portal: 'PRR',
            status: data && data.length > 0 ? '✅ OK' : '⚠️ EMPTY',
            count: data?.length || 0,
            sample: data?.[0]?.titulo,
            mode: '✅ LIVE SCRAPE'
        });
    } catch (e) {
        results.push({ portal: 'PRR', status: '❌ ERROR', error: String(e) });
    }

    // 4. PEPAC
    try {
        console.log("\n4️⃣  Testing PEPAC (Puppeteer)...");
        const data = await scrapePEPAC();
        results.push({
            portal: 'PEPAC',
            status: data && data.length > 0 ? '✅ OK' : '⚠️ EMPTY',
            count: data?.length || 0,
            sample: data?.[0]?.titulo,
            mode: '✅ LIVE SCRAPE'
        });
    } catch (e) {
        results.push({ portal: 'PEPAC', status: '❌ ERROR', error: String(e) });
    }

    // 5. IPDJ & 6. EUROPA CRIATIVA (Simple Fetch Test)
    // Since we don't have dedicated exporting scripts in scripts/scrapers for these yet,
    // we will simple-fetch their URLs to prove connectivity.
    const extraPortals = [
        { name: 'IPDJ', url: 'https://ipdj.gov.pt' },
        { name: 'Europa Criativa', url: 'https://www.europacriativa.eu/concursos' }
    ];

    for (const p of extraPortals) {
        try {
            console.log(`\nTesting ${p.name} (Connectivity)...`);
            const res = await axios.get(p.url, { timeout: 15000 });
            results.push({
                portal: p.name,
                status: res.status === 200 ? '✅ OK' : `⚠️ ${res.status}`,
                count: 'N/A (Connectivity only)',
                sample: res.status === 200 ? 'Page reachable' : 'Unreachable',
                mode: '✅ HTTP CHECK'
            });
        } catch (e) {
            results.push({ portal: p.name, status: '❌ ERROR', error: String(e) });
        }
    }

    console.log("\n\n📊 VALIDATION SUMMARY:");
    console.table(results);
}

verifyAll().catch(console.error);
