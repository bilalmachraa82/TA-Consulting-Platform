# Benchmark V2: Modelos Gemini para Consultores

> **Data**: 2025-12-12
> **Avisos Reais**: 37 (PRR: 15, PEPAC: 7, Horizon: 15)
> **Perguntas**: 15

---

## 🏆 Ranking Final

| # | Modelo | Score | Precisão | Citações | Latência | Custo |
|---|--------|-------|----------|----------|----------|-------|
| 🥇 | **Gemini 2.5 Flash** | 67.9 | 51% | 53% | 3.1s | $0.027 |
| 🥈 | **Gemini 2.0 Flash** | 62.8 | 31% | 40% | 1.0s | $0.009 |
| 🥉 | **Gemini 2.5 Pro** | 32.8 | 17% | 7% | 8.6s | $0.100 |
|    | **Gemini 3.0 Pro** | 25.6 | 13% | 0% | 10.9s | $0.120 |

---

## 🎯 Recomendação para Consultores

**Modelo Recomendado: Gemini 2.5 Flash**

### Justificação:
- **Precisão**: 51% de keywords encontradas
- **Citações**: 53% das respostas citam fontes
- **Velocidade**: 3.1s por resposta
- **Custo**: $0.0274 por 15 queries

### Para Produção:
```typescript
const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { temperature: 0.1 }
});
```
