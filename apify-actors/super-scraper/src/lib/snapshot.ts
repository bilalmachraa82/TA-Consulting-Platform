/**
 * Snapshot module for run comparison
 * Uses Apify KeyValueStore when available, falls back to local storage
 */

import { ScraperMetrics } from './types';
import { QUALITY_GATES } from './metrics';

export interface RunSnapshot {
    portal: string;
    timestamp: string;
    runId?: string;
    totalAvisos: number;
    avisosAbertos: number;
    totalDocumentos: number;
    percentualCobertura: number;
}

/**
 * Save snapshot to Apify KeyValueStore or local
 */
export async function saveSnapshot(snapshot: RunSnapshot): Promise<void> {
    const key = `snapshot_${snapshot.portal.replace(/\s+/g, '_')}_latest`;

    try {
        // Try Apify KeyValueStore first
        const { Actor } = await import('apify');
        const store = await Actor.openKeyValueStore();
        await store.setValue(key, snapshot);
        console.log(`    💾 Snapshot guardado: ${key}`);
    } catch {
        // Fallback: log only (local execution)
        console.log(`    💾 Snapshot (local): ${snapshot.portal} = ${snapshot.totalAvisos} avisos`);
    }
}

/**
 * Load last snapshot for comparison
 */
export async function loadLastSnapshot(portal: string): Promise<RunSnapshot | null> {
    const key = `snapshot_${portal.replace(/\s+/g, '_')}_latest`;

    try {
        const { Actor } = await import('apify');
        const store = await Actor.openKeyValueStore();
        return await store.getValue(key) as RunSnapshot | null;
    } catch {
        return null;
    }
}

/**
 * Compare current run with last snapshot
 */
export async function compareWithLastRun(
    portal: string,
    current: { totalAvisos: number; totalDocumentos: number }
): Promise<{ variation: number; alert: boolean; message: string }> {
    const lastSnapshot = await loadLastSnapshot(portal);

    if (!lastSnapshot) {
        return { variation: 0, alert: false, message: 'Primeira execução - sem comparação' };
    }

    const variation = lastSnapshot.totalAvisos > 0
        ? Math.abs((current.totalAvisos - lastSnapshot.totalAvisos) / lastSnapshot.totalAvisos * 100)
        : 0;

    const maxVariation = QUALITY_GATES[portal]?.maxVariation ?? 25;
    const alert = variation > maxVariation;

    const message = alert
        ? `⚠️ Variação de ${variation.toFixed(1)}% (era ${lastSnapshot.totalAvisos}, agora ${current.totalAvisos})`
        : `✅ Variação normal: ${variation.toFixed(1)}%`;

    return { variation, alert, message };
}

/**
 * Create snapshot from metrics
 */
export function metricsToSnapshot(
    portal: string,
    metrics: ScraperMetrics,
    runId?: string,
    avisosAbertos?: number
): RunSnapshot {
    return {
        portal,
        timestamp: new Date().toISOString(),
        runId,
        totalAvisos: metrics.totalAvisos,
        avisosAbertos: avisosAbertos ?? metrics.totalAvisos,
        totalDocumentos: metrics.totalDocumentos,
        percentualCobertura: metrics.percentualCobertura,
    };
}
