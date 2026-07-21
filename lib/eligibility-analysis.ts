/**
 * Análise de elegibilidade EXPLICÁVEL (gap analysis).
 *
 * O diferenciador #1 da análise de mercado: não basta um score "65%" — o
 * consultor tem de ver POR QUE a empresa é (ou não) elegível, critério a
 * critério, e o que falta. Distingue três situações que um score único esconde:
 *   ✅ cumpre        — a empresa satisfaz o critério
 *   ⚠️ atenção       — cumpre parcialmente / a confirmar
 *   ❌ falha         — a empresa NÃO cumpre um requisito explícito do aviso
 *   ⚪ desconhecido  — o AVISO não especifica este critério (não penaliza)
 *
 * Usa os campos estruturados que o agente de enriquecimento preenche
 * (caeElegiveis, tiposBeneficiarios, regiaoNUTS2, ...); quando o aviso não os
 * tem, o critério fica "desconhecido" em vez de inventar um veredicto.
 */

export type EstadoCriterio = 'ok' | 'atencao' | 'falha' | 'desconhecido';

export interface CriterioElegibilidade {
    dimensao: string;
    estado: EstadoCriterio;
    explicacao: string;
    /** peso do critério no score (0-100) quando avaliável */
    peso: number;
}

export type Veredicto = 'elegivel' | 'elegivel_com_reservas' | 'provavelmente_nao' | 'dados_insuficientes';

export interface AnaliseElegibilidade {
    score: number;
    veredicto: Veredicto;
    criterios: CriterioElegibilidade[];
    resumo: string;
}

export interface EmpresaElegivel {
    cae?: string | null;
    setor?: string | null;
    dimensao?: string | null; // MICRO | PEQUENA | MEDIA | GRANDE
    regiao?: string | null;
    nut?: string | null;
}

export interface AvisoElegivel {
    nome?: string | null;
    descricao?: string | null;
    dataFimSubmissao?: Date | null;
    montanteMinimo?: number | null;
    montanteMaximo?: number | null;
    caeElegiveis?: number[];
    tiposBeneficiarios?: string[]; // TipoBeneficiario[]
    regiaoNUTS2?: string | null;
    regiaoNUTS3?: string[];
    dimensaoEmpresa?: string[];
    abrangenciaGeografica?: string | null; // REGIONAL | NACIONAL | CONTINENTAL | EUROPEU
}

