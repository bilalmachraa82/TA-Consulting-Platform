
import { Lead } from '@prisma/client';

export interface DripEmail {
    id: string;
    delay: number; // milissegundos após conversão
    subject: string;
    template: string;
    condition: (lead: Lead) => boolean;
}

export const LEAD_NURTURING_SEQUENCE: DripEmail[] = [
    {
        id: 'welcome',
        delay: 0, // Imediato
        subject: '🎯 Os seus matches de fundos europeus - Eligivo',
        template: 'lead-welcome',
        condition: () => true,
    },
    {
        id: 'reminder-24h',
        delay: 24 * 60 * 60 * 1000, // 24 horas
        subject: '⏰ Estas oportunidades expiram em breve',
        template: 'lead-reminder',
        condition: (lead) => !lead.convertedAt, // Só se ainda não converteu (agendou/comprou)
    },
    {
        id: 'offer-72h',
        delay: 72 * 60 * 60 * 1000, // 72 horas
        subject: '🎁 Oferta exclusiva: Consultoria gratuita (30min)',
        template: 'lead-offer',
        condition: (lead) => !lead.convertedAt && (lead.scoreElegibilidade || 0) >= 50,
    },
    {
        id: 'educational-7d',
        delay: 7 * 24 * 60 * 60 * 1000, // 7 dias
        subject: '📚 Guia: Como maximizar a aprovação do seu projeto',
        template: 'lead-educational',
        condition: (lead) => !lead.convertedAt,
    },
];
