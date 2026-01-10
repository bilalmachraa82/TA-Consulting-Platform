# Benchmark Report - Modelos Gemini para RAG

> **Data**: 2025-12-12
> **Ficheiros de Teste**: 15
> **Perguntas Testadas**: 25

---

## Resumo de Métricas

| Modelo | Precisão | Citações | Alucinação | Latência | Custo |
|--------|----------|----------|------------|----------|-------|
| Gemini 2.5 Flash | 68.1% | 80.0% | 0.0% | 3376ms | $0.0585 |
| Gemini 2.5 Pro | 43.1% | 48.0% | 0.0% | 8811ms | $0.2296 |
| Gemini 2.0 Flash | 69.9% | 96.0% | 0.0% | 1493ms | $0.0186 |

---

## Recomendação

**Modelo Recomendado: Gemini 2.0 Flash** (Score: 86.1/100)

### Justificação:
- Precisão (keywords): 69.9%
- Taxa de citação: 96.0%
- Taxa de alucinação: 0.0%
- Latência média: 1493ms
- Custo estimado (25 queries): $0.0186

### Alternativa:
Gemini 2.5 Flash (Score: 81.1/100) - Mais preciso em alguns casos

---

## Detalhes por Modelo

### Gemini 2.5 Flash

| Pergunta | Score | Latência | Citação |
|----------|-------|----------|--------|
| prr-001 | ⚠️ 50% | 5320ms | ❌ |
| prr-002 | ⚠️ 50% | 2695ms | ✅ |
| prr-003 | ✅ 100% | 1925ms | ✅ |
| prr-004 | ❌ 33% | 2446ms | ✅ |
| prr-005 | ✅ 100% | 3158ms | ✅ |
| pt2030-001 | ⚠️ 60% | 2171ms | ✅ |
| pt2030-002 | ⚠️ 60% | 2800ms | ✅ |
| pt2030-003 | ✅ 100% | 3908ms | ✅ |
| pt2030-004 | ⚠️ 50% | 4177ms | ✅ |
| pt2030-005 | ✅ 100% | 3295ms | ✅ |

### Gemini 2.5 Pro

| Pergunta | Score | Latência | Citação |
|----------|-------|----------|--------|
| prr-001 | ❌ 0% | 10298ms | ❌ |
| prr-002 | ✅ 75% | 8744ms | ✅ |
| prr-003 | ✅ 100% | 8065ms | ✅ |
| prr-004 | ⚠️ 67% | 5293ms | ✅ |
| prr-005 | ✅ 100% | 9401ms | ❌ |
| pt2030-001 | ⚠️ 60% | 7937ms | ✅ |
| pt2030-002 | ✅ 100% | 7311ms | ✅ |
| pt2030-003 | ❌ 0% | 9300ms | ❌ |
| pt2030-004 | ❌ 0% | 9970ms | ❌ |
| pt2030-005 | ❌ 0% | 8834ms | ❌ |

### Gemini 2.0 Flash

| Pergunta | Score | Latência | Citação |
|----------|-------|----------|--------|
| prr-001 | ✅ 100% | 1548ms | ✅ |
| prr-002 | ⚠️ 50% | 1404ms | ✅ |
| prr-003 | ✅ 100% | 1373ms | ✅ |
| prr-004 | ❌ 33% | 1017ms | ✅ |
| prr-005 | ✅ 100% | 1316ms | ✅ |
| pt2030-001 | ⚠️ 60% | 1991ms | ✅ |
| pt2030-002 | ⚠️ 60% | 1041ms | ✅ |
| pt2030-003 | ✅ 100% | 1440ms | ✅ |
| pt2030-004 | ⚠️ 50% | 2092ms | ✅ |
| pt2030-005 | ✅ 100% | 1687ms | ✅ |
