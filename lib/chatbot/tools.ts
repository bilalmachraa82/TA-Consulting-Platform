/**
 * Ferramentas tipadas do assistente de avisos — a fronteira de segurança.
 *
 * Requisito da revisão externa (Codex, 2026-07-20): o modelo NUNCA executa SQL.
 * Só pode invocar estas ferramentas, cujos parâmetros são validados com zod e
 * traduzidos para queries Prisma parametrizadas com limites duros. O whitelist
 * de campos exclui qualquer tabela/coluna de clientes ou utilizadores — as
 * ferramentas só tocam na tabela avisos (dados públicos).
 */

import { z } from 'zod';
import { Prisma, Portal, PrismaClient } from '@prisma/client';
import { prisma as mainPrisma } from '@/lib/db';
import type { ToolDefinition } from '@/lib/llm-client';

/**
 * Defesa em profundidade: quando CHATBOT_DATABASE_URL está definida, todas as
 * queries do assistente correm com o role chatbot_readonly (SELECT apenas na
 * tabela avisos, statement_timeout 5s, transações read-only — ver
 * prisma/migrations-manual/2026-07-20-chatbot-readonly-role.sql).
 * Sem ela, usa o client principal (dev/local).
 */
const prisma = process.env.CHATBOT_DATABASE_URL
    ? new PrismaClient({ datasources: { db: { url: process.env.CHATBOT_DATABASE_URL } } })
    : mainPrisma;

const PORTAIS = [
    'PORTUGAL2030', 'PEPAC', 'PRR', 'HORIZON_EUROPE', 'EUROPA_CRIATIVA',
    'IPDJ', 'BASE_GOV', 'DIGITAL_EUROPE', 'LIFE', 'FUNDO_AMBIENTAL',
] as const;

const TIPOS_APOIO = ['SUBSIDIO', 'CREDITO', 'GARANTIA', 'MISTO'] as const;

export const MAX_RESULTADOS = 20;

export const searchAvisosParams = z.object({
    texto: z.string().min(2).max(200).optional(),
    portal: z.enum(PORTAIS).optional(),
    apenasAbertos: z.boolean().default(true),
    // clamp em vez de rejeitar: valores exagerados do modelo não são risco
    // (os caps de resultados mantêm-se) e rejeitar fazia-o desistir
    prazoAteDias: z.number().int().min(1).transform((v) => Math.min(v, 730)).optional(),
    tipoApoio: z.enum(TIPOS_APOIO).optional(),
    regiaoNUTS2: z.string().max(50).optional(),
    montanteMaximoMinimo: z.number().nonnegative().optional(),
    limite: z.number().int().min(1).transform((v) => Math.min(v, MAX_RESULTADOS)).default(10),
});

export type SearchAvisosParams = z.infer<typeof searchAvisosParams>;

/** Campos expostos ao modelo — whitelist explícita, sem dados internos. */
const AVISO_SELECT = {
    codigo: true,
    nome: true,
    portal: true,
    programa: true,
    descricao: true,
    dataInicioSubmissao: true,
    dataFimSubmissao: true,
    montanteMinimo: true,
    montanteMaximo: true,
    taxaCofinanciamentoMax: true,
    tipoApoio: true,
    tiposBeneficiarios: true,
    regiaoNUTS2: true,
    regiao: true,
    link: true,
} satisfies Prisma.AvisoSelect;

