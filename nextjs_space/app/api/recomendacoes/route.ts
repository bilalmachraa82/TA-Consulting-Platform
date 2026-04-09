import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { calculateCompatibility, getCompatibilityPriority } from '@/lib/compatibility';
import { generateClaudeText, isClaudeConfigured } from '@/lib/claude-direct';

function buildFallbackAnalysisText(empresa: any, aviso: any, analise: ReturnType<typeof calculateCompatibility>) {
  const prioridade = getCompatibilityPriority(analise.score);

  return [
    `Resumo: ${empresa.nome} tem prioridade ${prioridade} para o aviso ${aviso.nome}.`,
    '',
    'Pontos fortes:',
    ...(analise.razoes.length > 0 ? analise.razoes.map((razao) => `- ${razao}`) : ['- Não foram encontrados pontos fortes claros nos dados atuais.']),
    '',
    'Alertas e riscos:',
    ...(analise.alertas.length > 0 ? analise.alertas.map((alerta) => `- ${alerta}`) : ['- Confirmar critérios específicos do regulamento e documentação obrigatória.']),
    '',
    'Próximos passos recomendados:',
    '- Validar documentação societária, fiscal e contributiva.',
    '- Confirmar enquadramento do projeto e orçamento elegível.',
    '- Preparar rascunho de candidatura e cronograma interno.',
  ].join('\n');
}

// GET - Obter recomendações para uma empresa
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const empresaId = searchParams.get('empresaId');
    const limite = parseInt(searchParams.get('limite') || '10');
    const scoreMinimo = parseInt(searchParams.get('scoreMinimo') || '40');

    if (!empresaId) {
      return NextResponse.json({ error: 'ID da empresa é obrigatório' }, { status: 400 });
    }

    // Buscar dados da empresa
    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaId }
    });

    if (!empresa) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });
    }

    // Buscar avisos ativos (com prazo não expirado)
    const hoje = new Date();
    const avisos = await prisma.aviso.findMany({
      where: {
        dataFimSubmissao: {
          gte: hoje
        },
        ativo: true
      },
      orderBy: {
        dataFimSubmissao: 'asc'
      }
    });

    // Calcular compatibilidade para cada aviso
    const recomendacoes = avisos.map(aviso => {
      const analise = calculateCompatibility(empresa, aviso);
      return {
        aviso,
        score: analise.score,
        razoes: analise.razoes,
        alertas: analise.alertas,
        prioridade: getCompatibilityPriority(analise.score),
      };
    });

    // Filtrar e ordenar por score
    const recomendacoesFiltradas = recomendacoes
      .filter(r => r.score >= scoreMinimo)
      .sort((a, b) => b.score - a.score)
      .slice(0, limite);

    return NextResponse.json({
      empresa: {
        id: empresa.id,
        nome: empresa.nome,
        setor: empresa.setor,
        regiao: empresa.regiao,
        dimensao: empresa.dimensao
      },
      recomendacoes: recomendacoesFiltradas,
      total: recomendacoesFiltradas.length,
      totalAvisos: avisos.length
    });

  } catch (error) {
    console.error('Erro ao gerar recomendações:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar recomendações' },
      { status: 500 }
    );
  }
}

// POST - Gerar análise detalhada de compatibilidade
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { empresaId, avisoId } = await request.json();

    if (!empresaId || !avisoId) {
      return NextResponse.json({ error: 'IDs são obrigatórios' }, { status: 400 });
    }

    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaId }
    });

    const aviso = await prisma.aviso.findUnique({
      where: { id: avisoId }
    });

    if (!empresa || !aviso) {
      return NextResponse.json({ error: 'Empresa ou aviso não encontrado' }, { status: 404 });
    }

    const analise = calculateCompatibility(empresa, aviso);

    // Gerar recomendações adicionais usando LLM
    let recomendacoesIA: string | null = null;
    try {
      if (isClaudeConfigured()) {
        recomendacoesIA = await generateClaudeText({
          model: process.env.ANTHROPIC_ANALYSIS_MODEL || 'claude-sonnet-4-6',
          maxTokens: 900,
          temperature: 0.2,
          system: 'És um consultor especializado em fundos europeus para empresas portuguesas. Nunca alteres o score dado. Explica o encaixe, os riscos e os próximos passos com base apenas nos dados fornecidos.',
          prompt: `Analisa a compatibilidade abaixo e responde em português de Portugal, em texto corrido com secções curtas.

SCORE DETERMINÍSTICO:
- Score: ${analise.score}/100
- Razões: ${analise.razoes.join(' | ') || 'Sem razões fortes detetadas'}
- Alertas: ${analise.alertas.join(' | ') || 'Sem alertas críticos adicionais'}

EMPRESA:
- Nome: ${empresa.nome}
- Setor: ${empresa.setor}
- Região: ${empresa.regiao || 'N/A'}
- Dimensão: ${empresa.dimensao}

AVISO:
- Título: ${aviso.nome}
- Descrição: ${aviso.descrição || 'N/A'}
- Montante máximo: ${aviso.montanteMaximo ? `€${aviso.montanteMaximo.toLocaleString('pt-PT')}` : 'N/A'}
- Prazo: ${new Date(aviso.dataFimSubmissao).toLocaleDateString('pt-PT')}
- Portal: ${aviso.portal}

Estrutura obrigatória:
1. Resumo executivo
2. Pontos fortes
3. Riscos e validações
4. Próximos passos

Não inventes requisitos legais nem dados financeiros não fornecidos.`,
        });
      }
    } catch (error) {
      console.error('Erro ao gerar recomendações IA:', error);
    }

    if (!recomendacoesIA) {
      recomendacoesIA = buildFallbackAnalysisText(empresa, aviso, analise);
    }

    return NextResponse.json({
      empresa: {
        id: empresa.id,
        nome: empresa.nome,
        setor: empresa.setor,
        regiao: empresa.regiao,
        dimensao: empresa.dimensao,
      },
      aviso,
      analise: {
        score: analise.score,
        razoes: analise.razoes,
        alertas: analise.alertas,
        prioridade: getCompatibilityPriority(analise.score),
      },
      recomendacoesIA
    });

  } catch (error) {
    console.error('Erro ao gerar análise:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar análise' },
      { status: 500 }
    );
  }
}
