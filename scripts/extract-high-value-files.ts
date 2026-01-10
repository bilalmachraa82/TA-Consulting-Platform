#!/usr/bin/env node
/**
 * Extração Seletiva de Ficheiros de Alta Prioridade
 * 
 * Extrai apenas os ficheiros classificados como ALTA prioridade
 * dos ZIPs de candidaturas para processamento RAG.
 * 
 * Uso: npx tsx scripts/extract-high-value-files.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import * as XLSX from 'xlsx';

const TESTS_DIR = path.join(process.cwd(), '__tests__');
const INPUT_FILE = path.join(TESTS_DIR, 'candidaturas_inventario_dedup.xlsx');
const OUTPUT_DIR = path.join(TESTS_DIR, 'candidaturas_processadas');

interface FileToExtract {
    zip_origem: string;
    path_completo: string;
    nome_ficheiro: string;
    prioridade: string;
}

async function main() {
    console.log('📦 Extração Seletiva de Ficheiros de Alta Prioridade\n');
    console.log('='.repeat(60));

    // Verificar input
    if (!fs.existsSync(INPUT_FILE)) {
        console.error('❌ Ficheiro não encontrado:', INPUT_FILE);
        console.log('   Execute primeiro: npx tsx scripts/dedup-candidaturas.ts');
        process.exit(1);
    }

    // Ler inventário deduplicado (sheet "A Extrair")
    const workbook = XLSX.readFile(INPUT_FILE);
    const sheetName = workbook.SheetNames.includes('A Extrair') ? 'A Extrair' : 'A Manter';
    const sheet = workbook.Sheets[sheetName];

    if (!sheet) {
        console.error('❌ Sheet não encontrada');
        process.exit(1);
    }

    const allEntries: FileToExtract[] = XLSX.utils.sheet_to_json(sheet);

    // Filtrar apenas ALTA prioridade
    const highPriorityFiles = allEntries.filter(e => e.prioridade === 'ALTA');

    console.log(`📄 Total de ficheiros: ${allEntries.length}`);
    console.log(`⭐ Alta prioridade: ${highPriorityFiles.length}`);

    if (highPriorityFiles.length === 0) {
        console.log('\n✅ Nenhum ficheiro de alta prioridade para extrair.');
        return;
    }

    // Criar diretório de output
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Agrupar por ZIP
    const byZip = new Map<string, FileToExtract[]>();
    for (const file of highPriorityFiles) {
        if (!byZip.has(file.zip_origem)) {
            byZip.set(file.zip_origem, []);
        }
        byZip.get(file.zip_origem)!.push(file);
    }

    console.log(`\n📁 Distribuição por ZIP:`);
    for (const [zip, files] of byZip) {
        console.log(`   ${zip}: ${files.length} ficheiros`);
    }

    // Extrair ficheiros
    console.log('\n📤 A extrair ficheiros...\n');

    let extracted = 0;
    let failed = 0;

    for (const [zipName, files] of byZip) {
        const zipPath = path.join(TESTS_DIR, zipName);

        if (!fs.existsSync(zipPath)) {
            console.log(`   ⚠️ ZIP não encontrado: ${zipName}`);
            failed += files.length;
            continue;
        }

        console.log(`   📦 ${zipName} (${files.length} ficheiros)...`);

        for (const file of files) {
            try {
                // Calcular path de destino
                const relativePath = file.path_completo.replace(/^Candidaturas\//, '');
                const destPath = path.join(OUTPUT_DIR, relativePath);
                const destDir = path.dirname(destPath);

                // Criar diretório de destino
                if (!fs.existsSync(destDir)) {
                    fs.mkdirSync(destDir, { recursive: true });
                }

                // Extrair ficheiro específico
                const cmd = `unzip -j -o "${zipPath}" "${file.path_completo}" -d "${destDir}" 2>/dev/null`;
                execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });

                // Verificar se extraiu
                // O unzip -j remove o path completo, então precisamos verificar pelo nome
                const extractedFile = path.join(destDir, file.nome_ficheiro);
                if (fs.existsSync(extractedFile)) {
                    extracted++;
                } else {
                    // Tentar com o path original dentro do destDir
                    failed++;
                }

            } catch (error: any) {
                failed++;
            }
        }
    }

    // Contar ficheiros extraídos
    const countFiles = (dir: string): number => {
        if (!fs.existsSync(dir)) return 0;
        let count = 0;
        const items = fs.readdirSync(dir, { withFileTypes: true });
        for (const item of items) {
            if (item.isDirectory()) {
                count += countFiles(path.join(dir, item.name));
            } else {
                count++;
            }
        }
        return count;
    };

    const totalExtracted = countFiles(OUTPUT_DIR);

    // Calcular tamanho total
    const getDirSize = (dir: string): number => {
        if (!fs.existsSync(dir)) return 0;
        let size = 0;
        const items = fs.readdirSync(dir, { withFileTypes: true });
        for (const item of items) {
            const fullPath = path.join(dir, item.name);
            if (item.isDirectory()) {
                size += getDirSize(fullPath);
            } else {
                size += fs.statSync(fullPath).size;
            }
        }
        return size;
    };

    const totalSize = getDirSize(OUTPUT_DIR);
    const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);

    // Sumário
    console.log('\n' + '='.repeat(60));
    console.log('✅ EXTRAÇÃO CONCLUÍDA');
    console.log('='.repeat(60));
    console.log(`\n   Ficheiros extraídos: ${totalExtracted}`);
    console.log(`   Tamanho total: ${sizeMB} MB`);
    console.log(`   Diretório: ${OUTPUT_DIR}`);

    console.log('\n📋 Próximos passos:');
    console.log('   1. (Opcional) pip install docling && python scripts/docling-processor.py');
    console.log('   2. npx tsx scripts/upload-to-gemini-store.ts');
}

main().catch(console.error);
