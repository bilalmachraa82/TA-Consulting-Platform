/**
 * The Critic - Mock Audit Agent
 * 
 * AI-powered evaluation that simulates a strict grant evaluator.
 * Goes beyond eligibility (binary) to assess competitiveness (qualitative).
 * 
 * V2.0 Feature - Competitive advantage vs Granter.AI
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/db';
import {
    evaluateMatch,
    type LeadInput,
    type AvisoCriteria
} from '@/lib/eligibility-engine';

// ============ Types ============

export interface CriticInput {
    empresaId: string;
    avisoId: string;
    projetoProposto?: string;
}

export interface CriticRisk {
    category: 'ELIGIBILITY' | 'COMPETITIVENESS' | 'DOCUMENTATION' | 'TIMING';
    severity: 'CRITICO' | 'ALTO' | 'MEDIO' | 'BAIXO';
    description: string;
    mitigation?: string;
}

export interface CriticVerdict {
    approvalProbability: number;
    overallVerdict: 'FORTE' | 'VIÁVEL' | 'FRACO' | 'NÃO_CANDIDATAR';
    eligibilityScore: number;
    risks: CriticRisk[];
    recommendations: string[];
    missingDocuments: string[];
    estimatedPrepTime: string;
    reasoning: string;
}

// ============ Constants ============

const CRITIC_SYSTEM_PROMPT = `És um avaliador rigoroso de candidaturas a fundos europeus em Portugal.
O teu objetivo é ser MUITO EXIGENTE e identificar TODOS os pontos fracos de uma candidatura ANTES de ser submetida.

PERSONA: Imagina que és o avaliador mais estrito do painel. Se houver uma razão para rejeitar, tu encontras.

OUTPUTS ESPERADOS (JSON):
{
  "approvalProbability": 0-100,
  "overallVerdict": "FORTE" | "VIÁVEL" | "FRACO" | "NÃO_CANDIDATAR",
  "risks": [
    {
      "category": "ELIGIBILITY" | "COMPETITIVENESS" | "DOCUMENTATION" | "TIMING",
      "severity": "CRITICO" | "ALTO" | "MEDIO" | "BAIXO",
      "description": "...",
      "mitigation": "..."
    }
  ],
  "recommendations": ["..."],
  "missingDocuments": ["..."],
  "estimatedPrepTime": "X-Y semanas",
  "reasoning": "Resumo da análise em 2-3 frases"
}

REGRAS DE AVALIAÇÃO:
1. ELEGIBILIDADE (40%): CAE, dimensão, região, requisitos obrigatórios
2. COMPETITIVIDADE (30%): Diferenciação, inovação, impacto
3. DOCUMENTAÇÃO (20%): Completude do dossiê, validade de certidões
4. TIMING (10%): Prazo disponível vs. complexidade

SEVERIDADE:
- CRITICO: Candidatura será rejeitada automaticamente
- ALTO: Forte probabilidade de rejeição
- MEDIO: Pode baixar pontuação significativamente
- BAIXO: Melhoria recomendada mas não crítica`;

// ============ Core Logic ============

async function getEmpresaContext(empresaId: string) {
    const empresa = await prisma.empresa.findUnique({
        where: { id: empresaId },
        include: {
            documentos: true,
        },
    });

    if (!empresa) throw new Error(`Empresa não encontrada: ${empresaId}`);
    return empresa;
}

async function getAvisoContext(avisoId: string) {
    const aviso = await prisma.aviso.findUnique({
        where: { id: avisoId },
        include: {
            chunks: {
                take: 5,
                orderBy: { createdAt: 'desc' },
            },
        },
    });

    if (!aviso) throw new Error(`Aviso não encontrado: ${avisoId}`);
    return aviso;
}

function buildEligibilityInput(empresa: any): LeadInput {
    return {
        nomeEmpresa: empresa.nome,
        email: empresa.email,
        distrito: empresa.distrito || 'Lisboa',
        tipoProjetoDesejado: 'inovacao',
        cae: empresa.cae,
        dimensao: empresa.dimensao,
    };
}

function buildAvisoCriteria(aviso: any): AvisoCriteria {
    return {
        id: aviso.id,
        nome: aviso.nome,
        portal: aviso.portal,
        programa: aviso.programa,
        dataFimSubmissao: new Date(aviso.dataFimSubmissao),
        link: aviso.link,
        taxa: aviso.taxa,
        criterios: {
            dimensao: aviso.dimensaoEmpresa || [],
            regioes: aviso.regiao ? [aviso.regiao] : [],
            caePrefixos: aviso.setoresElegiveis || [],
        },
        documentosNecessarios: ['Certidão AT', 'Certidão SS', 'Certificado PME'],
    };
}

function checkDocumentCompleteness(documentos: any[]): string[] {
    const required = [
        { tipo: 'CERTIDAO_AT', nome: 'Certidão de não dívida às Finanças' },
        { tipo: 'CERTIDAO_SS', nome: 'Certidão de não dívida à Segurança Social' },
        { tipo: 'CERTIFICADO_PME', nome: 'Certificado PME (se aplicável)' },
    ];

    const missing: string[] = [];
    for (const req of required) {
        const found = documentos.find(d => d.tipoDocumento === req.tipo);
        if (!found) {
            missing.push(req.nome);
        } else if (found.statusValidade === 'EXPIRADO' || found.statusValidade === 'A_EXPIRAR') {
            missing.push(`${req.nome} (expirado/a expirar)`);
        }
    }
    return missing;
}

function getDaysUntilDeadline(dataFim: Date): number {
    const now = new Date();
    return Math.ceil((dataFim.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

// ============ Main Entry Point ============

export async function runCriticAudit(input: CriticInput): Promise<CriticVerdict> {
    const { empresaId, avisoId, projetoProposto } = input;

    // 1. Fetch data
    const empresa = await getEmpresaContext(empresaId);
    const aviso = await getAvisoContext(avisoId);

    // 2. Run deterministic eligibility check
    const leadInput = buildEligibilityInput(empresa);
    const avisoCriteria = buildAvisoCriteria(aviso);
    const eligibilityResult = evaluateMatch(leadInput, avisoCriteria);
    const eligibilityScore = eligibilityResult.score;

    // 3. Check documents
    const missingDocuments = checkDocumentCompleteness(empresa.documentos);

    // 4. Check timing
    const daysLeft = getDaysUntilDeadline(new Date(aviso.dataFimSubmissao));

    // 5. Build AI prompt
    const contextForAI = `
## EMPRESA
- Nome: ${empresa.nome}
- CAE: ${empresa.cae || 'N/A'}
- Dimensão: ${empresa.dimensao}
- Região: ${empresa.regiao || empresa.distrito || 'N/A'}
- Documentos em falta: ${missingDocuments.length > 0 ? missingDocuments.join(', ') : 'Nenhum'}

## AVISO
- Nome: ${aviso.nome}
- Portal: ${aviso.portal}
- Programa: ${aviso.programa}
- Taxa de financiamento: ${aviso.taxa || 'N/A'}
- Prazo: ${daysLeft} dias restantes
- Requisitos do aviso (RAG): ${aviso.chunks?.length > 0
            ? aviso.chunks.map((c: { content: string }) => c.content).join('\n').slice(0, 2000)
            : (aviso.descricao || 'Informação não disponível - consultar portal original')}

## ELEGIBILIDADE DETERMINÍSTICA
- Score: ${eligibilityScore}/100
- Match Dimensão: ${eligibilityResult.matchDetails.dimensaoMatch ? 'SIM' : 'NÃO'}
- Match Região: ${eligibilityResult.matchDetails.regiaoMatch ? 'SIM' : 'NÃO'}
- Match CAE: ${eligibilityResult.matchDetails.caeMatch ? 'SIM' : 'NÃO/Não confirmado'}
- Razões: ${eligibilityResult.reasons.join(', ')}
- Em falta: ${eligibilityResult.missing.join(', ')}

## PROJETO PROPOSTO
${projetoProposto || 'Não especificado - avaliar apenas elegibilidade geral'}

Responde APENAS com JSON válido.`;

    // 6. Call AI
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY não configurada');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        generationConfig: {
            responseMimeType: 'application/json',
        },
    });

    const result = await model.generateContent([
        { text: CRITIC_SYSTEM_PROMPT },
        { text: contextForAI },
    ]);

    const responseText = result.response.text();

    // 7. Parse AI response
    let aiVerdict: Partial<CriticVerdict>;
    try {
        aiVerdict = JSON.parse(responseText);
    } catch (e) {
        console.error('Failed to parse AI response:', responseText);
        aiVerdict = {
            approvalProbability: eligibilityScore,
            overallVerdict: eligibilityScore >= 70 ? 'VIÁVEL' : 'FRACO',
            risks: [],
            recommendations: ['Erro ao processar análise AI - revisar manualmente'],
            reasoning: 'Fallback para score de elegibilidade',
        };
    }

    // 8. Merge deterministic + AI results
    return {
        approvalProbability: aiVerdict.approvalProbability ?? eligibilityScore,
        overallVerdict: aiVerdict.overallVerdict ?? 'VIÁVEL',
        eligibilityScore,
        risks: aiVerdict.risks ?? [],
        recommendations: aiVerdict.recommendations ?? [],
        missingDocuments,
        estimatedPrepTime: aiVerdict.estimatedPrepTime ?? `${Math.ceil(daysLeft / 7)} semanas`,
        reasoning: aiVerdict.reasoning ?? '',
    };
}
