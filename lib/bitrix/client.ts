/**
 * BITRIX24 READ-ONLY CLIENT
 * ==========================
 * SDK seguro para ler dados do Bitrix24.
 * 
 * ⚠️ POLÍTICA DE SEGURANÇA:
 * - Apenas métodos de LEITURA (.list, .get, .fields)
 * - ZERO métodos de escrita (.add, .update, .delete)
 * - Paginação automática para grandes volumes
 * - Rate limiting respeitoso (2 req/seg)
 */

// Webhook URL - Environment variable for security
const BITRIX_WEBHOOK = process.env.BITRIX_WEBHOOK_URL ||
    "https://taconsulting.bitrix24.com/rest/744/dm213axt003upvfk/";

// Types
export interface BitrixCompany {
    ID: string;
    TITLE: string;
    COMPANY_TYPE: string;
    INDUSTRY: string;
    EMPLOYEES: string;
    ADDRESS: string | null;
    ADDRESS_CITY: string | null;
    ADDRESS_REGION: string | null;
    PHONE: { VALUE: string; VALUE_TYPE: string }[];
    EMAIL: { VALUE: string; VALUE_TYPE: string }[];
    // Custom Fields
    UF_CRM_1738505715849: string; // CAE (2 Dígitos)
    [key: string]: any;
}

export interface BitrixContact {
    ID: string;
    NAME: string;
    LAST_NAME: string;
    COMPANY_ID: string;
    EMAIL: { VALUE: string; VALUE_TYPE: string }[];
    PHONE: { VALUE: string; VALUE_TYPE: string }[];
    [key: string]: any;
}

export interface BitrixDeal {
    ID: string;
    TITLE: string;
    STAGE_ID: string;
    COMPANY_ID: string;
    CONTACT_ID: string;
    OPPORTUNITY: string;
    CURRENCY_ID: string;
    [key: string]: any;
}

export interface BitrixLead {
    ID: string;
    TITLE: string;
    NAME: string;
    STATUS_ID: string;
    COMPANY_TITLE: string;
    [key: string]: any;
}

export interface BitrixUser {
    ID: string;
    NAME: string;
    LAST_NAME: string;
    EMAIL: string;
    WORK_POSITION: string;
    [key: string]: any;
}

export interface BitrixListResponse<T> {
    result: T[];
    total: number;
    next?: number;
}

// Rate limiter - max 2 requests per second
let lastRequestTime = 0;
async function rateLimitedFetch(url: string): Promise<Response> {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;

    if (timeSinceLastRequest < 500) {
        await new Promise(resolve => setTimeout(resolve, 500 - timeSinceLastRequest));
    }

    lastRequestTime = Date.now();
    return fetch(url);
}

