import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BrowserAutomation } from '@/lib/scraper/browser-automation';

// Puppeteer só funciona em runtime Node.js
export const runtime = 'nodejs';

const PORTAL_CONFIGS = {
    'portugal2030': {
        name: 'Portugal 2030',
        scraper: 'scrapePortugal2030',
        requiresBrowser: true,
        interceptApi: true
    },
    'prr': {
        name: 'PRR',
        scraper: 'scrapePRR',
        requiresBrowser: true,
        interceptApi: true
    },
    'ipdj': {
        name: 'IPDJ',
        scraper: 'scrapeIPDJ',
        requiresBrowser: true,
        interceptApi: false
    }
};

export async function POST(req: Request) {
    const startTime = Date.now();
    let automation: BrowserAutomation | null = null;

    try {
        // Auth guard - browser automation consome recursos (apenas admin)
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        if (session.user.role !== 'admin') {
            return NextResponse.json({ success: false, error: 'Forbidden: requires admin role' }, { status: 403 });
        }

        const body = await req.json();
        const { portal, options } = body as {
            portal: string;
            options?: { waitTime?: number; screenshots?: boolean }
        };

        if (!(portal in PORTAL_CONFIGS)) {
            return NextResponse.json(
                { success: false, error: `Portal '${portal}' não configurado` },
                { status: 400 }
            );
        }
        const config = PORTAL_CONFIGS[portal as keyof typeof PORTAL_CONFIGS];

        console.log(`🤖 Iniciando browser automation para: ${config.name}`);

        // Inicializar browser automation
        automation = new BrowserAutomation();
        const page = await automation.initialize({
            waitTime: options?.waitTime ?? 3000,
            interceptApi: config.interceptApi,
            screenshots: options?.screenshots ?? false
        });

        // Executar scraper específico
        let results: Record<string, unknown>[] = [];
        switch (portal) {
            case 'portugal2030':
                results = await automation.scrapePortugal2030();
                break;
            case 'prr':
                results = await automation.scrapePRR();
                break;
            case 'ipdj':
                results = await automation.scrapeIPDJ();
                break;
        }

        // Enriquecer resultados
        const enrichedResults = results.map(item => ({
            ...item,
            fonte: config.name,
            metodo: 'browser-automation',
            scraped_at: new Date().toISOString()
        }));

        const duration = Date.now() - startTime;

        console.log(`✅ Browser automation concluído em ${duration}ms`);
        console.log(`📊 Total de itens: ${enrichedResults.length}`);

        return NextResponse.json({
            success: true,
            portal: config.name,
            method: 'browser-automation',
            count: enrichedResults.length,
            duration_ms: duration,
            data: enrichedResults
        });

    } catch (error: any) {
        console.error('❌ Erro na browser automation:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        );
    } finally {
        // Sempre fechar o browser
        if (automation) {
            await automation.close();
        }
    }
}
