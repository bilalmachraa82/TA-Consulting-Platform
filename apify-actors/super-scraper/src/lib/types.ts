/**
 * Core types for multi-portal scraping system
 */

export interface Documento {
    id: string;
    nome: string;
    tipo: string;        // "Aviso", "Anexo", "Checklist", etc.
    url: string;
    path?: string;
    formato?: string;    // "pdf", "docx", "xlsx"
}

export interface AvisoNormalized {
    // === Campos Base (obrigatórios) ===
    id: string;
    codigo: string;
    titulo: string;
    programa: string;
    dataAbertura: string;        // ISO 8601: YYYY-MM-DD
    dataFecho: string;           // ISO 8601: YYYY-MM-DD
    dotacao: number;             // Em euros
    status: 'Aberto' | 'Fechado' | 'Suspenso' | 'Desconhecido';
    url: string;
    fonte: string;               // "Portugal 2030", "PRR", "CORDIS", etc.
    scrapedAt: string;           // ISO 8601

    // === Campos Estendidos ===
    descricao?: string;
    taxa?: number;               // Percentagem 0-100
    regiao?: string[];           // Regiões normalizadas
    nuts?: string[];             // Códigos NUTS originais
    fundo?: string[];
    natureza?: string;           // "Concurso", "Operação", etc.
    beneficiarios?: string[];
    modalidade?: string[];
    objetivoEspecifico?: string;
    objetivoEstrategico?: string;
    prioridade?: string;

    tipologias?: {
        acao?: string;
        intervencao?: string;
        operacao?: string;
    };

    // === Documentos (múltiplos) ===
    documentos: Documento[];

    // === Metadados Adicionais ===
    quadrimestre?: string;
    marca?: string;              // "CENTRO2030", "ALENTEJO2030", etc.
    tipoFinanciamento?: string;  // "União Europeia", "Nacional"

    // === Campos específicos por portal (ex.: PRR UI) ===
    linha?: string;              // Linha/Componente (PRR)
    subLinha?: string;           // Sub-linha/Sub-componente (PRR)
    dataAviso?: string;          // Data do aviso / última republicação (PRR)

    // === Dotações Regionais (PT2030 específico) ===
    dotacoesRegionais?: {
        [regiao: string]: number;
    };

    // === Campos Operacionais (Visão de Produto) ===
    canal_submissao?: string;           // "Área Reservada IFAP", "Balcão de Candidaturas", etc.
    caminho_menu?: string;              // Caminho de navegação no portal (ex: "O Meu Processo » Candidaturas")
    pre_requisitos?: string[];          // Lista de requisitos para candidatura

    // === Documentação e Enquadramento ===
    links_legislacao?: string[];        // URLs para portarias, regulamentos, DRE
    link_manual?: string;               // URL do manual técnico/guia

    // === Contacto ===
    contacto?: {
        email?: string;
        telefone?: string;
    };

    // === Notas para Consultores ===
    notas_adicionais?: string;          // Texto livre com informações extras
}

export interface ScraperInput {
    portals: string[];
    maxItemsPerPortal: number;
    onlyOpen: boolean;
    debug?: boolean;
}

export interface ScraperResult {
    portal: string;
    avisos: AvisoNormalized[];
    success: boolean;
    error?: string;
    duration: number;
    metrics: ScraperMetrics;
}

export interface ScraperMetrics {
    totalAvisos: number;
    avisosComDocumentos: number;
    totalDocumentos: number;
    camposNulos: Record<string, number>;
    percentualCobertura: number;
    durationMs: number;
    requestsCount: number;
    errorsCount: number;
}

// Campos base obrigatórios para validação
export const CAMPOS_BASE = [
    'id', 'codigo', 'titulo', 'programa',
    'dataAbertura', 'dataFecho', 'dotacao',
    'status', 'url', 'fonte'
] as const;

// Mapeamento de portais
export const PORTAIS = {
    PORTUGAL2030: 'Portugal 2030',
    PRR: 'PRR',
    PEPAC: 'PEPAC',
    HORIZON: 'Horizon Europe',
    EUROPA_CRIATIVA: 'Europa Criativa',
    IPDJ: 'IPDJ',
    CORDIS: 'CORDIS',
} as const;
