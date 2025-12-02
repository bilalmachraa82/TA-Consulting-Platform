/**
 * aiparati-express Integration Client
 *
 * Cliente para integração com o microserviço aiparati-express que processa:
 * - Upload e análise de IES (Informação Empresarial Simplificada)
 * - Análise financeira com Claude/LLM
 * - Geração de templates IAPMEI
 * - Enriquecimento de scores de elegibilidade
 *
 * @author TA Consulting Platform
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

// ============================================
// TYPES
// ============================================

/**
 * Dados da IES (Informação Empresarial Simplificada)
 */
export interface IESData {
  // Identificação
  nipc: string;
  nomeEmpresa: string;
  cae: string;
  caeSecundarios?: string[];
  anoExercicio: number;

  // Balanço
  ativoTotal: number;
  ativoCorrente: number;
  ativoNaoCorrente: number;
  passivoTotal: number;
  passivoCorrente: number;
  passivoNaoCorrente: number;
  capitalProprio: number;

  // Demonstração de Resultados
  volumeNegocios: number;
  resultadoOperacional: number;
  resultadoLiquido: number;
  gastosComPessoal: number;
  custoMercadoriasVendidas: number;
  fse: number; // Fornecimentos e Serviços Externos

  // Recursos Humanos
  numeroTrabalhadores: number;
  numeroPraticantes?: number;

  // Rácios calculados (opcionais, podem ser calculados)
  autonomiaFinanceira?: number;
  liquidezGeral?: number;
  rentabilidadeCapitaisProprios?: number;
  rentabilidadeAtivo?: number;
  margemBruta?: number;
  margemLiquida?: number;
}

/**
 * Resultado da análise financeira
 */
export interface AnaliseFinanceira {
  // Scores
  scoreGlobal: number; // 0-100
  scoreSaude: number;
  scoreRentabilidade: number;
  scoreLiquidez: number;
  scoreSolvabilidade: number;

  // Rácios
  autonomiaFinanceira: number;
  liquidezGeral: number;
  liquidezReduzida: number;
  rentabilidadeCapitaisProprios: number;
  rentabilidadeAtivo: number;
  margemBruta: number;
  margemLiquida: number;
  debtToEquity: number;
  currentRatio: number;

  // Classificações
  dimensao: 'MICRO' | 'PEQUENA' | 'MEDIA' | 'GRANDE';
  risco: 'BAIXO' | 'MEDIO' | 'ALTO';
  tendencia: 'CRESCIMENTO' | 'ESTAVEL' | 'DECLINIO';

  // Insights
  pontosFavoraveis: string[];
  pontosAtencao: string[];
  recomendacoes: string[];

  // Metadados
  dataAnalise: string;
  versaoModelo: string;
}

/**
 * Template IAPMEI gerado
 */
export interface TemplateIAPMEI {
  tipo: 'CANDIDATURA' | 'RELATORIO' | 'PLANO_NEGOCIOS' | 'MEMORIAL_DESCRITIVO';
  titulo: string;
  conteudo: string;
  secoes: {
    id: string;
    titulo: string;
    conteudo: string;
    preenchido: boolean;
  }[];
  camposPreenchidos: Record<string, string>;
  geradoEm: string;
}

/**
 * Score de elegibilidade enriquecido
 */
export interface ElegibilidadeEnriquecida {
  // Score base (do sistema original)
  scoreBase: number;

  // Enriquecimento com dados financeiros
  scoreFinanceiro: number;
  scoreFinal: number;

  // Factores de elegibilidade
  elegivel: boolean;
  fatoresPositivos: string[];
  fatoresNegativos: string[];
  restricoes: string[];

  // Recomendações específicas
  avisosMaisAdequados: {
    avisoId: string;
    avisoNome: string;
    compatibilidade: number;
    motivo: string;
  }[];

  // Simulação de candidatura
  montanteRecomendado: number;
  taxaApoioEstimada: number;
  probabilidadeAprovacao: number;

