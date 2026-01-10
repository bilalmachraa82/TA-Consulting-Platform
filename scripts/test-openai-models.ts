#!/usr/bin/env npx tsx
/**
 * Test OpenAI models on OpenRouter
 */
import 'dotenv/config';
import OpenAI from 'openai';

const or = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY
});

const models = ['openai/gpt-5', 'openai/o1', 'openai/o1-preview', 'openai/gpt-4o', 'openai/o3-mini'];

async function test() {
    for (const m of models) {
        try {
            const r = await or.chat.completions.create({
                model: m,
                messages: [{ role: 'user', content: 'Say OK' }],
                max_tokens: 5
            });
            console.log('✅', m, '-', r.choices[0]?.message?.content?.slice(0, 20));
        } catch (e: any) {
            console.log('❌', m, '-', e.message?.slice(0, 60));
        }
    }
}

test();
