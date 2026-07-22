import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { empresaScope } from '@/lib/auth/tenant';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limiter';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { calculateCompatibility, getCompatibilityPriority } from '@/lib/compatibility';
import { analisarElegibilidade } from '@/lib/eligibility-analysis';

export const dynamic = 'force-dynamic';

// GET - Obter recomendações para uma empresa
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const ip = getClientIP(request);
    const rateLimit = checkRateLimit(`recomendacoes:${ip}`, RATE_LIMITS.API_GENERAL);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Demasiadas requisições. Tente novamente mais tarde.' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const empresaId = searchParams.get('empresaId');
    const limite = parseInt(searchParams.get('limite') || '10');
    const scoreMinimo = parseInt(searchParams.get('scoreMinimo') || '40');

    if (!empresaId) {
      return NextResponse.json({ error: 'ID da empresa é obrigatório' }, { status: 400 });
    }

    // Buscar dados da empresa
    const empresa = await prisma.empresa.findFirst({
      where: { AND: [{ id: empresaId }, empresaScope(session)] }
    });

    if (!empresa) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });
    }

    // Buscar avisos ativos (com prazo não expirado)
    const hoje = new Date();
    const avisos = await prisma.aviso.findMany({
      where: {
        dataFimSubmissao: {
          gte: hoje
        },
        ativo: true
      },
      orderBy: {
        dataFimSubmissao: 'asc'
      }
    });

    // Calcular compatibilidade para cada aviso.
    // Análise explicável (gap analysis) usando os campos estruturados do aviso;
    // quando o aviso tem critérios estruturados, o veredicto/score vêm dela —
    // caso contrário, cai no scoring de texto legado (calculateCompatibility).
    type AvisoType = typeof avisos[number];
    type RecomendacaoType = { aviso: AvisoType; score: number; razoes: string[]; alertas: string[]; prioridade: string; elegibilidade: ReturnType<typeof analisarElegibilidade> };

    const recomendacoes = avisos.map((aviso: AvisoType) => {
      const elegibilidade = analisarElegibilidade(
        { cae: empresa.cae, setor: empresa.setor, dimensao: empresa.dimensao, regiao: empresa.regiao, nut: empresa.nut },
        {
          nome: aviso.nome, descricao: aviso.descricao, dataFimSubmissao: aviso.dataFimSubmissao,
          montanteMinimo: aviso.montanteMinimo, montanteMaximo: aviso.montanteMaximo,
          caeElegiveis: aviso.caeElegiveis, tiposBeneficiarios: aviso.tiposBeneficiarios as string[],
          regiaoNUTS2: aviso.regiaoNUTS2, regiaoNUTS3: aviso.regiaoNUTS3, dimensaoEmpresa: aviso.dimensaoEmpresa,
          abrangenciaGeografica: aviso.abrangenciaGeografica,
        },
        hoje,
      );
      const legado = calculateCompatibility(empresa, aviso, hoje);
      const usarExplicavel = elegibilidade.veredicto !== 'dados_insuficientes';
      const score = usarExplicavel ? elegibilidade.score : legado.score;
      return {
        aviso,
        score,
        razoes: usarExplicavel ? elegibilidade.criterios.filter((c) => c.estado === 'ok').map((c) => c.explicacao) : legado.razoes,
        alertas: usarExplicavel ? elegibilidade.criterios.filter((c) => c.estado === 'falha' || c.estado === 'atencao').map((c) => c.explicacao) : legado.alertas,
        prioridade: getCompatibilityPriority(score),
        elegibilidade,
      };
    });

    // Filtrar e ordenar por score
    const recomendacoesFiltradas = recomendacoes
      .filter((r: RecomendacaoType) => r.score >= scoreMinimo)
      .sort((a: RecomendacaoType, b: RecomendacaoType) => b.score - a.score)
      .slice(0, limite);

    return NextResponse.json({
      empresa: {
        id: empresa.id,
        nome: empresa.nome,
        setor: empresa.setor,
        regiao: empresa.regiao,
        dimensao: empresa.dimensao
      },
      recomendacoes: recomendacoesFiltradas,
      total: recomendacoesFiltradas.length,
      totalAvisos: avisos.length
    });

  } catch (error) {
    console.error('Erro ao gerar recomendações:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar recomendações' },
      { status: 500 }
    );
  }
}

