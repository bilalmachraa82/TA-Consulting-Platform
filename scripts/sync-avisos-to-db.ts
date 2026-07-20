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
    'Horizon': Portal.HORIZON_EUROPE,
    'HORIZON': Portal.HORIZON_EUROPE,
    'HORIZON_EUROPE': Portal.HORIZON_EUROPE,
    'EUROPA_CRIATIVA': Portal.EUROPA_CRIATIVA,
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

// Devolve null quando a fonte não fornece data válida — o caller decide:
// no update preserva-se o valor existente; no create usa-se fallback explícito.
// (Fix completo — datas nullable no schema — fica para follow-up: toca ~60 ficheiros.)
function parseDate(dateStr?: string): Date | null {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
}

async function upsertAviso(aviso: ScrapedAviso, portalName: string) {
    const portal = portalMap[portalName] || portalMap[aviso.fonte || ''] || Portal.PORTUGAL2030;
    const codigo = aviso.codigo || aviso.id || `${portalName}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const dataInicio = parseDate(aviso.dataAbertura);
    const dataFim = parseDate(aviso.dataFecho);

    try {
        // Check if exists
        const existing = await prisma.aviso.findFirst({ where: { codigo } });

        if (existing) {
            await prisma.aviso.update({
                where: { id: existing.id },
                data: {
                    nome: aviso.titulo?.slice(0, 500) || 'Sem título',
                    portal, // corrige rows antigas classificadas no portal errado
                    programa: aviso.programa?.slice(0, 200) || portalName,
                    // sem data válida na fonte, preserva-se a existente em vez de
                    // sobrescrever com "agora" (prazo falso renovado a cada sync)
                    ...(dataInicio ? { dataInicioSubmissao: dataInicio } : {}),
                    ...(dataFim ? { dataFimSubmissao: dataFim } : {}),
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
                    // fallback "agora": o aviso fica imediatamente fora dos filtros
                    // de abertos em vez de ganhar um prazo futuro inventado
                    dataInicioSubmissao: dataInicio ?? new Date(),
                    dataFimSubmissao: dataFim ?? new Date(),
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

// Portais que falham sem lançar erro (ex.: PRR engole o erro TLS e devolve [])
// são apanhados pelo mínimo esperado — 0 resultados num portal grande é falha,
// não sucesso. Sem isto o workflow fica verde e o cron seguinte consome dados velhos.
const failedPortals: string[] = [];

async function syncPortal(name: string, scraper: () => Promise<ScrapedAviso[]>, minExpected = 0) {
    console.log(`\n📡 ${name}: Scraping...`);
    try {
        const avisos = await scraper();
        console.log(`   ✅ ${avisos.length} avisos obtidos`);

        if (avisos.length < minExpected) {
            failedPortals.push(`${name} (${avisos.length} < mínimo ${minExpected})`);
        }

        let success = 0;
        for (const aviso of avisos) {
            if (await upsertAviso(aviso, name)) success++;
        }
        console.log(`   💾 ${success}/${avisos.length} guardados na DB`);
        return success;
    } catch (e: any) {
        console.log(`   ❌ Erro: ${e.message}`);
        failedPortals.push(`${name} (exceção: ${e.message?.slice(0, 60)})`);
        return 0;
    }
}

async function main() {
    console.log('═'.repeat(50));
    console.log('🚀 SYNC AVISOS TO DATABASE');
    console.log('═'.repeat(50));

    let total = 0;

    // PT2030
    total += await syncPortal('PT2030', () => scrapePortugal2030({ maxItems: 500, onlyOpen: false }), 50);

    // PRR — maxItems 1000: o admin-ajax devolve 566+ candidaturas; 500 capava a recolha
    total += await syncPortal('PRR', () => scrapePRR({ maxItems: 1000, onlyOpen: false }), 50);

    // IPDJ
    total += await syncPortal('IPDJ', () => scrapeIPDJ({ maxItems: 50, onlyOpen: true }));

    // Horizon — maxItems 500: a SEDIA tem >100 calls abertas; 100 capava a recolha
    total += await syncPortal('Horizon', () => scrapeCORDIS({ maxItems: 500, onlyOpen: true, includeDocuments: true }), 10);

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

    if (failedPortals.length > 0) {
        console.error(`\n❌ Portais falhados: ${failedPortals.join('; ')}`);
        process.exit(1);
    }
}

main().catch(e => {
    console.error('Fatal:', e);
    process.exit(1);
});
