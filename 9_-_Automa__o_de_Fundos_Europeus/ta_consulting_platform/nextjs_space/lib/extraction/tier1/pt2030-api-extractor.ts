/**
 * TIER 1 EXTRACTOR - Portugal 2030 API
 * Extracts fields directly from API responses
 */

import {
  FieldExtractor,
  ExtractionContext,
  ExtractionResult,
} from '../core/types';

export class PT2030APIExtractor extends FieldExtractor {
  name = 'pt2030_api';
  version = '1.0.0';
  tier = 1 as const;

  supportedFields = [
    'codigo',
    'nome',
    'programa',
    'fundo',
    'fundoEstruturalPrincipal',
    'objetivo_especifico',
    'tipologia_acao',
    'montanteMinimo',
    'montanteMaximo',
    'dataInicioSubmissao',
    'dataFimSubmissao',
    'regiaoNUTS2',
    'programaOperacionalCodigo',
    'eixoPrioritario',
    'prioridadeInvestimento',
    'objetivoEspecificoCodigo',
    'regulamentoURL',
    'anexosRegulamento',
  ];

  async extract(context: ExtractionContext): Promise<ExtractionResult> {
    const startTime = Date.now();
    const { apiData } = context.sources;

    const result: ExtractionResult = {
      fields: {},
      confidence: {},
      errors: [],
      evidence: {},
      metadata: {
        extractorName: this.name,
        extractorVersion: this.version,
        timestamp: new Date().toISOString(),
        durationMs: 0,
      },
    };

    if (!apiData) {
      result.errors.push({
        field: 'all',
        message: 'API data required for PT2030APIExtractor',
      });
      return result;
    }

    // Extract basic fields
    this.extractField(result, 'codigo', apiData.codigo, 1.0);
    this.extractField(result, 'nome', apiData.titulo || apiData.nome, 1.0);
    this.extractField(result, 'programa', apiData.programa, 1.0);
    this.extractField(result, 'fundo', apiData.fundo, 1.0);

    // Extract financial fields
    if (apiData.dotacao) {
      this.extractField(result, 'montanteMinimo', apiData.dotacao, 0.8);
      this.extractField(result, 'montanteMaximo', apiData.dotacao, 0.8);
    }

    // Map fundo to enum
    if (apiData.fundo) {
      const fundoEnum = this.mapFundoToEnum(apiData.fundo);
      this.extractField(result, 'fundoEstruturalPrincipal', fundoEnum, 0.95, [
        'mapFundoToEnum',
      ]);
    }

    // Extract NUTS2 from region text
    if (apiData.regiao) {
      const nuts2 = this.extractNUTS2(apiData.regiao);
      if (nuts2) {
        this.extractField(result, 'regiaoNUTS2', nuts2, 0.9, [
          'extractNUTS2FromText',
        ]);
      }
    }

    // Extract dates
    if (apiData.data_inicio_candidaturas) {
      this.extractField(
        result,
        'dataInicioSubmissao',
        new Date(apiData.data_inicio_candidaturas),
        1.0
      );
    }

    if (apiData.data_fim_candidaturas) {
      this.extractField(
        result,
        'dataFimSubmissao',
        new Date(apiData.data_fim_candidaturas),
        1.0
      );
    }

    // Extract program codes
    if (apiData.programa_operacional) {
      this.extractField(
        result,
        'programaOperacionalCodigo',
        apiData.programa_operacional,
        1.0
      );
    }

    result.metadata.durationMs = Date.now() - startTime;
    this.validateExtraction(result);

    return result;
  }

  private extractField(
    result: ExtractionResult,
    field: string,
    value: any,
    confidence: number,
    transformations: string[] = []
  ): void {
    if (value !== undefined && value !== null) {
      result.fields[field] = value;
      result.confidence[field] = confidence;
      result.evidence[field] = {
        source: 'API',
        rawValue: String(value),
        transformations,
      };
    }
  }

  private mapFundoToEnum(fundo: string): string {
    const mapping: Record<string, string> = {
      'Fundo Europeu de Desenvolvimento Regional': 'FEDER',
      'Fundo Social Europeu Mais': 'FSE_PLUS',
      'Fundo de Coesão': 'FC',
      'Fundo para uma Transição Justa': 'FTJ',
      'Fundo Europeu dos Assuntos Marítimos': 'FEAMPA',
      FEDER: 'FEDER',
      'FSE+': 'FSE_PLUS',
    };

    return mapping[fundo] || fundo;
  }

  private extractNUTS2(regiao: string): string | null {
    const nuts2Map: Record<string, string> = {
      Açores: 'PT20',
      Madeira: 'PT30',
      Norte: 'PT11',
      Centro: 'PT16',
      'Área Metropolitana de Lisboa': 'PT17',
      Lisboa: 'PT17',
      Alentejo: 'PT18',
      Algarve: 'PT15',
    };

    for (const [name, code] of Object.entries(nuts2Map)) {
      if (regiao.toLowerCase().includes(name.toLowerCase())) {
        return code;
      }
    }

    return null;
  }
}
