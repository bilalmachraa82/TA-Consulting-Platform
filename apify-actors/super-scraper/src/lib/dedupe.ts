/**
 * Dedupe module - Merge avisos from multiple sources
 */

import { AvisoNormalized } from './types';

/**
 * Default key function - generates unique key from portal + codigo
 */
export function defaultKeyFn(aviso: AvisoNormalized): string {
    const portal = aviso.fonte?.replace(/\s+/g, '') || 'UNKNOWN';
    const codigo = aviso.codigo || aviso.id || '';
    return `${portal}:${codigo}`;
}

/**
 * Merge avisos from primary and secondary sources
 * Primary source takes precedence, secondary enriches missing fields
 */
export function mergeAvisosByCode(
    primary: AvisoNormalized[],
    secondary: AvisoNormalized[],
    enrichFields: (keyof AvisoNormalized)[],
    keyFn: (aviso: AvisoNormalized) => string = defaultKeyFn
): AvisoNormalized[] {
    const map = new Map<string, AvisoNormalized>();

    // Add all primary avisos
    for (const aviso of primary) {
        const key = keyFn(aviso);
        map.set(key, { ...aviso });
    }

    // Enrich with secondary or add new
    for (const aviso of secondary) {
        const key = keyFn(aviso);

        if (map.has(key)) {
            // Enrich existing with secondary fields
            const existing = map.get(key)!;
            for (const field of enrichFields) {
                const existingValue = existing[field];
                const secondaryValue = aviso[field];

                // Only enrich if existing is empty and secondary has value
                if (isEmpty(existingValue) && !isEmpty(secondaryValue)) {
                    (existing as any)[field] = secondaryValue;
                }
            }
        } else {
            // Add new from secondary
            map.set(key, { ...aviso });
        }
    }

    return Array.from(map.values());
}

/**
 * Check if value is empty
 */
function isEmpty(value: any): boolean {
    if (value === undefined || value === null || value === '') return true;
    if (Array.isArray(value) && value.length === 0) return true;
    if (typeof value === 'number' && value === 0) return true;
    return false;
}

/**
 * Dedupe avisos within a single array (remove duplicates)
 */
export function dedupeAvisos(
    avisos: AvisoNormalized[],
    keyFn: (aviso: AvisoNormalized) => string = defaultKeyFn
): AvisoNormalized[] {
    const map = new Map<string, AvisoNormalized>();

    for (const aviso of avisos) {
        const key = keyFn(aviso);
        if (!map.has(key)) {
            map.set(key, aviso);
        }
    }

    return Array.from(map.values());
}

/**
 * Create key function for specific portal (ignores portal prefix)
 */
export function createPortalKeyFn(portal: string) {
    return (aviso: AvisoNormalized): string => {
        return aviso.codigo || aviso.id || `${portal}:${Date.now()}`;
    };
}
