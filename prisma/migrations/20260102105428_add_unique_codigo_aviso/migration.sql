-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "SectionStatus" AS ENUM ('PENDING', 'DRAFT', 'REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "Portal" AS ENUM ('PORTUGAL2030', 'PEPAC', 'PRR', 'HORIZON_EUROPE', 'EUROPA_CRIATIVA', 'IPDJ', 'BASE_GOV');

-- CreateEnum
CREATE TYPE "DimensaoEmpresa" AS ENUM ('MICRO', 'PEQUENA', 'MEDIA', 'GRANDE');

-- CreateEnum
CREATE TYPE "EstadoCandidatura" AS ENUM ('A_PREPARAR', 'SUBMETIDA', 'EM_ANALISE', 'APROVADA', 'REJEITADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('CERTIDAO_AT', 'CERTIDAO_SS', 'CERTIFICADO_PME', 'LICENCA_ATIVIDADE', 'BALANCO', 'DEMONSTRACOES_FINANCEIRAS', 'OUTRO');

-- CreateEnum
CREATE TYPE "StatusValidade" AS ENUM ('VALIDO', 'A_EXPIRAR', 'EXPIRADO', 'EM_FALTA');

-- CreateEnum
CREATE TYPE "TipoWorkflow" AS ENUM ('SCRAPING_PORTUGAL2030', 'SCRAPING_PEPAC', 'SCRAPING_PRR', 'NOTIFICACAO_EMAIL', 'VALIDACAO_DOCUMENTOS', 'RELATORIO_MENSAL');

-- CreateEnum
CREATE TYPE "TipoNotificacao" AS ENUM ('AVISO_URGENTE', 'DOCUMENTO_EXPIRA', 'CANDIDATURA_UPDATE', 'RELATORIO_MENSAL', 'SISTEMA');

-- CreateEnum
CREATE TYPE "TeamRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER');

-- CreateEnum
CREATE TYPE "MilestoneEstado" AS ENUM ('PENDENTE', 'EM_PROGRESSO', 'CONCLUIDO', 'ATRASADO');

-- CreateEnum
CREATE TYPE "PedidoPagamentoEstado" AS ENUM ('RASCUNHO', 'SUBMETIDO', 'EM_ANALISE', 'APROVADO', 'REJEITADO', 'PAGO');

-- CreateEnum
CREATE TYPE "EstadoCandidaturaHistorica" AS ENUM ('APROVADA', 'REJEITADA', 'DESISTIDA', 'EM_ANALISE', 'DESCONHECIDO');

-- CreateEnum
CREATE TYPE "RagStatus" AS ENUM ('PENDING', 'PROCESSING', 'INDEXED', 'FAILED');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "avisos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "portal" "Portal" NOT NULL DEFAULT 'PORTUGAL2030',
    "programa" TEXT NOT NULL,
    "linha" TEXT,
    "codigo" TEXT NOT NULL,
    "dataInicioSubmissao" TIMESTAMP(3) NOT NULL,
    "dataFimSubmissao" TIMESTAMP(3) NOT NULL,
    "montanteMinimo" DOUBLE PRECISION,
    "montanteMaximo" DOUBLE PRECISION,
    "descrição" TEXT,
    "link" TEXT,
    "taxa" TEXT,
    "regiao" TEXT,
    "setoresElegiveis" TEXT[],
    "dimensaoEmpresa" TEXT[],
    "urgente" BOOLEAN NOT NULL DEFAULT false,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "canalSubmissao" TEXT,
    "contacto" TEXT,
    "linksLegislacao" TEXT[],
    "notasAdicionais" TEXT,
    "preRequisitos" TEXT[],
    "anexos" JSONB,

    CONSTRAINT "avisos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aviso_chunks" (
    "id" TEXT NOT NULL,
    "avisoId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aviso_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "empresas" (
    "id" TEXT NOT NULL,
    "nipc" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cae" TEXT NOT NULL,
    "setor" TEXT NOT NULL,
    "dimensao" "DimensaoEmpresa" NOT NULL DEFAULT 'MICRO',
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "morada" TEXT,
    "localidade" TEXT,
    "codigoPostal" TEXT,
    "distrito" TEXT,
    "regiao" TEXT,
    "contactoNome" TEXT,
    "contactoEmail" TEXT,
    "contactoTelefone" TEXT,
    "notas" TEXT,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "consultorId" TEXT,
    "teamId" TEXT,

    CONSTRAINT "empresas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidaturas" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "avisoId" TEXT NOT NULL,
    "estado" "EstadoCandidatura" NOT NULL DEFAULT 'A_PREPARAR',
    "programId" TEXT,
    "montanteSolicitado" DOUBLE PRECISION,
    "montanteAprovado" DOUBLE PRECISION,
    "dataSubmissao" TIMESTAMP(3),
    "dataDecisao" TIMESTAMP(3),
    "observacoes" TEXT,
    "documentosAnexos" TEXT[],
    "timeline" JSONB[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidaturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidatura_section_states" (
    "id" TEXT NOT NULL,
    "candidaturaId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "status" "SectionStatus" NOT NULL DEFAULT 'PENDING',
    "content" TEXT,
    "aiSuggestion" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidatura_section_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "tipoDocumento" "TipoDocumento" NOT NULL,
    "nome" TEXT NOT NULL,
    "cloudStoragePath" TEXT NOT NULL,
    "dataEmissao" TIMESTAMP(3),
    "dataValidade" TIMESTAMP(3),
    "statusValidade" "StatusValidade" NOT NULL DEFAULT 'VALIDO',
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflows" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoWorkflow" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "frequencia" TEXT NOT NULL,
    "ultimaExecucao" TIMESTAMP(3),
    "proximaExecucao" TIMESTAMP(3),
    "parametros" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_logs" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "dataExecucao" TIMESTAMP(3) NOT NULL,
    "sucesso" BOOLEAN NOT NULL,
    "mensagem" TEXT,
    "dados" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workflow_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificacoes" (
    "id" TEXT NOT NULL,
    "tipo" "TipoNotificacao" NOT NULL,
    "destinatario" TEXT NOT NULL,
    "assunto" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "enviado" BOOLEAN NOT NULL DEFAULT false,
    "dataEnvio" TIMESTAMP(3),
    "erro" TEXT,
    "contexto" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contratos_publicos" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "objeto" TEXT NOT NULL,
    "cpv" TEXT,
    "precoBase" DOUBLE PRECISION,
    "dataPublicacao" TIMESTAMP(3) NOT NULL,
    "dataLimite" TIMESTAMP(3) NOT NULL,
    "link" TEXT NOT NULL,
    "regiao" TEXT,
    "setorAlvo" TEXT[],
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contratos_publicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "nif" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "nomeEmpresa" TEXT,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "cae" TEXT,
    "atividade" TEXT,
    "dimensaoDeclarada" TEXT,
    "faturacaoEstimada" DOUBLE PRECISION,
    "empregados" INTEGER,
    "distrito" TEXT,
    "concelho" TEXT,
    "scoreElegibilidade" INTEGER,
    "matchesInfo" JSONB,
    "status" TEXT NOT NULL DEFAULT 'NOVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "alertasAtivos" BOOLEAN NOT NULL DEFAULT false,
    "consentMarketing" BOOLEAN NOT NULL DEFAULT false,
    "lastAlertSentAt" TIMESTAMP(3),
    "investimentoVal" DOUBLE PRECISION,
    "tipoProjeto" TEXT,
    "lastDripEmailId" TEXT,
    "lastDripEmailSentAt" TIMESTAMP(3),
    "convertedAt" TIMESTAMP(3),
    "unsubscribedAt" TIMESTAMP(3),

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "channels" TEXT[],
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "quietFrom" TEXT,
    "quietTo" TEXT,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),

    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "TeamRole" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "milestones" (
    "id" TEXT NOT NULL,
    "candidaturaId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "dataLimite" TIMESTAMP(3) NOT NULL,
    "dataConclusao" TIMESTAMP(3),
    "estado" "MilestoneEstado" NOT NULL DEFAULT 'PENDENTE',
    "valorAssociado" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos_pagamento" (
    "id" TEXT NOT NULL,
    "candidaturaId" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "montante" DOUBLE PRECISION NOT NULL,
    "dataSubmissao" TIMESTAMP(3),
    "dataPagamento" TIMESTAMP(3),
    "estado" "PedidoPagamentoEstado" NOT NULL DEFAULT 'RASCUNHO',
    "documentos" TEXT[],
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedidos_pagamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidaturas_historicas" (
    "id" TEXT NOT NULL,
    "programa" TEXT NOT NULL,
    "subPrograma" TEXT,
    "cliente" TEXT NOT NULL,
    "ano" INTEGER,
    "montanteSolicitado" DOUBLE PRECISION,
    "montanteAprovado" DOUBLE PRECISION,
    "estadoFinal" "EstadoCandidaturaHistorica",
    "taxaCofinanciamento" DOUBLE PRECISION,
    "documentos" JSONB NOT NULL,
    "totalDocumentos" INTEGER NOT NULL DEFAULT 0,
    "ragStatus" "RagStatus" NOT NULL DEFAULT 'PENDING',
    "ragStoreId" TEXT,
    "ragIndexedAt" TIMESTAMP(3),
    "zipOrigem" TEXT NOT NULL,
    "prioridade" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidaturas_historicas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integrations" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "webhookUrl" TEXT,
    "accessToken" TEXT,
    "channelId" TEXT,
    "channelName" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "integrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "avisos_codigo_key" ON "avisos"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "empresas_nipc_key" ON "empresas"("nipc");

-- CreateIndex
CREATE UNIQUE INDEX "candidatura_section_states_candidaturaId_sectionId_key" ON "candidatura_section_states"("candidaturaId", "sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "leads_nif_key" ON "leads"("nif");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_userId_type_key" ON "notification_preferences"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_teamId_userId_key" ON "team_members"("teamId", "userId");

-- CreateIndex
CREATE INDEX "candidaturas_historicas_programa_ano_idx" ON "candidaturas_historicas"("programa", "ano");

-- CreateIndex
CREATE INDEX "candidaturas_historicas_cliente_idx" ON "candidaturas_historicas"("cliente");

-- CreateIndex
CREATE INDEX "candidaturas_historicas_estadoFinal_idx" ON "candidaturas_historicas"("estadoFinal");

-- CreateIndex
CREATE INDEX "candidaturas_historicas_ragStatus_idx" ON "candidaturas_historicas"("ragStatus");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aviso_chunks" ADD CONSTRAINT "aviso_chunks_avisoId_fkey" FOREIGN KEY ("avisoId") REFERENCES "avisos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "empresas" ADD CONSTRAINT "empresas_consultorId_fkey" FOREIGN KEY ("consultorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "empresas" ADD CONSTRAINT "empresas_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidaturas" ADD CONSTRAINT "candidaturas_avisoId_fkey" FOREIGN KEY ("avisoId") REFERENCES "avisos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidaturas" ADD CONSTRAINT "candidaturas_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidatura_section_states" ADD CONSTRAINT "candidatura_section_states_candidaturaId_fkey" FOREIGN KEY ("candidaturaId") REFERENCES "candidaturas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_logs" ADD CONSTRAINT "workflow_logs_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflows"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_candidaturaId_fkey" FOREIGN KEY ("candidaturaId") REFERENCES "candidaturas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos_pagamento" ADD CONSTRAINT "pedidos_pagamento_candidaturaId_fkey" FOREIGN KEY ("candidaturaId") REFERENCES "candidaturas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
