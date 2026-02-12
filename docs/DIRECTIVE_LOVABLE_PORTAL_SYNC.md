# DIRECTIVA PARA LOVABLE: Corrigir Sync e-Fatura

**Cola este documento inteiro no Lovable como prompt.**

---

## CONTEXTO CRITICO -- LE ISTO PRIMEIRO

Houve uma confusao fundamental na arquitectura do sync AT. Existem DOIS sistemas separados na AT:

1. **SOAP Webservice (portas 400/700):** So para SUBMETER/REGISTAR faturas. Precisa de software certificado + PFX + mTLS. O IVAzen NAO precisa disto para ler.
2. **Portal Web + JSON endpoints (porta 443):** Para LER/CONSULTAR faturas. Login NIF+password, session cookie, HTTPS standard. SEM mTLS, SEM PFX, SEM certificacao.

**O IVAzen quer LER faturas. O caminho correcto e o Sistema 2 (portal JSON). NAO e "fallback". E o caminho PRINCIPAL e UNICO.**

O NIF do contabilista (232945993) NAO tem 2FA activo. O portal funciona.

---

## O QUE MUDAR

### 1. Eliminar conceito de "fallback" no sync-efatura

No ficheiro `sync-efatura/index.ts`:
- **REMOVER** toda a logica de "tentar mTLS primeiro e fazer fallback para portal"
- Para LEITURA de faturas, ir DIRECTAMENTE para o portal JSON
- O SOAP/mTLS so sera relevante no futuro para SUBMETER faturas -- mover para modulo separado
- Renomear: nao e "portal-fallback", e "portal-sync"

### 2. Corrigir login SPA (fetch-efatura-portal/index.ts:227-231)

O bloco que retorna sucesso apos redirect SPA esta errado. O redirect do acesso.gov.pt nao garante sessao valida no dominio `faturas.portaldasfinancas.gov.pt`.

**Implementar `bootstrapPortalSession()`:**
```
1. Apos login no acesso.gov.pt, abrir https://faturas.portaldasfinancas.gov.pt/painelAdquirente.action
2. Seguir redirects (manual mode) ate 5 saltos
3. Fazer merge de cookies a CADA resposta
4. Verificar que a pagina final NAO contem formulario de login
5. So entao marcar login como OK
```

### 3. Eliminar falso success=0 (fetch-efatura-portal/index.ts:554-569, 655-693)

Quando a query falha por erro de sessao, o codigo devolve `success=true` com 0 faturas. Isto e ERRADO.

**Fix:**
- Guardar resultado por tipo (compras/vendas) separadamente
- Se TODAS as queries falharem: `{ success: false, status: 'error' }`
- Se UMA falhar e outra funcionar: `{ success: true, partial: true, status: 'partial' }`
- So `status: 'success'` quando TODAS as queries pedidas devolverem dados ou zero faturas REAL
- Distinguir "zero faturas porque nao ha" de "zero faturas porque a sessao expirou"

### 4. Corrigir type='ambos' (sync-efatura/index.ts:1055)

Quando `type='ambos'`, o codigo converte para `compras` no portal sync. Isto perde as vendas.

**Fix:** Manter `type` original. Quando `type='ambos'`:
1. Fazer query de compras: `GET /json/obterDocumentosAdquirente.action`
2. Fazer query de vendas: `GET /json/obterDocumentosEmitente.action`
3. Juntar resultados

### 5. Alinhar chave de encriptacao (CRITICO)

**Ficheiro:** `fetch-efatura-portal/index.ts`

A funcao de decrypt usa uma chave diferente das funcoes que gravam credenciais. Isto faz com que as credenciais nunca desencriptem correctamente.

**Fix:** Usar a mesma logica que `import-client-credentials/index.ts:229` e `upload-at-certificate/index.ts:254`:
```typescript
const encryptionKey = Deno.env.get('AT_ENCRYPTION_KEY') ||
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!.substring(0, 32);
```

### 6. Corrigir constraint sync_method (CRITICO)

**Ficheiro:** `sync-efatura/index.ts` + migracao `20260206214212`

O codigo escreve `sync_method='portal-fallback'` mas a constraint da tabela so aceita `api|csv|manual`.

**Fix (escolher UMA opcao):**

**Opcao A (recomendada):** Criar migracao para adicionar 'portal' a constraint:
```sql
ALTER TABLE sync_history
DROP CONSTRAINT IF EXISTS sync_method_check,
ADD CONSTRAINT sync_method_check
CHECK (sync_method IN ('api', 'csv', 'manual', 'portal'));
```

**Opcao B:** Usar `sync_method='api'` e guardar detalhe em metadata:
```typescript
sync_method: 'api',
metadata: { ...metadata, sync_detail: 'portal-json' }
```

---

## ENDPOINTS JSON DO PORTAL E-FATURA

Estes sao os endpoints reais usados pelo portal via AJAX. Funcionam com session cookie apos login:

```
Base URL: https://faturas.portaldasfinancas.gov.pt

Login:     POST /geral/login (via acesso.gov.pt)
Bootstrap: GET  /painelAdquirente.action
Compras:   GET  /json/obterDocumentosAdquirente.action?dataInicioFilter=YYYY-MM-DD&dataFimFilter=YYYY-MM-DD
Vendas:    GET  /json/obterDocumentosEmitente.action?dataInicioFilter=YYYY-MM-DD&dataFimFilter=YYYY-MM-DD
```

**Referencia de implementacao real:**
- https://github.com/fcustodio90/efatura (Ruby, usa Mechanize + JSON)
- https://github.com/fabiohbarbosa/e-fatura (Node.js, session cookie)

Consulta estes repos para ver exactamente como o login e session management funcionam.

---

## FLUXO MULTI-CLIENTE

O contabilista tem 20 clientes com credenciais na tabela `at_credentials`. Para cada sync:

1. Ler credenciais encriptadas do cliente (NIF + password)
2. Desencriptar com a chave correcta (Bug 5 acima)
3. Login no portal com as credenciais DO CLIENTE
4. Fetch faturas
5. Gravar associadas ao `client_id`
6. Log em `sync_history` com `sync_method='portal'`

**CADA cliente usa as SUAS credenciais.** O contabilista nao usa o seu NIF para aceder aos dados dos clientes.

---

## O QUE NAO MEXER

- OCR / extract-invoice-data: manter como esta
- Upload manual de PDFs: manter
- Import CSV/Excel/SAF-T: manter
- QR code scanning: manter
- Classify-invoice: manter
- Modelo 10 / exportacoes: manter
- Codigo SOAP/mTLS: NAO apagar, mover para modulo separado para uso futuro

---

## TESTE DE VALIDACAO

Apos implementar TODOS os fixes acima, testar:

1. Login com NIF de teste (232945993/1) -- deve autenticar sem erro
2. Fetch faturas de compras -- deve devolver JSON com faturas ou zero real
3. Fetch faturas de vendas -- idem
4. Fetch type='ambos' -- deve devolver compras E vendas
5. Credenciais erradas -- deve devolver erro claro, NAO success=true
6. Gravar na DB -- sync_method nao deve violar constraint
7. Repetir com 2 clientes diferentes -- multi-client funciona
