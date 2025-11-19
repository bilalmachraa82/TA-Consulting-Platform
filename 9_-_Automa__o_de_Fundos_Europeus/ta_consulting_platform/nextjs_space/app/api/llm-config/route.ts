
// API para gerenciar configurações de LLM
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getLLMConfig, updateLLMConfig } from '@/lib/llm-config';
import { prisma } from '@/lib/db';

/**
 * GET /api/llm-config
 * Obter configuração atual do usuário
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const config = await getLLMConfig(session.user.id);

    // Não retornar as chaves completas por segurança
    return NextResponse.json({
      provider: config.provider,
      hasAbacusKey: !!config.abacusApiKey,
      hasAnthropicKey: !!config.anthropicApiKey,
      hasOpenAIKey: !!config.openaiApiKey,
      chatbotModel: config.chatbotModel,
      memoriaModel: config.memoriaModel
    });
  } catch (error) {
    console.error('Error fetching LLM config:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar configuração' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/llm-config
 * Atualizar configuração do usuário
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      provider,
      anthropicApiKey,
      openaiApiKey,
      chatbotModel,
      memoriaModel
    } = body;

    // Validar provider
    if (provider && !['ABACUS_AI', 'ANTHROPIC', 'OPENAI'].includes(provider)) {
      return NextResponse.json(
        { error: 'Provider inválido' },
        { status: 400 }
      );
    }

    // Validar se o provider escolhido tem a chave necessária
    if (provider === 'ANTHROPIC' && !anthropicApiKey) {
      return NextResponse.json(
        { error: 'API key da Anthropic é obrigatória para este provider' },
        { status: 400 }
      );
    }

    if (provider === 'OPENAI' && !openaiApiKey) {
      return NextResponse.json(
        { error: 'API key da OpenAI é obrigatória para este provider' },
        { status: 400 }
      );
    }

    const config = await updateLLMConfig(session.user.id, {
      provider: provider || 'ABACUS_AI',
      anthropicApiKey,
      openaiApiKey,
      chatbotModel: chatbotModel || 'claude-3-5-haiku-20241022',
      memoriaModel: memoriaModel || 'claude-3-5-sonnet-20241022'
    });

    return NextResponse.json({
      success: true,
      message: 'Configuração atualizada com sucesso',
      config: {
        provider: config.provider,
        chatbotModel: config.chatbotModel,
        memoriaModel: config.memoriaModel
      }
    });
  } catch (error) {
    console.error('Error updating LLM config:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar configuração' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/llm-config
 * Resetar para configuração padrão (Abacus.AI)
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Desativar todas as configurações do usuário
    await prisma.aPIConfig.updateMany({
      where: { userId: session.user.id },
      data: { isActive: false }
    });

    return NextResponse.json({
      success: true,
      message: 'Configuração resetada para padrão (Abacus.AI)'
    });
  } catch (error) {
    console.error('Error resetting LLM config:', error);
    return NextResponse.json(
      { error: 'Erro ao resetar configuração' },
      { status: 500 }
    );
  }
}
