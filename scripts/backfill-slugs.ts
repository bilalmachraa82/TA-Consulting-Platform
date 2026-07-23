/**
 * Backfill manual de slugs (fase B). Idempotente — re-correr = 0 alterações.
 * Uso: npx tsx scripts/backfill-slugs.ts
 */
import { PrismaClient } from '@prisma/client';
import { backfillSlugsPendentes } from '../lib/slug-backfill';

const prisma = new PrismaClient();

async function main() {
    const antes = await prisma.aviso.count({ where: { slug: null } });
    console.log(`Avisos sem slug: ${antes}`);
    const { atualizados, semDados } = await backfillSlugsPendentes(prisma);
    console.log(`✅ slugs gerados: ${atualizados} | sem nome+código (ficam fora das páginas): ${semDados}`);
}

main().finally(() => prisma.$disconnect());
