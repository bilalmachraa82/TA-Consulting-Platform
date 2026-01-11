import { unstable_cache } from 'next/cache';
import { prisma, isPrismaAvailable } from '@/lib/db';
import { Prisma } from '@prisma/client';

export function getCacheHeaders(sMaxAge: number, staleWhileRevalidate: number): Record<string, string> {
    return {
        'Cache-Control': `public, s-maxage=${sMaxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
    };
}

// === EMPRESAS ===

export const getCachedEmpresasWithFilters = unstable_cache(
    async (filters: { dimensao?: string; regiao?: string; showAll?: boolean }) => {
        if (!isPrismaAvailable()) return [];

        const where: Prisma.EmpresaWhereInput = {};
        if (filters.dimensao) where.dimensao = filters.dimensao;
        if (filters.regiao) where.regiao = filters.regiao;

        try {
            return await prisma.empresa.findMany({
                where,
                orderBy: { nome: 'asc' },
                take: filters.showAll ? undefined : 100
            });
        } catch (error) {
            console.error('Error fetching cached companies:', error);
            return [];
        }
    },
    ['empresas-list'],
    { tags: ['empresas'], revalidate: 300 }
);

export const getCachedEmpresasCount = unstable_cache(
    async () => {
        if (!isPrismaAvailable()) return 0;
        try {
            return await prisma.empresa.count();
        } catch (error) {
            console.error('Error counting companies:', error);
            return 0;
        }
    },
    ['empresas-count'],
    { tags: ['empresas'], revalidate: 300 }
);

// === AVISOS ===

export const getCachedAvisosWithFilters = unstable_cache(
    async (filters: { estado?: string; portal?: string }) => {
        // Implementação simplificada para avisos, similar a empresas
        // Ajustar conforme o schema real se necessário
        return [];
    },
    ['avisos-list'],
    { tags: ['avisos'], revalidate: 300 }
);

export const getCachedAvisosCount = unstable_cache(
    async () => {
        if (!isPrismaAvailable()) return 0;
        try {
            return await prisma.aviso.count();
        } catch (error) {
            return 0;
        }
    },
    ['avisos-count'],
    { tags: ['avisos'], revalidate: 300 }
);

export const getCachedAvisosUrgentes = unstable_cache(
    async () => {
        if (!isPrismaAvailable()) return [];
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);

        try {
            return await prisma.aviso.findMany({
                where: {
                    dataFimSubmissao: {
                        gte: today,
                        lte: nextWeek
                    },
                    ativo: true
                },
                take: 5
            });
        } catch (error) {
            return [];
        }
    },
    ['avisos-urgentes'],
    { tags: ['avisos'], revalidate: 300 }
);

export const getCachedOrcamentoDisponivel = unstable_cache(
    async () => {
        if (!isPrismaAvailable()) return 0;
        try {
            const result = await prisma.aviso.aggregate({
                _sum: {
                    montanteMaximo: true // Assuming montanteMaximo holds the budget info roughly
                },
                where: { ativo: true }
            });
            return result._sum.montanteMaximo || 0;
        } catch (error) {
            return 0;
        }
    },
    ['avisos-orcamento'],
    { tags: ['avisos'], revalidate: 3600 }
);

export const getCachedAvisosPorPortal = unstable_cache(
    async () => {
        if (!isPrismaAvailable()) return [];
        try {
            const result = await prisma.aviso.groupBy({
                by: ['portal'],
                _count: {
                    _all: true
                }
            });
            // Map to simplified format expected by charts
            return result.map(item => ({
                portal: item.portal,
                count: item._count._all
            }));
        } catch (error) {
            return [];
        }
    },
    ['avisos-por-portal'],
    { tags: ['avisos'], revalidate: 3600 }
);

export const getCachedTopEmpresas = unstable_cache(
    async (limit: number = 5) => {
        if (!isPrismaAvailable()) return [];
        try {
            // Logic for "Top" companies could be based on lead score, recent activity, etc.
            // For now, sorting by created date as a proxy for "recent"
            return await prisma.empresa.findMany({
                take: limit,
                orderBy: {
                    // updated_at: 'desc' // assuming fields exist, fallback to generic
                }
            });
        } catch (error) {
            return [];
        }
    },
    ['top-empresas'],
    { tags: ['empresas'], revalidate: 300 }
);

export const getCachedMetricas = unstable_cache(
    async () => {
        const [totalAvisos, totalEmpresas, totalCandidaturas] = await Promise.all([
            isPrismaAvailable() ? prisma.aviso.count() : 0,
            isPrismaAvailable() ? prisma.empresa.count() : 0,
            isPrismaAvailable() ? prisma.candidatura.count() : 0
        ]);

        return {
            totalAvisos,
            totalEmpresas,
            totalCandidaturas,
            timestamp: new Date().toISOString()
        };
    },
    ['dashboard-metricas'],
    { tags: ['avisos', 'empresas', 'candidaturas'], revalidate: 60 }
);