/** Pura (testável): traduz parâmetros validados num where Prisma. */
export function buildAvisosWhere(params: SearchAvisosParams, now: Date = new Date()): Prisma.AvisoWhereInput {
    const where: Prisma.AvisoWhereInput = {};

    if (params.apenasAbertos) {
        // Aberto = a fonte diz ativo E (prazo futuro OU prazo por confirmar).
        // dataFimSubmissao NULL significa "a fonte diz aberto mas não publica o
        // prazo" — esconder esses seria perder 85 avisos abertos do PRR.
        where.ativo = true;
        where.OR = [{ dataFimSubmissao: null }, { dataFimSubmissao: { gte: now } }];
    }
    if (params.prazoAteDias !== undefined) {
        // filtro explícito por janela de prazo exclui os "por confirmar"
        const ate = new Date(now.getTime() + params.prazoAteDias * 24 * 60 * 60 * 1000);
        where.dataFimSubmissao = { gte: now, lte: ate };
        delete where.OR;
    }
    if (params.portal) where.portal = params.portal as Portal;
    if (params.tipoApoio) where.tipoApoio = params.tipoApoio;
    if (params.regiaoNUTS2) where.regiaoNUTS2 = { contains: params.regiaoNUTS2, mode: 'insensitive' };
    if (params.montanteMaximoMinimo !== undefined) {
        where.montanteMaximo = { gte: params.montanteMaximoMinimo };
    }
    if (params.texto) {
        // Tokenização com prefixos: "digitalização PME" → termos ["digital", "pme"],
        // cada termo tem de aparecer nalgum campo (AND entre termos, OR entre campos).
        // O prefixo de 7 chars apanha a morfologia portuguesa (digitalização/digitalizar/digital).
        const termos = params.texto
            .split(/\s+/)
            .map((w) => w.replace(/[^\p{L}\p{N}]/gu, ''))
            .filter((w) => w.length >= 3)
            .slice(0, 5)
            .map((w) => (w.length > 7 ? w.slice(0, 7) : w));

        if (termos.length > 0) {
            where.AND = termos.map((termo) => ({
                OR: [
                    { nome: { contains: termo, mode: 'insensitive' as const } },
                    { descricao: { contains: termo, mode: 'insensitive' as const } },
                    { programa: { contains: termo, mode: 'insensitive' as const } },
                ],
            }));
        }
    }
    return where;
}

/**
 * Citação de um aviso. Os campos `title`/`source`/`uri` mantêm compatibilidade
 * com o CitationCard já existente (components/chat/citation-card.tsx); os
 * restantes são os dados estruturados para UIs futuras.
 */
export interface AvisoCitation {
    codigo: string;
    nome: string;
    portal: string;
    link: string | null;
    prazo: string;
    title: string;
    source: string;
    uri?: string;
}

function toCitation(a: { codigo: string; nome: string; portal: unknown; link: string | null; dataFimSubmissao: Date | null }): AvisoCitation {
    const prazo = a.dataFimSubmissao ? a.dataFimSubmissao.toISOString().slice(0, 10) : 'por confirmar';
    const prazoPt = a.dataFimSubmissao
        ? `${prazo.slice(8, 10)}/${prazo.slice(5, 7)}/${prazo.slice(0, 4)}`
        : 'por confirmar';
    return {
        codigo: a.codigo,
        nome: a.nome,
        portal: String(a.portal),
        link: a.link,
        prazo,
        title: `${a.codigo} — ${a.nome.slice(0, 90)}`,
        source: `${String(a.portal).replace(/_/g, ' ')} · prazo ${prazoPt}`,
        ...(a.link ? { uri: a.link } : {}),
    };
}

export async function executeSearchAvisos(
    rawParams: unknown,
): Promise<{ resultados: unknown[]; citations: AvisoCitation[]; totalDisponivel: number }> {
    const params = searchAvisosParams.parse(rawParams);
    const where = buildAvisosWhere(params);

    // COUNT separado do take: sem isto o modelo lê o tamanho da página como se
    // fosse o total e afirma "existem 3 avisos" quando existem 94.
    const [totalDisponivel, avisos] = await Promise.all([
        prisma.aviso.count({ where }),
        prisma.aviso.findMany({
            where,
            select: AVISO_SELECT,
            orderBy: { dataFimSubmissao: 'asc' },
            take: Math.min(params.limite, MAX_RESULTADOS),
        }),
    ]);

    const citations: AvisoCitation[] = avisos.map(toCitation);

    const resultados = avisos.map((a) => ({
        ...a,
        descricao: a.descricao ? `${a.descricao.slice(0, 400)}${a.descricao.length > 400 ? '…' : ''}` : null,
        dataInicioSubmissao: a.dataInicioSubmissao?.toISOString().slice(0, 10) ?? null,
        // null = a fonte diz aberto mas não publica prazo; o assistente deve
        // dizer "prazo por confirmar" e remeter para o link oficial
        dataFimSubmissao: a.dataFimSubmissao?.toISOString().slice(0, 10) ?? 'por confirmar (ver link oficial)',
    }));

    return { resultados, citations, totalDisponivel };
}

export const getAvisoDetailParams = z.object({
    codigo: z.string().min(2).max(120),
});

