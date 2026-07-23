/**
 * Subscrição de alertas por setor (fase B) — passo 1 do double opt-in.
 * POST { email, setor, consent } → Lead PENDENTE + email de confirmação.
 *
 * Anti-abuso (eng review, voz externa #11): o rate-limiter in-memory não
 * protege em serverless — o limite REAL é por-email na BD (reenvio de
 * confirmação no máx. 1×/10min). O in-memory fica como 1ª linha barata por IP.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limiter';
import { gerarToken } from '@/lib/alert-tokens';
import { SITE_URL } from '@/lib/site-url';
import { SETORES } from '@/lib/setores';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

const Schema = z.object({
    email: z.string().email().max(160),
    setor: z.string().max(60),
    consent: z.literal(true, { errorMap: () => ({ message: 'Consentimento obrigatório' }) }),
    origem: z.string().max(160).optional(),
});

export async function POST(request: NextRequest) {
    const ip = getClientIP(request);
    const rl = checkRateLimit(`alertas-sub:${ip}`, RATE_LIMITS.LEADS_SUBMIT);
    if (!rl.success) {
        return NextResponse.json({ error: 'Demasiados pedidos. Tenta mais tarde.' }, { status: 429 });
    }

    const parsed = Schema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Pedido inválido' }, { status: 400 });
    }
    const email = parsed.data.email.toLowerCase().trim();
    const setorLabel = SETORES.find((s) => s.slug === parsed.data.setor || s.label === parsed.data.setor)?.label ?? parsed.data.setor;

    try {
        const existente = await prisma.lead.findFirst({
            where: { email },
            select: { id: true, alertasEstado: true, updatedAt: true },
        });

        // Limite por-email persistido: PENDENTE atualizado há <10min → não reenviar.
        if (existente?.alertasEstado === 'PENDENTE' && Date.now() - existente.updatedAt.getTime() < 10 * 60_000) {
            return NextResponse.json({ success: true, estado: 'PENDENTE', reenvio: false });
        }
        if (existente?.alertasEstado === 'ATIVO') {
            // já ativo: atualiza só o setor (idempotente, sem novo email)
            await prisma.lead.update({ where: { id: existente.id }, data: { setorPreferido: setorLabel } });
            return NextResponse.json({ success: true, estado: 'ATIVO' });
        }

        if (existente) {
            await prisma.lead.update({
                where: { id: existente.id },
                data: { setorPreferido: setorLabel, alertasEstado: 'PENDENTE', consentMarketing: true, origem: parsed.data.origem ?? undefined },
            });
        } else {
            await prisma.lead.create({
                data: {
                    email, nome: email.split('@')[0], nif: null,
                    setorPreferido: setorLabel, alertasEstado: 'PENDENTE',
                    consentMarketing: true, origem: parsed.data.origem ?? null, status: 'NOVO',
                },
            });
        }

        // Email de confirmação (não bloqueia a resposta em caso de falha do envio)
        const keyOk = !!process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.startsWith('re_mock');
        if (keyOk) {
            const token = gerarToken(email, 'confirm');
            const url = `${SITE_URL}/api/alertas/confirmar?token=${token}`;
            const { resend, EMAIL_FROM } = await import('@/lib/email/client');
            await resend.emails.send({
                from: EMAIL_FROM,
                to: email,
                subject: `Confirma os teus alertas de fundos — ${setorLabel}`,
                html: `<h2>Confirma a subscrição</h2>
<p>Pediste alertas semanais de novos fundos para <b>${setorLabel}</b> no Eligivo.</p>
<p><a href="${url}" style="background:#10b981;color:#0a0b0f;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600">Confirmar alertas</a></p>
<p style="color:#64748b;font-size:13px">O link expira em 48 horas. Se não pediste isto, ignora este email.</p>`,
            }).catch((e) => console.error('[alertas/subscrever] email falhou:', e));
        }

        return NextResponse.json({ success: true, estado: 'PENDENTE' });
    } catch (error) {
        console.error('[alertas/subscrever] erro:', error);
        return NextResponse.json({ error: 'Erro ao subscrever.' }, { status: 500 });
    }
}
