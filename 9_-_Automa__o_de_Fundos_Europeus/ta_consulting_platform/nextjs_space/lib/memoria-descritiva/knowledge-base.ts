
// Base de Conhecimento para geração de Memórias Descritivas
// Contém boas práticas, exemplos e guidelines dos programas

export interface KnowledgeEntry {
  topico: string;
  conteudo: string;
  programa?: string;
  relevancia: number; // 0-1
  tags: string[];
}

export const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  // BOAS PRÁTICAS GERAIS
  {
    topico: 'Linguagem e Tom',
    conteudo: 'Use linguagem técnica mas acessível. Evite jargão excessivo ou linguagem demasiado coloquial. O tom deve ser profissional, confiante e demonstrar conhecimento profundo do setor e do programa de incentivos. Prefira voz ativa e construções diretas.',
    relevancia: 1.0,
    tags: ['linguagem', 'redação', 'geral']
  },
  {
    topico: 'Quantificação',
    conteudo: 'Sempre que possível, quantifique afirmações: use percentagens, valores monetários, quantidades, prazos. Exemplo: em vez de "aumento significativo", diga "aumento de 25%". Em vez de "melhoria da eficiência", diga "redução de 30% no tempo de produção".',
    relevancia: 1.0,
    tags: ['quantificação', 'métricas', 'geral']
  },
  {
    topico: 'Coerência entre Secções',
    conteudo: 'Garanta absoluta coerência entre todas as secções: objetivos devem alinhar com justificação; atividades devem conduzir aos resultados; orçamento deve refletir as atividades; indicadores devem medir os objetivos. Inconsistências são penalizadas na avaliação.',
    relevancia: 1.0,
    tags: ['coerência', 'estrutura', 'geral']
  },
  {
    topico: 'Evidências e Fundamentação',
    conteudo: 'Baseie todas as afirmações em evidências concretas: dados da empresa, estudos de mercado, benchmarks setoriais, relatórios oficiais. Cite fontes quando relevante. Evite afirmações genéricas ou não fundamentadas.',
    relevancia: 1.0,
    tags: ['evidências', 'fundamentação', 'geral']
  },

  // PORTUGAL 2030 ESPECÍFICO
  {
    topico: 'Critérios de Mérito Portugal 2030',
    conteudo: 'Os critérios de avaliação do Portugal 2030 incluem: (1) Contributo para a competitividade e crescimento empresarial; (2) Inovação e qualificação; (3) Sustentabilidade e descarbonização; (4) Criação de emprego qualificado; (5) Internacionalização. Estruture a candidatura para responder explicitamente a estes critérios.',
    programa: 'Portugal 2030',
    relevancia: 1.0,
    tags: ['critérios', 'avaliação', 'portugal2030']
  },
  {
    topico: 'Transição Digital',
    conteudo: 'Projetos de digitalização devem evidenciar: tecnologias 4.0 (IoT, AI, Cloud, Big Data), integração de sistemas, automação de processos, novos modelos de negócio digitais, capacitação digital de RH. Quantifique ganhos: produtividade, redução custos, melhoria qualidade, time-to-market.',
    programa: 'Portugal 2030',
    relevancia: 0.9,
    tags: ['digitalização', 'indústria 4.0', 'portugal2030']
  },
  {
    topico: 'Transição Climática',
    conteudo: 'Projetos de descarbonização devem quantificar: redução de emissões CO2 (ton/ano), eficiência energética (kWh ou % poupança), uso de energias renováveis (% ou kW instalados), economia circular (% materiais reciclados/reutilizados). Alinha com metas nacionais de neutralidade carbónica 2050.',
    programa: 'Portugal 2030',
    relevancia: 0.9,
    tags: ['descarbonização', 'sustentabilidade', 'portugal2030']
  },
  {
    topico: 'Indicadores SMART',
    conteudo: 'Todos os indicadores devem ser SMART: Específicos (claramente definidos), Mensuráveis (quantificáveis), Atingíveis (realistas), Relevantes (ligados aos objetivos), Temporais (com prazo definido). Exemplo SMART: "Aumentar volume de negócios em 20% até ao final do 2º ano após conclusão do projeto".',
    programa: 'Portugal 2030',
    relevancia: 0.9,
    tags: ['indicadores', 'metas', 'portugal2030']
  },

  // ANÁLISE ECONÓMICO-FINANCEIRA
  {
    topico: 'Viabilidade Financeira',
    conteudo: 'A análise financeira deve demonstrar: (1) Sustentabilidade da empresa para implementar o projeto; (2) Capacidade de cofinanciamento; (3) Retorno do investimento (VAL positivo, TIR acima da taxa de desconto); (4) Impacto incremental do incentivo na decisão de investir; (5) Cenários de sensibilidade. Use pressupostos conservadores e fundamentados.',
    relevancia: 0.9,
    tags: ['análise financeira', 'viabilidade', 'geral']
  },
  {
    topico: 'Efeito de Incentivo',
    conteudo: 'É crucial demonstrar o "efeito de incentivo": sem o apoio público, o projeto não seria realizado, ou seria significativamente reduzido/atrasado. Explique como o incentivo altera a decisão de investimento, reduz risco, acelera execução ou aumenta ambição do projeto.',
    relevancia: 0.9,
    tags: ['efeito incentivo', 'justificação', 'geral']
  },

  // REDAÇÃO E ESTRUTURA
  {
    topico: 'Estrutura de Parágrafos',
    conteudo: 'Estruture parágrafos em: (1) Frase-tópico clara; (2) Desenvolvimento com evidências/exemplos; (3) Conclusão/ligação. Parágrafos devem ter 4-8 linhas. Evite parágrafos de uma só frase ou blocos de texto excessivamente longos.',
    relevancia: 0.8,
    tags: ['estrutura', 'parágrafos', 'redação']
  },
  {
    topico: 'Títulos e Subtítulos',
    conteudo: 'Use títulos e subtítulos claros e informativos. Numere secções (1., 1.1., 1.1.1.). Títulos devem ser substantivos e descritivos do conteúdo. Evite títulos vagos como "Introdução" - prefira "Identificação e Objetivos do Projeto".',
    relevancia: 0.8,
    tags: ['títulos', 'estrutura', 'redação']
  },
  {
    topico: 'Transições entre Secções',
    conteudo: 'Crie transições suaves entre secções para manter a narrativa coesa. Exemplo: ao terminar a caracterização da empresa, ligue à justificação: "Neste contexto de crescimento e capacidade instalada, identificou-se a necessidade estratégica de..."',
    relevancia: 0.7,
    tags: ['transições', 'coesão', 'redação']
  },

  // ORÇAMENTO
  {
    topico: 'Detalhamento Orçamental',
    conteudo: 'Detalhe o orçamento ao máximo: não basta "Equipamento de produção - 100.000€". Especifique: "Torno CNC de 5 eixos, marca X, modelo Y, fornecedor Z - 80.000€" + "Sistema de automação integrado, modelo A - 20.000€". Justifique custos superiores a médias de mercado.',
    relevancia: 0.9,
    tags: ['orçamento', 'detalhamento', 'geral']
  },
  {
    topico: 'Elegibilidade de Custos',
    conteudo: 'Conheça profundamente o que é elegível no regulamento específico. Custos comuns não-elegíveis: IVA recuperável, terrenos (geralmente), custos de funcionamento corrente, multas/juros. Custos elegíveis comuns: equipamentos produtivos, construção/remodelação (com limites), software, formação, consultoria (com limites), PI/patentes.',
    relevancia: 0.9,
    tags: ['elegibilidade', 'orçamento', 'geral']
  },

  // RECOMENDAÇÕES ESPECÍFICAS
  {
    topico: 'Prazo de Execução',
    conteudo: 'Seja realista no prazo de execução. Considere: tempos de aquisição/fornecimento, instalação e comissionamento, formação, testes, imprevistos. Prazos demasiado curtos podem indicar falta de planeamento; demasiado longos podem sugerir baixa prioridade. Típico: 12-24 meses para projetos de investimento produtivo.',
    relevancia: 0.7,
    tags: ['cronograma', 'execução', 'geral']
  },
  {
    topico: 'Capacidade de Execução',
    conteudo: 'Demonstre que a empresa tem capacidade de executar o projeto: equipa técnica qualificada, experiência prévia em projetos similares, solidez financeira, parcerias com fornecedores credíveis. Mencione gestores de projeto, recursos alocados, sistemas de controlo e acompanhamento.',
    relevancia: 0.8,
    tags: ['capacidade', 'execução', 'geral']
  },
  {
    topico: 'Inovação',
    conteudo: 'Ao invocar inovação, especifique o tipo: inovação de produto, processo, organizacional, marketing. Defina o grau: novidade mundial, europeia, nacional, para o setor, para a empresa. Explique claramente o que é inovador comparativamente ao estado da arte e ao que a empresa já faz.',
    relevancia: 0.8,
    tags: ['inovação', 'I&D', 'geral']
  },

  // PORTUGAL 2030 - CRITÉRIOS DETALHADOS
  {
    topico: 'Competitividade e Crescimento',
    conteudo: 'Demonstre como o projeto aumenta a competitividade: redução de custos unitários, aumento da qualidade, diferenciação de produto, acesso a novos mercados, melhoria de posição competitiva. Quantifique: % redução custos, aumento margem, crescimento quota mercado, novos clientes conquistados.',
    programa: 'Portugal 2030',
    relevancia: 0.95,
    tags: ['competitividade', 'portugal2030', 'critérios']
  },
  {
    topico: 'Criação de Emprego Qualificado',
    conteudo: 'Especifique postos de trabalho criados/mantidos: número, qualificações (nível escolar/formação), remuneração média, tipo de contrato. Evidencie qualificação: contratação de licenciados/mestres, formação especializada, upskilling de colaboradores existentes. Meta Portugal 2030: emprego qualificado e sustentável.',
    programa: 'Portugal 2030',
    relevancia: 0.9,
    tags: ['emprego', 'portugal2030', 'critérios']
  },
  {
    topico: 'Internacionalização',
    conteudo: 'Projetos de internacionalização devem detalhar: mercados-alvo (países/regiões), estratégia de entrada (exportação direta, parcerias, subsidiária), canais de comercialização, adaptação de produto, investimento em marketing internacional. Quantifique: volume exportações atual vs. projetado, % VN exportado, novos mercados.',
    programa: 'Portugal 2030',
    relevancia: 0.85,
    tags: ['internacionalização', 'exportações', 'portugal2030']
  },

  // ANÁLISE SWOT E DIAGNÓSTICO
  {
    topico: 'Análise SWOT Eficaz',
    conteudo: 'Estruture análise SWOT de forma estratégica: Forças (capacidades internas diferenciadas), Fraquezas (limitações atuais que o projeto resolve), Oportunidades (tendências de mercado favoráveis), Ameaças (riscos competitivos/contextuais). Conecte SWOT com justificação do projeto: use Forças+Oportunidades para fundamentar potencial; use Fraquezas como problemas que o projeto resolve.',
    relevancia: 0.85,
    tags: ['diagnóstico', 'justificação', 'estratégia']
  },
  {
    topico: 'Contexto de Mercado',
    conteudo: 'Caracterize o mercado com dados: dimensão (€, volume), crescimento (CAGR), principais players, tendências, drivers de mudança. Use fontes credíveis: INE, Eurostat, associações setoriais, estudos de mercado. Demonstre oportunidade: mercado em crescimento, gaps não servidos, mudanças regulatórias/tecnológicas que favorecem a empresa.',
    relevancia: 0.85,
    tags: ['mercado', 'justificação', 'evidências']
  },

  // TECNOLOGIAS E INOVAÇÃO ESPECÍFICAS
  {
    topico: 'Indústria 4.0 - Tecnologias',
    conteudo: 'Especifique tecnologias 4.0 a implementar: IoT/IIoT (sensores, conectividade), Cloud Computing (plataformas, armazenamento), Big Data/Analytics (ferramentas, dashboards), AI/Machine Learning (algoritmos, casos de uso), Robótica/Cobótica (modelos, aplicações), Digital Twin (simulação, gémeo digital). Descreva integração e interoperabilidade.',
    programa: 'Portugal 2030',
    relevancia: 0.9,
    tags: ['digitalização', 'tecnologia', 'indústria 4.0']
  },
  {
    topico: 'Cibersegurança',
    conteudo: 'Em projetos de digitalização, aborde cibersegurança: medidas de proteção de dados, compliance RGPD, sistemas de backup, plano de continuidade de negócio, formação em segurança. Evidencie maturidade digital e gestão de risco.',
    programa: 'Portugal 2030',
    relevancia: 0.7,
    tags: ['cibersegurança', 'digitalização', 'portugal2030']
  },
  {
    topico: 'Economia Circular',
    conteudo: 'Projetos de economia circular devem quantificar: % materiais reciclados/reutilizados, redução de resíduos (ton/ano), extensão de vida útil de produtos, modelos de negócio circulares (product-as-service, refurbishing). Alinha com estratégia nacional/europeia de economia circular.',
    programa: 'Portugal 2030',
    relevancia: 0.85,
    tags: ['economia circular', 'sustentabilidade', 'portugal2030']
  },

  // VIABILIDADE E SUSTENTABILIDADE
  {
    topico: 'Análise de Sensibilidade',
    conteudo: 'Apresente análise de sensibilidade robusta: varie pressupostos-chave (preço, volume, custos) em ±10-20%. Teste cenários: pessimista, base, otimista. Demonstre que mesmo em cenário adverso o projeto mantém viabilidade mínima (VAL>0 ou TIR>taxa desconto). Evidencia robustez e planeamento cuidadoso.',
    relevancia: 0.85,
    tags: ['análise financeira', 'sensibilidade', 'risco']
  },
  {
    topico: 'Pressupostos Macroeconómicos',
    conteudo: 'Baseie projeções financeiras em pressupostos credíveis: crescimento PIB (Banco Portugal/Comissão Europeia), inflação, taxas de juro, evolução setorial. Cite fontes oficiais. Use valores conservadores alinhados com previsões institucionais. Explique ajustamentos específicos ao caso da empresa.',
    relevancia: 0.8,
    tags: ['pressupostos', 'análise financeira', 'viabilidade']
  },
  {
    topico: 'Plano de Financiamento',
    conteudo: 'Detalhe fontes de financiamento: capitais próprios (valor, origem), incentivo solicitado, financiamento bancário (instituição, condições), outros apoios. Demonstre capacidade de cofinanciamento: rácios patrimoniais, cash-flow operacional, garantias. Evidencie sustentabilidade: capacidade de reembolso, equilíbrio financeiro.',
    relevancia: 0.85,
    tags: ['financiamento', 'viabilidade', 'capitais']
  },

  // FORMAÇÃO E RECURSOS HUMANOS
  {
    topico: 'Plano de Formação',
    conteudo: 'Projetos com componente de formação devem detalhar: competências a desenvolver, entidades formadoras, duração (horas), modalidade (presencial/e-learning), certificação. Demonstre adequação às necessidades: análise de skill gaps, plano de upskilling/reskilling. Quantifique: nº colaboradores formados, horas totais, investimento.',
    relevancia: 0.75,
    tags: ['formação', 'recursos humanos', 'qualificação']
  },

  // PROPRIEDADE INTELECTUAL
  {
    topico: 'Propriedade Intelectual',
    conteudo: 'Em projetos de I&D ou inovação de produto, aborde PI: patentes existentes/a registar, marcas, design industrial, know-how proprietário. Estratégia de proteção: registo, segredo industrial, licensing. Evidencia grau de inovação e potencial de valorização.',
    relevancia: 0.75,
    tags: ['propriedade intelectual', 'inovação', 'I&D']
  },

  // IMPACTO TERRITORIAL E SOCIAL
  {
    topico: 'Desenvolvimento Regional',
    conteudo: 'Evidencie contributo para desenvolvimento regional: localização (região de convergência, interior, baixa densidade), fixação de população, dinamização economia local, promoção de fornecedores regionais. Alinha com políticas de coesão territorial do Portugal 2030.',
    programa: 'Portugal 2030',
    relevancia: 0.7,
    tags: ['desenvolvimento regional', 'coesão', 'portugal2030']
  },
  {
    topico: 'Igualdade e Inclusão',
    conteudo: 'Demonstre compromisso com igualdade de género e inclusão social: políticas de recrutamento sem discriminação, promoção de mulheres em cargos técnicos/gestão, integração de pessoas com deficiência, apoio à conciliação trabalho-família. Quantifique: % mulheres na empresa, medidas implementadas.',
    programa: 'Portugal 2030',
    relevancia: 0.65,
    tags: ['igualdade', 'inclusão', 'portugal2030']
  },

  // GESTÃO DE PROJETO
  {
    topico: 'Gestão de Risco',
    conteudo: 'Identifique riscos principais do projeto: tecnológicos, financeiros, de mercado, operacionais, regulatórios. Para cada risco: probabilidade, impacto, medidas de mitigação. Demonstra planeamento rigoroso e capacidade de gestão proativa.',
    relevancia: 0.8,
    tags: ['gestão', 'risco', 'execução']
  },
  {
    topico: 'Monitorização e Controlo',
    conteudo: 'Descreva sistema de monitorização: responsável pelo projeto, frequência de reporting, indicadores de acompanhamento (físicos e financeiros), ferramentas de gestão (Gantt, dashboards), procedimentos de controlo de qualidade. Evidencia profissionalismo e garantia de execução.',
    relevancia: 0.75,
    tags: ['monitorização', 'gestão', 'execução']
  },

  // CONSULTORIA E AUDITORIA
  {
    topico: 'Serviços de Consultoria',
    conteudo: 'Justifique contratação de consultoria externa: complexidade técnica, necessidade de expertise especializada, conformidade regulamentar. Especifique âmbito, entidade (qualificações), deliverables. Custos de consultoria têm limites de elegibilidade (verificar regulamento) - típico 5-10% do investimento.',
    relevancia: 0.7,
    tags: ['consultoria', 'serviços', 'orçamento']
  },

  // SUSTENTABILIDADE PÓS-PROJETO
  {
    topico: 'Sustentabilidade Pós-Projeto',
    conteudo: 'Demonstre sustentabilidade após conclusão: geração de receitas suficiente para cobrir custos operacionais adicionais, capacidade de manutenção dos ativos, plano de atualização tecnológica, estratégia de continuidade. Projete resultados para 3-5 anos pós-investimento.',
    relevancia: 0.8,
    tags: ['sustentabilidade', 'pós-projeto', 'continuidade']
  },

  // PARCERIAS E NETWORKING
  {
    topico: 'Parcerias Estratégicas',
    conteudo: 'Valorize parcerias com entidades credíveis: universidades/centros I&D (projetos colaborativos), associações setoriais, clusters, grandes empresas (cliente/fornecedor). Formalize: acordos, cartas de compromisso. Demonstra capacidade de networking e acesso a conhecimento/mercados.',
    relevancia: 0.75,
    tags: ['parcerias', 'networking', 'colaboração']
  }
];

// Função para buscar conhecimento relevante por tags
export function searchKnowledge(tags: string[], programa?: string): KnowledgeEntry[] {
  return KNOWLEDGE_BASE
    .filter(entry => {
      // Filtrar por programa se especificado
      if (programa && entry.programa && entry.programa !== programa) {
        return false;
      }
      // Verificar se tem pelo menos uma tag em comum
      return tags.some(tag => entry.tags.includes(tag));
    })
    .sort((a, b) => b.relevancia - a.relevancia);
}

// Função para obter todas as boas práticas gerais
export function getGeneralBestPractices(): KnowledgeEntry[] {
  return KNOWLEDGE_BASE
    .filter(entry => entry.tags.includes('geral'))
    .sort((a, b) => b.relevancia - a.relevancia);
}

// Função para obter práticas específicas de um programa
export function getProgramSpecificPractices(programa: string): KnowledgeEntry[] {
  return KNOWLEDGE_BASE
    .filter(entry => entry.programa === programa)
    .sort((a, b) => b.relevancia - a.relevancia);
}
