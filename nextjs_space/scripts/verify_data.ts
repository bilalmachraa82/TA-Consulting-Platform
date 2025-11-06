import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

async function verifyData() {
  console.log('🔍 Verificando dados na base de dados PostgreSQL...\n');

  try {
    // Contar avisos por portal
    const avisosByPortal = await prisma.aviso.groupBy({
      by: ['portal'],
      _count: {
        id: true,
      },
    });

    console.log('📊 AVISOS POR PORTAL:');
    avisosByPortal.forEach((item) => {
      console.log(`  ${item.portal}: ${item._count.id} avisos`);
    });

    // Contar empresas
    const empresasCount = await prisma.empresa.count();
    console.log(`\n👥 EMPRESAS: ${empresasCount}`);

    // Contar candidaturas
    const candidaturasCount = await prisma.candidatura.count();
    console.log(`📝 CANDIDATURAS: ${candidaturasCount}`);

    // Contar documentos
    const documentosCount = await prisma.documento.count();
    console.log(`📄 DOCUMENTOS: ${documentosCount}`);

    // Listar avisos urgentes
    const avisosUrgentes = await prisma.aviso.findMany({
      where: { urgente: true },
      select: {
        nome: true,
        portal: true,
        dataFimSubmissao: true,
      },
    });

    if (avisosUrgentes.length > 0) {
      console.log(`\n🚨 AVISOS URGENTES (${avisosUrgentes.length}):`);
      avisosUrgentes.forEach((aviso) => {
        const deadline = new Date(aviso.dataFimSubmissao).toLocaleDateString('pt-PT');
        console.log(`  • ${aviso.nome} [${aviso.portal}] - Deadline: ${deadline}`);
      });
    }

    // Listar últimos 5 avisos
    const latestAvisos = await prisma.aviso.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        nome: true,
        portal: true,
        programa: true,
        codigo: true,
      },
    });

    console.log(`\n📋 ÚLTIMOS 5 AVISOS INSERIDOS:`);
    latestAvisos.forEach((aviso, index) => {
      console.log(`  ${index + 1}. [${aviso.portal}] ${aviso.nome}`);
      console.log(`     Código: ${aviso.codigo} | Programa: ${aviso.programa}`);
    });

    console.log('\n✅ Verificação concluída!');
  } catch (error) {
    console.error('❌ Erro ao verificar dados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyData();
