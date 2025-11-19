// Extended checklist knowledge base with more specific templates
// This file extends the existing checklist-knowledge.ts with additional templates

import { ChecklistTemplate, ChecklistItemTemplate } from './checklist-knowledge';

export const EXTENDED_CHECKLIST_TEMPLATES: ChecklistTemplate[] = [
  // PORTUGAL 2030 - Transição Digital
  {
    portal: 'PORTUGAL2030',
    programa: 'Transição Digital',
    items: [
      // DOCUMENTAÇÃO BÁSICA
      {
        ordem: 1,
        tipo: 'DOCUMENTO',
        categoria: 'Documentação',
        titulo: 'Certidão Permanente da Empresa',
        descricao: 'Certidão emitida pelo IRN com dados atualizados',
        obrigatorio: true,
      },
      {
        ordem: 2,
        tipo: 'DOCUMENTO',
        categoria: 'Documentação',
        titulo: 'Certidões AT e SS',
        descricao: 'Situação contributiva regularizada',
        obrigatorio: true,
      },
      {
        ordem: 3,
        tipo: 'DOCUMENTO',
        categoria: 'Documentação',
        titulo: 'Certificado PME',
        descricao: 'Certificado IAPMEI em vigor',
        obrigatorio: true,
      },
      // ESPECÍFICO DIGITAL
      {
        ordem: 4,
        tipo: 'VALIDACAO',
        categoria: 'Diagnóstico Digital',
        titulo: 'Diagnóstico de Maturidade Digital',
        descricao: 'Avaliação do nível atual de digitalização da empresa',
        obrigatorio: true,
      },
      {
        ordem: 5,
        tipo: 'DOCUMENTO',
        categoria: 'Diagnóstico Digital',
        titulo: 'Plano de Transformação Digital',
        descricao: 'Roadmap detalhado da transformação digital a implementar',
        obrigatorio: true,
      },
      {
        ordem: 6,
        tipo: 'VALIDACAO',
        categoria: 'Tecnologia',
        titulo: 'Identificação de Tecnologias 4.0',
        descricao: 'Lista de tecnologias Industry 4.0 a implementar (IoT, AI, Big Data, etc)',
        obrigatorio: true,
      },
      {
        ordem: 7,
        tipo: 'CALCULO',
        categoria: 'Financeiro',
        titulo: 'Cálculo de ROI Digital',
        descricao: 'Retorno esperado do investimento em digitalização',
        obrigatorio: true,
      },
      {
        ordem: 8,
        tipo: 'VALIDACAO',
        categoria: 'Cibersegurança',
        titulo: 'Plano de Cibersegurança',
        descricao: 'Medidas de segurança digital a implementar',
        obrigatorio: true,
      },
      {
        ordem: 9,
        tipo: 'DOCUMENTO',
        categoria: 'Recursos Humanos',
        titulo: 'Plano de Capacitação Digital',
        descricao: 'Formação dos colaboradores em competências digitais',
        obrigatorio: true,
      },
      {
        ordem: 10,
        tipo: 'COMPLIANCE',
        categoria: 'Compliance',
        titulo: 'Conformidade RGPD',
        descricao: 'Garantir proteção de dados pessoais na solução digital',
        obrigatorio: true,
      },
      {
        ordem: 11,
        tipo: 'DOCUMENTO',
        categoria: 'Fornecedores',
        titulo: 'Orçamentos de Fornecedores Tecnológicos',
        descricao: 'Propostas detalhadas de fornecedores de soluções digitais',
        obrigatorio: true,
      },
      {
        ordem: 12,
        tipo: 'CALCULO',
        categoria: 'Indicadores',
        titulo: 'KPIs de Transformação Digital',
        descricao: 'Indicadores para medir o sucesso da digitalização',
        obrigatorio: true,
      },
    ],
  },

  // PORTUGAL 2030 - Eficiência Energética
  {
    portal: 'PORTUGAL2030',
    programa: 'Eficiência Energética',
    items: [
      {
        ordem: 1,
        tipo: 'DOCUMENTO',
        categoria: 'Documentação',
        titulo: 'Documentação Legal',
        descricao: 'Certidões e documentos legais da empresa',
        obrigatorio: true,
      },
      {
        ordem: 2,
        tipo: 'DOCUMENTO',
        categoria: 'Energia',
        titulo: 'Auditoria Energética',
        descricao: 'Relatório de auditoria energética certificada (SGCIE)',
        obrigatorio: true,
      },
      {
        ordem: 3,
        tipo: 'VALIDACAO',
        categoria: 'Energia',
        titulo: 'Consumos Energéticos Atuais',
        descricao: 'Faturas de energia dos últimos 12 meses',
        obrigatorio: true,
      },
      {
        ordem: 4,
        tipo: 'DOCUMENTO',
        categoria: 'Energia',
        titulo: 'Certificado Energético',
        descricao: 'Certificado energético do edifício (se aplicável)',
        obrigatorio: false,
      },
      {
        ordem: 5,
        tipo: 'CALCULO',
        categoria: 'Poupança',
        titulo: 'Cálculo de Poupança Energética',
        descricao: 'Estimativa de redução de consumo em kWh e €',
        obrigatorio: true,
      },
      {
        ordem: 6,
        tipo: 'CALCULO',
        categoria: 'Emissões',
        titulo: 'Redução de Emissões CO2',
        descricao: 'Cálculo da redução de pegada carbónica',
        obrigatorio: true,
      },
      {
        ordem: 7,
        tipo: 'DOCUMENTO',
        categoria: 'Técnico',
        titulo: 'Especificações Técnicas dos Equipamentos',
        descricao: 'Fichas técnicas dos equipamentos eficientes a instalar',
        obrigatorio: true,
      },
      {
        ordem: 8,
        tipo: 'COMPLIANCE',
        categoria: 'Ambiente',
        titulo: 'Conformidade Ambiental',
        descricao: 'Verificação de cumprimento de normas ambientais',
        obrigatorio: true,
      },
      {
        ordem: 9,
        tipo: 'DOCUMENTO',
        categoria: 'Fornecedores',
        titulo: 'Orçamentos de Instaladores Certificados',
        descricao: 'Propostas de instaladores com certificação DGEG',
        obrigatorio: true,
      },
      {
        ordem: 10,
        tipo: 'CALCULO',
        categoria: 'Financeiro',
        titulo: 'Payback do Investimento',
        descricao: 'Período de retorno do investimento em eficiência',
        obrigatorio: true,
      },
    ],
  },

  // PORTUGAL 2030 - Internacionalização
  {
    portal: 'PORTUGAL2030',
    programa: 'Internacionalização',
    items: [
      {
        ordem: 1,
        tipo: 'DOCUMENTO',
        categoria: 'Documentação',
        titulo: 'Documentação Legal',
        descricao: 'Certidões e documentos da empresa',
        obrigatorio: true,
      },
      {
        ordem: 2,
        tipo: 'DOCUMENTO',
        categoria: 'Estratégia',
        titulo: 'Plano de Internacionalização',
        descricao: 'Estratégia detalhada de entrada em mercados externos',
        obrigatorio: true,
      },
      {
        ordem: 3,
        tipo: 'VALIDACAO',
        categoria: 'Mercado',
        titulo: 'Estudo de Mercados-Alvo',
        descricao: 'Análise dos países/regiões alvo para exportação',
        obrigatorio: true,
      },
      {
        ordem: 4,
        tipo: 'DOCUMENTO',
        categoria: 'Exportação',
        titulo: 'Histórico de Exportações',
        descricao: 'Dados de exportação dos últimos 2 anos (se aplicável)',
        obrigatorio: false,
      },
      {
        ordem: 5,
        tipo: 'VALIDACAO',
        categoria: 'Produto',
        titulo: 'Certificações de Produto',
        descricao: 'Certificações necessárias para os mercados-alvo (CE, FDA, etc)',
        obrigatorio: true,
      },
      {
        ordem: 6,
        tipo: 'DOCUMENTO',
        categoria: 'Marketing',
        titulo: 'Plano de Marketing Internacional',
        descricao: 'Estratégia de promoção nos mercados externos',
        obrigatorio: true,
      },
      {
        ordem: 7,
        tipo: 'CALCULO',
        categoria: 'Financeiro',
        titulo: 'Projeções de Vendas Internacionais',
        descricao: 'Estimativas de vendas por mercado para 3 anos',
        obrigatorio: true,
      },
      {
        ordem: 8,
        tipo: 'DOCUMENTO',
        categoria: 'Recursos',
        titulo: 'Plano de Contratação Internacional',
        descricao: 'Recursos humanos necessários (comerciais, tradutores)',
        obrigatorio: false,
      },
      {
        ordem: 9,
        tipo: 'VALIDACAO',
        categoria: 'Digital',
        titulo: 'Website Multilingue',
        descricao: 'Website preparado para mercados internacionais',
        obrigatorio: true,
      },
      {
        ordem: 10,
        tipo: 'DOCUMENTO',
        categoria: 'Parcerias',
        titulo: 'Cartas de Intenção',
        descricao: 'Acordos preliminares com distribuidores/clientes externos',
        obrigatorio: false,
      },
    ],
  },

  // PAPAC - Projetos Agrícolas
  {
    portal: 'PAPAC',
    programa: 'Modernização Agrícola',
    items: [
      {
        ordem: 1,
        tipo: 'DOCUMENTO',
        categoria: 'Documentação',
        titulo: 'Documentação da Exploração',
        descricao: 'Certidão permanente, licenças de exploração',
        obrigatorio: true,
      },
      {
        ordem: 2,
        tipo: 'DOCUMENTO',
        categoria: 'Propriedade',
        titulo: 'Títulos de Propriedade/Arrendamento',
        descricao: 'Comprovativos de propriedade ou contratos de arrendamento',
        obrigatorio: true,
      },
      {
        ordem: 3,
        tipo: 'DOCUMENTO',
        categoria: 'Agrícola',
        titulo: 'Parcelário Agrícola (iSIP)',
        descricao: 'Identificação das parcelas no Sistema de Identificação Parcelar',
        obrigatorio: true,
      },
      {
        ordem: 4,
        tipo: 'VALIDACAO',
        categoria: 'Elegibilidade',
        titulo: 'Verificar Jovem Agricultor',
        descricao: 'Se aplicável, comprovar estatuto de jovem agricultor (<40 anos)',
        obrigatorio: false,
      },
      {
        ordem: 5,
        tipo: 'DOCUMENTO',
        categoria: 'Técnico',
        titulo: 'Plano de Exploração',
        descricao: 'Plano técnico-económico da exploração agrícola',
        obrigatorio: true,
      },
      {
        ordem: 6,
        tipo: 'VALIDACAO',
        categoria: 'Ambiente',
        titulo: 'Licenças Ambientais',
        descricao: 'Licenças de captação de água, tratamento de efluentes',
        obrigatorio: true,
      },
      {
        ordem: 7,
        tipo: 'CALCULO',
        categoria: 'Produção',
        titulo: 'Projeção de Aumento de Produção',
        descricao: 'Estimativa de aumento de produtividade pós-investimento',
        obrigatorio: true,
      },
      {
        ordem: 8,
        tipo: 'DOCUMENTO',
        categoria: 'Sustentabilidade',
        titulo: 'Medidas Agroambientais',
        descricao: 'Práticas sustentáveis a implementar',
        obrigatorio: true,
      },
      {
        ordem: 9,
        tipo: 'DOCUMENTO',
        categoria: 'Equipamento',
        titulo: 'Orçamentos de Equipamento Agrícola',
        descricao: 'Propostas para máquinas e equipamentos agrícolas',
        obrigatorio: true,
      },
      {
        ordem: 10,
        tipo: 'COMPLIANCE',
        categoria: 'Segurança',
        titulo: 'Segurança Alimentar',
        descricao: 'Se aplicável, certificações HACCP, GlobalGAP',
        obrigatorio: false,
      },
    ],
  },

  // PRR - Habitação Social
  {
    portal: 'PRR',
    programa: 'Habitação Acessível',
    items: [
      {
        ordem: 1,
        tipo: 'DOCUMENTO',
        categoria: 'Documentação',
        titulo: 'Documentação do Promotor',
        descricao: 'Certidões e documentos legais do promotor',
        obrigatorio: true,
      },
      {
        ordem: 2,
        tipo: 'DOCUMENTO',
        categoria: 'Propriedade',
        titulo: 'Título de Propriedade do Terreno',
        descricao: 'Certidão de registo predial do terreno',
        obrigatorio: true,
      },
      {
        ordem: 3,
        tipo: 'DOCUMENTO',
        categoria: 'Urbanismo',
        titulo: 'Viabilidade Urbanística',
        descricao: 'Informação prévia ou licença de construção',
        obrigatorio: true,
      },
      {
        ordem: 4,
        tipo: 'DOCUMENTO',
        categoria: 'Projeto',
        titulo: 'Projeto de Arquitetura',
        descricao: 'Projeto completo com peças desenhadas e escritas',
        obrigatorio: true,
      },
      {
        ordem: 5,
        tipo: 'VALIDACAO',
        categoria: 'Social',
        titulo: 'Critérios de Habitação Acessível',
        descricao: 'Verificar cumprimento dos valores máximos de renda',
        obrigatorio: true,
      },
      {
        ordem: 6,
        tipo: 'CALCULO',
        categoria: 'Financeiro',
        titulo: 'Orçamento de Construção',
        descricao: 'Orçamento detalhado por especialidades',
        obrigatorio: true,
      },
      {
        ordem: 7,
        tipo: 'DOCUMENTO',
        categoria: 'Sustentabilidade',
        titulo: 'Certificação Energética A ou A+',
        descricao: 'Projeto de eficiência energética do edifício',
        obrigatorio: true,
      },
      {
        ordem: 8,
        tipo: 'VALIDACAO',
        categoria: 'Acessibilidade',
        titulo: 'Acessibilidades para Mobilidade Reduzida',
        descricao: 'Cumprimento do DL 163/2006',
        obrigatorio: true,
      },
      {
        ordem: 9,
        tipo: 'DOCUMENTO',
        categoria: 'Social',
        titulo: 'Protocolo com Município',
        descricao: 'Acordo de colaboração com autarquia local',
        obrigatorio: false,
      },
      {
        ordem: 10,
        tipo: 'COMPLIANCE',
        categoria: 'Ambiente',
        titulo: 'Avaliação de Impacto Ambiental',
        descricao: 'Se aplicável, estudo de impacto ambiental',
        obrigatorio: false,
      },
    ],
  },

  // MAR2030 - Pesca e Aquicultura
  {
    portal: 'MAR2030',
    programa: 'Modernização da Frota',
    items: [
      {
        ordem: 1,
        tipo: 'DOCUMENTO',
        categoria: 'Documentação',
        titulo: 'Documentação do Armador',
        descricao: 'Certidões e documentos legais',
        obrigatorio: true,
      },
      {
        ordem: 2,
        tipo: 'DOCUMENTO',
        categoria: 'Embarcação',
        titulo: 'Certificado de Registo da Embarcação',
        descricao: 'Registo na Capitania e livrete',
        obrigatorio: true,
      },
      {
        ordem: 3,
        tipo: 'DOCUMENTO',
        categoria: 'Pesca',
        titulo: 'Licença de Pesca',
        descricao: 'Licença válida emitida pela DGRM',
        obrigatorio: true,
      },
      {
        ordem: 4,
        tipo: 'VALIDACAO',
        categoria: 'Segurança',
        titulo: 'Certificados de Segurança',
        descricao: 'Certificados de navegabilidade e segurança marítima',
        obrigatorio: true,
      },
      {
        ordem: 5,
        tipo: 'DOCUMENTO',
        categoria: 'Técnico',
        titulo: 'Projeto de Modernização',
        descricao: 'Especificações técnicas das melhorias a implementar',
        obrigatorio: true,
      },
      {
        ordem: 6,
        tipo: 'CALCULO',
        categoria: 'Eficiência',
        titulo: 'Redução de Consumo de Combustível',
        descricao: 'Cálculo de poupança energética esperada',
        obrigatorio: true,
      },
      {
        ordem: 7,
        tipo: 'VALIDACAO',
        categoria: 'Sustentabilidade',
        titulo: 'Artes de Pesca Seletivas',
        descricao: 'Implementação de artes de pesca mais seletivas',
        obrigatorio: true,
      },
      {
        ordem: 8,
        tipo: 'DOCUMENTO',
        categoria: 'Tripulação',
        titulo: 'Rol de Tripulação',
        descricao: 'Lista de tripulantes com cédulas marítimas',
        obrigatorio: true,
      },
      {
        ordem: 9,
        tipo: 'COMPLIANCE',
        categoria: 'Quotas',
        titulo: 'Cumprimento de Quotas de Pesca',
        descricao: 'Histórico de cumprimento de quotas atribuídas',
        obrigatorio: true,
      },
      {
        ordem: 10,
        tipo: 'DOCUMENTO',
        categoria: 'Fornecedores',
        titulo: 'Orçamentos de Estaleiro',
        descricao: 'Propostas de estaleiros navais certificados',
        obrigatorio: true,
      },
    ],
  },

  // Template para Formação Profissional
  {
    portal: 'PORTUGAL2030',
    programa: 'Formação Profissional',
    items: [
      {
        ordem: 1,
        tipo: 'DOCUMENTO',
        categoria: 'Documentação',
        titulo: 'Certificação DGERT',
        descricao: 'Certificação como entidade formadora',
        obrigatorio: true,
      },
      {
        ordem: 2,
        tipo: 'DOCUMENTO',
        categoria: 'Formação',
        titulo: 'Plano de Formação Detalhado',
        descricao: 'Cronograma, conteúdos, formadores, local',
        obrigatorio: true,
      },
      {
        ordem: 3,
        tipo: 'VALIDACAO',
        categoria: 'Formandos',
        titulo: 'Perfil dos Formandos',
        descricao: 'Critérios de seleção e perfil dos destinatários',
        obrigatorio: true,
      },
      {
        ordem: 4,
        tipo: 'DOCUMENTO',
        categoria: 'Formadores',
        titulo: 'CVs e CAPs dos Formadores',
        descricao: 'Certificados de Aptidão Pedagógica dos formadores',
        obrigatorio: true,
      },
      {
        ordem: 5,
        tipo: 'CALCULO',
        categoria: 'Custos',
        titulo: 'Orçamento da Formação',
        descricao: 'Custos por formando, custos totais',
        obrigatorio: true,
      },
      {
        ordem: 6,
        tipo: 'DOCUMENTO',
        categoria: 'Instalações',
        titulo: 'Condições das Instalações',
        descricao: 'Adequação dos espaços formativos',
        obrigatorio: true,
      },
      {
        ordem: 7,
        tipo: 'VALIDACAO',
        categoria: 'Resultados',
        titulo: 'Indicadores de Sucesso',
        descricao: 'Taxa de conclusão esperada, empregabilidade',
        obrigatorio: true,
      },
      {
        ordem: 8,
        tipo: 'COMPLIANCE',
        categoria: 'Qualidade',
        titulo: 'Sistema de Avaliação',
        descricao: 'Metodologia de avaliação da formação',
        obrigatorio: true,
      },
    ],
  },
];

