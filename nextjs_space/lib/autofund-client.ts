/**
 * AutoFund AI Integration Client
 *
 * Integração com o microserviço aiparati-express para:
 * - Processamento automático de IES (PDF)
 * - Análise financeira com Claude
 * - Geração de templates IAPMEI
 *
 * Repositório: https://github.com/bilalmachraa82/aiparati-express
 */

import axios, { AxiosInstance } from 'axios';

// Configuração
const DEFAULT_CONFIG = {
  baseUrl: process.env.AUTOFUND_API_URL || 'http://localhost:8000',
  timeout: 120000, // 2 minutos (processamento PDF demora)
  apiKey: process.env.AUTOFUND_API_KEY || '',
};

// Tipos
export interface IESUploadRequest {
  file: Buffer | Blob;
  fileName: string;
  nif: string;
  anoExercicio: number;
  designacao: string;
  email?: string;
}

export interface IESUploadResponse {
  success: boolean;
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  message: string;
  estimatedTime?: number; // segundos
}

export interface ProcessingStatus {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  currentStep?: string;
  result?: ProcessingResult;
  error?: string;
}

export interface ProcessingResult {
  empresa: {
    nif: string;
    designacao: string;
    cae: string;
    anoExercicio: number;
  };
  financeiro: {
    volumeNegocios: number;
    resultadoLiquido: number;
    ativoTotal: number;
    capitalProprio: number;
    passivo: number;
    autonomiaFinanceira: number;
    liquidezGeral: number;
    rendibilidade: number;
  };
  analise: {
    risco: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    score: number;
    pontosFavoraveis: string[];
    pontosAtencao: string[];
    recomendacoes: string[];
  };
  elegibilidade: {
    programasElegiveis: string[];
    scoresPorPrograma: Record<string, number>;
  };
  templateUrl?: string;
  downloadUrl?: string;
}

export interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  services: {
    database: boolean;
    redis: boolean;
    claude: boolean;
  };
}

/**
 * Cliente para API do AutoFund AI
 */
export class AutoFundClient {
  private client: AxiosInstance;
  private isConfigured: boolean;

  constructor(config?: Partial<typeof DEFAULT_CONFIG>) {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };

    this.isConfigured = !!finalConfig.baseUrl && finalConfig.baseUrl !== 'http://localhost:8000';

