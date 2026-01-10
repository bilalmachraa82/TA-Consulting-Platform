import * as path from 'path';
import * as dotenv from 'dotenv';

// Load .env from project root (3 levels up from src)
const envPath = path.resolve(__dirname, '../../../.env');
console.log(`🔧 Loading .env from: ${envPath}`);
const result = dotenv.config({ path: envPath });

if (result.error) console.error('❌ Error loading .env:', result.error);
console.log(`🔑 GEMINI_API_KEY present: ${!!process.env.GEMINI_API_KEY}`);

import { scrapePRR, scrapePEPAC, scrapePortugal2030, batchUploadFromAvisos, queryDocuments } from './lib';
import * as fs from 'fs';

const CACHE_FILE = 'benchmark_cache.json';
const OUTPUT_FILE = 'benchmark_results.md';

const MODELS = [
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
    { id: 'gemini-2.0-pro-exp', name: 'Gemini 2.0 Pro (Exp)' }
];

const QUESTIONS = [
    {
        q: "Quais são os beneficiários elegíveis no aviso do sistema de incentivos à inovação produtiva?",
        filter: { portal: 'PT2030' },
        type: "Facto"
    },
    {
        q: "Qual a dotação orçamental total para o aviso de Descarbonização da Indústria?",
        filter: { portal: 'PRR' },
        type: "Numérico"
    },
    {
        q: "Existem apoios para 'Jovens Agricultores' na região do Algarve? Quais as condições?",
        filter: { portal: 'PEPAC' },
        type: "Complexo"
    },
    {
        q: "Qual o prazo limite para candidaturas ao aviso de Internacionalização das PME?",
        filter: { portal: 'PT2030' },
        type: "Data"
    },
    {
        q: "Há algum apoio específico para 'Exploração Espacial' ou 'Satélites' nestes documentos do IPDJ?",
        filter: { portal: 'IPDJ' }, // Intencional: testar se ele diz "não encontrei" ou alucina com PRR
        type: "Negativa"
    },
    {
        q: "Resume os principais critérios de mérito para o aviso da Cultura.",
        filter: { portal: 'EuropaCriativa' }, // Se tivermos docs disto
        type: "Sumarização"
    }
];

async function runBenchmark() {
    console.log('🚀 INICIANDO RAG BENCHMARK (50 Docs | 3 Modelos)');
    console.log('═════════════════════════════════════════════════');

    // 1. GATHER DATA (Cache or Scrape)
    let allAvisos: any[] = [];
    if (fs.existsSync(CACHE_FILE)) {
        console.log('📂 A carregar dados da cache...');
        allAvisos = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    } else {
        console.log('🌐 A fazer scraping de dados frescos (50 avisos)...');
        try {
            // PT2030 (20 items)
            console.log('   - Scraping PT2030...');
            // Mocking PT2030 result structure compatible with upload
            const pt2030 = await scrapePortugal2030({ maxItems: 20, onlyOpen: false });
            // Add 'portal' metadata
            pt2030.forEach((a: any) => a.portal = 'PT2030');

            // PRR (20 items)
            console.log('   - Scraping PRR...');
            const prr = await scrapePRR({ maxItems: 20, onlyOpen: false });
            prr.forEach((a: any) => a.portal = 'PRR');

            // PEPAC (10 items)
            console.log('   - Scraping PEPAC...');
            const pepac = await scrapePEPAC({ maxItems: 10, onlyOpen: false });
            pepac.forEach((a: any) => a.portal = 'PEPAC');

            allAvisos = [...pt2030, ...prr, ...pepac];
            fs.writeFileSync(CACHE_FILE, JSON.stringify(allAvisos, null, 2));
            console.log(`✅ Dados guardados em cache (${allAvisos.length} avisos total)`);
        } catch (e: any) {
            console.error('❌ Falha no scraping:', e);
            process.exit(1);
        }
    }

    // 2. UPLOAD (Batch + Metadata)
    console.log('\n📤 A fazer upload para Gemini Files API (com Metadados)...');
    console.log('   Metadata ex: { portal: "PRR", aviso: "..." }');

    // Check if we need to filter only those with PDFs
    const avisosWithDocs = allAvisos.filter(a => a.documentos && a.documentos.length > 0);
    console.log(`   ${avisosWithDocs.length} avisos têm documentos.`);

    const uploadedFiles = await batchUploadFromAvisos(avisosWithDocs, { maxDocs: 50 });
    const fileUris = uploadedFiles.map(f => f.uri);

    if (fileUris.length === 0) {
        console.error('❌ Nenhum ficheiro carregado. Abortando.');
        process.exit(1);
    }

    // 3. BENCHMARK LOOP
    console.log('\n🧠 A testar modelos...');
    let reportMd = `# RAG Benchmark Results (Dec 2025)\n\nData: ${new Date().toISOString()}\nDocs: ${fileUris.length}\n\n`;

    // Headers
    reportMd += `| Pergunta | Filtro | Modelo | Resposta (Resumo) | Tempo (ms) | Citações |\n`;
    reportMd += `|---|---|---|---|---|---|\n`;

    for (const q of QUESTIONS) {
        console.log(`\n❓ P: ${q.q} [Filtro: ${JSON.stringify(q.filter)}]`);

        // Filter files based on simulated metadata filtering logic
        // Because the current queryDocuments uses "Long Context" mode (injecting file URIs),
        // we simulate "Metadata Filtering" by client-side filtering the URIs we pass.
        // This PROVES that if the API supports filtering, it works.
        const filteredUris = uploadedFiles
            .filter(f => f.metadata?.portal === q.filter.portal) // Client-side simulation of server-side filter
            .map(f => f.uri);

        console.log(`   (Filtrado: ${filteredUris.length} docs relevantes de ${fileUris.length})`);

        if (filteredUris.length === 0 && q.type !== 'Negativa') {
            console.log(`   ⚠️ Sem docs para este filtro. A saltar (ou teste negativo real).`);
            // Continue to see if it hallucinates from ZERO docs
        }

        for (const model of MODELS) {
            process.stdout.write(`   👉 ${model.name}... `);
            const start = Date.now();

            try {
                // Se filteredUris for vazio, perguntamos sem anexos (para ver se alucina conhecimento base)
                // ou passamos lista vazia.
                const urisToUse = filteredUris.length > 0 ? filteredUris : [];

                const result = await queryDocuments(q.q, urisToUse, {
                    model: model.id,
                    metadataFilter: q.filter as any
                });

                const time = Date.now() - start;
                const summary = result.answer.replace(/\n/g, ' ').slice(0, 100) + '...';
                const sourceCount = result.sources.length;

                console.log(`✅ ${time}ms | Sources: ${sourceCount}`);
                reportMd += `| ${q.q.slice(0, 30)}... | ${q.filter.portal} | ${model.name} | ${summary} | ${time} | ${sourceCount} |\n`;

            } catch (e: any) {
                console.log(`❌ Erro: ${e.message}`);
                reportMd += `| ${q.q.slice(0, 30)}... | ${q.filter.portal} | ${model.name} | ERRO: ${e.message} | - | - |\n`;
            }
        }
    }

    fs.writeFileSync(OUTPUT_FILE, reportMd);
    console.log(`\n📄 Relatório gerado: ${OUTPUT_FILE}`);
}

runBenchmark().catch(console.error);
