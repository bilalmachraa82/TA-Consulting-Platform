/**
 * Aviso Schema Validation for Scrapers
 * 
 * Validates scraped data before saving to database.
 * Ensures data quality and catches missing required fields early.
 */

import { z } from 'zod';

// =============================================================================
// SCHEMA: Scraped Aviso (from any portal)
// =============================================================================

export const ScrapedAvisoSchema = z.object({
    // Required fields (must be present)
    codigo: z.string()
        .min(1, 'Código é obrigatório')
        .describe('Código único do aviso (ex: FA0114/2025)'),

    nome: z.string()
        .min(5, 'Nome deve ter pelo menos 5 caracteres')
        .max(500, 'Nome demasiado longo')
        .describe('Título/nome do aviso'),

    dataFimSubmissao: z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
        .describe('Data limite de submissão'),

    portal: z.enum(['PORTUGAL2030', 'PRR', 'PEPAC', 'IPDJ', 'HORIZON_EUROPE', 'BASE_GOV', 'EUROPA_CRIATIVA'])
        .describe('Portal de origem'),

    // Semi-required (should have, warn if missing)
    dataInicioSubmissao: z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
        .optional()
        .describe('Data de abertura'),

    link: z.string()
        .url('Link deve ser uma URL válida')
        .optional()
        .describe('URL da página do aviso'),

    // Optional fields
    programa: z.string().optional(),
    linha: z.string().optional(),
    descricao: z.string().optional(),
    montanteMinimo: z.number().nonnegative().optional(),
    montanteMaximo: z.number().nonnegative().optional(),
    taxa: z.string().optional(),
    regiao: z.string().optional(),
    setoresElegiveis: z.array(z.string()).optional(),
    dimensaoEmpresa: z.array(z.string()).optional(),
    canalSubmissao: z.string().optional(),
    contacto: z.string().optional(),
    linksLegislacao: z.array(z.string()).optional(),
    notasAdicionais: z.string().optional(),
    preRequisitos: z.array(z.string()).optional(),
    anexos: z.any().optional(),
});

export type ScrapedAviso = z.infer<typeof ScrapedAvisoSchema>;

// =============================================================================
// VALIDATION RESULT
// =============================================================================

export interface ValidationResult {
    valid: boolean;
    aviso?: ScrapedAviso;
    errors: string[];
    warnings: string[];
}

// =============================================================================
// VALIDATE FUNCTION
// =============================================================================

/**
 * Validate a scraped aviso against the schema.
 * Returns parsed data if valid, or errors/warnings if not.
 */
export function validateScrapedAviso(data: unknown): ValidationResult {
    const result: ValidationResult = {
        valid: false,
        errors: [],
        warnings: [],
    };

    // 1. Parse with Zod
    const parseResult = ScrapedAvisoSchema.safeParse(data);

    if (!parseResult.success) {
        // Extract error messages
        const issues = parseResult.error.flatten();

        // Field errors
        Object.entries(issues.fieldErrors).forEach(([field, msgs]) => {
            if (msgs) {
                result.errors.push(`${field}: ${msgs.join(', ')}`);
            }
        });

        // Form errors
        if (issues.formErrors.length > 0) {
            result.errors.push(...issues.formErrors);
        }

        return result;
    }

    // 2. Additional warnings for missing optional but important fields
    const aviso = parseResult.data;

    if (!aviso.dataInicioSubmissao) {
        result.warnings.push('dataInicioSubmissao em falta - usando data actual');
    }

    if (!aviso.link) {
        result.warnings.push('link em falta - aviso sem URL de origem');
    }

    if (!aviso.programa) {
        result.warnings.push('programa em falta');
    }

    if (!aviso.descricao || aviso.descricao.length < 20) {
        result.warnings.push('descricao em falta ou muito curta');
    }

    // 3. Date sanity check
    const endDate = new Date(aviso.dataFimSubmissao);
    const now = new Date();
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 2);

    if (endDate < now) {
        result.warnings.push('dataFimSubmissao já passou (aviso expirado)');
    }

    if (endDate > oneYearFromNow) {
        result.warnings.push('dataFimSubmissao está mais de 2 anos no futuro (verificar)');
    }

    // 4. Success
    result.valid = true;
    result.aviso = aviso;

    return result;
}

// =============================================================================
// BATCH VALIDATION
// =============================================================================

export interface BatchValidationResult {
    total: number;
    valid: number;
    invalid: number;
    withWarnings: number;
    validAvisos: ScrapedAviso[];
    invalidItems: Array<{ index: number; errors: string[] }>;
    allWarnings: Array<{ index: number; codigo: string; warnings: string[] }>;
}

/**
 * Validate a batch of scraped avisos.
 * Returns statistics and separated valid/invalid items.
 */
export function validateBatch(items: unknown[]): BatchValidationResult {
    const result: BatchValidationResult = {
        total: items.length,
        valid: 0,
        invalid: 0,
        withWarnings: 0,
        validAvisos: [],
        invalidItems: [],
        allWarnings: [],
    };

    items.forEach((item, index) => {
        const validation = validateScrapedAviso(item);

        if (validation.valid && validation.aviso) {
            result.valid++;
            result.validAvisos.push(validation.aviso);

            if (validation.warnings.length > 0) {
                result.withWarnings++;
                result.allWarnings.push({
                    index,
                    codigo: validation.aviso.codigo,
                    warnings: validation.warnings,
                });
            }
        } else {
            result.invalid++;
            result.invalidItems.push({
                index,
                errors: validation.errors,
            });
        }
    });

    return result;
}

/**
 * Console report for validation results
 */
export function printValidationReport(result: BatchValidationResult): void {
    console.log('\n📊 === RELATÓRIO DE VALIDAÇÃO DE DADOS ===\n');
    console.log(`Total: ${result.total}`);
    console.log(`✅ Válidos: ${result.valid}`);
    console.log(`❌ Inválidos: ${result.invalid}`);
    console.log(`⚠️  Com avisos: ${result.withWarnings}`);

    if (result.invalidItems.length > 0) {
        console.log('\n❌ Itens inválidos:');
        result.invalidItems.slice(0, 5).forEach(item => {
            console.log(`  [${item.index}] ${item.errors.join('; ')}`);
        });
        if (result.invalidItems.length > 5) {
            console.log(`  ... e mais ${result.invalidItems.length - 5} itens`);
        }
    }

    if (result.allWarnings.length > 0 && result.allWarnings.length <= 10) {
        console.log('\n⚠️ Avisos:');
        result.allWarnings.forEach(w => {
            console.log(`  [${w.codigo}] ${w.warnings.join('; ')}`);
        });
    }

    console.log('\n==========================================\n');
}
