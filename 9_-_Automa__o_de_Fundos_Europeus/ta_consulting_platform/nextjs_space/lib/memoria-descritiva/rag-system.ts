
// Sistema RAG (Retrieval-Augmented Generation) para Memórias Descritivas
import { getTemplate, type MemoriaTemplate } from './templates';
import { searchKnowledge, getGeneralBestPractices, getProgramSpecificPractices } from './knowledge-base';

export interface EmpresaData {
  nome: string;
  nipc: string;
  setor?: string;
  dimensao?: string;
  regiao?: string;
  volumeNegocios?: number;
  numeroColaboradores?: number;
  anoFundacao?: number;
  certificacoes?: string[];
  premios?: string[];
}

export interface AvisoData {
  nome: string;
  codigo: string;
  portal: string;
  programa?: string;
  linha?: string;
  descrição?: string;
  montanteMinimo?: number;
  montanteMaximo?: number;
  dataFimSubmissao: Date;
}

export interface ProjetoData {
  designacao: string;
  objetivos: string[];
  atividades: string[];
  investimentoTotal: number;
  investimentoElegivel: number;
  prazoExecucao: number; // meses
  indicadores?: Array<{
    nome: string;
    valorAtual: number;
    meta: number;
    unidade: string;
  }>;
  detalhesAdicionais?: string;
}

export interface MemoriaInput {
  empresa: EmpresaData;
  aviso: AvisoData;
  projeto: ProjetoData;
  seccoesDesejadas?: string[]; // Opcional: secções específicas a gerar
}

// Construir contexto RAG completo
export function buildRAGContext(input: MemoriaInput): string {
  const { empresa, aviso, projeto } = input;
  
  // 1. Selecionar template apropriado
  const template = getTemplate(aviso.programa || aviso.portal);
  
  // 2. Buscar conhecimento relevante
  const tags = determineRelevantTags(aviso, projeto);
  const relevantKnowledge = searchKnowledge(tags, aviso.programa);
  const generalPractices = getGeneralBestPractices().slice(0, 5);
  const programPractices = getProgramSpecificPractices(aviso.programa || '').slice(0, 5);
  
  // 3. Construir prompt estruturado
  const context = `
# CONTEXTO COMPLETO PARA GERAÇÃO DE MEMÓRIA DESCRITIVA

## 1. INFORMAÇÃO DA EMPRESA
- **Nome:** ${empresa.nome}
- **NIPC:** ${empresa.nipc}
- **Setor:** ${empresa.setor || 'Não especificado'}
- **Dimensão:** ${empresa.dimensao || 'Não especificado'}
- **Região:** ${empresa.regiao || 'Não especificado'}
${empresa.volumeNegocios ? `- **Volume de Negócios:** €${empresa.volumeNegocios.toLocaleString('pt-PT')}` : ''}
${empresa.numeroColaboradores ? `- **Colaboradores:** ${empresa.numeroColaboradores}` : ''}
${empresa.anoFundacao ? `- **Ano de Fundação:** ${empresa.anoFundacao}` : ''}
${empresa.certificacoes && empresa.certificacoes.length > 0 ? `- **Certificações:** ${empresa.certificacoes.join(', ')}` : ''}
${empresa.premios && empresa.premios.length > 0 ? `- **Prémios/Reconhecimentos:** ${empresa.premios.join(', ')}` : ''}

## 2. INFORMAÇÃO DO AVISO/PROGRAMA
- **Aviso:** ${aviso.nome}
- **Código:** ${aviso.codigo}
- **Portal:** ${aviso.portal}
- **Programa:** ${aviso.programa || 'N/A'}
- **Linha de Financiamento:** ${aviso.linha || 'N/A'}
${aviso.descrição ? `- **Descrição:** ${aviso.descrição}` : ''}
- **Data Limite:** ${aviso.dataFimSubmissao.toLocaleDateString('pt-PT')}
${aviso.montanteMinimo ? `- **Montante Mínimo:** €${aviso.montanteMinimo.toLocaleString('pt-PT')}` : ''}
${aviso.montanteMaximo ? `- **Montante Máximo:** €${aviso.montanteMaximo.toLocaleString('pt-PT')}` : ''}

## 3. INFORMAÇÃO DO PROJETO
- **Designação:** ${projeto.designacao}
- **Investimento Total:** €${projeto.investimentoTotal.toLocaleString('pt-PT')}
- **Investimento Elegível:** €${projeto.investimentoElegivel.toLocaleString('pt-PT')}
- **Prazo de Execução:** ${projeto.prazoExecucao} meses

### 3.1. Objetivos do Projeto
${projeto.objetivos.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

### 3.2. Atividades Principais
${projeto.atividades.map((ativ, i) => `${i + 1}. ${ativ}`).join('\n')}

${projeto.indicadores && projeto.indicadores.length > 0 ? `
### 3.3. Indicadores e Metas
${projeto.indicadores.map(ind => `- **${ind.nome}:** de ${ind.valorAtual} para ${ind.meta} ${ind.unidade}`).join('\n')}
` : ''}

${projeto.detalhesAdicionais ? `
### 3.4. Detalhes Adicionais
${projeto.detalhesAdicionais}
` : ''}

## 4. TEMPLATE ESTRUTURAL (${template.programa})

### Secções Obrigatórias:
${template.secoes.map((sec, i) => `
**${sec.titulo}**
${sec.conteudoBase}

Tópicos a cobrir:
${sec.topicos.map(top => `  - ${top}`).join('\n')}

Dicas de redação:
${sec.dicasRedacao.map(dica => `  • ${dica}`).join('\n')}
${sec.exemploPratico ? `\nExemplo prático:\n${sec.exemploPratico}` : ''}
`).join('\n---\n')}

### Requisitos Gerais:
${template.requisitos.map(req => `- ${req}`).join('\n')}

## 5. BASE DE CONHECIMENTO - BOAS PRÁTICAS GERAIS

${generalPractices.map(kb => `
### ${kb.topico}
${kb.conteudo}
`).join('\n')}

${programPractices.length > 0 ? `
## 6. BOAS PRÁTICAS ESPECÍFICAS DO PROGRAMA

${programPractices.map(kb => `
### ${kb.topico}
${kb.conteudo}
`).join('\n')}
` : ''}

${relevantKnowledge.length > 0 ? `
## 7. CONHECIMENTO ADICIONAL RELEVANTE

${relevantKnowledge.slice(0, 5).map(kb => `
### ${kb.topico}
${kb.conteudo}
`).join('\n')}
` : ''}

## 8. INSTRUÇÕES FINAIS DE GERAÇÃO

Com base em toda a informação acima, gere uma Memória Descritiva completa, profissional e de alta qualidade para submissão ao ${aviso.portal} / ${aviso.programa || 'programa de incentivos'}.

**REQUISITOS CRÍTICOS:**
1. Use português de Portugal formal e profissional
2. Estruture seguindo EXATAMENTE as secções do template
3. Incorpore TODAS as informações fornecidas sobre empresa, aviso e projeto
4. Aplique as boas práticas da base de conhecimento
5. Seja específico, quantificado e fundamentado - NUNCA genérico
6. Garanta coerência absoluta entre todas as secções
7. Use dados reais fornecidos - NUNCA invente informações
8. Mantenha tom confiante mas não arrogante
9. Evidencie alinhamento com objetivos do programa
10. Produza texto de qualidade que demonstre profissionalismo e competência técnica

**FORMATAÇÃO:**
- Use markdown para estruturação (##, ###, **, - , etc.)
- Inclua numeração clara de secções e subsecções
- Use tabelas quando apropriado (indicadores, orçamento, etc.)
- Destaque pontos-chave com **negrito**
- Mantenha parágrafos com 4-8 linhas

**EXTENSÃO ESPERADA:**
- Memória completa: 8.000-15.000 palavras (dependendo da complexidade)
- Cada secção principal: 800-2.500 palavras

IMPORTANTE: Esta é uma candidatura real. O texto deve ser de qualidade profissional, pronta para submissão oficial.
`;

  return context;
}

