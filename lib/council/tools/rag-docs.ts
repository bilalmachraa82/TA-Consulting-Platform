/**
 * RAG Docs Tool
 * 
 * Searches internal documentation, PRDs, and candidaturas archive.
 * Provides context from historical data for agents.
 */

import * as fs from 'fs';
import * as path from 'path';
import type { RAGDocsParams, RAGDocsResult, ToolResult } from '../types';

const PROJECT_ROOT = process.cwd();

// Source paths configuration
const SOURCE_PATHS: Record<string, string[]> = {
    prd: [
        path.join(PROJECT_ROOT, 'prd fernado.pdf'),
        path.join(PROJECT_ROOT, 'docs_archive'),
    ],
    candidaturas: [
        path.join(PROJECT_ROOT, '__tests__/candidaturas_processadas'),
    ],
    docs_archive: [
        path.join(PROJECT_ROOT, 'docs_archive'),
    ],
    github: [
        path.join(PROJECT_ROOT, 'README.md'),
        path.join(PROJECT_ROOT, 'docs_archive/CLAUDE.md'),
    ],
};

/**
 * Execute RAG docs search
 */
export async function executeRAGDocs(params: RAGDocsParams): Promise<ToolResult> {
    const startTime = Date.now();

    try {
        const { query, sources, maxChunks = 5 } = params;
        const chunks: RAGDocsResult['chunks'] = [];

        // Collect relevant files from sources
        const filesToSearch: string[] = [];

        for (const source of sources) {
            const paths = SOURCE_PATHS[source] || [];
            for (const p of paths) {
                if (fs.existsSync(p)) {
                    if (fs.statSync(p).isDirectory()) {
                        // Get markdown files from directory
                        const files = await getMarkdownFiles(p);
                        filesToSearch.push(...files);
                    } else {
                        filesToSearch.push(p);
                    }
                }
            }
        }

        // Search each file for relevant content
        for (const file of filesToSearch.slice(0, 10)) { // Limit files to search
            const fileChunks = await searchFile(file, query);
            chunks.push(...fileChunks);
        }

        // Sort by score and limit
        chunks.sort((a, b) => b.score - a.score);
        const topChunks = chunks.slice(0, maxChunks);

        return {
            tool: 'rag_docs',
            success: true,
            data: { chunks: topChunks } as RAGDocsResult,
            executionTimeMs: Date.now() - startTime,
        };
    } catch (error: any) {
        return {
            tool: 'rag_docs',
            success: false,
            data: null,
            error: error.message,
            executionTimeMs: Date.now() - startTime,
        };
    }
}

/**
 * Get all markdown files from a directory
 */
async function getMarkdownFiles(dir: string, maxFiles = 20): Promise<string[]> {
    const files: string[] = [];

    try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            if (files.length >= maxFiles) break;

            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory() && !entry.name.startsWith('.')) {
                const subFiles = await getMarkdownFiles(fullPath, maxFiles - files.length);
                files.push(...subFiles);
            } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.txt'))) {
                files.push(fullPath);
            }
        }
    } catch {
        // Ignore permission errors
    }

    return files;
}

/**
 * Search a file for relevant content
 */
async function searchFile(
    filePath: string,
    query: string
): Promise<RAGDocsResult['chunks']> {
    const chunks: RAGDocsResult['chunks'] = [];

    try {
        // Only read text files
        if (!filePath.endsWith('.md') && !filePath.endsWith('.txt')) {
            return chunks;
        }

        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');

        // Simple relevance scoring based on query terms
        const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);

        // Find relevant sections
        let currentSection = '';
        let currentContent: string[] = [];

        for (const line of lines) {
            if (line.startsWith('#')) {
                // New section - save previous if relevant
                if (currentContent.length > 0) {
                    const score = calculateRelevance(currentContent.join('\n'), queryTerms);
                    if (score > 0) {
                        chunks.push({
                            content: `${currentSection}\n${currentContent.join('\n')}`.slice(0, 500),
                            source: path.basename(filePath),
                            score,
                        });
                    }
                }
                currentSection = line;
                currentContent = [];
            } else {
                currentContent.push(line);
            }
        }

        // Don't forget last section
        if (currentContent.length > 0) {
            const score = calculateRelevance(currentContent.join('\n'), queryTerms);
            if (score > 0) {
                chunks.push({
                    content: `${currentSection}\n${currentContent.join('\n')}`.slice(0, 500),
                    source: path.basename(filePath),
                    score,
                });
            }
        }
    } catch {
        // Ignore file read errors
    }

    return chunks;
}

/**
 * Calculate relevance score based on term matches
 */
function calculateRelevance(content: string, queryTerms: string[]): number {
    const lowerContent = content.toLowerCase();
    let score = 0;

    for (const term of queryTerms) {
        const matches = (lowerContent.match(new RegExp(term, 'g')) || []).length;
        score += matches * (term.length > 5 ? 2 : 1); // Longer terms worth more
    }

    // Normalize by content length
    return score / Math.max(1, content.length / 100);
}

/**
 * Get PRD summary (cached knowledge)
 */
export function getPRDSummary(): Record<string, any> {
    return {
        clientName: 'Fernando Basto',
        company: 'TA Consulting',
        originalScope: {
            module1: {
                name: 'RAG sobre Google Drive',
                hours: 20,
                price: 1300,
                description: 'Chat com citações automáticas',
            },
            module2: {
                name: 'Scraping 6 portais',
                hours: 34,
                price: 2210,
                description: 'PT2030, PRR, PEPAC, Europa Criativa, Horizon, IPDJ',
            },
            module3: {
                name: 'Deep PDF Analysis',
                hours: 10,
                price: 650,
                description: 'Pipeline de extração e Q&A',
            },
        },
        totalOriginal: {
            hours: 64,
            price: 4160,
            rate: 65,
        },
        relationship: 'Formação prévia de IA dada ao Fernando',
        context: 'Cliente de confiança, relação positiva',
    };
}
