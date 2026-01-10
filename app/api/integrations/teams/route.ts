import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { teamsClient } from '@/lib/integrations/teams/client';

/**
 * POST /api/integrations/teams
 * Endpoint para receber mensagens do Bot Framework
 */
export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('authorization') || '';

        // Verificar autenticação do Bot Framework
        const isValid = await teamsClient.verifyBotRequest(authHeader);
        if (!isValid) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const activity = await req.json();
        const serviceUrl = activity.serviceUrl;

        // Processar por tipo de atividade
        switch (activity.type) {
            case 'message':
                return handleMessage(activity, serviceUrl);
            case 'conversationUpdate':
                return handleConversationUpdate(activity, serviceUrl);
            default:
                return new NextResponse('OK', { status: 200 });
        }

    } catch (error) {
        console.error('Teams Bot Error:', error);
        return new NextResponse('Bot Error', { status: 500 });
    }
}

async function handleMessage(activity: any, serviceUrl: string) {
    const text = activity.text?.toLowerCase().trim() || '';
    const conversationId = activity.conversation?.id;

    if (!conversationId) {
        return new NextResponse('Missing conversation', { status: 400 });
    }

    // Comandos suportados
    if (text.includes('avisos')) {
        const avisos = await prisma.aviso.findMany({
            take: 5,
            orderBy: { dataPublicacao: 'desc' },
            where: { isActive: true },
        });

        const card = {
            type: 'AdaptiveCard' as const,
            version: '1.4' as const,
            body: [
                {
                    type: 'TextBlock' as const,
                    text: '📋 Últimos 5 Avisos',
                    size: 'large' as const,
                    weight: 'bolder' as const,
                },
                ...avisos.map(aviso => ({
                    type: 'TextBlock' as const,
                    text: `• **${aviso.nome}**\n  ${aviso.programa || 'PT2030'} | ${aviso.portal}`,
                    wrap: true,
                })),
            ],
            actions: [{
                type: 'Action.OpenUrl' as const,
                title: 'Ver Todos no Dashboard',
                url: `${process.env.NEXTAUTH_URL}/dashboard/avisos`,
            }],
        };

        await teamsClient.sendMessage(serviceUrl, {
            conversationId,
            adaptiveCard: card,
        });

    } else if (text.includes('elegibilidade')) {
        // Extrair NIF do texto
        const nifMatch = text.match(/\d{9}/);

        if (!nifMatch) {
            await teamsClient.sendMessage(serviceUrl, {
                conversationId,
                text: '❌ Por favor, indica o NIF da empresa. Exemplo: "elegibilidade 123456789"',
            });
        } else {
            const empresa = await prisma.empresa.findFirst({
                where: { nif: nifMatch[0] },
            });

            if (empresa) {
                const card = teamsClient.createAvisoCard({
                    nome: empresa.nome,
                    programa: `NIF: ${empresa.nif}`,
                    diasRestantes: 0,
                    link: `${process.env.NEXTAUTH_URL}/dashboard/elegibilidade?empresa=${empresa.id}`,
                });

                await teamsClient.sendMessage(serviceUrl, {
                    conversationId,
                    adaptiveCard: card,
                });
            } else {
                await teamsClient.sendMessage(serviceUrl, {
                    conversationId,
                    text: `❌ Empresa com NIF ${nifMatch[0]} não encontrada.`,
                });
            }
        }

    } else if (text.includes('help') || text.includes('ajuda')) {
        await teamsClient.sendMessage(serviceUrl, {
            conversationId,
            text: `🤖 **TA Consulting Bot - Comandos**\n\n• \`avisos\` - Lista os últimos avisos\n• \`elegibilidade <NIF>\` - Verifica elegibilidade\n• \`help\` - Mostra esta ajuda`,
        });

    } else {
        // Resposta genérica
        await teamsClient.sendMessage(serviceUrl, {
            conversationId,
            text: `👋 Olá! Sou o TA Consulting Bot. Escreve "help" para ver os comandos disponíveis.`,
        });
    }

    return new NextResponse('OK', { status: 200 });
}

async function handleConversationUpdate(activity: any, serviceUrl: string) {
    const membersAdded = activity.membersAdded || [];
    const conversationId = activity.conversation?.id;
    const botId = activity.recipient?.id;

    // Verificar se o bot foi adicionado
    const botAdded = membersAdded.some((m: any) => m.id === botId);

    if (botAdded && conversationId) {
        // Mensagem de boas-vindas
        await teamsClient.sendMessage(serviceUrl, {
            conversationId,
            text: `👋 Olá! Sou o **TA Consulting Bot**.\n\nPosso ajudar-te a:\n• Ver os últimos avisos de fundos\n• Verificar elegibilidade de empresas\n\nEscreve "help" para começar.`,
        });
    }

    return new NextResponse('OK', { status: 200 });
}
