/**
 * Application Templates for EU Funding
 * 
 * Structured templates with AI-fillable sections for each funding program
 */

// Template section types
export interface TemplateSection {
    id: string;
    title: string;
    description: string;
    placeholder: string;
    aiPrompt: string;
    maxLength: number;
    required: boolean;
    order: number;
}

export interface ApplicationTemplate {
    id: string;
    name: string;
    portal: 'PORTUGAL2030' | 'PRR' | 'PEPAC' | 'HORIZON' | 'EUROPA_CRIATIVA';
    description: string;
    sections: TemplateSection[];
    createdAt: Date;
    updatedAt: Date;
}

// PT2030 Template - SI Inovação
export const PT2030_INOVACAO: ApplicationTemplate = {
    id: 'pt2030-inovacao',
    name: 'SI Inovação Produtiva - PT2030',
    portal: 'PORTUGAL2030',
    description: 'Template para candidaturas ao Sistema de Incentivos à Inovação Produtiva',
    createdAt: new Date(),
    updatedAt: new Date(),
    sections: [
        {
            id: 'resumo',
            title: 'Resumo do Projeto',
            description: 'Síntese do projeto em linguagem acessível',
            placeholder: 'Descreva o projeto de forma sucinta, incluindo objetivos principais, inovação e impacto esperado...',
            aiPrompt: `Gera um resumo executivo para uma candidatura PT2030, baseado na informação da empresa:
- Nome: {{empresa.nome}}
- Setor: {{empresa.setor}}
- Objetivo do projeto: {{projeto.objetivo}}

O resumo deve:
1. Ter máximo 500 palavras
2. Destacar a inovação do projeto
3. Mencionar impacto económico esperado
4. Usar linguagem formal mas acessível
5. Seguir as guidelines do Portugal 2030`,
            maxLength: 3000,
            required: true,
            order: 1
        },
        {
            id: 'caracterizacao',
            title: 'Caracterização da Empresa',
            description: 'Apresentação da empresa promotora',
            placeholder: 'Descreva a empresa, a sua história, experiência relevante e capacidade técnica...',
            aiPrompt: `Gera a caracterização da empresa para candidatura PT2030:
- Nome: {{empresa.nome}}
- NIPC: {{empresa.nipc}}
- Setor: {{empresa.setor}}
- Dimensão: {{empresa.dimensao}}
- CAE: {{empresa.cae}}
- Região: {{empresa.regiao}}

Incluir:
1. Historial e experiência
2. Capacidade técnica e recursos humanos
3. Posicionamento no mercado
4. Resultados anteriores relevantes`,
            maxLength: 5000,
            required: true,
            order: 2
        },
        {
            id: 'inovacao',
            title: 'Componente de Inovação',
            description: 'Descrição da inovação proposta',
            placeholder: 'Explique em que consiste a inovação, o seu caráter diferenciador e vantagens competitivas...',
            aiPrompt: `Descreve a componente de inovação do projeto:
- Tipo de inovação: {{projeto.tipoInovacao}}
- Descrição técnica: {{projeto.descricaoTecnica}}

Estrutura:
1. Natureza da inovação (produto/processo/organizacional)
2. Estado da arte e gaps identificados
3. Proposta inovadora e diferenciação
4. Propriedade intelectual (se aplicável)
5. Potencial de replicação`,
            maxLength: 6000,
            required: true,
            order: 3
        },
        {
            id: 'plano-investimentos',
            title: 'Plano de Investimentos',
            description: 'Detalhamento dos investimentos previstos',
            placeholder: 'Liste os investimentos por categoria, valores e cronograma...',
            aiPrompt: `Estrutura o plano de investimentos:
- Montante total: {{projeto.montanteTotal}}
- Categorias: {{projeto.categorias}}
- Período: {{projeto.periodo}}

Organizar por:
1. Investimentos corpóreos (equipamentos, obras)
2. Investimentos incorpóreos (software, patentes)
3. Despesas de funcionamento elegíveis
4. Cronograma de execução`,
            maxLength: 4000,
            required: true,
            order: 4
        },
        {
            id: 'impacto',
            title: 'Impacto Económico e Social',
            description: 'Resultados esperados do projeto',
            placeholder: 'Quantifique os impactos esperados: emprego, volume de negócios, exportações...',
            aiPrompt: `Descreve o impacto esperado do projeto:
- Emprego atual: {{empresa.emprego}}
- VN atual: {{empresa.volumeNegocios}}

Incluir:
1. Criação de emprego (qualificado)
2. Aumento do volume de negócios
3. Impacto nas exportações
4. Contributo para a transição digital/verde
5. Impacto regional/local`,
            maxLength: 4000,
            required: true,
            order: 5
        },
        {
            id: 'orcamento',
            title: 'Quadro de Financiamento',
            description: 'Estrutura de financiamento do projeto',
            placeholder: 'Detalhe as fontes de financiamento: incentivo solicitado, capitais próprios, outros...',
            aiPrompt: `Estrutura o quadro de financiamento:
- Investimento total: {{projeto.investimentoTotal}}
- Taxa de incentivo esperada: {{aviso.taxa}}

Calcular:
1. Incentivo não reembolsável
2. Capitais próprios necessários
3. Outros financiamentos (se aplicável)
4. Verificar regras de minimis`,
            maxLength: 2000,
            required: true,
            order: 6
        }
    ]
};

