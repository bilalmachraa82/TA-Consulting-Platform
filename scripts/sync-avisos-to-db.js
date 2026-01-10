/**
 * Sync Avisos to Database (CommonJS version)
 * 
 * Runs all scrapers and populates the PostgreSQL database with normalized data.
 * 
 * Usage: node scripts/sync-avisos-to-db.js
 */

const dotenv = require('dotenv');
const path = require('path');

// Load env from project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { PrismaClient } = require('@prisma/client');

// Import scrapers from super-scraper
const scraperPath = path.resolve(__dirname, '../apify-actors/super-scraper/dist/lib');
const { scrapePortugal2030 } = require(`${scraperPath}/portugal2030.js`);
const { scrapePRR } = require(`${scraperPath}/prr.js`);
const { scrapeIPDJ } = require(`${scraperPath}/ipdj.js`);
const { scrapeCORDIS } = require(`${scraperPath}/cordis.js`);
const { scrapeEuropaCriativa } = require(`${scraperPath}/europa-criativa.js`);

const prisma = new PrismaClient();

// Map portal names to Prisma enum
const portalMap = {
    'Portugal 2030': 'PORTUGAL2030',
    'PT2030': 'PORTUGAL2030',
    'PRR': 'PRR',
    'PEPAC': 'PEPAC',
    'PEPAC Continente': 'PEPAC',
    'Horizon Europe': 'HORIZON_EUROPE',
    'HORIZON': 'HORIZON_EUROPE',
    'Europa Criativa': 'EUROPA_CRIATIVA',
    'IPDJ': 'IPDJ',
};

function parseDate(dateStr) {
    if (!dateStr) return new Date();
    try {
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? new Date() : d;
    } catch {
        return new Date();
    }
}

async function upsertAviso(aviso, portalName) {
    const portal = portalMap[portalName] || portalMap[aviso.fonte] || 'PORTUGAL2030';
    const codigo = aviso.codigo || aviso.id || `${portalName}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    try {
        // Check if exists
        const existing = await prisma.aviso.findFirst({ where: { codigo } });

        // Prepare data object with anexos mapping
        const dataPayload = {
            nome: (aviso.titulo || 'Sem título').slice(0, 500),
            programa: (aviso.programa || portalName).slice(0, 200),
            dataInicioSubmissao: parseDate(aviso.dataAbertura),
            dataFimSubmissao: parseDate(aviso.dataFecho),
            montanteMinimo: aviso.dotacao || null,
            ativo: aviso.status === 'Aberto',
            link: aviso.url,
            descricao: aviso.descricao ? aviso.descricao.slice(0, 5000) : null,
            anexos: aviso.documentos ? JSON.parse(JSON.stringify(aviso.documentos)) : [],
        };

        if (existing) {
            await prisma.aviso.update({
                where: { id: existing.id },
                data: dataPayload
            });
        } else {
            await prisma.aviso.create({
                data: {
                    ...dataPayload,
                    codigo,
                    portal,
                }
            });
        }
        return true;
    } catch (e) {
        if (e.message && !e.message.includes('Unique constraint')) {
            console.error(`  ⚠️ ${codigo.slice(0, 30)}: ${e.message.slice(0, 60)}`);
        }
        return false;
    }
}

async function syncPortal(name, scraper) {
    console.log(`\n📡 ${name}: Scraping...`);
    try {
        const avisos = await scraper();
        console.log(`   ✅ ${avisos.length} avisos obtidos`);

        let success = 0;
        for (const aviso of avisos) {
            if (await upsertAviso(aviso, name)) success++;
        }
        console.log(`   💾 ${success}/${avisos.length} guardados na DB`);
        return success;
    } catch (e) {
        console.log(`   ❌ Erro: ${e.message}`);
        return 0;
    }
}

async function main() {
    console.log('═'.repeat(50));
    console.log('🚀 SYNC AVISOS TO DATABASE (WITH ANEXOS)');
    console.log('═'.repeat(50));

    let total = 0;

    // PT2030
    total += await syncPortal('PT2030', () => scrapePortugal2030({ maxItems: 500, onlyOpen: false }));

    // PRR
    total += await syncPortal('PRR', () => scrapePRR({ maxItems: 500, onlyOpen: false }));

    // IPDJ
    total += await syncPortal('IPDJ', () => scrapeIPDJ({ maxItems: 50, onlyOpen: true }));

    // Horizon
    total += await syncPortal('Horizon', () => scrapeCORDIS({ maxItems: 100, onlyOpen: true, includeDocuments: true }));

    // Europa Criativa
    total += await syncPortal('Europa Criativa', () => scrapeEuropaCriativa({ maxItems: 50, onlyOpen: true, includeDocuments: true }));

    console.log('\n⏭️  PEPAC: Skipped (requires Firecrawl, run ingest-rag.ts separately)');

    console.log('\n' + '═'.repeat(50));
    console.log(`✅ TOTAL: ${total} avisos sincronizados`);
    console.log('═'.repeat(50));

    // Final count
    const count = await prisma.aviso.count();
    const byPortal = await prisma.aviso.groupBy({
        by: ['portal'],
        _count: true
    });

    // Check anexos count (approx)
    // Note: Can't easily count json fields with prisma without raw query, skipping for speed

    console.log(`\n📊 Total na DB: ${count} avisos`);
    console.log('Por portal:');
    byPortal.forEach(p => console.log(`   - ${p.portal}: ${p._count}`));

    await prisma.$disconnect();
}

main().catch(e => {
    console.error('Fatal:', e);
    process.exit(1);
});
