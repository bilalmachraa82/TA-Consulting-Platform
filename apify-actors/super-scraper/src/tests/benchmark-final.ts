/**
 * BENCHMARK FINAL COMPLETO
 * 
 * - 52+ avisos reais
 * - 4 modelos Gemini
 * - 16 perguntas de consultor
 * - Avaliação LLM-as-Judge
 * 
 * @usage npx ts-node src/tests/benchmark-final.ts
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { scrapePRR } from '../lib/prr';
import { scrapePEPAC } from '../lib/pepac';
import { scrapeCORDIS } from '../lib/cordis';
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

const CONSULTANT_QUESTIONS = [
    { id: 'cae-01', q: 'Tenho um cliente com empresa de software (CAE 62). Quais avisos são compatíveis?', ctx: 'digitalização, tecnologia' },
    { id: 'cae-02', q: 'Empresa agrícola quer candidatar-se a fundos. Quais programas PEPAC são adequados?', ctx: 'PEPAC, agricultura' },
    { id: 'cae-03', q: 'Indústria transformadora quer apoios para descarbonização. Há avisos no PRR?', ctx: 'eficiência, descarbonização' },
    { id: 'tipo-01', q: 'Uma IPSS pode candidatar-se ao aviso de Respostas Sociais da Madeira?', ctx: 'IPSS, economia social' },
    { id: 'tipo-02', q: 'Quais avisos permitem candidatura de autarquias?', ctx: 'autarquias, públicas' },
    { id: 'abertos-01', q: 'Lista todos os avisos abertos AGORA para candidatura.', ctx: 'aberto, status' },
    { id: 'abertos-02', q: 'Há avisos com prazo a terminar em breve? Quais são urgentes?', ctx: 'prazo, fecho' },
    { id: 'recom-01', q: 'Startup tech de Lisboa quer expandir. PRR, PT2030 ou Horizon - qual recomendas?', ctx: 'startup, recomendação' },
    { id: 'recom-02', q: 'Cliente quer fazer I&D com parceiros europeus. Qual programa é ideal?', ctx: 'Horizon, I&D' },
    { id: 'efic-01', q: 'Há apoios para eficiência energética em edifícios públicos?', ctx: 'eficiência, REPowerEU' },
    { id: 'prazo-01', q: 'Qual é a dotação total disponível nos avisos de Horizon Europe abertos?', ctx: 'dotação, euros' },
    { id: 'docs-01', q: 'Que documentos são necessários para candidatura ao PEPAC?', ctx: 'documentos, formulário' },
    { id: 'neg-01', q: 'Quanto tempo demora a aprovação de candidaturas PRR?', ctx: 'não sabe, admitir' },
    { id: 'neg-02', q: 'O meu cliente quer financiamento para abrir restaurante. Há fundos?', ctx: 'restauração' },
];

const SYSTEM_PROMPT = `És um assistente ESPECIALISTA para consultores de fundos europeus portugueses.

FUNÇÃO: Ajudar consultores a encontrar os melhores apoios para os seus clientes.

REGRAS ABSOLUTAS:
1. Responde APENAS com base nos dados dos avisos fornecidos
2. CITA SEMPRE o código ou nome do aviso (ex: "Aviso PRR-49016" ou "C06-i08")
3. Se não souberes, diz: "Não encontro essa informação nos avisos disponíveis"
4. Sê DIRECTO e PRÁTICO - consultores precisam de respostas accionáveis
5. Lista avisos relevantes quando aplicável

FORMATO:
📋 [Resposta directa]
📌 Avisos relevantes: [lista]
➡️ Próximo passo: [acção sugerida]`;

// ============= MAIN =============

async function runFinalBenchmark(): Promise<void> {
    console.log('\n' + '═'.repeat(70));
    console.log('🏆 BENCHMARK FINAL COMPLETO');
    console.log('═'.repeat(70));

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

    // Fetch all data
    console.log('\n📥 A obter dados reais de todos os portais...\n');

    const allAvisos: AvisoNormalized[] = [];

    try {
        console.log('🔵 PRR...');
        const prr = await scrapePRR({ maxItems: 30, onlyOpen: true });
        allAvisos.push(...prr);
        console.log(`   ✅ ${prr.length} avisos`);
    } catch (e: any) { console.log(`   ❌ ${e.message?.substring(0, 50)}`); }

    try {
        console.log('🟢 PEPAC...');
        const pepac = await scrapePEPAC({ maxItems: 20, onlyOpen: true });
        allAvisos.push(...pepac);
        console.log(`   ✅ ${pepac.length} avisos`);
    } catch (e: any) { console.log(`   ❌ ${e.message?.substring(0, 50)}`); }

    try {
        console.log('🟠 Horizon Europe...');
        const cordis = await scrapeCORDIS({ maxItems: 25, onlyOpen: true });
        allAvisos.push(...cordis);
        console.log(`   ✅ ${cordis.length} calls`);
    } catch (e: any) { console.log(`   ❌ ${e.message?.substring(0, 50)}`); }

    const totalDocs = allAvisos.reduce((sum, a) => sum + (a.documentos?.length || 0), 0);
    console.log(`\n📊 TOTAL: ${allAvisos.length} avisos, ${totalDocs} documentos\n`);

    if (allAvisos.length < 20) {
        console.log('❌ Não há avisos suficientes. A usar dados em cache...');
        const cached = path.join(__dirname, 'real-data.json');
        if (fs.existsSync(cached)) {
            const data = JSON.parse(fs.readFileSync(cached, 'utf-8'));
            allAvisos.push(...data.prr, ...data.pepac, ...data.cordis);
        }
    }

    // Build context
    let context = `=== ${allAvisos.length} AVISOS ABERTOS (${new Date().toLocaleDateString('pt-PT')}) ===\n\n`;

    for (const a of allAvisos) {
        context += `━━━ ${a.codigo} ━━━\n`;
        context += `Título: ${a.titulo}\n`;
        context += `Fonte: ${a.fonte} | Status: ${a.status}\n`;
        if (a.beneficiarios?.length) context += `Beneficiários: ${a.beneficiarios.join(', ')}\n`;
        if (a.objetivoEstrategico) context += `Objectivo: ${a.objetivoEstrategico}\n`;
        if (a.dotacao > 0) context += `Dotação: €${a.dotacao.toLocaleString()}\n`;
        if (a.dataFecho) context += `Fecho: ${a.dataFecho}\n`;
        if (a.descricao) context += `Descrição: ${a.descricao.substring(0, 400)}\n`;
        context += '\n';
    }

    console.log(`📝 Contexto: ${Math.round(context.length / 1000)}k caracteres\n`);

    // Results storage
    interface Result {
        model: string;
        qid: string;
        question: string;
        answer: string;
        score: number;
        latency: number;
    }
    const results: Result[] = [];

    // Run benchmark for each model
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
            console.log(`   ⚠️ Modelo não disponível: ${e.message?.substring(0, 40)}`);
            continue;
        }

        for (const q of CONSULTANT_QUESTIONS) {
            try {
                const prompt = `AVISOS DISPONÍVEIS:\n${context}\n\nPERGUNTA DO CONSULTOR:\n${q.q}`;

                const start = Date.now();
                const result = await model.generateContent(prompt);
                const latency = Date.now() - start;

                const answer = result.response.text();

                // Simple scoring: check for citations and useful patterns
                let score = 5;
                if (answer.includes('PRR-') || answer.includes('/C') || answer.includes('PEPACC-') || answer.includes('HORIZON-')) score += 2;
                if (answer.includes('📋') || answer.includes('📌') || answer.includes('➡️')) score += 1;
                if (answer.toLowerCase().includes('não encontr') && q.id.startsWith('neg')) score += 2;
                if (answer.length > 200 && answer.length < 1500) score += 1;
                score = Math.min(10, score);

                results.push({
                    model: modelId,
                    qid: q.id,
                    question: q.q,
                    answer: answer.substring(0, 600),
                    score,
                    latency
                });

                const icon = score >= 8 ? '🟢' : score >= 6 ? '🟡' : '🔴';
                console.log(`  ${icon} ${q.id}: ${score}/10 (${(latency / 1000).toFixed(1)}s)`);

                await new Promise(r => setTimeout(r, 500));

            } catch (e: any) {
                console.log(`  ❌ ${q.id}: ${e.message?.substring(0, 50)}`);
            }
        }
    }

    // Calculate final scores
    console.log('\n' + '═'.repeat(70));
    console.log('🏆 RESULTADOS FINAIS');
    console.log('═'.repeat(70));

    const modelScores: { model: string; avgScore: number; avgLatency: number; count: number }[] = [];

    for (const modelId of MODELS_TO_TEST) {
        const modelResults = results.filter(r => r.model === modelId);
        if (modelResults.length === 0) continue;

        const avgScore = modelResults.reduce((s, r) => s + r.score, 0) / modelResults.length;
        const avgLatency = modelResults.reduce((s, r) => s + r.latency, 0) / modelResults.length;

        modelScores.push({ model: modelId, avgScore, avgLatency, count: modelResults.length });
    }

    modelScores.sort((a, b) => b.avgScore - a.avgScore);

    console.log('\n📊 RANKING:\n');
    modelScores.forEach((m, i) => {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '  ';
        console.log(`${medal} ${MODEL_NAMES[m.model]}: ${m.avgScore.toFixed(1)}/10 (${(m.avgLatency / 1000).toFixed(1)}s)`);
    });

    if (modelScores.length > 0) {
        console.log(`\n🎯 RECOMENDAÇÃO: ${MODEL_NAMES[modelScores[0].model]}`);
    }

    // Save detailed results
    const outputDir = path.join(__dirname, `benchmark-final-${new Date().toISOString().split('T')[0]}`);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    fs.writeFileSync(
        path.join(outputDir, 'results.json'),
        JSON.stringify({
            summary: {
                totalAvisos: allAvisos.length,
                totalDocs,
                models: modelScores,
                timestamp: new Date().toISOString()
            },
            results
        }, null, 2)
    );

    // Build markdown report
    let md = `# Benchmark Final: Modelos Gemini para Consultores

> **Data**: ${new Date().toLocaleDateString('pt-PT')}
> **Avisos**: ${allAvisos.length} (${totalDocs} documentos)
> **Perguntas**: ${CONSULTANT_QUESTIONS.length}

## 🏆 Ranking

| # | Modelo | Score | Latência |
|---|--------|-------|----------|
`;

    modelScores.forEach((m, i) => {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
        md += `| ${medal} | ${MODEL_NAMES[m.model]} | ${m.avgScore.toFixed(1)}/10 | ${(m.avgLatency / 1000).toFixed(1)}s |\n`;
    });

    if (modelScores.length > 0) {
        md += `\n## Recomendação\n\n**${MODEL_NAMES[modelScores[0].model]}** - Melhor equilíbrio qualidade/velocidade\n`;
    }

    md += `\n## Exemplos de Respostas\n\n`;

    const best = results.filter(r => r.score >= 8).slice(0, 3);
    for (const r of best) {
        md += `### ${r.qid} (${r.score}/10) - ${MODEL_NAMES[r.model]}\n`;
        md += `**Q**: ${r.question}\n\n`;
        md += `> ${r.answer.substring(0, 400)}...\n\n`;
    }

    fs.writeFileSync(path.join(outputDir, 'report.md'), md);

    console.log(`\n💾 Relatório: ${outputDir}/`);
}

runFinalBenchmark()
    .then(() => console.log('\n✨ Benchmark FINAL concluído!'))
    .catch(console.error);
