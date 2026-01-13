/**
 * TESTE COMPLETO DA TA CONSULTING PLATFORM
 * =========================================
 * Executa todos os testes críticos para garantir que a demo funciona
 *
 * Run: npx tsx scripts/test-complete-audit.ts
 */

import { PrismaClient } from '@prisma/client';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

let passCount = 0;
let failCount = 0;
let warnCount = 0;

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function section(title: string) {
  console.log('\n' + '='.repeat(60));
  log(title, colors.bright + colors.cyan);
  console.log('='.repeat(60));
}

function pass(message: string) {
  passCount++;
  log(`✅ PASS: ${message}`, colors.green);
}

function fail(message: string, error?: any) {
  failCount++;
  log(`❌ FAIL: ${message}`, colors.red);
  if (error) {
    console.log(`   Error: ${error.message || error}`);
  }
}

function warn(message: string) {
  warnCount++;
  log(`⚠️  WARN: ${message}`, colors.yellow);
}

// ============================================================================
// TEST 1: ENVIRONMENT VARIABLES
// ============================================================================
async function testEnvironmentVariables() {
  section('TEST 1: ENVIRONMENT VARIABLES');

  const requiredVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'GEMINI_API_KEY',
  ];

  const recommendedVars = [
    'NEON_API_KEY',
    'OPENROUTER_API_KEY',
    'RESEND_API_KEY',
    'STRIPE_SECRET_KEY',
    'APIFY_TOKEN',
  ];

  for (const varName of requiredVars) {
    if (process.env[varName]) {
      pass(`${varName} is configured`);
    } else {
      fail(`${varName} is MISSING`);
    }
  }

  for (const varName of recommendedVars) {
    if (process.env[varName]) {
      pass(`${varName} is configured`);
    } else {
      warn(`${varName} is not configured (recommended)`);
    }
  }
}

// ============================================================================
// TEST 2: DATABASE CONNECTION
// ============================================================================
async function testDatabaseConnection() {
  section('TEST 2: DATABASE CONNECTION');

  try {
    const prisma = new PrismaClient();

    // Test connection
    await prisma.$connect();
    pass('Database connection successful');

    // Count avisos
    const avisosCount = await prisma.aviso.count();
    pass(`Total avisos: ${avisosCount}`);

    // Count active avisos (not expired)
    const hoje = new Date();
    const activeAvisos = await prisma.aviso.count({
      where: {
        dataFimSubmissao: { gte: hoje },
        ativo: true,
      },
    });
    pass(`Active avisos (not expired): ${activeAvisos}`);

    // Count urgent avisos (within 7 days)
    const seteDias = new Date();
    seteDias.setDate(seteDias.getDate() + 7);
    const urgentAvisos = await prisma.aviso.count({
      where: {
        dataFimSubmissao: { lte: seteDias, gte: hoje },
        ativo: true,
      },
    });
    pass(`Urgent avisos (< 7 days): ${urgentAvisos}`);

    // Count empresas
    const empresasCount = await prisma.empresa.count();
    pass(`Total empresas: ${empresasCount}`);

    // Verify avisos have real data
    const sampleAviso = await prisma.aviso.findFirst({
      where: { ativo: true },
      orderBy: { dataFimSubmissao: 'asc' },
    });
    if (sampleAviso) {
      pass(`Sample aviso found: ${sampleAviso.nome} (deadline: ${sampleAviso.dataFimSubmissao.toISOString().split('T')[0]})`);
    }

    await prisma.$disconnect();
  } catch (error: any) {
    fail('Database connection failed', error);
  }
}

// ============================================================================
// TEST 3: GEMINI AI API
// ============================================================================
async function testGeminiAPI() {
  section('TEST 3: GEMINI AI API');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    fail('GEMINI_API_KEY not configured');
    return;
  }

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const result = await model.generateContent('Test connection - respond with OK');
    const response = await result.response.text();

    if (response.includes('OK') || response.length > 0) {
      pass('Gemini API connection successful');
      pass(`Response: ${response.substring(0, 50)}...`);
    } else {
      fail('Gemini API returned unexpected response');
    }
  } catch (error: any) {
    fail('Gemini API connection failed', error);
  }
}

// ============================================================================
// TEST 4: BITRIX WEBHOOK
// ============================================================================
async function testBitrixWebhook() {
  section('TEST 4: BITRIX24 WEBHOOK');

  const webhookUrl = process.env.BITRIX_WEBHOOK_URL || 'https://taconsulting.bitrix24.com/rest/744/dm213axt003upvfk/';

  try {
    const response = await fetch(`${webhookUrl}profile.json`);
    const data = await response.json();

    if (data.result && data.result.ID) {
      pass(`Bitrix connection successful - User: ${data.result.NAME} ${data.result.LAST_NAME}`);
      pass(`Email: ${data.result.EMAIL}`);
    } else {
      fail('Bitrix returned unexpected response');
    }
  } catch (error: any) {
    fail('Bitrix connection failed', error);
  }
}

// ============================================================================
// TEST 5: FILE SYSTEM CHECKS
// ============================================================================
async function testFileSystem() {
  section('TEST 5: CRITICAL FILES');

  const fs = await import('fs');
  const path = await import('path');

  const criticalFiles = [
    { path: 'lib/db.ts', desc: 'Database client' },
    { path: 'lib/auth.ts', desc: 'Auth configuration' },
    { path: 'lib/data-provider.ts', desc: 'Fallback data provider' },
    { path: 'app/dashboard/page.tsx', desc: 'Dashboard page' },
    { path: 'app/apresentacao-v5/page.tsx', desc: 'Presentation V5' },
    { path: 'app/api/avisos/route.ts', desc: 'Avisos API' },
    { path: 'app/api/recomendacoes/route.ts', desc: 'Recommendations API' },
    { path: 'components/dashboard/avisos-component.tsx', desc: 'Avisos component' },
    { path: 'components/dashboard/candidaturas-component.tsx', desc: 'Candidaturas component' },
  ];

  for (const file of criticalFiles) {
    const filePath = path.join(process.cwd(), file.path);
    if (fs.existsSync(filePath)) {
      pass(`${file.desc} exists (${file.path})`);
    } else {
      fail(`${file.desc} MISSING (${file.path})`);
    }
  }
}

