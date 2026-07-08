/**
 * ingest-bitrix-csv.ts — ingestão do export CSV do Bitrix24 (semana 2).
 *
 * Filtra NIPC válido (checksum mod-11) + actividade <24 meses, dedup por NIPC
 * (ficheiro e BD — update em vez de duplicar) e imprime o relatório de
 * auditoria de qualidade dos dados (% utilizáveis, exigido pelo design doc).
 *
 * DRY-RUN POR DEFEITO — só escreve na BD com --commit. RGPD: não correr
 * --commit sobre dados reais da TA sem o DPA assinado.
 *
 * Uso:
 *   yarn tsx scripts/ingest-bitrix-csv.ts export.csv                 # dry-run + auditoria
 *   yarn tsx scripts/ingest-bitrix-csv.ts export.csv --commit        # escreve na BD
 *
 * Flags (a coluna do NIPC no export do Fernando ainda não está confirmada —
 * por omissão o script deteta por nome de cabeçalho e mostra o que escolheu):
 *   --col-nipc "NIF"              coluna com o NIPC (campo UF do Bitrix)
 *   --col-nome "Nome da empresa"  coluna com o nome
 *   --col-activity "Última atividade"  coluna de data que define actividade
 *   --activity-months 24          janela de actividade (0 = sem filtro)
 *   --rejeitados rejeitados.csv   escreve as linhas rejeitadas para revisão
 */

import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';

import {
    parseBitrixCsv,
    detectColumns,
    processRows,
    planUpserts,
    type ColumnMapping,
    type ProcessResult,
    type RejectedRow,
} from '@/lib/bitrix-csv';

interface CliArgs {
    file: string;
    commit: boolean;
    activityMonths: number;
    rejeitadosPath?: string;
    overrides: Partial<ColumnMapping>;
}

function parseArgs(argv: string[]): CliArgs {
    const positional: string[] = [];
    const overrides: Partial<ColumnMapping> = {};
    let commit = false;
    let activityMonths = 24;
    let rejeitadosPath: string | undefined;

    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        const next = () => {
            const value = argv[++i];
            if (value === undefined) {
                console.error(`Erro: a flag ${arg} precisa de um valor.`);
                process.exit(1);
            }
            return value;
        };

        switch (arg) {
            case '--commit': commit = true; break;
            case '--col-nipc': overrides.nipc = next(); break;
            case '--col-nome': overrides.nome = next(); break;
            case '--col-activity': overrides.lastActivity = next(); break;
            case '--activity-months': activityMonths = Number(next()); break;
            case '--rejeitados': rejeitadosPath = next(); break;
            default:
                if (arg.startsWith('--')) {
                    console.error(`Erro: flag desconhecida ${arg}`);
                    process.exit(1);
                }
                positional.push(arg);
        }
    }

    if (positional.length !== 1) {
        console.error('Uso: yarn tsx scripts/ingest-bitrix-csv.ts <export.csv> [--commit] [--col-nipc ...]');
        process.exit(1);
    }
    if (!Number.isFinite(activityMonths) || activityMonths < 0) {
        console.error('Erro: --activity-months tem de ser um número >= 0.');
        process.exit(1);
    }

    return { file: positional[0], commit, activityMonths, rejeitadosPath, overrides };
}

function resolveMapping(headers: string[], overrides: Partial<ColumnMapping>): ColumnMapping {
    const detected = detectColumns(headers);
    const merged = { ...detected, ...overrides };

    for (const [field, column] of Object.entries(overrides)) {
        if (column && !headers.includes(column)) {
            console.error(`Erro: a coluna "${column}" (${field}) não existe no CSV.`);
            console.error(`Cabeçalhos disponíveis: ${headers.join(' | ')}`);
            process.exit(1);
        }
    }

    if (!merged.nipc || !merged.nome) {
        console.error('Erro: não foi possível detetar as colunas de NIPC e/ou nome.');
        console.error(`Cabeçalhos disponíveis: ${headers.join(' | ')}`);
        console.error('Indica-as com --col-nipc "..." e --col-nome "...".');
        process.exit(1);
    }

    return merged as ColumnMapping;
}

function printAuditReport(result: ProcessResult, mapping: ColumnMapping, activityMonths: number): void {
    const { stats, rejected } = result;
    const rejectedTotal =
        rejected.semNipc.length + rejected.nipcInvalido.length +
        rejected.semAtividade.length + rejected.duplicados.length;

    console.log('\n=== AUDITORIA DE QUALIDADE DOS DADOS ===');
    console.log(`Colunas usadas: nome="${mapping.nome}" nipc="${mapping.nipc}"` +
        (mapping.lastActivity ? ` actividade="${mapping.lastActivity}"` : ' actividade=(nenhuma)'));
    console.log(`Registos no ficheiro:      ${stats.total}`);
    console.log(`Utilizáveis:               ${stats.utilizaveis} (${stats.percentUtilizaveis}%)`);
    console.log(`  - Pessoas coletivas:     ${stats.porCategoria.COLETIVA}`);
    console.log(`  - Pessoas singulares:    ${stats.porCategoria.SINGULAR}`);
    console.log(`  - Outras gamas NIF:      ${stats.porCategoria.OUTRO}`);
    console.log(`Rejeitados:                ${rejectedTotal}`);
    console.log(`  - Sem NIPC:              ${rejected.semNipc.length}`);
    console.log(`  - NIPC inválido:         ${rejected.nipcInvalido.length}`);
    console.log(`  - Sem actividade <${activityMonths}m:  ${rejected.semAtividade.length}`);
    console.log(`  - Duplicados no CSV:     ${rejected.duplicados.length}`);
    if (!stats.atividadeVerificada) {
        console.log('\n⚠ Sem coluna de actividade — filtro de 24 meses NÃO aplicado.');
        console.log('  Confirma com o Fernando qual a data que define "actividade" e usa --col-activity.');
    }
}