// Determinar tags relevantes baseadas no aviso e projeto
function determineRelevantTags(aviso: AvisoData, projeto: ProjetoData): string[] {
  const tags: string[] = ['geral', 'redação', 'estrutura'];
  
  // Tags baseadas no programa
  const programaLower = (aviso.programa || aviso.portal).toLowerCase();
  if (programaLower.includes('portugal') || programaLower.includes('2030')) {
    tags.push('portugal2030', 'critérios', 'avaliação');
  }
  if (programaLower.includes('prr')) {
    tags.push('prr', 'resiliência');
  }
  
  // Tags baseadas no projeto
  const projetoTexto = [
    projeto.designacao,
    ...projeto.objetivos,
    ...projeto.atividades,
    projeto.detalhesAdicionais || ''
  ].join(' ').toLowerCase();
  
  if (projetoTexto.includes('digital') || projetoTexto.includes('4.0') || projetoTexto.includes('automação')) {
    tags.push('digitalização', 'indústria 4.0');
  }
  if (projetoTexto.includes('sustent') || projetoTexto.includes('carbon') || projetoTexto.includes('energia')) {
    tags.push('descarbonização', 'sustentabilidade');
  }
  if (projetoTexto.includes('i&d') || projetoTexto.includes('inovação') || projetoTexto.includes('investigação')) {
    tags.push('inovação', 'I&D');
  }
  if (projetoTexto.includes('export') || projetoTexto.includes('internacional')) {
    tags.push('internacionalização');
  }
  
  // Tags sempre relevantes
  tags.push('orçamento', 'detalhamento', 'indicadores', 'viabilidade', 'fundamentação');
  
  return [...new Set(tags)]; // Remover duplicados
}

// Construir prompt simplificado para secção específica
export function buildSectionPrompt(
  input: MemoriaInput,
  sectionTitle: string,
  previousSections?: string
): string {
  const fullContext = buildRAGContext(input);
  const template = getTemplate(input.aviso.programa || input.aviso.portal);
  const section = template.secoes.find(s => s.titulo.includes(sectionTitle));
  
  if (!section) {
    return fullContext + `\n\n## SECÇÃO SOLICITADA: ${sectionTitle}\nGere esta secção específica de forma completa e profissional.`;
  }
  
  return `${fullContext}

${previousSections ? `
## SECÇÕES JÁ GERADAS (Para contexto e coerência)
${previousSections}

---
` : ''}

## SECÇÃO A GERAR AGORA: ${section.titulo}

**Descrição:** ${section.conteudoBase}

**Tópicos obrigatórios:**
${section.topicos.map(t => `- ${t}`).join('\n')}

**Dicas de redação:**
${section.dicasRedacao.map(d => `• ${d}`).join('\n')}

${section.exemploPratico ? `**Exemplo de abordagem:**\n${section.exemploPratico}` : ''}

Gere APENAS esta secção, de forma completa, detalhada e profissional. Mantenha coerência com secções anteriores se fornecidas.
`;
}
