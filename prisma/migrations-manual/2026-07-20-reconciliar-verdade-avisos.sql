-- Reconciliação da verdade dos avisos (2026-07-20)
--
-- Auditoria contra as fontes revelou dois desvios independentes:
--
-- A) CARIMBOS DE PRAZO: avisos que a fonte diz estarem ABERTOS mas cujo prazo
--    não é publicado na listagem recebiam `new Date()` do sync, nascendo com
--    prazo "hoje" e desaparecendo dos filtros. Verificado: o PRR publica 88
--    avisos abertos (admin-ajax params[avisos][]=aberto); mostrávamos 9.
--    Correção: NULL = "prazo por confirmar" (≠ fechado).
--
-- B) REGISTOS ÓRFÃOS: o sync só fazia upsert, nunca reconciliava desaparecidos.
--    953 registos de fevereiro/2026 (490 PRR, 417 PT2030, 46 PEPAC) já não
--    constam das fontes mas continuavam ativo=true, poluindo listas e chatbot.
--    Correção: marcar ativo=false (mantém histórico, sai dos "abertos").
--    O sync passa a fazer esta reconciliação por portal a cada corrida
--    bem-sucedida — ver reconcilePortal() em scripts/sync-avisos-to-db.ts.

-- A) Prazos não fiáveis → NULL (só registos frescos que a fonte diz abertos)
UPDATE avisos
SET "dataFimSubmissao" = NULL
WHERE ativo
  AND "updatedAt"::date = CURRENT_DATE
  AND "dataFimSubmissao" IS NOT NULL
  AND "dataFimSubmissao" < now();

UPDATE avisos
SET "dataInicioSubmissao" = NULL
WHERE "dataFimSubmissao" IS NULL
  AND "dataInicioSubmissao" IS NOT NULL
  AND "updatedAt"::date = CURRENT_DATE
  AND "dataInicioSubmissao"::date = "updatedAt"::date;

-- B) Órfãos → ativo=false, apenas nos portais efetivamente sincronizados hoje
UPDATE avisos
SET ativo = false
WHERE ativo
  AND "updatedAt"::date < CURRENT_DATE
  AND portal IN (
      SELECT portal FROM avisos
      WHERE "updatedAt"::date = CURRENT_DATE
      GROUP BY portal
      HAVING count(*) >= 10   -- guarda: só portais com corrida saudável hoje
  );
