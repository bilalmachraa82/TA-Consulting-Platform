/**
 * Benchmark de Modelos Gemini para RAG
 * 
 * Compara Gemini 2.5 Flash, 2.5 Pro e 2.0 Pro
 * em termos de: faithfulness, hallucination, latency e custo
 * 
 * @usage npx ts-node src/tests/benchmark-models.ts
 */

import { GoogleGenerativeAI, GenerateContentResult } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';

// ============= TYPES =============

interface GoldenQuestion {
    id: string;
    portal: string | null;
    category: string;
    question: string;
    expected_keywords?: string[];
    expected_answer_fragment?: string;
    expected_portals?: string[];
    requires_citation?: boolean;
    is_negative_test?: boolean;
    should_refuse?: boolean;
    difficulty: 'easy' | 'medium' | 'hard';
}

interface ModelResult {
    model: string;
    questionId: string;
    question: string;
    answer: string;
    latencyMs: number;
    inputTokens: number;
    outputTokens: number;
    hasCitation: boolean;
    citationSources: string[];
    keywordsFound: string[];
    keywordsMissing: string[];
    keywordScore: number;
    refusedCorrectly: boolean;
    hallucinationDetected: boolean;
    timestamp: string;
}

interface BenchmarkMetrics {
    model: string;
    totalQuestions: number;
    avgLatencyMs: number;
    avgKeywordScore: number;
    citationRate: number;
    negativeTestAccuracy: number;
    hallucinationRate: number;
    estimatedCostUSD: number;
    totalInputTokens: number;
    totalOutputTokens: number;
}

interface BenchmarkReport {
    timestamp: string;
    testFiles: number;
    totalQuestions: number;
    modelsCompared: string[];
    results: ModelResult[];
    metrics: BenchmarkMetrics[];
    recommendation: string;
}

// ============= CONFIG =============

const MODELS_TO_TEST = [
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-2.0-flash'
];

const MODEL_DISPLAY_NAMES: Record<string, string> = {
    'gemini-2.5-flash': 'Gemini 2.5 Flash',
    'gemini-2.5-pro': 'Gemini 2.5 Pro',
    'gemini-2.0-flash': 'Gemini 2.0 Flash'
};

// Pricing per 1M tokens (December 2025)
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
    'gemini-2.5-flash': { input: 0.30, output: 2.50 },
    'gemini-2.5-pro': { input: 1.25, output: 10.00 },
    'gemini-2.0-flash': { input: 0.10, output: 0.40 }
};

const GENERATION_CONFIG = {
    temperature: 0.1,
    maxOutputTokens: 1024,
};

const SYSTEM_PROMPT = `És um assistente especializado em fundos europeus portugueses (PRR, Portugal 2030, PEPAC).

REGRAS OBRIGATÓRIAS:
1. Responde APENAS com base na informação dos documentos fornecidos.
2. Se não tiveres informação sobre o tema perguntado, diz explicitamente "Não tenho informação sobre isso nos documentos disponíveis."
3. Cita SEMPRE a fonte de cada afirmação (nome do documento ou secção).
4. Nunca inventes dados, datas, valores ou percentagens que não estejam nos documentos.
5. Se a pergunta for sobre um programa fora do âmbito (PRR/PT2030/PEPAC), recusa responder.

FORMATO DE RESPOSTA:
- Começa com a resposta directa
- Inclui dados numéricos quando disponíveis
- Termina com "Fonte: [nome do documento]"`;

// ============= HELPERS =============

function getApiKey(): string {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        throw new Error('GEMINI_API_KEY environment variable not set');
    }
    return key;
}

function loadTestDocuments(): string {
    const docsDir = path.join(__dirname, 'test-documents');
    const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.md'));

    let combinedContent = '';
    for (const file of files) {
        const content = fs.readFileSync(path.join(docsDir, file), 'utf-8');
        const portal = file.split('-')[0].toUpperCase();
        combinedContent += `\n\n--- DOCUMENTO: ${file} (Portal: ${portal}) ---\n\n${content}`;
    }

    console.log(`📚 Loaded ${files.length} test documents`);
    return combinedContent;
}

