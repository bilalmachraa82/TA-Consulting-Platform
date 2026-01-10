/**
 * FASE 2: Criar File Search Store e Ingerir PDFs
 * 
 * Usa avisos-open.json (667 avisos, 644 PDFs únicos)
 * 
 * @usage npx ts-node src/scripts/ingest-to-store.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import axios from 'axios';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import {
    requireGeminiApiKey,
    createFileSearchStore,
    uploadLocalFileToGeminiFilesApi,
    waitForGeminiFileActive,
    importFileToSearchStore,
    waitForOperationDone,
    guessMimeType,
} from '../lib';

// ============= CONFIG =============

const STORE_NAME = 'avisosfundoseuropeus-e463dep1so0g'; // Usar Store existente
const DATA_FILE = path.join(__dirname, '../data/avisos-open.json');
const TMP_DIR = path.join(__dirname, 'tmp-ingest');
const SKIP_FIRST = 99; // Já carregados na primeira run
const MAX_PDFS = 700; // Carregar TODOS (644 únicos identificados)
const DELAY_MS = 500;

// ============= TYPES =============

interface AvisoData {
    id: string;
    codigo: string;
    titulo: string;
    programa: string;
    status: string;
    url: string;
    fonte: string;
    documentos?: Array<{
        url: string;
        nome: string;
        tipo?: string;
    }>;
    portal?: string;
}

interface DataFile {
    totalAvisos: number;
    totalPdfs: number;
    byPortal: Record<string, { avisos: number; pdfs: number }>;
    avisos: AvisoData[];
}

// ============= HELPERS =============

async function downloadPdf(url: string, localPath: string): Promise<boolean> {
    try {
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 60000,
            maxRedirects: 5,
        });

        // Verificar se é PDF válido
        const buffer = Buffer.from(response.data);
        if (buffer.length < 100) return false;

        fs.writeFileSync(localPath, buffer);
        return true;
    } catch (error) {
        return false;
    }
}

function sanitize(name: string): string {
    return name.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 60);
}

function isPdfUrl(url: string): boolean {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.endsWith('.pdf') ||
        lower.includes('.pdf') ||
        lower.includes('octet-stream') ||
        lower.includes('/pdf/');
}

// ============= MAIN =============

async function ingestToStore(): Promise<void> {
    console.log('\n' + '═'.repeat(70));
    console.log('📦 FASE 2: Criar Store e Ingerir PDFs');
    console.log('═'.repeat(70));

    requireGeminiApiKey();

    // Load data
    if (!fs.existsSync(DATA_FILE)) {
        console.error('❌ Ficheiro não encontrado:', DATA_FILE);
        console.log('   Execute primeiro: npx ts-node src/scripts/fetch-open-avisos.ts');
        return;
    }

    const data: DataFile = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    console.log(`\n📊 Dados: ${data.totalAvisos} avisos, ${data.totalPdfs} PDFs`);

    // Create temp dir
    if (!fs.existsSync(TMP_DIR)) {
        fs.mkdirSync(TMP_DIR, { recursive: true });
    }

    // Use existing Store
    console.log('\n🗄️ A usar File Search Store existente...');
    const store = { name: `fileSearchStores/${STORE_NAME}` };
    console.log(`   ✅ Store: ${store.name}`);

    // Collect unique PDF URLs
    console.log('\n📥 A identificar PDFs únicos...');
    const pdfMap = new Map<string, { url: string; aviso: AvisoData; docName: string }>();

    for (const aviso of data.avisos) {
        const portal = aviso.portal || aviso.fonte || 'UNKNOWN';

        for (const doc of aviso.documentos || []) {
            if (!doc.url || !isPdfUrl(doc.url)) continue;
            if (pdfMap.has(doc.url)) continue;

            pdfMap.set(doc.url, {
                url: doc.url,
                aviso,
                docName: doc.nome || 'documento',
            });
        }
    }

    console.log(`   ✅ ${pdfMap.size} PDFs únicos identificados`);

    // Ingest PDFs (skip already uploaded)
    const totalToUpload = Math.min(pdfMap.size - SKIP_FIRST, MAX_PDFS);
    console.log(`\n📤 A fazer upload (${SKIP_FIRST} já carregados, ${totalToUpload} restantes)...\n`);

    let uploaded = 0;
    let errors = 0;
    let skipped = 0;
    const entries = Array.from(pdfMap.values());

    for (let i = 0; i < entries.length && uploaded < totalToUpload; i++) {
        // Skip already uploaded
        if (i < SKIP_FIRST) {
            skipped++;
            continue;
        }

        const entry = entries[i];
        const portal = entry.aviso.portal || entry.aviso.fonte || 'UNKNOWN';
        const displayName = `${sanitize(portal)}__${sanitize(entry.aviso.codigo)}__${sanitize(entry.docName)}`;
        const localPath = path.join(TMP_DIR, `${displayName}.pdf`);

        try {
            // Download
            const downloaded = await downloadPdf(entry.url, localPath);
            if (!downloaded) {
                errors++;
                continue;
            }

            // Upload
            const file = await uploadLocalFileToGeminiFilesApi(
                localPath,
                displayName,
                'application/pdf'
            );
            await waitForGeminiFileActive(file.name);

            // Import with metadata
            const op = await importFileToSearchStore(store.name, file.name, [
                { key: 'portal', stringValue: portal },
                { key: 'avisoCode', stringValue: entry.aviso.codigo },
                { key: 'programa', stringValue: entry.aviso.programa || '' },
                { key: 'status', stringValue: entry.aviso.status || 'Aberto' },
            ]);
            await waitForOperationDone(op.name);

            uploaded++;
            console.log(`   ✅ [${uploaded}/${MAX_PDFS}] ${portal}: ${entry.aviso.codigo}`);

            // Cleanup
            if (fs.existsSync(localPath)) fs.unlinkSync(localPath);

            await new Promise(r => setTimeout(r, DELAY_MS));

        } catch (error: any) {
            errors++;
            console.log(`   ❌ ${portal}/${entry.aviso.codigo}: ${error.message?.slice(0, 40)}`);
            if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
        }
    }

    // Cleanup
    if (fs.existsSync(TMP_DIR)) {
        try { fs.rmdirSync(TMP_DIR, { recursive: true }); } catch { }
    }

    // Summary
    console.log('\n' + '═'.repeat(70));
    console.log('📊 RESUMO DA INGESTÃO');
    console.log('═'.repeat(70));
    console.log(`   Store: ${store.name}`);
    console.log(`   PDFs carregados: ${uploaded}/${MAX_PDFS}`);
    console.log(`   Erros: ${errors}`);
    console.log('\n✨ Ingestão concluída!');
    console.log('\n📋 Próximo: Testar API /api/rag/chat');
}

ingestToStore().catch(console.error);
