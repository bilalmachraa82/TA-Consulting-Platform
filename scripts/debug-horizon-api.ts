/**
 * Debug script for Horizon Europe API
 * 
 * Usage: npx tsx scripts/debug-horizon-api.ts
 */

async function debugHorizonAPI() {
    console.log('🔍 Debugging Horizon Europe API response...\n');

    const SEARCH_API = 'https://api.tech.ec.europa.eu/search-api/prod/rest/search';

    const query = {
        bool: {
            must: [
                { term: { type: 'topic' } },
                { terms: { 'status.abbreviation': ['open', 'forthcoming'] } },
                { terms: { 'frameworkProgramme.abbreviation': ['HORIZON', 'HE'] } }
            ]
        }
    };

    const params = new URLSearchParams({
        apiKey: 'SEDIA',
        text: '*',
        pageSize: '5',
        pageNumber: '1',
        sort: 'deadlineDate:asc'
    });

    try {
        const response = await fetch(`${SEARCH_API}?${params}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: query,
                languages: ['en']
            })
        });

        console.log('Response status:', response.status);

        const data = await response.json();

        console.log('\n📦 Response structure:');
        console.log('Keys:', Object.keys(data));

        if (data.results) {
            console.log('\nResults count:', data.results.length);
            if (data.results[0]) {
                console.log('\n🔬 First result structure:');
                console.log(JSON.stringify(data.results[0], null, 2));
            }
        } else {
            console.log('\n⚠️ No results array found. Full response:');
            console.log(JSON.stringify(data, null, 2).substring(0, 2000));
        }

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

debugHorizonAPI();
