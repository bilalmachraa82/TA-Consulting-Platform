import fs from 'node:fs';
import path from 'node:path';

export interface ScrapedAvisoRecord {
  id?: string;
  titulo: string;
  descricao?: string;
  fonte?: string;
  data_abertura: string;
  data_fecho: string;
  montante_total?: string;
  montante_min?: string;
  montante_max?: string;
  taxa_apoio?: string;
  regiao?: string;
  setor?: string;
  url?: string;
  status?: string;
  tipo_beneficiario?: string;
  elegibilidade?: string;
  documentos_necessarios?: string[];
  keywords?: string[];
}

export interface NormalizedAvisoInput {
  nome: string;
  portal: 'PORTUGAL2030' | 'PAPAC' | 'PRR';
  programa: string;
  linha: string | null;
  codigo: string;
  dataInicioSubmissao: Date;
  dataFimSubmissao: Date;
  montanteMinimo: number | null;
  montanteMaximo: number | null;
  descrição: string | null;
  link: string | null;
  taxa: string | null;
  regiao: string | null;
  setoresElegiveis: string[];
  dimensaoEmpresa: string[];
  urgente: boolean;
  ativo: boolean;
}

interface NormalizeOptions {
  now?: Date;
  refreshExpiredOpenDates?: boolean;
}

interface LoadOptions extends NormalizeOptions {
  dataDir?: string;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function parseNumber(value?: string): number | null {
  if (!value) return null;

  // Strip currency symbols and whitespace, then handle European format:
  // "50.000,00" → remove thousand-separator dots → "50000,00" → replace comma → "50000.00"
  const stripped = value.replace(/[^\d,.-]/g, '');

  // Detect European format: dots as thousands, comma as decimal (e.g. "50.000,00")
  const hasCommaDecimal = /\d\.\d{3}(,|$)/.test(stripped) || /,\d{1,2}$/.test(stripped);

  const normalized = hasCommaDecimal
    ? stripped.replace(/\./g, '').replace(',', '.')
    : stripped.replace(/,/g, '');

  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizePortal(fonte?: string): 'PORTUGAL2030' | 'PAPAC' | 'PRR' {
  const normalized = (fonte || '').toUpperCase();

  if (normalized.includes('PORTUGAL')) return 'PORTUGAL2030';
  if (normalized.includes('PAPAC') || normalized.includes('PEPACC')) return 'PAPAC';
  if (normalized.includes('PRR')) return 'PRR';

  if (fonte) {
    console.warn(`[scraped-avisos] Portal desconhecido "${fonte}", default PORTUGAL2030`);
  }
  return 'PORTUGAL2030';
}

function normalizeEligibleCompanySizes(tipoBeneficiario?: string): string[] {
  const normalized = (tipoBeneficiario || '').toLowerCase();

  if (normalized.includes('pme')) return ['MICRO', 'PEQUENA', 'MEDIA'];
  if (normalized.includes('micro')) return ['MICRO'];
  if (normalized.includes('pequena')) return ['PEQUENA'];
  if (normalized.includes('média') || normalized.includes('media')) return ['MEDIA'];
  if (normalized.includes('grande')) return ['GRANDE'];
  if (normalized.includes('empresa')) return ['MICRO', 'PEQUENA', 'MEDIA', 'GRANDE'];

  return [];
}

function refreshFixtureDatesIfNeeded(
  start: Date,
  end: Date,
  status: string | undefined,
  now: Date,
  refreshExpiredOpenDates: boolean
) {
  if (!refreshExpiredOpenDates) return { start, end };

  const isOpen = (status || '').toLowerCase().includes('aberto');
  if (!isOpen || end >= now) return { start, end };

  const originalDurationDays = Math.max(
    30,
    Math.min(120, Math.round((end.getTime() - start.getTime()) / MS_PER_DAY))
  );

  const refreshedStart = new Date(now);
  refreshedStart.setDate(refreshedStart.getDate() - 7);

  const refreshedEnd = new Date(now);
  refreshedEnd.setDate(refreshedEnd.getDate() + Math.max(45, originalDurationDays));

  console.warn(
    `[scraped-avisos] Datas expiradas reescritas para aviso com status "${status}": ` +
    `${start.toISOString().slice(0, 10)}..${end.toISOString().slice(0, 10)} → ` +
    `${refreshedStart.toISOString().slice(0, 10)}..${refreshedEnd.toISOString().slice(0, 10)}`
  );

  return { start: refreshedStart, end: refreshedEnd };
}

function derivePrograma(record: ScrapedAvisoRecord): string {
  // Prefer fonte (e.g. "Portugal 2030") as programa name; setor is semantically different
  return record.fonte?.trim() || record.setor?.trim() || 'Programa Geral';
}

export function normalizeScrapedAviso(
  record: ScrapedAvisoRecord,
  options: NormalizeOptions = {}
): NormalizedAvisoInput {
  const now = options.now ?? new Date();
  const rawStart = new Date(record.data_abertura);
  const rawEnd = new Date(record.data_fecho);

  if (Number.isNaN(rawStart.getTime()) || Number.isNaN(rawEnd.getTime())) {
    throw new Error(`Datas inválidas no aviso ${record.id || record.titulo}`);
  }

  const { start, end } = refreshFixtureDatesIfNeeded(
    rawStart,
    rawEnd,
    record.status,
    now,
    options.refreshExpiredOpenDates ?? false
  );

  const daysRemaining = Math.ceil((end.getTime() - now.getTime()) / MS_PER_DAY);
  const isActive = (record.status || '').toLowerCase().includes('aberto') && daysRemaining >= 0;
  const eligibleSizes = normalizeEligibleCompanySizes(record.tipo_beneficiario);

  return {
    nome: record.titulo.trim(),
    portal: normalizePortal(record.fonte),
    programa: derivePrograma(record),
    linha: record.tipo_beneficiario?.trim() || null,
    codigo: record.id?.trim() || `${normalizePortal(record.fonte)}-${record.titulo.trim()}`,
    dataInicioSubmissao: start,
    dataFimSubmissao: end,
    montanteMinimo: parseNumber(record.montante_min),
    montanteMaximo: parseNumber(record.montante_max),
    descrição: record.descricao?.trim() || null,
    link: record.url?.trim() || null,
    taxa: record.taxa_apoio ? `${record.taxa_apoio}%` : null,
    regiao: record.regiao?.trim() || null,
    setoresElegiveis: record.setor ? [record.setor.trim()] : [],
    dimensaoEmpresa: eligibleSizes,
    urgente: daysRemaining >= 0 && daysRemaining <= 14,
    ativo: isActive,
  };
}

export function loadScrapedAvisos(options: LoadOptions = {}): NormalizedAvisoInput[] {
  const dataDir = path.resolve(
    process.cwd(),
    options.dataDir || path.join('data', 'scraped')
  );

  const files = [
    'portugal2030_avisos.json',
    'papac_avisos.json',
    'prr_avisos.json',
  ];

  return files.flatMap((fileName) => {
    const fullPath = path.join(dataDir, fileName);

    if (!fs.existsSync(fullPath)) {
      console.warn(`[scraped-avisos] Ficheiro não encontrado, ignorado: ${fullPath}`);
      return [];
    }

    const content = fs.readFileSync(fullPath, 'utf-8');
    const records = JSON.parse(content) as ScrapedAvisoRecord[];

    return records.map((record) =>
      normalizeScrapedAviso(record, {
        now: options.now,
        refreshExpiredOpenDates: options.refreshExpiredOpenDates,
      })
    );
  });
}
