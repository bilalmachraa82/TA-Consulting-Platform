
// Templates estruturados para Memórias Descritivas
// Baseados em análise de documentos reais e guidelines Portugal 2030/IAPMEI

export interface MemoriaTemplate {
  programa: string; // Portugal 2030, PAPAC, PRR
  secoes: SecaoTemplate[];
  requisitos: string[];
  exemplos: string[];
}

export interface SecaoTemplate {
  titulo: string;
  subtitulo?: string;
  conteudoBase: string;
  topicos: string[];
  dicasRedacao: string[];
  exemploPratico?: string;
}

// TEMPLATE PORTUGAL 2030
export const TEMPLATE_PORTUGAL_2030: MemoriaTemplate = {
  programa: 'Portugal 2030',
  secoes: [
    {
      titulo: '1. IDENTIFICAÇÃO DO PROJETO',
      conteudoBase: 'Apresentação clara e objetiva do projeto, incluindo designação, enquadramento estratégico e objetivos principais.',
      topicos: [
        'Designação do projeto (clara, objetiva, max 100 caracteres)',
        'Enquadramento no Sistema de Incentivos',
        'Alinhamento com estratégia empresarial',
        'Objetivos específicos e mensuráveis',
        'Resultados esperados quantificados'
      ],
      dicasRedacao: [
        'Use linguagem técnica mas acessível',
        'Evite jargão excessivo ou demasiado simplista',
        'Quantifique sempre que possível (%, €, unidades)',
        'Demonstre conhecimento do programa e regulamento',
        'Destaque a relevância e impacto do projeto'
      ],
      exemploPratico: 'Exemplo: "Implementação de Sistema de Produção Inteligente 4.0 para aumentar a eficiência produtiva em 30% e reduzir desperdícios em 25%, através da digitalização de linhas de montagem e integração IoT."'
    },
    {
      titulo: '2. CARACTERIZAÇÃO DA EMPRESA',
      conteudoBase: 'Descrição detalhada da empresa candidata, incluindo atividade, posicionamento no mercado, capacidades instaladas e histórico relevante.',
      topicos: [
        'Identificação completa (NIPC, CAE, sede)',
        'Histórico e evolução da empresa',
        'Atividade principal e produtos/serviços',
        'Dimensão (microempresa, PME, grande empresa)',
        'Estrutura organizacional e recursos humanos',
        'Indicadores económico-financeiros (volume negócios, VAB, EBITDA)',
        'Posicionamento competitivo e quota de mercado',
        'Certificações, prémios e reconhecimentos',
        'Experiência prévia com incentivos públicos'
      ],
      dicasRedacao: [
        'Apresente dados concretos e atualizados',
        'Destaque pontos fortes e capacidades distintivas',
        'Demonstre solidez financeira e capacidade de execução',
        'Mencione qualificações técnicas da equipa',
        'Evidencie histórico de sucesso e crescimento'
      ],
      exemploPratico: 'Exemplo: "A [Empresa X], NIPC [número], fundada em [ano], é uma PME especializada em [setor], com volume de negócios de €[valor]M em [ano], empregando [número] colaboradores qualificados. A empresa detém certificação ISO [número] e foi galardoada com [prémio] em [ano]."'
    },
    {
      titulo: '3. ENQUADRAMENTO E JUSTIFICAÇÃO',
      conteudoBase: 'Análise do contexto que justifica o projeto, incluindo diagnóstico da situação atual, problemas/oportunidades identificados e benefícios esperados.',
      topicos: [
        'Diagnóstico da situação atual (SWOT interno)',
        'Análise do contexto de mercado',
        'Identificação clara de problemas a resolver',
        'Oportunidades de negócio identificadas',
        'Necessidade estratégica do investimento',
        'Alinhamento com prioridades setoriais e regionais',
        'Contributo para objetivos nacionais/europeus',
        'Impacto económico, social e ambiental esperado'
      ],
      dicasRedacao: [
        'Estruture em: Situação Atual → Problema/Oportunidade → Solução',
        'Use dados e evidências concretas',
        'Referencie estudos, tendências de mercado, benchmarks',
        'Demonstre urgência e relevância do projeto',
        'Conecte com objetivos do programa (digitalização, descarbonização, etc.)',
        'Evite generalidades - seja específico ao seu caso'
      ]
    },
    {
      titulo: '4. DESCRIÇÃO TÉCNICA DO PROJETO',
      conteudoBase: 'Detalhamento técnico completo do projeto, incluindo atividades, metodologias, tecnologias, cronograma e plano de implementação.',
      topicos: [
        'Objetivo geral e objetivos específicos',
        'Descrição detalhada das atividades/investimentos',
        'Metodologia de implementação',
        'Tecnologias e equipamentos a adquirir',
        'Infraestruturas e instalações necessárias',
        'Recursos humanos envolvidos',
        'Parcerias e fornecedores estratégicos',
        'Cronograma detalhado de execução',
        'Marcos (milestones) e entregáveis',
        'Plano de gestão do projeto'
      ],
      dicasRedacao: [
        'Organize por fases ou workpackages',
        'Especifique modelos e características técnicas',
        'Inclua diagramas, plantas, esquemas (se relevante)',
        'Demonstre viabilidade técnica',
        'Evidencie inovação e diferenciação',
        'Detalhe suficiente para avaliadores compreenderem a execução'
      ]
    },
    {
      titulo: '5. INDICADORES E METAS',
      conteudoBase: 'Definição clara de indicadores de realização e resultado, com metas quantificadas e calendário de monitorização.',
      topicos: [
        'Indicadores de realização (outputs): investimento, equipamentos, formações',
        'Indicadores de resultado (outcomes): produção, vendas, emprego',
        'Indicadores de impacto: competitividade, inovação, exportações',
        'Valores baseline (situação atual)',
        'Metas quantificadas para cada indicador',
        'Prazo de concretização das metas',
        'Metodologia de cálculo e fontes de verificação',
        'Alinhamento com indicadores obrigatórios do programa'
      ],
      dicasRedacao: [
        'Use indicadores SMART (Específicos, Mensuráveis, Atingíveis, Relevantes, Temporais)',
        'Seja ambicioso mas realista',
        'Garanta rastreabilidade e verificabilidade',
        'Inclua indicadores obrigatórios do regulamento',
        'Demonstre impacto tangível do investimento'
      ]
    },
    {
      titulo: '6. ORÇAMENTO DETALHADO',
      conteudoBase: 'Apresentação completa e fundamentada do plano de investimento, discriminado por rubricas elegíveis.',
      topicos: [
        'Investimento total do projeto',
        'Investimento elegível',
        'Discriminação por rubricas principais',
        'Detalhamento de cada rubrica (fornecedores, quantidades, valores)',
        'Fundamentação técnico-económica',
        'Conformidade com custos de referência',
        'Comparação de propostas (3 orçamentos quando aplicável)',
        'IVA (elegível ou não, justificação)',
        'Contribuição privada da empresa'
      ],
      dicasRedacao: [
        'Detalhe ao máximo cada linha orçamental',
        'Justifique custos elevados ou específicos',
        'Evidencie benchmarking e competitividade',
        'Separe claramente elegível vs. não-elegível',
        'Demonstre proporcionalidade e racionalidade económica',
        'Anexe orçamentos de fornecedores credíveis'
      ]
    },
    {
      titulo: '7. ANÁLISE ECONÓMICO-FINANCEIRA',
      conteudoBase: 'Avaliação da viabilidade económica e sustentabilidade financeira do projeto.',
      topicos: [
        'Pressupostos macroeconómicos e setoriais',
        'Mapa de investimento e financiamento',
        'Projeção de resultados (5-10 anos)',
        'Análise de rentabilidade (VAL, TIR)',
        'Análise de sensibilidade e risco',
        'Capacidade de financiamento e reembolso',
        'Impacto nos principais rácios financeiros',
        'Sustentabilidade de longo prazo'
      ],
      dicasRedacao: [
        'Baseie em pressupostos realistas e fundamentados',
        'Demonstre conhecimento financeiro sólido',
        'Apresente cenários pessimista/base/otimista',
        'Evidencie viabilidade mesmo em cenário adverso',
        'Explique impacto do incentivo na decisão de investir'
      ]
    },
    {
      titulo: '8. CONTRIBUTOS PARA OBJETIVOS ESTRATÉGICOS',
      conteudoBase: 'Demonstração clara de como o projeto contribui para objetivos do programa e políticas públicas.',
      topicos: [
        'Contributo para a competitividade empresarial',
        'Impacto na produtividade e eficiência',
        'Criação/manutenção de emprego qualificado',
        'Promoção da inovação e I&D',
        'Digitalização e Transição Digital',
        'Descarbonização e Transição Climática',
        'Internacionalização e exportações',
        'Desenvolvimento regional e coesão territorial',
        'Igualdade de género e inclusão social'
      ],
      dicasRedacao: [
        'Conecte explicitamente com critérios de avaliação',
        'Use linguagem dos documentos programáticos',
        'Quantifique os contributos sempre que possível',
        'Evidencie alinhamento estratégico forte',
        'Destaque co-benefícios e efeitos multiplicadores'
      ]
    }
  ],
  requisitos: [
    'Linguagem clara, objetiva e profissional em português',
    'Fundamentação sólida com dados e evidências',
    'Coerência entre todas as secções',
    'Alinhamento com regulamento específico do aviso',
    'Indicadores SMART e quantificados',
    'Orçamento detalhado e fundamentado',
    'Viabilidade técnica, económica e financeira demonstrada',
    'Contributo claro para objetivos do programa'
  ],
  exemplos: [
    'Projetos de digitalização devem enfatizar ganhos de produtividade, redução de custos, melhor gestão e novos modelos de negócio',
    'Projetos de descarbonização devem quantificar redução de emissões, eficiência energética e uso de renováveis',
    'Projetos de I&D devem detalhar novidade, grau de inovação, metodologia científica e resultados esperados',
    'Projetos de internacionalização devem fundamentar mercados-alvo, estratégia comercial e potencial exportador'
  ]
};

