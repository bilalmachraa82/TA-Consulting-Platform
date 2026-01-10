import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { slackClient } from '@/lib/integrations/slack/client';
import crypto from 'crypto';

/**
 * GET /api/integrations/slack
 * Inicia o fluxo OAuth para conectar Slack
 */
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        // Se tiver code, é callback do OAuth
        if (code && state) {
            return handleOAuthCallback(code, state, session.user.id);
        }

        // Senão, iniciar OAuth
        const oauthState = crypto.randomBytes(16).toString('hex');

        // Guardar state na sessão (em produção, usar redis/db)
        // Por agora, incluímos o userId no state
        const stateWithUser = `${oauthState}:${session.user.id}`;

        const oauthUrl = slackClient.getOAuthUrl(stateWithUser);

        return NextResponse.redirect(oauthUrl);

    } catch (error) {
        console.error('Slack OAuth Error:', error);
        return new NextResponse('OAuth Error', { status: 500 });
    }
}

async function handleOAuthCallback(code: string, state: string, userId: string) {
    try {
        // Trocar código por token
        const tokenData = await slackClient.exchangeCodeForToken(code);

        // Guardar integração na DB
        await prisma.integration.upsert({
            where: {
                userId_type: { userId, type: 'SLACK' }
            },
            update: {
                accessToken: tokenData.access_token,
                webhookUrl: tokenData.incoming_webhook?.url,
                metadata: {
                    team_id: tokenData.team_id,
                    team_name: tokenData.team_name,
                    channel: tokenData.incoming_webhook?.channel,
                },
                isActive: true,
            },
            create: {
                userId,
                type: 'SLACK',
                accessToken: tokenData.access_token,
                webhookUrl: tokenData.incoming_webhook?.url,
                metadata: {
                    team_id: tokenData.team_id,
                    team_name: tokenData.team_name,
                    channel: tokenData.incoming_webhook?.channel,
                },
                isActive: true,
            },
        });

        // Redirecionar para página de sucesso
        return NextResponse.redirect('/dashboard/configuracoes/integracoes?success=slack');

    } catch (error) {
        console.error('Slack OAuth Callback Error:', error);
        return NextResponse.redirect('/dashboard/configuracoes/integracoes?error=slack_failed');
    }
}

/**
 * POST /api/integrations/slack
 * Endpoint para comandos Slack (/ta elegibilidade, etc.)
 */
export async function POST(req: Request) {
    try {
        const body = await req.text();
        const signature = req.headers.get('x-slack-signature') || '';
        const timestamp = req.headers.get('x-slack-request-timestamp') || '';

        // Verificar assinatura
        if (!slackClient.verifySignature(signature, timestamp, body)) {
            return new NextResponse('Invalid signature', { status: 401 });
        }

        const formData = new URLSearchParams(body);
        const command = formData.get('command');
        const text = formData.get('text') || '';
        const userId = formData.get('user_id');
        const channelId = formData.get('channel_id');

        // Processar comando
        switch (command) {
            case '/ta':
                return handleTACommand(text, userId!, channelId!);
            default:
                return NextResponse.json({
                    response_type: 'ephemeral',
                    text: `Comando desconhecido: ${command}`,
                });
        }

    } catch (error) {
        console.error('Slack Command Error:', error);
        return NextResponse.json({
            response_type: 'ephemeral',
            text: 'Erro ao processar comando. Tenta novamente.',
        });
    }
}

async function handleTACommand(text: string, userId: string, channelId: string) {
    const [subcommand, ...args] = text.trim().split(' ');

    switch (subcommand) {
        case 'avisos':
            // Buscar avisos recentes
            const avisos = await prisma.aviso.findMany({
                take: 5,
                orderBy: { dataPublicacao: 'desc' },
                where: { isActive: true },
            });

            return NextResponse.json({
                response_type: 'in_channel',
                text: '📋 *Últimos Avisos Disponíveis*',
                blocks: [
                    {
                        type: 'header',
                        text: { type: 'plain_text', text: '📋 Últimos 5 Avisos' }
                    },
                    ...avisos.map(aviso => ({
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: `*${aviso.nome}*\n${aviso.programa || 'PT2030'} • ${aviso.portal}`
                        }
                    })),
                ],
            });

        case 'elegibilidade':
            const nif = args[0];
            if (!nif) {
                return NextResponse.json({
                    response_type: 'ephemeral',
                    text: 'Uso: `/ta elegibilidade <NIF>`',
                });
            }

            // Buscar empresa
            const empresa = await prisma.empresa.findFirst({
                where: { nif },
            });

            if (!empresa) {
                return NextResponse.json({
                    response_type: 'ephemeral',
                    text: `Empresa com NIF ${nif} não encontrada.`,
                });
            }

            return NextResponse.json({
                response_type: 'in_channel',
                text: `✅ Empresa *${empresa.nome}* encontrada`,
                blocks: [
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: `✅ *${empresa.nome}*\nNIF: ${empresa.nif} • CAE: ${empresa.cae || 'N/D'}\nPara análise completa, acede ao dashboard.`
                        }
                    },
                    {
                        type: 'actions',
                        elements: [{
                            type: 'button',
                            text: { type: 'plain_text', text: 'Ver no Dashboard' },
                            url: `${process.env.NEXTAUTH_URL}/dashboard/elegibilidade?empresa=${empresa.id}`,
                        }]
                    }
                ],
            });

        case 'help':
        default:
            return NextResponse.json({
                response_type: 'ephemeral',
                text: `*TA Consulting Bot - Comandos Disponíveis*\n\n• \`/ta avisos\` - Lista os últimos avisos\n• \`/ta elegibilidade <NIF>\` - Verifica elegibilidade de empresa\n• \`/ta help\` - Mostra esta ajuda`,
            });
    }
}
