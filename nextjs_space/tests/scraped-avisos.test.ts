import test from 'node:test';
import assert from 'node:assert/strict';

import {
  loadScrapedAvisos,
  normalizeScrapedAviso,
  type ScrapedAvisoRecord,
} from '@/lib/scraped-avisos';

const sampleRecord: ScrapedAvisoRecord = {
  id: 'PT2030_001',
  titulo: 'Apoio à Transição Digital das PME',
  descricao: 'Aviso de concurso para apoio à transformação digital.',
  fonte: 'Portugal 2030',
  data_abertura: '2024-11-01',
  data_fecho: '2025-02-28',
  montante_min: '10000',
  montante_max: '500000',
  taxa_apoio: '75',
  regiao: 'Nacional',
  setor: 'Tecnologia',
  url: 'https://portugal2030.pt/avisos/transicao-digital-pme',
  status: 'Aberto',
  tipo_beneficiario: 'PME',
};

test('normalizeScrapedAviso maps a scraped record into aviso fields', () => {
  const aviso = normalizeScrapedAviso(sampleRecord, {
    refreshExpiredOpenDates: false,
    now: new Date('2026-04-08T00:00:00Z'),
  });

  assert.equal(aviso.codigo, 'PT2030_001');
  assert.equal(aviso.nome, 'Apoio à Transição Digital das PME');
  assert.equal(aviso.portal, 'PORTUGAL2030');
  assert.equal(aviso.programa, 'Portugal 2030');
  assert.equal(aviso.taxa, '75%');
  assert.deepEqual(aviso.setoresElegiveis, ['Tecnologia']);
  assert.deepEqual(aviso.dimensaoEmpresa, ['MICRO', 'PEQUENA', 'MEDIA']);
});

test('normalizeScrapedAviso can refresh stale fixture dates into an active window', () => {
  const aviso = normalizeScrapedAviso(sampleRecord, {
    refreshExpiredOpenDates: true,
    now: new Date('2026-04-08T00:00:00Z'),
  });

  assert.ok(aviso.dataInicioSubmissao <= new Date('2026-04-08T00:00:00Z'));
  assert.ok(aviso.dataFimSubmissao > new Date('2026-04-08T00:00:00Z'));
  assert.equal(aviso.ativo, true);
});

test('normalizeScrapedAviso handles European number format for montantes', () => {
  const euroRecord: ScrapedAvisoRecord = {
    ...sampleRecord,
    montante_min: '50.000,00',
    montante_max: '1.500.000',
  };

  const aviso = normalizeScrapedAviso(euroRecord, {
    refreshExpiredOpenDates: false,
    now: new Date('2026-04-08T00:00:00Z'),
  });

  assert.equal(aviso.montanteMinimo, 50000);
  assert.equal(aviso.montanteMaximo, 1500000);
});

test('loadScrapedAvisos loads and normalizes records from the scraped fixture directory', () => {
  const avisos = loadScrapedAvisos({
    dataDir: 'data/scraped',
    now: new Date('2026-04-08T00:00:00Z'),
    refreshExpiredOpenDates: true,
  });

  assert.ok(avisos.length >= 10);
  assert.ok(avisos.some((aviso) => aviso.portal === 'PORTUGAL2030'));
  assert.ok(avisos.some((aviso) => aviso.portal === 'PAPAC'));
  assert.ok(avisos.some((aviso) => aviso.portal === 'PRR'));
});
