/**
 * Code Search Tool
 * 
 * Searches the codebase using grep, counts files/lines, and lists modules.
 * Provides technical evidence for the Técnico agent.
 */

import { execSync } from 'child_process';
import * as path from 'path';
import type { CodeSearchParams, CodeSearchResult, ToolResult } from '../types';

const PROJECT_ROOT = path.join(process.cwd());
const EXCLUDED_DIRS = ['node_modules', '.next', '.git', 'dist', '__tests__'];

/**
 * Execute code search with various modes
 */
export async function executeCodeSearch(params: CodeSearchParams): Promise<ToolResult> {
    const startTime = Date.now();

    try {
        let result: CodeSearchResult;

        switch (params.type) {
            case 'grep':
                result = await grepSearch(params.query, params.path);
                break;
            case 'count_files':
                result = await countFiles(params.query, params.path);
                break;
            case 'count_lines':
                result = await countLines(params.path);
                break;
            case 'list_modules':
                result = await listModules(params.path);
                break;
            default:
                throw new Error(`Unknown search type: ${params.type}`);
        }

        return {
            tool: 'code_search',
            success: true,
            data: result,
            executionTimeMs: Date.now() - startTime,
        };
    } catch (error: any) {
        return {
            tool: 'code_search',
            success: false,
            data: null,
            error: error.message,
            executionTimeMs: Date.now() - startTime,
        };
    }
}

/**
 * Grep search for patterns in code
 */
async function grepSearch(query: string, searchPath?: string): Promise<CodeSearchResult> {
    const targetPath = searchPath || PROJECT_ROOT;
    const excludeFlags = EXCLUDED_DIRS.map(d => `--exclude-dir=${d}`).join(' ');

    // Escape special characters in query
    const escapedQuery = query.replace(/['"\\]/g, '\\$&');

    try {
        const cmd = `grep -rn ${excludeFlags} --include="*.ts" --include="*.tsx" --include="*.js" "${escapedQuery}" "${targetPath}" | head -50`;
        const output = execSync(cmd, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });

        const lines = output.trim().split('\n').filter(Boolean);
        const matchedFiles = [...new Set(lines.map(l => l.split(':')[0]))];

        return {
            results: lines.slice(0, 20), // Limit to 20 for context
            count: lines.length,
            matchedFiles,
        };
    } catch (error: any) {
        // grep returns exit code 1 if no matches
        if (error.status === 1) {
            return { results: [], count: 0, matchedFiles: [] };
        }
        throw error;
    }
}

/**
 * Count files matching a pattern
 */
async function countFiles(pattern: string, searchPath?: string): Promise<CodeSearchResult> {
    const targetPath = searchPath || PROJECT_ROOT;
    const excludeFlags = EXCLUDED_DIRS.map(d => `-not -path "*/${d}/*"`).join(' ');

    const cmd = `find "${targetPath}" -type f -name "${pattern}" ${excludeFlags} | head -500`;
    const output = execSync(cmd, { encoding: 'utf-8', maxBuffer: 5 * 1024 * 1024 });

    const files = output.trim().split('\n').filter(Boolean);

    return {
        results: files.slice(0, 50), // Limit display
        count: files.length,
        matchedFiles: files,
    };
}

/**
 * Count total lines of code
 */
async function countLines(searchPath?: string): Promise<CodeSearchResult> {
    const targetPath = searchPath || PROJECT_ROOT;

    // Count lines for different file types
    const fileTypes = ['*.ts', '*.tsx', '*.js', '*.jsx', '*.css'];
    const results: string[] = [];
    let totalLines = 0;

    for (const ext of fileTypes) {
        try {
            const cmd = `find "${targetPath}" -name "${ext}" -not -path "*/node_modules/*" -not -path "*/.next/*" -exec cat {} + 2>/dev/null | wc -l`;
            const output = execSync(cmd, { encoding: 'utf-8' }).trim();
            const count = parseInt(output, 10) || 0;
            totalLines += count;
            results.push(`${ext}: ${count.toLocaleString()} lines`);
        } catch {
            // Ignore errors for missing file types
        }
    }

    results.unshift(`TOTAL: ${totalLines.toLocaleString()} lines`);

    return {
        results,
        count: totalLines,
    };
}

/**
 * List project modules/directories
 */
async function listModules(searchPath?: string): Promise<CodeSearchResult> {
    const targetPath = searchPath || path.join(PROJECT_ROOT, 'lib');

    // List immediate subdirectories
    const cmd = `find "${targetPath}" -maxdepth 1 -type d | tail -n +2`;
    const output = execSync(cmd, { encoding: 'utf-8' });

    const modules = output.trim().split('\n').filter(Boolean);

    // Get file counts for each module
    const results = modules.map(mod => {
        try {
            const countCmd = `find "${mod}" -type f -name "*.ts" | wc -l`;
            const count = parseInt(execSync(countCmd, { encoding: 'utf-8' }).trim(), 10);
            return `${path.basename(mod)}: ${count} files`;
        } catch {
            return `${path.basename(mod)}: ? files`;
        }
    });

    return {
        results,
        count: modules.length,
        matchedFiles: modules,
    };
}

/**
 * Quick stats for the Técnico agent
 */
export async function getProjectStats(): Promise<Record<string, any>> {
    const stats: Record<string, any> = {};

    // Count TypeScript files
    const tsFiles = await countFiles('*.ts');
    stats.typescriptFiles = tsFiles.count;

    // Count React components
    const tsxFiles = await countFiles('*.tsx');
    stats.reactComponents = tsxFiles.count;

    // Count API routes
    try {
        const apiRoutes = await countFiles('route.ts', path.join(PROJECT_ROOT, 'app/api'));
        stats.apiRoutes = apiRoutes.count;
    } catch {
        stats.apiRoutes = 0;
    }

    // Count dashboard pages
    try {
        const dashboardPages = await countFiles('page.tsx', path.join(PROJECT_ROOT, 'app/dashboard'));
        stats.dashboardPages = dashboardPages.count;
    } catch {
        stats.dashboardPages = 0;
    }

    // Total lines
    const lines = await countLines();
    stats.totalLines = lines.count;

    return stats;
}
