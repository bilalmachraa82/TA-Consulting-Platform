/**
 * PDF DOWNLOADER
 * Downloads PDFs from various sources with retry logic
 */

import axios, { AxiosRequestConfig } from 'axios';

export interface DownloadOptions {
  url: string;
  timeout?: number;
  maxRetries?: number;
  userAgent?: string;
  headers?: Record<string, string>;
}

export interface DownloadResult {
  buffer: Buffer;
  contentType: string;
  contentLength: number;
  finalUrl: string;
  redirected: boolean;
}

export class PDFDownloader {
  private defaultTimeout = 30000; // 30 seconds
  private defaultMaxRetries = 3;
  private defaultUserAgent =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';

  /**
   * Download PDF from URL
   */
  async download(options: DownloadOptions): Promise<DownloadResult> {
    const {
      url,
      timeout = this.defaultTimeout,
      maxRetries = this.defaultMaxRetries,
      userAgent = this.defaultUserAgent,
      headers = {},
    } = options;

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`  📥 Downloading (attempt ${attempt}/${maxRetries})...`);

        const config: AxiosRequestConfig = {
          method: 'GET',
          url,
          responseType: 'arraybuffer',
          timeout,
          headers: {
            'User-Agent': userAgent,
            Accept: 'application/pdf,*/*',
            ...headers,
          },
          maxRedirects: 5,
          validateStatus: (status) => status >= 200 && status < 300,
        };

        const response = await axios(config);

        // Verify it's a PDF
        const contentType = response.headers['content-type'] || '';
        if (!contentType.includes('pdf') && !contentType.includes('octet-stream')) {
          console.warn(`  ⚠️  Unexpected content-type: ${contentType}`);
        }

        const buffer = Buffer.from(response.data);

        // Verify PDF magic bytes
        if (!this.isPDF(buffer)) {
          throw new Error('Downloaded file is not a valid PDF');
        }

        return {
          buffer,
          contentType,
          contentLength: buffer.length,
          finalUrl: response.request?.responseURL || url,
          redirected: response.request?.responseURL !== url,
        };
      } catch (error: any) {
        lastError = error;
        console.error(
          `  ❌ Download failed (attempt ${attempt}): ${error.message}`
        );

        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          console.log(`  ⏳ Retrying in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }

    throw new Error(
      `Failed to download PDF after ${maxRetries} attempts: ${lastError?.message}`
    );
  }

  /**
   * Download multiple PDFs in parallel (with concurrency limit)
   */
  async downloadBatch(
    urls: DownloadOptions[],
    concurrency: number = 3
  ): Promise<(DownloadResult | Error)[]> {
    const results: (DownloadResult | Error)[] = [];
    const queue = [...urls];

    const workers = Array.from({ length: concurrency }, async () => {
      while (queue.length > 0) {
        const options = queue.shift();
        if (!options) break;

        try {
          const result = await this.download(options);
          results.push(result);
        } catch (error: any) {
          results.push(error);
        }
      }
    });

    await Promise.all(workers);
    return results;
  }

  /**
   * Check if buffer is a valid PDF
   */
  private isPDF(buffer: Buffer): boolean {
    // PDF magic bytes: %PDF-
    return (
      buffer.length > 4 &&
      buffer[0] === 0x25 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x44 &&
      buffer[3] === 0x46
    );
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
