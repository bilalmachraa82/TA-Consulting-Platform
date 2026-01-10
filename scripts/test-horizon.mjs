#!/usr/bin/env node

/**
 * Test API Horizon Europe (EU Funding & Tenders)
 */

const HORIZON_API_URL = 'https://ec.europa.eu/info/funding-tenders/opportunities/data/topic-details_en';
const HORIZON_RSS_URL = 'https://ec.europa.eu/info/funding-tenders/opportunities/rss_en';

async function testHorizonRSS() {
    console.log('🔍 Testando RSS Horizon Europe...\n');

    try {
        const response = await fetch(HORIZON_RSS_URL);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const text = await response.text();
        const items = text.match(/<item>([\s\S]*?)<\/item>/g) || [];

        console.log(`📊 Total de itens no RSS: ${items.length}`);

        const oportunidades = items.slice(0, 5).map((item, i) => {
            const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
            const link = item.match(/<link>(.*?)<\/link>/);
            const desc = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/);

            return {
                id: `HORIZON_${i + 1}`,
                titulo: title ? title[1] : 'Sem título',
                url: link ? link[1] : '',
                descricao: desc ? desc[1].replace(/<[^>]*>/g, '').substring(0, 200) + '...' : '',
                fonte: 'Horizon Europe',
                data_fecho: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            };
        });

        oportunidades.forEach((opp, i) => {
            console.log(`\n${i + 1}. ${opp.titulo}`);
            console.log(`   ${opp.descricao}`);
            console.log(`   URL: ${opp.url}`);
        });

        return oportunidades;

    } catch (error) {
        console.error('❌ Erro no RSS:', error.message);
        return [];
    }
}

async function testHorizonPortal() {
    console.log('\n\n🌐 Testando API Portal Horizon Europe...\n');

    // Usando a API de oportunidades do portal
    const apiUrl = 'https://ec.europa.eu/info/funding-tenders/opportunities/closed_en?reference=Horizon%20Europe';

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const html = await response.text();
        const matches = html.match(/<a[^>]*href="([^"]*)"[^>]*>([^<]*(?:Horizon|HORIZON)[^<]*)<\/a>/g) || [];

        console.log(`📊 Oportunidades encontradas: ${matches.length}`);

        const oportunidades = matches.slice(0, 5).map((match, i) => {
            const urlMatch = match.match(/href="([^"]*)"/);
            const titleMatch = match.match(/>([^<]+)</);

            return {
                id: `HORIZON_${i + 1}`,
                titulo: titleMatch ? titleMatch[1] : 'Sem título',
                url: urlMatch ? urlMatch[1] : '',
                fonte: 'Horizon Europe',
                programa: 'Horizon Europe',
                scraped_at: new Date().toISOString()
            };
        });

        oportunidades.forEach((opp, i) => {
            console.log(`\n${i + 1}. ${opp.titulo}`);
            console.log(`   URL: ${opp.url}`);
        });

        return oportunidades;

    } catch (error) {
        console.error('❌ Erro na API Portal:', error.message);
        return [];
    }
}

async function main() {
    console.log('🚀 Testando APIs Horizon Europe\n');

    const rssResults = await testHorizonRSS();
    const portalResults = await testHorizonPortal();

    console.log('\n\n📈 RESUMO:');
    console.log(`- RSS: ${rssResults.length} oportunidades`);
    console.log(`- Portal: ${portalResults.length} oportunidades`);
    console.log(`- Total: ${rssResults.length + portalResults.length} oportunidades`);
}

main().catch(console.error);