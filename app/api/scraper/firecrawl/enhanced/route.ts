import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { scrapeAvisos } from '@/lib/firecrawl';
import { scrapePRR } from '@/scripts/scrapers/prr-scraper';
import { scrapePEPAC } from '@/scripts/scrapers/pepac-scraper';
import { HorizonEuropeScraper } from '@/lib/scraper/strategies/horizon';

// Flag para desativar Puppeteer em produção (Vercel)
// Set DISABLE_PUPPETEER=true in .env for production
const PUPPETEER_ENABLED = process.env.DISABLE_PUPPETEER !== 'true';

// Configurações melhoradas baseadas na validação real
const ENHANCED_PORTAL_CONFIGS = {
    'portugal2030': {
        name: 'Portugal 2030',
        urls: ['https://portugal2030.pt/avisos/'],
        wpApiUrl: 'https://portugal2030.pt/wp-json/wp/v2/posts?per_page=20',
        requiresJs: true,
        minAvisos: 5,
        fallbackScraper: 'portugal2030'
    },
    'prr': {
        name: 'PRR',
        urls: [
            'https://recuperarportugal.gov.pt/candidaturas-prr/',
            'https://www.fundoambiental.pt/',
            'https://www.iapmei.pt/PRODUTOS-E-SERVICOS/Incentivos-Financiamento/Programas-de-Incentivos.aspx'
        ],
        requiresJs: true,
        minAvisos: 3,
        fallbackScraper: 'prr',
        useFallbackFirst: true // PRR precisa de fallback direto
    },
    'pepac': {
        name: 'PEPAC/IFAP',
        urls: [
            'https://www.ifap.pt/portal',
            'https://www.ifap.pt/portal/noticias',
            'https://www.pdr.pt/'
        ],
        requiresJs: true,
        minAvisos: 3,
        fallbackScraper: 'pepac',
        useFallbackFirst: true // IFAP bloqueia acesso fácil
    },
    'europa-criativa': {
        name: 'Europa Criativa',
        urls: ['https://www.europacriativa.eu/concursos'],
        apiUrl: 'https://my.europacriativa.eu/listaconcursos/',
        requiresJs: false,
        minAvisos: 2,
        prompt: 'Extrai TODOS os concursos listados. Inclui título, data limite/deadline, PDF se disponível. Retorna JSON { avisos: [...] }'
    },
    'ipdj': {
        name: 'IPDJ',
        urls: [
            'https://ipdj.gov.pt/apoios',
            'https://ipdj.gov.pt/programas'
        ],
        requiresJs: true,
        minAvisos: 2,
        prompt: 'Extrai programas/apoios listados. Inclui título, descrição, se houver datas ou links para PDF. Retorna JSON { avisos: [...] }'
    },
    'horizon-europe': {
        name: 'Horizon Europe',
        requiresJs: false,
        minAvisos: 100,
        useApi: true
    }
};