// POST - Gerar análise detalhada de compatibilidade
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const ip = getClientIP(request);
    const rateLimit = checkRateLimit(`recomendacoes-post:${ip}`, RATE_LIMITS.API_GENERAL);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Demasiadas requisições. Tente novamente mais tarde.' },
        { status: 429 }
      );
    }

    const { empresaId, avisoId } = await request.json();

    if (!empresaId || !avisoId) {
      return NextResponse.json({ error: 'IDs são obrigatórios' }, { status: 400 });
    }

    const empresa = await prisma.empresa.findFirst({
      where: { AND: [{ id: empresaId }, empresaScope(session)] }
    });

    const aviso = await prisma.aviso.findUnique({
      where: { id: avisoId }
    });

    if (!empresa || !aviso) {
      return NextResponse.json({ error: 'Empresa ou aviso não encontrado' }, { status: 404 });
    }

    const analise = calculateCompatibility(empresa, aviso);

    // Gerar recomendações adicionais usando Gemini 2.5 Flash (Verified for EU Funding)
    let recomendacoesIA = null;
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
          generationConfig: {
            maxOutputTokens: 300,
            temperature: 0.3,
          },
        });

        const diasRestantes = Math.ceil((new Date(aviso.dataFimSubmissao).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        const montante = aviso.montanteMaximo ? `€${aviso.montanteMaximo.toLocaleString()}` : 'N/A';

        const prompt = `ROLE: Analista sénior fundos EU (PT2030/PRR).

EMPRESA: ${empresa.nome} | CAE: ${empresa.cae || empresa.setor || '❓ NÃO DEFINIDO'} | ${empresa.dimensao || 'N/A'} | ${empresa.regiao || 'Nacional'}

AVISO: ${aviso.nome} (${aviso.portal})
Prazo: ${diasRestantes} dias | Montante: ${montante}
Score Base: ${analise.score}%

RESPONDE APENAS JSON (sem markdown):
{
  "veredicto": "APTO" ou "RISCO" ou "EXCLUÍDO",
  "probabilidadeAprovacao": número 0-100,
  "sumarioExecutivo": "máx 20 palavras",
  "pontosFortes": ["máx 2 bullets curtos"],
  "riscosCriticos": ["máx 2 bullets curtos"],
  "acaoImediata": "1 ação concreta máx 10 palavras",
  "documentosPrioritarios": ["máx 2 docs específicos"],
  "alertaEspecial": null ou "string se crítico"
}

REGRAS ABSOLUTAS:
- Se CAE = "❓" ou vazio → veredicto="RISCO", alertaEspecial menciona
- Se prazo < 15d → alertaEspecial menciona urgência
- probabilidadeAprovacao deve ser REALISTA, não optimista`;

        const result = await model.generateContent(prompt);
        const rawOutput = result.response.text();

        // Post-processing: Clean and validate JSON
        try {
          // Remove markdown code blocks if present
          let cleanOutput = rawOutput
            .replace(/```json\s*/gi, '')
            .replace(/```\s*/gi, '')
            .trim();

          // Try to parse JSON
          const parsed = JSON.parse(cleanOutput);

          // Validate required fields
          if (parsed.veredicto && parsed.probabilidadeAprovacao !== undefined) {
            // Truncate any overly long fields
            if (parsed.sumarioExecutivo && parsed.sumarioExecutivo.length > 150) {
              parsed.sumarioExecutivo = parsed.sumarioExecutivo.substring(0, 150) + '...';
            }
            recomendacoesIA = JSON.stringify(parsed);
          } else {
            // Invalid structure, create fallback
            recomendacoesIA = JSON.stringify({
              veredicto: analise.score >= 70 ? 'APTO' : 'RISCO',
              probabilidadeAprovacao: analise.score,
              sumarioExecutivo: 'Análise baseada em critérios padrão.',
              pontosFortes: analise.razoes.slice(0, 2),
              riscosCriticos: analise.alertas.slice(0, 2),
              acaoImediata: 'Verificar documentação obrigatória.',
              documentosPrioritarios: ['Certidão PME', 'IES'],
              alertaEspecial: analise.alertas.length > 0 ? analise.alertas[0] : null
            });
          }
        } catch (parseError) {
          // JSON parse failed, create structured fallback
          console.warn('AI output not valid JSON, using fallback');
          recomendacoesIA = JSON.stringify({
            veredicto: analise.score >= 70 ? 'APTO' : 'RISCO',
            probabilidadeAprovacao: analise.score,
            sumarioExecutivo: 'Análise automática baseada em critérios de elegibilidade.',
            pontosFortes: analise.razoes.slice(0, 2),
            riscosCriticos: analise.alertas.slice(0, 2),
            acaoImediata: 'Preparar documentação base.',
            documentosPrioritarios: ['Certidão PME', 'IES'],
            alertaEspecial: analise.alertas.length > 0 ? analise.alertas[0] : null
          });
        }
      }
    } catch (error) {
      console.error('Erro ao gerar recomendações Gemini:', error);
    }

    return NextResponse.json({
      empresa,
      aviso,
      analise: {
        score: analise.score,
        razoes: analise.razoes,
        alertas: analise.alertas,
        prioridade: getCompatibilityPriority(analise.score)
      },
      recomendacoesIA
    });

  } catch (error) {
    console.error('Erro ao gerar análise:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar análise' },
      { status: 500 }
    );
  }
}
