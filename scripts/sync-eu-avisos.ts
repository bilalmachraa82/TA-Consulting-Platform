/**
 * Script para sincronizar avisos da EU Search API para a base de dados
 * 
 * Uso: npx tsx scripts/sync-eu-avisos.ts
 */

import { PrismaClient } from '@prisma/client';
import { scrapeEUFundingPortal, AvisoFromEU } from '../lib/scrapers/eu-search-api';

const prisma = new PrismaClient();

async function syncEUAvisosToDatabase() {
    console.log('🚀 Sincronizando avisos EU para base de dados...');
    console.log('━'.repeat(50));

    try {
        // 1. Fetch avisos da EU API
        const euAvisos = await scrapeEUFundingPortal();

        if (euAvisos.length === 0) {
            console.log('⚠️ Nenhum aviso retornado da EU API');
            return;
        }

        console.log(`\n📥 ${euAvisos.length} avisos para processar`);

        // 2. Estatísticas
        let created = 0;
        let updated = 0;
        let skipped = 0;

        // 3. Upsert cada aviso
        for (const aviso of euAvisos) {
            try {
                const existing = await prisma.aviso.findFirst({
                    where: { codigo: aviso.codigo },
                });

                if (existing) {
                    // Update se data fim mudou
                    if (existing.dataFimSubmissao?.toISOString().split('T')[0] !== aviso.dataFimSubmissao) {
                        await prisma.aviso.update({
                            where: { id: existing.id },
                            data: {
                                nome: aviso.nome,
                                dataFimSubmissao: aviso.dataFimSubmissao ? new Date(aviso.dataFimSubmissao) : null,
                                ativo: aviso.status === 'Aberto',
                                updatedAt: new Date(),
                            },
                        });
                        updated++;
                    } else {
                        skipped++;
                    }
                } else {
                    // Create novo aviso
                    await prisma.aviso.create({
                        data: {
                            nome: aviso.nome,
                            codigo: aviso.codigo,
                            portal: aviso.portal,
                            programa: aviso.programa,
                            descricao: aviso.descricao,
                            dataInicioSubmissao: aviso.dataInicioSubmissao ? new Date(aviso.dataInicioSubmissao) : null,
                            dataFimSubmissao: aviso.dataFimSubmissao ? new Date(aviso.dataFimSubmissao) : null,
                            montanteTotal: aviso.montanteTotal || null,
                            link: aviso.link,
                            ativo: aviso.status === 'Aberto',
                        },
                    });
                    created++;
                }
            } catch (error: any) {
                console.log(`  ⚠️ Erro em ${aviso.codigo}: ${error.message}`);
            }
        }

        // 4. Report
        console.log('\n' + '━'.repeat(50));
        console.log('📊 RELATÓRIO DE SINCRONIZAÇÃO');
        console.log('━'.repeat(50));
        console.log(`  ✅ Criados: ${created}`);
        console.log(`  🔄 Actualizados: ${updated}`);
        console.log(`  ⏭️  Ignorados: ${skipped}`);
        console.log(`  📦 Total processados: ${euAvisos.length}`);

        // 5. Contagem por portal
        const stats = await prisma.aviso.groupBy({
            by: ['portal'],
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
        });

        console.log('\n📈 AVISOS POR PORTAL (após sync):');
        stats.forEach(s => {
            console.log(`  ${s.portal}: ${s._count.id}`);
        });

    } catch (error: any) {
        console.error('❌ Erro fatal:', error.message);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run
syncEUAvisosToDatabase()
    .then(() => {
        console.log('\n✅ Sincronização concluída!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Falha na sincronização:', error);
        process.exit(1);
    });
