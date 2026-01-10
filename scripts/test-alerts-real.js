/**
 * Test Script for Email Alert Service
 * Run with: node scripts/test-alerts-real.js
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Resend } = require('resend');

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

async function testAlerts() {
    console.log('🚀 Starting Email Alert Test...');

    try {
        // 1. Get a test lead (or create one)
        let lead = await prisma.lead.findFirst({
            where: { email: 'bilal@ta-consulting.pt' } // Adjusted to user's domain if possible
        });

        if (!lead) {
            console.log('Creating test lead...');
            lead = await prisma.lead.create({
                data: {
                    email: 'bilal@ta-consulting.pt',
                    nif: '500123456', // Added missing required field
                    nome: 'Bilal Teste',
                    nomeEmpresa: 'TA Consulting Demo',
                    alertasAtivos: true,
                    tipoProjeto: 'Digitalização',
                    distrito: 'Lisboa'
                }
            });
        }

        console.log(`Using lead: ${lead.email}`);

        // 2. Load some avisos
        const avisos = await prisma.aviso.findMany({
            where: { ativo: true },
            take: 3
        });

        console.log(`Loaded ${avisos.length} avisos for matching.`);

        // 3. Simple Mock of the matching logic (to avoid typescript/path issues in JS script)
        const matches = avisos.map(a => ({
            avisoNome: a.nome,
            score: 95,
            reasons: ['Compatibilidade com CAE', 'Região Lisboa abrangida'],
            link: 'https://portugal2030.pt'
        }));

        // 4. Send Email via Resend
        console.log('Sending test email via Resend...');

        const matchesList = matches.map(m => `
            <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h3 style="margin: 0; color: #8B5CF6;">${m.avisoNome}</h3>
                <p style="margin: 5px 0; color: #64748b;">Confiança: <strong>${m.score}%</strong></p>
                <p style="margin: 5px 0;">${m.reasons.join(' • ')}</p>
            </div>
        `).join('');

        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #8B5CF6;">🎯 Teste de Alertas TA Platform</h2>
                <p>Olá ${lead.nome},</p>
                <p>Este é um email de teste real do sistema de alertas.</p>
                <div style="margin: 30px 0;">${matchesList}</div>
                <hr style="border: none; border-top: 1px solid #e0e0e0;" />
                <p style="font-size: 12px; color: #94a3b8;">Sistema de Verificação E2E - AiParaTi</p>
            </div>
        `;

        const { data, error } = await resend.emails.send({
            from: 'TA Platform <noreply@ta-consulting-platfo-tfdltj.abacusai.app>',
            to: lead.email,
            subject: '🎯 Teste Real: Alerta de Fundos (E2E Verification)',
            html: html
        });

        if (error) {
            console.error('❌ Resend Error:', error);
        } else {
            console.log('✅ Email sent successfully! ID:', data.id);
        }

    } catch (err) {
        console.error('❌ Test failed:', err);
    } finally {
        await prisma.$disconnect();
    }
}

testAlerts();
