/**
 * RAG POC - Phase 0
 * 
 * 1. Collects ~50 PDFs from real sources (PT2030, PRR, PEPAC, IPDJ)
 * 2. Uploads them to Gemini Files API
 * 3. Runs "Golden Questions" asking about eligibility, deadlines, and specifics
 * 4. Generates a quality report
 */

import { scrapePRR, scrapePEPAC } from './lib';
import { batchUploadFromAvisos, queryDocuments, listUploadedFiles } from './lib/gemini-rag';
import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const MAX_DOCS = 40; // Limit for POC (Gemini context window is large but upload takes time)

// Types
interface DocItem {
    portal: string;
    avisoTitulo: string;
    docNome: string;
    url: string;
}

async function collectDocuments(): Promise<DocItem[]> {
    console.log('📡 1. A recolher documentos reais...');
    const docs: DocItem[] = [];

    // 1. PT2030 (via REST API)
    try {
        console.log('   📗 PT2030...');
        const resp = await axios.post('https://portugal2030.pt/wp-json/avisos/query', {
            estadoAvisoId: 1, // Abertos
            page: 0,
            programaIds: []
        });
        const avisos = resp.data?.avisos || [];
        for (const a of avisos.slice(0, 8)) {
            const pdf = a.documentos?.find((d: any) => d.path?.endsWith('.pdf') || d.upload?.endsWith('.pdf'));
            if (pdf) {
                docs.push({
                    portal: 'PT2030',
                    avisoTitulo: a.aviso?.tituloAviso || 'Aviso PT2030',
                    docNome: pdf.titulo || 'Regulamento',
                    url: pdf.path || pdf.upload
                });
            }
        }
    } catch (e) { console.error('   ❌ PT2030 erro'); }

    // 2. PRR (via Scraper)
    try {
        console.log('   📘 PRR...');
        const avisos = await scrapePRR({ maxItems: 15, onlyOpen: true });
        for (const a of avisos) {
            const pdf = a.documentos?.find(d => (d.formato || '').toLowerCase() === 'pdf' || d.url.includes('.pdf'));
            if (pdf) {
                docs.push({
                    portal: 'PRR',
                    avisoTitulo: a.titulo,
                    docNome: pdf.nome,
                    url: pdf.url
                });
            }
        }
    } catch (e) { console.error('   ❌ PRR erro'); }

    // 3. PEPAC (via Scraper)
    try {
        console.log('   📙 PEPAC...');
        const avisos = await scrapePEPAC({ maxItems: 10, onlyOpen: true });
        for (const a of avisos) {
            const pdf = a.documentos?.find(d => (d.formato || '').toLowerCase() === 'pdf' || d.url.includes('.pdf'));
            if (pdf) {
                docs.push({
                    portal: 'PEPAC',
                    avisoTitulo: a.titulo,
                    docNome: pdf.nome,
                    url: pdf.url
                });
            }
        }
    } catch (e) { console.error('   ❌ PEPAC erro'); }

    // 4. IPDJ (Direct Pages)
    try {
        console.log('   🏃 IPDJ...');
        const page = 'https://ipdj.gov.pt/apoio-e-financiamento-jovem';
        const resp = await axios.get(page);
        const pdfMatch = resp.data.match(/href="([^"]+\.pdf)"/);
        if (pdfMatch) {
            docs.push({
                portal: 'IPDJ',
                avisoTitulo: 'Apoio e Financiamento Jovem',
                docNome: 'Regulamento IPDJ',
                url: pdfMatch[1].startsWith('http') ? pdfMatch[1] : `https://ipdj.gov.pt${pdfMatch[1]}`
            });
        }
    } catch (e) { console.error('   ❌ IPDJ erro'); }

    console.log(`   ✅ Total recolhido: ${docs.length} documentos`);
    return docs.slice(0, MAX_DOCS);
}

async function runPoc() {
    console.log('🚀 RAG POC - FASE 0');
    console.log('═══════════════════════════════════════════════════════════════');

    // 1. Collect
    const docs = await collectDocuments();

    // 2. Prepare for Upload
    const avisosForUpload = docs.map(d => ({
        codigo: d.portal + '_' + d.avisoTitulo.substring(0, 20).replace(/[^a-z0-9]/gi, '_'),
        documentos: [{ url: d.url, nome: d.docNome }]
    }));

    // 3. Upload (use existing module logic)
    console.log('\n📤 2. A carregar para Gemini Files API...');
    const uploadedFiles = await batchUploadFromAvisos(avisosForUpload, { maxDocs: MAX_DOCS, delayMs: 500 });
    const fileUris = uploadedFiles.map(f => f.uri);

    if (fileUris.length === 0) {
        console.error('❌ Nenhum ficheiro carregado. Abortando.');
        return;
    }

    // 4. Golden Questions
    console.log('\n🔍 3. Consultor Virtual (Perguntas "Golden")...');

    const questions = [
        "Quais são os principais beneficiários elegíveis nos avisos do PRR recolhidos?",
        "Qual é o prazo limite de candidatura para o aviso do PEPAC?",
        "Resume os apoios disponíveis no IPDJ para jovens.",
        "Existe algum aviso PT2030 focado em 'Inovação'? Se sim, qual a taxa de financiamento?",
        "Gera uma tabela comparativa com: Título do Aviso | Portal | Prazo | Beneficiários"
    ];

    for (const q of questions) {
        console.log(`\n❓ P: "${q}"`);
        try {
            const start = Date.now();
            const result = await queryDocuments(q, fileUris, {
                model: 'gemini-2.0-flash-lite',
                systemPrompt: 'És um consultor sénior de fundos europeus. Responde com base APENAS nos documentos fornecidos. Cita o nome do documento fonte.'
            });
            const duration = (Date.now() - start) / 1000;

            console.log(`💡 R (${duration.toFixed(1)}s):`);
            console.log(result.answer.trim());
            console.log('---------------------------------------------------');
        } catch (e: any) {
            console.log(`❌ Erro: ${e.message}`);
        }
    }

    console.log('\n✅ POC Concluída.');
}

runPoc().catch(console.error);
