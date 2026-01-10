/**
 * Candidatura Sections & Templates by Program
 * 
 * Estrutura de secções para candidaturas a fundos europeus,
 * organizadas por tipo de programa com checkpoints de validação.
 * 
 * Baseado em análise de 58+ candidaturas reais aprovadas.
 */

// ============ Types ============

export interface CandidaturaSection {
    id: string;
    title: string;
    description: string;
    promptTemplate: string;
    maxTokens: number;
    weight: number; // Peso no scoring (0-100)
    requiredContext: ('empresa' | 'aviso' | 'documentos' | 'historico' | 'rag_candidaturas')[];
    suggestedStructure?: string[];
    validationHints?: string[]; // Dicas para o consultor validar
}

export interface ProgramTemplate {
    id: string;
    name: string;
    portal: 'PT2030' | 'PRR' | 'PEPAC' | 'HORIZON';
    description: string;
    sections: CandidaturaSection[];
    requiredDocs: string[];
    totalWeight: number;
}

export type SectionStatus = 'pending' | 'draft' | 'review' | 'approved' | 'rejected';

export interface CandidaturaSectionState {
    sectionId: string;
    status: SectionStatus;
    content: string;
    aiSuggestion?: string;
    consultorNotes?: string;
    approvedBy?: string;
    approvedAt?: Date;
}

// ============ Secções Base (Reutilizáveis) ============

