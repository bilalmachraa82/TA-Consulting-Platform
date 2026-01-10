import { PDFTemplateBase, PDFBrandingConfig } from './base';

export interface ResumoExecutivoData {
    empresa: {
        nome: string;
        setor: string;
    };
    candidatura: {
        avisoNome: string;
        programa: string;
        investimentoTotal: number;
        apoioSolicitado: number;
        duracaoMeses: number;
        fase: string;
        score: number;
    };
    kpis: { label: string; valor: string }[];
    conclusao: string;
}

export class ResumoExecutivoPDF extends PDFTemplateBase {
    private data: ResumoExecutivoData;

    constructor(data: ResumoExecutivoData, branding?: Partial<PDFBrandingConfig>) {
        super(
            {
                title: 'Resumo Executivo',
                subtitle: `${data.candidatura.avisoNome} - ${data.empresa.nome}`,
                date: new Date(),
                includeFooter: true,
                includePageNumbers: false,
                orientation: 'portrait',
            },
            branding
        );
        this.data = data;
        this.buildDocument();
    }

    private formatCurrency(value: number): string {
        return new Intl.NumberFormat('pt-PT', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
        }).format(value);
    }

    private buildDocument(): void {
        this.currentY = 55;

        // Executive Summary Box
        this.doc.setFillColor('#F0F9FF'); // Light blue background
        this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - (this.margin * 2), 45, 3, 3, 'F');

        this.currentY += 8;
        this.doc.setFont('helvetica', 'bold');
        this.doc.setFontSize(10);
        this.doc.setTextColor('#1E40AF');
        this.doc.text('VISÃO GERAL', this.margin + 5, this.currentY);

        this.currentY += 8;
        this.doc.setFont('helvetica', 'normal');
        this.doc.setFontSize(9);
        this.doc.setTextColor('#374151');

        const summaryText = `Candidatura ao aviso "${this.data.candidatura.avisoNome}" do programa ${this.data.candidatura.programa}. Investimento total de ${this.formatCurrency(this.data.candidatura.investimentoTotal)} com apoio solicitado de ${this.formatCurrency(this.data.candidatura.apoioSolicitado)}. Duração prevista: ${this.data.candidatura.duracaoMeses} meses.`;

        const lines = this.doc.splitTextToSize(summaryText, this.pageWidth - (this.margin * 2) - 10);
        this.doc.text(lines, this.margin + 5, this.currentY);

        this.currentY += 45;

        // KPIs Grid (2x2)
        this.addSection('Indicadores Chave');

        const kpiWidth = (this.pageWidth - (this.margin * 2) - 10) / 2;
        const kpiHeight = 25;

        this.data.kpis.forEach((kpi, index) => {
            const col = index % 2;
            const row = Math.floor(index / 2);
            const x = this.margin + (col * (kpiWidth + 10));
            const y = this.currentY + (row * (kpiHeight + 5));

            // KPI Box
            this.doc.setFillColor('#FAFAFA');
            this.doc.roundedRect(x, y, kpiWidth, kpiHeight, 2, 2, 'F');

            // KPI Label
            this.doc.setFont('helvetica', 'normal');
            this.doc.setFontSize(8);
            this.doc.setTextColor('#6B7280');
            this.doc.text(kpi.label.toUpperCase(), x + 5, y + 8);

            // KPI Value
            this.doc.setFont('helvetica', 'bold');
            this.doc.setFontSize(14);
            this.doc.setTextColor('#1E40AF');
            this.doc.text(kpi.valor, x + 5, y + 18);
        });

        const rows = Math.ceil(this.data.kpis.length / 2);
        this.currentY += (rows * (kpiHeight + 5)) + 15;

        // Status & Score
        this.addSection('Estado da Candidatura');

        // Score Circle (simplified)
        const scoreX = this.margin + 20;
        const scoreY = this.currentY + 15;

        this.doc.setFillColor(this.data.candidatura.score >= 70 ? '#10B981' : this.data.candidatura.score >= 50 ? '#F59E0B' : '#EF4444');
        this.doc.circle(scoreX, scoreY, 12, 'F');

        this.doc.setFont('helvetica', 'bold');
        this.doc.setFontSize(12);
        this.doc.setTextColor('#FFFFFF');
        this.doc.text(`${this.data.candidatura.score}%`, scoreX, scoreY + 4, { align: 'center' });

        // Score Label
        this.doc.setFont('helvetica', 'normal');
        this.doc.setFontSize(9);
        this.doc.setTextColor('#374151');
        this.doc.text(`Score de Qualidade`, scoreX + 25, scoreY - 2);
        this.doc.text(`Fase atual: ${this.data.candidatura.fase}`, scoreX + 25, scoreY + 6);

        this.currentY += 40;

        // Conclusão
        this.addSection('Conclusão');
        this.addParagraph(this.data.conclusao);
    }
}
