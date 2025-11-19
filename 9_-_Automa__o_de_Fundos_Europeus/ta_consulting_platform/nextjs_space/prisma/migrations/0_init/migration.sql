-- CreateEnum
CREATE TYPE "Portal" AS ENUM ('PORTUGAL2030', 'PAPAC', 'PRR');

-- CreateEnum
CREATE TYPE "DimensaoEmpresa" AS ENUM ('MICRO', 'PEQUENA', 'MEDIA', 'GRANDE');

-- CreateEnum
CREATE TYPE "EstadoCandidatura" AS ENUM ('A_PREPARAR', 'SUBMETIDA', 'EM_ANALISE', 'APROVADA', 'REJEITADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('CERTIDAO_AT', 'CERTIDAO_SS', 'CERTIFICADO_PME', 'LICENCA_ATIVIDADE', 'BALANCO', 'DEMONSTRACOES_FINANCEIRAS', 'OUTRO');

-- CreateEnum
CREATE TYPE "StatusValidade" AS ENUM ('VALIDO', 'A_EXPIRAR', 'EXPIRADO', 'EM_FALTA');

-- CreateEnum
CREATE TYPE "TipoWorkflow" AS ENUM ('SCRAPING_PORTUGAL2030', 'SCRAPING_PAPAC', 'SCRAPING_PRR', 'NOTIFICACAO_EMAIL', 'VALIDACAO_DOCUMENTOS', 'RELATORIO_MENSAL');

-- CreateEnum
CREATE TYPE "TipoNotificacao" AS ENUM ('AVISO_URGENTE', 'DOCUMENTO_EXPIRA', 'CANDIDATURA_UPDATE', 'RELATORIO_MENSAL', 'SISTEMA');

-- CreateEnum
CREATE TYPE "LLMProvider" AS ENUM ('ABACUS_AI', 'ANTHROPIC', 'OPENAI');

-- CreateEnum
CREATE TYPE "StatusMemoria" AS ENUM ('RASCUNHO', 'EM_GERACAO', 'GERADA', 'APROVADA', 'ARQUIVADA', 'ERRO');

-- CreateEnum
CREATE TYPE "StatusSeccao" AS ENUM ('NAO_GERADA', 'EM_GERACAO', 'GERADA', 'EDITADA_MANUAL', 'APROVADA');

-- CreateEnum
CREATE TYPE "TipoKnowledge" AS ENUM ('AVISO_EXEMPLO', 'MEMORIA_EXEMPLO', 'TEMPLATE', 'BEST_PRACTICE', 'GLOSSARIO', 'REQUISITO_LEGAL');

-- CreateEnum
CREATE TYPE "EnrichmentStatus" AS ENUM ('BASIC', 'ENHANCED', 'AI_ENRICHED', 'MANUAL_VERIFIED', 'VALIDATION_FAILED');

-- CreateEnum
CREATE TYPE "AbrangenciaGeografica" AS ENUM ('REGIONAL', 'NACIONAL', 'CONTINENTAL', 'EUROPEU');

-- CreateEnum
CREATE TYPE "TipoBeneficiario" AS ENUM ('EMPRESAS', 'ASSOCIACOES', 'AUTARQUIAS', 'ONG', 'COOPERATIVAS', 'IPSS', 'ENSINO_INVESTIGACAO', 'PARTICULARES');

-- CreateEnum
CREATE TYPE "FundoEstrutural" AS ENUM ('FEDER', 'FSE_PLUS', 'FC', 'FTJ', 'FEAMPA');

-- CreateEnum
CREATE TYPE "RegimeAuxilio" AS ENUM ('GBER', 'DE_MINIMIS', 'NAO_APLICAVEL', 'AUXILIO_ESTATAL_NOTIFICADO');

-- CreateEnum
CREATE TYPE "CategoriaInvestimento" AS ENUM ('EQUIPAMENTO', 'CONSTRUCAO', 'SOFTWARE', 'FORMACAO', 'CONSULTORIA', 'ESTUDOS', 'MARKETING', 'CERTIFICACAO', 'INOVACAO', 'INVESTIGACAO');

-- CreateEnum
CREATE TYPE "TipoOperacao" AS ENUM ('INVESTIMENTO', 'FORMACAO', 'ESTUDOS', 'CONSULTORIA', 'MISTO');

-- CreateEnum
CREATE TYPE "TipoApoio" AS ENUM ('SUBSIDIO', 'CREDITO', 'GARANTIA', 'MISTO');

-- CreateEnum
CREATE TYPE "TipoSubmissao" AS ENUM ('BALCAO', 'CONCURSO', 'CONTINUA');

-- CreateEnum
CREATE TYPE "PDFStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'SKIPPED');

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
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

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
    "enrichmentStatus" "EnrichmentStatus" NOT NULL DEFAULT 'BASIC',
    "enrichmentScore" DOUBLE PRECISION,
    "dataSourceLog" JSONB,
    "lastEnrichedAt" TIMESTAMP(3),
    "enrichedBy" TEXT,
    "taxaCofinanciamentoMin" DOUBLE PRECISION,
    "taxaCofinanciamentoMax" DOUBLE PRECISION,
    "taxaGrandeEmpresa" DOUBLE PRECISION,
    "taxaMediaEmpresa" DOUBLE PRECISION,
    "taxaPequenaEmpresa" DOUBLE PRECISION,
    "taxaMicroEmpresa" DOUBLE PRECISION,
    "limiteMinimoCandidatura" DECIMAL(15,2),
    "limiteMaximoCandidatura" DECIMAL(15,2),
    "limiteMaximoEmpresa" DECIMAL(15,2),
    "comparticipacaoPublicaMax" DOUBLE PRECISION,
    "contribuicaoPropriaMin" DOUBLE PRECISION,
    "percentagemFNR" DOUBLE PRECISION,
    "regiaoNUTS2" TEXT,
    "regiaoNUTS3" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "municipiosElegiveis" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "abrangenciaGeografica" "AbrangenciaGeografica",
    "limitacaoTerritorial" TEXT,
    "caeElegiveis" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "caeExcluidos" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "tiposBeneficiarios" "TipoBeneficiario"[] DEFAULT ARRAY[]::"TipoBeneficiario"[],
    "formaJuridicaRequerida" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "situacaoRegularizada" BOOLEAN NOT NULL DEFAULT true,
    "antiguidadeMinima" INTEGER,
    "trabalhadoresMinimo" INTEGER,
    "volumeNegociosMinimo" DECIMAL(15,2),
    "criacaoEmpregoObrigatoria" BOOLEAN NOT NULL DEFAULT false,
    "fundoEstruturalPrincipal" "FundoEstrutural",
    "fundosCofinanciamento" JSONB,
    "programaOperacionalCodigo" TEXT,
    "eixoPrioritario" TEXT,
    "prioridadeInvestimento" TEXT,
    "objetivoEspecificoCodigo" TEXT,
    "regimeAuxilio" "RegimeAuxilio",
    "artigoGBER" TEXT,
    "categoriasInvestimentoElegiveis" "CategoriaInvestimento"[] DEFAULT ARRAY[]::"CategoriaInvestimento"[],
    "custosElegiveis" JSONB,
    "custosNaoElegiveis" JSONB,
    "tipoOperacao" "TipoOperacao",
    "tipoApoio" "TipoApoio",
    "reembolsavel" BOOLEAN NOT NULL DEFAULT false,
    "duracaoMinimaProjeto" INTEGER,
    "duracaoMaximaProjeto" INTEGER,
    "prazoExecucaoMeses" INTEGER,
    "periodoManutencaoAnos" INTEGER,
    "apresentacaoPlanoNegocios" BOOLEAN NOT NULL DEFAULT false,
    "parecerTecnicoObrigatorio" BOOLEAN NOT NULL DEFAULT false,
    "estudoViabilidadeObrigatorio" BOOLEAN NOT NULL DEFAULT false,
    "tipoSubmissao" "TipoSubmissao",
    "fasesSubmissao" INTEGER NOT NULL DEFAULT 1,
    "prazoReclamacao" INTEGER,
    "dataDecisaoEstimada" TIMESTAMP(3),
    "prazoContratacaoDias" INTEGER,
    "documentosObrigatorios" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "declaracoesNecessarias" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "regulamentoURL" TEXT,
    "anexosRegulamento" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "baseLegalPrincipal" TEXT,
    "normativoComunitario" TEXT,
    "pdfStoragePath" TEXT,
    "pdfHash" TEXT,
    "pdfDownloadStatus" "PDFStatus" DEFAULT 'NOT_STARTED',
    "pdfDownloadedAt" TIMESTAMP(3),
    "pdfExtractionStatus" "PDFStatus" DEFAULT 'NOT_STARTED',
    "pdfExtractedText" TEXT,
    "pdfExtractionQuality" DOUBLE PRECISION,
    "pdfMetadata" JSONB,
    "migratedFromLegacy" BOOLEAN NOT NULL DEFAULT false,
    "migrationVersion" TEXT,
    "migrationErrors" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "avisos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avisos_legacy_snapshot" (
    "id" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avisos_legacy_snapshot_pkey" PRIMARY KEY ("id")
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

    CONSTRAINT "empresas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidaturas" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "avisoId" TEXT NOT NULL,
    "estado" "EstadoCandidatura" NOT NULL DEFAULT 'A_PREPARAR',
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
CREATE TABLE "api_configs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "LLMProvider" NOT NULL DEFAULT 'ABACUS_AI',
    "abacusApiKey" TEXT,
    "anthropicApiKey" TEXT,
    "openaiApiKey" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "chatbotModel" TEXT NOT NULL DEFAULT 'claude-4-5-haiku',
    "memoriaModel" TEXT NOT NULL DEFAULT 'claude-4-5-sonnet',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memorias_descritivas" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "avisoId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "status" "StatusMemoria" NOT NULL DEFAULT 'RASCUNHO',
    "dadosEmpresa" JSONB NOT NULL,
    "dadosAviso" JSONB NOT NULL,
    "dadosProjeto" JSONB,
    "modeloUsado" TEXT,
    "tempoGeracao" INTEGER,
    "qualityScore" DOUBLE PRECISION,
    "erros" TEXT[],
    "warnings" TEXT[],
    "versao" INTEGER NOT NULL DEFAULT 1,
    "versaoAnterior" TEXT,
    "docxPath" TEXT,
    "pdfPath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "memorias_descritivas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memoria_seccoes" (
    "id" TEXT NOT NULL,
    "memoriaId" TEXT NOT NULL,
    "numeroSeccao" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "status" "StatusSeccao" NOT NULL DEFAULT 'NAO_GERADA',
    "tempoGeracao" INTEGER,
    "tokenCount" INTEGER,
    "tabelas" JSONB[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "memoria_seccoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_base" (
    "id" TEXT NOT NULL,
    "tipo" "TipoKnowledge" NOT NULL,
    "titulo" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "embedding" TEXT,
    "metadados" JSONB,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_base_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_rules" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "programa" TEXT NOT NULL,
    "versao" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "baseLegal" TEXT NOT NULL,
    "formula" TEXT,
    "severidade" TEXT NOT NULL,
    "notas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "compliance_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_checks" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "candidaturaId" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "valorEsperado" TEXT,
    "valorObtido" TEXT,
    "notas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "evidencias" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkedBy" TEXT,
    "programa" TEXT NOT NULL,
    "versao" TEXT NOT NULL,

    CONSTRAINT "compliance_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_evidences" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "documentoId" TEXT NOT NULL,
    "sha256Hash" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "signedBy" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "fileSize" INTEGER,
    "mimeType" TEXT,

    CONSTRAINT "document_evidences_pkey" PRIMARY KEY ("id")
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
CREATE INDEX "avisos_enrichmentStatus_idx" ON "avisos"("enrichmentStatus");

-- CreateIndex
CREATE INDEX "avisos_enrichmentScore_idx" ON "avisos"("enrichmentScore");

-- CreateIndex
CREATE INDEX "avisos_portal_enrichmentStatus_idx" ON "avisos"("portal", "enrichmentStatus");

-- CreateIndex
CREATE INDEX "avisos_regiaoNUTS2_idx" ON "avisos"("regiaoNUTS2");

-- CreateIndex
CREATE INDEX "avisos_regimeAuxilio_idx" ON "avisos"("regimeAuxilio");

-- CreateIndex
CREATE UNIQUE INDEX "empresas_nipc_key" ON "empresas"("nipc");

-- CreateIndex
CREATE UNIQUE INDEX "memoria_seccoes_memoriaId_numeroSeccao_key" ON "memoria_seccoes"("memoriaId", "numeroSeccao");

-- CreateIndex
CREATE INDEX "compliance_rules_programa_versao_ativo_idx" ON "compliance_rules"("programa", "versao", "ativo");

-- CreateIndex
CREATE INDEX "compliance_rules_categoria_idx" ON "compliance_rules"("categoria");

-- CreateIndex
CREATE INDEX "compliance_rules_severidade_idx" ON "compliance_rules"("severidade");

-- CreateIndex
CREATE UNIQUE INDEX "compliance_rules_programa_versao_ruleId_key" ON "compliance_rules"("programa", "versao", "ruleId");

-- CreateIndex
CREATE INDEX "compliance_checks_candidaturaId_status_idx" ON "compliance_checks"("candidaturaId", "status");

-- CreateIndex
CREATE INDEX "compliance_checks_ruleId_idx" ON "compliance_checks"("ruleId");

-- CreateIndex
CREATE INDEX "compliance_checks_programa_versao_idx" ON "compliance_checks"("programa", "versao");

-- CreateIndex
CREATE INDEX "compliance_checks_timestamp_idx" ON "compliance_checks"("timestamp");

-- CreateIndex
CREATE INDEX "document_evidences_documentoId_idx" ON "document_evidences"("documentoId");

-- CreateIndex
CREATE INDEX "document_evidences_sha256Hash_idx" ON "document_evidences"("sha256Hash");

-- CreateIndex
CREATE INDEX "document_evidences_timestamp_idx" ON "document_evidences"("timestamp");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidaturas" ADD CONSTRAINT "candidaturas_avisoId_fkey" FOREIGN KEY ("avisoId") REFERENCES "avisos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidaturas" ADD CONSTRAINT "candidaturas_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_logs" ADD CONSTRAINT "workflow_logs_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflows"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memorias_descritivas" ADD CONSTRAINT "memorias_descritivas_avisoId_fkey" FOREIGN KEY ("avisoId") REFERENCES "avisos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memorias_descritivas" ADD CONSTRAINT "memorias_descritivas_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memoria_seccoes" ADD CONSTRAINT "memoria_seccoes_memoriaId_fkey" FOREIGN KEY ("memoriaId") REFERENCES "memorias_descritivas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_checks" ADD CONSTRAINT "compliance_checks_candidaturaId_fkey" FOREIGN KEY ("candidaturaId") REFERENCES "candidaturas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_checks" ADD CONSTRAINT "compliance_checks_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "compliance_rules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_evidences" ADD CONSTRAINT "document_evidences_documentoId_fkey" FOREIGN KEY ("documentoId") REFERENCES "documentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

