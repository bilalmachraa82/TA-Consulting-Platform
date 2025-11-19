
// Gerenciamento de configurações de API para LLMs
import { prisma } from '@/lib/db';

export interface LLMConfig {
  provider: 'ABACUS_AI' | 'ANTHROPIC' | 'OPENAI';
  abacusApiKey?: string;
  anthropicApiKey?: string;
  openaiApiKey?: string;
  chatbotModel: string;
  memoriaModel: string;
}

/**
 * Obter configuração de API do usuário ou usar fallback (Abacus.AI)
 */
export async function getLLMConfig(userId?: string): Promise<LLMConfig> {
  // Se não houver userId, usar configuração default (Abacus.AI da env)
  if (!userId) {
    return {
      provider: 'ABACUS_AI',
      abacusApiKey: process.env.ABACUSAI_API_KEY,
      chatbotModel: 'claude-4-5-haiku-20250110',
      memoriaModel: 'claude-4-5-sonnet-20250110'
    };
  }

  // Buscar configuração do usuário
  const config = await prisma.aPIConfig.findFirst({
    where: {
      userId,
      isActive: true
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });

  // Se o usuário não tem configuração, usar default
  if (!config) {
    return {
      provider: 'ABACUS_AI',
      abacusApiKey: process.env.ABACUSAI_API_KEY,
      chatbotModel: 'claude-4-5-haiku-20250110',
      memoriaModel: 'claude-4-5-sonnet-20250110'
    };
  }

  // Retornar configuração do usuário
  return {
    provider: config.provider as any,
    abacusApiKey: config.abacusApiKey || process.env.ABACUSAI_API_KEY,
    anthropicApiKey: config.anthropicApiKey || undefined,
    openaiApiKey: config.openaiApiKey || undefined,
    chatbotModel: config.chatbotModel,
    memoriaModel: config.memoriaModel
  };
}

/**
 * Atualizar ou criar configuração de API para o usuário
 */
export async function updateLLMConfig(userId: string, config: Partial<LLMConfig>) {
  const existing = await prisma.aPIConfig.findFirst({
    where: { userId, isActive: true }
  });

  if (existing) {
    return await prisma.aPIConfig.update({
      where: { id: existing.id },
      data: {
        provider: config.provider,
        abacusApiKey: config.abacusApiKey,
        anthropicApiKey: config.anthropicApiKey,
        openaiApiKey: config.openaiApiKey,
        chatbotModel: config.chatbotModel,
        memoriaModel: config.memoriaModel,
        updatedAt: new Date()
      }
    });
  }

  return await prisma.aPIConfig.create({
    data: {
      userId,
      provider: config.provider || 'ABACUS_AI',
      abacusApiKey: config.abacusApiKey,
      anthropicApiKey: config.anthropicApiKey,
      openaiApiKey: config.openaiApiKey,
      chatbotModel: config.chatbotModel || 'claude-4-5-haiku-20250110',
      memoriaModel: config.memoriaModel || 'claude-4-5-sonnet-20250110',
      isActive: true
    }
  });
}
