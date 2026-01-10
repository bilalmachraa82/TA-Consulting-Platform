/**
 * Sync Avisos to Database
 * 
 * Runs all scrapers and populates the PostgreSQL database with normalized data.
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { PrismaClient, Portal } from '@prisma/client';

// Import scrapers from super-scraper
const scraperPath = path.resolve(__dirname, '../apify-actors/super-scraper/dist/lib');
const { scrapePortugal2030 } = require(`${scraperPath}/portugal2030.js`);
const { scrapePRR } = require(`${scraperPath}/prr.js`);
const { scrapeIPDJ } = require(`${scraperPath}/ipdj.js`);
const { scrapeCORDIS } = require(`${scraperPath}/cordis.js`);
const { scrapeEuropaCriativa } = require(`${scraperPath}/europa-criativa.js`);

const prisma = new PrismaClient();

// Map portal names to Prisma enum
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

interface ScrapedAviso {
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
    documentos?: { url: string; nome: string }[];
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

async function upsertAviso(aviso: ScrapedAviso, portalName: string) {
    const portal = portalMap[portalName] || portalMap[aviso.fonte || ''] || Portal.PORTUGAL2030;
    const codigo = aviso.codigo || aviso.id || `${portalName}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    try {
        // Check if exists
        const existing = await prisma.aviso.findFirst({ where: { codigo } });

        if (existing) {
            await prisma.aviso.update({
                where: { id: existing.id },
                data: {
                    nome: aviso.titulo?.slice(0, 500) || 'Sem título',
                    programa: aviso.programa?.slice(0, 200) || portalName,
                    dataInicioSubmissao: parseDate(aviso.dataAbertura),
                    dataFimSubmissao: parseDate(aviso.dataFecho),
                    montanteMinimo: aviso.dotacao || null,
                    ativo: aviso.status === 'Aberto',
                    link: aviso.url,
                    descricao: aviso.descricao?.slice(0, 5000),
                    anexos: aviso.documentos ? JSON.parse(JSON.stringify(aviso.documentos)) : [],
                }
            });
        } else {
            await prisma.aviso.create({
                data: {
                    codigo,
                    nome: aviso.titulo?.slice(0, 500) || 'Sem título',
                    portal,
                    programa: aviso.programa?.slice(0, 200) || portalName,
                    dataInicioSubmissao: parseDate(aviso.dataAbertura),
                    dataFimSubmissao: parseDate(aviso.dataFecho),
                    montanteMinimo: aviso.dotacao || null,
                    ativo: aviso.status === 'Aberto',
                    link: aviso.url,
                    descricao: aviso.descricao?.slice(0, 5000),
                    anexos: aviso.documentos ? JSON.parse(JSON.stringify(aviso.documentos)) : [],
                }
            });
        }
        return true;
    } catch (e: any) {
        if (!e.message?.includes('Unique constraint')) {
            console.error(`  ⚠️ ${codigo.slice(0, 30)}: ${e.message?.slice(0, 60)}`);
        }
        return false;
    }
}

async function syncPortal(name: string, scraper: () => Promise<ScrapedAviso[]>) {
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
    } catch (e: any) {
        console.log(`   ❌ Erro: ${e.message}`);
        return 0;
    }
}

async function main() {
    console.log('═'.repeat(50));
    console.log('🚀 SYNC AVISOS TO DATABASE');
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

    // PEPAC - Skip for now as it needs Firecrawl and is not compiled
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

    console.log(`\n📊 Total na DB: ${count} avisos`);
    console.log('Por portal:');
    byPortal.forEach(p => console.log(`   - ${p.portal}: ${p._count}`));

    await prisma.$disconnect();
}

main().catch(e => {
    console.error('Fatal:', e);
    process.exit(1);
});
