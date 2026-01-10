# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**TA Consulting Platform** is a full-stack web application for financial incentive automation. It discovers European funding opportunities from Portuguese government portals and provides a dashboard for managing applications.

**Key purpose:** Automate the workflow of tracking, filtering, and managing grant/subsidy opportunities from 3 sources (Portugal 2030, PAPAC, PRR).

## Technology Stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL
- **Authentication:** NextAuth.js (JWT-based)
- **State Management:** Zustand, Jotai, React Query (TanStack Query v5)
- **Data Visualization:** Recharts, Chart.js, Plotly.js
- **Deployment:** Abacus.AI (hosted)
- **Package Manager:** Yarn

## Essential Commands

```bash
# Development & Building
yarn dev                          # Start dev server (http://localhost:3000)
yarn build                        # Production build
yarn start                        # Start production server
yarn lint                         # Run ESLint (from nextjs_space/)

# Database Management
yarn prisma generate             # Generate Prisma client
yarn prisma db push              # Sync database schema with postgres
yarn prisma db seed              # Seed test data
yarn prisma studio               # Open Prisma Studio (interactive DB browser)

# Database Seeding (seed.ts scripts)
npx tsx scripts/seed.ts           # Insert test data
npx tsx scripts/insert_real_data.ts  # Insert real company data
npx tsx scripts/verify_data.ts    # Verify inserted data
```

**Working directory:** Always run commands from `nextjs_space/` folder.

## High-Level Architecture

### Directory Structure
```
nextjs_space/
├── /app                          # Next.js App Router
│   ├── /api                       # Backend API routes (REST endpoints)
│   ├── /auth                      # Authentication pages (login, register)
│   ├── /dashboard                 # Protected dashboard pages (12 modules)
│   └── /apresentacao              # Landing page
├── /components
│   ├── /dashboard                 # Feature-specific components (avisos, candidaturas, etc)
│   ├── /ui                        # shadcn/ui + Radix UI components (50+)
│   ├── /modern                    # Custom modern UI components
│   ├── /presentation              # Landing page components
│   ├── providers.tsx              # Root providers (Auth, Query, Theme)
│   └── theme-provider.tsx         # Theme configuration
├── /lib
│   ├── auth.ts                    # NextAuth config
│   ├── db.ts                      # Prisma client instance
│   ├── types.ts                   # Shared TypeScript types
│   └── utils.ts                   # Utility functions
├── /hooks                         # Custom React hooks (use-toast, etc)
├── /prisma                        # Database schema & configuration
├── /scripts                       # Seeding & utility scripts
├── /public                        # Static assets (logos, images, favicon)
└── /data                          # Local data storage (scraped data)
```

### Data Model (Key Entities)
- **Aviso** - Financial notices from 3 portals (Portugal 2030, PAPAC, PRR)
- **Empresa** - Companies (NIPC, sector, region, dimension)
- **Candidatura** - Application tracking with status (Submetida, Aprovada, Rejeitada, etc)
- **Documento** - Company documents with validity dates
- **Workflow/WorkflowLog** - Automation job scheduling & execution logs
- **User/Account/Session** - NextAuth standard models

See `prisma/schema.prisma` for complete schema with 20+ models.

### API Route Pattern
```
GET    /api/[resource]              # List all
POST   /api/[resource]              # Create
GET    /api/[resource]/[id]         # Get by ID
PATCH  /api/[resource]/[id]         # Update
DELETE /api/[resource]/[id]         # Delete
GET    /api/[resource]/filtrar      # Advanced filtering
GET    /api/[resource]/export       # Export as JSON/CSV
```

Common endpoints: `/api/avisos`, `/api/candidaturas`, `/api/empresas`, `/api/documentos`, `/api/workflows`, `/api/chatbot`, `/api/dashboard/metricas`.

### Frontend Component Organization
- **Dashboard modules** live in `components/dashboard/` (feature-specific)
  - `avisos-component.tsx` - Notices management
  - `candidaturas-component.tsx` - Applications tracking
  - `empresas-component.tsx` - Companies management
  - `relatorios-component.tsx` - Reports & analytics
  - `workflows-component.tsx` - Automation monitoring
  - `calendario-component.tsx` - Calendar/deadlines
  - `dashboard-sidebar.tsx`, `dashboard-header.tsx` - Navigation