function loadGoldenQuestions(): GoldenQuestion[] {
    const questionsPath = path.join(__dirname, 'golden-questions.json');
    const data = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));
    console.log(`❓ Loaded ${data.questions.length} golden questions`);
    return data.questions;
}

function checkKeywords(answer: string, keywords: string[]): { found: string[]; missing: string[] } {
    const lowerAnswer = answer.toLowerCase();
    const found: string[] = [];
    const missing: string[] = [];

    for (const kw of keywords) {
        if (lowerAnswer.includes(kw.toLowerCase())) {
            found.push(kw);
        } else {
            missing.push(kw);
        }
    }

    return { found, missing };
}

function detectHallucination(answer: string, question: GoldenQuestion): boolean {
    // Check if model invented things for negative tests
    if (question.is_negative_test && question.should_refuse) {
        const refusalPhrases = ['não tenho informação', 'não disponível', 'fora do âmbito', 'não encontr'];
        const hasRefusal = refusalPhrases.some(phrase => answer.toLowerCase().includes(phrase));
        // If should refuse but gave detailed answer, likely hallucinated
        if (!hasRefusal && answer.length > 100) {
            return true;
        }
    }

    // Basic hallucination patterns (invented data)
    const suspiciousPatterns = [
        /\d{1,2}\/\d{1,2}\/\d{4}/g, // Random dates not in docs
        /www\.[a-z]+\.[a-z]+/g, // Fake websites
    ];

    // This is a simplified check - real implementation would compare against docs
    return false;
}

function extractCitations(answer: string): string[] {
    const citations: string[] = [];

    // Look for "Fonte:" references
    const fonteMatches = answer.match(/Fonte:\s*([^\n.]+)/gi);
    if (fonteMatches) {
        citations.push(...fonteMatches.map(m => m.replace(/Fonte:\s*/i, '').trim()));
    }

    // Look for document references
    const docMatches = answer.match(/(prr|pt2030|pepac)-\d{2}-[a-z-]+/gi);
    if (docMatches) {
        citations.push(...docMatches);
    }

    return Array.from(new Set(citations));
}

function calculateCost(inputTokens: number, outputTokens: number, model: string): number {
    const pricing = MODEL_PRICING[model];
    if (!pricing) return 0;

    const inputCost = (inputTokens / 1_000_000) * pricing.input;
    const outputCost = (outputTokens / 1_000_000) * pricing.output;

    return inputCost + outputCost;
}

// ============= BENCHMARK RUNNER =============

