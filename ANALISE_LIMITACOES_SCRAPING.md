# 🚨 Análise de Limitações do Scraping em Portais Portugueses

## 📊 Situação Atual vs Benchmark Internacional

### Resultado Nossos Testes:
- **Portugal 2030**: 9 avisos (via API WordPress)
- **PRR**: 4 avisos (via fallback estático)
- **PEPAC**: 6 avisos (via fallback estático)
- **Europa Criativa**: 3 categorias (sem dados reais)
- **IPDJ**: 0 avisos
- **Horizon Europe**: 0 avisos

**Total**: 22 avisos vs expectativa de 450+

---

## 🔍 Limitações Identificadas

### 1. **Arquitetura dos Portais Governamentais PT**

| Portal | Problema Técnico | Impacto |
|--------|------------------|---------|
| Portugal 2030 | Conteúdo dinâmico via React/Ajax | ✅ Solução: API WordPress encontrada |
| PRR | Site com Elementor + JS pesado | ❌ Necessita browser automation |
| PEPAC/IFAP | Portal híbrido + proteções | ❌ Requer navegação complexa |
| IPDJ | Liferay + JS modular | ❌ Puppeteer necessário |
| Europa Criativa | PHP mas API dedicada | ⚠️ API não acessível |
| Horizon Europe | Sistema EC complexo | ❌ Endpoints API mudaram |

### 2. **Tecnologias que Bloqueiam Nosso Approach**

- **React/Vue/Angular**: Renderização no cliente
- **Elementor/Astra**: WordPress builders com JS
- **Liferay**: Portal Java com componentes JS
- **Anti-scraping**: Rate limiting, user-agent blocking
- **CAPTCHAS**: Em formulários/portais restritos

---

## 🌍 Como Outros Países Resolvem

### 1. **Reino Unido (gov.uk)**
```python
# Abordagem oficial:
# 1. APIs prioritárias
# 2. Rate limiting: 1 req/s
# 3. User-agent transparente
# 4. Robots.txt compliance

import requests
import time

def scrape_govuk():
    headers = {
        'User-Agent': 'MyScraper/1.0 (contact@myorg.com)'
    }
    response = requests.get(url, headers=headers)
    time.sleep(1)  # Rate limiting
```

### 2. **União Europeia (Funding Portal)**
```javascript
// Nova API v3 (descoberta):
const API_BASE = 'https://api.funding-tenders.eu/content/api/v3'

const opportunities = await fetch(
    `${API_BASE}/search/calls?programme=Horizon+Europe`,
    {
        headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0' // Necessário!
        }
    }
)
```

### 3. **Alemanha (foerderportal.bund.de)**
- Usa **JSON endpoints** visíveis
- **CORS enabled** para APIs
- **Sem rate limiting** agressivo
- **Documentação aberta** de estruturas

---

## 🛠️ Soluções Técnicas Recomendadas

### 1. **Browser Automation Obrigatório**
```typescript
// Para PT2030, PRR, IPDJ
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

puppeteer.use(StealthPlugin())

const browser = await puppeteer.launch({
    headless: true,
    args: [
        '--no-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--user-agent=Mozilla/5.0...'
    ]
})

const page = await browser.newPage()
await page.goto(url, { waitUntil: 'networkidle0' })
await page.waitForSelector('.avisos-list', { timeout: 30000 })
```

### 2. **Interceptação de Rede**
```typescript
// Capturar APIs internas
page.on('response', async response => {
    if (response.url().includes('/api/avisos')) {
        const data = await response.json()
        // Usar dados diretos da API!
    }
})
```

### 3. **Sistema Híbrido Inteligente**
```typescript
const STRATEGIES = {
    // 1. API dedicada (se existir)
    'europa-criativa': { type: 'api', url: '...' },

    // 2. Browser automation
    'portugal2030': {
        type: 'browser',
        apiEndpoint: '/wp-json/wp/v2/posts',
        fallback: 'browser'
    },

    // 3. Network interception
    'prr': { type: 'intercept', targets: ['/api/componentes'] },

    // 4. Manual parsing
    'ifap': { type: 'manual', navigation: true }
}
```

---

## 🎯 Plano de Implementação

### Fase 1: Correções Imediatas (1 semana)
1. **Implementar Puppeteer** para PT2030/PRR
2. **Corrigir endpoint Horizon Europe** (API v3)
3. **Adicionar network interception**

### Fase 2: Melhorias (2 semanas)
1. **User-Agent rotation**
2. **Proxy pool** para evitar blocks
3. **Cache inteligente** de resultados
4. **Scheduler** com delays respeitosos

### Fase 3: Escalabilidade (1 mês)
1. **Docker containers** por portal
2. **Queue system** (Redis/BullMQ)
3. **Monitorização** de health checks
4. **Auto-recovery** de falhas

---

## 💡 Insights da Pesquisa

### Por que Portugal é mais difícil:
1. **Tecnologia mais recente** (React/SPA) vs HTML estático
2. **Menor tradição** de APIs abertas
3. **Proteções maiores** contra scraping
4. **Fragmentação** (múltiplos portais por ministério)

### O que funciona melhor:
1. **Network interception** > HTML parsing
2. **API endpoints** > UI scraping
3. **Browser automation** > HTTP requests
4. **Patience & delays** > speed scraping

---

## 📈 Expectativa de Resultados (Pós-implementação)

| Portal | Método | Avisos Esperados |
|--------|--------|------------------|
| PT2030 | Browser + API | 50+ |
| PRR | Network Interception | 30+ |
| PEPAC | Navigation + Parsing | 15+ |
| Europa Criativa | API v3 | 4 |
| Horizon Europe | API EC | 400+ |
| IPDJ | Browser Automation | 10+ |

**Total**: ~500+ avisos vs 22 atuais

---

## ⚡ Ações Críticas

1. **IMEDIATO**: Implementar Puppeteer/Playwright
2. **URGENTE**: Corrigir API endpoints (Horizon/Europa)
3. **IMPORTANTE**: Sistema de rate limiting
4. **ESSENCIAL**: Monitorização de mudanças

A abordagem atual (Firecrawl apenas) é insuficiente para portais governamentais modernos. Precisamos evoluir para uma solução multi-estratégia com browser automation.