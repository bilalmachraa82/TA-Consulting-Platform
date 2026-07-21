/**
 * Pedido de recuperação de palavra-passe.
 *
 * POST /api/auth/forgot-password  { email }
 * Devolve SEMPRE a mesma resposta, exista ou não a conta — quem tenta descobrir
 * que emails estão registados não aprende nada com isto.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

// ver nota em reset-password/route.ts: fluxo de auth usa Prisma direto
const prisma = new PrismaClient();
import { resend, EMAIL_FROM } from '@/lib/email/client';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limiter';
import {
    generateResetToken,
    identifierForEmail,
    normalizeEmail,
    buildResetUrl,
    resetEmailHtml,
} from '@/lib/auth/password-reset';

export const dynamic = 'force-dynamic';

const RequestSchema = z.object({
    email: z.string().email('Email inválido').max(200),
});

/** Resposta neutra: nunca revela se a conta existe. */
const RESPOSTA_NEUTRA = {
    success: true,
    message: 'Se existir uma conta com esse email, enviámos um link de recuperação.',
};

export async function POST(request: NextRequest) {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`forgot-password:${clientIP}`, RATE_LIMITS.CHATBOT);
    if (!rateCheck.success) {
        return NextResponse.json(
            { error: 'Demasiados pedidos. Aguarda um pouco antes de tentar de novo.' },
            { status: 429, headers: { 'Retry-After': rateCheck.resetIn.toString() } },
        );
    }

    const parsed = RequestSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
        return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }

    const email = normalizeEmail(parsed.data.email);

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, name: true },
        });

        // Conta inexistente: sai em silêncio com a mesma resposta.
        if (!user) {
            console.warn(`[forgot-password] pedido para email não registado (${clientIP})`);
            return NextResponse.json(RESPOSTA_NEUTRA);
        }

        const identifier = identifierForEmail(email);
        const { plain, hash, expires } = generateResetToken();

        // Um pedido novo invalida os anteriores.
        await prisma.verificationToken.deleteMany({ where: { identifier } });
        await prisma.verificationToken.create({ data: { identifier, token: hash, expires } });

        const baseUrl = process.env.NEXTAUTH_URL || new URL(request.url).origin;
        const resetUrl = buildResetUrl(baseUrl, plain);

        // O domínio de envio pode não estar verificado no Resend; nesse caso o
        // envio falha mas o token fica criado — o admin pode gerar o link com
        // `yarn tsx scripts/reset-password.ts <email>`.
        try {
            await resend.emails.send({
                from: process.env.EMAIL_FROM || EMAIL_FROM,
                to: email,
                subject: 'Recuperar a tua palavra-passe — Eligivo',
                html: resetEmailHtml(resetUrl, user.name),
            });
        } catch (mailError) {
            console.error('[forgot-password] falha no envio do email:', mailError);
        }

        return NextResponse.json(RESPOSTA_NEUTRA);
    } catch (error) {
        console.error('[forgot-password] erro:', error);
        // Mesmo em erro interno mantemos a resposta neutra para o cliente.
        return NextResponse.json(RESPOSTA_NEUTRA);
    }
}
