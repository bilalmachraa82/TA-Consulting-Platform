import { getCompatibilityPriority, type CompatibilityResult } from '@/lib/compatibility';

interface EmpresaLike {
  nome: string;
  setor?: string | null;
  dimensao?: string | null;
  regiao?: string | null;
}

interface AvisoLike {
  nome: string;
  portal: string;
  programa?: string | null;
  linha?: string | null;
  dataInicioSubmissao: Date;
  dataFimSubmissao: Date;
  link?: string | null;
}

export interface CaseBrief {
  titulo: string;
  sumarioExecutivo: string;
  elegibilidade: {
    score: number;
    prioridade: 'alta' | 'média' | 'baixa';
    razoes: string[];
    alertas: string[];
  };
  documentosNecessarios: string[];
  timeline: string[];
  riscos: string[];
  recomendacao: string;
}

export function buildFallbackCaseBrief(
  empresa: EmpresaLike,
  aviso: AvisoLike,
  analise: CompatibilityResult
): CaseBrief {
  const prioridade = getCompatibilityPriority(analise.score);

  return {
    titulo: `Brief IA: ${empresa.nome} x ${aviso.nome}`,
    sumarioExecutivo:
      analise.score >= 70
        ? `${empresa.nome} apresenta um encaixe promissor para o aviso ${aviso.nome}, sujeito a validação documental e confirmação fina dos critérios.`
        : `${empresa.nome} tem um encaixe inicial moderado para o aviso ${aviso.nome}; recomenda-se validação adicional antes de investir esforço elevado.`,
    elegibilidade: {
      score: analise.score,
      prioridade,
      razoes: analise.razoes,
      alertas: analise.alertas,
    },
    documentosNecessarios: [
      'Certidão permanente atualizada',
      'IES ou demonstrações financeiras recentes',
      'Comprovativos de situação tributária e contributiva regularizada',
      'Orçamentos e plano de investimento',
    ],
    timeline: [
      `Validar enquadramento do aviso e critérios específicos: ${aviso.programa || aviso.portal}`,
      'Confirmar documentação base da empresa e eventuais certidões em falta',
      `Preparar candidatura antes de ${aviso.dataFimSubmissao.toLocaleDateString('pt-PT')}`,
      'Rever riscos, orçamento e narrativa final antes de submissão',
    ],
    riscos: analise.alertas.length > 0 ? analise.alertas : ['Validar critérios específicos não explícitos no aviso sintetizado'],
    recomendacao:
      analise.score >= 80
        ? 'Avançar com prioridade alta para análise técnica e preparação da candidatura.'
        : analise.score >= 60
          ? 'Avançar com prudência, após validação documental e confirmação dos requisitos críticos.'
          : 'Manter em observação; pode não justificar esforço imediato sem melhor evidência de elegibilidade.',
  };
}

export function normalizeCaseBriefPayload(
  payload: Partial<CaseBrief>,
  fallback: CaseBrief
): CaseBrief {
  return {
    titulo: payload.titulo?.trim() || fallback.titulo,
    sumarioExecutivo: payload.sumarioExecutivo?.trim() || fallback.sumarioExecutivo,
    elegibilidade: {
      // Score and prioridade are ALWAYS deterministic — never accept LLM values
      score: fallback.elegibilidade.score,
      prioridade: fallback.elegibilidade.prioridade,
      razoes: payload.elegibilidade?.razoes?.filter(Boolean) || fallback.elegibilidade.razoes,
      alertas: payload.elegibilidade?.alertas?.filter(Boolean) || fallback.elegibilidade.alertas,
    },
    documentosNecessarios:
      payload.documentosNecessarios?.filter(Boolean) || fallback.documentosNecessarios,
    timeline: payload.timeline?.filter(Boolean) || fallback.timeline,
    riscos: payload.riscos?.filter(Boolean) || fallback.riscos,
    recomendacao: payload.recomendacao?.trim() || fallback.recomendacao,
  };
}
