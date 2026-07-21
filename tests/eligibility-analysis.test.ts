import { describe, it, expect } from 'vitest';
import { analisarElegibilidade, type EmpresaElegivel, type AvisoElegivel } from '@/lib/eligibility-analysis';

const NOW = new Date('2026-07-21T12:00:00Z');
const futuro = new Date('2026-10-01T12:00:00Z');

const empresaPME: EmpresaElegivel = { cae: '62010', setor: 'Software', dimensao: 'PEQUENA', regiao: 'Norte', nut: 'Norte' };

describe('analisarElegibilidade — gap analysis explicável', () => {
    it('empresa que cumpre tudo → elegível, score alto, sem falhas', () => {
        const aviso: AvisoElegivel = {
            nome: 'Apoio à digitalização de PME',
            dataFimSubmissao: futuro,
            caeElegiveis: [62, 63],
            tiposBeneficiarios: ['EMPRESAS'],
            regiaoNUTS2: 'Norte',
            dimensaoEmpresa: ['MICRO', 'PEQUENA', 'MEDIA'],
        };
        const r = analisarElegibilidade(empresaPME, aviso, NOW);
        expect(r.veredicto).toBe('elegivel');
        expect(r.score).toBe(100);
        expect(r.criterios.every((c) => c.estado === 'ok')).toBe(true);
    });

    it('CAE fora da lista → falha explícita e veredicto negativo', () => {
        const aviso: AvisoElegivel = {
            nome: 'Apoio à agricultura',
            dataFimSubmissao: futuro,
            caeElegiveis: [1, 2, 3], // agricultura
            tiposBeneficiarios: ['EMPRESAS'],
        };
        const r = analisarElegibilidade(empresaPME, aviso, NOW);
        expect(r.veredicto).toBe('provavelmente_nao');
        const cae = r.criterios.find((c) => c.dimensao.startsWith('CAE'))!;
        expect(cae.estado).toBe('falha');
        expect(cae.explicacao).toContain('62010');
    });

    it('aviso sem critérios estruturados → dados_insuficientes (não inventa)', () => {
        const aviso: AvisoElegivel = { nome: 'Aviso genérico', descricao: 'texto solto', dataFimSubmissao: futuro };
        const r = analisarElegibilidade(empresaPME, aviso, NOW);
        expect(r.veredicto).toBe('dados_insuficientes');
        // critérios sem dados ficam "desconhecido", não "falha"
        expect(r.criterios.filter((c) => c.estado === 'falha')).toHaveLength(0);
    });

    it('desconhecido não penaliza: só CAE avaliável e cumprido → elegível', () => {
        const aviso: AvisoElegivel = { nome: 'X', dataFimSubmissao: futuro, caeElegiveis: [62] };
        const r = analisarElegibilidade(empresaPME, aviso, NOW);
        // beneficiário/região/dimensão desconhecidos, prazo ok, CAE ok
        expect(r.veredicto).toBe('elegivel');
        const desconhecidos = r.criterios.filter((c) => c.estado === 'desconhecido');
        expect(desconhecidos.length).toBeGreaterThanOrEqual(3);
    });

    it('beneficiário sem empresas → falha', () => {
        const aviso: AvisoElegivel = {
            nome: 'Apoio a autarquias', dataFimSubmissao: futuro,
            tiposBeneficiarios: ['AUTARQUIAS', 'IPSS'],
        };
        const r = analisarElegibilidade(empresaPME, aviso, NOW);
        const ben = r.criterios.find((c) => c.dimensao.includes('beneficiário'))!;
        expect(ben.estado).toBe('falha');
    });

    it('prazo expirado → falha no prazo', () => {
        const aviso: AvisoElegivel = { nome: 'X', dataFimSubmissao: new Date('2026-01-01'), caeElegiveis: [62] };
        const r = analisarElegibilidade(empresaPME, aviso, NOW);
        const prazo = r.criterios.find((c) => c.dimensao.includes('Prazo'))!;
        expect(prazo.estado).toBe('falha');
    });

    it('CAE por prefixo: empresa 62010 cumpre aviso que lista divisão 62', () => {
        const aviso: AvisoElegivel = { nome: 'X', dataFimSubmissao: futuro, caeElegiveis: [62] };
        const cae = analisarElegibilidade(empresaPME, aviso, NOW).criterios.find((c) => c.dimensao.startsWith('CAE'))!;
        expect(cae.estado).toBe('ok');
    });

    it('empresa Grande em aviso PME-orientado (texto) → atenção, não falha', () => {
        const grande: EmpresaElegivel = { ...empresaPME, dimensao: 'GRANDE' };
        const aviso: AvisoElegivel = { nome: 'Apoio PME inovação', descricao: 'para PME', dataFimSubmissao: futuro, caeElegiveis: [62] };
        const r = analisarElegibilidade(grande, aviso, NOW);
        const dim = r.criterios.find((c) => c.dimensao.includes('Dimensão'))!;
        expect(dim.estado).toBe('atencao');
        expect(r.veredicto).toBe('elegivel_com_reservas');
    });
});
