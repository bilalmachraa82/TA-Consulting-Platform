/**
 * Testes do matching setorial dos hubs (fase B) — inclui a REGRESSÃO do
 * falso-positivo: "restauración" (ES, restauro ecológico) batia no termo
 * 'restaura' de turismo (restauração/restaurantes).
 */
import { describe, it, expect } from 'vitest';
import { SETORES, setorPorSlug, avisoPertenceAoSetor, avisoServeRegiao } from '@/lib/setores';

const turismo = setorPorSlug('turismo')!;

describe('avisoPertenceAoSetor', () => {
    it('avisos de turismo reais batem', () => {
        expect(avisoPertenceAoSetor({ nome: 'Programa "O Turismo Acolhe" - até 30 set 2026' }, turismo)).toBe(true);
        expect(avisoPertenceAoSetor({ nome: 'Apoio à hotelaria do interior' }, turismo)).toBe(true);
        expect(avisoPertenceAoSetor({ nome: 'Modernização de restaurantes', descricao: 'restauração e similares' }, turismo)).toBe(true);
    });

    it('REGRESSÃO: "restauración" ecológica (ES) NÃO bate em turismo', () => {
        expect(avisoPertenceAoSetor({
            nome: 'Alternativas de base biológica SSbD para productos fertilizantes',
            descricao: 'reducir la contaminación del suelo y mejorar la restauración de ecosistemas',
        }, turismo)).toBe(false);
    });

    it('setoresElegiveis também conta para o match', () => {
        expect(avisoPertenceAoSetor({ nome: 'Aviso genérico', setoresElegiveis: ['Turismo'] }, turismo)).toBe(true);
    });

    it('12 setores definidos com labels', () => {
        expect(SETORES).toHaveLength(12);
        for (const s of SETORES) expect(s.label.length).toBeGreaterThan(2);
    });
});

describe('avisoServeRegiao', () => {
    it('nacional serve todas; continental exclui ilhas', () => {
        expect(avisoServeRegiao({ abrangenciaGeografica: 'NACIONAL' }, 'Açores')).toBe(true);
        expect(avisoServeRegiao({ abrangenciaGeografica: 'CONTINENTAL' }, 'Açores')).toBe(false);
        expect(avisoServeRegiao({ abrangenciaGeografica: 'CONTINENTAL' }, 'Norte')).toBe(true);
    });
    it('NUTS2 específica bate na região certa e só nela', () => {
        expect(avisoServeRegiao({ regiaoNUTS2: 'Norte' }, 'Norte')).toBe(true);
        expect(avisoServeRegiao({ regiaoNUTS2: 'Norte' }, 'Algarve')).toBe(false);
    });
    it('nutsCompativeis também conta', () => {
        expect(avisoServeRegiao({ nutsCompativeis: ['Centro', 'Alentejo'] }, 'Alentejo')).toBe(true);
    });
});
