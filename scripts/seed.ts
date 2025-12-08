import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

// Enums definidos localmente (compatíveis com Prisma)
const Portal = {
  PORTUGAL2030: 'PORTUGAL2030',
  PEPAC: 'PEPAC',
  PRR: 'PRR'
} as const;

const DimensaoEmpresa = {
  MICRO: 'MICRO',
  PEQUENA: 'PEQUENA',
  MEDIA: 'MEDIA',
  GRANDE: 'GRANDE'
} as const;

const EstadoCandidatura = {
  A_PREPARAR: 'A_PREPARAR',
  SUBMETIDA: 'SUBMETIDA',
  EM_ANALISE: 'EM_ANALISE',
  APROVADA: 'APROVADA',
  REJEITADA: 'REJEITADA',
  CANCELADA: 'CANCELADA'
} as const;

const TipoDocumento = {
  CERTIDAO_AT: 'CERTIDAO_AT',
  CERTIDAO_SS: 'CERTIDAO_SS',
  CERTIFICADO_PME: 'CERTIFICADO_PME',
  LICENCA_ATIVIDADE: 'LICENCA_ATIVIDADE',
  BALANCO: 'BALANCO',
  DEMONSTRACOES_FINANCEIRAS: 'DEMONSTRACOES_FINANCEIRAS',
  OUTRO: 'OUTRO'
} as const;

const StatusValidade = {
  VALIDO: 'VALIDO',
  A_EXPIRAR: 'A_EXPIRAR',
  EXPIRADO: 'EXPIRADO',
  EM_FALTA: 'EM_FALTA'
} as const;

const TipoWorkflow = {
  SCRAPING_PORTUGAL2030: 'SCRAPING_PORTUGAL2030',
  SCRAPING_PEPAC: 'SCRAPING_PEPAC',
  SCRAPING_PRR: 'SCRAPING_PRR',
  NOTIFICACAO_EMAIL: 'NOTIFICACAO_EMAIL',
  VALIDACAO_DOCUMENTOS: 'VALIDACAO_DOCUMENTOS',
  RELATORIO_MENSAL: 'RELATORIO_MENSAL'
} as const;

const TipoNotificacao = {
  AVISO_URGENTE: 'AVISO_URGENTE',
  DOCUMENTO_EXPIRA: 'DOCUMENTO_EXPIRA',
  CANDIDATURA_UPDATE: 'CANDIDATURA_UPDATE',
  RELATORIO_MENSAL: 'RELATORIO_MENSAL',
  SISTEMA: 'SISTEMA'
} as const;

const prisma = new PrismaClient();

// Interface para avisos dos JSON
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

// Função para carregar dados reais dos JSON files
function loadRealData(): { portugal2030: AvisoJSON[], pepac: AvisoJSON[], prr: AvisoJSON[] } {
  const dataDir = path.join(__dirname, '..', 'data', 'scraped');

  let portugal2030: AvisoJSON[] = [];
  let pepac: AvisoJSON[] = [];
  let prr: AvisoJSON[] = [];

  try {
    const pt2030Path = path.join(dataDir, 'portugal2030_avisos.json');
    if (fs.existsSync(pt2030Path)) {
      const content = fs.readFileSync(pt2030Path, 'utf-8');
      portugal2030 = JSON.parse(content);
      console.log(`📁 Loaded ${portugal2030.length} avisos from portugal2030_avisos.json`);
    }
  } catch (error) {
    console.warn('⚠️ Could not load portugal2030_avisos.json:', error);
  }

  try {
    const pepacPath = path.join(dataDir, 'pepac_avisos.json');
    if (fs.existsSync(pepacPath)) {
      const content = fs.readFileSync(pepacPath, 'utf-8');
      pepac = JSON.parse(content);
      console.log(`📁 Loaded ${pepac.length} avisos from pepac_avisos.json`);
    }
  } catch (error) {
    console.warn('⚠️ Could not load pepac_avisos.json:', error);
  }

  try {
    const prrPath = path.join(dataDir, 'prr_avisos.json');
    if (fs.existsSync(prrPath)) {
      const content = fs.readFileSync(prrPath, 'utf-8');
      prr = JSON.parse(content);
      console.log(`📁 Loaded ${prr.length} avisos from prr_avisos.json`);
    }
  } catch (error) {
    console.warn('⚠️ Could not load prr_avisos.json:', error);
  }

  return { portugal2030, pepac, prr };
}

