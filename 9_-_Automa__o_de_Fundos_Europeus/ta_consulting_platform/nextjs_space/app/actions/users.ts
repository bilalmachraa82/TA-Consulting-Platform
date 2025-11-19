'use server'

import { db } from '@/lib/db';
import { UserRole } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function updateUserRole(userId: string, role: UserRole) {
    try {
        await db.user.update({
            where: { id: userId },
            data: { role }
        });
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        console.error('Failed to update role:', error);
        return { success: false, error: 'Failed to update role' };
    }
}

export async function assignCompanyToUser(userId: string, companyId: string) {
    try {
        await db.user.update({
            where: { id: userId },
            data: {
                empresas: {
                    connect: { id: companyId }
                }
            }
        });
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        console.error('Failed to assign company:', error);
        return { success: false, error: 'Failed to assign company' };
    }
}

export async function removeCompanyFromUser(userId: string, companyId: string) {
    try {
        await db.user.update({
            where: { id: userId },
            data: {
                empresas: {
                    disconnect: { id: companyId }
                }
            }
        });
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        console.error('Failed to remove company:', error);
        return { success: false, error: 'Failed to remove company' };
    }
}
