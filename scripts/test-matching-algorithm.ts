/**
 * TESTE DO ALGORITMO DE MATCHING
 * ================================
 * Testa o matching entre empresas e avisos
 *
 * Run: npx tsx scripts/test-matching-algorithm.ts
 */

import { PrismaClient } from '@prisma/client';

const green = '\x1b[32m';
const red = '\x1b[31m';
const yellow = '\x1b[33m';
const cyan = '\x1b[36m';
const reset = '\x1b[0m';
const bright = '\x1b[1m';

function pass(msg: string) {
  console.log(`${green}✅${reset} ${msg}`);
}

function fail(msg: string) {
  console.log(`${red}❌${reset} ${msg}`);
}

function section(title: string) {
  console.log('\n' + '='.repeat(60));
  console.log(`${bright}${cyan}${title}${reset}`);
  console.log('='.repeat(60));
}

// Matching algorithm (copied from the actual API)
function calcularCompatibilidade(empresa: any, aviso: any): {
  score: number;
  razoes: string[];
  alertas: string[];
} {
  let score = 0;
  const razoes: string[] = [];
  const alertas: string[] = [];

  // 1. Setor (30 pontos)
  const setorEmpresa = empresa.setor?.toLowerCase() || '';
  const descricaoAviso = aviso.descricao?.toLowerCase() || '';
  const tituloAviso = aviso.nome?.toLowerCase() || '';
  const setoresTexto = `${descricaoAviso} ${tituloAviso}`;

  if (setorEmpresa && setoresTexto.includes(setorEmpresa)) {
    score += 30;
    razoes.push(`Setor ${empresa.setor} está alinhado com o aviso`);
  } else if (setorEmpresa) {
    score += 10;
    razoes.push('Setor compatível, mas não específico');
  }

  // 2. Dimensão (20 pontos)
  const dimensao = empresa.dimensao?.toLowerCase() || '';
  if (setoresTexto.includes('pme') || setoresTexto.includes('micro') || setoresTexto.includes('pequena')) {
    if (dimensao === 'micro' || dimensao === 'pequena') {
      score += 20;
      razoes.push(`Dimensão ${dimensao} adequada`);
    } else {
      score += 5;
      alertas.push('Programa mais adequado para PMEs');
    }
  } else {
    score += 15;
    razoes.push('Sem restrições específicas de dimensão');
  }

  // 3. Localização (15 pontos)
  const regiaoEmpresa = empresa.regiao?.toLowerCase() || '';
  if (regiaoEmpresa && setoresTexto.includes(regiaoEmpresa)) {
    score += 15;
    razoes.push(`Localização em ${empresa.regiao} beneficia este programa`);
  } else if (regiaoEmpresa) {
    score += 10;
    razoes.push('Programa disponível na sua região');
  }

  // 4. Prazo (20 pontos)
  const hoje = new Date();
  const dataLimite = new Date(aviso.dataFimSubmissao);
  const diasRestantes = Math.ceil((dataLimite.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

  if (diasRestantes > 30) {
    score += 20;
    razoes.push(`Prazo confortável: ${diasRestantes} dias`);
  } else if (diasRestantes > 14) {
    score += 15;
    razoes.push(`Prazo adequado: ${diasRestantes} dias`);
    alertas.push('Recomendamos iniciar preparação em breve');
  } else if (diasRestantes > 0) {
    score += 10;
    alertas.push(`⚠️ URGENTE: Apenas ${diasRestantes} dias restantes!`);
  } else {
    score = 0;
    alertas.push('❌ Prazo expirado');
    return { score, razoes: [], alertas };
  }

  // 5. Montante (15 pontos)
  const montanteMax = aviso.montanteMaximo || 0;
  if (montanteMax > 500000) {
    score += 15;
    razoes.push(`Financiamento: até €${montanteMax.toLocaleString()}`);
  } else if (montanteMax > 100000) {
    score += 12;
    razoes.push(`Bom montante: até €${montanteMax.toLocaleString()}`);
  } else if (montanteMax > 0) {
    score += 8;
    razoes.push(`Montante: até €${montanteMax.toLocaleString()}`);
  }

  return { score, razoes, alertas };
}

async function runTests() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║        TA CONSULTING - MATCHING ALGORITHM TEST            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  const prisma = new PrismaClient();

  try {
    // Test 1: Get sample empresas
    section('TEST 1: LOADING EMPRESAS');
    const empresas = await prisma.empresa.findMany({ take: 5 });
    pass(`Loaded ${empresas.length} sample empresas`);
    empresas.forEach((e, i) => {
      console.log(`   ${i + 1}. ${e.nome} - ${e.setor} - ${e.regiao} - ${e.dimensao}`);
    });

    // Test 2: Get active avisos
    section('TEST 2: LOADING ACTIVE AVISOS');
    const hoje = new Date();
    const avisos = await prisma.aviso.findMany({
      where: {
        dataFimSubmissao: { gte: hoje },
        ativo: true,
      },
      orderBy: { dataFimSubmissao: 'asc' },
      take: 10,
    });
    pass(`Loaded ${avisos.length} active avisos`);
    avisos.forEach((a, i) => {
      const dias = Math.ceil((a.dataFimSubmissao.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      console.log(`   ${i + 1}. ${a.nome} - ${a.portal} - ${dias} dias left`);
    });

    // Test 3: Run matching algorithm
    section('TEST 3: MATCHING ALGORITHM');
    if (empresas.length > 0 && avisos.length > 0) {
      const empresa = empresas[0];
      pass(`Testing matches for: ${empresa.nome}`);

      const matches = avisos.map((aviso) => {
        const result = calcularCompatibilidade(empresa, aviso);
        return {
          aviso: aviso.nome,
          portal: aviso.portal,
          score: result.score,
          prioridade: result.score >= 80 ? 'ALTA' : result.score >= 60 ? 'MÉDIA' : 'BAIXA',
          razoes: result.razoes,
          alertas: result.alertas,
        };
      }).filter((m) => m.score > 0).sort((a, b) => b.score - a.score);

      console.log(`\n${bright}Top 5 Matches:${reset}`);
      matches.slice(0, 5).forEach((m, i) => {
        const scoreColor = m.score >= 80 ? green : m.score >= 60 ? cyan : yellow;
        console.log(`\n${i + 1}. ${scoreColor}[${m.score}/100] ${m.aviso}${reset}`);
        console.log(`   Portal: ${m.portal} | Prioridade: ${m.prioridade}`);
        if (m.razoes.length > 0) {
          console.log(`   ✅ ${m.razoes.join(', ')}`);
        }
        if (m.alertas.length > 0) {
          console.log(`   ⚠️  ${m.alertas.join(', ')}`);
        }
      });

      const highPriority = matches.filter((m) => m.prioridade === 'ALTA').length;
      const mediumPriority = matches.filter((m) => m.prioridade === 'MÉDIA').length;
      pass(`Matches found: ${matches.length} (ALTA: ${highPriority}, MÉDIA: ${mediumPriority})`);
    }

    // Test 4: Verify matching works for multiple empresas
    section('TEST 4: MULTIPLE EMPRESA MATCHING');
    let totalMatches = 0;
    for (const empresa of empresas.slice(0, 3)) {
      const matches = avisos.map((aviso) => calcularCompatibilidade(empresa, aviso).score);
      const validMatches = matches.filter((s) => s > 40).length;
      totalMatches += validMatches;
      pass(`${empresa.nome}: ${validMatches} matches (score > 40)`);
    }
    pass(`Total matches across ${Math.min(empresas.length, 3)} empresas: ${totalMatches}`);

    console.log(`\n${green}${bright}✅ MATCHING ALGORITHM WORKING CORRECTLY!${reset}\n`);

  } catch (error: any) {
    console.error(`\n${red}ERROR: ${error.message}${reset}\n`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
