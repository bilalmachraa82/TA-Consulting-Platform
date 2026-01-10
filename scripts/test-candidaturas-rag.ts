#!/usr/bin/env node
/**
 * Teste do RAG de Candidaturas
 * 
 * Testa consultas ao Gemini File Search Store de candidaturas históricas.
 * 
 * Uso: npx tsx scripts/test-candidaturas-rag.ts
 */

import 'dotenv/config';
import {
    generateContentWithFileSearch,
    RECOMMENDED_MODEL,
    PRODUCTION_SYSTEM_PROMPT,
} from '../lib/rag/gemini-file-search';

const STORE_ID = process.env.GEMINI_CANDIDATURAS_STORE_ID;

const TEST_QUERIES = [
    "Como escrever uma memória descritiva para PRR?",
    "Quais são os elementos de um business plan para candidaturas?",
    "Que documentos são necessários para projeções financeiras?",
    "Como justificar investimentos numa candidatura?",
];

async function main() {
    console.log('🧪 Teste do RAG de Candidaturas Históricas\n');
    console.log('='.repeat(60));

    if (!STORE_ID) {
        console.error('❌ GEMINI_CANDIDATURAS_STORE_ID não configurada');
        process.exit(1);
    }

    console.log(`📦 Store: ${STORE_ID}\n`);

    for (const query of TEST_QUERIES) {
        console.log(`\n📝 Query: "${query}"`);
        console.log('-'.repeat(50));

        try {
            const result = await generateContentWithFileSearch({
                model: RECOMMENDED_MODEL,
                prompt: `${PRODUCTION_SYSTEM_PROMPT}\n\nPergunta: ${query}`,
                storeName: STORE_ID,
                temperature: 0,
            });

            console.log(`\n📄 Resposta (${result.usage.totalTokenCount} tokens):`);
            console.log(result.text.slice(0, 500) + '...');

            if (result.citations.citedSources.length > 0) {
                console.log(`\n📚 Fontes (${result.citations.citationCount}):`);
                result.citations.citedSources.slice(0, 3).forEach(s => {
                    console.log(`   - ${s.title || s.source || 'Documento'}`);
                });
            } else {
                console.log('\n⚠️ Sem citações');
            }

        } catch (error: any) {
            console.log(`❌ Erro: ${error.message}`);
        }

        // Delay entre queries
        await new Promise(r => setTimeout(r, 2000));
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ TESTE CONCLUÍDO');
}

main().catch(console.error);
