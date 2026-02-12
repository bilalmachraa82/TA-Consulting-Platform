# IVAzen Sync AT -- Auditoria Final & Directiva de Implementacao

**Data:** 2026-02-12 (v3 -- definitiva)
**Auditor:** Claude Opus 4.6
**Estado:** ALINHADO -- sem 2FA, caminho livre

---

## Decisao Final

**Para LER faturas do e-Fatura nao e preciso software certificado, PFX, mTLS, ou SOAP.**

A AT tem dois sistemas completamente separados:

| | Sistema 1: SOAP Webservice | Sistema 2: Portal + JSON |
|---|---|---|
| **Para que serve** | SUBMETER/REGISTAR faturas | LER/CONSULTAR faturas |
| **Portas** | 400 (prod), 700 (teste) | 443 (HTTPS standard) |
| **Autenticacao** | PFX + mTLS + WFA sub-user | NIF + password (session cookie) |
| **Certificacao AT** | OBRIGATORIA | NAO necessaria |
| **Operacoes** | RegisterInvoice (so escrita) | obterDocumentosAdquirente (leitura) |

**O IVAzen quer LER faturas. Usa Sistema 2. Ponto final.**

O NIF do Bilal (232945993) NAO tem 2FA activo. O caminho esta livre.

---

## O Que Ja Temos (acessos AT configurados)

- 20 clientes com credenciais AT na base de dados
- Sub-utilizador 232945993/1 (pode ser usado para login no portal)
- PFX carregado (guardado para futuro uso de submissao, NAO necessario para leitura)
- Chave publica AT (idem)

**Nada foi desperdicado.** O sub-utilizador funciona para login no portal.

---

## Arquitectura Correcta para Sync de Leitura

### Fluxo: Para CADA cliente

```
1. Desencriptar credenciais AT do cliente (NIF + password)
2. POST login em faturas.portaldasfinancas.gov.pt
3. Capturar session cookies
4. Bootstrap sessao: GET painelAdquirente.action (seguir redirects, merge cookies)
5. Validar que a sessao esta autenticada (pagina sem formulario de login)
6. GET /json/obterDocumentosAdquirente.action?dataInicioFilter=YYYY-MM-DD&dataFimFilter=YYYY-MM-DD
7. Parse JSON com lista de faturas
8. Gravar na tabela invoices com sync_method adequado
9. Repetir para compras E vendas se type='ambos'
```

### Endpoints JSON conhecidos do portal e-Fatura

| Endpoint | Funcao |
|----------|--------|
| `/json/obterDocumentosAdquirente.action` | Listar facturas como comprador |
| `/json/obterDocumentosEmitente.action` | Listar facturas como emitente |
| `/consultarDocumentosAdquirente.action` | Pagina HTML de consulta (para bootstrap) |
| `/painelAdquirente.action` | Painel do adquirente (para validar sessao) |

