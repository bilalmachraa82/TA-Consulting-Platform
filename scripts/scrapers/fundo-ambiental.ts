/**
 * Scraper do Fundo Ambiental (fundoambiental.pt).
 *
 * O site é ASPX clássico sem API: a página "Avisos Abertos e Fechados"
 * (candidaturas/formularios.aspx) lista todos os apoios por ano com links
 * no padrão `apoios-<ano>/<categoria>/<slug>.aspx`.
 *
 * v1 ingere o catálogo (título + URL + categoria + ano). O site não expõe
 * datas na listagem — as datas de submissão ficam a cargo do agente de
 * enriquecimento (fetch do link → extração estruturada), pelo que estes
 * avisos entram sem prazo e fora dos filtros de "abertos" até serem
 * enriquecidos.
 */

import axios from 'axios';

export interface FundoAmbientalInput {
    maxItems: number;
    /** Anos a incluir (default: ano corrente e anterior) */
    anos?: number[];
}

export interface FundoAmbientalAviso {
    id: string;
    codigo: string;
    titulo: string;
    programa: string;
    dotacao: number;
    status: string;
    url: string;
    fonte: string;
    descricao?: string;
}

const BASE_URL = 'https://www.fundoambiental.pt';
const LISTING_URL = `${BASE_URL}/candidaturas/formularios.aspx`;

function decodeEntities(value: string): string {
    return value
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&ndash;/g, '–')
        .replace(/&laquo;/g, '«')
        .replace(/&raquo;/g, '»')
        .replace(/\s+/g, ' ')
        .trim();
}

export async function scrapeFundoAmbiental(input: FundoAmbientalInput): Promise<FundoAmbientalAviso[]> {
    const anoAtual = new Date().getFullYear();
    const anos = input.anos ?? [anoAtual, anoAtual - 1];
    console.log(`    📡 Fundo Ambiental: Fetching listagem (anos ${anos.join(', ')})...`);

    const response = await axios.get<string>(LISTING_URL, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 30000,
        responseType: 'text',
    });

    const html = response.data;
    const avisos: FundoAmbientalAviso[] = [];
    const seen = new Set<string>();

    // href="apoios-2026/<categoria>/<slug>.aspx">…conteúdo (pode ter tags)…</a>
    const linkRegex = /href="(apoios-(\d{4})\/([^/"]+)\/([^"]+)\.aspx)"[^>]*>([\s\S]*?)<\/a>/g;
    let match: RegExpExecArray | null;

    while ((match = linkRegex.exec(html)) !== null) {
        const [, relPath, anoStr, categoria, slug, anchorContent] = match;
        const ano = parseInt(anoStr, 10);
        if (!anos.includes(ano)) continue;

        const codigo = `FA-${ano}-${slug.slice(0, 80)}`;
        if (seen.has(codigo)) continue;
        seen.add(codigo);

        // título: texto do anchor sem tags; fallback = slug humanizado
        const tituloRaw = anchorContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        const tituloFallback = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

        avisos.push({
            id: codigo,
            codigo,
            titulo: decodeEntities(tituloRaw.length >= 5 ? tituloRaw : tituloFallback),
            programa: 'Fundo Ambiental',
            dotacao: 0,
            status: 'Desconhecido',
            url: `${BASE_URL}/${relPath}`,
            fonte: 'FUNDO_AMBIENTAL',
            descricao: `Categoria: ${decodeEntities(categoria.replace(/-/g, ' '))} (${ano})`,
        });

        if (avisos.length >= input.maxItems) break;
    }

    console.log(`    ✅ Fundo Ambiental: ${avisos.length} apoios extraídos`);
    return avisos;
}
