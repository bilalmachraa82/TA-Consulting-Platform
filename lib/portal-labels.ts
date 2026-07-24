/**
 * Nomes de exibição dos portais (fase B, deferred D05 do design review):
 * os enums crus (FUNDO_AMBIENTAL, PORTUGAL2030) não são linguagem de
 * utilizador. Fonte única para páginas públicas, hubs e dashboard.
 */
export const PORTAL_LABELS: Record<string, string> = {
    PORTUGAL2030: 'Portugal 2030',
    PRR: 'PRR',
    PEPAC: 'PEPAC',
    TURISMO_PORTUGAL: 'Turismo de Portugal',
    HORIZON_EUROPE: 'Horizon Europe',
    IPDJ: 'IPDJ',
    FUNDO_AMBIENTAL: 'Fundo Ambiental',
    ACORES2030: 'Açores 2030',
    LIFE: 'LIFE',
    EUROPA_CRIATIVA: 'Europa Criativa',
    DIGITAL_EUROPE: 'Digital Europe',
};

export const portalLabel = (p: string): string => PORTAL_LABELS[p] ?? p.replace(/_/g, ' ');
