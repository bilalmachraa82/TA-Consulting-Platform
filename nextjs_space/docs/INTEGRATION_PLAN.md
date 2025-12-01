# Plano de Integração e Novas Funcionalidades

## 1. Integração aiparati-express (AutoFund AI)

### Visão Geral
O projeto [aiparati-express](https://github.com/bilalmachraa82/aiparati-express) é uma plataforma de automação de candidaturas que pode complementar o TA-Consulting-Platform.

### Funcionalidades a Integrar

#### 1.1 Processamento Automático de IES
```
Fluxo: Upload IES PDF → Extração com Claude → Análise Financeira → Relatório
```
- **Entrada**: Ficheiro IES da empresa cliente
- **Processamento**: Extração automática de dados financeiros
- **Saída**: Análise de elegibilidade para cada programa

#### 1.2 Geração de Templates IAPMEI
```
Fluxo: Dados Empresa + Aviso → Pré-preenchimento → Excel IAPMEI
```
- Preencher automaticamente templates de candidatura
- Validar dados antes da submissão
- Exportar para formato exigido pelo IAPMEI

#### 1.3 Arquitetura de Integração

```
┌─────────────────────────────────────────────────────────────┐
│                    TA-Consulting-Platform                   │
├─────────────────────────────────────────────────────────────┤
│  Frontend (Next.js)                                         │
│  ├── Dashboard                                              │
│  ├── Gestão de Empresas                                     │
│  ├── Avisos e Candidaturas                                  │
│  └── [NOVO] Módulo AutoFund                                 │
├─────────────────────────────────────────────────────────────┤
│  Backend APIs                                               │
│  ├── /api/empresas                                          │
│  ├── /api/avisos                                            │
│  ├── /api/rag/*                                             │
│  └── [NOVO] /api/autofund/*                                 │
├─────────────────────────────────────────────────────────────┤
│  [NOVO] Microserviço AutoFund (aiparati-express)            │
│  ├── FastAPI Backend                                        │
│  ├── Processamento PDF (Claude 3.5)                         │
│  ├── Análise Financeira                                     │
│  └── Geração de Templates                                   │
└─────────────────────────────────────────────────────────────┘
```

### Endpoints a Criar

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/autofund/upload-ies` | POST | Upload e processamento de IES |
| `/api/autofund/analyze` | POST | Análise financeira da empresa |
| `/api/autofund/match` | GET | Matching empresa ↔ avisos |
| `/api/autofund/generate-template` | POST | Gerar template IAPMEI |
| `/api/autofund/status` | GET | Estado do processamento |

---

## 2. Novas Funcionalidades Premium

### 2.1 Sistema de Alertas Inteligentes
**Prioridade: ALTA**

```typescript
// Alertas automáticos baseados em:
- Novos avisos que matcham perfil da empresa
- Prazos a terminar (7, 14, 30 dias)
- Mudanças em regulamentos
- Oportunidades de financiamento combinado
```

**Canais de notificação:**
- Email (Resend já configurado)
- SMS (Twilio)
- Push notifications (PWA)
- Integração Slack/Teams

### 2.2 Score de Elegibilidade Automático
**Prioridade: ALTA**

```typescript
interface EligibilityScore {
  aviso_id: string;
  empresa_id: string;
  score_total: number; // 0-100
  breakdown: {
    setor_match: number;
    dimensao_match: number;
    regiao_match: number;
    financeiro_match: number;
    requisitos_match: number;
  };
  recomendacoes: string[];
  riscos: string[];
}
```

### 2.3 Simulador de Candidatura
**Prioridade: MÉDIA**

- Pré-visualização de elegibilidade
- Cálculo de apoio esperado
- Identificação de documentos em falta
- Timeline de preparação

### 2.4 Gestão de Documentos Inteligente
**Prioridade: MÉDIA**

```typescript
// Funcionalidades:
- Checklist automática por aviso
- Validação de documentos (datas, formatos)
- OCR para documentos digitalizados
- Organização automática por candidatura
```

### 2.5 Dashboard de Analytics
**Prioridade: MÉDIA**

```typescript
// Métricas:
- Taxa de sucesso por programa
- Montante total captado
- Pipeline de candidaturas
- Performance por consultor
- Comparativo com mercado
```

### 2.6 Chatbot Especializado com RAG
**Prioridade: ALTA**

```typescript
// Capacidades:
- Responder questões sobre avisos
- Explicar requisitos de elegibilidade
- Sugerir programas para perfil específico
- Histórico de conversações
- Integração com Gemini File Search
```

### 2.7 API de Parceiros
**Prioridade: BAIXA**

- White-label para outras consultoras
- Webhooks para integrações
- Rate limiting por tier
- Dashboard de uso

### 2.8 Módulo de Reporting
**Prioridade: MÉDIA**

```typescript
// Relatórios automáticos:
- Relatório mensal de oportunidades
- Análise de portfolio de clientes
- Previsão de funding
- Exportação para Excel/PDF
```

---

## 3. Roadmap Sugerido

### Fase 1 (Semana 1-2)
- [x] Base de dados com avisos reais
- [x] Sistema RAG com Gemini
- [ ] Alertas por email
- [ ] Score de elegibilidade básico

### Fase 2 (Semana 3-4)
- [ ] Integração aiparati-express
- [ ] Upload e processamento de IES
- [ ] Chatbot melhorado

### Fase 3 (Semana 5-6)
- [ ] Dashboard analytics
- [ ] Simulador de candidatura
- [ ] Gestão de documentos

### Fase 4 (Semana 7-8)
- [ ] API de parceiros
- [ ] Reporting automático
- [ ] Otimizações de performance

---

## 4. Configuração Técnica Necessária

### Variáveis de Ambiente Adicionais

```env
# AutoFund Integration
AUTOFUND_API_URL=http://localhost:8000
AUTOFUND_API_KEY=your-autofund-key

# Alertas
TWILIO_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE=+351...

# Analytics
POSTHOG_KEY=your-posthog-key
```

### Dependências Recomendadas

```json
{
  "node-cron": "^3.0.0",
  "@twilio/sdk": "^4.0.0",
  "recharts": "^2.10.0",
  "react-pdf": "^7.0.0",
  "xlsx": "^0.18.5"
}
```

---

## 5. Próximos Passos Imediatos

1. **Configurar GEMINI_API_KEY** para ativar RAG avançado
2. **Testar endpoints existentes** com dados reais
3. **Implementar alertas por email** (Resend já configurado)
4. **Criar endpoint de score de elegibilidade**
5. **Planear deployment do aiparati-express** como microserviço

---

*Documento criado: 2025-12-01*
*Autor: Claude (Assistente de Desenvolvimento)*
