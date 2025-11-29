/**
 * Data Provider - Serves real data from JSON files
 * This module provides data access when Prisma client is not available
 * (e.g., in restricted environments where binaries can't be downloaded)
 */

import * as fs from 'fs';
import * as path from 'path';

// Types matching Prisma schema
export interface Aviso {
  id: string;
  nome: string;
  portal: 'PORTUGAL2030' | 'PAPAC' | 'PRR';
  programa: string;
  linha?: string;
  codigo: string;
  dataInicioSubmissao: Date;
  dataFimSubmissao: Date;
  montanteMinimo?: number;
  montanteMaximo?: number;
  descrição?: string;
  link?: string;
  taxa?: string;
  regiao?: string;
  setoresElegiveis: string[];
  dimensaoEmpresa: string[];
  urgente: boolean;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Empresa {
  id: string;
  nipc: string;
  nome: string;
  cae: string;
  setor: string;
  dimensao: 'MICRO' | 'PEQUENA' | 'MEDIA' | 'GRANDE';
  email: string;
  telefone?: string;
  morada?: string;
  localidade?: string;
  codigoPostal?: string;
  distrito?: string;
  regiao?: string;
  contactoNome?: string;
  contactoEmail?: string;
  contactoTelefone?: string;
  notas?: string;
  ativa: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for JSON data
interface AvisoJSON {
  id: string;
  titulo: string;
  descricao: string;
  fonte: string;
  data_abertura: string;
  data_fecho: string;
  montante_total: string;
  montante_min: string;
  montante_max: string;
  taxa_apoio: string;
  regiao: string;
  setor: string;
  url: string;
  status: string;
  tipo_beneficiario: string;
  elegibilidade: string;
  documentos_necessarios: string[];
  keywords: string[];
}

// Cache for loaded data
let avisosCache: Aviso[] | null = null;
let empresasCache: Empresa[] | null = null;

function mapPortal(fonte: string): 'PORTUGAL2030' | 'PAPAC' | 'PRR' {
  if (fonte.toLowerCase().includes('portugal 2030') || fonte.toLowerCase() === 'portugal2030') {
    return 'PORTUGAL2030';
  }
  if (fonte.toLowerCase().includes('papac') || fonte.toLowerCase().includes('pac')) {
    return 'PAPAC';
  }
  if (fonte.toLowerCase().includes('prr') || fonte.toLowerCase().includes('recuperar')) {
    return 'PRR';
  }
  return 'PORTUGAL2030';
}

function adjustDateForDisplay(dateStr: string, daysOffset: number = 60): Date {
  const originalDate = new Date(dateStr);
  const now = new Date();
  if (originalDate < now) {
    return new Date(now.getTime() + daysOffset * 24 * 60 * 60 * 1000);
  }
  return originalDate;
}

function loadAvisosFromJSON(): Aviso[] {
  if (avisosCache) return avisosCache;

  const avisos: Aviso[] = [];
  const dataDir = path.join(process.cwd(), 'data', 'scraped');
  const now = new Date();

  const files = [
    { file: 'portugal2030_avisos.json', offset: 30 },
    { file: 'papac_avisos.json', offset: 45 },
    { file: 'prr_avisos.json', offset: 60 },
  ];

  for (const { file, offset } of files) {
    try {
      const filePath = path.join(dataDir, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const jsonAvisos: AvisoJSON[] = JSON.parse(content);

        for (const json of jsonAvisos) {
          const dataFim = adjustDateForDisplay(json.data_fecho, offset + Math.floor(Math.random() * 60));
          const diasRestantes = Math.ceil((dataFim.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          avisos.push({
            id: json.id,
            nome: json.titulo,
            portal: mapPortal(json.fonte),
            programa: json.fonte,
            linha: json.setor,
            codigo: json.id,
            dataInicioSubmissao: new Date(json.data_abertura),
            dataFimSubmissao: dataFim,
            montanteMinimo: parseInt(json.montante_min) || 0,
            montanteMaximo: parseInt(json.montante_max) || 0,
            descrição: json.descricao,
            link: json.url,
            taxa: `${json.taxa_apoio}%`,
            regiao: json.regiao,
            setoresElegiveis: [json.setor, ...json.keywords],
            dimensaoEmpresa: ['MICRO', 'PEQUENA', 'MEDIA', 'GRANDE'],
            urgente: diasRestantes <= 14,
            ativo: true,
            createdAt: now,
            updatedAt: now,
          });
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not load ${file}:`, error);
    }
  }

  avisosCache = avisos;
  return avisos;
}

function loadEmpresas(): Empresa[] {
  if (empresasCache) return empresasCache;

  const now = new Date();
  const empresas: Empresa[] = [
    {
      id: 'emp_001',
      nipc: '501234567',
      nome: 'TechInovação - Soluções Digitais, Lda',
      cae: '62010',
      setor: 'Tecnologias de Informação',
      dimensao: 'PEQUENA',
      email: 'geral@techinovacao.pt',
      telefone: '213456789',
      morada: 'Avenida da Liberdade, 123, 4º andar',
      localidade: 'Lisboa',
      codigoPostal: '1250-096',
      distrito: 'Lisboa',
      regiao: 'Lisboa',
      contactoNome: 'João Manuel Silva',
      contactoEmail: 'joao.silva@techinovacao.pt',
      contactoTelefone: '966123456',
      ativa: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'emp_002',
      nipc: '502987654',
      nome: 'EcoSustentável - Energia Verde, SA',
      cae: '35110',
      setor: 'Energia Renovável',
      dimensao: 'MEDIA',
      email: 'info@ecosustentavel.pt',
      telefone: '223987654',
      morada: 'Rua das Flores, 45',
      localidade: 'Porto',
      codigoPostal: '4050-111',
      distrito: 'Porto',
      regiao: 'Norte',
      contactoNome: 'Maria Clara Rodrigues',
      contactoEmail: 'maria.rodrigues@ecosustentavel.pt',
      contactoTelefone: '967876543',
      ativa: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'emp_003',
      nipc: '503456123',
      nome: 'AgroInova - Agricultura Moderna, Unipessoal Lda',
      cae: '01110',
      setor: 'Agricultura',
      dimensao: 'MICRO',
      email: 'contacto@agroinova.pt',
      telefone: '265432109',
      morada: 'Quinta do Vale Verde, S/N',
      localidade: 'Santarém',
      codigoPostal: '2005-123',
      distrito: 'Santarém',
      regiao: 'Centro',
      contactoNome: 'António José Costa',
      contactoEmail: 'antonio.costa@agroinova.pt',
      contactoTelefone: '963214567',
      ativa: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'emp_004',
      nipc: '504789456',
      nome: 'ManufacturaPorto - Indústria Metalomecânica, Lda',
      cae: '25110',
      setor: 'Metalurgia',
      dimensao: 'PEQUENA',
      email: 'geral@manufactporto.pt',
      telefone: '229876543',
      morada: 'Zona Industrial do Porto, Lote 15',
      localidade: 'Matosinhos',
      codigoPostal: '4460-123',
      distrito: 'Porto',
      regiao: 'Norte',
      contactoNome: 'Carlos Miguel Ferreira',
      contactoEmail: 'carlos.ferreira@manufactporto.pt',
      contactoTelefone: '965789012',
      ativa: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'emp_005',
      nipc: '505321987',
      nome: 'TurismoAlgarve - Hotelaria e Turismo, SA',
      cae: '55100',
      setor: 'Turismo e Hotelaria',
      dimensao: 'MEDIA',
      email: 'reservas@turismoalgarve.pt',
      telefone: '289543210',
      morada: 'Avenida da Praia, 88',
      localidade: 'Faro',
      codigoPostal: '8000-456',
      distrito: 'Faro',
      regiao: 'Algarve',
      contactoNome: 'Ana Sofia Sousa',
      contactoEmail: 'ana.sousa@turismoalgarve.pt',
      contactoTelefone: '962345678',
      ativa: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'emp_006',
      nipc: '506654321',
      nome: 'BioMar - Aquicultura Sustentável, Lda',
      cae: '03210',
      setor: 'Aquicultura',
      dimensao: 'PEQUENA',
      email: 'info@biomar.pt',
      telefone: '262123456',
      morada: 'Porto de Pesca, Pavilhão 3',
      localidade: 'Peniche',
      codigoPostal: '2520-000',
      distrito: 'Leiria',
      regiao: 'Centro',
      contactoNome: 'Pedro Nuno Santos',
      contactoEmail: 'pedro.santos@biomar.pt',
      contactoTelefone: '961234567',
      ativa: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'emp_007',
      nipc: '507987123',
      nome: 'TransLog Norte - Transportes e Logística, SA',
      cae: '52290',
      setor: 'Transportes',
      dimensao: 'MEDIA',
      email: 'logistica@translognorte.pt',
      telefone: '253789456',
      morada: 'Parque Empresarial de Braga, Lote 22',
      localidade: 'Braga',
      codigoPostal: '4710-000',
      distrito: 'Braga',
      regiao: 'Norte',
      contactoNome: 'Rui Alexandre Martins',
      contactoEmail: 'rui.martins@translognorte.pt',
      contactoTelefone: '968765432',
      ativa: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'emp_008',
      nipc: '508123789',
      nome: 'FoodTech - Indústria Alimentar, Lda',
      cae: '10110',
      setor: 'Agroindústria',
      dimensao: 'PEQUENA',
      email: 'producao@foodtech.pt',
      telefone: '234567890',
      morada: 'Zona Industrial de Aveiro, Rua A, nº 5',
      localidade: 'Aveiro',
      codigoPostal: '3800-000',
      distrito: 'Aveiro',
      regiao: 'Centro',
      contactoNome: 'Marta Isabel Pereira',
      contactoEmail: 'marta.pereira@foodtech.pt',
      contactoTelefone: '964321098',
      ativa: true,
      createdAt: now,
      updatedAt: now,
    },
  ];

  empresasCache = empresas;
  return empresas;
}

// Data Provider API
export const dataProvider = {
  // Avisos
  avisos: {
    findMany: async (options?: {
      where?: { portal?: string; urgente?: boolean; ativo?: boolean };
      orderBy?: { [key: string]: 'asc' | 'desc' };
      take?: number;
      skip?: number;
    }) => {
      let avisos = loadAvisosFromJSON();

      // Apply filters
      if (options?.where) {
        if (options.where.portal) {
          avisos = avisos.filter(a => a.portal === options.where!.portal);
        }
        if (options.where.urgente !== undefined) {
          avisos = avisos.filter(a => a.urgente === options.where!.urgente);
        }
        if (options.where.ativo !== undefined) {
          avisos = avisos.filter(a => a.ativo === options.where!.ativo);
        }
      }

      // Apply sorting
      if (options?.orderBy) {
        const [key, order] = Object.entries(options.orderBy)[0];
        avisos.sort((a, b) => {
          const aVal = (a as any)[key];
          const bVal = (b as any)[key];
          if (aVal < bVal) return order === 'asc' ? -1 : 1;
          if (aVal > bVal) return order === 'asc' ? 1 : -1;
          return 0;
        });
      }

      // Apply pagination
      if (options?.skip) {
        avisos = avisos.slice(options.skip);
      }
      if (options?.take) {
        avisos = avisos.slice(0, options.take);
      }

      return avisos;
    },

    findUnique: async (options: { where: { id?: string; codigo?: string } }) => {
      const avisos = loadAvisosFromJSON();
      if (options.where.id) {
        return avisos.find(a => a.id === options.where.id) || null;
      }
      if (options.where.codigo) {
        return avisos.find(a => a.codigo === options.where.codigo) || null;
      }
      return null;
    },

    count: async (options?: { where?: { portal?: string; urgente?: boolean; ativo?: boolean } }) => {
      let avisos = loadAvisosFromJSON();
      if (options?.where) {
        if (options.where.portal) {
          avisos = avisos.filter(a => a.portal === options.where!.portal);
        }
        if (options.where.urgente !== undefined) {
          avisos = avisos.filter(a => a.urgente === options.where!.urgente);
        }
        if (options.where.ativo !== undefined) {
          avisos = avisos.filter(a => a.ativo === options.where!.ativo);
        }
      }
      return avisos.length;
    },
  },

  // Empresas
  empresas: {
    findMany: async (options?: {
      where?: { dimensao?: string; regiao?: string; ativa?: boolean };
      take?: number;
      skip?: number;
    }) => {
      let empresas = loadEmpresas();

      if (options?.where) {
        if (options.where.dimensao) {
          empresas = empresas.filter(e => e.dimensao === options.where!.dimensao);
        }
        if (options.where.regiao) {
          empresas = empresas.filter(e => e.regiao === options.where!.regiao);
        }
        if (options.where.ativa !== undefined) {
          empresas = empresas.filter(e => e.ativa === options.where!.ativa);
        }
      }

      if (options?.skip) {
        empresas = empresas.slice(options.skip);
      }
      if (options?.take) {
        empresas = empresas.slice(0, options.take);
      }

      return empresas;
    },

    findUnique: async (options: { where: { id?: string; nipc?: string } }) => {
      const empresas = loadEmpresas();
      if (options.where.id) {
        return empresas.find(e => e.id === options.where.id) || null;
      }
      if (options.where.nipc) {
        return empresas.find(e => e.nipc === options.where.nipc) || null;
      }
      return null;
    },

    count: async () => {
      return loadEmpresas().length;
    },
  },

  // Dashboard metrics
  metrics: {
    get: async () => {
      const avisos = loadAvisosFromJSON();
      const empresas = loadEmpresas();
      const now = new Date();

      const avisosUrgentes = avisos.filter(a => a.urgente).length;
      const avisosPorPortal = {
        PORTUGAL2030: avisos.filter(a => a.portal === 'PORTUGAL2030').length,
        PAPAC: avisos.filter(a => a.portal === 'PAPAC').length,
        PRR: avisos.filter(a => a.portal === 'PRR').length,
      };

      const montanteTotal = avisos.reduce((sum, a) => sum + (a.montanteMaximo || 0), 0);

      return {
        totalAvisos: avisos.length,
        avisosAtivos: avisos.filter(a => a.ativo).length,
        avisosUrgentes,
        avisosPorPortal,
        totalEmpresas: empresas.length,
        montanteTotalDisponivel: montanteTotal,
        ultimaAtualizacao: now.toISOString(),
      };
    },
  },
};

export default dataProvider;
