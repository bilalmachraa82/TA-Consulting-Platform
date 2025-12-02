# Plano de Integração - TA Consulting Platform

## Arquitectura Completa

```
┌─────────────────────────────────────────────────────────────────┐
│                    TA CONSULTING PLATFORM                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Frontend    │  │  Dashboard   │  │   Chatbot    │          │
│  │  Next.js 14  │  │  Analytics   │  │   IA/RAG     │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                  │
│  ┌──────▼──────────────────▼──────────────────▼───────┐         │
│  │                    API Layer                        │         │
│  │  /api/avisos  /api/empresas  /api/rag  /api/aiparati│        │
│  └──────┬─────────────────┬─────────────────┬─────────┘         │
│         │                  │                  │                  │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌──────▼───────┐          │
│  │   Scrapers   │  │  Eligibility │  │  aiparati    │          │
│  │  Rate-limit  │  │   Service    │  │   Client     │          │
│  │   + Cache    │  │              │  │              │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                  │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌──────▼───────┐          │
│  │   Data       │  │  PostgreSQL  │  │  aiparati-   │          │
│  │   JSON/PDF   │  │   Prisma     │  │  express     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                              │                   │
└──────────────────────────────────────────────┼───────────────────┘
                                               │
                              ┌────────────────▼────────────────┐
                              │      AIPARATI-EXPRESS           │
                              │  (Microserviço Separado)        │
                              │                                  │
                              │  - Upload IES (PDF/XML)         │
                              │  - Análise Financeira Claude    │
                              │  - Templates IAPMEI             │
                              │  - Elegibilidade Enriquecida    │
                              └──────────────────────────────────┘
```

---

## 1. Sistema de Scraping

### 1.1 Fontes de Dados

| Fonte | URL | Prioridade | Método |
|-------|-----|------------|--------|
| Transparência Portugal | transparencia.gov.pt | Alta (Agregador) | Cheerio + Fallback |
| Portugal 2030 | portugal2030.pt | Média | Cheerio + WP API |
| PEPAC/PDR | ifap.pt, dgadr.gov.pt | Média | Cheerio |
| PRR | recuperarportugal.gov.pt | Média | Cheerio |

### 1.2 Features Implementadas

- **Rate Limiting**: 2 segundos entre requests, max 20/minuto
- **Cache Inteligente**: TTL 24h, persistência em disco
- **User-Agent Rotation**: 4 user-agents em rotação
- **Retry com Backoff**: 3 tentativas, exponencial
- **Deduplicação**: Por URL e título normalizado

### 1.3 Ficheiros

```
lib/scraper-utils.ts          # Utilitários (RateLimiter, Cache, etc.)
scripts/scrapers/
├── index.ts                  # Orchestrator principal
├── portugal2030-scraper.ts   # PT2030/COMPETE
├── pepac-scraper.ts          # PEPAC/PDR
├── prr-scraper.ts            # PRR
└── transparencia-scraper.ts  # Agregador oficial (NOVO)
```

### 1.4 Uso

```typescript
import { runAllScrapers } from './scripts/scrapers';

// Executar todos os scrapers
const results = await runAllScrapers();
console.log(`Total: ${results.total} avisos`);

// Usar scraper individual
import { getScraper } from './lib/scraper-utils';
const scraper = getScraper();
const result = await scraper.fetchAndParse('https://example.com');
```

---

## 2. Integração aiparati-express

### 2.1 Arquitectura

O **aiparati-express** é um microserviço separado que:

1. **Processa IES** (Informação Empresarial Simplificada)
   - Upload de PDF ou XML
   - Extração automática de dados financeiros
   - OCR se necessário

2. **Análise Financeira com Claude**
   - Cálculo de rácios (AF, Liquidez, ROE, etc.)
   - Score de saúde financeira
   - Recomendações personalizadas

3. **Templates IAPMEI**
   - Formulários de candidatura
   - Planos de negócio
   - Memoriais descritivos

4. **Elegibilidade Enriquecida**
   - Combina dados financeiros com matching de avisos
   - Score final ponderado
   - Probabilidade de aprovação

### 2.2 Endpoints

```
GET  /api/aiparati              # Status do serviço
POST /api/aiparati              # Operações principais
     action: 'analyze'          # Analisar IES
     action: 'template'         # Gerar template
     action: 'eligibility'      # Elegibilidade enriquecida
     action: 'full-analysis'    # Análise completa
POST /api/aiparati/upload       # Upload de ficheiro IES
```

### 2.3 Exemplo de Uso

```typescript
// Análise financeira
const response = await fetch('/api/aiparati', {
  method: 'POST',
  body: JSON.stringify({
    action: 'analyze',
    ies: {
      nipc: '123456789',
      nomeEmpresa: 'Exemplo Lda',
      volumeNegocios: 500000,
      capitalProprio: 100000,
      // ... outros campos
    }
  })
});

const { analysis } = await response.json();
console.log(`Score: ${analysis.scoreGlobal}`);
console.log(`Risco: ${analysis.risco}`);
```

### 2.4 Configuração

```env
# .env
AIPARATI_URL=http://localhost:3001
AIPARATI_API_KEY=sua-api-key
```

### 2.5 Fallback Local

Se o serviço aiparati-express não estiver disponível, o sistema usa cálculos locais:

