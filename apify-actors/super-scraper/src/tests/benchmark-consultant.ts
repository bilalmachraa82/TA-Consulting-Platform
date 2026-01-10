/**
 * Benchmark V3: Consultant-Focused with LLM-as-Judge Evaluation
 * 
 * Usa avaliação semântica em vez de keywords exactas
 * 
 * @usage npx ts-node src/tests/benchmark-consultant.ts
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { AvisoNormalized } from '../lib/types';
import * as fs from 'fs';
import * as path from 'path';

// ============= TYPES =============

interface ConsultantQuestion {
    id: string;
    category: string;
    question: string;
    expected_context: string;
    priority: string;
    should_admit_unknown?: boolean;
    is_edge_case?: boolean;
}

interface EvaluationResult {
    useful: number;      // 0-10: Resposta útil para o consultor?
    accurate: number;    // 0-10: Info correcta e baseada nos docs?
    grounded: number;    // 0-10: Cita fontes específicas?
    honest: number;      // 0-10: Admite quando não sabe?
    overall: number;     // Média ponderada
    reasoning: string;   // Justificação do avaliador
}

interface ModelTestResult {
    model: string;
    questionId: string;
    question: string;
    answer: string;
    evaluation: EvaluationResult;
    latencyMs: number;
    tokens: { input: number; output: number };
}

interface RealDataResult {
    prr: AvisoNormalized[];
    pepac: AvisoNormalized[];
    cordis: AvisoNormalized[];
    timestamp: string;
    summary: { total: number; withDocs: number; totalDocs: number };
}

// ============= CONFIG =============

const MODELS_TO_TEST = [
    'gemini-2.5-pro',
    'gemini-2.5-flash'
];

const MODEL_NAMES: Record<string, string> = {
    'gemini-2.5-pro': 'Gemini 2.5 Pro',
    'gemini-2.5-flash': 'Gemini 2.5 Flash'
};

const EVALUATOR_MODEL = 'gemini-2.5-flash';

const SYSTEM_PROMPT = `És um assistente especializado para CONSULTORES de fundos europeus portugueses.

O teu objectivo é ajudar consultores a:
1. Encontrar avisos compatíveis com os CAE/actividades dos clientes
2. Verificar elegibilidade de empresas para programas específicos
3. Identificar avisos abertos e prazos relevantes
4. Recomendar o melhor fundo para cada situação

REGRAS:
- Responde sempre baseado nos dados dos avisos fornecidos
- Se não tiveres informação suficiente, diz "Com base nos avisos disponíveis, não encontro informação específica sobre isso. Sugiro consultar [fonte]"
- Cita SEMPRE o código ou nome do aviso quando referires informação específica
- Sê directo e prático - consultores precisam de respostas accionáveis

FORMATO:
- Resposta directa à pergunta
- Lista de avisos relevantes (se aplicável)
- Próximos passos recomendados`;

// ============= HELPERS =============

function getApiKey(): string {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error('GEMINI_API_KEY not set');
    return key;
}

function loadRealData(): RealDataResult {
    const dataPath = path.join(__dirname, 'real-data.json');
    return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
}

function loadQuestions(): ConsultantQuestion[] {
    const qPath = path.join(__dirname, 'consultant-questions.json');
    const data = JSON.parse(fs.readFileSync(qPath, 'utf-8'));
    return data.questions;
}

function buildContext(data: RealDataResult): string {
    const allAvisos = [...data.prr, ...data.pepac, ...data.cordis];

    let context = `=== AVISOS ABERTOS (${new Date().toISOString().split('T')[0]}) ===\n`;
    context += `Total: ${allAvisos.length} avisos\n\n`;

    for (const aviso of allAvisos) {
        context += `━━━ ${aviso.codigo} ━━━\n`;
        context += `Título: ${aviso.titulo}\n`;
        context += `Fonte: ${aviso.fonte} | Status: ${aviso.status}\n`;
        if (aviso.beneficiarios?.length) {
            context += `Beneficiários: ${aviso.beneficiarios.join(', ')}\n`;
        }
        if (aviso.objetivoEstrategico) {
            context += `Objectivo: ${aviso.objetivoEstrategico}\n`;
        }
        if (aviso.dotacao > 0) {
            context += `Dotação: €${aviso.dotacao.toLocaleString()}\n`;
        }
        if (aviso.dataFecho) {
            context += `Prazo: ${aviso.dataFecho}\n`;
        }
        if (aviso.descricao) {
            context += `Descrição: ${aviso.descricao.substring(0, 300)}...\n`;
        }
        context += `URL: ${aviso.url}\n\n`;
    }

    return context;
}

async function evaluateWithLLM(
    genAI: GoogleGenerativeAI,
    question: ConsultantQuestion,
    answer: string,
    context: string
): Promise<EvaluationResult> {
    const evaluator = genAI.getGenerativeModel({
        model: EVALUATOR_MODEL,
        generationConfig: { temperature: 0.1 }
    });

    const evalPrompt = `És um avaliador de qualidade de respostas para um sistema de Q&A sobre fundos europeus.

PERGUNTA DO CONSULTOR:
${question.question}

CONTEXTO ESPERADO:
${question.expected_context}

RESPOSTA DO MODELO:
${answer}

Avalia a resposta em 4 dimensões (0-10):

1. ÚTIL (0-10): A resposta é útil e accionável para um consultor?
2. PRECISA (0-10): A informação está correcta e baseada nos documentos?
3. FUNDAMENTADA (0-10): Cita avisos ou fontes específicas?
4. HONESTA (0-10): Se não tem info, admite claramente?

Responde EXACTAMENTE neste formato JSON:
{
  "useful": <número 0-10>,
  "accurate": <número 0-10>,
  "grounded": <número 0-10>,
  "honest": <número 0-10>,
  "reasoning": "<explicação curta de 1-2 frases>"
}`;

    try {
        const result = await evaluator.generateContent(evalPrompt);
        const text = result.response.text();

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            const overall = (parsed.useful * 0.3 + parsed.accurate * 0.3 + parsed.grounded * 0.25 + parsed.honest * 0.15);
            return {
                useful: parsed.useful || 5,
                accurate: parsed.accurate || 5,
                grounded: parsed.grounded || 5,
                honest: parsed.honest || 5,
                overall,
                reasoning: parsed.reasoning || 'Avaliação automática'
            };
        }
    } catch (e) {
        console.log('   ⚠️ Eval error, usando defaults');
    }

    return { useful: 5, accurate: 5, grounded: 5, honest: 5, overall: 5, reasoning: 'Fallback' };
}

// ============= MAIN =============

async function runConsultantBenchmark(): Promise<void> {
    console.log('\n' + '═'.repeat(70));
    console.log('🧑‍💼 BENCHMARK V3: Perguntas Reais de Consultores');
    console.log('═'.repeat(70));

    const genAI = new GoogleGenerativeAI(getApiKey());
    const realData = loadRealData();
    const questions = loadQuestions();
    const context = buildContext(realData);

    console.log(`\n📊 ${realData.summary.total} avisos reais`);
    console.log(`❓ ${questions.length} perguntas de consultor`);
    console.log(`🤖 Modelos: ${MODELS_TO_TEST.map(m => MODEL_NAMES[m]).join(', ')}`);
    console.log(`📝 Avaliação: LLM-as-Judge (semântica)\n`);

    const allResults: ModelTestResult[] = [];

    for (const modelId of MODELS_TO_TEST) {
        console.log(`\n${'─'.repeat(50)}`);
        console.log(`🤖 ${MODEL_NAMES[modelId]}`);
        console.log(`${'─'.repeat(50)}`);

        const model = genAI.getGenerativeModel({
            model: modelId,
            generationConfig: { temperature: 0.1, maxOutputTokens: 1024 },
            systemInstruction: SYSTEM_PROMPT
        });

        for (const q of questions) {
            try {
                const prompt = `DADOS DOS AVISOS:\n${context}\n\nPERGUNTA:\n${q.question}`;

                const start = Date.now();
                const result = await model.generateContent(prompt);
                const latency = Date.now() - start;

                const answer = result.response.text();
                const usage = result.response.usageMetadata;

                // Evaluate with LLM
                const evaluation = await evaluateWithLLM(genAI, q, answer, context);

                allResults.push({
                    model: modelId,
                    questionId: q.id,
                    question: q.question,
                    answer: answer.substring(0, 800),
                    evaluation,
                    latencyMs: latency,
                    tokens: {
                        input: usage?.promptTokenCount || 0,
                        output: usage?.candidatesTokenCount || 0
                    }
                });

                const score = evaluation.overall;
                const icon = score >= 8 ? '🟢' : score >= 6 ? '🟡' : '🔴';
                console.log(`  ${icon} ${q.id}: ${score.toFixed(1)}/10 | ${(latency / 1000).toFixed(1)}s`);

                await new Promise(r => setTimeout(r, 800));

            } catch (e: any) {
                console.log(`  ❌ ${q.id}: ${e.message?.substring(0, 50)}`);
            }
        }
    }

    // Calculate final scores
    console.log('\n' + '═'.repeat(70));
    console.log('📊 RESULTADOS FINAIS');
    console.log('═'.repeat(70));

    for (const modelId of MODELS_TO_TEST) {
        const modelResults = allResults.filter(r => r.model === modelId);
        if (modelResults.length === 0) continue;

        const avgOverall = modelResults.reduce((sum, r) => sum + r.evaluation.overall, 0) / modelResults.length;
        const avgUseful = modelResults.reduce((sum, r) => sum + r.evaluation.useful, 0) / modelResults.length;
        const avgAccurate = modelResults.reduce((sum, r) => sum + r.evaluation.accurate, 0) / modelResults.length;
        const avgGrounded = modelResults.reduce((sum, r) => sum + r.evaluation.grounded, 0) / modelResults.length;
        const avgLatency = modelResults.reduce((sum, r) => sum + r.latencyMs, 0) / modelResults.length;

        console.log(`\n🤖 ${MODEL_NAMES[modelId]}`);
        console.log(`   Score Global: ${avgOverall.toFixed(1)}/10`);
        console.log(`   - Útil: ${avgUseful.toFixed(1)} | Preciso: ${avgAccurate.toFixed(1)} | Fundamentado: ${avgGrounded.toFixed(1)}`);
        console.log(`   - Latência: ${(avgLatency / 1000).toFixed(1)}s`);
    }

    // Save results
    const outputDir = path.join(__dirname, `benchmark-v3-${new Date().toISOString().split('T')[0]}`);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    fs.writeFileSync(
        path.join(outputDir, 'results.json'),
        JSON.stringify({ results: allResults, timestamp: new Date().toISOString() }, null, 2)
    );

    // Build markdown report
    let md = `# Benchmark V3: Consultores

> Avaliação semântica (LLM-as-Judge)

## Scores por Modelo

| Modelo | Score | Útil | Preciso | Fundamentado | Latência |
|--------|-------|------|---------|--------------|----------|
`;

    for (const modelId of MODELS_TO_TEST) {
        const modelResults = allResults.filter(r => r.model === modelId);
        if (modelResults.length === 0) continue;

        const avgOverall = modelResults.reduce((sum, r) => sum + r.evaluation.overall, 0) / modelResults.length;
        const avgUseful = modelResults.reduce((sum, r) => sum + r.evaluation.useful, 0) / modelResults.length;
        const avgAccurate = modelResults.reduce((sum, r) => sum + r.evaluation.accurate, 0) / modelResults.length;
        const avgGrounded = modelResults.reduce((sum, r) => sum + r.evaluation.grounded, 0) / modelResults.length;
        const avgLatency = modelResults.reduce((sum, r) => sum + r.latencyMs, 0) / modelResults.length;

        md += `| ${MODEL_NAMES[modelId]} | ${avgOverall.toFixed(1)} | ${avgUseful.toFixed(1)} | ${avgAccurate.toFixed(1)} | ${avgGrounded.toFixed(1)} | ${(avgLatency / 1000).toFixed(1)}s |\n`;
    }

    md += `\n## Exemplos de Respostas\n\n`;

    // Show 3 best examples
    const best = allResults.sort((a, b) => b.evaluation.overall - a.evaluation.overall).slice(0, 3);
    for (const r of best) {
        md += `### ${r.questionId} (${r.evaluation.overall.toFixed(1)}/10)\n`;
        md += `**Pergunta**: ${r.question}\n\n`;
        md += `**Resposta** (${MODEL_NAMES[r.model]}):\n> ${r.answer.substring(0, 400)}...\n\n`;
    }

    fs.writeFileSync(path.join(outputDir, 'report.md'), md);

    console.log(`\n💾 Resultados: ${outputDir}/`);
}

runConsultantBenchmark()
    .then(() => console.log('\n✨ Benchmark V3 concluído!'))
    .catch(console.error);
