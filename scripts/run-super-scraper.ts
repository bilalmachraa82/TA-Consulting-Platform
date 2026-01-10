/**
 * Script para correr o super-scraper localmente e sincronizar para DB
 * 
 * Usa os scrapers já validados do apify-actors/super-scraper
 * 
 * Uso: npx tsx scripts/run-super-scraper.ts
 */

import { PrismaClient } from '@prisma/client';

// Importar scrapers do super-scraper
import {
    scrapePRR,
    scrapeCORDIS,
    scrapePEPAC,
    scrapeEuropaCriativa,
    type AvisoNormalized,
} from '../apify-actors/super-scraper/src/lib';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Correndo super-scrapers localmente...');
    console.log('━'.repeat(60));

    const allAvisos: AvisoNormalized[] = [];
    const results: { portal: string; count: number; success: boolean; error?: string }[] = [];

    // 1. Horizon Europe (via CORDIS/SEDIA)
    console.log('\n📡 [1/4] Horizon Europe (SEDIA API)...');
    try {
        const horizonAvisos = await scrapeCORDIS({
            maxItems: 100,
            onlyOpen: true,
            includeDocuments: false,
        });
        allAvisos.push(...horizonAvisos);
        results.push({ portal: 'HORIZON_EUROPE', count: horizonAvisos.length, success: true });
        console.log(`    ✅ ${horizonAvisos.length} avisos`);
    } catch (error: any) {
        results.push({ portal: 'HORIZON_EUROPE', count: 0, success: false, error: error.message });
        console.log(`    ❌ ${error.message}`);
    }

    await new Promise(r => setTimeout(r, 1000));

    // 2. PRR
    console.log('\n📡 [2/4] PRR - Recuperar Portugal...');
    try {
        const prrAvisos = await scrapePRR({
            maxItems: 100,
            onlyOpen: true,
        });
        allAvisos.push(...prrAvisos);
        results.push({ portal: 'PRR', count: prrAvisos.length, success: true });
        console.log(`    ✅ ${prrAvisos.length} avisos`);
    } catch (error: any) {
        results.push({ portal: 'PRR', count: 0, success: false, error: error.message });
        console.log(`    ❌ ${error.message}`);
    }

    await new Promise(r => setTimeout(r, 1000));

    // 3. PEPAC
    console.log('\n📡 [3/4] PEPAC (IFAP)...');
    try {
        const pepacAvisos = await scrapePEPAC({
            maxItems: 50,
            onlyOpen: true,
        });
        allAvisos.push(...pepacAvisos);
        results.push({ portal: 'PEPAC', count: pepacAvisos.length, success: true });
        console.log(`    ✅ ${pepacAvisos.length} avisos`);
    } catch (error: any) {
        results.push({ portal: 'PEPAC', count: 0, success: false, error: error.message });
        console.log(`    ❌ ${error.message}`);
    }

    await new Promise(r => setTimeout(r, 1000));

    // 4. Europa Criativa
    console.log('\n📡 [4/4] Europa Criativa...');
    try {
        const creativeAvisos = await scrapeEuropaCriativa({
            maxItems: 50,
            onlyOpen: true,
            includeDocuments: false,
        });
        allAvisos.push(...creativeAvisos);
        results.push({ portal: 'EUROPA_CRIATIVA', count: creativeAvisos.length, success: true });
        console.log(`    ✅ ${creativeAvisos.length} avisos`);
    } catch (error: any) {
        results.push({ portal: 'EUROPA_CRIATIVA', count: 0, success: false, error: error.message });
        console.log(`    ❌ ${error.message}`);
    }

    // Sincronizar para DB
    console.log('\n' + '━'.repeat(60));
    console.log('💾 Sincronizando para base de dados...');

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const aviso of allAvisos) {
        try {
            const existing = await prisma.aviso.findFirst({
                where: { codigo: aviso.codigo },
            });

            if (existing) {
                // Update se necessário
                if (existing.dataFimSubmissao?.toISOString().split('T')[0] !== aviso.dataFecho) {
                    await prisma.aviso.update({
                        where: { id: existing.id },
                        data: {
                            nome: aviso.titulo,
                            dataFimSubmissao: aviso.dataFecho ? new Date(aviso.dataFecho) : null,
                            ativo: aviso.status === 'Aberto',
                            updatedAt: new Date(),
                        },
                    });
                    updated++;
                } else {
                    skipped++;
                }
            } else {
                // Create
                await prisma.aviso.create({
                    data: {
                        nome: aviso.titulo,
                        codigo: aviso.codigo || `AUTO-${Date.now()}`,
                        portal: mapPortal(aviso.fonte),
                        programa: aviso.programa,
                        descricao: aviso.descricao || '',
                        dataInicioSubmissao: aviso.dataAbertura ? new Date(aviso.dataAbertura) : null,
                        dataFimSubmissao: aviso.dataFecho ? new Date(aviso.dataFecho) : null,
                        montanteTotal: aviso.dotacao || null,
                        link: aviso.url,
                        ativo: aviso.status === 'Aberto',
                    },
                });
                created++;
            }
        } catch (error: any) {
            // Ignore duplicates
        }
    }

    // Report final
    console.log('\n' + '━'.repeat(60));
    console.log('📊 RELATÓRIO FINAL');
    console.log('━'.repeat(60));

    for (const r of results) {
        const icon = r.success ? '✅' : '❌';
        console.log(`  ${icon} ${r.portal}: ${r.count} avisos${r.error ? ` (${r.error})` : ''}`);
    }

    console.log('\n📈 SINCRONIZAÇÃO:');
    console.log(`  ✅ Criados: ${created}`);
    console.log(`  🔄 Actualizados: ${updated}`);
    console.log(`  ⏭️  Ignorados: ${skipped}`);

    // Stats por portal
    const stats = await prisma.aviso.groupBy({
        by: ['portal'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
    });

    console.log('\n📈 AVISOS NA DB (após sync):');
    stats.forEach(s => {
        console.log(`  ${s.portal}: ${s._count.id}`);
    });

    await prisma.$disconnect();
}

function mapPortal(fonte: string): string {
    const map: Record<string, string> = {
        'Horizon Europe': 'HORIZON_EUROPE',
        'PRR': 'PRR',
        'PEPAC': 'PEPAC',
        'Europa Criativa': 'EUROPA_CRIATIVA',
        'Creative Europe': 'EUROPA_CRIATIVA',
        'IPDJ': 'IPDJ',
    };
    return map[fonte] || fonte;
}

main()
    .then(() => {
        console.log('\n✅ Concluído!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Erro fatal:', error);
        process.exit(1);
    });