- Rácios financeiros básicos
- Score simplificado
- Templates pré-definidos

---

## 3. Sistema de Elegibilidade

### 3.1 Score de Compatibilidade

| Factor | Peso | Descrição |
|--------|------|-----------|
| Setor | 30% | Match CAE/setor do aviso |
| Dimensão | 20% | Micro/Pequena/Média/Grande |
| Região | 15% | Nacional ou regional |
| Prazo | 15% | Dias até deadline |
| Montante | 10% | Adequação ao aviso |
| Financeiro | 10% | Score da análise IES |

### 3.2 Ficheiros

```
lib/elegibilidade-service.ts   # Serviço principal
lib/aiparati-client.ts         # Cliente para aiparati-express
```

### 3.3 Uso

```typescript
import { calculateFullEligibility } from './lib/elegibilidade-service';

const empresa = {
  id: '1',
  nipc: '123456789',
  nome: 'Exemplo Lda',
  cae: '62010',
  setor: 'Tecnologia',
  dimensao: 'PEQUENA',
  regiao: 'Norte',
  iesData: { /* dados IES */ }
};

const eligibility = await calculateFullEligibility(empresa);
console.log(`Score: ${eligibility.scoreGlobal}`);
console.log(`Oportunidades: ${eligibility.totalOportunidades}`);
console.log(`Potencial: €${eligibility.montantePotencial}`);
```

---

## 4. Configuração Completa

### 4.1 Variáveis de Ambiente

```env
# Database
DATABASE_URL=postgresql://...

# Auth
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000

# aiparati-express
AIPARATI_URL=http://localhost:3001
AIPARATI_API_KEY=optional

# RAG (opcional - fallback local disponível)
GEMINI_API_KEY=...
GOOGLE_SEARCH_API_KEY=...
SERPAPI_KEY=...

# Email
RESEND_API_KEY=...

# Storage
AWS_BUCKET_NAME=...
```

### 4.2 Estrutura de Dados

```
data/
├── scraped/
│   ├── all_avisos.json
│   ├── portugal2030_avisos.json
│   ├── pepac_avisos.json
│   ├── prr_avisos.json
│   ├── transparencia_avisos.json
│   └── scraping_metadata.json
├── pdfs/
│   └── (PDFs de avisos)
└── cache/
    └── scraper_cache.json
```

---

## 5. Roadmap de Integração aiparati-express

### Fase 1: Preparação (Concluída)
- [x] Cliente aiparati-client.ts
- [x] Endpoint /api/aiparati
- [x] Serviço de elegibilidade enriquecido
- [x] Fallback local para análise financeira

### Fase 2: Deploy aiparati-express
- [ ] Clonar/criar repositório aiparati-express
- [ ] Configurar Claude API para análise
- [ ] Implementar upload e parsing de IES
- [ ] Testar endpoints

### Fase 3: Integração
- [ ] Configurar AIPARATI_URL no .env
- [ ] Testar fluxo completo Upload → Análise → Elegibilidade
- [ ] UI para upload de IES
- [ ] Dashboard com métricas financeiras

### Fase 4: Produção
- [ ] Deploy aiparati-express (Railway/Render)
- [ ] Configurar HTTPS
- [ ] Monitorização e alertas
- [ ] Backup de dados

---

## 6. Scraping: Apify vs Open Source

### Conclusão da Pesquisa

**Apify NÃO é necessário** para este projeto porque:

1. **Escala pequena**: 5-10 sites governamentais
2. **Frequência baixa**: Avisos actualizam semanalmente
3. **Sites estáticos**: Cheerio suficiente (governo PT usa HTML tradicional)
4. **Custo zero**: Stack open-source funciona

### Stack Recomendado

| Ferramenta | Uso | Instalado |
|------------|-----|-----------|
| Cheerio | Parsing HTML | Sim |
| Axios | HTTP requests | Sim |
| Playwright | Fallback dinâmico | Não (adicionar se necessário) |

### Se Precisar de Mais

```bash
# Adicionar Playwright (apenas se sites forem dinâmicos)
npm install playwright
npx playwright install chromium
```

---

## 7. Práticas de Scraping Respeitoso

### Rate Limiting

```typescript
const config = {
  minDelayMs: 2000,        // 2s entre requests
  maxRequestsPerMinute: 20, // Max 20/min
  retryAttempts: 3,        // 3 tentativas
};
```

### User-Agent

```
TA-Consulting-FundingBot/1.0 (+https://taconsulting.pt; contact@taconsulting.pt)
```

### Horário de Scraping

- **Recomendado**: 1-4 AM (hora Portugal)
- **Evitar**: Horário de expediente

### robots.txt

Verificar antes de scraping (embora sites governamentais sejam geralmente permissivos para dados públicos).

---

## 8. Próximos Passos

1. **Amanhã**: Configurar GEMINI_API_KEY e testar RAG avançado
2. **Esta Semana**: Deploy aiparati-express e integração
3. **Próximas 2 Semanas**: UI para upload IES e elegibilidade

---

## Contacto

**TA Consulting Platform**
- Email: bilal.machraa@gmail.com
- Deploy: https://ta-consulting-platfo-tfdltj.abacusai.app

---

*Documento actualizado: 2 de Dezembro de 2025*
