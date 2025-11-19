
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { StatusValidade } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Esta API verifica todos os documentos e:
// 1. Atualiza o statusValidade
// 2. Envia emails de alerta para documentos a expirar

export async function POST(request: Request) {
  try {
    // 🔒 SECURITY: Require either CRON_SECRET or authenticated ADMIN
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Check if it's a cron job with valid secret
    const isValidCron = cronSecret && authHeader === `Bearer ${cronSecret}`;

    // If not a valid cron, require admin authentication
    if (!isValidCron) {
      const session = await getServerSession(authOptions);

      if (!session) {
        return NextResponse.json(
          { error: 'Unauthorized - Authentication required' },
          { status: 401 }
        );
      }

      if (session.user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Forbidden - Admin access required' },
          { status: 403 }
        );
      }
    }

    const hoje = new Date();
    const em7Dias = new Date(hoje);
    em7Dias.setDate(em7Dias.getDate() + 7);

    const em15Dias = new Date(hoje);
    em15Dias.setDate(em15Dias.getDate() + 15);

    const em30Dias = new Date(hoje);
    em30Dias.setDate(em30Dias.getDate() + 30);

    // Buscar todos os documentos com dataValidade
    const documentos = await prisma.documento.findMany({
      where: {
        dataValidade: {
          not: null,
        },
      },
      include: {
        empresa: true,
      },
    });

    const alertas = {
      expirados: [] as any[],
      expiramEm7Dias: [] as any[],
      expiramEm15Dias: [] as any[],
      expiramEm30Dias: [] as any[],
      atualizados: 0,
    };

    for (const doc of documentos) {
      if (!doc.dataValidade) continue;

      const dataValidade = new Date(doc.dataValidade);
      let novoStatus: StatusValidade = StatusValidade.VALIDO;

      // Determinar novo status
      if (dataValidade < hoje) {
        novoStatus = StatusValidade.EXPIRADO;
        alertas.expirados.push(doc);
      } else if (dataValidade <= em30Dias) {
        novoStatus = StatusValidade.A_EXPIRAR;

        if (dataValidade <= em7Dias) {
          alertas.expiramEm7Dias.push(doc);
        } else if (dataValidade <= em15Dias) {
          alertas.expiramEm15Dias.push(doc);
        } else {
          alertas.expiramEm30Dias.push(doc);
        }
      }

      // Atualizar status se mudou
      if (doc.statusValidade !== novoStatus) {
        await prisma.documento.update({
          where: { id: doc.id },
          data: { statusValidade: novoStatus },
        });
        alertas.atualizados++;
      }
    }

    // Criar notificações para envio de emails
    await criarNotificacoesEmail(alertas);

    // Log da execução
    const workflowValidacao = await prisma.workflow.findFirst({
      where: { tipo: 'VALIDACAO_DOCUMENTOS' },
    });

    if (workflowValidacao) {
      await prisma.workflowLog.create({
        data: {
          workflowId: workflowValidacao.id,
          dataExecucao: hoje,
          sucesso: true,
          mensagem: `Verificação concluída. ${alertas.atualizados} documentos atualizados.`,
          dados: {
            expirados: alertas.expirados.length,
            em7dias: alertas.expiramEm7Dias.length,
            em15dias: alertas.expiramEm15Dias.length,
            em30dias: alertas.expiramEm30Dias.length,
          },
        },
      });

      await prisma.workflow.update({
        where: { id: workflowValidacao.id },
        data: {
          ultimaExecucao: hoje,
          proximaExecucao: new Date(hoje.getTime() + 24 * 60 * 60 * 1000), // +1 dia
        },
      });
    }

    return NextResponse.json({
      success: true,
      alertas: {
        expirados: alertas.expirados.length,
        expiramEm7Dias: alertas.expiramEm7Dias.length,
        expiramEm15Dias: alertas.expiramEm15Dias.length,
        expiramEm30Dias: alertas.expiramEm30Dias.length,
        atualizados: alertas.atualizados,
      },
    });
  } catch (error) {
    console.error('Erro ao verificar validades:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar validades dos documentos' },
      { status: 500 }
    );
  }
}