### Projectos de referencia (codigo real, funcional):
- [fcustodio90/efatura](https://github.com/fcustodio90/efatura) -- Ruby gem, login + JSON via AJAX
- [fabiohbarbosa/e-fatura](https://github.com/fabiohbarbosa/e-fatura) -- Node.js, session cookie + JSON
- [Login e-fatura via cURL](https://www.portugal-a-programar.pt/forums/topic/75856-login-e-fatura-via-curl/) -- cURL puro

---

## Bugs a Corrigir no Lovable (do Plano v2, validados)

Estes 5 bugs sao reais e devem ser corrigidos. A mudanca conceptual e: **portal NAO e "fallback", e o caminho PRINCIPAL e UNICO para leitura.**

### Bug 1: Falso sucesso de login SPA
- **Ficheiro:** `fetch-efatura-portal/index.ts:227-231`
- **Problema:** Retorna sucesso apos redirect SPA sem sessao real no dominio `faturas`
- **Fix:** Criar `bootstrapPortalSession()` que abre `painelAdquirente.action`, segue redirects, faz merge de cookies, e so confirma login se a pagina estiver autenticada

### Bug 2: Success=true com 0 faturas quando houve erro
- **Ficheiro:** `fetch-efatura-portal/index.ts:554-569, 655-693`
- **Problema:** Erro de sessao/query mascarado como "nenhuma factura encontrada"
- **Fix:** Separar resultado por tipo (compras/vendas). Se todas falharem: `success=false`. Se parcial: `partial=true`. Nunca devolver "0 faturas" quando houve erro

### Bug 3: `ambos` convertido para `compras` no sync
- **Ficheiro:** `sync-efatura/index.ts:1055`
- **Problema:** Quando `type='ambos'`, o fallback so pede compras
- **Fix:** Enviar `type` original. Executar query dupla (compras + vendas) quando `type='ambos'`

### Bug 4: Chave de encriptacao inconsistente (CRITICO)
- **Ficheiro:** `fetch-efatura-portal/index.ts`
- **Problema:** Usa chave de decrypt diferente (`AT_ENCRYPTION_KEY` vs fallback fixo) das funcoes que gravam credenciais
- **Fix:** Alinhar com `import-client-credentials/index.ts:229` e `upload-at-certificate/index.ts:254`. Usar `AT_ENCRYPTION_KEY || SUPABASE_SERVICE_ROLE_KEY.substring(0, 32)`

### Bug 5: Constraint DB `sync_method` (CRITICO)
- **Ficheiro:** `sync-efatura/index.ts` + migracao `20260206214212`
- **Problema:** Escreve `sync_method='portal-fallback'` mas constraint so aceita `api|csv|manual`
- **Fix:** Opcao A: Adicionar `'portal'` a constraint. Opcao B: Usar `sync_method='api'` + `metadata.sync_detail='portal-json'`

---

## Mudanca Conceptual Obrigatoria

O Lovable deve eliminar o conceito de "fallback" para leitura de faturas:

| Antes (errado) | Depois (correcto) |
|-----------------|-------------------|
| Tenta SOAP/mTLS primeiro | **Eliminar** tentativa SOAP para leitura |
| Se falha, "fallback" para portal | Portal e o caminho **principal e unico** |
| Portal e backup | Portal e a **arquitectura correcta** |
| mTLS e o objectivo | mTLS so para SUBMETER (futuro) |

### O que manter do SOAP/mTLS:
- Guardar o codigo para futuro uso de SUBMISSAO de faturas
- NAO executar no fluxo de leitura
- Mover para modulo separado (ex: `submit-invoice/`)

### O que mudar no `sync-efatura`:
- Remover toda a logica de "tentar mTLS primeiro"
- Ir directamente para portal JSON quando o objectivo e LER
- Renomear conceitos: nao e "fallback", e "portal-sync"

---

## Fluxo Multi-Cliente (Contabilista)

O contabilista (Bilal, NIF 232945993) tem 20 clientes. Para cada cliente:

1. Ler credenciais AT do cliente da tabela `at_credentials` (encriptadas)
2. Desencriptar com `AT_ENCRYPTION_KEY`
3. Login no portal com NIF+password DO CLIENTE (nao do contabilista)
4. Fetch faturas via JSON endpoints
5. Gravar na tabela `invoices` associadas ao `client_id`
6. Log do sync em `sync_history`

**Nota:** Cada cliente tem as suas proprias credenciais do portal. O contabilista nao usa as SUAS credenciais para aceder aos dados dos clientes. Cada login e feito com o NIF do cliente.

**Excepcao:** Se o contabilista tiver procuracao/autorizacao no portal para aceder em nome do cliente, pode usar as suas proprias credenciais. Verificar com cada cliente qual o mecanismo de acesso.

---

## Validacao: Como saber que funciona

Apos implementar os fixes:

1. **Teste com 1 cliente:** Login + fetch faturas + gravar na DB
2. **Verificar:** Numero de faturas obtidas vs numero visivel no portal manualmente
3. **Teste multi-cliente:** Repetir para 3 clientes diferentes
4. **Verificar sync_method:** Deve gravar correctamente na DB sem violar constraint
5. **Verificar encriptacao:** Credenciais devem desencriptar com a mesma chave usada para gravar
6. **Teste type=ambos:** Deve retornar compras E vendas

---

## Fontes

- [fcustodio90/efatura (Ruby gem)](https://github.com/fcustodio90/efatura) -- Login + JSON endpoints
- [fabiohbarbosa/e-fatura (Node.js)](https://github.com/fabiohbarbosa/e-fatura) -- Session cookie approach
- [CentralGest Importador E-Fatura](https://www.centralgest.com/software/contabilidade/importador-efatura) -- Software comercial
- [Login e-fatura via cURL](https://www.portugal-a-programar.pt/forums/topic/75856-login-e-fatura-via-curl/) -- Abordagem cURL
- [AT FAQ Webservice](https://info.portaldasfinancas.gov.pt/pt/apoio_contribuinte/questoes_frequentes/pages/faqs-00996.aspx) -- FAQ oficial
- [AT Manual Integracao Software](https://www.occ.pt/fotos/editor2/comunicacao_dados_faturas_2013_02_28.pdf) -- Manual oficial
- [Supabase Edge mTLS Discussion](https://github.com/orgs/supabase/discussions/22833) -- Limitacao confirmada
- [GitHub AtWS (Delphi)](https://github.com/nunopicado/AtWS) -- Referencia SOAP (para futuro)
