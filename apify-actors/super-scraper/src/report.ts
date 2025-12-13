/**
 * Coverage report script (runs locally with ts-node)
 *
 * Goal: produce real counts of avisos + documents per portal without running the Apify Actor.
 */

import axios from 'axios';
import { scrapePRR } from './lib/prr';
import { scrapePEPAC } from './lib/pepac';
import { scrapeCORDIS } from './lib/cordis';

type Pt2030QueryStats = {
    estadoAvisoId: number;
    avisos: number;
    docs: number;
};

async function main() {
    const now = new Date();
    console.log(`📊 COVERAGE REPORT (local)\nGerado: ${now.toISOString()}\n`);

    await reportPortugal2030(now);
    await reportPRR();
    await reportPEPAC();
    await reportHorizon();
    await reportEuropaCriativa();
    await reportIPDJ();
}

async function reportPortugal2030(now: Date) {
    console.log('\n📗 PORTUGAL 2030');
    console.log('─'.repeat(60));

    // ACF (aviso-2024)
    const acf = await fetchPt2030Aviso2024(now);
    console.log(`aviso-2024 (WP): ${acf.total} avisos`);
    console.log(`  - Abertos: ${acf.open} | Agendados: ${acf.scheduled} | Fechados: ${acf.closed}`);
    console.log(`  - PDFs ACF: ${acf.pdfCount}`);

    // /avisos/query (full docs + true status via estadoAvisoId)
    const uiConfig = await fetchPortugal2030UIConfig();

    const openStats = await fetchPt2030QueryStats([6, 7], uiConfig.programaIds);
    const allStats = await fetchPt2030QueryStats([6, 7, 8], uiConfig.programaIds);

    const sum = (arr: number[]) => arr.reduce((acc, v) => acc + v, 0);

    console.log(`/avisos/query (API):`);
    console.log(`  - OnlyOpen (6=Agendado,7=Aberto): ${sum(openStats.map(s => s.avisos))} avisos | ${sum(openStats.map(s => s.docs))} docs`);
    console.log(`  - All (6,7,8): ${sum(allStats.map(s => s.avisos))} avisos | ${sum(allStats.map(s => s.docs))} docs`);
}

async function fetchPt2030Aviso2024(now: Date): Promise<{
    total: number;
    open: number;
    scheduled: number;
    closed: number;
    pdfCount: number;
}> {
    const headers = { 'User-Agent': 'Mozilla/5.0' };

    const head = await axios.head('https://portugal2030.pt/wp-json/wp/v2/aviso-2024?per_page=1', { headers, timeout: 30000 });
    const total = parseInt(head.headers['x-wp-total'] || '0', 10);
    const totalPages = parseInt(head.headers['x-wp-totalpages'] || '1', 10);

    let open = 0;
    let scheduled = 0;
    let closed = 0;
    let pdfCount = 0;

    const perPage = 100;
    const pages = Math.max(1, Math.ceil(total / perPage));
    const maxPages = Math.min(totalPages, pages);

    for (let page = 1; page <= maxPages; page++) {
        const { data } = await axios.get('https://portugal2030.pt/wp-json/wp/v2/aviso-2024', {
            headers,
            timeout: 60000,
            params: { per_page: perPage, page, orderby: 'date', order: 'desc' },
        });

        for (const post of Array.isArray(data) ? data : []) {
            const acf = post?.acf || {};
            const dataInicio = normalizeYYYYMMDD(acf.data_inicio);
            const dataFim = normalizeYYYYMMDD(acf.data_fim);

            const start = dataInicio ? new Date(dataInicio) : null;
            const end = dataFim ? new Date(dataFim) : null;

            if (acf.pdf) pdfCount += 1;

            if (start && start > now) {
                scheduled += 1;
            } else if (end && end < now) {
                closed += 1;
            } else {
                open += 1;
            }
        }

        if (page < maxPages) await sleep(250);
    }

    return { total, open, scheduled, closed, pdfCount };
}

async function fetchPt2030QueryStats(
    estadoAvisoIds: number[],
    programaIds: number[],
): Promise<Pt2030QueryStats[]> {
    const out: Pt2030QueryStats[] = [];
    const seen = new Set<string>();

    for (const estadoAvisoId of estadoAvisoIds) {
        let page = 0;
        let avisosCount = 0;
        let docsCount = 0;

        // The API pages 5 items per page.
        // Keep paging until it returns < 5 items.
        // Guard against edge cases where the API repeats pages indefinitely.
        const MAX_PAGES_PER_STATUS = 200;
        for (;;) {
            if (page > MAX_PAGES_PER_STATUS) break;

            let data: any;
            try {
                data = await postPortugal2030Query({ estadoAvisoId, page, programaIds });
            } catch {
                break;
            }
            const pageAvisos = Array.isArray(data?.avisos) ? data.avisos : [];
            if (pageAvisos.length === 0) break;

            let newOnPage = 0;
            for (const item of pageAvisos) {
                const aviso = item?.aviso || {};
                const codigo = String(aviso?.codigoAviso || '');
                if (!codigo) continue;
                if (seen.has(codigo)) continue;
                seen.add(codigo);
                newOnPage += 1;

                avisosCount += 1;
                const docs = Array.isArray(item?.documentos) ? item.documentos : [];
                docsCount += docs.length;
            }

            if (pageAvisos.length < 5) break;
            if (newOnPage === 0) break;
            page += 1;
            await sleep(200);
        }

        out.push({ estadoAvisoId, avisos: avisosCount, docs: docsCount });
    }

    return out;
}

