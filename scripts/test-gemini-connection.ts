#!/usr/bin/env node
/**
 * Gemini API Connection Test Suite
 *
 * Tests:
 * 1. GEMINI_API_KEY configuration
 * 2. Simple API call to verify key works
 * 3. RAG store accessibility (GEMINI_RAG_STORE_ID)
 * 4. Candidaturas store accessibility (GEMINI_CANDIDATURAS_STORE_ID)
 *
 * Usage: npx tsx scripts/test-gemini-connection.ts
 */

import 'dotenv/config';
import axios from 'axios';

const BASE_URL = 'https://generativelanguage.googleapis.com';

// Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_RAG_STORE_ID = process.env.GEMINI_RAG_STORE_ID;
const GEMINI_CANDIDATURAS_STORE_ID = process.env.GEMINI_CANDIDATURAS_STORE_ID;

// ANSI colors for terminal output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
};

function log(message: string, color = 'reset') {
    console.log(`${colors[color as keyof typeof colors]}${message}${colors.reset}`);
}

function success(message: string) {
    log(`[OK] ${message}`, 'green');
}

function error(message: string) {
    log(`[FAIL] ${message}`, 'red');
}

function warn(message: string) {
    log(`[WARN] ${message}`, 'yellow');
}

function info(message: string) {
    log(`[INFO] ${message}`, 'cyan');
}

function section(title: string) {
    console.log('\n' + '='.repeat(60));
    log(title, 'bright');
    console.log('='.repeat(60));
}

// ============================================================================
// TEST 1: Environment Configuration
// ============================================================================
function testEnvironmentConfig(): { passed: boolean; details: string[] } {
    section('TEST 1: Environment Configuration');
    const details: string[] = [];
    let passed = true;

    // Check API Key
    if (GEMINI_API_KEY) {
        const maskedKey = GEMINI_API_KEY.slice(0, 10) + '...' + GEMINI_API_KEY.slice(-4);
        success(`GEMINI_API_KEY is set: ${maskedKey}`);
        details.push(`API Key: ${maskedKey}`);
    } else {
        error('GEMINI_API_KEY is NOT set');
        details.push('API Key: MISSING');
        passed = false;
    }

    // Check RAG Store ID
    if (GEMINI_RAG_STORE_ID) {
        success(`GEMINI_RAG_STORE_ID is set: ${GEMINI_RAG_STORE_ID}`);
        details.push(`RAG Store: ${GEMINI_RAG_STORE_ID}`);
    } else {
        error('GEMINI_RAG_STORE_ID is NOT set');
        details.push('RAG Store: MISSING');
        passed = false;
    }

    // Check Candidaturas Store ID
    if (GEMINI_CANDIDATURAS_STORE_ID) {
        success(`GEMINI_CANDIDATURAS_STORE_ID is set: ${GEMINI_CANDIDATURAS_STORE_ID}`);
        details.push(`Candidaturas Store: ${GEMINI_CANDIDATURAS_STORE_ID}`);
    } else {
        error('GEMINI_CANDIDATURAS_STORE_ID is NOT set');
        details.push('Candidaturas Store: MISSING');
        passed = false;
    }

    return { passed, details };
}

