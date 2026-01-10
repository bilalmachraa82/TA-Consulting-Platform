/**
 * API Route: /api/bitrix/companies
 * Returns companies from Bitrix24 (read-only, paginated)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCompanies, getCompaniesByCAE, getCAEDescription } from '@/lib/bitrix/client';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const start = parseInt(searchParams.get('start') || '0');
        const cae = searchParams.get('cae');

        let response;

        if (cae) {
            // Filter by CAE code
            response = await getCompaniesByCAE(cae, { start });
        } else {
            // Get all companies
            response = await getCompanies({
                start,
                select: ['ID', 'TITLE', 'UF_CRM_1738505715849', 'ADDRESS_REGION', 'ADDRESS_CITY', 'PHONE', 'EMAIL', 'EMPLOYEES'],
            });
        }

        // Enrich with CAE descriptions
        const enrichedCompanies = response.result.map(company => ({
            ...company,
            CAE_DESCRIPTION: company.UF_CRM_1738505715849
                ? getCAEDescription(company.UF_CRM_1738505715849)
                : null,
        }));

        return NextResponse.json({
            success: true,
            companies: enrichedCompanies,
            total: response.total,
            start,
            next: response.next,
            hasMore: response.next !== undefined,
        });
    } catch (error) {
        console.error('Bitrix companies error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch companies', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
