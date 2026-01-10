/**
 * Keyword Extractor & Compliance Checker
 * 
 * Extracts required keywords from aviso criteria and checks compliance in generated text.
 * Used by the AI Writer to show real-time keyword compliance.
 */

// Common keywords by funding program category
export const KEYWORD_SETS: Record<string, string[]> = {
    inovacao: [
        'inovação', 'inovador', 'inovar',
        'I&D', 'investigação', 'desenvolvimento',
        'tecnologia', 'tecnológico',
        'competitividade', 'diferenciação',
        'propriedade intelectual', 'patente',
    ],
    sustentabilidade: [
        'sustentabilidade', 'sustentável',
        'ambiente', 'ambiental',
        'verde', 'transição verde',
        'carbono', 'emissões', 'neutralidade',
        'economia circular', 'reciclagem',
        'eficiência energética', 'energia',
    ],
    digitalizacao: [
        'digital', 'digitalização',
        'transformação digital', 'maturidade digital',
        'automação', 'automatização',
        'cloud', 'dados', 'inteligência artificial',
        'cibersegurança', 'segurança',
        'e-commerce', 'plataforma',
    ],
    internacionalizacao: [
        'exportação', 'exportar',
        'mercados externos', 'internacional',
        'internacionalização',
        'competitividade internacional',
        'presença global',
    ],
    emprego: [
        'emprego', 'postos de trabalho',
        'criação de emprego', 'contratação',
        'qualificado', 'qualificação',
        'formação', 'capacitação',
        'recursos humanos',
    ],
    investimento: [
        'investimento', 'investir',
        'produtivo', 'capacidade produtiva',
        'eficiência', 'produtividade',
        'crescimento', 'expansão',
    ],
};

// Keywords commonly required in PT2030/PRR applications
export const MANDATORY_KEYWORDS: Record<string, string[]> = {
    'pt2030-inovacao': ['inovação', 'investimento', 'emprego', 'competitividade'],
    'prr-digital': ['digital', 'transformação', 'tecnologia', 'cibersegurança'],
};

export interface KeywordMatch {
    keyword: string;
    count: number;
    required: boolean;
    found: boolean;
}

export interface ComplianceResult {
    keywords: KeywordMatch[];
    score: number; // 0-100
    totalRequired: number;
    foundRequired: number;
    suggestions: string[];
}

/**
 * Extract relevant keywords based on template type
 */
export function getKeywordsForTemplate(templateId: string): string[] {
    const mandatory = MANDATORY_KEYWORDS[templateId] || [];

    // Add keywords from related sets
    let keywords = [...mandatory];

    if (templateId.includes('inovacao')) {
        keywords.push(...KEYWORD_SETS.inovacao.slice(0, 5));
        keywords.push(...KEYWORD_SETS.emprego.slice(0, 3));
    } else if (templateId.includes('digital')) {
        keywords.push(...KEYWORD_SETS.digitalizacao.slice(0, 5));
        keywords.push(...KEYWORD_SETS.sustentabilidade.slice(0, 3));
    }

    // Remove duplicates
    return [...new Set(keywords.map(k => k.toLowerCase()))];
}

/**
 * Extract keywords from aviso description/criteria using simple NLP
 */
export function extractKeywordsFromAviso(avisoText: string): string[] {
    const text = avisoText.toLowerCase();
    const foundKeywords: string[] = [];

    // Check all keyword sets
    Object.values(KEYWORD_SETS).flat().forEach(keyword => {
        if (text.includes(keyword.toLowerCase())) {
            foundKeywords.push(keyword);
        }
    });

    // Remove duplicates and return top 10
    return [...new Set(foundKeywords)].slice(0, 10);
}

/**
 * Check keyword compliance in generated text
 */
export function checkKeywordCompliance(
    text: string,
    requiredKeywords: string[]
): ComplianceResult {
    const lowerText = text.toLowerCase();
    const keywords: KeywordMatch[] = [];
    let foundRequired = 0;

    for (const keyword of requiredKeywords) {
        const lowerKeyword = keyword.toLowerCase();
        const regex = new RegExp(lowerKeyword, 'gi');
        const matches = lowerText.match(regex);
        const count = matches ? matches.length : 0;
        const found = count > 0;

        keywords.push({
            keyword,
            count,
            required: true,
            found,
        });

        if (found) foundRequired++;
    }

    // Calculate score
    const score = requiredKeywords.length > 0
        ? Math.round((foundRequired / requiredKeywords.length) * 100)
        : 100;

    // Generate suggestions for missing keywords
    const suggestions: string[] = [];
    const missingKeywords = keywords.filter(k => !k.found);

    if (missingKeywords.length > 0) {
        suggestions.push(
            `Considere adicionar referências a: ${missingKeywords.map(k => k.keyword).join(', ')}`
        );
    }

    if (score < 50) {
        suggestions.push('O texto pode não estar suficientemente alinhado com os critérios do aviso.');
    }

    return {
        keywords,
        score,
        totalRequired: requiredKeywords.length,
        foundRequired,
        suggestions,
    };
}

/**
 * Quick compliance check for a section
 */
export function quickComplianceCheck(
    text: string,
    templateId: string,
    avisoDescription?: string
): ComplianceResult {
    // Get keywords from template
    let keywords = getKeywordsForTemplate(templateId);

    // Add keywords from aviso if provided
    if (avisoDescription) {
        const avisoKeywords = extractKeywordsFromAviso(avisoDescription);
        keywords = [...new Set([...keywords, ...avisoKeywords])];
    }

    return checkKeywordCompliance(text, keywords);
}
