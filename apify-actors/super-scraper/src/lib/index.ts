/**
 * Index file for shared scraper library
 */

// Types
export {
    AvisoNormalized,
    Documento,
    ScraperInput,
    ScraperResult,
    ScraperMetrics,
    CAMPOS_BASE,
    PORTAIS,
} from './types';

// Normalizers
export {
    normalizeDate,
    normalizeRegiao,
    normalizeDotacao,
    normalizeTaxa,
    normalizeStatus,
    stripHtml,
    decodeHtmlEntities,
    toArray,
    firstOrUndefined,
    detectDocumentFormat,
    extractDatesFromText,
    // Product Vision Extractors
    extractLegislacaoLinks,
    extractContactInfo,
    extractCanalSubmissao,
    extractPreRequisitos,
} from './normalizers';

// Metrics
export {
    calculateMetrics,
    generateReport,
    checkQualityGate,
    QUALITY_GATES,
} from './metrics';

// Dedupe
export {
    mergeAvisosByCode,
    dedupeAvisos,
    defaultKeyFn,
    createPortalKeyFn,
} from './dedupe';

// Snapshot
export {
    saveSnapshot,
    loadLastSnapshot,
    compareWithLastRun,
    metricsToSnapshot,
} from './snapshot';
export type { RunSnapshot } from './snapshot';

// Scrapers
export { scrapePRR } from './prr';
export { scrapeCORDIS } from './cordis';
export { scrapePEPAC } from './pepac';
export { scrapePortugal2030 } from './portugal2030';
export { scrapeEuropaCriativa } from './europa-criativa';
export { scrapeIPDJ } from './ipdj';

// LLM Extraction (Phase 2 - Gemini Flash-Lite)
export {
    extractWithGemini,
    batchExtractWithGemini,
    estimateCost as estimateGeminiCost,
    type GeminiOperationalFields,
} from './gemini-extractor';

// RAG with Gemini Files API
export {
    uploadPdfToGemini,
    uploadPdfFromUrl,
    listUploadedFiles,
    queryDocuments,
    batchUploadFromAvisos,
    type UploadedFile,
    type RAGQueryResult,
} from './gemini-rag';

// File Search (Stores + metadata_filter + citations)
export {
    // Production config (Benchmark-Validated)
    RECOMMENDED_MODEL,
    FALLBACK_MODEL,
    PRODUCTION_SYSTEM_PROMPT,
    PRODUCTION_GENERATION_CONFIG,
    // Functions
    createFileSearchStore,
    deleteFileSearchStore,
    uploadLocalFileToGeminiFilesApi,
    waitForGeminiFileActive,
    importFileToSearchStore,
    waitForOperationDone,
    generateContentWithFileSearch,
    guessMimeType,
    requireGeminiApiKey,
    type GeminiFile,
    type FileSearchStore,
    type CustomMetadataValue,
    type GenerateWithFileSearchResult,
} from './gemini-file-search';

