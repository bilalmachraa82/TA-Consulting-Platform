/**
 * API Route: /api/bitrix/deals
 * Creates deals in Bitrix24 from matched companies (Campaign Export)
 * 
 * This is the "Pumba 500 emails" feature - mass activation of leads in Bitrix.
 * 
 * ⚠️ WRITE OPERATION - Use with caution!
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const BITRIX_WEBHOOK = process.env.BITRIX_WEBHOOK_URL ||
    "https://taconsulting.bitrix24.com/rest/744/dm213axt003upvfk/";

interface DealCreateRequest {
    avisoId: string;
    avisoNome: string;
    companies: {
        id: string;
        nome: string;
        email: string;
        telefone?: string;
        score: number;
        reasons: string[];
    }[];
}

interface BitrixDealPayload {
    TITLE: string;
    STAGE_ID: string;
    CATEGORY_ID?: number;
    COMPANY_ID?: number;
    OPPORTUNITY?: number;
    COMMENTS?: string;
    SOURCE_ID?: string;
    SOURCE_DESCRIPTION?: string;
}

async function createBitrixDeal(deal: BitrixDealPayload): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
        const response = await fetch(`${BITRIX_WEBHOOK}crm.deal.add.json`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fields: deal }),
        });

        const data = await response.json();

        if (data.error) {
            return { success: false, error: data.error_description || data.error };
        }

        return { success: true, id: String(data.result) };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

// Rate limiter for Bitrix API (max 2 requests per second)
async function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function POST(request: NextRequest) {
    try {
        // Auth check
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const body: DealCreateRequest = await request.json();
        const { avisoId, avisoNome, companies } = body;

        if (!avisoId || !companies || companies.length === 0) {
            return NextResponse.json(
                { error: 'avisoId e companies são obrigatórios' },
                { status: 400 }
            );
        }

        // Limit to 100 deals per request to avoid timeout
        const maxDeals = 100;
        if (companies.length > maxDeals) {
            return NextResponse.json(
                { error: `Máximo de ${maxDeals} deals por pedido. Envie em batches.` },
                { status: 400 }
            );
        }

        const results: { companyName: string; success: boolean; dealId?: string; error?: string }[] = [];
        let successCount = 0;
        let errorCount = 0;

        for (const company of companies) {
            // Create deal in Bitrix
            const dealPayload: BitrixDealPayload = {
                TITLE: `[Auto] ${avisoNome} - ${company.nome}`,
                STAGE_ID: 'NEW', // First stage of pipeline
                SOURCE_ID: 'AI_MATCH',
                SOURCE_DESCRIPTION: `Matchmaking automático (Score: ${company.score}). Motivos: ${company.reasons.join(', ')}`,
                COMMENTS: `
Empresa: ${company.nome}
Email: ${company.email}
Telefone: ${company.telefone || 'N/A'}
Score de Match: ${company.score}/100
Razões do Match:
${company.reasons.map(r => `- ${r}`).join('\n')}

Aviso: ${avisoNome} (ID: ${avisoId})
Criado automaticamente pelo sistema TA Consulting AI.
        `.trim(),
            };

            const result = await createBitrixDeal(dealPayload);

            results.push({
                companyName: company.nome,
                success: result.success,
                dealId: result.id,
                error: result.error,
            });

            if (result.success) {
                successCount++;
            } else {
                errorCount++;
            }

            // Rate limiting - wait 500ms between requests
            await delay(500);
        }

        return NextResponse.json({
            success: true,
            summary: {
                total: companies.length,
                created: successCount,
                failed: errorCount,
            },
            results,
            message: `${successCount} deals criados com sucesso no Bitrix24.`,
        });

    } catch (error) {
        console.error('Bitrix deal creation error:', error);
        return NextResponse.json(
            { error: 'Erro ao criar deals no Bitrix', details: error instanceof Error ? error.message : 'Unknown' },
            { status: 500 }
        );
    }
}

// GET - Get pipeline stages for reference
export async function GET() {
    try {
        // Fetch deal stages from Bitrix
        const response = await fetch(`${BITRIX_WEBHOOK}crm.status.list.json?filter[ENTITY_ID]=DEAL_STAGE`);
        const data = await response.json();

        if (data.error) {
            return NextResponse.json({ error: data.error_description }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            stages: data.result || [],
        });
    } catch (error) {
        console.error('Bitrix stages error:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar stages' },
            { status: 500 }
        );
    }
}
