# Segurança — Rotação de Chaves de API

> Criado: 2026-07-08 · Estado: **AÇÃO PENDENTE DO ADMINISTRADOR**

## Contexto

Foram encontradas chaves de API em commits antigos do histórico git (p. ex. uma
chave OpenRouter no commit `be43e82`, e `DEMO_TEST_REPORT.md` refere Stripe e
outras). O HEAD atual está limpo — a exposição é **apenas no histórico** — mas
qualquer pessoa com acesso de leitura ao repositório consegue recuperar essas
chaves. **A rotação é obrigatória independentemente de reescrever o histórico.**

## Checklist de rotação (fazer no dashboard de cada serviço + Vercel)

Para cada chave: gerar nova → atualizar em Vercel (Settings → Environment
Variables) → revogar a antiga → confirmar que a app continua funcional.

- [ ] `OPENROUTER_API_KEY` (openrouter.ai — exposição confirmada no histórico)
- [ ] `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` (dashboard.stripe.com)
- [ ] `GEMINI_API_KEY` (aistudio.google.com)
- [ ] `RESEND_API_KEY` (resend.com)
- [ ] `NEXTAUTH_SECRET` (gerar: `openssl rand -base64 32` — invalida sessões ativas)
- [ ] `BITRIX_WEBHOOK_URL` (recriar inbound webhook no Bitrix24)
- [ ] `APIFY_TOKEN` (console.apify.com)
- [ ] `FIRECRAWL_API_KEY` (firecrawl.dev)
- [ ] `NEON_API_KEY` (console.neon.tech) e considerar reset da password da BD
- [ ] `ANTHROPIC_API_KEY` (console.anthropic.com)
- [ ] Conta `admin@taconsulting.pt`: a password de teste esteve documentada
      em `docs_archive/FASE_1_IMPLEMENTADA.md` (histórico git) — se a conta
      existir em produção, trocar a password imediatamente

## Decisão pendente: reescrever o histórico?

- **Só rotação (recomendado):** suficiente se todas as chaves acima forem
  revogadas. Zero disrupção.
- **`git filter-repo`:** remove as chaves do histórico mas quebra todos os
  clones/forks existentes e exige force-push coordenado. Só vale a pena se
  houver dados sensíveis além de chaves revogáveis.

## Prevenção (já implementada)

- Job `gitleaks` no CI (`.github/workflows/ci.yml`) faz scan do working tree
  em cada push/PR e bloqueia a introdução de novos segredos.
- `.env.example` completo — nunca commitar `.env` (está no `.gitignore`).
