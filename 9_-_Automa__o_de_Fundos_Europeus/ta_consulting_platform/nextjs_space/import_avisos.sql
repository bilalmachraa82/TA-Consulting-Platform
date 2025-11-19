-- ACORES2030-2025-26: Construir 2030 - Negócios Estruturantes
INSERT INTO avisos (
  id, nome, portal, programa, codigo,
  "dataInicioSubmissao", "dataFimSubmissao",
  "montanteMaximo", "descrição", link,
  regiao, urgente, ativo, "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'Construir 2030 - Negócios Estruturantes',
  'PORTUGAL2030',
  'Programa Regional dos Açores 2021-2027',
  'ACORES2030-2025-26',
  '2025-11-03 09:00:00'::timestamp,
  '2025-12-30 18:00:00'::timestamp,
  20000000,
  'Europa mais inteligente - Crescimento e competitividade das PMEs',
  'https://portugal2030.pt/avisos/ACORES2030-2025-26',
  'ACORES2030',
  false,
  true,
  NOW(),
  NOW()
) ON CONFLICT (codigo) DO UPDATE SET
  nome = EXCLUDED.nome,
  "dataFimSubmissao" = EXCLUDED."dataFimSubmissao",
  "montanteMaximo" = EXCLUDED."montanteMaximo",
  urgente = EXCLUDED.urgente,
  ativo = EXCLUDED.ativo,
  "updatedAt" = NOW();

-- NORTE2030-2025-25: Cursos Técnicos Superiores Profissionais (TeSP) — Entidades Privadas (ciclo 2025-2027) 
INSERT INTO avisos (
  id, nome, portal, programa, codigo,
  "dataInicioSubmissao", "dataFimSubmissao",
  "montanteMaximo", "descrição", link,
  regiao, urgente, ativo, "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'Cursos Técnicos Superiores Profissionais (TeSP) — Entidades Privadas (ciclo 2025-2027) ',
  'PORTUGAL2030',
  'Programa Regional do Norte 2021-2027',
  'NORTE2030-2025-25',
  '2025-11-03 08:00:00'::timestamp,
  '2025-11-28 11:22:00'::timestamp,
  1176470.59,
  'Europa mais social - Acesso à educação e formação',
  'https://portugal2030.pt/avisos/NORTE2030-2025-25',
  'NORTE2030',
  false,
  true,
  NOW(),
  NOW()
) ON CONFLICT (codigo) DO UPDATE SET
  nome = EXCLUDED.nome,
  "dataFimSubmissao" = EXCLUDED."dataFimSubmissao",
  "montanteMaximo" = EXCLUDED."montanteMaximo",
  urgente = EXCLUDED.urgente,
  ativo = EXCLUDED.ativo,
  "updatedAt" = NOW();

-- MAR2030-2025-45: Cessação definitiva das atividades de pesca – Atuneiros - Região Autónoma da Madeira
INSERT INTO avisos (
  id, nome, portal, programa, codigo,
  "dataInicioSubmissao", "dataFimSubmissao",
  "montanteMaximo", "descrição", link,
  regiao, urgente, ativo, "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'Cessação definitiva das atividades de pesca – Atuneiros - Região Autónoma da Madeira',
  'PORTUGAL2030',
  'Programa MAR2030',
  'MAR2030-2025-45',
  '2025-11-07 09:00:00'::timestamp,
  '2025-11-21 18:00:00'::timestamp,
  460000,
  'Europa mais verde - Ajustamento da capacidade de pesca',
  'https://portugal2030.pt/avisos/MAR2030-2025-45',
  'MAR2030',
  true,
  true,
  NOW(),
  NOW()
) ON CONFLICT (codigo) DO UPDATE SET
  nome = EXCLUDED.nome,
  "dataFimSubmissao" = EXCLUDED."dataFimSubmissao",
  "montanteMaximo" = EXCLUDED."montanteMaximo",
  urgente = EXCLUDED.urgente,
  ativo = EXCLUDED.ativo,
  "updatedAt" = NOW();

-- MAR2030-2025-44: Desenvolvimento Sustentável da Aquicultura no Domínio dos Investimentos Produtivos.
INSERT INTO avisos (
  id, nome, portal, programa, codigo,
  "dataInicioSubmissao", "dataFimSubmissao",
  "montanteMaximo", "descrição", link,
  regiao, urgente, ativo, "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'Desenvolvimento Sustentável da Aquicultura no Domínio dos Investimentos Produtivos.',
  'PORTUGAL2030',
  'Programa MAR2030',
  'MAR2030-2025-44',
  '2025-11-07 09:00:00'::timestamp,
  '2025-12-30 18:00:00'::timestamp,
  4285714.29,
  'Europa mais verde - Atividades de aquicultura sustentável',
  'https://portugal2030.pt/avisos/MAR2030-2025-44',
  'MAR2030',
  false,
  true,
  NOW(),
  NOW()
) ON CONFLICT (codigo) DO UPDATE SET
  nome = EXCLUDED.nome,
  "dataFimSubmissao" = EXCLUDED."dataFimSubmissao",
  "montanteMaximo" = EXCLUDED."montanteMaximo",
  urgente = EXCLUDED.urgente,
  ativo = EXCLUDED.ativo,
  "updatedAt" = NOW();

-- ACORES2030-2025-24: Ações Coletivas – 2º Aviso
INSERT INTO avisos (
  id, nome, portal, programa, codigo,
  "dataInicioSubmissao", "dataFimSubmissao",
  "montanteMaximo", "descrição", link,
  regiao, urgente, ativo, "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'Ações Coletivas – 2º Aviso',
  'PORTUGAL2030',
  'Programa Regional dos Açores 2021-2027',
  'ACORES2030-2025-24',
  '2025-10-31 18:00:00'::timestamp,
  '2026-04-30 18:00:00'::timestamp,
  5000000,
  'Europa mais inteligente - Crescimento e competitividade das PMEs',
  'https://portugal2030.pt/avisos/ACORES2030-2025-24',
  'ACORES2030',
  false,
  true,
  NOW(),
  NOW()
) ON CONFLICT (codigo) DO UPDATE SET
  nome = EXCLUDED.nome,
  "dataFimSubmissao" = EXCLUDED."dataFimSubmissao",
  "montanteMaximo" = EXCLUDED."montanteMaximo",
  urgente = EXCLUDED.urgente,
  ativo = EXCLUDED.ativo,
  "updatedAt" = NOW();