function writeRejectedCsv(filePath: string, rejected: ProcessResult['rejected']): void {
    const all: Array<RejectedRow & { tipo: string }> = [
        ...rejected.semNipc.map((r) => ({ ...r, tipo: 'sem_nipc' })),
        ...rejected.nipcInvalido.map((r) => ({ ...r, tipo: 'nipc_invalido' })),
        ...rejected.semAtividade.map((r) => ({ ...r, tipo: 'sem_atividade' })),
        ...rejected.duplicados.map((r) => ({ ...r, tipo: 'duplicado' })),
    ].sort((a, b) => a.linha - b.linha);

    const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const lines = ['linha;tipo;nome;nipc;motivo'];
    for (const row of all) {
        lines.push([row.linha, row.tipo, escape(row.nome), escape(row.nipcRaw), escape(row.motivo)].join(';'));
    }
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    console.log(`\nLinhas rejeitadas escritas em ${filePath}`);
}

async function main(): Promise<void> {
    const args = parseArgs(process.argv.slice(2));

    const absolute = path.resolve(args.file);
    if (!fs.existsSync(absolute)) {
        console.error(`Erro: ficheiro não encontrado: ${absolute}`);
        process.exit(1);
    }

    const content = fs.readFileSync(absolute, 'utf8');
    const rows = parseBitrixCsv(content);
    if (rows.length === 0) {
        console.error('Erro: o CSV não tem registos.');
        process.exit(1);
    }

    const headers = Object.keys(rows[0]);
    const mapping = resolveMapping(headers, args.overrides);

    const activityMonths = args.activityMonths;
    const effectiveMapping =
        activityMonths === 0 ? { ...mapping, lastActivity: undefined } : mapping;

    const result = processRows(rows, effectiveMapping, { activityMonths });
    printAuditReport(result, effectiveMapping, activityMonths);

    if (args.rejeitadosPath) {
        writeRejectedCsv(path.resolve(args.rejeitadosPath), result.rejected);
    }

    const prisma = new PrismaClient();
    try {
        const existing = await prisma.empresa.findMany({
            where: { nipc: { in: result.candidates.map((c) => c.nipc) } },
            select: { nipc: true },
        });
        const plan = planUpserts(result.candidates, new Set(existing.map((e) => e.nipc)));

        console.log('\n=== PLANO DE INGESTÃO ===');
        console.log(`Novas empresas a criar:    ${plan.creates.length}`);
        console.log(`Empresas a actualizar:     ${plan.updates.length}`);

        if (!args.commit) {
            console.log('\nDRY-RUN — nada foi escrito. Corre com --commit para ingerir.');
            console.log('RGPD: só correr --commit sobre dados reais com o DPA da TA assinado.');
            return;
        }

        let created = 0;
        let updated = 0;
        for (const candidate of result.candidates) {
            // Só sobrepõe campos presentes no CSV; nunca limpa dados existentes.
            const optionals = {
                ...(candidate.email ? { email: candidate.email } : {}),
                ...(candidate.telefone ? { telefone: candidate.telefone } : {}),
                ...(candidate.cae ? { cae: candidate.cae } : {}),
                ...(candidate.setor ? { setor: candidate.setor } : {}),
                ...(candidate.distrito ? { distrito: candidate.distrito } : {}),
                ...(candidate.localidade ? { localidade: candidate.localidade } : {}),
                ...(candidate.codigoPostal ? { codigoPostal: candidate.codigoPostal } : {}),
                ...(candidate.morada ? { morada: candidate.morada } : {}),
            };

            const existing = await prisma.empresa.findUnique({ where: { nipc: candidate.nipc } });
            if (existing) {
                await prisma.empresa.update({
                    where: { nipc: candidate.nipc },
                    data: { nome: candidate.nome, ...optionals },
                });
                updated++;
            } else {
                await prisma.empresa.create({
                    data: {
                        nipc: candidate.nipc,
                        nome: candidate.nome,
                        email: candidate.email ?? '',
                        cae: candidate.cae ?? '',
                        setor: candidate.setor ?? '',
                        ...optionals,
                    },
                });
                created++;
            }
            if ((created + updated) % 250 === 0) {
                console.log(`  ... ${created + updated}/${result.candidates.length}`);
            }
        }

        console.log(`\nConcluído: ${created} criadas, ${updated} actualizadas.`);
    } finally {
        await prisma.$disconnect();
    }
}

main().catch((error: unknown) => {
    console.error('Ingestão falhou:', error instanceof Error ? error.message : error);
    process.exit(1);
});
