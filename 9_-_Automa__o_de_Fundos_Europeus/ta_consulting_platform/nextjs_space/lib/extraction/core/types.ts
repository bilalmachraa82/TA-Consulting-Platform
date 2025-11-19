/**
 * EXTRACTION FRAMEWORK - CORE TYPES
 * Type definitions for the modular field extraction system
 */

export interface ExtractionContext {
  aviso: AvisoBasic;
  sources: ExtractionSources;
  targetFields?: string[];
  config?: ExtractionConfig;
}

export interface AvisoBasic {
  id: string;
  codigo: string;
  nome: string;
  portal: 'PORTUGAL2030' | 'PRR' | 'PEPACC';
}

export interface ExtractionSources {
  apiData?: any;
  pdfText?: string;
  pdfPath?: string;
  regulationUrl?: string;
  cachedData?: Record<string, any>;
}

export interface ExtractionConfig {
  maxPdfChars?: number;
  llmModel?: string;
  llmTemperature?: number;
  confidenceThreshold?: number;
  retryAttempts?: number;
}

export interface ExtractionResult {
  fields: Record<string, any>;
  confidence: Record<string, number>;
  errors: ExtractionError[];
  evidence: Record<string, Evidence>;
  metadata: {
    extractorName: string;
    extractorVersion: string;
    timestamp: string;
    durationMs: number;
    costEstimate?: number;
  };
}

export interface ExtractionError {
  field: string;
  message: string;
  stack?: string;
}

export interface Evidence {
  source: 'API' | 'PDF_PAGE' | 'PDF_TABLE' | 'LLM_INFERENCE';
  location?: {
    page?: number;
    section?: string;
    textSnippet?: string;
  };
  rawValue?: string;
  transformations?: string[];
}

export type DataSourceLog = Record<
  string,
  {
    source: 'API' | 'PDF_REGEX' | 'PDF_LLM' | 'MANUAL' | 'INFERRED';
    confidence: number;
    extractedAt: string;
    extractorVersion?: string;
    evidence?: Evidence;
    rawValue?: string;
    validatedBy?: string;
  }
>;

export abstract class FieldExtractor {
  abstract name: string;
  abstract version: string;
  abstract supportedFields: string[];
  abstract tier: 1 | 2 | 3;

  abstract extract(context: ExtractionContext): Promise<ExtractionResult>;

  protected validateExtraction(result: ExtractionResult): void {
    for (const field of Object.keys(result.fields)) {
      if (!this.supportedFields.includes(field)) {
        throw new Error(`Field ${field} not in supportedFields`);
      }
    }
  }

  async estimateCost(context: ExtractionContext): Promise<number> {
    return 0;
  }
}