export async function executeGetAvisoDetail(rawParams: unknown): Promise<{ aviso: unknown | null; citations: AvisoCitation[] }> {
    const params = getAvisoDetailParams.parse(rawParams);
    const a = await prisma.aviso.findFirst({
        where: { codigo: params.codigo },
        select: { ...AVISO_SELECT, preRequisitos: true, linksLegislacao: true, canalSubmissao: true, taxa: true },
    });
    if (!a) return { aviso: null, citations: [] };
    return {
        aviso: {
            ...a,
            dataInicioSubmissao: a.dataInicioSubmissao.toISOString().slice(0, 10),
            dataFimSubmissao: a.dataFimSubmissao.toISOString().slice(0, 10),
        },
        citations: [toCitation(a)],
    };
}

/** Estatísticas vivas — substituem os números hardcoded nos prompts. Cache 10 min. */
let statsCache: { at: number; texto: string } | null = null;

export async function getAvisosStatsTexto(): Promise<string> {
    if (statsCache && Date.now() - statsCache.at < 10 * 60 * 1000) return statsCache.texto;

    const now = new Date();
    const abertoWhere: Prisma.AvisoWhereInput = {
        ativo: true,
        OR: [{ dataFimSubmissao: null }, { dataFimSubmissao: { gte: now } }],
    };
    const porPortal = await prisma.aviso.groupBy({
        by: ['portal'],
        where: abertoWhere,
        _count: { _all: true },
    });
    const proximos = await prisma.aviso.findMany({
        where: { ativo: true, dataFimSubmissao: { gte: now } },
        orderBy: { dataFimSubmissao: 'asc' },
        take: 5,
        select: { codigo: true, nome: true, portal: true, dataFimSubmissao: true },
    });

    const linhas = porPortal
        .sort((x, y) => y._count._all - x._count._all)
        .map((p) => `- ${p.portal}: ${p._count._all} avisos abertos`);
    const prazos = proximos.map(
        (a) => `- ${a.dataFimSubmissao!.toISOString().slice(0, 10)}: [${a.portal}] ${a.nome.slice(0, 70)} (${a.codigo})`,
    );

    const texto = `AVISOS ABERTOS NA BASE DE DADOS (atualizada diariamente):\n${linhas.join('\n')}\n\nPRÓXIMOS PRAZOS:\n${prazos.join('\n')}`;
    statsCache = { at: Date.now(), texto };
    return texto;
}

/** Definições no formato OpenAI tools, geradas a partir dos schemas zod. */
export const TOOL_DEFINITIONS: ToolDefinition[] = [
    {
        type: 'function',
        function: {
            name: 'search_avisos',
            description: 'Pesquisa avisos de financiamento na base de dados (atualizada diariamente, 9 portais PT+UE). Usa para qualquer pergunta sobre avisos, fundos ou prazos. IMPORTANTE: começa com POUCOS filtros (só texto com 1-2 palavras-chave, ou só portal). Os campos tipoApoio/regiaoNUTS2/montanteMaximoMinimo só estão preenchidos numa minoria dos avisos — usá-los exclui os restantes; aplica-os apenas se o utilizador os exigir explicitamente.',
            parameters: {
                type: 'object',
                properties: {
                    texto: { type: 'string', description: 'Pesquisa livre no nome/descrição/programa (ex.: "digitalização", "turismo")' },
                    portal: { type: 'string', enum: [...PORTAIS] },
                    apenasAbertos: { type: 'boolean', description: 'true = só avisos com prazo futuro (default)' },
                    prazoAteDias: { type: 'number', description: 'Só avisos que fecham nos próximos N dias' },
                    tipoApoio: { type: 'string', enum: [...TIPOS_APOIO] },
                    regiaoNUTS2: { type: 'string', description: 'Norte, Centro, Lisboa, Alentejo, Algarve, Açores, Madeira' },
                    montanteMaximoMinimo: { type: 'number', description: 'Só avisos com apoio máximo >= este valor em euros' },
                    limite: { type: 'number', description: `1-${MAX_RESULTADOS}, default 10` },
                },
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'get_aviso_detail',
            description: 'Detalhe completo de um aviso específico pelo seu código (ex.: "FA0006/2026", "HORIZON-CL5-2026-...").',
            parameters: {
                type: 'object',
                properties: { codigo: { type: 'string' } },
                required: ['codigo'],
            },
        },
    },
];
