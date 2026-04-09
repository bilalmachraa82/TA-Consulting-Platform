import test from 'node:test';
import assert from 'node:assert/strict';

import { extractJsonObject } from '@/lib/claude-direct';
import { normalizeCaseBriefPayload, buildFallbackCaseBrief } from '@/lib/briefs';
import { calculateCompatibility } from '@/lib/compatibility';

test('extractJsonObject parses fenced JSON returned by Claude', () => {
  const result = extractJsonObject<{
    titulo: string;
    recomendacao: string;
  }>(`Aqui tens o resultado:\n\n\`\`\`json\n{\"titulo\":\"Brief\",\"recomendacao\":\"Avançar\"}\n\`\`\``);

  assert.equal(result.titulo, 'Brief');
  assert.equal(result.recomendacao, 'Avançar');
});

test('extractJsonObject parses plain JSON without fences', () => {
  const result = extractJsonObject<{ a: number }>('{"a":42}');
  assert.equal(result.a, 42);
});

test('extractJsonObject throws on text with no JSON', () => {
  assert.throws(() => extractJsonObject('I cannot help with that'), { name: 'SyntaxError' });
});

test('normalizeCaseBriefPayload never accepts LLM score override', () => {
  const analise = calculateCompatibility(
    { setor: 'Tecnologia', dimensao: 'PEQUENA', regiao: 'Nacional' },
    { nome: 'Teste', descrição: 'teste', dataFimSubmissao: new Date('2026-06-30'), montanteMaximo: 100000 },
    new Date('2026-04-08')
  );

  const fallback = buildFallbackCaseBrief(
    { nome: 'Empresa X' },
    { nome: 'Aviso Y', portal: 'PORTUGAL2030', dataInicioSubmissao: new Date(), dataFimSubmissao: new Date('2026-06-30') },
    analise
  );

  // Simulate LLM returning a different score
  const llmPayload = {
    titulo: 'Brief gerado',
    elegibilidade: { score: 99, prioridade: 'alta' as const, razoes: ['inventada'], alertas: [] },
    recomendacao: 'Avançar já',
  };

  const result = normalizeCaseBriefPayload(llmPayload, fallback);

  // Score and prioridade must ALWAYS come from the deterministic fallback
  assert.equal(result.elegibilidade.score, fallback.elegibilidade.score);
  assert.equal(result.elegibilidade.prioridade, fallback.elegibilidade.prioridade);
  // But other fields can come from LLM
  assert.equal(result.titulo, 'Brief gerado');
  assert.equal(result.recomendacao, 'Avançar já');
});
