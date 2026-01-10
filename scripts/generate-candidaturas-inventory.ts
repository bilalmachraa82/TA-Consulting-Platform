#!/usr/bin/env node
/**
 * Script para gerar inventário Master Excel de todos os ZIPs de candidaturas
 * 
 * Uso: npx tsx scripts/generate-candidaturas-inventory.ts
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

const TESTS_DIR = path.join(process.cwd(), '__tests__');
const OUTPUT_FILE = path.join(TESTS_DIR, 'candidaturas_inventario.xlsx');

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
    prioridade: 'ALTA' | 'MEDIA' | 'BAIXA';
    duplicado: boolean;
    extrair: boolean;
}

// Regex patterns para identificar tipos de documento de alto valor
// Corrigido após análise AoT v2.0
const HIGH_VALUE_PATTERNS = [
    /memoria.*descrit/i,
    /proposta.*tecnic/i,
    /anexo.*tecnic/i,
    /plano.*neg[oó]c/i,
    /template/i,
    /simulador/i,
    /formul[aá]rio/i,
    // Novos patterns identificados por AoT
    /analise.*merito/i,
    /justifica/i,
    /fundamenta/i,
    /business.*plan/i,
    /criterio.*avalia/i,
    // Declarações valiosas (refinado)
    /declara[cç][aã]o.*compromisso/i,
    /declara[cç][aã]o.*metodologia/i,
    /declara[cç][aã]o.*intencao/i,
];

// Patterns para documentos de baixo valor
// Refinado: declarações fiscais/legais específicas, não todas
const LOW_VALUE_PATTERNS = [
    /certid[aã]o/i,
    /fatura/i,
    /recibo/i,
    /comprovativ/i,
    // Declarações específicas de baixo valor (refinado)
    /declara[cç][aã]o.*fiscal/i,
    /declara[cç][aã]o.*seg.*social/i,
    /declara[cç][aã]o.*iva/i,
    /declara[cç][aã]o.*irc/i,
    /declara[cç][aã]o.*irs/i,
    /declara[cç][aã]o.*divida/i,
    /nota.*liquida/i,
    /balan[cç]o/i,
    /extrato/i,
];

function extractPrograma(filePath: string): string {
    const match = filePath.match(/Candidaturas\/([^\/]+)/);
    return match ? match[1] : 'Desconhecido';
}

function extractSubPrograma(filePath: string): string {
    const parts = filePath.split('/');
    if (parts.length >= 3 && parts[0] === 'Candidaturas') {
        return parts[2] || '';
    }
    return '';
}

function extractCliente(filePath: string): string {
    const parts = filePath.split('/');
    if (parts.length >= 4 && parts[0] === 'Candidaturas') {
        return parts[3] || '';
    }
    return '';
}

function detectTipoDocumento(fileName: string): string {
    const lower = fileName.toLowerCase();

    if (/memoria.*descrit/i.test(lower)) return 'memoria_descritiva';
    if (/proposta.*tecnic/i.test(lower)) return 'proposta_tecnica';
    if (/anexo.*tecnic/i.test(lower)) return 'anexo_tecnico';
    if (/plano.*neg/i.test(lower)) return 'plano_negocios';
    if (/template/i.test(lower)) return 'template';
    if (/simulador/i.test(lower)) return 'simulador';
    if (/formul/i.test(lower)) return 'formulario';
    if (/certid/i.test(lower)) return 'certidao';
    if (/fatura/i.test(lower)) return 'fatura';
    if (/declara/i.test(lower)) return 'declaracao';
    if (/or[cç]amento/i.test(lower)) return 'orcamento';
    if (/cronogram/i.test(lower)) return 'cronograma';
    if (/relat[oó]rio/i.test(lower)) return 'relatorio';

    return 'outro';
}

function detectPrioridade(fileName: string, extensao: string): 'ALTA' | 'MEDIA' | 'BAIXA' {
    // Extensões de baixo valor
    if (['.jpg', '.jpeg', '.png', '.heic', '.gif', '.bmp'].includes(extensao)) {
        return 'BAIXA';
    }
    if (['.dwg', '.dwf', '.dwfx', '.rar', '.7z'].includes(extensao)) {
        return 'BAIXA';
    }

    // Check high value patterns
    for (const pattern of HIGH_VALUE_PATTERNS) {
        if (pattern.test(fileName)) {
            return 'ALTA';
        }
    }

    // Check low value patterns
    for (const pattern of LOW_VALUE_PATTERNS) {
        if (pattern.test(fileName)) {
            return 'BAIXA';
        }
    }

    // DOCX e XLSX por defeito são média/alta
    if (extensao === '.docx' || extensao === '.xlsx') {
        return 'MEDIA';
    }

    return 'BAIXA';
}

function parseZipListing(zipName: string, output: string): FileEntry[] {
    const entries: FileEntry[] = [];
    const lines = output.split('\n');

    for (const line of lines) {
        // Parse unzip -l output format: "  size  date time   path"
        const match = line.match(/^\s*(\d+)\s+(\d{2}-\d{2}-\d{4})\s+(\d{2}:\d{2})\s+(.+)$/);
        if (!match) continue;

        const [, sizeStr, date, time, filePath] = match;
        const size = parseInt(sizeStr, 10);

        // Skip directories (size 0 and ends with /)
        if (size === 0 && filePath.endsWith('/')) continue;

        const fileName = path.basename(filePath);
        const extensao = path.extname(fileName).toLowerCase();

        // Skip temp files
        if (fileName.startsWith('~$') || fileName.startsWith('.')) continue;

        const programa = extractPrograma(filePath);
        const subPrograma = extractSubPrograma(filePath);
        const cliente = extractCliente(filePath);
        const tipoDocumento = detectTipoDocumento(fileName);
        const prioridade = detectPrioridade(fileName, extensao);

        entries.push({
            id: 0, // Will be assigned later
            zip_origem: zipName,
            path_completo: filePath,
            nome_ficheiro: fileName,
            extensao: extensao,
            tamanho_bytes: size,
            data_modificacao: `${date} ${time}`,
            programa,
            sub_programa: subPrograma,
            cliente,
            tipo_documento: tipoDocumento,
            prioridade,
            duplicado: false,
            extrair: prioridade === 'ALTA',
        });
    }

    return entries;
}

function generateSummaryByPrograma(entries: FileEntry[]): Record<string, any>[] {
    const summary: Record<string, { total: number; alta: number; media: number; baixa: number; tamanho: number }> = {};

    for (const entry of entries) {
        if (!summary[entry.programa]) {
            summary[entry.programa] = { total: 0, alta: 0, media: 0, baixa: 0, tamanho: 0 };
        }
        summary[entry.programa].total++;
        summary[entry.programa][entry.prioridade.toLowerCase() as 'alta' | 'media' | 'baixa']++;
        summary[entry.programa].tamanho += entry.tamanho_bytes;
    }

    return Object.entries(summary).map(([programa, stats]) => ({
        programa,
        total_ficheiros: stats.total,
        alta_prioridade: stats.alta,
        media_prioridade: stats.media,
        baixa_prioridade: stats.baixa,
        tamanho_gb: (stats.tamanho / (1024 * 1024 * 1024)).toFixed(2),
    })).sort((a, b) => b.total_ficheiros - a.total_ficheiros);
}

function generateSummaryByTipo(entries: FileEntry[]): Record<string, any>[] {
    const summary: Record<string, { total: number; tamanho: number }> = {};

    for (const entry of entries) {
        const tipo = entry.tipo_documento;
        if (!summary[tipo]) {
            summary[tipo] = { total: 0, tamanho: 0 };
        }
        summary[tipo].total++;
        summary[tipo].tamanho += entry.tamanho_bytes;
    }

    return Object.entries(summary).map(([tipo, stats]) => ({
        tipo_documento: tipo,
        quantidade: stats.total,
        tamanho_mb: (stats.tamanho / (1024 * 1024)).toFixed(2),
    })).sort((a, b) => b.quantidade - a.quantidade);
}

async function main() {
    console.log('🔍 Gerando inventário de candidaturas...\n');

    // Find all ZIP files
    const zipFiles = fs.readdirSync(TESTS_DIR)
        .filter(f => f.endsWith('.zip'))
        .sort();

    console.log(`📦 Encontrados ${zipFiles.length} ficheiros ZIP\n`);

    const allEntries: FileEntry[] = [];
    let currentId = 1;

    for (const zipFile of zipFiles) {
        console.log(`  📄 Processando: ${zipFile}`);

        try {
            const zipPath = path.join(TESTS_DIR, zipFile);
            const output = execSync(`LANG=C unzip -l "${zipPath}" 2>/dev/null`, {
                encoding: 'utf-8',
                maxBuffer: 50 * 1024 * 1024, // 50MB buffer
            });

            const entries = parseZipListing(zipFile, output);

            // Assign IDs
            for (const entry of entries) {
                entry.id = currentId++;
                allEntries.push(entry);
            }

            console.log(`     ✓ ${entries.length} ficheiros encontrados`);
        } catch (error) {
            console.error(`     ✗ Erro ao processar ${zipFile}:`, error);
        }
    }

    console.log(`\n📊 Total: ${allEntries.length} ficheiros\n`);

    // Generate summaries
    const summaryByPrograma = generateSummaryByPrograma(allEntries);
    const summaryByTipo = generateSummaryByTipo(allEntries);

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Inventário completo
    const inventarioSheet = XLSX.utils.json_to_sheet(allEntries);
    XLSX.utils.book_append_sheet(workbook, inventarioSheet, 'Inventário');

    // Sheet 2: Sumário por Programa
    const programaSheet = XLSX.utils.json_to_sheet(summaryByPrograma);
    XLSX.utils.book_append_sheet(workbook, programaSheet, 'Por Programa');

    // Sheet 3: Sumário por Tipo
    const tipoSheet = XLSX.utils.json_to_sheet(summaryByTipo);
    XLSX.utils.book_append_sheet(workbook, tipoSheet, 'Por Tipo');

    // Sheet 4: Ficheiros de Alta Prioridade
    const altaPrioridade = allEntries.filter(e => e.prioridade === 'ALTA');
    const altaSheet = XLSX.utils.json_to_sheet(altaPrioridade);
    XLSX.utils.book_append_sheet(workbook, altaSheet, 'Alta Prioridade');

    // Write file
    XLSX.writeFile(workbook, OUTPUT_FILE);

    console.log(`✅ Inventário gerado: ${OUTPUT_FILE}`);
    console.log(`\n📈 Estatísticas:`);
    console.log(`   Total de ficheiros: ${allEntries.length}`);
    console.log(`   Alta prioridade: ${altaPrioridade.length}`);
    console.log(`   Programas: ${summaryByPrograma.length}`);

    console.log(`\n📋 Top 5 Programas:`);
    summaryByPrograma.slice(0, 5).forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.programa}: ${p.total_ficheiros} ficheiros (${p.alta_prioridade} alta prioridade)`);
    });
}

main().catch(console.error);