// ============================================================================
// TEST 2: Simple API Call
// ============================================================================
async function testSimpleApiCall(): Promise<{ passed: boolean; details: string[]; response: any }> {
    section('TEST 2: Simple API Call (Basic Model Test)');

    if (!GEMINI_API_KEY) {
        error('Cannot test API call - GEMINI_API_KEY is missing');
        return { passed: false, details: ['API Key missing'], response: null };
    }

    info('Testing with gemini-2.5-flash...');

    try {
        const url = `${BASE_URL}/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        const body = {
            contents: [{
                parts: [{ text: 'Reply with exactly: "API connection successful"' }]
            }],
            generationConfig: {
                maxOutputTokens: 50,
                temperature: 0,
            }
        };

        const startTime = Date.now();
        const response = await axios.post(url, body, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000
        });
        const latency = Date.now() - startTime;

        const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

        if (text.includes('successful') || text.includes('API')) {
            success(`API call successful (${latency}ms)`);
            success(`Response: "${text.trim()}"`);
            return {
                passed: true,
                details: [`Latency: ${latency}ms`, `Response: ${text.trim()}`],
                response: response.data
            };
        } else {
            warn(`API call returned unexpected response: "${text}"`);
            return {
                passed: true,
                details: [`Response: ${text}`, 'Note: Response did not contain expected text'],
                response: response.data
            };
        }

    } catch (err: any) {
        const errorMessage = err.response?.data?.error?.message || err.message;
        const errorCode = err.response?.data?.error?.status || err.response?.status || 'UNKNOWN';

        // Handle specific error types
        if (errorMessage.includes('API key')) {
            error(`API Key invalid: ${errorMessage}`);
        } else if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
            error(`Quota exceeded: ${errorMessage}`);
        } else if (errorCode === 429) {
            error(`Rate limited: ${errorMessage}`);
        } else {
            error(`API call failed: ${errorMessage} (code: ${errorCode})`);
        }

        return {
            passed: false,
            details: [`Error: ${errorMessage}`, `Code: ${errorCode}`],
            response: null
        };
    }
}

// ============================================================================
// TEST 3: RAG Store (EU Funds)
// ============================================================================
async function testRagStore(): Promise<{ passed: boolean; details: string[] }> {
    section('TEST 3: RAG Store (EU Funds)');

    if (!GEMINI_API_KEY) {
        error('Cannot test RAG store - GEMINI_API_KEY is missing');
        return { passed: false, details: ['API Key missing'] };
    }

    if (!GEMINI_RAG_STORE_ID) {
        error('Cannot test RAG store - GEMINI_RAG_STORE_ID is missing');
        return { passed: false, details: ['Store ID missing'] };
    }

    info(`Testing store: ${GEMINI_RAG_STORE_ID}`);
    info('Query: "What is Portugal 2030?"');

    try {
        const url = `${BASE_URL}/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        const body = {
            contents: [{
                parts: [{
                    text: 'What is Portugal 2030? Answer in one sentence.'
                }]
            }],
            tools: [{
                file_search: {
                    file_search_store_names: [GEMINI_RAG_STORE_ID]
                }
            }],
            generationConfig: {
                maxOutputTokens: 500,
                temperature: 0,
            }
        };

        const startTime = Date.now();
        const response = await axios.post(url, body, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 60000
        });
        const latency = Date.now() - startTime;

        const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const groundingMetadata = response.data?.candidates?.[0]?.groundingMetadata;

        if (text.length > 0) {
            success(`RAG store query successful (${latency}ms)`);
            success(`Response length: ${text.length} characters`);

            if (groundingMetadata?.citations || groundingMetadata?.groundingChunks) {
                const citationCount = groundingMetadata.citations?.length ||
                    groundingMetadata.groundingChunks?.length || 0;
                success(`Citations found: ${citationCount}`);
                return {
                    passed: true,
                    details: [
                        `Latency: ${latency}ms`,
                        `Response length: ${text.length} chars`,
                        `Citations: ${citationCount}`
                    ]
                };
            } else {
                warn('No citations in response - RAG may not be finding sources');
                return {
                    passed: true,
                    details: [
                        `Latency: ${latency}ms`,
                        `Response length: ${text.length} chars`,
                        'Warning: No citations found'
                    ]
                };
            }
        } else {
            error('Empty response from RAG store');
            return { passed: false, details: ['Empty response'] };
        }

    } catch (err: any) {
        const errorMessage = err.response?.data?.error?.message || err.message;

        if (errorMessage.includes('not found') || errorMessage.includes('404')) {
            error(`RAG store not found: ${errorMessage}`);
        } else if (errorMessage.includes('permission') || errorMessage.includes('403')) {
            error(`Access denied to RAG store: ${errorMessage}`);
        } else {
            error(`RAG store query failed: ${errorMessage}`);
        }

        return { passed: false, details: [`Error: ${errorMessage}`] };
    }
}

