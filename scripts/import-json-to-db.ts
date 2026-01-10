/**
 * Import avisos from JSON file to database
 * 
 * Reads the already-scraped all-avisos.json and imports directly to PostgreSQL
 * This is faster than re-scraping all portals
 * 
 * @usage npx tsx scripts/import-json-to-db.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient, Portal } from '@prisma/client';

const prisma = new PrismaClient();

// Map fonte strings to Portal enum
const portalMap: Record<string, Portal> = {
    'Portugal 2030': Portal.PORTUGAL2030,
    'PT2030': Portal.PORTUGAL2030,
    'PRR': Portal.PRR,
    'PEPAC': Portal.PEPAC,
    'PEPAC Continente': Portal.PEPAC,
    'Horizon Europe': Portal.HORIZON_EUROPE,
    'HORIZON': Portal.HORIZON_EUROPE,
    'Europa Criativa': Portal.EUROPA_CRIATIVA,
    'IPDJ': Portal.IPDJ,
};

interface JsonAviso {
    id?: string;
    codigo?: string;
    titulo?: string;
    programa?: string;
    dataAbertura?: string;
    dataFecho?: string;
    dotacao?: number;
    status?: string;
    url?: string;
    fonte?: string;
    descricao?: string;
    documentos?: Array<{ url?: string; nome?: string; tipo?: string }>;
    beneficiarios?: string[];
    modalidade?: string[];
    taxa?: number;
}

function parseDate(dateStr?: string): Date {
    if (!dateStr) return new Date();
    try {
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? new Date() : d;
    } catch {
        return new Date();
    }
}

function getPortal(fonte?: string): Portal {
    if (!fonte) return Portal.PORTUGAL2030;
    return portalMap[fonte] || Portal.PORTUGAL2030;
}

async function importAvisos() {
    console.log('═'.repeat(60));
    console.log('📥 IMPORT JSON TO DATABASE');
    console.log('═'.repeat(60));

    // Read JSON file
    const jsonPath = path.resolve(__dirname, '../apify-actors/super-scraper/storage/all-avisos.json');

    if (!fs.existsSync(jsonPath)) {
        console.error('❌ File not found:', jsonPath);
        console.log('Run scraping first with: cd apify-actors/super-scraper && npx ts-node src/scrape-full.ts');
        process.exit(1);
    }

    console.log(`\n📂 Loading: ${jsonPath}`);
    const rawData = fs.readFileSync(jsonPath, 'utf-8');
    const avisos: JsonAviso[] = JSON.parse(rawData);
    console.log(`✅ Loaded ${avisos.length} avisos from JSON\n`);

    // Stats
    let created = 0;
    let updated = 0;
    let errors = 0;
    const byPortal: Record<string, number> = {};

    // Process each aviso
    for (let i = 0; i < avisos.length; i++) {
        const aviso = avisos[i];
        const codigo = aviso.codigo || aviso.id || `IMPORT-${Date.now()}-${i}`;
        const portal = getPortal(aviso.fonte);

        // Track by portal
        const portalKey = aviso.fonte || 'Unknown';
        byPortal[portalKey] = (byPortal[portalKey] || 0) + 1;

        try {
            // Check if exists
            const existing = await prisma.aviso.findFirst({
                where: { codigo }
            });

            const data = {
                nome: aviso.titulo?.slice(0, 500) || 'Sem título',
                portal,
                programa: aviso.programa?.slice(0, 200) || portalKey,
                dataInicioSubmissao: parseDate(aviso.dataAbertura),
                dataFimSubmissao: parseDate(aviso.dataFecho),
                montanteMinimo: aviso.dotacao || null,
                ativo: aviso.status === 'Aberto',
                link: aviso.url || null,
                descricao: aviso.descricao?.slice(0, 5000) || null,
                anexos: aviso.documentos ? JSON.parse(JSON.stringify(aviso.documentos)) : [],
                taxa: aviso.taxa ? String(aviso.taxa) : null,
            };

            if (existing) {
                await prisma.aviso.update({
                    where: { id: existing.id },
                    data
                });
                updated++;
            } else {
                await prisma.aviso.create({
                    data: {
                        codigo,
                        ...data
                    }
                });
                created++;
            }

            // Progress indicator every 100 avisos
            if ((i + 1) % 100 === 0 || i === avisos.length - 1) {
                process.stdout.write(`\r   📊 Progress: ${i + 1}/${avisos.length} (${created} new, ${updated} updated)`);
            }
        } catch (e: any) {
            errors++;
            if (!e.message?.includes('Unique constraint')) {
                // Only log non-duplicate errors
                console.error(`\n   ⚠️ Error on ${codigo.slice(0, 30)}: ${e.message?.slice(0, 60)}`);
            }
        }
    }

    console.log('\n');

    // Final stats
    console.log('═'.repeat(60));
    console.log('📊 IMPORT RESULTS');
    console.log('═'.repeat(60));
    console.log(`✅ Created: ${created}`);
    console.log(`🔄 Updated: ${updated}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`📈 Total processed: ${avisos.length}`);

    console.log('\n📋 By Portal:');
    Object.entries(byPortal).sort((a, b) => b[1] - a[1]).forEach(([portal, count]) => {
        console.log(`   - ${portal}: ${count}`);
    });

    // Verify in database
    console.log('\n─'.repeat(60));
    const dbCount = await prisma.aviso.count();
    const dbByPortal = await prisma.aviso.groupBy({
        by: ['portal'],
        _count: true
    });

    console.log(`\n💾 Database now has: ${dbCount} avisos`);
    console.log('By portal in DB:');
    dbByPortal.forEach(p => console.log(`   - ${p.portal}: ${p._count}`));

    console.log('\n═'.repeat(60));
    console.log('✅ IMPORT COMPLETE');
    console.log('═'.repeat(60));

    await prisma.$disconnect();
}

importAvisos().catch(e => {
    console.error('Fatal:', e);
    process.exit(1);
});
