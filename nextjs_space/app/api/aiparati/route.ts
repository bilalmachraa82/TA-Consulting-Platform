/**
 * API Route: /api/aiparati
 *
 * Endpoints para integração com aiparati-express:
 * - POST /api/aiparati/ies - Upload e análise de IES
 * - POST /api/aiparati/analyze - Análise financeira
 * - POST /api/aiparati/template - Gerar template IAPMEI
 * - POST /api/aiparati/eligibility - Elegibilidade enriquecida
 * - GET /api/aiparati/status - Status do serviço
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getAiparatiClient,
  isAiparatiAvailable,
  IESData,
} from '@/lib/aiparati-client';

// ============================================
// GET - Status do serviço
// ============================================

export async function GET(request: NextRequest) {
  try {
    const client = getAiparatiClient();
    const status = await client.checkHealth();

    return NextResponse.json({
      success: true,
      status,
      message: status.online
        ? 'Serviço aiparati-express disponível'
        : 'Serviço offline - usando fallback local',
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      status: { online: false },
      error: error.message,
    });
  }
}

// ============================================
// POST - Operações principais
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    const client = getAiparatiClient();

    switch (action) {
      // --------------------------------
      // Análise de IES
      // --------------------------------
      case 'analyze': {
        const iesData = data.ies as IESData;
        if (!iesData) {
          return NextResponse.json(
            { success: false, error: 'Dados IES obrigatórios' },
            { status: 400 }
          );
        }

        const analysis = await client.analyzeIES(iesData);

        return NextResponse.json({
          success: true,
          analysis,
          source: (await isAiparatiAvailable()) ? 'aiparati' : 'local',
        });
      }

      // --------------------------------
      // Gerar Template IAPMEI
      // --------------------------------
      case 'template': {
        const { tipo, empresa, avisoId } = data;

        if (!tipo || !empresa) {
          return NextResponse.json(
            { success: false, error: 'Tipo e empresa obrigatórios' },
            { status: 400 }
          );
        }

        const template = await client.generateTemplate(tipo, empresa, avisoId);

        return NextResponse.json({
          success: true,
          template,
        });
      }

      // --------------------------------
      // Elegibilidade Enriquecida
      // --------------------------------
      case 'eligibility': {
        const { empresaId, ies, avisoIds } = data;

        if (!empresaId || !ies) {
          return NextResponse.json(
            { success: false, error: 'empresaId e ies obrigatórios' },
            { status: 400 }
          );
        }

        const eligibility = await client.calculateEnrichedEligibility(
          empresaId,
          ies,
          avisoIds
        );

        return NextResponse.json({
          success: true,
          eligibility,
        });
      }

      // --------------------------------
      // Análise Completa
      // --------------------------------
      case 'full-analysis': {
        const { ies: iesDataFull, avisoIds: avisoIdsFull } = data;

        if (!iesDataFull) {
          return NextResponse.json(
            { success: false, error: 'Dados IES obrigatórios' },
            { status: 400 }
          );
        }

        const fullAnalysis = await client.getFullAnalysis(iesDataFull, avisoIdsFull);

        return NextResponse.json({
          success: true,
          ...fullAnalysis,
        });
      }

      // --------------------------------
      // Ação desconhecida
      // --------------------------------
      default:
        return NextResponse.json(
          {
            success: false,
            error: `Ação desconhecida: ${action}`,
            availableActions: ['analyze', 'template', 'eligibility', 'full-analysis'],
          },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('[aiparati] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
