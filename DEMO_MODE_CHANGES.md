# DEMO MODE - Autenticação Desativada

## Data: 2026-01-13
## Status: ATIVO PARA DEMO

---

## Resumo das Alterações

A autenticação foi **desativada temporariamente** para a demo de amanhã. Todas as páginas do dashboard estão acessíveis sem login.

---

## Ficheiros Modificados

### 1. `middleware.ts` (linha 11)
**Estado:** Já estava desativado (comentado)
```typescript
// '/dashboard/:path*', // DEMO MODE: Disabled auth for dashboard
```

### 2. `app/dashboard/layout.tsx` (linhas 20-32)
**Estado:** Modo demo ativo com sessão mock
```typescript
// const session = await getServerSession(authOptions)
// if (!session) { redirect('/auth/login') }

// DEMO MODE: Mock Session for Layout
const session = { user: { name: 'Demo User', email: 'demo@taconsulting.pt', image: null } }
```

### 3. `app/dashboard/page.tsx` (linhas 10-22)
**Estado:** Modo demo ativo
```typescript
// const session = await getServerSession(authOptions)
// if (!session) { redirect('/api/auth/signin?callbackUrl=/dashboard') }

// DEMO MODE: Mock Session to ensure presentation stability
const session = { user: { name: 'Fernando', email: 'demo@taconsulting.pt', image: null } }
```

### 4. Páginas com autenticação desativada (NOVO)

As seguintes páginas foram modificadas para **remover** o redirect de login:

- `app/dashboard/avisos/page.tsx` (linhas 64-68)
- `app/dashboard/candidaturas/page.tsx` (linhas 15-19)
- `app/dashboard/empresas/page.tsx` (linhas 64-68)
- `app/dashboard/configuracoes/page.tsx` (linhas 15-19)
- `app/dashboard/workflows/page.tsx` (linhas 15-19)
- `app/dashboard/documentacao/page.tsx` (linhas 15-19)
- `app/dashboard/relatorios/page.tsx` (linhas 15-19)
- `app/dashboard/calendario/page.tsx` (linhas 15-19)
- `app/dashboard/relatorios/print/page.tsx` (linhas 11-15)

**Padrão aplicado a todas:**
```typescript
// ANTES:
const session = await getServerSession(authOptions)
if (!session) {
  redirect('/auth/login')
}

// DEPOIS (DEMO MODE):
// DEMO MODE: Auth disabled for demo
// const session = await getServerSession(authOptions)
// if (!session) {
//   redirect('/auth/login')
// }
```

### 5. Páginas Client (useSession fallback)

As seguintes páginas usam `useSession()` mas têm fallback para demo:
- `app/dashboard/recomendacoes/page.tsx` - Tem fallback try/catch
- `app/dashboard/pos-award/page.tsx` - Usa useSession sem bloqueio
- `app/dashboard/teams/page.tsx` - Usa useSession sem bloqueio
- `app/dashboard/candidaturas/nova/page.tsx` - Usa useSession sem bloqueio

**Não necessitam alteração** - funcionam sem autenticação.

---

## Como REVERTER após a demo

### Opção 1: Reverter manualmente (seguro)

Para cada ficheiro modificado, **descomentar** as linhas:

```typescript
// REMOVER ESTE COMENTÁRIO:
// DEMO MODE: Auth disabled for demo

// DESCOMENTAR ESTAS LINHAS:
const session = await getServerSession(authOptions)
if (!session) {
  redirect('/auth/login')
}
```

**Ficheiros para reverter:**
1. `app/dashboard/layout.tsx`
2. `app/dashboard/page.tsx`
3. `app/dashboard/avisos/page.tsx`
4. `app/dashboard/candidaturas/page.tsx`
5. `app/dashboard/empresas/page.tsx`
6. `app/dashboard/configuracoes/page.tsx`
7. `app/dashboard/workflows/page.tsx`
8. `app/dashboard/documentacao/page.tsx`
9. `app/dashboard/relatorios/page.tsx`
10. `app/dashboard/calendario/page.tsx`
11. `app/dashboard/relatorios/print/page.tsx`

### Opção 2: Usar git revert

Se as alterações foram commitadas:
```bash
git revert <commit-hash>
```

### Opção 3: Script de restauração

Criar script para automatizar a reversão (pode ser criado após a demo).

---

## Verificação

Para verificar que a auth está funcionando após restaurar:

1. Aceder a `http://localhost:3000/dashboard`
2. Deve redirecionar para `/auth/login`
3. Fazer login com credenciais válidas
4. Dashboard deve carregar com dados reais

---

## Segurança

**ATENÇÃO:** Estas alterações **NÃO devem ser deployadas para produção** sem autenticação ativa.

- ✅ OK para: Demo local (localhost)
- ❌ NÃO OK para: Vercel/Produção

---

## Contacto

Se houver dúvidas sobre como reverter, verificar o histórico git ou contactar desenvolvimento.
