/**
 * Cliente LLM partilhado — OpenAI-compatível via OpenRouter (decisão 2026-07-20:
 * créditos pré-pagos = tecto financeiro; gateway trocável por env, zero lock-in).
 *
 * Suporta JSON mode e tool-calling. Usado pelo assistente de avisos
 * (lib/chatbot/) e pelo lead-chat público.
 */

import axios from 'axios';

const BASE_URL = process.env.LLM_BASE_URL || 'https://openrouter.ai/api/v1';
const DEFAULT_MODEL = process.env.LLM_MODEL || 'google/gemini-2.5-flash';

export interface ToolCall {
    id: string;
    type: 'function';
    function: { name: string; arguments: string };
}

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string | null;
    tool_calls?: ToolCall[];
    tool_call_id?: string;
}

export interface ToolDefinition {
    type: 'function';
    function: {
        name: string;
        description: string;
        parameters: Record<string, unknown>;
    };
}

export interface ChatCompletionOptions {
    messages: ChatMessage[];
    tools?: ToolDefinition[];
    jsonMode?: boolean;
    temperature?: number;
    maxTokens?: number;
    model?: string;
}

export interface ChatCompletionResult {
    message: ChatMessage;
    tokensIn: number;
    tokensOut: number;
}

export function llmConfigured(): boolean {
    return Boolean(process.env.OPENROUTER_API_KEY);
}

export async function chatCompletion(opts: ChatCompletionOptions): Promise<ChatCompletionResult> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        throw new Error('OPENROUTER_API_KEY não configurada — corre scripts/update-ai-keys.sh');
    }

    const response = await axios.post(
        `${BASE_URL}/chat/completions`,
        {
            model: opts.model || DEFAULT_MODEL,
            messages: opts.messages,
            ...(opts.tools ? { tools: opts.tools } : {}),
            ...(opts.jsonMode ? { response_format: { type: 'json_object' } } : {}),
            temperature: opts.temperature ?? 0.3,
            max_tokens: opts.maxTokens ?? 1500,
        },
        {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://ta-consulting-platform.vercel.app',
                'X-Title': 'Eligivo Platform',
            },
            timeout: 60000,
        },
    );

    const choice = response.data?.choices?.[0];
    if (!choice?.message) {
        throw new Error('Resposta LLM sem message');
    }

    return {
        message: choice.message as ChatMessage,
        tokensIn: Number(response.data?.usage?.prompt_tokens ?? 0),
        tokensOut: Number(response.data?.usage?.completion_tokens ?? 0),
    };
}
