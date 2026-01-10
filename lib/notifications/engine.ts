
/**
 * Notification Engine
 * 
 * Processa eventos e envia notificações multi-canal.
 */

import { prisma } from '@/lib/db';
import { Resend } from 'resend';
import { slackClient } from '@/lib/integrations/slack/client';

const resend = new Resend(process.env.RESEND_API_KEY);

// Tipos de notificação suportados
export type NotificationType =
    | 'AVISO_PRAZO_7D'      // Aviso expira em 7 dias
    | 'DOCUMENTO_EXPIRA_30D' // Documento expira em 30 dias
    | 'MILESTONE_ATRASADO'   // Milestone passou do prazo
    | 'NOVO_MATCH_80'        // Match de elegibilidade >= 80%
    | 'CANDIDATURA_UPDATE';  // Atualização de estado

export interface NotificationPayload {
    type: NotificationType;
    userId: string;
    title: string;
    message: string;
    link?: string;
    metadata?: Record<string, any>;
}

// Prioridades por tipo
const PRIORITY: Record<NotificationType, number> = {
    AVISO_PRAZO_7D: 10,
    MILESTONE_ATRASADO: 9,
    DOCUMENTO_EXPIRA_30D: 7,
    NOVO_MATCH_80: 5,
    CANDIDATURA_UPDATE: 3,
};

export class NotificationEngine {

    async send(payload: NotificationPayload): Promise<void> {
        const { type, userId, title, message, link, metadata } = payload;

        // 1. Verificar preferências do utilizador
        const preferences = await prisma.notificationPreference.findUnique({
            where: { userId_type: { userId, type } }
        });

        // Se explicitamente desativado, sair
        if (preferences?.enabled === false) {
            console.log(`[Notifications] ${type} disabled for user ${userId}`);
            return;
        }

        // Canais default se não houver preferências
        const channels = preferences?.channels || ['email'];

        // 2. Verificar quiet hours
        if (this.isQuietTime(preferences?.quietFrom, preferences?.quietTo)) {
            console.log(`[Notifications] Quiet hours for user ${userId}, queuing...`);
            // Em produção: adiar para depois do quiet time
            return;
        }

        // 3. Dedupe: verificar se já enviámos notificação similar recentemente
        const recentDupe = await prisma.notificationLog.findFirst({
            where: {
                userId,
                type,
                sentAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // 24h
            }
        });

        if (recentDupe) {
            console.log(`[Notifications] Duplicate ${type} for user ${userId} in last 24h, skipping`);
            return;
        }

        // 4. Enviar para cada canal
        for (const channel of channels) {
            await this.sendToChannel(channel, payload);

            // Log
            await prisma.notificationLog.create({
                data: {
                    userId,
                    type,
                    channel,
                    payload: { title, message, link, metadata } as any,
                }
            });
        }
    }

    private async sendToChannel(channel: string, payload: NotificationPayload): Promise<void> {
        switch (channel) {
            case 'email':
                await this.sendEmail(payload);
                break;
            case 'push':
                // TODO: Web Push implementation
                console.log('[Notifications] Push not implemented yet');
                break;
            case 'slack':
                await this.sendSlack(payload);
                break;
            default:
                console.warn(`[Notifications] Unknown channel: ${channel}`);
        }
    }

    private async sendEmail(payload: NotificationPayload): Promise<void> {
        try {
            const user = await prisma.user.findUnique({ where: { id: payload.userId } });
            if (!user?.email) return;

            await resend.emails.send({
                from: 'TA Consulting <notificacoes@taconsulting.pt>',
                to: user.email,
                subject: `🔔 ${payload.title}`,
                html: `
          <div style="font-family: sans-serif; max-width: 600px;">
            <h2>${payload.title}</h2>
            <p>${payload.message}</p>
            ${payload.link ? `<a href="${payload.link}" style="display:inline-block; background:#2563eb; color:white; padding:12px 24px; border-radius:6px; text-decoration:none; margin-top:16px;">Ver Detalhes</a>` : ''}
            <hr style="margin-top:32px; border:none; border-top:1px solid #eee;">
            <p style="font-size:12px; color:#999;">TA Consulting - Notificações Automáticas</p>
          </div>
        `
            });
        } catch (error) {
            console.error('[Notifications] Email send failed:', error);
        }
    }

    private async sendSlack(payload: NotificationPayload): Promise<void> {
        try {
            // Find user's Slack integration
            const integration = await prisma.integration.findFirst({
                where: {
                    userId: payload.userId,
                    type: 'SLACK',
                    status: 'CONNECTED',
                },
            });

            if (!integration || !integration.accessToken) {
                console.log(`[Notifications] No Slack integration for user ${payload.userId}`);
                return;
            }

            // Parse webhook URL from integration data
            const integrationData = integration.extraData as any;
            const webhookUrl = integrationData?.incoming_webhook?.url;

            if (!webhookUrl) {
                console.log(`[Notifications] No Slack webhook URL for user ${payload.userId}`);
                return;
            }

            // Create Slack message with blocks
            const blocks = slackClient.createAvisoBlock({
                nome: payload.title,
                programa: payload.metadata?.programa || 'TA Consulting',
                diasRestantes: payload.metadata?.diasRestantes || 0,
                link: payload.link,
            });

            await slackClient.sendWebhook(webhookUrl, {
                channel: integrationData?.incoming_webhook?.channel || '#general',
                text: payload.message,
                blocks,
            });

            console.log(`[Notifications] Slack sent to user ${payload.userId}`);
        } catch (error) {
            console.error('[Notifications] Slack send failed:', error);
        }
    }

    private isQuietTime(from?: string | null, to?: string | null): boolean {
        if (!from || !to) return false;

        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTime = currentHour * 60 + currentMinute;

        const [fromHour, fromMinute] = from.split(':').map(Number);
        const [toHour, toMinute] = to.split(':').map(Number);
        const fromTime = fromHour * 60 + fromMinute;
        const toTime = toHour * 60 + toMinute;

        // Handle overnight quiet time (e.g., 22:00 - 08:00)
        if (fromTime > toTime) {
            return currentTime >= fromTime || currentTime <= toTime;
        }

        return currentTime >= fromTime && currentTime <= toTime;
    }
}

// Singleton export
export const notificationEngine = new NotificationEngine();
