/**
 * Serviço de Elegibilidade Enriquecido
 *
 * Combina:
 * - Score base de compatibilidade (setor, dimensão, região)
 * - Score financeiro (via aiparati-express)
 * - Análise de avisos disponíveis
 * - Recomendações personalizadas
 */

import { getAiparatiClient, IESData, AnaliseFinanceira, ElegibilidadeEnriquecida } from './aiparati-client';
import { searchAvisos, SearchResult } from './rag-system';

// ============================================
// TYPES
// ============================================

export interface EmpresaProfile {
  id: string;
  nipc: string;
  nome: string;
  cae: string;
  setor: string;
  dimensao: 'MICRO' | 'PEQUENA' | 'MEDIA' | 'GRANDE';
  regiao: string;
  iesData?: IESData;
}

export interface AvisoMatch {
  avisoId: string;
  avisoTitulo: string;
  fonte: string;
  programa: string;
  scoreCompatibilidade: number;
  scoreFinanceiro: number;
  scoreFinal: number;
  fatores: {
    positivos: string[];
    negativos: string[];
  };
  montanteRecomendado: number;
  taxaApoio: number;
  dataFecho: string;
  urgente: boolean;
}

export interface ElegibilidadeCompleta {
  empresa: EmpresaProfile;
  analiseFinanceira?: AnaliseFinanceira;
  scoreGlobal: number;
  elegivel: boolean;
  avisosMelhores: AvisoMatch[];
  totalOportunidades: number;
  montantePotencial: number;
  resumo: {
    pontosFavoraveis: string[];
    pontosAtencao: string[];
    recomendacoes: string[];
  };
  calculadoEm: string;
}

// ============================================
// WEIGHTS & THRESHOLDS
// ============================================

const WEIGHTS = {
  setor: 0.30,
  dimensao: 0.20,
  regiao: 0.15,
  prazo: 0.15,
  montante: 0.10,
  financeiro: 0.10,
};

const THRESHOLDS = {
  elegivel: 50,
  recomendado: 70,
  urgente: 14, // dias
};

// ============================================
// CAE TO SECTOR MAPPING
// ============================================

const CAE_SECTOR_MAP: Record<string, string[]> = {
  'Agricultura': ['01', '02', '03'],
  'Indústria': ['10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33'],
  'Tecnologia': ['26', '62', '63', '72'],
  'Comércio': ['45', '46', '47'],
  'Turismo': ['55', '56', '79'],
  'Serviços': ['58', '59', '60', '61', '64', '65', '66', '68', '69', '70', '71', '73', '74', '75', '77', '78', '80', '81', '82'],
  'Construção': ['41', '42', '43'],
  'Transportes': ['49', '50', '51', '52', '53'],
  'Saúde': ['86', '87', '88'],
  'Energia': ['35'],
};

// ============================================
// SERVICE IMPLEMENTATION
// ============================================

/**
 * Calcular elegibilidade completa para uma empresa
 */
