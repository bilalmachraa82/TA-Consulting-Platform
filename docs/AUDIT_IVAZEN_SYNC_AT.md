# Auditoria Critica: IVAzen + Sync AT

**Data:** 2026-02-11
**Auditor:** Claude Opus 4.6 (via TA-Consulting-Platform)
**Objecto:** Avaliacao critica do relatorio do Lovable AI sobre o estado do IVAzen

---

## TL;DR

O Lovable AI mistura factos reais com afirmacoes nao verificaveis e em alguns casos enganosas. A limitacao de mTLS no Supabase Edge Runtime e real, mas a solucao proposta (proxy VPS) e desnecessariamente complexa. **A alternativa mais pragmatica e integrar com um software de faturacao ja certificado pela AT (InvoiceXpress, Moloni ou Bill.pt) via as suas REST APIs**, em vez de construir a ligacao SOAP/mTLS do zero.

---

## 1. Verificacao Factual: O Que Confirmei

### 1.1 Neste Repositorio (TA-Consulting-Platform)

**FACTO:** Este repositorio NAO contem nenhum codigo IVAzen. Zero.

- Nao existe directorio `supabase/functions/`
- Nao existe `sync-efatura`, `extract-invoice-data`, `classify-invoice`
- Nao existe codigo SOAP, mTLS, WS-Security, PFX parsing
- Nao existe OCR de facturas, QR code scanning, SAFT importer
- Nao existe nenhuma referencia a "IVAzen", "efatura" ou integracao AT
- O projecto usa **Next.js 14 + Netlify** (nao Supabase Edge Functions)

**Conclusao:** O IVAzen e um projecto separado no Lovable. Nao posso auditar o codigo directamente.

### 1.2 Limitacao mTLS no Supabase Edge Runtime

**VERDADE CONFIRMADA.** Investiguei a fundo:

