/**
 * Módulo de Rácios Financeiros
 * Cálculos padronizados para análise de balanços e demonstrações de resultados.
 */

export interface FinancialData {
    ativoTotal: number;
    passivoTotal: number;
    capitalProprio: number;
    ativoCorrente: number;
    passivoCorrente: number;
    vendas: number;
    custosVendas: number;
    fornecimentosServicosExternos: number;
    gastosPessoal: number;
    resultadosLiquidos: number;
    jurosGastos: number;
    impostos: number;
    amortizacoes: number;
}

/**
 * Calcula a Autonomia Financeira
 * Fórmula: Capital Próprio / Ativo Total
 * @returns Valor decimal (ex: 0.45 para 45%)
 */
export function calculateFinancialAutonomy(data: FinancialData): number {
    if (data.ativoTotal === 0) return 0;
    return data.capitalProprio / data.ativoTotal;
}

/**
 * Calcula a Liquidez Geral
 * Fórmula: Ativo Corrente / Passivo Corrente
 * @returns Rácio (valor absoluto)
 */
export function calculateGeneralLiquidity(data: FinancialData): number {
    if (data.passivoCorrente === 0) return data.ativoCorrente > 0 ? Infinity : 0;
    return data.ativoCorrente / data.passivoCorrente;
}

/**
 * Calcula o EBITDA (Earnings Before Interest, Taxes, Depreciation and Amortization)
 * Fórmula: Resultado Líquido + Juros + Impostos + Amortizações
 */
export function calculateEBITDA(data: FinancialData): number {
    return data.resultadosLiquidos + data.jurosGastos + data.impostos + data.amortizacoes;
}

/**
 * Calcula a Margem EBITDA
 * Fórmula: EBITDA / Vendas
 */
export function calculateEBITDAMargin(data: FinancialData): number {
    if (data.vendas === 0) return 0;
    const ebitda = calculateEBITDA(data);
    return ebitda / data.vendas;
}

/**
 * Calcula o Rácio de Endividamento
 * Fórmula: Passivo Total / Ativo Total
 */
export function calculateDebtRatio(data: FinancialData): number {
    if (data.ativoTotal === 0) return 0;
    return data.passivoTotal / data.ativoTotal;
}

/**
 * Calcula a Rentabilidade do Capital Próprio (ROE)
 * Fórmula: Resultado Líquido / Capital Próprio
 */
export function calculateROE(data: FinancialData): number {
    if (data.capitalProprio === 0) return 0;
    return data.resultadosLiquidos / data.capitalProprio;
}

/**
 * Calcula a Rentabilidade do Ativo (ROA)
 * Fórmula: Resultado Líquido / Ativo Total
 */
export function calculateROA(data: FinancialData): number {
    if (data.ativoTotal === 0) return 0;
    return data.resultadosLiquidos / data.ativoTotal;
}
