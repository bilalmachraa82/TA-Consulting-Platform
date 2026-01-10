#!/usr/bin/env node
/**
 * Comparação entre séries de ZIPs de Candidaturas
 * 
 * Compara a série nova (20251227) com a série antiga para identificar:
 * - Ficheiros novos na série nova
 * - Ficheiros em falta na série nova (que existiam na antiga)
 * - Ficheiros comuns
 * 
 * Uso: npx tsx scripts/compare-zip-series.ts
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

const TESTS_DIR = path.join(process.cwd(), '__tests__');
const OUTPUT_FILE = path.join(TESTS_DIR, 'candidaturas_comparacao.xlsx');

interface FileInfo {
    path: string;
    size: number;
    zip: string;
    serie: string;
}

function getZipFiles(pattern: string): string[] {
    return fs.readdirSync(TESTS_DIR)
        .filter(f => f.includes(pattern) && f.endsWith('.zip'))
        .sort();
}

function extractFileList(zipPath: string): Map<string, number> {
    const files = new Map<string, number>();

    try {
        const output = execSync(`LANG=C unzip -l "${zipPath}" 2>/dev/null`, {
            encoding: 'utf-8',
            maxBuffer: 50 * 1024 * 1024,
        });

        for (const line of output.split('\n')) {
            const match = line.match(/^\s*(\d+)\s+\d{2}-\d{2}-\d{4}\s+\d{2}:\d{2}\s+(.+)$/);
            if (match) {
                const [, sizeStr, filePath] = match;
                const size = parseInt(sizeStr, 10);
                if (size > 0 && !filePath.endsWith('/')) {
                    // Remove encoding issues by normalizing path
                    const normalizedPath = filePath.replace(/\+\?/g, '?');
                    files.set(normalizedPath, size);
                }
            }
        }
    } catch (error) {
        console.error(`Erro ao ler ${zipPath}`);
    }

    return files;
}

async function main() {
    console.log('🔍 Comparando séries de ZIPs...\n');

    // Identificar séries
    const oldZips = getZipFiles('20251214T133130Z'); // Série antiga mais recente
    const newZips = getZipFiles('20251227T211305Z'); // Série nova (hoje)

    console.log(`📦 Série Antiga (20251214): ${oldZips.length} ZIPs`);
    console.log(`📦 Série Nova (20251227): ${newZips.length} ZIPs`);

    // Extrair lista de ficheiros de cada série
    console.log('\n📄 A extrair lista de ficheiros da série antiga...');
    const oldFiles = new Map<string, number>();
    for (const zip of oldZips) {
        const zipPath = path.join(TESTS_DIR, zip);
        const files = extractFileList(zipPath);
        console.log(`   ${zip}: ${files.size} ficheiros`);
        for (const [path, size] of files) {
            if (!oldFiles.has(path)) {
                oldFiles.set(path, size);
            }
        }
    }
    console.log(`   Total únicos: ${oldFiles.size}`);

    console.log('\n📄 A extrair lista de ficheiros da série nova...');
    const newFiles = new Map<string, number>();
    for (const zip of newZips) {
        const zipPath = path.join(TESTS_DIR, zip);
        const files = extractFileList(zipPath);
        console.log(`   ${zip}: ${files.size} ficheiros`);
        for (const [path, size] of files) {
            if (!newFiles.has(path)) {
                newFiles.set(path, size);
            }
        }
    }
    console.log(`   Total únicos: ${newFiles.size}`);

    // Comparar
    console.log('\n📊 A comparar séries...');

    const onlyInOld: string[] = [];
    const onlyInNew: string[] = [];
    const inBoth: string[] = [];
    const sizeChanged: { path: string; oldSize: number; newSize: number }[] = [];

    // Ficheiros só na série antiga
    for (const [path, size] of oldFiles) {
        if (!newFiles.has(path)) {
            onlyInOld.push(path);
        } else {
            inBoth.push(path);
            const newSize = newFiles.get(path)!;
            if (Math.abs(size - newSize) > 100) { // Diferença significativa
                sizeChanged.push({ path, oldSize: size, newSize });
            }
        }
    }

    // Ficheiros só na série nova
    for (const [path] of newFiles) {
        if (!oldFiles.has(path)) {
            onlyInNew.push(path);
        }
    }

    // Resultados
    console.log('\n' + '='.repeat(60));
    console.log('📋 RESULTADO DA COMPARAÇÃO');
    console.log('='.repeat(60));
    console.log(`\n   Ficheiros comuns: ${inBoth.length}`);
    console.log(`   Só na série ANTIGA (em falta na nova): ${onlyInOld.length}`);
    console.log(`   Só na série NOVA (novos): ${onlyInNew.length}`);
    console.log(`   Com tamanho diferente: ${sizeChanged.length}`);

    // Criar Excel com resultados
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Sumário
    const summaryData = [
        { metrica: 'Série Antiga (20251214)', valor: `${oldZips.length} ZIPs, ${oldFiles.size} ficheiros` },
        { metrica: 'Série Nova (20251227)', valor: `${newZips.length} ZIPs, ${newFiles.size} ficheiros` },
        { metrica: '', valor: '' },
        { metrica: 'Ficheiros comuns', valor: inBoth.length },
        { metrica: 'Só na série ANTIGA (em falta)', valor: onlyInOld.length },
        { metrica: 'Só na série NOVA (novos)', valor: onlyInNew.length },
        { metrica: 'Com tamanho diferente', valor: sizeChanged.length },
    ];
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(summaryData), 'Sumário');

    // Sheet 2: Ficheiros só na série nova (NOVOS)
    const newOnlyData = onlyInNew.slice(0, 5000).map((p, i) => ({
        id: i + 1,
        path: p,
        programa: p.split('/')[1] || 'N/A',
        tamanho: newFiles.get(p) || 0,
    }));
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(newOnlyData), 'Novos (só na nova)');

    // Sheet 3: Ficheiros só na série antiga (EM FALTA)
    const oldOnlyData = onlyInOld.slice(0, 5000).map((p, i) => ({
        id: i + 1,
        path: p,
        programa: p.split('/')[1] || 'N/A',
        tamanho: oldFiles.get(p) || 0,
    }));
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(oldOnlyData), 'Em Falta (só na antiga)');

    // Sheet 4: Tamanho diferente
    const changedData = sizeChanged.slice(0, 1000).map((item, i) => ({
        id: i + 1,
        path: item.path,
        tamanho_antigo: item.oldSize,
        tamanho_novo: item.newSize,
        diferenca: item.newSize - item.oldSize,
    }));
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(changedData), 'Tamanho Diferente');

    XLSX.writeFile(workbook, OUTPUT_FILE);

    console.log(`\n✅ Comparação exportada: ${OUTPUT_FILE}`);

    // Mostrar amostra de ficheiros novos
    if (onlyInNew.length > 0) {
        console.log('\n📁 Amostra de ficheiros NOVOS (primeiros 10):');
        onlyInNew.slice(0, 10).forEach((p, i) => {
            console.log(`   ${i + 1}. ${p}`);
        });
    }

    // Mostrar amostra de ficheiros em falta
    if (onlyInOld.length > 0) {
        console.log('\n⚠️ Amostra de ficheiros EM FALTA (primeiros 10):');
        onlyInOld.slice(0, 10).forEach((p, i) => {
            console.log(`   ${i + 1}. ${p}`);
        });
    }
}

main().catch(console.error);
