/**
 * Componente genérico de JSON-LD (fase B) — irmão do JsonLd fixo do layout.
 * Serializa QUALQUER objeto de structured data com "<" escapado (unicode), o
 * que torna impossível fechar a tag <script> a partir dos dados — XSS-safe por
 * construção mesmo com campos vindos de scraping (nomes/descrições de avisos).
 * Padrão idêntico ao components/seo/json-ld.tsx já em produção.
 */

/** Serializa JSON com "<" escapado — impede fecho prematuro da tag script. */
export function safeJsonLdString(data: object): string {
    return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function JsonLdScript({ data }: { data: object }) {
    return (
        <script
            type="application/ld+json"
            // conteúdo sanitizado por safeJsonLdString (escape unicode de "<")
            dangerouslySetInnerHTML={{ __html: safeJsonLdString(data) }}
        />
    );
}
