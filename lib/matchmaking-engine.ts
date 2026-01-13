/**
 * Matchmaking Engine v6
 *
 * NUT + TIP Priority Matching (95% dos avisos usam isto, não CAE)
 * O algoritmo prioriza NUTS III e Tipo de Intervenção Prioritária
 * CAE é mantido como fallback para os 5% de avisos que o mencionam
 *
 * Scoring (Total: 100 pontos):
 * - NUT Match: 30 pontos
 * - TIP Match: 20 pontos
 * - TIP Empresa Match: 20 pontos
 * - CAE Match: 15 pontos (fallback - só 5% dos avisos têm)
 * - Prazo adequado: 10 pontos
 * - Montante ok: 5 pontos
 * - Threshold mínimo: 50 pontos para considerar match
 */

import { PrismaClient, Aviso, Empresa, DimensaoEmpresa } from "@prisma/client";
import { db } from "./db";

export interface MatchResult {
    companyId: string;
    companyName: string;
    nif: string;
    score: number;
    reasons: string[];
    breakdown?: {
        nut: number;
        tip: number;
        tipEmpresa: number;
        cae: number;
        prazo: number;
        montante: number;
    };
}

export interface AvisoComNUT_TIP extends Aviso {
    // v6: Novos campos para matching
    nutsCompativeis?: string[];
    tipCompativeis?: string[];
    caeCompativeis?: string | null;
}

export interface EmpresaComNUT_TIP extends Empresa {
    // v6: Novos campos para matching
    nut?: string | null;
    tip?: string | null;
    tipEmpresa?: string | null;
}

const MATCH_THRESHOLD = 50; // Score mínimo para considerar match

export class MatchmakingEngine {
    /**
     * Finds eligible companies for a specific notice (v6: NUT+TIP priority)
     */
    static async findMatchesForAviso(avisoId: string): Promise<MatchResult[]> {
        const aviso = await db.aviso.findUnique({
            where: { id: avisoId }
        });

        if (!aviso) throw new Error("Aviso not found");

        // Get all active companies synced from Bitrix
        const companies = await db.empresa.findMany({
            where: { ativa: true }
        });

        const matches: MatchResult[] = [];

        for (const company of companies) {
            const score = this.calculateMatchScoreV6(
                aviso as AvisoComNUT_TIP,
                company as EmpresaComNUT_TIP
            );
            if (score.total >= MATCH_THRESHOLD) {
                matches.push({
                    companyId: company.id,
                    companyName: company.nome,
                    nif: company.nipc,
                    score: score.total,
                    reasons: score.reasons,
                    breakdown: score.breakdown
                });
            }
        }

        // Sort by score descending
        return matches.sort((a, b) => b.score - a.score);
    }

