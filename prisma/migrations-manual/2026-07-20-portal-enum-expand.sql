-- Expansão do enum Portal (2026-07-20): novos portais de financiamento
-- ADD VALUE é aditivo e seguro; IF NOT EXISTS torna o script idempotente.
ALTER TYPE "Portal" ADD VALUE IF NOT EXISTS 'DIGITAL_EUROPE';
ALTER TYPE "Portal" ADD VALUE IF NOT EXISTS 'LIFE';
ALTER TYPE "Portal" ADD VALUE IF NOT EXISTS 'FUNDO_AMBIENTAL';
