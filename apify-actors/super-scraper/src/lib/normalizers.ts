/**
 * Data normalization utilities for multi-portal scraping
 */

// ============================================================================
// DATE NORMALIZATION
// ============================================================================

// Month names in PT and EN for parsing "30 de junho de 2026"
const MONTHS_PT: Record<string, string> = {
    'janeiro': '01', 'fevereiro': '02', 'março': '03', 'marco': '03',
    'abril': '04', 'maio': '05', 'junho': '06',
    'julho': '07', 'agosto': '08', 'setembro': '09',
    'outubro': '10', 'novembro': '11', 'dezembro': '12',
};

const MONTHS_EN: Record<string, string> = {
    'january': '01', 'february': '02', 'march': '03',
    'april': '04', 'may': '05', 'june': '06',
    'july': '07', 'august': '08', 'september': '09',
    'october': '10', 'november': '11', 'december': '12',
};

/**
 * Normalize various date formats to ISO 8601 (YYYY-MM-DD)
 * Supports: ISO, YYYYMMDD, DD/MM/YYYY, DD-MM-YYYY, "DD de mês de YYYY"
 */
export function normalizeDate(input: string | undefined | null): string {
    if (!input) return '';

    const str = String(input).trim();

    // Already ISO format
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        return str;
    }

    // ISO with time: 2025-12-11T12:00:00 → 2025-12-11
    if (/^\d{4}-\d{2}-\d{2}T/.test(str)) {
        return str.split('T')[0];
    }

    // YYYYMMDD → YYYY-MM-DD (PT2030 aviso-2024 format)
    if (/^\d{8}$/.test(str)) {
        return `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}`;
    }

    // DD/MM/YYYY → YYYY-MM-DD
    const ddmmyyyy = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddmmyyyy) {
        const [, d, m, y] = ddmmyyyy;
        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }

    // DD-MM-YYYY → YYYY-MM-DD
    const ddmmyyyyDash = str.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    if (ddmmyyyyDash) {
        const [, d, m, y] = ddmmyyyyDash;
        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }

    // "DD de mês de YYYY" (Portuguese) - e.g. "30 de junho de 2026"
    const ptDateMatch = str.match(/(\d{1,2})\s*de\s*(\w+)\s*de\s*(\d{4})/i);
    if (ptDateMatch) {
        const [, d, monthStr, y] = ptDateMatch;
        const month = MONTHS_PT[monthStr.toLowerCase()];
        if (month) {
            return `${y}-${month}-${d.padStart(2, '0')}`;
        }
    }

    // "Month DD, YYYY" or "DD Month YYYY" (English)
    const enDateMatch1 = str.match(/(\w+)\s+(\d{1,2}),?\s*(\d{4})/i);
    if (enDateMatch1) {
        const [, monthStr, d, y] = enDateMatch1;
        const month = MONTHS_EN[monthStr.toLowerCase()];
        if (month) {
            return `${y}-${month}-${d.padStart(2, '0')}`;
        }
    }

    const enDateMatch2 = str.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/i);
    if (enDateMatch2) {
        const [, d, monthStr, y] = enDateMatch2;
        const month = MONTHS_EN[monthStr.toLowerCase()] || MONTHS_PT[monthStr.toLowerCase()];
        if (month) {
            return `${y}-${month}-${d.padStart(2, '0')}`;
        }
    }

    return '';
}

/**
 * Extract all dates from a text and return first (abertura) and last (fecho)
 * Useful for PRR where dates are embedded in text
 */
export function extractDatesFromText(text: string): { abertura: string; fecho: string } {
    const dates: string[] = [];

    // Pattern 1: DD/MM/YYYY
    const numericDates = text.matchAll(/(\d{1,2}\/\d{1,2}\/\d{4})/g);
    for (const match of numericDates) {
        const normalized = normalizeDate(match[1]);
        if (normalized) dates.push(normalized);
    }

    // Pattern 2: "DD de mês de YYYY"
    const ptDates = text.matchAll(/(\d{1,2})\s*de\s*(\w+)\s*de\s*(\d{4})/gi);
    for (const match of ptDates) {
        const month = MONTHS_PT[match[2].toLowerCase()];
        if (month) {
            dates.push(`${match[3]}-${month}-${match[1].padStart(2, '0')}`);
        }
    }

    // Sort dates chronologically
    dates.sort();

    // First date = abertura, last date (or one with "limite/até") = fecho
    return {
        abertura: dates[0] || '',
        fecho: dates[dates.length - 1] || '',
    };
}