export async function calculateFullEligibility(
  empresa: EmpresaProfile,
  avisoIds?: string[]
): Promise<ElegibilidadeCompleta> {
  const startTime = Date.now();

  // 1. Obter análise financeira (se IES disponível)
  let analiseFinanceira: AnaliseFinanceira | undefined;
  if (empresa.iesData) {
    const client = getAiparatiClient();
    analiseFinanceira = await client.analyzeIES(empresa.iesData);
  }

  // 2. Buscar avisos relevantes
  const searchResults = await searchAvisos(
    `${empresa.setor} ${empresa.regiao} ${empresa.dimensao}`,
    {
      setor: empresa.setor,
      regiao: empresa.regiao,
    },
    20
  );

  // 3. Calcular compatibilidade para cada aviso
  const avisoMatches: AvisoMatch[] = [];

  for (const result of searchResults) {
    const match = calculateAvisoMatch(empresa, result, analiseFinanceira);
    if (match.scoreFinal >= THRESHOLDS.elegivel) {
      avisoMatches.push(match);
    }
  }

  // 4. Ordenar por score
  avisoMatches.sort((a, b) => b.scoreFinal - a.scoreFinal);

  // 5. Calcular score global
  const scoreGlobal = avisoMatches.length > 0
    ? Math.round(avisoMatches.slice(0, 5).reduce((acc, m) => acc + m.scoreFinal, 0) / Math.min(5, avisoMatches.length))
    : 0;

  // 6. Calcular montante potencial
  const montantePotencial = avisoMatches
    .slice(0, 10)
    .reduce((acc, m) => acc + m.montanteRecomendado, 0);

  // 7. Gerar resumo
  const resumo = generateSummary(empresa, avisoMatches, analiseFinanceira);

  return {
    empresa,
    analiseFinanceira,
    scoreGlobal,
    elegivel: scoreGlobal >= THRESHOLDS.elegivel,
    avisosMelhores: avisoMatches.slice(0, 10),
    totalOportunidades: avisoMatches.length,
    montantePotencial,
    resumo,
    calculadoEm: new Date().toISOString(),
  };
}

/**
 * Calcular match entre empresa e aviso
 */
