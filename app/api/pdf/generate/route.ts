import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ElegibilidadePDF, type ElegibilidadeData } from '@/lib/pdf/templates/elegibilidade';
import { ResumoExecutivoPDF, type ResumoExecutivoData } from '@/lib/pdf/templates/resumo-executivo';

export type PDFTemplateType = 'elegibilidade' | 'resumo-executivo' | 'candidatura';

interface GeneratePDFRequest {
    templateType: PDFTemplateType;
    entityId: string; // empresaId or candidaturaId
    options?: {
        includeFooter?: boolean;
        includePageNumbers?: boolean;
    };
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body: GeneratePDFRequest = await req.json();
        const { templateType, entityId, options } = body;

        if (!templateType || !entityId) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        let pdfBlob: Blob;

        switch (templateType) {
            case 'elegibilidade': {
                const empresa = await prisma.empresa.findUnique({
                    where: { id: entityId },
                    include: {
                        avisoAnalisados: {
                            include: { aviso: true },
                            take: 10,
                        },
                    },
                });

                if (!empresa) {
                    return new NextResponse('Empresa not found', { status: 404 });
                }

                const elegibilidadeData: ElegibilidadeData = {
                    empresa: {
                        nome: empresa.nome,
                        nif: empresa.nif || 'N/A',
                        setor: empresa.setor || 'Geral',
                        localizacao: empresa.regiao || 'Portugal',
                        dimensao: empresa.dimensao || 'PME',
                        volumeNegocios: empresa.volumeNegocios
                            ? `€${empresa.volumeNegocios.toLocaleString('pt-PT')}`
                            : 'N/D',
                    },
                    avisos: empresa.avisoAnalisados.map((aa: any) => ({
                        nome: aa.aviso.nome,
                        programa: aa.aviso.programa || 'PT2030',
                        taxa: aa.aviso.taxaFinanciamento || 50,
                        montanteMaximo: aa.aviso.montanteMaximo
                            ? `€${aa.aviso.montanteMaximo.toLocaleString('pt-PT')}`
                            : 'Variável',
                        prazoFim: aa.aviso.dataEncerramento
                            ? new Date(aa.aviso.dataEncerramento).toLocaleDateString('pt-PT')
                            : 'Em aberto',
                        elegivel: aa.isElegivel || false,
                        score: aa.score || 0,
                        motivos: aa.motivosElegibilidade || [],
                    })),
                    dataAnalise: new Date(),
                };

                const pdf = new ElegibilidadePDF(elegibilidadeData);
                pdfBlob = pdf.generate();
                break;
            }

            case 'resumo-executivo': {
                const candidatura = await prisma.candidatura.findUnique({
                    where: { id: entityId },
                    include: {
                        empresa: true,
                        aviso: true,
                    },
                });

                if (!candidatura) {
                    return new NextResponse('Candidatura not found', { status: 404 });
                }

                const resumoData: ResumoExecutivoData = {
                    empresa: {
                        nome: candidatura.empresa.nome,
                        setor: candidatura.empresa.setor || 'Geral',
                    },
                    candidatura: {
                        avisoNome: candidatura.aviso.nome,
                        programa: candidatura.aviso.programa || 'PT2030',
                        investimentoTotal: Number(candidatura.investimentoTotal) || 100000,
                        apoioSolicitado: Number(candidatura.apoioSolicitado) || 50000,
                        duracaoMeses: candidatura.duracaoMeses || 18,
                        fase: candidatura.status || 'Em preparação',
                        score: candidatura.scoreQualidade || 75,
                    },
                    kpis: [
                        { label: 'Investimento', valor: `€${(Number(candidatura.investimentoTotal) || 100000).toLocaleString('pt-PT')}` },
                        { label: 'Taxa Apoio', valor: `${candidatura.aviso.taxaFinanciamento || 50}%` },
                        { label: 'Duração', valor: `${candidatura.duracaoMeses || 18} meses` },
                        { label: 'Postos Criados', valor: `${candidatura.postosTrabalho || 3}` },
                    ],
                    conclusao: `A candidatura ao ${candidatura.aviso.nome} apresenta um score de qualidade de ${candidatura.scoreQualidade || 75}%. Recomenda-se a revisão final antes da submissão.`,
                };

                const pdf = new ResumoExecutivoPDF(resumoData);
                pdfBlob = pdf.generate();
                break;
            }

            default:
                return new NextResponse('Unknown template type', { status: 400 });
        }

        // Return PDF as downloadable file
        const arrayBuffer = await pdfBlob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return new Response(buffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${templateType}-${entityId}.pdf"`,
                'Content-Length': buffer.length.toString(),
            },
        });

    } catch (error) {
        console.error('PDF Generation Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
