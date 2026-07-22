# Guião de demo — Fernando (TA Consulting)

> Objetivo: Fernando vê o loop core **nos dados dele** e sai com um piloto pago
> (€500–1.500/mês) em cima da mesa. Duração alvo: **15 minutos**. Tudo o resto é conversa.

## Pré-demo (checklist, 10 min antes)

- [ ] `npm run dev` a correr e `http://localhost:3000` abre sem badge de erro
- [ ] Avisos enriquecidos (correr `npx tsx scripts/enrich-avisos.ts --commit` antes da demo — sem isto os cards dizem "não especifica" em 4 de 6 critérios)
- [ ] 1 empresa REAL do Fernando carregada (do CSV Bitrix) com CAE, setor, região e dimensão preenchidos
- [ ] Login de demo a funcionar; dashboard abre no separador Avisos
- [ ] Fechar separadores/notificações do browser; zoom a 100%

## Ato 1 — O gancho (2 min, sem login)

1. Abrir a **homepage** — deixar respirar 5 segundos. (Primeira impressão: isto não é um Excel de consultora.)
2. Uma frase: *"Qualquer PME chega aqui e em 30 segundos sabe a que fundos tem direito — e tu recebes o lead."*
3. Clicar **Ver os meus fundos** → `/encontrar-fundos`.

## Ato 2 — Elegibilidade explicável (5 min) — O DIFERENCIADOR

1. Preencher com o perfil de uma **empresa real do Fernando** (ex.: cliente de turismo dele): setor, dimensão, região.
2. Nos resultados, apontar para UM card e ler os critérios em voz alta:
   - *"Não é um score cego — diz-te PORQUÊ: setor ✓, região ✓, prazo 26 dias, CAE por confirmar."*
   - Mostrar que o score diz "com base em N de 6 critérios" — honestidade = confiança.
3. Clicar **Quero ajuda** num aviso → mostrar o modal. *"Este pedido cai-te no email e no HubSpot. Isto é o teu funil de entrada a trabalhar sozinho."*
   ⚠️ NÃO submeter o form na demo (cria lead real + emails).

## Ato 3 — O dia-a-dia do consultor (5 min, com login)

1. **Dashboard → Avisos**: filtros por portal/prazo. *"10 portais varridos todos os dias — nunca mais abres 10 sites."*
2. **Empresas**: abrir a empresa real dele → recomendações de avisos para ELA.
3. **Chatbot**: fazer 1 pergunta concreta sobre um aviso aberto (ex.: *"Que despesas são elegíveis neste aviso?"*) → resposta **com citação** do regulamento.
   - Fallback: se o chat hesitar, voltar ao card de elegibilidade — o valor já ficou provado no Ato 2.

## Fecho (3 min)

- *"O que viste: descoberta automática, elegibilidade explicável, leads a entrar. Piloto: os teus clientes carregados, alertas ativos, €X/mês, cancelas quando quiseres."*
- Pedir a data: **"Fazemos o piloto arrancar esta semana?"**
- Se sim → email de follow-up no dia: CSV Bitrix + DPA + acesso.

## Anti-demos (não fazer)

- Não mostrar /pricing na demo (a conversa de preço é ao vivo, não numa tabela).
- Não abrir avisos com veredicto "A confirmar" no Ato 2 — escolher cards com 3+ critérios verdes.
- Não prometer white-label / API — é GATED até haver pagamento (plano ponte-pragmática).
