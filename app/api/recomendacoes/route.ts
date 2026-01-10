import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';

// Sistema de análise de compatibilidade
function calcularCompatibilidade(empresa: any, aviso: any): {
  score: number;
  razoes: string[];
  alertas: string[];
} {
  let score = 0;
  const razoes: string[] = [];
  const alertas: string[] = [];
  const maxScore = 100;

  // 1. Análise de setor (30 pontos)
  const setorEmpresa = empresa.setor?.toLowerCase() || '';
  const descricaoAviso = aviso.descricao?.toLowerCase() || '';
  const tituloAviso = aviso.nome?.toLowerCase() || '';

  const setoresTexto = `${descricaoAviso} ${tituloAviso}`;

  if (setorEmpresa && setoresTexto.includes(setorEmpresa)) {
    score += 30;
    razoes.push(`Setor ${empresa.setor} está alinhado com o aviso`);
  } else if (setorEmpresa) {
    score += 10;
    razoes.push(`Setor compatível, mas não específico`);
  }

  // 2. Análise de dimensão da empresa (20 pontos)
  const dimensao = empresa.dimensao?.toLowerCase() || '';

  if (setoresTexto.includes('pme') || setoresTexto.includes('micro') || setoresTexto.includes('pequena')) {
    if (dimensao === 'micro' || dimensao === 'pequena') {
      score += 20;
      razoes.push(`Dimensão ${dimensao} adequada para o programa`);
    } else {
      score += 5;
      alertas.push(`Este programa pode ser mais adequado para PMEs`);
    }
  } else {
    score += 15;
    razoes.push(`Sem restrições específicas de dimensão`);
  }

  // 3. Análise de localização (15 pontos)
  const regiaoEmpresa = empresa.regiao?.toLowerCase() || '';

  if (regiaoEmpresa && setoresTexto.includes(regiaoEmpresa)) {
    score += 15;
    razoes.push(`Localização em ${empresa.regiao} beneficia este programa`);
  } else if (regiaoEmpresa) {
    score += 10;
    razoes.push(`Programa disponível na sua região`);
  }

  // 4. Análise de prazo (20 pontos)
  const hoje = new Date();
  const dataLimite = new Date(aviso.dataFimSubmissao);
  const diasRestantes = Math.ceil((dataLimite.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

  if (diasRestantes > 30) {
    score += 20;
    razoes.push(`Prazo confortável: ${diasRestantes} dias para submissão`);
  } else if (diasRestantes > 14) {
    score += 15;
    razoes.push(`Prazo adequado: ${diasRestantes} dias para submissão`);
    alertas.push(`Recomendamos iniciar preparação em breve`);
  } else if (diasRestantes > 0) {
    score += 10;
    alertas.push(`⚠️ URGENTE: Apenas ${diasRestantes} dias restantes!`);
  } else {
    score = 0;
    alertas.push(`❌ Prazo expirado`);
    return { score, razoes: [], alertas };
  }

  // 5. Análise de montante (15 pontos)
  const montanteMax = aviso.montanteMaximo || 0;

  if (montanteMax > 500000) {
    score += 15;
    razoes.push(`Financiamento significativo disponível: até €${montanteMax.toLocaleString()}`);
  } else if (montanteMax > 100000) {
    score += 12;
    razoes.push(`Bom montante disponível: até €${montanteMax.toLocaleString()}`);
  } else if (montanteMax > 0) {
    score += 8;
    razoes.push(`Montante disponível: até €${montanteMax.toLocaleString()}`);
  }

  return { score, razoes, alertas };
}

// GET - Obter recomendações para uma empresa
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const empresaId = searchParams.get('empresaId');
    const limite = parseInt(searchParams.get('limite') || '10');
    const scoreMinimo = parseInt(searchParams.get('scoreMinimo') || '40');

    if (!empresaId) {
      return NextResponse.json({ error: 'ID da empresa é obrigatório' }, { status: 400 });
    }

    // Buscar dados da empresa
    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaId }
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

    // Calcular compatibilidade para cada aviso
    type AvisoType = typeof avisos[number];
    type RecomendacaoType = { aviso: AvisoType; score: number; razoes: string[]; alertas: string[]; prioridade: string };

    const recomendacoes = avisos.map((aviso: AvisoType) => {
      const analise = calcularCompatibilidade(empresa, aviso);
      return {
        aviso,
        score: analise.score,
        razoes: analise.razoes,
        alertas: analise.alertas,
        prioridade: analise.score >= 80 ? 'alta' : analise.score >= 60 ? 'média' : 'baixa'
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

    const { empresaId, avisoId } = await request.json();

    if (!empresaId || !avisoId) {
      return NextResponse.json({ error: 'IDs são obrigatórios' }, { status: 400 });
    }

    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaId }
    });

    const aviso = await prisma.aviso.findUnique({
      where: { id: avisoId }
    });

    if (!empresa || !aviso) {
      return NextResponse.json({ error: 'Empresa ou aviso não encontrado' }, { status: 404 });
    }

    const analise = calcularCompatibilidade(empresa, aviso);

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
        prioridade: analise.score >= 80 ? 'alta' : analise.score >= 60 ? 'média' : 'baixa'
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
