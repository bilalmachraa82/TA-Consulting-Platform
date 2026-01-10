import FirecrawlApp, { ScrapeOptions } from 'firecrawl';
import { z } from 'zod';
import { AvisoSchema } from './schemas/aviso';

const apiKey = process.env.FIRECRAWL_API_KEY;

if (!apiKey) {
    console.warn("⚠️ FIRECRAWL_API_KEY não definida no ambiente. O scraper falhará.");
}

export const firecrawlApp = new FirecrawlApp({
    apiKey: apiKey || 'fc-placeholder'
});

export interface ScrapeAvisosOptions {
    prompt?: string;
    actions?: ScrapeOptions['actions'];
    waitFor?: number;
    includeMarkdown?: boolean;
}

const DEFAULT_PROMPT = [
    'Extrai todos os avisos/concursos visíveis na página.',
    'Devolve SEMPRE JSON no formato { avisos: [...] } que respeite o schema fornecido.',
    'Inclui links absolutos, datas de abertura/fecho em YYYY-MM-DD e pdf_url/anexos para qualquer link .pdf.'
].join(' ');

export async function scrapeAvisos(url: string, options: ScrapeAvisosOptions = {}) {
    try {
        const scrapeResult = await firecrawlApp.scrape(url, {
            formats: [
                {
                    type: "json",
                    prompt: options.prompt || DEFAULT_PROMPT,
                    schema: z.object({
                        avisos: z.array(AvisoSchema)
                    })
                },
                options.includeMarkdown === false ? undefined : "markdown"
            ].filter(Boolean) as ScrapeOptions['formats'],
            actions: options.actions || [
                { type: "scroll", direction: "down" }
            ],
            waitFor: options.waitFor ?? 18000,
            timeout: 40000,
            fastMode: true,
        });

        const documentJson = (scrapeResult as any)?.json;
        const avisos = (documentJson as any)?.avisos || [];

        if (avisos.length === 0) {
            console.warn(`⚠️ Nenhum aviso encontrado em ${url}`);
            const markdownPreview = (scrapeResult as any)?.markdown;
            if (markdownPreview) {
                console.log("Markdown preview:", markdownPreview.substring(0, 400));
            }
        }

        return avisos;

    } catch (error) {
        console.error(`❌ Exceção no scrape de ${url}:`, error);
        return [];
    }
}
