
/**
 * Sync Avisos to Database (Direct TS Version)
 * 
 * Runs all scrapers and populates the PostgreSQL database with normalized data.
 * Directly imports TS files to avoid build steps.
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { PrismaClient, Portal } from '@prisma/client';

// Import scrapers directly from TS source
import { scrapePortugal2030 } from '../apify-actors/super-scraper/src/lib/portugal2030';
import { scrapePRR } from '../apify-actors/super-scraper/src/lib/prr';
import { scrapeIPDJ } from '../apify-actors/super-scraper/src/lib/ipdj';
import { scrapeCORDIS } from '../apify-actors/super-scraper/src/lib/cordis';
import { scrapeEuropaCriativa } from '../apify-actors/super-scraper/src/lib/europa-criativa';

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
    status?: string | any;
    url?: string;
    fonte?: string | any;
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
        // Prepare data object to ensure types
        const avisoData = {
            nome: aviso.titulo?.slice(0, 500) || 'Sem título',
            programa: aviso.programa?.slice(0, 200) || portalName,
            dataInicioSubmissao: parseDate(aviso.dataAbertura),
            dataFimSubmissao: parseDate(aviso.dataFecho),
            montanteMinimo: aviso.dotacao ? parseFloat(String(aviso.dotacao)) : null,
            ativo: aviso.status === 'Aberto',
            link: aviso.url || '',
            descricao: aviso.descricao?.slice(0, 5000) || '',
            anexos: aviso.documentos ? JSON.parse(JSON.stringify(aviso.documentos)) : [],
        };

        // Check if exists
        const existing = await prisma.aviso.findFirst({ where: { codigo } });

        if (existing) {
            await prisma.aviso.update({
                where: { id: existing.id },
                data: avisoData
            });
        } else {
            await prisma.aviso.create({
                data: {
                    codigo,
                    portal,
                    ...avisoData
                }
            });
        }
        return true;
    } catch (e: any) {
        if (!e.message?.includes('Unique constraint')) {
            console.error(`  ⚠️ ${codigo.slice(0, 30)}: ${e.message?.slice(0, 100)}`);
        }
        return false;
    }
}

async function syncPortal(name: string, scraper: () => Promise<any[]>) {
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
        console.log(e.stack)
        return 0;
    }
}

async function main() {
    console.log('═'.repeat(50));
    console.log('🚀 SYNC AVISOS TO DATABASE (TS DIRECT)');
    console.log('═'.repeat(50));

    let total = 0;

    // PT2030
    // total += await syncPortal('PT2030', () => scrapePortugal2030({ maxItems: 100, onlyOpen: false }));

    // PRR (Priority Fix)
    total += await syncPortal('PRR', () => scrapePRR({ maxItems: 200, onlyOpen: false }));

    // IPDJ
    // total += await syncPortal('IPDJ', () => scrapeIPDJ({ maxItems: 50, onlyOpen: true }));

    // Horizon
    // total += await syncPortal('Horizon', () => scrapeCORDIS({ maxItems: 50, onlyOpen: true, includeDocuments: true }));

    // Europa Criativa
    // total += await syncPortal('Europa Criativa', () => scrapeEuropaCriativa({ maxItems: 50, onlyOpen: true, includeDocuments: true }));

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
