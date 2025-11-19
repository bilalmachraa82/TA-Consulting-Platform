# Enhanced Schema Migration Guide

## Overview

This guide explains how to safely migrate the Aviso model from the basic schema (16 fields) to the enhanced schema (75+ fields including 59 new fields and 9 new enums).

## Critical Bug Fixes Applied

### 1. Execution Order Violation - FIXED
**Before (WRONG):**
```typescript
// Script tried to use avisoLegacy table BEFORE it existed
await prisma.avisoLegacy.upsert({...}) // ERROR: Table doesn't exist yet!
```

**After (CORRECT):**
```typescript
// Phase A: Create snapshots in JSON file BEFORE Prisma migration
await fs.writeFile(SNAPSHOT_FILE, JSON.stringify(avisos))

// Phase B: After Prisma migration, populate avisoLegacy table
await prisma.avisoLegacy.upsert({...}) // NOW table exists!
```

### 2. Type Safety - FIXED
**Before (WRONG):**
```typescript
snapshot: aviso as any  // Unsafe cast
```

**After (CORRECT):**
```typescript
interface AvisoSnapshot {
  id: string;
  nome: string;
  // ... all fields explicitly typed
}

function avisoToSnapshot(aviso: Aviso): AvisoSnapshot {
  return {
    id: aviso.id,
    nome: aviso.nome,
    // ... type-safe conversion
  }
}
```

### 3. Transaction Boundaries - FIXED
**Before (WRONG):**
```typescript
// No transaction, partial failures possible
await prisma.aviso.updateMany({...})
```

**After (CORRECT):**
```typescript
// All operations wrapped in transactions
await prisma.$transaction(async (tx) => {
  await tx.aviso.updateMany({...})
})
```

## Migration Workflow

```
┌─────────────────────────────────────────────────────────┐
│                    PHASE A: PRE-MIGRATION                │
│  (Creates snapshots using EXISTING schema only)          │
└─────────────────────────────────────────────────────────┘
                            ↓
                tsx scripts/migrate-enhanced-schema.ts
                            ↓
          ┌─────────────────────────────────┐
          │ Snapshot created in JSON file   │
          │ Location: migration-snapshots/  │
          └─────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                   PRISMA MIGRATION                       │
│  npx prisma migrate dev --name enhanced_aviso_schema_v1  │
└─────────────────────────────────────────────────────────┘
                            ↓
          ┌─────────────────────────────────┐
          │ New schema applied to database  │
          │ AvisoLegacy table created       │
          └─────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                  PHASE B: POST-MIGRATION                 │
│  tsx scripts/migrate-enhanced-schema.ts --post-migrate   │
└─────────────────────────────────────────────────────────┘
                            ↓
          ┌─────────────────────────────────┐
          │ ✅ Data integrity verified      │
          │ ✅ Default values set           │
          │ ✅ Legacy snapshots stored      │
          └─────────────────────────────────┘
```

## Step-by-Step Instructions

### Prerequisites

1. **Database Backup**
   ```bash
   # Create a full database backup first!
   pg_dump -U your_user -d your_database > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Environment Check**
   ```bash
   # Ensure you're in the correct environment
   echo $DATABASE_URL

   # Verify Prisma CLI is installed
   npx prisma --version
   ```

### Step 1: Run Phase A (Pre-Migration)

This phase creates a snapshot of all existing avisos BEFORE any schema changes.

```bash
tsx scripts/migrate-enhanced-schema.ts
```

**Expected Output:**
```
🚀 ENHANCED SCHEMA MIGRATION - PHASE A (PRE-MIGRATION)
============================================================

🔍 Running Pre-Flight Checks
============================================================
  ✅ Database connection OK
  ✅ Aviso table accessible (X records)
  ✅ Snapshot directory will be created
  ✅ Write permissions OK

📸 PHASE A: Creating Pre-Migration Snapshot
============================================================
  📊 Total avisos to snapshot: X
  ✅ Processed X/X avisos

  ✅ Snapshot created successfully!
  📁 Location: .../migration-snapshots/avisos-snapshot-TIMESTAMP.json
  🔐 Checksum: abc123def
  📦 Records: X

✅ PHASE A COMPLETE!
============================================================

📋 NEXT STEPS:

1️⃣  Run Prisma Migration:
    npx prisma migrate dev --name enhanced_aviso_schema_v1

2️⃣  After migration succeeds, run Phase B:
    tsx scripts/migrate-enhanced-schema.ts --post-migrate

💡 Snapshot saved at:
    .../migration-snapshots/avisos-snapshot-TIMESTAMP.json

⚠️  KEEP THIS SNAPSHOT FILE - needed for rollback!
```

**What Phase A Does:**
- ✅ Validates database connection
- ✅ Reads all existing avisos
- ✅ Creates type-safe snapshot in JSON file
- ✅ Generates checksum for verification
- ✅ Does NOT modify database
- ✅ Does NOT require new schema

### Step 2: Run Prisma Migration

This applies the schema changes to your database.

```bash
npx prisma migrate dev --name enhanced_aviso_schema_v1
```

**Expected Output:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "your_db"

Applying migration `20251109_enhanced_aviso_schema_v1`

The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20251109_enhanced_aviso_schema_v1/
      └─ migration.sql

✔ Generated Prisma Client
```

