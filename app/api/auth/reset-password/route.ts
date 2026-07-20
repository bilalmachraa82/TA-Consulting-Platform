/**
 * Conclusão da recuperação: valida o token e grava a nova palavra-passe.
 *
 * POST /api/auth/reset-password  { token, password }
 *
 * O token é comparado por hash (nunca é guardado em claro) e apagado ao ser
 * usado. Tokens expirados são apagados na mesma, para não ficarem a acumular.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

// Cliente Prisma direto: o wrapper de lib/db tem fallback JSON e não expõe
// verificationToken nem $transaction — e um reset de password não pode correr
// contra um provider degradado.
const prisma = new PrismaClient();
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limiter';
import {
    hashToken,
    isExpired,
    validatePassword,
    RESET_IDENTIFIER_PREFIX,
} from '@/lib/auth/password-reset';

export const dynamic = 'force-dynamic';

const RequestSchema = z.object({
    token: z.string().min(32).max(200),
    password: z.string().min(1).max(200),
});

const ERRO_TOKEN = 'Link inválido ou expirado. Pede um novo link de recuperação.';

export async function POST(request: NextRequest) {
    const clientIP = getClientIP(request);
    const rateCheck = checkRateLimit(`reset-password:${clientIP}`, RATE_LIMITS.CHATBOT);
    if (!rateCheck.success) {
        return NextResponse.json(
            { error: 'Demasiadas tentativas. Aguarda um pouco.' },
            { status: 429, headers: { 'Retry-After': rateCheck.resetIn.toString() } },
        );
    }

    const parsed = RequestSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
        return NextResponse.json({ error: ERRO_TOKEN }, { status: 400 });
    }

    const { token, password } = parsed.data;

    const forcaOk = validatePassword(password);
    if (!forcaOk.ok) {
        return NextResponse.json({ error: forcaOk.erro }, { status: 400 });
    }

    try {
        // Procura pelo hash: o token em claro nunca existe na base.
        const registo = await prisma.verificationToken.findUnique({
            where: { token: hashToken(token) },
        });

        if (!registo || !registo.identifier.startsWith(RESET_IDENTIFIER_PREFIX)) {
            return NextResponse.json({ error: ERRO_TOKEN }, { status: 400 });
        }

        if (isExpired(registo.expires)) {
            await prisma.verificationToken.deleteMany({ where: { token: registo.token } });
            return NextResponse.json({ error: ERRO_TOKEN }, { status: 400 });
        }

        const email = registo.identifier.slice(RESET_IDENTIFIER_PREFIX.length);
        const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
        if (!user) {
            await prisma.verificationToken.deleteMany({ where: { token: registo.token } });
            return NextResponse.json({ error: ERRO_TOKEN }, { status: 400 });
        }

        const hash = await bcrypt.hash(password, 12);
        await prisma.$transaction([
            prisma.user.update({ where: { id: user.id }, data: { password: hash } }),
            // uso único: o link deixa de funcionar depois desta chamada
            prisma.verificationToken.deleteMany({ where: { identifier: registo.identifier } }),
        ]);

        console.warn(`[reset-password] palavra-passe reposta para ${email} (${clientIP})`);
        return NextResponse.json({
            success: true,
            message: 'Palavra-passe alterada. Já podes iniciar sessão.',
        });
    } catch (error) {
        console.error('[reset-password] erro:', error);
        return NextResponse.json({ error: 'Erro ao repor a palavra-passe.' }, { status: 500 });
    }
}
