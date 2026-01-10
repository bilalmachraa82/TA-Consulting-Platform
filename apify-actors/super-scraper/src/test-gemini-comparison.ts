/**
 * Comparison Test: Gemini 2.5 Flash vs Gemini 3.0 Flash
 */

import { uploadPdfFromUrl, queryDocuments, listUploadedFiles } from './lib';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const TEST_PDF_URL = 'https://raw.githubusercontent.com/mozilla/pdf.js/master/test/pdfs/tracemonkey.pdf';
const TEST_PDF_NAME = 'TraceMonkey_Paper_v1';
const TEST_QUESTION = 'Explain the main contribution of this paper regarding Trace-based Just-in-Time Compilation.';

const { GoogleGenerativeAI } = require('@google/generative-ai');
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function waitForActiveFile(fileUri: string) {
    const { GoogleAIFileManager } = require('@google/generative-ai/server');
    const fileManager = new GoogleAIFileManager(apiKey);

    console.log(`⏳ Waiting for file ${fileUri} to be ACTIVE...`);
    let file = await fileManager.getFile(fileUri.split('/').pop());

    while (file.state === 'PROCESSING') {
        console.log(`   State: ${file.state}... waiting 2s`);
        await new Promise(r => setTimeout(r, 2000));
        file = await fileManager.getFile(fileUri.split('/').pop());
    }
    console.log(`   State: ${file.state}`);
    if (file.state !== 'ACTIVE') {
        throw new Error(`File state is ${file.state}, cannot proceed.`);
    }
}

async function compareModels() {
    console.log('=== 🤖 GEMINI MODEL BATTLE: 2.5 vs 3.0 ===\n');

    // 0. List Models to find the right ID
    console.log('📋 Listing available models (searching for flash)...');
    try {
        // Fetch models via REST API since SDK support for listing models varies
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        const modelsFound = (data.models || []).filter((m: any) => m.name.includes('flash'));
        console.log('   Found Flash models:', modelsFound.map((m: any) => m.name.replace('models/', '')));
    } catch (e) {
        console.log('   Could not list models via REST:', e);
    }

    // 1. Setup - Ensure File is Uploaded
    let fileUri: string | null = null;

    // Check if already uploaded
    const existing = await listUploadedFiles();
    const found = existing.find(f => f.name === TEST_PDF_NAME || f.displayName === TEST_PDF_NAME);

    if (found) {
        console.log(`✅ File found (cached): ${found.uri}`);
        fileUri = found.uri;
    } else {
        console.log('📤 Uploading test PDF...');
        try {
            const uploaded = await uploadPdfFromUrl(TEST_PDF_URL, TEST_PDF_NAME);
            fileUri = uploaded.uri;
            console.log(`✅ Upload success: ${fileUri}`);
        } catch (e: any) {
            console.error('❌ Upload failed:', e.message);
            return;
        }
    }

    if (!fileUri) return;

    // WAIT FOR ACTIVE
    try {
        await waitForActiveFile(fileUri);
    } catch (e: any) {
        console.error(e.message);
        return;
    }

    // 2. Define Models to Test
    const models = [
        { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
        { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash Preview' }
    ];

    console.log(`\n❓ Question: "${TEST_QUESTION}"\n`);

    for (const model of models) {
        console.log(`----------------------------------------`);
        console.log(`🧪 Testing: ${model.name} [${model.id}]`);

        try {
            const start = Date.now();
            const result = await queryDocuments(TEST_QUESTION, [fileUri], { model: model.id });
            const duration = Date.now() - start;

            console.log(`⏱️ Latency: ${duration}ms`);
            console.log(`📝 Answer (First 200 chars):`);
            console.log(`"${result.answer.slice(0, 200).replace(/\n/g, ' ')}..."`);
            console.log(`📊 Confidence: ${result.confidence}`);

        } catch (e: any) {
            console.log(`❌ FAILED: ${e.message}`);
            if (e.message.includes('404') || e.message.includes('not found')) {
                console.log(`   (Model ID might be incorrect)`);
            }
        }
    }
    console.log('\n=== DONE ===');
}

compareModels().catch(console.error);
