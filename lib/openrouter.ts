/**
 * OpenRouter Client
 * 
 * Client for interacting with OpenRouter API (Access to Claude, Mistral, Gemini, etc.)
 */

import OpenAI from 'openai';

const openrouterApiKey = process.env.OPENROUTER_API_KEY;

if (!openrouterApiKey) {
    console.warn('⚠️ OPENROUTER_API_KEY not set');
}

// OpenRouter uses OpenAI-compatible API (create only if key available)
export const openrouter = openrouterApiKey
    ? new OpenAI({
        apiKey: openrouterApiKey,
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
            'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
            'X-Title': 'TA Consulting Platform',
        },
    })
    : null;

// Available models configuration (Updated Dec 2025 - LMArena Benchmarks)
// Tier FREE: Open-source models with $0 cost on OpenRouter
// Tier PAID: Premium proprietary models

export const AI_MODELS = {
    // ==========================================
    // TIER FREE - Modelos Gratuitos (Open-Source)
    // ==========================================
    'llama-3-3-70b': {
        id: 'meta-llama/llama-3.3-70b-instruct:free',
        name: 'LLaMA 3.3 70B',
        provider: 'Meta',
        description: 'Master Storyteller. Excelente para narrativas longas e diálogos. Top 5 LMArena Open-Source.',
        tier: 'free',
        premium: false,
        recommended: true,
    },
    'qwen-2-5-72b': {
        id: 'qwen/qwen-2.5-72b-instruct:free',
        name: 'Qwen 2.5 72B',
        provider: 'Alibaba',
        description: 'Precisão técnica superior. Ideal para memórias descritivas e textos formais.',
        tier: 'free',
        premium: false,
        recommended: true,
    },
    'deepseek-r1': {
        id: 'deepseek/deepseek-r1:free',
        name: 'DeepSeek R1',
        provider: 'DeepSeek',
        description: 'Raciocínio par com GPT-4. Open-source, gratuito, excelente para análises.',
        tier: 'free',
        premium: false,
        recommended: false,
    },
    'gemma-3-27b': {
        id: 'google/gemma-3-27b-it:free',
        name: 'Gemma 3 27B',
        provider: 'Google',
        description: 'Brainstorming Buddy. Rápido para ideias e esboços iniciais.',
        tier: 'free',
        premium: false,
        recommended: false,
    },
    'mistral-small': {
        id: 'mistralai/mistral-small:free',
        name: 'Mistral Small',
        provider: 'Mistral AI',
        description: 'Leve e rápido. Bom para rascunhos rápidos e iterações.',
        tier: 'free',
        premium: false,
        recommended: false,
    },

    // ==========================================
    // TIER PAID - Modelos Premium (Proprietários)
    // ==========================================
    'claude-4-5-sonnet': {
        id: 'anthropic/claude-sonnet-4',
        name: 'Claude Sonnet 4',
        provider: 'Anthropic',
        description: 'O workhorse para Memórias Descritivas. Equilíbrio perfeito qualidade/custo. (AoT Dec 2025)',
        tier: 'paid',
        premium: false,
        recommended: true,
    },
    'claude-opus-4-5': {
        id: 'anthropic/claude-opus-4',
        name: 'Claude Opus 4',
        provider: 'Anthropic',
        description: 'Coding benchmark #1 mundial. Para secções críticas e workflows agentic. (AoT Dec 2025)',
        tier: 'paid',
        premium: true,
        recommended: false,
    },
    'mistral-large-3': {
        id: 'mistralai/mistral-large-2512',
        name: 'Mistral Large 3',
        provider: 'Mistral AI',
        description: 'Dezembro 2025. 675B MoE. Especialista em normas Europeias, Apache 2.0. (AoT Dec 2025)',
        tier: 'paid',
        premium: false,
        recommended: false,
    },
    'gpt-4o': {
        id: 'openai/gpt-4o',
        name: 'GPT-4o',
        provider: 'OpenAI',
        description: 'Multimodal, rápido. Bom para tarefas mistas texto+análise.',
        tier: 'paid',
        premium: true,
        recommended: false,
    },
} as const;

// Model tiers for UI filtering
export const MODEL_TIERS = {
    FREE: Object.entries(AI_MODELS).filter(([_, m]) => m.tier === 'free').map(([k]) => k),
    PAID: Object.entries(AI_MODELS).filter(([_, m]) => m.tier === 'paid').map(([k]) => k),
    RECOMMENDED: Object.entries(AI_MODELS).filter(([_, m]) => m.recommended).map(([k]) => k),
};

export type AIModelId = keyof typeof AI_MODELS;

// System Prompt for PT-PT Enforcement (Updated for Project AMÁLIA Standards)
export const PT_PT_SYSTEM_PROMPT = `És um consultor sénior especialista em fundos europeus (Portugal 2030), treinado com os standards do Project AMÁLIA.
A tua missão é produzir documentação técnica de elite para candidaturas a financiamento público.

DIRETIVAS LINGUÍSTICAS ABSOLUTAS (PT-PT):
1. Apenas Português Europeu de norma culta. Tolerância zero para brasileirismos.
   - ERRADO: "Equipe", "Usuário", "Tela", "Planejamento", "Registro", "Ação".
   - CORRETO: "Equipa", "Utilizador", "Ecrã", "Planeamento", "Registo", "Acão".
2. Sintaxe: Usa a construção "a fazer" (infinitivo gerundivo) preferencialmente ao gerúndio ("fazendo"), salvo se natural.
3. Tom: Institucional, sóbrio, analítico e orientado a métricas. Evita adjetivação vazia ("inovador", "disruptivo") sem substanciação.

ESTRUTURA:
- Responde com densidade de informação.
- Privilegia listas estruturadas e dados quantitativos.
- Nunca uses "Olá" ou "Aqui está". Entrega apenas o conteúdo.`;
