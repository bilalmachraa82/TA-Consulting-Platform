/**
 * Fundos elegíveis — endpoint PÚBLICO (funil de topo, sem login).
 *
 * Uma PME indica setor/dimensão/região (e opcionalmente CAE) e recebe os avisos
 * abertos a que é elegível, JÁ com a análise explicável (o diferenciador #1).
 * É a ferramenta grátis de captação: demonstra valor antes de qualquer registo.
 *
 * POST /api/fundos-elegiveis  { cae?, setor?, dimensao?, regiao? }
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limiter';
import { analisarElegibilidade } from '@/lib/eligibility-analysis';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const RequestSchema = z.object({
    cae: z.string().max(20).optional(),
    setor: z.string().max(120).optional(),
    dimensao: z.enum(['MICRO', 'PEQUENA', 'MEDIA', 'GRANDE']).optional(),
    regiao: z.string().max(60).optional(),
}).refine((d) => d.cae || d.setor || d.dimensao || d.regiao, {
    message: 'Indica pelo menos um critério (CAE, setor, dimensão ou região).',
});

const ORDEM_VEREDICTO: Record<string, number> = {
    elegivel: 0, elegivel_com_reservas: 1, dados_insuficientes: 2, provavelmente_nao: 3,
};

export async function POST(request: NextRequest) {
    const ip = getClientIP(request);
    const rl = checkRateLimit(`fundos-elegiveis:${ip}`, RATE_LIMITS.CHATBOT);
    if (!rl.success) {
        return NextResponse.json({ error: 'Demasiados pedidos. Aguarda um momento.' }, { status: 429, headers: { 'Retry-After': rl.resetIn.toString() } });
    }

    const parsed = RequestSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Pedido inválido' }, { status: 400 });
    }

    const { cae, setor, dimensao, regiao } = parsed.data;
    const now = new Date();

    try {
        // Avisos abertos (prazo futuro ou por confirmar). Prioriza os enriquecidos
        // — só esses dão análise rica — mas inclui todos os abertos.
        const avisos = await prisma.aviso.findMany({
            where: { ativo: true, OR: [{ dataFimSubmissao: null }, { dataFimSubmissao: { gte: now } }] },
            orderBy: [{ enrichmentStatus: 'desc' }, { dataFimSubmissao: { sort: 'asc', nulls: 'last' } }],
            take: 400,
            select: {
                id: true, nome: true, portal: true, programa: true, descricao: true, link: true,
                dataFimSubmissao: true, montanteMinimo: true, montanteMaximo: true, regiao: true,
                caeElegiveis: true, tiposBeneficiarios: true, regiaoNUTS2: true, regiaoNUTS3: true,
                dimensaoEmpresa: true, abrangenciaGeografica: true,
            },
        });

        const empresa = { cae, setor, dimensao, regiao, nut: regiao };

        const analisados = avisos.map((a) => {
            const elegibilidade = analisarElegibilidade(empresa, {
                nome: a.nome, descricao: a.descricao, dataFimSubmissao: a.dataFimSubmissao,
                montanteMinimo: a.montanteMinimo, montanteMaximo: a.montanteMaximo,
                caeElegiveis: a.caeElegiveis, tiposBeneficiarios: a.tiposBeneficiarios as string[],
                regiaoNUTS2: a.regiaoNUTS2, regiaoNUTS3: a.regiaoNUTS3, dimensaoEmpresa: a.dimensaoEmpresa,
                abrangenciaGeografica: a.abrangenciaGeografica,
            }, now);
            const avaliados = elegibilidade.criterios.filter((c) => c.estado !== 'desconhecido').length;
            return {
                id: a.id, nome: a.nome, portal: a.portal, programa: a.programa, link: a.link,
                prazo: a.dataFimSubmissao ? a.dataFimSubmissao.toISOString().slice(0, 10) : null,
                montanteMaximo: a.montanteMaximo,
                elegibilidade: { ...elegibilidade, criteriosAvaliados: avaliados, criteriosTotal: elegibilidade.criterios.length },
            };
        });

        // Fundos relevantes ao setor da empresa sobem ao topo: é o que torna a
        // lista "os TEUS fundos" em vez de uma lista genérica igual para todos.
        const relevanteSetor = (r: (typeof analisados)[number]) =>
            r.elegibilidade.criterios.some((c) => c.dimensao.startsWith('Setor') && c.estado === 'ok') ? 0 : 1;

        // Portais nacionais primeiro: uma PME portuguesa candidata-se sobretudo a
        // PT2030/PRR/PEPAC/Fundo Ambiental. As calls Horizon/LIFE (investigação UE,
        // consórcios, noutras línguas) raramente são o que uma PME quer — vão para o fim.
        const NACIONAIS = new Set(['PORTUGAL2030', 'PRR', 'PEPAC', 'FUNDO_AMBIENTAL', 'IPDJ', 'BASE_GOV']);
        const rankPortal = (r: (typeof analisados)[number]) => (NACIONAIS.has(String(r.portal)) ? 0 : 1);

        // Mostra os que NÃO são "provavelmente não" — o utilizador quer oportunidades.
        const resultados = analisados
            .filter((r) => r.elegibilidade.veredicto !== 'provavelmente_nao')
            .sort((x, y) => {
                const dv = (ORDEM_VEREDICTO[x.elegibilidade.veredicto] ?? 9) - (ORDEM_VEREDICTO[y.elegibilidade.veredicto] ?? 9);
                if (dv !== 0) return dv;
                const dp = rankPortal(x) - rankPortal(y);
                if (dp !== 0) return dp;
                const rs = relevanteSetor(x) - relevanteSetor(y);
                if (rs !== 0) return rs;
                return y.elegibilidade.score - x.elegibilidade.score;
            })
            .slice(0, 30);

        const resumo = {
            totalAvisosAbertos: avisos.length,
            elegiveis: resultados.filter((r) => r.elegibilidade.veredicto === 'elegivel').length,
            comReservas: resultados.filter((r) => r.elegibilidade.veredicto === 'elegivel_com_reservas').length,
        };

        return NextResponse.json({ success: true, resumo, resultados });
    } catch (error) {
        console.error('[fundos-elegiveis] erro:', error);
        return NextResponse.json({ error: 'Erro ao analisar fundos.' }, { status: 500 });
    }
}
