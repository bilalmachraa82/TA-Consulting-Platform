import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkEnhancedFields() {
  try {
    // Try to query with enhanced fields
    const aviso = await prisma.aviso.findFirst({
      select: {
        id: true,
        nome: true,
        enrichmentStatus: true,
        enrichmentScore: true,
        taxaCofinanciamentoMin: true,
        taxaCofinanciamentoMax: true,
        pdfStoragePath: true,
        pdfDownloadStatus: true,
        lastEnrichedAt: true,
        regiaoNUTS2: true,
        regimeAuxilio: true
      }
    });
    
    console.log('✅ Enhanced fields exist in database!');
    console.log('📊 Sample aviso with enhanced fields:');
    console.log(JSON.stringify(aviso, null, 2));
    
    // Check if AvisoLegacy table exists
    try {
      const legacyCount = await prisma.avisoLegacy.count();
      console.log(`\n✅ AvisoLegacy table exists with ${legacyCount} records`);
    } catch (e: any) {
      console.log(`\n⚠️  AvisoLegacy table: ${e.message}`);
    }
    
    // Check total avisos count
    const totalAvisos = await prisma.aviso.count();
    console.log(`📊 Total avisos in database: ${totalAvisos}`);
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkEnhancedFields();