// ============================================================================
// TEST 6: PACKAGE.JSON DEPENDENCIES
// ============================================================================
async function testDependencies() {
  section('TEST 6: CRITICAL DEPENDENCIES');

  const fs = await import('fs');
  const path = await import('path');

  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

    const criticalDeps = [
      'next',
      'react',
      '@prisma/client',
      'next-auth',
      'zod',
      '@google/generative-ai',
    ];

    for (const dep of criticalDeps) {
      if (packageJson.dependencies[dep] || packageJson.devDependencies?.[dep]) {
        pass(`${dep} is installed`);
      } else {
        fail(`${dep} is NOT installed`);
      }
    }
  } catch (error: any) {
    fail('Could not read package.json', error);
  }
}

// ============================================================================
// TEST 7: AVISOS DATA QUALITY
// ============================================================================
async function testAvisosQuality() {
  section('TEST 7: AVISOS DATA QUALITY');

  try {
    const prisma = new PrismaClient();

    // Check for avisos expiring soon (urgent for demo)
    const hoje = new Date();
    const tresDias = new Date();
    tresDias.setDate(tresDias.getDate() + 3);

    const urgentAvisos = await prisma.aviso.findMany({
      where: {
        dataFimSubmissao: { lte: tresDias, gte: hoje },
        ativo: true,
      },
      orderBy: { dataFimSubmissao: 'asc' },
      take: 5,
    });

    if (urgentAvisos.length > 0) {
      pass(`Found ${urgentAvisos.length} urgent avisos (< 3 days):`);
      for (const aviso of urgentAvisos) {
        const diasRestantes = Math.ceil((aviso.dataFimSubmissao.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
        log(`   - ${aviso.nome} (${diasRestantes} days left)`, colors.cyan);
      }
    } else {
      warn('No urgent avisos found (< 3 days)');
    }

    // Check avisos by portal
    const portals = await prisma.aviso.groupBy({
      by: ['portal'],
      _count: true,
    });

    pass('Avisos by portal:');
    for (const group of portals) {
      log(`   - ${group.portal}: ${group._count} avisos`, colors.cyan);
    }

    await prisma.$disconnect();
  } catch (error: any) {
    fail('Could not verify avisos quality', error);
  }
}

// ============================================================================
// TEST 8: EMPRESAS DATA FOR MATCHING
// ============================================================================
async function testEmpresasForMatching() {
  section('TEST 8: EMPRESAS DATA FOR MATCHING');

  try {
    const prisma = new PrismaClient();

    // Count empresas by dimensao
    const porDimensao = await prisma.empresa.groupBy({
      by: ['dimensao'],
      _count: true,
    });

    pass('Empresas by dimensao:');
    for (const group of porDimensao) {
      log(`   - ${group.dimensao || 'N/A'}: ${group._count} empresas`, colors.cyan);
    }

    // Count empresas by region
    const porRegiao = await prisma.empresa.groupBy({
      by: ['regiao'],
      _count: true,
    });

    pass('Top 5 regions:');
    for (const group of porRegiao.slice(0, 5)) {
      log(`   - ${group.regiao || 'N/A'}: ${group._count} empresas`, colors.cyan);
    }

    // Check if empresas have CAE
    const sampleEmpresas = await prisma.empresa.findMany({
      where: { cae: { not: '' } },
      take: 5,
    });

    if (sampleEmpresas.length > 0) {
      pass(`Empresas with CAE: ${sampleEmpresas.length} sample records found`);
    }

    await prisma.$disconnect();
  } catch (error: any) {
    fail('Could not verify empresas data', error);
  }
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================
async function runAllTests() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║   TA CONSULTING PLATFORM - COMPLETE AUDIT TEST SUITE    ║');
  console.log('║   Testing all critical components for demo tomorrow      ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  const startTime = Date.now();

  try {
    await testEnvironmentVariables();
    await testDatabaseConnection();
    await testGeminiAPI();
    await testBitrixWebhook();
    await testFileSystem();
    await testDependencies();
    await testAvisosQuality();
    await testEmpresasForMatching();
  } catch (error) {
    console.error('Fatal error during tests:', error);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  // ============================================================================
  // FINAL REPORT
  // ============================================================================
  console.log('\n' + '='.repeat(60));
  log('FINAL REPORT', colors.bright + colors.cyan);
  console.log('='.repeat(60));

  log(`✅ Passed: ${passCount}`, colors.green);
  log(`❌ Failed: ${failCount}`, failCount > 0 ? colors.red : colors.green);
  log(`⚠️  Warnings: ${warnCount}`, warnCount > 0 ? colors.yellow : colors.green);
  log(`⏱️  Duration: ${duration}s`, colors.cyan);

  if (failCount === 0) {
    console.log('\n' + colors.green + colors.bright);
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                    🎉 ALL TESTS PASSED 🎉                  ║');
    console.log('║              Platform is READY for demo!                  ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(colors.reset);
    process.exit(0);
  } else {
    console.log('\n' + colors.red + colors.bright);
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                  ⚠️  SOME TESTS FAILED ⚠️                  ║');
    console.log('║            Please fix issues before demo!                 ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(colors.reset);
    process.exit(1);
  }
}

runAllTests();
