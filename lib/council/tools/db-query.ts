/**
 * DB Query Tool
 * 
 * Safe Prisma query wrapper for aggregations and data lookup.
 * Provides database insights for council agents.
 */

import type { DBQueryParams, DBQueryResult, ToolResult } from '../types';

// Import prisma only if available (optional for standalone scripts)
let prisma: any = null;
try {
    prisma = require('@/lib/db').prisma;
} catch {
    console.warn('⚠️ Prisma not available for DB queries');
}

/**
 * Execute database query
 */
export async function executeDBQuery(params: DBQueryParams): Promise<ToolResult> {
    const startTime = Date.now();

    if (!prisma) {
        return {
            tool: 'db_query',
            success: false,
            data: null,
            error: 'Database not available',
            executionTimeMs: Date.now() - startTime,
        };
    }

    try {
        const { entity, aggregation, filters, limit = 10 } = params;
        let result: DBQueryResult;

        switch (entity) {
            case 'candidaturas':
                result = await queryCandidaturas(aggregation, filters, limit);
                break;
            case 'empresas':
                result = await queryEmpresas(aggregation, filters, limit);
                break;
            case 'avisos':
                result = await queryAvisos(aggregation, filters, limit);
                break;
            default:
                throw new Error(`Unknown entity: ${entity}`);
        }

        return {
            tool: 'db_query',
            success: true,
            data: result,
            executionTimeMs: Date.now() - startTime,
        };
    } catch (error: any) {
        return {
            tool: 'db_query',
            success: false,
            data: null,
            error: error.message,
            executionTimeMs: Date.now() - startTime,
        };
    }
}

/**
 * Query candidaturas
 */
async function queryCandidaturas(
    aggregation: string,
    filters?: Record<string, any>,
    limit?: number
): Promise<DBQueryResult> {
    const where = buildWhereClause(filters);

    switch (aggregation) {
        case 'count':
            const count = await prisma.candidatura.count({ where });
            return { data: { total: count }, count };

        case 'stats':
            const [total, approved, rejected, pending] = await Promise.all([
                prisma.candidatura.count({ where }),
                prisma.candidatura.count({ where: { ...where, status: 'APROVADA' } }),
                prisma.candidatura.count({ where: { ...where, status: 'REJEITADA' } }),
                prisma.candidatura.count({ where: { ...where, status: 'SUBMETIDA' } }),
            ]);
            return {
                data: { total, approved, rejected, pending, approvalRate: total > 0 ? (approved / total * 100).toFixed(1) + '%' : 'N/A' },
                count: total,
            };

        case 'list':
            const items = await prisma.candidatura.findMany({
                where,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    nome: true,
                    status: true,
                    programa: true,
                    montanteSolicitado: true,
                    createdAt: true,
                },
            });
            return { data: items, count: items.length };

        default:
            throw new Error(`Unknown aggregation: ${aggregation}`);
    }
}

/**
 * Query empresas
 */
async function queryEmpresas(
    aggregation: string,
    filters?: Record<string, any>,
    limit?: number
): Promise<DBQueryResult> {
    const where = buildWhereClause(filters);

    switch (aggregation) {
        case 'count':
            const count = await prisma.empresa.count({ where });
            return { data: { total: count }, count };

        case 'stats':
            const [total, byDimensao] = await Promise.all([
                prisma.empresa.count({ where }),
                prisma.empresa.groupBy({
                    by: ['dimensao'],
                    _count: true,
                }),
            ]);
            return {
                data: { total, byDimensao },
                count: total,
            };

        case 'list':
            const items = await prisma.empresa.findMany({
                where,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    nome: true,
                    dimensao: true,
                    cae: true,
                    distrito: true,
                },
            });
            return { data: items, count: items.length };

        default:
            throw new Error(`Unknown aggregation: ${aggregation}`);
    }
}

/**
 * Query avisos
 */
async function queryAvisos(
    aggregation: string,
    filters?: Record<string, any>,
    limit?: number
): Promise<DBQueryResult> {
    const where = buildWhereClause(filters);

    switch (aggregation) {
        case 'count':
            const count = await prisma.aviso.count({ where });
            return { data: { total: count }, count };

        case 'stats':
            const [total, byPortal, open] = await Promise.all([
                prisma.aviso.count({ where }),
                prisma.aviso.groupBy({
                    by: ['portal'],
                    _count: true,
                }),
                prisma.aviso.count({
                    where: {
                        ...where,
                        dataFimSubmissao: { gte: new Date() },
                    },
                }),
            ]);
            return {
                data: { total, byPortal, currentlyOpen: open },
                count: total,
            };

        case 'list':
            const items = await prisma.aviso.findMany({
                where,
                take: limit,
                orderBy: { dataFimSubmissao: 'asc' },
                select: {
                    id: true,
                    nome: true,
                    portal: true,
                    programa: true,
                    dataFimSubmissao: true,
                    taxa: true,
                },
            });
            return { data: items, count: items.length };

        default:
            throw new Error(`Unknown aggregation: ${aggregation}`);
    }
}

/**
 * Build Prisma where clause from filters
 */
function buildWhereClause(filters?: Record<string, any>): Record<string, any> {
    if (!filters) return {};

    const where: Record<string, any> = {};

    for (const [key, value] of Object.entries(filters)) {
        if (value === undefined || value === null) continue;

        // Handle special operators
        if (typeof value === 'object' && value !== null) {
            where[key] = value;
        } else {
            where[key] = value;
        }
    }

    return where;
}

/**
 * Mock data for when database is not available
 */
export function getMockDBStats(): Record<string, any> {
    return {
        candidaturas: {
            total: 47,
            approved: 31,
            rejected: 8,
            pending: 8,
            approvalRate: '66%',
        },
        empresas: {
            total: 23,
            byDimensao: {
                'Micro': 8,
                'Pequena': 10,
                'Média': 4,
                'Grande': 1,
            },
        },
        avisos: {
            total: 156,
            byPortal: {
                'portugal2030': 89,
                'prr': 42,
                'pepac': 25,
            },
            currentlyOpen: 34,
        },
    };
}
