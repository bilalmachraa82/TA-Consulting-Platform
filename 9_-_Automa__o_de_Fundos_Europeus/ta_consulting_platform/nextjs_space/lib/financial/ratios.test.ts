import { describe, it, expect } from 'vitest';
import {
    calculateFinancialAutonomy,
    calculateGeneralLiquidity,
    calculateEBITDA,
    calculateDebtRatio,
    FinancialData
} from './ratios';

const mockData: FinancialData = {
    ativoTotal: 1000,
    passivoTotal: 600,
    capitalProprio: 400,
    ativoCorrente: 500,
    passivoCorrente: 250,
    vendas: 2000,
    custosVendas: 1000,
    fornecimentosServicosExternos: 200,
    gastosPessoal: 300,
    resultadosLiquidos: 100,
    jurosGastos: 50,
    impostos: 20,
    amortizacoes: 100
};

describe('Financial Ratios Module', () => {
    it('should calculate Financial Autonomy correctly', () => {
        // 400 / 1000 = 0.4
        expect(calculateFinancialAutonomy(mockData)).toBe(0.4);
    });

    it('should calculate General Liquidity correctly', () => {
        // 500 / 250 = 2.0
        expect(calculateGeneralLiquidity(mockData)).toBe(2.0);
    });

    it('should calculate EBITDA correctly', () => {
        // Net Income (100) + Interest (50) + Taxes (20) + Amortization (100) = 270
        expect(calculateEBITDA(mockData)).toBe(270);
    });

    it('should calculate Debt Ratio correctly', () => {
        // 600 / 1000 = 0.6
        expect(calculateDebtRatio(mockData)).toBe(0.6);
    });

    it('should handle division by zero gracefully', () => {
        const zeroData = { ...mockData, ativoTotal: 0, passivoCorrente: 0 };
        expect(calculateFinancialAutonomy(zeroData)).toBe(0);
        expect(calculateGeneralLiquidity(zeroData)).toBe(0); // Or Infinity depending on implementation, let's check logic
    });
});
