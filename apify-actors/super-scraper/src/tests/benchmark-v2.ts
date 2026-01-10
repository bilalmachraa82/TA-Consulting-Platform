/**
 * Benchmark V2: Premium RAG com Dados Reais
 * 
 * Compara 4 modelos Gemini com dados 100% reais das plataformas PRR, PEPAC e CORDIS
 * 
 * @usage npx ts-node src/tests/benchmark-v2.ts
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { AvisoNormalized } from '../lib/types';
import * as fs from 'fs';
import * as path from 'path';

// ============= TYPES =============

interface GoldenQuestion {
    id: string;
    category: string;
    question: string;
    expected_keywords?: string[];
    requires_citation?: boolean;
    should_refuse?: boolean;
    is_negative_test?: boolean;
    is_cross_portal?: boolean;
    priority: string;
}

interface ModelResult {
    model: string;
    modelDisplayName: string;
    questionId: string;
    question: string;
    answer: string;
    latencyMs: number;
    inputTokens: number;
    outputTokens: number;
    hasCitation: boolean;
    keywordScore: number;
    refusedCorrectly: boolean;
    timestamp: string;
}

interface ModelMetrics {
    model: string;
    displayName: string;
    totalQuestions: number;
    avgLatencyMs: number;
    avgKeywordScore: number;
    citationRate: number;
    negativeTestAccuracy: number;
    estimatedCostUSD: number;
    totalInputTokens: number;
    totalOutputTokens: number;
    overallScore: number;
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
    'gemini-2.0-flash',
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-3-pro-preview'  // Newest model (Nov 2025)
];

const MODEL_DISPLAY_NAMES: Record<string, string> = {
    'gemini-2.0-flash': 'Gemini 2.0 Flash',
    'gemini-2.5-flash': 'Gemini 2.5 Flash',
    'gemini-2.5-pro': 'Gemini 2.5 Pro',
    'gemini-3-pro-preview': 'Gemini 3.0 Pro'
};

const MODEL_PRICING: Record<string, { input: number; output: number }> = {
    'gemini-2.0-flash': { input: 0.10, output: 0.40 },
    'gemini-2.5-flash': { input: 0.30, output: 2.50 },
    'gemini-2.5-pro': { input: 1.25, output: 10.00 },
    'gemini-3-pro-preview': { input: 1.50, output: 12.00 }
};

const GENERATION_CONFIG = {
    temperature: 0.1,
    maxOutputTokens: 1024,
};

const SYSTEM_PROMPT = `És um assistente especializado em fundos europeus para consultores portugueses.
Tens acesso a informação REAL de avisos abertos dos seguintes portais:
- PRR (Plano de Recuperação e Resiliência)
- PEPAC (Plano Estratégico da PAC)
- Horizon Europe (Programas Europeus de I&D)

REGRAS CRÍTICAS:
1. Responde APENAS com informação presente nos documentos fornecidos.
2. Se não encontrares informação, diz: "Não encontrei essa informação nos documentos disponíveis."
3. CITA SEMPRE a fonte (nome do aviso, código ou portal).
4. Nunca inventes dados, datas, valores ou percentagens.
5. Usa linguagem profissional e clara para consultores.
6. Inclui próximos passos concretos quando apropriado.

FORMATO:
- Resposta directa e concisa
- Dados numéricos quando disponíveis
- Fonte: [código ou nome do aviso]`;

// ============= HELPERS =============

function getApiKey(): string {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error('GEMINI_API_KEY not set');
    return key;
}

function loadRealData(): RealDataResult {
    const dataPath = path.join(__dirname, 'real-data.json');
    if (!fs.existsSync(dataPath)) {
        throw new Error('real-data.json not found. Run fetch-real-data.ts first.');
    }
    return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
}

function loadGoldenQuestions(): GoldenQuestion[] {
    const qPath = path.join(__dirname, 'golden-questions-v2.json');
    const data = JSON.parse(fs.readFileSync(qPath, 'utf-8'));
    return data.questions;
}

function buildContext(data: RealDataResult): string {
    const allAvisos = [...data.prr, ...data.pepac, ...data.cordis];

    let context = `=== DADOS REAIS DE AVISOS ABERTOS (${data.timestamp.split('T')[0]}) ===\n\n`;
    context += `Total: ${allAvisos.length} avisos de 3 portais\n\n`;

    // Group by portal
    const portals = {
        'PRR': data.prr,
        'PEPAC': data.pepac,
        'Horizon Europe': data.cordis
    };

    for (const [portal, avisos] of Object.entries(portals)) {
        if (avisos.length === 0) continue;

        context += `\n${'='.repeat(60)}\n`;
        context += `PORTAL: ${portal} (${avisos.length} avisos)\n`;
        context += `${'='.repeat(60)}\n\n`;

        // Take first 5 avisos per portal for context (avoid token limits)
        for (const aviso of avisos.slice(0, 5)) {
            context += `--- AVISO: ${aviso.codigo} ---\n`;
            context += `Título: ${aviso.titulo}\n`;
            context += `Programa: ${aviso.programa}\n`;
            context += `Status: ${aviso.status}\n`;
            if (aviso.dataAbertura) context += `Data Abertura: ${aviso.dataAbertura}\n`;
            if (aviso.dataFecho) context += `Data Fecho: ${aviso.dataFecho}\n`;
            if (aviso.dotacao > 0) context += `Dotação: €${aviso.dotacao.toLocaleString()}\n`;
            if (aviso.beneficiarios?.length) context += `Beneficiários: ${aviso.beneficiarios.join(', ')}\n`;
            if (aviso.descricao) context += `Descrição: ${aviso.descricao.substring(0, 500)}...\n`;
            context += `URL: ${aviso.url}\n`;
            if (aviso.documentos?.length) {
                context += `Documentos: ${aviso.documentos.length} anexos\n`;
                for (const doc of aviso.documentos.slice(0, 3)) {
                    context += `  - ${doc.nome}: ${doc.url}\n`;
                }
            }
            context += '\n';
        }
    }

    return context;
}

function checkKeywords(answer: string, keywords: string[]): number {
    if (!keywords || keywords.length === 0) return 1;
    const lowerAnswer = answer.toLowerCase();
    const found = keywords.filter(kw => lowerAnswer.includes(kw.toLowerCase()));
    return found.length / keywords.length;
}

function hasCitationInAnswer(answer: string): boolean {
    const citationPatterns = [
        /fonte:/i,
        /aviso[\s:]/i,
        /código[\s:]/i,
        /PRR-\d+/i,
        /PEPACC-\d+/i,
        /HORIZON-/i,
        /C\d{2}-i\d+/i,
        /\d+\/C\d+/i
    ];
    return citationPatterns.some(p => p.test(answer));
}

function calculateCost(inputTokens: number, outputTokens: number, model: string): number {
    const pricing = MODEL_PRICING[model];
    if (!pricing) return 0;
    return ((inputTokens / 1_000_000) * pricing.input) + ((outputTokens / 1_000_000) * pricing.output);
}

// ============= BENCHMARK RUNNER =============

async function runBenchmarkV2(): Promise<void> {
    console.log('\n' + '═'.repeat(70));
    console.log('🚀 BENCHMARK V2: Premium RAG com Dados Reais');
    console.log('═'.repeat(70));

    const genAI = new GoogleGenerativeAI(getApiKey());
    const realData = loadRealData();
    const questions = loadGoldenQuestions();
    const context = buildContext(realData);

    console.log(`\n📊 Dataset: ${realData.summary.total} avisos reais, ${realData.summary.totalDocs} documentos`);
    console.log(`❓ Perguntas: ${questions.length} golden questions`);
    console.log(`🤖 Modelos: ${MODELS_TO_TEST.length} (incluindo Gemini 3.0 Pro)\n`);

    const allResults: ModelResult[] = [];
    const startTime = Date.now();

    for (const modelId of MODELS_TO_TEST) {
        const displayName = MODEL_DISPLAY_NAMES[modelId];
        console.log(`\n${'─'.repeat(50)}`);
        console.log(`📊 Testing: ${displayName}`);
        console.log(`${'─'.repeat(50)}`);

        let model;
        try {
            model = genAI.getGenerativeModel({
                model: modelId,
                generationConfig: GENERATION_CONFIG,
                systemInstruction: SYSTEM_PROMPT,
            });
        } catch (err) {
            console.log(`   ⚠️ ${displayName} não disponível, a saltar...`);
            continue;
        }

        for (const q of questions) {
            try {
                const prompt = `CONTEXTO:\n${context}\n\nPERGUNTA:\n${q.question}`;

                const queryStart = Date.now();
                const result = await model.generateContent(prompt);
                const latencyMs = Date.now() - queryStart;

                const response = result.response;
                const answer = response.text();
                const usage = response.usageMetadata;

                const inputTokens = usage?.promptTokenCount || 0;
                const outputTokens = usage?.candidatesTokenCount || 0;

                const keywordScore = checkKeywords(answer, q.expected_keywords || []);
                const hasCitation = hasCitationInAnswer(answer);

                let refusedCorrectly = true;
                if (q.is_negative_test && q.should_refuse) {
                    refusedCorrectly = answer.toLowerCase().includes('não encontr') ||
                        answer.toLowerCase().includes('não tenho') ||
                        answer.toLowerCase().includes('fora do âmbito');
                }

                allResults.push({
                    model: modelId,
                    modelDisplayName: displayName,
                    questionId: q.id,
                    question: q.question,
                    answer: answer.substring(0, 600) + (answer.length > 600 ? '...' : ''),
                    latencyMs,
                    inputTokens,
                    outputTokens,
                    hasCitation,
                    keywordScore,
                    refusedCorrectly,
                    timestamp: new Date().toISOString()
                });

                // Progress indicator
                const status = keywordScore >= 0.7 ? '✅' : keywordScore >= 0.4 ? '⚠️' : '❌';
                const citationStatus = hasCitation ? '📎' : '  ';
                console.log(`  ${status} ${citationStatus} ${q.id}: ${latencyMs}ms (${(keywordScore * 100).toFixed(0)}%)`);

                // Rate limiting
                await new Promise(resolve => setTimeout(resolve, 600));

            } catch (error: unknown) {
                const msg = error instanceof Error ? error.message : String(error);
                if (msg.includes('404') || msg.includes('not found')) {
                    console.log(`  ⚠️ Modelo ${displayName} não disponível para esta query`);
                } else {
                    console.log(`  ❌ Erro ${q.id}: ${msg.substring(0, 80)}`);
                }
            }
        }
    }

    // Calculate metrics per model
    const metrics: ModelMetrics[] = [];

    for (const modelId of MODELS_TO_TEST) {
        const modelResults = allResults.filter(r => r.model === modelId);
        if (modelResults.length === 0) continue;

        const negativeTests = modelResults.filter(r => {
            const q = questions.find(q => q.id === r.questionId);
            return q?.is_negative_test;
        });

        const totalInputTokens = modelResults.reduce((sum, r) => sum + r.inputTokens, 0);
        const totalOutputTokens = modelResults.reduce((sum, r) => sum + r.outputTokens, 0);
        const cost = calculateCost(totalInputTokens, totalOutputTokens, modelId);

        const avgKeyword = modelResults.reduce((sum, r) => sum + r.keywordScore, 0) / modelResults.length;
        const citationRate = modelResults.filter(r => r.hasCitation).length / modelResults.length;
        const negAccuracy = negativeTests.length > 0
            ? negativeTests.filter(r => r.refusedCorrectly).length / negativeTests.length
            : 1;
        const avgLatency = modelResults.reduce((sum, r) => sum + r.latencyMs, 0) / modelResults.length;

        // Composite score (weighted)
        const maxLatency = Math.max(...allResults.map(r => r.latencyMs)) || 1;
        const maxCost = Math.max(...MODELS_TO_TEST.map(m => MODEL_PRICING[m]?.output || 0)) || 1;

        const overallScore = (
            avgKeyword * 30 +                        // 30% precision
            citationRate * 25 +                      // 25% citations
            negAccuracy * 20 +                       // 20% negative test handling
            (1 - avgLatency / maxLatency) * 15 +     // 15% speed
            (1 - (MODEL_PRICING[modelId]?.output || 0) / maxCost) * 10  // 10% cost
        );

        metrics.push({
            model: modelId,
            displayName: MODEL_DISPLAY_NAMES[modelId],
            totalQuestions: modelResults.length,
            avgLatencyMs: avgLatency,
            avgKeywordScore: avgKeyword,
            citationRate,
            negativeTestAccuracy: negAccuracy,
            estimatedCostUSD: cost,
            totalInputTokens,
            totalOutputTokens,
            overallScore
        });
    }

    // Sort by score
    metrics.sort((a, b) => b.overallScore - a.overallScore);

    // Generate report
    const reportDir = path.join(__dirname, `benchmark-v2-${new Date().toISOString().split('T')[0]}`);
    if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });

    // Save full results
    fs.writeFileSync(
        path.join(reportDir, 'results.json'),
        JSON.stringify({ metrics, results: allResults, timestamp: new Date().toISOString() }, null, 2)
    );

    // Generate markdown report
    let md = `# Benchmark V2: Modelos Gemini para Consultores

> **Data**: ${new Date().toISOString().split('T')[0]}
> **Avisos Reais**: ${realData.summary.total} (PRR: ${realData.prr.length}, PEPAC: ${realData.pepac.length}, Horizon: ${realData.cordis.length})
> **Perguntas**: ${questions.length}

---

## 🏆 Ranking Final

| # | Modelo | Score | Precisão | Citações | Latência | Custo |
|---|--------|-------|----------|----------|----------|-------|
`;

    metrics.forEach((m, i) => {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '  ';
        md += `| ${medal} | **${m.displayName}** | ${m.overallScore.toFixed(1)} | ${(m.avgKeywordScore * 100).toFixed(0)}% | ${(m.citationRate * 100).toFixed(0)}% | ${(m.avgLatencyMs / 1000).toFixed(1)}s | $${m.estimatedCostUSD.toFixed(3)} |\n`;
    });

    if (metrics.length > 0) {
        const winner = metrics[0];
        md += `
---

## 🎯 Recomendação para Consultores

**Modelo Recomendado: ${winner.displayName}**

### Justificação:
- **Precisão**: ${(winner.avgKeywordScore * 100).toFixed(0)}% de keywords encontradas
- **Citações**: ${(winner.citationRate * 100).toFixed(0)}% das respostas citam fontes
- **Velocidade**: ${(winner.avgLatencyMs / 1000).toFixed(1)}s por resposta
- **Custo**: $${winner.estimatedCostUSD.toFixed(4)} por ${winner.totalQuestions} queries

### Para Produção:
\`\`\`typescript
const model = genAI.getGenerativeModel({
    model: '${winner.model}',
    generationConfig: { temperature: 0.1 }
});
\`\`\`
`;
    }

    fs.writeFileSync(path.join(reportDir, 'summary.md'), md);

    // Console output
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log('\n' + '═'.repeat(70));
    console.log('📊 RESULTADOS DO BENCHMARK V2');
    console.log('═'.repeat(70));

    if (metrics.length > 0) {
        console.log('\n🏆 RANKING:');
        metrics.forEach((m, i) => {
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '  ';
            console.log(`${medal} ${m.displayName}: Score ${m.overallScore.toFixed(1)} | ${(m.avgKeywordScore * 100).toFixed(0)}% precisão | ${(m.avgLatencyMs / 1000).toFixed(1)}s`);
        });

        console.log(`\n🎯 RECOMENDAÇÃO: ${metrics[0].displayName}`);
    }

    console.log(`\n💾 Relatório salvo em: ${reportDir}/`);
    console.log(`⏱️ Tempo total: ${totalTime}s`);
}

// Run
runBenchmarkV2()
    .then(() => {
        console.log('\n✨ Benchmark V2 complete!');
        process.exit(0);
    })
    .catch(err => {
        console.error('Fatal error:', err);
        process.exit(1);
    });
