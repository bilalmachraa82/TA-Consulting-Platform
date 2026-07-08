/**
 * Validação de NIPC/NIF português (checksum mod-11).
 *
 * Usado pela ingestão do CSV do Bitrix (semana 2 do Consultancy OS v1):
 * dos ~24k registos do CRM, só interessam os que têm NIPC verificável.
 */

export type NipcCategory = 'COLETIVA' | 'SINGULAR' | 'OUTRO';

const PLACEHOLDER_VALUES = new Set(['n/a', 'na', '-', '--', 'sem nif', 'null', 'none']);

/**
 * Limpa artefactos comuns de exports (prefixo "PT", espaços, hífens,
 * ponto decimal do Excel). Devolve null se não sobrar nada utilizável.
 */
export function normalizeNipc(raw: string): string | null {
    const trimmed = raw.trim();
    if (!trimmed || PLACEHOLDER_VALUES.has(trimmed.toLowerCase())) {
        return null;
    }

    let value = trimmed.toUpperCase();
    if (value.startsWith('PT')) {
        value = value.slice(2);
    }
    // Artefacto de round-trip por Excel: "500697256.0"
    value = value.replace(/\.0+$/, '');
    value = value.replace(/[\s.\-]/g, '');

    return value.length > 0 ? value : null;
}

/** Valida um NIPC já normalizado: 9 dígitos + dígito de controlo mod-11. */
export function isValidNipc(nipc: string): boolean {
    if (!/^\d{9}$/.test(nipc)) {
        return false;
    }

    const digits = nipc.split('').map(Number);
    const sum = digits
        .slice(0, 8)
        .reduce((acc, digit, index) => acc + digit * (9 - index), 0);
    const remainder = sum % 11;
    const check = remainder < 2 ? 0 : 11 - remainder;

    return check === digits[8];
}

/**
 * Classifica pelo primeiro dígito: 5/6 = pessoa coletiva, 1/2/3 = pessoa
 * singular (ENIs aparecem assim no CRM), resto = gamas especiais (heranças,
 * condomínios, não residentes). Não verifica o checksum.
 */
export function nipcCategory(nipc: string): NipcCategory {
    const first = nipc.charAt(0);
    if (first === '5' || first === '6') return 'COLETIVA';
    if (first === '1' || first === '2' || first === '3') return 'SINGULAR';
    return 'OUTRO';
}
