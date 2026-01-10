/**
 * Eligibility Engine V1
 * 
 * Deterministic rules engine for matching Leads to Avisos.
 * Core principle: Explainability first - every match has reasons[] and missing[].
 */

// ============ Types ============

export interface LeadInput {
    nomeEmpresa: string;
    email: string;
    distrito: string;
    tipoProjetoDesejado: string;
    cae?: string;
    dimensao?: 'MICRO' | 'PEQUENA' | 'MEDIA' | 'GRANDE';
    investimentoEstimado?: number;
    empregados?: number;
}

export interface AvisoCriteria {
    id: string;
    nome: string;
    portal: string;
    programa: string;
    dataFimSubmissao: Date;
    link?: string;
    taxa?: string;
    criterios: {
        dimensao?: string[];
        caePrefixos?: string[];
        regioes?: string[];
        tiposProjeto?: string[];
        investimentoMin?: number;
        investimentoMax?: number;
    };
    documentosNecessarios?: string[];
}

export interface MatchResult {
    avisoId: string;
    avisoNome: string;
    portal: string;
    link?: string;
    taxa?: string;
    diasRestantes: number;
    score: number;
    confidence: 'ALTA' | 'MEDIA' | 'BAIXA';
    reasons: string[];
    missing: string[];
    matchDetails: {
        dimensaoMatch: boolean;
        regiaoMatch: boolean;
        caeMatch: boolean;
        tipoProjetoMatch: boolean;
        investimentoMatch: boolean;
    };
}

export interface EligibilityResult {
    leadId: string;
    totalAvisosAnalisados: number;
    matches: MatchResult[];
    noMatches: number;
    processedAt: Date;
}

// ============ Region Mapping ============

const DISTRITO_TO_REGIAO: Record<string, string> = {
    'Aveiro': 'Centro',
    'Beja': 'Alentejo',
    'Braga': 'Norte',
    'Bragança': 'Norte',
    'Castelo Branco': 'Centro',
    'Coimbra': 'Centro',
    'Évora': 'Alentejo',
    'Faro': 'Algarve',
    'Guarda': 'Centro',
    'Leiria': 'Centro',
    'Lisboa': 'Lisboa',
    'Portalegre': 'Alentejo',
    'Porto': 'Norte',
    'Santarém': 'Centro',
    'Setúbal': 'Lisboa',
    'Viana do Castelo': 'Norte',
    'Vila Real': 'Norte',
    'Viseu': 'Centro',
    'Açores': 'Açores',
    'Madeira': 'Madeira',
};

// ============ Core Engine ============

export function checkCAEMatch(leadCAE: string | undefined, avisoCAEPrefixos: string[] | undefined): boolean {
    if (!leadCAE || !avisoCAEPrefixos || avisoCAEPrefixos.length === 0) {
        return false;
    }
    return avisoCAEPrefixos.some(prefix => leadCAE.startsWith(prefix));
}

export function checkRegiaoMatch(leadDistrito: string, avisoRegioes: string[] | undefined): boolean {
    if (!avisoRegioes || avisoRegioes.length === 0) {
        return true;
    }
    const leadRegiao = DISTRITO_TO_REGIAO[leadDistrito];
    if (!leadRegiao) return false;
    return avisoRegioes.some(r =>
        r.toLowerCase() === leadRegiao.toLowerCase() ||
        r.toLowerCase() === 'nacional' ||
        r.toLowerCase() === 'todo o país'
    );
}

export function checkDimensaoMatch(leadDimensao: string | undefined, avisoDimensoes: string[] | undefined): boolean {
    if (!leadDimensao || !avisoDimensoes || avisoDimensoes.length === 0) {
        return true;
    }
    return avisoDimensoes.some(d => d.toUpperCase() === leadDimensao.toUpperCase());
}

export function checkTipoProjetoMatch(leadTipo: string, avisoTipos: string[] | undefined): boolean {
    if (!avisoTipos || avisoTipos.length === 0) {
        return true;
    }
    return avisoTipos.some(t => t.toLowerCase() === leadTipo.toLowerCase());
}

export function checkInvestimentoMatch(
    leadInvestimento: number | undefined,
    min: number | undefined,
    max: number | undefined
): boolean {
    if (!leadInvestimento) return true;
    if (min && leadInvestimento < min) return false;
    if (max && leadInvestimento > max) return false;
    return true;
}

