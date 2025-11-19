require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testarWorkflows() {
  try {
    console.log('=== TESTE WORKFLOWS ===\n');
    
    const workflows = await prisma.workflow.findMany({
      include: {
        logs: {
          orderBy: { createdAt: 'desc' },
          take: 3
        }
      }
    });
    
    console.log(`✓ Workflows na BD: ${workflows.length}\n`);
    
    workflows.forEach(w => {
      console.log(`📋 ${w.nome}`);
      console.log(`   Tipo: ${w.tipo}`);
      console.log(`   Ativo: ${w.ativo ? '✓' : '✗'}`);
      console.log(`   Frequência: ${w.frequencia}`);
      console.log(`   Logs: ${w.logs.length}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('ERRO:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testarWorkflows();
