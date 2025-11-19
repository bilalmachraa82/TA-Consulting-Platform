#!/usr/bin/env tsx
/**
 * PDF DOWNLOAD AND EXTRACTION SCRIPT
 * Downloads regulation PDFs and extracts text for enrichment
 * Usage:
 *   tsx scripts/download-pdfs.ts --portal=PORTUGAL2030        # One portal
 *   tsx scripts/download-pdfs.ts --limit=20                   # Limited batch
 *   tsx scripts/download-pdfs.ts --extract                    # Download + extract
 *   tsx scripts/download-pdfs.ts --stats                      # Show statistics
 */

import { PrismaClient, Portal, PDFStatus } from '@prisma/client';
import { PDFStorageService } from '../lib/pdf/storage';
import { PDFTextExtractor } from '../lib/pdf/extractor';
import { PortalDownloaderFactory } from '../lib/pdf/portal-downloaders';

const prisma = new PrismaClient();

interface ScriptOptions {
  portal?: Portal;
  limit?: number;
  extract: boolean;
  stats: boolean;
  skipDownloaded: boolean;
  minQuality: number;
}

function parseArgs(): ScriptOptions {
  const args = process.argv.slice(2);

  const portalArg = args.find((a) => a.startsWith('--portal='));
  const limitArg = args.find((a) => a.startsWith('--limit='));
  const minQualityArg = args.find((a) => a.startsWith('--min-quality='));

  return {
    portal: portalArg
      ? (portalArg.split('=')[1] as Portal)
      : undefined,
    limit: limitArg ? parseInt(limitArg.split('=')[1]) : undefined,
    extract: args.includes('--extract'),
    stats: args.includes('--stats'),
    skipDownloaded: args.includes('--skip-downloaded'),
    minQuality: minQualityArg ? parseFloat(minQualityArg.split('=')[1]) : 0.5,
  };
}

async function showStats(storage: PDFStorageService) {
  console.log('\n📊 PDF STORAGE STATISTICS');
  console.log('='.repeat(60));

  const stats = await storage.getStats();

  console.log(`\nTotal PDFs: ${stats.totalFiles}`);
  console.log(`Total Size: ${(stats.totalSizeBytes / 1024 / 1024).toFixed(2)} MB\n`);

  console.log('By Portal:');
  for (const [portal, portalStats] of Object.entries(stats.byPortal)) {
    console.log(
      `  ${portal.padEnd(15)} ${portalStats.files} files (${(portalStats.sizeBytes / 1024 / 1024).toFixed(2)} MB)`
    );
  }

  // Database stats
  const dbStats = await prisma.aviso.groupBy({
    by: ['portal', 'pdfDownloadStatus'],
    _count: true,
  });

  console.log('\nDatabase Status:');
  const statusMap = new Map<string, Map<string, number>>();

  for (const stat of dbStats) {
    if (!statusMap.has(stat.portal)) {
      statusMap.set(stat.portal, new Map());
    }
    const status = stat.pdfDownloadStatus || 'NOT_STARTED';
    statusMap.get(stat.portal)!.set(status, stat._count);
  }

  for (const [portal, statuses] of statusMap.entries()) {
    console.log(`  ${portal}:`);
    for (const [status, count] of statuses.entries()) {
      console.log(`    ${status.padEnd(15)} ${count}`);
    }
  }
}

