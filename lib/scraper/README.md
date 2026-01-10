# ⚠️ DEPRECATED - Legacy Scraper Utilities

> **DO NOT USE** - This folder contains legacy scraper utilities that are superseded by the unified `apify-actors/super-scraper/` system.

## Why is this deprecated?

The unified Super Scraper in `apify-actors/super-scraper/src/lib/` provides:
- Complete coverage for all 6 portals (Portugal 2030, PRR, PEPAC, IPDJ, Horizon Europe, Europa Criativa)
- Integrated document extraction and normalization
- RAG ingestion pipeline
- Apify deployment support
- Firecrawl fallback for blocked sites

## Files in this folder

| File | Purpose | Replacement |
|------|---------|-------------|
| `browser-automation.ts` | Puppeteer wrapper | `super-scraper/src/main.ts` |
| `browser-automation-simple.ts` | Simplified browser automation | Not needed |
| `portal-configs.ts` | Portal URL configs | `super-scraper/src/lib/types.ts` |
| `resource-blocker.ts` | Block images/fonts | Built into Playwright |
| `strategies/horizon.ts` | Horizon Europe scraper | `super-scraper/src/lib/cordis.ts` |

## What to do?

1. **For new development**: Use `apify-actors/super-scraper/`
2. **For syncing data**: Use `scripts/sync-avisos-to-db.js`
3. **For Apify runs**: Use the deployed actor `grlhy89gBuSgOUBdY`

## API Routes using this (to be migrated)

- `/api/scraper/browser-automation/` → Deprecated
- `/api/scraper/browser-automation-test/` → Deprecated
- `/api/scraper/firecrawl/` → Deprecated
- `/api/scraper/firecrawl/enhanced/` → Deprecated

These routes may be removed in a future cleanup sprint.