  // Documentos necessários
  documentosPendentes: string[];
  documentosCompletos: string[];
}

/**
 * Configuração do cliente
 */
export interface AiparatiConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
}

/**
 * Status do serviço
 */
export interface ServiceStatus {
  online: boolean;
  version: string;
  lastHealthCheck: string;
  features: string[];
}

// ============================================
// CLIENT IMPLEMENTATION
// ============================================

/**
 * Cliente para o serviço aiparati-express
 */
export class AiparatiClient {
  private client: AxiosInstance;
  private config: AiparatiConfig;
  private isAvailable: boolean = false;

  constructor(config?: Partial<AiparatiConfig>) {
    this.config = {
      baseUrl: config?.baseUrl || process.env.AIPARATI_URL || 'http://localhost:3001',
      apiKey: config?.apiKey || process.env.AIPARATI_API_KEY,
      timeout: config?.timeout || 30000,
    };

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey ? { 'Authorization': `Bearer ${this.config.apiKey}` } : {}),
      },
    });

    // Request interceptor
    this.client.interceptors.request.use((config) => {
      console.log(`[aiparati] ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    });

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        console.error(`[aiparati] Error: ${error.message}`);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Verificar se o serviço está disponível
   */
  async checkHealth(): Promise<ServiceStatus> {
    try {
      const response = await this.client.get('/health');
      this.isAvailable = true;
      return {
        online: true,
        version: response.data.version || '1.0.0',
        lastHealthCheck: new Date().toISOString(),
        features: response.data.features || ['ies-analysis', 'templates', 'eligibility'],
      };
    } catch (error) {
      this.isAvailable = false;
      return {
        online: false,
        version: 'unknown',
        lastHealthCheck: new Date().toISOString(),
        features: [],
      };
    }
  }

  /**
   * Processar upload de IES (PDF ou XML)
   */
  async uploadIES(file: Buffer | string, filename: string): Promise<IESData> {
    const formData = new FormData();

    if (typeof file === 'string') {
      // Base64 string
      const blob = new Blob([Buffer.from(file, 'base64')], { type: 'application/pdf' });
      formData.append('file', blob, filename);
    } else {
      // Buffer
      const blob = new Blob([file], { type: 'application/pdf' });
      formData.append('file', blob, filename);
    }

    try {
      const response = await this.client.post('/api/ies/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      // Fallback: Retornar estrutura vazia
      console.warn('[aiparati] IES upload failed, using placeholder');
      return this.getPlaceholderIES();
    }
  }

  /**
   * Analisar IES já processada
   */
  async analyzeIES(iesData: IESData): Promise<AnaliseFinanceira> {
    try {
      const response = await this.client.post('/api/ies/analyze', iesData);
      return response.data;
    } catch (error) {
      // Fallback: Calcular localmente
      console.warn('[aiparati] Using local analysis fallback');
      return this.calculateLocalAnalysis(iesData);
    }
  }

  /**
   * Gerar template IAPMEI
   */
  async generateTemplate(
    tipo: TemplateIAPMEI['tipo'],
    empresaData: { nipc: string; nome: string; ies?: IESData },
    avisoId?: string
  ): Promise<TemplateIAPMEI> {
    try {
      const response = await this.client.post('/api/templates/generate', {
        tipo,
        empresa: empresaData,
        avisoId,
      });
      return response.data;
    } catch (error) {
      // Fallback: Template básico
      return this.getBasicTemplate(tipo, empresaData);
    }
  }

  /**
   * Calcular elegibilidade enriquecida
   */
  async calculateEnrichedEligibility(
    empresaId: string,
    iesData: IESData,
    avisoIds?: string[]
  ): Promise<ElegibilidadeEnriquecida> {
    try {
      const response = await this.client.post('/api/eligibility/enriched', {
        empresaId,
        iesData,
        avisoIds,
      });
      return response.data;
    } catch (error) {
      // Fallback: Cálculo local
      return this.calculateLocalEligibility(iesData, avisoIds);
    }
  }

  /**
   * Obter análise completa (IES + Elegibilidade + Recomendações)
   */
  async getFullAnalysis(
    iesData: IESData,
    avisoIds?: string[]
  ): Promise<{
    financeira: AnaliseFinanceira;
    elegibilidade: ElegibilidadeEnriquecida;
  }> {
    const [financeira, elegibilidade] = await Promise.all([
      this.analyzeIES(iesData),
      this.calculateEnrichedEligibility(iesData.nipc, iesData, avisoIds),
    ]);

    return { financeira, elegibilidade };
  }

  // ============================================
  // FALLBACK / LOCAL CALCULATIONS
  // ============================================

  /**
   * Análise financeira local (fallback)
   */
  private calculateLocalAnalysis(ies: IESData): AnaliseFinanceira {
    // Calcular rácios
    const autonomiaFinanceira = ies.ativoTotal > 0
      ? (ies.capitalProprio / ies.ativoTotal) * 100
      : 0;

    const liquidezGeral = ies.passivoCorrente > 0
      ? ies.ativoCorrente / ies.passivoCorrente
      : 0;

    const liquidezReduzida = ies.passivoCorrente > 0
      ? (ies.ativoCorrente - (ies.custoMercadoriasVendidas * 0.1)) / ies.passivoCorrente
      : 0;

    const rentabilidadeCapitaisProprios = ies.capitalProprio > 0
      ? (ies.resultadoLiquido / ies.capitalProprio) * 100
      : 0;

    const rentabilidadeAtivo = ies.ativoTotal > 0
      ? (ies.resultadoLiquido / ies.ativoTotal) * 100
      : 0;

    const margemBruta = ies.volumeNegocios > 0
      ? ((ies.volumeNegocios - ies.custoMercadoriasVendidas) / ies.volumeNegocios) * 100
      : 0;

    const margemLiquida = ies.volumeNegocios > 0
      ? (ies.resultadoLiquido / ies.volumeNegocios) * 100
      : 0;

    const debtToEquity = ies.capitalProprio > 0
      ? ies.passivoTotal / ies.capitalProprio
      : 0;

    // Determinar dimensão
    let dimensao: AnaliseFinanceira['dimensao'] = 'MICRO';
    if (ies.numeroTrabalhadores >= 250 || ies.volumeNegocios >= 50000000) {
      dimensao = 'GRANDE';
    } else if (ies.numeroTrabalhadores >= 50 || ies.volumeNegocios >= 10000000) {
      dimensao = 'MEDIA';
    } else if (ies.numeroTrabalhadores >= 10 || ies.volumeNegocios >= 2000000) {
      dimensao = 'PEQUENA';
    }

    // Calcular scores
    const scoreSaude = Math.min(100, Math.max(0, autonomiaFinanceira * 2));
    const scoreRentabilidade = Math.min(100, Math.max(0, 50 + rentabilidadeCapitaisProprios));
    const scoreLiquidez = Math.min(100, Math.max(0, liquidezGeral * 50));
    const scoreSolvabilidade = Math.min(100, Math.max(0, 100 - (debtToEquity * 20)));

    const scoreGlobal = Math.round(
      (scoreSaude * 0.3) +
      (scoreRentabilidade * 0.25) +
      (scoreLiquidez * 0.25) +
      (scoreSolvabilidade * 0.2)
    );

    // Determinar risco
    let risco: AnaliseFinanceira['risco'] = 'MEDIO';
    if (scoreGlobal >= 70 && autonomiaFinanceira >= 30) {
      risco = 'BAIXO';
    } else if (scoreGlobal < 40 || autonomiaFinanceira < 15) {
      risco = 'ALTO';
    }

    // Determinar tendência (simplificado)
    const tendencia: AnaliseFinanceira['tendencia'] = ies.resultadoLiquido > 0 ? 'CRESCIMENTO' : 'DECLINIO';

    // Gerar insights
    const pontosFavoraveis: string[] = [];
    const pontosAtencao: string[] = [];
    const recomendacoes: string[] = [];

    if (autonomiaFinanceira >= 30) pontosFavoraveis.push('Boa autonomia financeira');
    if (liquidezGeral >= 1.5) pontosFavoraveis.push('Liquidez confortável');
    if (rentabilidadeCapitaisProprios >= 10) pontosFavoraveis.push('Rentabilidade atrativa');
    if (ies.resultadoLiquido > 0) pontosFavoraveis.push('Resultado líquido positivo');

    if (autonomiaFinanceira < 20) pontosAtencao.push('Autonomia financeira baixa');
    if (liquidezGeral < 1) pontosAtencao.push('Possíveis dificuldades de tesouraria');
    if (debtToEquity > 3) pontosAtencao.push('Elevado endividamento');
    if (margemLiquida < 3) pontosAtencao.push('Margem líquida reduzida');

    if (autonomiaFinanceira < 25) recomendacoes.push('Considerar aumento de capital próprio');
    if (liquidezGeral < 1) recomendacoes.push('Rever prazos de pagamento e recebimento');
    if (margemBruta < 30) recomendacoes.push('Analisar estrutura de custos');

    return {
      scoreGlobal,
      scoreSaude,
      scoreRentabilidade,
      scoreLiquidez,
      scoreSolvabilidade,
      autonomiaFinanceira: Math.round(autonomiaFinanceira * 100) / 100,
      liquidezGeral: Math.round(liquidezGeral * 100) / 100,
      liquidezReduzida: Math.round(liquidezReduzida * 100) / 100,
      rentabilidadeCapitaisProprios: Math.round(rentabilidadeCapitaisProprios * 100) / 100,
      rentabilidadeAtivo: Math.round(rentabilidadeAtivo * 100) / 100,
      margemBruta: Math.round(margemBruta * 100) / 100,
      margemLiquida: Math.round(margemLiquida * 100) / 100,
      debtToEquity: Math.round(debtToEquity * 100) / 100,
      currentRatio: Math.round(liquidezGeral * 100) / 100,
      dimensao,
      risco,
      tendencia,
      pontosFavoraveis,
      pontosAtencao,
      recomendacoes,
      dataAnalise: new Date().toISOString(),
      versaoModelo: 'local-1.0',
    };
  }

  /**
   * Elegibilidade local (fallback)
   */
  private calculateLocalEligibility(
    ies: IESData,
    _avisoIds?: string[]
  ): ElegibilidadeEnriquecida {
    const analise = this.calculateLocalAnalysis(ies);

    // Score financeiro baseado na análise
    const scoreFinanceiro = analise.scoreGlobal;

    // Score base (placeholder)
    const scoreBase = 60;

    // Score final (média ponderada)
    const scoreFinal = Math.round((scoreBase * 0.4) + (scoreFinanceiro * 0.6));

    // Determinar elegibilidade
    const elegivel = scoreFinal >= 50 && analise.autonomiaFinanceira >= 15;

    // Fatores
    const fatoresPositivos: string[] = [];
    const fatoresNegativos: string[] = [];
    const restricoes: string[] = [];

    if (analise.autonomiaFinanceira >= 25) {
      fatoresPositivos.push('Autonomia financeira adequada aos requisitos IAPMEI');
    }
    if (ies.resultadoLiquido > 0) {
      fatoresPositivos.push('Empresa com resultados positivos');
    }
    if (analise.liquidezGeral >= 1) {
      fatoresPositivos.push('Capacidade de cumprir obrigações de curto prazo');
    }

    if (analise.autonomiaFinanceira < 20) {
      fatoresNegativos.push('Autonomia financeira abaixo do recomendado');
      restricoes.push('Alguns avisos exigem AF mínima de 20%');
    }
    if (analise.risco === 'ALTO') {
      fatoresNegativos.push('Perfil de risco elevado');
    }

    // Montante recomendado
    const capacidadeInvestimento = Math.max(0, ies.capitalProprio * 1.5);
    const montanteRecomendado = Math.min(
      capacidadeInvestimento,
      analise.dimensao === 'MICRO' ? 200000 :
      analise.dimensao === 'PEQUENA' ? 500000 :
      analise.dimensao === 'MEDIA' ? 2000000 : 10000000
    );

    return {
      scoreBase,
      scoreFinanceiro,
      scoreFinal,
      elegivel,
      fatoresPositivos,
      fatoresNegativos,
      restricoes,
      avisosMaisAdequados: [], // Seria preenchido com dados reais
      montanteRecomendado: Math.round(montanteRecomendado),
      taxaApoioEstimada: analise.dimensao === 'MICRO' ? 75 : analise.dimensao === 'PEQUENA' ? 65 : 50,
      probabilidadeAprovacao: Math.max(20, Math.min(85, scoreFinal)),
      documentosPendentes: ['IES atual', 'Certidão Permanente', 'Declaração de compromisso'],
      documentosCompletos: [],
    };
  }

  /**
   * IES placeholder
   */
  private getPlaceholderIES(): IESData {
    return {
      nipc: '',
      nomeEmpresa: '',
      cae: '',
      anoExercicio: new Date().getFullYear() - 1,
      ativoTotal: 0,
      ativoCorrente: 0,
      ativoNaoCorrente: 0,
      passivoTotal: 0,
      passivoCorrente: 0,
      passivoNaoCorrente: 0,
      capitalProprio: 0,
      volumeNegocios: 0,
      resultadoOperacional: 0,
      resultadoLiquido: 0,
      gastosComPessoal: 0,
      custoMercadoriasVendidas: 0,
      fse: 0,
      numeroTrabalhadores: 0,
    };
  }

  /**
   * Template básico
   */
  private getBasicTemplate(
    tipo: TemplateIAPMEI['tipo'],
    empresaData: { nipc: string; nome: string }
  ): TemplateIAPMEI {
    const templates: Record<string, { titulo: string; secoes: string[] }> = {
      'CANDIDATURA': {
        titulo: 'Formulário de Candidatura',
        secoes: ['Identificação', 'Projeto', 'Investimento', 'Indicadores', 'Documentos'],
      },
      'RELATORIO': {
        titulo: 'Relatório de Execução',
        secoes: ['Resumo', 'Atividades Realizadas', 'Despesas', 'Indicadores', 'Conclusões'],
      },
      'PLANO_NEGOCIOS': {
        titulo: 'Plano de Negócios',
        secoes: ['Sumário Executivo', 'Empresa', 'Mercado', 'Estratégia', 'Financeiro'],
      },
      'MEMORIAL_DESCRITIVO': {
        titulo: 'Memorial Descritivo',
        secoes: ['Contexto', 'Objetivos', 'Metodologia', 'Resultados Esperados', 'Cronograma'],
      },
    };

    const template = templates[tipo] || templates['CANDIDATURA'];

    return {
      tipo,
      titulo: template.titulo,
      conteudo: `Template ${template.titulo} para ${empresaData.nome} (${empresaData.nipc})`,
      secoes: template.secoes.map((titulo, i) => ({
        id: `sec_${i + 1}`,
        titulo,
        conteudo: `[Preencher ${titulo}]`,
        preenchido: false,
      })),
      camposPreenchidos: {
        nipc: empresaData.nipc,
        nome: empresaData.nome,
      },
      geradoEm: new Date().toISOString(),
    };
  }
}

// ============================================
// SINGLETON & HELPERS
// ============================================

let clientInstance: AiparatiClient | null = null;

export function getAiparatiClient(): AiparatiClient {
  if (!clientInstance) {
    clientInstance = new AiparatiClient();
  }
  return clientInstance;
}

/**
 * Verificar se o serviço aiparati está disponível
 */
export async function isAiparatiAvailable(): Promise<boolean> {
  const client = getAiparatiClient();
  const status = await client.checkHealth();
  return status.online;
}

export default AiparatiClient;
