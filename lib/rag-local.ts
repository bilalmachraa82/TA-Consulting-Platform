import { dataProvider } from './db';

export interface LocalAvisoResult {
  id: string;
  titulo: string;
  descricao: string;
  fonte: string;
  portal: string;
  url?: string | null;
  data_fecho?: string | null;
  score: number;
}

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

export async function loadLocalAvisos() {
  const avisos = await dataProvider.avisos.findMany({
    where: { ativo: true },
  });

  return avisos.map((a: any) => ({
    id: a.id || a.codigo || String(Math.random()),
    titulo: a.nome || a.titulo || '',
    descricao: a.descrição || a.descricao || '',
    fonte: a.portal || a.fonte || 'LOCAL',
    portal: a.portal || a.fonte || 'LOCAL',
    url: a.link,
    data_fecho: a.dataFimSubmissao
      ? new Date(a.dataFimSubmissao).toISOString()
      : undefined,
  }));
}

export async function searchLocalAvisos(
  query: string,
  limit = 10,
  filters: { portal?: string } = {}
): Promise<LocalAvisoResult[]> {
  const all = await loadLocalAvisos();
  if (!query) return all.slice(0, limit).map(a => ({ ...a, score: 100 }));

  const queryTokens = normalizeText(query);
  const results: LocalAvisoResult[] = [];

  for (const aviso of all) {
    if (filters.portal && aviso.portal !== filters.portal) continue;

    const corpus = normalizeText(
      `${aviso.titulo} ${aviso.descricao} ${aviso.fonte}`.substring(0, 2000)
    );

    const matches = queryTokens.filter(t => corpus.includes(t));
    if (matches.length === 0) continue;

    const score = Math.min(100, Math.round((matches.length / queryTokens.length) * 100));

    results.push({
      ...aviso,
      score,
    });
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
