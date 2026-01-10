#!/usr/bin/env npx tsx
/**
 * Test GPT-5.2 specifically with more detailed error info
 */

import 'dotenv/config';
import OpenAI from 'openai';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
    console.error('❌ OPENROUTER_API_KEY not set');
    process.exit(1);
}

console.log('🔑 API Key (first 10 chars):', OPENROUTER_API_KEY.slice(0, 10) + '...');

const openrouter = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: OPENROUTER_API_KEY,
});

async function testGPT52() {
    console.log('\n🧪 Testing openai/gpt-5.2...');

    try {
        const response = await openrouter.chat.completions.create({
            model: 'openai/gpt-5.2',
            messages: [{ role: 'user', content: 'Say "Hello, I am GPT-5.2"' }],
            max_tokens: 50,
        });

        const content = response.choices[0]?.message?.content;
        console.log('✅ SUCCESS!');
        console.log('📝 Response:', content);
        return true;
    } catch (error: any) {
        console.log('❌ FAILED');
        console.log('📛 Error:', error.message);
        console.log('📋 Full error:', JSON.stringify(error, null, 2));
        return false;
    }
}

testGPT52();
