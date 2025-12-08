# 🚀 TA Consulting Platform - Ultra-Avançada DeepAgent

Plataforma completa para automação de workflows de incentivos financeiros e fundos europeus para empresas portuguesas.

## 📋 Features

### 🤖 Automação Inteligente
- **3 Agentes Automatizados de Scraping:**
  - 🇵🇹 **Portugal 2030** - Scraping automático de avisos com menos de 8 dias até deadline
  - 📋 **PAPAC** - Extração de concursos públicos e avisos
  - 🏗️ **PRR (Plano de Recuperação e Resiliência)** - Avisos abertos publicados recentemente

### 📊 Dashboard Completo
- **Avisos:** Visualização e gestão de todos os avisos dos 3 portais
- **Candidaturas:** Acompanhamento de candidaturas por empresa
- **Empresas:** Gestão completa de empresas clientes (NIPC, CAE, setor, dimensão)
- **Calendário:** Visualização de deadlines e datas importantes
- **Documentos:** Gestão de documentos com validação automática
- **Relatórios:** Estatísticas e análises detalhadas
- **Workflows:** Monitorização dos agentes automatizados

### 🔐 Segurança & Autenticação
- Sistema de autenticação com NextAuth.js
- Gestão de utilizadores (admin/user)
- Sessões seguras

### 📧 Notificações
- Email automático após cada execução de scraping
- Relatórios semanais enviados via Gmail
- Alertas de avisos urgentes

### 🗄️ Base de Dados
- PostgreSQL com Prisma ORM
- Schema completo para avisos, empresas, candidaturas, documentos
- Sistema de prevenção de duplicados

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **UI:** Tailwind CSS + shadcn/ui
- **Autenticação:** NextAuth.js
- **Base de Dados:** PostgreSQL + Prisma
- **Email:** Gmail API
- **Automação:** DeepAgent com scraping inteligente
- **TypeScript:** Full type safety

## 📅 Agendamento dos Agentes

- **Primeira Execução:** Sexta-feira, 6 de novembro de 2025 às 7:00 (horário de Lisboa)
- **Execuções Recorrentes:** Todas as segundas-feiras às 9:00 (horário de Lisboa)

## 🌐 Deploy

A plataforma está deployada e acessível em:
**https://ta-consulting-platfo-tfdltj.abacusai.app**

**Credenciais de Teste:**
- Email: `test@example.com`
- Password: `password123`

## 📂 Estrutura do Projeto

```
ta_consulting_platform/
├── nextjs_space/           # Aplicação Next.js
│   ├── app/               # App Router
│   │   ├── api/          # API Routes
│   │   ├── auth/         # Autenticação
│   │   └── dashboard/    # Dashboard pages
│   ├── components/        # Componentes React
│   │   ├── dashboard/    # Componentes do dashboard
│   │   └── ui/           # Componentes UI (shadcn)
│   ├── lib/              # Utilidades
│   ├── prisma/           # Schema Prisma
│   └── public/           # Assets públicos
├── scraping_data/         # Dados extraídos pelos agentes
└── scraping_reports/      # Relatórios gerados
```

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js 18+
- PostgreSQL
- Yarn

### Instalação

```bash
cd nextjs_space
yarn install
```

### Configuração

Crie um arquivo `.env` com as seguintes variáveis:

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."

# Email (Gmail)
GMAIL_USER="..."
GMAIL_APP_PASSWORD="..."
```

### Executar

```bash
# Desenvolvimento
yarn dev

# Produção
yarn build
yarn start
```

## 📊 Schema da Base de Dados

### Principais Tabelas

- **Aviso** - Avisos de incentivos e fundos
- **Empresa** - Empresas clientes
- **Candidatura** - Candidaturas submetidas
- **Documento** - Documentos das empresas
- **Workflow** - Configuração dos agentes
- **WorkflowLog** - Logs de execução
- **Notificacao** - Sistema de notificações

## 🤖 Agentes Automatizados

### AGENTE 1: Portugal 2030
- **Portal:** https://portugal2030.pt/avisos/
- **Filtro:** Avisos com menos de 8 dias até deadline
- **Campos:** Nome, Programa, Código, Datas, Link, etc.

### AGENTE 2: PAPAC
- **Portal:** https://pepacc.pt/concursos/
- **Filtro:** Concursos com menos de 8 dias até fim
- **Campos:** Nome, Datas de início e fim, Link

### AGENTE 3: PRR
- **Portal:** https://recuperarportugal.gov.pt/candidaturas-prr/
- **Filtro:** Avisos abertos publicados há menos de 8 dias
- **Campos:** Linha, Sub Linha, Nome, Datas, Link

## 📈 Relatórios

Cada execução gera:
- Arquivo JSON com dados extraídos (`scraping_data/`)
- Relatório Markdown formatado (`scraping_reports/`)
- Email com resumo enviado para `bilal.machraa@gmail.com`

## 🔄 Workflow

1. **Scraping:** Agentes extraem dados dos portais
2. **Validação:** Verificação de duplicados
3. **Base de Dados:** Inserção/atualização no PostgreSQL
4. **Relatório:** Geração de relatório Markdown
5. **Notificação:** Envio de email com resumo

## 📝 Licença

Propriedade de **TA Consulting**

## 👥 Contato

**Email:** bilal.machraa@gmail.com

---

Desenvolvido com ❤️ por **DeepAgent**
