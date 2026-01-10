#!/usr/bin/env node
/**
 * Relatório de Cobertura por Sub-Programa
 * 
 * Verifica se cada sub-programa tem documentos suficientes de alta prioridade
 * para treino de RAG eficaz (mínimo recomendado: 5 documentos)
 * 
 * Uso: npx tsx scripts/coverage-report.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

const TESTS_DIR = path.join(process.cwd(), '__tests__');
const INPUT_FILE = path.join(TESTS_DIR, 'candidaturas_inventario.xlsx');
const OUTPUT_FILE = path.join(TESTS_DIR, 'candidaturas_cobertura.xlsx');

const MIN_DOCS_RECOMMENDED = 5;

interface FileEntry {
    id: number;
    zip_origem: string;
    path_completo: string;
    nome_ficheiro: string;
    extensao: string;
    tamanho_bytes: number;
    programa: string;
    sub_programa: string;
    cliente: string;
    tipo_documento: string;
    prioridade: 'ALTA' | 'MEDIA' | 'BAIXA';
}

interface SubProgramaCoverage {
    programa: string;
    sub_programa: string;
    total_ficheiros: number;
    alta_prioridade: number;
    media_prioridade: number;
    clientes_unicos: number;
    cobertura_status: 'EXCELENTE' | 'BOA' | 'BAIXA' | 'CRITICA';
    acao_recomendada: string;
}

function getCoverageStatus(alta: number): 'EXCELENTE' | 'BOA' | 'BAIXA' | 'CRITICA' {
    if (alta >= 20) return 'EXCELENTE';
    if (alta >= 10) return 'BOA';
    if (alta >= MIN_DOCS_RECOMMENDED) return 'BAIXA';
    return 'CRITICA';
}

function getRecommendedAction(status: string, alta: number, media: number): string {
    switch (status) {
        case 'EXCELENTE':
            return 'Nenhuma - cobertura adequada';
        case 'BOA':
            return alta < 15 ? `Considerar promover ${Math.min(5, media)} de MÉDIA para ALTA` : 'Nenhuma';
        case 'BAIXA':
            return `Promover ${Math.min(10, media)} docs de MÉDIA para ALTA`;
        case 'CRITICA':
            return media > 0
                ? `URGENTE: Promover ${media} docs de MÉDIA para ALTA`
                : 'URGENTE: Rever critérios - sem docs suficientes';
        default:
            return 'Desconhecido';
    }
}

async function main() {
    console.log('📊 Gerando Relatório de Cobertura por Sub-Programa...\n');

    // Ler inventário
    if (!fs.existsSync(INPUT_FILE)) {
        console.error('❌ Ficheiro não encontrado:', INPUT_FILE);
        process.exit(1);
    }

    const workbook = XLSX.readFile(INPUT_FILE);
    const sheet = workbook.Sheets['Inventário'];
    const entries: FileEntry[] = XLSX.utils.sheet_to_json(sheet);

    console.log(`📄 Ficheiros carregados: ${entries.length}\n`);

    // Agrupar por programa + sub_programa
    const coverage = new Map<string, SubProgramaCoverage>();
    const clientesPorSubPrograma = new Map<string, Set<string>>();

    for (const entry of entries) {
        const key = `${entry.programa}|${entry.sub_programa}`;

        if (!coverage.has(key)) {
            coverage.set(key, {
                programa: entry.programa,
                sub_programa: entry.sub_programa || '(raiz)',
                total_ficheiros: 0,
                alta_prioridade: 0,
                media_prioridade: 0,
                clientes_unicos: 0,
                cobertura_status: 'CRITICA',
                acao_recomendada: '',
            });
            clientesPorSubPrograma.set(key, new Set());
        }

        const cov = coverage.get(key)!;
        cov.total_ficheiros++;

        if (entry.prioridade === 'ALTA') cov.alta_prioridade++;
        if (entry.prioridade === 'MEDIA') cov.media_prioridade++;

        if (entry.cliente) {
            clientesPorSubPrograma.get(key)!.add(entry.cliente);
        }
    }

    // Calcular status e recomendações
    for (const [key, cov] of coverage) {
        cov.clientes_unicos = clientesPorSubPrograma.get(key)!.size;
        cov.cobertura_status = getCoverageStatus(cov.alta_prioridade);
        cov.acao_recomendada = getRecommendedAction(cov.cobertura_status, cov.alta_prioridade, cov.media_prioridade);
    }

    // Ordenar por programa e depois por alta_prioridade (ascendente = piores primeiro)
    const coverageArray = Array.from(coverage.values())
        .sort((a, b) => {
            if (a.programa !== b.programa) return a.programa.localeCompare(b.programa);
            return a.alta_prioridade - b.alta_prioridade;
        });

    // Estatísticas globais
    const stats = {
        total_sub_programas: coverageArray.length,
        excelente: coverageArray.filter(c => c.cobertura_status === 'EXCELENTE').length,
        boa: coverageArray.filter(c => c.cobertura_status === 'BOA').length,
        baixa: coverageArray.filter(c => c.cobertura_status === 'BAIXA').length,
        critica: coverageArray.filter(c => c.cobertura_status === 'CRITICA').length,
    };

    console.log('='.repeat(60));
    console.log('📋 RESUMO DE COBERTURA');
    console.log('='.repeat(60));
    console.log(`\n   Total de sub-programas: ${stats.total_sub_programas}`);
    console.log(`   ✅ EXCELENTE (≥20 ALTA): ${stats.excelente}`);
    console.log(`   🟢 BOA (10-19 ALTA): ${stats.boa}`);
    console.log(`   🟡 BAIXA (5-9 ALTA): ${stats.baixa}`);
    console.log(`   🔴 CRÍTICA (<5 ALTA): ${stats.critica}`);

    // Sub-programas críticos
    const criticos = coverageArray.filter(c => c.cobertura_status === 'CRITICA');
    if (criticos.length > 0) {
        console.log('\n⚠️ SUB-PROGRAMAS CRÍTICOS (precisam atenção):');
        criticos.slice(0, 10).forEach(c => {
            console.log(`   - ${c.programa}/${c.sub_programa}: ${c.alta_prioridade} ALTA, ${c.media_prioridade} MÉDIA`);
        });
    }

    // Criar Excel
    const outputWorkbook = XLSX.utils.book_new();

    // Sheet 1: Cobertura completa
    const coverageSheet = XLSX.utils.json_to_sheet(coverageArray);
    XLSX.utils.book_append_sheet(outputWorkbook, coverageSheet, 'Cobertura');

    // Sheet 2: Apenas críticos
    const criticosSheet = XLSX.utils.json_to_sheet(criticos);
    XLSX.utils.book_append_sheet(outputWorkbook, criticosSheet, 'Críticos');

    // Sheet 3: Sumário por programa
    const porPrograma = new Map<string, { programa: string; sub_programas: number; alta: number; status_medio: string }>();
    for (const cov of coverageArray) {
        if (!porPrograma.has(cov.programa)) {
            porPrograma.set(cov.programa, { programa: cov.programa, sub_programas: 0, alta: 0, status_medio: '' });
        }
        porPrograma.get(cov.programa)!.sub_programas++;
        porPrograma.get(cov.programa)!.alta += cov.alta_prioridade;
    }
    const porProgramaArray = Array.from(porPrograma.values()).sort((a, b) => b.alta - a.alta);
    const porProgramaSheet = XLSX.utils.json_to_sheet(porProgramaArray);
    XLSX.utils.book_append_sheet(outputWorkbook, porProgramaSheet, 'Por Programa');

    // Sheet 4: Estatísticas
    const statsData = [
        { metrica: 'Total sub-programas', valor: stats.total_sub_programas },
        { metrica: 'EXCELENTE (≥20 ALTA)', valor: stats.excelente },
        { metrica: 'BOA (10-19 ALTA)', valor: stats.boa },
        { metrica: 'BAIXA (5-9 ALTA)', valor: stats.baixa },
        { metrica: 'CRÍTICA (<5 ALTA)', valor: stats.critica },
        { metrica: '', valor: '' },
        { metrica: 'Taxa de cobertura adequada', valor: `${((stats.excelente + stats.boa) / stats.total_sub_programas * 100).toFixed(1)}%` },
    ];
    const statsSheet = XLSX.utils.json_to_sheet(statsData);
    XLSX.utils.book_append_sheet(outputWorkbook, statsSheet, 'Estatísticas');

    XLSX.writeFile(outputWorkbook, OUTPUT_FILE);

    console.log(`\n✅ Relatório exportado: ${OUTPUT_FILE}`);
    console.log(`\n📊 Sheets:`);
    console.log(`   1. Cobertura - Todos os ${stats.total_sub_programas} sub-programas`);
    console.log(`   2. Críticos - ${stats.critica} sub-programas que precisam atenção`);
    console.log(`   3. Por Programa - Agregado`);
    console.log(`   4. Estatísticas - Resumo`);
}

main().catch(console.error);
