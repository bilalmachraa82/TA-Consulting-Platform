/**
 * TIER 3 EXTRACTOR - LLM (Claude)
 * Uses AI to extract complex fields from PDF text
 */

import Anthropic from '@anthropic-ai/sdk';
import {
  FieldExtractor,
  ExtractionContext,
  ExtractionResult,
} from '../core/types';

export class LLMExtractor extends FieldExtractor {
  name = 'llm_claude';
  version = 'claude-sonnet-4-5-20250929';
  tier = 3 as const;

  supportedFields = [
    'tiposBeneficiarios',
    'formaJuridicaRequerida',
    'custosElegiveis',
    'custosNaoElegiveis',
    'documentosObrigatorios',
    'declaracoesNecessarias',
    'baseLegalPrincipal',
    'normativoComunitario',
    'regimeAuxilio',
    'artigoGBER',
  ];

  constructor(private anthropic: Anthropic) {
    super();
  }

  async extract(context: ExtractionContext): Promise<ExtractionResult> {
    const { sources: { pdfText }, aviso } = context;
    const config = context.config || {};

    if (!pdfText) {
      return this.emptyResult('PDF text required');
    }

    // Truncate for cost control
    const maxChars = config.maxPdfChars || 100000;
    const truncatedText = pdfText.slice(0, maxChars);

    const prompt = this.buildPrompt(aviso.codigo, truncatedText);

    try {
      const response = await this.anthropic.messages.create({
        model: config.llmModel || 'claude-sonnet-4-5-20250929',
        max_tokens: 4000,
        temperature: config.llmTemperature || 0,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type');
      }

      const extracted = this.parseJSONFromResponse(content.text);

      // Calculate cost
      const inputCost = (response.usage.input_tokens / 1_000_000) * 3;
      const outputCost = (response.usage.output_tokens / 1_000_000) * 15;

      return {
        fields: extracted.fields || {},
        confidence: extracted._confidence || {},
        errors: [],
        evidence: extracted._evidence || {},
        metadata: {
          extractorName: this.name,
          extractorVersion: this.version,
          timestamp: new Date().toISOString(),
          durationMs: 0,
          costEstimate: inputCost + outputCost,
        },
      };
    } catch (error: any) {
      return this.emptyResult(error.message);
    }
  }

  private buildPrompt(codigo: string, pdfText: string): string {
    return `Extract structured data from this Portuguese EU funding regulation.

**Aviso**: ${codigo}

**Regulation Text**:
${pdfText}

---

Extract as JSON:

{
  "fields": {
    "tiposBeneficiarios": ["EMPRESAS", "ASSOCIACOES", etc.],
    "formaJuridicaRequerida": ["Sociedade Anónima", etc.] or null,
    "custosElegiveis": ["Equipamento", "Construção", etc.],
    "custosNaoElegiveis": ["IVA", "Juros", etc.],
    "documentosObrigatorios": ["NIF", "Certidão SS", etc.],
    "declaracoesNecessarias": ["Honra", etc.],
    "baseLegalPrincipal": "DL n.º XX/YYYY, Portaria n.º YY/YYYY",
    "normativoComunitario": "Reg (UE) 2021/1060",
    "regimeAuxilio": "GBER" | "DE_MINIMIS" | "NAO_APLICAVEL",
    "artigoGBER": "Art. 17" or null
  },
  "_confidence": {
    "tiposBeneficiarios": 0.95,
    "custosElegiveis": 0.80
  },
  "_evidence": {
    "baseLegalPrincipal": "Found in Article 2"
  }
}

Rules:
- Return ONLY valid JSON
- Use null if not found
- Portuguese terminology
- For tiposBeneficiarios use: EMPRESAS, ASSOCIACOES, AUTARQUIAS, ONG, COOPERATIVAS, IPSS, ENSINO_INVESTIGACAO, PARTICULARES`;
  }

  private parseJSONFromResponse(text: string): any {
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;

    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error('No JSON in response');
    }

    return JSON.parse(text.slice(jsonStart, jsonEnd));
  }

  private emptyResult(error: string): ExtractionResult {
    return {
      fields: {},
      confidence: {},
      errors: [{ field: 'all', message: error }],
      evidence: {},
      metadata: {
        extractorName: this.name,
        extractorVersion: this.version,
        timestamp: new Date().toISOString(),
        durationMs: 0,
      },
    };
  }

  async estimateCost(context: ExtractionContext): Promise<number> {
    const pdfText = context.sources.pdfText || '';
    const maxChars = context.config?.maxPdfChars || 100000;
    const truncatedLength = Math.min(pdfText.length, maxChars);

    const inputTokens = truncatedLength * 0.25;
    const outputTokens = 1000;

    return (inputTokens / 1_000_000) * 3 + (outputTokens / 1_000_000) * 15;
  }
}
