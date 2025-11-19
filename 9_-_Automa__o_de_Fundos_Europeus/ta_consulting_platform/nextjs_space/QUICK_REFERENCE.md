# 🚀 Enrichment Framework - Quick Reference

## Test Results Summary

**Status:** ✅ TIER 1 PASSED (100% success, 5/5 avisos)  
**Score:** 95.0% average  
**Cost:** $0.00 (API-based)  
**Fields:** 9 per aviso  

---

## Commands Reference

### 1. View Test Results
```bash
# Visual summary
cat ENRICHMENT_PIPELINE_SUMMARY.txt

# Detailed report
cat ENRICHMENT_TEST_RESULTS.md

# Generate fresh statistics
npx tsx scripts/enrichment-report.ts
```

### 2. Run Enrichment

#### Tier 1 (API - Free)
```bash
# Enrich 5 avisos from Portugal 2030
npx tsx scripts/enrich-avisos.ts --tier=1 --portal=PORTUGAL2030 --limit=5

# Enrich all avisos
npx tsx scripts/enrich-avisos.ts --tier=1

# Specific portal
npx tsx scripts/enrich-avisos.ts --tier=1 --portal=PRR --limit=10
```

#### Tier 3 (LLM - Requires API key)
```bash
# Set API key first
export ANTHROPIC_API_KEY=your_key_here

# Download PDFs
npx tsx scripts/download-pdfs.ts --limit=2

# Run Tier 3
npx tsx scripts/enrich-avisos.ts --tier=3 --portal=PORTUGAL2030 --limit=2
```

### 3. View Database

#### Prisma Studio (GUI)
```bash
npx prisma studio
# Opens http://localhost:5555
```

#### PostgreSQL CLI
```bash
docker exec -it evf-postgres psql -U evf_user -d evf_portugal_2030

# View enriched avisos
\x on
SELECT * FROM avisos WHERE codigo = 'PT2030_001';

# Count by status
SELECT "enrichmentStatus", COUNT(*) 
FROM avisos 
GROUP BY "enrichmentStatus";

# Exit
\q
```

### 4. Import Test Data
```bash
# Import from scraped JSON
npx tsx scripts/quick-import.ts
```

### 5. Database Management
```bash
# Push schema changes
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Reset database
docker exec evf-postgres psql -U evf_user -d postgres -c "DROP DATABASE evf_portugal_2030;"
docker exec evf-postgres psql -U evf_user -d postgres -c "CREATE DATABASE evf_portugal_2030;"
npx prisma db push
```

---

## Key Files

### Scripts
- `/scripts/enrich-avisos.ts` - Main enrichment script
- `/scripts/enrichment-report.ts` - Statistics generator
- `/scripts/quick-import.ts` - Test data importer

### Documentation
- `/ENRICHMENT_TEST_RESULTS.md` - Detailed test report
- `/ENRICHMENT_PIPELINE_SUMMARY.txt` - Visual summary
- `/QUICK_REFERENCE.md` - This file

### Code
- `/lib/extraction/orchestrator.ts` - Coordination logic
- `/lib/extraction/tier1/pt2030-api-extractor.ts` - API extraction
- `/lib/extraction/tier3/llm-extractor.ts` - LLM extraction

---

## Database Schema

### Environment
```bash
DATABASE_URL='postgresql://evf_user:evf_password@localhost:5432/evf_portugal_2030'
```

### Key Tables
- `avisos` - Main table with enriched data
- `enrichmentStatus` - BASIC, ENHANCED, AI_ENRICHED, MANUAL_VERIFIED

---

## Test Data

### Imported Avisos
1. PT2030_001 - Apoio à Transição Digital das PME
2. PT2030_002 - Eficiência Energética na Indústria
3. PT2030_003 - Inovação Produtiva - Indústria 4.0
4. PT2030_004 - Qualificação e Emprego
5. PT2030_005 - Internacionalização de Empresas

### Enrichment Results
- All 5 enriched successfully
- fundoEstruturalPrincipal: FEDER (100%)
- 9 fields extracted per aviso
- 95% confidence score

---

## Next Steps

### Required for Tier 3 Testing
1. Set `ANTHROPIC_API_KEY` environment variable
2. Download PDFs: `npx tsx scripts/download-pdfs.ts --limit=2`
3. Run enrichment: `npx tsx scripts/enrich-avisos.ts --tier=3 --limit=2`
4. Check results: `npx tsx scripts/enrichment-report.ts`

### Expected Improvements
- Field coverage: 9 → 20+ fields
- regiaoNUTS2: 0% → 80%
- tipoOperacao: 0% → 70%
- regimeAuxilio: 0% → 60%

---

## Support

### Viewing Results
```bash
# Quick stats
npx tsx scripts/enrichment-report.ts

# Full database
npx prisma studio

# Raw SQL
docker exec -it evf-postgres psql -U evf_user -d evf_portugal_2030
```

### Troubleshooting
```bash
# Check database connection
docker ps | grep postgres

# Verify schema
npx prisma validate

# Regenerate client
npx prisma generate
```

---

**Test Status:** ✅ PASSED  
**Last Updated:** 2025-11-10
