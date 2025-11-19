/**
 * Módulo de Validadores de Elegibilidade Financeira
 * Verifica se uma empresa cumpre os critérios financeiros típicos dos avisos Portugal 2030.
 */

import { FinancialData, calculateFinancialAutonomy, calculateGeneralLiquidity, calculateEBITDA } from './ratios';

export interface EligibilityResult {
    isEligible: boolean;
    reasons: string[]; // Lista de razões para falha ou sucesso
    metrics: {
        autonomiaFinanceira: number;
        liquidezGeral: number;
        ebitdaPositivo: boolean;
        resultadosLiquidosPositivos: boolean;
    };
}

export interface EligibilityCriteria {
    minFinancialAutonomy?: number; // Ex: 0.15 para 15%
    minGeneralLiquidity?: number; // Ex: 1.0
    requirePositiveEBITDA?: boolean;
    requirePositiveNetIncome?: boolean;
    maxDebtRatio?: number;
}

const DEFAULT_CRITERIA: EligibilityCriteria = {
    minFinancialAutonomy: 0.15, // Padrão comum: 15%
    requirePositiveEBITDA: true,
    requirePositiveNetIncome: true,
};

/**
 * Valida a elegibilidade financeira de uma empresa com base nos critérios fornecidos.
 * @param data Dados financeiros da empresa
 * @param criteria Critérios de elegibilidade (opcional, usa defaults se omitido)
 */
export function validateFinancialEligibility(
    data: FinancialData,
    criteria: EligibilityCriteria = DEFAULT_CRITERIA
): EligibilityResult {
    const reasons: string[] = [];
    let isEligible = true;

    // 1. Autonomia Financeira
    const autonomia = calculateFinancialAutonomy(data);
    const minAutonomia = criteria.minFinancialAutonomy ?? 0.15;

    if (autonomia < minAutonomia) {
        isEligible = false;
        reasons.push(`Autonomia Financeira (${(autonomia * 100).toFixed(2)}%) inferior ao mínimo exigido (${(minAutonomia * 100).toFixed(0)}%).`);
    }

    // 2. Liquidez Geral
    const liquidez = calculateGeneralLiquidity(data);
    if (criteria.minGeneralLiquidity !== undefined) {
        if (liquidez < criteria.minGeneralLiquidity) {
            isEligible = false;
            reasons.push(`Liquidez Geral (${liquidez.toFixed(2)}) inferior ao mínimo exigido (${criteria.minGeneralLiquidity}).`);
        }
    }

    // 3. EBITDA Positivo
    const ebitda = calculateEBITDA(data);
    const ebitdaPositivo = ebitda > 0;
    if (criteria.requirePositiveEBITDA && !ebitdaPositivo) {
        isEligible = false;
        reasons.push(`EBITDA negativo (${ebitda.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}).`);
    }

    // 4. Resultados Líquidos Positivos
    const resultadosPositivos = data.resultadosLiquidos > 0;
    if (criteria.requirePositiveNetIncome && !resultadosPositivos) {
        isEligible = false;
        reasons.push(`Resultados Líquidos negativos (${data.resultadosLiquidos.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}).`);
    }

    return {
        isEligible,
        reasons,
        metrics: {
            autonomiaFinanceira: autonomia,
            liquidezGeral: liquidez,
            ebitdaPositivo,
            resultadosLiquidosPositivos: resultadosPositivos
        }
    };
}
