/**
 * Tools Index
 * 
 * Central export and dispatcher for all council tools.
 */

import { executeCodeSearch, getProjectStats } from './code-search';
import { executeWebSearch, getMarketBenchmarks } from './web-search';
import { executeRAGDocs, getPRDSummary } from './rag-docs';
import { executeDBQuery, getMockDBStats } from './db-query';
import type {
    ToolName,
    ToolResult,
    CodeSearchParams,
    WebSearchParams,
    RAGDocsParams,
    DBQueryParams,
} from '../types';

export type ToolParams = CodeSearchParams | WebSearchParams | RAGDocsParams | DBQueryParams;

/**
 * Execute any tool by name
 */
export async function executeTool(
    toolName: ToolName,
    params: ToolParams
): Promise<ToolResult> {
    switch (toolName) {
        case 'code_search':
            return executeCodeSearch(params as CodeSearchParams);
        case 'web_search':
            return executeWebSearch(params as WebSearchParams);
        case 'rag_docs':
            return executeRAGDocs(params as RAGDocsParams);
        case 'db_query':
            return executeDBQuery(params as DBQueryParams);
        default:
            return {
                tool: toolName,
                success: false,
                data: null,
                error: `Unknown tool: ${toolName}`,
                executionTimeMs: 0,
            };
    }
}

/**
 * Get all quick stats for initial context
 */
export async function getAllQuickStats(): Promise<Record<string, any>> {
    const [projectStats, marketBenchmarks, prdSummary, dbStats] = await Promise.all([
        getProjectStats().catch(() => ({})),
        getMarketBenchmarks(),
        Promise.resolve(getPRDSummary()),
        Promise.resolve(getMockDBStats()),
    ]);

    return {
        project: projectStats,
        market: marketBenchmarks,
        prd: prdSummary,
        database: dbStats,
    };
}

// Re-export individual tools
export {
    executeCodeSearch,
    executeWebSearch,
    executeRAGDocs,
    executeDBQuery,
    getProjectStats,
    getMarketBenchmarks,
    getPRDSummary,
    getMockDBStats,
};
