/**
 * Quick Match API - Public Endpoint (No Auth Required)
 * 
 * POST /api/quick-match
 * Body: { setor, regiao, dimensao, objetivo, email?, nomeEmpresa? }
 * 
 * Returns top 5 matching avisos with Readiness Score
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { runEligibilityCheck, type LeadInput, type AvisoCriteria } from '@/lib/eligibility-engine';
import { enrichCompanyData } from '@/lib/agents/company-intel';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Validation schema
const QuickMatchSchema = z.object({
    setor: z.string().min(1, 'Setor é obrigatório'),
    regiao: z.string().min(1, 'Região é obrigatória'),
    dimensao: z.enum(['MICRO', 'PEQUENA', 'MEDIA', 'GRANDE']),
    objetivo: z.string().min(1, 'Objetivo é obrigatório'),
    email: z.string().email().optional().or(z.literal('')),
    nomeEmpresa: z.string().optional(),
    nif: z.string().length(9).optional().or(z.literal('')),
    cae: z.string().optional(),
});

// CAE prefix mapping for common sectors
const SETOR_TO_CAE: Record<string, string[]> = {
    'tecnologia': ['62', '63'],
    'industria': ['10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33'],
    'turismo': ['55', '56', '79'],
    'agricultura': ['01', '02', '03'],
    'comercio': ['45', '46', '47'],
    'servicos': ['69', '70', '71', '72', '73', '74'],
    'construcao': ['41', '42', '43'],
    'saude': ['86', '87', '88'],
    'educacao': ['85'],
    'energia': ['35'],
    'transportes': ['49', '50', '51', '52'],
    'outro': [],
};

// Region mapping
const REGIAO_TO_DISTRITOS: Record<string, string> = {
    'norte': 'Porto',
    'centro': 'Coimbra',
    'lisboa': 'Lisboa',
    'alentejo': 'Évora',
    'algarve': 'Faro',
    'acores': 'Açores',
    'madeira': 'Madeira',
};

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const parseResult = QuickMatchSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(
                { error: 'Dados inválidos', details: parseResult.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const { setor, regiao, dimensao, objetivo, email, nomeEmpresa, nif, cae } = parseResult.data;

        // Variables that may be enriched
        let enrichedCAE: string | undefined = cae;
        let enrichedDistrito: string | undefined;
        let enrichedDimensao: typeof dimensao = dimensao;
        let enrichedNomeEmpresa = nomeEmpresa || 'Empresa Anónima';
        let enrichmentSource: string | undefined;

        // If NIF provided, try to enrich data
        if (nif && nif.length === 9) {
            console.log(`[Quick Match] Enriching data for NIF ${nif}...`);
            try {
                const enriched = await enrichCompanyData(nif);

                if (enriched.nome && enriched.nome !== 'NIF Inválido') {
                    enrichedNomeEmpresa = enriched.nome;
                    enrichmentSource = enriched.fontes.join(', ');
                }

                if (enriched.caePrincipal?.codigo) {
                    enrichedCAE = enriched.caePrincipal.codigo;
                    console.log(`[Quick Match] Using real CAE: ${enrichedCAE}`);
                }

                if (enriched.distrito) {
                    enrichedDistrito = enriched.distrito;
                }

                if (enriched.dimensao) {
                    // Map enriched dimensao to our format
                    const dimensaoMap: Record<string, typeof dimensao> = {
                        'Micro': 'MICRO',
                        'Pequena': 'PEQUENA',
                        'Média': 'MEDIA',
                        'Grande': 'GRANDE',
                    };
                    enrichedDimensao = dimensaoMap[enriched.dimensao] || dimensao;
                }
            } catch (error) {
                console.error('[Quick Match] Enrichment failed:', error);
            }
        }

        // Map setor to CAE prefix (fallback if no enriched CAE)
        const caePrefixes = SETOR_TO_CAE[setor.toLowerCase()] || [];
        const leadCAE = enrichedCAE || (caePrefixes.length > 0 ? caePrefixes[0] + '010' : undefined);

        // Map region to distrito (use enriched if available)
        const distrito = enrichedDistrito || REGIAO_TO_DISTRITOS[regiao.toLowerCase()] || 'Lisboa';

        // Build LeadInput with enriched data
        const leadInput: LeadInput = {
            nomeEmpresa: enrichedNomeEmpresa,
            email: email || 'quick-match@ta-consulting.pt',
            distrito,
            tipoProjetoDesejado: objetivo,
            cae: leadCAE,
            dimensao: enrichedDimensao as 'MICRO' | 'PEQUENA' | 'MEDIA' | 'GRANDE',
        };

        // Fetch open avisos from database
        const avisosDB = await prisma.aviso.findMany({
            where: {
                ativo: true,
                dataFimSubmissao: { gte: new Date() },
            },
            select: {
                id: true,
                nome: true,
                portal: true,
                programa: true,
                dataFimSubmissao: true,
                link: true,
                taxa: true,
                dimensaoEmpresa: true,
            },
            orderBy: { dataFimSubmissao: 'asc' },
            take: 50,
        });

        // Transform DB avisos to AvisoCriteria format
        // Use enriched CAE for more precise matching
        const matchingCaePrefixes = enrichedCAE ? [enrichedCAE.substring(0, 2)] : caePrefixes;

        const avisosWithCriteria: AvisoCriteria[] = avisosDB.map(aviso => ({
            id: aviso.id,
            nome: aviso.nome,
            portal: aviso.portal,
            programa: aviso.programa || '',
            dataFimSubmissao: aviso.dataFimSubmissao,
            link: aviso.link || undefined,
            taxa: aviso.taxa || undefined,
            criterios: {
                dimensao: aviso.dimensaoEmpresa ? aviso.dimensaoEmpresa : undefined,
                caePrefixos: matchingCaePrefixes.length > 0 ? matchingCaePrefixes : undefined,
                tiposProjeto: [objetivo],
            },
        }));

        // Fallback to sample avisos if DB is empty
        if (avisosWithCriteria.length === 0) {
            const sampleAvisos = await import('@/lib/aviso-schemas/sample-avisos.json');
            avisosWithCriteria.push(...sampleAvisos.default.map((aviso: Record<string, unknown>) => ({
                ...aviso,
                dataFimSubmissao: new Date(aviso.dataFimSubmissao as string),
            }) as AvisoCriteria));
        }

        // Run eligibility check
        const matches = await runEligibilityCheck(leadInput, avisosWithCriteria);

        // Save lead if email provided
        if (email && email.length > 0) {
            try {
                // Try to find existing lead by NIF
                const existingLead = nif ? await prisma.lead.findUnique({ where: { nif } }) : null;

                if (existingLead) {
                    // Update existing lead
                    await prisma.lead.update({
                        where: { nif },
                        data: {
                            nomeEmpresa: enrichedNomeEmpresa,
                            email,
                            distrito,
                            tipoProjeto: objetivo,
                            cae: leadCAE,
                            dimensaoDeclarada: enrichedDimensao,
                        },
                    });
                    console.log(`[Quick Match] Lead updated for NIF ${nif}`);
                } else {
                    // Create new lead
                    await prisma.lead.create({
                        data: {
                            nif: nif || `temp-${Date.now()}`,
                            nome: enrichedNomeEmpresa,
                            nomeEmpresa: enrichedNomeEmpresa,
                            email,
                            distrito,
                            tipoProjeto: objetivo,
                            cae: leadCAE,
                            dimensaoDeclarada: enrichedDimensao,
                            alertasAtivos: true,
                            consentMarketing: true,
                        },
                    });
                    console.log(`[Quick Match] Lead created for ${email}`);
                }
            } catch (e) {
                console.log('[Quick Match] Lead save skipped:', e);
            }
        }

        // Return top 5 matches with enrichment metadata
        return NextResponse.json({
            success: true,
            matches: matches.slice(0, 5).map(m => ({
                id: m.avisoId,
                nome: m.avisoNome,
                portal: m.portal,
                link: m.link,
                taxa: m.taxa,
                diasRestantes: m.diasRestantes,
                readinessScore: m.score,
                confidence: m.confidence,
                reasons: m.reasons,
                missing: m.missing,
            })),
            totalAnalisados: avisosWithCriteria.length,
            inputSummary: {
                setor,
                regiao,
                dimensao: enrichedDimensao,
                objetivo,
                caeUsado: leadCAE,
                enrichmentSource,
            },
        });

    } catch (error: any) {
        console.error('[Quick Match Error]:', error);
        return NextResponse.json(
            { error: 'Erro ao processar Quick Match' },
            { status: 500 }
        );
    }
}
