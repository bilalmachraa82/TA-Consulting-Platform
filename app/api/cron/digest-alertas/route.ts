/**
 * Digest semanal de alertas (fase B) — Vercel Cron, 2ª feira 08:00 UTC (9h Lisboa
 * no inverno, 9h de verão via 8h UTC ≈ ok; decisão eng review: UTC explícito).
 *
 * Semântica de retoma (voz externa #16): envia apenas a leads ATIVOS cujo
 * lastAlertSentAt é null ou < now-6d; atualiza lastAlertSentAt POR LOTE logo
 * após envio — se o cron estourar a meio, o retrigger manual só reenvia aos
 * que faltam. Semana sem avisos novos do setor → zero emails (por desenho).
 *
 * Eficiência (issue 6A): 1 query de avisos novos + agrupamento em memória por
 * setor + resend.batch.send em lotes ≤100.
 */
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { SETORES, avisoPertenceAoSetor } from '@/lib/setores';
import { gerarToken } from '@/lib/alert-tokens';
import { SITE_URL } from '@/lib/site-url';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(request: NextRequest) {
    // Vercel Cron envia Authorization: Bearer ${CRON_SECRET}
    const auth = request.headers.get('authorization');
    if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const keyOk = !!process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.startsWith('re_mock');
    if (!keyOk) return NextResponse.json({ ok: true, skipped: 'RESEND_API_KEY não configurada' });

    const seteDiasAtras = new Date(Date.now() - 7 * 86_400_000);
    const seisDiasAtras = new Date(Date.now() - 6 * 86_400_000);

    try {
        // 1 query: avisos novos da semana, ainda abertos, com página pública
        const novos = await prisma.aviso.findMany({
            where: { createdAt: { gte: seteDiasAtras }, slug: { not: null }, dataFimSubmissao: { gte: new Date() } },
            select: { slug: true, nome: true, descricao: true, setoresElegiveis: true, dataFimSubmissao: true, montanteMaximo: true },
        });

        // agrupar por setor (taxonomia partilhada)
        const porSetor = new Map<string, typeof novos>();
        for (const s of SETORES) {
            const doSetor = novos.filter((a) => avisoPertenceAoSetor(a, s));
            if (doSetor.length > 0) porSetor.set(s.label, doSetor);
        }
        if (porSetor.size === 0) return NextResponse.json({ ok: true, enviados: 0, motivo: 'sem avisos novos' });

        // subscritores ATIVOS por enviar esta semana
        const leads = await prisma.lead.findMany({
            where: {
                alertasEstado: 'ATIVO',
                setorPreferido: { in: [...porSetor.keys()] },
                OR: [{ lastAlertSentAt: null }, { lastAlertSentAt: { lt: seisDiasAtras } }],
            },
            select: { id: true, email: true, setorPreferido: true },
        });
        if (leads.length === 0) return NextResponse.json({ ok: true, enviados: 0, motivo: 'sem subscritores por enviar' });

        const { resend, EMAIL_FROM } = await import('@/lib/email/client');
        let enviados = 0;

        for (const [setorLabel, avisos] of porSetor) {
            const doSetor = leads.filter((l) => l.setorPreferido === setorLabel);
            for (let i = 0; i < doSetor.length; i += 100) {
                const lote = doSetor.slice(i, i + 100);
                const emails = lote.map((l) => {
                    const unsub = `${SITE_URL}/api/alertas/unsubscribe?token=${gerarToken(l.email, 'unsub')}`;
                    const lista = avisos.slice(0, 6).map((a) =>
                        `<li style="margin-bottom:10px"><a href="${SITE_URL}/avisos/${a.slug}" style="color:#10b981;font-weight:600">${a.nome}</a>` +
                        `${a.dataFimSubmissao ? ` — até ${a.dataFimSubmissao.toLocaleDateString('pt-PT')}` : ''}` +
                        `${a.montanteMaximo ? ` · até €${a.montanteMaximo.toLocaleString('pt-PT')}` : ''}</li>`,
                    ).join('');
                    return {
                        from: EMAIL_FROM,
                        to: l.email,
                        subject: `${avisos.length} novo${avisos.length > 1 ? 's' : ''} fundo${avisos.length > 1 ? 's' : ''} de ${setorLabel} esta semana`,
                        html: `<h2>Novos fundos de ${setorLabel}</h2><ul>${lista}</ul>
<p><a href="${SITE_URL}/fundos/${SETORES.find((s) => s.label === setorLabel)?.slug ?? ''}">Ver todos os abertos →</a></p>
<p style="color:#64748b;font-size:12px;margin-top:24px"><a href="${unsub}" style="color:#64748b">Cancelar alertas</a> · Eligivo</p>`,
                    };
                });
                const res = await resend.batch.send(emails);
                if (!res.error) {
                    // marca POR LOTE — retoma segura se estourar a meio
                    await prisma.lead.updateMany({ where: { id: { in: lote.map((l) => l.id) } }, data: { lastAlertSentAt: new Date() } });
                    enviados += lote.length;
                } else {
                    console.error('[digest-alertas] lote falhou:', res.error);
                }
            }
        }
        return NextResponse.json({ ok: true, enviados, setores: porSetor.size, avisosNovos: novos.length });
    } catch (error) {
        console.error('[digest-alertas] erro:', error);
        return NextResponse.json({ error: 'Erro no digest' }, { status: 500 });
    }
}
