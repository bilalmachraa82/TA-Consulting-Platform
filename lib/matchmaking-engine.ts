/**
 * Matchmaking Engine
 * 
 * Logic to cross-reference new Notices (Avisos) with the company database (Empresas).
 * Filters by CAE, Region, and Company Size (Dimensao).
 */

import { PrismaClient, Aviso, Empresa, DimensaoEmpresa } from "@prisma/client";
import { db } from "./db";

export interface MatchResult {
    companyId: string;
    companyName: string;
    nif: string;
    score: number;
    reasons: string[];
}

export class MatchmakingEngine {
    /**
     * Finds eligible companies for a specific notice
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
            const score = this.calculateMatchScore(aviso, company);
            if (score.total > 0) {
                matches.push({
                    companyId: company.id,
                    companyName: company.nome,
                    nif: company.nipc,
                    score: score.total,
                    reasons: score.reasons
                });
            }
        }

        // Sort by score descending
        return matches.sort((a, b) => b.score - a.score);
    }

    /**
     * Match scoring logic
     */
    private static calculateMatchScore(aviso: Aviso, company: Empresa) {
        let total = 0;
        const reasons: string[] = [];

        // 1. CAE Match (High Priority)
        if (aviso.setoresElegiveis.length > 0) {
            const caeMatch = aviso.setoresElegiveis.some(s =>
                s.includes(company.cae) || company.cae.startsWith(s.substring(0, 2))
            );
            if (caeMatch) {
                total += 50;
                reasons.push("CAE compatível com setores elegíveis");
            }
        }

        // 2. Region Match
        if (aviso.regiao && company.regiao) {
            if (aviso.regiao.toLowerCase() === "nacional" ||
                aviso.regiao.toLowerCase().includes(company.regiao.toLowerCase())) {
                total += 30;
                reasons.push(`Elegível para a região: ${company.regiao}`);
            }
        }

        // 3. Company Size (Dimensao)
        if (aviso.dimensaoEmpresa.length > 0) {
            const dimMatch = aviso.dimensaoEmpresa.includes(company.dimensao as string);
            if (dimMatch) {
                total += 20;
                reasons.push(`Dimensão ${company.dimensao} permitida`);
            }
        }

        return { total, reasons };
    }

    /**
     * Get top alerts for a specific company
     */
    static async findAvisosForCompany(companyId: string) {
        const company = await db.empresa.findUnique({ where: { id: companyId } });
        if (!company) return [];

        const activeAvisos = await db.aviso.findMany({ where: { ativo: true } });

        return activeAvisos
            .map(aviso => ({
                aviso,
                score: this.calculateMatchScore(aviso, company)
            }))
            .filter(m => m.score.total > 0)
            .sort((a, b) => b.score.total - a.score.total);
    }
}

/**
 * Standalone function wrapper for route compatibility
 * Routes can call this directly without instantiating the class
 */
export async function findMatchesForAviso(aviso: any, empresas: any[]): Promise<{
    empresa: any;
    score: number;
    reasons: string[];
}[]> {
    const matches: { empresa: any; score: number; reasons: string[] }[] = [];

    for (const empresa of empresas) {
        let score = 0;
        const reasons: string[] = [];

        // CAE Match (50 pts)
        if (aviso.setoresElegiveis?.length > 0 && empresa.cae) {
            const caeMatch = aviso.setoresElegiveis.some((s: string) =>
                s.includes(empresa.cae) || empresa.cae.startsWith(s.substring(0, 2))
            );
            if (caeMatch) {
                score += 50;
                reasons.push("CAE compatível com setores elegíveis");
            }
        }

        // Region Match (30 pts)
        if (aviso.regiao && empresa.regiao) {
            if (aviso.regiao.toLowerCase() === "nacional" ||
                aviso.regiao.toLowerCase().includes(empresa.regiao.toLowerCase())) {
                score += 30;
                reasons.push(`Elegível para a região: ${empresa.regiao}`);
            }
        }

        // Dimensao Match (20 pts)
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