export const BASE_SECTIONS: Record<string, CandidaturaSection> = {
    caracterizacao_empresa: {
        id: 'caracterizacao_empresa',
        title: 'Caracterização da Empresa',
        description: 'Apresentação do promotor: historial, capacidade técnica e recursos',
        weight: 10,
        maxTokens: 1500,
        requiredContext: ['empresa', 'documentos'],
        promptTemplate: `
Elabora a caracterização da empresa promotora para uma candidatura a fundos europeus.

EMPRESA:
- Nome: {{empresa_nome}}
- NIPC: {{empresa_nipc}}
- CAE: {{empresa_cae}}
- Setor: {{empresa_setor}}
- Dimensão: {{empresa_dimensao}}
- Região: {{empresa_regiao}}

ESTRUTURA OBRIGATÓRIA:
1. Historial e Evolução (breve)
2. Atividade Principal
3. Recursos Humanos (quantidade, qualificações)
4. Capacidade Técnica e Tecnológica
5. Posicionamento no Mercado
6. Principais Clientes/Mercados

INSTRUÇÕES:
- Tom profissional e factual
- Destacar competências relevantes para o projeto
- Máximo 1 página
`,
        suggestedStructure: [
            'Historial',
            'Atividade Principal',
            'Recursos Humanos',
            'Capacidade Técnica',
            'Mercados'
        ],
        validationHints: [
            'Verificar se dados estão atualizados',
            'Confirmar nº trabalhadores com IES',
            'Validar CAE com certidão permanente'
        ]
    },

    descricao_projeto: {
        id: 'descricao_projeto',
        title: 'Descrição do Projeto',
        description: 'Visão geral do investimento, enquadramento e objetivos',
        weight: 15,
        maxTokens: 2000,
        requiredContext: ['empresa', 'aviso', 'historico'],
        promptTemplate: `
Escreve a descrição do projeto para a candidatura ao {{aviso_nome}}.

CONTEXTO:
- Empresa: {{empresa_nome}}
- Setor: {{empresa_setor}}
- Investimento previsto: {{investimento_total}}€

ESTRUTURA OBRIGATÓRIA:
1. Enquadramento Estratégico
   - Porquê este projeto agora?
   - Como se alinha com a estratégia da empresa?
   
2. Descrição do Investimento
   - O que vai ser feito concretamente?
   - Que equipamentos/tecnologias serão adquiridos?
   
3. Objetivos Principais
   - Objetivos quantitativos (vendas, emprego, exportações)
   - Objetivos qualitativos (competitividade, inovação)
   
4. Resultados Esperados
   - Impacto no negócio
   - Prazo de implementação

INSTRUÇÕES:
- Alinhar com critérios específicos do aviso
- Usar linguagem técnica mas acessível
- Ser específico e quantitativo quando possível
`,
        suggestedStructure: [
            'Enquadramento Estratégico',
            'Descrição do Investimento',
            'Objetivos do Projeto',
            'Resultados Esperados'
        ],
        validationHints: [
            'Verificar alinhamento com critérios do aviso',
            'Confirmar valores de investimento',
            'Validar objetivos são realistas'
        ]
    },

    componente_inovacao: {
        id: 'componente_inovacao',
        title: 'Componente de Inovação',
        description: 'Descrição do carácter inovador e diferenciador do projeto',
        weight: 20,
        maxTokens: 2000,
        requiredContext: ['empresa', 'aviso', 'rag_candidaturas'],
        promptTemplate: `
Descreve a componente de inovação do projeto para candidatura a fundos.

CONTEXTO:
- Projeto: {{projeto_nome}}
- Tipo de inovação pretendida: {{projeto_tipo_inovacao}}

ESTRUTURA OBRIGATÓRIA:
1. Natureza da Inovação
   - Produto novo ou melhorado?
   - Processo novo ou melhorado?
   - Inovação organizacional?
   
2. Estado da Arte
   - O que existe atualmente no mercado?
   - Quais são as limitações das soluções atuais?
   
3. Proposta Inovadora
   - Em que consiste a inovação?
   - Qual o carácter diferenciador?
   
4. Vantagem Competitiva
   - Que benefícios traz vs concorrência?
   - É replicável ou defensável?
   
5. Propriedade Intelectual (se aplicável)
   - Patentes existentes ou a registar
   - Segredos industriais

INSTRUÇÕES:
- Fundamentar com dados/estudos quando possível
- Comparar com concorrência/alternativas
- Evitar generalidades - ser específico
`,
        suggestedStructure: [
            'Natureza da Inovação',
            'Estado da Arte',
            'Proposta Diferenciadora',
            'Vantagem Competitiva'
        ],
        validationHints: [
            'Verificar se inovação é real ou incremental',
            'Confirmar não existe igual no mercado',
            'Validar dados de concorrência'
        ]
    },

    analise_mercado: {
        id: 'analise_mercado',
        title: 'Análise de Mercado',
        description: 'Análise do mercado-alvo, dimensão e estratégia comercial',
        weight: 15,
        maxTokens: 1800,
        requiredContext: ['empresa', 'documentos'],
        promptTemplate: `
Elabora a análise de mercado para o projeto.

CONTEXTO:
- Setor: {{empresa_setor}}
- Mercados atuais: {{empresa_mercados}}

ESTRUTURA OBRIGATÓRIA:
1. Caracterização do Mercado
   - Dimensão (volume, valor)
   - Tendências de crescimento
   - Principais players
   
2. Mercado-Alvo
   - Segmentos target
   - Perfil de cliente
   - Geografia (nacional/exportação)
   
3. Análise Competitiva
   - Principais concorrentes
   - Posicionamento relativo
   - Vantagens competitivas
   
4. Estratégia de Entrada/Crescimento
   - Canais de distribuição
   - Pricing
   - Plano de marketing

INSTRUÇÕES:
- Incluir dados quantitativos (fontes: INE, Eurostat, estudos setor)
- Ser realista nas projeções
- Identificar riscos e como mitigar
`,
        suggestedStructure: [
            'Dimensão do Mercado',
            'Segmentos Target',
            'Análise Competitiva',
            'Estratégia Comercial'
        ],
        validationHints: [
            'Verificar fontes dos dados',
            'Confirmar projeções são realistas',
            'Validar conhecimento do mercado'
        ]
    },

    equipa_tecnica: {
        id: 'equipa_tecnica',
        title: 'Equipa Técnica',
        description: 'Apresentação da equipa responsável pelo projeto',
        weight: 10,
        maxTokens: 1500,
        requiredContext: ['empresa', 'documentos'],
        promptTemplate: `
Descreve a equipa técnica responsável pela execução do projeto.

ESTRUTURA OBRIGATÓRIA:
1. Coordenador/Responsável do Projeto
   - Nome e função
   - Qualificações
   - Experiência relevante
   
2. Equipa Técnica
   - Perfis e competências
   - Dedicação ao projeto (%)
   
3. Recursos a Contratar (se aplicável)
   - Perfis necessários
   - Justificação

INSTRUÇÕES:
- Destacar experiência relevante para o projeto
- Incluir formação académica e profissional
- Quantificar dedicação (horas/mês ou %)
`,
        suggestedStructure: [
            'Coordenador do Projeto',
            'Equipa Técnica Existente',
            'Contratações Previstas'
        ],
        validationHints: [
            'Confirmar pessoas existem na empresa',
            'Verificar CVs estão atualizados',
            'Validar disponibilidade real'
        ]
    },

    plano_trabalhos: {
        id: 'plano_trabalhos',
        title: 'Plano de Trabalhos e Cronograma',
        description: 'Estrutura temporal da execução do projeto',
        weight: 10,
        maxTokens: 1500,
        requiredContext: ['aviso'],
        promptTemplate: `
Elabora o plano de trabalhos para execução do projeto em {{duracao_meses}} meses.

ESTRUTURA OBRIGATÓRIA:
1. Fases/Etapas do Projeto
   Para cada fase:
   - Designação
   - Duração (mês início - mês fim)
   - Atividades principais
   - Deliverables/Outputs
   - Responsável

2. Marcos Principais (Milestones)
   - Mês X: [Marco]

3. Dependências
   - Que fases dependem de outras?

FORMATO SUGERIDO:
Fase 1: [Nome] (M1-M3)
- Atividade 1.1: ...
- Atividade 1.2: ...
- Output: ...

INSTRUÇÕES:
- Ser realista nos prazos
- Incluir todas as atividades elegíveis
- Considerar lead times de aquisições
`,
        suggestedStructure: [
            'Fase 1: Preparação',
            'Fase 2: Aquisição',
            'Fase 3: Implementação',
            'Fase 4: Testes',
            'Fase 5: Comercialização'
        ],
        validationHints: [
            'Verificar se prazos são realistas',
            'Confirmar alinhamento com elegibilidade',
            'Validar dependências fazem sentido'
        ]
    },

    objetivos_smart: {
        id: 'objetivos_smart',
        title: 'Objetivos e Metas (SMART)',
        description: 'Definição quantitativa dos objetivos do projeto',
        weight: 10,
        maxTokens: 1200,
        requiredContext: ['empresa', 'aviso'],
        promptTemplate: `
Define objetivos SMART para o projeto.

SMART = Específico, Mensurável, Atingível, Relevante, Temporal

ESTRUTURA OBRIGATÓRIA:
Para cada objetivo (3-5 no total):
- Objetivo: [Descrição]
- Indicador/Métrica: [Como medir]
- Meta: [Valor quantitativo]
- Prazo: [Quando atingir]
- Baseline: [Valor atual]

EXEMPLO:
Objetivo: Aumentar volume de exportações
Indicador: % do VN proveniente de exportações
Baseline: 15%
Meta: 30%
Prazo: 24 meses após conclusão do projeto

INSTRUÇÕES:
- Alinhar com critérios de mérito do aviso
- Ser ambicioso mas realista
- Incluir métricas de emprego, VN, exportações
`,
        suggestedStructure: [
            'Objetivos de Crescimento',
            'Objetivos de Emprego',
            'Objetivos de Internacionalização',
            'Objetivos de Inovação'
        ],
        validationHints: [
            'Verificar baseline está correto',
            'Confirmar metas são atingíveis',
            'Validar alinhamento com critérios'
        ]
    },

    investimento_orcamento: {
        id: 'investimento_orcamento',
        title: 'Investimento e Orçamento',
        description: 'Detalhamento do investimento por rubricas elegíveis',
        weight: 10,
        maxTokens: 1500,
        requiredContext: ['aviso', 'documentos'],
        promptTemplate: `
Estrutura o plano de investimentos do projeto.

INVESTIMENTO TOTAL: {{investimento_total}}€

RUBRICAS TÍPICAS (adaptar ao aviso):
1. Construção/Obras
2. Equipamento Produtivo
3. Equipamento Administrativo
4. Software e Licenças
5. Propriedade Industrial
6. Serviços de Consultoria
7. Outras despesas elegíveis

PARA CADA RUBRICA:
- Designação
- Valor (€)
- Justificação/Necessidade

INSTRUÇÕES:
- Verificar elegibilidade de cada rubrica no aviso
- Incluir apenas despesas diretamente relacionadas
- Ter orçamentos de suporte quando possível
`,
        suggestedStructure: [
            'Investimentos Corpóreos',
            'Investimentos Incorpóreos',
            'Despesas de Funcionamento',
            'Resumo por Rubrica'
        ],
        validationHints: [
            'Confirmar rubricas são elegíveis',
            'Verificar orçamentos de suporte',
            'Validar razoabilidade dos valores'
        ]
    },

    analise_financeira: {
        id: 'analise_financeira',
        title: 'Análise Financeira',
        description: 'Viabilidade económico-financeira do projeto (TIR, VAL, Payback)',
        weight: 15,
        maxTokens: 1500,
        requiredContext: ['empresa', 'documentos'],
        promptTemplate: `
Elabora a análise de viabilidade financeira do projeto.

INVESTIMENTO: {{investimento_total}}€
INCENTIVO ESPERADO: {{incentivo_esperado}}€

INDICADORES OBRIGATÓRIOS:
1. VAL (Valor Atual Líquido)
   - Taxa de desconto utilizada
   - Valor calculado
   - Interpretação

2. TIR (Taxa Interna de Rentabilidade)
   - Valor calculado
   - Comparação com custo de capital

3. Payback Period
   - Período de recuperação do investimento

4. Projeções Financeiras (5 anos)
   - Volume de Negócios
   - EBITDA
   - Resultado Líquido

5. Fontes de Financiamento
   - Incentivo não reembolsável
   - Capitais próprios
   - Financiamento bancário (se aplicável)

INSTRUÇÕES:
- Ser conservador nas projeções
- Justificar pressupostos
- Incluir análise de sensibilidade se relevante
`,
        suggestedStructure: [
            'Pressupostos',
            'Projeções de Receitas',
            'Projeções de Custos',
            'Indicadores (VAL, TIR, Payback)',
            'Fontes de Financiamento'
        ],
        validationHints: [
            'Verificar cálculos de VAL/TIR',
            'Confirmar pressupostos são realistas',
            'Validar capacidade de capitais próprios'
        ]
    },

    sustentabilidade: {
        id: 'sustentabilidade',
        title: 'Impacto e Sustentabilidade',
        description: 'Contributo para sustentabilidade e princípios DNSH',
        weight: 10,
        maxTokens: 1200,
        requiredContext: ['empresa', 'aviso'],
        promptTemplate: `
Descreve o contributo do projeto para a sustentabilidade.

PRINCÍPIOS DNSH (Do No Significant Harm):
O projeto não pode prejudicar significativamente:
1. Mitigação das alterações climáticas
2. Adaptação às alterações climáticas
3. Utilização sustentável da água
4. Economia circular
5. Prevenção e controlo da poluição
6. Biodiversidade e ecossistemas

ESTRUTURA OBRIGATÓRIA:
1. Contributo Ambiental
   - Eficiência energética
   - Redução de emissões
   - Economia circular
   
2. Contributo Social
   - Criação de emprego
   - Igualdade de género
   - Inclusão
   
3. Contributo Económico
   - Competitividade regional
   - Cadeia de valor

4. Declaração DNSH
   - Confirmar cumprimento dos 6 princípios

INSTRUÇÕES:
- Ser específico sobre impactos positivos
- Quantificar quando possível (kWh poupados, emissões evitadas)
- Não fazer claims sem fundamento
`,
        suggestedStructure: [
            'Impacto Ambiental',
            'Impacto Social',
            'Impacto Económico',
            'Conformidade DNSH'
        ],
        validationHints: [
            'Verificar claims são fundamentados',
            'Confirmar cumprimento DNSH',
            'Validar métricas ambientais'
        ]
    },

    estado_arte: {
        id: 'estado_arte',
        title: 'Estado da Arte',
        description: 'Análise do conhecimento e tecnologia existente (para I&D)',
        weight: 15,
        maxTokens: 2000,
        requiredContext: ['aviso', 'rag_candidaturas'],
        promptTemplate: `
Elabora o estado da arte para o projeto de I&D.

ESTRUTURA OBRIGATÓRIA:
1. Revisão Bibliográfica
   - Principais publicações/estudos na área
   - Tendências tecnológicas
   
2. Soluções Existentes
   - O que existe no mercado?
   - Quais as limitações?
   
3. Benchmarking Tecnológico
   - Tecnologias concorrentes
   - Comparação de características
   
4. Gaps Identificados
   - O que falta no estado atual?
   - Que problema pretendemos resolver?
   
5. Contributo do Projeto
   - Como avança o conhecimento?
   - Que novidade traz?

INSTRUÇÕES:
- Citar fontes (artigos, patentes, estudos)
- Ser objetivo na análise
- Demonstrar conhecimento profundo da área
`,
        suggestedStructure: [
            'Revisão da Literatura',
            'Tecnologias Existentes',
            'Gaps e Oportunidades',
            'Contributo Científico'
        ],
        validationHints: [
            'Verificar fontes bibliográficas',
            'Confirmar gaps são reais',
            'Validar contributo é original'
        ]
    },

    diagnostico_digital: {
        id: 'diagnostico_digital',
        title: 'Diagnóstico de Maturidade Digital',
        description: 'Avaliação do estado atual de digitalização (para PRR)',
        weight: 20,
        maxTokens: 1500,
        requiredContext: ['empresa', 'documentos'],
        promptTemplate: `
Elabora o diagnóstico de maturidade digital da empresa.

DIMENSÕES A AVALIAR:
1. Infraestrutura Tecnológica
   - Hardware/Rede
   - Cloud
   - Cibersegurança
   
2. Sistemas de Informação
   - ERP
   - CRM
   - Business Intelligence
   
3. Processos Digitais
   - % processos digitalizados
   - Automação
   
4. Competências Digitais
   - Nível da equipa
   - Formação existente
   
5. Presença Digital
   - Website
   - E-commerce
   - Redes sociais

SCORE DE MATURIDADE (1-5 por dimensão):
1 = Inexistente
2 = Básico
3 = Intermédio
4 = Avançado
5 = Otimizado

INSTRUÇÕES:
- Ser honesto na autoavaliação
- Identificar gaps prioritários
- Fundamentar com evidências
`,
        suggestedStructure: [
            'Infraestrutura Atual',
            'Sistemas e Processos',
            'Competências',
            'Score de Maturidade',
            'Gaps Prioritários'
        ],
        validationHints: [
            'Verificar score é realista',
            'Confirmar gaps identificados',
            'Validar com evidências'
        ]
    },

    plano_digitalizacao: {
        id: 'plano_digitalizacao',
        title: 'Plano de Digitalização',
        description: 'Estratégia e ações de transformação digital (para PRR)',
        weight: 30,
        maxTokens: 2000,
        requiredContext: ['empresa', 'aviso'],
        promptTemplate: `
Elabora o plano de digitalização para o projeto PRR.

ESTRUTURA OBRIGATÓRIA:
1. Objetivos de Digitalização
   - Onde queremos estar em 2 anos?
   - Que nível de maturidade pretendemos?
   
2. Ações de Transformação
   Para cada ação:
   - Descrição
   - Tecnologia a implementar
   - Investimento
   - Prazo
   
3. Tecnologias a Implementar
   - Nome/tipo
   - Fornecedor (se conhecido)
   - Justificação
   
4. KPIs de Sucesso
   - Como medir o sucesso?
   - Metas quantitativas
   
5. Riscos e Mitigação
   - Principais riscos
   - Plano de mitigação

INSTRUÇÕES:
- Ser específico nas tecnologias
- Alinhar com diagnóstico (resolver gaps)
- Incluir formação se necessário
`,
        suggestedStructure: [
            'Visão Digital',
            'Ações Prioritárias',
            'Roadmap de Implementação',
            'KPIs',
            'Gestão de Riscos'
        ],
        validationHints: [
            'Verificar alinha com diagnóstico',
            'Confirmar tecnologias são elegíveis',
            'Validar cronograma é realista'
        ]
    }
};

