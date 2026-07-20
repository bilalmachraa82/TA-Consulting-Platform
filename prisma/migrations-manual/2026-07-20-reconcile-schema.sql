-- Reconciliação schema ↔ BD viva (2026-07-20)
-- Contexto: prisma/schema.prisma foi alinhado à BD (colunas de enriquecimento + 10 enums).
-- Este script aplica a direção inversa: o que só existia no schema passa a existir na BD.
-- Estritamente aditivo, exceto o rewrite do enum TipoWorkflow que normaliza o typo
-- SCRAPING_PAPAC -> SCRAPING_PEPAC (4 rows; o código só usa SCRAPING_PEPAC).

-- 1. Normalizar enum TipoWorkflow (PAPAC -> PEPAC), com mapeamento das rows no USING
CREATE TYPE "TipoWorkflow_new" AS ENUM ('SCRAPING_PORTUGAL2030', 'SCRAPING_PEPAC', 'SCRAPING_PRR', 'NOTIFICACAO_EMAIL', 'VALIDACAO_DOCUMENTOS', 'RELATORIO_MENSAL');
ALTER TABLE "workflows" ALTER COLUMN "tipo" TYPE "TipoWorkflow_new"
  USING (CASE WHEN "tipo"::text = 'SCRAPING_PAPAC' THEN 'SCRAPING_PEPAC' ELSE "tipo"::text END::"TipoWorkflow_new");
ALTER TYPE "TipoWorkflow" RENAME TO "TipoWorkflow_old";
ALTER TYPE "TipoWorkflow_new" RENAME TO "TipoWorkflow";
DROP TYPE "TipoWorkflow_old";

-- 2. Colunas v6 de matching que só existiam no schema (aditivo, sem perda)
ALTER TABLE "avisos"
  ADD COLUMN IF NOT EXISTS "caeCompativeis" TEXT,
  ADD COLUMN IF NOT EXISTS "nutsCompativeis" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "tipCompativeis" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- 3. Colunas NUT/TIP de Empresa que só existiam no schema (aditivo, sem perda)
ALTER TABLE "empresas"
  ADD COLUMN IF NOT EXISTS "nut" TEXT,
  ADD COLUMN IF NOT EXISTS "tip" TEXT,
  ADD COLUMN IF NOT EXISTS "tipEmpresa" TEXT;