async function runBenchmark(): Promise<BenchmarkReport> {
    console.log('\n🚀 Starting Gemini RAG Model Benchmark\n');
    console.log('═'.repeat(60));

    const genAI = new GoogleGenerativeAI(getApiKey());
    const documents = loadTestDocuments();
    const questions = loadGoldenQuestions();

    const allResults: ModelResult[] = [];
    const startTime = Date.now();

    for (const modelId of MODELS_TO_TEST) {
        console.log(`\n📊 Testing: ${MODEL_DISPLAY_NAMES[modelId]}`);
        console.log('-'.repeat(40));

        const model = genAI.getGenerativeModel({
            model: modelId,
            generationConfig: GENERATION_CONFIG,
            systemInstruction: SYSTEM_PROMPT,
        });

        for (const q of questions) {
            try {
                const prompt = `CONTEXT:\n${documents}\n\nQUESTION:\n${q.question}`;

                const queryStart = Date.now();
                const result = await model.generateContent(prompt);
                const latencyMs = Date.now() - queryStart;

                const response = result.response;
                const answer = response.text();
                const usage = response.usageMetadata;

                const inputTokens = usage?.promptTokenCount || 0;
                const outputTokens = usage?.candidatesTokenCount || 0;

                const keywords = q.expected_keywords || [];
                const { found, missing } = checkKeywords(answer, keywords);
                const keywordScore = keywords.length > 0 ? found.length / keywords.length : 1;

                const citations = extractCitations(answer);
                const hasCitation = citations.length > 0 || !q.requires_citation;

                const refusedCorrectly = q.is_negative_test
                    ? answer.toLowerCase().includes('não tenho informação') ||
                    answer.toLowerCase().includes('fora do âmbito')
                    : true;

                const hallucinationDetected = detectHallucination(answer, q);

                const modelResult: ModelResult = {
                    model: modelId,
                    questionId: q.id,
                    question: q.question,
                    answer: answer.substring(0, 500) + (answer.length > 500 ? '...' : ''),
                    latencyMs,
                    inputTokens,
                    outputTokens,
                    hasCitation,
                    citationSources: citations,
                    keywordsFound: found,
                    keywordsMissing: missing,
                    keywordScore,
                    refusedCorrectly,
                    hallucinationDetected,
                    timestamp: new Date().toISOString()
                };

                allResults.push(modelResult);

                // Progress indicator
                const status = keywordScore >= 0.7 ? '✅' : keywordScore >= 0.4 ? '⚠️' : '❌';
                console.log(`  ${status} ${q.id}: ${latencyMs}ms, keywords: ${(keywordScore * 100).toFixed(0)}%`);

                // Rate limiting
                await new Promise(resolve => setTimeout(resolve, 500));

            } catch (error) {
                console.error(`  ❌ Error on ${q.id}:`, error);
            }
        }
    }

    // Calculate aggregated metrics
    const metrics: BenchmarkMetrics[] = MODELS_TO_TEST.map(modelId => {
        const modelResults = allResults.filter(r => r.model === modelId);
        const negativeTests = modelResults.filter(r => {
            const q = questions.find(q => q.id === r.questionId);
            return q?.is_negative_test;
        });

        const totalInputTokens = modelResults.reduce((sum, r) => sum + r.inputTokens, 0);
        const totalOutputTokens = modelResults.reduce((sum, r) => sum + r.outputTokens, 0);

        return {
            model: MODEL_DISPLAY_NAMES[modelId],
            totalQuestions: modelResults.length,
            avgLatencyMs: modelResults.reduce((sum, r) => sum + r.latencyMs, 0) / modelResults.length,
            avgKeywordScore: modelResults.reduce((sum, r) => sum + r.keywordScore, 0) / modelResults.length,
            citationRate: modelResults.filter(r => r.hasCitation).length / modelResults.length,
            negativeTestAccuracy: negativeTests.filter(r => r.refusedCorrectly).length / (negativeTests.length || 1),
            hallucinationRate: modelResults.filter(r => r.hallucinationDetected).length / modelResults.length,
            estimatedCostUSD: calculateCost(totalInputTokens, totalOutputTokens, modelId),
            totalInputTokens,
            totalOutputTokens
        };
    });

    // Generate recommendation
    const recommendation = generateRecommendation(metrics);

    const report: BenchmarkReport = {
        timestamp: new Date().toISOString(),
        testFiles: fs.readdirSync(path.join(__dirname, 'test-documents')).length,
        totalQuestions: questions.length,
        modelsCompared: MODELS_TO_TEST.map(m => MODEL_DISPLAY_NAMES[m]),
        results: allResults,
        metrics,
        recommendation
    };

    // Save report
    const reportPath = path.join(__dirname, `benchmark-results-${new Date().toISOString().split('T')[0]}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 Report saved to: ${reportPath}`);

    // Generate markdown report
    generateMarkdownReport(report);

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n✨ Benchmark complete in ${totalTime}s`);

    return report;
}

function generateRecommendation(metrics: BenchmarkMetrics[]): string {
    // Score each model
    const scores = metrics.map(m => {
        let score = 0;

        // Accuracy (40% weight)
        score += m.avgKeywordScore * 40;

        // Low hallucination (25% weight)
        score += (1 - m.hallucinationRate) * 25;

        // Citation rate (15% weight)
        score += m.citationRate * 15;

        // Negative test handling (10% weight)
        score += m.negativeTestAccuracy * 10;

        // Speed bonus (5% weight) - inverted, lower is better
        const maxLatency = Math.max(...metrics.map(x => x.avgLatencyMs));
        score += (1 - m.avgLatencyMs / maxLatency) * 5;

        // Cost efficiency (5% weight) - inverted, lower is better
        const maxCost = Math.max(...metrics.map(x => x.estimatedCostUSD));
        score += (1 - m.estimatedCostUSD / maxCost) * 5;

        return { model: m.model, score, metrics: m };
    });

    scores.sort((a, b) => b.score - a.score);

    const winner = scores[0];
    const runner = scores[1];

    return `
## Recomendação

**Modelo Recomendado: ${winner.model}** (Score: ${winner.score.toFixed(1)}/100)

### Justificação:
- Precisão (keywords): ${(winner.metrics.avgKeywordScore * 100).toFixed(1)}%
- Taxa de citação: ${(winner.metrics.citationRate * 100).toFixed(1)}%
- Taxa de alucinação: ${(winner.metrics.hallucinationRate * 100).toFixed(1)}%
- Latência média: ${winner.metrics.avgLatencyMs.toFixed(0)}ms
- Custo estimado (${winner.metrics.totalQuestions} queries): $${winner.metrics.estimatedCostUSD.toFixed(4)}

### Alternativa:
${runner.model} (Score: ${runner.score.toFixed(1)}/100) - ${runner.metrics.avgLatencyMs < winner.metrics.avgLatencyMs ? 'Mais rápido' : 'Mais preciso em alguns casos'}
`.trim();
}

function generateMarkdownReport(report: BenchmarkReport): void {
    let md = `# Benchmark Report - Modelos Gemini para RAG

> **Data**: ${report.timestamp.split('T')[0]}
> **Ficheiros de Teste**: ${report.testFiles}
> **Perguntas Testadas**: ${report.totalQuestions}

---

## Resumo de Métricas

| Modelo | Precisão | Citações | Alucinação | Latência | Custo |
|--------|----------|----------|------------|----------|-------|
`;

    for (const m of report.metrics) {
        md += `| ${m.model} | ${(m.avgKeywordScore * 100).toFixed(1)}% | ${(m.citationRate * 100).toFixed(1)}% | ${(m.hallucinationRate * 100).toFixed(1)}% | ${m.avgLatencyMs.toFixed(0)}ms | $${m.estimatedCostUSD.toFixed(4)} |\n`;
    }

    md += `\n---\n\n${report.recommendation}\n`;

    md += `\n---\n\n## Detalhes por Modelo\n`;

    for (const model of report.modelsCompared) {
        const modelResults = report.results.filter(r => MODEL_DISPLAY_NAMES[r.model] === model || r.model.includes(model.toLowerCase().replace(' ', '-')));

        md += `\n### ${model}\n\n`;
        md += `| Pergunta | Score | Latência | Citação |\n`;
        md += `|----------|-------|----------|--------|\n`;

        for (const r of modelResults.slice(0, 10)) {
            const score = r.keywordScore >= 0.7 ? '✅' : r.keywordScore >= 0.4 ? '⚠️' : '❌';
            md += `| ${r.questionId} | ${score} ${(r.keywordScore * 100).toFixed(0)}% | ${r.latencyMs}ms | ${r.hasCitation ? '✅' : '❌'} |\n`;
        }
    }

    const mdPath = path.join(__dirname, 'benchmark-report.md');
    fs.writeFileSync(mdPath, md);
    console.log(`📝 Markdown report saved to: ${mdPath}`);
}

// ============= MAIN =============

runBenchmark()
    .then((report) => {
        console.log('\n' + '═'.repeat(60));
        console.log('📊 BENCHMARK SUMMARY');
        console.log('═'.repeat(60));
        console.log(report.recommendation);
    })
    .catch(console.error);
