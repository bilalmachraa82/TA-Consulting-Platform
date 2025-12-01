/**
 * AutoFund AI Integration API
 *
 * Endpoints para integração com aiparati-express:
 * - Upload e processamento de IES
 * - Status de processamento
 * - Download de templates
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getAutoFundClient,
  processIESAndMatchPrograms,
} from '@/lib/autofund-client';

export const dynamic = 'force-dynamic';

// GET - Status e informações
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');
  const jobId = searchParams.get('jobId');

  const client = getAutoFundClient();

  // Verificar se está configurado
  if (!client.isServiceConfigured()) {
    return NextResponse.json({
      success: false,
      configured: false,
      message: 'AutoFund API não configurada',
      setup: {
        steps: [
          '1. Clone o repositório: git clone https://github.com/bilalmachraa82/aiparati-express',
          '2. Configure as variáveis de ambiente',
          '3. Inicie o serviço: docker-compose up -d',
          '4. Adicione AUTOFUND_API_URL ao .env desta aplicação',
        ],
        envVars: [
          'AUTOFUND_API_URL=http://localhost:8000',
          'AUTOFUND_API_KEY=your-api-key (opcional)',
        ],
      },
    });
  }

  // Health check
  if (action === 'health') {
    const health = await client.healthCheck();
    return NextResponse.json({
      success: !!health,
      health,
    });
  }

  // Status de um job específico
  if (action === 'status' && jobId) {
    const status = await client.getProcessingStatus(jobId);
    return NextResponse.json({
      success: status.status !== 'failed',
      status,
    });
  }

  // Resultado de um job
  if (action === 'result' && jobId) {
    const result = await client.getResult(jobId);
    return NextResponse.json({
      success: !!result,
      result,
    });
  }

  // Info geral
  return NextResponse.json({
    success: true,
    configured: true,
    service: 'AutoFund AI Integration',
    endpoints: {
      'GET ?action=health': 'Verificar saúde do serviço',
      'GET ?action=status&jobId=xxx': 'Status de processamento',
      'GET ?action=result&jobId=xxx': 'Resultado do processamento',
      'POST (multipart)': 'Upload e processamento de IES',
    },
    features: [
      'Extração automática de IES (PDF)',
      'Análise financeira com Claude AI',
      'Geração de templates IAPMEI',
      'Cálculo de elegibilidade para programas',
    ],
  });
}

// POST - Upload e processamento
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    // Processamento de FormData (upload de ficheiro)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      const nif = formData.get('nif') as string;
      const designacao = formData.get('designacao') as string;
      const anoExercicio = parseInt(formData.get('anoExercicio') as string) || new Date().getFullYear() - 1;
      const setor = formData.get('setor') as string | null;
      const regiao = formData.get('regiao') as string | null;

      if (!file || !nif || !designacao) {
        return NextResponse.json(
          {
            success: false,
            error: 'Campos obrigatórios: file, nif, designacao',
          },
          { status: 400 }
        );
      }

      // Converter File para Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Processar e calcular elegibilidade
      const result = await processIESAndMatchPrograms(buffer, file.name, {
        nif,
        designacao,
        anoExercicio,
        setor: setor || undefined,
        regiao: regiao || undefined,
      });

      return NextResponse.json(result);
    }

    // Processamento de JSON (análise sem upload)
    const body = await request.json();
    const { action, data } = body;

    const client = getAutoFundClient();

    if (!client.isServiceConfigured()) {
      return NextResponse.json({
        success: false,
        error: 'AutoFund API não configurada',
      });
    }

    // Análise rápida de dados financeiros
    if (action === 'analyze') {
      const analysis = await client.analyzeFinancials(data);
      return NextResponse.json({
        success: !!analysis,
        analysis,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Ação não reconhecida' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('AutoFund API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro interno',
      },
      { status: 500 }
    );
  }
}
