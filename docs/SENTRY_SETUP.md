# Sentry Setup para TA Consulting Platform

Este guia mostra como configurar o Sentry para error tracking em produção.

## 1. Instalação

```bash
npx @sentry/wizard@latest -i nextjs
```

Este wizard irá:
- Instalar `@sentry/nextjs`
- Criar ficheiros de configuração
- Pedir o DSN do teu projeto Sentry

## 2. Criar Projeto no Sentry

1. Vai a [sentry.io](https://sentry.io) e cria conta/login
2. Cria um novo projeto Next.js
3. Copia o DSN gerado

## 3. Configurar Environment

Adiciona ao `.env.local`:

```env
SENTRY_DSN=https://xxxxx@o123456.ingest.sentry.io/1234567
SENTRY_AUTH_TOKEN=sntrys_xxxxxx
```

## 4. Ficheiros Criados pelo Wizard

O wizard cria automaticamente:

- `sentry.client.config.ts` - Config client-side
- `sentry.server.config.ts` - Config server-side  
- `sentry.edge.config.ts` - Config Edge Runtime
- `next.config.js` - Atualizado com wrapper Sentry

## 5. Verificar Integração

Adiciona um botão de teste (apenas dev):

```tsx
// Componente temporário para testar
<button onClick={() => { throw new Error('Sentry Test'); }}>
  Test Sentry
</button>
```

## 6. Source Maps (Opcional mas Recomendado)

Para stack traces legíveis em prod, configura upload de source maps:

```js
// next.config.js
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig(nextConfig, {
  silent: true,
  org: 'ta-consulting',
  project: 'ta-platform',
  authToken: process.env.SENTRY_AUTH_TOKEN,
});
```

## 7. Alertas Recomendados

No dashboard Sentry, configura:

- **Alerta de Spike**: >10 erros/min
- **Alerta de Novo Erro**: Notificação imediata
- **Alerta de Performance**: P95 latency >5s

---

> **Nota**: Este setup é opcional e pode ser feito quando o projeto for para produção final.