- **UI components** in `components/ui/` - shadcn/ui (Dialog, Button, Table, Dropdown, etc)
- **Data fetching:** React Query hooks for server state
- **Form handling:** React Hook Form + Zod validation

## Common Development Tasks

### Adding a New API Endpoint
1. Create new file in `app/api/[resource]/route.ts`
2. Use Prisma client: `import { db } from '@/lib/db'`
3. Extract body: `const body = await req.json()`
4. Return response: `return NextResponse.json({ data })`

Example: See `app/api/avisos/route.ts` for GET/POST patterns.

### Adding a Dashboard Page
1. Create new folder in `app/dashboard/[feature]/page.tsx`
2. Create component in `components/dashboard/[feature]-component.tsx`
3. Use React Query: `const { data } = useQuery(['resource'], () => fetch('/api/resource'))`
4. Import shadcn/ui components for UI
5. Add route to sidebar navigation in `components/dashboard/dashboard-sidebar.tsx`

### Database Schema Changes
1. Edit `prisma/schema.prisma`
2. Run `yarn prisma migrate dev --name description` (creates migration)
3. Run `yarn prisma db push` (applies to database)
4. Regenerate types: `yarn prisma generate`

### Testing API Endpoints
- Use the dashboard UI for manual testing
- Or use curl/Postman against running dev server
- No automated test suite currently (manual testing only)

## Authentication & Security

- **NextAuth.js** handles JWT-based authentication
- **Middleware** in `middleware.ts` protects `/dashboard/*` routes
- **Roles:** Admin and User with role-based access control
- **Password hashing:** bcryptjs
- **Session storage:** PostgreSQL (via `@next-auth/prisma-adapter`)

Test credentials:
```
Email: test@example.com
Password: password123
```

## Configuration Files Impact

| File | What it Controls |
|------|-----------------|
| `next.config.js` | Build output, image optimization, ESLint integration |
| `tsconfig.json` | TypeScript strict mode, path aliases (`@/*`) |
| `tailwind.config.ts` | CSS variables, custom colors, plugin configuration |
| `components.json` | shadcn/ui component paths and configuration |
| `prisma/schema.prisma` | Complete database schema and relationships |
| `middleware.ts` | Route protection, auth guards |
| `.env` | Database URL, API keys, secrets (never commit) |

## Important Notes

### Type Safety
- TypeScript strict mode is enabled
- All API responses should be typed
- Use `prisma generate` after schema changes
- Extend NextAuth session types in `lib/types.ts` for custom fields

### Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection
- `NEXTAUTH_SECRET` - Session encryption key
- `NEXTAUTH_URL` - Application URL
- `ABACUSAI_API_KEY` - AI agent integration (for scrapers)
- `RESEND_API_KEY` - Email service (optional)
- `AWS_*` - S3 storage credentials (document uploads)

### Build & Deployment
- ESLint runs manually via `yarn lint` (not during build)
- TypeScript errors fail the build (strict mode)
- Output file tracing enabled for optimized deployment
- Images unoptimized for hosted environments
- Deploy via git commits (automatic CI/CD on Abacus.AI)

### Automation Workflow
Three automated agents scrape weekly:
1. **Portugal 2030** - Notices with <8 days to deadline
2. **PAPAC** - Public competitions
3. **PRR** - Recovery plan notices

- **Schedule:** First run Friday Nov 6, 2025 @ 7:00 AM; then Mondays @ 9:00 AM (Lisbon time)
- **Process:** Scrape → Validate duplicates → Insert DB → Generate report → Send email
- **Monitoring:** Check `WorkflowLog` table for execution history

## Tips for Productivity

- Use `yarn prisma studio` to browse/edit database data visually
- Check `lib/types.ts` for shared TypeScript types
- Review existing dashboard components as templates for new features
- Use `@/` path alias for imports (configured in tsconfig.json)
- Component library fully available in shadcn/ui (Button, Table, Dialog, Form, etc)
- React Query provides automatic caching and refetching

## Debugging

- **Dev server logs:** Check terminal running `yarn dev`
- **Database issues:** Use `yarn prisma studio` to inspect data
- **API responses:** Check Network tab in browser DevTools
- **Authentication:** Check NextAuth logs in `[...nextauth]` route
- **Build errors:** Run `yarn build` to catch all issues before deploy

