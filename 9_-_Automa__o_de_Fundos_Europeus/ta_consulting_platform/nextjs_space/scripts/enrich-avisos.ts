#!/usr/bin/env tsx
/**
 * ENRICH AVISOS SCRIPT
 * Enriches avisos using the extraction framework
 * Usage:
 *   tsx scripts/enrich-avisos.ts --tier=1              # API only
 *   tsx scripts/enrich-avisos.ts --tier=3 --limit=20   # LLM (limited)
 *   tsx scripts/enrich-avisos.ts --portal=PORTUGAL2030 # One portal
 */

import { PrismaClient } from '@prisma/client';
import Anthropic from '@anthropic-ai/sdk';
import { ExtractionOrchestrator } from '../lib/extraction/orchestrator';
import { PT2030APIExtractor } from '../lib/extraction/tier1/pt2030-api-extractor';
import { LLMExtractor } from '../lib/extraction/tier3/llm-extractor';

const prisma = new PrismaClient();

interface EnrichOptions {
  tier: 1 | 2 | 3;
  limit?: number;
  portal?: 'PORTUGAL2030' | 'PRR' | 'PEPACC';
  batchSize?: number;
}

function parseArgs(): EnrichOptions {
  const args = process.argv.slice(2);

  const tierArg = args.find((a) => a.startsWith('--tier='));
  const limitArg = args.find((a) => a.startsWith('--limit='));
  const portalArg = args.find((a) => a.startsWith('--portal='));

  return {
    tier: tierArg ? parseInt(tierArg.split('=')[1]) as 1 | 2 | 3 : 1,
    limit: limitArg ? parseInt(limitArg.split('=')[1]) : undefined,
    portal: portalArg
      ? (portalArg.split('=')[1] as 'PORTUGAL2030' | 'PRR' | 'PEPACC')
      : undefined,
    batchSize: 50,
  };
}

async function enrichAvisos(options: EnrichOptions) {
  console.log('🚀 AVISO ENRICHMENT');
  console.log('='.repeat(60));
  console.log(`  Tier: ${options.tier}`);
  console.log(`  Portal: ${options.portal || 'ALL'}`);
  console.log(`  Limit: ${options.limit || 'UNLIMITED'}`);
  console.log('');

  // Setup orchestrator
  const orchestrator = new ExtractionOrchestrator();

  // Register extractors based on tier
  orchestrator.register(new PT2030APIExtractor());

  if (options.tier >= 3) {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    orchestrator.register(new LLMExtractor(anthropic));
  }

  // Query avisos
  const where: any = {};
  if (options.portal) {
    where.portal = options.portal;
  }

  const avisos = await prisma.aviso.findMany({
    where,
    take: options.limit,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      codigo: true,
      nome: true,
      portal: true,
      programa: true,
      regiao: true,
      montanteMaximo: true,
      dataInicioSubmissao: true,
      dataFimSubmissao: true,
      pdfExtractedText: true,
      pdfExtractionQuality: true,
      enrichmentStatus: true,
    },
  });

  console.log(`📊 Found ${avisos.length} avisos to enrich\n`);

  let enriched = 0;
  let totalCost = 0;

  for (const aviso of avisos) {
    console.log(`🔄 Enriching: ${aviso.codigo}`);

    try {
      // Fetch API data (simulate)
      const apiData = {
        codigo: aviso.codigo,
        titulo: aviso.nome,
        programa: aviso.programa,
        fundo: 'Fundo Europeu de Desenvolvimento Regional',
        regiao: aviso.regiao || 'Lisboa',
        dotacao: aviso.montanteMaximo,
        data_inicio_candidaturas: aviso.dataInicioSubmissao,
        data_fim_candidaturas: aviso.dataFimSubmissao,
      };

      // Get PDF text if available and needed for Tier 2+
      let pdfText: string | undefined;
      if (options.tier >= 2 && aviso.pdfExtractedText) {
        pdfText = aviso.pdfExtractedText;
        console.log(`  📄 Using extracted PDF text (${pdfText.length} chars)`);
      } else if (options.tier >= 3 && !aviso.pdfExtractedText) {
        console.log('  ⚠️  No PDF text available, run download-pdfs.ts first');
        console.log('  ℹ️  Skipping Tier 3 enrichment for this aviso');
        continue;
      }

      // Enrich
      const enrichedAviso = await orchestrator.enrichAviso(
        {
          id: aviso.id,
          codigo: aviso.codigo,
          nome: aviso.nome,
          portal: aviso.portal as any,
        },
        {
          apiData,
          pdfText,
        },
        options.tier === 1 ? 'BASIC' : options.tier === 3 ? 'AI_ENRICHED' : 'ENHANCED'
      );

      // Track total cost
      totalCost += enrichedAviso.totalCostEstimate || 0;

      // Update database
      await prisma.aviso.update({
        where: { id: aviso.id },
        data: {
          enrichmentStatus: enrichedAviso.enrichmentStatus,
          enrichmentScore: enrichedAviso.enrichmentScore,
          dataSourceLog: enrichedAviso.dataSourceLog as any,
          lastEnrichedAt: enrichedAviso.lastEnrichedAt,
          enrichedBy: enrichedAviso.enrichedBy,
          // Update extracted fields
          fundoEstruturalPrincipal: enrichedAviso.fundoEstruturalPrincipal,
          regiaoNUTS2: enrichedAviso.regiaoNUTS2,
        },
      });

      enriched++;
      const costMsg = enrichedAviso.totalCostEstimate
        ? ` (cost: $${enrichedAviso.totalCostEstimate.toFixed(4)})`
        : '';
      console.log(`  ✅ Enriched (score: ${(enrichedAviso.enrichmentScore * 100).toFixed(1)}%)${costMsg}`);

    } catch (error: any) {
      console.error(`  ❌ Failed: ${error.message}`);
    }
  }

  console.log('');
  console.log('✅ ENRICHMENT COMPLETE');
  console.log(`  - Enriched: ${enriched}/${avisos.length} avisos`);
  if (totalCost > 0) {
    console.log(`  - Total cost: $${totalCost.toFixed(4)}`);
  }
}

const options = parseArgs();
enrichAvisos(options)
  .catch(console.error)
  .finally(() => prisma.$disconnect());
