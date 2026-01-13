/**
 * TESTE DE TODOS OS ENDPOINTS API
 * ================================
 * Testa todos os endpoints críticos da API
 *
 * Run: npx tsx scripts/test-api-endpoints.ts
 */

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// Colors
const green = '\x1b[32m';
const red = '\x1b[31m';
const yellow = '\x1b[33m';
const cyan = '\x1b[36m';
const reset = '\x1b[0m';
const bright = '\x1b[1m';

let passCount = 0;
let failCount = 0;

function pass(msg: string) {
  passCount++;
  console.log(`${green}✅ PASS${reset}: ${msg}`);
}

function fail(msg: string, error?: string) {
  failCount++;
  console.log(`${red}❌ FAIL${reset}: ${msg}`);
  if (error) console.log(`    ${red}${error}${reset}`);
}

function warn(msg: string) {
  console.log(`${yellow}⚠️  WARN${reset}: ${msg}`);
}

function section(title: string) {
  console.log('\n' + '='.repeat(60));
  console.log(`${bright}${cyan}${title}${reset}`);
  console.log('='.repeat(60));
}

// Test helper
async function testEndpoint(
  name: string,
  path: string,
  expectedStatus: number = 200,
  method: string = 'GET'
): Promise<boolean> {
  try {
    const url = `${BASE_URL}${path}`;
    const options: RequestInit = { method };

    const response = await fetch(url, options);
    const status = response.status;

    // Accept 200 or 401 (401 is OK - means endpoint exists but needs auth)
    if (status === expectedStatus || status === 401) {
      pass(`${name} (${method} ${path}) - Status: ${status}`);
      return true;
    } else if (status === 404) {
      fail(`${name} - NOT FOUND (404)`);
      return false;
    } else if (status === 500) {
      fail(`${name} - SERVER ERROR (500)`);
      return false;
    } else {
      warn(`${name} - Unexpected status: ${status}`);
      return false;
    }
  } catch (error: any) {
    fail(`${name} - Connection failed`, error.message);
    return false;
  }
}

// Main test function
async function runAllTests() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║        TA CONSULTING - API ENDPOINT TEST SUITE           ║');
  console.log(`║        Testing: ${BASE_URL}                                ║`);
  console.log('╚════════════════════════════════════════════════════════════╝');

  // Check if server is running
  try {
    await fetch(BASE_URL, { method: 'HEAD' });
  } catch {
    console.log(`\n${red}ERROR: Server not running at ${BASE_URL}${reset}`);
    console.log(`\n${yellow}Start the server first: npm run dev${reset}\n`);
    process.exit(1);
  }

  // Test pages
  section('FRONTEND PAGES');
  await testEndpoint('Home Page', '/');
  await testEndpoint('Apresentação V5', '/apresentacao-v5');
  await testEndpoint('Dashboard', '/dashboard');
  await testEndpoint('Dashboard Avisos', '/dashboard/avisos');
  await testEndpoint('Dashboard Candidaturas', '/dashboard/candidaturas');
  await testEndpoint('Dashboard Recomendações', '/dashboard/recomendacoes');
  await testEndpoint('Dashboard Empresas', '/dashboard/empresas');
  await testEndpoint('Diagnóstico Fundos', '/diagnostico-fundos');
  await testEndpoint('Pricing', '/pricing');
  await testEndpoint('Quick Match', '/quick-match');

  // Test API endpoints
  section('API ENDPOINTS');
  await testEndpoint('Avisos API', '/api/avisos');
  await testEndpoint('Empresas API', '/api/empresas/by-consultor');
  await testEndpoint('Candidaturas API', '/api/candidaturas');
  await testEndpoint('Recomendações API', '/api/recomendacoes');
  await testEndpoint('RAG API', '/api/rag');
  await testEndpoint('Chat API', '/api/rag/chat');
  await testEndpoint('Bitrix Companies', '/api/bitrix/companies');
  await testEndpoint('Bitrix Stats', '/api/bitrix/stats');
  await testEndpoint('Leads Submit', '/api/leads/submit');
  await testEndpoint('NIF Validate', '/api/leads/validate-nif');
  await testEndpoint('Calendário', '/api/calendario');
  await testEndpoint('Documentos', '/api/documentos');
  await testEndpoint('Workflows', '/api/workflows');
  await testEndpoint('Relatórios', '/api/relatorios');
  await testEndpoint('Stripe Checkout', '/api/stripe/checkout');
  await testEndpoint('Monitoring Health', '/api/monitoring/health');

  // Test presentation variants
  section('PRESENTATION VARIANTS');
  await testEndpoint('Apresentação V1', '/apresentacao-v1');
  await testEndpoint('Apresentação V2', '/apresentacao-v2');
  await testEndpoint('Apresentação V3', '/apresentacao-v3');
  await testEndpoint('Apresentação V4', '/apresentacao-v4');

  // Test auth pages
  section('AUTH PAGES');
  await testEndpoint('Login', '/auth/login');
  await testEndpoint('Register', '/auth/register');

  // Final report
  console.log('\n' + '='.repeat(60));
  console.log(`${bright}FINAL REPORT${reset}`);
  console.log('='.repeat(60));
  console.log(`${green}✅ Passed: ${passCount}${reset}`);
  console.log(`${red}❌ Failed: ${failCount}${reset}`);

  if (failCount === 0) {
    console.log(`\n${green}${bright}🎉 ALL ENDPOINTS ACCESSIBLE!${reset}\n`);
    process.exit(0);
  } else {
    console.log(`\n${red}${bright}⚠️  SOME ENDPOINTS FAILED${reset}\n`);
    process.exit(1);
  }
}

runAllTests();
