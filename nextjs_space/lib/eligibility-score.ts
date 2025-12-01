/**
 * Sistema de Score de Elegibilidade
 *
 * Calcula automaticamente a compatibilidade entre uma empresa
 * e os avisos de financiamento disponíveis.
 */

export interface EmpresaProfile {
  id: string;
  nome: string;
  nif: string;
  cae: string;
  setor: string;
  dimensao: 'micro' | 'pequena' | 'media' | 'grande';
  regiao: string;
  distrito?: string;
  anosAtividade: number;
  volumeNegocios?: number;
  numeroTrabalhadores?: number;
  exportadora?: boolean;
  certificacoes?: string[];
  necessidades?: string[];
}

export interface AvisoProfile {
  id: string;
  titulo: string;
  fonte: string;
  programa: string;
  setor: string;
  regiao: string;
  tipo_beneficiario: string;
  elegibilidade: string;
  montante_min: number;
  montante_max: number;
  taxa_apoio: number;
  data_fecho: string;
  keywords: string[];
}

export interface EligibilityScore {
  aviso_id: string;
  aviso_titulo: string;
  empresa_id: string;
  empresa_nome: string;
  score_total: number; // 0-100
  nivel: 'excelente' | 'bom' | 'medio' | 'baixo' | 'nao_elegivel';
  breakdown: {
    setor_match: number;        // 0-25
    dimensao_match: number;     // 0-20
    regiao_match: number;       // 0-20
    requisitos_match: number;   // 0-20
    keywords_match: number;     // 0-15
  };
  recomendacoes: string[];
  riscos: string[];
  urgencia: 'alta' | 'media' | 'baixa';
  dias_restantes: number;
}

export interface MatchResult {
  empresa: EmpresaProfile;
  matches: EligibilityScore[];
  melhor_match?: EligibilityScore;
  total_oportunidades: number;
  montante_potencial: number;
}

// Mapeamentos de setores
const SETOR_MAPPING: Record<string, string[]> = {
  'Agricultura': ['agricultura', 'agro', 'pecuário', 'florestal', 'agrícola', 'vinho', 'olival'],
  'Indústria': ['indústria', 'industrial', 'transformadora', 'fabricação', 'produção'],
  'Tecnologia': ['tecnologia', 'digital', 'software', 'IT', 'tech', 'IA', 'inovação'],
  'Serviços': ['serviços', 'consultoria', 'comércio', 'turismo', 'hotelaria'],
  'Construção': ['construção', 'imobiliário', 'obras', 'engenharia civil'],
  'Saúde': ['saúde', 'farmacêutico', 'biotecnologia', 'medical', 'hospitalar'],
  'Energia': ['energia', 'renovável', 'solar', 'eólica', 'eficiência energética'],
  'Mar': ['mar', 'pesca', 'aquicultura', 'marítimo', 'naval'],
};

// Mapeamentos de dimensão
const DIMENSAO_KEYWORDS: Record<string, string[]> = {
  'micro': ['micro', 'microempresa'],
  'pequena': ['pequena', 'PME', 'pme'],
  'media': ['média', 'PME', 'pme'],
  'grande': ['grande', 'grandes empresas'],
};

// Mapeamentos de regiões
const REGIAO_MAPPING: Record<string, string[]> = {
  'Norte': ['norte', 'porto', 'braga', 'viana', 'bragança', 'vila real'],
  'Centro': ['centro', 'coimbra', 'aveiro', 'leiria', 'viseu', 'guarda', 'castelo branco'],
  'Lisboa': ['lisboa', 'lvm', 'grande lisboa', 'área metropolitana'],
  'Alentejo': ['alentejo', 'évora', 'beja', 'portalegre'],
  'Algarve': ['algarve', 'faro'],
  'Açores': ['açores', 'azores'],
  'Madeira': ['madeira'],
  'Nacional': ['nacional', 'continente', 'portugal'],
  'Baixa Densidade': ['baixa densidade', 'interior', 'rural'],
};

/**
 * Calcular score de elegibilidade para um par empresa-aviso
 */
export function calculateEligibilityScore(
  empresa: EmpresaProfile,
  aviso: AvisoProfile
): EligibilityScore {
  const breakdown = {
    setor_match: calculateSetorMatch(empresa, aviso),
    dimensao_match: calculateDimensaoMatch(empresa, aviso),
    regiao_match: calculateRegiaoMatch(empresa, aviso),
    requisitos_match: calculateRequisitosMatch(empresa, aviso),
    keywords_match: calculateKeywordsMatch(empresa, aviso),
  };

  const score_total = Object.values(breakdown).reduce((a, b) => a + b, 0);
  const nivel = getScoreNivel(score_total);
  const dias_restantes = calculateDiasRestantes(aviso.data_fecho);

  return {
    aviso_id: aviso.id,
    aviso_titulo: aviso.titulo,
    empresa_id: empresa.id,
    empresa_nome: empresa.nome,
    score_total,
    nivel,
    breakdown,
    recomendacoes: generateRecomendacoes(empresa, aviso, breakdown),
    riscos: generateRiscos(empresa, aviso, breakdown, dias_restantes),
    urgencia: dias_restantes <= 30 ? 'alta' : dias_restantes <= 60 ? 'media' : 'baixa',
    dias_restantes,
  };
}

