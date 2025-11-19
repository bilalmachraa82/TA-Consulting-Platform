import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📝 Adding test PDF URLs to avisos...\n');

  // Get PORTUGAL2030 avisos
  const avisos = await prisma.aviso.findMany({
    where: { portal: 'PORTUGAL2030' },
    take: 3,
  });

  console.log(`Found ${avisos.length} PORTUGAL2030 avisos\n`);

  // Add sample PDF URLs (using real Portugal 2030 PDF URLs as examples)
  const testPDFs = [
    'https://www.compete2020.gov.pt/admin/images/COMPETE2020_Regulamento_Aprovado.pdf',
    'https://www.portugal2020.pt/sites/default/files/regulamento_competir.pdf',
    'https://www.iapmei.pt/getattachment/PRODUTOS-E-SERVICOS/Incentivos-Financeiros/Sistema-de-Incentivos/SI-Inovacao/Regulamento-SI-Inovacao-2020.pdf.aspx',
  ];

  for (let i = 0; i < Math.min(avisos.length, testPDFs.length); i++) {
    const aviso = avisos[i];
    const pdfUrl = testPDFs[i];

    await prisma.aviso.update({
      where: { id: aviso.id },
      data: {
        regulamentoURL: pdfUrl,
        anexosRegulamento: [
          'https://www.compete2020.gov.pt/admin/images/anexo1.pdf',
          'https://www.compete2020.gov.pt/admin/images/anexo2.pdf',
        ],
      },
    });

    console.log(`✅ Updated aviso ${aviso.codigo} with PDF URL: ${pdfUrl}`);
  }

  console.log('\n✨ Done! Avisos updated with test PDF URLs');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