**What This Does:**
- ✅ Adds 59 new fields to Aviso table
- ✅ Creates 9 new enum types
- ✅ Creates AvisoLegacy table
- ✅ Applies all indexes
- ✅ Sets default values for new fields
- ✅ Regenerates Prisma Client

### Step 3: Run Phase B (Post-Migration)

This verifies the migration and populates new tracking fields.

```bash
tsx scripts/migrate-enhanced-schema.ts --post-migrate
```

**Expected Output:**
```
🚀 ENHANCED SCHEMA MIGRATION - PHASE B (POST-MIGRATION)
============================================================

📸 Using snapshot: avisos-snapshot-TIMESTAMP.json

🔍 PHASE B: Verifying Migration Integrity
============================================================
  📸 Snapshot version: v1_enhanced_schema_2025_11_09
  📅 Snapshot timestamp: 2025-11-09T...
  📦 Expected records: X
  📊 Current records: X
  ✅ No data loss - all avisos preserved!
  ✅ All aviso IDs match snapshot!

⚙️  Setting Default Values for New Fields
============================================================
  📊 Avisos needing defaults: X
  ✅ Updated X avisos with migration metadata

💾 Populating AvisoLegacy Table
============================================================
  📦 Total snapshots to store: X
  ✅ Stored X/X snapshots in database

✅ PHASE B COMPLETE!
============================================================

📊 Migration Summary:
  ✅ Data integrity verified
  ✅ Default values set
  ✅ Legacy snapshots stored in database
  ✅ Migration version: v1_enhanced_schema_2025_11_09

🎉 Enhanced schema migration successful!
```

**What Phase B Does:**
- ✅ Verifies no data loss occurred
- ✅ Compares record counts
- ✅ Validates all IDs match
- ✅ Sets migration metadata (migratedFromLegacy, migrationVersion)
- ✅ Populates AvisoLegacy table with snapshots
- ✅ All operations in transactions

## Rollback Procedure

If Phase B fails or you need to rollback:

```bash
tsx scripts/rollback-migration.ts
```

**What Happens:**
1. Lists all available snapshots
2. Prompts for confirmation (destructive operation!)
3. Creates backup of current state
4. Deletes all current avisos
5. Restores from snapshot file
6. Verifies restoration

**Output:**
```
🔄 MIGRATION ROLLBACK UTILITY
============================================================

📸 Available Snapshots:
  1. avisos-snapshot-1699564800000.json

💡 Using latest snapshot: avisos-snapshot-1699564800000.json

⚠️  WARNING: This will DELETE all current avisos and restore from snapshot.
Are you absolutely sure? (yes/no): yes

🔄 Starting Rollback Process
============================================================
📊 Snapshot Information:
  Version: v1_enhanced_schema_2025_11_09
  Timestamp: 2025-11-09T...
  Total Avisos: X
  Checksum: abc123def

💾 Creating backup of current state...
  ✅ Backup saved: pre-rollback-backup-TIMESTAMP.json

🗑️  Deleting current avisos...
  ✅ Deleted X avisos

📥 Restoring avisos from snapshot...
  ✅ Restored X/X avisos

🔍 Verifying restoration...
  ✅ Verification passed!

✅ ROLLBACK SUCCESSFUL!
```

## Validation Checklist

After migration, verify:

```bash
# 1. Check record count
npx prisma studio
# Navigate to Aviso table, verify count matches snapshot

# 2. Check new fields
# Open Prisma Studio, verify new fields exist with defaults

# 3. Check AvisoLegacy table
# Verify snapshots were stored

# 4. Check migration metadata
# Run query to verify all avisos have migratedFromLegacy = true
```

## Troubleshooting

### Error: "No avisos found in database"
**Cause:** Database is empty or connection failed
**Solution:** Check DATABASE_URL and verify data exists

### Error: "Cannot read snapshot directory"
**Cause:** Phase A not run yet
**Solution:** Run Phase A first: `tsx scripts/migrate-enhanced-schema.ts`

### Error: "Data loss detected"
**Cause:** Record count mismatch
**Solution:**
1. DO NOT proceed
2. Check database logs
3. Run rollback: `tsx scripts/rollback-migration.ts`
4. Investigate issue before retrying

### Error: "Prisma Client validation error"
**Cause:** Prisma Client not regenerated
**Solution:** `npx prisma generate`

## Safety Features

### 1. No Execution Order Violation
- Phase A uses ONLY existing schema
- Phase B runs AFTER Prisma migration
- Clear separation of concerns

### 2. Type Safety
- All operations use explicit TypeScript interfaces
- No unsafe `as any` casts (except unavoidable enum coercion)
- Compile-time type checking

### 3. Transaction Boundaries
- All DB modifications in transactions
- Atomic operations (all-or-nothing)
- Automatic rollback on errors

### 4. Data Integrity Verification
- Record count validation
- ID checksum comparison
- Pre/post migration comparison