export async function POST(req: Request) {
    try {
        // Auth guard - scrapers consomem créditos de API (apenas admin)
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        if (session.user.role !== 'admin') {
            return NextResponse.json({ success: false, error: 'Forbidden: requires admin role' }, { status: 403 });
        }

        const body = await req.json();
        const { portal, forceQuality = false } = body as { portal: string; forceQuality?: boolean };

        if (!(portal in ENHANCED_PORTAL_CONFIGS)) {
            return NextResponse.json(
                { success: false, error: `Portal '${portal}' não configurado` },
                { status: 400 }
            );
        }
        const config = ENHANCED_PORTAL_CONFIGS[portal as keyof typeof ENHANCED_PORTAL_CONFIGS] as any;

        console.log(`🚀 Scraping avançado para: ${config.name}`);

        // Horizon Europe - usar API dedicada
        if (config.useApi) {
            console.log(`🇪🇺 Usando API oficial para ${config.name}`);
            const horizonScraper = new HorizonEuropeScraper();
            const opportunities = await horizonScraper.scrape();
            return NextResponse.json({
                success: true,
                portal: config.name,
                method: 'api',
                count: opportunities.length,
                data: opportunities
            });
        }

        // Para portais que precisam de fallback direto
        if (config.useFallbackFirst) {
            console.log(`⚡ Usando fallback prioritário para ${config.name}`);
            const fallbackResult = await runFallback(config.fallbackScraper);
            return NextResponse.json({
                success: true,
                portal: config.name,
                method: 'fallback',
                count: fallbackResult.length,
                data: fallbackResult
            });
        }

        // Portugal 2030 - tentar API WordPress primeiro
        if (portal === 'portugal2030' && config.wpApiUrl) {
            try {
                const wpResponse = await fetch(config.wpApiUrl);
                if (wpResponse.ok) {
                    const posts = await wpResponse.json();
                    const avisos = posts
                        .filter((p: any) => {
                            const title = p.title.rendered.toLowerCase();
                            const content = p.content.rendered.toLowerCase();
                            return title.includes('aviso') || title.includes('concurso') ||
                                title.includes('candidatura') || content.includes('aviso');
                        })
                        .slice(0, 10)
                        .map((p: any) => ({
                            id: `PT2030_${p.id}`,
                            titulo: p.title.rendered,
                            descricao: p.excerpt.rendered.replace(/<[^>]*>/g, ''),
                            url: p.link,
                            data_abertura: p.date.split('T')[0],
                            programa: 'Portugal 2030',
                            scraped_at: new Date().toISOString()
                        }));

                    if (avisos.length >= config.minAvisos) {
                        console.log(`✅ API WordPress retornou ${avisos.length} avisos relevantes`);
                        return NextResponse.json({
                            success: true,
                            portal: config.name,
                            method: 'wordpress-api',
                            count: avisos.length,
                            data: avisos
                        });
                    }
                }
            } catch (error) {
                console.warn('⚠️ Falha na API WordPress');
            }
        }

        // Europa Criativa - tentar API dedicada
        if (portal === 'europa-criativa' && config.apiUrl) {
            try {
                const apiResponse = await fetch(config.apiUrl);
                if (apiResponse.ok) {
                    const concursos = await apiResponse.json();
                    if (Array.isArray(concursos) && concursos.length > 0) {
                        console.log(`✅ API Europa Criativa retornou ${concursos.length} concursos`);
                        return NextResponse.json({
                            success: true,
                            portal: config.name,
                            method: 'api',
                            count: concursos.length,
                            data: concursos
                        });
                    }
                }
            } catch (error) {
                console.warn('⚠️ Falha na API Europa Criativa');
            }
        }

        // Firecrawl padrão para outros casos
        let todosAvisos: any[] = [];
        for (const url of config.urls) {
            console.log(`📄 Firecrawl URL: ${url}`);
            const avisos = await scrapeAvisos(url, {
                prompt: config.prompt,
                waitFor: config.requiresJs ? 20000 : 10000,
                actions: config.requiresJs ? [
                    { type: 'scroll', direction: 'down' },
                    { type: 'wait', ms: 2000 },
                    { type: 'scroll', direction: 'down' }
                ] as any : undefined
            });

            if (avisos && avisos.length > 0) {
                todosAvisos = [...todosAvisos, ...avisos];
            }
        }

        // Verificar qualidade dos resultados
        const hasValidData = todosAvisos.length >= config.minAvisos &&
            todosAvisos.some(a => a.titulo && a.titulo.length > 10);

        if (!hasValidData) {
            console.log(`⚠️ Firecrawl retornou apenas ${todosAvisos.length} itens. Tentando browser automation...`);

            // Tentar browser automation para portais críticos (only if enabled)
            if (PUPPETEER_ENABLED && ['portugal2030', 'prr', 'pepac', 'ipdj'].includes(portal)) {
                try {
                    console.log('🔧 Puppeteer enabled, attempting browser automation...');
                    const browserResponse = await fetch('http://localhost:3001/api/scraper/browser-automation', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            portal: portal,
                            options: { interceptApi: true }
                        })
                    });

                    if (browserResponse.ok) {
                        const browserResult = await browserResponse.json();
                        if (browserResult.success && browserResult.count > 0) {
                            console.log(`✅ Browser automation retornou ${browserResult.count} itens`);
                            return NextResponse.json({
                                success: true,
                                portal: config.name,
                                method: 'browser-automation',
                                count: browserResult.count,
                                data: browserResult.data
                            });
                        }
                    }
                } catch (browserError) {
                    console.warn('⚠️ Browser automation falhou:', browserError);
                }
            } else if (!PUPPETEER_ENABLED) {
                console.log('⚠️ Puppeteer desativado (DISABLE_PUPPETEER=true). A saltar para fallback...');
            }

            // Fallback final
            console.log(`⚠️ Usando fallback estático...`);
            const fallbackResult = await runFallback(config.fallbackScraper);
            return NextResponse.json({
                success: true,
                portal: config.name,
                method: 'fallback-quality-gate',
                count: fallbackResult.length,
                data: fallbackResult
            });
        }

        // Enriquecer dados
        todosAvisos = todosAvisos.map(aviso => ({
            ...aviso,
            fonte: config.name,
            scraped_at: new Date().toISOString()
        }));

        console.log(`✅ Scraping concluído. Total: ${todosAvisos.length}`);

        return NextResponse.json({
            success: true,
            portal: config.name,
            method: 'firecrawl',
            count: todosAvisos.length,
            data: todosAvisos
        });

    } catch (error: any) {
        console.error('❌ Erro no scraper avançado:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

async function runFallback(scraperId: string) {
    switch (scraperId) {
        case 'prr':
            return await scrapePRR();
        case 'pepac':
            return await scrapePEPAC();
        case 'portugal2030':
            // Implementar se necessário
            return [];
        default:
            return [];
    }
}