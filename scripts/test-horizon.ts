/**
 * Test script for Horizon Europe Scraper
 * 
 * Usage: npx tsx scripts/test-horizon.ts
 */

import { HorizonEuropeScraper } from '../lib/scraper/strategies/horizon';

async function testHorizonScraper() {
    console.log('🧪 Testing Horizon Europe Scraper...\n');
    console.log('═'.repeat(50));

    const scraper = new HorizonEuropeScraper();

    try {
        const opportunities = await scraper.scrape();

        console.log(`\n📊 Results:`);
        console.log(`   Total opportunities: ${opportunities.length}`);

        if (opportunities.length > 0) {
            console.log(`\n📋 Sample opportunities:`);
            opportunities.slice(0, 5).forEach((opp, i) => {
                console.log(`\n   ${i + 1}. ${opp.title}`);
                console.log(`      ID: ${opp.id}`);
                console.log(`      Programme: ${opp.programme}`);
                console.log(`      Type: ${opp.type}`);
                console.log(`      Deadline: ${opp.deadline}`);
                if (opp.budget) console.log(`      Budget: ${opp.budget}`);
            });
        }

        console.log('\n' + '═'.repeat(50));
        console.log(`✅ HORIZON SCRAPER: ${opportunities.length > 0 ? 'OPERATIONAL' : 'NO DATA (check API)'}`);
        console.log('═'.repeat(50));

        return opportunities.length > 0;
    } catch (error) {
        console.error('❌ Scraper failed:', error);
        return false;
    }
}

testHorizonScraper().then(success => {
    process.exit(success ? 0 : 1);
});
