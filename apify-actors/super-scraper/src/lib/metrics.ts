/**
 * Metrics and observability for scraper runs
 */

import { AvisoNormalized, ScraperMetrics, CAMPOS_BASE } from './types';

/**
 * Calculate metrics for a set of avisos
 */
export function calculateMetrics(
    avisos: AvisoNormalized[],
    durationMs: number,
    requestsCount: number,
    errorsCount: number
): ScraperMetrics {
    const totalAvisos = avisos.length;
    const avisosComDocumentos = avisos.filter(a => a.documentos && a.documentos.length > 0).length;
    const totalDocumentos = avisos.reduce((sum, a) => sum + (a.documentos?.length || 0), 0);

    // Count null fields
    const camposNulos: Record<string, number> = {};
    for (const campo of CAMPOS_BASE) {
        const nullCount = avisos.filter(a => {
            const value = (a as any)[campo];
            return value === undefined || value === null || value === '';
        }).length;
        if (nullCount > 0) {
            camposNulos[campo] = nullCount;
        }
    }

    // Calculate coverage
    const totalCampos = CAMPOS_BASE.length * totalAvisos;
    const camposPreenchidos = totalCampos - Object.values(camposNulos).reduce((a, b) => a + b, 0);
    const percentualCobertura = totalCampos > 0 ? Math.round((camposPreenchidos / totalCampos) * 100) : 0;

    return {
        totalAvisos,
        avisosComDocumentos,
        totalDocumentos,
        camposNulos,
        percentualCobertura,
        durationMs,
        requestsCount,
        errorsCount,
    };
}

/**
 * Generate console report for a scraper run
 */
export function generateReport(portal: string, metrics: ScraperMetrics): void {
    const docsPerAviso = metrics.totalAvisos > 0
        ? (metrics.totalDocumentos / metrics.totalAvisos).toFixed(1)
        : '0';

    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 RELATÓRIO - ${portal}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Avisos extraídos:     ${metrics.totalAvisos}
📎 Com documentos:       ${metrics.avisosComDocumentos} (${Math.round(metrics.avisosComDocumentos / metrics.totalAvisos * 100)}%)
📄 Total documentos:     ${metrics.totalDocumentos} (${docsPerAviso}/aviso)
📈 Cobertura campos:     ${metrics.percentualCobertura}%
⏱️  Duração:             ${metrics.durationMs}ms
🌐 Requests:             ${metrics.requestsCount}
❌ Erros:                ${metrics.errorsCount}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

    // Log null fields if any
    if (Object.keys(metrics.camposNulos).length > 0) {
        console.log('⚠️  Campos com valores nulos:');
        for (const [campo, count] of Object.entries(metrics.camposNulos)) {
            console.log(`     ${campo}: ${count}/${metrics.totalAvisos}`);
        }
    }
}

/**
 * Quality gate thresholds by portal
 */
export const QUALITY_GATES: Record<string, {
    minAvisos: number;
    minCamposBase: number;
    minDocsPercent: number;
    maxVariation: number;
}> = {
    'Portugal 2030': {
        minAvisos: 200,
        minCamposBase: 8,
        minDocsPercent: 80,
        maxVariation: 20,
    },
    'PRR': {
        minAvisos: 500,
        // PRR tem menos campos estruturados que PT2030
        minCamposBase: 5,
        // PRR geralmente expõe poucos documentos
        minDocsPercent: 30,
        maxVariation: 25,
    },
    'Horizon Europe': {
        minAvisos: 20,
        minCamposBase: 5,
        minDocsPercent: 0, // SEDIA não devolve documentos
        maxVariation: 50,  // Calls mudam frequentemente
    },
    'PEPAC': {
        // IFAP publica poucos avisos estruturados; contagens baixas são esperadas
        minAvisos: 3,
        minCamposBase: 4,
        minDocsPercent: 0,
        maxVariation: 50,
    },
};

/**
 * Check if metrics pass quality gate
 */
export function checkQualityGate(portal: string, metrics: ScraperMetrics): {
    passed: boolean;
    issues: string[];
} {
    const gate = QUALITY_GATES[portal];
    if (!gate) {
        return { passed: true, issues: [] };
    }

    const issues: string[] = [];

    if (metrics.totalAvisos < gate.minAvisos) {
        issues.push(`Avisos ${metrics.totalAvisos} < mínimo ${gate.minAvisos}`);
    }

    // Campos base: média de campos preenchidos por aviso
    const totalMissingBase = Object.values(metrics.camposNulos).reduce((a, b) => a + b, 0);
    const avgCamposBase = metrics.totalAvisos > 0
        ? CAMPOS_BASE.length - (totalMissingBase / metrics.totalAvisos)
        : 0;
    if (avgCamposBase < gate.minCamposBase) {
        issues.push(`Campos base ${avgCamposBase.toFixed(1)} < mínimo ${gate.minCamposBase}`);
    }

    const docsPercent = metrics.totalAvisos > 0
        ? (metrics.avisosComDocumentos / metrics.totalAvisos) * 100
        : 0;
    if (docsPercent < gate.minDocsPercent) {
        issues.push(`Docs ${docsPercent.toFixed(0)}% < mínimo ${gate.minDocsPercent}%`);
    }

    return {
        passed: issues.length === 0,
        issues,
    };
}
