/**
 * Shared Types for Apify Actors
 * Types para todos os scrapers de fundos europeus
 */

export interface Aviso {
    // Identificação
    id: string;
    titulo: string;
    descricao: string;

    // Programa
    fonte: string;
    programa: string;
    linha: string;
    componente?: string;

    // Datas
    data_abertura: string;
    data_fecho: string;
    data_extensao?: string;

    // Montantes (em euros, como string para evitar precision issues)
    montante_total: string;
    montante_min: string;
    montante_max: string;
    taxa_apoio: string;

    // Filtros
    regiao: string[];
    setor: string[];
    tipo_beneficiario: string[];

    // Documentos
    url: string;
    pdf_url?: string;
    anexos: Anexo[];

    // Metadados
    status: 'Aberto' | 'Fechado' | 'Suspenso' | 'Encerrado' | 'A abrir';
    elegibilidade: string;
    documentos_necessarios: string[];
    keywords: string[];
    scraped_at: string;
}

export interface Anexo {
    nome: string;
    url: string;
    tipo: 'pdf' | 'doc' | 'xlsx' | 'zip' | 'outro';
    tamanho?: string;
}

export interface ScrapingResult {
    success: boolean;
    fonte: string;
    avisos: Aviso[];
    errors: string[];
    scraped_at: string;
    duration_ms: number;
}

// Helpers
export function generateId(fonte: string, titulo: string): string {
    const slug = titulo
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '_')
        .substring(0, 50);
    return `${fonte}_${slug}_${Date.now()}`;
}

export function parseDate(dateStr: string): string | null {
    if (!dateStr) return null;

    // Formatos comuns: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD
    const patterns = [
        /(\d{2})\/(\d{2})\/(\d{4})/,
        /(\d{2})-(\d{2})-(\d{4})/,
        /(\d{4})-(\d{2})-(\d{2})/,
    ];

    for (const pattern of patterns) {
        const match = dateStr.match(pattern);
        if (match) {
            if (pattern === patterns[2]) {
                return `${match[1]}-${match[2]}-${match[3]}`;
            }
            return `${match[3]}-${match[2]}-${match[1]}`;
        }
    }

    return null;
}

export function parseMontante(text: string): string {
    if (!text) return '0';

    // Remove espaços e símbolos
    let clean = text.replace(/[€\s]/g, '').replace(/,/g, '.');

    // Detecta milhões
    if (text.toLowerCase().includes('milhões') || text.toLowerCase().includes('m€')) {
        const num = parseFloat(clean.replace(/[^\d.]/g, ''));
        return Math.round(num * 1000000).toString();
    }

    // Detecta milhares
    if (text.toLowerCase().includes('mil') || text.toLowerCase().includes('k€')) {
        const num = parseFloat(clean.replace(/[^\d.]/g, ''));
        return Math.round(num * 1000).toString();
    }

    // Número direto (com possíveis pontos de milhares)
    clean = clean.replace(/\.(?=\d{3})/g, '');
    const num = parseFloat(clean);
    return isNaN(num) ? '0' : Math.round(num).toString();
}

export function extractKeywords(text: string): string[] {
    const allKeywords = [
        'inovação', 'digital', 'tecnologia', 'energia', 'sustentabilidade',
        'internacionalização', 'exportação', 'qualificação', 'formação',
        'emprego', 'investimento', 'produção', 'indústria', 'agricultura',
        'turismo', 'saúde', 'ambiente', 'circular', 'verde', 'carbono',
        'pme', 'startup', 'i&d', 'investigação', 'juventude', 'cultura',
        'media', 'cinema', 'floresta', 'mar', 'bioeconomia', 'habitação'
    ];

    const lowerText = text.toLowerCase();
    return allKeywords.filter(kw => lowerText.includes(kw));
}
