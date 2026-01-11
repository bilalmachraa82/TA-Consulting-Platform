
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/db';
import { resend } from '@/lib/email/client';
import { LEAD_NURTURING_SEQUENCE } from '@/lib/email/drip-sequences';
import { LeadWelcomeTemplate } from '@/components/email-templates/lead-welcome';
import { LeadReminderTemplate } from '@/components/email-templates/lead-reminder';
import { LeadOfferTemplate } from '@/components/email-templates/lead-offer';
import { LeadEducationalTemplate } from '@/components/email-templates/lead-educational';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const leads = await prisma.lead.findMany({
            where: {
                convertedAt: null,
                unsubscribedAt: null,
                consentMarketing: true,
            },
        });

        let emailsSent = 0;

        for (const lead of leads) {
            // Determinar próximo passo na sequência
            const now = new Date().getTime();
            const createdAt = new Date(lead.createdAt).getTime();
            const timeSinceCreation = now - createdAt;

            // Encontrar o email correto para enviar
            for (const step of LEAD_NURTURING_SEQUENCE) {
                // Se já recebeu este passo (ou um posterior), saltar
                // Simplificação: assumimos que lastDripEmailId guarda o último ID enviado
                // Precisaríamos de lógica mais complexa para saber a ordem exacta se não for linear, 
                // mas aqui assumimos linearidade baseada no delay.

                // Verifica se o tempo decorrido é suficiente
                if (timeSinceCreation < step.delay) continue;

                // Verifica se já enviámos este email específico
                // (Para esta implementação simples, vamos verificar se o last sent foi "antes" deste na sequência)
                // Melhor: verificar se este ID já foi enviado. Como guardamos apenas o último ID, 
                // vamos verificar se o email atual é o *próximo* esperado.

                const sequenceIndex = LEAD_NURTURING_SEQUENCE.findIndex(s => s.id === step.id);
                const lastSentIndex = LEAD_NURTURING_SEQUENCE.findIndex(s => s.id === lead.lastDripEmailId);

                if (sequenceIndex <= lastSentIndex) continue; // Já enviou este ou um posterior

                // Se chegámos aqui, é um candidato a envio. 
                // Mas só devemos enviar o IMEDIATAMENTE seguinte ao último, não saltar passos se a cron falhou.
                if (sequenceIndex > lastSentIndex + 1) continue;

                // Verificar condição específica do passo
                if (!step.condition(lead)) continue;

                // Enviar Email
                let emailComponent;
                switch (step.template) {
                    case 'lead-welcome':
                        emailComponent = <LeadWelcomeTemplate
                            leadName={lead.nome.split(' ')[0]}
                            matchesCount={3} // Placeholder, deveria vir de lead.matchesInfo
                            dashboardUrl="https://taconsulting.pt/dashboard"
                        />;
                        break;
                    case 'lead-reminder':
                        emailComponent = <LeadReminderTemplate
                            leadName={lead.nome.split(' ')[0]}
                            daysRemaining={5}
                            opportunitiesCount={3}
                            dashboardUrl="https://taconsulting.pt/dashboard"
                        />;
                        break;
                    case 'lead-offer':
                        emailComponent = <LeadOfferTemplate
                            leadName={lead.nome.split(' ')[0]}
                            bookingUrl="https://calendly.com/taconsulting/30min"
                        />;
                        break;
                    case 'lead-educational':
                        emailComponent = <LeadEducationalTemplate
                            leadName={lead.nome.split(' ')[0]}
                            guideUrl="https://taconsulting.pt/blog/guia-aprovacao"
                        />;
                        break;
                }

                if (emailComponent) {
                    await resend.emails.send({
                        from: 'TA Consulting <hello@taconsulting.pt>',
                        to: lead.email,
                        subject: step.subject,
                        react: emailComponent,
                    });

                    // Atualizar Lead
                    await prisma.lead.update({
                        where: { id: lead.id },
                        data: {
                            lastDripEmailId: step.id,
                            lastDripEmailSentAt: new Date(),
                        },
                    });

                    emailsSent++;
                }

                // Só enviar um email por execução por lead para evitar spam em batch se o Cron atrasar muito
                break;
            }
        }

        return NextResponse.json({ success: true, processed: leads.length, sent: emailsSent });
    } catch (error) {
        console.error('Drip error:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
