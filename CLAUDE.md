# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Layout

The Next.js application lives in `nextjs_space/` — **all commands below run from that directory**. The repository root contains only analysis/strategy docs (`ANALISE_*.md`, `PROPOSTAS_MELHORIAS.md`) and a sync script.

## Commands

```bash
cd nextjs_space

npm run dev          # dev server on :3000
npm run build        # production build (TypeScript errors fail the build; ESLint is ignored)
npm run lint

# Tests (node:test runner via tsx — there is NO test script in package.json)
npx tsx --test tests/*.test.ts          # all tests
npx tsx --test tests/compatibility.test.ts  # single file

# Database
npx prisma generate
npx prisma db push
npx tsx scripts/seed.ts                 # seed users/empresas/avisos
npx tsx scripts/insert_scraped_data.ts  # upsert avisos from data/scraped/*.json
```

**Environment caveat:** `prisma generate` downloads engines from `binaries.prisma.sh`, which is blocked (403) in sandboxed/offline environments. There is no workaround in-sandbox — database-dependent code can only be exercised in environments with network access to Prisma's CDN (production deploy is on AbacusAI with PostgreSQL).

Required env vars (`.env`): `DATABASE_URL`, `NEXTAUTH_SECRET`, `ANTHROPIC_API_KEY` (AI features), `RESEND_API_KEY` (email), `CRON_SECRET` (protected cron endpoints), AWS S3 vars for document storage.

## Domain

Platform for Portuguese consultancies managing European funding: **Avisos** (funding notices scraped from 3 portals: PORTUGAL2030, PAPAC, PRR), **Empresas** (client companies with NIPC/CAE/dimensão), **Candidaturas** (applications, 6-state lifecycle), **Documentos** (with validity tracking), **Workflows** (scheduled scraping/notification jobs). All UI text, domain naming, and AI output must be **Portuguese (pt-PT, never pt-BR)**.

**Schema gotcha:** the `Aviso` model field `descrição` contains a non-ASCII character — it must be written exactly as `descrição` in Prisma queries and object literals. `Aviso.codigo` and `Empresa.nipc` are `@unique` (upserts key on them).

## Architecture

### Data layer
- `lib/db.ts` — Prisma singleton (global-cached in dev). PostgreSQL.
- `lib/scraped-avisos.ts` — normalizes the three static JSON files in `data/scraped/` (portugal2030/papac/prr) into Aviso shape; handles European number formats (`parseNumber`). This is the ingestion path for real aviso data.

### AI layer (the core differentiator — read before touching)
- `lib/compatibility.ts` — **deterministic** empresa↔aviso scoring (0–100: setor, dimensão PME, região, prazo, montante). Pure function, fully unit-tested.
- `lib/claude-direct.ts` — minimal Anthropic Messages API client via `fetch` (no SDK dependency): 30s timeout, `generateClaudeJson` with fenced-JSON extraction (`extractJsonObject`).
- `lib/briefs.ts` — structured consultant briefs. `normalizeCaseBriefPayload` merges LLM output over a deterministic fallback, but **score and prioridade are ALWAYS taken from the deterministic result — the LLM is never allowed to override them**. Preserve this invariant in any change to recommendation/brief code.
- API routes `POST /api/recomendacoes` and `POST /api/briefs` follow the pattern: compute deterministic score → optionally enrich with Claude → fall back gracefully when `ANTHROPIC_API_KEY` is missing or the call fails (response includes `fonte: 'anthropic' | 'fallback'`).

### Auth & routing
- NextAuth credentials provider, JWT strategy, roles `admin`/`user` (`lib/auth.ts`).
- `middleware.ts` protects `/dashboard/*`; admin/cron-sensitive endpoints additionally check role or `CRON_SECRET` inside the route handler.
- All API routes under `app/api/` declare `export const dynamic = "force-dynamic"`. List endpoints share conventions: query-param filters, `page`/`limit` pagination, response shape `{ <items>, pagination: { total, pages, page, limit } }`.

### TypeScript config
`tsconfig.json` excludes `scripts/` and `tests/` from the build; path alias `@/*` maps to `nextjs_space/` root. `next.config.js` enforces TypeScript errors at build time but skips ESLint.

## Testing conventions

Tests use Node's built-in `node:test` + `node:assert/strict`, executed through `tsx` (which resolves the `@/` alias). They cover the pure logic in `lib/` (compatibility scoring, scraped-data parsing, JSON extraction). Keep new business logic in pure functions under `lib/` so it stays testable without a database.
