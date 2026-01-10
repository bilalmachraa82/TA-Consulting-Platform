
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface MatchResult {
    avisoId: string;
    avisoNome: string;
    avisoCodigo: string;
    score: number; // 0-100
    reasons: string[];
    matchDetails: {
        regionMatch: boolean;
        sectorMatch: boolean;
        baseScore: number;
    };
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const empresaId = searchParams.get('empresaId');

        if (!empresaId) {
            return NextResponse.json({ error: 'empresaId required' }, { status: 400 });
        }

        // 1. Fetch Empresa
        const empresa = await prisma.empresa.findUnique({
            where: { id: empresaId },
        });

        if (!empresa) {
            return NextResponse.json({ error: 'Empresa not found' }, { status: 404 });
        }

        // 2. Fetch Open Avisos
        const avisos = await prisma.aviso.findMany({
            where: {
                ativo: true,
                dataFimSubmissao: {
                    gte: new Date(),
                },
            },
        });

        const results: MatchResult[] = [];

        // 3. Matching Logic
        for (const aviso of avisos) {
            let score = 50; // Base score for being open
            const reasons: string[] = [];
            let regionMatch = false;
            let sectorMatch = false;

            // Region Match
            // If aviso is Nacional or matches empresa region
            if (!aviso.regiao || aviso.regiao === 'Nacional') {
                score += 20;
                regionMatch = true;
                reasons.push('Âmbito Nacional');
            } else if (empresa.regiao && aviso.regiao.toLowerCase().includes(empresa.regiao.toLowerCase())) {
                score += 25;
                regionMatch = true;
                reasons.push(`Região compatível: ${aviso.regiao}`);
            }

            // Sector Match (Heuristic)
            // Check if aviso sectors include empresa sector OR if generic terms match
            const empresaSectorLower = empresa.setor.toLowerCase();
            const avisoSectores = aviso.setoresElegiveis.map((s: string) => s.toLowerCase());

            const sectorDirectMatch = avisoSectores.some((s: string) => s.includes(empresaSectorLower) || empresaSectorLower.includes(s));

            if (sectorDirectMatch) {
                score += 25;
                sectorMatch = true;
                reasons.push(`Setor compatível: ${empresa.setor}`);
            }

            // Urgency Boost
            if (aviso.urgente) {
                reasons.push('Aviso Urgente');
            }

            // Cap at 100
            score = Math.min(100, score);

            // Filter out low scores (optional, e.g. < 50)
            if (score >= 60) {
                results.push({
                    avisoId: aviso.id,
                    avisoNome: aviso.nome,
                    avisoCodigo: aviso.codigo,
                    score,
                    reasons,
                    matchDetails: {
                        regionMatch,
                        sectorMatch,
                        baseScore: 50
                    }
                });
            }
        }

        // 4. Sort by Score
        results.sort((a, b) => b.score - a.score);

        return NextResponse.json({
            matches: results.slice(0, 50), // Top 50
            totalMatches: results.length,
            empresa: {
                id: empresa.id,
                nome: empresa.nome,
                setor: empresa.setor,
                regiao: empresa.regiao
            }
        });

    } catch (error) {
        console.error('Matching error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
