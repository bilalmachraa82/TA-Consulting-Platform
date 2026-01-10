/**
 * NIF Provider - Integration with NIF.PT API
 * 
 * Free tier: 1000 requests/month, 100/day, 10/hour, 1/minute
 * Returns: Nome, Morada, CAE, Atividade
 * 
 * Strategy: Try NIF.PT first, show data for user validation
 */

export interface NifValidationResult {
    valid: boolean;
    nif: string;
    nome?: string;
    morada?: string;
    cae?: string;
    atividade?: string;
    codigoPostal?: string;
    concelho?: string;
    distrito?: string;
    error?: string;
    source: 'NIF.PT' | 'MANUAL' | 'CACHE';
}

// Simple in-memory cache to avoid hitting rate limits
const nifCache = new Map<string, { data: NifValidationResult; timestamp: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Validates NIF format (Portuguese algorithm)
 * NIF must be 9 digits and pass mod 11 check
 */
export function validateNifFormat(nif: string): boolean {
    // Remove spaces and normalize
    const cleanNif = nif.replace(/\s/g, '');

    // Must be 9 digits
    if (!/^\d{9}$/.test(cleanNif)) {
        return false;
    }

    // First digit must be valid (1-9 for companies, 1-3 for individuals)
    const firstDigit = parseInt(cleanNif[0]);
    if (![1, 2, 3, 5, 6, 7, 8, 9].includes(firstDigit)) {
        return false;
    }

    // Módulo 11 validation
    const weights = [9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 8; i++) {
        sum += parseInt(cleanNif[i]) * weights[i];
    }

    const remainder = sum % 11;
    let checkDigit = 11 - remainder;
    if (remainder < 2) {
        checkDigit = 0;
    }

    return checkDigit === parseInt(cleanNif[8]);
}

/**
 * Fetch company data from NIF.PT API
 */
export async function lookupNif(nif: string): Promise<NifValidationResult> {
    const cleanNif = nif.replace(/\s/g, '');

    // Format validation first
    if (!validateNifFormat(cleanNif)) {
        return {
            valid: false,
            nif: cleanNif,
            error: 'NIF inválido - verifique o número',
            source: 'MANUAL',
        };
    }

    // Check cache
    const cached = nifCache.get(cleanNif);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return { ...cached.data, source: 'CACHE' };
    }

    try {
        // NIF.PT API call
        const response = await fetch(`https://www.nif.pt/?json=1&q=${cleanNif}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'TA-Consulting-Platform/1.0',
            },
        });

        if (!response.ok) {
            // Rate limit or other error - return valid format but no enrichment
            return {
                valid: true,
                nif: cleanNif,
                error: 'Não foi possível obter dados - preencha manualmente',
                source: 'MANUAL',
            };
        }

        const data = await response.json();

        // NIF.PT returns result in records array
        if (data.result === 'success' && data.records && data.records[cleanNif]) {
            const record = data.records[cleanNif];

            const result: NifValidationResult = {
                valid: true,
                nif: cleanNif,
                nome: record.title || record.name,
                morada: record.address,
                cae: record.cae,
                atividade: record.activity,
                codigoPostal: record.pc4 ? `${record.pc4}-${record.pc3}` : undefined,
                concelho: record.city,
                distrito: record.district,
                source: 'NIF.PT',
            };

            // Cache successful result
            nifCache.set(cleanNif, { data: result, timestamp: Date.now() });

            return result;
        }

        // NIF not found in database
        return {
            valid: true, // Format is valid, just not in database
            nif: cleanNif,
            error: 'NIF não encontrado na base de dados',
            source: 'MANUAL',
        };

    } catch (error) {
        console.error('NIF.PT API error:', error);

        // Network error - return valid format but no enrichment
        return {
            valid: true,
            nif: cleanNif,
            error: 'Erro de ligação - preencha manualmente',
            source: 'MANUAL',
        };
    }
}

/**
 * Extract distrito from código postal (first 4 digits)
 */
export function getDistritoFromCodigoPostal(cp: string): string | undefined {
    const cp4 = cp.replace(/\D/g, '').substring(0, 4);
    const num = parseInt(cp4);

    // Approximate mapping based on CP ranges
    if (num >= 1000 && num <= 1999) return 'Lisboa';
    if (num >= 2000 && num <= 2099) return 'Santarém';
    if (num >= 2100 && num <= 2199) return 'Santarém';
    if (num >= 2200 && num <= 2299) return 'Leiria';
    if (num >= 2300 && num <= 2399) return 'Leiria';
    if (num >= 2400 && num <= 2499) return 'Leiria';
    if (num >= 2500 && num <= 2599) return 'Leiria';
    if (num >= 2600 && num <= 2699) return 'Lisboa';
    if (num >= 2700 && num <= 2799) return 'Lisboa';
    if (num >= 2800 && num <= 2899) return 'Setúbal';
    if (num >= 2900 && num <= 2999) return 'Setúbal';
    if (num >= 3000 && num <= 3099) return 'Coimbra';
    if (num >= 3100 && num <= 3199) return 'Santarém';
    if (num >= 3200 && num <= 3299) return 'Coimbra';
    if (num >= 3300 && num <= 3399) return 'Coimbra';
    if (num >= 3400 && num <= 3499) return 'Coimbra';
    if (num >= 3500 && num <= 3599) return 'Viseu';
    if (num >= 3600 && num <= 3699) return 'Viseu';
    if (num >= 3700 && num <= 3799) return 'Aveiro';
    if (num >= 3800 && num <= 3899) return 'Aveiro';
    if (num >= 4000 && num <= 4099) return 'Porto';
    if (num >= 4100 && num <= 4199) return 'Porto';
    if (num >= 4200 && num <= 4299) return 'Porto';
    if (num >= 4300 && num <= 4399) return 'Porto';
    if (num >= 4400 && num <= 4499) return 'Porto';
    if (num >= 4500 && num <= 4599) return 'Aveiro';
    if (num >= 4600 && num <= 4699) return 'Porto';
    if (num >= 4700 && num <= 4799) return 'Braga';
    if (num >= 4800 && num <= 4899) return 'Braga';
    if (num >= 4900 && num <= 4999) return 'Viana do Castelo';
    if (num >= 5000 && num <= 5099) return 'Vila Real';
    if (num >= 5100 && num <= 5199) return 'Vila Real';
    if (num >= 5200 && num <= 5299) return 'Vila Real';
    if (num >= 5300 && num <= 5399) return 'Bragança';
    if (num >= 5400 && num <= 5499) return 'Bragança';
    if (num >= 6000 && num <= 6099) return 'Castelo Branco';
    if (num >= 6100 && num <= 6199) return 'Castelo Branco';
    if (num >= 6200 && num <= 6299) return 'Covilhã';
    if (num >= 6300 && num <= 6399) return 'Guarda';
    if (num >= 6400 && num <= 6499) return 'Guarda';
    if (num >= 7000 && num <= 7099) return 'Évora';
    if (num >= 7100 && num <= 7199) return 'Évora';
    if (num >= 7200 && num <= 7299) return 'Évora';
    if (num >= 7300 && num <= 7399) return 'Portalegre';
    if (num >= 7400 && num <= 7499) return 'Portalegre';
    if (num >= 7500 && num <= 7599) return 'Beja';
    if (num >= 7600 && num <= 7699) return 'Beja';
    if (num >= 7700 && num <= 7799) return 'Beja';
    if (num >= 7800 && num <= 7899) return 'Beja';
    if (num >= 8000 && num <= 8099) return 'Faro';
    if (num >= 8100 && num <= 8199) return 'Faro';
    if (num >= 8200 && num <= 8299) return 'Faro';
    if (num >= 8300 && num <= 8399) return 'Faro';
    if (num >= 8400 && num <= 8499) return 'Faro';
    if (num >= 8500 && num <= 8599) return 'Faro';
    if (num >= 8600 && num <= 8699) return 'Faro';
    if (num >= 8700 && num <= 8799) return 'Faro';
    if (num >= 8800 && num <= 8899) return 'Faro';
    if (num >= 9000 && num <= 9099) return 'Madeira';
    if (num >= 9100 && num <= 9199) return 'Madeira';
    if (num >= 9200 && num <= 9299) return 'Madeira';
    if (num >= 9300 && num <= 9399) return 'Madeira';
    if (num >= 9400 && num <= 9499) return 'Açores';
    if (num >= 9500 && num <= 9599) return 'Açores';
    if (num >= 9600 && num <= 9699) return 'Açores';
    if (num >= 9700 && num <= 9799) return 'Açores';
    if (num >= 9800 && num <= 9899) return 'Açores';
    if (num >= 9900 && num <= 9999) return 'Açores';

    return undefined;
}