async function downloadPDFs(options: ScriptOptions) {
  console.log('🚀 PDF DOWNLOAD PIPELINE');
  console.log('='.repeat(60));
  console.log(`  Portal: ${options.portal || 'ALL'}`);
  console.log(`  Limit: ${options.limit || 'UNLIMITED'}`);
  console.log(`  Extract text: ${options.extract}`);
  console.log(`  Skip downloaded: ${options.skipDownloaded}`);
  console.log('');

  // Initialize services
  const storage = new PDFStorageService();
  await storage.initialize();

  const extractor = options.extract ? new PDFTextExtractor(storage) : null;
  const downloaderFactory = new PortalDownloaderFactory();

  // Query avisos
  const where: any = {
    regulamentoURL: { not: null },
  };

  if (options.portal) {
    where.portal = options.portal;
  }

  if (options.skipDownloaded) {
    where.pdfDownloadStatus = { notIn: ['COMPLETED', 'SKIPPED'] };
  }

  const avisos = await prisma.aviso.findMany({
    where,
    take: options.limit,
    orderBy: { createdAt: 'desc' },
  });

  console.log(`📋 Found ${avisos.length} avisos to process\n`);

  let downloaded = 0;
  let extracted = 0;
  let failed = 0;
  let skipped = 0;

  for (const aviso of avisos) {
    console.log(`\n📌 Processing: ${aviso.codigo} (${aviso.portal})`);

    try {
      // Update status to IN_PROGRESS
      await prisma.aviso.update({
        where: { id: aviso.id },
        data: { pdfDownloadStatus: 'IN_PROGRESS' },
      });

      // Get portal-specific downloader
      const portalDownloader = downloaderFactory.getDownloader(aviso.portal);

      // Download all PDFs
      const pdfs = await portalDownloader.downloadAll({
        codigo: aviso.codigo,
        regulamentoURL: aviso.regulamentoURL,
        anexosRegulamento: aviso.anexosRegulamento,
      });

      if (pdfs.length === 0) {
        console.log('  ⚠️  No PDFs found, skipping');
        await prisma.aviso.update({
          where: { id: aviso.id },
          data: { pdfDownloadStatus: 'SKIPPED' },
        });
        skipped++;
        continue;
      }

      // Save main PDF (first one)
      const mainPDF = pdfs[0];
      const metadata = await storage.savePDF(mainPDF.buffer, {
        avisoId: aviso.id,
        avisoCodigo: aviso.codigo,
        portal: aviso.portal,
        filename: mainPDF.filename,
        url: mainPDF.url,
        downloadedAt: new Date(),
      });

      console.log(`  ✅ Downloaded: ${mainPDF.filename} (${(metadata.sizeBytes / 1024).toFixed(1)} KB)`);

      // Extract text if requested
      let extractionResult = null;
      if (extractor) {
        console.log('  📝 Extracting text...');

        try {
          await prisma.aviso.update({
            where: { id: aviso.id },
            data: { pdfExtractionStatus: 'IN_PROGRESS' },
          });

          extractionResult = await extractor.extractClean(metadata.localPath);

          console.log(`  ✅ Extracted: ${extractionResult.numPages} pages, ${extractionResult.quality.stats.words} words`);
          console.log(`  📊 Quality score: ${(extractionResult.quality.score * 100).toFixed(1)}%`);

          if (extractionResult.quality.warnings.length > 0) {
            console.log(`  ⚠️  Warnings:`);
            extractionResult.quality.warnings.forEach((w) =>
              console.log(`      - ${w}`)
            );
          }

          // Check minimum quality
          if (extractionResult.quality.score < options.minQuality) {
            console.log(`  ❌ Quality too low (${extractionResult.quality.score.toFixed(2)} < ${options.minQuality})`);
            await prisma.aviso.update({
              where: { id: aviso.id },
              data: {
                pdfExtractionStatus: 'FAILED',
                pdfMetadata: {
                  error: 'Quality too low',
                  quality: extractionResult.quality,
                },
              },
            });
          } else {
            extracted++;
            await prisma.aviso.update({
              where: { id: aviso.id },
              data: {
                pdfExtractionStatus: 'COMPLETED',
                pdfExtractedText: extractionResult.text,
                pdfExtractionQuality: extractionResult.quality.score,
                pdfMetadata: {
                  numPages: extractionResult.numPages,
                  metadata: extractionResult.metadata,
                  quality: extractionResult.quality,
                },
              },
            });
          }
        } catch (extractError: any) {
          console.error(`  ❌ Extraction failed: ${extractError.message}`);
          await prisma.aviso.update({
            where: { id: aviso.id },
            data: {
              pdfExtractionStatus: 'FAILED',
              pdfMetadata: { error: extractError.message },
            },
          });
        }
      }

      // Update database
      await prisma.aviso.update({
        where: { id: aviso.id },
        data: {
          pdfStoragePath: metadata.localPath,
          pdfHash: metadata.hash,
          pdfDownloadStatus: 'COMPLETED',
          pdfDownloadedAt: new Date(),
        },
      });

      downloaded++;
    } catch (error: any) {
      console.error(`  ❌ Failed: ${error.message}`);

      await prisma.aviso.update({
        where: { id: aviso.id },
        data: {
          pdfDownloadStatus: 'FAILED',
          pdfMetadata: { error: error.message },
        },
      });

      failed++;
    }
  }

  console.log('\n✅ PDF DOWNLOAD COMPLETE');
  console.log('='.repeat(60));
  console.log(`  Downloaded: ${downloaded}/${avisos.length} avisos`);
  if (extractor) {
    console.log(`  Extracted: ${extracted}/${avisos.length} avisos`);
  }
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Failed: ${failed}`);
}

async function main() {
  const options = parseArgs();

  if (options.stats) {
    const storage = new PDFStorageService();
    await storage.initialize();
    await showStats(storage);
    return;
  }

  await downloadPDFs(options);

  // Show final stats
  const storage = new PDFStorageService();
  await storage.initialize();
  await showStats(storage);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