// Função para ajustar datas para serem relevantes (não expiradas)
function adjustDateForSeed(dateStr: string, daysOffset: number = 60): Date {
  const originalDate = new Date(dateStr);
  const now = new Date();

  // Se a data já passou, adiciona dias a partir de hoje
  if (originalDate < now) {
    const futureDate = new Date(now.getTime() + daysOffset * 24 * 60 * 60 * 1000);
    return futureDate;
  }
  return originalDate;
}

// Mapear portal do JSON para o enum
function mapPortal(fonte: string): string {
  if (fonte.toLowerCase().includes('portugal 2030') || fonte.toLowerCase() === 'portugal2030') {
    return Portal.PORTUGAL2030;
  }
  if (fonte.toLowerCase().includes('pepac') || fonte.toLowerCase().includes('pac')) {
    return Portal.PEPAC;
  }
  if (fonte.toLowerCase().includes('prr') || fonte.toLowerCase().includes('recuperar')) {
    return Portal.PRR;
  }
  return Portal.PORTUGAL2030;
}

async function main() {
  console.log('🌱 Seeding database with REAL data...');
  console.log('═'.repeat(50));

  // Load real data from JSON files
  const realData = loadRealData();
  const now = new Date();

  // ═══════════════════════════════════════════════════════════════════
  // USERS - Create admin and normal users
  // ═══════════════════════════════════════════════════════════════════
  console.log('\n👤 Creating users...');

  const adminUser = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      password: await bcrypt.hash('johndoe123', 12),
      name: 'Admin TA',
      role: 'admin',
    },
  });

  const normalUser = await prisma.user.upsert({
    where: { email: 'utilizador@taconsulting.pt' },
    update: {},
    create: {
      email: 'utilizador@taconsulting.pt',
      password: await bcrypt.hash('123456', 12),
      name: 'Utilizador TA',
      role: 'user',
    },
  });

  console.log(`   ✓ Admin: john@doe.com`);
  console.log(`   ✓ User: utilizador@taconsulting.pt`);

  // ═══════════════════════════════════════════════════════════════════
  // EMPRESAS - Portuguese companies (realistic data)
  // ═══════════════════════════════════════════════════════════════════
  console.log('\n🏢 Creating Portuguese companies...');

  const empresasData = [
    {
      nipc: '501234567',
      nome: 'TechInovação - Soluções Digitais, Lda',
      cae: '62010',
      setor: 'Tecnologias de Informação',
      dimensao: DimensaoEmpresa.PEQUENA,
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
    },
    {
      nipc: '502987654',
      nome: 'EcoSustentável - Energia Verde, SA',
      cae: '35110',
      setor: 'Energia Renovável',
      dimensao: DimensaoEmpresa.MEDIA,
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
    },
    {
      nipc: '503456123',
      nome: 'AgroInova - Agricultura Moderna, Unipessoal Lda',
      cae: '01110',
      setor: 'Agricultura',
      dimensao: DimensaoEmpresa.MICRO,
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
    },
    {
      nipc: '504789456',
      nome: 'ManufacturaPorto - Indústria Metalomecânica, Lda',
      cae: '25110',
      setor: 'Metalurgia',
      dimensao: DimensaoEmpresa.PEQUENA,
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
    },
    {
      nipc: '505321987',
      nome: 'TurismoAlgarve - Hotelaria e Turismo, SA',
      cae: '55100',
      setor: 'Turismo e Hotelaria',
      dimensao: DimensaoEmpresa.MEDIA,
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
    },
    {
      nipc: '506654321',
      nome: 'BioMar - Aquicultura Sustentável, Lda',
      cae: '03210',
      setor: 'Aquicultura',
      dimensao: DimensaoEmpresa.PEQUENA,
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
    },
    {
      nipc: '507987123',
      nome: 'TransLog Norte - Transportes e Logística, SA',
      cae: '52290',
      setor: 'Transportes',
      dimensao: DimensaoEmpresa.MEDIA,
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
    },
    {
      nipc: '508123789',
      nome: 'FoodTech - Indústria Alimentar, Lda',
      cae: '10110',
      setor: 'Agroindústria',
      dimensao: DimensaoEmpresa.PEQUENA,
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
    },
  ];

  const empresas = await Promise.all(
    empresasData.map(empresa =>
      prisma.empresa.upsert({
        where: { nipc: empresa.nipc },
        update: empresa,
        create: empresa,
      })
    )
  );

  console.log(`   ✓ Created ${empresas.length} companies`);

  // ═══════════════════════════════════════════════════════════════════
  // AVISOS - Load real funding opportunities from JSON files
  // ═══════════════════════════════════════════════════════════════════
  console.log('\n📋 Creating funding opportunities (avisos)...');

  // Convert JSON avisos to database format
  const allJsonAvisos = [
    ...realData.portugal2030,
    ...realData.pepac,
    ...realData.prr
  ];

  const createdAvisos = [];

  for (const avisoJson of allJsonAvisos) {
    const portal = mapPortal(avisoJson.fonte);

    // Adjust dates to be future-relevant
    const dataInicio = new Date(avisoJson.data_abertura);
    const dataFim = adjustDateForSeed(avisoJson.data_fecho, Math.floor(Math.random() * 90) + 30);

    // Determine if urgent (less than 14 days to deadline)
    const diasRestantes = Math.ceil((dataFim.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const urgente = diasRestantes <= 14;

    const aviso = await prisma.aviso.upsert({
      where: { codigo: avisoJson.id },
      update: {
        nome: avisoJson.titulo,
        descrição: avisoJson.descricao,
        portal: portal,
        dataInicioSubmissao: dataInicio,
        dataFimSubmissao: dataFim,
        montanteMinimo: parseInt(avisoJson.montante_min) || 0,
        montanteMaximo: parseInt(avisoJson.montante_max) || 0,
        taxa: `${avisoJson.taxa_apoio}%`,
        regiao: avisoJson.regiao,
        link: avisoJson.url,
        setoresElegiveis: [avisoJson.setor, ...avisoJson.keywords],
        urgente: urgente,
        ativo: true,
      },
      create: {
        codigo: avisoJson.id,
        nome: avisoJson.titulo,
        descrição: avisoJson.descricao,
        portal: portal,
        programa: avisoJson.fonte,
        linha: avisoJson.setor,
        dataInicioSubmissao: dataInicio,
        dataFimSubmissao: dataFim,
        montanteMinimo: parseInt(avisoJson.montante_min) || 0,
        montanteMaximo: parseInt(avisoJson.montante_max) || 0,
        taxa: `${avisoJson.taxa_apoio}%`,
        regiao: avisoJson.regiao,
        link: avisoJson.url,
        setoresElegiveis: [avisoJson.setor, ...avisoJson.keywords],
        dimensaoEmpresa: ['MICRO', 'PEQUENA', 'MEDIA', 'GRANDE'],
        urgente: urgente,
        ativo: true,
      },
    });

    createdAvisos.push(aviso);
    console.log(`   ✓ ${portal}: ${avisoJson.titulo.substring(0, 50)}...`);
  }

  console.log(`   ✓ Total avisos created: ${createdAvisos.length}`);

  // ═══════════════════════════════════════════════════════════════════
  // CANDIDATURAS - Create sample applications
  // ═══════════════════════════════════════════════════════════════════
  console.log('\n📝 Creating applications (candidaturas)...');

  const candidaturas = [];

  // TechInovação -> Digitalização PME (if exists)
  const avisoDigital = createdAvisos.find(a => a.codigo === 'PT2030_001');
  if (avisoDigital) {
    const cand1 = await prisma.candidatura.create({
      data: {
        empresaId: empresas[0].id,
        avisoId: avisoDigital.id,
        estado: EstadoCandidatura.EM_ANALISE,
        montanteSolicitado: 350000,
        dataSubmissao: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        observacoes: 'Projeto de transformação digital com foco em e-commerce e cloud computing',
        documentosAnexos: ['formulario_candidatura.pdf', 'plano_investimento.pdf', 'orcamentos_detalhados.pdf'],
        timeline: [
          { data: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(), evento: 'Candidatura iniciada', detalhes: 'Início da preparação' },
          { data: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(), evento: 'Candidatura submetida', detalhes: 'Enviada via Portugal 2030' },
        ],
      },
    });
    candidaturas.push(cand1);
  }

  // EcoSustentável -> Eficiência Energética (if exists)
  const avisoEnergia = createdAvisos.find(a => a.codigo === 'PT2030_002');
  if (avisoEnergia) {
    const cand2 = await prisma.candidatura.create({
      data: {
        empresaId: empresas[1].id,
        avisoId: avisoEnergia.id,
        estado: EstadoCandidatura.APROVADA,
        montanteSolicitado: 1500000,
        montanteAprovado: 1200000,
        dataSubmissao: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
        dataDecisao: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        observacoes: 'Aprovada com redução de 20% - projeto de painéis solares industriais',
        documentosAnexos: ['candidatura_completa.pdf', 'auditoria_energetica.pdf', 'licenca_ambiental.pdf'],
        timeline: [
          { data: new Date(now.getTime() - 50 * 24 * 60 * 60 * 1000).toISOString(), evento: 'Candidatura iniciada', detalhes: 'Preparação de documentos' },
          { data: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString(), evento: 'Candidatura submetida', detalhes: 'Enviada via Portugal 2030' },
          { data: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(), evento: 'Em análise', detalhes: 'Análise técnica iniciada' },
          { data: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), evento: 'Aprovada', detalhes: 'Aprovada com ajuste de montante' },
        ],
      },
    });
    candidaturas.push(cand2);
  }

  // AgroInova -> Agricultura (if exists)
  const avisoAgri = createdAvisos.find(a => a.codigo === 'PEPAC_001');
  if (avisoAgri) {
    const cand3 = await prisma.candidatura.create({
      data: {
        empresaId: empresas[2].id,
        avisoId: avisoAgri.id,
        estado: EstadoCandidatura.A_PREPARAR,
        montanteSolicitado: 750000,
        observacoes: 'Em preparação - modernização de equipamentos agrícolas',
        documentosAnexos: [],
        timeline: [
          { data: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), evento: 'Candidatura iniciada', detalhes: 'Aviso identificado como elegível' },
        ],
      },
    });
    candidaturas.push(cand3);
  }

  // TurismoAlgarve -> Inovação (if exists)
  const avisoTurismo = createdAvisos.find(a => a.codigo === 'PT2030_005');
  if (avisoTurismo) {
    const cand4 = await prisma.candidatura.create({
      data: {
        empresaId: empresas[4].id,
        avisoId: avisoTurismo.id,
        estado: EstadoCandidatura.SUBMETIDA,
        montanteSolicitado: 500000,
        dataSubmissao: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        observacoes: 'Projeto de internacionalização - expansão para mercado espanhol',
        documentosAnexos: ['plano_internacionalizacao.pdf', 'estudos_mercado.pdf'],
        timeline: [
          { data: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(), evento: 'Candidatura iniciada', detalhes: 'Preparação' },
          { data: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), evento: 'Candidatura submetida', detalhes: 'Aguarda análise' },
        ],
      },
    });
    candidaturas.push(cand4);
  }

  // BioMar -> Bioeconomia Azul (if exists)
  const avisoBioMar = createdAvisos.find(a => a.codigo === 'PRR_004');
  if (avisoBioMar) {
    const cand5 = await prisma.candidatura.create({
      data: {
        empresaId: empresas[5].id,
        avisoId: avisoBioMar.id,
        estado: EstadoCandidatura.EM_ANALISE,
        montanteSolicitado: 2000000,
        dataSubmissao: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        observacoes: 'Projeto de aquicultura sustentável com biotecnologia avançada',
        documentosAnexos: ['projeto_tecnico.pdf', 'licenca_maritima.pdf', 'estudo_impacto.pdf'],
        timeline: [
          { data: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(), evento: 'Candidatura iniciada', detalhes: 'Preparação' },
          { data: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(), evento: 'Submetida', detalhes: 'Via PRR' },
          { data: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(), evento: 'Em análise', detalhes: 'Análise técnica' },
        ],
      },
    });
    candidaturas.push(cand5);
  }

  // TransLog -> Mobilidade Verde (if exists)
  const avisoMobilidade = createdAvisos.find(a => a.codigo === 'PRR_005');
  if (avisoMobilidade) {
    const cand6 = await prisma.candidatura.create({
      data: {
        empresaId: empresas[6].id,
        avisoId: avisoMobilidade.id,
        estado: EstadoCandidatura.REJEITADA,
        montanteSolicitado: 800000,
        dataSubmissao: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
        dataDecisao: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        observacoes: 'Rejeitada por incumprimento de requisitos técnicos - planeia reaplicar',
        documentosAnexos: ['candidatura.pdf'],
        timeline: [
          { data: new Date(now.getTime() - 65 * 24 * 60 * 60 * 1000).toISOString(), evento: 'Candidatura iniciada', detalhes: 'Preparação' },
          { data: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(), evento: 'Submetida', detalhes: 'Enviada' },
          { data: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(), evento: 'Rejeitada', detalhes: 'Requisitos técnicos insuficientes' },
        ],
      },
    });
    candidaturas.push(cand6);
  }

  console.log(`   ✓ Created ${candidaturas.length} applications`);

  // ═══════════════════════════════════════════════════════════════════
  // DOCUMENTOS - Company documents
  // ═══════════════════════════════════════════════════════════════════
  console.log('\n📄 Creating company documents...');

  const documentos = await Promise.all([
    prisma.documento.create({
      data: {
        empresaId: empresas[0].id,
        tipoDocumento: TipoDocumento.CERTIDAO_AT,
        nome: 'Certidão Autoridade Tributária - TechInovação',
        cloudStoragePath: 'uploads/empresas/techinovacao/certidao-at-2024.pdf',
        dataEmissao: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
        dataValidade: new Date(now.getTime() + 305 * 24 * 60 * 60 * 1000),
        statusValidade: StatusValidade.VALIDO,
      },
    }),
    prisma.documento.create({
      data: {
        empresaId: empresas[0].id,
        tipoDocumento: TipoDocumento.CERTIFICADO_PME,
        nome: 'Certificado PME - TechInovação',
        cloudStoragePath: 'uploads/empresas/techinovacao/cert-pme-2024.pdf',
        dataEmissao: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        dataValidade: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
        statusValidade: StatusValidade.A_EXPIRAR,
        observacoes: 'ATENÇÃO: Certificado a renovar em breve',
      },
    }),
    prisma.documento.create({
      data: {
        empresaId: empresas[1].id,
        tipoDocumento: TipoDocumento.CERTIDAO_SS,
        nome: 'Certidão Segurança Social - EcoSustentável',
        cloudStoragePath: 'uploads/empresas/ecosustentavel/certidao-ss-2024.pdf',
        dataEmissao: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        dataValidade: new Date(now.getTime() + 335 * 24 * 60 * 60 * 1000),
        statusValidade: StatusValidade.VALIDO,
      },
    }),
    prisma.documento.create({
      data: {
        empresaId: empresas[1].id,
        tipoDocumento: TipoDocumento.LICENCA_ATIVIDADE,
        nome: 'Licença Ambiental - EcoSustentável',
        cloudStoragePath: 'uploads/empresas/ecosustentavel/licenca-ambiental-2024.pdf',
        dataEmissao: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
        dataValidade: new Date(now.getTime() + 185 * 24 * 60 * 60 * 1000),
        statusValidade: StatusValidade.VALIDO,
      },
    }),
    prisma.documento.create({
      data: {
        empresaId: empresas[2].id,
        tipoDocumento: TipoDocumento.LICENCA_ATIVIDADE,
        nome: 'Licença Atividade Agrícola - AgroInova',
        cloudStoragePath: 'uploads/empresas/agroinova/licenca-agricola.pdf',
        dataEmissao: new Date(now.getTime() - 400 * 24 * 60 * 60 * 1000),
        dataValidade: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        statusValidade: StatusValidade.EXPIRADO,
        observacoes: 'URGENTE: Licença expirada! Renovação necessária',
      },
    }),
    prisma.documento.create({
      data: {
        empresaId: empresas[3].id,
        tipoDocumento: TipoDocumento.CERTIDAO_AT,
        nome: 'Certidão AT - ManufacturaPorto',
        cloudStoragePath: 'uploads/empresas/manufactporto/certidao-at-2024.pdf',
        dataEmissao: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
        dataValidade: new Date(now.getTime() + 320 * 24 * 60 * 60 * 1000),
        statusValidade: StatusValidade.VALIDO,
      },
    }),
    prisma.documento.create({
      data: {
        empresaId: empresas[4].id,
        tipoDocumento: TipoDocumento.CERTIFICADO_PME,
        nome: 'Certificado PME - TurismoAlgarve',
        cloudStoragePath: 'uploads/empresas/turismoalgarve/cert-pme-2024.pdf',
        dataEmissao: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000),
        dataValidade: new Date(now.getTime() + 245 * 24 * 60 * 60 * 1000),
        statusValidade: StatusValidade.VALIDO,
      },
    }),
    prisma.documento.create({
      data: {
        empresaId: empresas[5].id,
        tipoDocumento: TipoDocumento.OUTRO,
        nome: 'Licença Marítima - BioMar',
        cloudStoragePath: 'uploads/empresas/biomar/licenca-maritima.pdf',
        dataEmissao: new Date(now.getTime() - 200 * 24 * 60 * 60 * 1000),
        dataValidade: new Date(now.getTime() + 165 * 24 * 60 * 60 * 1000),
        statusValidade: StatusValidade.VALIDO,
      },
    }),
  ]);

  console.log(`   ✓ Created ${documentos.length} documents`);

  // ═══════════════════════════════════════════════════════════════════
  // WORKFLOWS - Automated processes
  // ═══════════════════════════════════════════════════════════════════
  console.log('\n⚙️ Creating workflows...');

  const workflows = await Promise.all([
    prisma.workflow.create({
      data: {
        nome: 'Scraping Portal Portugal 2030',
        tipo: TipoWorkflow.SCRAPING_PORTUGAL2030,
        ativo: true,
        frequencia: '0 */6 * * *',
        ultimaExecucao: new Date(now.getTime() - 4 * 60 * 60 * 1000),
        proximaExecucao: new Date(now.getTime() + 2 * 60 * 60 * 1000),
        parametros: {
          portals: ['https://portugal2030.pt/avisos'],
          filters: ['PME', 'Inovação', 'Digital'],
          regions: ['Norte', 'Centro', 'Lisboa', 'Algarve']
        },
      },
    }),
    prisma.workflow.create({
      data: {
        nome: 'Scraping Portal PEPAC',
        tipo: TipoWorkflow.SCRAPING_PEPAC,
        ativo: true,
        frequencia: '0 */8 * * *',
        ultimaExecucao: new Date(now.getTime() - 6 * 60 * 60 * 1000),
        proximaExecucao: new Date(now.getTime() + 2 * 60 * 60 * 1000),
        parametros: {
          portals: ['https://www.dgadr.gov.pt/pepac'],
          filters: ['Agricultura', 'Rural'],
        },
      },
    }),
    prisma.workflow.create({
      data: {
        nome: 'Scraping Portal PRR',
        tipo: TipoWorkflow.SCRAPING_PRR,
        ativo: true,
        frequencia: '0 */6 * * *',
        ultimaExecucao: new Date(now.getTime() - 5 * 60 * 60 * 1000),
        proximaExecucao: new Date(now.getTime() + 1 * 60 * 60 * 1000),
        parametros: {
          portals: ['https://recuperarportugal.gov.pt/avisos'],
          filters: ['Descarbonização', 'Digital', 'Resiliência'],
        },
      },
    }),
    prisma.workflow.create({
      data: {
        nome: 'Notificações Email Urgentes',
        tipo: TipoWorkflow.NOTIFICACAO_EMAIL,
        ativo: true,
        frequencia: '0 9 * * *',
        ultimaExecucao: new Date(now.getTime() - 12 * 60 * 60 * 1000),
        proximaExecucao: new Date(now.getTime() + 12 * 60 * 60 * 1000),
        parametros: {
          destinatarios: ['geral@taconsulting.pt'],
          templateUrgente: true,
          diasAlerta: [14, 7, 3, 1]
        },
      },
    }),
    prisma.workflow.create({
      data: {
        nome: 'Validação Automática de Documentos',
        tipo: TipoWorkflow.VALIDACAO_DOCUMENTOS,
        ativo: true,
        frequencia: '0 2 * * *',
        ultimaExecucao: new Date(now.getTime() - 22 * 60 * 60 * 1000),
        proximaExecucao: new Date(now.getTime() + 2 * 60 * 60 * 1000),
        parametros: {
          alertaExpiracao: 30,
          tiposDocumento: ['CERTIDAO_AT', 'CERTIDAO_SS', 'CERTIFICADO_PME', 'LICENCA_ATIVIDADE']
        },
      },
    }),
    prisma.workflow.create({
      data: {
        nome: 'Relatório Mensal Automático',
        tipo: TipoWorkflow.RELATORIO_MENSAL,
        ativo: true,
        frequencia: '0 8 1 * *',
        ultimaExecucao: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
        proximaExecucao: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
        parametros: {
          destinatarios: ['direcao@taconsulting.pt', 'geral@taconsulting.pt'],
          incluirGraficos: true,
          formatoPDF: true
        },
      },
    }),
  ]);

  console.log(`   ✓ Created ${workflows.length} workflows`);

  // ═══════════════════════════════════════════════════════════════════
  // WORKFLOW LOGS - Execution history
  // ═══════════════════════════════════════════════════════════════════
  console.log('\n📊 Creating workflow execution logs...');

  await Promise.all([
    prisma.workflowLog.create({
      data: {
        workflowId: workflows[0].id,
        dataExecucao: new Date(now.getTime() - 4 * 60 * 60 * 1000),
        sucesso: true,
        mensagem: 'Scraping Portugal 2030 concluído com sucesso. 5 avisos atualizados.',
        dados: { avisosNovos: 2, avisosAtualizados: 5, erros: 0 },
      },
    }),
    prisma.workflowLog.create({
      data: {
        workflowId: workflows[1].id,
        dataExecucao: new Date(now.getTime() - 6 * 60 * 60 * 1000),
        sucesso: true,
        mensagem: 'Scraping PEPAC concluído. 4 avisos encontrados.',
        dados: { avisosNovos: 1, avisosAtualizados: 4, erros: 0 },
      },
    }),
    prisma.workflowLog.create({
      data: {
        workflowId: workflows[2].id,
        dataExecucao: new Date(now.getTime() - 5 * 60 * 60 * 1000),
        sucesso: true,
        mensagem: 'Scraping PRR concluído. 6 avisos processados.',
        dados: { avisosNovos: 0, avisosAtualizados: 6, erros: 0 },
      },
    }),
    prisma.workflowLog.create({
      data: {
        workflowId: workflows[3].id,
        dataExecucao: new Date(now.getTime() - 12 * 60 * 60 * 1000),
        sucesso: true,
        mensagem: '8 notificações email enviadas com sucesso.',
        dados: { emailsEnviados: 8, emailsFalharam: 0, avisosUrgentes: 3 },
      },
    }),
    prisma.workflowLog.create({
      data: {
        workflowId: workflows[4].id,
        dataExecucao: new Date(now.getTime() - 22 * 60 * 60 * 1000),
        sucesso: true,
        mensagem: 'Validação concluída. 1 documento expirado, 1 a expirar.',
        dados: { documentosValidados: 8, expirados: 1, aExpirar: 1, alertasEnviados: 2 },
      },
    }),
  ]);

  console.log(`   ✓ Created workflow logs`);

  // ═══════════════════════════════════════════════════════════════════
  // NOTIFICAÇÕES - System notifications
  // ═══════════════════════════════════════════════════════════════════
  console.log('\n📧 Creating notifications...');

  const urgentAviso = createdAvisos.find(a => a.urgente);

  await Promise.all([
    prisma.notificacao.create({
      data: {
        tipo: TipoNotificacao.AVISO_URGENTE,
        destinatario: 'geral@taconsulting.pt',
        assunto: `URGENTE: ${urgentAviso?.nome || 'Aviso com deadline próximo'}`,
        conteudo: `O aviso "${urgentAviso?.nome || 'Aviso urgente'}" tem prazo de candidatura nos próximos 14 dias. Verifique as empresas elegíveis e contacte-as imediatamente.`,
        enviado: true,
        dataEnvio: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        contexto: {
          avisoId: urgentAviso?.id || 'unknown',
          portal: urgentAviso?.portal || 'PORTUGAL2030',
        },
      },
    }),
    prisma.notificacao.create({
      data: {
        tipo: TipoNotificacao.DOCUMENTO_EXPIRA,
        destinatario: 'geral@taconsulting.pt',
        assunto: 'Documento a expirar: Certificado PME - TechInovação',
        conteudo: 'O Certificado PME da empresa TechInovação Lda (NIPC: 501234567) expira em 20 dias. Contacte o cliente para renovação urgente.',
        enviado: true,
        dataEnvio: new Date(now.getTime() - 6 * 60 * 60 * 1000),
        contexto: {
          empresaId: empresas[0].id,
          tipoDocumento: 'CERTIFICADO_PME',
          diasExpiracao: 20
        },
      },
    }),
    prisma.notificacao.create({
      data: {
        tipo: TipoNotificacao.DOCUMENTO_EXPIRA,
        destinatario: 'geral@taconsulting.pt',
        assunto: 'URGENTE: Licença Expirada - AgroInova',
        conteudo: 'A Licença de Atividade Agrícola da empresa AgroInova (NIPC: 503456123) está EXPIRADA há 10 dias. Ação imediata necessária!',
        enviado: true,
        dataEnvio: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        contexto: {
          empresaId: empresas[2].id,
          tipoDocumento: 'LICENCA_ATIVIDADE',
          diasExpiracao: -10
        },
      },
    }),
    prisma.notificacao.create({
      data: {
        tipo: TipoNotificacao.CANDIDATURA_UPDATE,
        destinatario: 'maria.rodrigues@ecosustentavel.pt',
        assunto: 'Candidatura Aprovada - Eficiência Energética',
        conteudo: 'Parabéns! A candidatura da EcoSustentável ao programa Eficiência Energética na Indústria foi APROVADA com €1.200.000. Em breve receberá informações sobre os próximos passos.',
        enviado: true,
        dataEnvio: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        contexto: {
          empresaId: empresas[1].id,
          estado: 'APROVADA',
          montanteAprovado: 1200000
        },
      },
    }),
    prisma.notificacao.create({
      data: {
        tipo: TipoNotificacao.SISTEMA,
        destinatario: 'admin@taconsulting.pt',
        assunto: 'Resumo Diário - Sistema TA Consulting',
        conteudo: `Resumo do dia:\n- ${createdAvisos.length} avisos ativos\n- ${candidaturas.length} candidaturas em curso\n- ${empresas.length} empresas registadas\n- 2 alertas de documentos`,
        enviado: true,
        dataEnvio: new Date(now.getTime() - 1 * 60 * 60 * 1000),
        contexto: { tipo: 'resumo_diario' },
      },
    }),
  ]);

  console.log(`   ✓ Created notifications`);

  // ═══════════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════════
  console.log('\n' + '═'.repeat(50));
  console.log('✅ DATABASE SEEDED SUCCESSFULLY WITH REAL DATA!');
  console.log('═'.repeat(50));
  console.log(`\n📊 Summary:`);
  console.log(`   👤 Users: 2 (admin + user)`);
  console.log(`   🏢 Companies: ${empresas.length}`);
  console.log(`   📋 Funding Opportunities: ${createdAvisos.length}`);
  console.log(`      - Portugal 2030: ${realData.portugal2030.length}`);
  console.log(`      - PEPAC: ${realData.pepac.length}`);
  console.log(`      - PRR: ${realData.prr.length}`);
  console.log(`   📝 Applications: ${candidaturas.length}`);
  console.log(`   📄 Documents: ${documentos.length}`);
  console.log(`   ⚙️ Workflows: ${workflows.length}`);
  console.log(`   📧 Notifications: 5`);
  console.log(`\n🔑 Login credentials:`);
  console.log(`   Admin: john@doe.com / johndoe123`);
  console.log(`   User: utilizador@taconsulting.pt / 123456`);
  console.log('');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
