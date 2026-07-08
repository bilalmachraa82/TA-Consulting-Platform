const DEFAULT_TIMEOUT_MS = 30_000;

interface ClaudeTextRequest {
  system: string;
  prompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
}

interface AnthropicTextBlock {
  type: string;
  text?: string;
}

interface AnthropicMessageResponse {
  content?: AnthropicTextBlock[];
}

const DEFAULT_MODEL = process.env.ANTHROPIC_DEFAULT_MODEL || 'claude-sonnet-4-6';

export function extractJsonObject<T>(content: string): T {
  const trimmed = content.trim();
  const fenceMatch = trimmed.match(/```json\s*([\s\S]*?)```/i) || trimmed.match(/```\s*([\s\S]*?)```/i);
  const candidate = fenceMatch?.[1]?.trim() || trimmed.slice(trimmed.indexOf('{'), trimmed.lastIndexOf('}') + 1);

  return JSON.parse(candidate) as T;
}

export function isClaudeConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export async function generateClaudeText(request: ClaudeTextRequest): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY não configurada');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: request.model || DEFAULT_MODEL,
      max_tokens: request.maxTokens || 1200,
      temperature: request.temperature ?? 0.2,
      system: request.system,
      messages: [
        {
          role: 'user',
          content: request.prompt,
        },
      ],
    }),
    signal: AbortSignal.timeout(request.timeoutMs ?? DEFAULT_TIMEOUT_MS),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${errorBody}`);
  }

  const payload = (await response.json()) as AnthropicMessageResponse;
  const text = (payload.content || [])
    .filter((block) => block.type === 'text' && block.text)
    .map((block) => block.text)
    .join('\n')
    .trim();

  if (!text) {
    throw new Error('Anthropic API devolveu resposta vazia');
  }

  return text;
}

export async function generateClaudeJson<T>(request: ClaudeTextRequest): Promise<T> {
  const text = await generateClaudeText(request);
  try {
    return extractJsonObject<T>(text);
  } catch (error) {
    console.error('[claude-direct] JSON parse falhou. Raw:', text.slice(0, 500));
    throw error;
  }
}
