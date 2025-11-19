#!/usr/bin/env tsx
/**
 * Verify Database Schema - Check if enrichment fields exist
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifySchema() {
  console.log('🔍 Verificando schema do database...\n');

  try {
    // Query raw SQL to get column information
    const columns: any[] = await prisma.$queryRaw`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'avisos'
      ORDER BY ordinal_position
    `;

    console.log(`📊 Total de colunas na tabela 'avisos': ${columns.length}\n`);

    // Expected enrichment fields (67 new fields from migration)
    const enrichmentFields = [
      'enrichmentStatus',
      'enrichmentScore',
      'dataSourceLog',
      'lastEnrichedAt',
      'enrichedBy',
      'taxaCofinanciamentoMin',
      'taxaCofinanciamentoMax',
      'limiteMinimoCandidatura',
      'limiteMaximoCandidatura',
      'regiaoNUTS2',
      'regiaoNUTS3',
      'municipiosElegiveis',
      'caeElegiveis',
      'tiposBeneficiarios',
      'fundoEstruturalPrincipal',
      'regimeAuxilio',
      'pdfStoragePath',
      'pdfHash',
      'pdfDownloadStatus',
      'pdfExtractedText',
      'documentosObrigatorios',
      'baseLegalPrincipal',
    ];

    // Check which enrichment fields exist
    const existingFields = columns.map(c => c.column_name);
    const missingFields = enrichmentFields.filter(f => !existingFields.includes(f));
    const presentFields = enrichmentFields.filter(f => existingFields.includes(f));

    console.log('✅ Campos de enriquecimento PRESENTES:');
    presentFields.forEach(f => {
      const col = columns.find(c => c.column_name === f);
      console.log(`   - ${f} (${col?.data_type})`);
    });

    if (missingFields.length > 0) {
      console.log('\n❌ Campos de enriquecimento AUSENTES:');
      missingFields.forEach(f => console.log(`   - ${f}`));
      console.log('\n⚠️  MIGRATION NECESSÁRIA!');
      console.log('   Execute: npx prisma migrate deploy\n');
      process.exit(1);
    } else {
      console.log('\n🎉 Todos os campos de enriquecimento estão presentes!');
      console.log('   Migration já foi aplicada.\n');
      process.exit(0);
    }

  } catch (error: any) {
    console.error('❌ Erro ao verificar schema:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifySchema();
