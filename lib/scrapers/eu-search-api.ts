/**
 * EU Funding Open Data Scraper
 * 
 * Usa endpoints públicos de dados abertos da UE para obter calls for proposals.
 * Fontes:
 * - CORDIS API (Horizon Europe)
 * - EC Open Data Portal
 */

import axios from 'axios';

// =============================================================================
// TYPES
// =============================================================================

export interface AvisoFromEU {
    id: string;
    codigo: string;
    nome: string;
    portal: 'HORIZON_EUROPE' | 'EUROPA_CRIATIVA' | 'DIGITAL_EUROPE' | 'LIFE';
    programa: string;
    descricao: string;
    dataInicioSubmissao: string;
    dataFimSubmissao: string;
    montanteTotal?: number;
    link: string;
    status: 'Aberto' | 'Fechado' | 'A abrir';
    keywords: string[];
    scrapedAt: string;
}

const DEFAULT_HEADERS = {
    'Accept': 'application/json',
    'User-Agent': 'TA-Consulting-Platform/1.0',
};

// =============================================================================
// CORDIS API (Horizon Europe)
// =============================================================================

async function scrapeHorizonFromCORDIS(): Promise<AvisoFromEU[]> {
    console.log('  📡 CORDIS API (Horizon Europe)...');

    const avisos: AvisoFromEU[] = [];

    try {
        // CORDIS Projects API - buscar projectos recentes como proxy para calls
        const response = await axios.get(
            'https://cordis.europa.eu/api/search/projects/en',
            {
                params: {
                    q: 'contenttype:project AND frameworkProgramme:HORIZON',
                    num: 100,
                    sort: 'startDate desc',
                },
                headers: DEFAULT_HEADERS,
                timeout: 30000,
            }
        );

        const results = response.data?.response?.results || [];

        for (const item of results) {
            const project = item.project || item;
            if (!project.id) continue;

            avisos.push({
                id: `CORDIS-${project.id}`,
                codigo: project.acronym || project.id,
                nome: project.title || project.acronym || '',
                portal: 'HORIZON_EUROPE',
                programa: project.frameworkProgramme || 'Horizon Europe',
                descricao: project.objective?.substring(0, 500) || '',
                dataInicioSubmissao: project.startDate || '',
                dataFimSubmissao: project.endDate || '',
                montanteTotal: project.totalCost ? parseFloat(project.totalCost) : undefined,
                link: `https://cordis.europa.eu/project/id/${project.id}`,
                status: 'Aberto',
                keywords: project.keywords?.split(',').map((k: string) => k.trim()) || [],
                scrapedAt: new Date().toISOString(),
            });
        }

        console.log(`    ✅ ${avisos.length} projectos Horizon Europe`);
    } catch (error: any) {
        console.log(`    ⚠️ CORDIS error: ${error.message}`);
    }

    return avisos;
}

// =============================================================================
// SCRAPE EU PORTAL VIA CREATIVE EUROPE DESKS
// =============================================================================

async function scrapeCreativeEuropeNews(): Promise<AvisoFromEU[]> {
    console.log('  📡 Creative Europe (website)...');

    const avisos: AvisoFromEU[] = [];

    try {
        // Usar endpoint RSS ou API se disponível
        const response = await axios.get(
            'https://culture.ec.europa.eu/funding/calls/open-calls',
            {
                headers: {
                    ...DEFAULT_HEADERS,
                    'Accept': 'text/html',
                },
                timeout: 20000,
            }
        );

        // Parse básico de HTML para encontrar calls
        const html = response.data;
        const callMatches = html.matchAll(/<a[^>]*href="([^"]*call[^"]*)"[^>]*>([^<]+)</gi);

        let count = 0;
        for (const match of callMatches) {
            if (count >= 20) break;

            const link = match[1];
            const title = match[2].trim();

            if (title.length > 10) {
                avisos.push({
                    id: `CREA-${Date.now()}-${count}`,
                    codigo: `CREA-${count + 1}`,
                    nome: title.substring(0, 200),
                    portal: 'EUROPA_CRIATIVA',
                    programa: 'Creative Europe',
                    descricao: title,
                    dataInicioSubmissao: new Date().toISOString().split('T')[0],
                    dataFimSubmissao: '',
                    link: link.startsWith('http') ? link : `https://culture.ec.europa.eu${link}`,
                    status: 'Aberto',
                    keywords: ['creative', 'culture', 'media'],
                    scrapedAt: new Date().toISOString(),
                });
                count++;
            }
        }

        console.log(`    ✅ ${avisos.length} calls Creative Europe`);
    } catch (error: any) {
        console.log(`    ⚠️ Creative Europe error: ${error.message}`);
    }

    return avisos;
}

// =============================================================================
// MAIN SCRAPER
// =============================================================================

export async function scrapeEUFundingPortal(): Promise<AvisoFromEU[]> {
    console.log('🇪🇺 Iniciando scrape de portais EU (Open Data)...');

    const allAvisos: AvisoFromEU[] = [];

    // 1. CORDIS para Horizon Europe
    const horizonAvisos = await scrapeHorizonFromCORDIS();
    allAvisos.push(...horizonAvisos);

    await new Promise(r => setTimeout(r, 500));

    // 2. Creative Europe
    const creativeAvisos = await scrapeCreativeEuropeNews();
    allAvisos.push(...creativeAvisos);

    console.log(`🎯 Total: ${allAvisos.length} avisos de portais EU`);
    return allAvisos;
}

// =============================================================================
// EXPORT
// =============================================================================

export default { scrapeEUFundingPortal };
