import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

async function main() {
  try {
    console.log('🔍 Testing database connection...');
    
    const count = await prisma.aviso.count();
    console.log(`✅ Connected! Found ${count} avisos in database`);
    
    const portugal2030Count = await prisma.aviso.count({
      where: { portal: 'PORTUGAL2030' }
    });
    console.log(`📋 PORTUGAL2030: ${portugal2030Count} avisos`);
    
    const withPDF = await prisma.aviso.count({
      where: { 
        portal: 'PORTUGAL2030',
        regulamentoURL: { not: null }
      }
    });
    console.log(`📄 With PDF URL: ${withPDF} avisos`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
