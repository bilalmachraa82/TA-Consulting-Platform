import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * Endpoint de monitoring com métricas detalhadas
 */
export async function GET(request: Request) {
  const startTime = Date.now();

  // Métricas do sistema
  const metrics = {
    system: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      platform: process.platform,
      nodeVersion: process.version,
    },

    // Métricas da aplicação
    app: {
      version: process.env.npm_package_version || '2.0.0',
      environment: process.env.NODE_ENV,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },

    // Métricas do banco
    database: {
      // Número de avisos ativos
      avisosAtivos: 0,
      avisosTotais: 0,

      // Número de empresas
      empresasTotais: 0,

      // Número de candidaturas
      candidaturasTotais: 0,

      // Última sincronização
      ultimaSincronizacao: null,
    },
  };

  // Buscar métricas do banco
  try {
    const [
      avisosAtivos,
      avisosTotais,
      empresasTotais,
      candidaturasTotais,
    ] = await Promise.all([
      db.aviso.count({ where: { ativo: true } }),
      db.aviso.count(),
      db.empresa.count(),
      db.candidatura.count(),
    ]);

    metrics.database = {
      avisosAtivos,
      avisosTotais,
      empresasTotais,
      candidaturasTotais,
      ultimaSincronizacao: new Date().toISOString(),
    };
  } catch (error) {
    // Silencioso - não falhar o endpoint
  }

  // Adicionar tempo de resposta
  const responseTime = Date.now() - startTime;

  return NextResponse.json({
    ...metrics,
    meta: {
      responseTime,
      timestamp: new Date().toISOString(),
    },
  });
}
