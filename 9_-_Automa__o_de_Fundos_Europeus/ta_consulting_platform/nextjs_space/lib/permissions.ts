import { UserRole } from '@prisma/client';
import { db } from '@/lib/db';

/**
 * Verifica se um utilizador tem permissão para aceder a uma empresa específica.
 * - ADMIN e MANAGER: Acesso total.
 * - CONSULTANT: Acesso apenas se estiver atribuído à empresa.
 */
export async function canAccessCompany(userId: string, companyId: string): Promise<boolean> {
    const user = await db.user.findUnique({
        where: { id: userId },
        include: { empresas: { select: { id: true } } }
    });

    if (!user) return false;

    if (user.role === UserRole.ADMIN || user.role === UserRole.MANAGER) {
        return true;
    }

    return user.empresas.some(emp => emp.id === companyId);
}

/**
 * Verifica se o utilizador tem permissão de administração.
 */
export async function isAdmin(userId: string): Promise<boolean> {
    const user = await db.user.findUnique({
        where: { id: userId },
        select: { role: true }
    });

    return user?.role === UserRole.ADMIN;
}

/**
 * Obtém a lista de IDs de empresas que o utilizador pode ver.
 * Se for ADMIN/MANAGER, retorna undefined (significa todas).
 */
export async function getAccessibleCompanyIds(userId: string): Promise<string[] | undefined> {
    const user = await db.user.findUnique({
        where: { id: userId },
        include: { empresas: { select: { id: true } } }
    });

    if (!user) return [];

    if (user.role === UserRole.ADMIN || user.role === UserRole.MANAGER) {
        return undefined; // All access
    }

    return user.empresas.map(e => e.id);
}
