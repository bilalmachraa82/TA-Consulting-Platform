/**
 * Comparação canónica de roles (fix 24/07): a BD guarda 'ADMIN'/'CONSULTANT'
 * (maiúsculas) mas vários checks comparavam 'admin'/'consultor' minúsculos —
 * resultado: NENHUM admin conseguia criar empresas/avisos (403 sempre) e o
 * bypass de admin do tenant nunca disparava. Normalizar aqui, uma vez.
 */

export const normalizaRole = (r?: string | null): string => (r ?? '').toUpperCase();

export const isAdmin = (r?: string | null): boolean => normalizaRole(r) === 'ADMIN';

/** Quem pode escrever recursos (empresas, avisos…): admin ou consultor/consultant. */
export const podeEscrever = (r?: string | null): boolean =>
    ['ADMIN', 'CONSULTANT', 'CONSULTOR'].includes(normalizaRole(r));
