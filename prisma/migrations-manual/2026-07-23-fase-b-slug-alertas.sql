-- Fase B (2026-07-23): slug SEO no Aviso + alertas double opt-in no Lead
-- Aplicado via `prisma db push` (padrão do repo). Registo para o trail de drift (TODOS.md #1).
ALTER TABLE "avisos" ADD COLUMN "slug" TEXT;
CREATE UNIQUE INDEX "avisos_slug_key" ON "avisos"("slug");
ALTER TABLE "leads" ADD COLUMN "setorPreferido" TEXT;
ALTER TABLE "leads" ADD COLUMN "alertasEstado" TEXT NOT NULL DEFAULT 'NENHUM';
ALTER TABLE "leads" ADD COLUMN "origem" TEXT;
