/**
 * Company Intel API - Enrich company data from NIF
 * 
 * POST /api/company-intel
 * Body: { nif: string }
 * 
 * Returns: CompanyProfile with enriched data
 */

import { NextRequest, NextResponse } from 'next/server';
import { enrichCompanyData, quickValidateNif } from '@/lib/agents/company-intel';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const CompanyIntelSchema = z.object({
    nif: z.string().min(9).max(9),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const parseResult = CompanyIntelSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(
                { success: false, error: 'NIF inválido - deve ter 9 dígitos' },
                { status: 400 }
            );
        }

        const { nif } = parseResult.data;

        // Quick format validation
        const validation = quickValidateNif(nif);
        if (!validation.valid) {
            return NextResponse.json(
                { success: false, error: validation.error },
                { status: 400 }
            );
        }

        // Get enriched company data
        console.log(`[Company Intel API] Enriching NIF ${nif}...`);
        const company = await enrichCompanyData(nif);

        // Check if we have meaningful data
        if (company.errors?.length && !company.nome) {
            return NextResponse.json({
                success: false,
                error: company.errors[0] || 'Não foi possível obter dados da empresa',
            });
        }

        // Transform to API response format
        return NextResponse.json({
            success: true,
            company: {
                nif: company.nif,
                nome: company.nome,
                morada: company.morada,
                codigoPostal: company.codigoPostal,
                concelho: company.concelho,
                distrito: company.distrito,
                nutII: company.nutII,
                nutIII: company.nutIII,
                cae: company.caePrincipal?.codigo,
                atividade: company.caePrincipal?.descricao || company.atividade,
                caesSecundarios: company.caesSecundarios,
                dimensao: company.dimensao,
                empregados: company.empregados,
                fontes: company.fontes,
                confianca: company.confianca,
            },
            errors: company.errors,
        });

    } catch (error: unknown) {
        console.error('[Company Intel API Error]:', error);
        return NextResponse.json(
            { success: false, error: 'Erro ao processar pedido' },
            { status: 500 }
        );
    }
}
