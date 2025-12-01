/**
 * Scraper API Endpoint
 *
 * Gestão do sistema de scraping para avisos de fundos:
 * - dados.gov.pt API (oficial)
 * - transparencia.gov.pt
 * - PEPAC, PRR
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  scrapeAllAvisos,
  saveScrapingResults,
  DadosGovClient,
  ScrapingResult,
} from '@/lib/advanced-scraper';
import * as fs from 'fs';
import * as path from 'path';

export const dynamic = 'force-dynamic';

// GET - Informações e dados atuais
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');

  // Obter metadata atual
  if (action === 'status') {
    try {
      const metaPath = path.join(process.cwd(), 'data', 'scraped', 'scraping_metadata.json');
      const metadata = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      return NextResponse.json({
        success: true,
        metadata,
      });
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Metadata não encontrada',
      });
    }
  }

  // Testar API dados.gov.pt
  if (action === 'test-api') {
    const client = new DadosGovClient();
    const avisos = await client.getAvisosPT2030();
    return NextResponse.json({
      success: avisos.length > 0,
      source: 'dados.gov.pt',
      count: avisos.length,
      sample: avisos.slice(0, 3),
    });
  }

  // Info geral
  return NextResponse.json({
    success: true,
    service: 'Scraper de Avisos de Fundos',
    sources: [
      {
        name: 'dados.gov.pt',
        type: 'API oficial',
        priority: 1,
        status: 'ativo',
      },
      {
        name: 'transparencia.gov.pt',
        type: 'web scraping',
        priority: 2,
        status: 'ativo',
      },
      {
        name: 'pepacc.pt',
        type: 'web scraping',
        priority: 3,
        status: 'ativo',
      },
      {
        name: 'recuperarportugal.gov.pt',
        type: 'web scraping',
        priority: 4,
        status: 'ativo',
      },
    ],
    endpoints: {
      'GET ?action=status': 'Estado atual do scraping',
      'GET ?action=test-api': 'Testar API dados.gov.pt',
      'POST ?action=run': 'Executar scraping completo',
      'POST ?action=run-source&source=xxx': 'Executar scraping de fonte específica',
    },
  });
}

// POST - Executar scraping
export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action') || 'run';
    const source = searchParams.get('source');

    // Verificar se já está a correr
    const lockFile = path.join(process.cwd(), 'data', 'scraped', '.scraping.lock');
    if (fs.existsSync(lockFile)) {
      const lockTime = fs.statSync(lockFile).mtime.getTime();
      const now = Date.now();
      // Lock válido por 5 minutos
      if (now - lockTime < 5 * 60 * 1000) {
        return NextResponse.json({
          success: false,
          error: 'Scraping já em execução',
          startedAt: new Date(lockTime).toISOString(),
        });
      }
    }

    // Criar lock
    fs.writeFileSync(lockFile, new Date().toISOString());

    let result: ScrapingResult;

    try {
      if (action === 'run') {
        console.log('🚀 Iniciando scraping completo...');
        result = await scrapeAllAvisos();

        // Guardar resultados
        await saveScrapingResults(result);

        console.log(`✅ Scraping concluído: ${result.avisos.length} avisos`);
      } else if (action === 'run-source' && source) {
        // Scraping de fonte específica (implementar conforme necessário)
        return NextResponse.json({
          success: false,
          error: 'Scraping por fonte não implementado ainda',
        });
      } else {
        return NextResponse.json(
          { success: false, error: 'Ação não reconhecida' },
          { status: 400 }
        );
      }
    } finally {
      // Remover lock
      if (fs.existsSync(lockFile)) {
        fs.unlinkSync(lockFile);
      }
    }

    return NextResponse.json({
      success: result.success,
      source: result.source,
      totalAvisos: result.avisos.length,
      byFonte: countByFonte(result.avisos),
      errors: result.errors,
      timestamp: result.timestamp,
    });
  } catch (error: any) {
    console.error('Scraping error:', error);

    // Limpar lock em caso de erro
    const lockFile = path.join(process.cwd(), 'data', 'scraped', '.scraping.lock');
    if (fs.existsSync(lockFile)) {
      fs.unlinkSync(lockFile);
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro no scraping',
      },
      { status: 500 }
    );
  }
}

function countByFonte(avisos: any[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const aviso of avisos) {
    const fonte = aviso.fonte || 'Desconhecido';
    counts[fonte] = (counts[fonte] || 0) + 1;
  }
  return counts;
}
