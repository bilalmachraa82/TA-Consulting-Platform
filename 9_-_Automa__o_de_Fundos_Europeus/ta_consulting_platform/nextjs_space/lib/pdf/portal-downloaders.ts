/**
 * PORTAL-SPECIFIC PDF DOWNLOADERS
 * Handle portal-specific URL patterns and API calls
 */

import { PDFDownloader } from './downloader';
import { Portal } from '@prisma/client';

export interface PortalPDFInfo {
  url: string;
  filename: string;
  documentType: 'regulamento' | 'anexo' | 'outro';
}

/**
 * Base class for portal-specific downloaders
 */
export abstract class PortalPDFDownloader {
  constructor(protected downloader: PDFDownloader) {}

  abstract getPortal(): Portal;

  /**
   * Find all PDF URLs for an aviso
   */
  abstract findPDFUrls(aviso: {
    codigo: string;
    regulamentoURL?: string | null;
    anexosRegulamento?: any;
  }): Promise<PortalPDFInfo[]>;

  /**
   * Download all PDFs for an aviso
   */
  async downloadAll(aviso: {
    codigo: string;
    regulamentoURL?: string | null;
    anexosRegulamento?: any;
  }): Promise<{ url: string; buffer: Buffer; filename: string }[]> {
    const pdfInfos = await this.findPDFUrls(aviso);
    const results: { url: string; buffer: Buffer; filename: string }[] = [];

    for (const info of pdfInfos) {
      try {
        console.log(`  📄 Downloading: ${info.filename}`);
        const result = await this.downloader.download({ url: info.url });
        results.push({
          url: info.url,
          buffer: result.buffer,
          filename: info.filename,
        });
      } catch (error: any) {
        console.error(`  ❌ Failed to download ${info.filename}: ${error.message}`);
      }
    }

    return results;
  }
}

/**
 * Portugal 2030 PDF Downloader
 */
export class Portugal2030PDFDownloader extends PortalPDFDownloader {
  getPortal(): Portal {
    return 'PORTUGAL2030' as Portal;
  }

  async findPDFUrls(aviso: {
    codigo: string;
    regulamentoURL?: string | null;
    anexosRegulamento?: any;
  }): Promise<PortalPDFInfo[]> {
    const pdfs: PortalPDFInfo[] = [];

    // Main regulamento
    if (aviso.regulamentoURL) {
      pdfs.push({
        url: aviso.regulamentoURL,
        filename: 'regulamento.pdf',
        documentType: 'regulamento',
      });
    }

    // Anexos from JSON field
    if (aviso.anexosRegulamento) {
      const anexos = Array.isArray(aviso.anexosRegulamento)
        ? aviso.anexosRegulamento
        : [];

      anexos.forEach((anexo: any, index: number) => {
        if (anexo.url && anexo.url.toLowerCase().endsWith('.pdf')) {
          pdfs.push({
            url: anexo.url,
            filename: anexo.nome || `anexo_${index + 1}.pdf`,
            documentType: 'anexo',
          });
        }
      });
    }

    // Fallback: Try to fetch from API
    if (pdfs.length === 0) {
      try {
        const apiPDFs = await this.fetchFromAPI(aviso.codigo);
        pdfs.push(...apiPDFs);
      } catch (error) {
        console.error('  ⚠️  Failed to fetch PDFs from API');
      }
    }

    return pdfs;
  }

  /**
   * Fetch PDF URLs from Portugal 2030 API
   */
  private async fetchFromAPI(codigo: string): Promise<PortalPDFInfo[]> {
    // TODO: Implement actual API call
    // This is a placeholder - actual implementation depends on API structure
    console.log('  ℹ️  API fetching not yet implemented for PT2030');
    return [];
  }
}

/**
 * PRR PDF Downloader
 */
export class PRRPDFDownloader extends PortalPDFDownloader {
  getPortal(): Portal {
    return 'PRR' as Portal;
  }

  async findPDFUrls(aviso: {
    codigo: string;
    regulamentoURL?: string | null;
    anexosRegulamento?: any;
  }): Promise<PortalPDFInfo[]> {
    const pdfs: PortalPDFInfo[] = [];

    // PRR usually has direct PDF links
    if (aviso.regulamentoURL) {
      pdfs.push({
        url: aviso.regulamentoURL,
        filename: 'regulamento.pdf',
        documentType: 'regulamento',
      });
    }

    // Try to construct standard PRR URL if missing
    if (pdfs.length === 0) {
      const constructedUrl = this.constructPRRUrl(aviso.codigo);
      if (constructedUrl) {
        pdfs.push({
          url: constructedUrl,
          filename: 'regulamento.pdf',
          documentType: 'regulamento',
        });
      }
    }

    return pdfs;
  }

  /**
   * Construct PRR URL from codigo
   */
  private constructPRRUrl(codigo: string): string | null {
    // PRR URLs typically follow pattern:
    // https://recuperarportugal.gov.pt/wp-content/uploads/...
    // This is a fallback - may need adjustment based on actual URL patterns
    return null; // TODO: Implement based on actual PRR URL structure
  }
}

/**
 * PAPAC PDF Downloader
 */
export class PAPACPDFDownloader extends PortalPDFDownloader {
  getPortal(): Portal {
    return 'PAPAC' as Portal;
  }

  async findPDFUrls(aviso: {
    codigo: string;
    regulamentoURL?: string | null;
    anexosRegulamento?: any;
  }): Promise<PortalPDFInfo[]> {
    const pdfs: PortalPDFInfo[] = [];

    if (aviso.regulamentoURL) {
      pdfs.push({
        url: aviso.regulamentoURL,
        filename: 'regulamento.pdf',
        documentType: 'regulamento',
      });
    }

    return pdfs;
  }
}

/**
 * Factory to get appropriate downloader for portal
 */
export class PortalDownloaderFactory {
  private downloader = new PDFDownloader();

  getDownloader(portal: Portal): PortalPDFDownloader {
    switch (portal) {
      case 'PORTUGAL2030':
        return new Portugal2030PDFDownloader(this.downloader);
      case 'PRR':
        return new PRRPDFDownloader(this.downloader);
      case 'PAPAC':
        return new PAPACPDFDownloader(this.downloader);
      default:
        throw new Error(`Unknown portal: ${portal}`);
    }
  }
}
