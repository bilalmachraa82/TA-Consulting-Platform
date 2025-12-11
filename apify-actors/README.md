# Apify Actors - TA Consulting Platform

## 📂 Estrutura

```
apify-actors/
├── shared/
│   └── types.ts          # Types comuns a todos os actors
├── portugal2030/
│   └── src/main.ts       # Scraper Portugal 2030
├── pepac/
│   └── src/main.ts       # Scraper PEPAC/IFAP
├── prr/
│   └── src/main.ts       # Scraper PRR (corrigido)
├── europa-criativa/
│   └── src/main.ts       # Scraper Europa Criativa
├── horizon-europe/
│   └── src/main.ts       # Scraper Horizon Europe (API)
├── ipdj/
│   └── src/main.ts       # Scraper IPDJ
└── orchestrator.ts       # Script orquestrador
```

## 🚀 Setup

### 1. Configurar Apify CLI

```bash
# Instalar Apify CLI
npm install -g apify-cli

# Login (vai pedir o API token)
apify login
```

### 2. Deploy dos Actors

```bash
# Deploy de cada actor
cd apify-actors/portugal2030
apify push

cd ../pepac
apify push

cd ../prr
apify push

cd ../europa-criativa
apify push

cd ../horizon-europe
apify push

cd ../ipdj
apify push
```

### 3. Configurar Variáveis de Ambiente

Adicione ao `.env`:

```bash
APIFY_TOKEN=your_apify_token_here
APIFY_ACTOR_PT2030=username/portugal2030-scraper
APIFY_ACTOR_PEPAC=username/pepac-scraper
APIFY_ACTOR_PRR=username/prr-scraper
APIFY_ACTOR_EC=username/europa-criativa-scraper
APIFY_ACTOR_HORIZON=username/horizon-europe-scraper
APIFY_ACTOR_IPDJ=username/ipdj-scraper
```

### 4. Executar Orquestrador

```bash
npx tsx apify-actors/orchestrator.ts
```

## 📊 Campos Extraídos

Cada aviso contém:

| Campo | Descrição |
|-------|-----------|
| `id` | Identificador único |
| `titulo` | Título do aviso |
| `descricao` | Descrição completa |
| `fonte` | Portal de origem |
| `programa` | Nome do programa |
| `linha` | Linha de financiamento |
| `data_abertura` | Data de abertura |
| `data_fecho` | Data de encerramento |
| `montante_total` | Dotação total (€) |
| `montante_min/max` | Valores min/max por projeto |
| `taxa_apoio` | % de apoio |
| `regiao` | Regiões elegíveis |
| `setor` | Setores elegíveis |
| `tipo_beneficiario` | Quem pode candidatar |
| `url` | Link para o aviso |
| `pdf_url` | Link do PDF principal |
| `anexos` | Lista de anexos |
| `status` | Aberto/Fechado/Suspenso |
| `keywords` | Palavras-chave |

## 🔧 Manutenção

### Atualizar Seletores

Se um site mudar a estrutura, edite o ficheiro `src/main.ts` correspondente e atualize os seletores CSS.

### Testar Localmente

```bash
cd apify-actors/portugal2030
npm install
npm run start
```
