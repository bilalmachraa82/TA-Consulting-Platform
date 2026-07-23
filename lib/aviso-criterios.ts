/**
 * Display partilhado dos critérios de um aviso (fase B, DRY do eng review):
 * usado pelas páginas públicas /avisos/[slug] e reutilizável no funil.
 * Decisão D7.2 (founder): TUDO público — a frescura diária é o moat, não o snapshot.
 *
 * Puro e sem dependências de UI: devolve estrutura {rotulo, valor, destaque}
 * que qualquer componente renderiza.
 */

const BENEFICIARIO_LABELS: Record<string, string> = {
    EMPRESAS: 'Empresas',
    ENTIDADES_PUBLICAS: 'Entidades públicas',
    ASSOCIACOES: 'Associações',
    IPSS: 'IPSS',
    ONG: 'ONG',
    AUTARQUIAS: 'Autarquias',
    UNIVERSIDADES: 'Universidades e I&D',
    PESSOAS_SINGULARES: 'Pessoas singulares',
};

export interface CriterioDisplay {
    rotulo: string;
    valor: string;
    /** critérios que merecem destaque visual (montante, prazo) */
    destaque?: boolean;
}

export interface AvisoCriteriosInput {
    setoresElegiveis?: string[];
    caeElegiveis?: number[];
    tiposBeneficiarios?: string[];
    regiaoNUTS2?: string | null;
    abrangenciaGeografica?: string | null;
    dimensaoEmpresa?: string[];
    montanteMinimo?: number | null;
    montanteMaximo?: number | null;
    taxaCofinanciamentoMax?: number | null;
    dataFimSubmissao?: Date | string | null;
}

const eur = (v: number) => `€${v.toLocaleString('pt-PT')}`;

/** Critérios de elegibilidade formatados — omite os que o aviso não especifica. */
export function criteriosDoAviso(a: AvisoCriteriosInput): CriterioDisplay[] {
    const out: CriterioDisplay[] = [];

    if (a.setoresElegiveis?.length) {
        out.push({ rotulo: 'Setores', valor: a.setoresElegiveis.join(', ') });
    }
    if (a.tiposBeneficiarios?.length) {
        out.push({
            rotulo: 'Beneficiários',
            valor: a.tiposBeneficiarios.map((t) => BENEFICIARIO_LABELS[t] ?? t).join(', '),
        });
    }
    if (a.caeElegiveis?.length) {
        const lista = a.caeElegiveis.slice(0, 8).join(', ');
        out.push({ rotulo: 'CAE elegíveis', valor: a.caeElegiveis.length > 8 ? `${lista}…` : lista });
    }
    const regiao = a.regiaoNUTS2
        || (a.abrangenciaGeografica === 'NACIONAL' ? 'Todo o país'
            : a.abrangenciaGeografica === 'CONTINENTAL' ? 'Portugal Continental'
                : a.abrangenciaGeografica === 'EUROPEU' ? 'União Europeia' : null);
    if (regiao) out.push({ rotulo: 'Região', valor: regiao });

    if (a.dimensaoEmpresa?.length) {
        out.push({ rotulo: 'Dimensão da empresa', valor: a.dimensaoEmpresa.join(' / ') });
    }
    if (a.montanteMaximo) {
        out.push({
            rotulo: 'Apoio',
            valor: a.montanteMinimo ? `${eur(a.montanteMinimo)} – ${eur(a.montanteMaximo)}` : `até ${eur(a.montanteMaximo)}`,
            destaque: true,
        });
    }
    if (a.taxaCofinanciamentoMax) {
        out.push({ rotulo: 'Cofinanciamento', valor: `até ${a.taxaCofinanciamentoMax}%`, destaque: true });
    }
    return out;
}
