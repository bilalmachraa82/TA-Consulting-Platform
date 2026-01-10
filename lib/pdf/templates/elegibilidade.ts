import { PDFTemplateBase, PDFGenerationOptions, PDFBrandingConfig } from './base';

export interface ElegibilidadeData {
    empresa: {
        nome: string;
        nif: string;
        setor: string;
        localizacao: string;
        dimensao: string;
        volumeNegocios: string;
    };
    avisos: {
        nome: string;
        programa: string;
        taxa: number;
        montanteMaximo: string;
        prazoFim: string;
        elegivel: boolean;
        score: number;
        motivos: string[];
    }[];
    analisadoPor?: string;
    dataAnalise?: Date;
}

export class ElegibilidadePDF extends PDFTemplateBase {
    private data: ElegibilidadeData;

    constructor(data: ElegibilidadeData, branding?: Partial<PDFBrandingConfig>) {
        super(
            {
                title: 'Relatório de Elegibilidade',
                subtitle: `Análise para ${data.empresa.nome}`,
                date: data.dataAnalise || new Date(),
                includeFooter: true,
                includePageNumbers: true,
            },
            branding
        );
        this.data = data;
        this.buildDocument();
    }

    private buildDocument(): void {
        this.currentY = 55;

        // Empresa Section
        this.addSection('Dados da Empresa');
        this.addKeyValuePairs([
            { key: 'Nome', value: this.data.empresa.nome },
            { key: 'NIF', value: this.data.empresa.nif },
            { key: 'Setor', value: this.data.empresa.setor },
            { key: 'Localização', value: this.data.empresa.localizacao },
            { key: 'Dimensão', value: this.data.empresa.dimensao },
            { key: 'Vol. Negócios', value: this.data.empresa.volumeNegocios },
        ]);

        // Resumo
        this.addSection('Resumo de Elegibilidade');
        const elegiveisCount = this.data.avisos.filter(a => a.elegivel).length;
        this.addParagraph(
            `Foram analisados ${this.data.avisos.length} avisos. A empresa qualifica-se para ${elegiveisCount} oportunidades de financiamento.`
        );

        // Tabela de Avisos
        this.addSection('Oportunidades Identificadas');

        const tableHeaders = ['Aviso', 'Programa', 'Taxa', 'Score', 'Elegível'];
        const tableData = this.data.avisos.map(aviso => [
            aviso.nome,
            aviso.programa,
            `${aviso.taxa}%`,
            `${aviso.score}%`,
            aviso.elegivel ? '✅ Sim' : '❌ Não',
        ]);

        this.addTable(tableHeaders, tableData);

        // Detalhes por Aviso
        this.addSection('Análise Detalhada');

        this.data.avisos.forEach(aviso => {
            this.checkPageBreak(40);

            this.doc.setFont('helvetica', 'bold');
            this.doc.setFontSize(11);
            this.doc.setTextColor('#1E40AF');
            this.doc.text(`• ${aviso.nome}`, this.margin, this.currentY);
            this.currentY += 6;

            this.addKeyValuePairs([
                { key: 'Programa', value: aviso.programa },
                { key: 'Prazo Final', value: aviso.prazoFim },
                { key: 'Montante Máximo', value: aviso.montanteMaximo },
            ]);

            if (aviso.motivos.length > 0) {
                this.doc.setFont('helvetica', 'italic');
                this.doc.setFontSize(9);
                this.doc.setTextColor('#6B7280');
                aviso.motivos.forEach(motivo => {
                    this.checkPageBreak(6);
                    this.doc.text(`  » ${motivo}`, this.margin + 5, this.currentY);
                    this.currentY += 5;
                });
            }
            this.currentY += 5;
        });

        // Próximos Passos
        this.addSection('Próximos Passos Recomendados');
        const passos = [
            'Agendar reunião com consultor TA para detalhar estratégia de candidatura.',
            'Preparar memória descritiva do projeto de investimento.',
            'Recolher documentação comprovativa (certidões, balanços, declaração de não dívida).',
            'Utilizar a ferramenta AI Writer para gerar rascunho de candidatura.',
        ];
        passos.forEach((passo, i) => {
            this.checkPageBreak(6);
            this.doc.setFont('helvetica', 'normal');
            this.doc.setFontSize(9);
            this.doc.setTextColor('#374151');
            this.doc.text(`${i + 1}. ${passo}`, this.margin + 5, this.currentY);
            this.currentY += 6;
        });
    }
}
