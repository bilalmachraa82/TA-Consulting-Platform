/**
 * Módulo Core de Matemática Financeira
 * Implementação determinística de funções financeiras essenciais para análise de investimentos.
 */

/**
 * Calcula o Valor Atual Líquido (VAL / NPV)
 * @param rate Taxa de desconto (ex: 0.05 para 5%)
 * @param cashFlows Array de fluxos de caixa (o primeiro valor é geralmente o investimento inicial negativo)
 * @returns O valor atual líquido
 */
export function calculateNPV(rate: number, cashFlows: number[]): number {
    let npv = 0;
    for (let t = 0; t < cashFlows.length; t++) {
        npv += cashFlows[t] / Math.pow(1 + rate, t);
    }
    return npv;
}

/**
 * Calcula a Taxa Interna de Rentabilidade (TIR / IRR) usando o método de Newton-Raphson
 * @param cashFlows Array de fluxos de caixa
 * @param guess Estimativa inicial (default: 0.1)
 * @returns A taxa interna de rentabilidade (decimal)
 */
export function calculateIRR(cashFlows: number[], guess: number = 0.1): number {
    const maxIterations = 1000;
    const precision = 1e-7;
    let rate = guess;

    for (let i = 0; i < maxIterations; i++) {
        const npv = calculateNPV(rate, cashFlows);
        // Derivada do NPV em relação à taxa
        let derivative = 0;
        for (let t = 1; t < cashFlows.length; t++) {
            derivative -= (t * cashFlows[t]) / Math.pow(1 + rate, t + 1);
        }

        if (Math.abs(derivative) < precision) {
            return rate; // Evitar divisão por zero ou derivada muito pequena
        }

        const newRate = rate - npv / derivative;

        if (Math.abs(newRate - rate) < precision) {
            return newRate;
        }

        rate = newRate;
    }

    throw new Error("Não foi possível convergir para uma solução de TIR.");
}

/**
 * Calcula o Período de Recuperação do Investimento (Payback Period)
 * @param cashFlows Array de fluxos de caixa (o primeiro deve ser negativo - investimento)
 * @returns O número de períodos até recuperar o investimento (ou -1 se nunca recuperar)
 */
export function calculatePaybackPeriod(cashFlows: number[]): number {
    let cumulativeCashFlow = 0;
    let investment = -cashFlows[0]; // Assume que o primeiro é o investimento (negativo)

    if (investment <= 0) return 0; // Sem investimento inicial ou investimento positivo (erro de input)

    // Se o primeiro valor não for negativo, ajustamos a lógica para procurar o primeiro negativo se houver, 
    // mas por convenção standard cashFlows[0] é o investimento inicial negativo.

    cumulativeCashFlow = cashFlows[0];

    for (let t = 1; t < cashFlows.length; t++) {
        const previousCumulative = cumulativeCashFlow;
        cumulativeCashFlow += cashFlows[t];

        if (cumulativeCashFlow >= 0) {
            // Interpolação linear para maior precisão
            const fraction = Math.abs(previousCumulative) / cashFlows[t];
            return (t - 1) + fraction;
        }
    }

    return -1; // Não recupera o investimento no período analisado
}

/**
 * Calcula o ROI (Return on Investment) Simples
 * @param gain Ganho obtido com o investimento
 * @param cost Custo do investimento
 * @returns Percentagem de retorno
 */
export function calculateROI(gain: number, cost: number): number {
    if (cost === 0) return 0;
    return (gain - cost) / cost;
}
