/**
 * Scraper Utilities - Rate Limiting, Caching, and Resilient Scraping
 *
 * Sistema robusto para scraping respeitoso de sites governamentais portugueses
 * Inclui:
 * - Rate limiting (2 segundos entre requests)
 * - Cache inteligente com TTL
 * - Retry com exponential backoff
 * - User-Agent rotation
 * - Playwright fallback para sites dinâmicos
 */

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

// ============================================
// TYPES
// ============================================

export interface ScraperConfig {
  minDelayMs: number;
  maxRequestsPerMinute: number;
  cacheEnabled: boolean;
  cacheTTLMs: number;
  retryAttempts: number;
  usePlaywrightFallback: boolean;
}

export interface CacheEntry {
  data: any;
  timestamp: number;
  etag?: string;
  url: string;
}

export interface ScrapingResult<T> {
  success: boolean;
  data: T | null;
  source: 'cache' | 'network' | 'fallback';
  error?: string;
  duration: number;
}

// ============================================
// DEFAULT CONFIG
// ============================================

const DEFAULT_CONFIG: ScraperConfig = {
  minDelayMs: 2000,           // 2 segundos entre requests
  maxRequestsPerMinute: 20,    // Max 20 requests/minuto
  cacheEnabled: true,
  cacheTTLMs: 24 * 60 * 60 * 1000, // 24 horas
  retryAttempts: 3,
  usePlaywrightFallback: false, // Activar quando Playwright estiver disponível
};

// ============================================
// USER AGENTS (Rotation)
// ============================================

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
];

// ============================================
// RATE LIMITER CLASS
// ============================================

export class RateLimiter {
  private lastRequest: number = 0;
  private requestCount: number = 0;
  private resetTime: number = Date.now() + 60000;
  private config: ScraperConfig;

