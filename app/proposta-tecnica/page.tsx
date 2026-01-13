'use client';

import { ArrowLeft, Download, Printer } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const DOCUMENT_CONTENT = `# TA Consulting Platform
## Proposta Técnica Detalhada

**Documento de Acompanhamento Comercial**

Janeiro 2026

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Análise das Dores](#2-análise-das-dores)
3. [STARTER](#3-starter---eur-5000--eur-600mês)
4. [PROFESSIONAL](#4-professional---eur-7500--eur-800mês---recomendado)
5. [PREMIUM](#5-premium---eur-11000--eur-1000mês)
6. [Comparação Lado a Lado](#6-comparação-lado-a-lado)
7. [Retainer Mensal](#7-retainer-mensal---o-que-está-incluído)
8. [Timeline de Implementação](#8-timeline-de-implementação)
9. [Perguntas Frequentes](#9-perguntas-frequentes)

---

## 1. Visão Geral

### 1.1 Contexto do Projeto

A TA Consulting enfrenta um desafio comum no mercado de consultoria em Portugal: a captação de fundos europeus é um processo manual, fragmentado e intensivo em recursos. Com milhares de avisos publicados anualmente em múltiplos portais, a identificação de oportunidades relevantes para cada cliente torna-se uma tarefa que consome horas preciosas de trabalho qualificado.

### 1.2 Objetivo

O objetivo da **TA Consulting Platform** é automatizar todo o fluxo de captação e qualificação de candidaturas a fundos europeus, desde a deteção de novos avisos até à notificação proativa de oportunidades relevantes para cada cliente da base de 24.000 empresas.

A plataforma centraliza e estrutura informação que hoje se encontra dispersa por:
- Múltiplos portais de financiamento
- Ficheiros Excel não estruturados
- Processos manuais de pesquisa
- Conhecimento tácito da equipa

---

## 2. Análise das Dores

### 2.1 Oportunidade Subutilizada

> *"Temos 24.000 empresas na base de dados, mas apenas uma fração é contactada ativamente para oportunidades."* — Fernando

A dimensão da base de dados da TA Consulting representa um ativo valioso subutilizado. Sem automação, é impossível monitorizar de forma proativa as necessidades de financiamento de cada empresa face aos avisos disponíveis.

### 2.2 Processo Manual e Fragmentado

> *"Hoje tudo se faz com Excel, pesquisas manuais no website da Paula, e muito copy-paste entre sistemas."* — Fernando

O processo atual caracteriza-se por:
- **Pesquisas manuais** em múltiplos portais (PT2030, PRR, PEPAC, entre outros)
- **Excel como ferramenta central** de registo e acompanhamento
- **Update manual** do website pela Paula (~30 minutos por semana)
- **Sem alertas automáticos** quando surge um aviso relevante
- **Duplicação de esforços** entre membros da equipa

### 2.3 Conhecimento Histórico Não Estruturado

> *"Temos 291 candidaturas históricas que poderiam servir de referência, mas estão em ficheiros dispersos."* — Fernando

O conhecimento acumulado ao longo de anos de atividade não está estruturado de forma a ser:
- Pesquisável de forma eficiente
- Reutilizável em novas candidaturas
- Analisável para padrões de sucesso
- Acessível a toda a equipa

### 2.4 Consequências

| Problema | Impacto |
|----------|---------|
| Tempo gasto em pesquisa manual | Menos tempo para candidaturas de valor |
| Oportunidades perdidas | Avisos não detetados atempadamente |
| Base de clientes subutilizada | Receita potencial não realizada |
| Dependência de conhecimento tácito | Risco de perda de know-how |

---

## 3. STARTER - EUR 5.000 + EUR 600/mês

### 3.1 O que está incluído

#### Scraping de Portais
- **3 portais incluídos:** PT2030, PRR, PEPAC
- **Frequência:** Verificação automática a cada 6 horas
- **Tipos de dados capturados:**
  - Título e descrição do aviso
  - Data de abertura e encerramento
  - Valor disponível
  - Entidade responsável
  - CAE elegíveis
  - Geografia aplicável

#### Matchmaking Básico
- **Critérios de matching:** CAE (2 dígitos) + Região (NUTS II)
- **Formato:** Lista de empresas potencialmente interessadas
- **Exportação:** CSV para importação manual no Bitrix

#### Dashboard
- **Avisos recentes:** Últimos 30 avisos capturados
- **Filtros simples:** Por portal, CAE, região, data de encerramento
- **Vista detalhada:** Informação completa de cada aviso
- **Marcação:** Avisos podem ser marcados como "interessantes"

#### Chatbot de Lead Capture
- **Função:** Captura progressiva de informações de visitantes
- **Tipo:** Baseado em regras (sem IA)
- **Fluxo:** 3-4 perguntas sequenciais (nome, empresa, setor, tipo de projeto)
- **Integração:** Dados enviados por email para a equipa

#### RAG (Retrieval-Augmented Generation) Básico
- **Tipo:** Keyword search (busca por palavras-chave)
- **Âmbito:** Títulos e descrições de avisos
- **Resultado:** Avisos ordenados por relevância para uma query específica

#### Formação
- **2 sessões** de formação (2 horas cada)
- **Conteúdos:**
  - Utilização do dashboard
  - Leitura e interpretação de avisos
  - Exportação e importação de dados

### 3.2 O que NÃO está incluído

| Funcionalidade | Disponível em |
|----------------|---------------|
| Sincronização automática com Bitrix | Professional / Premium |
| RAG com Gemini File Search | Professional / Premium |
| Email marketing automation | Professional / Premium |
| AI writer de memorias | Premium |
| Chatbot com IA conversacional | Professional / Premium |
| Dashboard com KPIs avançados | Professional / Premium |

### 3.3 Timeline

**8 semanas** desde o início do projeto

### 3.4 Para quem é

O plano **STARTER** é ideal para:
- Consultorias que começam a automatizar processos
- Equipas com orçamento limitado
- Organizações que querem validar o conceito antes de investir mais
- Quem precisa de automatizar apenas o essencial

---

## 4. PROFESSIONAL - EUR 7.500 + EUR 800/mês (RECOMENDADO)

### 4.1 Tudo do Starter +

O plano Professional inclui todas as funcionalidades do plano Starter, acrescidas das seguintes melhorias e novas funcionalidades.

### 4.2 Funcionalidades Adicionais

#### Scraping Alargado
- **6 portais incluídos:**
  1. PT2030
  2. PRR - Plano de Recuperação e Resiliência
  3. PEPAC - Programa Estratégico para o Política Agrícola Comum
  4. Europa Criativa
  5. IPDJ - Instituto Português do Desporto e Juventude
  6. Horizon Europe

#### Matchmaking Avançado
- **Score de relevância 0-100:** Algoritmo que combina múltiplos fatores
- **Fatores considerados:**
  - CAE (4 dígitos)
  - Histórico de candidaturas da empresa (se disponível no Bitrix)
  - Região (NUTS III)
  - Valor do financiamento
  - Tipo de projeto (investimento, qualificação, internacionalização)
- **Ordenação automática:** Empresas com maior score aparecem primeiro
- **Dados do Bitrix:** Integração com CRM para enriquecer o perfil de cada empresa

#### RAG com Gemini File Search
- **Tecnologia:** Google Gemini File Search API
- **Âmbito:** 291 candidaturas históricas indexadas
- **Pesquisa:** Semântica, não apenas por palavras-chave
- **Capacidades:**
  - Encontrar candidaturas similares por conceito
  - Identificar padrões de sucesso
  - Sugerir abordagens com base em casos anteriores
- **Requisito:** Acesso aos documentos (Google Drive ou upload)

#### Sincronização Bidirecional com Bitrix
- **Integração completa** via API Bitrix24
- **Fluxos de dados:**
  - **Bitrix → Platform:** Importação de empresas, contactos, deals
  - **Platform → Bitrix:** Criação automática de leads/tasks baseados em matching
- **Segurança:** Read-only por defeito; escrita apenas após autorização explícita
- **Frequência:** Sincronização a cada hora

#### Chatbot com IA Conversacional
- **Baseado em RAG:** O chatbot acede aos avisos indexados
- **Conversação natural:** Os utilizadores descrevem o projeto em linguagem corrente
- **Capacidades:**
  - Perguntas sobre avisos específicos
  - Recomendações baseadas no perfil
  - Esclarecimento de dúvidas sobre processos
- **Personalização:** Tom de voz e identidade visual da TA Consulting

#### Dashboard Enriquecido
- **KPIs principais:**
  - Avisos novos por semana
  - Taxa de conversão (avisos → candidaturas)
  - Empresas ativas no período
  - Valor total de financiamento disponível
- **Alertas:** Notificações para avisos de alto valor ou deadlines próximas
- **Calendário interativo:** Vista temporal de prazos importantes
- **Filtros avançados:** Combinação múltipla de critérios

#### Email Drip Marketing
- **4 sequências automáticas:**
  1. **Novo aviso relevante:** Notificação imediata
  2. **Follow-up 3 dias:** Lembrete e detalhes adicionais
  3. **Deadline aproximando:** Alerta 2 semanas antes do fecho
  4. **Oportunidade similar:** Quando surge aviso na mesma área
- **Personalização:** Nome da empresa, setor, tipo de projeto
- **Métricas:** Taxa de abertura, cliques, respostas

#### Formação Alargada
- **4 sessões** (2 horas cada)
- **Conteúdos adicionais:**
  - Interpretação de scores de matching
  - Integração Bitrix
  - Análise de KPIs
  - Boas práticas de email marketing
- **Gravações:** Todas as sessões ficam gravadas para acesso futuro

#### Suporte Prioritário
- **2 horas por mês** de suporte dedicado
- **SLA:** Resposta em até 2 dias úteis
- **Prioridade:** Alta (à frente dos clientes Starter)

### 4.3 Comparativo: Starter vs Professional

| Funcionalidade | Starter | Professional |
|----------------|---------|-------------|
| Portais scraping | 3 | 6 |
| Sync Bitrix | Import CSV manual | Automático (API) |
| RAG docs | Keyword search | Gemini File Search |
| Matchmaking Score | Não | Sim (0-100) |
| Chatbot AI | Não | Sim |
| Dashboard básico | Sim | + KPIs e alertas |
| Email Drip | Não | 4 sequências |
| Formação | 2 sessões | 4 sessões + gravações |
| Suporte | Email | 2h/mês prioritário |

### 4.4 Timeline

**10-12 semanas** desde o início do projeto

### 4.5 Para quem é

O plano **PROFESSIONAL** é ideal para:
- Consultorias com volume significativo de candidaturas
- Equipas que precisam de escalar operações
- Organizações que usam Bitrix como CRM central
- Quem quer reduzir drasticamente o tempo de pesquisa manual
- Empresas focadas em crescimento

---

## 5. PREMIUM - EUR 11.000 + EUR 1.000/mês

### 5.1 Tudo do Professional +

O plano Premium inclui todas as funcionalidades do plano Professional, acrescidas de funcionalidades avançadas para automatização completa.

### 5.2 Funcionalidades Adicionais

#### AI Writer de Memórias Descritivas
- **O que faz:** Gera rascunhos de memorias descritivas automaticamente
- **Base:** 291 candidaturas históricas indexadas
- **Fluxo de trabalho:**
  1. Utilizador indica o aviso e a empresa
  2. IA analisa candidaturas similares anteriores
  3. Rascunho é gerado com estrutura padrão
  4. Consultor revê e ajusta o conteúdo
- **Economia de tempo:** ~50% no tempo de escrita inicial

#### Post-Award Management
- **O que é:** Gestão de projetos aprovados após a candidatura
- **Funcionalidades:**
  - Dashboard de projetos em execução
  - Calendário de milestones e reportings
  - Alertas de prazos de submissão de relatórios
  - Upload de documentos de acompanhamento
- **Benefício:** Visibilidade total do pipeline pós-aprovação

#### Email Drip Avançado
- **Sequências personalizadas:** Criação de fluxos customizados
- **Segmentação inteligente:** Baseada em comportamento e perfil
- **A/B testing:** Teste de assuntos e conteúdos
- **Dinamização de conteúdo:** Blocos reutilizáveis

#### AI Critic
- **O que faz:** Revisão automática de candidaturas antes de submissão
- **Verificações:**
  - Consistência interna do documento
  - Cumprimento de requisitos obrigatórios
  - Qualidade e clareza da escrita
  - Comparação com candidaturas bem-sucedidas similares
- **Output:** Relatório de sugestões de melhoria

#### Website Auto-Update
- **O que faz:** Sincronização automática com o site da TA Consulting
- **Conteúdo sincronizado:**
  - Avisos recentes
  - Notícias sobre financiamentos
  - Estatísticas e números
- **Benefício:** Elimina a necessidade de update manual (~30 min/semana poupados)

#### Marketing Mix AI
- **O que faz:** Recomendações de canais de marketing
- **Análise:**
  - Performance histórica de campanhas
  - Perfil de empresas mais responsivas
  - Custo-benefício por canal
- **Output:** Sugestões de alocação de orçamento

### 5.3 Comparativo Específico: Professional vs Premium

| Feature | Professional | Premium | Quando vale a pena? |
|---------|-------------|---------|---------------------|
| AI Writer | Fernando escreve do zero | IA gera rascunho | Múltiplas candidaturas/mês |
| Post-Award | Gestão em Excel/manual | Dashboard dedicado | Mais de 5 projetos simultâneos |
| Website Auto | Paula faz update manual | Sincronização automática | Site é crítico para negócio |
| Email Drip | 4 sequências fixas | Sequências personalizadas | Segmentação complexa necessária |
| AI Critic | Revisão manual completa | Auto-revisão + sugestões | Padrões de qualidade muito altos |
| Suporte | 2h/mês | 5h/mês + SLA prioritário | Necessita de apoio frequente |

### 5.4 Aviso Importante

> **Nota:** O plano Premium contém funcionalidades "nice to have", não críticas para o funcionamento core da plataforma. A maioria das features Premium pode ser adicionada posteriormente como módulos separados após implementação do plano Professional.

### 5.5 Timeline

**16-20 semanas** desde o início do projeto

### 5.6 Para quem é

O plano **PREMIUM** é ideal para:
- Consultorias que querem dominar o mercado
- Organizações com alto volume de candidaturas mensais
- Equipas que procuram maximizar a automação
- Empresas com orçamento disponível para diferenciação competitiva

---

## 6. Comparação Lado a Lado

### 6.1 Tabela Comparativa Completa

| Feature | Starter | Professional | Premium |
|---------|---------|-------------|---------|
| **Scraping Portais** | 3 | 6 | 6 |
| **Sync Bitrix** | Import CSV manual | Automático (bidirecional) | Automático (bidirecional) |
| **RAG Docs** | Keyword search | Gemini File Search | + Re-ranking avançado |
| **Matchmaking Score** | Não | Sim (0-100) | + Histórico de candidaturas |
| **Chatbot AI** | Não (baseado em regras) | Sim (conversacional) | + Personalização avançada |
| **Email Drip** | Não | 4 sequências fixas | Sequências personalizadas |
| **AI Writer** | Não | Não | **SIM** |
| **Post-Award** | Não | Não | **SIM** |
| **Website Auto-Update** | Não | Não | **SIM** |
| **AI Critic** | Não | Não | **SIM** |
| **Marketing Mix AI** | Não | Não | **SIM** |
| **Dashboard KPIs** | Básico | Avançado | + Personalização |
| **Formação** | 2 sessões | 4 sessões + gravações | Onsite |
| **Suporte** | Email | 2h/mês | 5h/mês |

### 6.2 Comparação de Investimento

| Plano | Setup Inicial | Mensal | Total Ano 1 |
|-------|---------------|--------|-------------|
| Starter | EUR 5.000 | EUR 600 | EUR 12.200 |
| Professional | EUR 7.500 | EUR 800 | EUR 17.100 |
| Premium | EUR 11.000 | EUR 1.000 | EUR 23.000 |

---

## 7. Retainer Mensal - O que está incluído

### 7.1 Tabela Detalhada de Serviços

| Serviço | Starter €600 | Professional €800 | Premium €1000 |
|---------|---------------|-------------------|---------------|
| Manutenção de scrapers | ✓ | ✓ | ✓ |
| Suporte por email | ✓ | ✓ | ✓ |
| Horas de suporte dedicado | - | 2h/mês | 5h/mês |
| Atualizações da plataforma | Críticas apenas | Mensais | Quinzenais |
| Monitoramento 24/7 | Não | Sim | Sim |
| Sessão de roadmap | Não | Trimestral | Mensal |
| Prioridade de bugs | Normal | Alta | Urgente |
| Backup de dados | Diário | Diário | Diário + Retenção 1 ano |
| SLA de resposta | 3 dias úteis | 2 dias úteis | 1 dia útil |
| Atualizações de segurança | Imediato | Imediato | Imediato |

### 7.2 O que garante o retainer mensal

1. **Platform stability:** Os scrapers são adaptados sempre que os portais-alvo mudam de estrutura
2. **Suporte contínuo:** Dúvidas e problemas são resolvidos de forma recorrente
3. **Evolução:** A plataforma melhora ao longo do tempo com novas features
4. **Segurança:** Atualizações de segurança são aplicadas de imediato

---

## 8. Timeline de Implementação

### 8.1 STARTER (8 semanas)

\`\`\`
Semana 1-2: Scraping + Dashboard básico
├── Configuração de scrapers (3 portais)
├── Estrutura de base de dados
└── Dashboard com lista de avisos

Semana 3-4: Matchmaking + Chatbot
├── Algoritmo de matching básico
├── Exportação CSV
└── Chatbot de capture (baseado em regras)

Semana 5-6: RAG básico + Testes
├── Implementação de keyword search
├── Testes end-to-end
└── Ajustes de performance

Semana 7-8: Deploy + Formação
├── Deploy em produção
├── 2 sessões de formação
└── Handoff final
\`\`\`

### 8.2 PROFESSIONAL (12 semanas)

\`\`\`
Semana 1-4: TUDO do Starter
├── Todas as funcionalidades Starter
└── Base sólida para extensões

Semana 5-8: Extensões Core
├── Scraping adicionais (3 portais extra)
├── Sync Bitrix bidirecional
├── Matchmaking avançado com scoring
├── RAG com Gemini File Search
└── Dashboard enriquecido com KPIs

Semana 9-10: Automação Avançada
├── Email Drip (4 sequências)
├── Chatbot AI conversacional
└── Integração completa

Semana 11-12: Deploy + Testes Extensivos
├── Testes de carga
├── Testes de integração
├── 4 sessões de formação
└── Go-live oficial
\`\`\`

### 8.3 PREMIUM (20 semanas)

\`\`\`
Semana 1-12: TUDO do Professional
├── Todas as funcionalidades Professional
└── Base completa para premium features

Semana 13-16: AI Writer + Post-Award
├── Treinamento de modelo AI Writer
├── Interface de geração de memorias
├── Dashboard Post-Award
└── Sistema de milestones

Semana 17-18: AI Critic + Website Auto
├── Sistema de revisão automática
├── Integração com CMS do site
└── Marketing Mix AI

Semana 19-20: Deploy + Testes Completos
├── Testes de aceitação
├── Formação onsite
├── Documentação completa
└── Go-live oficial
\`\`\`

---

## 9. Perguntas Frequentes

### Posso começar no Starter e fazer upgrade depois?

**Sim.** O upgrade entre planos é possível e o investimento inicial é deduzido do novo plano. Por exemplo, se começar no Starter (€5.000) e quiser upgrade para Professional (€7.500), pagará apenas a diferença de €2.500.

**Timeline típica de upgrade:**
- Starter → Professional: +4-6 semanas
- Professional → Premium: +8-10 semanas

### O que acontece se um scraper quebrar?

A resposta depende do plano:

| Plano | Monitoramento | Tempo de reparação |
|-------|---------------|-------------------|
| Starter | Manual | 24-48 horas após report |
| Professional | 24/7 automático | Até 4 horas |
| Premium | 24/7 + alertas imediatos | Até 2 horas |

Os portais públicos podem mudar de estrutura sem aviso prévio. O retainer mensal garante que os scrapers são mantidos funcionais mesmo quando essas alterações ocorrem.

### Os dados do Bitrix estão seguros?

**Sim, absolutamente.**

- **Acesso read-only:** Por defeito, a plataforma apenas lê dados do Bitrix
- **Escrita condicionada:** Qualquer operação de escrita requer autorização explícita
- **Revogação:** O acesso pode ser revogado a qualquer momento através do Bitrix
- **Cifra:** Todas as comunicações são feitas via HTTPS
- **Logs:** Todas as operações ficam registadas para auditoria

### Preciso de fornecer as 291 candidaturas?

**Sim, para o RAG funcionar bem.**

O sistema de RAG (Retrieval-Augmented Generation) precisa de aceder aos documentos históricos para:
- Encontrar candidaturas similares
- Identificar padrões de sucesso
- Sugerir abordagens com base em casos anteriores

**Formatos aceites:**
- Acesso ao Google Drive
- Upload direto de ficheiros (PDF, DOCX)
- Exportação de outro sistema

### E se quisermos uma feature personalizada?

**Depende do plano:**

| Plano | Customizações |
|-------|---------------|
| Starter | Não disponível (plano padrão) |
| Professional | Incluídas (até 40h de desenvolvimento) |
| Premium | Incluídas (até 80h de desenvolvimento) |

Para além dessas horas, features personalizadas podem ser desenvolvidas contra fatura.

### Os dados das empresas estão seguros?

**Sim.**

- **Armazenamento seguro:** Infrastructure hospedada em região da UE (cumprimento GDPR)
- **Backups diários:** Dados backed up diariamente
- **Acesso controlado:** Autenticação segura e controlo de acessos
- **Retenção:** Configurável conforme necessidades

### Qual é o tempo mínimo de contrato?

- **Setup:** Pagamento único no início
- **Retainer:** Mínimo de 12 meses para garantir ROI
- **Cancelamento:** Após 12 meses, 30 dias de aviso prévio

### A plataforma pode ser instalada on-premise?

**Sim, opcional.**

- **Standard:** Cloud (recomendado para menor TCO)
- **On-premise:** Disponível para planos Professional e Premium (custo adicional)

---

## 10. Próximos Passos

### 10.1 Processo de Implementação

1. **Kickoff meeting** (1 hora)
   - Alinhamento de expectativas
   - Definição de acessos necessários
   - Calendarização de sprints

2. **Configuração técnica** (1 semana)
   - Setup de ambiente de desenvolvimento
   - Acesso a fontes de dados
   - Configuração de Bitrix (se aplicável)

3. **Desenvolvimento iterativo**
   - Sprints de 2 semanas
   - Demos a cada sprint
   - Feedback contínuo

4. **Formação e handoff**
   - Sessões presenciais ou remotas
   - Documentação completa
   - Período de suporte intensivo

---

*Este documento é confidencial e destina-se exclusivamente ao uso da TA Consulting.*
*Janeiro 2026*`;

