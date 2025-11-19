/**
 * EXTRACTION ORCHESTRATOR
 * Coordinates all extractors (Tier 1, 2, 3) and merges results
 */

import {
  FieldExtractor,
  ExtractionContext,
  DataSourceLog,
  ExtractionSources,
  AvisoBasic,
} from './core/types';

export type EnrichmentStatus =
  | 'BASIC'
  | 'ENHANCED'
  | 'AI_ENRICHED'
  | 'MANUAL_VERIFIED';

export interface EnrichedAviso extends AvisoBasic {
  [key: string]: any;
  enrichmentStatus: EnrichmentStatus;
  enrichmentScore: number;
  dataSourceLog: DataSourceLog;
  enrichmentErrors: string[];
  lastEnrichedAt: Date;
  enrichedBy: string;
  totalCostEstimate?: number;
}

export class ExtractionOrchestrator {
  private extractors: Map<string, FieldExtractor> = new Map();

  register(extractor: FieldExtractor): void {
    this.extractors.set(extractor.name, extractor);
  }

  async enrichAviso(
    aviso: AvisoBasic,
    sources: ExtractionSources,
    targetStatus: EnrichmentStatus
  ): Promise<EnrichedAviso> {
    const allFields: Record<string, any> = {};
    const dataSourceLog: DataSourceLog = {};
    const errors: string[] = [];
    let totalCost = 0;

    // Tier 1: Always run
    const tier1Extractors = Array.from(this.extractors.values()).filter(
      (e) => e.tier === 1
    );

    for (const extractor of tier1Extractors) {
      try {
        const result = await extractor.extract({ aviso, sources });
        this.mergeResults(allFields, dataSourceLog, result);
        errors.push(...result.errors.map((e) => `${e.field}: ${e.message}`));
      } catch (error: any) {
        errors.push(`${extractor.name}: ${error.message}`);
      }
    }

    // Tier 2: Run if ENHANCED or higher
    if (['ENHANCED', 'AI_ENRICHED', 'MANUAL_VERIFIED'].includes(targetStatus)) {
      const tier2Extractors = Array.from(this.extractors.values()).filter(
        (e) => e.tier === 2
      );

      for (const extractor of tier2Extractors) {
        if (sources.pdfText) {
          try {
            const result = await extractor.extract({ aviso, sources });
            this.mergeResults(allFields, dataSourceLog, result);
            errors.push(...result.errors.map((e) => `${e.field}: ${e.message}`));
          } catch (error: any) {
            errors.push(`${extractor.name}: ${error.message}`);
          }
        }
      }
    }

    // Tier 3: Run if AI_ENRICHED or higher
    if (['AI_ENRICHED', 'MANUAL_VERIFIED'].includes(targetStatus)) {
      const tier3Extractors = Array.from(this.extractors.values()).filter(
        (e) => e.tier === 3
      );

      for (const extractor of tier3Extractors) {
        if (sources.pdfText) {
          // Cost check
          const estimatedCost = await extractor.estimateCost({ aviso, sources });

          if (estimatedCost > 1.0) {
            console.warn(
              `Skipping ${extractor.name} - cost too high: $${estimatedCost}`
            );
            continue;
          }

          try {
            const result = await extractor.extract({ aviso, sources });
            this.mergeResults(allFields, dataSourceLog, result);
            errors.push(...result.errors.map((e) => `${e.field}: ${e.message}`));
            totalCost += result.metadata.costEstimate || 0;
          } catch (error: any) {
            errors.push(`${extractor.name}: ${error.message}`);
          }
        }
      }
    }

    const enrichmentScore = this.calculateScore(dataSourceLog);

    return {
      ...aviso,
      ...allFields,
      enrichmentStatus: targetStatus,
      enrichmentScore,
      dataSourceLog,
      enrichmentErrors: errors,
      lastEnrichedAt: new Date(),
      enrichedBy: 'orchestrator_v1',
      totalCostEstimate: totalCost > 0 ? totalCost : undefined,
    };
  }

  private mergeResults(
    fields: Record<string, any>,
    log: DataSourceLog,
    result: any
  ): void {
    for (const [field, value] of Object.entries(result.fields)) {
      const existingConfidence = log[field]?.confidence || 0;
      const newConfidence = result.confidence[field] || 0;

      if (newConfidence > existingConfidence) {
        fields[field] = value;
        log[field] = {
          source: this.inferSource(result.metadata.extractorName),
          confidence: newConfidence,
          extractedAt: result.metadata.timestamp,
          extractorVersion: result.metadata.extractorVersion,
          evidence: result.evidence[field],
        };
      }
    }
  }

  private inferSource(
    extractorName: string
  ): 'API' | 'PDF_REGEX' | 'PDF_LLM' | 'MANUAL' | 'INFERRED' {
    if (extractorName.includes('api')) return 'API';
    if (extractorName.includes('regex')) return 'PDF_REGEX';
    if (extractorName.includes('llm')) return 'PDF_LLM';
    return 'API';
  }

  private calculateScore(log: DataSourceLog): number {
    const confidences = Object.values(log).map((l) => l.confidence);
    if (confidences.length === 0) return 0;
    return confidences.reduce((a, b) => a + b, 0) / confidences.length;
  }
}