// ============================================================================
// TEST 4: Candidaturas Store
// ============================================================================
async function testCandidaturasStore(): Promise<{ passed: boolean; details: string[] }> {
    section('TEST 4: Candidaturas Store');

    if (!GEMINI_API_KEY) {
        error('Cannot test Candidaturas store - GEMINI_API_KEY is missing');
        return { passed: false, details: ['API Key missing'] };
    }

    if (!GEMINI_CANDIDATURAS_STORE_ID) {
        error('Cannot test Candidaturas store - GEMINI_CANDIDATURAS_STORE_ID is missing');
        return { passed: false, details: ['Store ID missing'] };
    }

    info(`Testing store: ${GEMINI_CANDIDATURAS_STORE_ID}`);
    info('Query: "How to write a project description?"');

    try {
        const url = `${BASE_URL}/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        const body = {
            contents: [{
                parts: [{
                    text: 'How to write a good project description for a grant application? Answer in one sentence.'
                }]
            }],
            tools: [{
                file_search: {
                    file_search_store_names: [GEMINI_CANDIDATURAS_STORE_ID]
                }
            }],
            generationConfig: {
                maxOutputTokens: 500,
                temperature: 0,
            }
        };

        const startTime = Date.now();
        const response = await axios.post(url, body, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 60000
        });
        const latency = Date.now() - startTime;

        const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const groundingMetadata = response.data?.candidates?.[0]?.groundingMetadata;

        if (text.length > 0) {
            success(`Candidaturas store query successful (${latency}ms)`);
            success(`Response length: ${text.length} characters`);

            if (groundingMetadata?.citations || groundingMetadata?.groundingChunks) {
                const citationCount = groundingMetadata.citations?.length ||
                    groundingMetadata.groundingChunks?.length || 0;
                success(`Citations found: ${citationCount}`);
                return {
                    passed: true,
                    details: [
                        `Latency: ${latency}ms`,
                        `Response length: ${text.length} chars`,
                        `Citations: ${citationCount}`
                    ]
                };
            } else {
                warn('No citations in response - RAG may not be finding sources');
                return {
                    passed: true,
                    details: [
                        `Latency: ${latency}ms`,
                        `Response length: ${text.length} chars`,
                        'Warning: No citations found'
                    ]
                };
            }
        } else {
            error('Empty response from Candidaturas store');
            return { passed: false, details: ['Empty response'] };
        }

    } catch (err: any) {
        const errorMessage = err.response?.data?.error?.message || err.message;

        if (errorMessage.includes('not found') || errorMessage.includes('404')) {
            error(`Candidaturas store not found: ${errorMessage}`);
        } else if (errorMessage.includes('permission') || errorMessage.includes('403')) {
            error(`Access denied to Candidaturas store: ${errorMessage}`);
        } else {
            error(`Candidaturas store query failed: ${errorMessage}`);
        }

        return { passed: false, details: [`Error: ${errorMessage}`] };
    }
}

// ============================================================================
// TEST 5: List Available Stores (Bonus)
// ============================================================================
async function testListStores(): Promise<{ passed: boolean; details: string[]; stores: string[] }> {
    section('TEST 5: List Available File Search Stores');

    if (!GEMINI_API_KEY) {
        error('Cannot list stores - GEMINI_API_KEY is missing');
        return { passed: false, details: ['API Key missing'], stores: [] };
    }

    info('Fetching list of File Search Stores...');

    try {
        const url = `${BASE_URL}/v1beta/fileSearchStores?key=${GEMINI_API_KEY}`;
        const response = await axios.get(url, { timeout: 30000 });

        const stores = response.data?.fileSearchStores || [];
        success(`Found ${stores.length} File Search Store(s)`);

        const details: string[] = [`Total stores: ${stores.length}`];

        for (const store of stores) {
            const storeName = store.name || 'unnamed';
            const displayName = store.displayName || 'No display name';
            info(`  - ${storeName} (${displayName})`);
            details.push(`  ${storeName}: ${displayName}`);
        }

        // Check if our configured stores exist
        if (GEMINI_RAG_STORE_ID) {
            const ragExists = stores.some((s: any) => s.name === GEMINI_RAG_STORE_ID);
            if (ragExists) {
                success(`RAG store "${GEMINI_RAG_STORE_ID}" is accessible`);
                details.push(`RAG store: verified`);
            } else {
                warn(`RAG store "${GEMINI_RAG_STORE_ID}" NOT found in list`);
                details.push(`RAG store: NOT FOUND`);
            }
        }

        if (GEMINI_CANDIDATURAS_STORE_ID) {
            const candidaturasExists = stores.some((s: any) => s.name === GEMINI_CANDIDATURAS_STORE_ID);
            if (candidaturasExists) {
                success(`Candidaturas store "${GEMINI_CANDIDATURAS_STORE_ID}" is accessible`);
                details.push(`Candidaturas store: verified`);
            } else {
                warn(`Candidaturas store "${GEMINI_CANDIDATURAS_STORE_ID}" NOT found in list`);
                details.push(`Candidaturas store: NOT FOUND`);
            }
        }

        return { passed: true, details, stores: stores.map((s: any) => s.name) };

    } catch (err: any) {
        const errorMessage = err.response?.data?.error?.message || err.message;
        error(`Failed to list stores: ${errorMessage}`);
        return { passed: false, details: [`Error: ${errorMessage}`], stores: [] };
    }
}

// ============================================================================
// MAIN
// ============================================================================
async function main() {
    console.log('\n' + '='.repeat(60));
    log('GEMINI API CONNECTION TEST SUITE', 'bright');
    log('TA Consulting Platform', 'cyan');
    console.log('='.repeat(60));

    const results = {
        environment: { passed: false, details: [] as string[] },
        apiCall: { passed: false, details: [] as string[] },
        ragStore: { passed: false, details: [] as string[] },
        candidaturasStore: { passed: false, details: [] as string[] },
        listStores: { passed: false, details: [] as string[], stores: [] as string[] },
    };

    // Run tests sequentially
    results.environment = testEnvironmentConfig();
    await new Promise(r => setTimeout(r, 500));

    results.apiCall = await testSimpleApiCall();
    await new Promise(r => setTimeout(r, 1000));

    results.ragStore = await testRagStore();
    await new Promise(r => setTimeout(r, 1000));

    results.candidaturasStore = await testCandidaturasStore();
    await new Promise(r => setTimeout(r, 500));

    results.listStores = await testListStores();

    // ============================================================================
    // SUMMARY
    // ============================================================================
    section('SUMMARY REPORT');

    console.log('\n┌─────────────────────────────────────────────────────────────┐');
    console.log('│                    CONNECTION STATUS                          │');
    console.log('├─────────────────────────────────────────────────────────────┤');

    const statusIcon = (passed: boolean) => passed ? '✅' : '❌';
    const statusLabel = (passed: boolean) => passed ? 'PASS' : 'FAIL';

    console.log(`│ API Connection        : ${statusIcon(results.apiCall.passed)} ${statusLabel(results.apiCall.passed).padEnd(4)} │`);
    console.log(`│ RAG Store (EU Funds)  : ${statusIcon(results.ragStore.passed)} ${statusLabel(results.ragStore.passed).padEnd(4)} │`);
    console.log(`│ Candidaturas Store    : ${statusIcon(results.candidaturasStore.passed)} ${statusLabel(results.candidaturasStore.passed).padEnd(4)} │`);
    console.log(`│ Store List Access     : ${statusIcon(results.listStores.passed)} ${statusLabel(results.listStores.passed).padEnd(4)} │`);

    console.log('└─────────────────────────────────────────────────────────────┘');

    // Recommendations
    console.log('\n📋 DETAILS:');
    console.log('   Environment Configuration:');
    for (const d of results.environment.details) {
        console.log(`     - ${d}`);
    }

    console.log('\n   API Call:');
    for (const d of results.apiCall.details) {
        console.log(`     - ${d}`);
    }

    console.log('\n   RAG Store:');
    for (const d of results.ragStore.details) {
        console.log(`     - ${d}`);
    }

    console.log('\n   Candidaturas Store:');
    for (const d of results.candidaturasStore.details) {
        console.log(`     - ${d}`);
    }

    if (results.listStores.details.length > 0) {
        console.log('\n   Available Stores:');
        for (const d of results.listStores.details) {
            console.log(`     ${d}`);
        }
    }

    // Issues and recommendations
    const issues: string[] = [];

    if (!results.environment.passed) {
        issues.push('Environment variables are not properly configured');
    }
    if (!results.apiCall.passed) {
        issues.push('API key is invalid or quota exceeded');
    }
    if (!results.ragStore.passed && GEMINI_RAG_STORE_ID) {
        issues.push('RAG store is not accessible - check store ID or permissions');
    }
    if (!results.candidaturasStore.passed && GEMINI_CANDIDATURAS_STORE_ID) {
        issues.push('Candidaturas store is not accessible - check store ID or permissions');
    }
    if (results.ragStore.passed && results.apiCall.details.some(d => d.includes('No citations'))) {
        issues.push('RAG store returns responses but without citations - check store has indexed content');
    }

    if (issues.length > 0) {
        console.log('\n⚠️  ISSUES DETECTED:');
        for (const issue of issues) {
            console.log(`     - ${issue}`);
        }

        console.log('\n💡 RECOMMENDATIONS:');
        if (!results.apiCall.passed) {
            console.log('     1. Verify GEMINI_API_KEY is valid at https://aistudio.google.com/app/apikey');
            console.log('     2. Check if quota is exceeded');
            console.log('     3. Ensure the API key has Generative Language API enabled');
        }
        if (!results.ragStore.passed || !results.candidaturasStore.passed) {
            console.log('     1. Verify the store IDs are correct');
            console.log('     2. Ensure stores were created in the same Google Cloud project');
            console.log('     3. Check that files have been uploaded to the stores');
        }
    } else {
        console.log('\n✅ ALL TESTS PASSED - Gemini API is fully functional!');
    }

    console.log('\n' + '='.repeat(60));

    // Exit with appropriate code
    const allPassed = results.apiCall.passed && results.ragStore.passed && results.candidaturasStore.passed;
    process.exit(allPassed ? 0 : 1);
}

main().catch(err => {
    console.error('Unhandled error:', err);
    process.exit(1);
});
