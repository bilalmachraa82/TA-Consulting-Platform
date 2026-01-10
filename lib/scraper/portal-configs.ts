import { ScrapeOptions } from 'firecrawl';

export interface PortalConfig {
    id: string;
    name: string;
    baseUrl: string;
    avisoUrls: string[];
    programaDefault: string;
    linhaDefault: string;
    prompt: string;
    actions?: ScrapeOptions['actions'];
    waitFor?: number;
}

export const PORTAL_CONFIGS: Record<string, PortalConfig> = {
    'portugal2030': {
        id: 'portugal2030',
        name: 'Portugal 2030',
        baseUrl: 'https://portugal2030.pt',
        avisoUrls: [
            'https://portugal2030.pt/avisos/',
            'https://portugal2030.pt/avisos-abertos/'
        ],
        programaDefault: 'Portugal 2030',
        linhaDefault: 'Geral',
        prompt: [
            'Extrai todos os avisos/concursos visíveis na página de avisos do Portugal 2030.',
            'Devolve sempre JSON no formato { avisos: [...] } onde cada item segue o schema.',
            'Inclui título, descrição curta, datas de abertura/fecho (YYYY-MM-DD), programa, código/id se existir, links absolutos.',
            'Identifica pdf_url e anexos (nome,url) com qualquer link .pdf visível.',
            'Ignora banners e blocos de navegação; só regista entradas de aviso efetivas.'
        ].join(' ')
    },
    'prr': {
        id: 'prr',
        name: 'PRR - Recuperar Portugal',
        baseUrl: 'https://recuperarportugal.gov.pt',
        avisoUrls: [
            'https://recuperarportugal.gov.pt/candidaturas-prr/',
            'https://recuperarportugal.gov.pt/',
            'https://www.fundoambiental.pt/apoios/candidaturas-abertas.aspx',
            'https://www.iapmei.pt/PRODUTOS-E-SERVICOS/Incentivos-Financiamento/Programas-de-Incentivos.aspx'
        ],
        programaDefault: 'PRR',
        linhaDefault: 'Geral',
        prompt: [
            'Extrai a tabela/listagem de candidaturas PRR (componentes) visíveis nesta página.',
            'Cada entrada deve ter titulo (nome do aviso), descricao se existir, datas (abertura/fecho) quando mostradas, componente/linha, e links absolutos para detalhe/PDF.',
            'Inclui pdf_url e anexos para todos os links .pdf exibidos.',
            'Retorna sempre JSON { avisos: [...] } mesmo que vazio.'
        ].join(' '),
        actions: [
            { type: 'scroll', direction: 'down' },
            { type: 'scroll', direction: 'down' },
            { type: 'scroll', direction: 'down' }
        ],
        waitFor: 18000
    },
    'pepac': {
        id: 'pepac',
        name: 'PEPAC / IFAP',
        baseUrl: 'https://www.ifap.pt',
        avisoUrls: [
            'https://www.ifap.pt/portal/noticias',
            'https://www.ifap.pt/portal/avisos-abertos' // URL corrigido
        ],
        programaDefault: 'PEPAC',
        linhaDefault: 'Agricultura',
        prompt: [
            'Analisa a listagem de notícias do IFAP e devolve apenas itens que sejam avisos/aberturas de candidaturas.',
            'Filtra por palavras-chave candidaturas/aviso/concurso/apoio.',
            'Para cada item devolve titulo, descricao curta, data_abertura/fecho se existirem no texto, url absoluto, e pdf_url/anexos para links .pdf.',
            'Retorna JSON { avisos: [...] }'
        ].join(' '),
        actions: [
            { type: 'scroll', direction: 'down' },
            { type: 'scroll', direction: 'down' }
        ],
        waitFor: 15000
    },
    'europa-criativa': {
        id: 'europa-criativa',
        name: 'Europa Criativa',
        baseUrl: 'https://www.europacriativa.eu',
        avisoUrls: ['https://www.europacriativa.eu/concursos'],
        programaDefault: 'Europa Criativa',
        linhaDefault: 'Cultura',
        prompt: [
            'Extrai todos os concursos listados na página de concursos do Europa Criativa.',
            'Cada item deve incluir titulo, descricao curta, data_fecho/deadline, url absoluto e qualquer pdf_url/anexo.',
            'Retorna JSON { avisos: [...] }.'
        ].join(' '),
        waitFor: 12000
    },
    'ipdj': {
        id: 'ipdj',
        name: 'IPDJ',
        baseUrl: 'https://ipdj.gov.pt',
        avisoUrls: [
            'https://ipdj.gov.pt/programas', // URL corrigido
            'https://ipdj.gov.pt/apoio-e-financiamento'
        ],
        programaDefault: 'IPDJ',
        linhaDefault: 'Juventude',
        prompt: [
            'Extrai apoios/programas abertos visíveis na página do IPDJ (apoios/programas).',
            'Inclui titulo, descricao curta, datas se existirem, url absoluto e links .pdf como pdf_url/anexos.',
            'Retorna JSON { avisos: [...] }.'
        ].join(' '),
        actions: [
            { type: 'scroll', direction: 'down' },
            { type: 'scroll', direction: 'down' }
        ],
        waitFor: 12000
    }
};
