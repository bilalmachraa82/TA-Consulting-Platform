import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📝 Adding a higher quality PDF URL for testing...\n');

  // Create a new test aviso with a proper PDF
  const aviso = await prisma.aviso.create({
    data: {
      nome: 'Test Aviso - PDF Quality Check',
      portal: 'PORTUGAL2030',
      programa: 'COMPETE 2030',
      codigo: 'TEST-PDF-001',
      dataInicioSubmissao: new Date('2025-01-01'),
      dataFimSubmissao: new Date('2025-12-31'),
      // Using a publicly available multi-page PDF
      regulamentoURL: 'https://www.africau.edu/images/default/sample.pdf',
      ativo: true,
      urgente: false,
    },
  });

  console.log(`✅ Created test aviso ${aviso.codigo}`);
  console.log(`   URL: ${aviso.regulamentoURL}`);
  console.log(`\n📥 Now run: npx tsx scripts/download-pdfs.ts --portal=PORTUGAL2030 --limit=1 --extract`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
