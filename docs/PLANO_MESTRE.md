# Plano Mestre — TA Consulting Platform

## Contexto

O projeto tem uma visão clara e documentada (PRD_V2_Fernando_Detailed.md): evoluir de "ferramenta RAG" para um **Sistema Operativo de Consultoria** — scraping diário de 6+ portais de fundos, matchmaking 0–100 contra as ~24.000 empresas do Bitrix, funil conversacional de leads, e um **AI Technical Writer** que redige memórias descritivas no estilo da TA Consulting (RAG sobre 291 candidaturas históricas). O PRD marca a Fase 1 como feita e o AI Writer como "Fase 2 imediata".

Porém, a revisão do código revelou dívida crítica que bloqueia produção: **auth em "demo mode"** em ~11 páginas (sessões mock, guards comentados — `DEMO_MODE_CHANGES.md`), **chaves de API vazadas no histórico git** (OpenRouter em `be43e82`; DEMO_TEST_REPORT.md flags Stripe etc.), **3 implementações paralelas de scraping** com portais partidos (IPDJ = 0, Horizon Europe = 0, seriam +400 avisos), rotas API duplicadas, e muito cruft. Este plano sequencia: estabilizar → AI Writer → scraping → hardening. Cada PR mantém o CI verde (lint, vitest, tsc, build, E2E vs pgvector/pg16) e é dimensionado para uma sessão.

---

## Fase 0 — Estabilizar & Segurança (production-ready)

