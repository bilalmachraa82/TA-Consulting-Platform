/**
 * Audit Scraped Data
 * Valida a qualidade dos dados extraídos face à Checklist de Consultor
 */

import * as fs from 'fs';
import * as path from 'path';
import { Aviso } from '../apify-actors/shared/types';

const DATA_DIR = path.join(__dirname, '../data/scraped');
const OUTPUT_FILE = path.join(DATA_DIR, 'all_avisos.json');

interface AuditStats {
    total: number;
    bySource: Record<string, number>;
    missingFields: Record<string, number>;
    pdfCount: number;
    anexosCount: number;
    warnings: string[];
}

async function auditData() {
    if (!fs.existsSync(OUTPUT_FILE)) {
        console.error('❌ Ficheiro de dados não encontrado:', OUTPUT_FILE);
        return;
    }

    const data: Aviso[] = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));

    const stats: AuditStats = {
        total: data.length,
        bySource: {},
        missingFields: {
            'taxa_apoio': 0,
            'montante_total': 0,
            'data_fecho': 0,
            'programa': 0,
            'pdf_url': 0
        },
        pdfCount: 0,
        anexosCount: 0,
        warnings: []
    };

    console.log('🕵️‍♂️ Iniciando auditoria a', data.length, 'avisos...\n');

    for (const aviso of data) {
        // Count by source
        stats.bySource[aviso.fonte] = (stats.bySource[aviso.fonte] || 0) + 1;

        // Check critical fields
        if (!aviso.taxa_apoio || aviso.taxa_apoio === '0') stats.missingFields['taxa_apoio']++;
        if (!aviso.montante_total || aviso.montante_total === '0') stats.missingFields['montante_total']++;
        if (!aviso.data_fecho) stats.missingFields['data_fecho']++;
        if (!aviso.programa) stats.missingFields['programa']++;
        if (!aviso.pdf_url) stats.missingFields['pdf_url']++;

        // Count docs
        if (aviso.pdf_url) stats.pdfCount++;
        if (aviso.anexos && aviso.anexos.length > 0) stats.anexosCount += aviso.anexos.length;

        // Specific logic per source
        if (aviso.fonte === 'PRR' && aviso.titulo.toLowerCase().includes('notícia')) {
            stats.warnings.push(`⚠️ PRR Aviso suspeito (parece notícia): ${aviso.titulo}`);
        }
    }

    console.log('📊 Resultados da Auditoria:');
    console.log('--------------------------------');
    console.log(`Total Avisos: ${stats.total}`);
    console.log('\nPor Fonte:');
    console.table(stats.bySource);

    console.log('\nCampos em Falta (Crítico para RAG):');
    console.log(`- PDFs Principais em falta: ${stats.missingFields['pdf_url']} (${((stats.missingFields['pdf_url'] / stats.total) * 100).toFixed(1)}%)`);
    console.log(`- Taxas de Apoio não detetadas: ${stats.missingFields['taxa_apoio']}`);
    console.log(`- Montantes desconhecidos: ${stats.missingFields['montante_total']}`);

    console.log(`\nDocumentos Recuperados:`);
    console.log(`- PDFs Principais: ${stats.pdfCount}`);
    console.log(`- Total Anexos: ${stats.anexosCount}`);

    if (stats.warnings.length > 0) {
        console.log(`\n⚠️ Alertas (${stats.warnings.length}):`);
        stats.warnings.slice(0, 5).forEach(w => console.log(w));
        if (stats.warnings.length > 5) console.log(`... e mais ${stats.warnings.length - 5}`);
    }

    // Verifica aprovação para RAG
    const ragReadyRate = (stats.pdfCount / stats.total) * 100;
    console.log('\n--------------------------------');
    console.log(`🚀 Prontidão para RAG: ${ragReadyRate.toFixed(1)}%`);

    if (ragReadyRate > 80) {
        console.log('✅ Dados aprovados para ingestão no Gemini File Search.');
    } else {
        console.log('❌ Taxa de documentos demasiado baixa. Rever scrapers antes do RAG.');
    }
}

auditData();
