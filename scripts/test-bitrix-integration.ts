/**
 * BITRIX24 INTEGRATION TEST SUITE
 * ================================
 *
 * Tests:
 * 1. Bitrix connection status
 * 2. Fetch companies from Bitrix
 * 3. Available fields for matching
 * 4. Matching logic with avisos
 * 5. Sample of matched companies
 *
 * Run: npx tsx scripts/test-bitrix-integration.ts
 */

const BITRIX_WEBHOOK = process.env.BITRIX_WEBHOOK_URL ||
    "https://taconsulting.bitrix24.com/rest/744/dm213axt003upvfk/";

// Sample avisos from scraped data
const SAMPLE_AVISOS = [
    {
        id: "PT2030_SI_INOVACAO_2024",
        titulo: "SI Inovação Produtiva - Aviso N.º 01/C05-i01/2024",
        setor: "Indústria Transformadora",
        regiao: "Norte, Centro, Alentejo",
        tipo_beneficiario: "PME e Grandes Empresas",
        montante_min: "250000",
        montante_max: "25000000",
        data_fecho: "2025-12-31"
    },
    {
        id: "PT2030_QUALIFICACAO_2024",
        titulo: "SI Qualificação e Internacionalização de PME",
        setor: "Serviços e Comércio",
        regiao: "Nacional",
        tipo_beneficiario: "PME",
        montante_min: "25000",
        montante_max: "500000",
        data_fecho: "2025-12-31"
    },
    {
        id: "PT2030_DIGITAL_2024",
        titulo: "Aviso Transição Digital das Empresas",
        setor: "Todos os setores",
        regiao: "Nacional",
        tipo_beneficiario: "Micro, Pequenas e Médias Empresas",
        montante_min: "10000",
        montante_max: "1000000",
        data_fecho: "2025-12-31"
    }
];

// CAE Field ID from Bitrix
const CAE_FIELD = 'UF_CRM_1738505715849';

// CAE ID to 2-digit code mapping (subset from audit)
const CAE_ID_TO_CODE: Record<string, string> = {
    "6056": "01", "6058": "02", "6060": "03", "6070": "10",
    "6076": "13", "6094": "22", "6128": "41", "6130": "42",
    "6132": "43", "6136": "46", "6138": "47", "6160": "62",
    "6174": "70", "6198": "84", "6200": "85", "6202": "86"
};

