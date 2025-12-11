# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

# Testing (when implemented)
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