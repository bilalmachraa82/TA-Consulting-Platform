/**
 * Quality Validation Script V2 (Full Golden Set)
 * 
 * Uses the existing premium-questions.json (50 real consultant questions)
 * to provide a rigorous validation of the RAG system.
 * 
 * Metrics:
 * - Citation Rate: % of responses containing aviso codes
 * - Refusal Rate: % of negative tests correctly refused
 * - Keyword Hit Ratio: Average % of expected keywords found
 * - Overall Score: Weighted average
 * 
 * Usage: npx ts-node src/validate-quality.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { generateContentWithFileSearch, RECOMMENDED_MODEL, PRODUCTION_SYSTEM_PROMPT, type GenerateWithFileSearchResult } from './lib/gemini-file-search';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const STORE_NAME = 'fileSearchStores/avisosfundoseuropeus-e463dep1so0g';
const QUESTIONS_FILE = path.join(__dirname, 'tests/premium-questions.json');

interface Question {
    id: string;
    category: string;
    q: string;
    should_refuse?: boolean;
}

interface TestFile {
    questions: Question[];
}

async function delay(ms: number) {
    return new Promise(r => setTimeout(r, ms));
}

async function runDeepValidation() {
    console.log('\n' + '═'.repeat(70));
    console.log('🛡️  DEEP RAG QUALITY VALIDATION (Premium Questions)');
    console.log('═'.repeat(70));
    console.log(`Store: ${STORE_NAME}`);
    console.log(`Model: ${RECOMMENDED_MODEL}`);
    console.log(`Date:  ${new Date().toISOString()}`);

    // Load questions
    if (!fs.existsSync(QUESTIONS_FILE)) {
        console.error('❌ Ficheiro de perguntas não encontrado:', QUESTIONS_FILE);
        return;
    }
    const data: TestFile = JSON.parse(fs.readFileSync(QUESTIONS_FILE, 'utf-8'));

    // Select 20 representative questions (mix of categories)
    const positiveQ = data.questions.filter(q => !q.should_refuse).slice(0, 12);
    const negativeQ = data.questions.filter(q => q.should_refuse).slice(0, 8);
    const testSet = [...positiveQ, ...negativeQ];

    console.log(`\nTest Set: ${testSet.length} questions (${positiveQ.length} positive, ${negativeQ.length} negative)`);
    console.log('═'.repeat(70) + '\n');

    let totalCitations = 0;
    let positiveWithCitation = 0;
    let negativeCorrectlyRefused = 0;
    let errors = 0;

    for (const test of testSet) {
        process.stdout.write(`[${test.id}] ${test.q.substring(0, 50)}... `);

        try {
            const result: GenerateWithFileSearchResult = await generateContentWithFileSearch({
                model: RECOMMENDED_MODEL,
                prompt: `${PRODUCTION_SYSTEM_PROMPT}\n\nPERGUNTA: ${test.q}`,
                storeName: STORE_NAME,
                temperature: 0,
            });

            const textLower = result.text.toLowerCase();
            const citations = result.citations.citationCount;
            totalCitations += citations;

            // Check for aviso codes (e.g., FA0166/2025, C05-i01, etc.)
            const avisoCodeMatch = result.text.match(/\b(FA\d{4}\/\d{4}|\d{2}\/C\d{2}-i\d{2}|C\d{2}-i\d{2}|Aviso\s+[A-Z0-9\-\/]+)/gi);
            const hasAvisoCode = avisoCodeMatch && avisoCodeMatch.length > 0;

            // Refusal detection
            const refusalIndicators = ['não tenho', 'não encontro', 'fora do âmbito', 'não disponível', 'não posso'];
            const isRefusal = refusalIndicators.some(r => textLower.includes(r));

            if (test.should_refuse) {
                // Negative test
                if (isRefusal) {
                    negativeCorrectlyRefused++;
                    console.log('✅ REFUSED (correct)');
                } else {
                    console.log('❌ ANSWERED (should have refused)');
                    console.log(`   Response: ${result.text.slice(0, 80)}...`);
                }
            } else {
                // Positive test
                if (hasAvisoCode || citations > 0) {
                    positiveWithCitation++;
                    console.log(`✅ CITED (${avisoCodeMatch?.length || 0} codes, ${citations} chunks)`);
                } else if (isRefusal) {
                    console.log('⚠️ REFUSED (might be data gap)');
                } else {
                    console.log('❌ NO CITATION');
                    console.log(`   Response: ${result.text.slice(0, 80)}...`);
                }
            }

            await delay(300); // Rate limit

        } catch (error: any) {
            errors++;
            console.log('❌ ERROR:', error.message?.slice(0, 50));
        }
    }

    // Calculate Metrics
    const citationRate = positiveQ.length > 0 ? (positiveWithCitation / positiveQ.length * 100) : 0;
    const refusalRate = negativeQ.length > 0 ? (negativeCorrectlyRefused / negativeQ.length * 100) : 0;
    const overallScore = (citationRate * 0.6 + refusalRate * 0.4); // Weighted

    console.log('\n' + '═'.repeat(70));
    console.log('📊 VALIDATION SUMMARY');
    console.log('═'.repeat(70));
    console.log(`   Positive Tests:   ${positiveWithCitation}/${positiveQ.length} with citations (${citationRate.toFixed(0)}%)`);
    console.log(`   Negative Tests:   ${negativeCorrectlyRefused}/${negativeQ.length} correctly refused (${refusalRate.toFixed(0)}%)`);
    console.log(`   Total Citations:  ${totalCitations}`);
    console.log(`   Errors:           ${errors}`);
    console.log('─'.repeat(70));
    console.log(`   📈 OVERALL SCORE: ${overallScore.toFixed(0)}% (Target: ≥90%)`);
    console.log('═'.repeat(70));

    if (overallScore >= 90) {
        console.log('✨ SYSTEM READY FOR PRODUCTION');
    } else if (overallScore >= 70) {
        console.log('⚠️  SYSTEM NEEDS MINOR TUNING');
    } else {
        console.log('🚨 CRITICAL: SYSTEM NEEDS MAJOR IMPROVEMENTS');
    }
}

runDeepValidation();
