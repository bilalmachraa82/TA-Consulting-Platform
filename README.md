
# 🚀 TA Consulting Platform

**Plataforma Ultra-Avançada para Automação de Workflows de Incentivos Financeiros e Fundos Europeus**

---

## 📋 Descrição

A **TA Consulting Platform** é uma solução completa e automatizada desenvolvida para empresas de consultoria que trabalham com incentivos financeiros e fundos europeus direcionados a empresas portuguesas. A plataforma automatiza o processo de monitorização, scraping e gestão de avisos de financiamento dos principais portais portugueses.

### 🎯 Principais Funcionalidades

- ✅ **Scraping Automatizado** de 3 portais principais:
  - Portugal 2030
  - PAPAC (Plano de Ação para o Pacto Ecológico Europeu)
  - PRR (Plano de Recuperação e Resiliência)

- ✅ **Dashboard Completo** com:
  - Gestão de Avisos (com filtros avançados e alertas de urgência)
  - Gestão de Empresas (NIPC, CAE, dimensão, região)
  - Gestão de Candidaturas (timeline, estados, montantes)
  - Gestão de Documentos (com controlo de validade)
  - Calendário de Deadlines
  - Relatórios e Estatísticas
  - Monitor de Workflows Automatizados

- ✅ **Notificações Automáticas por Email** (Gmail/Outlook)
- ✅ **Base de Dados PostgreSQL** com schema completo
- ✅ **Autenticação Segura** com NextAuth.js
- ✅ **Design Moderno e Responsivo** com Tailwind CSS e shadcn/ui

---

## 🏗️ Tecnologias Utilizadas

### Frontend
- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** (componentes)
- **Recharts** (gráficos)
- **React Query** (gestão de estado)

### Backend
- **Next.js API Routes**
- **Prisma ORM**
- **PostgreSQL**
- **NextAuth.js** (autenticação)

### Automação
- **Agentes de Scraping** (execução semanal)
- **Puppeteer/Playwright** (browser automation)
- **Node-cron** (agendamento)

---

## 📂 Estrutura do Projeto

```
ta_consulting_platform/
├── nextjs_space/
│   ├── app/
│   │   ├── api/              # API routes
│   │   ├── auth/             # Login/Register
│   │   ├── dashboard/        # Dashboard pages
│   │   ├── apresentacao/     # Landing page
│   │   └── ...
│   ├── components/
│   │   ├── dashboard/        # Dashboard components
│   │   ├── ui/               # shadcn/ui components
│   │   └── ...
│   ├── lib/
│   │   ├── auth.ts           # Auth configuration
│   │   ├── db.ts             # Prisma client
│   │   └── types.ts          # TypeScript types
│   ├── prisma/
│   │   └── schema.prisma     # Database schema
│   └── ...
├── scraping_data/            # Dados scraped (JSON)
└── scraping_reports/         # Relatórios gerados (Markdown)
```

---

## 🚀 Getting Started

### Pré-requisitos

- Node.js 18+ 
- PostgreSQL 14+
- Yarn

### Instalação

1. **Clone o repositório:**
```bash
git clone https://github.com/bilalmachraa82/TA-Consulting-Platform.git
cd TA-Consulting-Platform
```

2. **Instale as dependências:**
```bash
cd nextjs_space
yarn install
```

3. **Configure as variáveis de ambiente:**

Crie um ficheiro `.env` em `nextjs_space/`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ta_consulting"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Email (Gmail)
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
```

4. **Configure a base de dados:**
```bash
yarn prisma generate
yarn prisma db push
yarn prisma db seed
```

5. **Inicie o servidor de desenvolvimento:**
```bash
yarn dev
```

A plataforma estará disponível em: **http://localhost:3000**

---

## 👤 Credenciais de Teste

**Admin:**
- Email: `john@doe.com`
- Password: `johndoe123`

**Utilizador Normal:**
- Email: `utilizador@taconsulting.pt`
- Password: `123456`

---

## 🤖 Agentes Automatizados

A plataforma inclui **3 agentes de scraping** que executam automaticamente:

### Agendamento:
- **Primeira Execução:** Sexta-feira, 6 de Novembro de 2025 às 7:00
- **Execuções Recorrentes:** Todas as Segundas-feiras às 9:00

### Agentes:
1. **Scraping Portugal 2030** - Extrai avisos com menos de 8 dias até deadline
2. **Scraping PAPAC** - Extrai avisos com menos de 8 dias até deadline
3. **Scraping PRR** - Extrai avisos publicados há menos de 8 dias

### Outputs:
- Dados em JSON (`/scraping_data/`)
- Base de dados PostgreSQL (tabela `Aviso`)
- Relatórios Markdown (`/scraping_reports/`)
- Email com resumo para `bilal.machraa@gmail.com`

---

## 📊 Schema da Base de Dados

### Principais Tabelas:

- **User** - Utilizadores (admin/user)
- **Aviso** - Avisos de financiamento
- **Empresa** - Empresas portuguesas (com NIPC, CAE, dimensão)
- **Candidatura** - Candidaturas submetidas
- **Documento** - Documentos das empresas (com validade)
- **Workflow** - Workflows automatizados
- **WorkflowLog** - Logs de execução
- **Notificacao** - Notificações por email

---

## 🌐 Deploy

A plataforma está deployada e acessível em:

**https://ta-consulting-platfo-tfdltj.abacusai.app**

---

## 📝 Roadmap

### Melhorias Futuras:
- [ ] Agente IA integrado para assistência aos utilizadores
- [ ] Google Analytics para tracking
- [ ] Google SSO para autenticação
- [ ] Exportação avançada (Excel, PDF)
- [ ] Dashboard de estatísticas em tempo real
- [ ] Notificações push (web notifications)
- [ ] Sistema de templates para candidaturas
- [ ] Integração com CRM
- [ ] API REST pública

---

## 🤝 Contribuir

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para a sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit as suas alterações (`git commit -m 'Adicionar MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📧 Contacto

**TA Consulting**
- Email: bilal.machraa@gmail.com
- Website: [ta-consulting-platfo-tfdltj.abacusai.app](https://ta-consulting-platfo-tfdltj.abacusai.app)

---

## 📄 Licença

Este projeto é propriedade de **TA Consulting**. Todos os direitos reservados.

---

## 🙏 Agradecimentos

- Next.js Team
- Prisma Team
- shadcn/ui
- Vercel
- Abacus.AI

---

**Desenvolvido com ❤️ por TA Consulting**
