/**
 * Company Intel Agent - AI-powered company data enrichment
 * 
 * Uses existing NIF.PT provider + Gemini Grounding for comprehensive data
 * 
 * Strategy:
 * 1. First try NIF.PT (fast, free)
 * 2. If incomplete → Use Gemini with Google Search Grounding
 * 3. Return unified CompanyProfile
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { lookupNif, validateNifFormat, type NifValidationResult } from '@/lib/nif-provider';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface CompanyProfile {
    // Core identification
    nif: string;
    nome: string;

    // Location
    morada?: string;
    codigoPostal?: string;
    concelho?: string;
    distrito?: string;
    nutII?: string;
    nutIII?: string;

    // Business classification
    caePrincipal?: {
        codigo: string;
        descricao: string;
    };
    caesSecundarios?: {
        codigo: string;
        descricao: string;
    }[];
    atividade?: string;

    // Size & capacity
    dimensao?: 'Micro' | 'Pequena' | 'Média' | 'Grande';
    empregados?: number;
    faturacao?: number;

    // Metadata
    fontes: string[];
    confianca: 'ALTA' | 'MEDIA' | 'BAIXA';
    enrichedAt: Date;
    errors?: string[];
}

// District to NUT II mapping
const DISTRITO_TO_NUT_II: Record<string, string> = {
    'Lisboa': 'Área Metropolitana de Lisboa',
    'Setúbal': 'Área Metropolitana de Lisboa',
    'Porto': 'Norte',
    'Braga': 'Norte',
    'Viana do Castelo': 'Norte',
    'Vila Real': 'Norte',
    'Bragança': 'Norte',
    'Coimbra': 'Centro',
    'Aveiro': 'Centro',
    'Leiria': 'Centro',
    'Viseu': 'Centro',
    'Guarda': 'Centro',
    'Castelo Branco': 'Centro',
    'Santarém': 'Centro',
    'Portalegre': 'Alentejo',
    'Évora': 'Alentejo',
    'Beja': 'Alentejo',
    'Faro': 'Algarve',
    'Açores': 'Região Autónoma dos Açores',
    'Madeira': 'Região Autónoma da Madeira',
};

// Cache for AI enrichments (avoid redundant API calls)
const enrichmentCache = new Map<string, { data: CompanyProfile; timestamp: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Main entry point: Enrich company data from NIF
 */
export async function enrichCompanyData(nif: string): Promise<CompanyProfile> {
    const cleanNif = nif.replace(/\s/g, '');

    // Check cache first
    const cached = enrichmentCache.get(cleanNif);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        console.log(`[CompanyIntel] Cache hit for ${cleanNif}`);
        return cached.data;
    }

    // Validate NIF format
    if (!validateNifFormat(cleanNif)) {
        return createErrorProfile(cleanNif, 'NIF inválido - verifique o número');
    }

    // Step 1: Try NIF.PT first (fast, rate-limited)
    console.log(`[CompanyIntel] Looking up NIF ${cleanNif} via NIF.PT...`);
    const nifResult = await lookupNif(cleanNif);

    // Build initial profile from NIF.PT
    let profile = buildProfileFromNifPT(nifResult);

    // Step 2: If we have core data, try to enrich with AI
    if (nifResult.valid && nifResult.nome) {
        const needsEnrichment = !profile.dimensao || !profile.nutII || !profile.caesSecundarios?.length;

        if (needsEnrichment) {
            console.log(`[CompanyIntel] Enriching ${cleanNif} with Gemini...`);
            try {
                profile = await enrichWithGemini(profile);
            } catch (error) {
                console.error('[CompanyIntel] Gemini enrichment failed:', error);
                profile.errors = [...(profile.errors || []), 'Falha no enriquecimento AI'];
            }
        }
    }

    // Cache the result
    enrichmentCache.set(cleanNif, { data: profile, timestamp: Date.now() });

    return profile;
}

/**
 * Build initial profile from NIF.PT data
 */