// TEMPLATE PAPAC (Plano de Apoio ao Arrendamento Comercial)
// Adaptado para projetos de modernização e eficiência de espaços comerciais
export const TEMPLATE_PAPAC: MemoriaTemplate = {
  programa: 'PAPAC',
  secoes: [
    {
      titulo: '1. IDENTIFICAÇÃO E OBJETIVOS',
      conteudoBase: 'Identificação do estabelecimento comercial e objetivos da intervenção.',
      topicos: [
        'Localização e caracterização do espaço (morada, área, tipologia)',
        'Atividade comercial desenvolvida (CAE, descrição)',
        'Caracterização do negócio atual',
        'Objetivo da modernização/reabilitação',
        'Impacto esperado no negócio e na zona comercial'
      ],
      dicasRedacao: [
        'Seja específico quanto à localização e contexto urbano',
        'Demonstre necessidade da intervenção',
        'Evidencie impacto positivo na dinâmica comercial local',
        'Quantifique melhorias esperadas (eficiência energética, vendas, etc.)'
      ]
    },
    {
      titulo: '2. DESCRIÇÃO DA INTERVENÇÃO',
      conteudoBase: 'Detalhamento técnico das obras e investimentos a realizar.',
      topicos: [
        'Descrição detalhada das obras',
        'Equipamentos a adquirir',
        'Soluções de eficiência energética',
        'Melhorias de acessibilidade',
        'Prazo de execução'
      ],
      dicasRedacao: [
        'Especifique materiais e tecnologias a utilizar',
        'Evidencie conformidade com normas técnicas',
        'Demonstre contributo para sustentabilidade'
      ]
    },
    {
      titulo: '3. ORÇAMENTO E FINANCIAMENTO',
      conteudoBase: 'Plano financeiro da intervenção.',
      topicos: [
        'Orçamento detalhado por rúbricas',
        'Fundamentação de custos',
        'Plano de financiamento'
      ],
      dicasRedacao: [
        'Anexe orçamentos de fornecedores',
        'Demonstre razoabilidade de custos'
      ]
    }
  ],
  requisitos: [
    'Demonstração clara da necessidade de intervenção',
    'Orçamento detalhado das obras/equipamentos',
    'Conformidade com requisitos específicos do PAPAC',
    'Impacto na dinamização comercial'
  ],
  exemplos: []
};