function calculateAvisoMatch(
  empresa: EmpresaProfile,
  result: SearchResult,
  analiseFinanceira?: AnaliseFinanceira
): AvisoMatch {
  const aviso = result.aviso;
  const fatoresPositivos: string[] = [];
  const fatoresNegativos: string[] = [];

  // Score de setor
  let scoreSetor = 0;
  const setorAviso = (aviso.metadata.keywords || []).join(' ').toLowerCase();
  const setorEmpresa = empresa.setor.toLowerCase();

  if (setorAviso.includes(setorEmpresa) || setorEmpresa.includes(aviso.metadata.setor?.toLowerCase() || '')) {
    scoreSetor = 100;
    fatoresPositivos.push(`Setor compatível: ${empresa.setor}`);
  } else if (aviso.metadata.setor?.toLowerCase().includes('multi') || aviso.metadata.setor?.toLowerCase().includes('geral')) {
    scoreSetor = 70;
    fatoresPositivos.push('Aviso multisectorial');
  } else {
    scoreSetor = 30;
    fatoresNegativos.push(`Setor diferente: ${aviso.metadata.setor}`);
  }

  // Score de dimensão
  let scoreDimensao = 0;
  const beneficiarios = aviso.titulo.toLowerCase() + ' ' + aviso.descricao.toLowerCase();

  if (beneficiarios.includes(empresa.dimensao.toLowerCase())) {
    scoreDimensao = 100;
    fatoresPositivos.push(`Dimensão elegível: ${empresa.dimensao}`);
  } else if (beneficiarios.includes('pme') && ['MICRO', 'PEQUENA', 'MEDIA'].includes(empresa.dimensao)) {
    scoreDimensao = 90;
    fatoresPositivos.push('Empresa PME elegível');
  } else if (beneficiarios.includes('empresa') || beneficiarios.includes('todas')) {
    scoreDimensao = 70;
  } else {
    scoreDimensao = 40;
    fatoresNegativos.push('Verificar elegibilidade por dimensão');
  }

  // Score de região
  let scoreRegiao = 0;
  const regiaoAviso = aviso.metadata.regiao?.toLowerCase() || '';
  const regiaoEmpresa = empresa.regiao.toLowerCase();

  if (regiaoAviso.includes('nacional') || regiaoAviso.includes('todas')) {
    scoreRegiao = 90;
    fatoresPositivos.push('Aviso de âmbito nacional');
  } else if (regiaoAviso.includes(regiaoEmpresa)) {
    scoreRegiao = 100;
    fatoresPositivos.push(`Região elegível: ${empresa.regiao}`);
  } else {
    scoreRegiao = 30;
    fatoresNegativos.push(`Verificar elegibilidade regional: ${aviso.metadata.regiao}`);
  }

  // Score de prazo
  let scorePrazo = 0;
  const dataFecho = new Date(aviso.metadata.data_fecho);
  const hoje = new Date();
  const diasRestantes = Math.ceil((dataFecho.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

  if (diasRestantes > 60) {
    scorePrazo = 100;
    fatoresPositivos.push(`Prazo confortável: ${diasRestantes} dias`);
  } else if (diasRestantes > 30) {
    scorePrazo = 85;
    fatoresPositivos.push(`Prazo adequado: ${diasRestantes} dias`);
  } else if (diasRestantes > THRESHOLDS.urgente) {
    scorePrazo = 70;
    fatoresNegativos.push(`Prazo curto: ${diasRestantes} dias`);
  } else if (diasRestantes > 0) {
    scorePrazo = 50;
    fatoresNegativos.push(`⚠️ URGENTE: Apenas ${diasRestantes} dias!`);
  } else {
    scorePrazo = 0;
    fatoresNegativos.push('Aviso encerrado');
  }

  // Score de montante
  let scoreMontante = 0;
  const montanteMax = aviso.metadata.montante_max || 0;

  if (empresa.dimensao === 'MICRO' && montanteMax <= 200000) {
    scoreMontante = 100;
  } else if (empresa.dimensao === 'PEQUENA' && montanteMax <= 500000) {
    scoreMontante = 100;
  } else if (empresa.dimensao === 'MEDIA' && montanteMax <= 2000000) {
    scoreMontante = 100;
  } else if (montanteMax > 0) {
    scoreMontante = 80;
  } else {
    scoreMontante = 50;
  }

  // Score financeiro (se disponível)
  let scoreFinanceiro = 70; // Default
  if (analiseFinanceira) {
    scoreFinanceiro = analiseFinanceira.scoreGlobal;
    if (analiseFinanceira.autonomiaFinanceira >= 30) {
      fatoresPositivos.push(`Autonomia financeira forte: ${analiseFinanceira.autonomiaFinanceira.toFixed(1)}%`);
    }
    if (analiseFinanceira.risco === 'ALTO') {
      fatoresNegativos.push('Perfil de risco elevado pode afetar aprovação');
    }
  }

  // Calcular score de compatibilidade (sem financeiro)
  const scoreCompatibilidade = Math.round(
    (scoreSetor * WEIGHTS.setor +
     scoreDimensao * WEIGHTS.dimensao +
     scoreRegiao * WEIGHTS.regiao +
     scorePrazo * WEIGHTS.prazo +
     scoreMontante * WEIGHTS.montante) / (1 - WEIGHTS.financeiro) // Normalizar
  );

  // Score final
  const scoreFinal = Math.round(
    scoreCompatibilidade * (1 - WEIGHTS.financeiro) +
    scoreFinanceiro * WEIGHTS.financeiro
  );

  // Calcular montante recomendado
  let montanteRecomendado = 0;
  if (empresa.iesData?.capitalProprio) {
    montanteRecomendado = Math.min(
      montanteMax,
      empresa.iesData.capitalProprio * 1.5
    );
  } else {
    montanteRecomendado = empresa.dimensao === 'MICRO' ? 100000 :
                         empresa.dimensao === 'PEQUENA' ? 300000 :
                         empresa.dimensao === 'MEDIA' ? 1000000 : 2000000;
    montanteRecomendado = Math.min(montanteRecomendado, montanteMax);
  }

  return {
    avisoId: aviso.id,
    avisoTitulo: aviso.titulo,
    fonte: aviso.metadata.fonte,
    programa: aviso.metadata.programa,
    scoreCompatibilidade,
    scoreFinanceiro,
    scoreFinal,
    fatores: {
      positivos: fatoresPositivos,
      negativos: fatoresNegativos,
    },
    montanteRecomendado: Math.round(montanteRecomendado),
    taxaApoio: aviso.metadata.taxa_apoio || 50,
    dataFecho: aviso.metadata.data_fecho,
    urgente: diasRestantes <= THRESHOLDS.urgente,
  };
}

/**
 * Gerar resumo de elegibilidade
 */
function generateSummary(
  empresa: EmpresaProfile,
  matches: AvisoMatch[],
  analiseFinanceira?: AnaliseFinanceira
): ElegibilidadeCompleta['resumo'] {
  const pontosFavoraveis: string[] = [];
  const pontosAtencao: string[] = [];
  const recomendacoes: string[] = [];

  // Análise geral
  if (matches.length >= 5) {
    pontosFavoraveis.push(`${matches.length} avisos compatíveis identificados`);
  } else if (matches.length > 0) {
    pontosAtencao.push(`Apenas ${matches.length} avisos compatíveis encontrados`);
  } else {
    pontosAtencao.push('Nenhum aviso altamente compatível no momento');
    recomendacoes.push('Aguardar novos avisos ou ajustar perfil da empresa');
  }

  // Análise financeira
  if (analiseFinanceira) {
    if (analiseFinanceira.scoreGlobal >= 70) {
      pontosFavoraveis.push(`Perfil financeiro sólido (score ${analiseFinanceira.scoreGlobal})`);
    } else if (analiseFinanceira.scoreGlobal < 50) {
      pontosAtencao.push('Perfil financeiro pode dificultar aprovações');
      recomendacoes.push('Considerar reforço de capital próprio antes de candidaturas');
    }

    if (analiseFinanceira.autonomiaFinanceira < 20) {
      pontosAtencao.push(`Autonomia financeira baixa (${analiseFinanceira.autonomiaFinanceira.toFixed(1)}%)`);
      recomendacoes.push('Alguns avisos exigem AF mínima de 20-25%');
    }
  } else {
    recomendacoes.push('Submeter IES para análise financeira completa');
  }

  // Urgências
  const urgentes = matches.filter(m => m.urgente);
  if (urgentes.length > 0) {
    pontosAtencao.push(`${urgentes.length} aviso(s) com prazo urgente!`);
    recomendacoes.push(`Priorizar: ${urgentes[0].avisoTitulo}`);
  }

  // Melhores oportunidades
  if (matches.length > 0) {
    const melhor = matches[0];
    pontosFavoraveis.push(`Melhor match: ${melhor.avisoTitulo} (${melhor.scoreFinal}%)`);

    const montanteTotal = matches.slice(0, 5).reduce((acc, m) => acc + m.montanteRecomendado, 0);
    pontosFavoraveis.push(`Potencial de financiamento: €${(montanteTotal / 1000000).toFixed(1)}M`);
  }

  // Recomendações por setor
  const setorMatches = matches.filter(m =>
    m.fatores.positivos.some(p => p.toLowerCase().includes('setor'))
  );
  if (setorMatches.length < matches.length / 2) {
    recomendacoes.push('Diversificar áreas de investimento pode abrir mais oportunidades');
  }

  return {
    pontosFavoraveis,
    pontosAtencao,
    recomendacoes,
  };
}

/**
 * Mapear CAE para setor
 */
export function caeToSetor(cae: string): string {
  const cae2 = cae.substring(0, 2);

  for (const [setor, caes] of Object.entries(CAE_SECTOR_MAP)) {
    if (caes.includes(cae2)) {
      return setor;
    }
  }

  return 'Outros';
}

/**
 * Determinar dimensão com base em dados
 */
export function determineDimensao(
  trabalhadores: number,
  volumeNegocios: number
): EmpresaProfile['dimensao'] {
  if (trabalhadores >= 250 || volumeNegocios >= 50000000) {
    return 'GRANDE';
  } else if (trabalhadores >= 50 || volumeNegocios >= 10000000) {
    return 'MEDIA';
  } else if (trabalhadores >= 10 || volumeNegocios >= 2000000) {
    return 'PEQUENA';
  }
  return 'MICRO';
}

export default {
  calculateFullEligibility,
  caeToSetor,
  determineDimensao,
};
