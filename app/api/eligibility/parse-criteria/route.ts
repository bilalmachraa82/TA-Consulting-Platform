import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { parseCriteriaFromText } from '@/lib/ai/criteria-parser';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const body = await request.json();
        const { text } = body;

        if (!text || typeof text !== 'string') {
            return NextResponse.json({ error: 'Texto obrigatório' }, { status: 400 });
        }

        // Limit text length to avoid token limits/costs
        const truncatedText = text.slice(0, 15000);

        const criteria = await parseCriteriaFromText(truncatedText);

        return NextResponse.json({ criteria });

    } catch (error) {
        console.error('[Criteria Parser API Error]:', error);
        return NextResponse.json(
            { error: 'Erro ao processar texto com AI' },
            { status: 500 }
        );
    }
}
