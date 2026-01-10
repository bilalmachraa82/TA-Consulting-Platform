/**
 * Stripe Checkout API
 * 
 * POST /api/stripe/checkout - Create checkout session
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createCheckoutSession, PLANS, PlanId } from '@/lib/stripe';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Autenticação necessária' },
                { status: 401 }
            );
        }

        const { planId } = await request.json();

        if (!planId || !PLANS[planId as PlanId]) {
            return NextResponse.json(
                { error: 'Plano inválido' },
                { status: 400 }
            );
        }

        const plan = PLANS[planId as PlanId];

        if (!plan.priceId) {
            return NextResponse.json(
                { error: 'Este plano não requer pagamento' },
                { status: 400 }
            );
        }

        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

        const checkoutSession = await createCheckoutSession({
            priceId: plan.priceId,
            successUrl: `${baseUrl}/dashboard?checkout=success&plan=${planId}`,
            cancelUrl: `${baseUrl}/pricing?checkout=cancelled`,
        });

        return NextResponse.json({
            url: checkoutSession.url,
            sessionId: checkoutSession.id
        });

    } catch (error: any) {
        console.error('Stripe checkout error:', error);
        return NextResponse.json(
            { error: error.message || 'Erro ao criar checkout' },
            { status: 500 }
        );
    }
}
