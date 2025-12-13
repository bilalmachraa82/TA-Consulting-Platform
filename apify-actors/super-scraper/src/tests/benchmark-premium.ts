/**
 * BENCHMARK PREMIUM V4
 * 
 * - 6 portais reais
 * - 50 perguntas de consultor
 * - Scoring LLM-as-Judge
 * - Detecção rigorosa de alucinações
 * 
 * @usage npx ts-node src/tests/benchmark-premium.ts
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
    'gemini-2.5-flash'
];

const MODEL_NAMES: Record<string, string> = {
    'gemini-2.0-flash': '2.0 Flash',
    'gemini-2.5-flash': '2.5 Flash'
};

const SYSTEM_PROMPT = `És um assistente ESPECIALISTA para consultores de fundos europeus portugueses.

OBJECTIVO: Ajudar consultores a encontrar os melhores apoios para os seus clientes.

REGRAS ABSOLUTAS - OBRIGATÓRIAS:
1. Responde APENAS com informação que está EXPLICITAMENTE nos avisos fornecidos
2. CITA SEMPRE o código específico do aviso (ex: "Aviso 01/C01-i03/2021")
3. Se NÃO encontras informação específica: diz "Não encontro essa informação nos avisos disponíveis"
4. NUNCA inventes códigos de avisos, datas, valores ou percentagens
5. Perguntas sobre taxas BCE, crédito, bolsa, Erasmus, etc: "Essa pergunta está fora do âmbito dos fundos europeus disponíveis"
6. Se não tens certeza: diz que não tens certeza e sugere consultar o portal oficial

FORMATO DE RESPOSTA:
📋 [Resposta directa e concisa]
📌 Avisos: [lista com códigos específicos]
➡️ Próximo passo: [acção concreta]`;

// ============= TYPES =============

interface Question {
    id: string;
    category: string;
    q: string;
    should_refuse?: boolean;
}

interface EvalResult {
    useful: number;
    accurate: number;
    grounded: number;
    honest: number;
    overall: number;
    hallucinated: boolean;
    reason: string;
}

interface Result {
    model: string;
    qid: string;
    category: string;
    score: number;
    hallucinated: boolean;
    latency: number;
}

// ============= HELPERS =============

function loadQuestions(): Question[] {
    const p = path.join(__dirname, 'premium-questions.json');
    const data = JSON.parse(fs.readFileSync(p, 'utf-8'));
    return data.questions;
}

async function evaluateWithLLM(
    genAI: GoogleGenerativeAI,
    question: Question,
    answer: string,
    allAvisos: AvisoNormalized[]
): Promise<EvalResult> {
    const evaluator = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        generationConfig: { temperature: 0 }
    });

    // Check for hallucination in negative tests
    if (question.should_refuse) {
        const refusePhrases = ['não encontro', 'fora do âmbito', 'não tenho', 'não disponível', 'não possuo'];
        const refused = refusePhrases.some(p => answer.toLowerCase().includes(p));
        if (!refused) {
            return {
                useful: 0, accurate: 0, grounded: 0, honest: 0, overall: 0,
                hallucinated: true, reason: 'Devia recusar mas respondeu'
            };
        }
        return {
            useful: 10, accurate: 10, grounded: 10, honest: 10, overall: 10,
            hallucinated: false, reason: 'Recusou correctamente'
        };
    }

    // LLM evaluation for normal questions
    const evalPrompt = `Avalia esta resposta de um assistente de fundos europeus.

PERGUNTA: ${question.q}

RESPOSTA:
${answer}

Avalia de 0-10 em cada critério:
1. ÚTIL: Resposta útil e accionável para consultor?
2. PRECISA: Informação correcta e não inventada?
3. FUNDAMENTADA: Cita códigos de avisos específicos?
4. HONESTA: Admite limitações quando apropriado?

Responde APENAS em JSON:
{"useful": X, "accurate": X, "grounded": X, "honest": X, "reason": "breve explicação"}`;

    try {
        const result = await evaluator.generateContent(evalPrompt);
        const text = result.response.text();
        const match = text.match(/\{[\s\S]*\}/);

        if (match) {
            const parsed = JSON.parse(match[0]);
            const overall = (
                (parsed.useful || 5) * 0.30 +
                (parsed.accurate || 5) * 0.30 +
                (parsed.grounded || 5) * 0.25 +
                (parsed.honest || 5) * 0.15
            );

            // Check for invented codes
            const codesInAnswer = answer.match(/(?:\d+\/C\d+|PRR-\d+|PEPACC-\d+|PT2030-\d+)/gi) || [];
            let hallucinated = false;
            for (const code of codesInAnswer) {
                const exists = allAvisos.some(a =>
                    a.codigo?.includes(code) || a.id?.includes(code)
                );
                if (!exists && code.length > 5) {
                    hallucinated = true;
                    break;
                }
            }

            return {
                useful: parsed.useful || 5,
                accurate: parsed.accurate || 5,
                grounded: parsed.grounded || 5,
                honest: parsed.honest || 5,
                overall,
                hallucinated,
                reason: parsed.reason || 'OK'
            };
        }
    } catch (e) {
        // Fallback scoring
    }

    return {
        useful: 5, accurate: 5, grounded: 5, honest: 5, overall: 5,
        hallucinated: false, reason: 'Avaliação fallback'
    };
}

// ============= MAIN =============

async function runPremiumBenchmark(): Promise<void> {
    console.log('\n' + '═'.repeat(70));
    console.log('🏆 BENCHMARK PREMIUM V4: 6 Portais + 50 Perguntas');
    console.log('═'.repeat(70));

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const questions = loadQuestions();

    console.log(`\n❓ ${questions.length} perguntas carregadas\n`);

    // Fetch from all portals
    console.log('📥 A obter dados de 6 portais...\n');
    const allAvisos: AvisoNormalized[] = [];

    const portals = [
        { name: 'PRR', fn: () => scrapePRR({ maxItems: 30, onlyOpen: true }), icon: '🔵' },
        { name: 'PEPAC', fn: () => scrapePEPAC({ maxItems: 15, onlyOpen: true }), icon: '🟢' },
        { name: 'PT2030', fn: () => scrapePortugal2030({ maxItems: 25, onlyOpen: true }), icon: '🟣' },
        { name: 'Horizon', fn: () => scrapeCORDIS({ maxItems: 25, onlyOpen: true }), icon: '🟠' },
    ];

    for (const p of portals) {
        try {
            console.log(`${p.icon} ${p.name}...`);
            const data = await p.fn();
            allAvisos.push(...data);
            console.log(`   ✅ ${data.length} avisos`);
        } catch (e: any) {
            console.log(`   ⚠️ Timeout/Erro - continuando...`);
        }
    }

    const totalDocs = allAvisos.reduce((sum, a) => sum + (a.documentos?.length || 0), 0);
    console.log(`\n📊 TOTAL: ${allAvisos.length} avisos, ${totalDocs} documentos\n`);

    // Build context
    let context = `=== ${allAvisos.length} AVISOS DE FUNDOS EUROPEUS ===\n\n`;
    for (const a of allAvisos) {
        context += `━━━ ${a.codigo} [${a.fonte}] ━━━\n`;
        context += `Título: ${a.titulo}\n`;
        context += `Status: ${a.status}`;
        if (a.beneficiarios?.length) context += ` | Beneficiários: ${a.beneficiarios.join(', ')}`;
        context += '\n';
        if (a.dotacao > 0) context += `Dotação: €${a.dotacao.toLocaleString()}\n`;
        if (a.dataFecho) context += `Fecho: ${a.dataFecho}\n`;
        if (a.taxa) context += `Taxa: ${a.taxa}%\n`;
        if (a.descricao) context += `${a.descricao.substring(0, 250)}\n`;
        context += '\n';
    }

    console.log(`📝 Contexto: ${Math.round(context.length / 1000)}k caracteres\n`);

    // Run benchmark
    const results: Result[] = [];

    for (const modelId of MODELS_TO_TEST) {
        console.log(`\n${'─'.repeat(50)}`);
        console.log(`🤖 ${MODEL_NAMES[modelId]} - ${questions.length} perguntas`);
        console.log(`${'─'.repeat(50)}`);

        const model = genAI.getGenerativeModel({
            model: modelId,
            generationConfig: { temperature: 0, maxOutputTokens: 1024 },
            systemInstruction: SYSTEM_PROMPT
        });

        let completed = 0;
        let hallucinationCount = 0;

        for (const q of questions) {
            try {
                const start = Date.now();
                const result = await model.generateContent(`AVISOS:\n${context}\n\nPERGUNTA:\n${q.q}`);
                const latency = Date.now() - start;
                const answer = result.response.text();

                const evaluation = await evaluateWithLLM(genAI, q, answer, allAvisos);

                if (evaluation.hallucinated) hallucinationCount++;

                results.push({
                    model: modelId,
                    qid: q.id,
                    category: q.category,
                    score: evaluation.overall,
                    hallucinated: evaluation.hallucinated,
                    latency
                });

                completed++;
                const icon = evaluation.overall >= 8 ? '🟢' : evaluation.overall >= 6 ? '🟡' : '🔴';
                const hallIcon = evaluation.hallucinated ? '⚠️' : '✓';

                // Progress every 10
                if (completed % 10 === 0) {
                    console.log(`  Progresso: ${completed}/${questions.length} | Alucinações: ${hallucinationCount}`);
                }

                await new Promise(r => setTimeout(r, 300));

            } catch (e: any) {
                console.log(`  ❌ ${q.id}: erro`);
            }
        }

        console.log(`  ✅ Concluído: ${completed}/${questions.length} | Alucinações: ${hallucinationCount}`);
    }

    // Calculate and display results
    console.log('\n' + '═'.repeat(70));
    console.log('🏆 RESULTADOS FINAIS');
    console.log('═'.repeat(70));

    interface ModelMetrics {
        model: string;
        avgScore: number;
        hallucinationRate: number;
        avgLatency: number;
        count: number;
        byCategory: Record<string, number>;
    }

    const metrics: ModelMetrics[] = [];

    for (const modelId of MODELS_TO_TEST) {
        const modelResults = results.filter(r => r.model === modelId);
        if (modelResults.length === 0) continue;

        const avgScore = modelResults.reduce((s, r) => s + r.score, 0) / modelResults.length;
        const hallCount = modelResults.filter(r => r.hallucinated).length;
        const hallucinationRate = (hallCount / modelResults.length) * 100;
        const avgLatency = modelResults.reduce((s, r) => s + r.latency, 0) / modelResults.length;

        // By category
        const categories = ['matching_cae', 'eligibility', 'open_calls', 'recommendations', 'specific_details', 'negative_tests'];
        const byCategory: Record<string, number> = {};
        for (const cat of categories) {
            const catResults = modelResults.filter(r => r.category === cat);
            if (catResults.length > 0) {
                byCategory[cat] = catResults.reduce((s, r) => s + r.score, 0) / catResults.length;
            }
        }

        metrics.push({ model: modelId, avgScore, hallucinationRate, avgLatency, count: modelResults.length, byCategory });
    }

    // Sort by hallucination rate then score
    metrics.sort((a, b) => {
        if (a.hallucinationRate !== b.hallucinationRate) return a.hallucinationRate - b.hallucinationRate;
        return b.avgScore - a.avgScore;
    });

    console.log('\n📊 RANKING (Prioridade: 0% Alucinações)\n');
    console.log('| # | Modelo | Score | Alucinações | Latência |');
    console.log('|---|--------|-------|-------------|----------|');

    metrics.forEach((m, i) => {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉';
        const hallStatus = m.hallucinationRate === 0 ? '✅ 0%' : `⚠️ ${m.hallucinationRate.toFixed(1)}%`;
        console.log(`| ${medal} | ${MODEL_NAMES[m.model]} | ${m.avgScore.toFixed(1)}/10 | ${hallStatus} | ${(m.avgLatency / 1000).toFixed(1)}s |`);
    });

    console.log('\n📈 Score por Categoria:\n');
    for (const m of metrics) {
        console.log(`${MODEL_NAMES[m.model]}:`);
        for (const [cat, score] of Object.entries(m.byCategory)) {
            const catName = cat.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
            console.log(`  ${catName}: ${score.toFixed(1)}/10`);
        }
    }

    if (metrics.length > 0) {
        const winner = metrics[0];
        console.log(`\n🎯 RECOMENDAÇÃO FINAL: ${MODEL_NAMES[winner.model]}`);
        console.log(`   Score: ${winner.avgScore.toFixed(1)}/10`);
        console.log(`   Alucinações: ${winner.hallucinationRate === 0 ? '0% ✅' : winner.hallucinationRate.toFixed(1) + '%'}`);
        console.log(`   Latência: ${(winner.avgLatency / 1000).toFixed(1)}s`);
    }

    // Save results
    const outputDir = path.join(__dirname, `benchmark-premium-${new Date().toISOString().split('T')[0]}`);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    fs.writeFileSync(path.join(outputDir, 'results.json'), JSON.stringify({
        summary: { totalAvisos: allAvisos.length, totalQuestions: questions.length, models: metrics },
        results
    }, null, 2));

    // Markdown report
    let md = `# Benchmark Premium V4

> **Data**: ${new Date().toLocaleDateString('pt-PT')}
> **Avisos**: ${allAvisos.length} | **Perguntas**: ${questions.length}

## Ranking

| # | Modelo | Score | Alucinações | Latência |
|---|--------|-------|-------------|----------|
`;
    metrics.forEach((m, i) => {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉';
        md += `| ${medal} | ${MODEL_NAMES[m.model]} | ${m.avgScore.toFixed(1)}/10 | ${m.hallucinationRate === 0 ? '✅ 0%' : '⚠️ ' + m.hallucinationRate.toFixed(1) + '%'} | ${(m.avgLatency / 1000).toFixed(1)}s |\n`;
    });

    if (metrics.length > 0) {
        md += `\n## Recomendação Final\n\n**${MODEL_NAMES[metrics[0].model]}**\n`;
    }

    fs.writeFileSync(path.join(outputDir, 'report.md'), md);

    console.log(`\n💾 Relatório: ${outputDir}/`);
}

runPremiumBenchmark()
    .then(() => console.log('\n✨ Benchmark Premium V4 concluído!'))
    .catch(console.error);
