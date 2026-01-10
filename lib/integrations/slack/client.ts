/**
 * Slack Integration Client
 * 
 * SDK wrapper para Slack Web API e Webhooks.
 * Suporta OAuth, mensagens, comandos e blocos interativos.
 */

import crypto from 'crypto';

export interface SlackConfig {
    clientId: string;
    clientSecret: string;
    signingSecret: string;
    redirectUri: string;
}

export interface SlackMessage {
    channel: string;
    text: string;
    blocks?: SlackBlock[];
    attachments?: SlackAttachment[];
}

export interface SlackBlock {
    type: 'section' | 'divider' | 'actions' | 'context' | 'header';
    text?: { type: 'mrkdwn' | 'plain_text'; text: string };
    accessory?: any;
    elements?: any[];
}

export interface SlackAttachment {
    color?: string;
    title?: string;
    text?: string;
    fields?: { title: string; value: string; short?: boolean }[];
}

export interface SlackAccessToken {
    access_token: string;
    team_id: string;
    team_name: string;
    incoming_webhook: {
        channel: string;
        channel_id: string;
        url: string;
    };
}

const SLACK_API_BASE = 'https://slack.com/api';
const SLACK_OAUTH_URL = 'https://slack.com/oauth/v2/authorize';

export class SlackClient {
    private config: SlackConfig;

    constructor(config?: Partial<SlackConfig>) {
        this.config = {
            clientId: config?.clientId || process.env.SLACK_CLIENT_ID || '',
            clientSecret: config?.clientSecret || process.env.SLACK_CLIENT_SECRET || '',
            signingSecret: config?.signingSecret || process.env.SLACK_SIGNING_SECRET || '',
            redirectUri: config?.redirectUri || process.env.SLACK_REDIRECT_URI || '',
        };
    }

    /**
     * Gera URL de OAuth para instalação do bot
     */
    getOAuthUrl(state: string): string {
        const scopes = [
            'incoming-webhook',
            'commands',
            'chat:write',
            'channels:read',
        ].join(',');

        const params = new URLSearchParams({
            client_id: this.config.clientId,
            scope: scopes,
            redirect_uri: this.config.redirectUri,
            state,
        });

        return `${SLACK_OAUTH_URL}?${params.toString()}`;
    }

    /**
     * Troca código OAuth por access token
     */
    async exchangeCodeForToken(code: string): Promise<SlackAccessToken> {
        const response = await fetch(`${SLACK_API_BASE}/oauth.v2.access`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: this.config.clientId,
                client_secret: this.config.clientSecret,
                code,
                redirect_uri: this.config.redirectUri,
            }),
        });

        const data = await response.json();

        if (!data.ok) {
            throw new Error(`Slack OAuth Error: ${data.error}`);
        }

        return data as SlackAccessToken;
    }

    /**
     * Envia mensagem via Webhook
     */
    async sendWebhook(webhookUrl: string, message: SlackMessage): Promise<void> {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: message.text,
                blocks: message.blocks,
                attachments: message.attachments,
            }),
        });

        if (!response.ok) {
            throw new Error(`Slack Webhook Error: ${response.status}`);
        }
    }

    /**
     * Envia mensagem direta via API (requer access_token)
     */
    async postMessage(accessToken: string, message: SlackMessage): Promise<any> {
        const response = await fetch(`${SLACK_API_BASE}/chat.postMessage`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });

        const data = await response.json();

        if (!data.ok) {
            throw new Error(`Slack API Error: ${data.error}`);
        }

        return data;
    }

    /**
     * Verifica assinatura de request do Slack
     */
    verifySignature(
        signature: string,
        timestamp: string,
        body: string
    ): boolean {
        const baseString = `v0:${timestamp}:${body}`;
        const hmac = crypto.createHmac('sha256', this.config.signingSecret);
        const computedSignature = `v0=${hmac.update(baseString).digest('hex')}`;

        return crypto.timingSafeEqual(
            new Uint8Array(Buffer.from(signature)),
            new Uint8Array(Buffer.from(computedSignature))
        );
    }

    /**
     * Cria blocos para notificação de aviso
     */
    createAvisoBlock(aviso: {
        nome: string;
        programa: string;
        diasRestantes: number;
        link?: string;
    }): SlackBlock[] {
        return [
            {
                type: 'header',
                text: { type: 'plain_text', text: '🔔 Novo Aviso Relevante' }
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `*${aviso.nome}*\n${aviso.programa} • ${aviso.diasRestantes} dias restantes`
                }
            },
            { type: 'divider' },
            {
                type: 'actions',
                elements: [
                    {
                        type: 'button',
                        text: { type: 'plain_text', text: 'Ver Detalhes' },
                        url: aviso.link || '#',
                        action_id: 'view_aviso'
                    }
                ]
            }
        ];
    }
}

// Singleton export
export const slackClient = new SlackClient();
