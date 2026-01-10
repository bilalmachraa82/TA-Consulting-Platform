#!/usr/bin/env npx tsx
/**
 * Test all 4 council models - FINAL CONFIG
 */

import 'dotenv/config';
import OpenAI from 'openai';

const openrouter = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY!,
});

// FINAL models as requested by user
const MODELS = [
    { agent: '🔵 Estratega', model: 'openai/gpt-5.2' },
    { agent: '🟢 Advogado/Moderador', model: 'anthropic/claude-opus-4.5' },
    { agent: '🟠 Técnico', model: 'google/gemini-3-pro-preview' },
    { agent: '🔴 Devil\'s Advocate', model: 'z-ai/glm-4.7' },
];

async function main() {
    console.log('🧪 Testing ALL Council Models\n' + '═'.repeat(50));

    let allPassed = true;

    for (const { agent, model } of MODELS) {
        console.log(`\n${agent}: ${model}`);
        try {
            const r = await openrouter.chat.completions.create({
                model,
                messages: [{ role: 'user', content: 'Reply with OK' }],
                max_tokens: 10,
            });
            console.log(`   ✅ ${r.choices[0]?.message?.content || 'OK'}`);
        } catch (e: any) {
            console.log(`   ❌ ${e.message}`);
            allPassed = false;
        }
    }

    console.log('\n' + '═'.repeat(50));
    console.log(allPassed ? '🎉 ALL MODELS READY!' : '⚠️ FIX ERRORS ABOVE');
    process.exit(allPassed ? 0 : 1);
}

main();
