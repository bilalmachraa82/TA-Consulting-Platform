
import { calculateNPV, calculateIRR, calculatePaybackPeriod } from '../lib/financial/core';
import { calculateFinancialAutonomy, calculateEBITDA, FinancialData } from '../lib/financial/ratios';
import { validateFinancialEligibility } from '../lib/financial/validators';

console.log('💰 A iniciar testes do Módulo Financeiro...\n');

// 1. Teste Core Financeiro
console.log('--- Teste 1: Matemática Financeira (Core) ---');
const rate = 0.05; // 5%
const cashFlows = [-100000, 20000, 30000, 40000, 50000]; // Investimento + 4 anos de retorno

const npv = calculateNPV(rate, cashFlows);
console.log(`Fluxos de Caixa: ${cashFlows.join(', ')}`);
console.log(`Taxa de Desconto: ${(rate * 100)}%`);
console.log(`VAL (NPV): ${npv.toFixed(2)} €`);

try {
    const irr = calculateIRR(cashFlows);
    console.log(`TIR (IRR): ${(irr * 100).toFixed(2)}%`);
} catch (e) {
    console.error('Erro ao calcular TIR:', e);
}

const payback = calculatePaybackPeriod(cashFlows);
console.log(`Payback Period: ${payback.toFixed(2)} anos`);
console.log('\n');

// 2. Teste Rácios e Elegibilidade
console.log('--- Teste 2: Rácios e Elegibilidade ---');

const empresaExemplo: FinancialData = {
    ativoTotal: 500000,
    passivoTotal: 300000,
    capitalProprio: 200000,
    ativoCorrente: 150000,
    passivoCorrente: 100000,
    vendas: 1000000,
    custosVendas: 600000,
    fornecimentosServicosExternos: 200000,
    gastosPessoal: 150000,
    resultadosLiquidos: 30000, // Lucro
    jurosGastos: 10000,
    impostos: 10000,
    amortizacoes: 20000
};

console.log('Dados da Empresa:', JSON.stringify(empresaExemplo, null, 2));

const autonomia = calculateFinancialAutonomy(empresaExemplo);
console.log(`Autonomia Financeira: ${(autonomia * 100).toFixed(2)}%`);

const ebitda = calculateEBITDA(empresaExemplo);
console.log(`EBITDA: ${ebitda.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}`);

const validacao = validateFinancialEligibility(empresaExemplo);
console.log('Resultado da Validação (Critérios Padrão):');
console.log(`Elegível? ${validacao.isEligible ? '✅ SIM' : '❌ NÃO'}`);
if (!validacao.isEligible) {
    console.log('Razões:', validacao.reasons);
}

console.log('\n--- Teste 3: Empresa Não Elegível ---');
const empresaRuim = { ...empresaExemplo, capitalProprio: 50000, ativoTotal: 500000, resultadosLiquidos: -10000 };
const validacaoRuim = validateFinancialEligibility(empresaRuim);
console.log(`Elegível? ${validacaoRuim.isEligible ? '✅ SIM' : '❌ NÃO'}`);
console.log('Razões:', validacaoRuim.reasons);

console.log('\n✅ Testes concluídos.');
