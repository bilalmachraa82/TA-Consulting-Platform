/**
 * Sync Avisos to Database
 * 
 * Runs all scrapers and populates the PostgreSQL database with normalized data.
 */

import * as dotenv from 'dotenv';
import { backfillSlugsPendentes } from '../lib/slug-backfill';
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
const { scrapePEPAC } = require(`${scraperPath}/pepac.js`);

import { scrapeSEDIAProgramme } from './scrapers/sedia-programme';
import { scrapeFundoAmbiental } from './scrapers/fundo-ambiental';
import { scrapeTurismoPortugal } from './scrapers/turismo-portugal';

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
    'Digital Europe': Portal.DIGITAL_EUROPE,
    'DIGITAL_EUROPE': Portal.DIGITAL_EUROPE,
    'LIFE': Portal.LIFE,
    'Fundo Ambiental': Portal.FUNDO_AMBIENTAL,
    'FUNDO_AMBIENTAL': Portal.FUNDO_AMBIENTAL,
    'Turismo de Portugal': Portal.TURISMO_PORTUGAL,
    'TURISMO_PORTUGAL': Portal.TURISMO_PORTUGAL,
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

// Descodifica entidades HTML dos títulos (WordPress REST devolve &#038; etc.).
// Sem isto os nomes aparecem como "STEP – I&#038;D" na UI e nas citações.
function decodeEntities(s: string): string {
    return s
        .replace(/&#0?38;|&amp;/g, '&')
        .replace(/&#8211;|&#8212;/g, '–')
        .replace(/&#8217;|&#8216;|&#0?39;|&apos;/g, "'")
        .replace(/&#8220;|&#8221;|&quot;/g, '"')
        .replace(/&#8230;/g, '…')
        .replace(/&#0?60;|&lt;/g, '<')
        .replace(/&#0?62;|&gt;/g, '>')
        .replace(/&nbsp;/g, ' ')
        .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)));
}

// Devolve null quando a fonte não fornece data válida. As colunas de data são
// nulificáveis desde 2026-07-20: null = "prazo por confirmar" (≠ fechado).
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
                    nome: decodeEntities(aviso.titulo?.slice(0, 500) || 'Sem título'),
                    portal, // corrige rows antigas classificadas no portal errado
                    programa: aviso.programa?.slice(0, 200) || portalName,
                    // sem data válida na fonte, preserva-se a existente em vez de
                    // sobrescrever com "agora" (prazo falso renovado a cada sync)
                    ...(dataInicio ? { dataInicioSubmissao: dataInicio } : {}),
                    ...(dataFim ? { dataFimSubmissao: dataFim } : {}),
                    montanteMinimo: aviso.dotacao || null,
                    // "Desconhecido" (a fonte não diz) conta como potencialmente
                    // aberto — só 'Fechado' explícito desativa. Tratar o
                    // desconhecido como fechado escondia os apoios do Fundo
                    // Ambiental, cuja listagem nunca publica estado.
                    ativo: aviso.status !== 'Fechado',
                    link: aviso.url,
                    descricao: aviso.descricao?.slice(0, 5000),
                    anexos: aviso.documentos ? JSON.parse(JSON.stringify(aviso.documentos)) : [],
                }
            });
        } else {
            await prisma.aviso.create({
                data: {
                    codigo,
                    nome: decodeEntities(aviso.titulo?.slice(0, 500) || 'Sem título'),
                    portal,
                    programa: aviso.programa?.slice(0, 200) || portalName,
                    // null = "prazo por confirmar": a fonte diz que o aviso está
                    // aberto mas não publica a data na listagem. Carimbar "agora"
                    // (como se fazia) escondia 85 avisos abertos do PRR.
                    dataInicioSubmissao: dataInicio,
                    dataFimSubmissao: dataFim,
                    montanteMinimo: aviso.dotacao || null,
                    // "Desconhecido" (a fonte não diz) conta como potencialmente
                    // aberto — só 'Fechado' explícito desativa. Tratar o
                    // desconhecido como fechado escondia os apoios do Fundo
                    // Ambiental, cuja listagem nunca publica estado.
                    ativo: aviso.status !== 'Fechado',
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

/**
 * Reconciliação: avisos que já não constam da fonte deixam de estar ativos.
 * Sem isto o upsert acumula órfãos indefinidamente — a 2026-07-20 havia 953
 * registos de fevereiro ainda marcados como abertos em portais cuja fonte já
 * não os listava. Não apaga (mantém histórico), só desativa.
 * Só corre depois de uma recolha saudável, para uma falha parcial do scraper
 * nunca desativar o catálogo inteiro.
 */
async function reconcilePortal(portalEnum: Portal, codigosVistos: string[], runStart: Date): Promise<void> {
    if (codigosVistos.length === 0) return;
    const result = await prisma.aviso.updateMany({
        where: { portal: portalEnum, ativo: true, updatedAt: { lt: runStart } },
        data: { ativo: false },
    });
    if (result.count > 0) {
        console.log(`   🧹 ${result.count} avisos já não constam da fonte → marcados inativos`);
    }
}

async function syncPortal(
    name: string,
    scraper: () => Promise<ScrapedAviso[]>,
    minExpected = 0,
    /** cap passado ao scraper; se a recolha bater no cap houve truncagem e a
     * reconciliação é saltada (senão desativava avisos que existem mas ficaram
     * de fora da página) */
    maxItems = Number.POSITIVE_INFINITY,
) {
    console.log(`\n📡 ${name}: Scraping...`);
    const runStart = new Date();
    try {
        const avisos = await scraper();
        console.log(`   ✅ ${avisos.length} avisos obtidos`);

        if (avisos.length < minExpected) {
            failedPortals.push(`${name} (${avisos.length} < mínimo ${minExpected})`);
        }

        let success = 0;
        const codigosVistos: string[] = [];
        for (const aviso of avisos) {
            if (await upsertAviso(aviso, name)) {
                success++;
                if (aviso.codigo) codigosVistos.push(aviso.codigo);
            }
        }
        console.log(`   💾 ${success}/${avisos.length} guardados na DB`);

        // reconcilia apenas se a recolha foi saudável (acima do mínimo, não
        // vazia) e não truncada pelo cap
        const portalEnum = portalMap[name];
        const truncada = avisos.length >= maxItems;
        if (truncada) {
            console.log(`   ⚠️ recolha no limite (${avisos.length}/${maxItems}) — reconciliação saltada`);
        } else if (portalEnum && avisos.length >= Math.max(minExpected, 1)) {
            await reconcilePortal(portalEnum, codigosVistos, runStart);
        }
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
    total += await syncPortal('PT2030', () => scrapePortugal2030({ maxItems: 500, onlyOpen: false }), 50, 500);

    // PRR — maxItems 1000: o admin-ajax devolve 566+ candidaturas; 500 capava a recolha
    total += await syncPortal('PRR', () => scrapePRR({ maxItems: 1000, onlyOpen: false }), 50, 1000);

    // IPDJ
    total += await syncPortal('IPDJ', () => scrapeIPDJ({ maxItems: 50, onlyOpen: true }), 0, 50);

    // Horizon — maxItems 500: a SEDIA tem >100 calls abertas; 100 capava a recolha
    total += await syncPortal('Horizon', () => scrapeCORDIS({ maxItems: 500, onlyOpen: true, includeDocuments: true }), 10, 500);

    // Europa Criativa
    total += await syncPortal('Europa Criativa', () => scrapeEuropaCriativa({ maxItems: 50, onlyOpen: true, includeDocuments: true }), 0, 50);

    // PEPAC — API do pepacc.pt (HTTP puro, sem Firecrawl; validado 2026-07-20 com 44 concursos)
    total += await syncPortal('PEPAC', () => scrapePEPAC({ maxItems: 500, onlyOpen: false }), 10, 500);

    // Digital Europe — SEDIA genérico por prefixo de identifier
    total += await syncPortal('Digital Europe', () => scrapeSEDIAProgramme({ prefix: 'DIGITAL', programa: 'Digital Europe', maxItems: 500, onlyOpen: true }), 0, 500);

    // LIFE — programa de ambiente/clima da UE, relevante para PMEs de energia/ambiente
    total += await syncPortal('LIFE', () => scrapeSEDIAProgramme({ prefix: 'LIFE', programa: 'LIFE', maxItems: 500, onlyOpen: true }), 0, 500);

    // Fundo Ambiental — catálogo sem datas (o site não as expõe na listagem);
    // datas chegam via agente de enriquecimento. Ver scripts/scrapers/fundo-ambiental.ts
    total += await syncPortal('Fundo Ambiental', () => scrapeFundoAmbiental({ maxItems: 500 }), 0, 500);

    // Turismo de Portugal — 3 listagens de Financiamento (ASPX server-rendered,
    // sem datas na listagem; prazos via enriquecimento). Fecha a lacuna do
    // cliente NML Turismo. Ver scripts/scrapers/turismo-portugal.ts
    total += await syncPortal('Turismo de Portugal', () => scrapeTurismoPortugal({ maxItems: 200 }), 5, 200);

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

    await backfillSlugsPendentes(prisma).then(r => console.log(`slugs novos: ${r.atualizados}`)).catch(() => {});
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