// TEMPLATE PRR (Plano de Recuperação e Resiliência)
export const TEMPLATE_PRR: MemoriaTemplate = {
  programa: 'PRR',
  secoes: [
    {
      titulo: '1. ALINHAMENTO COM O PRR',
      conteudoBase: 'Demonstração clara do alinhamento com objetivos e dimensões do PRR.',
      topicos: [
        'Componente específica do PRR',
        'Investimento (RE-C ou TC-C)',
        'Contributo para a Transição Climática (% tagging verde)',
        'Contributo para a Transição Digital (% tagging digital)',
        'Alinhamento com reformas estruturais',
        'Contributo para resiliência económica e social'
      ],
      dicasRedacao: [
        'Cite explicitamente componente, reforma e investimento do PRR',
        'Quantifique tagging verde/digital conforme metodologia UE',
        'Demonstre impacto transformador e não apenas incremental',
        'Evidencie não causar dano significativo (DNSH - Do No Significant Harm)'
      ]
    },
    {
      titulo: '2. DESCRIÇÃO DO PROJETO',
      conteudoBase: 'Detalhamento técnico alinhado com objetivos PRR.',
      topicos: [
        'Objetivos transformadores',
        'Atividades e investimentos',
        'Tecnologias e soluções inovadoras',
        'Impacto nas transições verde e digital',
        'Cronograma alinhado com PRR'
      ],
      dicasRedacao: [
        'Enfatize caráter transformador vs. business-as-usual',
        'Demonstre contributo significativo para dupla transição',
        'Evidencie urgência e alinhamento temporal com PRR'
      ]
    },
    {
      titulo: '3. IMPACTO E RESULTADOS',
      conteudoBase: 'Resultados esperados e contributo para metas PRR.',
      topicos: [
        'Indicadores de realização',
        'Indicadores de resultado',
        'Contributo para metas PRR',
        'Impacto económico, social e ambiental',
        'Sustentabilidade e efeito duradouro'
      ],
      dicasRedacao: [
        'Alinhe indicadores com framework PRR',
        'Quantifique contributo para metas nacionais',
        'Demonstre efeito catalisador e multiplicador'
      ]
    },
    {
      titulo: '4. ORÇAMENTO E VIABILIDADE',
      conteudoBase: 'Plano financeiro e análise de viabilidade.',
      topicos: [
        'Orçamento detalhado',
        'Análise custo-benefício',
        'Plano de financiamento',
        'Conformidade com elegibilidade PRR'
      ],
      dicasRedacao: [
        'Demonstre value for money',
        'Evidencie complementaridade com outros fundos',
        'Assegure elegibilidade temporal e material'
      ]
    }
  ],
  requisitos: [
    'Alinhamento claro com componentes e investimentos do PRR',
    'Cumprimento de marcos (milestones) e metas (targets)',
    'Contributo significativo para transições verde e digital',
    'Cronograma compatível com execução do PRR (até 2026)',
    'Princípio DNSH (Do No Significant Harm) respeitado',
    'Indicadores alinhados com framework de monitorização PRR'
  ],
  exemplos: []
};

// Função para selecionar template baseado no programa
export function getTemplate(programa: string): MemoriaTemplate {
  const programaUpper = programa.toUpperCase();
  
  if (programaUpper.includes('PORTUGAL') || programaUpper.includes('2030') || programaUpper.includes('SI')) {
    return TEMPLATE_PORTUGAL_2030;
  } else if (programaUpper.includes('PAPAC')) {
    return TEMPLATE_PAPAC;
  } else if (programaUpper.includes('PRR')) {
    return TEMPLATE_PRR;
  }
  
  // Default: Portugal 2030 (mais completo)
  return TEMPLATE_PORTUGAL_2030;
}