async function fetchPortugal2030UIConfig(): Promise<{ programaIds: number[] }> {
    try {
        const { data: htmlRaw } = await axios.get('https://portugal2030.pt/avisos/', {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 30000,
        });
        const html = String(htmlRaw);

        const locks = parseEmbeddedJsonObject(html, 'locks:');
        const domain = parseEmbeddedJsonObject(html, 'domain:{');

        const excludeProgramIds: number[] = Array.isArray(locks?.exclude_program_ids)
            ? locks.exclude_program_ids.map((n: any) => Number(n)).filter((n: number) => !Number.isNaN(n))
            : [];

        const programas = Array.isArray(domain?.Programas) ? domain.Programas : [];
        const programaIds = programas
            .map((p: any) => Number(p?.id))
            .filter((id: number) => Number.isFinite(id) && !excludeProgramIds.includes(id));

        return { programaIds };
    } catch {
        return { programaIds: [] };
    }
}

function parseEmbeddedJsonObject(html: string, marker: string): any {
    const idx = html.indexOf(marker);
    if (idx < 0) return null;

    const braceStart = html.indexOf('{', idx);
    if (braceStart < 0) return null;

    let depth = 0;
    for (let i = braceStart; i < html.length; i++) {
        const ch = html[i];
        if (ch === '{') depth += 1;
        else if (ch === '}') {
            depth -= 1;
            if (depth === 0) {
                const jsonText = html.slice(braceStart, i + 1);
                try {
                    return JSON.parse(jsonText);
                } catch {
                    return null;
                }
            }
        }
    }
    return null;
}

async function postPortugal2030Query(input: {
    estadoAvisoId: number;
    page: number;
    programaIds: number[];
}): Promise<any> {
    const params = new URLSearchParams();
    params.set('estadoAvisoId', String(input.estadoAvisoId));
    params.set('page', String(input.page));
    for (const id of input.programaIds) {
        params.append('programaId[]', String(id));
    }

    const { data } = await axios.post('https://portugal2030.pt/wp-json/avisos/query', params.toString(), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'User-Agent': 'Mozilla/5.0',
            'Accept': 'application/json',
        },
        timeout: 60000,
    });

    return data;
}

function normalizeYYYYMMDD(v: any): string {
    const s = String(v || '').trim();
    if (!/^\d{8}$/.test(s)) return '';
    return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
}

async function reportPRR() {
    console.log('\n📘 PRR (Recuperar Portugal)');
    console.log('─'.repeat(60));

    const all = await scrapePRR({ maxItems: 2000, onlyOpen: false });
    const open = await scrapePRR({ maxItems: 2000, onlyOpen: true });

    const docsAll = all.reduce((acc, a) => acc + (a.documentos?.length || 0), 0);
    const docsOpen = open.reduce((acc, a) => acc + (a.documentos?.length || 0), 0);

    console.log(`Total (AAC): ${all.length} avisos | ${docsAll} docs`);
    console.log(`Abertos: ${open.length} avisos | ${docsOpen} docs`);
}

async function reportPEPAC() {
    console.log('\n📙 PEPAC / PEPACC');
    console.log('─'.repeat(60));

    const all = await scrapePEPAC({ maxItems: 2000, onlyOpen: false });
    const open = await scrapePEPAC({ maxItems: 2000, onlyOpen: true });

    const docsAll = all.reduce((acc, a) => acc + (a.documentos?.length || 0), 0);
    const docsOpen = open.reduce((acc, a) => acc + (a.documentos?.length || 0), 0);

    console.log(`Total: ${all.length} avisos | ${docsAll} docs`);
    console.log(`Abertos: ${open.length} avisos | ${docsOpen} docs`);
}

async function reportHorizon() {
    console.log('\n📕 HORIZON EUROPE (SEDIA)');
    console.log('─'.repeat(60));

    // Keep this limited for speed; the API has 90k+ results overall.
    const maxItems = 200;
    const open = await scrapeCORDIS({ maxItems, onlyOpen: true });
    const all = await scrapeCORDIS({ maxItems, onlyOpen: false });

    const withDeadline = open.filter(a => Boolean(a.dataFecho)).length;
    const minDeadline = open.map(a => a.dataFecho).filter(Boolean).sort()[0] || '';
    const maxDeadline = open.map(a => a.dataFecho).filter(Boolean).sort().slice(-1)[0] || '';

    console.log(`OnlyOpen (amostra ${maxItems}): ${open.length} avisos (com deadline: ${withDeadline})`);
    if (minDeadline || maxDeadline) {
        console.log(`  - Deadlines (range amostra): ${minDeadline} .. ${maxDeadline}`);
    }
    console.log(`Histórico (amostra ${maxItems}): ${all.length} avisos`);

    // Also print totalResults for a simple query (best-effort)
    try {
        const res = await axios.post(
            'https://api.tech.ec.europa.eu/search-api/prod/rest/search',
            null,
            {
                params: {
                    apiKey: 'SEDIA',
                    text: `HORIZON ${new Date().getFullYear()}`,
                    status: '31094501,31094502',
                    pageSize: 1,
                    pageNumber: 1,
                },
                headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
                timeout: 30000,
            }
        );
        const totalResults = parseInt(res.data?.totalResults || '0', 10);
        if (Number.isFinite(totalResults) && totalResults > 0) {
            console.log(`TotalResults (query do ano atual, open+forthcoming): ${totalResults}`);
        }
    } catch {
        // ignore
    }
}

