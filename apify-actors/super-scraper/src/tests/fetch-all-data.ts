/**
 * Fetch ALL Data: 50+ avisos com PDFs
 * 
 * @usage npx ts-node src/tests/fetch-all-data.ts
 */

import { scrapePRR } from '../lib/prr';
import { scrapePEPAC } from '../lib/pepac';
import { scrapeCORDIS } from '../lib/cordis';
import { AvisoNormalized, Documento } from '../lib/types';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

interface FullDataResult {
    avisos: AvisoNormalized[];
    pdfContents: Record<string, string>;
    timestamp: string;
    summary: {
        total: number;
        withDocs: number;
        totalDocs: number;
        pdfsFetched: number;
    };
}

async function fetchPdfContent(url: string): Promise<string> {
    try {
        // Use a simple HEAD check first
        const head = await axios.head(url, { timeout: 5000 });
        if (head.headers['content-type']?.includes('pdf')) {
            // For now, just return the URL - actual PDF extraction needs Files API
            return `[PDF disponível: ${url}]`;
        }
        return '';
    } catch {
        return '';
    }
}

async function fetchAllData(): Promise<void> {
    console.log('\n' + '═'.repeat(70));
    console.log('📥 FETCH COMPLETO: 50+ Avisos com PDFs');
    console.log('═'.repeat(70));

    const allAvisos: AvisoNormalized[] = [];
    const pdfContents: Record<string, string> = {};

    // PRR - Get more
    console.log('\n🔵 PRR - Fetching 25 avisos...');
    try {
        const prr = await scrapePRR({ maxItems: 25, onlyOpen: true });
        allAvisos.push(...prr);
        console.log(`   ✅ ${prr.length} avisos PRR`);
    } catch (e: any) {
        console.log(`   ❌ PRR: ${e.message}`);
    }

    // PEPAC - Get all
    console.log('\n🟢 PEPAC - Fetching todos os concursos...');
    try {
        const pepac = await scrapePEPAC({ maxItems: 20, onlyOpen: true });
        allAvisos.push(...pepac);
        console.log(`   ✅ ${pepac.length} avisos PEPAC`);
    } catch (e: any) {
        console.log(`   ❌ PEPAC: ${e.message}`);
    }

    // CORDIS - Get more
    console.log('\n🟠 Horizon Europe - Fetching 20 calls...');
    try {
        const cordis = await scrapeCORDIS({ maxItems: 20, onlyOpen: true });
        allAvisos.push(...cordis);
        console.log(`   ✅ ${cordis.length} calls Horizon`);
    } catch (e: any) {
        console.log(`   ❌ CORDIS: ${e.message}`);
    }

    console.log(`\n📊 Total avisos: ${allAvisos.length}`);

    // Count documents
    let totalDocs = 0;
    let avisosWithDocs = 0;
    const pdfUrls: string[] = [];

    for (const aviso of allAvisos) {
        if (aviso.documentos && aviso.documentos.length > 0) {
            avisosWithDocs++;
            totalDocs += aviso.documentos.length;
            for (const doc of aviso.documentos) {
                if (doc.url && doc.formato === 'pdf') {
                    pdfUrls.push(doc.url);
                }
            }
        }
    }

    console.log(`📄 Total documentos: ${totalDocs}`);
    console.log(`📑 PDFs identificados: ${pdfUrls.length}`);

    // Check some PDFs
    console.log('\n📥 Verificando PDFs (primeiros 10)...');
    let pdfsFetched = 0;
    for (const url of pdfUrls.slice(0, 10)) {
        const content = await fetchPdfContent(url);
        if (content) {
            pdfContents[url] = content;
            pdfsFetched++;
            console.log(`   ✓ ${url.split('/').pop()}`);
        }
    }

    const result: FullDataResult = {
        avisos: allAvisos,
        pdfContents,
        timestamp: new Date().toISOString(),
        summary: {
            total: allAvisos.length,
            withDocs: avisosWithDocs,
            totalDocs,
            pdfsFetched
        }
    };

    // Save
    const outputPath = path.join(__dirname, 'full-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));

    console.log('\n' + '═'.repeat(70));
    console.log('📊 RESUMO');
    console.log('═'.repeat(70));
    console.log(`   Avisos: ${result.summary.total}`);
    console.log(`   Com documentos: ${result.summary.withDocs}`);
    console.log(`   Total documentos: ${result.summary.totalDocs}`);
    console.log(`   PDFs verificados: ${result.summary.pdfsFetched}`);
    console.log(`\n💾 Saved: ${outputPath}`);
}

fetchAllData()
    .then(() => console.log('\n✨ Fetch completo!'))
    .catch(console.error);