// PRR Template - Transição Digital
export const PRR_DIGITAL: ApplicationTemplate = {
    id: 'prr-digital',
    name: 'Transição Digital - PRR',
    portal: 'PRR',
    description: 'Template para candidaturas de Transição Digital no PRR',
    createdAt: new Date(),
    updatedAt: new Date(),
    sections: [
        {
            id: 'resumo',
            title: 'Síntese do Projeto',
            description: 'Resumo executivo do projeto de digitalização',
            placeholder: 'Descreva o projeto de transformação digital...',
            aiPrompt: `Gera resumo para projeto de transição digital PRR:
- Empresa: {{empresa.nome}}
- Área de digitalização: {{projeto.area}}

Focar em:
1. Maturidade digital atual
2. Transformação proposta
3. Tecnologias a implementar
4. Resultados esperados`,
            maxLength: 2500,
            required: true,
            order: 1
        },
        {
            id: 'diagnostico',
            title: 'Diagnóstico Digital',
            description: 'Avaliação do estado atual de maturidade digital',
            placeholder: 'Avalie o nível de digitalização atual da empresa...',
            aiPrompt: `Gera diagnóstico de maturidade digital:
- Sistemas atuais: {{empresa.sistemas}}
- Processos digitalizados: {{empresa.processosDigitais}}

Avaliar:
1. Infraestrutura tecnológica
2. Competências digitais
3. Processos e automação
4. Presença digital
5. Cibersegurança`,
            maxLength: 4000,
            required: true,
            order: 2
        },
        {
            id: 'plano-digital',
            title: 'Plano de Digitalização',
            description: 'Estratégia e ações de transformação digital',
            placeholder: 'Detalhe as ações de digitalização previstas...',
            aiPrompt: `Estrutura o plano de digitalização:
- Objetivos: {{projeto.objetivos}}
- Investimento: {{projeto.investimento}}

Incluir:
1. Ações prioritárias
2. Tecnologias a implementar
3. Cronograma de implementação
4. Indicadores de sucesso`,
            maxLength: 5000,
            required: true,
            order: 3
        }
    ]
};

// Get all templates
export const TEMPLATES: Record<string, ApplicationTemplate> = {
    'pt2030-inovacao': PT2030_INOVACAO,
    'prr-digital': PRR_DIGITAL,
};

export function getTemplateById(id: string): ApplicationTemplate | null {
    return TEMPLATES[id] || null;
}

export function getTemplatesByPortal(portal: string): ApplicationTemplate[] {
    return Object.values(TEMPLATES).filter(t => t.portal === portal);
}
