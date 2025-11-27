import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';

export const dynamic = 'force-dynamic';

// Sistema de alertas inteligentes
function gerarAlertas(empresas: any[], avisos: any[], candidaturas: any[]) {
  const alertas: any[] = [];
  const hoje = new Date();

  // 1. Alertas de prazos urgentes (< 7 dias)
  const avisosUrgentes = avisos.filter(aviso => {
    const dataLimite = new Date(aviso.dataFimSubmissao);
    const diasRestantes = Math.ceil((dataLimite.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return diasRestantes > 0 && diasRestantes <= 7;
  });

  avisosUrgentes.forEach(aviso => {
    const dataLimite = new Date(aviso.dataFimSubmissao);
    const diasRestantes = Math.ceil((dataLimite.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    
    alertas.push({
      id: `prazo-${aviso.id}`,
      tipo: 'prazo_urgente',
      prioridade: 'alta',
      titulo: `⚠️ Prazo Urgente: ${aviso.nome}`,
      mensagem: `Apenas ${diasRestantes} dia${diasRestantes > 1 ? 's' : ''} restante${diasRestantes > 1 ? 's' : ''} para submissão!`,
      aviso,
      dataAlerta: hoje,
      acao: {
        label: 'Ver Detalhes',
        url: `/dashboard/avisos?id=${aviso.id}`
      }
    });
  });

  // 2. Alertas de novos avisos (últimos 7 dias)
  const seteDiasAtras = new Date(hoje);
  seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);

  const avisosNovos = avisos.filter(aviso => {
    const dataPublicacao = new Date(aviso.createdAt);
    return dataPublicacao >= seteDiasAtras;
  });

  if (avisosNovos.length > 0) {
    alertas.push({
      id: 'novos-avisos',
      tipo: 'novos_avisos',
      prioridade: 'media',
      titulo: `🆕 ${avisosNovos.length} Novo${avisosNovos.length > 1 ? 's' : ''} Aviso${avisosNovos.length > 1 ? 's' : ''}`,
      mensagem: `Foram publicados ${avisosNovos.length} novo${avisosNovos.length > 1 ? 's' : ''} aviso${avisosNovos.length > 1 ? 's' : ''} nos últimos 7 dias.`,
      avisos: avisosNovos,
      dataAlerta: hoje,
      acao: {
        label: 'Ver Avisos',
        url: '/dashboard/avisos?filtro=novos'
      }
    });
  }

  // 3. Alertas de candidaturas pendentes
  const candidaturasPendentes = candidaturas.filter(c => c.estado === 'A_PREPARAR');
  
  candidaturasPendentes.forEach(candidatura => {
    // Encontrar o aviso correspondente
    const aviso = avisos.find(a => a.id === candidatura.avisoId);
    if (aviso) {
      const dataLimite = new Date(aviso.dataFimSubmissao);
      const diasRestantes = Math.ceil((dataLimite.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diasRestantes <= 14 && diasRestantes > 0) {
        alertas.push({
          id: `candidatura-${candidatura.id}`,
          tipo: 'candidatura_pendente',
          prioridade: diasRestantes <= 7 ? 'alta' : 'media',
          titulo: `📋 Candidatura em Preparação`,
          mensagem: `A candidatura "${aviso.nome}" está em preparação. ${diasRestantes} dias até o prazo.`,
          candidatura,
          aviso,
          dataAlerta: hoje,
          acao: {
            label: 'Continuar Candidatura',
            url: `/dashboard/candidaturas?id=${candidatura.id}`
          }
        });
      }
    }
  });

  // 4. Alertas de oportunidades de alto valor
  const avisosAltoValor = avisos.filter(aviso => {
    const montanteMax = aviso.montanteMaximo || 0;
    const dataLimite = new Date(aviso.dataFimSubmissao);
    const diasRestantes = Math.ceil((dataLimite.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    
    return montanteMax >= 500000 && diasRestantes > 14 && diasRestantes <= 60;
  });

  if (avisosAltoValor.length > 0) {
    alertas.push({
      id: 'oportunidades-alto-valor',
      tipo: 'oportunidade',
      prioridade: 'media',
      titulo: `💰 Oportunidades de Alto Valor`,
      mensagem: `${avisosAltoValor.length} programa${avisosAltoValor.length > 1 ? 's' : ''} com financiamento superior a €500.000 disponível${avisosAltoValor.length > 1 ? 's' : ''}.`,
      avisos: avisosAltoValor,
      dataAlerta: hoje,
      acao: {
        label: 'Ver Oportunidades',
        url: '/dashboard/avisos?filtro=alto-valor'
      }
    });
  }

  // 5. Alertas de documentação em falta
  candidaturas.filter(c => c.estado === 'A_PREPARAR').forEach(candidatura => {
    const empresa = empresas.find(e => e.id === candidatura.empresaId);
    if (empresa && empresa.documentos && empresa.documentos.length === 0) {
      alertas.push({
        id: `doc-${candidatura.id}`,
        tipo: 'documentacao',
        prioridade: 'baixa',
        titulo: `📄 Documentação Incompleta`,
        mensagem: `A empresa ${empresa.nome} precisa completar documentação para candidaturas.`,
        empresa,
        candidatura,
        dataAlerta: hoje,
        acao: {
          label: 'Gerir Documentos',
          url: `/dashboard/empresas?id=${empresa.id}`
        }
      });
    }
  });

  // Ordenar por prioridade
  const ordemPrioridade = { alta: 1, media: 2, baixa: 3 };
  alertas.sort((a, b) => ordemPrioridade[a.prioridade as keyof typeof ordemPrioridade] - ordemPrioridade[b.prioridade as keyof typeof ordemPrioridade]);

  return alertas;
}

// GET - Obter todos os alertas
export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const prioridade = searchParams.get('prioridade');
    const tipo = searchParams.get('tipo');

    // Buscar dados necessários
    const hoje = new Date();
    
    const [empresas, avisos, candidaturas] = await Promise.all([
      prisma.empresa.findMany({
        include: {
          documentos: true
        }
      }),
      prisma.aviso.findMany({
        where: {
          dataFimSubmissao: {
            gte: hoje
          },
          ativo: true
        }
      }),
      prisma.candidatura.findMany({
        include: {
          empresa: true,
          aviso: true
        }
      })
    ]);

    // Gerar alertas
    let alertas = gerarAlertas(empresas, avisos, candidaturas);

    // Aplicar filtros
    if (prioridade) {
      alertas = alertas.filter(a => a.prioridade === prioridade);
    }
    
    if (tipo) {
      alertas = alertas.filter(a => a.tipo === tipo);
    }

    return NextResponse.json({
      alertas,
      total: alertas.length,
      estatisticas: {
        alta: alertas.filter(a => a.prioridade === 'alta').length,
        media: alertas.filter(a => a.prioridade === 'media').length,
        baixa: alertas.filter(a => a.prioridade === 'baixa').length
      }
    });

  } catch (error) {
    console.error('Erro ao gerar alertas:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar alertas' },
      { status: 500 }
    );
  }
}
