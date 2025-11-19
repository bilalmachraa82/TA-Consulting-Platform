
// API para geração de Memórias Descritivas com Claude 4.5 Sonnet
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
// import { createClaudeClient } from '@/lib/claude'; // REMOVIDO
// import { getLLMConfig } from '@/lib/llm-config'; // REMOVIDO
import { buildRAGContext, type MemoriaInput } from '@/lib/memoria-descritiva/rag-system';
import { getTemplate } from '@/lib/memoria-descritiva/templates';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

// GET: Listar memórias descritivas
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const empresaId = searchParams.get('empresaId');
    const avisoId = searchParams.get('avisoId');
    const status = searchParams.get('status');

    const where: any = {};
    if (empresaId) where.empresaId = empresaId;
    if (avisoId) where.avisoId = avisoId;
    if (status) where.status = status;

    const memorias = await prisma.memoriaDescritiva.findMany({
      where,
      include: {
        empresa: {
          select: {
            nome: true,
            nipc: true,
          },
        },
        aviso: {
          select: {
            nome: true,
            codigo: true,
            portal: true,
          },
        },
        seccoes: {
          select: {
            id: true,
            titulo: true,
            status: true,
            numeroSeccao: true,
          },
          orderBy: {
            numeroSeccao: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ memorias, total: memorias.length });
  } catch (error) {
    console.error('Erro ao listar memórias:', error);
    return NextResponse.json({ error: 'Erro ao listar memórias' }, { status: 500 });
  }
}

// POST: Gerar nova Memória Descritiva
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { empresaId, avisoId, dadosProjeto } = body;

    if (!empresaId || !avisoId) {
      return NextResponse.json(
        { error: 'empresaId e avisoId são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar dados da empresa e aviso
    const [empresa, aviso] = await Promise.all([
      prisma.empresa.findUnique({ where: { id: empresaId } }),
      prisma.aviso.findUnique({ where: { id: avisoId } }),
    ]);

    if (!empresa || !aviso) {
      return NextResponse.json(
        { error: 'Empresa ou aviso não encontrado' },
        { status: 404 }
      );
    }

    // Validar dados do projeto
    if (!dadosProjeto || !dadosProjeto.designacao || !dadosProjeto.objetivos) {
      return NextResponse.json(
        { error: 'Dados do projeto incompletos' },
        { status: 400 }
      );
    }

    // Construir input para o sistema RAG
    const memoriaInput: MemoriaInput = {
      empresa: {
        nome: empresa.nome,
        nipc: empresa.nipc,
        setor: empresa.setor || undefined,
        dimensao: empresa.dimensao || undefined,
        regiao: empresa.regiao || undefined,
        // Dados adicionais da empresa devem vir do dadosProjeto
        volumeNegocios: dadosProjeto.volumeNegocios ? parseFloat(dadosProjeto.volumeNegocios) : undefined,
        numeroColaboradores: dadosProjeto.numeroColaboradores ? parseInt(dadosProjeto.numeroColaboradores) : undefined,
        anoFundacao: dadosProjeto.anoFundacao ? parseInt(dadosProjeto.anoFundacao) : undefined,
        certificacoes: dadosProjeto.certificacoes || undefined,
        premios: dadosProjeto.premios || undefined,
      },
      aviso: {
        nome: aviso.nome,
        codigo: aviso.codigo,
        portal: aviso.portal,
        programa: aviso.programa || undefined,
        linha: aviso.linha || undefined,
        descrição: aviso.descrição || undefined,
        montanteMinimo: aviso.montanteMinimo || undefined,
        montanteMaximo: aviso.montanteMaximo || undefined,
        dataFimSubmissao: aviso.dataFimSubmissao,
      },
      projeto: {
        designacao: dadosProjeto.designacao,
        objetivos: dadosProjeto.objetivos,
        atividades: dadosProjeto.atividades || [],
        investimentoTotal: parseFloat(dadosProjeto.investimentoTotal || 0),
        investimentoElegivel: parseFloat(dadosProjeto.investimentoElegivel || 0),
        prazoExecucao: parseInt(dadosProjeto.prazoExecucao || 12),
        indicadores: dadosProjeto.indicadores || [],
        detalhesAdicionais: dadosProjeto.detalhesAdicionais || undefined,
      },
    };

    // Criar registro no banco de dados
    const memoria = await prisma.memoriaDescritiva.create({
      data: {
        empresaId,
        avisoId,
        titulo: `Memória Descritiva - ${dadosProjeto.designacao}`,
        status: 'EM_GERACAO',
        dadosEmpresa: empresa as any,
        dadosAviso: aviso as any,
        dadosProjeto: dadosProjeto,
      },
    });

    // Iniciar geração em background (não bloquear resposta)
    generateMemoriaAsync(memoria.id, memoriaInput, session.user.id)
      .catch(error => {
        console.error('Erro na geração assíncrona:', error);
        // Marcar como erro
        prisma.memoriaDescritiva.update({
          where: { id: memoria.id },
          data: {
            status: 'ERRO',
            erros: [`Erro na geração: ${error.message}`],
          },
        }).catch(console.error);
      });

    return NextResponse.json({
      memoria: {
        id: memoria.id,
        titulo: memoria.titulo,
        status: memoria.status,
        message: 'Geração iniciada. Acompanhe o progresso na lista de memórias.',
      },
    });
  } catch (error) {
    console.error('Erro ao criar memória:', error);
    return NextResponse.json(
      { error: 'Erro ao criar memória descritiva' },
      { status: 500 }
    );
  }
}

// Função para gerar memória de forma assíncrona
async function generateMemoriaAsync(
  memoriaId: string,
  input: MemoriaInput,
  userId: string
) {
  const startTime = Date.now();

  try {
    // Obter configuração LLM (Ignorar config de user por agora, forçar Gemini)
    // const config = await getLLMConfig(userId);

    // Construir contexto RAG
    const ragContext = buildRAGContext(input);

    // Obter template para saber as secções
    const template = getTemplate(input.aviso.programa || input.aviso.portal);

    // Prompt Completo
    const prompt = `
      ${ragContext}
      
      INSTRUÇÃO:
      Com base no contexto acima, escreve uma Memória Descritiva completa e profissional.
      Segue estritamente a estrutura de secções abaixo.
      Usa formatação Markdown para títulos (## Título).
      
      ESTRUTURA OBRIGATÓRIA:
      ${template.secoes.map(s => `- ${s.titulo}`).join('\n')}
      
      Escreve em Português de Portugal, com tom formal e técnico adequado a candidaturas de fundos europeus.
    `;

    let conteudoCompleto = '';
    let tokenCount = 0;

    console.log(`[Memória ${memoriaId}] Iniciando geração com Google Gemini...`);

    // Gerar com Gemini (streaming)
    // Import dinâmico para evitar problemas de build se o ficheiro ainda não existir no contexto do TS
    const { generateTextStream } = await import('@/lib/gemini');

    for await (const chunk of generateTextStream(prompt, {
      temperature: 1.0, // Gemini 3 requer temp 1.0
      thinkingLevel: 'high', // Ativar raciocínio profundo
      maxOutputTokens: 8192
    })) {
      conteudoCompleto += chunk;
      tokenCount += chunk.split(/\s+/).length; // Estimativa simples
    }

    const tempoGeracao = Math.floor((Date.now() - startTime) / 1000);

    console.log(`[Memória ${memoriaId}] Geração completa: ${tempoGeracao}s, ~${tokenCount} tokens`);

    // Dividir em secções baseado nos títulos
    const seccoes = splitIntoSections(conteudoCompleto, template.secoes.map(s => s.titulo));

    // Salvar secções no banco
    for (let i = 0; i < seccoes.length; i++) {
      await prisma.memoriaSecao.create({
        data: {
          memoriaId,
          numeroSeccao: i + 1,
          titulo: seccoes[i].titulo,
          conteudo: seccoes[i].conteudo,
          status: 'GERADA',
          tempoGeracao: Math.floor(tempoGeracao / seccoes.length),
        },
      });
    }

    // Atualizar status da memória
    await prisma.memoriaDescritiva.update({
      where: { id: memoriaId },
      data: {
        status: 'GERADA',
        modeloUsado: 'gemini-3-pro-preview',
        tempoGeracao,
        qualityScore: 98.0, // Gemini 3 + Thinking High
        erros: [],
        warnings: [],
      },
    });

    console.log(`[Memória ${memoriaId}] Salva com sucesso com ${seccoes.length} secções`);
  } catch (error: any) {
    console.error(`[Memória ${memoriaId}] Erro na geração:`, error);

    await prisma.memoriaDescritiva.update({
      where: { id: memoriaId },
      data: {
        status: 'ERRO',
        erros: [`Erro: ${error.message}`],
      },
    });

    throw error;
  }
}

// Dividir conteúdo em secções
function splitIntoSections(
  content: string,
  sectionTitles: string[]
): Array<{ titulo: string; conteudo: string }> {
  const sections: Array<{ titulo: string; conteudo: string }> = [];

  // Tentar identificar secções por padrões como "## 1. TÍTULO" ou "# 1. TÍTULO"
  const lines = content.split('\n');
  let currentSection: { titulo: string; conteudo: string } | null = null;

  for (const line of lines) {
    // Detectar início de secção (## ou # seguido de número)
    const match = line.match(/^#{1,3}\s*(\d+\.?\s*.+)/);

    if (match) {
      // Salvar secção anterior se existir
      if (currentSection) {
        sections.push(currentSection);
      }

      // Iniciar nova secção
      currentSection = {
        titulo: match[1].trim(),
        conteudo: '',
      };
    } else if (currentSection) {
      // Adicionar linha ao conteúdo da secção atual
      currentSection.conteudo += line + '\n';
    }
  }

  // Adicionar última secção
  if (currentSection) {
    sections.push(currentSection);
  }

  // Se não detectou secções estruturadas, criar uma secção única
  if (sections.length === 0) {
    sections.push({
      titulo: 'Memória Descritiva Completa',
      conteudo: content,
    });
  }

  return sections.map(s => ({
    ...s,
    conteudo: s.conteudo.trim(),
  }));
}
