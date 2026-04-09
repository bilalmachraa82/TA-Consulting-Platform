export interface CompatibilityResult {
  score: number;
  razoes: string[];
  alertas: string[];
}

export function getCompatibilityPriority(score: number): 'alta' | 'média' | 'baixa' {
  if (score >= 80) return 'alta';
  if (score >= 60) return 'média';
  return 'baixa';
}

interface EmpresaLike {
  setor?: string | null;
  dimensao?: string | null;
  regiao?: string | null;
}

interface AvisoLike {
  nome?: string | null;
  descrição?: string | null;
  dataFimSubmissao: Date;
  montanteMaximo?: number | null;
}

export function calculateCompatibility(
  empresa: EmpresaLike,
  aviso: AvisoLike,
  now: Date = new Date()
): CompatibilityResult {
  let score = 0;
  const razoes: string[] = [];
  const alertas: string[] = [];

  const setorEmpresa = empresa.setor?.toLowerCase() || '';
  const descricaoAviso = aviso.descrição?.toLowerCase() || '';
  const tituloAviso = aviso.nome?.toLowerCase() || '';
  const setoresTexto = `${descricaoAviso} ${tituloAviso}`;

  if (setorEmpresa && setoresTexto.includes(setorEmpresa)) {
    score += 30;
    razoes.push(`Setor ${empresa.setor} está alinhado com o aviso`);
  } else if (setorEmpresa) {
    score += 10;
    razoes.push('Setor potencialmente compatível, mas sem correspondência explícita');
  }

  const dimensao = empresa.dimensao?.toLowerCase() || '';
  if (setoresTexto.includes('pme') || setoresTexto.includes('micro') || setoresTexto.includes('pequena')) {
    if (dimensao === 'micro' || dimensao === 'pequena' || dimensao === 'media') {
      score += 20;
      razoes.push(`Dimensão ${empresa.dimensao} adequada para o programa`);
    } else {
      score += 5;
      alertas.push('Este programa parece mais orientado para PMEs');
    }
  } else {
    score += 15;
    razoes.push('Sem restrições explícitas de dimensão nos dados atuais');
  }

  const regiaoEmpresa = empresa.regiao?.toLowerCase() || '';
  if (regiaoEmpresa && setoresTexto.includes(regiaoEmpresa)) {
    score += 15;
    razoes.push(`Localização em ${empresa.regiao} beneficia este programa`);
  } else if (regiaoEmpresa) {
    score += 10;
    razoes.push(`Programa potencialmente disponível para a região ${empresa.regiao}`);
  }

  const diasRestantes = Math.ceil(
    (aviso.dataFimSubmissao.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diasRestantes > 30) {
    score += 20;
    razoes.push(`Prazo confortável: ${diasRestantes} dias para submissão`);
  } else if (diasRestantes > 14) {
    score += 15;
    razoes.push(`Prazo adequado: ${diasRestantes} dias para submissão`);
    alertas.push('Convém iniciar preparação em breve');
  } else if (diasRestantes > 0) {
    score += 10;
    alertas.push(`Urgente: apenas ${diasRestantes} dias restantes`);
  } else {
    return {
      score: 0,
      razoes: [],
      alertas: ['Prazo expirado'],
    };
  }

  const montanteMax = aviso.montanteMaximo || 0;
  if (montanteMax > 500_000) {
    score += 15;
    razoes.push(`Financiamento significativo disponível: até €${montanteMax.toLocaleString('pt-PT')}`);
  } else if (montanteMax > 100_000) {
    score += 12;
    razoes.push(`Bom montante disponível: até €${montanteMax.toLocaleString('pt-PT')}`);
  } else if (montanteMax > 0) {
    score += 8;
    razoes.push(`Montante disponível: até €${montanteMax.toLocaleString('pt-PT')}`);
  }

  return { score, razoes, alertas };
}
