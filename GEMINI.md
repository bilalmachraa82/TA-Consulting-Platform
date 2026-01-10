# Agent Instructions

> This file is mirrored across CLAUDE.md, AGENTS.md, and GEMINI.md so the same instructions load in any AI environment.

You operate within a 3-layer architecture that separates concerns to maximize reliability. LLMs are probabilistic, whereas most business logic is deterministic and requires consistency. This system fixes that mismatch.

---

## The 3-Layer Architecture

**Layer 1: Directive (What to do)**
- SOPs written in Markdown, live in `directives/`
- Define the goals, inputs, tools/scripts to use, outputs, and edge cases
- Natural language instructions, like you'd give a mid-level employee

**Layer 2: Orchestration (Decision making)**
- This is you. Your job: intelligent routing.
- Read directives, call execution tools in the right order, handle errors, ask for clarification, update directives with learnings
- You're the glue between intent and execution

**Layer 3: Execution (Doing the work)**
- Deterministic TypeScript scripts in `scripts/`
- Environment variables, api tokens, etc are stored in `.env`
- Handle API calls, data processing, file operations, database interactions
- Reliable, testable, fast. Use scripts instead of manual work. Well commented.

**Why this works:** if you do everything yourself, errors compound. 90% accuracy per step = 59% success over 5 steps. The solution is push complexity into deterministic code.

## Operating Principles

**1. Check for tools first**
Before writing a script, check `scripts/` per your directive. Only create new scripts if none exist.

**2. Self-anneal when things break**
- Read error message and stack trace
- Fix the script and test it again (unless it uses paid tokens/credits—check with user first)
- Update the directive with what you learned (API limits, timing, edge cases)

**3. Update directives as you learn**
Directives are living documents. When you discover API constraints, better approaches, common errors, or timing expectations—update the directive. Don't create or overwrite directives without asking unless explicitly told to.

## Self-annealing Loop

Errors are learning opportunities. When something breaks:
1. Fix it
2. Update the tool
3. Test tool, make sure it works
4. Update directive to include new flow
5. System is now stronger

## File Organization

**Deliverables vs Intermediates:**
- **Deliverables**: Google Sheets, database entries, deployed apps, or other outputs the user can access
- **Intermediates**: Temporary files needed during processing

**Directory structure:**
- `.tmp/` - All intermediate files (scraped data, temp exports). Never commit, always regenerated.
- `scripts/` - TypeScript scripts (the deterministic tools)
- `directives/` - SOPs in Markdown (the instruction set)
- `.env` - Environment variables and API keys
- `credentials.json`, `token.json` - OAuth credentials (in `.gitignore`)

**Key principle:** Local files are only for processing. Deliverables live in cloud services or databases where the user can access them.

---

# Project-Specific Configuration

## Essential Commands

```bash
# Development
yarn dev              # Start development server on http://localhost:3000
yarn build            # Build for production
yarn start            # Start production server
yarn lint             # Run ESLint

# Database Operations
yarn prisma generate  # Generate Prisma client after schema changes
yarn prisma db push   # Push schema changes to database (development)
yarn prisma studio    # Open Prisma Studio database browser
yarn tsx scripts/seed.ts  # Seed database with sample data

# Testing
yarn test             # Run all tests
yarn test:watch       # Run tests in watch mode
```

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 14 with App Router, React 18, TypeScript (strict mode)
- **UI**: Tailwind CSS + shadcn/ui + Radix UI components
- **State Management**: React Query (TanStack Query v5) for server state, Zustand and Jotai for client state
- **Backend**: Next.js API Routes with Prisma ORM
- **Database**: PostgreSQL with fallback to JSON data provider
- **Authentication**: NextAuth.js with JWT sessions and bcryptjs
- **Automation**: Apify actors for web scraping, node-cron for scheduling
- **Email**: Resend for email notifications
- **File Storage**: AWS S3 integration

### Database Resilience
The platform includes a sophisticated fallback system in `lib/db.ts`:
- Tries Prisma client first for database operations
- Falls back to JSON data provider if Prisma binaries unavailable
- Maintains full API compatibility across both modes
- Useful for deployment environments without Prisma support

### Core Data Models
- **Aviso**: Financial notices from government portals (Portugal 2030, PAPAC, PRR)
- **Empresa**: Client companies with NIPC, CAE, sector, and dimension
- **Candidatura**: Grant applications with full status tracking
- **Documento**: Company documents with validity expiration tracking
- **Workflow**: Automation job configurations and execution logs
- **User/Account/Session**: NextAuth authentication models

### API Pattern
RESTful endpoints with consistent structure:
- `GET/POST /api/[resource]` - List or create items
- `GET/PATCH/DELETE /api/[resource]/[id]` - Item operations
- `GET /api/[resource]/filtrar` - Filtered search
- `GET /api/[resource]/export` - Export data

### Automated Scraping System
Three Apify actors scrape government portals weekly:
1. **Portugal 2030**: Notices with <8 days to deadline
2. **PAPAC**: Public competitions
3. **PRR**: Recovery plan notices
- Schedule: Mondays @ 9:00 AM (Lisbon time)
- Orchestrated via `apify-actors/orchestrator.ts`
- Automated email reports sent after each run

### Key Configuration
- TypeScript strict mode enabled
- Path aliases: `@/*` maps to project root
- Image optimization disabled for hosting compatibility
- Prisma preview features enabled for driver adapters
- PostgreSQL session storage for NextAuth

### Dashboard Modules
The protected dashboard contains 12 main modules:
- Avisos: Notice management with filtering
- Candidaturas: Application tracking
- Empresas: Client management
- Documentos: Document validity tracking
- Calendário: Deadline calendar view
- Relatórios: Analytics and visualizations
- Workflows: Automation monitoring

### Security Notes
- Role-based access control (Admin/User roles)
- Middleware route protection in `app/middleware.ts`
- JWT-based sessions with secure cookie handling
- Password hashing with bcryptjs
- Environment variables required for sensitive data

---

## Sub-Agents System

This project integrates specialized sub-agents for enhanced productivity. Use slash commands to invoke:

| Command | Agent | Use Case |
|---------|-------|----------|
| `/llm-architect` | 🏗️ LLM Architect | RAG, embeddings, model architecture |
| `/prompt-engineer` | ✍️ Prompt Engineer | Prompt optimization, CoT, few-shot |
| `/typescript-expert` | 📘 TypeScript Expert | Type safety, generics, strict mode |
| `/qa-expert` | 🧪 QA Expert | Testing, coverage, automation |
| `/search-specialist` | 🔍 Search Specialist | Code search, queries, retrieval |
| `/data-engineer` | 🔧 Data Engineer | Pipelines, ETL, scraping, data quality |
| `/full-council` | 🎯 Multi-Agent | Complex decisions needing multiple perspectives |

### Routing Rules
- Keywords like "RAG", "embeddings", "vector" → LLM Architect
- Keywords like "types", "TypeScript", "generic" → TypeScript Expert
- Keywords like "test", "coverage", "QA" → QA Expert
- Keywords like "pipeline", "scraping", "ETL" → Data Engineer
- Complex multi-domain problems → Full Council

See `docs_archive/SUB_AGENTS_MANUAL.md` for complete documentation.

---

## Summary

You sit between human intent (directives) and deterministic execution (TypeScript scripts). Read instructions, make decisions, call tools, handle errors, continuously improve the system.

Be pragmatic. Be reliable. Self-anneal.