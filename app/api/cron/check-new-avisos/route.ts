/**
 * Cron diário dos scrapers/alertas (agendado em vercel.json).
 *
 * Corre o cruzamento avisos×leads com retry e, se todas as tentativas
 * falharem, envia um alerta por email ao ADMIN_EMAIL — o design doc da
 * semana 2 exige "cron diário com retry e alerta de falha".
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkNewAvisosCompatibility } from '@/lib/email/alert-service';
import { resend, EMAIL_FROM } from '@/lib/email/client';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MAX_ATTEMPTS = 3;
const BACKOFF_MS = 2000;

function verifyCronSecret(request: NextRequest): boolean {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
        // Sem secret configurado só é aceitável fora de produção.
        if (process.env.NODE_ENV === 'production') {
            console.warn('[Cron check-new-avisos] CRON_SECRET não configurado em produção.');
        }
        return process.env.NODE_ENV !== 'production';
    }
    return request.headers.get('authorization') === `Bearer ${cronSecret}`;
}

async function sendFailureAlert(error: unknown): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
        console.warn('[Cron check-new-avisos] ADMIN_EMAIL não configurado — alerta de falha não enviado.');
        return;
    }

    const message = error instanceof Error ? error.message : String(error);
    try {
        await resend.emails.send({
            from: EMAIL_FROM,
            to: adminEmail,
            subject: '⚠️ Cron check-new-avisos falhou',
            html: `<p>O cron diário <code>/api/cron/check-new-avisos</code> falhou após ${MAX_ATTEMPTS} tentativas.</p>` +
                `<p><strong>Erro:</strong> ${message}</p>` +
                `<p>${new Date().toISOString()}</p>`,
        });
    } catch (alertError) {
        console.error('[Cron check-new-avisos] Falha ao enviar alerta:', alertError);
    }
}

export async function GET(request: NextRequest) {
    if (!verifyCronSecret(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let lastError: unknown = null;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
            const result = await checkNewAvisosCompatibility();
            return NextResponse.json({
                success: true,
                data: result,
                attempt,
                timestamp: new Date().toISOString(),
            });
        } catch (error) {
            lastError = error;
            console.error(`[Cron check-new-avisos] Tentativa ${attempt}/${MAX_ATTEMPTS} falhou:`, error);
            if (attempt < MAX_ATTEMPTS) {
                await new Promise((resolve) => setTimeout(resolve, BACKOFF_MS * attempt));
            }
        }
    }

    await sendFailureAlert(lastError);
    return NextResponse.json(
        { success: false, error: 'Cron falhou após retries', attempts: MAX_ATTEMPTS },
        { status: 500 },
    );
}