    /**
     * v6: Match scoring logic - NUT + TIP Priority
     * 95% dos avisos usam NUT+TIP, CAE é fallback (5%)
     */
    private static calculateMatchScoreV6(
        aviso: AvisoComNUT_TIP,
        company: EmpresaComNUT_TIP
    ) {
        let total = 0;
        const reasons: string[] = [];
        const breakdown = {
            nut: 0,
            tip: 0,
            tipEmpresa: 0,
            cae: 0,
            prazo: 0,
            montante: 0
        };

        // ============================================================
        // PRIORIDADE 1: NUT Match (30 pontos)
        // ============================================================
        if (aviso.nutsCompativeis && aviso.nutsCompativeis.length > 0 && company.nut) {
            const nutMatch = aviso.nutsCompativeis.some(nut => {
                // Match exato ou parcial (ex: "Norte" match "Norte", "Centro" match "Centro")
                return nut.toLowerCase() === company.nut?.toLowerCase() ||
                       nut.toLowerCase().includes(company.nut?.toLowerCase() || '');
            });

            if (nutMatch) {
                breakdown.nut = 30;
                total += 30;
                reasons.push(`NUT compatível: ${company.nut}`);
            }
        }

        // ============================================================
        // PRIORIDADE 2: TIP Match (20 pontos)
        // IPSS, Associação, Poder Central, Poder Local, Agricultura, etc.
        // ============================================================
        if (aviso.tipCompativeis && aviso.tipCompativeis.length > 0 && company.tip) {
            const tipMatch = aviso.tipCompativeis.some(tip => {
                return tip.toLowerCase() === company.tip?.toLowerCase();
            });

            if (tipMatch) {
                breakdown.tip = 20;
                total += 20;
                reasons.push(`TIP compatível: ${company.tip}`);
            }
        }

        // ============================================================
        // PRIORIDADE 3: TIP Empresa Match (20 pontos)
        // Politécnico, PME Inovadora, Startup, etc.
        // ============================================================
        if (aviso.tipCompativeis && aviso.tipCompativeis.length > 0 && company.tipEmpresa) {
            const tipEmpresaMatch = aviso.tipCompativeis.some(tip => {
                return tip.toLowerCase() === company.tipEmpresa?.toLowerCase();
            });

            if (tipEmpresaMatch) {
                breakdown.tipEmpresa = 20;
                total += 20;
                reasons.push(`TIP Empresa compatível: ${company.tipEmpresa}`);
            }
        }

        // ============================================================
        // PRIORIDADE 4: CAE Match (15 pontos) - FALLBACK
        // Só 5% dos avisos têm CAE explícito
        // ============================================================
        if (aviso.caeCompativeis && company.cae) {
            const caeMatch = aviso.caeCompativeis === company.cae ||
                            company.cae.startsWith(aviso.caeCompativeis.substring(0, 2));

            if (caeMatch) {
                breakdown.cae = 15;
                total += 15;
                reasons.push(`CAE compatível: ${company.cae}`);
            }
        }

        // ============================================================
        // PRIORIDADE 5: Prazo adequado (10 pontos)
        // Verifica se o prazo é razoável para preparação
        // ============================================================
        const diasRestantes = Math.ceil(
            (new Date(aviso.dataFimSubmissao).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );

        if (diasRestantes >= 30) {
            breakdown.prazo = 10;
            total += 10;
            // reasons.push('Prazo adequado (>30 dias)');
        } else if (diasRestantes >= 14) {
            breakdown.prazo = 5;
            total += 5;
            // reasons.push('Prazo apertado (>14 dias)');
        }

        // ============================================================
        // PRIORIDADE 6: Montante ok (5 pontos)
        // Verifica se a empresa se enquadra no montante
        // ============================================================
        if (aviso.montanteMinimo && aviso.montanteMaximo) {
            // Para empresas, assumimos que todas se podem candidatar
            // Num cenário real, verificaríamos a capacidade financeira
            breakdown.montante = 5;
            total += 5;
        }

        return { total, reasons, breakdown };
    }

    /**
     * Get top alerts for a specific company (v6)
     */
    static async findAvisosForCompany(companyId: string) {
        const company = await db.empresa.findUnique({ where: { id: companyId } });
        if (!company) return [];

        const activeAvisos = await db.aviso.findMany({ where: { ativo: true } });

        return activeAvisos
            .map(aviso => ({
                aviso,
                score: this.calculateMatchScoreV6(
                    aviso as AvisoComNUT_TIP,
                    company as EmpresaComNUT_TIP
                )
            }))
            .filter(m => m.score.total >= MATCH_THRESHOLD)
            .sort((a, b) => b.score.total - a.score.total);
    }

    /**
     * Get count of matched companies for an aviso
     */
    static async getMatchCountForAviso(avisoId: string): Promise<number> {
        const matches = await this.findMatchesForAviso(avisoId);
        return matches.length;
    }

    /**
     * Get top N matches for an aviso (with pagination support)
     */
    static async getTopMatchesForAviso(
        avisoId: string,
        limit: number = 50,
        offset: number = 0
    ): Promise<MatchResult[]> {
        const matches = await this.findMatchesForAviso(avisoId);
        return matches.slice(offset, offset + limit);
    }
}

/**
 * Standalone function wrapper for route compatibility (v6: NUT+TIP)
 * Routes can call this directly without instantiating the class
 */
export function findMatchesForAviso(
    aviso: AvisoComNUT_TIP,
    empresas: EmpresaComNUT_TIP[]
): {
    empresa: EmpresaComNUT_TIP;
    score: number;
    reasons: string[];
    breakdown?: {
        nut: number;
        tip: number;
        tipEmpresa: number;
        cae: number;
        prazo: number;
        montante: number;
    };
}[] {
    const matches: {
        empresa: EmpresaComNUT_TIP;
        score: number;
        reasons: string[];
        breakdown?: {
            nut: number;
            tip: number;
            tipEmpresa: number;
            cae: number;
            prazo: number;
            montante: number;
        };
    }[] = [];

    for (const empresa of empresas) {
        let total = 0;
        const reasons: string[] = [];
        const breakdown = {
            nut: 0,
            tip: 0,
            tipEmpresa: 0,
            cae: 0,
            prazo: 0,
            montante: 0
        };

        // NUT Match (30 pts)
        if (aviso.nutsCompativeis && aviso.nutsCompativeis.length > 0 && empresa.nut) {
            const nutMatch = aviso.nutsCompativeis.some(nut => {
                return nut.toLowerCase() === empresa.nut?.toLowerCase() ||
                       nut.toLowerCase().includes(empresa.nut?.toLowerCase() || '');
            });

            if (nutMatch) {
                breakdown.nut = 30;
                total += 30;
                reasons.push(`NUT compatível: ${empresa.nut}`);
            }
        }

        // TIP Match (20 pts)
        if (aviso.tipCompativeis && aviso.tipCompativeis.length > 0 && empresa.tip) {
            const tipMatch = aviso.tipCompativeis.some(tip => {
                return tip.toLowerCase() === empresa.tip?.toLowerCase();
            });

            if (tipMatch) {
                breakdown.tip = 20;
                total += 20;
                reasons.push(`TIP compatível: ${empresa.tip}`);
            }
        }

        // TIP Empresa Match (20 pts)
        if (aviso.tipCompativeis && aviso.tipCompativeis.length > 0 && empresa.tipEmpresa) {
            const tipEmpresaMatch = aviso.tipCompativeis.some(tip => {
                return tip.toLowerCase() === empresa.tipEmpresa?.toLowerCase();
            });

            if (tipEmpresaMatch) {
                breakdown.tipEmpresa = 20;
                total += 20;
                reasons.push(`TIP Empresa compatível: ${empresa.tipEmpresa}`);
            }
        }

        // CAE Match (15 pts) - FALLBACK
        if (aviso.caeCompativeis && empresa.cae) {
            const caeMatch = aviso.caeCompativeis === empresa.cae ||
                            empresa.cae.startsWith(aviso.caeCompativeis.substring(0, 2));

            if (caeMatch) {
                breakdown.cae = 15;
                total += 15;
                reasons.push(`CAE compatível: ${empresa.cae}`);
            }
        }

        // Prazo adequado (10 pts)
        const diasRestantes = Math.ceil(
            (new Date(aviso.dataFimSubmissao).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );

        if (diasRestantes >= 30) {
            breakdown.prazo = 10;
            total += 10;
        } else if (diasRestantes >= 14) {
            breakdown.prazo = 5;
            total += 5;
        }

        // Montante ok (5 pts)
        if (aviso.montanteMinimo && aviso.montanteMaximo) {
            breakdown.montante = 5;
            total += 5;
        }

        if (total >= MATCH_THRESHOLD) {
            matches.push({ empresa, score: total, reasons, breakdown });
        }
    }

    return matches.sort((a, b) => b.score - a.score);
}

/**
 * Legacy function for backwards compatibility
 * @deprecated Use findMatchesForAviso (v6) instead
 */
export function findMatchesForAvisoLegacy(aviso: any, empresas: any[]): {
    empresa: any;
    score: number;
    reasons: string[];
}[] {
    const matches: { empresa: any; score: number; reasons: string[] }[] = [];

    for (const empresa of empresas) {
        let score = 0;
        const reasons: string[] = [];

        // CAE Match (50 pts) - LEGACY
        if (aviso.setoresElegiveis?.length > 0 && empresa.cae) {
            const caeMatch = aviso.setoresElegiveis.some((s: string) =>
                s.includes(empresa.cae) || empresa.cae.startsWith(s.substring(0, 2))
            );
            if (caeMatch) {
                score += 50;
                reasons.push("CAE compatível com setores elegíveis");
            }
        }

        // Region Match (30 pts) - LEGACY
        if (aviso.regiao && empresa.regiao) {
            if (aviso.regiao.toLowerCase() === "nacional" ||
                aviso.regiao.toLowerCase().includes(empresa.regiao.toLowerCase())) {
                score += 30;
                reasons.push(`Elegível para a região: ${empresa.regiao}`);
            }
        }

        // Dimensao Match (20 pts) - LEGACY
        if (aviso.dimensaoEmpresa?.length > 0 && empresa.dimensao) {
            if (aviso.dimensaoEmpresa.includes(empresa.dimensao)) {
                score += 20;
                reasons.push(`Dimensão ${empresa.dimensao} permitida`);
            }
        }

        if (score > 0) {
            matches.push({ empresa, score, reasons });
        }
    }

    return matches.sort((a, b) => b.score - a.score);
}

/**
 * Helper: Calculate dias restantes until deadline
 */
export function calcularDiasRestantes(dataFim: string | Date): number {
    return Math.ceil(
        (new Date(dataFim).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
}

/**
 * Helper: Get urgency level based on dias restantes
 */
export function getUrgencyLevel(diasRestantes: number): 'alta' | 'media' | 'baixa' {
    if (diasRestantes <= 14) return 'alta';
    if (diasRestantes <= 30) return 'media';
    return 'baixa';
}

/**
 * Helper: Check if aviso is using NUT+TIP or CAE matching
 */
export function getMatchingType(aviso: Partial<AvisoComNUT_TIP>): 'NUT_TIP' | 'CAE' | 'MIXED' {
    const hasNutTip = (aviso.nutsCompativeis?.length ?? 0) > 0 ||
                      (aviso.tipCompativeis?.length ?? 0) > 0;
    const hasCae = !!aviso.caeCompativeis;
    const hasSetores = (aviso.setoresElegiveis?.length ?? 0) > 0;

    if (hasNutTip && !hasCae) return 'NUT_TIP';
    if (!hasNutTip && hasCae) return 'CAE';
    return 'MIXED';
}
