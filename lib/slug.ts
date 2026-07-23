/**
 * Slugs SEO das páginas públicas de avisos (fase B).
 *
 * Regras:
 * - derivado de nome + código (keywords no URL = o ativo SEO);
 * - códigos têm caracteres hostis (ex.: "PT2030_I&D_2024") → sanitização total;
 * - IMUTÁVEL após criação: se o scraper reescrever o nome, o slug NÃO muda
 *   (URLs indexados são para sempre — política do eng review 2026-07-23);
 * - unicidade garantida no backfill/criação com sufixo determinístico -2, -3…
 */

/** Sanitiza texto para segmento de URL: minúsculas, sem acentos, hífens. */
export function slugify(texto: string): string {
    return texto
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '') // acentos
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')     // tudo o resto → hífen (inclui & _ /)
        .replace(/^-+|-+$/g, '')         // trim de hífens
        .replace(/-{2,}/g, '-');
}

/** Corta no limite SEM partir palavras (corta no último hífen antes do limite). */
function truncarEmPalavra(slug: string, max: number): string {
    if (slug.length <= max) return slug;
    const corte = slug.slice(0, max + 1).lastIndexOf('-');
    return corte > 0 ? slug.slice(0, corte) : slug.slice(0, max);
}

/**
 * Gera o slug base de um aviso: nome (até ~60 chars) + código sanitizado.
 * Fallbacks: sem nome → só código; sem ambos → null (o chamador decide).
 */
export function gerarSlugAviso(nome?: string | null, codigo?: string | null): string | null {
    const nomeSlug = truncarEmPalavra(slugify(nome ?? ''), 60);
    const codigoSlug = truncarEmPalavra(slugify(codigo ?? ''), 40);
    if (nomeSlug && codigoSlug) {
        // evita duplicar quando o nome já contém o código (acontece nos HORIZON-*)
        return nomeSlug.includes(codigoSlug) ? nomeSlug : `${nomeSlug}-${codigoSlug}`;
    }
    return nomeSlug || codigoSlug || null;
}

/** Resolve colisões contra um conjunto de slugs já usados (sufixo -2, -3…). */
export function slugUnico(base: string, usados: Set<string>): string {
    if (!usados.has(base)) return base;
    for (let n = 2; ; n++) {
        const candidato = `${base}-${n}`;
        if (!usados.has(candidato)) return candidato;
    }
}
