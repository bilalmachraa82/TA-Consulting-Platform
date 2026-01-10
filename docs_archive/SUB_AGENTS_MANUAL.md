# Sub-Agents Manual

## Visão Geral

Este projecto integra **12 sub-agentes especializados** do [sub-agents.directory](https://www.sub-agents.directory/agents) para maximizar produtividade no desenvolvimento.

## Agentes Disponíveis

### Tier 1 — Core Development

| Agente | Emoji | Slash Command | Quando Usar |
|--------|-------|---------------|-------------|
| LLM Architect | 🏗️ | `/llm-architect` | RAG, embeddings, Gemini, model selection |
| Prompt Engineer | ✍️ | `/prompt-engineer` | System prompts, CoT, few-shot, optimization |
| TypeScript Expert | 📘 | `/typescript-expert` | Types, generics, strict mode, inference |
| QA Expert | 🧪 | `/qa-expert` | Testing, coverage, automation, defects |
| Search Specialist | 🔍 | `/search-specialist` | Code search, grep, queries, retrieval |
| Data Engineer | 🔧 | `/data-engineer` | Pipelines, ETL, scraping, data quality |

### Tier 2 — Especialistas Adicionais (Futuro)

| Agente | Emoji | Slash Command | Quando Usar |
|--------|-------|---------------|-------------|
| Security Auditor | 🔒 | `/security-auditor` | Auth, OWASP, vulnerabilities |
| API Designer | 🌐 | `/api-designer` | REST, endpoints, OpenAPI |
| Backend Developer | ⚙️ | `/backend-developer` | Node, Prisma, database |
| Frontend Developer | 🎨 | `/frontend-developer` | React, UI, components |
| Business Analyst | 📊 | `/business-analyst` | Requirements, metrics |
| Technical Writer | 📝 | `/technical-writer` | Documentation, guides |

---

## Como Usar

### 1. Invocação Directa (Slash Command)

```
/llm-architect - analisa a arquitectura RAG actual
```

### 2. Routing Automático

O sistema detecta keywords no pedido e sugere o agente adequado:

```
"O RAG não está a retornar resultados relevantes"
→ Sugestão: 🏗️ LLM Architect
```

### 3. Multi-Agent Council

Para problemas complexos que beneficiam de múltiplas perspectivas:

```
/full-council - debate sobre migração de stack
```

---

## Regras de Selecção

### Mapa de Keywords

| Keywords | Agente |
|----------|--------|
| RAG, embeddings, vector, LLM, Gemini, OpenAI | 🏗️ LLM Architect |
| prompt, CoT, few-shot, system prompt | ✍️ Prompt Engineer |
| types, TypeScript, generic, tsconfig | 📘 TypeScript Expert |
| test, coverage, QA, vitest, playwright | 🧪 QA Expert |
| search, query, grep, find | 🔍 Search Specialist |
| pipeline, ETL, scraping, normalizer | 🔧 Data Engineer |

### Quando Usar Multi-Agent

- Decisões arquitectónicas complexas
- Trade-offs com múltiplas dimensões
- Refactoring de grande escala
- Validação de abordagens críticas

---

## Ficheiros de Implementação

### Workflows (IDE)

```
.agent/workflows/
├── sub-agent-router.md      # Router principal
├── llm-architect.md         # 🏗️
├── prompt-engineer.md       # ✍️
├── typescript-expert.md     # 📘
├── qa-expert.md             # 🧪
├── search-specialist.md     # 🔍
├── data-engineer.md         # 🔧
└── full-council.md          # 🎯 Multi-agent
```

### Código (Platform)

```
lib/council/agents/
├── base-agent.ts            # Classe base
├── index.ts                 # Factory + exports
└── specialized-agents.ts    # 6 agentes Tier 1
```

---

## Exemplos Práticos

### Exemplo 1: Problema de RAG

```
Pedido: "O chunking não está optimizado para os nossos PDFs"

→ Agente: 🏗️ LLM Architect
→ Análise: Revisar estratégia de chunking, metadata, overlap
→ Output: Proposta de nova configuração
```

### Exemplo 2: Problema de Types

```
Pedido: "Prisma não está a inferir os tipos correctamente"

→ Agente: 📘 TypeScript Expert
→ Análise: Verificar prisma generate, schema, imports
→ Output: Fix concreto com explicação
```

### Exemplo 3: Decisão Complexa

```
Pedido: "Devemos migrar de Gemini para OpenAI?"

→ Agente: 🎯 Full Council
→ Debate entre: LLM Architect, Prompt Engineer, Data Engineer
→ Output: Recomendação com trade-offs analisados
```

---

## Configuração

Os agentes estão configurados para:
- **Modelos**: Vários via OpenRouter (GPT-4o, Claude, Gemini)
- **Contexto**: Conhecimento do projecto TA Consulting
- **Outputs**: Português europeu, formato estruturado

## Manutenção

Para adicionar novos agentes:
1. Extrair prompt de [sub-agents.directory](https://www.sub-agents.directory/agents)
2. Criar workflow em `.agent/workflows/`
3. Adicionar classe em `lib/council/agents/`
4. Actualizar router e este manual
