'use server'

/**
 * RAG Server Actions
 * Server-side actions for querying the RAG system with Gemini File Search
 */

import { getGeminiFileSearchClient } from '@/lib/gemini-file-search'
import { prisma } from '@/lib/db'

interface Citation {
  id: number
  document: string
  section?: string
  page?: number | null
  excerpt: string
  confidence: number
  display_text: string
}

interface RAGResponse {
  answer: string
  citations: Citation[]
  confidence: number
  metadata: {
    model: string
    stores_searched: string[]
    latency_ms: number
  }
}

interface QueryRAGParams {
  question: string
  storeNames?: string[]
  maxResults?: number
  metadataFilter?: string
}

/**
 * Query the RAG system with Gemini File Search
 */
export async function queryRAG(params: QueryRAGParams): Promise<RAGResponse> {
  const {
    question,
    storeNames = [],
    maxResults = 10,
    metadataFilter,
  } = params

  // Validate question
  if (!question || question.length < 10) {
    throw new Error('A pergunta deve ter pelo menos 10 caracteres')
  }

  if (question.length > 500) {
    throw new Error('A pergunta deve ter menos de 500 caracteres')
  }

  try {
    // 1. Buscar avisos ativos da base de dados
    const avisos = await prisma.aviso.findMany({
      where: {
        ativo: true,
        dataFimSubmissao: {
          gte: new Date(), // Apenas avisos ainda abertos
        },
      },
      orderBy: {
        dataFimSubmissao: 'asc',
      },
      take: 20, // Limitar a 20 mais recentes
      select: {
        codigo: true,
        nome: true,
        portal: true,
        programa: true,
        linha: true,
        dataInicioSubmissao: true,
        dataFimSubmissao: true,
        montanteMinimo: true,
        montanteMaximo: true,
        taxa: true,
        regiao: true,
        setoresElegiveis: true,
        dimensaoEmpresa: true,
        link: true,
        pdfMetadata: true,
      },
    })

    // 2. Formatar avisos como contexto
    const contextAvisos = avisos
      .map((aviso) => {
        const diasRestantes = Math.ceil(
          (aviso.dataFimSubmissao.getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
        )

        return `
AVISO: ${aviso.nome}
Código: ${aviso.codigo}
Portal: ${aviso.portal}
Programa: ${aviso.programa}
${aviso.linha ? `Linha: ${aviso.linha}` : ''}
Prazo Submissão: ${aviso.dataInicioSubmissao.toLocaleDateString('pt-PT')} a ${aviso.dataFimSubmissao.toLocaleDateString('pt-PT')} (${diasRestantes} dias restantes)
Montante: ${aviso.montanteMinimo ? `€${aviso.montanteMinimo.toLocaleString('pt-PT')}` : 'N/A'} a ${aviso.montanteMaximo ? `€${aviso.montanteMaximo.toLocaleString('pt-PT')}` : 'N/A'}
Taxa Cofinanciamento: ${aviso.taxa || 'N/A'}
Região: ${aviso.regiao || 'Nacional'}
Setores Elegíveis: ${aviso.setoresElegiveis.join(', ')}
Dimensão Empresa: ${aviso.dimensaoEmpresa.join(', ')}
Link: ${aviso.link || 'N/A'}
---`
      })
      .join('\n\n')

    // 3. Criar pergunta com contexto
    const questionWithContext = `
CONTEXTO - AVISOS PORTUGAL 2030 ATUALMENTE ABERTOS (${avisos.length} avisos):

${contextAvisos}

---

PERGUNTA DO UTILIZADOR:
${question}

INSTRUÇÕES:
- Responde APENAS com base nos avisos acima fornecidos
- Se a resposta não estiver nos avisos, diz "Não encontrei essa informação nos avisos atualmente abertos"
- Menciona sempre o código e nome do aviso quando referires um aviso específico
- Se mencionares prazos, indica quantos dias restam
- Responde em Português de Portugal
`

    // 4. Use Gemini File Search client
    const client = getGeminiFileSearchClient()

    // Query com contexto dos avisos
    const result = await client.query(question, {
      useGrounding: true, // ATIVADO: Google Search Grounding
      temperature: 0.3,
      maxTokens: 1024,
      fileUris: [] // Futuro: Adicionar URIs de PDFs indexados
    })

    // 5. Transform to expected format
    return {
      answer: result.answer,
      citations: result.citations,
      confidence: result.confidence,
      metadata: {
        model: result.metadata.model,
        stores_searched: [`database:${avisos.length}_avisos`],
        latency_ms: result.metadata.latency_ms,
      },
    }
  } catch (error) {
    console.error('RAG query failed:', error)
    throw new Error(
      error instanceof Error ? error.message : 'Erro ao processar pergunta'
    )
  }
}

/**
 * Upload document to RAG
 */
export async function uploadDocument(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const response = await fetch(`${apiUrl}/api/rag/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Upload failed')
    }

    const data = await response.json()
    return {
      success: true,
      message: data.message || 'Document uploaded successfully',
    }
  } catch (error) {
    console.error('Upload failed:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Upload failed',
    }
  }
}

/**
 * List available File Search stores
 */
export async function listRAGStores(): Promise<Array<{ name: string; display_name: string; description?: string }>> {
  try {
    const client = getGeminiFileSearchClient()
    const storeId = client.getStoreId()

    // Return configured store if available
    if (storeId) {
      return [
        {
          name: storeId,
          display_name: 'Portugal 2030 Avisos',
          description: 'Avisos de fundos europeus Portugal2030, PRR, PAPAC',
        },
      ]
    }

    // No stores configured yet
    return []
  } catch (error) {
    console.error('Failed to list stores:', error)
    return []
  }
}

/**
 * Check RAG system health
 */
export async function checkRAGHealth(): Promise<{
  status: string
  gemini_api: string
  stores_count: number
}> {
  try {
    const client = getGeminiFileSearchClient()

    // Check if client is configured
    if (!client.isConfigured()) {
      return {
        status: 'unhealthy',
        gemini_api: 'not_configured',
        stores_count: 0,
      }
    }

    // Get store count
    const stores = await listRAGStores()

    return {
      status: 'healthy',
      gemini_api: 'connected',
      stores_count: stores.length,
    }
  } catch (error) {
    console.error('Health check failed:', error)
    return {
      status: 'unhealthy',
      gemini_api: 'disconnected',
      stores_count: 0,
    }
  }
}
