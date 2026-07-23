/**
 * Taxonomia dos hubs setoriais /fundos/[setor]([regiao]) — fase B.
 * Deriva de GRUPOS_SETOR (lib/eligibility-analysis.ts:68), a MESMA taxonomia
 * do motor de matching — DRY: um só sítio define o que é "turismo".
 */
import { GRUPOS_SETOR } from './eligibility-analysis';

export interface SetorHub {
    slug: string;          // = chave do grupo (já é URL-safe)
    label: string;         // nome de exibição
    descricao: string;     // intro da página (SEO)
    termos: string[];      // termos de matching (do grupo)
}

const META: Record<string, { label: string; descricao: string }> = {
    turismo: { label: 'Turismo', descricao: 'Hotelaria, alojamento local, restauração e animação turística — do Turismo de Portugal ao PT2030.' },
    industria: { label: 'Indústria', descricao: 'Inovação produtiva, modernização fabril e indústria transformadora.' },
    tecnologia: { label: 'Tecnologia e Digital', descricao: 'Digitalização, software, IA e cibersegurança para empresas.' },
    agricultura: { label: 'Agricultura e Florestas', descricao: 'PEPAC, agroalimentar, floresta e desenvolvimento rural.' },
    comercio: { label: 'Comércio e Retalho', descricao: 'Modernização do comércio, retalho e distribuição.' },
    energia: { label: 'Energia', descricao: 'Renováveis, eficiência energética e descarbonização.' },
    ambiente: { label: 'Ambiente e Sustentabilidade', descricao: 'Economia circular, água, resíduos e biodiversidade.' },
    saude: { label: 'Saúde', descricao: 'Clínicas, cuidados de saúde e inovação em saúde.' },
    formacao: { label: 'Formação e Qualificação', descricao: 'Capacitação, competências e qualificação de trabalhadores.' },
    construcao: { label: 'Construção e Reabilitação', descricao: 'Obras, reabilitação urbana e eficiência de edifícios.' },
    social: { label: 'Economia Social', descricao: 'IPSS, associações e projetos de inclusão.' },
    cultura: { label: 'Cultura e Indústrias Criativas', descricao: 'Património, audiovisual e setores criativos.' },
};

export const SETORES: SetorHub[] = GRUPOS_SETOR.map((g) => ({
    slug: g.chave,
    label: META[g.chave]?.label ?? g.chave,
    descricao: META[g.chave]?.descricao ?? '',
    termos: g.termos,
}));

export const REGIOES_HUB: { slug: string; label: string; nuts: string }[] = [
    { slug: 'norte', label: 'Norte', nuts: 'Norte' },
    { slug: 'centro', label: 'Centro', nuts: 'Centro' },
    { slug: 'lisboa', label: 'Lisboa', nuts: 'Lisboa' },
    { slug: 'alentejo', label: 'Alentejo', nuts: 'Alentejo' },
    { slug: 'algarve', label: 'Algarve', nuts: 'Algarve' },
    { slug: 'acores', label: 'Açores', nuts: 'Açores' },
    { slug: 'madeira', label: 'Madeira', nuts: 'Madeira' },
];

export const setorPorSlug = (slug: string) => SETORES.find((s) => s.slug === slug);
export const regiaoPorSlug = (slug: string) => REGIOES_HUB.find((r) => r.slug === slug);

const normalizar = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Um aviso pertence ao setor se o texto (nome+descrição+setoresElegiveis) contém um termo do grupo. */
export function avisoPertenceAoSetor(
    aviso: { nome: string; descricao?: string | null; setoresElegiveis?: string[] },
    setor: SetorHub,
): boolean {
    const texto = normalizar(`${aviso.nome} ${aviso.descricao ?? ''} ${(aviso.setoresElegiveis ?? []).join(' ')}`);
    return setor.termos.some((t) => t.length >= 3 && texto.includes(t));
}

/** Um aviso serve a região se for nacional/continental OU a NUTS2 bater. */
export function avisoServeRegiao(
    aviso: { regiaoNUTS2?: string | null; abrangenciaGeografica?: string | null; nutsCompativeis?: string[] },
    regiaoNuts: string,
): boolean {
    const abr = (aviso.abrangenciaGeografica ?? '').toUpperCase();
    if (abr === 'NACIONAL' || abr === 'CONTINENTAL' || abr === 'EUROPEU') {
        // continental exclui ilhas
        if (abr === 'CONTINENTAL' && (regiaoNuts === 'Açores' || regiaoNuts === 'Madeira')) return false;
        return true;
    }
    const alvo = normalizar(regiaoNuts);
    if (aviso.regiaoNUTS2 && normalizar(aviso.regiaoNUTS2).includes(alvo)) return true;
    if (aviso.nutsCompativeis?.some((n) => normalizar(n).includes(alvo))) return true;
    return false;
}
