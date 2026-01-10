/**
 * Test script for Gemini RAG - Upload and Query PDFs
 */

import { uploadPdfFromUrl, listUploadedFiles, queryDocuments } from './lib';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

async function testRag() {
    console.log('=== TESTE GEMINI RAG ===\n');

    // 1. List existing files
    console.log('📋 1. Ficheiros já carregados:');
    try {
        const files = await listUploadedFiles();
        console.log(`   ${files.length} ficheiros`);
        files.slice(0, 3).forEach(f => console.log(`   - ${f.displayName} (${f.state})`));
    } catch (e: any) {
        console.log(`   Erro: ${e.message}`);
    }

    // 2. Upload a sample PDF from PT2030
    console.log('\n📤 2. Upload PDF de teste:');
    let testFileUri: string | null = null;
    try {
        const testPdfUrl = 'https://portugal2030.pt/wp-json/avisos/download?path=/uploads/ficheiros/avisos2020/AVISO_27_2024_PT2020_Capacitacao_FAMI.pdf';
        const uploaded = await uploadPdfFromUrl(testPdfUrl, 'AVISO_27_2024_Capacitacao');
        testFileUri = uploaded.uri;
        console.log(`   ✅ Uploaded: ${uploaded.name}`);
    } catch (e: any) {
        console.log(`   Erro upload: ${e.message}`);
    }

    // 3. Query the document
    if (testFileUri) {
        console.log('\n🔍 3. Query RAG:');
        try {
            const result = await queryDocuments(
                'Qual é o objetivo deste aviso e quem são os beneficiários elegíveis?',
                [testFileUri]
            );
            console.log('   Resposta:', result.answer.slice(0, 500));
        } catch (e: any) {
            console.log(`   Erro query: ${e.message}`);
        }
    }

    console.log('\n=== FIM TESTE ===');
}

testRag().catch(console.error);
