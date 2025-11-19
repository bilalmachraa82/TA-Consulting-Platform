#!/usr/bin/env tsx
/**
 * Test E2E Pipeline with Single Aviso
 * Quick validation of PDF extraction → LLM → Compliance integration
 */

import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';
import { PDFTextExtractor } from '../lib/pdf/extractor';
import { PDFStorageService } from '../lib/pdf/storage';
import { LLMExtractor } from '../lib/extraction/tier3/llm-extractor';
import * as fs from 'fs';
import * as https from 'https';
import * as path from 'path';

// Load .env from nextjs_space directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function downloadPDF(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlinkSync(dest);
      reject(err);
    });
  });
}

async function main() {
  console.log('🧪 E2E Integration Test - Single Aviso\n');
  console.log('='.repeat(80));

  // Test aviso (same as Phase 0 validation)
  const testAviso = {
    id: 'test-aviso-id', // Add required id field
    codigo: 'COMPETE2030-2025-4',
    nome: 'Digitalização PME',
    portal: 'PORTUGAL2030' as const, // Cast to Portal enum
    programa: 'COMPETE 2030',
    pdfUrl: 'https://portugal2030.pt/wp-content/uploads/sites/3/2025/05/AAC-DIGITALIZACAO_20250429_VF.pdf',
  };

  try {
    // Step 1: Download PDF
    console.log('\n📥 Step 1: Downloading PDF...');
    const tmpDir = '/tmp/e2e-test';
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    const pdfPath = path.join(tmpDir, `${testAviso.codigo}.pdf`);

    if (!fs.existsSync(pdfPath)) {
      await downloadPDF(testAviso.pdfUrl, pdfPath);
      console.log(`   ✅ Downloaded: ${pdfPath}`);
    } else {
      console.log(`   ✅ Using cached: ${pdfPath}`);
    }

    const stats = fs.statSync(pdfPath);
    console.log(`   📊 Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

    // Step 2: Extract text from PDF
    console.log('\n📄 Step 2: Extracting text from PDF...');
    const pdfStorage = new PDFStorageService();
    const pdfExtractor = new PDFTextExtractor(pdfStorage);

    const extractionResult = await pdfExtractor.extractTruncated(pdfPath, 100000);

    console.log(`   ✅ Extracted ${extractionResult.text.length} characters`);
    console.log(`   📊 Quality score: ${(extractionResult.quality.score * 100).toFixed(1)}%`);
    console.log(`   📄 Pages: ${extractionResult.numPages}`);

    if (extractionResult.quality.warnings.length > 0) {
      console.log('   ⚠️  Warnings:', extractionResult.quality.warnings.join(', '));
    }

    // Step 3: Run LLM extraction
    console.log('\n🤖 Step 3: Running LLM extraction (Claude API)...');

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable not set');
    }

    const anthropic = new Anthropic({ apiKey });
    const llmExtractor = new LLMExtractor(anthropic);

    const context = {
      aviso: testAviso,
      sources: {
        pdfText: extractionResult.text,
      },
      config: {
        maxPdfChars: 100000,
        llmModel: 'claude-sonnet-4-5-20250929',
        llmTemperature: 0,
      },
    };

    const llmResult = await llmExtractor.extract(context);

    console.log(`   ✅ Extracted ${Object.keys(llmResult.fields).length} fields`);
    console.log(`   💰 Cost: $${llmResult.metadata?.costEstimate?.toFixed(3) || 0}`);

    // Show sample fields
    const sampleFields = Object.keys(llmResult.fields).slice(0, 10);
    console.log(`   📋 Sample fields: ${sampleFields.join(', ')}`);

    // Step 4: Summary
    console.log('\n' + '='.repeat(80));
    console.log('✅ E2E Integration Test PASSED\n');
    console.log('Summary:');
    console.log(`   • PDF downloaded: ${testAviso.codigo}.pdf`);
    console.log(`   • Text extracted: ${extractionResult.text.length} chars`);
    console.log(`   • Fields extracted: ${Object.keys(llmResult.fields).length}`);
    console.log(`   • Cost: $${llmResult.metadata?.costEstimate?.toFixed(3) || 0}`);
    console.log('\nNext Step: Run full e2e-enrichment-pipeline.ts with database integration');

  } catch (error: any) {
    console.error('\n❌ Test FAILED:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