// ============ Templates por Programa ============

export const PROGRAM_TEMPLATES: Record<string, ProgramTemplate> = {
    'pt2030-inovacao': {
        id: 'pt2030-inovacao',
        name: 'PT2030 SI Inovação Produtiva',
        portal: 'PT2030',
        description: 'Template para candidaturas ao Sistema de Incentivos à Inovação Produtiva',
        totalWeight: 100,
        requiredDocs: [
            'Certidão Permanente',
            'IES/Modelo 22 (3 anos)',
            'Declaração Minimis',
            'Declaração DNSH',
            'Orçamentos (3 por item)'
        ],
        sections: [
            BASE_SECTIONS.caracterizacao_empresa,
            BASE_SECTIONS.descricao_projeto,
            BASE_SECTIONS.componente_inovacao,
            BASE_SECTIONS.analise_mercado,
            BASE_SECTIONS.objetivos_smart,
            BASE_SECTIONS.plano_trabalhos,
            BASE_SECTIONS.investimento_orcamento,
            BASE_SECTIONS.sustentabilidade
        ]
    },

    'pt2030-id': {
        id: 'pt2030-id',
        name: 'PT2030 I&D Empresarial',
        portal: 'PT2030',
        description: 'Template para candidaturas a projetos de Investigação e Desenvolvimento',
        totalWeight: 100,
        requiredDocs: [
            'Certidão Permanente',
            'CVs da equipa técnica',
            'Cartas compromisso parceiros',
            'Declaração DNSH'
        ],
        sections: [
            BASE_SECTIONS.caracterizacao_empresa,
            BASE_SECTIONS.estado_arte,
            BASE_SECTIONS.descricao_projeto,
            BASE_SECTIONS.componente_inovacao,
            BASE_SECTIONS.equipa_tecnica,
            BASE_SECTIONS.plano_trabalhos,
            BASE_SECTIONS.objetivos_smart,
            BASE_SECTIONS.analise_financeira,
            BASE_SECTIONS.sustentabilidade
        ]
    },

    'prr-vouchers': {
        id: 'prr-vouchers',
        name: 'PRR Vouchers Digitalização',
        portal: 'PRR',
        description: 'Template simplificado para Vouchers de Digitalização',
        totalWeight: 100,
        requiredDocs: [
            'Declaração PME',
            'Orçamentos (3 por item)',
            'IBAN'
        ],
        sections: [
            { ...BASE_SECTIONS.caracterizacao_empresa, weight: 15 },
            { ...BASE_SECTIONS.diagnostico_digital, weight: 25 },
            { ...BASE_SECTIONS.plano_digitalizacao, weight: 40 },
            { ...BASE_SECTIONS.investimento_orcamento, weight: 20 }
        ]
    },

    'prr-digital': {
        id: 'prr-digital',
        name: 'PRR Transição Digital',
        portal: 'PRR',
        description: 'Template para projetos de Transição Digital (mais completo)',
        totalWeight: 100,
        requiredDocs: [
            'Declaração PME',
            'Plano de Digitalização',
            'Orçamentos detalhados',
            'Declaração DNSH'
        ],
        sections: [
            BASE_SECTIONS.caracterizacao_empresa,
            BASE_SECTIONS.diagnostico_digital,
            BASE_SECTIONS.plano_digitalizacao,
            BASE_SECTIONS.objetivos_smart,
            BASE_SECTIONS.plano_trabalhos,
            BASE_SECTIONS.investimento_orcamento,
            BASE_SECTIONS.sustentabilidade
        ]
    }
};

// ============ Helper Functions ============

export function getTemplateByProgram(programId: string): ProgramTemplate | null {
    return PROGRAM_TEMPLATES[programId] || null;
}

export function getSectionById(sectionId: string): CandidaturaSection | null {
    return BASE_SECTIONS[sectionId] || null;
}

export function getAllPrograms(): ProgramTemplate[] {
    return Object.values(PROGRAM_TEMPLATES);
}

export function calculateProgress(states: CandidaturaSectionState[], template: ProgramTemplate): number {
    const approvedWeight = states
        .filter(s => s.status === 'approved')
        .reduce((sum, s) => {
            const section = template.sections.find(sec => sec.id === s.sectionId);
            return sum + (section?.weight || 0);
        }, 0);

    return Math.round((approvedWeight / template.totalWeight) * 100);
}

// Legacy export for backwards compatibility
export const CANDIDATURA_SECTIONS = Object.values(BASE_SECTIONS);