// Função para obter todos os templates (base + extended)
export function getAllChecklistTemplates(): ChecklistTemplate[] {
  // Import the base templates from the original file
  const baseTemplates = require('./checklist-knowledge').CHECKLIST_TEMPLATES;
  return [...baseTemplates, ...EXTENDED_CHECKLIST_TEMPLATES];
}

// Função melhorada para encontrar o melhor template
export function getBestMatchingTemplate(
  portal: string,
  programa?: string,
  keywords?: string[]
): ChecklistTemplate {
  const allTemplates = getAllChecklistTemplates();

  // 1. Exact match by portal and programa
  if (programa) {
    const exactMatch = allTemplates.find(
      t => t.portal === portal && t.programa === programa
    );
    if (exactMatch) return exactMatch;

    // 2. Partial programa match
    const partialMatch = allTemplates.find(
      t => t.portal === portal &&
          t.programa &&
          (t.programa.toLowerCase().includes(programa.toLowerCase()) ||
           programa.toLowerCase().includes(t.programa.toLowerCase()))
    );
    if (partialMatch) return partialMatch;
  }

  // 3. Match by keywords in programa
  if (keywords && keywords.length > 0) {
    const keywordMatch = allTemplates.find(t => {
      if (t.portal !== portal) return false;
      if (!t.programa) return false;

      return keywords.some(keyword =>
        (t.programa || '').toLowerCase().includes(keyword.toLowerCase())
      );
    });
    if (keywordMatch) return keywordMatch;
  }

  // 4. Generic portal match
  const portalMatch = allTemplates.find(
    t => t.portal === portal && !t.programa
  );
  if (portalMatch) return portalMatch;

  // 5. Fallback to generic
  return allTemplates.find(t => t.portal === 'GENERICO')!;
}

