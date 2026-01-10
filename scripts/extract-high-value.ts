#!/usr/bin/env node
/**
 * Script para extrair ficheiros de alta prioridade dos ZIPs
 * 
 * Estratégia:
 * 1. Ler o Excel de inventário deduplicado
 * 2. Filtrar ficheiros marcados para extrair (alta prioridade, não duplicados)
 * 3. Extrair cada ficheiro para estrutura organizada
 * 
 * Uso: npx tsx scripts/extract-high-value.ts
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

const TESTS_DIR = path.join(process.cwd(), '__tests__');
const INPUT_FILE = path.join(TESTS_DIR, 'candidaturas_inventario_dedup.xlsx');
const OUTPUT_DIR = path.join(TESTS_DIR, 'candidaturas_processadas');

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
    grupo_duplicado?: number;
    manter?: boolean;
    serie_zip?: string;
}

function sanitizePath(str: string): string {
    // Remove caracteres problemáticos para paths
    return str
        .replace(/[<>:"|?*]/g, '_')
        .replace(/\s+/g, '_')
        .replace(/__+/g, '_')
        .substring(0, 100); // Limitar tamanho
}

function extractFile(zipPath: string, filePath: string, outputPath: string): boolean {
    try {
        // Criar diretório de destino
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Extrair ficheiro específico
        // Usar unzip com -p para stdout e redirecionar para ficheiro
        const cmd = `LANG=C unzip -p "${zipPath}" "${filePath}" > "${outputPath}"`;
        execSync(cmd, {
            encoding: 'utf-8',
            maxBuffer: 100 * 1024 * 1024, // 100MB buffer
        });

        return true;
    } catch (error) {
        console.error(`     ✗ Erro ao extrair: ${filePath}`);
        return false;
    }
}

async function main() {
    console.log('📦 Extraindo ficheiros de alta prioridade...\n');

    // Verificar ficheiro de input
    if (!fs.existsSync(INPUT_FILE)) {
        console.error('❌ Ficheiro de inventário não encontrado:', INPUT_FILE);
        console.log('   Execute primeiro: npx tsx scripts/dedup-candidaturas.ts');
        process.exit(1);
    }

    // Ler Excel
    const workbook = XLSX.readFile(INPUT_FILE);
    const sheet = workbook.Sheets['A Extrair'];

    if (!sheet) {
        console.error('❌ Sheet "A Extrair" não encontrada no ficheiro');
        process.exit(1);
    }

    const entries: FileEntry[] = XLSX.utils.sheet_to_json(sheet);
    console.log(`📊 Ficheiros a extrair: ${entries.length}\n`);

    // Criar diretório de output
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Agrupar por programa para melhor organização
    const byPrograma = new Map<string, FileEntry[]>();
    for (const entry of entries) {
        const prog = entry.programa || 'Outros';
        if (!byPrograma.has(prog)) {
            byPrograma.set(prog, []);
        }
        byPrograma.get(prog)!.push(entry);
    }

    console.log('📁 Estrutura de destino:');
    console.log(`   ${OUTPUT_DIR}/\n`);

    let extracted = 0;
    let failed = 0;
    const extractedFiles: { original: string; destino: string; programa: string }[] = [];

    for (const [programa, files] of byPrograma) {
        console.log(`\n📂 ${programa} (${files.length} ficheiros)`);

        for (const entry of files) {
            const zipPath = path.join(TESTS_DIR, entry.zip_origem);

            // Construir path de destino organizado
            const subProgSafe = sanitizePath(entry.sub_programa || 'geral');
            const clienteSafe = sanitizePath(entry.cliente || 'sem_cliente');
            const tipoSafe = sanitizePath(entry.tipo_documento || 'outro');

            const destDir = path.join(
                OUTPUT_DIR,
                sanitizePath(programa),
                subProgSafe,
                clienteSafe
            );

            // Nome do ficheiro com prefixo de tipo para organização
            const destFileName = `${tipoSafe}_${entry.nome_ficheiro}`;
            const destPath = path.join(destDir, destFileName);

            // Verificar se já existe
            if (fs.existsSync(destPath)) {
                console.log(`   ⏭️  Já existe: ${entry.nome_ficheiro}`);
                extracted++;
                continue;
            }

            // Extrair
            const success = extractFile(zipPath, entry.path_completo, destPath);

            if (success) {
                console.log(`   ✓ ${entry.nome_ficheiro}`);
                extracted++;
                extractedFiles.push({
                    original: entry.path_completo,
                    destino: destPath,
                    programa: programa,
                });
            } else {
                failed++;
            }
        }
    }

    // Estatísticas finais
    console.log('\n' + '='.repeat(50));
    console.log('\n📊 Resultado da Extração:\n');
    console.log(`   ✓ Extraídos com sucesso: ${extracted}`);
    console.log(`   ✗ Falharam: ${failed}`);
    console.log(`   📁 Destino: ${OUTPUT_DIR}`);

    // Listar estrutura criada
    console.log('\n📂 Estrutura criada:');
    try {
        const output = execSync(`find "${OUTPUT_DIR}" -type d | head -20`, { encoding: 'utf-8' });
        console.log(output.split('\n').map(l => `   ${l}`).join('\n'));
    } catch {
        // Ignorar erro
    }

    // Contar ficheiros por extensão
    const byExtension = new Map<string, number>();
    for (const entry of entries) {
        const ext = entry.extensao || 'sem_ext';
        byExtension.set(ext, (byExtension.get(ext) || 0) + 1);
    }

    console.log('\n📈 Por extensão:');
    for (const [ext, count] of Array.from(byExtension.entries()).sort((a, b) => b[1] - a[1])) {
        console.log(`   ${ext}: ${count}`);
    }

    // Guardar log de extração
    const logPath = path.join(OUTPUT_DIR, '_extraction_log.json');
    fs.writeFileSync(logPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        total_extraidos: extracted,
        total_falhados: failed,
        por_programa: Object.fromEntries(byPrograma),
        por_extensao: Object.fromEntries(byExtension),
        ficheiros: extractedFiles,
    }, null, 2));

    console.log(`\n📝 Log guardado: ${logPath}`);
}

main().catch(console.error);
