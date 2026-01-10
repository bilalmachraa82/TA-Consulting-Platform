#!/usr/bin/env node
/**
 * Teste do Modelo Híbrido RAG + SQL
 * 
 * Valida que o sistema consegue responder a diferentes tipos de perguntas:
 * 1. HISTORICO_SEARCH - Perguntas factuais sobre candidaturas passadas
 * 2. DB_SEARCH - Avisos abertos
 * 3. RAG_QUERY - Conteúdo qualitativo
 * 4. HYBRID - Combinação de ambos
 * 
 * Uso: npx tsx scripts/test-hybrid-rag.ts
 */

import { classifyIntent, executeHybridQuery } from '../lib/chat-router';

const TEST_QUERIES = [
    // HISTORICO_SEARCH - Deve usar SQL
    {
        query: "Quantas candidaturas PRR fizemos?",
        expectedType: 'HISTORICO_SEARCH',
        description: "Contagem de candidaturas históricas"
    },
    {
        query: "Quais clientes temos no programa P2030?",
        expectedType: 'HISTORICO_SEARCH',
        description: "Lista de clientes por programa"
    },
    {
        query: "Candidaturas aprovadas em 2023",
        expectedType: 'HISTORICO_SEARCH',
        description: "Candidaturas por ano"
    },
    {
        query: "Qual o montante total das nossas candidaturas?",
        expectedType: 'HISTORICO_SEARCH',
        description: "Dados financeiros"
    },

    // DB_SEARCH - Avisos abertos
    {
        query: "Quais avisos estão abertos agora?",
        expectedType: 'DB_SEARCH',
        description: "Avisos abertos"
    },
    {
        query: "Próximos prazos de candidatura",
        expectedType: 'DB_SEARCH',
        description: "Prazos"
    },

    // RAG_QUERY - Conteúdo qualitativo
    {
        query: "Como escrever uma memória descritiva para PRR?",
        expectedType: 'RAG_QUERY',
        description: "Template/exemplo"
    },
    {
        query: "Quais são as melhores práticas para justificar investimentos?",
        expectedType: 'RAG_QUERY',
        description: "Best practices"
    },

    // HYBRID - Dados + Contexto
    {
        query: "Lista de candidaturas PRR com exemplos de como justificaram",
        expectedType: 'HYBRID',
        description: "SQL + RAG combinados"
    },
];

async function runTests() {
    console.log('🧪 TESTE DO MODELO HÍBRIDO RAG + SQL\n');
    console.log('='.repeat(60));

    let passed = 0;
    let failed = 0;

    for (const test of TEST_QUERIES) {
        console.log(`\n📝 Query: "${test.query}"`);
        console.log(`   Esperado: ${test.expectedType} (${test.description})`);

        try {
            const intent = await classifyIntent(test.query);
            console.log(`   Obtido: ${intent.type}`);
            console.log(`   Reason: ${intent.reasoning}`);

            if (intent.entities?.programa) {
                console.log(`   Programa detectado: ${intent.entities.programa}`);
            }
            if (intent.entities?.ano) {
                console.log(`   Ano detectado: ${intent.entities.ano}`);
            }

            if (intent.type === test.expectedType) {
                console.log(`   ✅ PASSOU`);
                passed++;
            } else {
                console.log(`   ❌ FALHOU - Esperado ${test.expectedType}`);
                failed++;
            }

            // Se for HISTORICO_SEARCH, executar a query real
            if (intent.type === 'HISTORICO_SEARCH') {
                console.log(`\n   📊 Executando query SQL...`);
                const result = await executeHybridQuery(test.query, intent, []);
                console.log(`   Resultado: ${result.slice(0, 200)}...`);
            }

        } catch (error: any) {
            console.log(`   ❌ ERRO: ${error.message}`);
            failed++;
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`📊 RESULTADO: ${passed}/${TEST_QUERIES.length} testes passaram`);

    if (failed === 0) {
        console.log('✅ TODOS OS TESTES PASSARAM!');
    } else {
        console.log(`⚠️ ${failed} testes falharam`);
    }

    // Teste real de SQL
    console.log('\n' + '='.repeat(60));
    console.log('📊 TESTE DE QUERIES SQL REAIS\n');

    const realQueries = [
        "Quantas candidaturas temos no total?",
        "Quais são os clientes do PRR?",
        "Últimas candidaturas registadas"
    ];

    for (const query of realQueries) {
        console.log(`\n📝 "${query}"`);
        const intent = await classifyIntent(query);
        const result = await executeHybridQuery(query, intent, []);
        console.log(result);
    }
}

runTests().catch(console.error);
