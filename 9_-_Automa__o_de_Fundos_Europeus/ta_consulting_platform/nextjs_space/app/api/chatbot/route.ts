
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClaudeClient } from '@/lib/claude';
import { getLLMConfig } from '@/lib/llm-config';
import { encontrarFAQRelevante, getFAQsContexto, getSugestoesAcoes } from '@/lib/chatbot-faqs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory = [] } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Mensagem é obrigatória' }, { status: 400 });
    }

    // Buscar dados relevantes da base de dados
    const [avisos, empresas, candidaturas] = await Promise.all([
      prisma.aviso.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          nome: true,
          codigo: true,
          descrição: true,
          portal: true,
          programa: true,
          linha: true,
          dataInicioSubmissao: true,
          dataFimSubmissao: true,
          montanteMinimo: true,
          montanteMaximo: true,
          ativo: true,
          urgente: true,
        },
      }),
      prisma.empresa.findMany({
        take: 20,
        select: {
          id: true,
          nome: true,
          nipc: true,
          setor: true,
          dimensao: true,
          regiao: true,
        },
      }),
      prisma.candidatura.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: {
          aviso: {
            select: {
              nome: true,
              portal: true,
            },
          },
          empresa: {
            select: {
              nome: true,
            },
          },
        },
      }),
    ]);

    // Identificar avisos urgentes (próximos 14 dias)
    const hoje = new Date();
    const daquiA14Dias = new Date();
    daquiA14Dias.setDate(hoje.getDate() + 14);

    const avisosUrgentes = avisos.filter((aviso) => {
      const dataFim = new Date(aviso.dataFimSubmissao);
      return aviso.ativo && dataFim >= hoje && dataFim <= daquiA14Dias;
    });

    // Buscar alertas e recomendações
    let alertasInfo = '';
    let recomendacoesInfo = '';

    try {
      // Buscar alertas de alta prioridade
      const baseUrl = request.url.split('/api/chatbot')[0];
      const alertasResponse = await fetch(`${baseUrl}/api/alertas?prioridade=alta`);
      if (alertasResponse.ok) {
        const alertasData = await alertasResponse.json();
        if (alertasData.alertas && alertasData.alertas.length > 0) {
          alertasInfo = `\n🚨 ALERTAS IMPORTANTES (${alertasData.alertas.length}):\n`;
          alertasData.alertas.slice(0, 3).forEach((alerta: any, index: number) => {
            alertasInfo += `${index + 1}. ${alerta.titulo}\n   ${alerta.mensagem}\n`;
          });
        }
      }

      // Buscar recomendações para a primeira empresa
      if (empresas.length > 0) {
        const recomendacoesResponse = await fetch(`${baseUrl}/api/recomendacoes?empresaId=${empresas[0].id}&limite=3&scoreMinimo=60`);
        if (recomendacoesResponse.ok) {
          const recomendacoesData = await recomendacoesResponse.json();
          if (recomendacoesData.recomendacoes && recomendacoesData.recomendacoes.length > 0) {
            recomendacoesInfo = `\n✨ RECOMENDAÇÕES IA PARA ${empresas[0].nome} (Top 3):\n`;
            recomendacoesData.recomendacoes.forEach((rec: any, index: number) => {
              recomendacoesInfo += `${index + 1}. ${rec.aviso.titulo}\n`;
              recomendacoesInfo += `   Score de Compatibilidade: ${rec.score}%\n`;
              recomendacoesInfo += `   Prioridade: ${rec.prioridade}\n`;
              if (rec.razoes.length > 0) {
                recomendacoesInfo += `   Razão: ${rec.razoes[0]}\n`;
              }
            });
          }
        }
      }
    } catch (error) {
      console.error('Erro ao buscar alertas/recomendações:', error);
    }

    // Construir contexto para o LLM
    const contexto = `
Você é o Assistente Inteligente da TA Consulting, especializado em apoios financeiros e fundos europeus para empresas portuguesas.

DADOS DISPONÍVEIS:

📋 AVISOS (${avisos.length} total, ${avisosUrgentes.length} urgentes):
${avisosUrgentes.slice(0, 10).map(a => `
- ${a.nome} [${a.portal}]
  Código: ${a.codigo}
  Programa: ${a.programa || 'N/A'}
  Linha: ${a.linha || 'N/A'}
  Abre: ${new Date(a.dataInicioSubmissao).toLocaleDateString('pt-PT')}
  Encerra: ${new Date(a.dataFimSubmissao).toLocaleDateString('pt-PT')}
  Montante Mín: ${a.montanteMinimo ? `€${a.montanteMinimo.toLocaleString('pt-PT')}` : 'N/A'}
  Montante Máx: ${a.montanteMaximo ? `€${a.montanteMaximo.toLocaleString('pt-PT')}` : 'N/A'}
  Status: ${a.ativo ? 'Ativo' : 'Inativo'}
