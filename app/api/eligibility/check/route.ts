import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { runEligibilityCheck, type AvisoCriteria, type LeadInput } from '@/lib/eligibility-engine';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const { empresaId } = await request.json();

        if (!empresaId) {
            return NextResponse.json({ error: 'empresaId é obrigatório' }, { status: 400 });
        }

        // Fetch empresa data
        const empresa = await prisma.empresa.findUnique({
            where: { id: empresaId },
            select: {
                id: true,
                nome: true,
                nipc: true,
                cae: true,
                dimensao: true,
                distrito: true,
            }
        });

        if (!empresa) {
            return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });
        }

        // Convert empresa to LeadInput format
        const leadInput: LeadInput = {
            nomeEmpresa: empresa.nome,
            email: session.user.email || '',
            distrito: empresa.distrito || 'Lisboa',
            tipoProjetoDesejado: 'inovacao', // Default
            cae: empresa.cae,
            dimensao: empresa.dimensao as 'MICRO' | 'PEQUENA' | 'MEDIA' | 'GRANDE',
        };

        // Fetch open avisos directly from DB
        // [REAL DEMO MODE RE-ENABLED]
        const avisosFromDb = await prisma.aviso.findMany({
            where: {
                ativo: true,
                dataFimSubmissao: {
                    gte: new Date(), // Apenas avisos que ainda não fecharam
                }
            },
            select: {
                id: true,
                nome: true,
                codigo: true,
                portal: true,
                programa: true, // Added
                montanteMaximo: true,
                montanteMinimo: true,
                taxa: true,
                setoresElegiveis: true,
                dimensaoEmpresa: true,
                dataFimSubmissao: true,
                link: true,
                anexos: true,
            }
        });

        // Map to Engine Criteria format
        const avisosWithCriteria: AvisoCriteria[] = avisosFromDb.map(aviso => ({
            id: aviso.id,
            nome: aviso.nome,
            portal: aviso.portal,
            programa: aviso.programa,
            dataFimSubmissao: aviso.dataFimSubmissao,
            link: aviso.link || undefined,
            taxa: aviso.taxa || undefined,
            criterios: {
                dimensao: aviso.dimensaoEmpresa,
                investimentoMax: aviso.montanteMaximo || undefined,
                investimentoMin: aviso.montanteMinimo || undefined,
                // Map DB 'setores' loosely to tipologia or just generic
                tiposProjeto: aviso.setoresElegiveis,
                regioes: [], // Default empty (national implied if empty in engine)
            }
        }));

        // Run eligibility check
        const matches = await runEligibilityCheck(leadInput, avisosWithCriteria);

        return NextResponse.json({
            empresa: {
                id: empresa.id,
                nome: empresa.nome,
                nipc: empresa.nipc,
                cae: empresa.cae,
                dimensao: empresa.dimensao,
                distrito: empresa.distrito,
            },
            matches,
            totalAnalisados: avisosWithCriteria.length,
            processedAt: new Date().toISOString(),
        });

    } catch (error) {
        console.error('[Eligibility API Error]:', error);
        return NextResponse.json(
            { error: 'Erro ao processar elegibilidade' },
            { status: 500 }
        );
    }
}
