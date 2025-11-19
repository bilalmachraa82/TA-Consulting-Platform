
// FAQs estruturadas para o chatbot

export const FAQS = [
  {
    categoria: 'Avisos e Candidaturas',
    perguntas: [
      {
        pergunta: 'Como criar uma nova candidatura?',
        resposta: 'Para criar uma nova candidatura: 1) Vá para a página de Candidaturas, 2) Clique em "Nova Candidatura", 3) Selecione a empresa e o aviso, 4) Preencha os dados solicitados, 5) Gere a checklist automática para garantir que não esquece nenhum requisito.',
      },
      {
        pergunta: 'O que significam os estados das candidaturas?',
        resposta: 'Estados das candidaturas: A_PREPARAR (ainda em preparação), SUBMETIDA (enviada ao portal), EM_ANALISE (sendo avaliada), APROVADA (aprovada e financiada), REJEITADA (não aprovada).',
      },
      {
        pergunta: 'Como funcionam os avisos urgentes?',
        resposta: 'Avisos urgentes são aqueles com prazo de submissão inferior a 14 dias. O sistema destaca-os automaticamente no dashboard e envia alertas por email.',
      },
    ],
  },
  {
    categoria: 'Memórias Descritivas',
    perguntas: [
      {
        pergunta: 'Como gerar uma memória descritiva?',
        resposta: 'Para gerar uma memória descritiva: 1) Vá para Memórias Descritivas, 2) Clique em "Gerar Nova Memória", 3) Selecione empresa e aviso, 4) Preencha os dados do projeto, 5) O sistema gera automaticamente o documento completo usando IA (Claude 4.5 Sonnet) baseado nas melhores práticas do Portugal 2030.',
      },
      {
        pergunta: 'Posso editar a memória descritiva gerada?',
        resposta: 'Sim! Após a geração, pode editar qualquer secção da memória descritiva. Todas as alterações são salvas automaticamente e pode exportar para Word ou PDF a qualquer momento.',
      },
    ],
  },
  {
    categoria: 'Empresas e Documentos',
    perguntas: [
      {
        pergunta: 'Que documentos são necessários para uma candidatura?',
        resposta: 'Documentos típicos necessários: Certidão Permanente, Certidões AT e SS (sem dívidas), Certificado PME, Demonstrações Financeiras (últimos 2 anos), IES, e documentos específicos do aviso. Use a checklist automática para garantir que tem tudo.',
      },
      {
        pergunta: 'Como o sistema alerta sobre documentos a expirar?',
        resposta: 'O sistema verifica diariamente todos os documentos e envia emails automáticos 30, 15 e 7 dias antes da expiração. Documentos expirados aparecem destacados no dashboard.',
      },
    ],
  },
  {
    categoria: 'Templates e Checklists',
    perguntas: [
      {
        pergunta: 'Como usar templates de candidaturas?',
        resposta: 'Templates permitem reutilizar estruturas de candidaturas bem-sucedidas. Pode criar um template a partir de qualquer candidatura existente (botão "Salvar como Template") e depois usá-lo para acelerar novas candidaturas.',
      },
      {
        pergunta: 'O que são checklists automáticas?',
        resposta: 'Ao criar uma candidatura, o sistema gera automaticamente uma checklist completa com todos os requisitos do aviso (documentos, validações, cálculos, compliance). Pode marcar cada item como completo e adicionar observações.',
      },
    ],
  },
  {
    categoria: 'Portais e Programas',
    perguntas: [
      {
        pergunta: 'Que portais a plataforma cobre?',
        resposta: 'A plataforma faz scraping automático de 3 portais: Portugal 2030, PAPAC (Açores), e PRR (Plano de Recuperação e Resiliência). O scraping é executado semanalmente todas as segundas-feiras às 9:00.',
      },
      {
        pergunta: 'Como funciona o sistema de recomendações?',
        resposta: 'O sistema analisa automaticamente o perfil de cada empresa (setor, dimensão, região) e compara com os requisitos dos avisos ativos, gerando um score de compatibilidade e recomendando os avisos mais adequados.',
      },
    ],
  },
];

// Função para procurar FAQ relevante
export function encontrarFAQRelevante(pergunta: string): string | null {
  const perguntaLower = pergunta.toLowerCase();
  
  for (const categoria of FAQS) {
    for (const faq of categoria.perguntas) {
      const faqLower = faq.pergunta.toLowerCase();
      
      // Procurar por palavras-chave
      const palavrasChave = faqLower.split(' ').filter((p) => p.length > 3);
      const matches = palavrasChave.filter((palavra) => perguntaLower.includes(palavra));
      
      if (matches.length >= 2) {
        return `**${faq.pergunta}**\n${faq.resposta}`;
      }
    }
  }
  
  return null;
}

// Função para obter todas as FAQs como contexto
export function getFAQsContexto(): string {
  let contexto = '\n📚 PERGUNTAS FREQUENTES (FAQs):\n\n';
  
  for (const categoria of FAQS) {
    contexto += `**${categoria.categoria}:**\n`;
    for (const faq of categoria.perguntas) {
      contexto += `Q: ${faq.pergunta}\nA: ${faq.resposta}\n\n`;
    }
  }
  
  return contexto;
}

// Sugestões de ações contextuais
export function getSugestoesAcoes(avisos: any[], empresas: any[], candidaturas: any[]): string {
  const sugestoes: string[] = [];
  
  // Avisos urgentes
  const hoje = new Date();
  const daqui7Dias = new Date();
  daqui7Dias.setDate(hoje.getDate() + 7);
  
  const avisosUrgentes = avisos.filter((a) => {
    const dataFim = new Date(a.dataFimSubmissao);
    return a.ativo && dataFim >= hoje && dataFim <= daqui7Dias;
  });
  
  if (avisosUrgentes.length > 0) {
    sugestoes.push(`⚠️ Atenção: ${avisosUrgentes.length} aviso(s) com prazo a terminar nos próximos 7 dias`);
  }
  
  // Candidaturas em preparação
  const emPreparacao = candidaturas.filter((c: any) => c.estado === 'A_PREPARAR');
  if (emPreparacao.length > 0) {
    sugestoes.push(`📝 Tens ${emPreparacao.length} candidatura(s) em preparação. Não te esqueças de completar as checklists!`);
  }
  
  // Empresas sem candidaturas
  const empresasSemCandidaturas = empresas.filter((e) => 
    !candidaturas.some((c: any) => c.empresaId === e.id)
  );
  if (empresasSemCandidaturas.length > 3) {
    sugestoes.push(`💡 Há ${empresasSemCandidaturas.length} empresas sem candidaturas. Verifica recomendações para estas empresas!`);
  }
  
  if (sugestoes.length === 0) {
    sugestoes.push('✅ Tudo em ordem! Explora o dashboard para mais insights.');
  }
  
  return '\n🎯 SUGESTÕES:\n' + sugestoes.map((s, i) => `${i + 1}. ${s}`).join('\n') + '\n';
}
