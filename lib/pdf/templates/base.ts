import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface PDFBrandingConfig {
    logoBase64?: string;
    primaryColor: string;
    secondaryColor: string;
    companyName: string;
    footerText: string;
}

export interface PDFGenerationOptions {
    title: string;
    subtitle?: string;
    date?: Date;
    includeFooter?: boolean;
    includePageNumbers?: boolean;
    orientation?: 'portrait' | 'landscape';
}

const DEFAULT_BRANDING: PDFBrandingConfig = {
    primaryColor: '#2563EB', // Blue-600
    secondaryColor: '#1E40AF', // Blue-800
    companyName: 'TA Consulting',
    footerText: 'Documento gerado automaticamente por TA Consulting Platform',
};

export class PDFTemplateBase {
    protected doc: jsPDF;
    protected branding: PDFBrandingConfig;
    protected options: PDFGenerationOptions;
    protected pageWidth: number;
    protected pageHeight: number;
    protected margin = 20;
    protected currentY = 50;

    constructor(options: PDFGenerationOptions, branding?: Partial<PDFBrandingConfig>) {
        this.options = options;
        this.branding = { ...DEFAULT_BRANDING, ...branding };

        this.doc = new jsPDF({
            orientation: options.orientation || 'portrait',
            unit: 'mm',
            format: 'a4',
        });

        this.pageWidth = this.doc.internal.pageSize.getWidth();
        this.pageHeight = this.doc.internal.pageSize.getHeight();

        this.addHeader();
    }

    protected addHeader(): void {
        // Header accent bar
        this.doc.setFillColor(this.branding.primaryColor);
        this.doc.rect(0, 0, this.pageWidth, 8, 'F');

        // Company name
        this.doc.setFont('helvetica', 'bold');
        this.doc.setFontSize(10);
        this.doc.setTextColor(this.branding.primaryColor);
        this.doc.text(this.branding.companyName, this.margin, 18);

        // Title
        this.doc.setFontSize(22);
        this.doc.setTextColor('#111827');
        this.doc.text(this.options.title, this.margin, 32);

        // Subtitle
        if (this.options.subtitle) {
            this.doc.setFontSize(11);
            this.doc.setTextColor('#6B7280');
            this.doc.setFont('helvetica', 'normal');
            this.doc.text(this.options.subtitle, this.margin, 40);
        }

        // Date
        const dateStr = (this.options.date || new Date()).toLocaleDateString('pt-PT', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
        this.doc.setFontSize(9);
        this.doc.setTextColor('#9CA3AF');
        this.doc.text(dateStr, this.pageWidth - this.margin, 18, { align: 'right' });

        // Divider
        this.doc.setDrawColor('#E5E7EB');
        this.doc.setLineWidth(0.3);
        this.doc.line(this.margin, 48, this.pageWidth - this.margin, 48);
    }

    protected addFooter(): void {
        if (!this.options.includeFooter) return;

        const pageCount = this.doc.getNumberOfPages();

        for (let i = 1; i <= pageCount; i++) {
            this.doc.setPage(i);

            // Footer line
            this.doc.setDrawColor('#E5E7EB');
            this.doc.setLineWidth(0.3);
            this.doc.line(this.margin, this.pageHeight - 15, this.pageWidth - this.margin, this.pageHeight - 15);

            // Footer text
            this.doc.setFontSize(8);
            this.doc.setTextColor('#9CA3AF');
            this.doc.setFont('helvetica', 'normal');
            this.doc.text(this.branding.footerText, this.margin, this.pageHeight - 8);

            // Page number
            if (this.options.includePageNumbers) {
                this.doc.text(`Página ${i} de ${pageCount}`, this.pageWidth - this.margin, this.pageHeight - 8, { align: 'right' });
            }
        }
    }

    protected addSection(title: string, yOffset?: number): void {
        if (yOffset) this.currentY = yOffset;

        this.checkPageBreak(15);

        this.doc.setFont('helvetica', 'bold');
        this.doc.setFontSize(14);
        this.doc.setTextColor(this.branding.primaryColor);
        this.doc.text(title, this.margin, this.currentY);
        this.currentY += 8;
    }

    protected addParagraph(text: string): void {
        this.checkPageBreak(10);

        this.doc.setFont('helvetica', 'normal');
        this.doc.setFontSize(10);
        this.doc.setTextColor('#374151');

        const lines = this.doc.splitTextToSize(text, this.pageWidth - (this.margin * 2));
        this.doc.text(lines, this.margin, this.currentY);
        this.currentY += (lines.length * 5) + 5;
    }

    protected addTable(headers: string[], data: string[][]): void {
        this.checkPageBreak(30);

        autoTable(this.doc, {
            head: [headers],
            body: data,
            startY: this.currentY,
            margin: { left: this.margin, right: this.margin },
            headStyles: {
                fillColor: this.branding.primaryColor,
                textColor: '#FFFFFF',
                fontStyle: 'bold',
                fontSize: 9,
            },
            bodyStyles: {
                fontSize: 9,
                textColor: '#374151',
            },
            alternateRowStyles: {
                fillColor: '#F9FAFB',
            },
            theme: 'grid',
            styles: {
                cellPadding: 3,
                lineColor: '#E5E7EB',
                lineWidth: 0.1,
            },
        });

        // @ts-ignore - autoTable adds finalY to doc
        this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
    }

    protected addKeyValuePairs(pairs: { key: string; value: string }[]): void {
        pairs.forEach(pair => {
            this.checkPageBreak(8);

            this.doc.setFont('helvetica', 'bold');
            this.doc.setFontSize(9);
            this.doc.setTextColor('#6B7280');
            this.doc.text(pair.key + ':', this.margin, this.currentY);

            this.doc.setFont('helvetica', 'normal');
            this.doc.setTextColor('#111827');
            this.doc.text(pair.value, this.margin + 45, this.currentY);

            this.currentY += 6;
        });
        this.currentY += 4;
    }

    protected checkPageBreak(neededSpace: number): void {
        if (this.currentY + neededSpace > this.pageHeight - 25) {
            this.doc.addPage();
            this.currentY = 20;
        }
    }

    public generate(): Blob {
        this.addFooter();
        return this.doc.output('blob');
    }

    public generateBase64(): string {
        this.addFooter();
        return this.doc.output('datauristring');
    }
}
