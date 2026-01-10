---
description: Router automático que detecta keywords e invoca o sub-agente especializado correcto
---

# Sub-Agent Router

Sistema de routing automático para seleccionar o agente especializado mais adequado ao pedido.

## Como Funciona

1. Analisa as **keywords** no pedido do utilizador
2. Mapeia para o **agente especializado** mais relevante
3. Invoca o agente com o contexto apropriado

## Mapa de Keywords → Agentes

| Keywords | Agente | Slash Command |
|----------|--------|---------------|
| RAG, embeddings, vector, LLM, Gemini, OpenAI, model, inference, context window | 🏗️ LLM Architect | `/llm-architect` |
| prompt, CoT, chain-of-thought, few-shot, system prompt, template | ✍️ Prompt Engineer | `/prompt-engineer` |
| types, TypeScript, generic, inference, strict, tsconfig | 📘 TypeScript Expert | `/typescript-expert` |
| test, coverage, QA, defect, automation, vitest, playwright | 🧪 QA Expert | `/qa-expert` |
| search, query, retrieval, find, grep, locate | 🔍 Search Specialist | `/search-specialist` |
| pipeline, ETL, data quality, scraping, normalizer, dedupe | 🔧 Data Engineer | `/data-engineer` |
| security, auth, vulnerability, OWASP, XSS, CSRF, injection | 🔒 Security Auditor | `/security-auditor` |
| API, endpoint, REST, OpenAPI, route, handler | 🌐 API Designer | `/api-designer` |
| complex, multiple concerns, architecture decision | 🎯 Full Council | `/full-council` |

## Regras de Decisão

### Prioridade de Matching

1. **Exact match** — keyword exacta encontrada
2. **Semantic match** — contexto indica área específica
3. **Default** — se incerto, perguntar ao utilizador

### Quando Usar Multi-Agent (Full Council)

Usar `/full-council` quando o pedido envolve:
- Múltiplas áreas de expertise (ex: "optimizar RAG + garantir type safety")
- Decisões arquitectónicas complexas
- Trade-offs que precisam de debate

## Exemplo de Uso

```
Pedido: "Preciso de melhorar o sistema RAG para ter melhor retrieval"
→ Keywords detectadas: RAG, retrieval
→ Agente: 🏗️ LLM Architect
→ Invocar: /llm-architect
```

```
Pedido: "Os types do Prisma estão a dar problemas"
→ Keywords detectadas: types, Prisma
→ Agente: 📘 TypeScript Expert
→ Invocar: /typescript-expert
```

```
Pedido: "Precisamos de redesenhar a API e garantir segurança"
→ Keywords detectadas: API, segurança (múltiplas áreas)
→ Agente: 🎯 Full Council (API Designer + Security Auditor)
→ Invocar: /full-council
```

## Integração com Antigravity

Este router é consultado automaticamente pelo IDE para sugerir o agente mais adequado. O utilizador pode sempre:
1. Aceitar a sugestão
2. Escolher manualmente outro agente
3. Pedir debate multi-agente
