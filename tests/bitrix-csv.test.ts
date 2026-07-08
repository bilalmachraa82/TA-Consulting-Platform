import { test } from 'vitest';
import assert from 'node:assert/strict';

import {
    sniffDelimiter,
    parseBitrixCsv,
    detectColumns,
    parseBitrixDate,
    processRows,
    planUpserts,
    type ColumnMapping,
} from '@/lib/bitrix-csv';

const NOW = new Date('2026-07-08T00:00:00Z');

const MAPPING: ColumnMapping = {
    nome: 'Nome da empresa',
    nipc: 'NIF',
    lastActivity: 'Última atividade',
    email: 'E-mail',
};

function row(overrides: Record<string, string> = {}): Record<string, string> {
    return {
        'Nome da empresa': 'Empresa Teste Lda',
        'NIF': '500697256',
        'Última atividade': '01.06.2026 10:30:00',
        'E-mail': 'geral@teste.pt',
        ...overrides,
    };
}

test('sniffDelimiter picks the dominant separator of the header line', () => {
    assert.equal(sniffDelimiter('a;b;c\n1;2;3'), ';');
    assert.equal(sniffDelimiter('a,b,c\n1,2,3'), ',');
});

test('parseBitrixCsv parses semicolon CSV into records keyed by header', () => {
    const csv = 'Nome da empresa;NIF\nEmpresa A;500697256\n';
    const rows = parseBitrixCsv(csv);
    assert.equal(rows.length, 1);
    assert.equal(rows[0]['Nome da empresa'], 'Empresa A');
    assert.equal(rows[0]['NIF'], '500697256');
});

test('detectColumns suggests mapping from common Bitrix header names', () => {
    const detected = detectColumns([
        'Nome da empresa',
        'NIF/NIPC',
        'Última atividade',
        'E-mail de trabalho',
    ]);
    assert.equal(detected.nome, 'Nome da empresa');
    assert.equal(detected.nipc, 'NIF/NIPC');
    assert.equal(detected.lastActivity, 'Última atividade');
    assert.equal(detected.email, 'E-mail de trabalho');
});

test('parseBitrixDate handles Bitrix and ISO formats', () => {
    assert.equal(
        parseBitrixDate('15.03.2026 10:30:00')?.toISOString(),
        new Date('2026-03-15T10:30:00Z').toISOString(),
    );
    assert.equal(
        parseBitrixDate('15/03/2026')?.toISOString(),
        new Date('2026-03-15T00:00:00Z').toISOString(),
    );
    assert.equal(
        parseBitrixDate('2026-03-15')?.toISOString(),
        new Date('2026-03-15T00:00:00Z').toISOString(),
    );
    assert.equal(parseBitrixDate(''), null);
    assert.equal(parseBitrixDate('sem data'), null);
});

test('processRows keeps rows with valid NIPC and recent activity', () => {
    const result = processRows([row()], MAPPING, { now: NOW });
    assert.equal(result.candidates.length, 1);
    assert.equal(result.candidates[0].nipc, '500697256');
    assert.equal(result.candidates[0].nome, 'Empresa Teste Lda');
    assert.equal(result.candidates[0].email, 'geral@teste.pt');
});

test('processRows rejects missing and invalid NIPCs', () => {
    const result = processRows(
        [
            row({ 'NIF': '' }),
            row({ 'NIF': '500697255' }),
            row(),
        ],
        MAPPING,
        { now: NOW },
    );
    assert.equal(result.candidates.length, 1);
    assert.equal(result.rejected.semNipc.length, 1);
    assert.equal(result.rejected.nipcInvalido.length, 1);
});

test('processRows rejects rows without activity in the window', () => {
    const result = processRows(
        [
            row({ 'NIF': '500697256', 'Última atividade': '01.01.2024' }),
            row({ 'NIF': '509442013', 'Última atividade': '01.01.2026' }),
        ],
        MAPPING,
        { now: NOW, activityMonths: 24 },
    );
    assert.equal(result.candidates.length, 1);
    assert.equal(result.candidates[0].nipc, '509442013');
    assert.equal(result.rejected.semAtividade.length, 1);
});

test('processRows deduplicates by NIPC keeping most recent activity', () => {
    const result = processRows(
        [
            row({ 'Nome da empresa': 'Antiga', 'Última atividade': '01.01.2026' }),
            row({ 'Nome da empresa': 'Recente', 'Última atividade': '01.06.2026' }),
        ],
        MAPPING,
        { now: NOW },
    );
    assert.equal(result.candidates.length, 1);
    assert.equal(result.candidates[0].nome, 'Recente');
    assert.equal(result.rejected.duplicados.length, 1);
});

test('processRows normalizes NIPC artifacts before validating', () => {
    const result = processRows([row({ 'NIF': 'PT 500-697-256' })], MAPPING, { now: NOW });
    assert.equal(result.candidates.length, 1);
    assert.equal(result.candidates[0].nipc, '500697256');
});

test('processRows without activity column keeps rows and flags the gap', () => {
    const mapping: ColumnMapping = { nome: 'Nome da empresa', nipc: 'NIF' };
    const result = processRows([row()], mapping, { now: NOW, activityMonths: 24 });
    assert.equal(result.candidates.length, 1);
    assert.equal(result.stats.atividadeVerificada, false);
});

test('planUpserts splits candidates into creates and updates by existing NIPC', () => {
    const { candidates } = processRows(
        [row(), row({ 'NIF': '509442013', 'Nome da empresa': 'Nova Lda' })],
        MAPPING,
        { now: NOW },
    );
    const plan = planUpserts(candidates, new Set(['500697256']));
    assert.equal(plan.updates.length, 1);
    assert.equal(plan.updates[0].nipc, '500697256');
    assert.equal(plan.creates.length, 1);
    assert.equal(plan.creates[0].nipc, '509442013');
});
