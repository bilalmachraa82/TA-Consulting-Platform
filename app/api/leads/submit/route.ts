import { NextRequest, NextResponse } from 'next/server';
import { processLeadSubmission, LeadInput, AvisoCriteria, runEligibilityCheck, EligibilityResult } from '@/lib/eligibility-engine';
import { loadAvisos } from '@/lib/aviso-loader';
import { prisma } from '@/lib/db';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limiter';

export const dynamic = 'force-dynamic';

// Validation
function validateLeadInput(body: unknown): { valid: boolean; errors: string[]; data?: LeadInput } {
    const errors: string[] = [];

    if (!body || typeof body !== 'object') {
        return { valid: false, errors: ['Invalid request body'] };
    }

    const b = body as Record<string, unknown>;

    // Required fields
    if (!b.nomeEmpresa || typeof b.nomeEmpresa !== 'string') {
        errors.push('nomeEmpresa é obrigatório');
    }
    if (!b.email || typeof b.email !== 'string' || !b.email.includes('@')) {
        errors.push('email válido é obrigatório');
    }
    if (!b.distrito || typeof b.distrito !== 'string') {
        errors.push('distrito é obrigatório');
    }
    if (!b.tipoProjetoDesejado || typeof b.tipoProjetoDesejado !== 'string') {
        errors.push('tipoProjetoDesejado é obrigatório');
    }

    if (errors.length > 0) {
        return { valid: false, errors };
    }

    // Optional fields
    const validDimensoes = ['MICRO', 'PEQUENA', 'MEDIA', 'GRANDE'];
    const dimensao = b.dimensao as string | undefined;
    if (dimensao && !validDimensoes.includes(dimensao.toUpperCase())) {
        errors.push('dimensao inválida');
    }

    if (errors.length > 0) {
        return { valid: false, errors };
    }

    return {
        valid: true,
        errors: [],
        data: {
            nomeEmpresa: b.nomeEmpresa as string,
            email: b.email as string,
            distrito: b.distrito as string,
            tipoProjetoDesejado: b.tipoProjetoDesejado as string,
            cae: b.cae as string | undefined,
            dimensao: dimensao?.toUpperCase() as LeadInput['dimensao'],
            investimentoEstimado: b.investimentoEstimado as number | undefined,
            empregados: b.empregados as number | undefined,
        },
    };
}

export async function POST(request: NextRequest) {
    try {
        // Rate limiting (prevent form spam)
        const clientIP = getClientIP(request);
        const rateCheck = checkRateLimit(`leads:${clientIP}`, RATE_LIMITS.LEADS_SUBMIT);

        if (!rateCheck.success) {
            return NextResponse.json(
                { error: 'Demasiados pedidos. Tente novamente mais tarde.', retryAfter: rateCheck.resetIn },
                {
                    status: 429,
                    headers: { 'Retry-After': rateCheck.resetIn.toString() }
                }
            );
        }

        const body = await request.json();

        // Validate input
        const validation = validateLeadInput(body);
        if (!validation.valid) {
            return NextResponse.json(
                { error: 'Validation failed', details: validation.errors },
                { status: 400 }
            );
        }

        const leadInput = validation.data!;

        // Load REAL avisos from database/scraped files
        const { avisos, source } = await loadAvisos();

        console.log(`[Lead Magnet] Loaded ${avisos.length} avisos from ${source}`);

        // Run eligibility check
        const matches = await runEligibilityCheck(leadInput, avisos);

        // Try to save lead to database
        let leadId = `lead_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 9)}`;

        try {
            const lead = await prisma.lead.create({
                data: {
                    nif: body.nif || '',
                    nome: leadInput.nomeEmpresa,
                    nomeEmpresa: leadInput.nomeEmpresa,
                    email: leadInput.email,
                    telefone: body.telefone,
                    cae: leadInput.cae,
                    dimensaoDeclarada: leadInput.dimensao,
                    empregados: leadInput.empregados,
                    distrito: leadInput.distrito,

                    // New fields
                    tipoProjeto: leadInput.tipoProjetoDesejado,
                    investimentoVal: leadInput.investimentoEstimado,
                    consentMarketing: body.consentMarketing || false,
                    alertasAtivos: body.consentMarketing || false, // If consented to marketing, enable alerts

                    scoreElegibilidade: matches.length > 0 ? matches[0].score : 0,
                    matchesInfo: JSON.parse(JSON.stringify(matches.slice(0, 10))),
                    status: 'NOVO',
                },
            });
            leadId = lead.id;
            console.log(`[Lead Magnet] Lead saved to database with ID: ${leadId}`);
        } catch (dbError) {
            console.log('[Lead Magnet] Database save skipped (table may not exist yet):', dbError);
            // Continue without database - lead was processed in-memory
        }

        return NextResponse.json({
            success: true,
            leadId,
            totalAnalisados: avisos.length,
            matchesEncontrados: matches.length,
            matches: matches.slice(0, 10),
            fonte: source,
            processedAt: new Date(),
        });

    } catch (error) {
        console.error('Lead submission error:', error);
        return NextResponse.json(
            { error: 'Erro interno ao processar submissão' },
            { status: 500 }
        );
    }
}
