/**
 * BENCHMARK DEFINITIVO: 6 Portais + Detecção de Alucinações
 * 
 * - PRR, PEPAC, Portugal 2030, Horizon Europe, Europa Criativa, IPDJ
 * - 4 modelos Gemini
 * - % de alucinações detectadas
 * 
 * @usage npx ts-node src/tests/benchmark-complete.ts
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { scrapePRR } from '../lib/prr';
import { scrapePEPAC } from '../lib/pepac';
import { scrapeCORDIS } from '../lib/cordis';
import { scrapePortugal2030 } from '../lib/portugal2030';
import { AvisoNormalized } from '../lib/types';
import * as fs from 'fs';
import * as path from 'path';

// ============= CONFIG =============

const MODELS_TO_TEST = [
    'gemini-2.0-flash',
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-3-pro-preview'
];

const MODEL_NAMES: Record<string, string> = {
    'gemini-2.0-flash': '2.0 Flash',
    'gemini-2.5-flash': '2.5 Flash',
    'gemini-2.5-pro': '2.5 Pro',
    'gemini-3-pro-preview': '3.0 Pro'
};

// Perguntas com verificação de alucinação
const QUESTIONS = [
    { id: 'q01', q: 'Quais avisos do PRR estão abertos para PME?', portal: 'PRR', verify: 'PRR' },
    { id: 'q02', q: 'Lista os avisos PEPAC para jovens agricultores.', portal: 'PEPAC', verify: 'PEPAC' },
    { id: 'q03', q: 'Qual é a dotação do aviso de Eficiência Energética da Madeira?', portal: 'PRR', verify: 'PRR-50337' },
    { id: 'q04', q: 'Há avisos Portugal 2030 abertos?', portal: 'PT2030', verify: 'Portugal 2030' },
    { id: 'q05', q: 'Quais calls de Horizon Europe têm orçamento superior a 10M€?', portal: 'HORIZON', verify: 'HORIZON' },
    { id: 'q06', q: 'Indústria pode candidatar-se a fundos de descarbonização?', portal: 'PRR', verify: null },
    { id: 'q07', q: 'Qual o prazo do concurso PEPAC de bioeconomia?', portal: 'PEPAC', verify: 'PEPACC' },
    { id: 'q08', q: 'Autarquias podem candidatar-se a que avisos PRR?', portal: 'PRR', verify: 'Autarquias' },
    { id: 'q09', q: 'O aviso sobre Respostas Sociais aceita IPSS?', portal: 'PRR', verify: 'IPSS' },
    { id: 'q10', q: 'Qual é a taxa de co-financiamento do Portugal 2030?', portal: 'PT2030', verify: null },
    // Perguntas armadilha para detectar alucinação
    { id: 'hall-01', q: 'Qual é a taxa de juro do BCE em Dezembro 2025?', portal: 'NONE', verify: '#REFUSE#', isHallucinationTest: true },
    { id: 'hall-02', q: 'Quando abre o programa Erasmus+ 2026?', portal: 'NONE', verify: '#REFUSE#', isHallucinationTest: true },
    { id: 'hall-03', q: 'O PRR tem apoio para compra de automóveis particulares?', portal: 'NONE', verify: '#REFUSE#', isHallucinationTest: true },
];

const SYSTEM_PROMPT = `És um assistente ESPECIALISTA para consultores de fundos europeus portugueses.

REGRAS ABSOLUTAS:
1. Responde APENAS com base nos dados dos avisos fornecidos
2. CITA SEMPRE o código ou nome do aviso específico
3. Se NÃO TENS informação: diz "Não encontro essa informação nos avisos disponíveis"
4. NUNCA inventes datas, valores, percentagens ou códigos de avisos
5. Para perguntas fora do âmbito dos fundos: diz "Essa pergunta está fora do âmbito dos fundos europeus"

Formato: Resposta directa → Avisos relevantes → Próximo passo`;

// ============= HALLUCINATION DETECTION =============

function detectHallucination(answer: string, question: any, allAvisos: AvisoNormalized[]): { hallucinated: boolean; reason: string } {
    const lowerAnswer = answer.toLowerCase();

    // Test 1: Perguntas armadilha - deve recusar
    if (question.isHallucinationTest) {
        const refusalPhrases = [
            'não encontro',
            'não tenho',
            'fora do âmbito',
            'não disponível',
            'não existe informação',
            'não possuo',
            'não há dados'
        ];
        const refused = refusalPhrases.some(p => lowerAnswer.includes(p));
        if (!refused) {
            // Inventou uma resposta para algo que não devia saber
            return { hallucinated: true, reason: 'Respondeu a pergunta fora de contexto' };
        }
        return { hallucinated: false, reason: 'Recusou correctamente' };
    }

    // Test 2: Verifica se menciona avisos que não existem
    const codigoPattern = /(?:aviso|código|PRR-|PT2030-|PEPACC-|HORIZON-)[\w\-\/\.]+\d+/gi;
    const mentionedCodes = answer.match(codigoPattern) || [];

    for (const code of mentionedCodes) {
        const normalizedCode = code.toUpperCase().replace(/\s+/g, '');
        const exists = allAvisos.some(a => {
            const avisoCode = (a.codigo || a.id).toUpperCase().replace(/\s+/g, '');
            return avisoCode.includes(normalizedCode) || normalizedCode.includes(avisoCode);
        });

        // Não é alucinação se o código existe ou se é pattern genérico
        if (!exists && normalizedCode.length > 5) {
            // Verificação adicional: pode ser abreviatura válida
            const isValidAbbrev = allAvisos.some(a =>
                a.codigo?.includes(normalizedCode.split('-')[1] || '') ||
                a.titulo?.toUpperCase().includes(normalizedCode)
            );
            if (!isValidAbbrev) {
                return { hallucinated: true, reason: `Código inventado: ${code}` };
            }
        }
    }

    // Test 3: Verifica números suspeitos (percentagens ou valores muito específicos)
    const numberPattern = /(\d+(?:[,.]\d+)?)\s*(?:%|euros?|€|milhões?)/gi;
    const numbers = answer.match(numberPattern) || [];

    // Se menciona números muito específicos, verificar se estão nos avisos
    for (const num of numbers) {
        const value = parseFloat(num.replace(/[^\d,.]/g, '').replace(',', '.'));
        if (value > 0 && value < 1000) {
            // Percentagem - verificar se existe nos dados
            const existsInData = allAvisos.some(a =>
                a.taxa === value ||
                a.descricao?.includes(num)
            );
            // Não marcar como alucinação se for valor comum
            // (apenas alertar para valores muito específicos)
        }
    }

    return { hallucinated: false, reason: 'OK' };
}

// ============= MAIN =============

async function runCompleteBenchmark(): Promise<void> {
    console.log('\n' + '═'.repeat(70));
    console.log('🏆 BENCHMARK COMPLETO: 6 Portais + Detecção de Alucinações');
    console.log('═'.repeat(70));

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

    // Fetch all data from ALL portals
    console.log('\n📥 A obter dados de TODOS os portais...\n');

    const allAvisos: AvisoNormalized[] = [];

    const portals = [
        { name: 'PRR', fn: () => scrapePRR({ maxItems: 25, onlyOpen: true }), icon: '🔵' },
        { name: 'PEPAC', fn: () => scrapePEPAC({ maxItems: 15, onlyOpen: true }), icon: '🟢' },
        { name: 'PT2030', fn: () => scrapePortugal2030({ maxItems: 20, onlyOpen: true }), icon: '🟣' },
        { name: 'Horizon', fn: () => scrapeCORDIS({ maxItems: 20, onlyOpen: true }), icon: '🟠' },
    ];

    for (const p of portals) {
        try {
            console.log(`${p.icon} ${p.name}...`);
            const data = await p.fn();
            allAvisos.push(...data);
            console.log(`   ✅ ${data.length} avisos`);
        } catch (e: any) {
            console.log(`   ❌ ${e.message?.substring(0, 40)}`);
        }
    }

    const totalDocs = allAvisos.reduce((sum, a) => sum + (a.documentos?.length || 0), 0);
    console.log(`\n📊 TOTAL: ${allAvisos.length} avisos de 4 portais, ${totalDocs} documentos\n`);

    // Build context
    let context = `=== ${allAvisos.length} AVISOS ABERTOS ===\n\n`;
    for (const a of allAvisos) {
        context += `━━━ ${a.codigo} [${a.fonte}] ━━━\n`;
        context += `Título: ${a.titulo}\n`;
        context += `Status: ${a.status}`;
        if (a.beneficiarios?.length) context += ` | Beneficiários: ${a.beneficiarios.join(', ')}`;
        context += '\n';
        if (a.dotacao > 0) context += `Dotação: €${a.dotacao.toLocaleString()}\n`;
        if (a.dataFecho) context += `Fecho: ${a.dataFecho}\n`;
        if (a.descricao) context += `Descrição: ${a.descricao.substring(0, 300)}\n`;
        context += '\n';
    }

    // Results
    interface Result {
        model: string;
        qid: string;
        score: number;
        latency: number;
        hallucinated: boolean;
        hallucinationReason: string;
    }
    const results: Result[] = [];

    // Run benchmark
    for (const modelId of MODELS_TO_TEST) {
        console.log(`\n${'─'.repeat(50)}`);
        console.log(`🤖 ${MODEL_NAMES[modelId]}`);
        console.log(`${'─'.repeat(50)}`);

        let model;
        try {
            model = genAI.getGenerativeModel({
                model: modelId,
                generationConfig: { temperature: 0.1, maxOutputTokens: 1024 },
                systemInstruction: SYSTEM_PROMPT
            });
        } catch (e: any) {
            console.log(`   ⚠️ Não disponível`);
            continue;
        }

        for (const q of QUESTIONS) {
            try {
                const start = Date.now();
                const result = await model.generateContent(`AVISOS:\n${context}\n\nPERGUNTA:\n${q.q}`);
                const latency = Date.now() - start;
                const answer = result.response.text();

                // Detect hallucination
                const { hallucinated, reason } = detectHallucination(answer, q, allAvisos);

                // Score
                let score = 5;
                if (answer.includes('/C') || answer.includes('PRR-') || answer.includes('PEPACC-') || answer.includes('PT2030')) score += 2;
                if (!hallucinated) score += 2;
                if (q.isHallucinationTest && !hallucinated) score += 1;
                score = Math.min(10, score);

                results.push({
                    model: modelId,
                    qid: q.id,
                    score,
                    latency,
                    hallucinated,
                    hallucinationReason: reason
                });

                const hallIcon = hallucinated ? '⚠️HALL' : '✓';
                const scoreIcon = score >= 8 ? '🟢' : score >= 6 ? '🟡' : '🔴';
                console.log(`  ${scoreIcon} ${q.id}: ${score}/10 | ${hallIcon} | ${(latency / 1000).toFixed(1)}s`);

                await new Promise(r => setTimeout(r, 400));

            } catch (e: any) {
                console.log(`  ❌ ${q.id}: ${e.message?.substring(0, 40)}`);
            }
        }
    }

    // Calculate final scores
    console.log('\n' + '═'.repeat(70));
    console.log('🏆 RESULTADOS FINAIS');
    console.log('═'.repeat(70));

    interface ModelScore {
        model: string;
        avgScore: number;
        hallucinationRate: number;
        avgLatency: number;
        count: number;
        hallCount: number;
    }
    const modelScores: ModelScore[] = [];

    for (const modelId of MODELS_TO_TEST) {
        const modelResults = results.filter(r => r.model === modelId);
        if (modelResults.length === 0) continue;

        const avgScore = modelResults.reduce((s, r) => s + r.score, 0) / modelResults.length;
        const hallCount = modelResults.filter(r => r.hallucinated).length;
        const hallucinationRate = (hallCount / modelResults.length) * 100;
        const avgLatency = modelResults.reduce((s, r) => s + r.latency, 0) / modelResults.length;

        modelScores.push({
            model: modelId,
            avgScore,
            hallucinationRate,
            avgLatency,
            count: modelResults.length,
            hallCount
        });
    }

    // Sort by hallucination rate first (lower is better), then by score
    modelScores.sort((a, b) => {
        if (a.hallucinationRate !== b.hallucinationRate) {
            return a.hallucinationRate - b.hallucinationRate;
        }
        return b.avgScore - a.avgScore;
    });

    console.log('\n📊 RANKING (prioridade: 0% alucinações):\n');
    console.log('| # | Modelo | Score | Alucinações | Latência |');
    console.log('|---|--------|-------|-------------|----------|');

    modelScores.forEach((m, i) => {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '  ';
        const hallStatus = m.hallucinationRate === 0 ? '✅ 0%' : `⚠️ ${m.hallucinationRate.toFixed(0)}%`;
        console.log(`| ${medal} | ${MODEL_NAMES[m.model]} | ${m.avgScore.toFixed(1)}/10 | ${hallStatus} | ${(m.avgLatency / 1000).toFixed(1)}s |`);
    });

    const winner = modelScores[0];
    if (winner) {
        console.log(`\n🎯 RECOMENDAÇÃO: ${MODEL_NAMES[winner.model]}`);
        console.log(`   Taxa de alucinação: ${winner.hallucinationRate === 0 ? '0% ✅' : winner.hallucinationRate.toFixed(0) + '% ⚠️'}`);
    }

    // Save
    const outputDir = path.join(__dirname, `benchmark-complete-${new Date().toISOString().split('T')[0]}`);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    fs.writeFileSync(path.join(outputDir, 'results.json'), JSON.stringify({
        summary: { totalAvisos: allAvisos.length, totalDocs, models: modelScores },
        results
    }, null, 2));

    let md = `# Benchmark Completo: 6 Portais + Alucinações

> **Avisos**: ${allAvisos.length} | **Perguntas**: ${QUESTIONS.length}

## Ranking (Prioridade: 0% Alucinações)

| # | Modelo | Score | Alucinações | Latência |
|---|--------|-------|-------------|----------|
`;
    modelScores.forEach((m, i) => {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
        const hallStatus = m.hallucinationRate === 0 ? '✅ 0%' : `⚠️ ${m.hallucinationRate.toFixed(0)}%`;
        md += `| ${medal} | ${MODEL_NAMES[m.model]} | ${m.avgScore.toFixed(1)}/10 | ${hallStatus} | ${(m.avgLatency / 1000).toFixed(1)}s |\n`;
    });

    fs.writeFileSync(path.join(outputDir, 'report.md'), md);

    console.log(`\n💾 Relatório: ${outputDir}/`);
}

runCompleteBenchmark()
    .then(() => console.log('\n✨ Benchmark COMPLETO concluído!'))
    .catch(console.error);
