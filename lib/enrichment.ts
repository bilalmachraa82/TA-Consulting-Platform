/**
 * Lógica pura do agente de enriquecimento de avisos.
 *
 * O CLI (scripts/enrich-avisos.ts) faz fetch do link do aviso e pede ao
 * Gemini Flash uma extração estruturada; este módulo valida essa extração
 * (nunca confiar no output do modelo) e decide o que pode ser escrito na BD
 * (política de merge conservadora: o scraper manda, o LLM só preenche vazios).
 */

import { z } from 'zod';

// Espelham os enums do schema.prisma — validados aqui para nunca deixar
// passar um valor inventado pelo modelo para dentro da BD.
export const TIPOS_BENEFICIARIO = [
    'EMPRESAS', 'ASSOCIACOES', 'AUTARQUIAS', 'ONG', 'COOPERATIVAS',
    'IPSS', 'ENSINO_INVESTIGACAO', 'PARTICULARES',
] as const;

export const ABRANGENCIAS = ['REGIONAL', 'NACIONAL', 'CONTINENTAL', 'EUROPEU'] as const;

export const TIPOS_APOIO = ['SUBSIDIO', 'CREDITO', 'GARANTIA', 'MISTO'] as const;

const isoDate = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}/)
    .refine((s) => {
        const d = new Date(s);
        return !Number.isNaN(d.getTime()) && d.getFullYear() >= 2020 && d.getFullYear() <= 2035;
    }, 'data fora do intervalo plausível');

export const extractionSchema = z.object({
    descricao: z.string().min(50).max(5000).nullable().catch(null),
    dataInicioSubmissao: isoDate.nullable().catch(null),
    dataFimSubmissao: isoDate.nullable().catch(null),
    tiposBeneficiarios: z.array(z.enum(TIPOS_BENEFICIARIO)).catch([]),
    caeElegiveis: z.array(z.number().int().min(1).max(99999)).max(50).catch([]),
    regiaoNUTS2: z.string().max(100).nullable().catch(null),
    abrangenciaGeografica: z.enum(ABRANGENCIAS).nullable().catch(null),
    montanteMinimo: z.number().nonnegative().max(1e10).nullable().catch(null),
    montanteMaximo: z.number().nonnegative().max(1e10).nullable().catch(null),
    taxaCofinanciamentoMax: z.number().min(0).max(100).nullable().catch(null),
    tipoApoio: z.enum(TIPOS_APOIO).nullable().catch(null),
});

export type Extraction = z.infer<typeof extractionSchema>;

export interface CoercedExtraction {
    data: Extraction;
    /** nº de campos com informação útil (para enrichmentScore) */
    fieldCount: number;
    totalFields: number;
}

/**
 * Valida e normaliza o output cru do LLM. Campos inválidos são descartados
 * (catch → null/[]) em vez de rebentar o batch inteiro.
 */
export function coerceExtraction(raw: unknown): CoercedExtraction | null {
    const parsed = extractionSchema.safeParse(raw);
    if (!parsed.success) return null;

    const data = { ...parsed.data };

    // sanidade: fim >= início quando ambos existem
    if (data.dataInicioSubmissao && data.dataFimSubmissao) {
        if (new Date(data.dataFimSubmissao) < new Date(data.dataInicioSubmissao)) {
            data.dataInicioSubmissao = null;
            data.dataFimSubmissao = null;
        }
    }
    // sanidade: min <= max quando ambos existem
    if (data.montanteMinimo !== null && data.montanteMaximo !== null && data.montanteMinimo > data.montanteMaximo) {
        data.montanteMinimo = null;
        data.montanteMaximo = null;
    }

    const values = [
        data.descricao, data.dataInicioSubmissao, data.dataFimSubmissao,
        data.regiaoNUTS2, data.abrangenciaGeografica, data.montanteMinimo,
        data.montanteMaximo, data.taxaCofinanciamentoMax, data.tipoApoio,
    ];
    const fieldCount =
        values.filter((v) => v !== null).length +
        (data.tiposBeneficiarios.length > 0 ? 1 : 0) +
        (data.caeElegiveis.length > 0 ? 1 : 0);

    return { data, fieldCount, totalFields: 11 };
}

/** Reduz HTML a texto simples limitado, para caber no contexto do modelo. */
export function htmlToText(html: string, maxChars = 15000): string {
    return html
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, maxChars);
}

export interface AvisoParaMerge {
    descricao: string | null;
    dataFimSubmissao: Date;
}

export interface MergeOptions {
    /**
     * Permite escrever datas extraídas pelo LLM. Mesmo com true, a política
     * só preenche quando o prazo atual está no passado (aviso "invisível",
     * ex.: fallback do Fundo Ambiental) E o LLM encontrou um prazo futuro —
     * nunca sobrescreve um prazo futuro vindo do scraper.
     */
    allowDates: boolean;
    now?: Date;
}

/**
 * Constrói o objeto de update Prisma a partir da extração validada.
 * Só devolve campos que a política permite escrever.
 */
export function buildUpdateData(
    extraction: CoercedExtraction,
    aviso: AvisoParaMerge,
    opts: MergeOptions,
): Record<string, unknown> {
    const now = opts.now ?? new Date();
    const e = extraction.data;
    const update: Record<string, unknown> = {};

    const descricaoAtualCurta = !aviso.descricao || aviso.descricao.length < 200;
    if (e.descricao && descricaoAtualCurta) update.descricao = e.descricao;

    if (opts.allowDates && e.dataFimSubmissao) {
        const novoFim = new Date(e.dataFimSubmissao);
        const prazoAtualPassado = aviso.dataFimSubmissao < now;
        if (prazoAtualPassado && novoFim >= now) {
            update.dataFimSubmissao = novoFim;
            if (e.dataInicioSubmissao) update.dataInicioSubmissao = new Date(e.dataInicioSubmissao);
        }
    }

    if (e.tiposBeneficiarios.length > 0) update.tiposBeneficiarios = e.tiposBeneficiarios;
    if (e.caeElegiveis.length > 0) update.caeElegiveis = e.caeElegiveis;
    if (e.regiaoNUTS2) update.regiaoNUTS2 = e.regiaoNUTS2;
    if (e.abrangenciaGeografica) update.abrangenciaGeografica = e.abrangenciaGeografica;
    if (e.montanteMinimo !== null) update.montanteMinimo = e.montanteMinimo;
    if (e.montanteMaximo !== null) update.montanteMaximo = e.montanteMaximo;
    if (e.taxaCofinanciamentoMax !== null) update.taxaCofinanciamentoMax = e.taxaCofinanciamentoMax;
    if (e.tipoApoio) update.tipoApoio = e.tipoApoio;

    return update;
}
