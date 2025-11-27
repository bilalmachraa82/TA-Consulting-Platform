import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Enums definidos localmente (compatíveis com Prisma)
const Portal = {
  PORTUGAL2030: 'PORTUGAL2030',
  PAPAC: 'PAPAC',
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
  SCRAPING_PAPAC: 'SCRAPING_PAPAC',
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

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user (hidden test account)
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

  // Create normal user
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

  // Seed Empresas (Portuguese companies)
  const empresas = await Promise.all([
    prisma.empresa.upsert({
      where: { nipc: '123456789' },
      update: {},
      create: {
        nipc: '123456789',
        nome: 'TechInovação Lda',
        cae: '62010',
        setor: 'Tecnologias de Informação',
        dimensao: DimensaoEmpresa.PEQUENA,
        email: 'geral@techinovacao.pt',
        telefone: '213456789',
        morada: 'Avenida da Liberdade, 123',
        localidade: 'Lisboa',
        codigoPostal: '1250-096',
        distrito: 'Lisboa',
        regiao: 'Lisboa',
        contactoNome: 'João Silva',
        contactoEmail: 'joao.silva@techinovacao.pt',
        contactoTelefone: '966123456',
      },
    }),
    prisma.empresa.upsert({
      where: { nipc: '987654321' },
      update: {},
      create: {
        nipc: '987654321',
        nome: 'EcoSustentável SA',
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
        contactoNome: 'Maria Rodrigues',
        contactoEmail: 'maria.rodrigues@ecosustentavel.pt',
        contactoTelefone: '967876543',
      },
    }),
    prisma.empresa.upsert({
      where: { nipc: '456789123' },
      update: {},
      create: {
        nipc: '456789123',
        nome: 'AgroInova Unipessoal',
        cae: '01110',
        setor: 'Agricultura',
        dimensao: DimensaoEmpresa.MICRO,
        email: 'contacto@agroinova.pt',
        telefone: '265432109',
        morada: 'Quinta do Vale, S/N',
        localidade: 'Santarém',
        codigoPostal: '2005-123',
        distrito: 'Santarém',
        regiao: 'Centro',
        contactoNome: 'António Costa',
        contactoEmail: 'antonio.costa@agroinova.pt',
        contactoTelefone: '963214567',
      },
    }),
    prisma.empresa.upsert({
      where: { nipc: '789123456' },
      update: {},
      create: {
        nipc: '789123456',
        nome: 'ManufacturaPorto Lda',
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
        contactoNome: 'Carlos Ferreira',
        contactoEmail: 'carlos.ferreira@manufactporto.pt',
        contactoTelefone: '965789012',
      },
    }),
    prisma.empresa.upsert({
      where: { nipc: '321654987' },
      update: {},
      create: {
        nipc: '321654987',
        nome: 'TurismoAlgarve SA',
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
        contactoNome: 'Ana Sousa',
        contactoEmail: 'ana.sousa@turismoalgarve.pt',
        contactoTelefone: '962345678',
      },
    }),
  ]);

  // Seed Avisos (Funding Calls)
  const now = new Date();
  const avisos = await Promise.all([
    prisma.aviso.create({
      data: {
        nome: 'Apoio à Digitalização de PME',
        portal: Portal.PORTUGAL2030,
        programa: 'Programa Valorizar',
        linha: 'Digitalização',
        codigo: 'C-03-i02-01',
        dataInicioSubmissao: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 dias atrás
        dataFimSubmissao: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000), // 15 dias à frente
        montanteMinimo: 5000,
        montanteMaximo: 50000,
        descrição: 'Apoio financeiro para projetos de digitalização de pequenas e médias empresas',
        link: 'https://portugal2030.pt/aviso-123',
        taxa: '75%',
        regiao: 'Norte',
        setoresElegiveis: ['Tecnologias de Informação', 'Comércio', 'Serviços'],
        dimensaoEmpresa: ['MICRO', 'PEQUENA', 'MEDIA'],
        urgente: true,
      },
    }),
    prisma.aviso.create({
      data: {
        nome: 'Eficiência Energética na Indústria',
        portal: Portal.PRR,
        programa: 'Componente 13',
        linha: 'Eficiência Energética',
        codigo: 'PRR-C13-i02',
        dataInicioSubmissao: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        dataFimSubmissao: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000),
        montanteMinimo: 10000,
        montanteMaximo: 200000,
        descrição: 'Apoio a investimentos em eficiência energética no setor industrial',
        link: 'https://recuperarportugal.gov.pt/aviso-456',
        taxa: '50%',
        setoresElegiveis: ['Metalurgia', 'Têxtil', 'Alimentar'],
        dimensaoEmpresa: ['PEQUENA', 'MEDIA', 'GRANDE'],
        urgente: false,
      },
    }),
    prisma.aviso.create({
      data: {
        nome: 'Apoio à Agricultura Sustentável',
        portal: Portal.PAPAC,
        programa: 'PAPAC 2030',
        linha: 'Sustentabilidade Agrícola',
        codigo: 'PAPAC-2030-01',
        dataInicioSubmissao: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        dataFimSubmissao: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000),
        montanteMinimo: 3000,
        montanteMaximo: 75000,
        descrição: 'Financiamento para práticas agrícolas sustentáveis e inovação no setor primário',
        link: 'https://pepacc.pt/aviso-789',
        taxa: '60%',
        regiao: 'Centro',
        setoresElegiveis: ['Agricultura', 'Pecuária'],
        dimensaoEmpresa: ['MICRO', 'PEQUENA'],
        urgente: false,
      },
    }),
    prisma.aviso.create({
      data: {
        nome: 'Inovação no Turismo',
        portal: Portal.PORTUGAL2030,
        programa: 'Programa Competir+',
        linha: 'Inovação Turística',
        codigo: 'C-05-i01-02',
        dataInicioSubmissao: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        dataFimSubmissao: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000), // Urgente: 6 dias
        montanteMinimo: 8000,
        montanteMaximo: 100000,
        descrição: 'Apoio a projetos inovadores no setor do turismo',
        link: 'https://portugal2030.pt/aviso-101',
        taxa: '70%',
        regiao: 'Algarve',
        setoresElegiveis: ['Turismo e Hotelaria'],
        dimensaoEmpresa: ['PEQUENA', 'MEDIA'],
        urgente: true,
      },
    }),
    prisma.aviso.create({
      data: {
        nome: 'Transição Digital da Economia',
        portal: Portal.PRR,
        programa: 'Componente 16',
        linha: 'Digitalização Empresarial',
        codigo: 'PRR-C16-i01',
        dataInicioSubmissao: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000),
        dataFimSubmissao: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
        montanteMinimo: 15000,
        montanteMaximo: 300000,
        descrição: 'Financiamento para projetos de transformação digital das empresas',
        link: 'https://recuperarportugal.gov.pt/aviso-202',
        taxa: '65%',
        setoresElegiveis: ['Tecnologias de Informação', 'Serviços', 'Comércio', 'Indústria'],
        dimensaoEmpresa: ['PEQUENA', 'MEDIA', 'GRANDE'],
        urgente: false,
      },
    }),
  ]);

  // Seed Candidaturas
  const candidaturas = await Promise.all([
    prisma.candidatura.create({
      data: {
        empresaId: empresas[0].id, // TechInovação
        avisoId: avisos[0].id, // Digitalização PME
        estado: EstadoCandidatura.EM_ANALISE,
        montanteSolicitado: 35000,
        dataSubmissao: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        observacoes: 'Candidatura submetida com todos os documentos necessários',
        documentosAnexos: ['formulario_candidatura.pdf', 'orcamento_detalhado.pdf'],
        timeline: [
          {
            data: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            evento: 'Candidatura iniciada',
            detalhes: 'Início da preparação da candidatura'
          },
          {
            data: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            evento: 'Candidatura submetida',
            detalhes: 'Candidatura enviada através do portal Portugal 2030'
          }
        ],
      },
    }),
    prisma.candidatura.create({
      data: {
        empresaId: empresas[1].id, // EcoSustentável
        avisoId: avisos[1].id, // Eficiência Energética
        estado: EstadoCandidatura.APROVADA,
        montanteSolicitado: 150000,
        montanteAprovado: 120000,
        dataSubmissao: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
        dataDecisao: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        observacoes: 'Aprovada com redução de 20% do montante solicitado',
        documentosAnexos: ['candidatura_completa.pdf', 'licenca_ambiental.pdf'],
        timeline: [
          {
            data: new Date(now.getTime() - 50 * 24 * 60 * 60 * 1000).toISOString(),
            evento: 'Candidatura iniciada',
            detalhes: 'Preparação dos documentos'
          },
          {
            data: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString(),
            evento: 'Candidatura submetida',
            detalhes: 'Enviada via portal PRR'
          },
          {
            data: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
            evento: 'Em análise',
            detalhes: 'Análise técnica iniciada'
          },
          {
            data: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            evento: 'Aprovada',
            detalhes: 'Candidatura aprovada com montante ajustado'
          }
        ],
      },
    }),
    prisma.candidatura.create({
      data: {
        empresaId: empresas[4].id, // TurismoAlgarve
        avisoId: avisos[3].id, // Inovação Turismo
        estado: EstadoCandidatura.A_PREPARAR,
        montanteSolicitado: 85000,
        observacoes: 'Em fase de recolha de orçamentos para equipamentos turísticos',
        documentosAnexos: [],
        timeline: [
          {
            data: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            evento: 'Candidatura iniciada',
            detalhes: 'Aviso identificado como elegível'
          }
        ],
      },
    }),
  ]);

  // Seed Documentos
  await Promise.all([
    prisma.documento.create({
      data: {
        empresaId: empresas[0].id,
        tipoDocumento: TipoDocumento.CERTIDAO_AT,
        nome: 'Certidão AT - TechInovação',
        cloudStoragePath: 'uploads/certidao-at-tech.pdf',
        dataEmissao: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
        dataValidade: new Date(now.getTime() + 305 * 24 * 60 * 60 * 1000), // ~1 ano
        statusValidade: StatusValidade.VALIDO,
      },
    }),
    prisma.documento.create({
      data: {
        empresaId: empresas[0].id,
        tipoDocumento: TipoDocumento.CERTIFICADO_PME,
        nome: 'Certificado PME - TechInovação',
        cloudStoragePath: 'uploads/cert-pme-tech.pdf',
        dataEmissao: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        dataValidade: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000), // A expirar em 20 dias
        statusValidade: StatusValidade.A_EXPIRAR,
        observacoes: 'Certificado a renovar brevemente',
      },
    }),
    prisma.documento.create({
      data: {
        empresaId: empresas[1].id,
        tipoDocumento: TipoDocumento.CERTIDAO_SS,
        nome: 'Certidão SS - EcoSustentável',
        cloudStoragePath: 'uploads/certidao-ss-eco.pdf',
        dataEmissao: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        dataValidade: new Date(now.getTime() + 335 * 24 * 60 * 60 * 1000),
        statusValidade: StatusValidade.VALIDO,
      },
    }),
    prisma.documento.create({
      data: {
        empresaId: empresas[2].id,
        tipoDocumento: TipoDocumento.LICENCA_ATIVIDADE,
        nome: 'Licença Atividade Agrícola',
        cloudStoragePath: 'uploads/licenca-agro.pdf',
        dataEmissao: new Date(now.getTime() - 400 * 24 * 60 * 60 * 1000),
        dataValidade: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // Expirada há 10 dias
        statusValidade: StatusValidade.EXPIRADO,
        observacoes: 'URGENTE: Licença expirada, renovação necessária',
      },
    }),
  ]);

  // Seed Workflows
  const workflows = await Promise.all([
    prisma.workflow.create({
      data: {
        nome: 'Scraping Portal Portugal 2030',
        tipo: TipoWorkflow.SCRAPING_PORTUGAL2030,
        ativo: true,
        frequencia: '0 */6 * * *', // A cada 6 horas
        ultimaExecucao: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 horas atrás
        proximaExecucao: new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2 horas à frente
        parametros: {
          portals: ['https://portugal2030.pt/avisos'],
          filters: ['Pequenas e Médias Empresas'],
          regions: ['Norte', 'Centro', 'Lisboa']
        },
      },
    }),
    prisma.workflow.create({
      data: {
        nome: 'Notificações Email Urgentes',
        tipo: TipoWorkflow.NOTIFICACAO_EMAIL,
        ativo: true,
        frequencia: '0 9 * * *', // Diariamente às 9h
        ultimaExecucao: new Date(now.getTime() - 12 * 60 * 60 * 1000), // 12 horas atrás
        proximaExecucao: new Date(now.getTime() + 12 * 60 * 60 * 1000), // 12 horas à frente
        parametros: {
          destinatarios: ['geral@taconsulting.pt'],
          templateUrgente: true,
          diasAlerta: [7, 3, 1]
        },
      },
    }),
    prisma.workflow.create({
      data: {
        nome: 'Validação Automática Documentos',
        tipo: TipoWorkflow.VALIDACAO_DOCUMENTOS,
        ativo: true,
        frequencia: '0 2 * * *', // Diariamente às 2h da manhã
        ultimaExecucao: new Date(now.getTime() - 22 * 60 * 60 * 1000),
        proximaExecucao: new Date(now.getTime() + 2 * 60 * 60 * 1000),
        parametros: {
          alertaExpiracao: 30,
          tiposDocumento: ['CERTIDAO_AT', 'CERTIDAO_SS', 'CERTIFICADO_PME']
        },
      },
    }),
  ]);

  // Seed Workflow Logs
  await Promise.all([
    prisma.workflowLog.create({
      data: {
        workflowId: workflows[0].id,
        dataExecucao: new Date(now.getTime() - 4 * 60 * 60 * 1000),
        sucesso: true,
        mensagem: 'Scraping Portugal 2030 concluído com sucesso. 3 novos avisos encontrados.',
        dados: {
          avisosNovos: 3,
          avisosAtualizados: 2,
          erros: 0
        },
      },
    }),
    prisma.workflowLog.create({
      data: {
        workflowId: workflows[1].id,
        dataExecucao: new Date(now.getTime() - 12 * 60 * 60 * 1000),
        sucesso: true,
        mensagem: '5 notificações email enviadas com sucesso.',
        dados: {
          emailsEnviados: 5,
          emailsFalharam: 0,
          avisos: ['Digitalização PME', 'Inovação Turismo']
        },
      },
    }),
    prisma.workflowLog.create({
      data: {
        workflowId: workflows[2].id,
        dataExecucao: new Date(now.getTime() - 22 * 60 * 60 * 1000),
        sucesso: true,
        mensagem: 'Validação de documentos concluída. 1 documento expirado encontrado.',
        dados: {
          documentosValidados: 15,
          documentosExpirados: 1,
          alertasEnviados: 1
        },
      },
    }),
  ]);

  // Seed Notificações
  await Promise.all([
    prisma.notificacao.create({
      data: {
        tipo: TipoNotificacao.AVISO_URGENTE,
        destinatario: 'geral@taconsulting.pt',
        assunto: 'URGENTE: Aviso com deadline em 6 dias - Inovação no Turismo',
        conteudo: 'O aviso "Inovação no Turismo" (C-05-i01-02) tem deadline de candidatura em apenas 6 dias. Recomendamos contactar imediatamente os clientes elegíveis do setor turístico.',
        enviado: true,
        dataEnvio: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        contexto: {
          avisoId: avisos[3].id,
          diasRestantes: 6,
          setor: 'Turismo e Hotelaria'
        },
      },
    }),
    prisma.notificacao.create({
      data: {
        tipo: TipoNotificacao.DOCUMENTO_EXPIRA,
        destinatario: 'geral@taconsulting.pt',
        assunto: 'Documento a expirar: Certificado PME - TechInovação',
        conteudo: 'O Certificado PME da empresa TechInovação Lda (NIPC: 123456789) expira em 20 dias. Por favor, contacte o cliente para renovação.',
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
        tipo: TipoNotificacao.CANDIDATURA_UPDATE,
        destinatario: 'maria.rodrigues@ecosustentavel.pt',
        assunto: 'Candidatura Aprovada - Eficiência Energética',
        conteudo: 'Parabéns! A sua candidatura ao programa de Eficiência Energética na Indústria foi aprovada com o montante de €120.000. Em breve receberá mais informações sobre os próximos passos.',
        enviado: true,
        dataEnvio: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        contexto: {
          candidaturaId: candidaturas[1].id,
          estado: 'APROVADA',
          montanteAprovado: 120000
        },
      },
    }),
  ]);

  console.log('✅ Database seeded successfully!');
  console.log(`👤 Admin user: john@doe.com / johndoe123`);
  console.log(`👤 Normal user: utilizador@taconsulting.pt / 123456`);
  console.log(`🏢 Companies created: ${empresas.length}`);
  console.log(`📢 Funding calls created: ${avisos.length}`);
  console.log(`📝 Applications created: ${candidaturas.length}`);
  console.log(`📄 Documents created: 4`);
  console.log(`⚙️ Workflows created: ${workflows.length}`);
  console.log(`📧 Notifications created: 3`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
