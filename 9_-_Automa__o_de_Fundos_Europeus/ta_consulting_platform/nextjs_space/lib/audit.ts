/**
 * Audit Logging Library
 * 
 * Provides functions to log all critical operations in the platform
 * for compliance, security, and debugging purposes.
 */

import { prisma } from '@/lib/db';
import { AuditAction, AuditSeverity } from '@prisma/client';

interface AuditLogInput {
    userId: string;
    userName?: string;
    userEmail?: string;
    action: AuditAction;
    entity: string;
    entityId: string;
    changes?: Record<string, any>;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    method?: string;
    path?: string;
    severity?: AuditSeverity;
    category?: string;
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(input: AuditLogInput) {
    try {
        await prisma.auditLog.create({
            data: {
                userId: input.userId,
                userName: input.userName,
                userEmail: input.userEmail,
                action: input.action,
                entity: input.entity,
                entityId: input.entityId,
                changes: input.changes || undefined,
                metadata: input.metadata || undefined,
                ipAddress: input.ipAddress,
                userAgent: input.userAgent,
                method: input.method,
                path: input.path,
                severity: input.severity || AuditSeverity.INFO,
                category: input.category,
            },
        });
    } catch (error) {
        // Log to console but don't throw - audit logging should never break the app
        console.error('[AUDIT LOG ERROR]', error);
    }
}

/**
 * Log a CREATE operation
 */
export async function logCreate(params: {
    userId: string;
    userName?: string;
    userEmail?: string;
    entity: string;
    entityId: string;
    data: Record<string, any>;
    category?: string;
    request?: Request;
}) {
    const { request, ...rest } = params;

    await createAuditLog({
        ...rest,
        action: AuditAction.CREATE,
        changes: { after: params.data },
        ipAddress: request ? getClientIp(request) : undefined,
        userAgent: request ? request.headers.get('user-agent') || undefined : undefined,
        method: request?.method,
        path: request ? new URL(request.url).pathname : undefined,
        severity: AuditSeverity.INFO,
    });
}

/**
 * Log an UPDATE operation
 */
export async function logUpdate(params: {
    userId: string;
    userName?: string;
    userEmail?: string;
    entity: string;
    entityId: string;
    before: Record<string, any>;
    after: Record<string, any>;
    category?: string;
    request?: Request;
}) {
    const { request, before, after, ...rest } = params;

    // Calculate diff
    const changes = calculateDiff(before, after);

    await createAuditLog({
        ...rest,
        action: AuditAction.UPDATE,
        changes,
        ipAddress: request ? getClientIp(request) : undefined,
        userAgent: request ? request.headers.get('user-agent') || undefined : undefined,
        method: request?.method,
        path: request ? new URL(request.url).pathname : undefined,
        severity: AuditSeverity.INFO,
    });
}

/**
 * Log a DELETE operation
 */
export async function logDelete(params: {
    userId: string;
    userName?: string;
    userEmail?: string;
    entity: string;
    entityId: string;
    data: Record<string, any>;
    category?: string;
    request?: Request;
}) {
    const { request, ...rest } = params;

    await createAuditLog({
        ...rest,
        action: AuditAction.DELETE,
        changes: { before: params.data },
        ipAddress: request ? getClientIp(request) : undefined,
        userAgent: request ? request.headers.get('user-agent') || undefined : undefined,
        method: request?.method,
        path: request ? new URL(request.url).pathname : undefined,
        severity: AuditSeverity.WARNING,
    });
}

/**
 * Log an APPROVE operation
 */
export async function logApprove(params: {
    userId: string;
    userName?: string;
    userEmail?: string;
    entity: string;
    entityId: string;
    metadata?: Record<string, any>;
    request?: Request;
}) {
    const { request, ...rest } = params;

    await createAuditLog({
        ...rest,
        action: AuditAction.APPROVE,
        ipAddress: request ? getClientIp(request) : undefined,
        userAgent: request ? request.headers.get('user-agent') || undefined : undefined,
        method: request?.method,
        path: request ? new URL(request.url).pathname : undefined,
        severity: AuditSeverity.INFO,
        category: 'COMPLIANCE',
    });
}

/**
 * Log a REJECT operation
 */
export async function logReject(params: {
    userId: string;
    userName?: string;
    userEmail?: string;
    entity: string;
    entityId: string;
    reason?: string;
    request?: Request;
}) {
    const { request, reason, ...rest } = params;

    await createAuditLog({
        ...rest,
        action: AuditAction.REJECT,
        metadata: reason ? { reason } : undefined,
        ipAddress: request ? getClientIp(request) : undefined,
        userAgent: request ? request.headers.get('user-agent') || undefined : undefined,
        method: request?.method,
        path: request ? new URL(request.url).pathname : undefined,
        severity: AuditSeverity.WARNING,
        category: 'COMPLIANCE',
    });
}

/**
 * Log a LOGIN operation
 */
export async function logLogin(params: {
    userId: string;
    userName?: string;
    userEmail?: string;
    success: boolean;
    request?: Request;
}) {
    const { request, success, ...rest } = params;

    await createAuditLog({
        ...rest,
        action: AuditAction.LOGIN,
        entity: 'User',
        entityId: params.userId,
        metadata: { success },
        ipAddress: request ? getClientIp(request) : undefined,
        userAgent: request ? request.headers.get('user-agent') || undefined : undefined,
        severity: success ? AuditSeverity.INFO : AuditSeverity.WARNING,
        category: 'SECURITY',
    });
}

/**
 * Helper: Calculate diff between two objects
 */
function calculateDiff(before: Record<string, any>, after: Record<string, any>) {
    const diff: Record<string, { before: any; after: any }> = {};

    // Check all keys in 'after'
    for (const key in after) {
        if (before[key] !== after[key]) {
            diff[key] = { before: before[key], after: after[key] };
        }
    }

    // Check for deleted keys
    for (const key in before) {
        if (!(key in after)) {
            diff[key] = { before: before[key], after: null };
        }
    }

    return Object.keys(diff).length > 0 ? diff : undefined;
}

/**
 * Helper: Extract client IP from request
 */
function getClientIp(request: Request): string | undefined {
    // Try various headers (for proxies/load balancers)
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    const realIp = request.headers.get('x-real-ip');
    if (realIp) {
        return realIp;
    }

    // Fallback (might not work in all environments)
    return undefined;
}

/**
 * Query audit logs with filters
 */
export async function getAuditLogs(filters: {
    userId?: string;
    entity?: string;
    entityId?: string;
    action?: AuditAction;
    severity?: AuditSeverity;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
}) {
    const where: any = {};

    if (filters.userId) where.userId = filters.userId;
    if (filters.entity) where.entity = filters.entity;
    if (filters.entityId) where.entityId = filters.entityId;
    if (filters.action) where.action = filters.action;
    if (filters.severity) where.severity = filters.severity;

    if (filters.startDate || filters.endDate) {
        where.createdAt = {};
        if (filters.startDate) where.createdAt.gte = filters.startDate;
        if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: filters.limit || 50,
            skip: filters.offset || 0,
        }),
        prisma.auditLog.count({ where }),
    ]);

    return { logs, total };
}
