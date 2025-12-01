/**
 * API de Score de Elegibilidade
 *
 * Calcula automaticamente a compatibilidade entre empresas e avisos.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  calculateEligibilityScore,
  findBestMatches,
  avisoToProfile,
  EmpresaProfile,
  AvisoProfile,
} from '@/lib/eligibility-score';
import * as fs from 'fs';
import * as path from 'path';

export const dynamic = 'force-dynamic';

// Carregar avisos
function loadAvisos(): AvisoProfile[] {
  try {
    const filePath = path.join(process.cwd(), 'data', 'scraped', 'all_avisos.json');
    const content = fs.readFileSync(filePath, 'utf-8');
    const avisos = JSON.parse(content);
    return avisos.map(avisoToProfile);
  } catch (error) {
    console.error('Erro ao carregar avisos:', error);
    return [];
  }
}

// GET - Calcular score para empresa específica
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const avisoId = searchParams.get('aviso');
    const minScore = parseInt(searchParams.get('minScore') || '40');

    // Empresa de exemplo (ou da query)
    const empresaData: EmpresaProfile = {
      id: searchParams.get('empresaId') || 'demo-empresa',
      nome: searchParams.get('empresaNome') || 'Empresa Demo',
      nif: searchParams.get('nif') || '123456789',
      cae: searchParams.get('cae') || '62010',
      setor: searchParams.get('setor') || 'Tecnologia',
      dimensao: (searchParams.get('dimensao') as EmpresaProfile['dimensao']) || 'pequena',
      regiao: searchParams.get('regiao') || 'Norte',
      anosAtividade: parseInt(searchParams.get('anos') || '5'),
      exportadora: searchParams.get('exportadora') === 'true',
      necessidades: searchParams.get('necessidades')?.split(',') || ['digitalização', 'inovação'],
    };

    const avisos = loadAvisos();

    if (!avisos.length) {
      return NextResponse.json({
        success: false,
        error: 'Nenhum aviso disponível',
      });
    }

    // Score para aviso específico
    if (avisoId) {
      const aviso = avisos.find((a) => a.id === avisoId);
      if (!aviso) {
        return NextResponse.json(
          { success: false, error: 'Aviso não encontrado' },
          { status: 404 }
        );
      }

      const score = calculateEligibilityScore(empresaData, aviso);
      return NextResponse.json({
        success: true,
        score,
      });
    }

    // Encontrar melhores matches
    const result = findBestMatches(empresaData, avisos, minScore);

    return NextResponse.json({
      success: true,
      empresa: {
        id: empresaData.id,
        nome: empresaData.nome,
        setor: empresaData.setor,
        dimensao: empresaData.dimensao,
        regiao: empresaData.regiao,
      },
      resumo: {
        total_oportunidades: result.total_oportunidades,
        montante_potencial: result.montante_potencial,
        montante_potencial_formatado: `${(result.montante_potencial / 1000000).toFixed(1)}M€`,
        melhor_score: result.melhor_match?.score_total || 0,
      },
      matches: result.matches.slice(0, 10).map((m) => ({
        aviso_id: m.aviso_id,
        aviso_titulo: m.aviso_titulo,
        score: m.score_total,
        nivel: m.nivel,
        urgencia: m.urgencia,
        dias_restantes: m.dias_restantes,
        breakdown: m.breakdown,
        recomendacoes: m.recomendacoes,
        riscos: m.riscos,
      })),
    });
  } catch (error: any) {
    console.error('Erro ao calcular elegibilidade:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao calcular', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Calcular score com dados completos da empresa
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { empresa, avisoId, minScore = 40, limit = 10 } = body;

    if (!empresa) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dados da empresa são obrigatórios',
          example: {
            empresa: {
              id: 'empresa-123',
              nome: 'Minha Empresa Lda',
              nif: '123456789',
              cae: '62010',
              setor: 'Tecnologia',
              dimensao: 'pequena',
              regiao: 'Norte',
              anosAtividade: 5,
              exportadora: true,
              necessidades: ['digitalização', 'inovação'],
            },
          },
        },
        { status: 400 }
      );
    }

    // Validar e completar dados da empresa
    const empresaProfile: EmpresaProfile = {
      id: empresa.id || 'unknown',
      nome: empresa.nome || 'Empresa',
      nif: empresa.nif || '',
      cae: empresa.cae || '',
      setor: empresa.setor || 'Geral',
      dimensao: empresa.dimensao || 'pequena',
      regiao: empresa.regiao || 'Nacional',
      anosAtividade: empresa.anosAtividade || 0,
      volumeNegocios: empresa.volumeNegocios,
      numeroTrabalhadores: empresa.numeroTrabalhadores,
      exportadora: empresa.exportadora || false,
      certificacoes: empresa.certificacoes || [],
      necessidades: empresa.necessidades || [],
    };

    const avisos = loadAvisos();

    // Score para aviso específico
    if (avisoId) {
      const aviso = avisos.find((a) => a.id === avisoId);
      if (!aviso) {
        return NextResponse.json(
          { success: false, error: 'Aviso não encontrado' },
          { status: 404 }
        );
      }

      const score = calculateEligibilityScore(empresaProfile, aviso);
      return NextResponse.json({
        success: true,
        aviso: {
          id: aviso.id,
          titulo: aviso.titulo,
          fonte: aviso.fonte,
          programa: aviso.programa,
        },
        score,
      });
    }

    // Encontrar melhores matches
    const result = findBestMatches(empresaProfile, avisos, minScore);

    // Agrupar por fonte
    const byFonte: Record<string, number> = {};
    for (const match of result.matches) {
      const aviso = avisos.find((a) => a.id === match.aviso_id);
      if (aviso) {
        byFonte[aviso.fonte] = (byFonte[aviso.fonte] || 0) + 1;
      }
    }

    return NextResponse.json({
      success: true,
      empresa: {
        id: empresaProfile.id,
        nome: empresaProfile.nome,
        setor: empresaProfile.setor,
        dimensao: empresaProfile.dimensao,
        regiao: empresaProfile.regiao,
      },
      resumo: {
        total_oportunidades: result.total_oportunidades,
        total_avisos_analisados: avisos.length,
        montante_potencial: result.montante_potencial,
        montante_potencial_formatado: formatMontante(result.montante_potencial),
        melhor_score: result.melhor_match?.score_total || 0,
        melhor_match: result.melhor_match?.aviso_titulo || null,
        por_fonte: byFonte,
      },
      matches: result.matches.slice(0, limit),
      melhor_match: result.melhor_match,
    });
  } catch (error: any) {
    console.error('Erro POST elegibilidade:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao processar', details: error.message },
      { status: 500 }
    );
  }
}

function formatMontante(value: number): string {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B€`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M€`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K€`;
  }
  return `${value}€`;
}
