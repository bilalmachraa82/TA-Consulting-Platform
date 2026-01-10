#!/usr/bin/env node
/**
 * Popula a tabela CandidaturaHistorica a partir do inventário Excel
 * 
 * Este script lê o ficheiro de inventário deduplicado e cria registos
 * agrupados por cliente (pasta) para permitir queries SQL sem alucinações.
 * 
 * Uso: npx tsx scripts/populate-candidaturas-historicas.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TESTS_DIR = path.join(process.cwd(), '__tests__');
const INPUT_FILE = path.join(TESTS_DIR, 'candidaturas_inventario_dedup.xlsx');

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
    manter: boolean;
    extrair: boolean;
}

interface CandidaturaAgrupada {
    programa: string;
    subPrograma: string;
    cliente: string;
    ano: number | null;
    documentos: {
        nome: string;
        path: string;
        tipo: string;
        prioridade: string;
        tamanho: number;
    }[];
    zipOrigem: string;
    prioridade: string; // Maior prioridade entre os docs
}

function extractYearFromDate(dateStr: string): number | null {
    if (!dateStr) return null;

    // Formato: "MM-DD-YYYY HH:MM" ou "DD-MM-YYYY"
    const match = dateStr.match(/(\d{2})-(\d{2})-(\d{4})/);
    if (match) {
        return parseInt(match[3], 10);
    }
    return null;
}

function getHighestPriority(docs: { prioridade: string }[]): string {
    if (docs.some(d => d.prioridade === 'ALTA')) return 'ALTA';
    if (docs.some(d => d.prioridade === 'MEDIA')) return 'MEDIA';
    return 'BAIXA';
}

async function main() {
    console.log('📊 Populando tabela CandidaturaHistorica...\n');

    // Verificar ficheiro de input
    if (!fs.existsSync(INPUT_FILE)) {
        console.error('❌ Ficheiro não encontrado:', INPUT_FILE);
        console.log('   Execute primeiro: npx tsx scripts/dedup-candidaturas.ts');
        process.exit(1);
    }

    // Ler inventário (sheet "A Manter" - ficheiros únicos)
    const workbook = XLSX.readFile(INPUT_FILE);
    const sheet = workbook.Sheets['A Manter'];

    if (!sheet) {
        console.error('❌ Sheet "A Manter" não encontrada no Excel');
        process.exit(1);
    }

    const entries: FileEntry[] = XLSX.utils.sheet_to_json(sheet);
    console.log(`📄 Ficheiros únicos carregados: ${entries.length}\n`);

    // Agrupar por cliente (cada cliente = uma candidatura histórica)
    const candidaturasMap = new Map<string, CandidaturaAgrupada>();

    for (const entry of entries) {
        // Ignorar ficheiros sem cliente identificável
        if (!entry.cliente || entry.cliente === '' || entry.cliente === 'N/A') {
            continue;
        }

        // Chave única: programa + sub_programa + cliente
        const key = `${entry.programa}|${entry.sub_programa || ''}|${entry.cliente}`;

        if (!candidaturasMap.has(key)) {
            candidaturasMap.set(key, {
                programa: entry.programa,
                subPrograma: entry.sub_programa || '',
                cliente: entry.cliente,
                ano: extractYearFromDate(entry.data_modificacao),
                documentos: [],
                zipOrigem: entry.zip_origem,
                prioridade: 'BAIXA',
            });
        }

        const candidatura = candidaturasMap.get(key)!;

        // Adicionar documento à lista
        candidatura.documentos.push({
            nome: entry.nome_ficheiro,
            path: entry.path_completo,
            tipo: entry.tipo_documento,
            prioridade: entry.prioridade,
            tamanho: entry.tamanho_bytes,
        });

        // Atualizar ano se mais recente
        const entryYear = extractYearFromDate(entry.data_modificacao);
        if (entryYear && (!candidatura.ano || entryYear > candidatura.ano)) {
            candidatura.ano = entryYear;
        }
    }

    // Calcular prioridade para cada candidatura
    for (const [, candidatura] of candidaturasMap) {
        candidatura.prioridade = getHighestPriority(candidatura.documentos);
    }

    console.log(`📋 Candidaturas agrupadas: ${candidaturasMap.size}\n`);

    // Estatísticas
    const stats = {
        total: candidaturasMap.size,
        alta: Array.from(candidaturasMap.values()).filter(c => c.prioridade === 'ALTA').length,
        media: Array.from(candidaturasMap.values()).filter(c => c.prioridade === 'MEDIA').length,
        baixa: Array.from(candidaturasMap.values()).filter(c => c.prioridade === 'BAIXA').length,
    };

    console.log('📈 Distribuição por prioridade:');
    console.log(`   ALTA: ${stats.alta}`);
    console.log(`   MÉDIA: ${stats.media}`);
    console.log(`   BAIXA: ${stats.baixa}`);

    // Limpar tabela existente
    console.log('\n🗑️ Limpando registos existentes...');
    const deleted = await prisma.candidaturaHistorica.deleteMany({});
    console.log(`   Removidos: ${deleted.count} registos`);

    // Inserir candidaturas em batch
    console.log('\n📥 Inserindo candidaturas...');

    const candidaturasArray = Array.from(candidaturasMap.values());
    let inserted = 0;
    const batchSize = 100;

    for (let i = 0; i < candidaturasArray.length; i += batchSize) {
        const batch = candidaturasArray.slice(i, i + batchSize);

        await prisma.candidaturaHistorica.createMany({
            data: batch.map(c => ({
                programa: c.programa,
                subPrograma: c.subPrograma || null,
                cliente: c.cliente,
                ano: c.ano,
                documentos: c.documentos,
                totalDocumentos: c.documentos.length,
                zipOrigem: c.zipOrigem,
                prioridade: c.prioridade,
                ragStatus: 'PENDING',
            })),
        });

        inserted += batch.length;
        process.stdout.write(`\r   Inseridos: ${inserted}/${candidaturasArray.length}`);
    }

    console.log('\n');

    // Verificação final
    const count = await prisma.candidaturaHistorica.count();
    const byPrograma = await prisma.candidaturaHistorica.groupBy({
        by: ['programa'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
    });

    console.log('='.repeat(60));
    console.log('✅ POPULAÇÃO CONCLUÍDA');
    console.log('='.repeat(60));
    console.log(`\n   Total de candidaturas: ${count}`);
    console.log('\n   Por programa:');
    byPrograma.forEach(p => {
        console.log(`      ${p.programa}: ${p._count.id}`);
    });

    // Exemplos de queries possíveis
    console.log('\n📋 Exemplos de queries SQL agora possíveis:');
    console.log('   - "Quantas candidaturas PRR?" → SELECT COUNT(*) WHERE programa = "PRR"');
    console.log('   - "Candidaturas de 2023?" → SELECT * WHERE ano = 2023');
    console.log('   - "Clientes com mais candidaturas?" → GROUP BY cliente ORDER BY COUNT');

    await prisma.$disconnect();
}

main().catch(async (error) => {
    console.error('❌ Erro:', error);
    await prisma.$disconnect();
    process.exit(1);
});
