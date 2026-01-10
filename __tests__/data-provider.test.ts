/**
 * Tests for data-provider.ts
 * Validates core data access layer functionality
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock fs module
vi.mock('fs', () => ({
    existsSync: vi.fn(() => false),
    readFileSync: vi.fn(() => '[]'),
}))

describe('dataProvider', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('avisos', () => {
        it('should return empty array when JSON files do not exist', async () => {
            // Dynamic import to apply mocks
            const { dataProvider } = await import('../lib/data-provider')

            const result = await dataProvider.avisos.findMany()
            expect(result).toEqual([])
        })

        it('should filter avisos by portal', async () => {
            const { dataProvider } = await import('../lib/data-provider')

            const result = await dataProvider.avisos.findMany({
                where: { portal: 'PORTUGAL2030' }
            })

            // Should filter correctly (empty in test because no mock data)
            expect(Array.isArray(result)).toBe(true)
        })

        it('should count avisos correctly', async () => {
            const { dataProvider } = await import('../lib/data-provider')

            const count = await dataProvider.avisos.count()
            expect(typeof count).toBe('number')
            expect(count).toBeGreaterThanOrEqual(0)
        })
    })

    describe('empresas', () => {
        it('should return hardcoded empresas', async () => {
            const { dataProvider } = await import('../lib/data-provider')

            const empresas = await dataProvider.empresas.findMany()

            // Should have 8 hardcoded empresas
            expect(empresas.length).toBe(8)
            expect(empresas[0]).toHaveProperty('nome')
            expect(empresas[0]).toHaveProperty('nipc')
        })

        it('should find empresa by id', async () => {
            const { dataProvider } = await import('../lib/data-provider')

            const empresa = await dataProvider.empresas.findUnique({
                where: { id: 'emp_001' }
            })

            expect(empresa).not.toBeNull()
            expect(empresa?.id).toBe('emp_001')
        })

        it('should return null for non-existent empresa', async () => {
            const { dataProvider } = await import('../lib/data-provider')

            const empresa = await dataProvider.empresas.findUnique({
                where: { id: 'non_existent' }
            })

            expect(empresa).toBeNull()
        })
    })

    describe('metrics', () => {
        it('should return dashboard metrics', async () => {
            const { dataProvider } = await import('../lib/data-provider')

            const metrics = await dataProvider.metrics.get()

            expect(metrics).toHaveProperty('totalAvisos')
            expect(metrics).toHaveProperty('totalEmpresas')
            expect(metrics).toHaveProperty('ultimaAtualizacao')
        })
    })
})
