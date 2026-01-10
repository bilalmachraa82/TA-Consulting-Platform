/**
 * Daily Digest Cron Job
 * 
 * Runs daily at 8AM PT (configured in vercel.json)
 * Sends digest of new matching avisos to subscribed leads/users
 * 
 * GET /api/cron/daily-digest
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { runEligibilityCheck, type LeadInput, type AvisoCriteria } from '@/lib/eligibility-engine';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds max for Vercel

const resend = new Resend(process.env.RESEND_API_KEY);

// Verify cron secret for security
function verifyCronSecret(request: NextRequest): boolean {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Allow if no secret configured (dev mode)
    if (!cronSecret) return true;

    return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
    // Verify this is a legitimate cron call
    if (!verifyCronSecret(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Daily Digest] Starting cron job...');
    const startTime = Date.now();

    try {
        // 1. Fetch leads/users with alert preferences enabled
        const subscribedLeads = await prisma.lead.findMany({
            where: {
                receberAlertas: true,
                email: { not: '' },
            },
            select: {
                id: true,
                email: true,
                nomeEmpresa: true,
                distrito: true,
                tipoProjetoDesejado: true,
                cae: true,
                dimensao: true,
            },
        });

        console.log(`[Daily Digest] Found ${subscribedLeads.length} subscribed leads`);

        if (subscribedLeads.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No subscribed leads to process',
                processed: 0
            });
        }

        // 2. Fetch avisos created/updated in last 24h
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const newAvisos = await prisma.aviso.findMany({
            where: {
                ativo: true,
                dataFimSubmissao: { gte: new Date() },
                OR: [
                    { createdAt: { gte: yesterday } },
                    { updatedAt: { gte: yesterday } },
                ],
            },
            select: {
                id: true,
                nome: true,
                portal: true,
                programa: true,
                dataFimSubmissao: true,
                link: true,
                taxa: true,
                dimensaoEmpresa: true,
                regioesElegiveis: true,
            },
        });

        console.log(`[Daily Digest] Found ${newAvisos.length} new/updated avisos`);

        if (newAvisos.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No new avisos in last 24h',
                processed: 0
            });
        }

        // Convert to AvisoCriteria format
        const avisosWithCriteria: AvisoCriteria[] = newAvisos.map(aviso => ({
            id: aviso.id,
            nome: aviso.nome,
            portal: aviso.portal,
            programa: aviso.programa || '',
            dataFimSubmissao: aviso.dataFimSubmissao,
            link: aviso.link || undefined,
            taxa: aviso.taxa || undefined,
            criterios: {
                dimensao: aviso.dimensaoEmpresa ? [aviso.dimensaoEmpresa] : undefined,
                regioes: aviso.regioesElegiveis?.split(',').map((r: string) => r.trim()),
            },
        }));

        // 3. For each lead, find matches and send digest
        let emailsSent = 0;
        let errors = 0;

        for (const lead of subscribedLeads) {
            try {
                const leadInput: LeadInput = {
                    nomeEmpresa: lead.nomeEmpresa,
                    email: lead.email,
                    distrito: lead.distrito || 'Lisboa',
                    tipoProjetoDesejado: lead.tipoProjetoDesejado || 'inovacao',
                    cae: lead.cae || undefined,
                    dimensao: (lead.dimensao as 'MICRO' | 'PEQUENA' | 'MEDIA' | 'GRANDE') || undefined,
                };

                const matches = await runEligibilityCheck(leadInput, avisosWithCriteria);

                // Only send if there are matches with score >= 60
                const goodMatches = matches.filter(m => m.score >= 60);

                if (goodMatches.length > 0) {
                    await sendDigestEmail(lead.email, lead.nomeEmpresa, goodMatches.slice(0, 5));
                    emailsSent++;
                    console.log(`[Daily Digest] Sent to ${lead.email} with ${goodMatches.length} matches`);
                }
            } catch (e: any) {
                console.error(`[Daily Digest] Error processing lead ${lead.email}:`, e.message);
                errors++;
            }
        }

        const duration = Date.now() - startTime;
        console.log(`[Daily Digest] Completed in ${duration}ms. Emails: ${emailsSent}, Errors: ${errors}`);

        return NextResponse.json({
            success: true,
            processed: subscribedLeads.length,
            newAvisos: newAvisos.length,
            emailsSent,
            errors,
            durationMs: duration,
        });

    } catch (error: any) {
        console.error('[Daily Digest] Cron job failed:', error);
        return NextResponse.json(
            { error: 'Cron job failed', details: error.message },
            { status: 500 }
        );
    }
}

async function sendDigestEmail(email: string, empresaNome: string, matches: any[]): Promise<void> {
    const matchesHtml = matches.map(m => `
        <div style="padding: 16px; background: #f8fafc; border-radius: 8px; margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="font-size: 12px; color: #3b82f6; font-weight: 500;">${m.portal}</span>
                <span style="font-size: 14px; color: #22c55e; font-weight: bold;">${m.score}%</span>
            </div>
            <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #1e293b;">${m.avisoNome}</h3>
            <p style="margin: 0; font-size: 14px; color: #64748b;">
                ${m.diasRestantes > 0 ? `⏰ ${m.diasRestantes} dias restantes` : '❌ Encerrado'}
            </p>
            ${m.link ? `<a href="${m.link}" style="display: inline-block; margin-top: 12px; color: #3b82f6; text-decoration: none; font-size: 14px;">Ver detalhes →</a>` : ''}
        </div>
    `).join('');

    await resend.emails.send({
        from: 'TA Consulting <alertas@taconsulting.pt>',
        to: email,
        subject: `🎯 ${matches.length} Novo${matches.length > 1 ? 's' : ''} Fundo${matches.length > 1 ? 's' : ''} para ${empresaNome}`,
        html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 32px; border-radius: 12px 12px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">📊 Daily Digest</h1>
                    <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0;">Novos fundos compatíveis com ${empresaNome}</p>
                </div>
                
                <div style="padding: 24px; background: white; border: 1px solid #e2e8f0; border-top: none;">
                    <p style="color: #475569; margin-bottom: 24px;">
                        Encontrámos <strong>${matches.length} oportunidade${matches.length > 1 ? 's' : ''}</strong> que podem ser relevantes para o seu perfil:
                    </p>
                    
                    ${matchesHtml}
                    
                    <div style="margin-top: 24px; text-align: center;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://ta-consulting.pt'}/dashboard" 
                           style="display: inline-block; background: #2563eb; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 500;">
                            Ver Todos os Avisos
                        </a>
                    </div>
                </div>
                
                <div style="padding: 16px; text-align: center; color: #94a3b8; font-size: 12px;">
                    <p style="margin: 0;">TA Consulting - Alertas Automáticos</p>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://ta-consulting.pt'}/unsubscribe?email=${encodeURIComponent(email)}" style="color: #94a3b8;">Cancelar subscrição</a>
                </div>
            </div>
        `
    });
}