// Função para gerar checklist personalizada baseada em análise do aviso
export function generateCustomChecklist(
  aviso: {
    portal: string;
    programa?: string;
    nome?: string;
    descricao?: string;
    montanteMinimo?: number;
    montanteMaximo?: number;
  }
): ChecklistItemTemplate[] {
  // Extract keywords from aviso
  const keywords: string[] = [];

  if (aviso.nome) {
    const nomeKeywords = aviso.nome.toLowerCase();
    if (nomeKeywords.includes('digital')) keywords.push('digital');
    if (nomeKeywords.includes('energia') || nomeKeywords.includes('energética')) keywords.push('energia');
    if (nomeKeywords.includes('internacional') || nomeKeywords.includes('export')) keywords.push('internacional');
    if (nomeKeywords.includes('formação') || nomeKeywords.includes('qualifica')) keywords.push('formação');
    if (nomeKeywords.includes('inovação') || nomeKeywords.includes('i&d')) keywords.push('inovação');
    if (nomeKeywords.includes('sustentab') || nomeKeywords.includes('verde')) keywords.push('sustentabilidade');
  }

  // Get best matching template
  const template = getBestMatchingTemplate(aviso.portal, aviso.programa, keywords);

  // Customize based on montante
  let items = [...template.items];

  // Add specific items based on montante
  if (aviso.montanteMaximo && aviso.montanteMaximo > 1000000) {
    // Large projects need more detailed documentation
    const extraItems: ChecklistItemTemplate[] = [
      {
        ordem: items.length + 1,
        tipo: 'DOCUMENTO',
        categoria: 'Financeiro',
        titulo: 'Estudo de Viabilidade Económica',
        descricao: 'Análise detalhada de viabilidade para projetos > 1M€',
        obrigatorio: true,
      },
      {
        ordem: items.length + 2,
        tipo: 'VALIDACAO',
        categoria: 'Gestão',
        titulo: 'Equipa de Gestão do Projeto',
        descricao: 'Estrutura de gestão dedicada ao projeto',
        obrigatorio: true,
      },
    ];
    items = [...items, ...extraItems];
  }

  // Reorder items
  return items.sort((a, b) => a.ordem - b.ordem);
}

// Export types for use in other files
export type { ChecklistTemplate, ChecklistItemTemplate };