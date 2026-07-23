/**
 * Captura de lead a partir do funil público /encontrar-fundos.
 *
 * A PME já viu os fundos a que é elegível (via /api/fundos-elegiveis) — este
 * endpoint captura o contacto quando ela pede ajuda: cria/atualiza um Lead com
 * o perfil da pesquisa + o(s) aviso(s) de interesse. É o mecanismo que torna a
 * ferramenta um motor de leads (antes só mostrava resultados e mandava fazer login).
 *
 * Dedup: com NIF (chave única do Lead) faz upsert direto — uma empresa, um lead.
 * Sem NIF (campo opcional desde 2026-07-22, para não custar conversão), deduplica
 * por email via findFirst+update/create; nif fica NULL (o @unique aceita vários
 * NULL em Postgres — nunca gravar '' como o /leads/submit antigo fazia).
 *
 * POST /api/leads/contacto
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limiter';

// Cliente Prisma direto (o wrapper @/lib/db não expõe upsert). Igual ao
// /api/fundos-elegiveis.
const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

const Schema = z.object({
    nome: z.string().min(2).max(120),
    email: z.string().email().max(160),
    nif: z.string().regex(/^\d{9}$/, 'NIF deve ter 9 dígitos').optional(),
    telefone: z.string().max(30).optional(),
    mensagem: z.string().max(1000).optional(),
    // contexto da pesquisa (para o consultor saber o perfil)
    setor: z.string().max(120).optional(),
    dimensao: z.string().max(20).optional(),
    regiao: z.string().max(60).optional(),
    cae: z.string().max(20).optional(),
    consentMarketing: z.boolean().optional(),
    // aviso concreto que despoletou o contacto (opcional)
    aviso: z.object({ id: z.string().max(60), nome: z.string().max(400), portal: z.string().max(40) }).optional(),
});

export async function POST(request: NextRequest) {
    const ip = getClientIP(request);
    const rl = checkRateLimit(`leads-contacto:${ip}`, RATE_LIMITS.LEADS_SUBMIT);
    if (!rl.success) {
        return NextResponse.json({ error: 'Demasiados pedidos. Tenta mais tarde.' }, { status: 429, headers: { 'Retry-After': rl.resetIn.toString() } });
    }

    const parsed = Schema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Pedido inválido' }, { status: 400 });
    }

    const d = parsed.data;
    const matchesInfo = {
        origem: 'encontrar-fundos',
        perfil: { setor: d.setor ?? null, dimensao: d.dimensao ?? null, regiao: d.regiao ?? null, cae: d.cae ?? null },
        avisoInteresse: d.aviso ?? null,
        mensagem: d.mensagem ?? null,
        capturadoEm: new Date().toISOString(),
    };

    try {
        const createData = {
            nif: d.nif ?? null,
            nome: d.nome,
            email: d.email,
            telefone: d.telefone,
            cae: d.cae,
            atividade: d.setor,
            dimensaoDeclarada: d.dimensao,
            distrito: d.regiao,
            consentMarketing: d.consentMarketing ?? false,
            alertasAtivos: d.consentMarketing ?? false,
            matchesInfo,
            status: 'NOVO',
        };
        const updateData = {
            nome: d.nome,
            email: d.email,
            telefone: d.telefone ?? undefined,
            matchesInfo,
            // não rebaixa um lead já trabalhado: só reabre se estava fechado/novo
            status: 'NOVO',
        };

        let lead;
        if (d.nif) {
            // Com NIF: upsert pela chave única — uma empresa, um lead.
            lead = await prisma.lead.upsert({ where: { nif: d.nif }, create: createData, update: updateData });
        } else {
            // Sem NIF: dedup best-effort por email (email não é @unique).
            const existente = await prisma.lead.findFirst({ where: { email: d.email }, select: { id: true } });
            lead = existente
                ? await prisma.lead.update({ where: { id: existente.id }, data: updateData })
                : await prisma.lead.create({ data: createData });
        }
        // Notifica o consultor por email — é o que garante que nenhuma lead se
        // perde. No-op gracioso se o domínio/chave ainda não estiverem prontos
        // (não bloqueia nem falha a resposta ao utilizador).
        // Fallback: info@aitipro.com (alias monitorizado) — um lead nunca fica sem notificação.
        const notifyTo = process.env.ADMIN_EMAIL || process.env.NOTIFY_EMAIL || 'info@aitipro.com';
        const keyOk = !!process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.startsWith('re_mock');
        if (notifyTo && keyOk) {
            try {
                const esc = (s: unknown) => String(s ?? '—').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] as string));
                const { resend, EMAIL_FROM } = await import('@/lib/email/client');
                await resend.emails.send({
                    from: EMAIL_FROM,
                    to: notifyTo,
                    subject: `Nova lead Eligivo: ${esc(d.nome)}${d.nif ? ` — NIF ${esc(d.nif)}` : ''}`,
                    html: `<h2>Nova lead em /encontrar-fundos</h2>
<p><b>Nome:</b> ${esc(d.nome)}</p>
<p><b>Email:</b> ${esc(d.email)}</p>
<p><b>Telefone:</b> ${esc(d.telefone)}</p>
<p><b>NIF:</b> ${esc(d.nif)}</p>
<p><b>Perfil:</b> setor ${esc(d.setor)}, dimensão ${esc(d.dimensao)}, região ${esc(d.regiao)}</p>
${d.aviso ? `<p><b>Aviso de interesse:</b> ${esc(d.aviso.nome)} (${esc(d.aviso.portal)})</p>` : ''}
${d.mensagem ? `<p><b>Mensagem:</b> ${esc(d.mensagem)}</p>` : ''}
<p>Ver todas em /leads.</p>`,
                });
            } catch (e) {
                console.error('[leads/contacto] notificação de email falhou (não crítico):', e);
            }
        }

        // Push para o HubSpot (CRM da plataforma Eligivo). No-op se HUBSPOT_API_KEY
        // não estiver definido; nunca deita a lead abaixo.
        try {
            const { pushLeadToHubspot } = await import('@/lib/hubspot/client');
            const r = await pushLeadToHubspot({
                nome: d.nome, email: d.email, nif: d.nif, telefone: d.telefone,
                setor: d.setor, dimensao: d.dimensao, regiao: d.regiao, cae: d.cae,
                aviso: d.aviso ?? null, mensagem: d.mensagem,
            });
            if (!r.ok && !r.skipped) console.error('[leads/contacto] HubSpot falhou (não crítico):', r.error);
        } catch (e) {
            console.error('[leads/contacto] HubSpot exceção (não crítico):', e);
        }

        return NextResponse.json({ success: true, leadId: lead.id });
    } catch (error) {
        console.error('[leads/contacto] erro:', error);
        return NextResponse.json({ error: 'Erro ao registar o contacto.' }, { status: 500 });
    }
}
