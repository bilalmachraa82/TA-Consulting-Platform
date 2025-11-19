import { PDFTextExtractor } from '../lib/pdf/extractor';
import { PDFStorageService } from '../lib/pdf/storage';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Testing PDF extraction on local file...\n');

  const storage = new PDFStorageService();
  await storage.initialize();

  const extractor = new PDFTextExtractor(storage);

  const pdfPath = 'storage/pdfs/PORTUGAL2030/TEST-PDF-001/regulamento.pdf';

  console.log(`📄 Extracting from: ${pdfPath}\n`);

  const result = await extractor.extractClean(pdfPath);

  console.log('✅ Extraction Results:');
  console.log(`   Pages: ${result.numPages}`);
  console.log(`   Quality Score: ${(result.quality.score * 100).toFixed(1)}%`);
  console.log(`   Words: ${result.quality.stats.words}`);
  console.log(`   Lines: ${result.quality.stats.lines}`);
  console.log(`   Characters: ${result.quality.stats.totalChars}`);
  console.log(`\n📊 Quality Details:`);
  console.log(`   Alphanumeric ratio: ${((result.quality.stats.alphanumericChars / result.quality.stats.totalChars) * 100).toFixed(1)}%`);

  if (result.quality.warnings.length > 0) {
    console.log(`\n⚠️  Warnings:`);
    result.quality.warnings.forEach(w => console.log(`   - ${w}`));
  }

  console.log(`\n📝 Extracted Text (first 500 chars):`);
  console.log('─'.repeat(60));
  console.log(result.text.substring(0, 500));
  console.log('─'.repeat(60));

  // Update database
  const aviso = await prisma.aviso.findFirst({
    where: { codigo: 'TEST-PDF-001' }
  });

  if (aviso) {
    // Clean metadata - remove invalid dates
    const cleanMetadata = {
      numPages: result.numPages,
      metadata: {
        ...result.metadata,
        creationDate: result.metadata.creationDate && !isNaN(result.metadata.creationDate.getTime())
          ? result.metadata.creationDate.toISOString()
          : null,
        // Remove modificationDate as it doesn't exist in PDF metadata type
      },
      quality: result.quality,
    };

    await prisma.aviso.update({
      where: { id: aviso.id },
      data: {
        pdfExtractionStatus: 'COMPLETED',
        pdfExtractedText: result.text,
        pdfExtractionQuality: result.quality.score,
        pdfMetadata: cleanMetadata,
      },
    });

    console.log(`\n✅ Updated database for aviso ${aviso.codigo}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
