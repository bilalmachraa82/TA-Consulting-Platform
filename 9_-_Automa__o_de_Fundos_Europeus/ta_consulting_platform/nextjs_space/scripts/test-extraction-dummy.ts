import { PDFTextExtractor } from '../lib/pdf/extractor';
import { PDFStorageService } from '../lib/pdf/storage';

async function main() {
  console.log('Testing PDF extraction on dummy.pdf...\n');

  const storage = new PDFStorageService();
  await storage.initialize();

  const extractor = new PDFTextExtractor(storage);

  const pdfPath = 'storage/pdfs/PORTUGAL2030/C-05-i01-02/regulamento.pdf';

  console.log(`Extracting from: ${pdfPath}\n`);

  const result = await extractor.extractClean(pdfPath);

  console.log('Extraction Results:');
  console.log(`   Pages: ${result.numPages}`);
  console.log(`   Quality Score: ${(result.quality.score * 100).toFixed(1)}%`);
  console.log(`   Words: ${result.quality.stats.words}`);
  console.log(`   Lines: ${result.quality.stats.lines}`);
  console.log(`   Characters: ${result.quality.stats.totalChars}`);
  console.log(`\nQuality Details:`);
  console.log(`   Alphanumeric ratio: ${((result.quality.stats.alphanumericChars / result.quality.stats.totalChars) * 100).toFixed(1)}%`);

  if (result.quality.warnings.length > 0) {
    console.log(`\nWarnings:`);
    result.quality.warnings.forEach(w => console.log(`   - ${w}`));
  }

  console.log(`\nExtracted Text:`);
  console.log('─'.repeat(60));
  console.log(result.text);
  console.log('─'.repeat(60));

  console.log('\nExtraction test complete!');
}

main().catch(console.error);
