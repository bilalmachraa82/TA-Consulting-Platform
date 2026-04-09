import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { buildFallbackCaseBrief, normalizeCaseBriefPayload, type CaseBrief } from '@/lib/briefs';
import { calculateCompatibility } from '@/lib/compatibility';
import { generateClaudeJson, isClaudeConfigured } from '@/lib/claude-direct';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { empresaId, avisoId } = await request.json();
    if (!empresaId || !avisoId) {
      return NextResponse.json({ error: 'empresaId e avisoId são obrigatórios' }, { status: 400 });
    }

    const [empresa, aviso] = await Promise.all([
      prisma.empresa.findUnique({ where: { id: empresaId } }),
      prisma.aviso.findUnique({ where: { id: avisoId } }),
    ]);

    if (!empresa || !aviso) {
      return NextResponse.json({ error: 'Empresa ou aviso não encontrado' }, { status: 404 });
    }

    const analise = calculateCompatibility(empresa, aviso);
    const fallbackBrief = buildFallbackCaseBrief(empresa, aviso, analise);

    let brief = fallbackBrief;
    let fonte: 'anthropic' | 'fallback' = 'fallback';

    try {
      if (isClaudeConfigured()) {
        const generatedBrief = await generateClaudeJson<Partial<CaseBrief>>({
          model: process.env.ANTHROPIC_BRIEF_MODEL || 'claude-sonnet-4-6',
          maxTokens: 1400,
          temperature: 0.2,
          system: 'És um consultor sénior de candidaturas a fundos europeus. Responde apenas com JSON válido e sem markdown.',
          prompt: `Cria um brief interno para um consultor, em português de Portugal, no formato JSON:
{
  "titulo": string,
  "sumarioExecutivo": string,
  "elegibilidade": {
    "score": number,
    "prioridade": "alta" | "média" | "baixa",
    "razoes": string[],
    "alertas": string[]
  },
  "documentosNecessarios": string[],
  "timeline": string[],
  "riscos": string[],
  "recomendacao": string
}

Dados:
- Empresa: ${empresa.nome}
- Setor: ${empresa.setor}
- Região: ${empresa.regiao || 'N/A'}
- Dimensão: ${empresa.dimensao}
- Aviso: ${aviso.nome}
- Portal: ${aviso.portal}
- Programa: ${aviso.programa}
- Linha: ${aviso.linha || 'N/A'}
- Descrição: ${aviso.descrição || 'N/A'}
- Prazo: ${aviso.dataFimSubmissao.toLocaleDateString('pt-PT')}
- Link: ${aviso.link || 'N/A'}
- Score fixo: ${analise.score}
- Razões fixas: ${analise.razoes.join(' | ') || 'Sem razões fortes detetadas'}
- Alertas fixos: ${analise.alertas.join(' | ') || 'Sem alertas críticos'}

Regras:
- Não alteres o score.
- Não inventes legislação.
- Não inventes documentos específicos fora do que é normalmente prudente pedir.
- Produz um brief objetivo, acionável e interno.`,
        });

        brief = normalizeCaseBriefPayload(generatedBrief, fallbackBrief);
        fonte = 'anthropic';
      }
    } catch (error) {
      console.error('Erro ao gerar brief com Claude:', error);
    }

    return NextResponse.json({
      empresa: {
        id: empresa.id,
        nome: empresa.nome,
      },
      aviso: {
        id: aviso.id,
        nome: aviso.nome,
      },
      brief,
      fonte,
    });
  } catch (error) {
    console.error('Erro ao gerar brief:', error);
    return NextResponse.json({ error: 'Erro ao gerar brief' }, { status: 500 });
  }
}
