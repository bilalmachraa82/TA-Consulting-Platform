/**
 * Backfill de slugs em avisos sem slug — idempotente (só toca em slug IS NULL).
 *
 * Chamado por: scripts/backfill-slugs.ts (manual), fim dos syncs de scraping e
 * cron do digest (rede de segurança: avisos novos ganham slug ≤1 semana depois
 * de entrarem, mesmo que um write-path se esqueça de o gerar).
 */
import type { PrismaClient } from '@prisma/client';
import { gerarSlugAviso, slugUnico } from './slug';

export async function backfillSlugsPendentes(prisma: PrismaClient): Promise<{ atualizados: number; semDados: number }> {
    const [pendentes, existentes] = await Promise.all([
        prisma.aviso.findMany({ where: { slug: null }, select: { id: true, nome: true, codigo: true } }),
        prisma.aviso.findMany({ where: { slug: { not: null } }, select: { slug: true } }),
    ]);

    const usados = new Set(existentes.map((a) => a.slug as string));
    let atualizados = 0;
    let semDados = 0;

    for (const aviso of pendentes) {
        const base = gerarSlugAviso(aviso.nome, aviso.codigo);
        if (!base) { semDados++; continue; }
        const slug = slugUnico(base, usados);
        usados.add(slug);
        await prisma.aviso.update({ where: { id: aviso.id }, data: { slug } });
        atualizados++;
    }
    return { atualizados, semDados };
}
