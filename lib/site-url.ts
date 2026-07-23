/**
 * Fonte ÚNICA do URL canónico do site (fase B, fix DRY do eng review 23/07:
 * o sitemap tinha ficado com o domínio antigo por ter a sua própria cópia).
 * Consumido por: layout metadata, sitemap, robots, páginas públicas, JSON-LD.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://eligivo.aitipro.com';
