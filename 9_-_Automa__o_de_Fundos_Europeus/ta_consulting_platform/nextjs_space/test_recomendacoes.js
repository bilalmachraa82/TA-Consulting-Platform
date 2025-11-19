require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testarRecomendacoes() {
  try {
    console.log('=== TESTE RECOMENDAÇÕES ===\n');
    
    // 1. Verificar empresas
    const empresas = await prisma.empresa.findMany({ take: 5 });
    console.log(`✓ Empresas na BD: ${empresas.length}`);
    if (empresas.length > 0) {
      console.log(`  Exemplo: ${empresas[0].nome} (${empresas[0].setor})`);
    }
    
    // 2. Verificar avisos ativos
    const hoje = new Date();
    const avisos = await prisma.aviso.findMany({
      where: {
        dataFimSubmissao: { gte: hoje },
        ativo: true
      },
      take: 5
    });
    console.log(`✓ Avisos ativos: ${avisos.length}`);
    if (avisos.length > 0) {
      console.log(`  Exemplo: ${avisos[0].nome}`);
    }
    
    // 3. Teste de compatibilidade
    if (empresas.length > 0 && avisos.length > 0) {
      console.log('\n✓ API de recomendações deve funcionar!');
    } else {
      console.log('\n✗ PROBLEMA: Sem dados suficientes para recomendações');
    }
    
  } catch (error) {
    console.error('ERRO:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testarRecomendacoes();
