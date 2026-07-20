-- Datas de submissão nulificáveis + limpeza dos carimbos de fallback (2026-07-20)
--
-- Problema (P1 da revisão Codex, confirmado nos dados): quando a fonte diz que
-- um aviso está ABERTO mas não publica o prazo na listagem, o sync carimbava
-- `new Date()`. Resultado: o aviso nascia com prazo "hoje" e desaparecia dos
-- filtros de abertos. Verificado contra a fonte: o PRR tem 88 avisos abertos
-- (admin-ajax, params[avisos][]=aberto) e a nossa BD só mostrava 9.
--
-- Solução: NULL = "prazo por confirmar" (≠ fechado). O agente de enriquecimento
-- preenche a data real a partir da página individual quando ela existir.

-- 1. Permitir NULL (aditivo, sem perda de dados)
ALTER TABLE avisos ALTER COLUMN "dataInicioSubmissao" DROP NOT NULL;
ALTER TABLE avisos ALTER COLUMN "dataFimSubmissao" DROP NOT NULL;

-- 2. Backfill: converter APENAS carimbos de fallback em NULL.
--    Predicado preciso: aviso que a fonte diz estar ativo E cuja data de fim
--    coincide (±5 min) com o instante de criação — assinatura do `new Date()`.
--    Datas reais no passado (avisos genuinamente fechados) NÃO são tocadas.
UPDATE avisos
SET "dataFimSubmissao" = NULL
WHERE ativo
  AND "dataFimSubmissao" IS NOT NULL
  AND abs(extract(epoch FROM ("dataFimSubmissao" - "createdAt"))) < 300;

UPDATE avisos
SET "dataInicioSubmissao" = NULL
WHERE ativo
  AND "dataInicioSubmissao" IS NOT NULL
  AND abs(extract(epoch FROM ("dataInicioSubmissao" - "createdAt"))) < 300;
