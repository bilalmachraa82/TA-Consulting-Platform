/**
 * Dados dos hubs setoriais (fase B) — partilhado pelas duas rotas e pelo sitemap.
 * Prisma direto (sem fallback JSON). O matching é em memória sobre os abertos
 * (~700) — barato, e o resultado fica em cache ISR 1h.
 */
import { PrismaClient } from '@prisma/client';
import { SETORES, REGIOES_HUB, avisoPertenceAoSetor, avisoServeRegiao, type SetorHub } from './setores';

const prisma = new PrismaClient();

export interface AvisoHubRow {
    slug: string | null;
    nome: string;
    descricao: string | null;
    portal: string;
    dataFimSubmissao: Date | null;
    montanteMaximo: number | null;
    taxaCofinanciamentoMax: number | null;
    setoresElegiveis: string[];
    regiaoNUTS2: string | null;
    abrangenciaGeografica: string | null;
    nutsCompativeis: string[];
}

/** Avisos abertos com slug (a matéria-prima de todos os hubs). */
export async function avisosAbertos(): Promise<AvisoHubRow[]> {
    return prisma.aviso.findMany({
        where: { slug: { not: null }, dataFimSubmissao: { gte: new Date() } },
        orderBy: { dataFimSubmissao: 'asc' },
        select: {
            slug: true, nome: true, descricao: true, portal: true,
            dataFimSubmissao: true, montanteMaximo: true, taxaCofinanciamentoMax: true,
            setoresElegiveis: true, regiaoNUTS2: true, abrangenciaGeografica: true,
            nutsCompativeis: true,
        },
    });
}

export function filtrarPorSetor(avisos: AvisoHubRow[], setor: SetorHub): AvisoHubRow[] {
    return avisos.filter((a) => avisoPertenceAoSetor(a, setor));
}

export function filtrarPorRegiao(avisos: AvisoHubRow[], regiaoNuts: string): AvisoHubRow[] {
    return avisos.filter((a) => avisoServeRegiao(a, regiaoNuts));
}

/** Combos setor(/região) com ≥1 aviso aberto — para o sitemap (omite vazios). */
export async function combosComAvisos(): Promise<{ setor: string; regiao?: string }[]> {
    const abertos = await avisosAbertos();
    const out: { setor: string; regiao?: string }[] = [];
    for (const s of SETORES) {
        const doSetor = filtrarPorSetor(abertos, s);
        if (doSetor.length === 0) continue;
        out.push({ setor: s.slug });
        for (const r of REGIOES_HUB) {
            if (filtrarPorRegiao(doSetor, r.nuts).length > 0) out.push({ setor: s.slug, regiao: r.slug });
        }
    }
    return out;
}
