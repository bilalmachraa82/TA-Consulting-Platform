import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PORTAL_CONFIGS } from '@/lib/scraper/portal-configs';
import { scrapeAvisos } from '@/lib/firecrawl';

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
        const { portal } = body;

        const config = PORTAL_CONFIGS[portal];
        if (!config) {
            return NextResponse.json(
                { success: false, error: `Portal '${portal}' não configurado` },
                { status: 400 }
            );
        }

        console.log(`🚀 Iniciando scraping Firecrawl para: ${config.name}`);

        // Coleta avisos de todas as URLs configuradas para este portal
        let todosAvisos: any[] = [];

        for (const url of config.avisoUrls) {
            console.log(`📄 Scraping URL: ${url}`);
            const avisos = await scrapeAvisos(url, {
                prompt: config.prompt,
                actions: config.actions,
                waitFor: config.waitFor,
            });

            const avisosEnriquecidos = avisos.map((a: any) => normalizeAviso(a, config, url));
            todosAvisos = [...todosAvisos, ...avisosEnriquecidos];
        }

        // Fallback para casos em que Firecrawl não devolve dados
        if (todosAvisos.length === 0) {
            const fallback = await runFallbackScraper(portal);
            if (fallback.length > 0) {
                todosAvisos = fallback.map((a: any) => normalizeAviso(a, config, a.url || config.baseUrl));
                console.log(`ℹ️ Usando fallback scraper para ${portal}: ${todosAvisos.length} avisos`);
            }
        }

        // Deduplicar por URL ou título
        const vistos = new Set<string>();
        todosAvisos = todosAvisos.filter(aviso => {
            const chave = aviso.url || aviso.titulo;
            if (!chave) return false;
            if (vistos.has(chave)) return false;
            vistos.add(chave);
            return true;
        });

        console.log(`✅ Scraping concluído. Total avisos: ${todosAvisos.length}`);

        return NextResponse.json({
            success: true,
            portal: config.name,
            count: todosAvisos.length,
            data: todosAvisos
        });

    } catch (error: any) {
        console.error('❌ Erro na API scraper/firecrawl:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

function normalizeAviso(aviso: any, config: (typeof PORTAL_CONFIGS)[keyof typeof PORTAL_CONFIGS], sourceUrl: string) {
    const base = new URL(config.baseUrl);

    const absoluteUrl = aviso.url
        ? toAbsoluteUrl(aviso.url, base)
        : sourceUrl;

    const pdfUrl = aviso.pdf_url ? toAbsoluteUrl(aviso.pdf_url, base) : undefined;

    const anexos = Array.isArray(aviso.anexos)
        ? aviso.anexos.map((anexo: any) => ({
            nome: anexo.nome || 'Documento',
            url: toAbsoluteUrl(anexo.url, base),
        })).filter((a: any) => !!a.url)
        : [];

    return {
        ...aviso,
        titulo: aviso.titulo || aviso.nome || 'Aviso sem título',
        descricao: aviso.descricao || aviso.description || '',
        fonte: aviso.fonte || config.name,
        programa: aviso.programa || config.programaDefault,
        linha: aviso.linha || config.linhaDefault,
        url: absoluteUrl,
        pdf_url: pdfUrl,
        anexos,
        scraped_at: new Date().toISOString(),
    };
}

function toAbsoluteUrl(candidate: string, base: URL) {
    try {
        if (!candidate) return undefined;
        const trimmed = candidate.trim();
        if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
            return trimmed;
        }
        return new URL(trimmed, base).toString();
    } catch {
        return undefined;
    }
}

async function runFallbackScraper(portal: string) {
    try {
        switch (portal) {
            case 'portugal2030': {
                const { default: scrapePortugal2030 } = await import('@/scripts/scrapers/portugal2030-scraper');
                return await scrapePortugal2030();
            }
            case 'prr': {
                const { scrapePRR } = await import('@/scripts/scrapers/prr-scraper');
                return await scrapePRR();
            }
            case 'pepac': {
                const { default: scrapePEPAC } = await import('@/scripts/scrapers/pepac-scraper');
                return await scrapePEPAC();
            }
            default:
                return [];
        }
    } catch (err) {
        console.warn(`⚠️ Fallback scraper falhou para ${portal}:`, (err as Error).message);
        return [];
    }
}
