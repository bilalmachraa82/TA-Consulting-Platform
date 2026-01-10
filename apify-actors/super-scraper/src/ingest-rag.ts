
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import axios from 'axios';
import {
    scrapePRR,
    scrapePEPAC,
    scrapePortugal2030,
    scrapeCORDIS,
    scrapeEuropaCriativa,
    scrapeIPDJ
} from './lib';
import { scrapePEPACPlaywright } from './lib/pepac-playwright';
import { scrapePEPACFirecrawl } from './lib/pepac-firecrawl';
import {
    createFileSearchStore,
    uploadLocalFileToGeminiFilesApi,
    importFileToSearchStore,
    waitForOperationDone
} from './lib/gemini-file-search';

// Load .env from project root (3 levels up)
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const STORE_CONFIG_FILE = 'rag-store.json';
const BATCH_SIZE = 10;
const DELAY_BETWEEN_BATCHES = 5000; // 5s to respect rate limits

interface RagStoreConfig {
    storeName: string; // resource name
    displayName: string;
    createdAt: string;
    docCount: number;
}

async function ingestAll() {
    console.log('🚀 INICIANDO INGESTÃO PROD (Gemini Files + Metadata)');
    console.log('════════════════════════════════════════════════════');

    // 1. SCRAPE
    console.log('\n🌐 1. Scraping de dados frescos dos 6 portais...');
    // We scrape with sensible limits for Prod (or maxItems: 1000)
    // For this implementation step, let's use fairly high limits but not infinite

    let allMediaLogs: Array<{ url: string; portal: string; aviso: string; name: string }> = [];

    try {
        // PT2030
        console.log('   - PT2030 (Abertos)...');
        const pt2030 = await scrapePortugal2030({ maxItems: 1000, onlyOpen: true });
        pt2030.forEach((a: any) => extractDocs(a, 'PT2030', allMediaLogs));

        // PRR
        console.log('   - PRR (Abertos)...');
        const prr = await scrapePRR({ maxItems: 1000, onlyOpen: true });
        prr.forEach((a: any) => extractDocs(a, 'PRR', allMediaLogs));

        // PEPAC (with triple fallback: API -> Playwright -> Firecrawl)
        console.log('   - PEPAC (Abertos)...');
        let pepac: any[] = [];
        try {
            pepac = await scrapePEPAC({ maxItems: 1000, onlyOpen: true });
        } catch (e: any) {
            console.log('      ⚠️ PEPAC API falhou...');
        }
        if (pepac.length === 0) {
            console.log('      🎭 Tentando Playwright...');
            try {
                pepac = await scrapePEPACPlaywright({ maxItems: 100, onlyOpen: true, headless: true });
            } catch (e: any) {
                console.log('      ⚠️ Playwright falhou...');
            }
        }
        if (pepac.length === 0) {
            console.log('      🔥 Usando Firecrawl (bypass final)...');
            pepac = await scrapePEPACFirecrawl({ maxItems: 50, onlyOpen: true });
        }
        pepac.forEach((a: any) => extractDocs(a, 'PEPAC', allMediaLogs));

        // HORIZON
        console.log('   - Horizon Europe (Open)...');
        // Horizon implementation in lib might need check for document structure
        // Leaving as is, but ensuring onlyOpen ensures relevance.
        // const horizon = await scrapeCORDIS({ maxItems: 200, onlyOpen: true });
        // Horizon usually links to external pages, tricky to get PDFs directly without deep crawl.
        // We skip PDF extraction for Horizon in this MVP unless structure supports it.

        // IPDJ
        console.log('   - IPDJ (Abertos/Perenes)...');
        const ipdj = await scrapeIPDJ({ maxItems: 1000, onlyOpen: true });
        ipdj.forEach((a: any) => extractDocs(a, 'IPDJ', allMediaLogs));

        // CREA skipped (link-based)
        // or add if structure allows.

    } catch (e: any) {
        console.error('❌ Falha no scraping:', e.message);
        process.exit(1);
    }

    console.log(`\n📋 Total Documentos Identificados: ${allMediaLogs.length}`);

    // 2. CREATE STORE
    let storeConfig: RagStoreConfig | null = null;
    let storeName = '';

    // Check if store exists in config
    if (fs.existsSync(STORE_CONFIG_FILE)) {
        storeConfig = JSON.parse(fs.readFileSync(STORE_CONFIG_FILE, 'utf-8'));
        console.log(`\n📂 Store existente encontrada: ${storeConfig?.displayName} (${storeConfig?.storeName})`);

        // Ask/Decide to reuse or create new. For MVP: Reuse if exists.
        storeName = storeConfig!.storeName;
    } else {
        const displayName = `EU_FUNDS_PROD_${new Date().toISOString().split('T')[0]}`;
        console.log(`\n🆕 Criando nova Store: ${displayName}...`);
        const store = await createFileSearchStore(displayName);
        storeName = store.name;

        storeConfig = {
            storeName,
            displayName,
            createdAt: new Date().toISOString(),
            docCount: 0
        };
        fs.writeFileSync(STORE_CONFIG_FILE, JSON.stringify(storeConfig, null, 2));
        console.log(`   ✅ Store criada: ${storeName}`);
    }

    // 3. UPLOAD & IMPORT
    console.log(`\n📤 3. Upload & Importação (${allMediaLogs.length} docs)...`);

    // Process in batches
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < allMediaLogs.length; i += BATCH_SIZE) {
        const batch = allMediaLogs.slice(i, i + BATCH_SIZE);
        console.log(`   Processing batch ${i + 1}-${Math.min(i + BATCH_SIZE, allMediaLogs.length)}...`);

        await Promise.all(batch.map(async (doc) => {
            try {
                // A. Download to Temp
                const tempPath = path.join('/tmp', doc.name); // Linux/Mac tmp
                const response = await axios.get(doc.url, { responseType: 'arraybuffer', timeout: 20000 });
                fs.writeFileSync(tempPath, response.data);

                // B. Upload to Gemini Files
                const geminiFile = await uploadLocalFileToGeminiFilesApi(tempPath, doc.name, 'application/pdf'); // TODO: Adjust content type based on actual file type

                // C. Import to Store with Metadata
                const importOp = await importFileToSearchStore(storeName, geminiFile.name, [
                    { key: 'portal', stringValue: doc.portal },
                    { key: 'aviso_codigo', stringValue: doc.aviso }
                ]);

                // Wait for import? Not strictly necessary to block batch, but good practice to allow eventual consistency
                // We won't wait for 'done' per file to speed up parallel batch, but we rely on async.
                // Actually importFileToSearchStore returns an Operation. 
                // We should ideally track operations.

                successCount++;
                // Clean temp (ignore if already deleted by parallel process)
                try { fs.unlinkSync(tempPath); } catch { /* already deleted */ }

            } catch (e: any) {
                console.error(`      ❌ Falha ${doc.name}: ${e.message}`);
                failCount++;
            }
        }));

        // Rate Limit Pause
        if (i + BATCH_SIZE < allMediaLogs.length) {
            await new Promise(r => setTimeout(r, DELAY_BETWEEN_BATCHES));
        }

        // Update config periodically
        storeConfig!.docCount = successCount;
        fs.writeFileSync(STORE_CONFIG_FILE, JSON.stringify(storeConfig, null, 2));
    }

    console.log('\n🏁 Ingestão Concluída!');
    console.log(`   Sucessos: ${successCount}`);
    console.log(`   Falhas: ${failCount}`);
    console.log(`   Store ID: ${storeName} (Guardado em ${STORE_CONFIG_FILE})`);
}

function extractDocs(aviso: any, portal: string, list: any[]) {
    if (!aviso.documentos) return;
    aviso.documentos.forEach((d: any) => {
        if (!d.url) return;
        const urlLower = d.url.toLowerCase();
        const isSupported = urlLower.endsWith('.pdf') ||
            urlLower.endsWith('.docx') ||
            urlLower.endsWith('.doc') ||
            urlLower.endsWith('.xlsx') ||
            urlLower.endsWith('.xls'); // Gemini supports these

        if (isSupported) {
            const ext = urlLower.split('.').pop();
            list.push({
                url: d.url,
                portal,
                aviso: aviso.codigo,
                // Sanitize name and keep extension
                name: `${aviso.codigo}_${d.nome || 'anexo'}`.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80) + '.' + ext
            });
        }
    });
}

ingestAll().catch(console.error);
