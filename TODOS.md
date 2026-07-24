# TODOS

> Itens adiados conscientemente, com contexto suficiente para retomar daqui a meses.
> Formato: What / Why / Contexto / Depends on. Adicionados via /plan-eng-review.

## 1. Reconciliar o drift de migrations Prisma
- **What:** Fazer baseline do historial de migrations — desde 2026-01-02 todas as mudanças de schema são SQL manual em `prisma/migrations-manual/` (5 ficheiros a 20/07, +1 slug/alertas na fase B).
- **Why:** Cada mudança de schema exige SQL ad-hoc; se alguém correr `prisma migrate dev/deploy` contra o estado atual, o Prisma tenta reconciliar 6+ meses de drift contra a BD de produção (Neon partilhada dev=prod!).
- **Contexto:** O fluxo atual é `prisma db push` + SQL manual. O baseline oficial: `prisma migrate diff` para gerar uma migration inicial do estado atual + `prisma migrate resolve --applied`. Fazer numa semana calma, NUNCA na véspera de demo. Adicionado 2026-07-23 durante o eng review da fase B (máquina de leads).
- **Depends on:** nada tecnicamente; agendamento fora de semanas de demo/piloto.

## 2. Scraper Horizon Europe: extrair descrições completas
- **What:** O scraper HE só captura títulos — 255 avisos falharam o enriquecimento IA ("extração vazia") a 23/07 e ficam noindex/thin nas páginas públicas.
- **Why:** ~70% da base europeia fechada ao SEO e ao matching; o chatbot não consegue responder sobre esses avisos.
- **Contexto:** O portal Funding & Tenders da UE é JS-pesado; o scraper atual (apify-actors/) não desce ao detalhe do topic. Alternativa a explorar: a API pública SEDIA/F&T (JSON) em vez de scraping HTML. Depois de corrigido, re-correr `npx tsx scripts/enrich-avisos.ts --commit` (~$0.20).
- **Depends on:** fase B live primeiro — provar o valor do SEO PT antes de investir no europeu.

## 3. Tema claro completo (light mode)
- **What:** O light mode estava meio-temático (sidebar escura em fundo claro, chat ilegível, glass invisível) — foi FORÇADO dark a 24/07 (`forcedTheme="dark"` em components/providers.tsx) e o toggle removido do header.
- **Why:** Contraste quebrado em dezenas de sítios; consertar à peça era whack-a-mole.
- **Contexto:** Para reativar light: criar palete clara completa nos tokens (globals.css + variantes .glass claras), auditar todos os componentes com cores hardcoded (bg-white, text-white, slate-*), repor o toggle. Projeto de ~1-2 sessões CC.
- **Depends on:** decisão de negócio (o cliente pede light? consultoras usam de dia).

## 4. Elegibilidade: empty state confuso com Base cheia
- **What:** /dashboard/elegibilidade diz "Sem empresas registadas" quando a Base tem 8 — filtra por empresas DO utilizador sem explicar nem dar CTA para a Base/atribuição.
- **Why:** Utilizador novo pensa que a app está vazia/partida (feedback real do founder 24/07).
- **Contexto:** Ou mostrar também empresas da Base com aviso "não atribuída a ti", ou empty state que explique + link "Ver Base de Empresas" + ação "atribuir a mim".

## 5. Validação Humana no chat (fluxo real)
- **What:** Botão removido a 24/07 porque o toast era FAKE ("consultor valida em 2h" sem processo por trás).
- **Why:** Prometer SLA inexistente destrói confiança na demo.
- **Contexto:** Quando voltar: criar registo de pedido (tabela + notificação email ao admin) e SLA honesto.
