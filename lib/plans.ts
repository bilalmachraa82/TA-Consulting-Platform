import { PLANS } from './stripe';
import { prisma } from './db';

export type PlanType = 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';

export const PLAN_LEVELS: Record<PlanType, number> = {
    FREE: 0,
    STARTER: 1,
    PRO: 2,
    ENTERPRISE: 3,
};

/**
 * Verifica se um user pode aceder a uma feature baseada no nível do plano
 */
export function canAccessFeature(userPlan: string | undefined | null, requiredPlan: PlanType): boolean {
    const currentLevel = PLAN_LEVELS[(userPlan?.toUpperCase() as PlanType) || 'FREE'] || 0;
    const requiredLevel = PLAN_LEVELS[requiredPlan];
    return currentLevel >= requiredLevel;
}

/**
 * Verifica limites de uso (ex: número de avisos vistos, gerações IA)
 * Retorna true se ainda tem quota.
 */
export async function checkUsageLimit(userId: string, metric: 'avisos_view' | 'ai_generation'): Promise<boolean> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { plan: true }
    });

    const planKey = (user?.plan?.toUpperCase() as PlanType) || 'FREE';
    const plan = PLANS[planKey];

    if (!plan) return false;

    // Se limite é -1, é ilimitado
    // Nota: Precisamos mapear 'metric' para a key correta em PLANS.limits
    // PLANS.limits = { avisos: number, chat: number, empresas: number }

    if (metric === 'avisos_view') {
        const limit = plan.limits.avisos;
        if (limit === -1) return true;

        // Contar uso este mês (Exemplo simplificado - idealmente teríamos tabela de UsageLogs)
        // Por agora, assumimos que FREE tem limite fixo hardcoded na UI/API para simplificar sem nova tabela
        return true;
    }

    if (metric === 'ai_generation') {
        // AI Writer é feature PRO+
        // Se for FREE ou STARTER, verificar se tem créditos (futuro)
        // Por agora, bloqueia se não for pelo menos STARTER (que tem chat ilimitado)
        const limit = plan.limits.chat;
        if (limit === -1) return true;

        // Se tem limite numérico, teríamos de contar.
        // Como a lógica atual é "Básico com IA" vs "Ilimitado", 
        // vamos assumir que FREE tem acesso muito restrito ou zero ao Writer
        return canAccessFeature(planKey, 'STARTER');
    }

    return false;
}
