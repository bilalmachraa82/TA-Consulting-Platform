/**
 * Microsoft Teams Integration Client
 * 
 * SDK wrapper para Teams Bot Framework e Connectors.
 * Suporta OAuth, Adaptive Cards e mensagens.
 */

export interface TeamsConfig {
    appId: string;
    appPassword: string;
    tenantId?: string;
}

export interface TeamsMessage {
    conversationId: string;
    text?: string;
    adaptiveCard?: AdaptiveCard;
}

export interface AdaptiveCard {
    type: 'AdaptiveCard';
    version: '1.4';
    body: AdaptiveCardElement[];
    actions?: AdaptiveCardAction[];
}

export interface AdaptiveCardElement {
    type: 'TextBlock' | 'ColumnSet' | 'Container' | 'FactSet' | 'Image';
    text?: string;
    size?: 'small' | 'medium' | 'large' | 'extraLarge';
    weight?: 'lighter' | 'default' | 'bolder';
    color?: 'default' | 'accent' | 'attention' | 'good' | 'warning';
    wrap?: boolean;
    facts?: { title: string; value: string }[];
    columns?: any[];
    items?: AdaptiveCardElement[];
}

export interface AdaptiveCardAction {
    type: 'Action.OpenUrl' | 'Action.Submit' | 'Action.ShowCard';
    title: string;
    url?: string;
    data?: any;
}

const TEAMS_API_BASE = 'https://smba.trafficmanager.net/emea';
const MS_LOGIN_URL = 'https://login.microsoftonline.com';

export class TeamsClient {
    private config: TeamsConfig;
    private accessToken: string | null = null;
    private tokenExpiry: Date | null = null;

    constructor(config?: Partial<TeamsConfig>) {
        this.config = {
            appId: config?.appId || process.env.TEAMS_APP_ID || '',
            appPassword: config?.appPassword || process.env.TEAMS_APP_PASSWORD || '',
            tenantId: config?.tenantId || process.env.TEAMS_TENANT_ID,
        };
    }

    /**
     * Obtém access token do Azure AD
     */
    async getAccessToken(): Promise<string> {
        // Usar token cached se ainda válido
        if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
            return this.accessToken;
        }

        const tenant = this.config.tenantId || 'botframework.com';
        const tokenUrl = `${MS_LOGIN_URL}/${tenant}/oauth2/v2.0/token`;

        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: this.config.appId,
                client_secret: this.config.appPassword,
                scope: 'https://api.botframework.com/.default',
            }),
        });

        const data = await response.json();

        if (!data.access_token) {
            throw new Error(`Teams OAuth Error: ${data.error_description || 'Unknown error'}`);
        }

        this.accessToken = data.access_token;
        this.tokenExpiry = new Date(Date.now() + (data.expires_in - 60) * 1000);

        return this.accessToken!;
    }

    /**
     * Envia mensagem para um conversation
     */
    async sendMessage(serviceUrl: string, message: TeamsMessage): Promise<any> {
        const token = await this.getAccessToken();

        const payload: any = {
            type: 'message',
            text: message.text,
        };

        if (message.adaptiveCard) {
            payload.attachments = [{
                contentType: 'application/vnd.microsoft.card.adaptive',
                content: message.adaptiveCard,
            }];
        }

        const response = await fetch(
            `${serviceUrl}/v3/conversations/${message.conversationId}/activities`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            }
        );

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Teams API Error: ${error}`);
        }

        return response.json();
    }

    /**
     * Cria Adaptive Card para notificação de aviso
     */
    createAvisoCard(aviso: {
        nome: string;
        programa: string;
        diasRestantes: number;
        link?: string;
    }): AdaptiveCard {
        return {
            type: 'AdaptiveCard',
            version: '1.4',
            body: [
                {
                    type: 'TextBlock',
                    text: '🔔 Novo Aviso Relevante',
                    size: 'large',
                    weight: 'bolder',
                    color: 'accent',
                },
                {
                    type: 'TextBlock',
                    text: aviso.nome,
                    size: 'medium',
                    weight: 'bolder',
                    wrap: true,
                },
                {
                    type: 'FactSet',
                    facts: [
                        { title: 'Programa', value: aviso.programa },
                        { title: 'Prazo', value: `${aviso.diasRestantes} dias restantes` },
                    ],
                },
            ],
            actions: [
                {
                    type: 'Action.OpenUrl',
                    title: 'Ver Detalhes',
                    url: aviso.link || '#',
                },
            ],
        };
    }

    /**
     * Verifica se o request vem do Bot Framework
     */
    async verifyBotRequest(authHeader: string): Promise<boolean> {
        // Em produção: validar JWT do Bot Framework
        // Por agora, verificação simplificada
        return authHeader?.startsWith('Bearer ') || false;
    }
}

// Singleton export
export const teamsClient = new TeamsClient();
