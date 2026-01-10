/**
 * IMPORTAÇÃO COMPLETA - 6 Portais
 * 
 * Fase 1: Scrape todos os avisos e guardar com PDFs
 * 
 * @usage npx ts-node src/scripts/import-all.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

import {
    scrapePRR,
    scrapePEPAC,
    scrapeCORDIS,
    scrapePortugal2030,
    scrapeEuropaCriativa,
    scrapeIPDJ,
    detectDocumentFormat,
    AvisoNormalized,
} from '../lib';

// ============= CONFIG =============

const ONLY_OPEN = process.env.ONLY_OPEN !== 'false';
const INCLUDE_FUNDING_TENDERS_DOCS = process.env.INCLUDE_FT_DOCS !== 'false';
const MAX_DOCS_PER_FT_AVISO = Number(process.env.MAX_FT_DOCS_PER_AVISO || '25');

const OUTPUT_DIR = path.join(__dirname, '../data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, ONLY_OPEN ? 'avisos-open.json' : 'all-avisos.json');

const PORTALS = [
    { name: 'PRR', fn: () => scrapePRR({ maxItems: 1000, onlyOpen: ONLY_OPEN }), icon: '🔵' },
    { name: 'PEPAC', fn: () => scrapePEPAC({ maxItems: 500, onlyOpen: ONLY_OPEN }), icon: '🟢' },
    { name: 'PT2030', fn: () => scrapePortugal2030({ maxItems: 500, onlyOpen: ONLY_OPEN }), icon: '🟣' },
    {
        name: 'HORIZON',
        fn: () => scrapeCORDIS({
            maxItems: 500,
            onlyOpen: ONLY_OPEN,
            includeDocuments: INCLUDE_FUNDING_TENDERS_DOCS,
            maxDocumentsPerAviso: MAX_DOCS_PER_FT_AVISO,
        }),
        icon: '🟠',
    },
    {
        name: 'EUROPA_CRIATIVA',
        fn: () => scrapeEuropaCriativa({
            maxItems: 200,
            onlyOpen: ONLY_OPEN,
            includeDocuments: INCLUDE_FUNDING_TENDERS_DOCS,
            maxDocumentsPerAviso: MAX_DOCS_PER_FT_AVISO,
        }),
        icon: '🔴',
    },
    { name: 'IPDJ', fn: () => scrapeIPDJ({ maxItems: 100, onlyOpen: ONLY_OPEN }), icon: '🟡' },
];


// ============= TYPES =============

interface ImportResult {
    portal: string;
    avisos: AvisoNormalized[];
    docCount: number;
    pdfCount: number;
    error?: string;
}

interface ImportSummary {
    timestamp: string;
    onlyOpen: boolean;
    includeFundingTendersDocs: boolean;
    totalAvisos: number;
    totalDocs: number;
    totalPdfs: number;
    byPortal: Record<string, { avisos: number; docs: number; pdfs: number }>;
    avisos: AvisoNormalized[];
}

// ============= MAIN =============

async function importAll(): Promise<void> {
    console.log('\n' + '═'.repeat(70));
    console.log('📦 IMPORTAÇÃO COMPLETA: 6 Portais');
    console.log('═'.repeat(70));
    console.log(`⚙️  onlyOpen=${ONLY_OPEN} | includeFTDocs=${INCLUDE_FUNDING_TENDERS_DOCS} | maxFTDocsPerAviso=${MAX_DOCS_PER_FT_AVISO}`);

    // Create output dir
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const results: ImportResult[] = [];
    const allAvisos: AvisoNormalized[] = [];

    for (const p of PORTALS) {
        console.log(`\n${p.icon} ${p.name}...`);

        try {
            const avisos = await p.fn();
            const docCount = avisos.reduce((sum, a) => sum + (a.documentos?.length || 0), 0);
            const pdfCount = avisos.reduce((sum, a) => {
                const docs = a.documentos || [];
                const pdfs = docs.filter((d) => {
                    if ((d.formato || '').toLowerCase() === 'pdf') return true;
                    const inferred = detectDocumentFormat(d.nome || d.url || '');
                    return inferred === 'pdf';
                }).length;
                return sum + pdfs;
            }, 0);

            // Tag with portal
            for (const a of avisos) {
                (a as any).portal = p.name;
                allAvisos.push(a);
            }

            results.push({ portal: p.name, avisos, docCount, pdfCount });
            console.log(`   ✅ ${avisos.length} avisos, ${docCount} docs, ${pdfCount} PDFs`);

        } catch (error: any) {
            console.log(`   ❌ Erro: ${error.message?.substring(0, 50)}`);
            results.push({ portal: p.name, avisos: [], docCount: 0, pdfCount: 0, error: error.message });
        }

        // Small delay between portals
        await new Promise(r => setTimeout(r, 1000));
    }

    // Summary
    const totalAvisos = allAvisos.length;
    const totalDocs = results.reduce((sum, r) => sum + r.docCount, 0);
    const totalPdfs = results.reduce((sum, r) => sum + r.pdfCount, 0);

    const byPortal: Record<string, { avisos: number; docs: number; pdfs: number }> = {};
    for (const r of results) {
        byPortal[r.portal] = { avisos: r.avisos.length, docs: r.docCount, pdfs: r.pdfCount };
    }

    const summary: ImportSummary = {
        timestamp: new Date().toISOString(),
        onlyOpen: ONLY_OPEN,
        includeFundingTendersDocs: INCLUDE_FUNDING_TENDERS_DOCS,
        totalAvisos,
        totalDocs,
        totalPdfs,
        byPortal,
        avisos: allAvisos,
    };

    // Save to file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(summary, null, 2));

    // Print summary
    console.log('\n' + '═'.repeat(70));
    console.log('📊 RESUMO DA IMPORTAÇÃO');
    console.log('═'.repeat(70));
    console.log(`\n📁 Ficheiro: ${OUTPUT_FILE}`);
    console.log(`\n📊 Totais:`);
    console.log(`   Avisos: ${totalAvisos}`);
    console.log(`   Docs (todos): ${totalDocs}`);
    console.log(`   PDFs identificados: ${totalPdfs}`);

    console.log(`\n📈 Por Portal:`);
    for (const [portal, stats] of Object.entries(byPortal)) {
        const status = stats.avisos > 0 ? '✅' : '❌';
        console.log(`   ${status} ${portal}: ${stats.avisos} avisos, ${stats.docs} docs, ${stats.pdfs} PDFs`);
    }

    // Errors
    const errors = results.filter(r => r.error);
    if (errors.length > 0) {
        console.log(`\n⚠️ Erros (${errors.length}):`);
        for (const e of errors) {
            console.log(`   ${e.portal}: ${e.error}`);
        }
    }

    console.log('\n✨ Importação concluída!');
    console.log('\n📋 Próximo passo: Fase 2 - Criar File Search Store e importar PDFs');
}

importAll().catch(console.error);
