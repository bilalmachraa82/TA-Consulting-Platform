/**
 * Script de Ingestão - Cria Store e importa PDFs dos 6 portais
 * 
 * @usage npx ts-node src/scripts/ingest-store.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

import {
    scrapePRR,
    scrapePEPAC,
    scrapeCORDIS,
    scrapePortugal2030,
    detectDocumentFormat,
    createFileSearchStore,
    deleteFileSearchStore,
    uploadLocalFileToGeminiFilesApi,
    waitForGeminiFileActive,
    importFileToSearchStore,
    waitForOperationDone,
    requireGeminiApiKey,
    AvisoNormalized,
} from '../lib';

import axios from 'axios';
import * as fs from 'fs';

// ============= CONFIG =============

const STORE_DISPLAY_NAME = 'avisos-fundos-europeus';
const MAX_DOCS_TOTAL = 100;
const TMP_DIR = path.join(__dirname, 'tmp-ingest');

const PORTALS = [
    { name: 'PRR', fn: () => scrapePRR({ maxItems: 15, onlyOpen: true }) },
    { name: 'PEPAC', fn: () => scrapePEPAC({ maxItems: 10, onlyOpen: true }) },
    { name: 'PT2030', fn: () => scrapePortugal2030({ maxItems: 10, onlyOpen: true }) },
    { name: 'HORIZON', fn: () => scrapeCORDIS({ maxItems: 10, onlyOpen: true }) },
];

// ============= HELPERS =============

async function downloadPdf(url: string, localPath: string): Promise<boolean> {
    try {
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 60000,
        });
        fs.writeFileSync(localPath, response.data);
        return true;
    } catch (error) {
        return false;
    }
}

function sanitizeFilename(name: string): string {
    return name.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 80);
}

// ============= MAIN =============

async function main(): Promise<void> {
    console.log('\n' + '═'.repeat(70));
    console.log('📦 INGESTÃO: Criar Store e Importar PDFs');
    console.log('═'.repeat(70));

    requireGeminiApiKey();

    // Create temp dir
    if (!fs.existsSync(TMP_DIR)) {
        fs.mkdirSync(TMP_DIR, { recursive: true });
    }

    // 1. Create Store
    console.log('\n🗄️ A criar File Search Store...');
    let store;
    try {
        store = await createFileSearchStore(STORE_DISPLAY_NAME);
        console.log(`   ✅ Store: ${store.name}`);
    } catch (error: any) {
        if (error.message?.includes('already exists')) {
            console.log('   ⚠️ Store já existe, a usar existente');
            store = { name: `fileSearchStores/${STORE_DISPLAY_NAME}` };
        } else {
            throw error;
        }
    }

    // 2. Fetch avisos from all portals
    console.log('\n📥 A obter avisos de 4 portais...\n');
    const allAvisos: Array<{ aviso: AvisoNormalized; portal: string }> = [];

    for (const p of PORTALS) {
        try {
            console.log(`🔵 ${p.name}...`);
            const avisos = await p.fn();
            for (const a of avisos) {
                allAvisos.push({ aviso: a, portal: p.name });
            }
            console.log(`   ✅ ${avisos.length} avisos`);
        } catch (error: any) {
            console.log(`   ❌ Erro: ${error.message?.substring(0, 40)}`);
        }
    }

    console.log(`\n📊 Total: ${allAvisos.length} avisos\n`);

    // 3. Upload and import PDFs
    console.log('📤 A fazer upload de PDFs...\n');

    let uploaded = 0;
    let errors = 0;

    for (const { aviso, portal } of allAvisos) {
        if (uploaded >= MAX_DOCS_TOTAL) break;

        for (const doc of aviso.documentos || []) {
            if (uploaded >= MAX_DOCS_TOTAL) break;
            const isPdf =
                (doc.formato || '').toLowerCase() === 'pdf' ||
                detectDocumentFormat(doc.nome || doc.url || '') === 'pdf';
            if (!isPdf) continue;

            const displayName = `${portal}__${sanitizeFilename(aviso.codigo)}__${sanitizeFilename(doc.nome || 'doc')}`;
            const localPath = path.join(TMP_DIR, `${displayName}.pdf`);

            try {
                // Download
                const downloaded = await downloadPdf(doc.url, localPath);
                if (!downloaded) {
                    errors++;
                    continue;
                }

                // Upload to Files API
                const file = await uploadLocalFileToGeminiFilesApi(localPath, displayName);
                await waitForGeminiFileActive(file.name);

                // Import to Store with metadata
                const op = await importFileToSearchStore(store.name, file.name, [
                    { key: 'portal', stringValue: portal },
                    { key: 'avisoCode', stringValue: aviso.codigo || aviso.id },
                    { key: 'programa', stringValue: aviso.programa || '' },
                    { key: 'status', stringValue: aviso.status || 'Aberto' },
                ]);
                await waitForOperationDone(op.name);

                uploaded++;
                console.log(`   ✅ [${uploaded}/${MAX_DOCS_TOTAL}] ${displayName}`);

                // Cleanup local file
                fs.unlinkSync(localPath);

                // Rate limiting
                await new Promise(r => setTimeout(r, 500));

            } catch (error: any) {
                errors++;
                console.log(`   ❌ ${displayName}: ${error.message?.substring(0, 40)}`);
            }
        }
    }

    // Cleanup temp dir
    if (fs.existsSync(TMP_DIR)) {
        fs.rmdirSync(TMP_DIR, { recursive: true });
    }

    // Summary
    console.log('\n' + '═'.repeat(70));
    console.log('📊 RESUMO');
    console.log('═'.repeat(70));
    console.log(`   Store: ${store.name}`);
    console.log(`   PDFs importados: ${uploaded}`);
    console.log(`   Erros: ${errors}`);
    console.log('\n✨ Ingestão concluída!');
    console.log('\n📋 Próximo passo: Testar API em /api/rag/chat');
}

main().catch(console.error);
