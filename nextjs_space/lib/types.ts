// ========== Prisma Enums ==========
export enum Portal {
  PORTUGAL2030 = 'PORTUGAL2030',
  PEPAC = 'PEPAC',
  PRR = 'PRR'
}

export enum DimensaoEmpresa {
  MICRO = 'MICRO',
  PEQUENA = 'PEQUENA',
  MEDIA = 'MEDIA',
  GRANDE = 'GRANDE'
}

export enum EstadoCandidatura {
  A_PREPARAR = 'A_PREPARAR',
  SUBMETIDA = 'SUBMETIDA',
  EM_ANALISE = 'EM_ANALISE',
  APROVADA = 'APROVADA',
  REJEITADA = 'REJEITADA',
  CANCELADA = 'CANCELADA'
}

export enum TipoDocumento {
  CERTIDAO_AT = 'CERTIDAO_AT',
  CERTIDAO_SS = 'CERTIDAO_SS',
  CERTIFICADO_PME = 'CERTIFICADO_PME',
  LICENCA_ATIVIDADE = 'LICENCA_ATIVIDADE',
  BALANCO = 'BALANCO',
  DEMONSTRACOES_FINANCEIRAS = 'DEMONSTRACOES_FINANCEIRAS',
  OUTRO = 'OUTRO'
}

export enum StatusValidade {
  VALIDO = 'VALIDO',
  A_EXPIRAR = 'A_EXPIRAR',
  EXPIRADO = 'EXPIRADO',
  EM_FALTA = 'EM_FALTA'
}

export enum TipoWorkflow {
  SCRAPING_PORTUGAL2030 = 'SCRAPING_PORTUGAL2030',
  SCRAPING_PEPAC = 'SCRAPING_PEPAC',
  SCRAPING_PRR = 'SCRAPING_PRR',
  NOTIFICACAO_EMAIL = 'NOTIFICACAO_EMAIL',
  VALIDACAO_DOCUMENTOS = 'VALIDACAO_DOCUMENTOS',
  RELATORIO_MENSAL = 'RELATORIO_MENSAL'
}

export enum TipoNotificacao {
  AVISO_URGENTE = 'AVISO_URGENTE',
  DOCUMENTO_EXPIRA = 'DOCUMENTO_EXPIRA',
  CANDIDATURA_UPDATE = 'CANDIDATURA_UPDATE',
  RELATORIO_MENSAL = 'RELATORIO_MENSAL',
  SISTEMA = 'SISTEMA'
}

// ========== Prisma Models ==========
export interface Aviso {
  id: string
  nome: string
  portal: Portal
  programa: string
  linha?: string | null
  codigo: string
  dataInicioSubmissao: Date
  dataFimSubmissao: Date
  montanteMinimo?: number | null
  montanteMaximo?: number | null
  descrição?: string | null
  link?: string | null
  taxa?: string | null
  regiao?: string | null
  setoresElegiveis: string[]
  dimensaoEmpresa: string[]
  urgente: boolean
  ativo: boolean
  candidaturas?: Candidatura[]
  createdAt: Date
  updatedAt: Date
}

export interface Empresa {
  id: string
  nipc: string
  nome: string
  cae: string
  setor: string
  dimensao: DimensaoEmpresa
  email: string
  telefone?: string | null
  morada?: string | null
  localidade?: string | null
  codigoPostal?: string | null
  distrito?: string | null
  regiao?: string | null
  contactoNome?: string | null
  contactoEmail?: string | null
  contactoTelefone?: string | null
  notas?: string | null
  ativa: boolean
  candidaturas?: Candidatura[]
  documentos?: Documento[]
  createdAt: Date
  updatedAt: Date
}

export interface Candidatura {
  id: string
  empresaId: string
  avisoId: string
  estado: EstadoCandidatura
  montanteSolicitado?: number | null
  montanteAprovado?: number | null
  dataSubmissao?: Date | null
  dataDecisao?: Date | null
  observacoes?: string | null
  documentosAnexos: string[]
  timeline: TimelineEvent[]
  empresa?: Empresa
  aviso?: Aviso
  createdAt: Date
  updatedAt: Date
}

export interface TimelineEvent {
  data: string
  evento: string
  detalhes?: string
}

export interface Documento {
  id: string
  empresaId: string
  tipoDocumento: TipoDocumento
  nome: string
  cloudStoragePath: string
  dataEmissao?: Date | null
  dataValidade?: Date | null
  statusValidade: StatusValidade
  observacoes?: string | null
  empresa?: Empresa
  createdAt: Date
  updatedAt: Date
}

export interface Workflow {
  id: string
  nome: string
  tipo: TipoWorkflow
  ativo: boolean
  frequencia: string
  ultimaExecucao?: Date | null
  proximaExecucao?: Date | null
  parametros?: Record<string, unknown> | null
  logs?: WorkflowLog[]
  createdAt: Date
  updatedAt: Date
}

export interface WorkflowLog {
  id: string
  workflowId: string
  dataExecucao: Date
  sucesso: boolean
  mensagem?: string | null
  dados?: Record<string, unknown> | null
  workflow?: Workflow
  createdAt: Date
}

export interface Notificacao {
  id: string
  tipo: TipoNotificacao
  destinatario: string
  assunto: string
  conteudo: string
  enviado: boolean
  dataEnvio?: Date | null
  erro?: string | null
  contexto?: Record<string, unknown> | null
  createdAt: Date
}

// ========== Legacy Types ==========
export type Expense = {
  id: string
  amount: number
  category: string
  description: string
  date: Date
}

export type ExpenseFormData = Omit<Expense, 'id' | 'date'> & {
  date: string
}

export const EXPENSE_CATEGORIES = [
  'Food',
  'Transportation',
  'Housing',
  'Utilities',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Education',
  'Other'
] as const

export type DateRange = {
  from: Date | undefined
  to: Date | undefined
}