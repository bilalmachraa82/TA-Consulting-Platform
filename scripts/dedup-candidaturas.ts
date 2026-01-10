#!/usr/bin/env node
/**
 * Script para identificar ficheiros duplicados no inventário de candidaturas
 * 
 * Estratégia:
 * 1. Ler o Excel de inventário
 * 2. Identificar duplicados por nome + tamanho (sem extrair os ficheiros)
 * 3. Verificar overlap entre as duas séries de ZIPs
 * 4. Atualizar o Excel com flags de duplicado
 * 
 * Uso: npx tsx scripts/dedup-candidaturas.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

const TESTS_DIR = path.join(process.cwd(), '__tests__');
const INPUT_FILE = path.join(TESTS_DIR, 'candidaturas_inventario.xlsx');
const OUTPUT_FILE = path.join(TESTS_DIR, 'candidaturas_inventario_dedup.xlsx');

interface FileEntry {
    id: number;
    zip_origem: string;
    path_completo: string;
    nome_ficheiro: string;
    extensao: string;
    tamanho_bytes: number;
    data_modificacao: string;
    programa: string;
    sub_programa: string;
    cliente: string;
    tipo_documento: string;
    prioridade: string;
    duplicado: boolean;
    extrair: boolean;
    // Novos campos para dedup
    grupo_duplicado?: number;
    manter?: boolean;
    serie_zip?: string;
}

function getZipSerie(zipName: string): string {
    if (zipName.includes('00-ER')) return '00-ER';
    if (zipName.includes('132446Z')) return '132446Z';
    if (zipName.includes('133130Z')) return '133130Z';
    return 'unknown';
}

function createDedupKey(entry: FileEntry): string {
    // Criar chave baseada no path relativo (sem o ZIP) + tamanho
    // Isto identifica o mesmo ficheiro em ZIPs diferentes
    const relativePath = entry.path_completo.replace(/^[^\/]+\//, '');
    return `${relativePath}|${entry.tamanho_bytes}`;
}

function analyzeExactDuplicates(entries: FileEntry[]): Map<string, FileEntry[]> {
    const groups = new Map<string, FileEntry[]>();

    for (const entry of entries) {
        const key = createDedupKey(entry);
        if (!groups.has(key)) {
            groups.set(key, []);
        }
        groups.get(key)!.push(entry);
    }

    // Filtrar apenas grupos com duplicados
    const duplicates = new Map<string, FileEntry[]>();
    for (const [key, files] of groups) {
        if (files.length > 1) {
            duplicates.set(key, files);
        }
    }

    return duplicates;
}

function analyzeSeriesOverlap(entries: FileEntry[]): {
    serie132446: number;
    serie133130: number;
    overlap: number;
    unique132446: number;
    unique133130: number;
} {
    const paths132446 = new Set<string>();
    const paths133130 = new Set<string>();

    for (const entry of entries) {
        const serie = getZipSerie(entry.zip_origem);
        const relativePath = entry.path_completo;

        if (serie === '132446Z') {
            paths132446.add(relativePath);
        } else if (serie === '133130Z') {
            paths133130.add(relativePath);
        }
    }

    let overlap = 0;
    for (const path of paths132446) {
        if (paths133130.has(path)) {
            overlap++;
        }
    }

    return {
        serie132446: paths132446.size,
        serie133130: paths133130.size,
        overlap,
        unique132446: paths132446.size - overlap,
        unique133130: paths133130.size - overlap,
    };
}

function markDuplicates(entries: FileEntry[], duplicateGroups: Map<string, FileEntry[]>): void {
    let groupId = 1;

    for (const [, files] of duplicateGroups) {
        // Marcar todos como duplicados
        for (const file of files) {
            file.duplicado = true;
            file.grupo_duplicado = groupId;
            file.serie_zip = getZipSerie(file.zip_origem);
        }

        // Decidir qual manter (preferir série mais recente: 133130Z)
        const sorted = files.sort((a, b) => {
            // Preferir série 133130Z (mais recente)
            const serieA = getZipSerie(a.zip_origem);
            const serieB = getZipSerie(b.zip_origem);
            if (serieA === '133130Z' && serieB !== '133130Z') return -1;
            if (serieB === '133130Z' && serieA !== '133130Z') return 1;

            // Se mesma série, preferir data mais recente
            return b.data_modificacao.localeCompare(a.data_modificacao);
        });

        sorted[0].manter = true;
        sorted[0].extrair = sorted[0].prioridade === 'ALTA';

        for (let i = 1; i < sorted.length; i++) {
            sorted[i].manter = false;
            sorted[i].extrair = false;
        }

        groupId++;
    }
}

function generateDedupSummary(entries: FileEntry[], duplicateGroups: Map<string, FileEntry[]>) {
    const totalFiles = entries.length;
    const totalDuplicates = Array.from(duplicateGroups.values()).reduce((sum, g) => sum + g.length, 0);
    const uniqueAfterDedup = totalFiles - totalDuplicates + duplicateGroups.size;

    const byPrioridade = {
        ALTA: { total: 0, duplicados: 0, manter: 0 },
        MEDIA: { total: 0, duplicados: 0, manter: 0 },
        BAIXA: { total: 0, duplicados: 0, manter: 0 },
    };

    for (const entry of entries) {
        const p = entry.prioridade as keyof typeof byPrioridade;
        if (byPrioridade[p]) {
            byPrioridade[p].total++;
            if (entry.duplicado) byPrioridade[p].duplicados++;
            if (entry.manter !== false) byPrioridade[p].manter++;
        }
    }

    return {
        total_ficheiros: totalFiles,
        total_duplicados: totalDuplicates,
        grupos_duplicados: duplicateGroups.size,
        ficheiros_unicos: uniqueAfterDedup,
        reducao_percentual: ((totalDuplicates - duplicateGroups.size) / totalFiles * 100).toFixed(1),
        por_prioridade: byPrioridade,
    };
}

async function main() {
    console.log('🔍 Analisando duplicados no inventário...\n');

    // Ler Excel existente
    if (!fs.existsSync(INPUT_FILE)) {
        console.error('❌ Ficheiro de inventário não encontrado:', INPUT_FILE);
        console.log('   Execute primeiro: npx tsx scripts/generate-candidaturas-inventory.ts');
        process.exit(1);
    }

    const workbook = XLSX.readFile(INPUT_FILE);
    const sheet = workbook.Sheets['Inventário'];
    const entries: FileEntry[] = XLSX.utils.sheet_to_json(sheet);

    console.log(`📊 Ficheiros carregados: ${entries.length}\n`);

    // Análise de overlap entre séries
    console.log('📈 Análise de overlap entre séries de ZIPs:\n');
    const overlap = analyzeSeriesOverlap(entries);
    console.log(`   Série 132446Z: ${overlap.serie132446} ficheiros`);
    console.log(`   Série 133130Z: ${overlap.serie133130} ficheiros`);
    console.log(`   Overlap: ${overlap.overlap} ficheiros comuns`);
    console.log(`   Únicos em 132446Z: ${overlap.unique132446}`);
    console.log(`   Únicos em 133130Z: ${overlap.unique133130}`);

    // Encontrar duplicados
    console.log('\n🔎 Procurando duplicados exactos...\n');
    const duplicateGroups = analyzeExactDuplicates(entries);

    console.log(`   Grupos de duplicados: ${duplicateGroups.size}`);
    console.log(`   Ficheiros em grupos: ${Array.from(duplicateGroups.values()).reduce((s, g) => s + g.length, 0)}`);

    // Marcar duplicados
    markDuplicates(entries, duplicateGroups);

    // Gerar sumário
    const summary = generateDedupSummary(entries, duplicateGroups);
    console.log('\n📋 Sumário de Deduplicação:\n');
    console.log(`   Total de ficheiros: ${summary.total_ficheiros}`);
    console.log(`   Ficheiros em grupos duplicados: ${summary.total_duplicados}`);
    console.log(`   Grupos únicos: ${summary.grupos_duplicados}`);
    console.log(`   Ficheiros únicos após dedup: ${summary.ficheiros_unicos}`);
    console.log(`   Redução: ${summary.reducao_percentual}%`);

    console.log('\n   Por prioridade:');
    for (const [prio, stats] of Object.entries(summary.por_prioridade)) {
        console.log(`     ${prio}: ${stats.total} total, ${stats.duplicados} duplicados, ${stats.manter} a manter`);
    }

    // Verificar ZIPs 00-ER
    const erFiles = entries.filter(e => e.zip_origem.includes('00-ER'));
    const erDuplicates = erFiles.filter(e => e.duplicado);
    console.log(`\n🏗️ Análise 00-ER-003:`);
    console.log(`   Total de ficheiros: ${erFiles.length}`);
    console.log(`   Duplicados (entre os 2 ZIPs): ${erDuplicates.length}`);
    console.log(`   → ${erDuplicates.length === erFiles.length / 2 ? '✓ Os 2 ZIPs são IDÊNTICOS - pode eliminar 1' : '⚠️ Há diferenças entre os ZIPs'}`);

    // Criar novo workbook com dados atualizados
    const newWorkbook = XLSX.utils.book_new();

    // Sheet 1: Inventário atualizado
    const inventarioSheet = XLSX.utils.json_to_sheet(entries);
    XLSX.utils.book_append_sheet(newWorkbook, inventarioSheet, 'Inventário');

    // Sheet 2: Apenas ficheiros a manter
    const toKeep = entries.filter(e => e.manter !== false);
    const keepSheet = XLSX.utils.json_to_sheet(toKeep);
    XLSX.utils.book_append_sheet(newWorkbook, keepSheet, 'A Manter');

    // Sheet 3: Apenas alta prioridade a extrair
    const toExtract = entries.filter(e => e.extrair === true && e.manter !== false);
    const extractSheet = XLSX.utils.json_to_sheet(toExtract);
    XLSX.utils.book_append_sheet(newWorkbook, extractSheet, 'A Extrair');

    // Sheet 4: Duplicados
    const duplicados = entries.filter(e => e.duplicado);
    const dupSheet = XLSX.utils.json_to_sheet(duplicados);
    XLSX.utils.book_append_sheet(newWorkbook, dupSheet, 'Duplicados');

    // Sheet 5: Sumário
    const summaryData = [
        { metrica: 'Total de ficheiros', valor: summary.total_ficheiros },
        { metrica: 'Ficheiros duplicados', valor: summary.total_duplicados },
        { metrica: 'Grupos de duplicados', valor: summary.grupos_duplicados },
        { metrica: 'Ficheiros únicos', valor: summary.ficheiros_unicos },
        { metrica: 'Redução (%)', valor: summary.reducao_percentual },
        { metrica: '', valor: '' },
        { metrica: 'ALTA - Total', valor: summary.por_prioridade.ALTA.total },
        { metrica: 'ALTA - A manter', valor: summary.por_prioridade.ALTA.manter },
        { metrica: 'MEDIA - Total', valor: summary.por_prioridade.MEDIA.total },
        { metrica: 'MEDIA - A manter', valor: summary.por_prioridade.MEDIA.manter },
        { metrica: 'BAIXA - Total', valor: summary.por_prioridade.BAIXA.total },
        { metrica: 'BAIXA - A manter', valor: summary.por_prioridade.BAIXA.manter },
    ];
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(newWorkbook, summarySheet, 'Sumário');

    // Guardar
    XLSX.writeFile(newWorkbook, OUTPUT_FILE);

    console.log(`\n✅ Inventário atualizado: ${OUTPUT_FILE}`);
    console.log(`\n📊 Sheets criadas:`);
    console.log(`   1. Inventário - Todos os ficheiros com flags de duplicado`);
    console.log(`   2. A Manter - ${toKeep.length} ficheiros únicos`);
    console.log(`   3. A Extrair - ${toExtract.length} ficheiros de alta prioridade`);
    console.log(`   4. Duplicados - ${duplicados.length} ficheiros duplicados`);
    console.log(`   5. Sumário - Estatísticas gerais`);
}

main().catch(console.error);
