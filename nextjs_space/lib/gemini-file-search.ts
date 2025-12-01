/**
 * Google Gemini File Search Integration
 *
 * Sistema RAG gerido pelo Google que permite pesquisa semântica em documentos.
 * Suporta: PDF, DOCX, TXT, JSON, código fonte
 *
 * Documentação: https://ai.google.dev/gemini-api/docs/file-search
 *
 * Preços:
 * - Indexação: $0.15 / milhão de tokens
 * - Storage: GRÁTIS
 * - Query: GRÁTIS (paga-se apenas pelo modelo)
 */

// Types
export interface GeminiFileSearchConfig {
  apiKey?: string;
  storeDisplayName?: string;
  model?: 'gemini-2.5-flash' | 'gemini-2.5-pro';
}

export interface FileSearchStore {
  name: string;
  displayName: string;
  createTime: string;
  updateTime: string;
}

export interface FileSearchResult {
  id: string;
  titulo: string;
  descricao: string;
  fonte: string;
  relevancia: number;
  citacoes: string[];
  metadata?: Record<string, any>;
}

export interface GeminiSearchResponse {
  success: boolean;
  answer: string;
  results: FileSearchResult[];
  groundingMetadata?: {
    searchQueries: string[];
    groundingChunks: Array<{
      web?: { uri: string; title: string };
      retrievedContext?: { uri: string; title: string };
    }>;
    groundingSupports: Array<{
      segment: { startIndex: number; endIndex: number; text: string };
      groundingChunkIndices: number[];
      confidenceScores: number[];
    }>;
  };
}

// Default configuration
const DEFAULT_CONFIG: GeminiFileSearchConfig = {
  model: 'gemini-2.5-flash',
  storeDisplayName: 'TA-Consulting-Avisos-Store',
};

/**
 * Cliente para Google Gemini File Search API
 */
export class GeminiFileSearchClient {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  private model: string;
  private storeName: string | null = null;

  constructor(config: GeminiFileSearchConfig = {}) {
    this.apiKey = config.apiKey || process.env.GEMINI_API_KEY || '';
    this.model = config.model || DEFAULT_CONFIG.model!;
  }

