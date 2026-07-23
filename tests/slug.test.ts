/**
 * Testes do gerador de slugs (fase B) — os edge cases do plano de testes:
 * acentos, & e _ dos códigos reais, colisões, entradas vazias, truncagem.
 */
import { describe, it, expect } from 'vitest';
import { slugify, gerarSlugAviso, slugUnico } from '@/lib/slug';

describe('slugify', () => {
    it('remove acentos e baixa a caixa', () => {
        expect(slugify('Inovação Produtiva à Medida')).toBe('inovacao-produtiva-a-medida');
    });
    it('sanitiza os caracteres hostis dos códigos reais (& _ /)', () => {
        expect(slugify('PT2030_I&D_2024')).toBe('pt2030-i-d-2024');
        expect(slugify('FA0090/2026')).toBe('fa0090-2026');
    });
    it('colapsa hífens e faz trim', () => {
        expect(slugify('--Aviso  —  Teste--')).toBe('aviso-teste');
    });
    it('string vazia → vazio', () => {
        expect(slugify('')).toBe('');
    });
});

describe('gerarSlugAviso', () => {
    it('combina nome truncado + código', () => {
        const s = gerarSlugAviso('SI Inovação Produtiva', 'PT2030_SI_INOVACAO_2024');
        expect(s).toBe('si-inovacao-produtiva-pt2030-si-inovacao-2024');
    });
    it('não duplica quando o nome já contém o código (HORIZON-*)', () => {
        const s = gerarSlugAviso('HORIZON-CL5-2026-D3-01 Clean Energy', 'HORIZON-CL5-2026-D3-01');
        expect(s).toBe('horizon-cl5-2026-d3-01-clean-energy');
    });
    it('trunca nomes longos SEM partir palavras', () => {
        const nome = 'Apoio à valorização de hidrogénio renovável e outros gases renováveis de origem biológica em processos industriais';
        const s = gerarSlugAviso(nome, 'FA123');
        expect(s!.length).toBeLessThanOrEqual(60 + 1 + 40);
        expect(s).not.toMatch(/-$/);
        expect(s!.endsWith('-fa123')).toBe(true);
    });
    it('sem nome → só código; sem ambos → null', () => {
        expect(gerarSlugAviso(null, 'FA0090/2026')).toBe('fa0090-2026');
        expect(gerarSlugAviso('', '')).toBeNull();
        expect(gerarSlugAviso(null, null)).toBeNull();
    });
});

describe('slugUnico', () => {
    it('devolve a base quando livre', () => {
        expect(slugUnico('aviso-x', new Set())).toBe('aviso-x');
    });
    it('sufixa -2, -3 em colisão (determinístico)', () => {
        const usados = new Set(['aviso-x', 'aviso-x-2']);
        expect(slugUnico('aviso-x', usados)).toBe('aviso-x-3');
    });
});