`).join('\n')}

${avisos.length > 10 ? `\n... e mais ${avisos.length - 10} avisos disponíveis` : ''}

👥 EMPRESAS (${empresas.length} registadas):
${empresas.slice(0, 5).map(e => `
- ${e.nome} (NIPC: ${e.nipc})
  Setor: ${e.setor || 'N/A'}
  Dimensão: ${e.dimensao || 'N/A'}
  Região: ${e.regiao || 'N/A'}
`).join('\n')}

📝 CANDIDATURAS (${candidaturas.length} submetidas):
${candidaturas.slice(0, 5).map(c => `
- ${c.empresa?.nome || 'N/A'} → ${c.aviso?.nome || 'N/A'}
  Portal: ${c.aviso?.portal || 'N/A'}
  Estado: ${c.estado}
  Valor: ${c.montanteSolicitado ? `€${c.montanteSolicitado.toLocaleString('pt-PT')}` : 'N/A'}
  Data: ${new Date(c.createdAt).toLocaleDateString('pt-PT')}
`).join('\n')}
${alertasInfo}
${recomendacoesInfo}

CAPACIDADES ESPECIAIS:
- Sistema de Recomendações IA que analisa compatibilidade entre empresas e avisos
- Sistema de Alertas Inteligentes para prazos urgentes e oportunidades
- Análises detalhadas de compatibilidade com scoring de 0-100%
- Acesso à página "Recomendações IA" no dashboard para análises personalizadas

INSTRUÇÕES:
1. Responda SEMPRE em português de Portugal
2. Use os dados reais acima para responder com precisão
3. Se o utilizador perguntar por avisos específicos, mencione títulos, datas e valores REAIS
4. Se perguntar "que avisos estão abertos", liste os avisos urgentes com detalhes
5. Seja conversacional, profissional e útil
6. Use emojis apropriadamente (📋 🏢 💼 📊 ⏰ ✅)
7. Se o utilizador pedir "mais detalhes", forneça informações específicas dos avisos mencionados anteriormente
8. Mantenha as respostas concisas mas informativas (máximo 250 palavras)
9. NUNCA invente dados - use APENAS os dados fornecidos acima
10. Se não tiver informação, diga "Não tenho essa informação neste momento"
11. Quando perguntar sobre avisos adequados para uma empresa, mencione as RECOMENDAÇÕES IA acima
12. Se houver ALERTAS, mencione-os quando relevante para a conversa
13. Sugira sempre visitar a página "Recomendações IA" para análises detalhadas personalizadas
14. Use os scores de compatibilidade das recomendações quando discutir adequação de avisos
`;

    // Obter configuração do usuário
    const session = await getServerSession(authOptions);
    const config = await getLLMConfig(session?.user?.id);
    
    // Criar cliente Claude (usando Claude 4.5 Haiku para chatbot)
    const claudeClient = await createClaudeClient(session?.user?.id);

    // Construir mensagens para o LLM com histórico
    // Claude precisa do system prompt como primeira mensagem user
    const systemMessage = `${contexto}\n\nIMPORTANTE: Você está usando o modelo ${config.chatbotModel} para fornecer respostas rápidas e eficientes.`;
    
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
      { role: 'user', content: systemMessage },
      { role: 'assistant', content: 'Entendido. Estou pronto para ajudar com informações sobre avisos, candidaturas e fundos europeus.' },
      ...conversationHistory.slice(-6).map((msg: any) => ({
        role: msg.isBot ? 'assistant' : 'user',
        content: msg.text,
      })),
      { role: 'user', content: message },
    ];

    // Gerar resposta com streaming
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        try {
          for await (const chunk of claudeClient.generateStream(messages, {
            model: config.chatbotModel,
            maxTokens: 1000,
            temperature: 0.7
          })) {
            controller.enqueue(encoder.encode(chunk));
          }
        } catch (error) {
          console.error('Erro no stream Claude:', error);
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Erro no chatbot:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