  /**
   * Verificar se a API está configurada
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Criar um File Search Store
   */
  async createFileSearchStore(displayName: string = 'avisos-fundos'): Promise<FileSearchStore | null> {
    if (!this.isConfigured()) {
      console.log('⚠️ Gemini API não configurada. Defina GEMINI_API_KEY.');
      return null;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/fileSearchStores?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            displayName,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error('Erro ao criar FileSearchStore:', error);
        return null;
      }

      const store = await response.json();
      this.storeName = store.name;
      return store;
    } catch (error) {
      console.error('Erro ao criar FileSearchStore:', error);
      return null;
    }
  }

  /**
   * Upload de ficheiro para o File Search Store
   */
  async uploadFile(
    filePath: string,
    displayName: string,
    storeName?: string
  ): Promise<boolean> {
    if (!this.isConfigured()) {
      console.log('⚠️ Gemini API não configurada.');
      return false;
    }

    const store = storeName || this.storeName;
    if (!store) {
      console.error('FileSearchStore não definido. Crie um primeiro.');
      return false;
    }

    try {
      // Ler ficheiro
      const fs = await import('fs');
      const fileContent = fs.readFileSync(filePath);
      const mimeType = this.getMimeType(filePath);

      // Upload via Files API
      const uploadResponse = await fetch(
        `${this.baseUrl}/files?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': mimeType,
            'X-Goog-Upload-File-Name': displayName,
          },
          body: fileContent,
        }
      );

      if (!uploadResponse.ok) {
        console.error('Erro no upload:', await uploadResponse.text());
        return false;
      }

      const uploadResult = await uploadResponse.json();

      // Importar para o FileSearchStore
      const importResponse = await fetch(
        `${this.baseUrl}/${store}:importFile?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: uploadResult.file.name,
          }),
        }
      );

      return importResponse.ok;
    } catch (error) {
      console.error('Erro no upload do ficheiro:', error);
      return false;
    }
  }

  /**
   * Upload direto de texto/JSON para o File Search Store
   */
  async uploadText(
    content: string,
    displayName: string,
    storeName?: string
  ): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }

    const store = storeName || this.storeName;
    if (!store) {
      return false;
    }

    try {
      // Upload via inline data
      const response = await fetch(
        `${this.baseUrl}/${store}:uploadToFileSearchStore?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file: {
              displayName,
              inlineData: {
                mimeType: 'text/plain',
                data: Buffer.from(content).toString('base64'),
              },
            },
          }),
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Erro no upload de texto:', error);
      return false;
    }
  }

  /**
   * Pesquisar com File Search
   */
  async search(
    query: string,
    storeName?: string
  ): Promise<GeminiSearchResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        answer: 'API Gemini não configurada. Defina GEMINI_API_KEY no .env',
        results: [],
      };
    }

    const store = storeName || this.storeName;
    if (!store) {
      return {
        success: false,
        answer: 'FileSearchStore não definido.',
        results: [],
      };
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: query }],
              },
            ],
            tools: [
              {
                fileSearch: {
                  fileSearchStoreNames: [store],
                },
              },
            ],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 2048,
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error('Erro na pesquisa:', error);
        return {
          success: false,
          answer: `Erro na API: ${response.status}`,
          results: [],
        };
      }

      const data = await response.json();
      const candidate = data.candidates?.[0];
      const content = candidate?.content?.parts?.[0]?.text || '';
      const grounding = candidate?.groundingMetadata;

      // Extrair resultados do grounding
      const results: FileSearchResult[] = [];
      if (grounding?.groundingChunks) {
        for (const chunk of grounding.groundingChunks) {
          if (chunk.retrievedContext) {
            results.push({
              id: chunk.retrievedContext.uri,
              titulo: chunk.retrievedContext.title || 'Documento',
              descricao: '',
              fonte: 'File Search',
              relevancia: 100,
              citacoes: [],
            });
          }
        }
      }

      return {
        success: true,
        answer: content,
        results,
        groundingMetadata: grounding,
      };
    } catch (error) {
      console.error('Erro na pesquisa Gemini:', error);
      return {
        success: false,
        answer: `Erro: ${error}`,
        results: [],
      };
    }
  }

  /**
   * Pesquisar com Grounding do Google Search (alternativa sem FileSearch Store)
   */
  async searchWithGoogleGrounding(query: string): Promise<GeminiSearchResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        answer: 'API Gemini não configurada.',
        results: [],
      };
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Pesquisa sobre financiamento e fundos europeus em Portugal: ${query}.
                    Foca em: Portugal 2030, PRR, PEPAC, COMPETE 2030, IAPMEI.
                    Responde em português de Portugal com informação atual sobre avisos abertos.`,
                  },
                ],
              },
            ],
            tools: [
              {
                googleSearch: {},
              },
            ],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 2048,
            },
          }),
        }
      );

      if (!response.ok) {
        return {
          success: false,
          answer: `Erro: ${response.status}`,
          results: [],
        };
      }

      const data = await response.json();
      const candidate = data.candidates?.[0];
      const content = candidate?.content?.parts?.[0]?.text || '';
      const grounding = candidate?.groundingMetadata;

      // Extrair resultados web
      const results: FileSearchResult[] = [];
      if (grounding?.groundingChunks) {
        for (const chunk of grounding.groundingChunks) {
          if (chunk.web) {
            results.push({
              id: chunk.web.uri,
              titulo: chunk.web.title || 'Resultado Web',
              descricao: '',
              fonte: 'Google Search',
              relevancia: 100,
              citacoes: [],
            });
          }
        }
      }

      return {
        success: true,
        answer: content,
        results,
        groundingMetadata: grounding,
      };
    } catch (error) {
      return {
        success: false,
        answer: `Erro: ${error}`,
        results: [],
      };
    }
  }

  /**
   * Obter MIME type baseado na extensão
   */
  private getMimeType(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      txt: 'text/plain',
      md: 'text/markdown',
      json: 'application/json',
      html: 'text/html',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      csv: 'text/csv',
      py: 'text/x-python',
      js: 'text/javascript',
      ts: 'text/typescript',
    };
    return mimeTypes[ext || ''] || 'application/octet-stream';
  }

  /**
   * Listar FileSearch Stores existentes
   */
  async listStores(): Promise<FileSearchStore[]> {
    if (!this.isConfigured()) {
      return [];
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/fileSearchStores?key=${this.apiKey}`
      );

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.fileSearchStores || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Eliminar um FileSearch Store
   */
  async deleteStore(storeName: string): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/${storeName}?key=${this.apiKey}`,
        { method: 'DELETE' }
      );
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// Instância singleton
let geminiClient: GeminiFileSearchClient | null = null;

/**
 * Obter cliente Gemini (singleton)
 */
export function getGeminiClient(): GeminiFileSearchClient {
  if (!geminiClient) {
    geminiClient = new GeminiFileSearchClient();
  }
  return geminiClient;
}

/**
 * Função de conveniência para pesquisa rápida
 */
export async function searchWithGemini(
  query: string,
  useGoogleGrounding: boolean = true
): Promise<GeminiSearchResponse> {
  const client = getGeminiClient();

  if (useGoogleGrounding) {
    return client.searchWithGoogleGrounding(query);
  }

  return client.search(query);
}

/**
 * Inicializar sistema com avisos existentes
 */
export async function initializeGeminiRAG(): Promise<{
  success: boolean;
  storeName?: string;
  error?: string;
}> {
  const client = getGeminiClient();

  if (!client.isConfigured()) {
    return {
      success: false,
      error: 'GEMINI_API_KEY não configurada',
    };
  }

  try {
    // Criar store
    const store = await client.createFileSearchStore('ta-consulting-avisos');
    if (!store) {
      return {
        success: false,
        error: 'Não foi possível criar o FileSearchStore',
      };
    }

    // Carregar avisos
    const fs = await import('fs');
    const path = await import('path');
    const avisosPath = path.join(process.cwd(), 'data', 'scraped', 'all_avisos.json');

    if (fs.existsSync(avisosPath)) {
      const avisosContent = fs.readFileSync(avisosPath, 'utf-8');
      await client.uploadText(avisosContent, 'avisos-fundos-portugal.json', store.name);
    }

    return {
      success: true,
      storeName: store.name,
    };
  } catch (error) {
    return {
      success: false,
      error: `Erro: ${error}`,
    };
  }
}
