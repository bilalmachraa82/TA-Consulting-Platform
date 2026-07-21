import { describe, it, expect } from 'vitest';
import { coerceExtraction, htmlToText, buildUpdateData } from '@/lib/enrichment';

const NOW = new Date('2026-07-20T12:00:00Z');

const validRaw = {
    descricao: 'Apoio à digitalização de PME do setor industrial, cobrindo investimentos em software, hardware e formação. Taxa de cofinanciamento até 75%.',
    dataInicioSubmissao: '2026-08-01',
    dataFimSubmissao: '2026-10-31',
    tiposBeneficiarios: ['EMPRESAS'],
    caeElegiveis: [10, 62],
    regiaoNUTS2: 'Norte',
    abrangenciaGeografica: 'NACIONAL',
    montanteMinimo: 5000,
    montanteMaximo: 200000,
    taxaCofinanciamentoMax: 75,
    tipoApoio: 'SUBSIDIO',
};

describe('coerceExtraction', () => {
    it('aceita uma extração válida completa e conta os campos', () => {
        const result = coerceExtraction(validRaw);
        expect(result).not.toBeNull();
        expect(result!.data.tipoApoio).toBe('SUBSIDIO');
        expect(result!.fieldCount).toBe(11);
    });

    it('extrai dimensaoEmpresa válida e conta-a; descarta valores inventados', () => {
        const comDim = coerceExtraction({ ...validRaw, dimensaoEmpresa: ['MICRO', 'PEQUENA', 'MEDIA'] });
        expect(comDim!.data.dimensaoEmpresa).toEqual(['MICRO', 'PEQUENA', 'MEDIA']);
        expect(comDim!.fieldCount).toBe(12); // 11 + dimensaoEmpresa preenchida
        const update = buildUpdateData(comDim!, { descricao: null, dataFimSubmissao: new Date('2026-10-31') }, { allowDates: false });
        expect(update.dimensaoEmpresa).toEqual(['MICRO', 'PEQUENA', 'MEDIA']);
        // valores fora do enum são descartados sem rebentar
        const invent = coerceExtraction({ ...validRaw, dimensaoEmpresa: ['GIGANTE'] });
        expect(invent!.data.dimensaoEmpresa).toEqual([]);
    });

    it('descarta enums inventados pelo modelo sem rebentar', () => {
        const result = coerceExtraction({
            ...validRaw,
            tipoApoio: 'DONATIVO_MAGICO',
            tiposBeneficiarios: ['EMPRESAS', 'UNICORNIOS'],
            abrangenciaGeografica: 'GALACTICA',
        });
        expect(result).not.toBeNull();
        expect(result!.data.tipoApoio).toBeNull();
        expect(result!.data.tiposBeneficiarios).toEqual([]);
        expect(result!.data.abrangenciaGeografica).toBeNull();
    });

    it('descarta datas implausíveis e pares fim<início', () => {
        const foraIntervalo = coerceExtraction({ ...validRaw, dataFimSubmissao: '1999-01-01' });
        expect(foraIntervalo!.data.dataFimSubmissao).toBeNull();

        const invertido = coerceExtraction({
            ...validRaw,
            dataInicioSubmissao: '2026-10-31',
            dataFimSubmissao: '2026-08-01',
        });
        expect(invertido!.data.dataInicioSubmissao).toBeNull();
        expect(invertido!.data.dataFimSubmissao).toBeNull();
    });

    it('descarta montantes com min > max', () => {
        const result = coerceExtraction({ ...validRaw, montanteMinimo: 999999, montanteMaximo: 100 });
        expect(result!.data.montanteMinimo).toBeNull();
        expect(result!.data.montanteMaximo).toBeNull();
    });

    it('devolve null para output que nem é um objeto', () => {
        expect(coerceExtraction('lixo')).toBeNull();
        expect(coerceExtraction(null)).toBeNull();
    });
});

describe('htmlToText', () => {
    it('remove scripts, styles e tags, e colapsa espaços', () => {
        const html = '<html><script>alert(1)</script><style>.x{}</style><body><h1>Aviso</h1> <p>Texto &amp; mais</p></body></html>';
        expect(htmlToText(html)).toBe('Aviso Texto & mais');
    });

    it('corta ao limite de caracteres', () => {
        expect(htmlToText('<p>' + 'a'.repeat(20000) + '</p>', 100).length).toBe(100);
    });
});

describe('buildUpdateData — política de merge', () => {
    const extraction = coerceExtraction(validRaw)!;

    it('escreve descricao quando a atual é curta, preserva quando é longa', () => {
        const semDescricao = buildUpdateData(extraction, { descricao: null, dataFimSubmissao: new Date('2026-12-01') }, { allowDates: false, now: NOW });
        expect(semDescricao.descricao).toBe(validRaw.descricao);

        const comDescricao = buildUpdateData(
            extraction,
            { descricao: 'x'.repeat(300), dataFimSubmissao: new Date('2026-12-01') },
            { allowDates: false, now: NOW },
        );
        expect(comDescricao.descricao).toBeUndefined();
    });

    it('nunca escreve datas sem allowDates', () => {
        const update = buildUpdateData(extraction, { descricao: null, dataFimSubmissao: new Date('2020-01-01') }, { allowDates: false, now: NOW });
        expect(update.dataFimSubmissao).toBeUndefined();
    });

    it('com allowDates, só preenche quando o prazo atual está no passado e o novo é futuro', () => {
        // prazo atual no passado (fallback FA) + LLM encontrou prazo futuro → escreve
        const recupera = buildUpdateData(extraction, { descricao: null, dataFimSubmissao: new Date('2026-07-20T11:00:00Z') }, { allowDates: true, now: NOW });
        expect(recupera.dataFimSubmissao).toEqual(new Date('2026-10-31'));
        expect(recupera.dataInicioSubmissao).toEqual(new Date('2026-08-01'));

        // prazo atual futuro (scraper sabe melhor) → NUNCA sobrescreve
        const preserva = buildUpdateData(extraction, { descricao: null, dataFimSubmissao: new Date('2026-12-01') }, { allowDates: true, now: NOW });
        expect(preserva.dataFimSubmissao).toBeUndefined();
    });

    it('só inclui campos com informação (sem nulls a sujar o update)', () => {
        const vazio = coerceExtraction({
            descricao: null, dataInicioSubmissao: null, dataFimSubmissao: null,
            tiposBeneficiarios: [], caeElegiveis: [], regiaoNUTS2: null,
            abrangenciaGeografica: null, montanteMinimo: null, montanteMaximo: null,
            taxaCofinanciamentoMax: null, tipoApoio: null,
        })!;
        const update = buildUpdateData(vazio, { descricao: 'x'.repeat(300), dataFimSubmissao: new Date('2026-12-01') }, { allowDates: true, now: NOW });
        expect(Object.keys(update)).toEqual([]);
    });
});
