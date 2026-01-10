import { NextRequest, NextResponse } from 'next/server';
import { lookupNif } from '@/lib/nif-provider';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const nif = searchParams.get('nif');

        if (!nif) {
            return NextResponse.json({ error: 'NIF é obrigatório' }, { status: 400 });
        }

        const result = await lookupNif(nif);

        return NextResponse.json(result);

    } catch (error) {
        console.error('NIF validation error:', error);
        return NextResponse.json(
            { error: 'Erro ao validar NIF' },
            { status: 500 }
        );
    }
}
