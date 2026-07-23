/**
 * TESTE DE REGRESSÃO CRÍTICO (eng review 23/07): o sitemap anunciava o domínio
 * antigo ta-consulting-platform ao Google porque tinha uma cópia local do
 * SITE_URL. Este teste falha se alguém reintroduzir um domínio hardcoded.
 */
import { describe, it, expect, vi, beforeAll } from 'vitest';

vi.mock('@prisma/client', () => {
    const avisos = [
        { slug: 'aviso-aberto', updatedAt: new Date(), dataFimSubmissao: new Date(Date.now() + 30 * 86_400_000) },
        { slug: 'aviso-fechado-recente', updatedAt: new Date(), dataFimSubmissao: new Date(Date.now() - 30 * 86_400_000) },
    ];
    return {
        // classe (não arrow) — o código de produção faz `new PrismaClient()`
        PrismaClient: class {
            aviso = { findMany: async () => avisos };
        },
    };
});

vi.mock('@/lib/hub-data', () => ({
    combosComAvisos: vi.fn(async () => [
        { setor: 'turismo' },
        { setor: 'turismo', regiao: 'norte' },
    ]),
}));

import sitemap from '@/app/sitemap';
import { SITE_URL } from '@/lib/site-url';

describe('sitemap (regressão de domínio)', () => {
    let entradas: Awaited<ReturnType<typeof sitemap>>;
    beforeAll(async () => { entradas = await sitemap(); });

    it('todas as URLs usam o SITE_URL único', () => {
        expect(entradas.length).toBeGreaterThan(0);
        for (const e of entradas) expect(e.url.startsWith(SITE_URL)).toBe(true);
    });

    it('REGRESSÃO: zero referências ao domínio antigo', () => {
        for (const e of entradas) expect(e.url).not.toContain('ta-consulting-platform');
    });

    it('inclui estáticas + hubs + avisos', () => {
        const urls = entradas.map((e) => e.url);
        expect(urls).toContain(`${SITE_URL}/encontrar-fundos`);
        expect(urls).toContain(`${SITE_URL}/fundos/turismo`);
        expect(urls).toContain(`${SITE_URL}/fundos/turismo/norte`);
        expect(urls).toContain(`${SITE_URL}/avisos/aviso-aberto`);
    });

    it('aviso aberto tem prioridade maior que fechado', () => {
        const aberto = entradas.find((e) => e.url.endsWith('/avisos/aviso-aberto'));
        const fechado = entradas.find((e) => e.url.endsWith('/avisos/aviso-fechado-recente'));
        expect(aberto!.priority!).toBeGreaterThan(fechado!.priority!);
    });
});
