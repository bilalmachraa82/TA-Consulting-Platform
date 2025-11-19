import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📝 Adding working PDF URL for testing...\n');

  // Get the first PORTUGAL2030 aviso
  const aviso = await prisma.aviso.findFirst({
    where: { portal: 'PORTUGAL2030' },
  });

  if (!aviso) {
    console.error('❌ No PORTUGAL2030 avisos found');
    return;
  }

  // Use a publicly available sample PDF
  const testPdfUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

  await prisma.aviso.update({
    where: { id: aviso.id },
    data: {
      regulamentoURL: testPdfUrl,
      pdfDownloadStatus: 'NOT_STARTED', // Reset status
    },
  });

  console.log(`✅ Updated aviso ${aviso.codigo} with working PDF URL`);
  console.log(`   URL: ${testPdfUrl}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