export default function PropostaTecnicaPage() {
    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        const blob = new Blob([DOCUMENT_CONTENT], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'proposta-tecnica-ta-consulting.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/apresentacao-v5" className="text-slate-600 hover:text-blue-600 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <Image src="/logo-ta.png" alt="TA Consulting" width={40} height={40} priority />
                        <div>
                            <h1 className="text-lg font-bold text-slate-900">Proposta Técnica</h1>
                            <p className="text-xs text-slate-500">TA Consulting Platform - Janeiro 2026</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">Download MD</span>
                        </button>
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            <Printer className="w-4 h-4" />
                            <span className="hidden sm:inline">Imprimir / PDF</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-5xl mx-auto px-4 py-8 print:p-8">
                <article className="bg-white rounded-xl shadow-lg p-6 md:p-12 print:shadow-none print:rounded-none prose prose-slate max-w-none">
                    <div className="mb-8 pb-8 border-b border-slate-200">
                        <Image src="/logo-ta.png" alt="TA Consulting" width={80} height={80} priority />
                    </div>

                    <div className="whitespace-pre-wrap text-slate-800 leading-relaxed">
                        {DOCUMENT_CONTENT}
                    </div>

                    <div className="mt-12 pt-8 border-t border-slate-200 text-center text-sm text-slate-500 print:mt-4">
                        <p>Este documento é confidencial e destina-se exclusivamente ao uso da TA Consulting.</p>
                        <p className="mt-1">Janeiro 2026</p>
                    </div>
                </article>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 mt-12 py-6 print:hidden">
                <div className="max-w-5xl mx-auto px-4 text-center text-sm text-slate-500">
                    <p>TA Consulting Platform &copy; 2026 | Documento Confidencial</p>
                </div>
            </footer>
        </div>
    );
}
