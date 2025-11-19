
// Cliente unificado para Claude (Anthropic direto ou via Abacus.AI)
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { getLLMConfig } from './llm-config';

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeResponse {
  content: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
  model: string;
}

export interface ClaudeOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  thinking?: {
    type: 'enabled' | 'disabled';
    budget_tokens?: number;
  };
}

/**
 * Cliente Claude unificado - suporta Anthropic direto e Abacus.AI
 */
export class ClaudeClient {
  private anthropicClient?: Anthropic;
  private abacusClient?: OpenAI;
  private provider: 'ANTHROPIC' | 'ABACUS_AI';
  private config: any;

  constructor(config: {
    provider: 'ANTHROPIC' | 'ABACUS_AI';
    anthropicApiKey?: string;
    abacusApiKey?: string;
  }) {
    this.provider = config.provider;
    this.config = config;

    if (config.provider === 'ANTHROPIC' && config.anthropicApiKey) {
      this.anthropicClient = new Anthropic({
        apiKey: config.anthropicApiKey
      });
    } else if (config.provider === 'ABACUS_AI' && config.abacusApiKey) {
      // Abacus.AI usa formato compatível com OpenAI
      this.abacusClient = new OpenAI({
        baseURL: 'https://api.abacus.ai/v0/chat/llm',
        apiKey: config.abacusApiKey
      });
    } else {
      throw new Error('Invalid Claude client configuration');
    }
  }

  /**
   * Criar cliente Claude a partir da configuração do usuário
   */
  static async fromUserId(userId?: string): Promise<ClaudeClient> {
    const config = await getLLMConfig(userId);
    
    if (config.provider === 'ANTHROPIC' && config.anthropicApiKey) {
      return new ClaudeClient({
        provider: 'ANTHROPIC',
        anthropicApiKey: config.anthropicApiKey
      });
    }

    // Default: Abacus.AI
    return new ClaudeClient({
      provider: 'ABACUS_AI',
      abacusApiKey: config.abacusApiKey
    });
  }

  /**
   * Gerar resposta com Claude
   */
  async generate(
    messages: ClaudeMessage[],
    options: ClaudeOptions = {}
  ): Promise<ClaudeResponse> {
    const defaultOptions = {
      maxTokens: options.maxTokens || 4096,
      temperature: options.temperature || 0.7,
      model: options.model || 'claude-3-5-sonnet-20241022'
    };

    if (this.provider === 'ANTHROPIC' && this.anthropicClient) {
      return await this.generateWithAnthropic(messages, defaultOptions, options.thinking);
    } else if (this.provider === 'ABACUS_AI' && this.abacusClient) {
      return await this.generateWithAbacus(messages, defaultOptions);
    }

    throw new Error('No valid Claude client configured');
  }

  /**
   * Gerar com Anthropic direto (suporta extended thinking)
   */
  private async generateWithAnthropic(
    messages: ClaudeMessage[],
    options: any,
    thinking?: { type: 'enabled' | 'disabled'; budget_tokens?: number }
  ): Promise<ClaudeResponse> {
    const anthropicMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const requestParams: any = {
      model: options.model,
      max_tokens: options.maxTokens,
      temperature: options.temperature,
      messages: anthropicMessages
    };

    // Extended thinking (apenas para modelos 4.5+)
    if (thinking && thinking.type === 'enabled') {
      requestParams.thinking = {
        type: 'enabled',
        budget_tokens: thinking.budget_tokens || 10000
      };
    }

    const response = await this.anthropicClient!.messages.create(requestParams);

    return {
      content: response.content[0].type === 'text' ? response.content[0].text : '',
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens
      },
      model: response.model
    };
  }

  /**
   * Gerar com Abacus.AI (formato OpenAI)
   */
  private async generateWithAbacus(
    messages: ClaudeMessage[],
    options: any
  ): Promise<ClaudeResponse> {
    const openaiMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const response = await this.abacusClient!.chat.completions.create({
      model: options.model,
      messages: openaiMessages as any,
      max_tokens: options.maxTokens,
      temperature: options.temperature
    });

    const choice = response.choices[0];
    
    return {
      content: choice.message.content || '',
      usage: response.usage ? {
        input_tokens: response.usage.prompt_tokens,
        output_tokens: response.usage.completion_tokens
      } : undefined,
      model: response.model
    };
  }

  /**
   * Gerar com streaming (útil para UX em tempo real)
   */
  async *generateStream(
    messages: ClaudeMessage[],
    options: ClaudeOptions = {}
  ): AsyncGenerator<string, void, unknown> {
    const defaultOptions = {
      maxTokens: options.maxTokens || 4096,
      temperature: options.temperature || 0.7,
      model: options.model || 'claude-3-5-sonnet-20241022'
    };

    if (this.provider === 'ANTHROPIC' && this.anthropicClient) {
      const anthropicMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const stream = await this.anthropicClient.messages.stream({
        model: defaultOptions.model,
        max_tokens: defaultOptions.maxTokens,
        temperature: defaultOptions.temperature,
        messages: anthropicMessages
      });

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          yield event.delta.text;
        }
      }
    } else if (this.provider === 'ABACUS_AI' && this.abacusClient) {
      const openaiMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const stream = await this.abacusClient.chat.completions.create({
        model: defaultOptions.model,
        messages: openaiMessages as any,
        max_tokens: defaultOptions.maxTokens,
        temperature: defaultOptions.temperature,
        stream: true
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }
    }
  }
}

/**
 * Função helper para criar cliente Claude
 */
export async function createClaudeClient(userId?: string): Promise<ClaudeClient> {
  return await ClaudeClient.fromUserId(userId);
}