    this.client = axios.create({
      baseURL: finalConfig.baseUrl,
      timeout: finalConfig.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...(finalConfig.apiKey && { Authorization: `Bearer ${finalConfig.apiKey}` }),
      },
    });

    // Interceptor para logging
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('AutoFund API Error:', error.message);
        throw error;
      }
    );
  }

  /**
   * Verificar se o serviço está configurado
   */
  isServiceConfigured(): boolean {
    return this.isConfigured;
  }

  /**
   * Verificar saúde do serviço
   */
  async healthCheck(): Promise<HealthCheck | null> {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      console.error('AutoFund health check failed');
      return null;
    }
  }

  /**
   * Upload e processamento de IES
   */
  async uploadIES(request: IESUploadRequest): Promise<IESUploadResponse> {
    if (!this.isConfigured) {
      return {
        success: false,
        jobId: '',
        status: 'failed',
        message: 'AutoFund API não configurada. Defina AUTOFUND_API_URL no .env',
      };
    }

    try {
      const formData = new FormData();

      // Converter Buffer para Blob se necessário
      const fileBlob =
        request.file instanceof Blob
          ? request.file
          : new Blob([request.file], { type: 'application/pdf' });

      formData.append('file', fileBlob, request.fileName);
      formData.append('nif', request.nif);
      formData.append('ano_exercicio', request.anoExercicio.toString());
      formData.append('designacao', request.designacao);
      if (request.email) {
        formData.append('email', request.email);
      }

      const response = await this.client.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: true,
        jobId: response.data.job_id || response.data.jobId,
        status: 'queued',
        message: 'Ficheiro recebido. Processamento iniciado.',
        estimatedTime: 120,
      };
    } catch (error: any) {
      return {
        success: false,
        jobId: '',
        status: 'failed',
        message: error.response?.data?.detail || error.message,
      };
    }
  }

  /**
   * Verificar estado do processamento
   */
  async getProcessingStatus(jobId: string): Promise<ProcessingStatus> {
    try {
      const response = await this.client.get(`/api/status/${jobId}`);
      return response.data;
    } catch (error: any) {
      return {
        jobId,
        status: 'failed',
        progress: 0,
        error: error.message,
      };
    }
  }

  /**
   * Aguardar conclusão do processamento (polling)
   */
  async waitForCompletion(
    jobId: string,
    maxWaitMs: number = 180000,
    pollIntervalMs: number = 5000
  ): Promise<ProcessingStatus> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitMs) {
      const status = await this.getProcessingStatus(jobId);

      if (status.status === 'completed' || status.status === 'failed') {
        return status;
      }

      await this.delay(pollIntervalMs);
    }

    return {
      jobId,
      status: 'failed',
      progress: 0,
      error: 'Timeout aguardando processamento',
    };
  }

  /**
   * Obter resultado do processamento
   */
  async getResult(jobId: string): Promise<ProcessingResult | null> {
    try {
      const response = await this.client.get(`/api/result/${jobId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching result:', error);
      return null;
    }
  }

  /**
   * Download do template Excel gerado
   */
  async downloadTemplate(jobId: string): Promise<Buffer | null> {
    try {
      const response = await this.client.get(`/api/download/${jobId}`, {
        responseType: 'arraybuffer',
      });
      return Buffer.from(response.data);
    } catch (error) {
      console.error('Error downloading template:', error);
      return null;
    }
  }

  /**
   * Análise rápida sem upload (dados já extraídos)
   */
  async analyzeFinancials(data: {
    nif: string;
    designacao: string;
    volumeNegocios: number;
    resultadoLiquido: number;
    ativoTotal: number;
    capitalProprio: number;
    passivo: number;
    cae?: string;
  }): Promise<ProcessingResult['analise'] | null> {
    try {
      const response = await this.client.post('/api/analyze', data);
      return response.data;
    } catch (error) {
      console.error('Error analyzing financials:', error);
      return null;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Singleton instance
let autofundClient: AutoFundClient | null = null;

/**
 * Obter cliente AutoFund (singleton)
 */
export function getAutoFundClient(): AutoFundClient {
  if (!autofundClient) {
    autofundClient = new AutoFundClient();
  }
  return autofundClient;
}

/**
 * Processar IES e calcular elegibilidade para programas
 */
export async function processIESAndMatchPrograms(
  file: Buffer,
  fileName: string,
  empresaInfo: {
    nif: string;
    designacao: string;
    anoExercicio: number;
    setor?: string;
    regiao?: string;
  }
): Promise<{
  success: boolean;
  analise?: ProcessingResult;
  elegibilidade?: Array<{
    programa: string;
    score: number;
    motivo: string;
  }>;
  error?: string;
}> {
  const client = getAutoFundClient();

  if (!client.isServiceConfigured()) {
    return {
      success: false,
      error: 'AutoFund API não configurada',
    };
  }

  // 1. Upload e processar IES
  const uploadResult = await client.uploadIES({
    file,
    fileName,
    nif: empresaInfo.nif,
    anoExercicio: empresaInfo.anoExercicio,
    designacao: empresaInfo.designacao,
  });

  if (!uploadResult.success) {
    return {
      success: false,
      error: uploadResult.message,
    };
  }

  // 2. Aguardar processamento
  const status = await client.waitForCompletion(uploadResult.jobId);

  if (status.status !== 'completed' || !status.result) {
    return {
      success: false,
      error: status.error || 'Processamento falhou',
    };
  }

  // 3. Calcular elegibilidade adicional baseada nos dados
  const elegibilidade = calculateProgramEligibility(status.result, empresaInfo);

  return {
    success: true,
    analise: status.result,
    elegibilidade,
  };
}

/**
 * Calcular elegibilidade para programas baseado na análise financeira
 */
function calculateProgramEligibility(
  result: ProcessingResult,
  empresaInfo: { setor?: string; regiao?: string }
): Array<{ programa: string; score: number; motivo: string }> {
  const eligibility: Array<{ programa: string; score: number; motivo: string }> = [];

  const { financeiro, analise } = result;

  // Portugal 2030 - Inovação Produtiva
  if (
    financeiro.volumeNegocios >= 250000 &&
    financeiro.autonomiaFinanceira >= 0.25 &&
    analise.risco !== 'CRITICAL'
  ) {
    eligibility.push({
      programa: 'Portugal 2030 - Inovação Produtiva',
      score: Math.min(100, 50 + financeiro.autonomiaFinanceira * 100 + (analise.score || 0) * 0.3),
      motivo: 'Volume de negócios e autonomia financeira adequados',
    });
  }

  // PRR - Transição Digital
  if (financeiro.volumeNegocios >= 50000 && analise.risco !== 'CRITICAL') {
    eligibility.push({
      programa: 'PRR - Transição Digital (Coaching 4.0)',
      score: 75,
      motivo: 'PME com potencial de digitalização',
    });
  }

  // PEPAC - Agricultura
  if (
    empresaInfo.setor?.toLowerCase().includes('agr') ||
    empresaInfo.setor?.toLowerCase().includes('pecuár')
  ) {
    eligibility.push({
      programa: 'PEPAC - Investimento Agrícola',
      score: 80,
      motivo: 'Setor agrícola elegível',
    });
  }

  // I&D Empresarial
  if (
    financeiro.volumeNegocios >= 500000 &&
    financeiro.autonomiaFinanceira >= 0.3 &&
    analise.risco === 'LOW'
  ) {
    eligibility.push({
      programa: 'Portugal 2030 - I&D Empresarial',
      score: 85,
      motivo: 'Empresa sólida com capacidade para projetos I&D',
    });
  }

  // Internacionalização
  if (financeiro.volumeNegocios >= 100000 && financeiro.liquidezGeral >= 1) {
    eligibility.push({
      programa: 'Portugal 2030 - Internacionalização',
      score: 70,
      motivo: 'Liquidez adequada para projetos de internacionalização',
    });
  }

  return eligibility.sort((a, b) => b.score - a.score);
}
