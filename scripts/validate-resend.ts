/**
 * Resend API Key Validation Script
 * 
 * Usage: npx tsx scripts/validate-resend.ts
 * 
 * Tests:
 * 1. API Key is valid and can authenticate
 * 2. Sends a test email to verify domain setup
 */

import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const TEST_EMAIL = process.env.RESEND_TEST_EMAIL || 'delivered@resend.dev'; // Resend's test sink

async function validateResend() {
    console.log('🔍 TA Consulting - Resend Validation Script\n');
    console.log('═'.repeat(50));

    // 1. Check if key is set and not placeholder
    if (!RESEND_API_KEY || RESEND_API_KEY.includes('placeholder') || RESEND_API_KEY === 're_xxx') {
        console.error('❌ RESEND_API_KEY not configured or is a placeholder.');
        console.log('\n📝 To fix:');
        console.log('   1. Go to https://resend.com/api-keys');
        console.log('   2. Create a new API key');
        console.log('   3. Update .env with: RESEND_API_KEY=re_your_real_key\n');
        process.exit(1);
    }

    console.log('✅ RESEND_API_KEY found (starts with:', RESEND_API_KEY.slice(0, 10) + '...)');

    // 2. Initialize client
    const resend = new Resend(RESEND_API_KEY);

    // 3. Try to send a test email
    console.log('\n📧 Attempting to send test email to:', TEST_EMAIL);

    try {
        const { data, error } = await resend.emails.send({
            from: 'TA Consulting <onboarding@resend.dev>',
            to: TEST_EMAIL,
            subject: '✅ TA Consulting - Email System Test',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>🎯 Sistema de Emails Operacional!</h2>
                    <p>Este email confirma que o sistema de alertas da TA Consulting está funcional.</p>
                    <p style="color: #64748b; font-size: 12px;">Timestamp: ${new Date().toISOString()}</p>
                </div>
            `,
        });

        if (error) {
            console.error('❌ Resend API Error:', error);
            console.log('\n📝 Common issues:');
            console.log('   - Invalid API key');
            console.log('   - Domain not verified (for custom FROM addresses)');
            console.log('   - Rate limit exceeded\n');
            process.exit(1);
        }

        console.log('✅ Email sent successfully!');
        console.log('   ID:', data?.id);
        console.log('\n═'.repeat(50));
        console.log('🚀 RESEND SYSTEM: OPERATIONAL');
        console.log('═'.repeat(50));

    } catch (err) {
        console.error('❌ Unexpected error:', err);
        process.exit(1);
    }
}

validateResend();
