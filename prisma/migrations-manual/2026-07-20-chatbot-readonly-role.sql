-- Role read-only para o assistente (defesa em profundidade — requisito da
-- revisão externa de 2026-07-20). A primeira linha de defesa são as ferramentas
-- tipadas (lib/chatbot/tools.ts): o modelo nunca escreve SQL. Este role garante
-- que, mesmo com um bug na camada de ferramentas, a ligação do chatbot não
-- consegue escrever nem ler tabelas de clientes/utilizadores.
--
-- Uso: substituir __PASSWORD__ por uma password forte gerada e aplicar com
--   npx prisma db execute --file <este ficheiro> --schema prisma/schema.prisma
-- Depois definir CHATBOT_DATABASE_URL (mesmo host/db, user chatbot_readonly)
-- e a camada de ferramentas passa a usá-la quando presente.

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'chatbot_readonly') THEN
        CREATE ROLE chatbot_readonly LOGIN PASSWORD '__PASSWORD__';
    END IF;
END
$$;

-- Sem acesso por defeito a nada…
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM chatbot_readonly;
GRANT USAGE ON SCHEMA public TO chatbot_readonly;

-- …e SELECT apenas na tabela de dados públicos que o assistente precisa.
GRANT SELECT ON avisos TO chatbot_readonly;

-- Guarda-chuvas operacionais: queries lentas morrem, sem writes possíveis.
ALTER ROLE chatbot_readonly SET statement_timeout = '5s';
ALTER ROLE chatbot_readonly SET default_transaction_read_only = on;
