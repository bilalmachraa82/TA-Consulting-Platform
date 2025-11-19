#!/usr/bin/env tsx
/**
 * End-to-End Enrichment Pipeline
 *
 * Orchestrates complete enrichment flow:
 * 1. Fetch avisos from database (BASIC status)
 * 2. Download PDF regulamento
 * 3. Extract text from PDF
 * 4. Run Tier 3 LLM extraction (Claude API)
 * 5. Run Compliance Engine check
 * 6. Update database with enriched data
 * 7. Generate reports
 *
 * Usage:
 *   tsx scripts/e2e-enrichment-pipeline.ts [--limit N] [--portal PORTAL]
 */

import { PrismaClient, Portal, EnrichmentStatus, PDFStatus } from '@prisma/client';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import Anthropic from '@anthropic-ai/sdk';
import { PDFTextExtractor } from '../lib/pdf/extractor';
import { PDFStorageService } from '../lib/pdf/storage';
import { LLMExtractor } from '../lib/extraction/tier3/llm-extractor';

// Types
interface EnrichmentResult {
  avisoId: string;
  codigo: string;
  success: boolean;
  fieldsExtracted: number;
  complianceStatus?: string;
  compliancePassed?: number;
  complianceFailed?: number;
  costEstimate: number;
  error?: string;
  duration: number;
}

interface PipelineStats {
  totalProcessed: number;
  successful: number;
  failed: number;
  totalCost: number;
  totalDuration: number;
  avgFieldsExtracted: number;
  avgCompliancePassed: number;
}

class E2EPipeline {
  private prisma: PrismaClient;
  private complianceEnginePath: string;
  private pythonPath: string;
  private pdfExtractor: PDFTextExtractor;
  private llmExtractor: LLMExtractor;
  private anthropic: Anthropic;

