/**
 * Benchmark: Gemini File Search (Stores + metadata_filter + citations)
 *
 * - 6 portais (PT2030, PRR, PEPAC, Horizon, Europa Criativa, IPDJ)
 * - ~50 ficheiros reais (PDF/DOCX/HTML extraído)
 * - 3 modelos: gemini-2.5-flash, gemini-2.5-pro, gemini-3-pro-preview
 *
 * @usage npx ts-node src/tests/benchmark-file-search.ts
 *
 * Env:
 * - GEMINI_API_KEY
 *
 * Optional env:
 * - BENCH_STAGE=all|dataset|ingest|run|report
 * - BENCH_OUTPUT_DIR=/path/to/output (para resumir)
 * - BENCH_STORE_NAME=fileSearchStores/... (para reutilizar store)
 * - BENCH_MAX_FILES=50
 * - BENCH_KEEP_STORE=1
 * - BENCH_EVAL=1 (default) | BENCH_EVAL=0
 */

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

import {
    scrapePRR,
    scrapePEPAC,
    scrapeCORDIS,
    scrapePortugal2030,
    scrapeEuropaCriativa,
    scrapeIPDJ,
    stripHtml,
    decodeHtmlEntities,
    createFileSearchStore,
    deleteFileSearchStore,
    uploadLocalFileToGeminiFilesApi,
    waitForGeminiFileActive,
    importFileToSearchStore,
    waitForOperationDone,
    generateContentWithFileSearch,
    requireGeminiApiKey,
    guessMimeType,
    type CustomMetadataValue,
    type GenerateWithFileSearchResult,
} from '../lib';
import { AvisoNormalized } from '../lib/types';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

type PortalCode = 'PT2030' | 'PRR' | 'PEPAC' | 'HORIZON' | 'EUROPA_CRIATIVA' | 'IPDJ';

type DatasetFileKind = 'aviso_md' | 'attachment';

interface DatasetFile {
    kind: DatasetFileKind;
    portal: PortalCode;
    avisoId: string;
    avisoCodigo: string;
    displayName: string;
    localPath: string;
    sourceUrl: string;
    mimeType: string;
    customMetadata: CustomMetadataValue[];
}

interface DatasetBuildResult {
    selectedAvisos: Record<PortalCode, AvisoNormalized[]>;
    files: DatasetFile[];
    totalFiles: number;
    createdAt: string;
}

interface TestCase {
    id: string;
    category: string;
    question: string;
    portalFilter?: PortalCode; // used to build metadata_filter
    expectedCodes?: string[];
    shouldRefuse?: boolean;
    shouldAdmitUnknown?: boolean;
}

interface EvalResult {
    useful: number;
    grounded: number;
    honest: number;
    clarity: number;
    hallucinationRisk: number;
    overall: number;
    reasoning: string;
}

interface RunResult {
    model: string;
    testCaseId: string;
    question: string;
    portalFilter?: PortalCode;
    metadataFilter?: string;
    answer: string;
    latencyMs: number;
    usage: GenerateWithFileSearchResult['usage'];
    citations: GenerateWithFileSearchResult['citations'];
    inferredCitedPortals: PortalCode[];
    portalLeakage: boolean;
    expectedCodesScore?: number;
    eval?: EvalResult;
    error?: string;
    timestamp: string;
}

const MODELS_TO_TEST = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-3-pro-preview'] as const;

// Pricing (USD per 1M tokens) – ai.google.dev pricing page (Dec 2025)
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
    'gemini-2.5-flash': { input: 0.30, output: 2.50 },
    'gemini-2.5-pro': { input: 1.25, output: 10.00 },
    'gemini-3-pro-preview': { input: 2.00, output: 12.00 },
};

const SYSTEM_PROMPT = `És um assistente para CONSULTORES de fundos (Portugal).

REGRAS CRÍTICAS (anti-alucinação):
1) Responde APENAS com base em informação encontrada nos documentos recuperados pelo File Search.
2) Se não encontrares a informação, diz explicitamente: "Não encontrei essa informação nas fontes disponíveis para este filtro."
3) Não inventes datas, percentagens, montantes, CAE elegível, prazos, beneficiários ou requisitos.
4) Quando fizer sentido, dá próximos passos práticos (checklist) para o consultor.
5) Se a pergunta é genérica (ex: "melhor fundo"), faz perguntas de clarificação antes de concluir.`;

const MAX_FILES = parseInt(process.env.BENCH_MAX_FILES || '50', 10) || 50;
const KEEP_STORE = process.env.BENCH_KEEP_STORE === '1';
const ENABLE_EVAL = process.env.BENCH_EVAL !== '0';
const EVALUATOR_MODEL = 'gemini-2.5-flash';
const STAGE = String(process.env.BENCH_STAGE || 'all').toLowerCase();
const OUTPUT_DIR_ENV = process.env.BENCH_OUTPUT_DIR;
const STORE_NAME_ENV = process.env.BENCH_STORE_NAME;

const BYTES_100_MB = 100 * 1024 * 1024;

