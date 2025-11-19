import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkEnrichment() {
  console.log('\n📊 ENRICHMENT STATISTICS\n');

  // Total count
  const total = await prisma.aviso.count();
  console.log(`Total avisos: ${total}`);

  // Enrichment status distribution
  const statusCounts = await prisma.aviso.groupBy({
    by: ['enrichmentStatus'],
    _count: true,
  });

  console.log('\n📈 Enrichment Status Distribution:');
  statusCounts.forEach(s => {
    console.log(`  ${s.enrichmentStatus}: ${s._count}`);
  });

  // Average score
  const avgScore = await prisma.aviso.aggregate({
    _avg: { enrichmentScore: true },
  });
  const avgValue = avgScore._avg.enrichmentScore;
  console.log(`\n⭐ Average Enrichment Score: ${avgValue ? avgValue.toFixed(2) : 'N/A'}%`);

  // Sample enriched aviso
  const sample = await prisma.aviso.findFirst({
    where: { enrichmentStatus: { not: 'BASIC' } },
    select: {
      codigo: true,
      nome: true,
      enrichmentStatus: true,
      enrichmentScore: true,
      fundoEstruturalPrincipal: true,
      regiaoNUTS2: true,
      eixoPrioritario: true, // Changed from tipoIntervencao
      prioridadeInvestimento: true, // Changed from prioridades
      objetivoEspecificoCodigo: true, // Changed from objetivosEspecificos
      lastEnrichedAt: true,
    }
  });

  if (sample) {
    console.log('\n📄 Sample Enriched Aviso:');
    console.log(`  Código: ${sample.codigo}`);
    console.log(`  Nome: ${sample.nome}`);
    console.log(`  Status: ${sample.enrichmentStatus}`);
    console.log(`  Score: ${sample.enrichmentScore}%`);
    console.log(`  Fundo Estrutural: ${sample.fundoEstruturalPrincipal || 'N/A'}`);
    console.log(`  Região NUTS2: ${sample.regiaoNUTS2 || 'N/A'}`);
    console.log(`  Eixo Prioritário: ${sample.eixoPrioritario || 'N/A'}`);
    console.log(`  Prioridade Investimento: ${sample.prioridadeInvestimento || 'N/A'}`);
    console.log(`  Objetivo Específico: ${sample.objetivoEspecificoCodigo || 'N/A'}`);
    console.log(`  Enriched at: ${sample.lastEnrichedAt?.toISOString()}`);
  }

  // Count fields populated
  const allAvisos = await prisma.aviso.findMany({
    select: {
      codigo: true,
      fundoEstruturalPrincipal: true,
      regiaoNUTS2: true,
      eixoPrioritario: true, // Changed from tipoIntervencao
      prioridadeInvestimento: true, // Changed from prioridades
      objetivoEspecificoCodigo: true, // Changed from objetivosEspecificos
      tiposBeneficiarios: true, // Corrected field name
    }
  });

  let fieldsPopulated = {
    fundoEstruturalPrincipal: 0,
    regiaoNUTS2: 0,
    eixoPrioritario: 0, // Changed from tipoIntervencao
    prioridadeInvestimento: 0, // Changed from prioridades
    objetivoEspecificoCodigo: 0, // Changed from objetivosEspecificos
    tiposBeneficiarios: 0, // Corrected field name
  };

  allAvisos.forEach(a => {
    if (a.fundoEstruturalPrincipal) fieldsPopulated.fundoEstruturalPrincipal++;
    if (a.regiaoNUTS2) fieldsPopulated.regiaoNUTS2++;
    if (a.eixoPrioritario) fieldsPopulated.eixoPrioritario++;
    if (a.prioridadeInvestimento) fieldsPopulated.prioridadeInvestimento++;
    if (a.objetivoEspecificoCodigo) fieldsPopulated.objetivoEspecificoCodigo++;
    if (a.tiposBeneficiarios && a.tiposBeneficiarios.length > 0) fieldsPopulated.tiposBeneficiarios++;
  });

  console.log('\n📋 Fields Populated Count:');
  Object.entries(fieldsPopulated).forEach(([field, count]) => {
    console.log(`  ${field}: ${count}/${total} (${((count/total)*100).toFixed(1)}%)`);
  });

  await prisma.$disconnect();
}

checkEnrichment().catch(console.error);
