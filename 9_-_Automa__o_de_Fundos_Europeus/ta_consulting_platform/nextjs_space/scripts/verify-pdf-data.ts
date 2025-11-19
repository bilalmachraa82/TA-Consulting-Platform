import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verifying PDF download data in database...\n');

  const avisos = await prisma.aviso.findMany({
    where: {
      portal: 'PORTUGAL2030',
      pdfDownloadStatus: { not: 'NOT_STARTED' }
    },
    select: {
      codigo: true,
      pdfDownloadStatus: true,
      pdfStoragePath: true,
      pdfHash: true,
      pdfDownloadedAt: true,
      pdfExtractionStatus: true,
      pdfExtractionQuality: true,
      pdfMetadata: true,
    },
  });

  console.log(`Found ${avisos.length} avisos with PDF activity:\n`);

  for (const aviso of avisos) {
    console.log(`📋 Aviso: ${aviso.codigo}`);
    console.log(`   Download Status: ${aviso.pdfDownloadStatus}`);
    console.log(`   Storage Path: ${aviso.pdfStoragePath || 'N/A'}`);
    if (aviso.pdfHash) {
      console.log(`   PDF Hash: ${aviso.pdfHash.substring(0, 16)}... (${aviso.pdfHash.length} chars)`);
    }
    console.log(`   Downloaded At: ${aviso.pdfDownloadedAt?.toISOString() || 'N/A'}`);
    console.log(`   Extraction Status: ${aviso.pdfExtractionStatus || 'N/A'}`);
    console.log(`   Extraction Quality: ${aviso.pdfExtractionQuality ? (aviso.pdfExtractionQuality * 100).toFixed(1) + '%' : 'N/A'}`);

    if (aviso.pdfMetadata) {
      console.log(`   Metadata:`, JSON.stringify(aviso.pdfMetadata, null, 2));
    }
    console.log('');
  }

  console.log('✅ Verification complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
