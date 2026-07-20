/**
 * Assistente interno de avisos — tool-calling sobre a BD fresca.
 *
 * Reescrito 2026-07-20 (implementação da decisão RAG + requisitos de segurança
 * da revisão externa): o modelo não recebe dumps da BD nem executa SQL — invoca
 * ferramentas tipadas com validação zod e limites duros (lib/chatbot/tools.ts).
 * Substitui a versão anterior (dump de 50 avisos + Abacus stream), que estava
 * órfã de frontend e pendurada em chaves mortas.
 *
 * POST /api/chatbot
 * Body: { message: string, conversationHistory?: [{ role: 'user'|'assistant', content: string }] }
 * Resposta: { success, answer, citations: [{ codigo, nome, portal, link, prazo }] }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limiter';
import { runAssistant } from '@/lib/chatbot/assistant';
import { llmConfigured } from '@/lib/llm-client';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const RequestSchema = z.object({
    message: z.string().min(1, 'Mensagem é obrigatória').max(5000, 'Mensagem demasiado longa'),
    conversationHistory: z
        .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().max(5000) }))
        .max(20)
        .optional()
        .default([]),
});

export async function POST(request: NextRequest) {
    try {
        const clientIP = getClientIP(request);
        const rateCheck = checkRateLimit(`chatbot:${clientIP}`, RATE_LIMITS.CHATBOT);
        if (!rateCheck.success) {
            return NextResponse.json(
                { error: 'Too Many Requests', retryAfter: rateCheck.resetIn },
                { status: 429, headers: { 'Retry-After': rateCheck.resetIn.toString() } },
            );
        }

        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!llmConfigured()) {
            return NextResponse.json(
                { error: 'Assistente indisponível: chave LLM não configurada.' },
                { status: 503 },
            );
        }

        const parseResult = RequestSchema.safeParse(await request.json());
        if (!parseResult.success) {
            return NextResponse.json(
                { error: 'Validação falhou', details: parseResult.error.flatten().fieldErrors },
                { status: 400 },
            );
        }

        const { message, conversationHistory } = parseResult.data;
        const result = await runAssistant(message, conversationHistory);

        return NextResponse.json({
            success: true,
            answer: result.answer,
            citations: result.citations,
            meta: { toolCalls: result.toolCallsUsed, tokens: result.tokensIn + result.tokensOut },
        });
    } catch (error: unknown) {
        console.error('[Chatbot] erro:', error);
        return NextResponse.json(
            { error: 'Erro interno do assistente' },
            { status: 500 },
        );
    }
}
