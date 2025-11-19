import { describe, it, expect } from 'vitest';
import { validateFinancialEligibility } from './validators';
import { FinancialData } from './ratios';

const goodCompany: FinancialData = {
    ativoTotal: 1000,
    passivoTotal: 600,
    capitalProprio: 400, // 40% Autonomy
    ativoCorrente: 500,
    passivoCorrente: 250,
    vendas: 2000,
    custosVendas: 1000,
    fornecimentosServicosExternos: 200,
    gastosPessoal: 300,
    resultadosLiquidos: 100, // Positive
    jurosGastos: 50,
    impostos: 20,
    amortizacoes: 100
};

const badCompany: FinancialData = {
    ...goodCompany,
    capitalProprio: 100, // 10% Autonomy (Fail default 15%)
    resultadosLiquidos: -50 // Negative Income (Fail default)
};

describe('Financial Validators Module', () => {
    it('should approve eligible company', () => {
        const result = validateFinancialEligibility(goodCompany);
        expect(result.isEligible).toBe(true);
        expect(result.reasons).toHaveLength(0);
    });

    it('should reject company with low autonomy', () => {
        const result = validateFinancialEligibility(badCompany);
        expect(result.isEligible).toBe(false);
        expect(result.reasons).toContain(expect.stringContaining('Autonomia Financeira'));
    });

    it('should reject company with negative net income', () => {
        const result = validateFinancialEligibility(badCompany);
        expect(result.isEligible).toBe(false);
        expect(result.reasons).toContain(expect.stringContaining('Resultados Líquidos negativos'));
    });

    it('should respect custom criteria', () => {
        // Even with 10% autonomy, if we set min to 5%, it should pass autonomy check
        const result = validateFinancialEligibility(badCompany, {
            minFinancialAutonomy: 0.05,
            requirePositiveNetIncome: false,
            requirePositiveEBITDA: false
        });
        expect(result.isEligible).toBe(true);
    });
});
