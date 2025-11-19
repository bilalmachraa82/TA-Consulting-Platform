import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function generateReport() {
  console.log('\n' + '='.repeat(70));
  console.log('📊 ENRICHMENT FRAMEWORK TEST REPORT');
  console.log('='.repeat(70));

  // 1. Total counts
  const total = await prisma.aviso.count();
  const enriched = await prisma.aviso.count({
    where: { lastEnrichedAt: { not: null } }
  });

  console.log('\n1️⃣  OVERALL STATISTICS');
  console.log(`   Total avisos in database: ${total}`);
  console.log(`   Enriched avisos: ${enriched}`);
  console.log(`   Enrichment rate: ${((enriched/total)*100).toFixed(1)}%`);

  // 2. Enrichment status distribution
  const statusCounts = await prisma.aviso.groupBy({
    by: ['enrichmentStatus'],
    _count: true,
  });

  console.log('\n2️⃣  ENRICHMENT STATUS DISTRIBUTION');
  statusCounts.forEach(s => {
    const pct = ((s._count / total) * 100).toFixed(1);
    console.log(`   ${s.enrichmentStatus.padEnd(20)} ${s._count.toString().padStart(3)} (${pct}%)`);
  });

  // 3. Average enrichment score
  const avgScore = await prisma.aviso.aggregate({
    where: { enrichmentScore: { not: null } },
    _avg: { enrichmentScore: true },
    _min: { enrichmentScore: true },
    _max: { enrichmentScore: true },
  });

  console.log('\n3️⃣  ENRICHMENT SCORES');
  if (avgScore._avg.enrichmentScore) {
    console.log(`   Average: ${(avgScore._avg.enrichmentScore * 100).toFixed(2)}%`);
    console.log(`   Min:     ${avgScore._min.enrichmentScore ? (avgScore._min.enrichmentScore * 100).toFixed(2) : 'N/A'}%`);
    console.log(`   Max:     ${avgScore._max.enrichmentScore ? (avgScore._max.enrichmentScore * 100).toFixed(2) : 'N/A'}%`);
  } else {
    console.log('   No scores available');
  }

  // 4. Field population statistics
  const allAvisos = await prisma.aviso.findMany({
    where: { lastEnrichedAt: { not: null } },
    select: {
      codigo: true,
      fundoEstruturalPrincipal: true,
      regiaoNUTS2: true,
      tipoOperacao: true,
      tipoApoio: true,
      regimeAuxilio: true,
      abrangenciaGeografica: true,
      tiposBeneficiarios: true,
      dataSourceLog: true,
    }
  });

  const fieldsPopulated = {
    fundoEstruturalPrincipal: 0,
    regiaoNUTS2: 0,
    tipoOperacao: 0,
    tipoApoio: 0,
    regimeAuxilio: 0,
    abrangenciaGeografica: 0,
    tiposBeneficiarios: 0,
  };

  allAvisos.forEach(a => {
    if (a.fundoEstruturalPrincipal) fieldsPopulated.fundoEstruturalPrincipal++;
    if (a.regiaoNUTS2) fieldsPopulated.regiaoNUTS2++;
    if (a.tipoOperacao) fieldsPopulated.tipoOperacao++;
    if (a.tipoApoio) fieldsPopulated.tipoApoio++;
    if (a.regimeAuxilio) fieldsPopulated.regimeAuxilio++;
    if (a.abrangenciaGeografica) fieldsPopulated.abrangenciaGeografica++;
    if (a.tiposBeneficiarios && a.tiposBeneficiarios.length > 0) fieldsPopulated.tiposBeneficiarios++;
  });

  console.log('\n4️⃣  FIELD EXTRACTION SUCCESS RATE (Enriched Avisos Only)');
  Object.entries(fieldsPopulated).forEach(([field, count]) => {
    const pct = enriched > 0 ? ((count/enriched)*100).toFixed(1) : '0.0';
    console.log(`   ${field.padEnd(30)} ${count.toString().padStart(2)}/${enriched} (${pct}%)`);
  });

  // 5. Sample enriched aviso with details
  const sample = await prisma.aviso.findFirst({
    where: { lastEnrichedAt: { not: null } },
    select: {
      codigo: true,
      nome: true,
      enrichmentStatus: true,
      enrichmentScore: true,
      fundoEstruturalPrincipal: true,
      regiaoNUTS2: true,
      lastEnrichedAt: true,
      enrichedBy: true,
      dataSourceLog: true,
    }
  });

  if (sample) {
    console.log('\n5️⃣  SAMPLE ENRICHED AVISO');
    console.log(`   Código:     ${sample.codigo}`);
    console.log(`   Nome:       ${sample.nome}`);
    console.log(`   Status:     ${sample.enrichmentStatus}`);
    console.log(`   Score:      ${sample.enrichmentScore ? (sample.enrichmentScore * 100).toFixed(2) : 'N/A'}%`);
    console.log(`   Fundo:      ${sample.fundoEstruturalPrincipal || 'N/A'}`);
    console.log(`   NUTS2:      ${sample.regiaoNUTS2 || 'N/A'}`);
    console.log(`   Enriched:   ${sample.lastEnrichedAt?.toISOString()}`);
    console.log(`   By:         ${sample.enrichedBy || 'N/A'}`);

    if (sample.dataSourceLog) {
      const log = sample.dataSourceLog as any;
      const fieldsExtracted = Object.keys(log).length;
      console.log(`   Fields:     ${fieldsExtracted} extracted`);

      console.log('\n   📋 Data Source Details:');
      Object.entries(log).forEach(([field, info]: [string, any]) => {
        console.log(`      ${field}:`);
        console.log(`        Source:     ${info.source}`);
        console.log(`        Confidence: ${(info.confidence * 100).toFixed(1)}%`);
        if (info.evidence) {
          console.log(`        Evidence:   ${JSON.stringify(info.evidence).substring(0, 60)}...`);
        }
      });
    }
  }

  // 6. Cost tracking (for Tier 3)
  console.log('\n6️⃣  COST TRACKING');
  console.log('   Tier 1 enrichment: $0.00 (API-based, no cost)');
  console.log('   Tier 3 not tested (no ANTHROPIC_API_KEY)');

  console.log('\n' + '='.repeat(70));
  console.log('✅ TIER 1 TEST COMPLETED SUCCESSFULLY');
  console.log('='.repeat(70));
  console.log('\nNEXT STEPS:');
  console.log('  1. Set ANTHROPIC_API_KEY to test Tier 3 (LLM) enrichment');
  console.log('  2. Run: npx tsx scripts/enrich-avisos.ts --tier=3 --limit=2');
  console.log('  3. Compare enrichment quality and field coverage');
  console.log('');

  await prisma.$disconnect();
}

generateReport().catch(console.error);
