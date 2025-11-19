/**
 * PDF TEXT EXTRACTION SERVICE
 * Extracts text from PDF files with quality assessment
 */

import pdfParse from 'pdf-parse';
import { PDFStorageService } from './storage';

export interface PDFExtractionResult {
  text: string;
  numPages: number;
  metadata: {
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    producer?: string;
    creationDate?: Date;
  };
  quality: {
    score: number; // 0-1
    warnings: string[];
    stats: {
      totalChars: number;
      alphanumericChars: number;
      words: number;
      lines: number;
    };
  };
}

export class PDFTextExtractor {
  constructor(private storage: PDFStorageService) {}

  /**
   * Extract text from PDF file
   */
  async extract(localPath: string): Promise<PDFExtractionResult> {
    // Read PDF buffer
    const buffer = await this.storage.readPDF(localPath);

    // Parse PDF
    const data = await pdfParse(buffer);

    // Extract metadata
    const metadata = {
      title: data.info?.Title,
      author: data.info?.Author,
      subject: data.info?.Subject,
      creator: data.info?.Creator,
      producer: data.info?.Producer,
      creationDate: data.info?.CreationDate
        ? new Date(data.info.CreationDate)
        : undefined,
    };

    // Assess quality
    const quality = this.assessQuality(data.text, data.numpages);

    return {
      text: data.text,
      numPages: data.numpages,
      metadata,
      quality,
    };
  }

  /**
   * Assess PDF text quality
   */
  private assessQuality(
    text: string,
    numPages: number
  ): PDFExtractionResult['quality'] {
    const warnings: string[] = [];

    // Calculate stats
    const totalChars = text.length;
    const alphanumericChars = (text.match(/[a-zA-Z0-9]/g) || []).length;
    const words = text.split(/\s+/).filter((w) => w.length > 0).length;
    const lines = text.split('\n').length;

    // Quality checks
    let score = 1.0;

    // Check 1: Empty or very short
    if (totalChars < 100) {
      warnings.push('PDF text is very short (<100 chars)');
      score -= 0.5;
    }

    // Check 2: Low alphanumeric ratio (possible scan/image PDF)
    const alphaRatio = alphanumericChars / totalChars;
    if (alphaRatio < 0.5) {
      warnings.push('Low alphanumeric ratio - may be scanned/image PDF');
      score -= 0.3;
    }

    // Check 3: Very low word count per page
    const wordsPerPage = words / numPages;
    if (wordsPerPage < 50) {
      warnings.push(`Low word density (${wordsPerPage.toFixed(1)} words/page)`);
      score -= 0.2;
    }

    // Check 4: Excessive special characters
    const specialChars = totalChars - alphanumericChars;
    const specialRatio = specialChars / totalChars;
    if (specialRatio > 0.7) {
      warnings.push('High special character ratio - extraction may be corrupted');
      score -= 0.2;
    }

    // Check 5: No line breaks (possible formatting issue)
    if (lines < numPages) {
      warnings.push('Very few line breaks - formatting may be lost');
      score -= 0.1;
    }

    return {
      score: Math.max(0, score),
      warnings,
      stats: {
        totalChars,
        alphanumericChars,
        words,
        lines,
      },
    };
  }

  /**
   * Extract and clean text (removes excessive whitespace)
   */
  async extractClean(localPath: string): Promise<PDFExtractionResult> {
    const result = await this.extract(localPath);

    // Clean text
    result.text = result.text
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\n\s*\n/g, '\n\n') // Remove excessive line breaks
      .trim();

    return result;
  }

  /**
   * Extract with character limit (for LLM processing)
   */
  async extractTruncated(
    localPath: string,
    maxChars: number = 100000
  ): Promise<PDFExtractionResult> {
    const result = await this.extractClean(localPath);

    if (result.text.length > maxChars) {
      result.text = result.text.slice(0, maxChars);
      result.quality.warnings.push(
        `Text truncated to ${maxChars} chars (original: ${result.quality.stats.totalChars})`
      );
    }

    return result;
  }
}