### 5. Rollback Capability
- File-based snapshots (independent of DB)
- Multiple snapshots kept
- Confirmation prompts for destructive operations

## File Locations

```
nextjs_space/
├── scripts/
│   ├── migrate-enhanced-schema.ts    # Main migration script
│   ├── rollback-migration.ts         # Rollback utility
│   └── MIGRATION_GUIDE.md            # This file
├── migration-snapshots/              # Created by Phase A
│   ├── avisos-snapshot-TIMESTAMP.json
│   └── pre-rollback-backup-*.json
└── prisma/
    └── migrations/
        └── TIMESTAMP_enhanced_aviso_schema_v1/
            └── migration.sql
```

## Schema Changes Summary

### New Fields Added (59 total)

**Enrichment Metadata (5 fields):**
- enrichmentStatus
- enrichmentScore
- dataSourceLog
- lastEnrichedAt
- enrichedBy

**Financial Parameters (12 fields):**
- taxaCofinanciamentoMin/Max
- taxaGrandeEmpresa, taxaMediaEmpresa, taxaPequenaEmpresa, taxaMicroEmpresa
- limiteMinimoCandidatura, limiteMaximoCandidatura, limiteMaximoEmpresa
- comparticipacaoPublicaMax, contribuicaoPropriaMin, percentagemFNR

**Geographic Scope (5 fields):**
- regiaoNUTS2, regiaoNUTS3
- municipiosElegiveis
- abrangenciaGeografica, limitacaoTerritorial

**Eligibility Criteria (9 fields):**
- caeElegiveis, caeExcluidos
- tiposBeneficiarios, formaJuridicaRequerida
- situacaoRegularizada, antiguidadeMinima
- trabalhadoresMinimo, volumeNegociosMinimo, criacaoEmpregoObrigatoria

**Funding Structure (8 fields):**
- fundoEstruturalPrincipal, fundosCofinanciamento
- programaOperacionalCodigo, eixoPrioritario
- prioridadeInvestimento, objetivoEspecificoCodigo
- regimeAuxilio, artigoGBER

**Investment Types (6 fields):**
- categoriasInvestimentoElegiveis, custosElegiveis, custosNaoElegiveis
- tipoOperacao, tipoApoio, reembolsavel

**Project Requirements (7 fields):**
- duracaoMinimaProjeto, duracaoMaximaProjeto, prazoExecucaoMeses
- periodoManutencaoAnos, apresentacaoPlanoNegocios
- parecerTecnicoObrigatorio, estudoViabilidadeObrigatorio

**Submission & Deadlines (5 fields):**
- tipoSubmissao, fasesSubmissao, prazoReclamacao
- dataDecisaoEstimada, prazoContratacaoDias

**Compliance & Documentation (6 fields):**
- documentosObrigatorios, declaracoesNecessarias
- regulamentoURL, anexosRegulamento
- baseLegalPrincipal, normativoComunitario

**PDF Processing (8 fields):**
- pdfStoragePath, pdfHash
- pdfDownloadStatus, pdfDownloadedAt
- pdfExtractionStatus, pdfExtractedText
- pdfExtractionQuality, pdfMetadata

**Migration Tracking (3 fields):**
- migratedFromLegacy
- migrationVersion
- migrationErrors

### New Enums Created (9 total)

1. **EnrichmentStatus:** BASIC, ENHANCED, AI_ENRICHED, MANUAL_VERIFIED, VALIDATION_FAILED
2. **AbrangenciaGeografica:** REGIONAL, NACIONAL, CONTINENTAL, EUROPEU
3. **TipoBeneficiario:** EMPRESAS, ASSOCIACOES, AUTARQUIAS, ONG, etc.
4. **FundoEstrutural:** FEDER, FSE_PLUS, FC, FTJ, FEAMPA
5. **RegimeAuxilio:** GBER, DE_MINIMIS, NAO_APLICAVEL, AUXILIO_ESTATAL_NOTIFICADO
6. **CategoriaInvestimento:** EQUIPAMENTO, CONSTRUCAO, SOFTWARE, FORMACAO, etc.
7. **TipoOperacao:** INVESTIMENTO, FORMACAO, ESTUDOS, CONSULTORIA, MISTO
8. **TipoApoio:** SUBSIDIO, CREDITO, GARANTIA, MISTO
9. **PDFStatus:** NOT_STARTED, IN_PROGRESS, COMPLETED, FAILED, SKIPPED

## Support

If you encounter issues:

1. Check this guide's troubleshooting section
2. Verify all prerequisites
3. Review script output for specific errors
4. Use rollback if needed
5. Contact development team with error logs

## Migration Status Tracking

Update this section as you progress:

- [ ] Database backup created
- [ ] Phase A completed (snapshot created)
- [ ] Prisma migration applied
- [ ] Phase B completed (verification passed)
- [ ] Post-migration validation completed
- [ ] Snapshot files archived safely

---

**Document Version:** 1.0
**Last Updated:** 2025-11-09
**Migration Version:** v1_enhanced_schema_2025_11_09