/** Remove acentos e baixa a caixa, para comparar setor↔texto do aviso. */
function normalizar(s: string): string {
    return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/**
 * Grupos de setor → termos que aparecem no texto de um aviso relevante.
 * Sem acentos (comparação feita sobre texto normalizado). Cobre os setores
 * dos clientes reais (turismo, indústria, tecnologia/IA, formação…).
 */
const GRUPOS_SETOR: { chave: string; termos: string[] }[] = [
    { chave: 'turismo', termos: ['turism', 'hotel', 'hotelaria', 'restaura', 'enoturism', 'termas', 'alojamento local', 'alojamento turistic'] },
    { chave: 'industria', termos: ['industri', 'fabril', 'transformador', 'manufatur', 'fabrico', 'producao industrial'] },
    { chave: 'tecnologia', termos: ['digital', 'tecnolog', 'software', 'informatic', 'inteligencia artificial', 'dados', 'tic ', 'ciber', 'startup'] },
    { chave: 'agricultura', termos: ['agricultur', 'agricol', 'agroaliment', 'rural', 'florest', 'pecuar', 'vinha', 'agro'] },
    { chave: 'comercio', termos: ['comercio', 'retalho', 'distribuicao', 'loja'] },
    { chave: 'energia', termos: ['energi', 'renovav', 'descarboniz', 'eficiencia energet', 'fotovoltaic', 'solar', 'eolic'] },
    { chave: 'ambiente', termos: ['ambient', 'sustentab', 'residuos', 'agua', 'natureza', 'economia circular', 'biodiversidade'] },
    { chave: 'saude', termos: ['saude', 'clinic', 'hospital', 'farmac', 'cuidados'] },
    { chave: 'formacao', termos: ['formacao', 'educacao', 'ensino', 'qualificacao', 'competencias', 'capacitacao'] },
    { chave: 'construcao', termos: ['construcao', 'obras', 'imobiliar', 'reabilitacao', 'edificios'] },
    { chave: 'social', termos: ['social', 'ipss', 'solidaried', 'inclusao', 'associac'] },
    { chave: 'cultura', termos: ['cultura', 'criativ', 'artistic', 'patrimonio', 'audiovisual', 'cinema'] },
];

/** CAE de empresa (string, possivelmente com pontos) → dígitos. */
function caeDigitos(cae?: string | null): string {
    return (cae || '').replace(/\D/g, '');
}

function avaliarSetor(empresa: EmpresaElegivel, aviso: AvisoElegivel): CriterioElegibilidade {
    const setor = normalizar(empresa.setor || '');
    if (!setor) {
        return { dimensao: 'Setor / atividade', estado: 'desconhecido', peso: 0, explicacao: 'Sem setor indicado.' };
    }
    const texto = normalizar(`${aviso.nome ?? ''} ${aviso.descricao ?? ''}`);
    // Grupos relevantes ao setor da empresa (pelo termo ou pela chave).
    const grupos = GRUPOS_SETOR.filter((g) => g.chave.includes(setor) || setor.includes(g.chave) || g.termos.some((t) => setor.includes(t)));
    const termos = grupos.length > 0 ? grupos.flatMap((g) => g.termos) : [setor];
    const match = termos.some((t) => t.length >= 3 && texto.includes(t));
    if (match) {
        return { dimensao: 'Setor / atividade', estado: 'ok', peso: 20, explicacao: `Aviso relevante para o setor ${empresa.setor}.` };
    }
    // Não menciona o setor: apoio horizontal possível — neutro, não penaliza.
    return { dimensao: 'Setor / atividade', estado: 'desconhecido', peso: 0, explicacao: 'Não é específico do teu setor (pode ainda aplicar-se como apoio horizontal).' };
}

/** Empresa cumpre a lista de CAE elegíveis se o seu CAE começar por algum deles. */
function caeMatch(empresaCae: string, elegiveis: number[]): boolean {
    if (!empresaCae || elegiveis.length === 0) return false;
    return elegiveis.some((c) => {
        const prefixo = String(c);
        return empresaCae.startsWith(prefixo) || prefixo.startsWith(empresaCae.slice(0, prefixo.length));
    });
}

function avaliarCAE(empresa: EmpresaElegivel, aviso: AvisoElegivel): CriterioElegibilidade {
    const cae = caeDigitos(empresa.cae);
    const elegiveis = aviso.caeElegiveis ?? [];
    if (elegiveis.length === 0) {
        return { dimensao: 'CAE / Atividade', estado: 'desconhecido', peso: 0, explicacao: 'O aviso não especifica CAE elegíveis.' };
    }
    if (!cae) {
        return { dimensao: 'CAE / Atividade', estado: 'atencao', peso: 25, explicacao: 'A empresa não tem CAE registado — confirmar manualmente.' };
    }
    if (caeMatch(cae, elegiveis)) {
        return { dimensao: 'CAE / Atividade', estado: 'ok', peso: 25, explicacao: `O CAE ${empresa.cae} está na lista de atividades elegíveis.` };
    }
    return { dimensao: 'CAE / Atividade', estado: 'falha', peso: 25, explicacao: `O CAE ${empresa.cae} não consta das atividades elegíveis (${elegiveis.slice(0, 6).join(', ')}${elegiveis.length > 6 ? '…' : ''}).` };
}

function avaliarBeneficiario(aviso: AvisoElegivel): CriterioElegibilidade {
    const tipos = aviso.tiposBeneficiarios ?? [];
    if (tipos.length === 0) {
        return { dimensao: 'Tipo de beneficiário', estado: 'desconhecido', peso: 0, explicacao: 'O aviso não especifica tipos de beneficiário.' };
    }
    // Assumimos empresa (a plataforma gere empresas); se o aviso admitir EMPRESAS, ok.
    if (tipos.includes('EMPRESAS')) {
        return { dimensao: 'Tipo de beneficiário', estado: 'ok', peso: 20, explicacao: 'O aviso admite empresas como beneficiárias.' };
    }
    return { dimensao: 'Tipo de beneficiário', estado: 'falha', peso: 20, explicacao: `O aviso destina-se a ${tipos.join(', ')} — não a empresas.` };
}

function avaliarRegiao(empresa: EmpresaElegivel, aviso: AvisoElegivel): CriterioElegibilidade {
    const nuts2 = aviso.regiaoNUTS2;
    const abr = (aviso.abrangenciaGeografica || '').toUpperCase();
    const empresaReg = (empresa.nut || empresa.regiao || '').toLowerCase().trim();
    // Âmbito nacional/continental/europeu SEM região específica: qualquer empresa
    // portuguesa é elegível no eixo geográfico. "Sem restrição" é um PASSE, não
    // um desconhecido — o aviso não exclui a empresa por causa de onde está.
    if (!nuts2 && (abr === 'NACIONAL' || abr === 'CONTINENTAL' || abr === 'EUROPEU')) {
        const rotulo = abr === 'EUROPEU' ? 'europeu' : abr === 'CONTINENTAL' ? 'de Portugal Continental' : 'nacional';
        return { dimensao: 'Região (NUTS)', estado: 'ok', peso: 15, explicacao: `Aviso de âmbito ${rotulo}: elegível em qualquer região.` };
    }
    if (!nuts2) {
        return { dimensao: 'Região (NUTS)', estado: 'desconhecido', peso: 0, explicacao: 'O aviso não delimita região (ou é nacional).' };
    }
    if (!empresaReg) {
        return { dimensao: 'Região (NUTS)', estado: 'atencao', peso: 15, explicacao: 'A empresa não tem região registada — confirmar.' };
    }
    if (nuts2.toLowerCase().includes(empresaReg) || empresaReg.includes(nuts2.toLowerCase())) {
        return { dimensao: 'Região (NUTS)', estado: 'ok', peso: 15, explicacao: `A empresa em ${empresa.nut || empresa.regiao} está na região abrangida (${nuts2}).` };
    }
    return { dimensao: 'Região (NUTS)', estado: 'falha', peso: 15, explicacao: `O aviso abrange ${nuts2}, mas a empresa está em ${empresa.nut || empresa.regiao}.` };
}

function avaliarDimensao(empresa: EmpresaElegivel, aviso: AvisoElegivel): CriterioElegibilidade {
    const exigidas = (aviso.dimensaoEmpresa ?? []).map((d) => d.toUpperCase());
    const dim = (empresa.dimensao || '').toUpperCase();
    if (exigidas.length === 0) {
        // fallback: o texto menciona PME?
        const texto = `${aviso.nome ?? ''} ${aviso.descricao ?? ''}`.toLowerCase();
        if (/\bpme\b|micro|pequena/.test(texto)) {
            if (['MICRO', 'PEQUENA', 'MEDIA'].includes(dim)) {
                return { dimensao: 'Dimensão da empresa', estado: 'ok', peso: 15, explicacao: `Dimensão ${empresa.dimensao} enquadra-se no perfil PME do aviso.` };
            }
            if (dim === 'GRANDE') {
                return { dimensao: 'Dimensão da empresa', estado: 'atencao', peso: 15, explicacao: 'O aviso parece orientado a PME e a empresa é Grande — confirmar.' };
            }
        }
        return { dimensao: 'Dimensão da empresa', estado: 'desconhecido', peso: 0, explicacao: 'O aviso não restringe a dimensão da empresa.' };
    }
    if (!dim) {
        return { dimensao: 'Dimensão da empresa', estado: 'atencao', peso: 15, explicacao: 'A empresa não tem dimensão registada — confirmar.' };
    }
    if (exigidas.includes(dim)) {
        return { dimensao: 'Dimensão da empresa', estado: 'ok', peso: 15, explicacao: `Dimensão ${empresa.dimensao} é elegível.` };
    }
    return { dimensao: 'Dimensão da empresa', estado: 'falha', peso: 15, explicacao: `O aviso exige ${exigidas.join('/')}, a empresa é ${empresa.dimensao}.` };
}

function avaliarPrazo(aviso: AvisoElegivel, now: Date): CriterioElegibilidade {
    if (!aviso.dataFimSubmissao) {
        return { dimensao: 'Prazo de submissão', estado: 'atencao', peso: 10, explicacao: 'Prazo por confirmar na fonte oficial.' };
    }
    const dias = Math.ceil((aviso.dataFimSubmissao.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (dias < 0) return { dimensao: 'Prazo de submissão', estado: 'falha', peso: 10, explicacao: 'O prazo de submissão já expirou.' };
    if (dias <= 7) return { dimensao: 'Prazo de submissão', estado: 'atencao', peso: 10, explicacao: `Urgente: faltam ${dias} dias.` };
    if (dias <= 21) return { dimensao: 'Prazo de submissão', estado: 'atencao', peso: 10, explicacao: `Faltam ${dias} dias — convém iniciar já.` };
    return { dimensao: 'Prazo de submissão', estado: 'ok', peso: 10, explicacao: `Prazo confortável: ${dias} dias.` };
}

export function analisarElegibilidade(
    empresa: EmpresaElegivel,
    aviso: AvisoElegivel,
    now: Date = new Date(),
): AnaliseElegibilidade {
    const criterios = [
        avaliarSetor(empresa, aviso),
        avaliarCAE(empresa, aviso),
        avaliarBeneficiario(aviso),
        avaliarRegiao(empresa, aviso),
        avaliarDimensao(empresa, aviso),
        avaliarPrazo(aviso, now),
    ];

    // Score: proporção do peso satisfeito entre os critérios AVALIÁVEIS
    // (os "desconhecido" saem do denominador — não penalizam nem inflam).
    const avaliaveis = criterios.filter((c) => c.estado !== 'desconhecido' && c.peso > 0);
    const pesoTotal = avaliaveis.reduce((s, c) => s + c.peso, 0);
    const pesoObtido = avaliaveis.reduce((s, c) => s + (c.estado === 'ok' ? c.peso : c.estado === 'atencao' ? c.peso * 0.5 : 0), 0);
    const score = pesoTotal > 0 ? Math.round((pesoObtido / pesoTotal) * 100) : 0;

    const temFalha = criterios.some((c) => c.estado === 'falha');
    const temAtencao = criterios.some((c) => c.estado === 'atencao');
    // O prazo é condição necessária mas não é um critério de ELEGIBILIDADE:
    // se só o prazo é avaliável, não há base para um veredicto fiável.
    const criteriosElegibilidade = criterios.filter(
        (c) => !c.dimensao.includes('Prazo') && c.estado !== 'desconhecido' && c.peso > 0,
    );

    let veredicto: Veredicto;
    let resumo: string;
    if (criteriosElegibilidade.length === 0) {
        veredicto = 'dados_insuficientes';
        resumo = 'O aviso ainda não tem critérios estruturados suficientes para uma análise fiável. Enriquecer o aviso melhora este resultado.';
    } else if (temFalha) {
        veredicto = 'provavelmente_nao';
        const falhas = criterios.filter((c) => c.estado === 'falha').map((c) => c.dimensao);
        resumo = `Provavelmente não elegível: falha em ${falhas.join(', ')}.`;
    } else if (temAtencao) {
        veredicto = 'elegivel_com_reservas';
        resumo = 'Elegível com reservas — há pontos a confirmar antes de avançar.';
    } else {
        veredicto = 'elegivel';
        resumo = 'Elegível: cumpre todos os critérios avaliáveis do aviso.';
    }

    return { score, veredicto, criterios, resumo };
}
