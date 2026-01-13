/**
 * Database Connection Test Script
 *
 * This script tests the Neon database connection and provides a detailed report including:
 * 1. Connection status
 * 2. Tables found
 * 3. Row counts
 * 4. Sample data verification
 *
 * Usage: npx tsx scripts/test-db-connection.ts
 */

import { PrismaClient } from '@prisma/client';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

const status = {
  success: (text: string) => `${colors.green}${colors.bright}✓${colors.reset} ${text}`,
  error: (text: string) => `${colors.red}${colors.bright}✗${colors.reset} ${text}`,
  info: (text: string) => `${colors.cyan}ℹ${colors.reset} ${text}`,
  warning: (text: string) => `${colors.yellow}⚠${colors.reset} ${text}`,
  header: (text: string) => `${colors.bright}${colors.blue}${text}${colors.reset}`,
  subheader: (text: string) => `${colors.bright}${text}${colors.reset}`,
};

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log(status.header('  NEON DATABASE CONNECTION TEST'));
  console.log('='.repeat(60) + '\n');

  let prisma: PrismaClient | null = null;
  const results: any = {
    connectionStatus: 'FAILED',
    tables: {},
    errors: [],
  };

  // Test 1: Connection
  console.log(status.subheader('TEST 1: Database Connection'));
  console.log('-'.repeat(60));

  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    // Parse and display connection info (sanitized)
    const url = new URL(databaseUrl);
    const host = url.hostname;
    const database = url.pathname.slice(1); // remove leading slash
    const user = url.username;

    console.log(`  Host:       ${host}`);
    console.log(`  Database:   ${database}`);
    console.log(`  User:       ${user}`);
    console.log(`  SSL Mode:   ${url.searchParams.get('sslmode') || 'not specified'}`);

    prisma = new PrismaClient({
      log: ['error', 'warn'],
    });

    await prisma.$connect();
    console.log(status.success('Connection established successfully\n'));
    results.connectionStatus = 'SUCCESS';

  } catch (error: any) {
    console.log(status.error(`Connection failed: ${error.message}\n`));
    results.errors.push({ test: 'Connection', error: error.message });
    console.log(status.header('REPORT SUMMARY'));
    console.log(JSON.stringify(results, null, 2));
    process.exit(1);
  }

  // Test 2: Check tables and get row counts
  console.log(status.subheader('TEST 2: Table Discovery & Row Counts'));
  console.log('-'.repeat(60));

  const tables = [
    'avisos',
    'empresas',
    'candidaturas',
    'documentos',
    'users',
    'leads',
    'workflows',
    'workflow_logs',
    'teams',
    'team_members',
    'milestones',
    'pedidos_pagamento',
    'candidaturas_historicas',
    'notification_preferences',
    'notification_logs',
    'integrations',
    'candidatura_section_states',
  ];

  for (const table of tables) {
    try {
      // Get row count using raw query
      const result = await prisma!.$queryRaw`SELECT COUNT(*) as count FROM ${table}` as any[];
      const count = result[0]?.count || 0;
      results.tables[table] = { rowCount: parseInt(count), status: 'EXISTS' };
      console.log(`  ${status.success(`${table.padEnd(35)} ${String(count).padStart(8)} rows`)}`);
    } catch (error: any) {
      const isMissing = error.message.includes('does not exist') || error.code === '42P01';
      if (isMissing) {
        results.tables[table] = { rowCount: 0, status: 'MISSING' };
        console.log(`  ${status.warning(`${table.padEnd(35)} NOT FOUND`)}`);
      } else {
        results.tables[table] = { rowCount: 0, status: 'ERROR', error: error.message };
        console.log(`  ${status.error(`${table.padEnd(35)} ERROR: ${error.message.substring(0, 30)}...`)}`);
        results.errors.push({ test: `Table: ${table}`, error: error.message });
      }
    }
  }
  console.log('');

  // Test 3: Avisos table - detailed analysis
  console.log(status.subheader('TEST 3: Avisos Table Analysis'));
  console.log('-'.repeat(60));

  try {
    const avisosCount = await prisma!.aviso.count();
    console.log(`  Total Avisos: ${avisosCount}`);

    if (avisosCount > 0) {
      // Get sample avisos
      const sampleAvisos = await prisma!.aviso.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      });

      console.log('\n  Sample avisos (latest 5):');
      console.log('  ' + '-'.repeat(56));
      for (const aviso of sampleAvisos) {
        const isCurrent = new Date(aviso.dataFimSubmissao) >= new Date();
        const statusIndicator = isCurrent ? colors.green : colors.red;
        console.log(`    ${statusIndicator}[${isCurrent ? 'OPEN' : 'CLOSED'}']${colors.reset} ${aviso.codigo} - ${aviso.nome.substring(0, 40)}...`);
        console.log(`       Portal: ${aviso.portal} | Deadline: ${aviso.dataFimSubmissao.toISOString().split('T')[0]}`);
      }

      // Check for current/active avisos
      const now = new Date();
      const currentAvisos = await prisma!.aviso.count({
        where: {
          dataFimSubmissao: { gte: now },
          ativo: true,
        },
      });

      const urgentAvisos = await prisma!.aviso.count({
        where: {
          dataFimSubmissao: { gte: now },
          urgente: true,
          ativo: true,
        },
      });

      // Group by portal
      const avisosByPortal = await prisma!.$queryRaw`
        SELECT portal, COUNT(*) as count
        FROM avisos
        GROUP BY portal
        ORDER BY count DESC
      ` as any[];

      console.log('\n  Statistics:');
      console.log(`    Active/Current: ${currentAvisos}`);
      console.log(`    Urgent:         ${urgentAvisos}`);
      console.log('\n  By Portal:');
      for (const row of avisosByPortal) {
        console.log(`    ${row.portal}: ${row.count}`);
      }

      results.avisos = {
        total: avisosCount,
        current: currentAvisos,
        urgent: urgentAvisos,
        byPortal: avisosByPortal,
        sample: sampleAvisos.map(a => ({
          codigo: a.codigo,
          nome: a.nome,
          portal: a.portal,
          deadline: a.dataFimSubmissao,
          ativo: a.ativo,
        })),
      };

    } else {
      console.log('  ' + status.warning('No avisos found in database'));
    }
  } catch (error: any) {
    console.log('  ' + status.error(`Error querying avisos: ${error.message}`));
    results.errors.push({ test: 'Avisos Query', error: error.message });
  }
  console.log('');

  // Test 4: Empresas table - detailed analysis
  console.log(status.subheader('TEST 4: Empresas Table Analysis'));
  console.log('-'.repeat(60));

  try {
    const empresasCount = await prisma!.empresa.count();
    console.log(`  Total Empresas: ${empresasCount}`);

    if (empresasCount > 0) {
      // Get sample empresas
      const sampleEmpresas = await prisma!.empresa.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      });

      console.log('\n  Sample empresas (latest 5):');
      console.log('  ' + '-'.repeat(56));
      for (const emp of sampleEmpresas) {
        const isActive = emp.ativa;
        const statusIndicator = isActive ? colors.green : colors.gray;
        console.log(`    ${statusIndicator}[${isActive ? 'ACTIVE' : 'INACTIVE'}]${colors.reset} ${emp.nome} (NIPC: ${emp.nipc})`);
        console.log(`       Setor: ${emp.setor} | CAE: ${emp.cae} | Dimensão: ${emp.dimensao}`);
      }

      // Group by setor
      const empresasBySetor = await prisma!.$queryRaw`
        SELECT setor, COUNT(*) as count
        FROM empresas
        GROUP BY setor
        ORDER BY count DESC
        LIMIT 10
      ` as any[];

      // Group by dimensao
      const empresasByDimensao = await prisma!.$queryRaw`
        SELECT dimensao, COUNT(*) as count
        FROM empresas
        GROUP BY dimensao
        ORDER BY count DESC
      ` as any[];

      console.log('\n  By Setor (top 10):');
      for (const row of empresasBySetor) {
        console.log(`    ${row.setor}: ${row.count}`);
      }

      console.log('\n  By Dimensão:');
      for (const row of empresasByDimensao) {
        console.log(`    ${row.dimensao}: ${row.count}`);
      }

      results.empresas = {
        total: empresasCount,
        bySetor: empresasBySetor,
        byDimensao: empresasByDimensao,
        sample: sampleEmpresas.map(e => ({
          nome: e.nome,
          nipc: e.nipc,
          setor: e.setor,
          dimensao: e.dimensao,
          ativa: e.ativa,
        })),
      };

    } else {
      console.log('  ' + status.warning('No empresas found in database'));
    }
  } catch (error: any) {
    console.log('  ' + status.error(`Error querying empresas: ${error.message}`));
    results.errors.push({ test: 'Empresas Query', error: error.message });
  }
  console.log('');

  // Test 5: Check vector extension (for embeddings)
  console.log(status.subheader('TEST 5: Vector Extension Check'));
  console.log('-'.repeat(60));

  try {
    const extResult = await prisma!.$queryRaw`
      SELECT extname, extversion
      FROM pg_extension
      WHERE extname = 'vector'
    ` as any[];

    if (extResult.length > 0) {
      console.log(`  ${status.success('Vector extension installed')}`);
      console.log(`    Version: ${extResult[0].extversion || 'unknown'}`);
      results.vectorExtension = { installed: true, version: extResult[0].extversion };
    } else {
      console.log(`  ${status.warning('Vector extension not installed')}`);
      results.vectorExtension = { installed: false };
    }
  } catch (error: any) {
    console.log(`  ${status.info('Could not check vector extension')}`);
    results.vectorExtension = { installed: null, error: error.message };
  }
  console.log('');

  // Test 6: Candidaturas Historicas (RAG data)
  console.log(status.subheader('TEST 6: Candidaturas Históricas (RAG)'));
  console.log('-'.repeat(60));

  try {
    const histCount = await prisma!.candidaturaHistorica.count();
    console.log(`  Total Candidaturas Históricas: ${histCount}`);

    if (histCount > 0) {
      const byPrograma = await prisma!.$queryRaw`
        SELECT programa, COUNT(*) as count
        FROM candidaturas_historicas
        GROUP BY programa
        ORDER BY count DESC
      ` as any[];

      const byRagStatus = await prisma!.$queryRaw`
        SELECT "ragStatus", COUNT(*) as count
        FROM candidaturas_historicas
        GROUP BY "ragStatus"
        ORDER BY count DESC
      ` as any[];

      console.log('\n  By Programa:');
      for (const row of byPrograma) {
        console.log(`    ${row.programa}: ${row.count}`);
      }

      console.log('\n  By RAG Status:');
      for (const row of byRagStatus) {
        console.log(`    ${row.ragStatus}: ${row.count}`);
      }

      results.candidaturasHistoricas = {
        total: histCount,
        byPrograma,
        byRagStatus,
      };
    }
  } catch (error: any) {
    console.log('  ' + status.info('Candidaturas históricas table not checked'));
  }
  console.log('');

  // Cleanup
  await prisma!.$disconnect();

  // Final Report
  console.log('='.repeat(60));
  console.log(status.header('FINAL REPORT'));
  console.log('='.repeat(60));
  console.log(`\n  Connection Status: ${results.connectionStatus === 'SUCCESS' ? status.success('CONNECTED') : status.error('FAILED')}`);
  console.log(`  Tables Checked: ${tables.length}`);
  console.log(`  Tables Found: ${Object.values(results.tables).filter((t: any) => t.status === 'EXISTS').length}`);
  console.log(`  Tables Missing: ${Object.values(results.tables).filter((t: any) => t.status === 'MISSING').length}`);

  if (results.errors.length > 0) {
    console.log(`\n  Errors Encountered: ${results.errors.length}`);
    for (const err of results.errors) {
      console.log(`    ${status.error(err.test + ': ' + err.error)}`);
    }
  } else {
    console.log('\n  ' + status.success('No errors encountered'));
  }

  // Data currency check
  if (results.avisos?.sample && results.avisos.sample.length > 0) {
    const latestAviso = results.avisos.sample[0];
    const latestDate = new Date(latestAviso.deadline);
    const daysSince = Math.floor((new Date().getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24));

    console.log('\n  Data Currency:');
    if (daysSince < 7) {
      console.log(`    ${status.success('Avisos data appears current')}`);
      console.log(`    Latest deadline: ${latestDate.toISOString().split('T')[0]}`);
    } else if (daysSince < 30) {
      console.log(`    ${status.warning('Avisos data may be slightly stale')}`);
      console.log(`    Latest deadline: ${latestDate.toISOString().split('T')[0]}`);
    } else {
      console.log(`    ${status.error('Avisos data appears stale')}`);
      console.log(`    Latest deadline: ${latestDate.toISOString().split('T')[0]}`);
    }
  }

  console.log('\n' + '='.repeat(60) + '\n');

  return results;
}

main()
  .then((results) => {
    process.exit(results.errors?.length > 0 ? 1 : 0);
  })
  .catch((error) => {
    console.error(status.error('Fatal error: ' + error.message));
    process.exit(1);
  });
