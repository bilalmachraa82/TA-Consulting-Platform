/**
 * Limpeza das empresas placeholder do Bitrix (NIPC "BTX…").
 *
 * As ~24k empresas importadas do Bitrix (`sync-bitrix-to-db.ts`) têm NIPC
 * placeholder "BTX<id>" e CAE a 2 dígitos — não são dados de qualidade e
 * poluem a lista /empresas e os KPIs do dashboard. Apagá-las também reduz a
 * exposição RGPD (estão na BD desde antes do DPA assinado com o Fernando) e
 * serão re-importadas em condições quando o CSV+DPA chegarem. As 8 empresas
 * demo reais (NIPC verdadeiro) NÃO são tocadas.
 *
 * Segurança: dry-run por defeito. Aborta se alguma empresa BTX tiver
 * candidaturas ou documentos (não deveria — confirmado 0/0 em 2026-07-21).
 *
 *   npx tsx scripts/limpar-empresas-placeholder.ts            # dry-run (só conta)
 *   npx tsx scripts/limpar-empresas-placeholder.ts --commit   # apaga a sério
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const COMMIT = process.argv.includes('--commit');

async function main() {
    const filtro = { nipc: { startsWith: 'BTX' } };

    const total = await prisma.empresa.count({ where: filtro });
    const reais = await prisma.empresa.count({ where: { NOT: filtro } });
    const comCandidaturas = await prisma.candidatura.count({ where: { empresa: filtro } });
    const comDocumentos = await prisma.documento.count({ where: { empresa: filtro } });

    console.log('════════════════════════════════════════════════');
    console.log('🧹 LIMPEZA DE EMPRESAS PLACEHOLDER BITRIX (BTX…)');
    console.log('════════════════════════════════════════════════');
    console.log(`  placeholder BTX a apagar : ${total}`);
    console.log(`  empresas reais (ficam)   : ${reais}`);
    console.log(`  referências candidaturas : ${comCandidaturas}`);
    console.log(`  referências documentos   : ${comDocumentos}`);

    if (comCandidaturas > 0 || comDocumentos > 0) {
        console.error('\n❌ ABORTADO: há empresas BTX referenciadas por candidaturas/documentos.');
        console.error('   Apagar quebraria integridade referencial. Rever manualmente primeiro.');
        process.exit(1);
    }

    if (!COMMIT) {
        console.log('\n🔍 DRY-RUN — nada foi apagado. Corre com --commit para apagar.');
        await prisma.$disconnect();
        return;
    }

    const r = await prisma.empresa.deleteMany({ where: filtro });
    const restantes = await prisma.empresa.count();
    console.log(`\n✅ Apagadas ${r.count} empresas placeholder. Restam ${restantes} empresas reais.`);
    await prisma.$disconnect();
}

main().catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
});