/**
 * Encontrar melhores matches para uma empresa
 */
export function findBestMatches(
  empresa: EmpresaProfile,
  avisos: AvisoProfile[],
  minScore: number = 40
): MatchResult {
  const matches = avisos
    .map(aviso => calculateEligibilityScore(empresa, aviso))
    .filter(score => score.score_total >= minScore)
    .sort((a, b) => {
      // Ordenar por score, depois por urgência
      if (b.score_total !== a.score_total) {
        return b.score_total - a.score_total;
      }
      return a.dias_restantes - b.dias_restantes;
    });

  const montante_potencial = matches.reduce((total, match) => {
    const aviso = avisos.find(a => a.id === match.aviso_id);
    return total + (aviso?.montante_max || 0);
  }, 0);

  return {
    empresa,
    matches,
    melhor_match: matches[0],
    total_oportunidades: matches.length,
    montante_potencial,
  };
}

// === Funções auxiliares de cálculo ===

function calculateSetorMatch(empresa: EmpresaProfile, aviso: AvisoProfile): number {
  const empresaSetor = empresa.setor.toLowerCase();
  const avisoSetor = aviso.setor.toLowerCase();
  const avisoElegibilidade = aviso.elegibilidade?.toLowerCase() || '';

  // Match direto
  if (avisoSetor.includes(empresaSetor) || empresaSetor.includes(avisoSetor)) {
    return 25;
  }

  // "Todos os setores" é universal
  if (avisoSetor.includes('todos') || avisoSetor.includes('transversal')) {
    return 20;
  }

  // Verificar sinónimos
  for (const [setor, keywords] of Object.entries(SETOR_MAPPING)) {
    if (keywords.some(k => empresaSetor.includes(k))) {
      if (keywords.some(k => avisoSetor.includes(k) || avisoElegibilidade.includes(k))) {
        return 22;
      }
    }
  }

  // Match parcial por keywords do aviso
  const avisoKeywords = aviso.keywords?.map(k => k.toLowerCase()) || [];
  if (avisoKeywords.some(k => empresaSetor.includes(k))) {
    return 15;
  }

  return 5;
}

function calculateDimensaoMatch(empresa: EmpresaProfile, aviso: AvisoProfile): number {
  const tipoBeneficiario = aviso.tipo_beneficiario?.toLowerCase() || '';
  const elegibilidade = aviso.elegibilidade?.toLowerCase() || '';

  // PME inclui micro, pequena e média
  const isPME = ['micro', 'pequena', 'media'].includes(empresa.dimensao);

  if (tipoBeneficiario.includes('pme') || elegibilidade.includes('pme')) {
    if (isPME) return 20;
    if (empresa.dimensao === 'grande') return 5;
  }

  // Verificar menções específicas
  const dimensaoKeywords = DIMENSAO_KEYWORDS[empresa.dimensao] || [];
  for (const keyword of dimensaoKeywords) {
    if (tipoBeneficiario.includes(keyword) || elegibilidade.includes(keyword)) {
      return 20;
    }
  }

  // Grandes empresas também elegíveis
  if (tipoBeneficiario.includes('grande') && empresa.dimensao === 'grande') {
    return 20;
  }

  // Sem restrição de dimensão
  if (!tipoBeneficiario && !elegibilidade) {
    return 15;
  }

  return 10;
}

function calculateRegiaoMatch(empresa: EmpresaProfile, aviso: AvisoProfile): number {
  const empresaRegiao = empresa.regiao.toLowerCase();
  const avisoRegiao = aviso.regiao?.toLowerCase() || '';

  // Nacional cobre tudo
  if (avisoRegiao.includes('nacional') || avisoRegiao.includes('continente')) {
    return 18;
  }

  // Match direto
  if (avisoRegiao.includes(empresaRegiao) || empresaRegiao.includes(avisoRegiao)) {
    return 20;
  }

  // Verificar sinónimos de região
  for (const [regiao, keywords] of Object.entries(REGIAO_MAPPING)) {
    if (keywords.some(k => empresaRegiao.includes(k))) {
      if (keywords.some(k => avisoRegiao.includes(k))) {
        return 20;
      }
    }
  }

  // Baixa densidade é especial
  if (avisoRegiao.includes('baixa densidade')) {
    // Assumir que o utilizador verificou
    return 15;
  }

  return 5;
}

