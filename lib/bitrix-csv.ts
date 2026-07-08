/**
 * Processamento puro do export CSV do Bitrix24 (semana 2 do Consultancy OS v1).
 *
 * Regras do design doc: filtrar NIPC válido (checksum) + actividade <24 meses,
 * dedup por NIPC (dentro do ficheiro e contra `Empresa` existentes — update em
 * vez de duplicar). A coluna do NIPC e a data de "actividade" são configuráveis
 * porque o layout exacto do export só se confirma com o Fernando.
 *
 * Este módulo não toca na base de dados — o I/O vive em
 * `scripts/ingest-bitrix-csv.ts`.
 */

import { parse } from 'csv/sync';

import { normalizeNipc, isValidNipc, nipcCategory, type NipcCategory } from '@/lib/nipc';

export interface ColumnMapping {
    nome: string;
    nipc: string;
    /** Coluna de data que define "actividade" (última actividade ou último negócio). */
    lastActivity?: string;
    email?: string;
    telefone?: string;
    cae?: string;
    setor?: string;
    distrito?: string;
    localidade?: string;
    codigoPostal?: string;
    morada?: string;
}

export interface EmpresaCandidate {
    nipc: string;
    nome: string;
    categoria: NipcCategory;
    lastActivity: Date | null;
    email?: string;
    telefone?: string;
    cae?: string;
    setor?: string;
    distrito?: string;
    localidade?: string;
    codigoPostal?: string;
    morada?: string;
}

export interface RejectedRow {
    linha: number;
    nome: string;
    nipcRaw: string;
    motivo: string;
}

export interface ProcessResult {
    candidates: EmpresaCandidate[];
    rejected: {
        semNipc: RejectedRow[];
        nipcInvalido: RejectedRow[];
        semAtividade: RejectedRow[];
        duplicados: RejectedRow[];
    };
    stats: {
        total: number;
        utilizaveis: number;
        percentUtilizaveis: number;
        porCategoria: Record<NipcCategory, number>;
        atividadeVerificada: boolean;
    };
}

export interface UpsertPlan {
    creates: EmpresaCandidate[];
    updates: EmpresaCandidate[];
}

/** Deteta o separador dominante na primeira linha (exports Bitrix PT usam ";"). */
export function sniffDelimiter(content: string): ';' | ',' {
    const firstLine = content.slice(0, content.indexOf('\n') === -1 ? undefined : content.indexOf('\n'));
    const semicolons = (firstLine.match(/;/g) || []).length;
    const commas = (firstLine.match(/,/g) || []).length;
    return semicolons >= commas ? ';' : ',';
}

/** Faz parse do CSV para registos indexados pelo cabeçalho. */
export function parseBitrixCsv(content: string): Record<string, string>[] {
    return parse(content, {
        columns: true,
        delimiter: sniffDelimiter(content),
        skip_empty_lines: true,
        trim: true,
        bom: true,
        relax_column_count: true,
    }) as Record<string, string>[];
}

const COLUMN_PATTERNS: Array<[keyof ColumnMapping, RegExp]> = [
    ['nipc', /nipc|nif|contribuinte|vat|tax/i],
    ['nome', /nome|empresa|company|título|titulo/i],
    ['lastActivity', /atividade|actividade|activity|modifica|altera/i],
    ['email', /e-?mail/i],
    ['telefone', /telefone|telem|phone/i],
    ['cae', /\bcae\b/i],
    ['setor', /setor|sector|ind[uú]stria/i],
    ['distrito', /distrito|regi[ãa]o/i],
    ['localidade', /localidade|cidade|city/i],
    ['codigoPostal', /postal|zip/i],
    ['morada', /morada|endere[çc]o|address/i],
];

/** Sugere um mapeamento de colunas a partir dos cabeçalhos do export. */
export function detectColumns(headers: string[]): Partial<ColumnMapping> {
    const mapping: Partial<ColumnMapping> = {};
    for (const [field, pattern] of COLUMN_PATTERNS) {
        if (mapping[field]) continue;
        const match = headers.find((h) => pattern.test(h));
        if (match) {
            mapping[field] = match;
        }
    }
    return mapping;
}

/** Datas Bitrix ("15.03.2026 10:30:00", "15/03/2026") ou ISO. Sempre UTC. */
export function parseBitrixDate(raw: string): Date | null {
    const value = raw.trim();
    if (!value) return null;

    const dmy = value.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
    if (dmy) {
        const [, day, month, year, hour = '0', minute = '0', second = '0'] = dmy;
        const date = new Date(Date.UTC(+year, +month - 1, +day, +hour, +minute, +second));
        return Number.isNaN(date.getTime()) ? null : date;
    }

    const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2}))?)?/);
    if (iso) {
        const [, year, month, day, hour = '0', minute = '0', second = '0'] = iso;
        const date = new Date(Date.UTC(+year, +month - 1, +day, +hour, +minute, +second));
        return Number.isNaN(date.getTime()) ? null : date;
    }

    return null;
}

