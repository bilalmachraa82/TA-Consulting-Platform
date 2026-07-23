/**
 * Confirmação do double opt-in (fase B) — passo 2. GET ?token=… → ATIVO.
 * Resposta: mini-página HTML branded (o utilizador chega de um clique de email).
 */
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verificarToken } from '@/lib/alert-tokens';
import { SITE_URL } from '@/lib/site-url';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

function pagina(titulo: string, corpo: string, ok: boolean): NextResponse {
    const html = `<!doctype html><html lang="pt"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<meta name="robots" content="noindex"><title>${titulo} — Eligivo</title></head>
<body style="margin:0;background:#0a0b0f;color:#e8ecef;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh">
<div style="max-width:420px;padding:40px;text-align:center">
<div style="width:44px;height:44px;border-radius:10px;background:${ok ? '#10b981' : '#64748b'};color:#0a0b0f;font-weight:700;font-size:22px;line-height:44px;margin:0 auto 18px">e</div>
<h1 style="font-size:24px;margin:0 0 10px">${titulo}</h1>
<p style="color:#9aa3ad;line-height:1.6">${corpo}</p>
<a href="${SITE_URL}/encontrar-fundos" style="display:inline-block;margin-top:16px;background:#10b981;color:#0a0b0f;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600">Verificar elegibilidade</a>
</div></body></html>`;
    return new NextResponse(html, { status: ok ? 200 : 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

export async function GET(request: NextRequest) {
    const token = request.nextUrl.searchParams.get('token') ?? '';
    const v = verificarToken(token, 'confirm');

    if (!v.ok) {
        return pagina(
            v.motivo === 'expirado' ? 'Link expirado' : 'Link inválido',
            v.motivo === 'expirado'
                ? 'Este link de confirmação passou das 48 horas. Volta a subscrever os alertas para receberes um novo.'
                : 'Este link não é válido. Subscreve os alertas de novo na página de qualquer setor.',
            false,
        );
    }

    try {
        const lead = await prisma.lead.findFirst({ where: { email: v.email }, select: { id: true, setorPreferido: true } });
        if (!lead) return pagina('Subscrição não encontrada', 'Volta a subscrever os alertas na página do teu setor.', false);
        await prisma.lead.update({ where: { id: lead.id }, data: { alertasEstado: 'ATIVO', alertasAtivos: true } });
        return pagina(
            'Alertas ativos ✓',
            `Vais receber um resumo semanal dos novos fundos de ${lead.setorPreferido ?? 'todos os setores'}. Podes cancelar em qualquer email.`,
            true,
        );
    } catch (error) {
        console.error('[alertas/confirmar] erro:', error);
        return pagina('Erro', 'Não foi possível confirmar. Tenta novamente.', false);
    }
}