async function reportEuropaCriativa() {
    console.log('\n📓 Europa Criativa');
    console.log('─'.repeat(60));

    const SEDIA_API = 'https://api.tech.ec.europa.eu/search-api/prod/rest/search';
    const OPEN_STATUS = '31094501';
    const FORTHCOMING_STATUS = '31094502';
    const CLOSED_STATUS = '31094503';

    try {
        // Total results (CREA-* identifiers)
        const head = await axios.post(SEDIA_API, null, {
            params: { apiKey: 'SEDIA', text: 'CREA', pageSize: 1, pageNumber: 1 },
            headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
            timeout: 30000,
        });

        const totalResults = parseInt(head.data?.totalResults || '0', 10);
        console.log(`SEDIA text=CREA totalResults: ${totalResults}`);

        // Small sample to estimate status distribution (dedup by identifier)
        const sampleSize = 200;
        const sample = await axios.post(SEDIA_API, null, {
            params: {
                apiKey: 'SEDIA',
                text: 'CREA',
                pageSize: sampleSize,
                pageNumber: 1,
                sortBy: 'deadlineDate',
                sortOrder: 'ASC',
            },
            headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
            timeout: 30000,
        });

        const seen = new Set<string>();
        let open = 0;
        let forthcoming = 0;
        let closed = 0;
        let other = 0;

        for (const item of sample.data?.results || []) {
            const md = item?.metadata || {};
            const identifier = md.callIdentifier?.[0] || md.identifier?.[0] || '';
            if (!identifier || !String(identifier).startsWith('CREA-')) continue;
            if (seen.has(identifier)) continue;
            seen.add(identifier);

            const status = String(md.status?.[0] || '');
            if (status === OPEN_STATUS) open += 1;
            else if (status === FORTHCOMING_STATUS) forthcoming += 1;
            else if (status === CLOSED_STATUS) closed += 1;
            else other += 1;
        }

        console.log(
            `Amostra (${sampleSize}) unique CREA-*: ${seen.size} (open: ${open}, forthcoming: ${forthcoming}, closed: ${closed}, other: ${other})`
        );
    } catch (err: any) {
        console.log(`⚠️ Não foi possível obter via SEDIA (${err.message})`);
    }
}

async function reportIPDJ() {
    console.log('\n📓 IPDJ');
    console.log('─'.repeat(60));

    const pages = [
        'https://ipdj.gov.pt/apoio-e-financiamento-jovem',
        'https://ipdj.gov.pt/paj-programa-de-apoio-juvenil',
        'https://ipdj.gov.pt/paacj-programa-de-apoio-as-associacoes-de-carater-juvenil',
        'https://ipdj.gov.pt/pae-programa-de-apoio-estudantil',
        'https://ipdj.gov.pt/pai-programa-de-apoio-infraestrutural',
        'https://ipdj.gov.pt/apoio-e-financiamento-ao-desporto',
        'https://ipdj.gov.pt/apoio-financeiro-ao-desporto-federado',
        'https://ipdj.gov.pt/medida-1-apoio-personalizado',
        'https://ipdj.gov.pt/medidas-de-apoio-ao-alto-rendimento-e-pos-carreira',
        'https://ipdj.gov.pt/medidas-de-apoio-seleções-nacionais',
        'https://ipdj.gov.pt/medidas-de-apoio/medidas-de-apoio',
    ];

    let ok = 0;
    let totalPdfLinks = 0;

    for (const url of pages) {
        try {
            const { data } = await axios.get(url, {
                headers: { 'User-Agent': 'Mozilla/5.0' },
                timeout: 20000,
            });

            const html = String(data)
                .replace(/<script[\s\S]*?<\/script>/gi, ' ')
                .replace(/<style[\s\S]*?<\/style>/gi, ' ')
                .replace(/<!--[\s\S]*?-->/g, ' ');

            const pdfLinks = new Set<string>();
            for (const m of html.matchAll(/href=["']([^"']+\.pdf)(?:\?[^"']*)?["']/gi)) {
                pdfLinks.add(m[1]);
            }

            ok += 1;
            totalPdfLinks += pdfLinks.size;
        } catch {
            // ignore
        }
    }

    console.log(`Páginas testadas: ${pages.length} | OK: ${ok}`);
    console.log(`PDF links (aprox, dedup por página): ${totalPdfLinks}`);
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});
