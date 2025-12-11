/**
 * Horizon Europe Apify Actor
 * 
 * Usa a API oficial da EU Funding & Tenders Portal
 * URL: https://ec.europa.eu/info/funding-tenders/opportunities/portal/
 * 
 * NOTA: Horizon Europe tem API oficial - mais fiável que scraping HTML
 */

import { Actor } from 'apify';
import { Dataset } from 'crawlee';
import axios from 'axios';
import {
    Aviso,
    ScrapingResult,
    generateId,
    extractKeywords
} from './types';

// API oficial da EU Funding & Tenders
const API_BASE = 'https://api.tech.ec.europa.eu/search-api/prod/rest/search';

// Configuração para Horizon Europe
const HORIZON_PARAMS = {
    apiKey: 'SEDIA',
    text: '*',
    pageSize: 100,
    pageNumber: 1,
    sortBy: 'deadlineDate',
    sortOrder: 'DESC',
    status: 'open', // apenas abertos
    frameworkProgramme: 'Horizon Europe (HORIZON)',
};

interface Input {
    maxCalls?: number;
    includeUpcoming?: boolean;
    clusters?: string[];
}

interface EUCall {
    identifier: string;
    ccm2Id: string;
    title: string;
    callTitle: string;
    description: string;
    status: string;
    deadlineDates: string[];
    openingDate: string;
    budgetOverviewMio: number;
    keywords: string[];
    tags: string[];
    actions: { types: string[] };
    frameworkProgramme: string;
    programmeDivision: string[];
}

Actor.main(async () => {
    const startTime = Date.now();
    const input = await Actor.getInput<Input>() || {};
    const { maxCalls = 100, includeUpcoming = true } = input;

    const avisos: Aviso[] = [];
    const errors: string[] = [];

    console.log('🔬 Iniciando scraping Horizon Europe via API oficial...');

    try {
        // Buscar calls abertos
        const openCalls = await fetchHorizonCalls('open', maxCalls);
        console.log(`  📋 Calls abertos: ${openCalls.length}`);

        for (const call of openCalls) {
            const aviso = transformToAviso(call, 'Aberto');
            avisos.push(aviso);
        }

        // Buscar calls próximos (se configurado)
        if (includeUpcoming) {
            const upcomingCalls = await fetchHorizonCalls('forthcoming', Math.floor(maxCalls / 2));
            console.log(`  📋 Calls próximos: ${upcomingCalls.length}`);

            for (const call of upcomingCalls) {
                const aviso = transformToAviso(call, 'A abrir');
                avisos.push(aviso);
            }
        }

    } catch (err: any) {
        errors.push(`Erro API Horizon: ${err.message}`);
        console.error('❌ Erro:', err.message);
    }

    const result: ScrapingResult = {
        success: errors.length === 0,
        fonte: 'Horizon Europe',
        avisos,
        errors,
        scraped_at: new Date().toISOString(),
        duration_ms: Date.now() - startTime,
    };

    console.log(`\n✅ Scraping Horizon Europe concluído!`);
    console.log(`📊 Calls encontrados: ${avisos.length}`);

    await Dataset.pushData(result);
    for (const aviso of avisos) {
        await Dataset.pushData({ type: 'aviso', ...aviso });
    }
});

async function fetchHorizonCalls(status: string, limit: number): Promise<EUCall[]> {
    const params = new URLSearchParams({
        apiKey: HORIZON_PARAMS.apiKey,
        text: HORIZON_PARAMS.text,
        pageSize: String(Math.min(limit, 100)),
        pageNumber: '1',
        sortBy: HORIZON_PARAMS.sortBy,
        sortOrder: HORIZON_PARAMS.sortOrder,
        status: status,
        frameworkProgramme: HORIZON_PARAMS.frameworkProgramme,
    });

    const response = await axios.get(`${API_BASE}?${params.toString()}`, {
        headers: {
            'Accept': 'application/json',
        },
        timeout: 30000,
    });

    return response.data?.results || [];
}

function transformToAviso(call: EUCall, status: Aviso['status']): Aviso {
    const deadline = call.deadlineDates?.[0] || '';
    const budget = call.budgetOverviewMio || 0;

    // Extrair cluster/pillar do programmeDivision
    const cluster = call.programmeDivision?.[0] || 'General';

    // Construir URL do portal
    const portalUrl = `https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities/topic-details/${call.identifier}`;

    return {
        id: generateId('HORIZON', call.identifier),
        titulo: call.title || call.callTitle,
        descricao: call.description || 'Ver detalhes no portal EU',
        fonte: 'Horizon Europe',
        programa: 'Horizon Europe 2021-2027',
        linha: cluster,
        componente: call.identifier,
        data_abertura: call.openingDate?.split('T')[0] || new Date().toISOString().split('T')[0],
        data_fecho: deadline.split('T')[0] || getFutureDate(90),
        montante_total: String(Math.round(budget * 1000000)), // M€ para €
        montante_min: '150000',
        montante_max: '5000000',
        taxa_apoio: '100', // Horizon geralmente 100% para research
        regiao: ['União Europeia'],
        setor: extractSectors(call),
        tipo_beneficiario: ['Universidades', 'Centros de Investigação', 'Empresas', 'Consórcios'],
        url: portalUrl,
        anexos: [],
        status,
        elegibilidade: 'Consórcios de pelo menos 3 entidades de 3 países UE diferentes',
        documentos_necessarios: ['Proposta técnica', 'Formulários administrativos', 'Orçamento'],
        keywords: [
            ...extractKeywords(call.title + ' ' + call.description),
            ...(call.keywords || []),
            'horizon', 'europa', 'investigação', 'inovação'
        ],
        scraped_at: new Date().toISOString(),
    };
}

function extractSectors(call: EUCall): string[] {
    const sectors: string[] = [];
    const text = `${call.title} ${call.description}`.toLowerCase();

    const sectorMap: Record<string, string> = {
        'health': 'Saúde',
        'climate': 'Clima',
        'digital': 'Digital',
        'energy': 'Energia',
        'food': 'Alimentação',
        'security': 'Segurança',
        'transport': 'Transportes',
        'space': 'Espaço',
        'culture': 'Cultura',
        'industry': 'Indústria',
    };

    for (const [key, value] of Object.entries(sectorMap)) {
        if (text.includes(key)) {
            sectors.push(value);
        }
    }

    return sectors.length > 0 ? sectors : ['I&D'];
}

function getFutureDate(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}
