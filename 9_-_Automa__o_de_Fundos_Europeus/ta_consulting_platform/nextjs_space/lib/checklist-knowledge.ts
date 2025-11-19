
// Base de conhecimento para gerar checklists automáticas por tipo de aviso

export interface ChecklistTemplate {
  portal: string;
  programa?: string;
  items: ChecklistItemTemplate[];
}

export interface ChecklistItemTemplate {
  ordem: number;
  tipo: 'DOCUMENTO' | 'VALIDACAO' | 'CALCULO' | 'APROVACAO' | 'COMPLIANCE' | 'OUTRO';
  categoria: string;
  titulo: string;
  descricao: string;
  obrigatorio: boolean;
}

// Templates de checklists por portal e programa
export const CHECKLIST_TEMPLATES: ChecklistTemplate[] = [
  // PORTUGAL 2030 - Inovação
  {
    portal: 'PORTUGAL2030',
    programa: 'Inovação',
    items: [
      // DOCUMENTAÇÃO
      {
        ordem: 1,
        tipo: 'DOCUMENTO',
        categoria: 'Documentação',
        titulo: 'Certidão Permanente da Empresa',
        descricao: 'Certidão emitida pelo IRN com dados atualizados da empresa',
        obrigatorio: true,
      },
      {
        ordem: 2,
        tipo: 'DOCUMENTO',
        categoria: 'Documentação',
        titulo: 'Certidão de Situação Contributiva (AT)',
        descricao: 'Certidão da Autoridade Tributária sem dívidas',
        obrigatorio: true,
      },
      {
        ordem: 3,
        tipo: 'DOCUMENTO',
        categoria: 'Documentação',
        titulo: 'Certidão de Situação Contributiva (SS)',
        descricao: 'Certidão da Segurança Social sem dívidas',
        obrigatorio: true,
      },
      {
        ordem: 4,
        tipo: 'DOCUMENTO',
        categoria: 'Documentação',
        titulo: 'Certificado PME',
        descricao: 'Certificado de Pequena e Média Empresa emitido pelo IAPMEI',
        obrigatorio: true,
      },
      {
        ordem: 5,
        tipo: 'DOCUMENTO',
        categoria: 'Documentação',
        titulo: 'Demonstrações Financeiras (últimos 2 anos)',
        descricao: 'Balanços e Demonstrações de Resultados dos últimos 2 exercícios',
        obrigatorio: true,
      },
      {
        ordem: 6,
        tipo: 'DOCUMENTO',
        categoria: 'Documentação',
        titulo: 'IES (Informação Empresarial Simplificada)',
        descricao: 'Declarações IES dos últimos 2 exercícios',
        obrigatorio: true,
      },
      // ELEGIBILIDADE
      {
        ordem: 7,
        tipo: 'VALIDACAO',
        categoria: 'Elegibilidade',
        titulo: 'Verificar enquadramento como PME',
        descricao: 'Confirmar que a empresa cumpre os critérios de PME (< 250 trabalhadores, volume de negócios ≤ 50M€ ou balanço ≤ 43M€)',
        obrigatorio: true,
      },
      {
        ordem: 8,
        tipo: 'VALIDACAO',
        categoria: 'Elegibilidade',
        titulo: 'Verificar CAE elegível',
        descricao: 'Confirmar que o CAE da empresa está na lista de setores elegíveis do aviso',
        obrigatorio: true,
      },
      {
        ordem: 9,
        tipo: 'VALIDACAO',
        categoria: 'Elegibilidade',
        titulo: 'Verificar localização elegível',
        descricao: 'Confirmar que a empresa está localizada numa região elegível (ex: NUTS II específica)',
        obrigatorio: false,
      },
      {
        ordem: 10,
        tipo: 'VALIDACAO',
        categoria: 'Elegibilidade',
        titulo: 'Verificar ausência de auxílios de minimis',
        descricao: 'Confirmar que a empresa não ultrapassou o limite de auxílios de minimis (200.000€ em 3 anos)',
        obrigatorio: true,
      },
      // CÁLCULOS
      {
        ordem: 11,
        tipo: 'CALCULO',
        categoria: 'Financeiro',
        titulo: 'Calcular investimento elegível',
        descricao: 'Calcular o montante total de investimento elegível conforme regras do aviso',
        obrigatorio: true,
      },
      {
        ordem: 12,
        tipo: 'CALCULO',
        categoria: 'Financeiro',
        titulo: 'Calcular comparticipação pública',
        descricao: 'Calcular a taxa de comparticipação aplicável (ex: 45% para micro/pequenas, 35% para médias)',
        obrigatorio: true,
      },
      {
        ordem: 13,
        tipo: 'CALCULO',
        categoria: 'Financeiro',
        titulo: 'Validar limites min/max',
        descricao: 'Confirmar que o investimento está dentro dos limites mínimo e máximo do aviso',
        obrigatorio: true,
      },
      // COMPLIANCE
      {
        ordem: 14,
        tipo: 'COMPLIANCE',
        categoria: 'Compliance',
        titulo: 'Verificar cumprimento DNSH (Do No Significant Harm)',
        descricao: 'Garantir que o projeto não prejudica objetivos ambientais do Pacto Ecológico Europeu',
        obrigatorio: true,
      },
      {
        ordem: 15,
        tipo: 'COMPLIANCE',
        categoria: 'Compliance',
        titulo: 'Verificar cumprimento RGPD',
        descricao: 'Se aplicável, garantir conformidade com o Regulamento Geral de Proteção de Dados',
        obrigatorio: false,
      },
      {
        ordem: 16,
        tipo: 'COMPLIANCE',
        categoria: 'Compliance',
        titulo: 'Verificar licenças necessárias',
        descricao: 'Confirmar que a empresa possui todas as licenças necessárias para a atividade',
        obrigatorio: true,
      },
      // MEMÓRIA DESCRITIVA
      {
        ordem: 17,
        tipo: 'DOCUMENTO',
        categoria: 'Memória Descritiva',
        titulo: 'Elaborar Memória Descritiva do Projeto',
        descricao: 'Documento completo descrevendo o projeto, objetivos, atividades, impactos esperados',
        obrigatorio: true,
      },
      {
        ordem: 18,
        tipo: 'VALIDACAO',
        categoria: 'Memória Descritiva',
        titulo: 'Validar alinhamento com objetivos do programa',
        descricao: 'Confirmar que o projeto está alinhado com os objetivos estratégicos do Portugal 2030',
        obrigatorio: true,
      },
      // APROVAÇÃO INTERNA
      {
        ordem: 19,
        tipo: 'APROVACAO',
        categoria: 'Aprovação',
        titulo: 'Aprovação do cliente (empresa)',
        descricao: 'Obter aprovação formal do cliente para submissão da candidatura',
        obrigatorio: true,
      },
      {
        ordem: 20,
        tipo: 'APROVACAO',
        categoria: 'Aprovação',
        titulo: 'Revisão final da documentação',
        descricao: 'Revisão completa de toda a documentação antes da submissão',
        obrigatorio: true,
      },
    ],
  },
  
  // PORTUGAL 2030 - Qualificação PME
  {
    portal: 'PORTUGAL2030',
    programa: 'Qualificação PME',
    items: [
      {
        ordem: 1,
        tipo: 'DOCUMENTO',
        categoria: 'Documentação',
        titulo: 'Certidão Permanente da Empresa',
        descricao: 'Certidão emitida pelo IRN com dados atualizados da empresa',
        obrigatorio: true,
      },
      {
        ordem: 2,
        tipo: 'DOCUMENTO',
        categoria: 'Documentação',
        titulo: 'Certidão AT e SS',
        descricao: 'Certidões da Autoridade Tributária e Segurança Social sem dívidas',
        obrigatorio: true,
      },
      {
        ordem: 3,
        tipo: 'DOCUMENTO',
        categoria: 'Documentação',
        titulo: 'Certificado PME',
        descricao: 'Certificado de Pequena e Média Empresa',
        obrigatorio: true,
      },
      {
        ordem: 4,
        tipo: 'VALIDACAO',
        categoria: 'Elegibilidade',
        titulo: 'Verificar enquadramento PME',
        descricao: 'Confirmar critérios de PME',
        obrigatorio: true,
      },
      {
        ordem: 5,
        tipo: 'CALCULO',
        categoria: 'Financeiro',
        titulo: 'Calcular investimento elegível',
        descricao: 'Calcular montante elegível para formação e qualificação',
        obrigatorio: true,
      },
      {
        ordem: 6,
        tipo: 'DOCUMENTO',
        categoria: 'Memória Descritiva',
        titulo: 'Plano de Formação',
        descricao: 'Plano detalhado de formação e desenvolvimento de competências',
        obrigatorio: true,
      },
      {
        ordem: 7,
        tipo: 'APROVACAO',
        categoria: 'Aprovação',
        titulo: 'Aprovação do cliente',
        descricao: 'Obter aprovação formal do cliente',
        obrigatorio: true,
      },
    ],
  },
  
  // PRR - Recuperação e Resiliência
  {
    portal: 'PRR',
    items: [
      {
        ordem: 1,
        tipo: 'DOCUMENTO',
        categoria: 'Documentação',
        titulo: 'Documentação Legal da Empresa',
        descricao: 'Certidão permanente, certidões AT/SS, estatutos',
        obrigatorio: true,
      },
      {
        ordem: 2,
        tipo: 'DOCUMENTO',
        categoria: 'Documentação',
        titulo: 'Demonstrações Financeiras',
        descricao: 'Balanços e DRs dos últimos 2 exercícios',
        obrigatorio: true,
      },
      {
        ordem: 3,
        tipo: 'VALIDACAO',
        categoria: 'Elegibilidade',
        titulo: 'Verificar alinhamento com PRR',
        descricao: 'Confirmar alinhamento com as prioridades do Plano de Recuperação e Resiliência',
        obrigatorio: true,
      },
      {
        ordem: 4,
        tipo: 'COMPLIANCE',
        categoria: 'Compliance',
        titulo: 'Verificar cumprimento DNSH',
        descricao: 'Garantir cumprimento do princípio "Do No Significant Harm"',
        obrigatorio: true,
      },
      {
        ordem: 5,
        tipo: 'DOCUMENTO',
        categoria: 'Memória Descritiva',
        titulo: 'Memória Descritiva do Projeto',
        descricao: 'Documento completo do projeto alinhado com objetivos PRR',
        obrigatorio: true,
      },
      {
        ordem: 6,
        tipo: 'CALCULO',
        categoria: 'Financeiro',
        titulo: 'Cálculo de investimento e comparticipação',
        descricao: 'Calcular investimento total e taxa de comparticipação',
        obrigatorio: true,
      },
      {
        ordem: 7,
        tipo: 'APROVACAO',
        categoria: 'Aprovação',
        titulo: 'Aprovação final',
        descricao: 'Aprovação de toda a candidatura',
        obrigatorio: true,
      },
    ],
  },
  
  // Template genérico (fallback)
  {
    portal: 'GENERICO',
    items: [
      {
        ordem: 1,
        tipo: 'DOCUMENTO',
        categoria: 'Documentação',
        titulo: 'Certidões Legais',
        descricao: 'Certidão permanente, AT, SS',
        obrigatorio: true,
      },
      {
        ordem: 2,
        tipo: 'DOCUMENTO',
        categoria: 'Documentação',
        titulo: 'Documentos Financeiros',
        descricao: 'Demonstrações financeiras',
        obrigatorio: true,
      },
      {
        ordem: 3,
        tipo: 'VALIDACAO',
        categoria: 'Elegibilidade',
        titulo: 'Verificar elegibilidade',
        descricao: 'Confirmar requisitos de elegibilidade',
        obrigatorio: true,
      },
      {
        ordem: 4,
        tipo: 'CALCULO',
        categoria: 'Financeiro',
        titulo: 'Cálculos financeiros',
        descricao: 'Calcular montantes elegíveis e comparticipação',
        obrigatorio: true,
      },
      {
        ordem: 5,
        tipo: 'DOCUMENTO',
        categoria: 'Memória Descritiva',
        titulo: 'Memória Descritiva',
        descricao: 'Documento descritivo do projeto',
        obrigatorio: true,
      },
      {
        ordem: 6,
        tipo: 'APROVACAO',
        categoria: 'Aprovação',
        titulo: 'Aprovação final',
        descricao: 'Aprovação da candidatura',
        obrigatorio: true,
      },
    ],
  },
];

// Função para obter template baseado no aviso
export function getChecklistTemplate(portal: string, programa?: string): ChecklistTemplate {
  // Tentar encontrar template específico por portal e programa
  if (programa) {
    const specific = CHECKLIST_TEMPLATES.find(
      (t) => t.portal === portal && t.programa === programa
    );
    if (specific) return specific;
  }

  // Tentar encontrar template por portal
  const byPortal = CHECKLIST_TEMPLATES.find((t) => t.portal === portal && !t.programa);
  if (byPortal) return byPortal;

  // Fallback para template genérico
  return CHECKLIST_TEMPLATES.find((t) => t.portal === 'GENERICO')!;
}