// Setor to CAE prefixes mapping
const SETOR_TO_CAE_PREFIXES: Record<string, string[]> = {
    'Indústria Transformadora': ['10', '11', '13', '14', '15', '16', '17', '18', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33'],
    'Indústria': ['10', '11', '13', '14', '15', '16', '17', '18', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33'],
    'Serviços e Comércio': ['45', '46', '47', '55', '56', '58', '59', '60', '61', '62', '63', '69', '70', '71', '72', '73', '74'],
    'I&D e Tecnologia': ['62', '63', '72', '73', '74'],
    'Agricultura': ['01', '02', '03'],
    'Todos os setores': [],
};

// Region mapping (district to region)
const DISTRITO_TO_REGIAO: Record<string, string> = {
    'Aveiro': 'Centro', 'Beja': 'Alentejo', 'Braga': 'Norte', 'Bragança': 'Norte',
    'Castelo Branco': 'Centro', 'Coimbra': 'Centro', 'Évora': 'Alentejo',
    'Faro': 'Algarve', 'Guarda': 'Centro', 'Leiria': 'Centro', 'Lisboa': 'Lisboa',
    'Portalegre': 'Alentejo', 'Porto': 'Norte', 'Santarém': 'Centro',
    'Setúbal': 'Lisboa', 'Viana do Castelo': 'Norte', 'Vila Real': 'Norte',
    'Viseu': 'Centro', 'Açores': 'Açores', 'Madeira': 'Madeira',
    'Norte': 'Norte', 'Centro': 'Centro', 'Lisboa': 'Lisboa',
    'Alentejo': 'Alentejo', 'Algarve': 'Algarve'
};

interface BitrixCompany {
    ID: string;
    TITLE: string;
    ADDRESS_REGION: string | null;
    EMPLOYEES: string | null;
    [key: string]: any;
}

interface MatchResult {
    companyId: string;
    companyName: string;
    avisoId: string;
    avisoTitulo: string;
    score: number;
    reasons: string[];
    cae?: string;
    regiao?: string;
    dimensao?: string;
}

// ==================== TEST FUNCTIONS ====================

async function testConnection(): Promise<{ success: boolean; user?: string; error?: string }> {
    try {
        const response = await fetch(`${BITRIX_WEBHOOK}profile.json`);
        const data = await response.json();

        if (data.error) {
            return { success: false, error: data.error_description };
        }

        return {
            success: true,
            user: `${data.result?.NAME || ''} ${data.result?.LAST_NAME || ''}`.trim()
        };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

async function getCompanyCount(): Promise<number> {
    const response = await fetch(`${BITRIX_WEBHOOK}crm.company.list.json?start=0`);
    const data = await response.json();
    return data.total || 0;
}

async function fetchCompanies(limit = 100): Promise<BitrixCompany[]> {
    const companies: BitrixCompany[] = [];
    let start = 0;

    while (companies.length < limit) {
        const response = await fetch(`${BITRIX_WEBHOOK}crm.company.list.json?start=${start}`);
        const data = await response.json();

        if (data.result) {
            companies.push(...data.result);
            start = data.next || 0;
            if (start === 0) break;
        } else {
            break;
        }
    }

    return companies.slice(0, limit);
}

function mapDimensao(employees: string | null): string {
    if (!employees) return 'Desconhecido';
    switch (employees) {
        case 'EMPLOYEES_1': return 'MICRO';      // < 10
        case 'EMPLOYEES_2': return 'PEQUENA';     // 10-49
        case 'EMPLOYEES_3': return 'MEDIA';       // 50-249
        case 'EMPLOYEES_4': return 'GRANDE';      // 250+
        default: return 'Desconhecido';
    }
}

function checkCAEMatch(companyCAE: string | undefined, avisoSetor: string): boolean {
    if (!companyCAE || !avisoSetor) return false;

    // Get CAE prefixes for the aviso sector
    const caePrefixes = SETOR_TO_CAE_PREFIXES[avisoSetor];
    if (!caePrefixes || caePrefixes.length === 0) {
        // "Todos os setores" means match any
        return true;
    }

    // Map Bitrix CAE ID to 2-digit code
    const caeCode = CAE_ID_TO_CODE[companyCAE] || companyCAE;

    // Check if any prefix matches
    return caePrefixes.some(prefix => caeCode.startsWith(prefix));
}

function checkRegiaoMatch(companyRegion: string | null, avisoRegiao: string): boolean {
    if (!avisoRegiao || avisoRegiao.toLowerCase() === 'nacional') return true;
    if (!companyRegion) return false;

    const avisoRegioes = avisoRegiao.split(',').map(r => r.trim().toLowerCase());
    const normalizedCompanyRegion = companyRegion.toLowerCase();

    return avisoRegioes.some(r =>
        r === normalizedCompanyRegion ||
        r === 'nacional' ||
        normalizedCompanyRegion.includes(r)
    );
}

function checkDimensaoMatch(companyDimensao: string, avisoTipoBeneficiario: string): boolean {
    if (!avisoTipoBeneficiario) return true;

    const tipoLower = avisoTipoBeneficiario.toLowerCase();

    // Check all sizes
    if (tipoLower.includes('todas') || tipoLower.includes('empresas')) return true;

    // PME = Micro + Pequena + Media
    if (tipoLower.includes('pme')) {
        return ['MICRO', 'PEQUENA', 'MEDIA'].includes(companyDimensao);
    }

    // Specific size checks
    if (tipoLower.includes('micro')) return companyDimensao === 'MICRO';
    if (tipoLower.includes('pequena')) return companyDimensao === 'PEQUENA';
    if (tipoLower.includes('media') || tipoLower.includes('média')) return companyDimensao === 'MEDIA';
    if (tipoLower.includes('grande')) return companyDimensao === 'GRANDE';

    return true;
}

function calculateMatchScore(company: BitrixCompany, aviso: typeof SAMPLE_AVISOS[0]): {
    score: number;
    reasons: string[];
} {
    const score = { total: 0, reasons: [] as string[] };
    const weights = { regiao: 25, dimensao: 25, cae: 50 };

    const companyDimensao = mapDimensao(company.EMPLOYEES);
    const companyCAE = company[CAE_FIELD];

    // Region match
    if (checkRegiaoMatch(company.ADDRESS_REGION, aviso.regiao)) {
        score.total += weights.regiao;
        score.reasons.push(`Região compatível: ${company.ADDRESS_REGION || 'Nacional'}`);
    }

    // Dimension match
    if (checkDimensaoMatch(companyDimensao, aviso.tipo_beneficiario)) {
        score.total += weights.dimensao;
        score.reasons.push(`Dimensão ${companyDimensao} elegível`);
    }

    // CAE match
    if (companyCAE && checkCAEMatch(companyCAE, aviso.setor)) {
        score.total += weights.cae;
        score.reasons.push(`CAE ${companyCAE} compatível com setor ${aviso.setor}`);
    } else if (!companyCAE && aviso.setor === 'Todos os setores') {
        score.total += weights.cae;
        score.reasons.push('Setor universal - todos os CAE elegíveis');
    }

    return score;
}

function matchCompaniesToAvisos(companies: BitrixCompany[], avisos: typeof SAMPLE_AVISOS): MatchResult[] {
    const matches: MatchResult[] = [];

    for (const aviso of avisos) {
        for (const company of companies) {
            const result = calculateMatchScore(company, aviso);

            // Only include matches with score >= 50
            if (result.total >= 50) {
                matches.push({
                    companyId: company.ID,
                    companyName: company.TITLE,
                    avisoId: aviso.id,
                    avisoTitulo: aviso.titulo,
                    score: result.total,
                    reasons: result.reasons,
                    cae: company[CAE_FIELD] || undefined,
                    regiao: company.ADDRESS_REGION || undefined,
                    dimensao: mapDimensao(company.EMPLOYEES)
                });
            }
        }
    }

    // Sort by score descending
    matches.sort((a, b) => b.score - a.score);
    return matches;
}

async function getAvailableFields(): Promise<string[]> {
    const response = await fetch(`${BITRIX_WEBHOOK}crm.company.list.json`);
    const data = await response.json();

    if (data.result && data.result.length > 0) {
        return Object.keys(data.result[0]);
    }

    return [];
}

// ==================== MAIN ====================

async function main() {
    console.log('╔═══════════════════════════════════════════════════════════════════╗');
    console.log('║           BITRIX24 INTEGRATION TEST SUITE                         ║');
    console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

    const results: any = {
        connection: null,
        companyCount: 0,
        fieldsAvailable: [],
        companiesWithCAE: 0,
        companiesWithRegion: 0,
        matches: []
    };

    // TEST 1: Connection
    console.log('┌─────────────────────────────────────────────────────────────────────┐');
    console.log('│ TEST 1: BITRIX CONNECTION                                           │');
    console.log('└─────────────────────────────────────────────────────────────────────┘');
    const connectionTest = await testConnection();
    results.connection = connectionTest;

    if (connectionTest.success) {
        console.log(`  Status: ✅ CONNECTED`);
        console.log(`  User: ${connectionTest.user}`);
    } else {
        console.log(`  Status: ❌ FAILED`);
        console.log(`  Error: ${connectionTest.error}`);
        return;
    }

    // TEST 2: Company Count
    console.log('\n┌─────────────────────────────────────────────────────────────────────┐');
    console.log('│ TEST 2: NUMBER OF COMPANIES                                         │');
    console.log('└─────────────────────────────────────────────────────────────────────┘');
    const companyCount = await getCompanyCount();
    results.companyCount = companyCount;
    console.log(`  Total companies in Bitrix: ${companyCount}`);

    // TEST 3: Available Fields
    console.log('\n┌─────────────────────────────────────────────────────────────────────┐');
    console.log('│ TEST 3: FIELDS AVAILABLE FOR MATCHING                                │');
    console.log('└─────────────────────────────────────────────────────────────────────┘');
    const fields = await getAvailableFields();
    results.fieldsAvailable = fields;

    const matchingFields = fields.filter(f =>
        f.includes('ADDRESS') ||
        f.includes('EMPLOYEES') ||
        f.includes('UF_CRM') ||
        f.includes('INDUSTRY') ||
        f.includes('REVENUE')
    );

    console.log(`  Total fields: ${fields.length}`);
    console.log(`  Key matching fields:`);
    matchingFields.forEach(f => console.log(`    - ${f}`));

    // TEST 4: Fetch Sample Companies
    console.log('\n┌─────────────────────────────────────────────────────────────────────┐');
    console.log('│ TEST 4: SAMPLE COMPANY DATA                                         │');
    console.log('└─────────────────────────────────────────────────────────────────────┘');

    const companies = await fetchCompanies(500);

    const companiesWithCAE = companies.filter(c => c[CAE_FIELD]);
    const companiesWithRegion = companies.filter(c => c.ADDRESS_REGION);

    results.companiesWithCAE = companiesWithCAE.length;
    results.companiesWithRegion = companiesWithRegion.length;

    console.log(`  Sample size: ${companies.length} companies`);
    console.log(`  Companies with CAE (${CAE_FIELD}): ${companiesWithCAE.length}`);
    console.log(`  Companies with Region: ${companiesWithRegion.length}`);

    // Show sample companies
    console.log('\n  Sample companies:');
    companies.slice(0, 5).forEach((c, i) => {
        console.log(`    ${i + 1}. ${c.TITLE}`);
        console.log(`       CAE: ${c[CAE_FIELD] || 'N/A'}`);
        console.log(`       Region: ${c.ADDRESS_REGION || 'N/A'}`);
        console.log(`       Employees: ${c.EMPLOYEES || 'N/A'}`);
    });

    // TEST 5: Matching Logic
    console.log('\n┌─────────────────────────────────────────────────────────────────────┐');
    console.log('│ TEST 5: MATCHING BITRIX COMPANIES TO AVISOS                          │');
    console.log('└─────────────────────────────────────────────────────────────────────┘');

    const matches = matchCompaniesToAvisos(companies, SAMPLE_AVISOS);
    results.matches = matches;

    console.log(`  Avisos tested: ${SAMPLE_AVISOS.length}`);
    console.log(`  Matches found (score >= 50): ${matches.length}`);

    if (matches.length > 0) {
        console.log('\n  Top 10 matches:');
        matches.slice(0, 10).forEach((m, i) => {
            console.log(`    ${i + 1}. ${m.companyName} (Score: ${m.score}/100)`);
            console.log(`       Aviso: ${m.avisoTitulo}`);
            console.log(`       Reasons: ${m.reasons.join(', ')}`);
        });
    }

    // FINAL REPORT
    console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
    console.log('║                          FINAL REPORT                              ║');
    console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

    console.log(`┌─ Bitrix Connection ─────────────────────────────────────────────┐`);
    console.log(`│ Status: ${connectionTest.success ? '✅ CONNECTED' : '❌ FAILED'}                                        │`);
    console.log(`│ Webhook: ${BITRIX_WEBHOOK.substring(0, 40)}...    │`);
    console.log(`└──────────────────────────────────────────────────────────────────┘`);

    console.log(`\n┌─ Companies in Bitrix ───────────────────────────────────────────┐`);
    console.log(`│ Total: ${companyCount} companies                                              │`);
    console.log(`│ Sample analyzed: ${companies.length}                                               │`);
    console.log(`│ With CAE field populated: ${companiesWithCAE.length} (${((companiesWithCAE.length/companies.length)*100).toFixed(1)}%)                    │`);
    console.log(`│ With Region populated: ${companiesWithRegion.length} (${((companiesWithRegion.length/companies.length)*100).toFixed(1)}%)                   │`);
    console.log(`└──────────────────────────────────────────────────────────────────┘`);

    console.log(`\n┌─ Matching Algorithm ─────────────────────────────────────────────┐`);
    console.log(`│ Avisos tested: ${SAMPLE_AVISOS.length}                                                      │`);
    console.log(`│ Matches found: ${matches.length}                                                      │`);
    console.log(`│ Matching fields: CAE, Region, Company Size                       │`);
    console.log(`│ Score threshold: 50/100                                         │`);
    console.log(`└──────────────────────────────────────────────────────────────────┘`);

    console.log(`\n┌─ Available Matching Fields ───────────────────────────────────────┐`);
    matchingFields.slice(0, 15).forEach(f => {
        console.log(`│ • ${f.padEnd(30)}                                          │`);
    });
    console.log(`└──────────────────────────────────────────────────────────────────┘`);

    // Issues and recommendations
    console.log(`\n┌─ ISSUES & RECOMMENDATIONS ──────────────────────────────────────────┐`);

    const issues: string[] = [];
    const recommendations: string[] = [];

    if (companiesWithCAE.length === 0) {
        issues.push('• No companies in sample have CAE field populated');
        recommendations.push('→ Need to populate UF_CRM_1738505715849 field in Bitrix');
    }

    if (companiesWithRegion.length < companies.length * 0.1) {
        issues.push(`• Only ${companiesWithRegion.length} companies have region data (${((companiesWithRegion.length/companies.length)*100).toFixed(1)}%)`);
        recommendations.push('→ Need to populate ADDRESS_REGION field in Bitrix');
    }

    if (matches.length === 0) {
        issues.push('• No matches found with current data quality');
        recommendations.push('→ Improve data quality in Bitrix (CAE, Region, Employees)');
    }

    if (issues.length === 0) {
        console.log(`│ ✅ No critical issues found                                         │`);
    } else {
        issues.forEach(i => console.log(`│ ❌ ${i}`));
    }

    if (recommendations.length > 0) {
        console.log(`│                                                                          │`);
        recommendations.forEach(r => console.log(`│ 💡 ${r}`));
    }

    console.log(`└──────────────────────────────────────────────────────────────────┘`);

    // Export results for further analysis
    console.log('\nFull results saved to test-results.json');
    await import('fs').then(fs => {
        fs.writeFileSync('./test-results.json', JSON.stringify(results, null, 2));
    });
}

main().catch(console.error);