- `Deno.createHttpClient` (a unica forma de passar certificados de cliente no Deno) **NAO esta disponivel** no Supabase Edge Functions em producao
- `node:tls` **NAO e suportado** no ambiente browser do Supabase Edge
- Isto e confirmado por multiplas discussions no GitHub do Supabase ([#22833](https://github.com/orgs/supabase/discussions/22833), [#21200](https://github.com/orgs/supabase/discussions/21200), [#14604](https://github.com/orgs/supabase/discussions/14604))

**POREM:** O Lovable exagera a explicacao. Nao e um problema de "cipher suites do rustls" -- e simplesmente que a API `createHttpClient` nao esta disponivel no runtime deployed. O problema e mais simples do que o Lovable descreve.

### 1.3 Portas da AT

**VERDADE CONFIRMADA.** Os webservices da AT usam portas nao-standard:

| Servico | Teste | Producao |
|---------|-------|----------|
| Faturas | Porta 700 | Porta 400 |
| Documentos Transporte | Porta 701 | Porta 401 |
| Series | Porta 722 | Variavel |

Endpoint base: `https://servicos.portaldasfinancas.gov.pt:{porta}/{path}`

A AT exige:
- Certificado SSL de cliente (PFX) emitido/assinado pela AT
- Sub-utilizador com perfil WFA (Webservice Faturacao)
- Envelope SOAP com header WS-Security (Username, Password cifrada, Nonce, Created)
- Chave publica AT para cifrar a password (RSA-OAEP)

### 1.4 Portal 2FA

**PARCIALMENTE VERDADE, com nuances importantes:**

- A 2FA no Portal das Financas esta a ser implementada **por fases**
- **Fase actual (2025-2026):** contribuintes singulares SEM actividade empresarial
- **Fases seguintes:** contribuintes com actividade e contribuintes colectivos
- **Quem acede via Chave Movel Digital ja tem 2FA implicito**
- A Ordem dos Contabilistas Certificados esta a negociar mecanismos alternativos para contabilistas

**Importante:** A 2FA do portal web **NAO afecta os webservices SOAP**. O webservice usa autenticacao propria (certificado PFX + sub-utilizador WFA). Sao canais completamente independentes. O Lovable mistura os dois conceitos.

---

## 2. Avaliacao Critica das Afirmacoes do Lovable

### Afirmacoes que NAO POSSO VERIFICAR (codigo no Lovable):

| Afirmacao | Risco |
|-----------|-------|
| "TODO o codigo SOAP pronto" | ALTO - padrao tipico de LLM: dizer que esta pronto sem testar |
| "8 facturas na base de dados" | MEDIO - pode ser dados de seed, nao reais |
| "QR code scanning FUNCIONA" | ALTO - nao vi nenhuma biblioteca QR nas dependencias |
| "classify-invoice FUNCIONA" | MEDIO - afirmacao vaga |
| "Modelo 10 Zero Delta" | ALTO - afirmacao extraordinaria sem evidencia |
| "OCR com Gemini FUNCIONA" | MEDIO - possivel mas nao testado com dados reais |
| "dpExcelGenerator FUNCIONA" | MEDIO - pode existir mas nao e verificavel |

### Afirmacoes ENGANOSAS:

1. **"Skipping mTLS → using portal fallback directly"** -- Apresenta isto como se o codigo SOAP existisse e fizesse fallback. E mais provavel que o codigo nunca tenha feito uma ligacao mTLS real.

2. **"O problema e que o Deno Edge Runtime nao consegue fazer a ligacao TLS: rustls incompativel com os cipher suites do servidor AT"** -- O problema real e mais simples: `Deno.createHttpClient` nao existe no runtime. Nao e uma incompatibilidade de cipher suites.

3. **"O false positive de credenciais invalidas foi resolvido"** -- Implica que o portal scraping funcionava antes. Duvido que alguma vez tenha funcionado de forma fiavel.

4. **"100% do codigo SOAP pronto. So precisa de mudar o destino"** -- Red flag classico de LLM. "Esta tudo pronto, so falta uma coisa" e o padrao mais comum de AI overconfidence.

### Afirmacoes CORRECTAS:

1. Limitacao de mTLS no Supabase Edge Runtime -- verdade
2. Necessidade de proxy externo para mTLS -- tecnicamente correcto mas ha alternativas melhores
3. Upload manual como alternativa -- sim, funciona
4. Import CSV/Excel como alternativa -- possivel

---

## 3. A AT Aceita Este Tipo de Conexao?

### O que a AT aceita oficialmente:

1. **Webservice SOAP com certificado de cliente (mTLS)** -- o metodo standard
   - Requer software certificado pela AT
   - Certificado PFX emitido pela AT
   - Sub-utilizador com perfil WFA
   - Portas especificas (400/700 etc.)

2. **Ficheiro SAF-T (PT)** -- submissao manual ou automatica no portal
   - Upload no portal e-Fatura
   - Nao requer certificado de software

3. **Plataforma iAP** -- interoperabilidade da AP
   - Suporta SOAP (XML) e REST (JSON)
   - Requer adesao formal

4. **APIs de software certificado** -- via InvoiceXpress, Moloni, Bill.pt, etc.
   - REST APIs standard (JSON/XML)
   - Funcionam em qualquer runtime
   - O software certificado faz o mTLS por ti

### O que a AT NAO aceita:

- Scraping do portal web (viola ToS)
- Conexoes sem certificado de software certificado
- Software nao certificado a comunicar directamente via webservice

### Resposta directa: "A AT aceita este tipo de conexao?"

**Um proxy mTLS so funciona se o IVAzen tiver certificado de software certificado pela AT.** Sem essa certificacao, nao importa se o envelope SOAP esta perfeito -- a AT rejeita a ligacao. Obter certificacao de software pela AT e um processo formal que envolve:
- Pedido formal a AT
- Demonstracao de conformidade (Portaria 363/2010)
- Certificado de software emitido pela AT

**Pergunta critica que o Lovable NUNCA abordou: O IVAzen tem certificacao de software pela AT?** Se nao tem, NENHUM dos caminhos (mTLS directo ou proxy) funciona.

---

## 4. Alternativas Reais (por ordem de pragmatismo)

### Opcao A: Integrar com Software Certificado via API (RECOMENDADO)

**Em vez de construir o mTLS do zero, usar a API de um software que ja esta certificado:**

| Software | API | Preco | Tipo |
|----------|-----|-------|------|
| [Bill.pt](https://api.bill.pt/) | REST/JSON | Variavel | API completa |
| [InvoiceXpress](https://invoicexpress.helpscoutdocs.com/) | REST/XML | Desde 10 EUR/mes | API com webhooks |
| [Moloni](https://www.moloni.pt/) | REST/OAuth2 | Desde 20 EUR/mes | API completa |

**Vantagens:**
- Zero preocupacoes com mTLS, SOAP, certificados
- REST API standard -- funciona em Supabase Edge, Lovable, qualquer runtime
- Ja certificados pela AT
- Comunicacao automatica de facturas incluida
- SAF-T gerado automaticamente

**Como funcionaria:**
1. Criar conta no software certificado (ex: InvoiceXpress)
2. Obter API key
3. O IVAzen chama a REST API para criar/listar facturas
4. O software certificado comunica automaticamente com a AT
5. Zero proxy, zero mTLS, zero SOAP custom

**Esforco:** Minimo. Chamadas HTTP standard a uma REST API.

### Opcao B: Import SAF-T / CSV / Excel

**O contabilista exporta o SAF-T do software de faturacao e importa no IVAzen.**

- Nao requer nenhuma ligacao a AT
- Dados fiaveis (vem do software oficial)
- Manual mas simples
- Ja parcialmente implementado segundo o Lovable

### Opcao C: Proxy mTLS (so se tiveres certificacao AT)

**A solucao proposta pelo Lovable. Tecnicamente possivel MAS:**

1. Precisas de certificacao de software pela AT (processo formal)
2. Precisas de manter um VPS (3-5 EUR/mes + manutencao)
3. Tens de lidar com renovacao anual do certificado PFX
4. Tens de implementar e testar o SOAP/WS-Security correctamente
5. Qualquer mudanca nos endpoints da AT parte o sistema

**Quando faz sentido:** So se o IVAzen ambicionar ser um software de faturacao certificado pela AT. Se e "apenas" uma ferramenta de contabilidade/gestao de IVA, a Opcao A e muito mais pragmatica.

### Opcao D: Scraping do Portal (NAO RECOMENDADO)

- Viola os termos de uso
- 2FA torna impossivel a medio prazo
- Fragil (qualquer mudanca no HTML parte)
- Nao fiavel para uso profissional

---

## 5. O Que Recomendo Concretamente

### Passo 1: Decidir o scope do IVAzen

**Pergunta fundamental:** O IVAzen e para:

**(a)** Gerir IVA como contabilista (ler dados, classificar, gerar declaracoes)?
→ Usa **Opcao A** (API de software certificado) ou **Opcao B** (import SAF-T)

**(b)** Ser um software de faturacao completo certificado pela AT?
→ Precisa de certificacao AT formal. So entao a Opcao C faz sentido.

### Passo 2: Se Opcao A (o que recomendo)

1. **Escolher o software** -- InvoiceXpress tem a API mais simples, Moloni e mais completo
2. **Registar e obter API key** -- processo de minutos
3. **Implementar integracao REST** -- 1-2 edge functions no Supabase para ler facturas via API
4. **Eliminar todo o codigo SOAP/mTLS** -- complexidade desnecessaria

### Passo 3: Verificar o que realmente funciona no Lovable

Antes de mais nada, testa TU directamente:
1. Faz upload de um PDF de factura real -- o OCR funciona?
2. Tenta o QR code scan -- funciona de verdade?
3. Verifica os 8 registos na base de dados -- sao reais ou seed data?
4. Exporta um Excel -- tem dados correctos?

**Nao confies no "FUNCIONA" do Lovable sem testar tu proprio.**

### Passo 4: O que EU posso fazer aqui

Neste repositorio (TA-Consulting-Platform), posso:
- Escrever scripts de integracao com APIs de faturacao (InvoiceXpress/Moloni/Bill.pt)
- Criar directivas para o fluxo de importacao de dados fiscais
- Implementar logica de validacao de IVA
- Preparar templates para Modelo 10 / declaracoes
- Criar testes automatizados para validar calculos

---

## 6. Resumo Final

| Aspecto | Lovable Diz | Realidade |
|---------|-------------|-----------|
| Codigo SOAP pronto | "100% pronto" | Nao verificavel, provavelmente exagerado |
| mTLS bloqueado | Verdade | Verdade, mas explicacao tecnica imprecisa |
| Portal 2FA | "Bloqueia tudo" | So afecta portal web, NAO webservices SOAP |
| Proxy e a unica solucao | Sim | NAO -- APIs de software certificado sao melhor alternativa |
| OCR funciona | "Funcional mas nao testado" | Auto-contraditorio. Se nao foi testado, nao e funcional |
| 8 facturas na DB | Sim | Podem ser seed data, nao dados reais |
| QR scanning funciona | Sim | Nao verificavel |
| Falta pouco | "5 minutos + 1 dia" | Red flag de AI overconfidence |

### A Pergunta Mais Importante que Ninguem Fez:

**O IVAzen tem certificacao de software pela AT?**

Se NAO (que e quase certo), entao:
- O proxy mTLS NAO funciona (a AT rejeita software nao certificado)
- O scraping do portal NAO e viavel (2FA + ToS)
- A UNICA opcao realista e integrar via API de software JA certificado

---

## Fontes

- [AT Manual Integracao Software](https://www.occ.pt/fotos/editor2/comunicacao_dados_faturas_2013_02_28.pdf)
- [GitHub AtWS - Webservice AT (Delphi)](https://github.com/nunopicado/AtWS)
- [Exemplo WCF Documentos Transporte](https://gist.github.com/donelodes/5344545)
- [Supabase Edge Functions - SSL Discussion](https://github.com/orgs/supabase/discussions/22833)
- [Supabase Edge - node:tls not supported](https://github.com/orgs/supabase/discussions/21200)
- [Deno mTLS Issue #6170](https://github.com/denoland/deno/issues/6170)
- [Portal Financas 2FA](https://www.gov.pt/noticias/acesso-ao-portal-das-financas-com-autenticacao-em-dois-passos)
- [Seguranca Social 2FA](https://eco.sapo.pt/2026/01/19/acesso-ao-portal-da-seguranca-social-vai-ficar-mais-complexo-vem-ai-dupla-autenticacao/)
- [Bill.pt API](https://api.bill.pt/)
- [InvoiceXpress API](https://invoicexpress.helpscoutdocs.com/article/89-como-funciona-a-comunicacao-automatica-das-guias-para-a-autoridade-tributaria)
- [Moloni](https://www.moloni.pt/)
- [iAP Plataforma Integracao](https://www.iap.gov.pt/web/iap/plataforma-de-integracao)
- [Portugal-a-Programar: Webservices AT](https://www.portugal-a-programar.pt/forums/topic/57734-utilizar-webservices-da-at/)
