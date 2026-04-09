-- Add unique constraint to Aviso.codigo
-- NOTE: If duplicates exist, clean them first:
--   DELETE FROM avisos a USING avisos b WHERE a.id > b.id AND a.codigo = b.codigo;

CREATE UNIQUE INDEX IF NOT EXISTS "avisos_codigo_key" ON "avisos"("codigo");
