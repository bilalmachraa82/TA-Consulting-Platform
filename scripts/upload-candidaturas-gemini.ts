#!/usr/bin/env node
/**
 * Upload Direto de Candidaturas para Gemini File Search Store
 * 
 * Versão simplificada que:
 * 1. Lê ficheiros diretamente do diretório extraído
 * 2. Cria uma nova Gemini File Search Store
 * 3. Faz upload com metadata (programa, cliente)
 * 
 * Uso: npx tsx scripts/upload-candidaturas-gemini.ts
 */

// Carregar variáveis de ambiente
import 'dotenv/config';

import * as fs from 'fs';
import * as path from 'path';
import {
    createFileSearchStore,
    uploadLocalFileToGeminiFilesApi,
    waitForGeminiFileActive,
    importFileToSearchStore,
    waitForOperationDone,
    CustomMetadataValue,
} from '../lib/rag/gemini-file-search';

const INPUT_DIR = path.join(process.cwd(), '__tests__/candidaturas_processadas');
const STORE_DISPLAY_NAME = 'candidaturas-ta-consulting';

// Extensões suportadas pelo Gemini File Search
const SUPPORTED_EXTENSIONS = new Set(['.pdf', '.docx', '.doc', '.xlsx', '.xls', '.txt', '.md', '.json']);

interface FileInfo {
    path: string;
    programa: string;
    cliente: string;
    name: string;
}

function findFiles(dir: string, programa: string = '', cliente: string = ''): FileInfo[] {
    const files: FileInfo[] = [];

    if (!fs.existsSync(dir)) return files;

    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
        const fullPath = path.join(dir, item.name);

        if (item.isDirectory()) {
            // Determinar programa e cliente baseado na estrutura
            let newPrograma = programa;
            let newCliente = cliente;

            // Primeiro nível = programa (PRR, P2030, etc.)
            if (!programa) {
                newPrograma = item.name;
            } else if (!cliente) {
                // Segundo nível pode ser sub-programa ou cliente
                newCliente = item.name;
            }

            files.push(...findFiles(fullPath, newPrograma, newCliente));
        } else {
            const ext = path.extname(item.name).toLowerCase();
            if (SUPPORTED_EXTENSIONS.has(ext)) {
                files.push({
                    path: fullPath,
                    programa: programa || 'Desconhecido',
                    cliente: cliente || 'Desconhecido',
                    name: item.name,
                });
            }
        }
    }

    return files;
}

async function uploadFile(
    storeName: string,
    file: FileInfo
): Promise<{ success: boolean; error?: string }> {
    try {
        // 1. Upload para Files API
        const uploadedFile = await uploadLocalFileToGeminiFilesApi(
            file.path,
            file.name
        );

        // 2. Esperar que fique ACTIVE
        await waitForGeminiFileActive(uploadedFile.name, { timeoutMs: 120000 });

        // 3. Criar metadata
        const customMetadata: CustomMetadataValue[] = [
            { key: 'programa', stringValue: file.programa },
            { key: 'cliente', stringValue: file.cliente },
            { key: 'tipo', stringValue: 'candidatura_historica' },
        ];

        // 4. Importar para a Store
        const importOp = await importFileToSearchStore(
            storeName,
            uploadedFile.name,
            customMetadata
        );

        // 5. Esperar conclusão do import
        await waitForOperationDone(importOp.name, { timeoutMs: 60000 });

        return { success: true };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

async function main() {
    console.log('🚀 Upload de Candidaturas para Gemini File Search Store\n');
    console.log('='.repeat(60));

    // Verificar API key
    if (!process.env.GEMINI_API_KEY) {
        console.error('❌ GEMINI_API_KEY não configurada');
        process.exit(1);
    }

    // Verificar diretório
    if (!fs.existsSync(INPUT_DIR)) {
        console.error('❌ Diretório não encontrado:', INPUT_DIR);
        console.log('   Execute primeiro: npx tsx scripts/extract-high-value-files.ts');
        process.exit(1);
    }

    // Encontrar ficheiros
    console.log('\n📁 A procurar ficheiros...');
    const files = findFiles(INPUT_DIR);

    console.log(`   Encontrados: ${files.length} ficheiros`);

    // Agrupar por programa
    const byPrograma = new Map<string, number>();
    for (const file of files) {
        byPrograma.set(file.programa, (byPrograma.get(file.programa) || 0) + 1);
    }

    console.log('\n   Por programa:');
    for (const [prog, count] of byPrograma) {
        console.log(`      ${prog}: ${count}`);
    }

    // Limitar para teste inicial (primeiros 50)
    const MAX_FILES = parseInt(process.env.MAX_UPLOAD_FILES || '50');
    const filesToProcess = files.slice(0, MAX_FILES);

    if (files.length > MAX_FILES) {
        console.log(`\n   ⚠️ Limitando a ${MAX_FILES} ficheiros (de ${files.length})`);
        console.log(`      Para processar todos: MAX_UPLOAD_FILES=1000 npx tsx scripts/upload-candidaturas-gemini.ts`);
    }

    // Criar ou usar store existente
    let storeName: string;
    const existingStoreId = process.env.GEMINI_CANDIDATURAS_STORE_ID;

    if (existingStoreId) {
        storeName = existingStoreId;
        console.log(`\n📦 Usando store existente: ${storeName}`);
    } else {
        console.log(`\n📦 Criando nova store: ${STORE_DISPLAY_NAME}`);
        try {
            const store = await createFileSearchStore(STORE_DISPLAY_NAME);
            storeName = store.name;
            console.log(`   Store criada: ${storeName}`);
            console.log(`\n   ⚠️ Adicione ao .env:`);
            console.log(`   GEMINI_CANDIDATURAS_STORE_ID="${storeName}"`);
        } catch (error: any) {
            console.error('❌ Erro ao criar store:', error.message);
            process.exit(1);
        }
    }

    // Processar ficheiros
    console.log(`\n📤 A processar ${filesToProcess.length} ficheiros...\n`);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < filesToProcess.length; i++) {
        const file = filesToProcess[i];
        const progress = `[${i + 1}/${filesToProcess.length}]`;

        process.stdout.write(`   ${progress} ${file.name.slice(0, 40).padEnd(40)}... `);

        const result = await uploadFile(storeName, file);

        if (result.success) {
            console.log('✅');
            successCount++;
        } else {
            console.log(`❌ ${result.error?.slice(0, 30)}`);
            failCount++;
        }

        // Pequeno delay para não sobrecarregar a API
        await new Promise(r => setTimeout(r, 500));
    }

    // Sumário
    console.log('\n' + '='.repeat(60));
    console.log('✅ UPLOAD CONCLUÍDO');
    console.log('='.repeat(60));
    console.log(`\n   Processados: ${filesToProcess.length}`);
    console.log(`   Sucesso: ${successCount}`);
    console.log(`   Falhas: ${failCount}`);
    console.log(`\n   Store: ${storeName}`);

    if (files.length > MAX_FILES) {
        console.log(`\n   📋 Restam ${files.length - MAX_FILES} ficheiros para processar.`);
    }
}

main().catch((error) => {
    console.error('❌ Erro:', error);
    process.exit(1);
});
