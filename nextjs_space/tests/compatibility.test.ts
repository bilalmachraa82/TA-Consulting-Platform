import test from 'node:test';
import assert from 'node:assert/strict';

import { calculateCompatibility } from '@/lib/compatibility';

test('calculateCompatibility returns a strong score for a good fit', () => {
  const result = calculateCompatibility(
    {
      setor: 'Tecnologia',
      dimensao: 'PEQUENA',
      regiao: 'Nacional',
    },
    {
      nome: 'Apoio à Transição Digital das PME',
      descrição: 'Programa para tecnologia, PME e transformação digital em âmbito nacional.',
      dataFimSubmissao: new Date('2026-06-30T00:00:00Z'),
      montanteMaximo: 500000,
    },
    new Date('2026-04-08T00:00:00Z')
  );

  assert.ok(result.score >= 60);
  assert.ok(result.razoes.length > 0);
});

test('calculateCompatibility treats MEDIA empresas as PME', () => {
  const result = calculateCompatibility(
    {
      setor: 'Tecnologia',
      dimensao: 'MEDIA',
      regiao: 'Nacional',
    },
    {
      nome: 'Apoio à Transição Digital das PME',
      descrição: 'Programa para tecnologia, PME e transformação digital em âmbito nacional.',
      dataFimSubmissao: new Date('2026-06-30T00:00:00Z'),
      montanteMaximo: 500000,
    },
    new Date('2026-04-08T00:00:00Z')
  );

  // MEDIA is a PME — should get full 20pts for dimension, not 5
  assert.ok(result.score >= 60);
  assert.ok(result.razoes.some((r) => r.includes('adequada')));
  assert.ok(!result.alertas.some((a) => a.includes('mais orientado para PMEs')));
});

test('calculateCompatibility returns zero for expired notices', () => {
  const result = calculateCompatibility(
    {
      setor: 'Tecnologia',
      dimensao: 'PEQUENA',
      regiao: 'Nacional',
    },
    {
      nome: 'Aviso expirado',
      descrição: 'Programa para tecnologia.',
      dataFimSubmissao: new Date('2026-03-01T00:00:00Z'),
      montanteMaximo: 100000,
    },
    new Date('2026-04-08T00:00:00Z')
  );

  assert.equal(result.score, 0);
  assert.ok(result.alertas.some((alerta) => alerta.includes('Prazo expirado')));
});
