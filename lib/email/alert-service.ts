import { prisma } from '@/lib/db';
import { loadAvisos } from '@/lib/aviso-loader';
import { runEligibilityCheck, LeadInput } from '@/lib/eligibility-engine';
import { resend, EMAIL_FROM } from './client';

export interface AlertResult {
    leadsProcessed: number;
    emailsSent: number;
    errors: number;
}

export async function checkNewAvisosCompatibility(): Promise<AlertResult> {
    console.log('[Alert Service] Starting compatibility check...');

    // 1. Load active avisos
    // In a real scenario, we would filter for avisos created/updated in the last X days
    const { avisos } = await loadAvisos();

    if (avisos.length === 0) {
        console.log('[Alert Service] No active avisos found.');
        return { leadsProcessed: 0, emailsSent: 0, errors: 0 };
    }

    // 2. Get subscribed leads
    const leads = await prisma.lead.findMany({
        where: { alertasAtivos: true }
    });

    console.log(`[Alert Service] Checking ${leads.length} subscribed leads against ${avisos.length} avisos...`);

    let emailsSent = 0;
    let errors = 0;

    for (const lead of leads) {
        try {
            // Prevent spam: Don't send if sent in last 24h
            if (lead.lastAlertSentAt && (Date.now() - lead.lastAlertSentAt.getTime() < 24 * 3600 * 1000)) {
                continue;
            }

            // Convert DB Lead to LeadInput for matching engine
            const leadInput: LeadInput = {
                nomeEmpresa: lead.nomeEmpresa || lead.nome,
                email: lead.email,
                distrito: lead.distrito || '',
                tipoProjetoDesejado: lead.tipoProjeto || '',
                cae: lead.cae || undefined,
                dimensao: lead.dimensaoDeclarada as any,
                investimentoEstimado: lead.investimentoVal || undefined,
                empregados: lead.empregados || undefined,
            };

            // Run matching
            const matches = await runEligibilityCheck(leadInput, avisos);

            // Filter for high confidence matches only for alerts
            const highQualityMatches = matches.filter(m => m.score >= 70);

            if (highQualityMatches.length > 0) {
                console.log(`[Alert Service] Found ${highQualityMatches.length} matches for ${lead.email}. Sending email...`);

                await sendAlertEmail(lead.email, lead.nome, highQualityMatches);

                // Update last sent timestmap
                await prisma.lead.update({
                    where: { id: lead.id },
                    data: { lastAlertSentAt: new Date() }
                });

                emailsSent++;
            }

        } catch (error) {
            console.error(`[Alert Service] Error processing lead ${lead.id}:`, error);
            errors++;
        }
    }

    return { leadsProcessed: leads.length, emailsSent, errors };
}

async function sendAlertEmail(to: string, nome: string, matches: any[]) {
    // Basic HTML template
    const matchesList = matches.map(m => `
        <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h3 style="margin: 0; color: #2563eb;">${m.avisoNome}</h3>
            <p style="margin: 5px 0; color: #64748b;">Confiança: <strong>${m.score}%</strong></p>
            <p style="margin: 5px 0;">${m.reasons.slice(0, 2).join(' • ')}</p>
            <div style="margin-top: 10px;">
                <a href="${m.link || '#'}" style="color: #2563eb; text-decoration: none; font-weight: 500;">Ver Aviso Oficial &rarr;</a>
            </div>
        </div>
    `).join('');

    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Novas Oportunidades Encontradas! 🎯</h2>
            <p>Olá ${nome},</p>
            <p>O nosso sistema encontrou <strong>${matches.length} novos avisos</strong> de fundos compatíveis com o perfil da sua empresa.</p>
            
            <div style="margin: 30px 0;">
                ${matchesList}
            </div>

            <p style="color: #64748b; font-size: 14px;">
                Para apoio na candidatura, agende uma reunião com os nossos especialistas.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />
            <p style="font-size: 12px; color: #94a3b8;">
                Recebeu este email porque ativou os alertas de fundos na TA Consulting.
            </p>
        </div>
    `;

    await resend.emails.send({
        from: EMAIL_FROM,
        to: to,
        subject: `🎯 ${matches.length} Novos Fundos Compatíveis Encontrados!`,
        html: html,
    });
}