interface ProcessOptions {
    now?: Date;
    /** Janela de actividade em meses; só se aplica se `mapping.lastActivity` existir. */
    activityMonths?: number;
}

function cleanField(row: Record<string, string>, column?: string): string | undefined {
    if (!column) return undefined;
    const value = (row[column] ?? '').trim();
    return value.length > 0 ? value : undefined;
}

/** Aplica filtros (NIPC válido, actividade) e dedup dentro do ficheiro. */
export function processRows(
    rows: Record<string, string>[],
    mapping: ColumnMapping,
    options: ProcessOptions = {},
): ProcessResult {
    const now = options.now ?? new Date();
    const activityMonths = options.activityMonths ?? 24;
    const atividadeVerificada = Boolean(mapping.lastActivity);

    const cutoff = new Date(now);
    cutoff.setUTCMonth(cutoff.getUTCMonth() - activityMonths);

    const rejected: ProcessResult['rejected'] = {
        semNipc: [],
        nipcInvalido: [],
        semAtividade: [],
        duplicados: [],
    };

    const byNipc = new Map<string, EmpresaCandidate>();

    rows.forEach((row, index) => {
        const linha = index + 2; // 1-based + linha de cabeçalho
        const nomeRaw = cleanField(row, mapping.nome) ?? '';
        const nipcRaw = (row[mapping.nipc] ?? '').trim();

        const normalized = normalizeNipc(nipcRaw);
        if (!normalized) {
            rejected.semNipc.push({ linha, nome: nomeRaw, nipcRaw, motivo: 'NIPC em falta' });
            return;
        }
        if (!isValidNipc(normalized)) {
            rejected.nipcInvalido.push({ linha, nome: nomeRaw, nipcRaw, motivo: 'checksum inválido' });
            return;
        }

        const lastActivity = mapping.lastActivity
            ? parseBitrixDate(row[mapping.lastActivity] ?? '')
            : null;

        if (atividadeVerificada && (!lastActivity || lastActivity < cutoff)) {
            rejected.semAtividade.push({
                linha,
                nome: nomeRaw,
                nipcRaw: normalized,
                motivo: lastActivity
                    ? `sem actividade desde ${lastActivity.toISOString().slice(0, 10)}`
                    : 'sem data de actividade',
            });
            return;
        }

        const candidate: EmpresaCandidate = {
            nipc: normalized,
            nome: nomeRaw || `Empresa ${normalized}`,
            categoria: nipcCategory(normalized),
            lastActivity,
            email: cleanField(row, mapping.email),
            telefone: cleanField(row, mapping.telefone),
            cae: cleanField(row, mapping.cae),
            setor: cleanField(row, mapping.setor),
            distrito: cleanField(row, mapping.distrito),
            localidade: cleanField(row, mapping.localidade),
            codigoPostal: cleanField(row, mapping.codigoPostal),
            morada: cleanField(row, mapping.morada),
        };

        const existing = byNipc.get(normalized);
        if (!existing) {
            byNipc.set(normalized, candidate);
            return;
        }

        // Duplicado no ficheiro: fica o registo com actividade mais recente.
        const keepNew =
            candidate.lastActivity !== null &&
            (existing.lastActivity === null || candidate.lastActivity > existing.lastActivity);

        const loser = keepNew ? existing : candidate;
        if (keepNew) {
            byNipc.set(normalized, candidate);
        }
        rejected.duplicados.push({
            linha,
            nome: loser.nome,
            nipcRaw: normalized,
            motivo: 'NIPC duplicado no ficheiro',
        });
    });

    const candidates = Array.from(byNipc.values());
    const porCategoria: Record<NipcCategory, number> = { COLETIVA: 0, SINGULAR: 0, OUTRO: 0 };
    for (const candidate of candidates) {
        porCategoria[candidate.categoria] += 1;
    }

    return {
        candidates,
        rejected,
        stats: {
            total: rows.length,
            utilizaveis: candidates.length,
            percentUtilizaveis: rows.length === 0 ? 0 : Math.round((candidates.length / rows.length) * 1000) / 10,
            porCategoria,
            atividadeVerificada,
        },
    };
}

/** Divide os candidatos entre novos registos e updates a `Empresa` existentes. */
export function planUpserts(candidates: EmpresaCandidate[], existingNipcs: Set<string>): UpsertPlan {
    const creates: EmpresaCandidate[] = [];
    const updates: EmpresaCandidate[] = [];
    for (const candidate of candidates) {
        (existingNipcs.has(candidate.nipc) ? updates : creates).push(candidate);
    }
    return { creates, updates };
}
