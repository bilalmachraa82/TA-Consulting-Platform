/**
 * Stripe Client Configuration
 * 
 * Server-side Stripe client for checkout and subscription management
 */

import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
    console.warn('⚠️ STRIPE_SECRET_KEY not set - Stripe features disabled');
}

// Create Stripe client only if key is available (avoids build errors)
export const stripe = stripeSecretKey
    ? new Stripe(stripeSecretKey, {
        apiVersion: '2024-11-20.acacia' as Stripe.LatestApiVersion,
        typescript: true,
    })
    : null;

// Pricing Plans Configuration
export const PLANS = {
    FREE: {
        id: 'free',
        name: 'Free',
        price: 0,
        priceId: null, // No Stripe product for free
        features: [
            '3 avisos/mês',
            'Chat básico com IA',
            'Alertas limitados',
        ],
        limits: {
            avisos: 3,
            chat: 10,
            empresas: 1,
        }
    },
    STARTER: {
        id: 'starter',
        name: 'Starter',
        price: 29,
        priceId: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter',
        features: [
            'Avisos ilimitados',
            'Chat IA ilimitado',
            'Smart Matching',
            'Alertas email',
            '5 empresas',
        ],
        limits: {
            avisos: -1, // unlimited
            chat: -1,
            empresas: 5,
        }
    },
    PRO: {
        id: 'pro',
        name: 'Pro',
        price: 79,
        priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro',
        features: [
            'Tudo do Starter',
            'Templates de candidatura',
            'AI Writer (beta)',
            'Export PDF',
            'Empresas ilimitadas',
            'Suporte prioritário',
        ],
        limits: {
            avisos: -1,
            chat: -1,
            empresas: -1,
        }
    },
    ENTERPRISE: {
        id: 'enterprise',
        name: 'Enterprise',
        price: 199,
        priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise',
        features: [
            'Tudo do Pro',
            'White-label',
            'API dedicada',
            'Onboarding personalizado',
            'SLA garantido',
        ],
        limits: {
            avisos: -1,
            chat: -1,
            empresas: -1,
        }
    }
} as const;

export type PlanId = keyof typeof PLANS;

// Helper to get plan by price ID
export function getPlanByPriceId(priceId: string): typeof PLANS[PlanId] | null {
    return Object.values(PLANS).find(p => p.priceId === priceId) || null;
}

// Create checkout session
export async function createCheckoutSession({
    priceId,
    customerId,
    successUrl,
    cancelUrl,
}: {
    priceId: string;
    customerId?: string;
    successUrl: string;
    cancelUrl: string;
}) {
    if (!stripe) {
        throw new Error('Stripe not configured - STRIPE_SECRET_KEY missing');
    }

    const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        customer: customerId,
        success_url: successUrl,
        cancel_url: cancelUrl,
        allow_promotion_codes: true,
    });

    return session;
}

// Create customer portal session
export async function createPortalSession(customerId: string, returnUrl: string) {
    if (!stripe) {
        throw new Error('Stripe not configured - STRIPE_SECRET_KEY missing');
    }

    const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
    });

    return session;
}