// ============================================================================
// REGION / NUTS NORMALIZATION
// ============================================================================

const NUTS_TO_REGIAO: Record<string, string> = {
    'PT11': 'Norte',
    'PT15': 'Algarve',
    'PT16': 'Centro',
    'PT17': 'Lisboa',
    'PT18': 'Alentejo',
    'PT20': 'Açores',
    'PT30': 'Madeira',
    'RAM': 'Madeira',
    'RAA': 'Açores',
    'AML': 'Lisboa',
    'Norte': 'Norte',
    'Centro': 'Centro',
    'Alentejo': 'Alentejo',
    'Algarve': 'Algarve',
    'Lisboa': 'Lisboa',
};

/**
 * Normalize NUTS codes to region names
 */
export function normalizeRegiao(nuts: string | string[] | undefined): string[] {
    if (!nuts) return ['Nacional'];

    const arr = Array.isArray(nuts) ? nuts : [nuts];
    const regioes = arr.map(n => NUTS_TO_REGIAO[n] || n);

    // Dedupe
    return [...new Set(regioes)];
}

// ============================================================================
// DOTATION / MONEY NORMALIZATION
// ============================================================================

/**
 * Normalize dotation values to number (in euros)
 */
export function normalizeDotacao(value: string | number | undefined | null): number {
    if (value === undefined || value === null || value === '') return 0;

    if (typeof value === 'number') return value;

    // Remove currency symbols, spaces, and normalize separators
    const cleaned = String(value)
        .replace(/[€$\s]/g, '')
        .replace(/\./g, '')      // Remove thousand separators
        .replace(',', '.');       // Convert decimal separator

    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
}

// ============================================================================
// RATE / PERCENTAGE NORMALIZATION
// ============================================================================

/**
 * Normalize tax/rate values to percentage (0-100)
 */
export function normalizeTaxa(value: string | number | undefined | null): number | undefined {
    if (value === undefined || value === null || value === '') return undefined;

    let num: number;
    if (typeof value === 'number') {
        num = value;
    } else {
        const cleaned = String(value).replace(/[%\s]/g, '').replace(',', '.');
        num = parseFloat(cleaned);
    }

    if (isNaN(num)) return undefined;

    // If between 0 and 1, convert to percentage
    if (num > 0 && num <= 1) {
        num = num * 100;
    }

    return num >= 0 && num <= 100 ? num : undefined;
}

// ============================================================================
// STATUS NORMALIZATION
// ============================================================================

export type AvisoStatus = 'Aberto' | 'Fechado' | 'Suspenso' | 'Desconhecido';

/**
 * Determine aviso status based on end date
 */
export function normalizeStatus(dataFecho: string | undefined): AvisoStatus {
    if (!dataFecho) return 'Aberto';

    try {
        const endDate = new Date(dataFecho);
        const now = new Date();

        // Set time to end of day for fair comparison
        endDate.setHours(23, 59, 59, 999);

        return endDate > now ? 'Aberto' : 'Fechado';
    } catch {
        return 'Desconhecido';
    }
}

// ============================================================================
// HTML / TEXT NORMALIZATION
// ============================================================================

/**
 * Strip HTML tags and decode entities
 */
