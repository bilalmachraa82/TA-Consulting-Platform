/**
 * Unsubscribe de 1 clique (fase B) — obrigatório legal e de deliverability.
 * GET ?token=… (token sem expiração) → CANCELADO.
 */
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verificarToken } from '@/lib/alert-tokens';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const token = request.nextUrl.searchParams.get('token') ?? '';
    const v = verificarToken(token, 'unsub');

    const html = (titulo: string, corpo: string, ok: boolean) =>
        new NextResponse(
            `<!doctype html><html lang="pt"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<meta name="robots" content="noindex"><title>${titulo} — Eligivo</title></head>
<body style="margin:0;background:#0a0b0f;color:#e8ecef;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh">
<div style="max-width:420px;padding:40px;text-align:center">
<h1 style="font-size:24px;margin:0 0 10px">${titulo}</h1>
<p style="color:#9aa3ad;line-height:1.6">${corpo}</p>
</div></body></html>`,
            { status: ok ? 200 : 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
        );

    if (!v.ok) return html('Link inválido', 'Este link de cancelamento não é válido.', false);

    try {
        const lead = await prisma.lead.findFirst({ where: { email: v.email }, select: { id: true } });
        if (lead) {
            await prisma.lead.update({
                where: { id: lead.id },
                data: { alertasEstado: 'CANCELADO', alertasAtivos: false },
            });
        }
        // idempotente e sem revelar se o email existe
        return html('Alertas cancelados', 'Não vais receber mais emails de alertas. Podes voltar a subscrever quando quiseres.', true);
    } catch (error) {
        console.error('[alertas/unsubscribe] erro:', error);
        return html('Erro', 'Não foi possível cancelar. Tenta novamente.', false);
    }
}
