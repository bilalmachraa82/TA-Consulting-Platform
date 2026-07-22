
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limiter';
import { prisma } from '@/lib/db';
import { empresaScope } from '@/lib/auth/tenant';
import { CandidaturaGenerator } from '@/lib/ai-writer/candidatura-generator';

const generator = new CandidaturaGenerator();

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const ip = getClientIP(req);
        const rateLimit = checkRateLimit(`writer-candidatura:${ip}`, RATE_LIMITS.API_GENERAL);
        if (!rateLimit.success) {
            return new NextResponse('Too Many Requests', { status: 429 });
        }

        const body = await req.json();
        const { sectionId, empresaId, avisoId, userInstructions, useOpus } = body;

        if (!sectionId || !empresaId || !avisoId) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        // 3. Fetch Context Data
        const empresa = await prisma.empresa.findFirst({
            where: { AND: [{ id: empresaId }, empresaScope(session)] },
            include: { documentos: true }
        });

        const aviso = await prisma.aviso.findUnique({
            where: { id: avisoId },
            include: {
                chunks: { take: 20 } // RAG Context expandido para elite
            }
        });

        if (!empresa || !aviso) {
            return new NextResponse('Resource not found', { status: 404 });
        }

        // 4. Generate Stream
        const stream = await generator.generateSectionStream(sectionId, {
            empresa,
            aviso,
            chunks: aviso.chunks,
            docsContext: empresa.documentos && empresa.documentos.length > 0
                ? `A empresa tem ${empresa.documentos.length} documentos anexados. Foca no histórico de inovação mencionado.`
                : undefined,
            userInstructions,
        }, !!useOpus);

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });

    } catch (error) {
        console.error('Writer API Error:', error);
        return new NextResponse('Internal AI Error', { status: 500 });
    }
}
