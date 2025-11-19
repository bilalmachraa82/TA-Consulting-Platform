/**
 * Gemini File Search Client
 * Direct integration with Google Gemini File Search API (November 2024)
 * 
 * IMPORTANT: Uses NEW API
 * - SDK: @google/generative-ai
 * - Format: fileSearchStores/abc123 (NOT corpora/)
 */

import { GoogleGenerativeAI } from '@google/generative-ai'

export interface Citation {
  id: number
  document: string
  section?: string
  page?: number
  excerpt: string
  confidence: number
  display_text: string
}

export interface GroundingSource {
  title: string
  uri: string
  snippet?: string
}

export interface RAGResponse {
  answer: string
  citations: Citation[]
  groundingSources: GroundingSource[]
  confidence: number
  metadata: {
    model: string
    storeId: string
    latency_ms: number
    citationsCount: number
    groundingEnabled: boolean
  }
}

export class GeminiFileSearchClient {
  private genAI: GoogleGenerativeAI
  private apiKey: string
  private storeId: string

  constructor(apiKey?: string, storeId?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || ''
    this.storeId = storeId || process.env.GEMINI_FILE_SEARCH_STORE || ''

    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY not configured')
    }

    // Store ID is optional for now (can use Gemini without File Search)
    // if (!this.storeId) {
    //   console.warn('GEMINI_FILE_SEARCH_STORE not configured - using Gemini without File Search')
    // }

    this.genAI = new GoogleGenerativeAI(this.apiKey)
  }

  /**
   * Query File Search with Google Search grounding
   */
  async query(
    question: string,
    options: {
      useGrounding?: boolean
      temperature?: number
      maxTokens?: number
      fileUris?: string[]
    } = {}
  ): Promise<RAGResponse> {
    const {
      useGrounding = true,
      temperature = 0.1,
      maxTokens = 2048,
      fileUris = [],
    } = options

    const startTime = Date.now()

    try {
      const tools: any[] = []

      // Add Google Search grounding if enabled
      if (useGrounding) {
        tools.push({ googleSearch: {} })
      }

      const modelConfig: any = {
        model: 'gemini-2.0-flash-exp',
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
        },
      }

      // Only add tools if grounding is enabled
      if (tools.length > 0) {
        modelConfig.tools = tools
      }

      const model = this.genAI.getGenerativeModel(modelConfig)

      // Add context about Portugal 2030 to the prompt
      const contextualQuestion = `Responde em Português sobre fundos europeus e Portugal 2030:\n\n${question}`

      // Build request parts
      const requestParts: any[] = [contextualQuestion]

      // Add file URIs if provided (PDFs from Gemini File API)
      if (fileUris.length > 0) {
        fileUris.forEach(fileUri => {
          requestParts.push({
            fileData: {
              mimeType: 'application/pdf',
              fileUri: fileUri
            }
          })
        })
      }

      // Generate content with files if available
      const result = await model.generateContent(requestParts)
      const response = await result.response
      const answer = response.text()

      // Extract citations from grounding metadata
      const citations = this.extractCitations(response)
      const groundingSources = this.extractGroundingSources(response)

      // Calculate confidence
      const confidence = this.calculateConfidence(citations, groundingSources)

      const latency_ms = Date.now() - startTime

      return {
        answer,
        citations,
        groundingSources,
        confidence,
        metadata: {
          model: 'gemini-2.0-flash-exp',
          storeId: this.storeId,
          latency_ms,
          citationsCount: citations.length,
          groundingEnabled: useGrounding,
        },
      }
    } catch (error) {
      console.error('File Search query failed:', error)
      throw new Error(
        `Query failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Extract citations from response grounding metadata
   */
  private extractCitations(response: any): Citation[] {
    const citations: Citation[] = []

    try {
      // Access grounding metadata
      const metadata = response.candidates?.[0]?.groundingMetadata

      if (!metadata?.groundingSupports) {
        return citations
      }

      metadata.groundingSupports.forEach((support: any, index: number) => {
        // Get chunk info
        const chunk = support.retrievedContext?.[0]

        if (chunk) {
          citations.push({
            id: index + 1,
            document: chunk.title || 'Unknown Document',
            section: chunk.section,
            page: chunk.pageNumber,
            excerpt: chunk.text?.substring(0, 200) || '',
            confidence: support.groundingScore || 0.5,
            display_text: `[${index + 1}] ${chunk.title || 'Document'}${
              chunk.pageNumber ? ` - p.${chunk.pageNumber}` : ''
            }`,
          })
        }
      })
    } catch (error) {
      console.warn('Failed to extract citations:', error)
    }

    return citations
  }

  /**
   * Extract Google Search grounding sources
   */
  private extractGroundingSources(response: any): GroundingSource[] {
    const sources: GroundingSource[] = []

    try {
      const metadata = response.candidates?.[0]?.groundingMetadata

      if (!metadata?.webSearchQueries) {
        return sources
      }

      metadata.webSearchQueries.forEach((query: any) => {
        if (query.uri) {
          sources.push({
            title: query.title || 'Web Source',
            uri: query.uri,
            snippet: query.snippet,
          })
        }
      })
    } catch (error) {
      console.warn('Failed to extract grounding sources:', error)
    }

    return sources
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(
    citations: Citation[],
    groundingSources: GroundingSource[]
  ): number {
    let score = 0.5 // Base score

    // Add score for citations from File Search
    score += Math.min(citations.length * 0.08, 0.3)

    // Add score for Google Search grounding
    if (groundingSources.length > 0) {
      score += 0.2
    }

    return Math.min(score, 1.0)
  }

  /**
   * Check if client is configured
   */
  isConfigured(): boolean {
    return !!(this.apiKey && this.storeId)
  }

  /**
   * Get store ID
   */
  getStoreId(): string {
    return this.storeId
  }
}

/**
 * Create client instance (singleton)
 */
let clientInstance: GeminiFileSearchClient | null = null

export function getGeminiFileSearchClient(): GeminiFileSearchClient {
  if (!clientInstance) {
    clientInstance = new GeminiFileSearchClient()
  }
  return clientInstance
}
