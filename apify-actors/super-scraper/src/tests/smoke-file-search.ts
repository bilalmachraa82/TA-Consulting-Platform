/**
 * Smoke test: Gemini File Search (Stores + metadata_filter)
 *
 * @usage npx ts-node src/tests/smoke-file-search.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

import {
    requireGeminiApiKey,
    createFileSearchStore,
    deleteFileSearchStore,
    uploadLocalFileToGeminiFilesApi,
    waitForGeminiFileActive,
    importFileToSearchStore,
    waitForOperationDone,
    generateContentWithFileSearch,
    guessMimeType,
} from '../lib';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const MODEL = process.env.SMOKE_MODEL || 'gemini-2.5-flash';

async function main(): Promise<void> {
    requireGeminiApiKey();

    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const tmpDir = path.join(__dirname, `tmp-file-search-smoke-${stamp}`);
    fs.mkdirSync(tmpDir, { recursive: true });

    const filePath = path.join(tmpDir, 'smoke.md');
    fs.writeFileSync(
        filePath,
        `# Smoke Test\n\nEste documento diz: O prazo é 2026-12-31.\n\nFonte: SMOKE\n`
    );

    console.log('🗄️  create store...');
    const store = await createFileSearchStore(`smoke-${stamp}`.slice(0, 60));
    console.log('   store:', store.name);

    try {
        console.log('📤 upload file...');
        const uploaded = await uploadLocalFileToGeminiFilesApi(filePath, 'SMOKE__smoke.md', guessMimeType(filePath));
        await waitForGeminiFileActive(uploaded.name);
        console.log('   uploaded:', uploaded.name);

        console.log('📥 import file...');
        try {
            const op = await importFileToSearchStore(store.name, uploaded.name, [
                { key: 'portal', stringValue: 'SMOKE' },
                { key: 'topic', stringValue: 'deadlines' },
            ]);
            await waitForOperationDone(op.name);
            console.log('   imported ✅');
        } catch (e: any) {
            const data = e?.response?.data;
            console.log('   ❌ import failed:', e.message);
            if (data) console.log(JSON.stringify(data, null, 2));
            throw e;
        }

        console.log('🔍 query...');
        let resp;
        try {
            resp = await generateContentWithFileSearch({
                model: MODEL,
                prompt: 'Qual é o prazo indicado no documento?',
                storeName: store.name,
                metadataFilter: 'portal = "SMOKE"',
                temperature: 0.1,
                maxOutputTokens: 200,
            });
        } catch (e: any) {
            console.log('   ❌ query failed:', e.message);
            if (e?.response?.data) console.log(JSON.stringify(e.response.data, null, 2));
            throw e;
        }

        console.log('   model:', MODEL);
        console.log('\n=== ANSWER ===\n');
        console.log(resp.text);
        console.log('\n=== CITATIONS ===\n');
        console.log(JSON.stringify(resp.citations, null, 2));
    } finally {
        console.log('\n🧹 delete store...');
        await deleteFileSearchStore(store.name);
        console.log('   deleted ✅');
    }
}

main().catch((e) => {
    console.error('Fatal:', e.message || e);
    process.exit(1);
});
