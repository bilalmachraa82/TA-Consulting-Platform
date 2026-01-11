/**
 * Stripe Webhook Handler
 * 
 * POST /api/stripe/webhook - Handle Stripe events
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe, getPlanByPriceId } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * Tolerância máxima para o timestamp do webhook (em milissegundos)
 * 5 minutos é recomendado pela Stripe para prevenir replay attacks
 */
const WEBHOOK_TOLERANCE_MS = 5 * 60 * 1000;

/**
 * Extrai e valida o timestamp da assinatura do Stripe
 * Prevenir replay attacks verificando que o webhook é recente
 */
function validateWebhookTimestamp(signature: string | null): { valid: boolean; error?: string } {
    if (!signature) {
        return { valid: false, error: 'Missing signature' };
    }

    try {
        // A assinatura do Stripe tem formato: t={timestamp},v1={signature},...
        const parts = signature.split(',');
        const timestampPart = parts.find(part => part.startsWith('t='));

        if (!timestampPart) {
            return { valid: false, error: 'Invalid signature format - missing timestamp' };
        }

        const timestamp = parseInt(timestampPart.split('=')[1], 10);

        if (isNaN(timestamp)) {
            return { valid: false, error: 'Invalid timestamp format' };
        }

        const webhookTimestamp = timestamp * 1000; // Converter para milissegundos
        const now = Date.now();
        const timeDifference = Math.abs(now - webhookTimestamp);

        if (timeDifference > WEBHOOK_TOLERANCE_MS) {
            return {
                valid: false,
                error: `Webhook timestamp expired. Difference: ${Math.floor(timeDifference / 1000)}s (max: ${WEBHOOK_TOLERANCE_MS / 1000}s)`
            };
        }

        return { valid: true };
    } catch (error) {
        return { valid: false, error: 'Failed to parse signature timestamp' };
    }
}

export async function POST(request: NextRequest) {
    // Check if Stripe is configured
    if (!stripe) {
        return NextResponse.json(
            { error: 'Stripe not configured' },
            { status: 503 }
        );
    }

    // Verificar se STRIPE_WEBHOOK_SECRET existe
    if (!webhookSecret) {
        console.error('STRIPE_WEBHOOK_SECRET not configured');
        return NextResponse.json(
            { error: 'Webhook configuration error' },
            { status: 500 }
        );
    }

    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
        return NextResponse.json(
            { error: 'Missing webhook signature' },
            { status: 400 }
        );
    }

    // Verificar timestamp para prevenir replay attacks
    const timestampValidation = validateWebhookTimestamp(signature);
    if (!timestampValidation.valid) {
        console.error('Webhook timestamp validation failed:', timestampValidation.error);
        return NextResponse.json(
            { error: timestampValidation.error || 'Invalid webhook timestamp' },
            { status: 401 }
        );
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return NextResponse.json(
            { error: 'Invalid signature' },
            { status: 400 }
        );
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                await handleCheckoutCompleted(session);
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionUpdated(subscription);
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionDeleted(subscription);
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });

    } catch (error: any) {
        console.error('Webhook handler error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    if (!stripe) return;

    const customerId = session.customer as string;
    const subscriptionId = session.subscription as string;
    const clientReferenceId = session.client_reference_id;
    const customerEmail = session.customer_details?.email;

    // Get subscription details to find the price ID
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const priceId = subscription.items.data[0]?.price.id;
    const plan = getPlanByPriceId(priceId);

    if (!plan) {
        console.error('Unknown plan for price:', priceId);
        return;
    }

    console.log(`✅ Pagamento processado: ${plan.name} (${customerEmail})`);

    // Tentar encontrar user pelo email ou client_reference_id
    // Nota: O ideal é passar client_reference_id (userId) no checkout session creation

    let userId = clientReferenceId;

    if (!userId && customerEmail) {
        const user = await prisma.user.findUnique({ where: { email: customerEmail } });
        userId = user?.id;
    }

    if (userId) {
        await prisma.user.update({
            where: { id: userId },
            data: {
                stripeCustomerId: customerId,
                stripeSubscriptionId: subscriptionId,
                plan: plan.id.toUpperCase() as any, // 'free' | 'starter' | 'pro' | 'enterprise' -> Enum
                isActive: true,
            }
        });
        console.log(`👤 Plano do user ${userId} atualizado para ${plan.id.toUpperCase()}`);
    } else {
        console.error(`❌ User não encontrado para email ${customerEmail}`);
    }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const priceId = subscription.items.data[0]?.price.id;
    const plan = getPlanByPriceId(priceId);
    const status = subscription.status; // active, past_due, canceled...
    const customerId = subscription.customer as string;

    console.log(`📝 Subscrição atualizada: ${plan?.name} - Status: ${status}`);

    const isActive = status === 'active' || status === 'trialing';

    // Atualizar user pelo stripeCustomerId
    // Se cancelado ou unpaid, reverter para FREE ou inativar
    if (!isActive) {
        await prisma.user.updateMany({
            where: { stripeCustomerId: customerId },
            data: {
                isActive: false,
                // Opcional: reverter plan para 'FREE' se preferir não bloquear login
                // plan: 'FREE' 
            }
        });
        console.log(`⚠️ User com customerId ${customerId} desativado (status: ${status})`);
    } else if (plan) {
        // Garantir que plano está correto (upgrade/downgrade)
        await prisma.user.updateMany({
            where: { stripeCustomerId: customerId },
            data: {
                plan: plan.id.toUpperCase() as any,
                isActive: true
            }
        });
    }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const customerId = subscription.customer as string;
    console.log(`❌ Subscrição cancelada: ${customerId}`);

    // Reverter user para FREE
    await prisma.user.updateMany({
        where: { stripeCustomerId: customerId },
        data: {
            plan: 'FREE',
            isActive: true, // Mantém acesso mas limitado features
            stripeSubscriptionId: null,
        }
    });
}