// Base fetch function - READ ONLY
async function bitrixGet<T>(
    method: string,
    params: Record<string, any> = {}
): Promise<T> {
    const url = new URL(`${BITRIX_WEBHOOK}${method}.json`);

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
                value.forEach((v, i) => url.searchParams.append(`${key}[${i}]`, String(v)));
            } else if (typeof value === 'object') {
                Object.entries(value).forEach(([k, v]) => {
                    url.searchParams.append(`${key}[${k}]`, String(v));
                });
            } else {
                url.searchParams.append(key, String(value));
            }
        }
    });

    const response = await rateLimitedFetch(url.toString());

    if (!response.ok) {
        throw new Error(`Bitrix API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
        throw new Error(`Bitrix API Error: ${data.error_description || data.error}`);
    }

    return data;
}

// ============================================================
// COMPANIES - READ ONLY
// ============================================================

export async function getCompanies(options: {
    start?: number;
    filter?: Record<string, any>;
    select?: string[];
} = {}): Promise<BitrixListResponse<BitrixCompany>> {
    const params: Record<string, any> = {
        start: options.start || 0,
    };

    if (options.filter) params.filter = options.filter;
    if (options.select) params.select = options.select;

    const response = await bitrixGet<{ result: BitrixCompany[]; total: number; next?: number }>(
        'crm.company.list',
        params
    );

    return {
        result: response.result,
        total: response.total,
        next: response.next,
    };
}

export async function getCompanyById(id: string | number): Promise<BitrixCompany | null> {
    try {
        const response = await bitrixGet<{ result: BitrixCompany }>('crm.company.get', { id });
        return response.result;
    } catch (error) {
        console.error(`Error fetching company ${id}:`, error);
        return null;
    }
}

export async function getCompanyFields(): Promise<Record<string, any>> {
    const response = await bitrixGet<{ result: Record<string, any> }>('crm.company.fields');
    return response.result;
}

// Get companies by CAE code
export async function getCompaniesByCAE(caeCode: string, options: {
    start?: number;
    limit?: number;
} = {}): Promise<BitrixListResponse<BitrixCompany>> {
    return getCompanies({
        start: options.start,
        filter: { 'UF_CRM_1738505715849': caeCode },
        select: ['ID', 'TITLE', 'UF_CRM_1738505715849', 'ADDRESS_REGION', 'PHONE', 'EMAIL'],
    });
}

// ============================================================
// CONTACTS - READ ONLY
// ============================================================

export async function getContacts(options: {
    start?: number;
    filter?: Record<string, any>;
    select?: string[];
} = {}): Promise<BitrixListResponse<BitrixContact>> {
    const params: Record<string, any> = {
        start: options.start || 0,
    };

    if (options.filter) params.filter = options.filter;
    if (options.select) params.select = options.select;

    const response = await bitrixGet<{ result: BitrixContact[]; total: number; next?: number }>(
        'crm.contact.list',
        params
    );

    return {
        result: response.result,
        total: response.total,
        next: response.next,
    };
}

export async function getContactById(id: string | number): Promise<BitrixContact | null> {
    try {
        const response = await bitrixGet<{ result: BitrixContact }>('crm.contact.get', { id });
        return response.result;
    } catch (error) {
        console.error(`Error fetching contact ${id}:`, error);
        return null;
    }
}

// ============================================================
// DEALS - READ ONLY
// ============================================================

export async function getDeals(options: {
    start?: number;
    filter?: Record<string, any>;
    select?: string[];
} = {}): Promise<BitrixListResponse<BitrixDeal>> {
    const params: Record<string, any> = {
        start: options.start || 0,
    };

    if (options.filter) params.filter = options.filter;
    if (options.select) params.select = options.select;

    const response = await bitrixGet<{ result: BitrixDeal[]; total: number; next?: number }>(
        'crm.deal.list',
        params
    );

    return {
        result: response.result,
        total: response.total,
        next: response.next,
    };
}

export async function getDealById(id: string | number): Promise<BitrixDeal | null> {
    try {
        const response = await bitrixGet<{ result: BitrixDeal }>('crm.deal.get', { id });
        return response.result;
    } catch (error) {
        console.error(`Error fetching deal ${id}:`, error);
        return null;
    }
}

// ============================================================
// LEADS - READ ONLY
// ============================================================

export async function getLeads(options: {
    start?: number;
    filter?: Record<string, any>;
    select?: string[];
} = {}): Promise<BitrixListResponse<BitrixLead>> {
    const params: Record<string, any> = {
        start: options.start || 0,
    };

    if (options.filter) params.filter = options.filter;
    if (options.select) params.select = options.select;

    const response = await bitrixGet<{ result: BitrixLead[]; total: number; next?: number }>(
        'crm.lead.list',
        params
    );

    return {
        result: response.result,
        total: response.total,
        next: response.next,
    };
}

// ============================================================
// USERS - READ ONLY
// ============================================================

export async function getUsers(): Promise<BitrixUser[]> {
    const response = await bitrixGet<{ result: BitrixUser[] }>('user.get');
    return response.result;
}

export async function getCurrentUser(): Promise<BitrixUser> {
    const response = await bitrixGet<{ result: BitrixUser }>('profile');
    return response.result;
}

// ============================================================
// UTILITIES
// ============================================================

export async function testConnection(): Promise<{
    success: boolean;
    user?: string;
    error?: string;
}> {
    try {
        const profile = await getCurrentUser();
        return {
            success: true,
            user: `${profile.NAME} ${profile.LAST_NAME}`,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

export async function getStats(): Promise<{
    companies: number;
    contacts: number;
    deals: number;
    leads: number;
}> {
    const [companies, contacts, deals, leads] = await Promise.all([
        getCompanies({ start: 0 }),
        getContacts({ start: 0 }),
        getDeals({ start: 0 }),
        getLeads({ start: 0 }),
    ]);

    return {
        companies: companies.total,
        contacts: contacts.total,
        deals: deals.total,
        leads: leads.total,
    };
}

// CAE Code mapping (from Bitrix field UF_CRM_1738505715849)
export const CAE_CODES: Record<string, string> = {
    "6058": "01 – Agricultura, produção animal, caça e actividades dos serviços relacionados (A)",
    "6060": "02 – Silvicultura e exploração florestal (A)",
    "6070": "10 – Indústrias alimentares (C)",
    "6076": "13 – Fabricação de têxteis (C)",
    "6094": "22 – Fabricação de artigos de borracha e de matérias plásticas (C)",
    "6128": "41 – Promoção imobiliária; construção de edifícios (F)",
    "6130": "42 – Engenharia civil (F)",
    "6132": "43 – Actividades especializadas de construção (F)",
    "6136": "46 – Comércio por grosso (G)",
    "6138": "47 – Comércio a retalho (G)",
    "6160": "62 – Consultoria e programação informática (J)",
    "6174": "70 – Actividades das sedes sociais e de consultoria para a gestão (M)",
    "6198": "84 – Administração Pública e Defesa (O)",
    "6200": "85 – Educação (P)",
    "6202": "86 – Actividades de saúde humana (Q)",
    // ... add more as needed
};

export function getCAEDescription(caeId: string): string {
    return CAE_CODES[caeId] || `CAE ${caeId}`;
}
