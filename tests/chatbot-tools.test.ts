import { describe, it, expect } from 'vitest';
import { searchAvisosParams, buildAvisosWhere, MAX_RESULTADOS } from '@/lib/chatbot/tools';

const NOW = new Date('2026-07-20T12:00:00Z');

describe('searchAvisosParams — validação da fronteira', () => {
    it('aplica defaults (apenasAbertos, limite)', () => {
        const p = searchAvisosParams.parse({});
        expect(p.apenasAbertos).toBe(true);
        expect(p.limite).toBe(10);
    });

    it('faz clamp de limite e prazoAteDias aos máximos duros (não rejeita)', () => {
        expect(searchAvisosParams.parse({ limite: 500 }).limite).toBe(MAX_RESULTADOS);
        expect(searchAvisosParams.parse({ limite: MAX_RESULTADOS + 1 }).limite).toBe(MAX_RESULTADOS);
        expect(searchAvisosParams.parse({ prazoAteDias: 9999 }).prazoAteDias).toBe(730);
        expect(() => searchAvisosParams.parse({ limite: 0 })).toThrow();
    });

    it('rejeita portal inventado e texto demasiado longo', () => {
        expect(() => searchAvisosParams.parse({ portal: 'PORTAL_MAGICO' })).toThrow();
        expect(() => searchAvisosParams.parse({ texto: 'x'.repeat(300) })).toThrow();
    });

    it('rejeita tipos errados (injeção de objetos)', () => {
        expect(() => searchAvisosParams.parse({ texto: { $ne: null } })).toThrow();
        expect(() => searchAvisosParams.parse({ prazoAteDias: 'DROP TABLE' })).toThrow();
    });
});

describe('buildAvisosWhere — tradução para Prisma', () => {
    it('apenasAbertos filtra por prazo futuro', () => {
        const where = buildAvisosWhere(searchAvisosParams.parse({}), NOW);
        expect(where.dataFimSubmissao).toEqual({ gte: NOW });
    });

    it('prazoAteDias cria janela [agora, agora+N dias]', () => {
        const where = buildAvisosWhere(searchAvisosParams.parse({ prazoAteDias: 30 }), NOW);
        const fim = (where.dataFimSubmissao as { gte: Date; lte: Date });
        expect(fim.gte).toEqual(NOW);
        expect(fim.lte.toISOString().slice(0, 10)).toBe('2026-08-19');
    });

    it('texto tokeniza com prefixos PT: cada termo AND, campos OR', () => {
        const where = buildAvisosWhere(searchAvisosParams.parse({ texto: 'digitalização PME' }), NOW);
        const and = where.AND as Array<{ OR: unknown[] }>;
        expect(and).toHaveLength(2);
        // "digitalização" → prefixo "digital" (apanha digital/digitalizar/digitalização)
        expect(and[0].OR[0]).toEqual({ nome: { contains: 'digital', mode: 'insensitive' } });
        expect(and[1].OR[0]).toEqual({ nome: { contains: 'PME', mode: 'insensitive' } });
        expect(and[0].OR).toHaveLength(3);
    });

    it('texto ignora palavras curtas e limita a 5 termos', () => {
        const where = buildAvisosWhere(searchAvisosParams.parse({ texto: 'a de um dois três quatro cinco seis sete' }), NOW);
        const and = where.AND as unknown[];
        expect(and.length).toBeLessThanOrEqual(5);
    });

    it('combina portal + montante + região', () => {
        const where = buildAvisosWhere(
            searchAvisosParams.parse({ portal: 'PRR', montanteMaximoMinimo: 50000, regiaoNUTS2: 'norte' }),
            NOW,
        );
        expect(where.portal).toBe('PRR');
        expect(where.montanteMaximo).toEqual({ gte: 50000 });
        expect(where.regiaoNUTS2).toEqual({ contains: 'norte', mode: 'insensitive' });
    });
});
