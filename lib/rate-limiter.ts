/**
 * Simple In-Memory Rate Limiter
 * 
 * MVP implementation for development/staging.
 * For production at scale, replace with Redis-based solution.
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

// In-memory store (cleared on server restart)
const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
        if (entry.resetTime < now) {
            store.delete(key);
        }
    }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
    /** Maximum requests allowed in the window */
    limit: number;
    /** Time window in seconds */
    windowSeconds: number;
}

export interface RateLimitResult {
    success: boolean;
    remaining: number;
    resetIn: number; // seconds until reset
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (e.g., IP address, user ID)
 * @param config - Rate limit configuration
 */
export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig
): RateLimitResult {
    const now = Date.now();
    const windowMs = config.windowSeconds * 1000;
    const key = identifier;

    const entry = store.get(key);

    // No existing entry or window expired
    if (!entry || entry.resetTime < now) {
        store.set(key, {
            count: 1,
            resetTime: now + windowMs,
        });
        return {
            success: true,
            remaining: config.limit - 1,
            resetIn: config.windowSeconds,
        };
    }

    // Within window
    if (entry.count >= config.limit) {
        const resetIn = Math.ceil((entry.resetTime - now) / 1000);
        return {
            success: false,
            remaining: 0,
            resetIn,
        };
    }

    // Increment count
    entry.count++;
    store.set(key, entry);

    return {
        success: true,
        remaining: config.limit - entry.count,
        resetIn: Math.ceil((entry.resetTime - now) / 1000),
    };
}

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request): string {
    // Check common headers (in order of priority)
    const headers = request.headers;

    const forwardedFor = headers.get('x-forwarded-for');
    if (forwardedFor) {
        // Take the first IP if there are multiple
        return forwardedFor.split(',')[0].trim();
    }

    const realIP = headers.get('x-real-ip');
    if (realIP) {
        return realIP;
    }

    // Fallback for local development
    return '127.0.0.1';
}

// Preset configurations
export const RATE_LIMITS = {
    CHATBOT: { limit: 10, windowSeconds: 60 } as RateLimitConfig,      // 10 req/min
    LEADS_SUBMIT: { limit: 5, windowSeconds: 60 } as RateLimitConfig,  // 5 req/min
    API_GENERAL: { limit: 100, windowSeconds: 60 } as RateLimitConfig, // 100 req/min
};
