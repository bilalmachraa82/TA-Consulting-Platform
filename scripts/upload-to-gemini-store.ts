#!/usr/bin/env node
/**
 * Upload de Candidaturas Históricas para Gemini File Search Store
 * 
 * Este script:
 * 1. Lê ficheiros Markdown processados pelo Docling (ou originais se Docling não foi executado)
 * 2. Cria uma nova Gemini File Search Store para candidaturas
 * 3. Faz upload de cada ficheiro com metadata (programa, cliente, ano)
 * 4. Atualiza a tabela CandidaturaHistorica com o status de RAG
 * 
 * Uso: npx tsx scripts/upload-to-gemini-store.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient, RagStatus } from '@prisma/client';
import {
    createFileSearchStore,
    uploadLocalFileToGeminiFilesApi,
    waitForGeminiFileActive,
    importFileToSearchStore,
    waitForOperationDone,
    CustomMetadataValue,
} from '../lib/rag/gemini-file-search';

const prisma = new PrismaClient();

// Configuração
const MARKDOWN_DIR = path.join(process.cwd(), '__tests__/candidaturas_markdown');
const ORIGINAL_DIR = path.join(process.cwd(), '__tests__/candidaturas_processadas');
const STORE_DISPLAY_NAME = 'candidaturas-ta-consulting';
const BATCH_SIZE = 5; // Processar 5 ficheiros em paralelo
const DELAY_BETWEEN_BATCHES = 2000; // 2 segundos entre batches

interface FileToUpload {
    localPath: string;
    programa: string;
    subPrograma: string;
    cliente: string;
    ano: number | null;
    candidaturaId: string;
}

async function getFilesToUpload(): Promise<FileToUpload[]> {
    console.log('📋 A obter lista de ficheiros para upload...');

    // Obter candidaturas de ALTA prioridade que ainda não foram indexadas
    const candidaturas = await prisma.candidaturaHistorica.findMany({
        where: {
            prioridade: 'ALTA',
            ragStatus: 'PENDING',
        },
        select: {
            id: true,
            programa: true,
            subPrograma: true,
            cliente: true,
            ano: true,
            documentos: true,
        },
    });

    console.log(`   Candidaturas ALTA + PENDING: ${candidaturas.length}`);

    const files: FileToUpload[] = [];

    for (const cand of candidaturas) {
        const docs = cand.documentos as Array<{ nome: string; path: string; tipo: string; prioridade: string }>;

        // Filtrar apenas documentos de alta prioridade
        const highValueDocs = docs.filter(d => d.prioridade === 'ALTA');

        for (const doc of highValueDocs) {
            // Tentar primeiro o ficheiro Markdown (processado pelo Docling)
            const mdPath = path.join(MARKDOWN_DIR, doc.path.replace(/\.[^.]+$/, '.md'));

            // Se não existir, usar o original
            const originalPath = path.join(ORIGINAL_DIR, doc.path.replace(/^Candidaturas\//, ''));

            let localPath: string | null = null;

            if (fs.existsSync(mdPath)) {
                localPath = mdPath;
            } else if (fs.existsSync(originalPath)) {
                localPath = originalPath;
            }

            if (localPath) {
                files.push({
                    localPath,
                    programa: cand.programa,
                    subPrograma: cand.subPrograma || '',
                    cliente: cand.cliente,
                    ano: cand.ano,
                    candidaturaId: cand.id,
                });
            }
        }
    }

    console.log(`   Ficheiros a processar: ${files.length}`);
    return files;
}

async function uploadFile(
    storeName: string,
    file: FileToUpload
): Promise<{ success: boolean; geminiFileName?: string; error?: string }> {
    try {
        const displayName = path.basename(file.localPath);

        // 1. Upload para Files API
        const uploadedFile = await uploadLocalFileToGeminiFilesApi(
            file.localPath,
            displayName
        );

        // 2. Esperar que fique ACTIVE
        await waitForGeminiFileActive(uploadedFile.name, { timeoutMs: 120000 });

        // 3. Criar metadata
        const customMetadata: CustomMetadataValue[] = [
            { key: 'programa', stringValue: file.programa },
            { key: 'cliente', stringValue: file.cliente },
            { key: 'tipo', stringValue: 'candidatura_historica' },
        ];

        if (file.subPrograma) {
            customMetadata.push({ key: 'sub_programa', stringValue: file.subPrograma });
        }

        if (file.ano) {
            customMetadata.push({ key: 'ano', numericValue: file.ano });
        }

        // 4. Importar para a Store
        const importOp = await importFileToSearchStore(
            storeName,
            uploadedFile.name,
            customMetadata
        );

        // 5. Esperar conclusão do import
        await waitForOperationDone(importOp.name, { timeoutMs: 60000 });

        return { success: true, geminiFileName: uploadedFile.name };

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

    // Obter ficheiros
    const files = await getFilesToUpload();

    if (files.length === 0) {
        console.log('\n✅ Nenhum ficheiro para processar (todos já indexados ou não há ALTA prioridade)');
        await prisma.$disconnect();
        return;
    }

    // Verificar se já existe uma store ou criar nova
    let storeName: string;
    const existingStoreId = process.env.GEMINI_CANDIDATURAS_STORE_ID;

    if (existingStoreId) {
        storeName = existingStoreId;
        console.log(`\n📦 Usando store existente: ${storeName}`);
    } else {
        console.log(`\n📦 Criando nova store: ${STORE_DISPLAY_NAME}`);
        const store = await createFileSearchStore(STORE_DISPLAY_NAME);
        storeName = store.name;
        console.log(`   Store criada: ${storeName}`);
        console.log(`\n   ⚠️ Adicione ao .env: GEMINI_CANDIDATURAS_STORE_ID="${storeName}"`);
    }

    // Processar em batches
    console.log(`\n📤 A processar ${files.length} ficheiros em batches de ${BATCH_SIZE}...\n`);

    let successCount = 0;
    let failCount = 0;
    const candidaturasToUpdate = new Map<string, { success: boolean; geminiFileUri?: string }>();

    for (let i = 0; i < files.length; i += BATCH_SIZE) {
        const batch = files.slice(i, i + BATCH_SIZE);
        const batchNum = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(files.length / BATCH_SIZE);

        console.log(`   Batch ${batchNum}/${totalBatches}...`);

        const results = await Promise.all(
            batch.map(async (file) => {
                const result = await uploadFile(storeName, file);

                if (result.success) {
                    console.log(`      ✅ ${path.basename(file.localPath).slice(0, 40)}`);
                    successCount++;

                    // Marcar candidatura para update
                    candidaturasToUpdate.set(file.candidaturaId, {
                        success: true,
                        geminiFileUri: result.geminiFileName,
                    });
                } else {
                    console.log(`      ❌ ${path.basename(file.localPath).slice(0, 40)}: ${result.error?.slice(0, 30)}`);
                    failCount++;

                    candidaturasToUpdate.set(file.candidaturaId, { success: false });
                }

                return result;
            })
        );

        // Delay entre batches para não sobrecarregar a API
        if (i + BATCH_SIZE < files.length) {
            await new Promise(r => setTimeout(r, DELAY_BETWEEN_BATCHES));
        }
    }

    // Atualizar status das candidaturas na DB
    console.log('\n📊 A atualizar status na base de dados...');

    for (const [candId, status] of candidaturasToUpdate) {
        await prisma.candidaturaHistorica.update({
            where: { id: candId },
            data: {
                ragStatus: status.success ? RagStatus.INDEXED : RagStatus.FAILED,
                ragStoreId: status.success ? storeName : null,
                ragIndexedAt: status.success ? new Date() : null,
            },
        });
    }

    // Sumário
    console.log('\n' + '='.repeat(60));
    console.log('✅ UPLOAD CONCLUÍDO');
    console.log('='.repeat(60));
    console.log(`\n   Total ficheiros: ${files.length}`);
    console.log(`   Sucesso: ${successCount}`);
    console.log(`   Falhas: ${failCount}`);
    console.log(`\n   Store: ${storeName}`);

    // Stats da DB
    const stats = await prisma.candidaturaHistorica.groupBy({
        by: ['ragStatus'],
        _count: { id: true },
    });

    console.log('\n   Status RAG na DB:');
    stats.forEach(s => {
        console.log(`      ${s.ragStatus}: ${s._count.id}`);
    });

    await prisma.$disconnect();
}

main().catch(async (error) => {
    console.error('❌ Erro:', error);
    await prisma.$disconnect();
    process.exit(1);
});