export function stripHtml(html: string | undefined | null): string {
    if (!html) return '';

    return html
        .replace(/<[^>]*>/g, '')           // Remove HTML tags
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#039;/gi, "'")
        .replace(/&#8211;/gi, '–')
        .replace(/&#8217;/gi, "'")
        .replace(/&#8220;/gi, '"')
        .replace(/&#8221;/gi, '"')
        .replace(/\s+/g, ' ')              // Collapse whitespace
        .trim();
}

/**
 * Decode HTML entities only (keep structure)
 */
export function decodeHtmlEntities(text: string | undefined | null): string {
    if (!text) return '';

    return text
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#039;/gi, "'")
        .replace(/&#8211;/gi, '–')
        .replace(/&#8217;/gi, "'")
        .trim();
}

// ============================================================================
// ARRAY NORMALIZATION
// ============================================================================

/**
 * Normalize value to array
 */
export function toArray<T>(value: T | T[] | undefined | null): T[] | undefined {
    if (value === undefined || value === null) return undefined;
    return Array.isArray(value) ? value : [value];
}

/**
 * Get first item or undefined
 */
export function firstOrUndefined<T>(arr: T[] | undefined): T | undefined {
    return arr && arr.length > 0 ? arr[0] : undefined;
}

// ============================================================================
// DOCUMENT FORMAT DETECTION
// ============================================================================

/**
 * Detect document format from filename
 */
export function detectDocumentFormat(filename: string): string {
    const raw = String(filename || '').trim();
    if (!raw) return 'unknown';

    // Strip query/hash so URLs like ".../doc.pdf?download=1" still work.
    const clean = raw.split('#')[0].split('?')[0];

    // Handle WP-style double extensions like:
    // ".../unnamed-file.pdf-238.octet-stream" => "pdf"
    const octet = clean.match(/\.([a-z0-9]{1,10})-\d+\.octet-stream$/i);
    if (octet?.[1]) return octet[1].toLowerCase();

    const lastSegment = clean.split('/').pop() || clean;
    const ext = lastSegment.match(/\.([a-z0-9]{1,10})$/i)?.[1];
    return ext ? ext.toLowerCase() : 'unknown';
}

// ============================================================================
// PRODUCT VISION FIELD EXTRACTION
// ============================================================================

/**
 * Extract legislation links (Portarias, Despachos, DRE) from HTML
 */
export function extractLegislacaoLinks(html: string): string[] {
    const links: string[] = [];
    const seen = new Set<string>();

    // Pattern for DRE (Diário da República)
    const drePattern = /href=["']([^"']*dre\.pt[^"']*)["']/gi;
    // Pattern for Portaria/Despacho references
    const portariaPattern = /href=["']([^"']*(?:portaria|despacho|regulamento)[^"']*)["']/gi;
    // Pattern for legislation PDFs
    const legPdfPattern = /href=["']([^"']*(?:legisla|portaria|despacho)[^"']*\.pdf[^"']*)["']/gi;

    for (const pattern of [drePattern, portariaPattern, legPdfPattern]) {
        let match;
        while ((match = pattern.exec(html)) !== null) {
            const url = match[1];
            if (!seen.has(url)) {
                seen.add(url);
                links.push(url);
            }
        }
    }

    return links.slice(0, 10); // Limit to 10 links
}

/**
 * Extract contact info (email and phone) from text
 */
export function extractContactInfo(text: string): { email?: string; telefone?: string } {
    const contact: { email?: string; telefone?: string } = {};

    // Email pattern
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
        contact.email = emailMatch[0].toLowerCase();
    }

    // Phone pattern (PT format: +351 XXX XXX XXX or 2XX XXX XXX)
    const phoneMatch = text.match(/(?:\+351\s?)?(?:2[0-9]{2}|9[0-9]{2})\s?[0-9]{3}\s?[0-9]{3}/);
    if (phoneMatch) {
        contact.telefone = phoneMatch[0].replace(/\s+/g, ' ').trim();
    }

    return Object.keys(contact).length > 0 ? contact : {};
}

/**
 * Extract submission channel from text
 */
export function extractCanalSubmissao(text: string): string | undefined {
    const lower = text.toLowerCase();

    if (lower.includes('área reservada') && lower.includes('ifap')) {
        return 'Área Reservada IFAP';
    }
    if (lower.includes('balcão de candidaturas')) {
        return 'Balcão de Candidaturas';
    }
    if (lower.includes('balcão dos fundos') || lower.includes('balcaodosfundos')) {
        return 'Balcão dos Fundos';
    }
    if (lower.includes('formulário eletrónico') || lower.includes('formulário online')) {
        return 'Formulário Eletrónico';
    }
    if (lower.includes('compete') && lower.includes('portal')) {
        return 'Portal COMPETE';
    }

    return undefined;
}

/**
 * Extract prerequisites from bullet lists in HTML
 */
export function extractPreRequisitos(html: string): string[] {
    const requisitos: string[] = [];

    // Look for <li> items that contain requirement keywords
    const liPattern = /<li[^>]*>([^<]+(?:<[^>]+>[^<]*)*)<\/li>/gi;
    let match;

    while ((match = liPattern.exec(html)) !== null) {
        const text = stripHtml(match[1]).trim();

        // Filter for requirement-like text
        if (text.length > 10 && text.length < 300) {
            const lower = text.toLowerCase();
            if (
                lower.includes('registo') ||
                lower.includes('nifap') ||
                lower.includes('inscrição') ||
                lower.includes('declaração') ||
                lower.includes('parecer') ||
                lower.includes('licença') ||
                lower.includes('certificado') ||
                lower.includes('atualiz') ||
                lower.includes('devem') ||
                lower.includes('obrigatório')
            ) {
                requisitos.push(text);
            }
        }

        if (requisitos.length >= 15) break; // Limit
    }

    return requisitos;
}
