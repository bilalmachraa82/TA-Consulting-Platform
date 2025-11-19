/**
 * PDF STORAGE SERVICE
 * Manages PDF file storage with local filesystem and optional S3 support
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { existsSync } from 'fs';

export interface PDFMetadata {
  avisoId: string;
  avisoCodigo: string;
  portal: string;
  filename: string;
  url: string;
  hash: string;
  sizeBytes: number;
  downloadedAt: Date;
  localPath: string;
  s3Path?: string;
}

export interface StorageConfig {
  storageType: 'local' | 's3' | 'both';
  localBasePath: string;
  s3Bucket?: string;
  s3Region?: string;
}

export class PDFStorageService {
  private config: StorageConfig;

  constructor(config?: Partial<StorageConfig>) {
    this.config = {
      storageType: config?.storageType || 'local',
      localBasePath:
        config?.localBasePath ||
        path.join(process.cwd(), 'storage', 'pdfs'),
      s3Bucket: config?.s3Bucket,
      s3Region: config?.s3Region || 'eu-west-1',
    };
  }

  /**
   * Initialize storage directories
   */
  async initialize(): Promise<void> {
    if (!existsSync(this.config.localBasePath)) {
      await fs.mkdir(this.config.localBasePath, { recursive: true });
    }

    // Create portal subdirectories
    const portals = ['PORTUGAL2030', 'PRR', 'PAPAC'];
    for (const portal of portals) {
      const portalPath = path.join(this.config.localBasePath, portal);
      if (!existsSync(portalPath)) {
        await fs.mkdir(portalPath, { recursive: true });
      }
    }
  }

  /**
   * Generate storage path for a PDF
   */
  generatePath(portal: string, avisoCodigo: string, filename: string): string {
    // Format: storage/pdfs/{PORTAL}/{CODIGO}/{filename}
    return path.join(
      this.config.localBasePath,
      portal,
      avisoCodigo,
      filename
    );
  }

  /**
   * Save PDF buffer to storage
   */
  async savePDF(
    buffer: Buffer,
    metadata: Omit<PDFMetadata, 'hash' | 'sizeBytes' | 'localPath'>
  ): Promise<PDFMetadata> {
    // Calculate hash
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');

    // Check for duplicates by hash
    const existingPath = await this.findByHash(hash);
    if (existingPath) {
      console.log(`  ℹ️  PDF already exists (duplicate): ${existingPath}`);
      return {
        ...metadata,
        hash,
        sizeBytes: buffer.length,
        localPath: existingPath,
      };
    }

    // Generate storage path
    const localPath = this.generatePath(
      metadata.portal,
      metadata.avisoCodigo,
      metadata.filename
    );

    // Ensure directory exists
    const dir = path.dirname(localPath);
    if (!existsSync(dir)) {
      await fs.mkdir(dir, { recursive: true });
    }

    // Write file
    await fs.writeFile(localPath, buffer);

    // TODO: Upload to S3 if configured
    let s3Path: string | undefined;
    if (this.config.storageType === 's3' || this.config.storageType === 'both') {
      // s3Path = await this.uploadToS3(buffer, metadata);
      console.log('  ⚠️  S3 upload not yet implemented');
    }

    return {
      ...metadata,
      hash,
      sizeBytes: buffer.length,
      localPath,
      s3Path,
    };
  }

  /**
   * Find PDF by hash (deduplication)
   */
  async findByHash(hash: string): Promise<string | null> {
    // Search all portal directories for matching hash
    const portals = ['PORTUGAL2030', 'PRR', 'PAPAC'];

    for (const portal of portals) {
      const portalPath = path.join(this.config.localBasePath, portal);
      if (!existsSync(portalPath)) continue;

      const avisos = await fs.readdir(portalPath);
      for (const aviso of avisos) {
        const avisoPath = path.join(portalPath, aviso);
        const stat = await fs.stat(avisoPath);
        if (!stat.isDirectory()) continue;

        const files = await fs.readdir(avisoPath);
        for (const file of files) {
          const filePath = path.join(avisoPath, file);
          const fileBuffer = await fs.readFile(filePath);
          const fileHash = crypto
            .createHash('sha256')
            .update(fileBuffer)
            .digest('hex');

          if (fileHash === hash) {
            return filePath;
          }
        }
      }
    }

    return null;
  }

  /**
   * Read PDF from storage
   */
  async readPDF(localPath: string): Promise<Buffer> {
    return await fs.readFile(localPath);
  }

  /**
   * Check if PDF exists
   */
  async exists(localPath: string): Promise<boolean> {
    try {
      await fs.access(localPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get storage statistics
   */
  async getStats(): Promise<{
    totalFiles: number;
    totalSizeBytes: number;
    byPortal: Record<string, { files: number; sizeBytes: number }>;
  }> {
    const portals = ['PORTUGAL2030', 'PRR', 'PAPAC'];
    const byPortal: Record<string, { files: number; sizeBytes: number }> = {};

    let totalFiles = 0;
    let totalSizeBytes = 0;

    for (const portal of portals) {
      const portalPath = path.join(this.config.localBasePath, portal);
      if (!existsSync(portalPath)) {
        byPortal[portal] = { files: 0, sizeBytes: 0 };
        continue;
      }

      let portalFiles = 0;
      let portalSize = 0;

      const avisos = await fs.readdir(portalPath);
      for (const aviso of avisos) {
        const avisoPath = path.join(portalPath, aviso);
        const stat = await fs.stat(avisoPath);
        if (!stat.isDirectory()) continue;

        const files = await fs.readdir(avisoPath);
        for (const file of files) {
          const filePath = path.join(avisoPath, file);
          const fileStat = await fs.stat(filePath);
          portalFiles++;
          portalSize += fileStat.size;
        }
      }

      byPortal[portal] = { files: portalFiles, sizeBytes: portalSize };
      totalFiles += portalFiles;
      totalSizeBytes += portalSize;
    }

    return { totalFiles, totalSizeBytes, byPortal };
  }
}