async function main(): Promise<void> {
    requireGeminiApiKey();

    const allowedStages = new Set(['all', 'dataset', 'ingest', 'run', 'report']);
    if (!allowedStages.has(STAGE)) {
        throw new Error(`BENCH_STAGE inválido: "${STAGE}" (usar all|dataset|ingest|run|report)`);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputDir = OUTPUT_DIR_ENV
        ? path.resolve(OUTPUT_DIR_ENV)
        : path.join(__dirname, `benchmark-file-search-${timestamp}`);

    fs.mkdirSync(outputDir, { recursive: true });
    const datasetDir = path.join(outputDir, 'dataset');
    fs.mkdirSync(datasetDir, { recursive: true });

    const datasetManifestPath = path.join(outputDir, 'dataset-manifest.json');
    const ingestStatePath = path.join(outputDir, 'ingest.json');
    const questionsPath = path.join(outputDir, 'questions.json');
    const resultsJsonlPath = path.join(outputDir, 'results.jsonl');
    const resultsJsonPath = path.join(outputDir, 'results.json');
    const summaryPath = path.join(outputDir, 'summary.md');

    console.log('\n' + '═'.repeat(70));
    console.log('🔎 BENCHMARK: Gemini File Search (50 ficheiros, 6 portais, 3 modelos)');
    console.log('═'.repeat(70));
    console.log(`📁 Output: ${outputDir}`);
    console.log(`🧭 Stage: ${STAGE}`);
    console.log(`📦 Dataset target: ${MAX_FILES} ficheiros`);
    console.log(`🧪 Avaliação LLM-as-judge: ${ENABLE_EVAL ? 'ON' : 'OFF'}`);

    // ─────────────────────────────────────────────────────────────────────────
    // Stage: DATASET
    // ─────────────────────────────────────────────────────────────────────────
    let dataset: DatasetBuildResult;
    if (STAGE === 'all' || STAGE === 'dataset') {
        const scraped = await scrapeAllPortals();
        dataset = await buildDatasetFiles(scraped, datasetDir, MAX_FILES);
        writeJson(datasetManifestPath, dataset);
        console.log(`\n💾 Dataset manifest: ${datasetManifestPath}`);
    } else {
        dataset = readJson<DatasetBuildResult>(datasetManifestPath);
        console.log(`\n📦 Reusing dataset manifest: ${datasetManifestPath}`);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Stage: INGEST (upload/import)
    // ─────────────────────────────────────────────────────────────────────────
    if (STAGE === 'all' || STAGE === 'ingest') {
        const existing = fs.existsSync(ingestStatePath) ? readJson<IngestState>(ingestStatePath) : null;
        const storeName = STORE_NAME_ENV || existing?.storeName;

        const ingestState: IngestState = existing || {
            storeName: '',
            createdAt: new Date().toISOString(),
            imports: [],
            errors: [],
        };

        if (!storeName) {
            console.log('\n🗄️  Criando File Search Store...');
            const store = await createFileSearchStore(`ta-bench-file-search-${timestamp}`.slice(0, 60));
            ingestState.storeName = store.name;
            console.log(`   ✅ Store: ${store.name}`);
            writeJson(ingestStatePath, ingestState);
        } else {
            ingestState.storeName = storeName;
            console.log(`\n🗄️  Reusing Store: ${storeName}`);
            writeJson(ingestStatePath, ingestState);
        }

        console.log('\n📤 Upload + import de ficheiros no Store...');
        const doneByDisplayName = new Set(ingestState.imports.map(i => i.displayName));

        for (let i = 0; i < dataset.files.length; i++) {
            const f = dataset.files[i];
            if (doneByDisplayName.has(f.displayName)) {
                process.stdout.write(`   [${i + 1}/${dataset.files.length}] ${f.displayName} ... ⏭️\n`);
                continue;
            }

            try {
                process.stdout.write(`   [${i + 1}/${dataset.files.length}] ${f.displayName} ... `);
                const uploaded = await uploadLocalFileToGeminiFilesApi(f.localPath, f.displayName, f.mimeType);
                await waitForGeminiFileActive(uploaded.name);

                const op = await importFileToSearchStore(ingestState.storeName, uploaded.name, f.customMetadata);
                await waitForOperationDone(op.name);

                ingestState.imports.push({
                    displayName: f.displayName,
                    fileName: uploaded.name,
                    portal: f.portal,
                    avisoId: f.avisoId,
                    avisoCodigo: f.avisoCodigo,
                    kind: f.kind,
                    localPath: f.localPath,
                    sourceUrl: f.sourceUrl,
                    importedAt: new Date().toISOString(),
                });
                doneByDisplayName.add(f.displayName);
                writeJson(ingestStatePath, ingestState);
                process.stdout.write('✅\n');

                await new Promise(r => setTimeout(r, 200));
            } catch (e: any) {
                ingestState.errors.push({
                    displayName: f.displayName,
                    message: e.message || String(e),
                    at: new Date().toISOString(),
                });
                writeJson(ingestStatePath, ingestState);
                process.stdout.write(`❌ ${e.message}\n`);
            }
        }

        console.log(`\n💾 Ingest state: ${ingestStatePath}`);

        // Do not auto-delete store in ingest-only runs (it will be needed for the run stage).
        if (STAGE === 'ingest' && !KEEP_STORE) {
            console.log(`\n🗄️  Store mantido (necessário para BENCH_STAGE=run): ${ingestState.storeName}`);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Stage: RUN (queries + optional judge)
    // ─────────────────────────────────────────────────────────────────────────
    if (STAGE === 'all' || STAGE === 'run') {
        const ingestState = readJson<IngestState>(ingestStatePath);
        const storeName = STORE_NAME_ENV || ingestState.storeName;
        if (!storeName) throw new Error('Missing storeName (set BENCH_STORE_NAME or run BENCH_STAGE=ingest first)');

        const uploadedMap: Record<string, { portal: PortalCode; displayName: string }> = {};
        for (const imp of ingestState.imports) {
            uploadedMap[imp.fileName] = { portal: imp.portal, displayName: imp.displayName };
        }

        const testCases = fs.existsSync(questionsPath)
            ? readJson<{ testCases: TestCase[] }>(questionsPath).testCases
            : buildConsultantTestCases(dataset.selectedAvisos);
        if (!fs.existsSync(questionsPath)) {
            writeJson(questionsPath, { testCases, createdAt: new Date().toISOString() });
        }

        console.log('\n🚀 Executando benchmark (queries com File Search)...');

        const { existingResults, doneKeys } = loadExistingResults(resultsJsonlPath);
        const results: RunResult[] = [...existingResults];

        for (const model of MODELS_TO_TEST) {
            console.log(`\n🤖 Modelo: ${model}`);

            for (const tc of testCases) {
                const key = `${model}::${tc.id}`;
                if (doneKeys.has(key)) {
                    console.log(`   ⏭️ ${tc.id}: already done`);
                    continue;
                }

                const metadataFilter = tc.portalFilter ? `portal = "${tc.portalFilter}"` : undefined;
                const prompt = `${SYSTEM_PROMPT}\n\nPERGUNTA:\n${tc.question}`;

                const start = Date.now();
                try {
                    const resp = await generateContentWithFileSearch({
                        model,
                        prompt,
                        storeName,
                        metadataFilter,
                        temperature: 0.1,
                        maxOutputTokens: 900,
                    });
                    const latencyMs = Date.now() - start;

                    const inferredCitedPortals = inferPortalsFromCitations(resp, uploadedMap);
                    const portalLeakage = Boolean(
                        tc.portalFilter &&
                        inferredCitedPortals.length > 0 &&
                        inferredCitedPortals.some(p => p !== tc.portalFilter)
                    );

                    const expectedCodesScore = tc.expectedCodes
                        ? scoreExpectedCodes(resp.text, tc.expectedCodes)
                        : undefined;

                    const baseResult: RunResult = {
                        model,
                        testCaseId: tc.id,
                        question: tc.question,
                        portalFilter: tc.portalFilter,
                        metadataFilter,
                        answer: resp.text,
                        latencyMs,
                        usage: resp.usage,
                        citations: resp.citations,
                        inferredCitedPortals,
                        portalLeakage,
                        expectedCodesScore,
                        timestamp: new Date().toISOString(),
                    };

                    if (ENABLE_EVAL) {
                        baseResult.eval = await evaluateAnswer(tc, baseResult, resp);
                    }

                    results.push(baseResult);
                    appendJsonl(resultsJsonlPath, baseResult);
                    doneKeys.add(key);

                    const citationIcon = resp.citations.citationCount > 0 ? '📌' : '⚠️';
                    const leakIcon = portalLeakage ? '🧨' : '✅';
                    console.log(
                        `   ${citationIcon} ${leakIcon} ${tc.id}: ${(latencyMs / 1000).toFixed(1)}s` +
                        (expectedCodesScore !== undefined ? ` | codes ${(expectedCodesScore * 100).toFixed(0)}%` : '') +
                        (baseResult.eval ? ` | score ${baseResult.eval.overall.toFixed(1)}/10` : '')
                    );

                    await new Promise(r => setTimeout(r, 800));
                } catch (e: any) {
                    const latencyMs = Date.now() - start;
                    const failure: RunResult = {
                        model,
                        testCaseId: tc.id,
                        question: tc.question,
                        portalFilter: tc.portalFilter,
                        metadataFilter,
                        answer: '',
                        latencyMs,
                        usage: { promptTokenCount: 0, candidatesTokenCount: 0, totalTokenCount: 0 },
                        citations: { citationCount: 0, citedSources: [] },
                        inferredCitedPortals: [],
                        portalLeakage: false,
                        timestamp: new Date().toISOString(),
                        error: e.message || String(e),
                    };
                    results.push(failure);
                    appendJsonl(resultsJsonlPath, failure);
                    doneKeys.add(key);
                    console.log(`   ❌ ${tc.id}: ${e.message || e}`);
                }
            }
        }

        writeJson(resultsJsonPath, { results, createdAt: new Date().toISOString(), storeName });

        const summary = buildSummary(results);
        fs.writeFileSync(summaryPath, summary);
        console.log(`\n📄 Summary: ${summaryPath}`);

        // Cleanup store only after the run stage (not during ingest-only).
        if (!KEEP_STORE && (STAGE === 'all' || STAGE === 'run')) {
            console.log('\n🧹 A apagar File Search Store...');
            try {
                await deleteFileSearchStore(storeName);
                console.log('   ✅ Store apagado');
            } catch (e: any) {
                console.log(`   ⚠️ Falha a apagar store: ${e.message}`);
            }
        } else {
            console.log(`\n🗄️  Store mantido: ${storeName}`);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Stage: REPORT (rebuild summary from existing results)
    // ─────────────────────────────────────────────────────────────────────────
    if (STAGE === 'report') {
        const ingestState = fs.existsSync(ingestStatePath) ? readJson<IngestState>(ingestStatePath) : null;
        const uploadedMap: Record<string, { portal: PortalCode; displayName: string }> = {};
        if (ingestState) {
            for (const imp of ingestState.imports) {
                uploadedMap[imp.fileName] = { portal: imp.portal, displayName: imp.displayName };
            }
        }

        const results = fs.existsSync(resultsJsonPath)
            ? readJson<{ results: RunResult[] }>(resultsJsonPath).results
            : loadExistingResults(resultsJsonlPath).existingResults;

        // Recompute leakage + (optional) evaluator scores.
        for (const r of results) {
            if (!r.error && r.citations?.citedSources?.length && ingestState) {
                const inferred = inferPortalsFromCitations({ citations: r.citations } as any, uploadedMap);
                r.inferredCitedPortals = inferred;
                r.portalLeakage = Boolean(
                    r.portalFilter &&
                    inferred.length > 0 &&
                    inferred.some(p => p !== r.portalFilter)
                );
            }

            if (ENABLE_EVAL && !r.error && (!r.eval || r.eval.reasoning === 'Fallback')) {
                const tc: TestCase = {
                    id: r.testCaseId,
                    category: 'report',
                    question: r.question,
                    portalFilter: r.portalFilter,
                };
                r.eval = await evaluateAnswer(tc, r, { citations: r.citations } as any);
            }
        }

        writeJson(resultsJsonPath, {
            results,
            createdAt: new Date().toISOString(),
            storeName: ingestState?.storeName,
        });
        writeJsonl(resultsJsonlPath, results);

        const summary = buildSummary(results);
        fs.writeFileSync(summaryPath, summary);
        console.log(`\n📄 Summary rebuilt (and results updated): ${summaryPath}`);
    }
}

interface IngestState {
    storeName: string;
    createdAt: string;
    imports: Array<{
        displayName: string;
        fileName: string; // files/...
        portal: PortalCode;
        avisoId: string;
        avisoCodigo: string;
        kind: DatasetFileKind;
        localPath: string;
        sourceUrl: string;
        importedAt: string;
    }>;
    errors: Array<{ displayName: string; message: string; at: string }>;
}

function readJson<T>(filePath: string): T {
    if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${filePath}`);
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
}

function writeJson(filePath: string, data: unknown): void {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function appendJsonl(filePath: string, data: unknown): void {
    fs.appendFileSync(filePath, JSON.stringify(data) + '\n');
}

function writeJsonl(filePath: string, items: unknown[]): void {
    const lines = items.map(item => JSON.stringify(item)).join('\n');
    fs.writeFileSync(filePath, lines.length > 0 ? `${lines}\n` : '');
}

function loadExistingResults(resultsJsonlPath: string): { existingResults: RunResult[]; doneKeys: Set<string> } {
    const existingResults: RunResult[] = [];
    const doneKeys = new Set<string>();

    if (!fs.existsSync(resultsJsonlPath)) return { existingResults, doneKeys };

    const lines = fs.readFileSync(resultsJsonlPath, 'utf-8').split('\n').filter(Boolean);
    for (const line of lines) {
        try {
            const r = JSON.parse(line) as RunResult;
            existingResults.push(r);
            doneKeys.add(`${r.model}::${r.testCaseId}`);
        } catch {
            // ignore malformed
        }
    }

    return { existingResults, doneKeys };
}

async function scrapeAllPortals(): Promise<Record<PortalCode, AvisoNormalized[]>> {
    console.log('\n🌐 A obter avisos reais dos 6 portais...');
    console.log('─'.repeat(60));

    const out: Record<PortalCode, AvisoNormalized[]> = {
        PT2030: [],
        PRR: [],
        PEPAC: [],
        HORIZON: [],
        EUROPA_CRIATIVA: [],
        IPDJ: [],
    };

    try {
        out.PT2030 = await scrapePortugal2030({ maxItems: 50, onlyOpen: true });
    } catch (e: any) {
        console.log(`   ⚠️ PT2030 erro: ${e.message}`);
    }

    try {
        out.PRR = await scrapePRR({ maxItems: 50, onlyOpen: true });
    } catch (e: any) {
        console.log(`   ⚠️ PRR erro: ${e.message}`);
    }

    try {
        out.PEPAC = await scrapePEPAC({ maxItems: 50, onlyOpen: true });
    } catch (e: any) {
        console.log(`   ⚠️ PEPAC erro: ${e.message}`);
    }

    try {
        out.HORIZON = await scrapeCORDIS({ maxItems: 50, onlyOpen: true });
    } catch (e: any) {
        console.log(`   ⚠️ HORIZON erro: ${e.message}`);
    }

    try {
        out.EUROPA_CRIATIVA = await scrapeEuropaCriativa({ maxItems: 50, onlyOpen: true });
    } catch (e: any) {
        console.log(`   ⚠️ EUROPA_CRIATIVA erro: ${e.message}`);
    }

    try {
        out.IPDJ = await scrapeIPDJ({ maxItems: 50, onlyOpen: true });
    } catch (e: any) {
        console.log(`   ⚠️ IPDJ erro: ${e.message}`);
    }

    for (const [portal, avisos] of Object.entries(out)) {
        console.log(`   ✅ ${portal}: ${avisos.length} itens`);
    }

    return out;
}

async function buildDatasetFiles(
    scraped: Record<PortalCode, AvisoNormalized[]>,
    datasetDir: string,
    maxFiles: number
): Promise<DatasetBuildResult> {
    console.log('\n📦 A construir dataset local...');

    const selectedAvisos: Record<PortalCode, AvisoNormalized[]> = {
        PT2030: pickAvisos(scraped.PT2030, 5),
        PRR: pickAvisosPreferDocs(scraped.PRR, 5),
        PEPAC: pickAvisosPreferDocs(scraped.PEPAC, 5),
        HORIZON: pickAvisos(scraped.HORIZON, 5),
        EUROPA_CRIATIVA: pickAvisos(scraped.EUROPA_CRIATIVA, 5),
        IPDJ: pickAvisosPreferDocs(scraped.IPDJ, 5),
    };

    // Start with the selected set; if not enough to reach ~50 files, we will top up.
    const files: DatasetFile[] = [];

    // Create one index file for listing/open questions.
    const indexMd = buildDatasetIndexMd(selectedAvisos);
    const indexPath = path.join(datasetDir, 'dataset-index.md');
    fs.writeFileSync(indexPath, indexMd);

    files.push({
        kind: 'aviso_md',
        portal: 'PT2030', // arbitrary (no filter needed); still attach metadata for completeness
        avisoId: 'INDEX',
        avisoCodigo: 'INDEX',
        displayName: `INDEX__dataset-index.md`,
        localPath: indexPath,
        sourceUrl: 'local://dataset-index',
        mimeType: guessMimeType(indexPath),
        customMetadata: [
            { key: 'portal', stringValue: 'INDEX' },
            { key: 'docType', stringValue: 'dataset_index' },
        ],
    });

    // Build per-aviso files (md + best attachment if present)
    for (const [portal, avisos] of Object.entries(selectedAvisos) as Array<[PortalCode, AvisoNormalized[]]>) {
        for (const aviso of avisos) {
            if (files.length >= maxFiles) break;

            const mdPath = path.join(datasetDir, `${portal}__${sanitize(aviso.codigo)}__aviso.md`);
            fs.writeFileSync(mdPath, buildAvisoMd(portal, aviso));

            files.push(createDatasetFileFromLocal({
                kind: 'aviso_md',
                portal,
                aviso,
                localPath: mdPath,
                sourceUrl: aviso.url,
            }));

            if (files.length >= maxFiles) break;

            const best = pickBestDocument(aviso);
            if (best) {
                const downloaded = await downloadDocument(best.url, datasetDir, `${portal}__${sanitize(aviso.codigo)}__${sanitize(best.nome)}`);
                if (downloaded) {
                    files.push({
                        kind: 'attachment',
                        portal,
                        avisoId: aviso.id,
                        avisoCodigo: aviso.codigo,
                        displayName: path.basename(downloaded.localPath),
                        localPath: downloaded.localPath,
                        sourceUrl: best.url,
                        mimeType: downloaded.mimeType,
                        customMetadata: buildMetadata(portal, aviso, 'attachment', best.url),
                    });
                }
            }
        }
    }

    // Top up if still below maxFiles: add more attachments from the portals with docs (PRR/PEPAC/PT2030/IPDJ)
    if (files.length < maxFiles) {
        const portalsToTopUp: PortalCode[] = ['PRR', 'PEPAC', 'PT2030', 'IPDJ'];
        for (const portal of portalsToTopUp) {
            const candidates = scraped[portal] || [];
            for (const aviso of candidates) {
                if (files.length >= maxFiles) break;
                const already = files.some(f => f.avisoId === aviso.id && f.kind === 'attachment');
                if (already) continue;
                const best = pickBestDocument(aviso);
                if (!best) continue;

                const downloaded = await downloadDocument(best.url, datasetDir, `${portal}__${sanitize(aviso.codigo)}__${sanitize(best.nome)}`);
                if (!downloaded) continue;

                files.push({
                    kind: 'attachment',
                    portal,
                    avisoId: aviso.id,
                    avisoCodigo: aviso.codigo,
                    displayName: path.basename(downloaded.localPath),
                    localPath: downloaded.localPath,
                    sourceUrl: best.url,
                    mimeType: downloaded.mimeType,
                    customMetadata: buildMetadata(portal, aviso, 'attachment', best.url),
                });
            }
        }
    }

    // Trim if over budget
    const trimmed = files.slice(0, maxFiles);
    console.log(`   ✅ Dataset: ${trimmed.length}/${maxFiles} ficheiros`);

    return {
        selectedAvisos,
        files: trimmed,
        totalFiles: trimmed.length,
        createdAt: new Date().toISOString(),
    };
}

function pickAvisos(avisos: AvisoNormalized[], max: number): AvisoNormalized[] {
    return avisos.slice(0, Math.min(max, avisos.length));
}

function pickAvisosPreferDocs(avisos: AvisoNormalized[], max: number): AvisoNormalized[] {
    const withDocs = avisos.filter(a => (a.documentos || []).length > 0);
    const withoutDocs = avisos.filter(a => (a.documentos || []).length === 0);
    return [...withDocs, ...withoutDocs].slice(0, Math.min(max, avisos.length));
}

function pickBestDocument(aviso: AvisoNormalized): { url: string; nome: string } | null {
    const docs = Array.isArray(aviso.documentos) ? aviso.documentos : [];
    if (docs.length === 0) return null;

    const candidates = docs
        .filter(d => typeof d.url === 'string' && d.url.length > 0)
        .map(d => ({ url: d.url, nome: d.nome || d.tipo || 'documento' }));

    const prefer = (u: string) => {
        const lower = u.toLowerCase();
        if (lower.includes('.pdf')) return 1;
        if (lower.includes('.docx')) return 2;
        if (lower.includes('.doc')) return 3;
        if (lower.includes('.xlsx') || lower.includes('.xls')) return 4;
        if (lower.includes('.zip')) return 5;
        return 9;
    };

    candidates.sort((a, b) => prefer(a.url) - prefer(b.url));
    return candidates[0] || null;
}

function createDatasetFileFromLocal(params: {
    kind: DatasetFileKind;
    portal: PortalCode;
    aviso: AvisoNormalized;
    localPath: string;
    sourceUrl: string;
}): DatasetFile {
    return {
        kind: params.kind,
        portal: params.portal,
        avisoId: params.aviso.id,
        avisoCodigo: params.aviso.codigo,
        displayName: path.basename(params.localPath),
        localPath: params.localPath,
        sourceUrl: params.sourceUrl,
        mimeType: guessMimeType(params.localPath),
        customMetadata: buildMetadata(params.portal, params.aviso, params.kind, params.sourceUrl),
    };
}

function buildMetadata(
    portal: PortalCode,
    aviso: AvisoNormalized,
    kind: DatasetFileKind | 'dataset_index',
    sourceUrl: string
): CustomMetadataValue[] {
    return [
        { key: 'portal', stringValue: portal },
        { key: 'avisoCodigo', stringValue: aviso.codigo },
        { key: 'avisoId', stringValue: aviso.id },
        { key: 'docType', stringValue: kind },
        { key: 'sourceUrl', stringValue: sourceUrl },
    ];
}

async function downloadDocument(
    url: string,
    datasetDir: string,
    baseName: string
): Promise<{ localPath: string; mimeType: string } | null> {
    try {
        // HEAD first to check size when possible
        try {
            const head = await axios.head(url, { timeout: 20000, headers: { 'User-Agent': 'Mozilla/5.0' } });
            const len = parseInt(String(head.headers['content-length'] || '0'), 10);
            if (len > BYTES_100_MB) {
                return null;
            }
        } catch {
            // ignore; some servers don't like HEAD
        }

        const resp = await axios.get(url, {
            responseType: 'arraybuffer',
            timeout: 90000,
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
            headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': '*/*' },
        });

        const contentType = String(resp.headers['content-type'] || '').split(';')[0].trim();
        const bytes = Buffer.from(resp.data);
        if (bytes.length > BYTES_100_MB) return null;

        const ext = inferExtension(url, contentType);
        const fileName = `${baseName}${ext}`;
        const localPath = path.join(datasetDir, sanitize(fileName));
        fs.writeFileSync(localPath, bytes);

        return { localPath, mimeType: contentType || guessMimeType(localPath) };
    } catch {
        return null;
    }
}

function inferExtension(url: string, contentType: string): string {
    const lower = url.toLowerCase();
    if (lower.includes('.pdf')) return '.pdf';
    if (lower.includes('.docx')) return '.docx';
    if (lower.includes('.doc')) return '.doc';
    if (lower.includes('.xlsx')) return '.xlsx';
    if (lower.includes('.xls')) return '.xls';
    if (lower.includes('.zip')) return '.zip';
    if (contentType === 'application/pdf') return '.pdf';
    if (contentType === 'application/json') return '.json';
    return '';
}

function sanitize(input: string): string {
    return input
        .replace(/[\\/:*?"<>|]+/g, '_')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 140);
}

function buildAvisoMd(portal: PortalCode, aviso: AvisoNormalized): string {
    const lines: string[] = [];
    lines.push(`# ${aviso.codigo}`);
    lines.push('');
    lines.push(`- Portal: ${portal}`);
    lines.push(`- Fonte: ${aviso.fonte}`);
    lines.push(`- Título: ${aviso.titulo}`);
    lines.push(`- Programa: ${aviso.programa}`);
    lines.push(`- Status: ${aviso.status}`);
    if (aviso.dataAbertura) lines.push(`- Data abertura: ${aviso.dataAbertura}`);
    if (aviso.dataFecho) lines.push(`- Data fecho: ${aviso.dataFecho}`);
    if (aviso.dotacao) lines.push(`- Dotação: €${aviso.dotacao.toLocaleString()}`);
    lines.push(`- URL: ${aviso.url}`);
    lines.push('');
    if (aviso.descricao) {
        lines.push('## Descrição');
        lines.push('');
        lines.push(aviso.descricao);
        lines.push('');
    }
    if (aviso.beneficiarios?.length) {
        lines.push('## Beneficiários (extraído)');
        lines.push('');
        for (const b of aviso.beneficiarios) lines.push(`- ${b}`);
        lines.push('');
    }
    if (aviso.documentos?.length) {
        lines.push('## Documentos / anexos (links)');
        lines.push('');
        for (const d of aviso.documentos.slice(0, 25)) {
            lines.push(`- ${d.nome || d.tipo}: ${d.url}`);
        }
        lines.push('');
    }
    return lines.join('\n');
}

function buildDatasetIndexMd(selected: Record<PortalCode, AvisoNormalized[]>): string {
    const today = new Date().toISOString().split('T')[0];
    const all: Array<{ portal: PortalCode; aviso: AvisoNormalized }> = [];
    for (const [portal, avisos] of Object.entries(selected) as Array<[PortalCode, AvisoNormalized[]]>) {
        for (const aviso of avisos) all.push({ portal, aviso });
    }

    let md = `# Dataset Index (avisos)\n\n`;
    md += `Data: ${today}\n\n`;
    md += `Total avisos selecionados: ${all.length}\n\n`;
    md += `| Portal | Código | Título | Status | Fecho | URL |\n`;
    md += `|---|---|---|---|---|---|\n`;
    for (const item of all) {
        const a = item.aviso;
        md += `| ${item.portal} | ${escapePipe(a.codigo)} | ${escapePipe(a.titulo.slice(0, 80))} | ${a.status} | ${a.dataFecho || ''} | ${a.url} |\n`;
    }
    md += `\n`;
    return md;
}

function escapePipe(s: string): string {
    return String(s || '').replace(/\|/g, '\\|');
}

function buildConsultantTestCases(selected: Record<PortalCode, AvisoNormalized[]>): TestCase[] {
    const pickAny = (portal: PortalCode): AvisoNormalized | null => (selected[portal]?.[0] ? selected[portal][0] : null);

    const pt = pickAny('PT2030');
    const prr = pickAny('PRR');
    const pepac = pickAny('PEPAC');
    const horizon = pickAny('HORIZON');
    const crea = pickAny('EUROPA_CRIATIVA');
    const ipdj = pickAny('IPDJ');

    const tcs: TestCase[] = [];

    // Matching / strategy (no portal filter)
    tcs.push({
        id: 'match-01',
        category: 'matching',
        question: 'Tenho um cliente com empresa de software (CAE 62010). Quais os avisos abertos hoje mais compatíveis? Dá 3 opções e justifica com base nas fontes.',
    });
    tcs.push({
        id: 'match-02',
        category: 'matching',
        question: 'Tenho um cliente agrícola (CAE 01). Que avisos do PEPAC são mais adequados e porquê? Se não houver correspondência explícita, diz que não encontras.',
        portalFilter: 'PEPAC',
    });
    tcs.push({
        id: 'recom-01',
        category: 'recommendation',
        question: 'Uma startup tecnológica em Lisboa quer I&D com parceiros europeus. Recomenda o melhor fundo/programa e dá 2-3 próximos passos concretos.',
    });

    // Operational: list open today (use index doc + portal filters)
    const openCodesAll = collectOpenCodes(selected).slice(0, 6);
    tcs.push({
        id: 'open-01',
        category: 'status',
        question: 'Quais são os avisos que estão abertos para candidatura AGORA? Lista os mais relevantes e indica o prazo (quando fecha).',
        expectedCodes: openCodesAll,
    });

    const prrOpenCodes = (selected.PRR || []).filter(a => a.status === 'Aberto').map(a => a.codigo).slice(0, 5);
    if (prrOpenCodes.length > 0) {
        tcs.push({
            id: 'open-02',
            category: 'status',
            question: 'No portal PRR, quais avisos estão abertos hoje e quando fecham? (lista curta)',
            portalFilter: 'PRR',
            expectedCodes: prrOpenCodes,
        });
    }

    // Portal-specific extraction (by code)
    if (pt) {
        tcs.push({
            id: 'pt-elig-01',
            category: 'eligibility',
            question: `No aviso ${pt.codigo}, que tipo de entidades podem candidatar-se (beneficiários elegíveis) e quais restrições principais?`,
            portalFilter: 'PT2030',
        });
    }
    if (prr) {
        tcs.push({
            id: 'prr-deadline-01',
            category: 'deadlines',
            question: `No aviso ${prr.codigo}, qual é o prazo/data limite de candidatura?`,
            portalFilter: 'PRR',
        });
    }
    if (pepac) {
        tcs.push({
            id: 'pepac-docs-01',
            category: 'documents',
            question: `No aviso ${pepac.codigo}, que documentos/anexos são pedidos para a candidatura? Faz checklist.`,
            portalFilter: 'PEPAC',
        });
    }
    if (horizon) {
        tcs.push({
            id: 'horizon-01',
            category: 'horizon',
            question: `Na call ${horizon.codigo}, qual é o objetivo e o prazo (deadline), e que tipo de entidade tipicamente participa? Se não estiver claro, diz que não encontras.`,
            portalFilter: 'HORIZON',
        });
    }
    if (crea) {
        tcs.push({
            id: 'crea-01',
            category: 'creative',
            question: `Na call ${crea.codigo}, qual é o deadline e qual o tema do aviso?`,
            portalFilter: 'EUROPA_CRIATIVA',
        });
    }
    if (ipdj) {
        tcs.push({
            id: 'ipdj-01',
            category: 'ipdj',
            question: `No programa ${ipdj.codigo}, qual o tipo de apoio e como aceder/submeter pedido?`,
            portalFilter: 'IPDJ',
        });
    }

    // Wrong filter (must admit not found)
    if (prr) {
        tcs.push({
            id: 'wrong-filter-01',
            category: 'negative_filter',
            question: `Pergunta: No aviso ${prr.codigo}, quais são os beneficiários? (Deve falhar se o filtro estiver errado)`,
            portalFilter: 'PEPAC', // intentionally wrong
            shouldAdmitUnknown: true,
        });
    }

    // Out-of-domain refusal
    tcs.push({
        id: 'neg-01',
        category: 'negative',
        question: 'Qual é a taxa de juro do BCE em Dezembro de 2025?',
        shouldRefuse: true,
    });
    tcs.push({
        id: 'neg-02',
        category: 'unknown',
        question: 'Quanto tempo demora a aprovação de uma candidatura ao PRR?',
        shouldAdmitUnknown: true,
        portalFilter: 'PRR',
    });

    // Cap to keep runtime controlled
    return tcs.slice(0, 18);
}

function collectOpenCodes(selected: Record<PortalCode, AvisoNormalized[]>): string[] {
    const out: string[] = [];
    for (const avisos of Object.values(selected)) {
        for (const a of avisos) {
            if (a.status === 'Aberto') out.push(a.codigo);
        }
    }
    // de-dupe
    return [...new Set(out)];
}

function scoreExpectedCodes(answer: string, expectedCodes: string[]): number {
    const a = answer.toLowerCase();
    const hits = expectedCodes.filter(code => a.includes(code.toLowerCase()));
    return expectedCodes.length === 0 ? 1 : hits.length / expectedCodes.length;
}

function inferPortalsFromCitations(
    resp: GenerateWithFileSearchResult,
    uploadedMap: Record<string, { portal: PortalCode; displayName: string }>
): PortalCode[] {
    const portals = new Set<PortalCode>();

    for (const src of resp.citations.citedSources) {
        const hay = `${src.source || ''} ${src.title || ''} ${src.uri || ''}`.trim();
        const inferred = inferPortalFromText(hay);
        if (inferred) portals.add(inferred);

        const m = hay.match(/files\/[a-zA-Z0-9_-]+/);
        if (m) {
            const fileName = m[0];
            const mapped = uploadedMap[fileName];
            if (mapped?.portal) portals.add(mapped.portal);
        }

        // Citations often return the file id (without "files/") in `title`.
        const possibleIds = [src.title, src.source]
            .filter((v): v is string => typeof v === 'string' && v.length > 0)
            .map(v => v.trim());
        for (const id of possibleIds) {
            if (!/^[a-zA-Z0-9_-]{6,}$/.test(id)) continue;
            const mapped = uploadedMap[`files/${id}`];
            if (mapped?.portal) portals.add(mapped.portal);
        }
    }

    return [...portals];
}

function inferPortalFromText(text: string): PortalCode | null {
    const t = text.toUpperCase();
    if (t.includes('PT2030__')) return 'PT2030';
    if (t.includes('PRR__')) return 'PRR';
    if (t.includes('PEPAC__')) return 'PEPAC';
    if (t.includes('HORIZON__')) return 'HORIZON';
    if (t.includes('EUROPA_CRIATIVA__') || t.includes('EC-') || t.includes('CREA-')) return 'EUROPA_CRIATIVA';
    if (t.includes('IPDJ__') || t.includes('IPDJ-')) return 'IPDJ';
    if (t.includes('INDEX__')) return null;
    return null;
}

async function evaluateAnswer(tc: TestCase, rr: RunResult, resp: GenerateWithFileSearchResult): Promise<EvalResult> {
    const prompt = `És um avaliador de qualidade para respostas de um assistente de consultores de fundos.

PERGUNTA:
${tc.question}

FILTRO APLICADO:
${rr.metadataFilter || '(sem filtro)'}

RESPOSTA DO MODELO:
${rr.answer}

SINAIS DE GROUNDING (citations summary):
${JSON.stringify(resp.citations, null, 2)}

Avalia de 0-10:
- useful: utilidade prática para consultor
- grounded: resposta ancorada (citações/sinais) e sem inventar
- honest: admite "não encontrei" quando necessário
- clarity: português claro, estruturado e accionável
- hallucinationRisk: risco de alucinação (10 = alto risco)

Responde APENAS com JSON válido no formato:
{"useful":0,"grounded":0,"honest":0,"clarity":0,"hallucinationRisk":0,"reasoning":""}`;

    try {
        const raw = await generateTextOnly(EVALUATOR_MODEL, prompt);
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('Evaluator JSON not found');

        const parsed = JSON.parse(jsonMatch[0]) as Partial<EvalResult> & { reasoning?: string };
        const useful = clampScore(parsed.useful);
        const grounded = clampScore(parsed.grounded);
        const honest = clampScore(parsed.honest);
        const clarity = clampScore(parsed.clarity);
        const hallucinationRisk = clampScore(parsed.hallucinationRisk);
        const overall = useful * 0.30 + grounded * 0.30 + honest * 0.20 + clarity * 0.20 - hallucinationRisk * 0.10;

        return {
            useful,
            grounded,
            honest,
            clarity,
            hallucinationRisk,
            overall: Math.max(0, Math.min(10, overall)),
            reasoning: String(parsed.reasoning || '').slice(0, 300),
        };
    } catch {
        return {
            useful: 5,
            grounded: 5,
            honest: 5,
            clarity: 5,
            hallucinationRisk: 5,
            overall: 5,
            reasoning: 'Fallback',
        };
    }
}

function clampScore(v: unknown): number {
    const n = typeof v === 'number' ? v : parseFloat(String(v || ''));
    if (Number.isNaN(n)) return 5;
    return Math.max(0, Math.min(10, n));
}

async function generateTextOnly(model: string, prompt: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY not set');

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            temperature: 0.0,
            maxOutputTokens: 512,
            // Prevent "thinking tokens" from consuming the output budget during evaluation.
            thinkingConfig: { thinkingBudget: 0 },
        },
    };

    const resp = await axios.post(url, body, { headers: { 'Content-Type': 'application/json' }, timeout: 120000 });
    const candidate = resp.data?.candidates?.[0];
    const parts = candidate?.content?.parts;
    if (Array.isArray(parts)) return parts.map((p: any) => p.text).filter(Boolean).join('');
    return '';
}

function estimateCostUSD(usage: { promptTokenCount: number; candidatesTokenCount: number }, model: string): number {
    const p = MODEL_PRICING[model];
    if (!p) return 0;
    return (usage.promptTokenCount / 1_000_000) * p.input + (usage.candidatesTokenCount / 1_000_000) * p.output;
}

function buildSummary(results: RunResult[]): string {
    const createdAt = new Date().toISOString();
    const testCount = [...new Set(results.map(r => r.testCaseId))].length;

    const models = [...new Set(results.map(r => r.model))];

    let md = `# Benchmark: File Search\n\n`;
    md += `Criado: ${createdAt}\n\n`;
    md += `## Setup\n\n`;
    md += `- Modelos: ${models.join(', ')}\n`;
    md += `- Test cases: ${testCount}\n\n`;

    md += `## Resultados (por modelo)\n\n`;
    md += `| Modelo | Score (médio) | Citations | Leakage | Latência (avg) | Custo (estim.) |\n`;
    md += `|---|---:|---:|---:|---:|---:|\n`;

    for (const model of models) {
        const rs = results.filter(r => r.model === model && !r.error);
        if (rs.length === 0) continue;

        const avgLatency = rs.reduce((s, r) => s + r.latencyMs, 0) / rs.length;
        const citationRate = rs.filter(r => r.citations.citationCount > 0).length / rs.length;
        const leakageRate = rs.filter(r => r.portalLeakage).length / rs.length;
        const avgScore = ENABLE_EVAL
            ? rs.reduce((s, r) => s + (r.eval?.overall ?? 0), 0) / rs.length
            : 0;
        const totalCost = rs.reduce((s, r) => s + estimateCostUSD(r.usage, model), 0);

        md += `| ${model} | ${ENABLE_EVAL ? avgScore.toFixed(1) : '—'} | ${(citationRate * 100).toFixed(0)}% | ${(leakageRate * 100).toFixed(0)}% | ${(avgLatency / 1000).toFixed(1)}s | $${totalCost.toFixed(4)} |\n`;
    }

    md += `\n## Notas e Best Practices (anti-alucinações)\n\n`;
    md += `- Usar sempre \`metadata_filter\` (por portal +, idealmente, programa/região) para evitar mistura de fontes.\n`;
    md += `- Guardar \`customMetadata\` rica: portal, avisoCodigo, fonte/url, tipo de doc.\n`;
    md += `- Temperatura baixa (0.0–0.2) e instrução explícita: “se não encontrares, diz que não encontras”.\n`;
    md += `- Perguntas de consultor: separar “matching/recomendação” (heurístico) de “factos do aviso” (tem de estar citado).\n`;
    md += `- PDFs scan: considerar OCR antes de upload.\n`;

    md += `\n## Exemplos (top 3 por score)\n\n`;
    if (ENABLE_EVAL) {
        const best = [...results]
            .filter(r => r.eval && !r.error)
            .sort((a, b) => (b.eval?.overall || 0) - (a.eval?.overall || 0))
            .slice(0, 3);

        for (const r of best) {
            md += `### ${r.model} / ${r.testCaseId} (${r.eval?.overall.toFixed(1)}/10)\n\n`;
            md += `**Pergunta**: ${r.question}\n\n`;
            md += `**Resposta**:\n\n`;
            md += `${r.answer.slice(0, 900)}\n\n`;
            md += `**Citações**: ${r.citations.citationCount}\n\n`;
        }
    } else {
        md += `Avaliação desativada (BENCH_EVAL=0).\n`;
    }

    return md;
}

// Run
main()
    .then(() => console.log('\n✨ Benchmark concluído!'))
    .catch((e) => {
        console.error('Fatal:', e.message || e);
        process.exit(1);
    });