export function evaluateMatch(lead: LeadInput, aviso: AvisoCriteria): MatchResult {
    const now = new Date();
    const diasRestantes = Math.ceil((aviso.dataFimSubmissao.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const criterios = aviso.criterios;

    const dimensaoMatch = checkDimensaoMatch(lead.dimensao, criterios.dimensao);
    const regiaoMatch = checkRegiaoMatch(lead.distrito, criterios.regioes);
    const caeMatch = checkCAEMatch(lead.cae, criterios.caePrefixos);
    const tipoProjetoMatch = checkTipoProjetoMatch(lead.tipoProjetoDesejado, criterios.tiposProjeto);
    const investimentoMatch = checkInvestimentoMatch(lead.investimentoEstimado, criterios.investimentoMin, criterios.investimentoMax);

    const reasons: string[] = [];
    if (regiaoMatch && criterios.regioes && criterios.regioes.length > 0) {
        reasons.push(`Região compatível: ${DISTRITO_TO_REGIAO[lead.distrito] || lead.distrito}`);
    } else if (regiaoMatch) {
        reasons.push('Âmbito Nacional');
    }
    if (dimensaoMatch && lead.dimensao) {
        reasons.push(`Dimensão elegível: ${lead.dimensao}`);
    }
    if (caeMatch && lead.cae) {
        reasons.push(`CAE compatível: ${lead.cae}`);
    }
    if (tipoProjetoMatch) {
        reasons.push(`Tipo de projeto alinhado`);
    }
    if (investimentoMatch && lead.investimentoEstimado) {
        reasons.push(`Investimento dentro dos limites`);
    }

    const missing: string[] = [];
    if (!lead.dimensao) {
        missing.push('Confirmar dimensão da empresa (nº empregados)');
    }
    if (!lead.cae) {
        missing.push('Confirmar CAE principal');
    }
    if (!lead.investimentoEstimado && (criterios.investimentoMin || criterios.investimentoMax)) {
        missing.push('Indicar montante de investimento previsto');
    }
    if (aviso.documentosNecessarios && aviso.documentosNecessarios.length > 0) {
        missing.push(`Documentação: ${aviso.documentosNecessarios.slice(0, 2).join(', ')}`);
    }
    if (!caeMatch && lead.cae) {
        missing.push('CAE pode não ser elegível - confirmar com regulamento');
    }

    let score = 0;
    const weights = { regiao: 20, dimensao: 25, cae: 30, tipoProjeto: 15, investimento: 10 };
    if (regiaoMatch) score += weights.regiao;
    if (dimensaoMatch) score += weights.dimensao;
    if (caeMatch) score += weights.cae;
    if (tipoProjetoMatch) score += weights.tipoProjeto;
    if (investimentoMatch) score += weights.investimento;

    let confidence: 'ALTA' | 'MEDIA' | 'BAIXA' = 'BAIXA';
    if (lead.cae && lead.dimensao && lead.investimentoEstimado) {
        confidence = 'ALTA';
    } else if (lead.cae || lead.dimensao) {
        confidence = 'MEDIA';
    }

    return {
        avisoId: aviso.id,
        avisoNome: aviso.nome,
        portal: aviso.portal,
        link: aviso.link,
        taxa: aviso.taxa,
        diasRestantes,
        score,
        confidence,
        reasons,
        missing,
        matchDetails: { dimensaoMatch, regiaoMatch, caeMatch, tipoProjetoMatch, investimentoMatch },
    };
}

// ============ Main Entry Point ============

export async function runEligibilityCheck(lead: LeadInput, avisosWithCriteria: AvisoCriteria[]): Promise<MatchResult[]> {
    const results: MatchResult[] = [];
    for (const aviso of avisosWithCriteria) {
        if (aviso.dataFimSubmissao < new Date()) continue;
        const match = evaluateMatch(lead, aviso);
        if (match.score >= 40) {
            results.push(match);
        }
    }
    results.sort((a, b) => b.score - a.score);
    return results;
}

function generateLeadId(): string {
    return 'lead_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

export async function processLeadSubmission(leadInput: LeadInput, avisosWithCriteria: AvisoCriteria[]): Promise<EligibilityResult> {
    const leadId = generateLeadId();
    const matches = await runEligibilityCheck(leadInput, avisosWithCriteria);

    console.log('[Lead Magnet] New lead processed:', {
        leadId,
        email: leadInput.email,
        empresa: leadInput.nomeEmpresa,
        matchCount: matches.length,
    });

    return {
        leadId,
        totalAvisosAnalisados: avisosWithCriteria.length,
        matches: matches.slice(0, 10),
        noMatches: avisosWithCriteria.length - matches.length,
        processedAt: new Date(),
    };
}