function calculateRequisitosMatch(empresa: EmpresaProfile, aviso: AvisoProfile): number {
  let score = 10; // Base
  const elegibilidade = aviso.elegibilidade?.toLowerCase() || '';

  // Verificar anos de atividade
  if (elegibilidade.includes('ano') && empresa.anosAtividade >= 2) {
    score += 3;
  }

  // Verificar se é exportadora
  if (elegibilidade.includes('export') && empresa.exportadora) {
    score += 4;
  }

  // Verificar certificações
  if (empresa.certificacoes?.length) {
    const certKeywords = ['certificação', 'certificado', 'iso', 'biológico', 'qualidade'];
    if (certKeywords.some(k => elegibilidade.includes(k))) {
      if (empresa.certificacoes.some(c =>
        certKeywords.some(k => c.toLowerCase().includes(k))
      )) {
        score += 3;
      }
    }
  }

  return Math.min(score, 20);
}

function calculateKeywordsMatch(empresa: EmpresaProfile, aviso: AvisoProfile): number {
  const avisoKeywords = aviso.keywords?.map(k => k.toLowerCase()) || [];
  const empresaNecessidades = empresa.necessidades?.map(n => n.toLowerCase()) || [];
  const empresaSetor = empresa.setor.toLowerCase();

  if (avisoKeywords.length === 0) return 7;

  let matches = 0;

  // Match com necessidades
  for (const necessidade of empresaNecessidades) {
    if (avisoKeywords.some(k => necessidade.includes(k) || k.includes(necessidade))) {
      matches++;
    }
  }

  // Match com setor
  if (avisoKeywords.some(k => empresaSetor.includes(k))) {
    matches++;
  }

  const matchRatio = matches / Math.max(avisoKeywords.length, 1);
  return Math.round(matchRatio * 15);
}

function getScoreNivel(score: number): EligibilityScore['nivel'] {
  if (score >= 80) return 'excelente';
  if (score >= 65) return 'bom';
  if (score >= 50) return 'medio';
  if (score >= 35) return 'baixo';
  return 'nao_elegivel';
}

function calculateDiasRestantes(dataFecho: string): number {
  const hoje = new Date();
  const fecho = new Date(dataFecho);
  const diff = fecho.getTime() - hoje.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function generateRecomendacoes(
  empresa: EmpresaProfile,
  aviso: AvisoProfile,
  breakdown: EligibilityScore['breakdown']
): string[] {
  const recomendacoes: string[] = [];

  if (breakdown.setor_match >= 20) {
    recomendacoes.push(`Setor ${empresa.setor} bem alinhado com o aviso`);
  }

  if (breakdown.dimensao_match >= 15) {
    recomendacoes.push(`Dimensão da empresa compatível com requisitos`);
  }

  if (aviso.taxa_apoio >= 75) {
    recomendacoes.push(`Taxa de apoio elevada: ${aviso.taxa_apoio}%`);
  }

  if (aviso.montante_max >= 1000000) {
    recomendacoes.push(`Montante máximo significativo: ${(aviso.montante_max / 1000000).toFixed(1)}M€`);
  }

  if (empresa.exportadora && aviso.keywords?.includes('internacionalização')) {
    recomendacoes.push('Perfil exportador valorizado neste aviso');
  }

  return recomendacoes;
}

function generateRiscos(
  empresa: EmpresaProfile,
  aviso: AvisoProfile,
  breakdown: EligibilityScore['breakdown'],
  diasRestantes: number
): string[] {
  const riscos: string[] = [];

  if (diasRestantes <= 14) {
    riscos.push(`URGENTE: Apenas ${diasRestantes} dias para candidatura`);
  } else if (diasRestantes <= 30) {
    riscos.push(`Prazo curto: ${diasRestantes} dias restantes`);
  }

  if (breakdown.setor_match < 15) {
    riscos.push('Alinhamento setorial pode ser questionado');
  }

  if (breakdown.dimensao_match < 15) {
    riscos.push('Verificar critérios de dimensão da empresa');
  }

  if (breakdown.regiao_match < 15) {
    riscos.push('Confirmar elegibilidade geográfica');
  }

  if (empresa.anosAtividade < 2) {
    riscos.push('Empresa jovem - verificar requisitos de antiguidade');
  }

  return riscos;
}

/**
 * Converter aviso do formato JSON para AvisoProfile
 */
export function avisoToProfile(aviso: any): AvisoProfile {
  return {
    id: aviso.id,
    titulo: aviso.titulo,
    fonte: aviso.fonte,
    programa: aviso.programa || '',
    setor: aviso.setor || 'Todos',
    regiao: aviso.regiao || 'Nacional',
    tipo_beneficiario: aviso.tipo_beneficiario || '',
    elegibilidade: aviso.elegibilidade || '',
    montante_min: parseFloat(aviso.montante_min) || 0,
    montante_max: parseFloat(aviso.montante_max) || 0,
    taxa_apoio: parseFloat(aviso.taxa_apoio) || 0,
    data_fecho: aviso.data_fecho || '',
    keywords: aviso.keywords || [],
  };
}