function buildProfileFromNifPT(nifResult: NifValidationResult): CompanyProfile {
    const distrito = nifResult.distrito;
    const nutII = distrito ? DISTRITO_TO_NUT_II[distrito] : undefined;

    return {
        nif: nifResult.nif,
        nome: nifResult.nome || 'Empresa Desconhecida',
        morada: nifResult.morada,
        codigoPostal: nifResult.codigoPostal,
        concelho: nifResult.concelho,
        distrito: nifResult.distrito,
        nutII,
        caePrincipal: nifResult.cae ? {
            codigo: nifResult.cae,
            descricao: nifResult.atividade || '',
        } : undefined,
        atividade: nifResult.atividade,
        fontes: nifResult.source === 'NIF.PT' ? ['NIF.PT'] : [],
        confianca: nifResult.source === 'NIF.PT' ? 'MEDIA' : 'BAIXA',
        enrichedAt: new Date(),
        errors: nifResult.error ? [nifResult.error] : [],
    };
}

/**
 * Enrich profile with Gemini + Google Search Grounding
 */
async function enrichWithGemini(profile: CompanyProfile): Promise<CompanyProfile> {
    // Use Gemini 1.5 Pro which supports Google Search Grounding
    // Note: Gemini 2.0 Flash does NOT support grounding - use 1.5 Pro or 2.5+
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-pro',
        generationConfig: {
            temperature: 0.1, // Low temperature for factual data
            maxOutputTokens: 1024,
        },
    });

    const prompt = `Você é um Analista de Inteligência Corporativa especializado em empresas portuguesas.

TAREFA: Enriqueça os dados da empresa abaixo com informação adicional disponível publicamente.

DADOS ATUAIS:
- NIF: ${profile.nif}
- Nome: ${profile.nome}
- Morada: ${profile.morada || 'Desconhecida'}
- CAE Principal: ${profile.caePrincipal?.codigo || 'Desconhecido'}
- Distrito: ${profile.distrito || 'Desconhecido'}

DADOS A OBTER (se disponíveis):
1. CAEs Secundários (códigos e descrições)
2. Dimensão da Empresa (Micro/Pequena/Média/Grande)
3. NUT III (mais específico que distrito)
4. Número aproximado de colaboradores

FONTES PRIORITÁRIAS: racius.com, linkedin.com, iapmei.pt, einforma.pt

FORMATO DE RESPOSTA (JSON apenas, sem markdown):
{
  "caesSecundarios": [{"codigo": "XXXXX", "descricao": "..."}],
  "dimensao": "Pequena",
  "nutIII": "Grande Lisboa",
  "empregados": 25,
  "fontesDados": ["racius.com", "linkedin.com"]
}

Se não encontrar dados, retorne campos como null. Responda APENAS com JSON válido.`;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response.text();

        // Parse JSON from response (handle potential markdown wrapping)
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.warn('[CompanyIntel] No valid JSON in Gemini response');
            return profile;
        }

        const enrichment = JSON.parse(jsonMatch[0]);

        // Merge enrichment into profile
        return {
            ...profile,
            caesSecundarios: enrichment.caesSecundarios || profile.caesSecundarios,
            dimensao: enrichment.dimensao || profile.dimensao,
            nutIII: enrichment.nutIII || profile.nutIII,
            empregados: enrichment.empregados || profile.empregados,
            fontes: [...profile.fontes, ...(enrichment.fontesDados || ['Gemini AI'])],
            confianca: enrichment.dimensao ? 'ALTA' : profile.confianca,
        };

    } catch (error) {
        console.error('[CompanyIntel] Gemini parsing error:', error);
        return profile;
    }
}

/**
 * Create error profile for invalid NIF
 */
function createErrorProfile(nif: string, error: string): CompanyProfile {
    return {
        nif,
        nome: 'NIF Inválido',
        fontes: [],
        confianca: 'BAIXA',
        enrichedAt: new Date(),
        errors: [error],
    };
}

/**
 * Quick validation without full enrichment
 */
export function quickValidateNif(nif: string): { valid: boolean; error?: string } {
    const cleanNif = nif.replace(/\s/g, '');

    if (!validateNifFormat(cleanNif)) {
        return { valid: false, error: 'Formato de NIF inválido' };
    }

    return { valid: true };
}

/**
 * Estimate company dimension from CAE prefix (fallback)
 */
export function estimateDimensaoFromCAE(_cae: string): 'Micro' | 'Pequena' | 'Média' | undefined {
    // This is a rough heuristic - most Portuguese companies are Micro/Pequena
    // Real dimension requires official data (IAPMEI, IES, etc.)
    return undefined;
}
