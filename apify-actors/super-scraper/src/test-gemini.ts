/**
 * Test script for Gemini Flash-Lite extraction
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;

    console.log('=== TESTE GEMINI FLASH-LITE ===');
    console.log('API Key:', apiKey ? `Configurada (${apiKey.slice(0, 15)}...)` : 'NÃO CONFIGURADA');

    if (!apiKey || apiKey.includes('placeholder') || apiKey.includes('GHKGHK')) {
        console.log('❌ ERROR: API key inválida ou placeholder');
        return;
    }

    // 1. Fetch a real aviso HTML
    console.log('\n1. Fetching aviso PT2030...');
    const resp = await axios.get(
        'https://portugal2030.pt/aviso-2024/capacitacao-da-rede-nacional-de-acolhimento-de-requerentes-e-beneficiarios-de-protecao-internacional/',
        { headers: { 'User-Agent': 'Mozilla/5.0' } }
    );

    const html = resp.data.slice(0, 20000);
    console.log(`   HTML: ${html.length} chars`);

    // 2. Test Gemini
    console.log('\n2. Chamando Gemini Flash-Lite...');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

    const prompt = `Analisa este HTML de um aviso de fundos e extrai em JSON:
- canal_submissao: onde submeter candidaturas
- pre_requisitos: lista de 3-5 requisitos principais

HTML (truncado):
${html.slice(0, 8000)}

Responde APENAS com JSON válido.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    console.log('\n3. Resposta Gemini:');
    console.log(text.slice(0, 800));

    // 3. Parse JSON
    try {
        const json = JSON.parse(text);
        console.log('\n4. ✅ JSON parseado com sucesso!');
        console.log('   Canal:', json.canal_submissao || 'N/A');
        console.log('   Requisitos:', (json.pre_requisitos || []).length);
    } catch (e) {
        console.log('\n4. ⚠️ Resposta não é JSON puro (normal para alguns modelos)');
    }

    console.log('\n=== TESTE CONCLUÍDO ===');
}

testGemini().catch(e => {
    console.error('ERROR:', e.message);
    process.exit(1);
});
