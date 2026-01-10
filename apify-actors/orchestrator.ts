/**
 * Orquestrador de Apify Actors
 * 
 * Executa todos os scrapers e agrega resultados
 */

import 'dotenv/config';
import { ApifyClient } from 'apify-client';
import * as fs from 'fs';
import * as path from 'path';
import { Aviso, ScrapingResult } from './shared/types';

// Inicializar cliente Apify
const client = new ApifyClient({
    token: process.env.APIFY_TOKEN,
});

// IDs dos actors no Apify (a preencher após deploy)
const ACTOR_IDS = {
    portugal2030: process.env.APIFY_ACTOR_PT2030 || '',
    pepac: process.env.APIFY_ACTOR_PEPAC || '',
    prr: process.env.APIFY_ACTOR_PRR || '',
    europaCriativa: process.env.APIFY_ACTOR_EC || '',
    horizonEurope: process.env.APIFY_ACTOR_HORIZON || '',
    ipdj: process.env.APIFY_ACTOR_IPDJ || '',
};

interface OrchestratorResult {
    success: boolean;
    timestamp: string;
    duration_ms: number;
    results: {
        fonte: string;
        avisos: number;
        success: boolean;
        errors: string[];
    }[];
    totalAvisos: number;
    allAvisos: Aviso[];
}

async function runAllActors(): Promise<OrchestratorResult> {
    const startTime = Date.now();
    const results: OrchestratorResult['results'] = [];
    const allAvisos: Aviso[] = [];

    console.log('🚀 Iniciando orquestração de scrapers...\n');

    // Executar cada actor
    for (const [nome, actorId] of Object.entries(ACTOR_IDS)) {
        if (!actorId) {
            console.log(`⏭️ ${nome}: Actor ID não configurado, pulando...`);
            results.push({
                fonte: nome,
                avisos: 0,
                success: false,
                errors: ['Actor ID não configurado'],
            });
            continue;
        }

        console.log(`📡 Executando ${nome}...`);

        try {
            const run = await client.actor(actorId).call({
                maxPages: 50,
                downloadPdfs: true,
            });

            // Obter resultados
            const { items } = await client.dataset(run.defaultDatasetId).listItems();

            // Filtrar apenas avisos (não o resultado geral)
            const avisos = items.filter((item: any) => item.type === 'aviso') as Aviso[];

            allAvisos.push(...avisos);

            results.push({
                fonte: nome,
                avisos: avisos.length,
                success: true,
                errors: [],
            });

            console.log(`  ✅ ${nome}: ${avisos.length} avisos\n`);

        } catch (error: any) {
            console.log(`  ❌ ${nome}: ${error.message}\n`);
            results.push({
                fonte: nome,
                avisos: 0,
                success: false,
                errors: [error.message],
            });
        }
    }

    const orchestratorResult: OrchestratorResult = {
        success: results.every(r => r.success),
        timestamp: new Date().toISOString(),
        duration_ms: Date.now() - startTime,
        results,
        totalAvisos: allAvisos.length,
        allAvisos,
    };

    // Guardar resultados localmente
    const outputDir = path.join(__dirname, '..', 'data', 'scraped');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Guardar todos os avisos
    fs.writeFileSync(
        path.join(outputDir, 'all_avisos.json'),
        JSON.stringify(allAvisos, null, 2)
    );

    // Guardar por fonte
    for (const [fonte, _] of Object.entries(ACTOR_IDS)) {
        const fontAvisos = allAvisos.filter(a =>
            a.fonte.toLowerCase().includes(fonte.toLowerCase().replace(/([A-Z])/g, ' $1').trim())
        );
        if (fontAvisos.length > 0) {
            fs.writeFileSync(
                path.join(outputDir, `${fonte}_avisos.json`),
                JSON.stringify(fontAvisos, null, 2)
            );
        }
    }

    // Guardar metadata
    fs.writeFileSync(
        path.join(outputDir, 'scraping_metadata.json'),
        JSON.stringify({
            lastUpdate: orchestratorResult.timestamp,
            sources: Object.fromEntries(results.map(r => [r.fonte, r.avisos])),
            total: orchestratorResult.totalAvisos,
            success: orchestratorResult.success,
        }, null, 2)
    );

    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMO DA ORQUESTRAÇÃO');
    console.log('='.repeat(50));
    console.log(`⏱️ Duração: ${(orchestratorResult.duration_ms / 1000).toFixed(1)}s`);
    console.log(`📋 Total avisos: ${orchestratorResult.totalAvisos}`);
    console.log(`✅ Sucesso: ${orchestratorResult.success ? 'Sim' : 'Parcial'}`);
    console.log('='.repeat(50) + '\n');

    return orchestratorResult;
}

// Executar se chamado diretamente
if (require.main === module) {
    runAllActors()
        .then(result => {
            console.log('🏁 Orquestração concluída!');
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('❌ Erro fatal:', error);
            process.exit(1);
        });
}

export { runAllActors, OrchestratorResult };