  constructor() {
    this.prisma = new PrismaClient();

    // Path to Python compliance engine
    // From scripts/ → nextjs_space/ → ta_consulting_platform/ → 9_-_Automa__o_de_Fundos_Europeus/ → TA-Consulting-Platform/
    const projectRoot = path.resolve(__dirname, '../../../..');
    this.complianceEnginePath = path.join(
      projectRoot,
      'compliance',
      'engine',
      'compliance_engine.py'
    );

    // Python executable (prefer python3)
    this.pythonPath = 'python3';

    // Initialize PDF and LLM extractors
    const pdfStorage = new PDFStorageService();
    this.pdfExtractor = new PDFTextExtractor(pdfStorage);

    // Initialize Anthropic client
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable not set');
    }
    this.anthropic = new Anthropic({ apiKey });
    this.llmExtractor = new LLMExtractor(this.anthropic);
  }

  /**
   * Main pipeline execution
   */
  async run(options: { limit?: number; portal?: Portal } = {}): Promise<PipelineStats> {
    console.log('=' .repeat(80));
    console.log('🚀 END-TO-END ENRICHMENT PIPELINE');
    console.log('='.repeat(80));
    console.log(`\nOptions:`, options);

    // Fetch avisos to enrich
    const avisos = await this.fetchAvisosToEnrich(options);

    if (avisos.length === 0) {
      console.log('\n⚠️  No avisos found to enrich');
      return this.getEmptyStats();
    }

    console.log(`\n✅ Found ${avisos.length} avisos to enrich`);

    // Process each aviso
    const results: EnrichmentResult[] = [];

    for (let i = 0; i < avisos.length; i++) {
      const aviso = avisos[i];
      console.log(`\n${'='.repeat(80)}`);
      console.log(`📋 Processing ${i + 1}/${avisos.length}: ${aviso.codigo}`);
      console.log('='.repeat(80));

      const result = await this.processAviso(aviso);
      results.push(result);

      // Show progress
      this.logResult(result);
    }

    // Generate statistics
    const stats = this.calculateStats(results);
    this.printFinalReport(stats, results);

    await this.prisma.$disconnect();

    return stats;
  }

  /**
   * Fetch avisos that need enrichment
   */
  private async fetchAvisosToEnrich(options: { limit?: number; portal?: Portal }) {
    const where: any = {
      enrichmentStatus: EnrichmentStatus.BASIC,
      ativo: true,
    };

    if (options.portal) {
      where.portal = options.portal;
    }

    return await this.prisma.aviso.findMany({
      where,
      take: options.limit || 10,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Process a single aviso through the entire pipeline
   */
  private async processAviso(aviso: any): Promise<EnrichmentResult> {
    const startTime = Date.now();

    const result: EnrichmentResult = {
      avisoId: aviso.id,
      codigo: aviso.codigo,
      success: false,
      fieldsExtracted: 0,
      costEstimate: 0,
      duration: 0,
    };

    try {
      // Step 1: Download PDF (if not already downloaded)
      console.log('\n📥 Step 1: Downloading PDF...');
      const pdfPath = await this.downloadPDF(aviso);

      if (!pdfPath) {
        throw new Error('PDF download failed');
      }

      console.log(`   ✅ PDF downloaded: ${pdfPath}`);

      // Step 2: Extract text from PDF
      console.log('\n📄 Step 2: Extracting text from PDF...');
      const extractedText = await this.extractTextFromPDF(pdfPath);
      console.log(`   ✅ Extracted ${extractedText.length} characters`);

      // Step 3: Run Tier 3 LLM extraction
      console.log('\n🤖 Step 3: Running Tier 3 LLM extraction...');
      const extractionResult = await this.runLLMExtraction(aviso, extractedText);

      result.fieldsExtracted = extractionResult.fieldsExtracted;
      result.costEstimate = extractionResult.cost;

      console.log(`   ✅ Extracted ${result.fieldsExtracted} fields`);
      console.log(`   💰 Cost: $${result.costEstimate.toFixed(3)}`);

      // Step 4: Run Compliance Engine check
      console.log('\n⚖️  Step 4: Running Compliance Engine...');
      const complianceResult = await this.runComplianceCheck(aviso, extractionResult.fields);

      result.complianceStatus = complianceResult.overall_status;
      result.compliancePassed = complianceResult.passed;
      result.complianceFailed = complianceResult.failed;

      console.log(`   ✅ Compliance: ${result.complianceStatus}`);
      console.log(`   ✅ Passed: ${result.compliancePassed}/${complianceResult.total_rules}`);

      // Step 5: Update database
      console.log('\n💾 Step 5: Updating database...');
      await this.updateDatabase(aviso.id, extractionResult.fields, complianceResult);
      console.log(`   ✅ Database updated`);

      result.success = true;

    } catch (error: any) {
      console.error(`\n❌ Error processing ${aviso.codigo}:`, error.message);
      result.error = error.message;
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  /**
   * Download PDF for aviso
   */
  private async downloadPDF(aviso: any): Promise<string | null> {
    // Check if already downloaded
    if (aviso.pdfStoragePath && fs.existsSync(aviso.pdfStoragePath)) {
      return aviso.pdfStoragePath;
    }

    // For now, return null (PDF download would be implemented here)
    // In production, this would:
    // 1. Use portal-specific downloader
    // 2. Download to storage
    // 3. Calculate hash
    // 4. Update pdfStoragePath in DB

    console.log('   ⚠️  PDF download not implemented yet (using existing path if available)');
    return aviso.pdfStoragePath || null;
  }

  /**
   * Extract text from PDF
   */
  private async extractTextFromPDF(pdfPath: string): Promise<string> {
    try {
      const result = await this.pdfExtractor.extractTruncated(pdfPath, 100000);

      if (result.quality.score < 0.3) {
        console.warn('   ⚠️  Low PDF quality:', result.quality.warnings.join(', '));
      }

      return result.text;
    } catch (error: any) {
      throw new Error(`PDF text extraction failed: ${error.message}`);
    }
  }

  /**
   * Run Tier 3 LLM extraction
   */
  private async runLLMExtraction(aviso: any, pdfText: string): Promise<any> {
    try {
      const context = {
        aviso: {
          id: aviso.id, // Add required id field
          codigo: aviso.codigo,
          nome: aviso.nome,
          portal: aviso.portal,
          programa: aviso.programa,
        },
        sources: {
          pdfText,
        },
        config: {
          maxPdfChars: 100000,
          llmModel: 'claude-sonnet-4-5-20250929',
          llmTemperature: 0,
        },
      };

      const result = await this.llmExtractor.extract(context);

      if (result.errors && result.errors.length > 0) {
        console.warn('   ⚠️  LLM extraction warnings:', result.errors.join(', '));
      }

      return {
        fieldsExtracted: Object.keys(result.fields).length,
        cost: result.metadata?.costEstimate || 0,
        fields: result.fields,
        confidence: result.confidence,
      };
    } catch (error: any) {
      throw new Error(`LLM extraction failed: ${error.message}`);
    }
  }

  /**
   * Run Compliance Engine check
   */
  private async runComplianceCheck(aviso: any, extractedFields: any): Promise<any> {
    return new Promise((resolve, reject) => {
      // Prepare input data for compliance engine
      const inputData = {
        aviso_id: aviso.codigo,
        programa: this.mapPortalToPrograma(aviso.portal),
        empresa: {},  // Would come from database
        candidatura: {},  // Would come from database
        aviso: {
          codigo: aviso.codigo,
          ...extractedFields,
        },
      };

      // Write input to temp file
      const tmpFile = `/tmp/compliance_input_${Date.now()}.json`;
      fs.writeFileSync(tmpFile, JSON.stringify(inputData));

      // Call Python compliance engine
      const python = spawn(this.pythonPath, [
        '-c',
        `
import sys
import json
sys.path.insert(0, '${path.dirname(this.complianceEnginePath)}')
from compliance_engine import ComplianceEngine
from pathlib import Path

# Load input
with open('${tmpFile}', 'r') as f:
    data = json.load(f)

# Run compliance check
rulesets_dir = Path('${path.dirname(this.complianceEnginePath)}') / '..' / 'rulesets'
engine = ComplianceEngine(rulesets_dir)

report = engine.check_compliance(
    aviso_id=data['aviso_id'],
    programa=data['programa'],
    empresa=data.get('empresa'),
    candidatura=data.get('candidatura'),
    aviso=data.get('aviso')
)

# Output report
print(json.dumps(report.to_dict()))
        `.trim()
      ]);

      let output = '';
      let errorOutput = '';

      python.stdout.on('data', (data) => {
        output += data.toString();
      });

      python.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      python.on('close', (code) => {
        // Clean up temp file
        try {
          fs.unlinkSync(tmpFile);
        } catch (e) {}

        if (code !== 0) {
          reject(new Error(`Compliance engine failed: ${errorOutput}`));
          return;
        }

        try {
          // Parse JSON from last line (after any logging)
          const lines = output.trim().split('\n');
          const jsonLine = lines[lines.length - 1];
          const result = JSON.parse(jsonLine);
          resolve(result);
        } catch (e: any) {
          reject(new Error(`Failed to parse compliance output: ${e.message}\nOutput: ${output}`));
        }
      });
    });
  }

  /**
   * Map Portal to Programa name for compliance engine
   */
  private mapPortalToPrograma(portal: Portal): string {
    switch (portal) {
      case 'PORTUGAL2030':
        return 'PT2030';
      case 'PRR':
        return 'PRR';
      case 'PAPAC':
        return 'PEPACC';
      default:
        return 'PT2030';
    }
  }

  /**
   * Update database with enriched data
   */
  private async updateDatabase(avisoId: string, fields: any, complianceResult: any) {
    await this.prisma.aviso.update({
      where: { id: avisoId },
      data: {
        enrichmentStatus: EnrichmentStatus.AI_ENRICHED, // Changed from ENRICHED to AI_ENRICHED
        enrichmentScore: this.calculateEnrichmentScore(fields, complianceResult),
        lastEnrichedAt: new Date(),
        // Would update individual fields here based on extracted data
        // e.g.:
        // taxaCofinanciamentoMax: fields.taxaCofinanciamentoMax,
        // caeElegiveis: fields.caeElegiveis,
        // etc.
      },
    });
  }

  /**
   * Calculate enrichment score (0-1)
   */
  private calculateEnrichmentScore(fields: any, complianceResult: any): number {
    // Field coverage: 59/75 = 0.787
    const fieldCoverage = Object.keys(fields).length / 75;

    // Compliance pass rate
    const complianceScore = complianceResult.passed / complianceResult.total_rules;

    // Weighted average (70% fields, 30% compliance)
    return (fieldCoverage * 0.7) + (complianceScore * 0.3);
  }

  /**
   * Calculate pipeline statistics
   */
  private calculateStats(results: EnrichmentResult[]): PipelineStats {
    const successful = results.filter(r => r.success);

    return {
      totalProcessed: results.length,
      successful: successful.length,
      failed: results.filter(r => !r.success).length,
      totalCost: successful.reduce((sum, r) => sum + r.costEstimate, 0),
      totalDuration: results.reduce((sum, r) => sum + r.duration, 0),
      avgFieldsExtracted: successful.length > 0
        ? successful.reduce((sum, r) => sum + r.fieldsExtracted, 0) / successful.length
        : 0,
      avgCompliancePassed: successful.length > 0
        ? successful.reduce((sum, r) => sum + (r.compliancePassed || 0), 0) / successful.length
        : 0,
    };
  }

  /**
   * Log individual result
   */
  private logResult(result: EnrichmentResult) {
    if (result.success) {
      console.log(`\n✅ SUCCESS: ${result.codigo}`);
      console.log(`   Fields: ${result.fieldsExtracted}`);
      console.log(`   Compliance: ${result.complianceStatus} (${result.compliancePassed} passed)`);
      console.log(`   Cost: $${result.costEstimate.toFixed(3)}`);
      console.log(`   Duration: ${(result.duration / 1000).toFixed(1)}s`);
    } else {
      console.log(`\n❌ FAILED: ${result.codigo}`);
      console.log(`   Error: ${result.error}`);
    }
  }

  /**
   * Print final report
   */
  private printFinalReport(stats: PipelineStats, results: EnrichmentResult[]) {
    console.log('\n' + '='.repeat(80));
    console.log('📊 PIPELINE EXECUTION SUMMARY');
    console.log('='.repeat(80));

    console.log(`\n📈 Overall Statistics:`);
    console.log(`   Total Processed: ${stats.totalProcessed}`);
    console.log(`   ✅ Successful: ${stats.successful}`);
    console.log(`   ❌ Failed: ${stats.failed}`);
    console.log(`   Success Rate: ${((stats.successful / stats.totalProcessed) * 100).toFixed(1)}%`);

    console.log(`\n💰 Cost Analysis:`);
    console.log(`   Total Cost: $${stats.totalCost.toFixed(2)}`);
    console.log(`   Avg Cost per Aviso: $${(stats.totalCost / stats.successful).toFixed(3)}`);

    console.log(`\n⏱️  Performance:`);
    console.log(`   Total Duration: ${(stats.totalDuration / 1000).toFixed(1)}s`);
    console.log(`   Avg Duration: ${(stats.totalDuration / stats.totalProcessed / 1000).toFixed(1)}s per aviso`);

    console.log(`\n📊 Data Quality:`);
    console.log(`   Avg Fields Extracted: ${stats.avgFieldsExtracted.toFixed(1)}/75`);
    console.log(`   Avg Compliance Passed: ${stats.avgCompliancePassed.toFixed(1)} rules`);

    // List failed avisos
    const failed = results.filter(r => !r.success);
    if (failed.length > 0) {
      console.log(`\n❌ Failed Avisos:`);
      failed.forEach(r => {
        console.log(`   - ${r.codigo}: ${r.error}`);
      });
    }

    console.log('\n' + '='.repeat(80));
  }

  private getEmptyStats(): PipelineStats {
    return {
      totalProcessed: 0,
      successful: 0,
      failed: 0,
      totalCost: 0,
      totalDuration: 0,
      avgFieldsExtracted: 0,
      avgCompliancePassed: 0,
    };
  }
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);
  const options: { limit?: number; portal?: Portal } = {};

  // Parse CLI args
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--limit' && args[i + 1]) {
      options.limit = parseInt(args[i + 1]);
      i++;
    } else if (args[i] === '--portal' && args[i + 1]) {
      options.portal = args[i + 1] as Portal;
      i++;
    }
  }

  const pipeline = new E2EPipeline();
  const stats = await pipeline.run(options);

  // Exit with appropriate code
  process.exit(stats.failed > 0 ? 1 : 0);
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export type { EnrichmentResult, PipelineStats };
export { E2EPipeline };
