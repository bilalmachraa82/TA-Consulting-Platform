
// API para regenerar uma secção específica da Memória Descritiva
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClaudeClient } from '@/lib/claude';
import { getLLMConfig } from '@/lib/llm-config';
import { buildSectionPrompt, type MemoriaInput } from '@/lib/memoria-descritiva/rag-system';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

// POST: Regenerar secção específica
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { seccaoId, instrucoes } = body;

    if (!seccaoId) {
      return NextResponse.json(
        { error: 'seccaoId é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar memória e secção
    const memoria = await prisma.memoriaDescritiva.findUnique({
      where: { id: params.id },
      include: {
        empresa: true,
        aviso: true,
        seccoes: {
          orderBy: { numeroSeccao: 'asc' },
        },
      },
    });

    if (!memoria) {
      return NextResponse.json({ error: 'Memória não encontrada' }, { status: 404 });
    }

    const seccao = memoria.seccoes.find(s => s.id === seccaoId);
    if (!seccao) {
      return NextResponse.json({ error: 'Secção não encontrada' }, { status: 404 });
    }

    // Obter configuração LLM
    const config = await getLLMConfig(session.user.id);
    const claudeClient = await createClaudeClient(session.user.id);

    // Construir input para RAG
    const dadosEmpresaExtra = memoria.dadosEmpresa as any || {};
    const memoriaInput: MemoriaInput = {
      empresa: {
        nome: memoria.empresa.nome,
        nipc: memoria.empresa.nipc,
        setor: memoria.empresa.setor || undefined,
        dimensao: memoria.empresa.dimensao || undefined,
        regiao: memoria.empresa.regiao || undefined,
        volumeNegocios: dadosEmpresaExtra.volumeNegocios,
        numeroColaboradores: dadosEmpresaExtra.numeroColaboradores,
        anoFundacao: dadosEmpresaExtra.anoFundacao,
        certificacoes: dadosEmpresaExtra.certificacoes,
        premios: dadosEmpresaExtra.premios,
      },
      aviso: {
        nome: memoria.aviso.nome,
        codigo: memoria.aviso.codigo,
        portal: memoria.aviso.portal,
        programa: memoria.aviso.programa || undefined,
        linha: memoria.aviso.linha || undefined,
        descrição: memoria.aviso.descrição || undefined,
        montanteMinimo: memoria.aviso.montanteMinimo || undefined,
        montanteMaximo: memoria.aviso.montanteMaximo || undefined,
        dataFimSubmissao: memoria.aviso.dataFimSubmissao,
      },
      projeto: memoria.dadosProjeto as any,
    };

    // Coletar secções anteriores como contexto
    const previousSections = memoria.seccoes
      .filter(s => s.numeroSeccao < seccao.numeroSeccao)
      .map(s => `## ${s.titulo}\n${s.conteudo}`)
      .join('\n\n---\n\n');

    // Construir prompt específico para a secção
    let prompt = buildSectionPrompt(memoriaInput, seccao.titulo, previousSections);

    // Adicionar instruções específicas se fornecidas
    if (instrucoes) {
      prompt += `\n\n## INSTRUÇÕES ADICIONAIS DO UTILIZADOR:\n${instrucoes}`;
    }

    // Regenerar secção com Claude 4.5 Sonnet
    const messages = [
      {
        role: 'user' as const,
        content: prompt,
      },
    ];

    let conteudoRegenerado = '';
    for await (const chunk of claudeClient.generateStream(messages, {
      model: config.memoriaModel,
      maxTokens: 8000,
      temperature: 0.5,
    })) {
      conteudoRegenerado += chunk;
    }

    // Atualizar secção no banco de dados
    const seccaoAtualizada = await prisma.memoriaSecao.update({
      where: { id: seccaoId },
      data: {
        conteudo: conteudoRegenerado.trim(),
        status: 'GERADA',
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      seccao: seccaoAtualizada,
    });
  } catch (error) {
    console.error('Erro ao regenerar secção:', error);
    return NextResponse.json(
      { error: 'Erro ao regenerar secção' },
      { status: 500 }
    );
  }
}