  constructor(config: Partial<ScraperConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async throttle(): Promise<void> {
    const now = Date.now();

    // Reset counter every minute
    if (now > this.resetTime) {
      this.requestCount = 0;
      this.resetTime = now + 60000;
    }

    // Check max requests per minute
    if (this.requestCount >= this.config.maxRequestsPerMinute) {
      const waitTime = this.resetTime - now;
      console.log(`⏳ Rate limit reached. Waiting ${Math.ceil(waitTime / 1000)}s...`);
      await this.sleep(waitTime);
      this.requestCount = 0;
      this.resetTime = Date.now() + 60000;
    }

    // Minimum delay between requests
    const elapsed = now - this.lastRequest;
    if (elapsed < this.config.minDelayMs) {
      await this.sleep(this.config.minDelayMs - elapsed);
    }

    this.lastRequest = Date.now();
    this.requestCount++;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================
// CACHE MANAGER
// ============================================

export class CacheManager {
  private cache: Map<string, CacheEntry> = new Map();
  private cacheDir: string;
  private config: ScraperConfig;

  constructor(config: Partial<ScraperConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.cacheDir = path.join(process.cwd(), 'data', 'cache');
    this.ensureCacheDir();
    this.loadFromDisk();
  }

  private ensureCacheDir(): void {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  private loadFromDisk(): void {
    try {
      const cacheFile = path.join(this.cacheDir, 'scraper_cache.json');
      if (fs.existsSync(cacheFile)) {
        const data = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
        this.cache = new Map(Object.entries(data));
        console.log(`📦 Loaded ${this.cache.size} cached entries`);
      }
    } catch (error) {
      console.warn('⚠️ Could not load cache from disk');
    }
  }

  private saveToDisk(): void {
    try {
      const cacheFile = path.join(this.cacheDir, 'scraper_cache.json');
      const data = Object.fromEntries(this.cache);
      fs.writeFileSync(cacheFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.warn('⚠️ Could not save cache to disk');
    }
  }

  private getCacheKey(url: string): string {
    return Buffer.from(url).toString('base64').substring(0, 64);
  }

  get(url: string): CacheEntry | null {
    if (!this.config.cacheEnabled) return null;

    const key = this.getCacheKey(url);
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Check if cache is expired
    if (Date.now() - entry.timestamp > this.config.cacheTTLMs) {
      this.cache.delete(key);
      return null;
    }

    return entry;
  }

  set(url: string, data: any, etag?: string): void {
    if (!this.config.cacheEnabled) return;

    const key = this.getCacheKey(url);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      etag,
      url,
    });

    // Persist to disk periodically (every 10 entries)
    if (this.cache.size % 10 === 0) {
      this.saveToDisk();
    }
  }

  clear(): void {
    this.cache.clear();
    this.saveToDisk();
  }

  getStats(): { size: number; oldestEntry: number | null } {
    let oldestEntry: number | null = null;

    for (const entry of this.cache.values()) {
      if (!oldestEntry || entry.timestamp < oldestEntry) {
        oldestEntry = entry.timestamp;
      }
    }

    return { size: this.cache.size, oldestEntry };
  }
}

// ============================================
// RESILIENT SCRAPER
// ============================================

export class ResilientScraper {
  private rateLimiter: RateLimiter;
  private cacheManager: CacheManager;
  private config: ScraperConfig;
  private userAgentIndex: number = 0;

  constructor(config: Partial<ScraperConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.rateLimiter = new RateLimiter(this.config);
    this.cacheManager = new CacheManager(this.config);
  }

  private getNextUserAgent(): string {
    const ua = USER_AGENTS[this.userAgentIndex];
    this.userAgentIndex = (this.userAgentIndex + 1) % USER_AGENTS.length;
    return ua;
  }

  private getHeaders(): Record<string, string> {
    return {
      'User-Agent': this.getNextUserAgent(),
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'pt-PT,pt;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Cache-Control': 'max-age=0',
      'Upgrade-Insecure-Requests': '1',
    };
  }

  async fetch(url: string, options: { forceRefresh?: boolean } = {}): Promise<ScrapingResult<string>> {
    const startTime = Date.now();

    // Check cache first
    if (!options.forceRefresh) {
      const cached = this.cacheManager.get(url);
      if (cached) {
        console.log(`📦 Cache hit: ${url.substring(0, 50)}...`);
        return {
          success: true,
          data: cached.data,
          source: 'cache',
          duration: Date.now() - startTime,
        };
      }
    }

    // Rate limiting
    await this.rateLimiter.throttle();

    // Try fetching with retries
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        console.log(`🌐 Fetching (attempt ${attempt}/${this.config.retryAttempts}): ${url.substring(0, 60)}...`);

        const response = await axios.get(url, {
          headers: this.getHeaders(),
          timeout: 30000,
          validateStatus: (status) => status < 500,
        });

        if (response.status === 429) {
          // Rate limited by server - wait longer
          const waitTime = Math.pow(2, attempt) * 5000;
          console.log(`⚠️ Server rate limit (429). Waiting ${waitTime / 1000}s...`);
          await this.sleep(waitTime);
          continue;
        }

        if (response.status === 403) {
          console.log(`⚠️ Forbidden (403). Site may be blocking scrapers.`);
          // Try with different user agent
          continue;
        }

        if (response.status >= 400) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Success - cache and return
        const data = response.data;
        this.cacheManager.set(url, data, response.headers.etag);

        return {
          success: true,
          data,
          source: 'network',
          duration: Date.now() - startTime,
        };

      } catch (error: any) {
        lastError = error;

        if (attempt < this.config.retryAttempts) {
          const waitTime = Math.pow(2, attempt) * 1000;
          console.log(`⚠️ Attempt ${attempt} failed: ${error.message}. Retrying in ${waitTime / 1000}s...`);
          await this.sleep(waitTime);
        }
      }
    }

    // All attempts failed
    return {
      success: false,
      data: null,
      source: 'network',
      error: lastError?.message || 'Unknown error',
      duration: Date.now() - startTime,
    };
  }

  async fetchAndParse(url: string): Promise<ScrapingResult<cheerio.CheerioAPI>> {
    const result = await this.fetch(url);

    if (!result.success || !result.data) {
      return {
        ...result,
        data: null,
      };
    }

    try {
      const $ = cheerio.load(result.data);
      return {
        ...result,
        data: $,
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        source: result.source,
        error: `Parse error: ${error.message}`,
        duration: result.duration,
      };
    }
  }

  async fetchJSON<T>(url: string): Promise<ScrapingResult<T>> {
    const result = await this.fetch(url);

    if (!result.success || !result.data) {
      return {
        ...result,
        data: null,
      };
    }

    try {
      const data = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
      return {
        ...result,
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        source: result.source,
        error: `JSON parse error: ${error.message}`,
        duration: result.duration,
      };
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getCacheStats() {
    return this.cacheManager.getStats();
  }

  clearCache() {
    this.cacheManager.clear();
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

let scraperInstance: ResilientScraper | null = null;

export function getScraper(config?: Partial<ScraperConfig>): ResilientScraper {
  if (!scraperInstance) {
    scraperInstance = new ResilientScraper(config);
  }
  return scraperInstance;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Extract text content safely from a Cheerio element
 */
export function safeText($el: cheerio.Cheerio<any>): string {
  return $el.text().trim().replace(/\s+/g, ' ');
}

/**
 * Extract attribute safely
 */
export function safeAttr($el: cheerio.Cheerio<any>, attr: string): string {
  return $el.attr(attr) || '';
}

/**
 * Parse Portuguese date formats
 */
export function parsePortugueseDate(dateStr: string): Date | null {
  if (!dateStr) return null;

  // Try different formats
  const patterns = [
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/, // DD/MM/YYYY or DD-MM-YYYY
    /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/, // YYYY-MM-DD
    /(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})/i, // DD de Mês de YYYY
  ];

  const monthNames: Record<string, number> = {
    'janeiro': 0, 'fevereiro': 1, 'março': 2, 'marco': 2, 'abril': 3,
    'maio': 4, 'junho': 5, 'julho': 6, 'agosto': 7,
    'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11,
  };

  for (const pattern of patterns) {
    const match = dateStr.match(pattern);
    if (match) {
      if (pattern === patterns[2]) {
        // DD de Mês de YYYY
        const day = parseInt(match[1]);
        const month = monthNames[match[2].toLowerCase()];
        const year = parseInt(match[3]);
        if (month !== undefined) {
          return new Date(year, month, day);
        }
      } else if (match[1].length === 4) {
        // YYYY-MM-DD
        return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
      } else {
        // DD/MM/YYYY
        return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
      }
    }
  }

  return null;
}

/**
 * Parse monetary values (Portuguese format)
 */
export function parseMonetaryValue(value: string): number {
  if (!value) return 0;

  // Remove currency symbols and spaces
  let cleaned = value.replace(/[€$\s]/g, '');

  // Handle millions (M€, milhões)
  if (/milh[oõ]es|M€|ME/i.test(value)) {
    cleaned = cleaned.replace(/[^\d,\.]/g, '');
    const num = parseFloat(cleaned.replace(',', '.'));
    return isNaN(num) ? 0 : num * 1000000;
  }

  // Handle thousands (mil)
  if (/mil/i.test(value)) {
    cleaned = cleaned.replace(/[^\d,\.]/g, '');
    const num = parseFloat(cleaned.replace(',', '.'));
    return isNaN(num) ? 0 : num * 1000;
  }

  // Standard number (Portuguese uses . for thousands, , for decimals)
  cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Generate a unique ID for an aviso
 */
export function generateAvisoId(source: string, title: string): string {
  const timestamp = Date.now();
  const cleanSource = source.replace(/[^a-zA-Z0-9]/g, '');
  const cleanTitle = title.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_');
  return `${cleanSource}_${cleanTitle}_${timestamp}`.toUpperCase();
}

export default {
  RateLimiter,
  CacheManager,
  ResilientScraper,
  getScraper,
  safeText,
  safeAttr,
  parsePortugueseDate,
  parseMonetaryValue,
  generateAvisoId,
};
