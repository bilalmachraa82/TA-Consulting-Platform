/**
 * Script de teste para diagnosticar problemas do Firecrawl
 */

const FirecrawlApp = require('firecrawl').default || require('firecrawl');
require('dotenv').config();

const firecrawl = new FirecrawlApp({
    apiKey: process.env.FIRECRAWL_API_KEY
});

async function testPortal(portalId, config) {
    console.log(`\n=== Testando ${config.name} ===`);

    for (const url of config.avisoUrls) {
        console.log(`\n📄 Testando URL: ${url}`);

        try {
            // Teste 1: Scrape básico
            console.log('1. Teste scrape básico...');
            const basicResult = await firecrawl.scrape(url, {
                formats: ['markdown'],
                timeout: 30000
            });

            if (basicResult.success) {
                console.log(`   ✅ Sucesso! Markdown length: ${basicResult.markdown?.length || 0}`);

                // Verificar se há conteúdo relevante
                const markdown = (basicResult.markdown || '').toLowerCase();
                const hasRelevant = [
                    'aviso', 'concurso', 'candidatura', 'apoio', 'incentivo'
                ].some(keyword => markdown.includes(keyword));

                console.log(`   📋 Conteúdo relevante: ${hasRelevant ? 'Sim' : 'Não'}`);

                if (hasRelevant) {
                    // Mostrar preview
                    console.log(`   📝 Preview: ${basicResult.markdown?.substring(0, 200)}...`);
                }
            } else {
                console.log(`   ❌ Falha: ${basicResult.error}`);
            }

            // Teste 2: Scrape com JSON
            console.log('2. Teste scrape com JSON...');
            const jsonResult = await firecrawl.scrape(url, {
                formats: [
                    {
                        type: 'json',
                        prompt: config.prompt,
                        schema: {
                            type: 'object',
                            properties: {
                                avisos: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            titulo: { type: 'string' },
                                            descricao: { type: 'string' },
                                            url: { type: 'string' },
                                            data_fecho: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                ],
                actions: config.actions || [{ type: 'scroll', direction: 'down' }],
                waitFor: config.waitFor || 10000,
                timeout: 40000
            });

            if (jsonResult.success && jsonResult.json) {
                const avisos = jsonResult.json.avisos || [];
                console.log(`   ✅ JSON extraído! Avisos encontrados: ${avisos.length}`);

                if (avisos.length > 0) {
                    console.log('   📋 Primeiro aviso:', JSON.stringify(avisos[0], null, 2));
                }
            } else {
                console.log(`   ❌ Falha JSON: ${jsonResult.error}`);
            }

        } catch (error) {
            console.error(`   💥 Erro: ${error.message}`);
        }
    }
}

async function main() {
    console.log('🔥 Iniciando testes Firecrawl...\n');

    const configs = {
        'prr': {
            name: 'PRR - Recuperar Portugal',
            avisoUrls: [
                'https://recuperarportugal.gov.pt/candidaturas-prr/',
                'https://recuperarportugal.gov.pt/'
            ],
            prompt: 'Extrai a tabela/listagem de candidaturas PRR visíveis nesta página. Retorna JSON { avisos: [...] }',
            actions: [
                { type: 'scroll', direction: 'down' },
                { type: 'scroll', direction: 'down' }
            ],
            waitFor: 15000
        },
        'pepac': {
            name: 'PEPAC / IFAP',
            avisoUrls: [
                'https://www.ifap.pt/portal',
                'https://www.ifap.pt/portal/noticias'
            ],
            prompt: 'Analisa as notícias do IFAP e extrai apenas itens que sejam avisos/aberturas de candidaturas. Retorna JSON { avisos: [...] }',
            actions: [
                { type: 'scroll', direction: 'down' }
            ],
            waitFor: 12000
        }
    };

    for (const [portalId, config] of Object.entries(configs)) {
        await testPortal(portalId, config);
    }

    console.log('\n✨ Testes concluídos!');
}

main().catch(console.error);