### PR 0.1 — Reativar autenticação de forma consistente
Nota: `middleware.ts` JÁ protege `/dashboard/*` e `/api/{candidaturas,empresas,documentos}/*` (commit 9968b73); a dívida restante é page-level.
- Criar `lib/auth-guard.ts` com helper único `requireSession()` (`getServerSession(authOptions)` + `redirect('/auth/login')`) em vez de repetir o guard 11×.
- Aplicar em todos os ficheiros de `DEMO_MODE_CHANGES.md`: `app/dashboard/layout.tsx`, `app/dashboard/page.tsx` (remover mock session "Fernando" linhas 10–22 e mock metrics), `app/dashboard/{avisos,candidaturas,empresas,configuracoes,workflows,documentacao,relatorios,calendario}/page.tsx`, `relatorios/print/page.tsx`, e `app/leads/page.tsx` (redirect TODO'd off nas linhas 14–17 — página genuinamente exposta).
- Adicionar `/leads/:path*` e `/api/leads/:path*` ao matcher do `middleware.ts`; auditar `/api/matchmaking`, `/api/writer`, `/api/relatorios`.
- Arquivar `DEMO_MODE_CHANGES.md` quando concluído.
- **Verificar:** novo caso E2E em `e2e/critical-path.spec.ts` — `GET /dashboard` e `/leads` sem sessão → redirect para `/auth/login`; `npm run test:e2e`.

### PR 0.2 — Higiene de segredos
- Exposição confirmada é **history-only** (HEAD limpo): rodar em Vercel (ação do utilizador, documentar no PR): OPENROUTER_API_KEY, STRIPE_SECRET_KEY, GEMINI_API_KEY, RESEND_API_KEY, NEXTAUTH_SECRET, BITRIX_WEBHOOK_URL, APIFY_TOKEN, FIRECRAWL_API_KEY.
- Reconciliar `.env.example` contra `grep -r "process.env\." lib app scripts` (faltam p.ex. `GEMINI_RAG_STORE_ID`).
- Adicionar job `gitleaks` ao `.github/workflows/ci.yml`.
- **Decisão do utilizador:** reescrever histórico (`git filter-repo`) vs. só rotação (suficiente se todas as chaves forem revogadas — recomendado).

### PR 0.3 — Remover cruft
- Apagar (verificar imports antes): `prr_debug.png`, `prr_dump.html`, `server.log`, `ingest-log.txt`, `scraping_log*.txt`, `test-results.json`, `rag-store.json`, `test-automation.js`, `test-enhanced-fixed.js`, `test-portais-individual.sh`, `debug-prr.ts`, `analyze_meeting.mjs`, `app/globals.css.backup`, `zod-v3-shim.ts` (se sem imports), `scripts/sync-avisos-to-db.js` (manter o `.ts`; diff antes).
- Páginas de apresentação: manter UMA das 8 variantes `app/apresentacao*` + `app/presentation/`. **Decisão do utilizador:** qual variante está viva; manter `proposta-*`/`pricing`?
- Remover `@netlify/plugin-nextjs` das devDependencies; alargar `.gitignore` (logs, playwright-report, test-results).
- **Verificar:** `npm run build && npm run typecheck && npm test`.

### PR 0.4 — Consolidar rotas duplicadas + README
- Compliance: manter `app/api/writer/compliance` (tem Zod + grade), absorver o handler GET de keywords de `check-compliance`, apagar `check-compliance`.
- RAG: manter `/api/rag` (base), `/api/rag/chat` (Gemini File Search real) e `/api/rag/web`; apagar `/api/rag/combined` (quase idêntico ao base). Corrigir store hardcoded em `app/api/rag/chat/route.ts` (`fileSearchStores/avisosfundoseuropeus-…`) → `GEMINI_RAG_STORE_ID`.
- Reescrever `README.md` (arquitetura real, env, crons, corpus); popular `directives/` ou remover a camada vazia.
- **Verificar:** grep por rotas antigas em `app/` e `components/`; build + E2E.

---

## Fase 1 — AI Technical Writer (Fase 2 do PRD)

**Objetivo:** consultor escolhe empresa + aviso → gera memória descritiva secção-a-secção no estilo TA Consulting, fundamentada nas regras do aviso (citações `[ID: XX]` via AvisoChunk/pgvector) e nas 291 candidaturas históricas (Gemini File Search), com compliance A–F, revisão pelo Critic e exportação.

**Achado arquitetural:** os dois fluxos existentes são complementares, não duplicados:
- Fluxo A (`/api/writer/generate` + `generate-full`): templates via `lib/templates`, OpenRouter (Claude Sonnet), auth + rate-limit + plan guards, injeta exemplos históricos via `lib/rag/candidaturas-rag.ts:fetchSectionExamples()`. Não-streaming.
- Fluxo B (`/api/writer/candidatura`): streaming SSE via `lib/ai-writer/candidatura-generator.ts` + `sections.ts` (modelo de secções de 58+ candidaturas reais), citações obrigatórias de chunks pgvector. Sem guards, placeholders hardcoded.

**Convergir: motor do B + guards e injeção RAG do A**, rota canónica `/api/writer/generate` (streaming). Retrieval mantém-se em Gemini File Search; geração em OpenRouter/Claude Sonnet (já ligado, UI de model-picker existe).

### PR 1.1 — Pipeline de ingestão do corpus (291 candidaturas)
- Melhorar `scripts/upload-candidaturas-gemini.ts`: remover cap de 50 ficheiros, tornar **resumível** persistindo estado no modelo `CandidaturaHistorica` (campos `ragStatus`, `ragStoreId`, `ragIndexedAt` já existem em `prisma/schema.prisma:492`); skip de SYNCED; enriquecer metadata com a lógica de `__tests__/LOGICA_SELECAO.md` e `scripts/populate-candidaturas-historicas.ts`.
- Mover corpus de `__tests__/candidaturas_processadas` para `data/corpus/` (é dado, não teste); atualizar `INPUT_DIR` e excludes do vitest.
- **Decisão do utilizador:** corpus contém dados reais de clientes — confirmar GDPR para upload ao Gemini; senão, pivotar para retrieval só-pgvector (padrão AvisoChunk já prova o stack).
- **Verificar:** `npx tsx scripts/test-candidaturas-rag.ts`; count `ragStatus=SYNCED` == ficheiros no store.

### PR 1.2 — Rota canónica de geração
- Fundir fluxos em `/api/writer/generate` (streaming): `CandidaturaGenerator` + `CANDIDATURA_SECTIONS` + Zod + rate limit + session guard + injeção de exemplos RAG quando a secção declara `requiredContext: ['rag_candidaturas']`.
- Corrigir placeholders hardcoded em `lib/ai-writer/candidatura-generator.ts:79-80` (`investimento_total`, `duracao_meses`) → vir do contexto `projeto` do request.
- Persistir output: `CandidaturaSectionState` (em `sections.ts`) não tem backing Prisma — adicionar campo JSON ou modelo `CandidaturaSecao` (status pending/draft/review/approved).
- Depreciar `/api/writer/candidatura` e `/api/writer/generate-full` (loop batch do generate-full vira modo "gerar tudo" da rota canónica).
- **Verificar:** unit tests de `buildPrompt` (injeção de chunks, placeholders, contexto RAG); teste de rota com OpenRouter mockado.

### PR 1.3 — UI do Writer
- Refatorar `app/dashboard/candidaturas/nova/page.tsx` (532 linhas, já chama as APIs certas): display streaming por secção, chips de estado, editar + aprovar por secção, "Gerar candidatura completa", gravar via `/api/candidaturas`.
- Mostrar citações (`[ID: XX]` → texto do AvisoChunk) e fontes RAG ("baseado em: candidatura X do programa Y").
- **Verificar:** E2E Playwright do wizard com LLM mockado, adicionado ao CI.

### PR 1.4 — Compliance + AI Critic no fluxo
- Correr `/api/writer/compliance` (`lib/keywords/compliance.ts:quickComplianceCheck`) automaticamente após cada secção; grade A–F inline.
- Ligar `lib/critic-agent.ts` (completo: `CriticVerdict` com approvalProbability/riscos/docs em falta; rota `app/api/critic/route.ts` existe) como passo "Rever com Critic" antes de marcar pronta — painel de veredicto com riscos por severidade.
- Stretch: modo fact-locked (`lib/fact-locked-writer.ts`) para secções factuais.
- **Verificar:** teste da rota critic com Gemini mockado; run manual com 1 par empresa+aviso real.

### PR 1.5 — Exportação
- Export DOCX/PDF da memória descritiva montada — reutilizar `app/api/exportar-pdf` / `scripts/generate-pdf.ts` (pdf-lib já é dependência). **Decisão do utilizador:** só PDF ou também DOCX (consultores normalmente precisam de Word editável).
- **Aceitação da fase:** gerar drafts completos para 2 avisos ativos reais; Fernando compara com uma candidatura aprovada histórica (golden set).

---

## Fase 2 — Scraping completo

**Consolidação (fundamentada em `lib/scraper/README.md`, que se auto-depreca):** implementação canónica = `apify-actors/super-scraper/src/lib/`. Estratégia por portal: **API-first → Firecrawl → fallback estático (marcado + alertado)**. Portais API-first correm no cron Next.js; os que exigem browser ficam no Apify.

### PR 2.1 — Apagar scrapers deprecated
- Apagar `lib/scraper/` (browser-automation*, strategies/) e rotas `app/api/scraper/{browser-automation,browser-automation-test,firecrawl,firecrawl/enhanced}`. Manter `portugal2030-direct` (WordPress JSON, ~1.9s) e `lib/firecrawl.ts` como cliente de fallback partilhado.
- Extrair fetchers de portal de `apify-actors/super-scraper/src/lib/` para `lib/portals/` — fonte única para app e actors.
- **Verificar:** build; grep de imports; E2E.

### PR 2.2 — Horizon Europe (maior ganho: +400 avisos)
- Corrigir os 404: usar a API SEDIA Funding & Tenders (POST) — `funding-tenders.ts` e `cordis.ts` já existem no super-scraper; debug com `scripts/debug-horizon-api.ts` / `test-horizon.ts`.
- Normalizar para `Aviso` via `normalizers.ts`; sync com `scripts/sync-avisos-to-db.ts`.
- **Verificar:** `npx tsx scripts/audit-scraped-data.ts`; count portal HORIZON > 0; spot-check de 5 avisos contra o portal.

### PR 2.3 — IPDJ + PEPAC/PRR robustos
- IPDJ (hoje 0): implementar via `super-scraper/src/lib/ipdj.ts` com fallback Firecrawl; PEPAC/PRR: escolher a variante que funciona entre `pepac.ts`/`pepac-firecrawl.ts`/`pepac-playwright.ts`, apagar as restantes.
- Marcar registos de fallback estático (flag em `Aviso`, p.ex. `fonte='FALLBACK'`).

### PR 2.4 — Orquestração, cache, rate limit, alertas
- Cron único de scraping: `/api/cron/scrape-avisos` no `vercel.json` (06:00, antes do check-new-avisos 06:30), protegido por `CRON_SECRET` **obrigatório** em produção (o `verifyCronSecret` atual só avisa).
- Por portal: skip de refetch dentro de N horas (last-run em DB), rate limiting educado, retry com backoff (padrão já existe em check-new-avisos), métricas via `super-scraper/src/lib/metrics.ts`.
- Alertas: reutilizar padrão `sendFailureAlert` (Resend) quando um portal falha todos os retries ou serve fallback.
- **Verificar:** dry-run do cron com Bearer secret local; atualizar `VALIDACAO_REAL_PORTAIS.md` com counts/latência por portal.

---

## Fase 3 — Hardening & dados

### PR 3.1 — Região das empresas (desbloqueia o matching)
- 24.196/24.234 empresas sem `regiao`; o `lib/matchmaking-engine.ts` v6 pesa NUT em 30 pts (fator máximo). Por ordem de rendimento: (a) re-sync Bitrix puxando campos de morada/distrito (`scripts/sync-bitrix-to-db.ts`, `ingest-bitrix-csv.ts`); (b) tabela código-postal → NUTS III (determinística, offline); (c) lookup por NIF em último recurso. Script batch + relatório de cobertura (alvo >90%).
- **Verificar:** `npx tsx scripts/test-matching-final.ts` antes/depois; % empresas com NUT.

### PR 3.2 — Zod + rate limiting em todas as rotas
- Inventariar rotas `app/api/**` sem Zod (rota compliance é o padrão a seguir); helper partilhado `validateBody(schema)`.
- `lib/rate-limiter.ts` é in-memory (per-instance no Vercel = fraco). **Decisão do utilizador:** Upstash Redis (free tier) ou aceitar best-effort.

### PR 3.3 — Performance e índices
- `app/dashboard/page.tsx` carrega TODAS as 24k empresas + relações em cada render — substituir por `count()`/agregados.
- Índices: `Aviso(ativo, dataFimSubmissao)`, `Empresa(ativa, nut)`; `MatchmakingEngine.findMatchesForAviso` itera 24k empresas em JS — pré-filtrar em SQL por NUT/dimensão.

### PR 3.4 — Observabilidade + testes
- Sentry conforme `docs/SENTRY_SETUP.md`.
- E2E: redirects de auth (PR 0.1), wizard do writer (LLM mockado), matchmaking happy path; promover os `scripts/test-*.ts` úteis a suites vitest, apagar o resto (~30 ficheiros).
- CI: gitleaks (0.2), check `prisma migrate diff`, opcional smoke semanal dos scrapers.

---

## Decisões pendentes do utilizador
1. **Fase 0:** rotação de chaves só, ou também reescrita do histórico git; qual variante de `apresentacao*` sobrevive; manter `proposta-*`/`pricing`?
2. **Fase 1:** provider LLM de geração (recomendo manter OpenRouter/Claude Sonnet; Gemini File Search fica para retrieval); GDPR ok para upload do corpus de clientes ao Gemini (senão pivô pgvector); PDF vs DOCX.
3. **Fase 3:** Upstash Redis para rate limiting; plano Sentry.

## Ficheiros críticos
- `middleware.ts` + as 11 páginas listadas em `DEMO_MODE_CHANGES.md` (esp. `app/dashboard/page.tsx`, `app/leads/page.tsx`)
- `lib/ai-writer/candidatura-generator.ts` + `lib/ai-writer/sections.ts` (motor da rota canónica)
- `lib/rag/candidaturas-rag.ts` + `lib/rag/gemini-file-search.ts` + `scripts/upload-candidaturas-gemini.ts` (pipeline do corpus)
- `app/api/writer/generate/route.ts` (alvo de consolidação)
- `apify-actors/super-scraper/src/lib/` (scrapers canónicos: `funding-tenders.ts`, `ipdj.ts`, `metrics.ts`, `dedupe.ts`)
- `lib/matchmaking-engine.ts`, `prisma/schema.prisma`, `vercel.json`, `.github/workflows/ci.yml`

## Verificação global
- Cada PR: `npm run lint && npm run typecheck && npm test && npm run build`; E2E onde aplicável (`npm run test:e2e`).
- Fim da Fase 0: deploy de staging com login real funcional; rotas protegidas confirmadas sem sessão.
- Fim da Fase 1: golden-set — drafts de 2 avisos reais comparados com candidatura aprovada histórica.
- Fim da Fase 2: `audit-scraped-data.ts` mostra 6/6 portais com dados reais (não fallback) e alertas a funcionar.
