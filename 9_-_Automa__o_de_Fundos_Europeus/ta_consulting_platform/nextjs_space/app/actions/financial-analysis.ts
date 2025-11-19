'use server'

import { generateText } from '@/lib/gemini';
import { FinancialData, calculateFinancialAutonomy, calculateEBITDA, calculateGeneralLiquidity, calculateDebtRatio } from '@/lib/financial/ratios';
import { calculateNPV, calculateIRR, calculatePaybackPeriod, calculateROI } from '@/lib/financial/core';

interface SimulationInput {
    financialData: FinancialData;
    investmentData: {
        totalInvestment: number;
        cashFlows: number[];
        discountRate: number;
    };
}

export interface FinancialAnalysisResult {
    parecerTecnico: string;
    pontosFortes: string[];
    pontosFracos: string[];
    recomendacoes: string[];
    risco: 'BAIXO' | 'MÉDIO' | 'ALTO';
}

/**
 * Gera um parecer técnico financeiro usando o Gemini 3.0 Pro
 */
export async function generateFinancialAnalysis(input: SimulationInput): Promise<FinancialAnalysisResult> {
    try {
        // 1. Calcular métricas determinísticas antes de enviar para a IA
        const autonomia = calculateFinancialAutonomy(input.financialData);
        const ebitda = calculateEBITDA(input.financialData);
        const liquidez = calculateGeneralLiquidity(input.financialData);
        const endividamento = calculateDebtRatio(input.financialData);

        const val = calculateNPV(input.investmentData.discountRate, input.investmentData.cashFlows);
        const payback = calculatePaybackPeriod(input.investmentData.cashFlows);
        let tir = 0;
        try {
            tir = calculateIRR(input.investmentData.cashFlows);
        } catch (e) {
            console.warn('Falha ao calcular TIR:', e);
        }

        // 2. Construir o Prompt para o Gemini 3.0
        const prompt = `
      Atua como um Consultor Financeiro Sénior especializado em Fundos Europeus (Portugal 2030).
      Analisa os seguintes dados financeiros de uma empresa candidata e do seu projeto de investimento.

      DADOS DA EMPRESA (Ano Pré-Projeto):
      - Autonomia Financeira: ${(autonomia * 100).toFixed(2)}% (Mínimo recomendado: 15-20%)
      - Liquidez Geral: ${liquidez.toFixed(2)}
      - EBITDA: ${ebitda.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
      - Rácio de Endividamento: ${(endividamento * 100).toFixed(2)}%

      DADOS DO PROJETO DE INVESTIMENTO:
      - Investimento Total: ${input.investmentData.totalInvestment.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
      - VAL (NPV): ${val.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
      - TIR (IRR): ${(tir * 100).toFixed(2)}%
      - Payback: ${payback.toFixed(1)} anos

      TAREFA:
      Gera um parecer técnico detalhado sobre a viabilidade e elegibilidade desta operação.
      Usa o teu "Thinking Mode" para cruzar os indicadores (ex: Autonomia baixa com Investimento alto é risco).
      
      Retorna APENAS um JSON com a seguinte estrutura (sem markdown):
      {
        "parecerTecnico": "Texto detalhado com a análise (max 3 parágrafos).",
        "pontosFortes": ["Ponto 1", "Ponto 2"],
        "pontosFracos": ["Ponto 1", "Ponto 2"],
        "recomendacoes": ["Ação 1", "Ação 2"],
        "risco": "BAIXO" | "MÉDIO" | "ALTO"
      }
    `;

        // 3. Chamar Gemini 3.0 com Thinking Mode
        const responseText = await generateText(prompt, {
            temperature: 0.2, // Baixa temperatura para análise rigorosa
            thinkingLevel: 'high', // Ativar raciocínio profundo
            maxOutputTokens: 2048
        });

        // 4. Limpar e fazer parse do JSON
        const cleanedResponse = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const result: FinancialAnalysisResult = JSON.parse(cleanedResponse);

        return result;

    } catch (error) {
        console.error('Erro na análise financeira IA:', error);
        throw new Error('Falha ao gerar análise financeira.');
    }
}