// Função auxiliar para criar notificações de email
async function criarNotificacoesEmail(alertas: any) {
  const notificacoes = [];

  // Agrupar documentos por empresa
  const empresasMap = new Map();

  [...alertas.expirados, ...alertas.expiramEm7Dias, ...alertas.expiramEm15Dias, ...alertas.expiramEm30Dias].forEach((doc) => {
    if (!empresasMap.has(doc.empresaId)) {
      empresasMap.set(doc.empresaId, {
        empresa: doc.empresa,
        expirados: [],
        em7dias: [],
        em15dias: [],
        em30dias: [],
      });
    }

    const grupo = empresasMap.get(doc.empresaId);

    if (alertas.expirados.includes(doc)) {
      grupo.expirados.push(doc);
    } else if (alertas.expiramEm7Dias.includes(doc)) {
      grupo.em7dias.push(doc);
    } else if (alertas.expiramEm15Dias.includes(doc)) {
      grupo.em15dias.push(doc);
    } else if (alertas.expiramEm30Dias.includes(doc)) {
      grupo.em30dias.push(doc);
    }
  });

  // Criar notificações por empresa
  for (const [empresaId, dados] of empresasMap.entries()) {
    const { empresa, expirados, em7dias, em15dias, em30dias } = dados;

    let conteudoEmail = `
      <h2>⚠️ Alerta de Documentos - ${empresa.nome}</h2>
      <p>Olá,</p>
      <p>Alguns documentos da empresa <strong>${empresa.nome}</strong> requerem a sua atenção:</p>
    `;

    if (expirados.length > 0) {
      conteudoEmail += `
        <h3 style="color: #dc2626;">🔴 Documentos EXPIRADOS (${expirados.length})</h3>
        <ul>
          ${expirados.map((doc: any) => `
            <li><strong>${doc.nome}</strong> (${doc.tipoDocumento}) - Expirou em ${new Date(doc.dataValidade).toLocaleDateString('pt-PT')}</li>
          `).join('')}
        </ul>
      `;
    }

    if (em7dias.length > 0) {
      conteudoEmail += `
        <h3 style="color: #ea580c;">🟠 Expiram em 7 dias ou menos (${em7dias.length})</h3>
        <ul>
          ${em7dias.map((doc: any) => `
            <li><strong>${doc.nome}</strong> (${doc.tipoDocumento}) - Expira em ${new Date(doc.dataValidade).toLocaleDateString('pt-PT')}</li>
          `).join('')}
        </ul>
      `;
    }

    if (em15dias.length > 0) {
      conteudoEmail += `
        <h3 style="color: #f59e0b;">🟡 Expiram em 15 dias ou menos (${em15dias.length})</h3>
        <ul>
          ${em15dias.map((doc: any) => `
            <li><strong>${doc.nome}</strong> (${doc.tipoDocumento}) - Expira em ${new Date(doc.dataValidade).toLocaleDateString('pt-PT')}</li>
          `).join('')}
        </ul>
      `;
    }

    if (em30dias.length > 0) {
      conteudoEmail += `
        <h3 style="color: #3b82f6;">🔵 Expiram em 30 dias ou menos (${em30dias.length})</h3>
        <ul>
          ${em30dias.map((doc: any) => `
            <li><strong>${doc.nome}</strong> (${doc.tipoDocumento}) - Expira em ${new Date(doc.dataValidade).toLocaleDateString('pt-PT')}</li>
          `).join('')}
        </ul>
      `;
    }

    conteudoEmail += `
      <p><strong>Acção Recomendada:</strong> Aceda à plataforma para renovar ou atualizar os documentos em falta.</p>
      <p>---<br/>TA Consulting Platform<br/>Sistema Automatizado de Gestão de Candidaturas</p>
    `;

    // Criar notificação no banco de dados (será enviada pelo sistema de notificações)
    await prisma.notificacao.create({
      data: {
        tipo: 'DOCUMENTO_EXPIRA',
        destinatario: empresa.contactoEmail || empresa.email,
        assunto: `⚠️ Alerta: ${expirados.length + em7dias.length + em15dias.length + em30dias.length} documento(s) requerem atenção - ${empresa.nome}`,
        conteudo: conteudoEmail,
        contexto: {
          empresaId,
          empresaNome: empresa.nome,
          totalAlertas: expirados.length + em7dias.length + em15dias.length + em30dias.length,
        },
      },
    });
  }
}

// Endpoint GET para verificação manual/cronjob
export async function GET(request: Request) {
  // Redirecionar para POST com a mesma request
  return POST(request);
}
