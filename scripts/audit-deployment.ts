/**
 * Exhaustive Deployment Audit Script
 * Usage: npx tsx scripts/audit-deployment.ts <URL>
 */

import crypto from 'crypto';

const BASE_URL = process.argv[2];

if (!BASE_URL) {
    console.error('❌ Usage: npx tsx scripts/audit-deployment.ts <URL>');
    process.exit(1);
}

console.log(`🔍 Starting AUDIT for: ${BASE_URL}`);
console.log('━'.repeat(60));

async function fetchWithTiming(url: string, options: RequestInit = {}) {
    const start = performance.now();
    try {
        const res = await fetch(url, {
            ...options,
            headers: {
                'User-Agent': 'TA-Consulting-Auditor/1.0',
                ...options.headers,
            }
        });
        const duration = (performance.now() - start).toFixed(0);
        return {
            status: res.status,
            ok: res.ok,
            duration: parseInt(duration),
            text: await res.text(),
            headers: res.headers,
        };
    } catch (error: any) {
        return {
            status: 0,
            ok: false,
            duration: 0,
            text: error.message,
            headers: new Headers(),
        };
    }
}

async function main() {
    const results: any[] = [];

    // 1. Static Pages
    const pages = ['/', '/dashboard', '/quick-match', '/404-test-fake-url'];

    for (const page of pages) {
        process.stdout.write(`📄 Checking ${page}... `);
        const res = await fetchWithTiming(`${BASE_URL}${page}`);

        const expectedStatus = page.includes('404') ? 404 : 200;
        // Dashboard might redirect (307)
        const isRedirect = page === '/dashboard' && res.status === 200 && res.text.includes('Sign in'); // Or if it loaded auth page

        // Simple heuristic for success
        const success = (res.status === expectedStatus) || (page === '/dashboard' && res.status === 200);

        console.log(`${success ? '✅' : '❌'} [${res.status}] ${res.duration}ms`);

        results.push({
            type: 'page',
            url: page,
            status: res.status,
            success,
            duration: res.duration
        });
    }

    // 2. API: Quick Match (Critical)
    console.log('\n⚡ Testing API: Quick Match...');
    const qmPayload = {
        setor: "tecnologia",
        regiao: "norte",
        dimensao: "PEQUENA",
        objetivo: "inovacao"
    };

    const qmRes = await fetchWithTiming(`${BASE_URL}/api/quick-match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(qmPayload)
    });

    let qmSuccess = false;
    let qmMatches = 0;
    try {
        const json = JSON.parse(qmRes.text);
        if (json.matches) {
            qmSuccess = true;
            qmMatches = json.matches.length;
        }
    } catch (e) { }

    console.log(`${qmSuccess ? '✅' : '❌'} [${qmRes.status}] ${qmMatches} matches found (${qmRes.duration}ms)`);
    results.push({ type: 'api', name: 'quick-match', success: qmSuccess, duration: qmRes.duration, matches: qmMatches });

    // 3. API: Avisos (Database Connectivity)
    console.log('\n💾 Testing API: db connection (avisos)...');
    const dbRes = await fetchWithTiming(`${BASE_URL}/api/avisos?limit=1`);
    let dbSuccess = false;
    try {
        const json = JSON.parse(dbRes.text);
        if (json.avisos && Array.isArray(json.avisos)) {
            dbSuccess = true;
        }
    } catch (e) { }
    console.log(`${dbSuccess ? '✅' : '❌'} [${dbRes.status}] ${dbSuccess ? 'DB Connected' : 'DB Error'} (${dbRes.duration}ms)`);
    results.push({ type: 'api', name: 'avisos-db', success: dbSuccess, duration: dbRes.duration });


    // 4. API: Lead Submit (Write Test)
    console.log('\n📝 Testing API: Lead Submit (Write)...');
    const leadPayload = {
        nomeEmpresa: `Audit Test ${Date.now()}`,
        email: `audit-${Date.now()}@test.com`,
        distrito: "Lisboa",
        tipoProjetoDesejado: "internacionalizacao",
        nif: Math.floor(Math.random() * 900000000 + 100000000).toString(), // Random NIF
        telefone: "910000000"
    };

    const leadRes = await fetchWithTiming(`${BASE_URL}/api/leads/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadPayload)
    });

    let leadSuccess = false;
    try {
        const json = JSON.parse(leadRes.text);
        if (json.success === true && json.leadId) {
            leadSuccess = true;
        } else {
            console.log('Lead Error:', json);
        }
    } catch (e) { }

    console.log(`${leadSuccess ? '✅' : '❌'} [${leadRes.status}] ${leadSuccess ? 'Lead Saved' : 'Failed'} (${leadRes.duration}ms)`);
    results.push({ type: 'api', name: 'lead-submit', success: leadSuccess, duration: leadRes.duration });


    // Summary
    console.log('\n' + '━'.repeat(60));
    const allPassed = results.every(r => r.success);
    if (allPassed) {
        console.log('🏆 AUDIT PASSED: All checks green!');
    } else {
        console.error('⚠️ AUDIT FAILED: Some checks failed.');
    }
}

main();
