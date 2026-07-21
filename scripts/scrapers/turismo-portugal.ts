/**
 * Scraper do Turismo de Portugal (business.turismodeportugal.pt).
 *
 * O portal de negócio do Turismo de Portugal é SharePoint/ASPX clássico, sem
 * API. Os apoios ao setor do turismo estão repartidos por três listagens em
 * `/pt/Investir/Financiamento/`, todas renderizadas no servidor (o HTML já
 * traz os cartões — sem SPA/JS, validado a 2026-07-21 com fetch simples):
 *
 *   1. avisos-concursos     → "Candidaturas e avisos de concurso"
 *   2. programas            → "Programas de apoio e incentivos"
 *   3. linhas-financiamento → "Linhas de financiamento"
 *
 * Cada cartão segue o padrão:
 *   <div class="title"><a href="…/Paginas/<slug>.aspx">Título</a></div>
 *
 * Tal como o Fundo Ambiental, v1 ingere o CATÁLOGO (título + URL + categoria).
 * A listagem não expõe as datas de submissão em campo estruturado — quando
 * existe prazo vem embutido no próprio título (ex.: "candidaturas até 29 abr
 * 2026"), que preservamos tal e qual. As datas exatas ficam a cargo do agente
 * de enriquecimento (fetch do link → extração estruturada), pelo que estes
 * avisos entram sem prazo (dataAbertura/dataFecho por preencher). O estado é
 * inferido do texto do título: "encerrad"/"suspens" ⇒ Fechado; "a decorrer"/
 * "candidaturas até" ⇒ Aberto; caso contrário Desconhecido (que o sync trata
 * como potencialmente aberto, tal como no Fundo Ambiental).
 */

import axios from 'axios';

export interface TurismoPortugalInput {
    maxItems: number;
    /**
     * Secções a incluir (default: as três listagens de Financiamento).
     * Chaves válidas: 'avisos-concursos', 'programas', 'linhas-financiamento'.
     */
    seccoes?: string[];
}

export interface TurismoPortugalAviso {
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

const BASE_URL = 'https://business.turismodeportugal.pt';

// Cada secção = uma listagem server-rendered + a categoria legível gravada em
// descricao (espelha o "Categoria: …" do Fundo Ambiental).
const SECCOES: { chave: string; path: string; categoria: string }[] = [
    {
        chave: 'avisos-concursos',
        path: '/pt/Investir/Financiamento/avisos-concursos/Paginas/default.aspx',
        categoria: 'Avisos e Concursos',
    },
    {
        chave: 'programas',
        path: '/pt/Investir/Financiamento/programas/Paginas/default.aspx',
        categoria: 'Programas de Apoio',
    },
    {
        chave: 'linhas-financiamento',
        path: '/pt/Investir/Financiamento/linhas-financiamento/Paginas/default.aspx',
        categoria: 'Linhas de Financiamento',
    },
];

function decodeEntities(value: string): string {
    return value
        .replace(/&amp;|&#0?38;/g, '&')
        .replace(/&quot;|&#8220;|&#8221;/g, '"')
        .replace(/&#39;|&#8217;|&#8216;|&apos;/g, "'")
        .replace(/&ndash;|&#8211;/g, '–')
        .replace(/&mdash;|&#8212;/g, '—')
        .replace(/&laquo;/g, '«')
        .replace(/&raquo;/g, '»')
        .replace(/&nbsp;|&#160;/g, ' ')
        // entidades numéricas restantes (o SharePoint injeta &#8203; etc.)
        .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
        .replace(/\s+/g, ' ')
        .trim();
}

// "encerrad"/"suspens" ⇒ Fechado; sinais de abertura ⇒ Aberto; senão Desconhecido.
function derivarStatus(titulo: string): string {
    const t = titulo.toLowerCase();
    if (/encerrad|suspens/.test(t)) return 'Fechado';
    if (/a decorrer|candidaturas? at[ée]|candidaturas? abert/.test(t)) return 'Aberto';
    return 'Desconhecido';
}

async function scrapeSeccao(
    seccao: { chave: string; path: string; categoria: string },
    seen: Set<string>,
    restante: number,
): Promise<TurismoPortugalAviso[]> {
    const response = await axios.get<string>(`${BASE_URL}${seccao.path}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 30000,
        responseType: 'text',
    });

    const html = response.data;
    const avisos: TurismoPortugalAviso[] = [];

    // Cartão: <div class="title"><a href="…/Paginas/<slug>.aspx">…título…</a></div>
    // `class="title"` é o discriminador fiável — só envolve os títulos dos
    // cartões (validado: 23 ocorrências = 23 cartões, sem ruído de nav/footer).
    const cardRegex = /<div class="title"><a href="([^"]+\.aspx)"[^>]*>([\s\S]*?)<\/a>/g;
    let match: RegExpExecArray | null;

    while ((match = cardRegex.exec(html)) !== null) {
        const [, hrefRaw, anchorContent] = match;

        // normaliza para URL absoluto (o href já costuma vir absoluto, mas há
        // relativos "/pt/…" espalhados pelo template)
        const url = hrefRaw.startsWith('http') ? hrefRaw : `${BASE_URL}${hrefRaw}`;
        const slug = url.replace(/[?#].*$/, '').replace(/\.aspx$/i, '').split('/').pop() || '';

        // páginas-índice "…encerrados/encerradas" agregam os fechados — não são
        // avisos individuais, saltam-se; o próprio default.aspx da secção também
        if (!slug || /encerrad/i.test(slug) || slug === 'default') continue;

        const codigo = `TP-${slug.slice(0, 80)}`;
        if (seen.has(codigo)) continue;
        seen.add(codigo);

        const titulo = decodeEntities(anchorContent.replace(/<[^>]*>/g, ' '));
        if (titulo.length < 3) continue;

        avisos.push({
            id: codigo,
            codigo,
            titulo,
            programa: 'Turismo de Portugal',
            dotacao: 0,
            status: derivarStatus(titulo),
            url,
            fonte: 'TURISMO_PORTUGAL',
            descricao: `Categoria: ${seccao.categoria}`,
        });

        if (avisos.length >= restante) break;
    }

    return avisos;
}

export async function scrapeTurismoPortugal(input: TurismoPortugalInput): Promise<TurismoPortugalAviso[]> {
    const seccoes = input.seccoes
        ? SECCOES.filter((s) => input.seccoes!.includes(s.chave))
        : SECCOES;
    console.log(`    📡 Turismo de Portugal: Fetching ${seccoes.length} listagens...`);

    const avisos: TurismoPortugalAviso[] = [];
    const seen = new Set<string>();

    for (const seccao of seccoes) {
        if (avisos.length >= input.maxItems) break;
        try {
            const parciais = await scrapeSeccao(seccao, seen, input.maxItems - avisos.length);
            avisos.push(...parciais);
            console.log(`       • ${seccao.categoria}: ${parciais.length} apoios`);
        } catch (e: any) {
            // uma secção em baixo não deve deitar abaixo as outras
            console.error(`       ⚠️ ${seccao.categoria}: ${e.message?.slice(0, 60)}`);
        }
        // pausa curta entre secções (cortesia com o servidor ASPX)
        await new Promise((r) => setTimeout(r, 200));
    }

    console.log(`    ✅ Turismo de Portugal: ${avisos.length} apoios extraídos`);
    return avisos;
}
