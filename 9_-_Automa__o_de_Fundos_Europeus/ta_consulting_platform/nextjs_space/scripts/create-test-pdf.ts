import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { writeFileSync, existsSync, mkdirSync, copyFileSync } from 'fs';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestPDF() {
  console.log('📄 Creating test PDF with realistic content...\n');

  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Add first page
  const page1 = pdfDoc.addPage([595.28, 841.89]); // A4 size
  const pageWidth = page1.getWidth();
  const pageHeight = page1.getHeight();

  // Title
  page1.drawText('REGULAMENTO DO SISTEMA DE INCENTIVOS', {
    x: 50,
    y: pageHeight - 80,
    size: 20,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  });

  // Subtitle
  page1.drawText('COMPETE 2030 - Programa Operacional Competitividade', {
    x: 50,
    y: pageHeight - 110,
    size: 12,
    font: timesRomanFont,
    color: rgb(0.2, 0.2, 0.2),
  });

  // Body text
  const bodyText = `Artigo 1.º - Objeto e Âmbito

O presente regulamento estabelece as regras e procedimentos para a candidatura,
seleção, aprovação, execução e acompanhamento de projetos de investimento no
âmbito do Sistema de Incentivos às Empresas, designado COMPETE 2030.

Artigo 2.º - Beneficiários

Podem beneficiar dos apoios previstos neste regulamento as seguintes entidades:
a) Pequenas e médias empresas (PME) com atividade em território nacional;
b) Grandes empresas que comprovem criação líquida de emprego;
c) Entidades do Sistema Científico e Tecnológico Nacional;
d) Outras entidades previstas na legislação aplicável.

Artigo 3.º - Tipologias de Investimento Elegível

São elegíveis os seguintes tipos de investimento:
a) Investimentos produtivos em ativos corpóreos e incorpóreos;
b) Investimentos em inovação e desenvolvimento tecnológico;
c) Investimentos em qualificação de recursos humanos;
d) Investimentos em internacionalização.

Artigo 4.º - Custos Elegíveis

São considerados custos elegíveis:
- Aquisição de terrenos e edifícios
- Máquinas e equipamentos
- Estudos e projetos técnicos
- Despesas com pessoal afeto ao projeto
- Consultoria especializada
- Despesas de registo e proteção de propriedade industrial

Artigo 5.º - Taxas de Financiamento

As taxas máximas de cofinanciamento são:
- Micro e pequenas empresas: até 50%
- Médias empresas: até 40%
- Grandes empresas: até 30%

Poderão ser aplicadas majorações em determinadas condições.`;

  const lines = bodyText.split('\n');
  let yPosition = pageHeight - 150;

  for (const line of lines) {
    if (yPosition < 50) {
      // Add new page if needed
      const newPage = pdfDoc.addPage([595.28, 841.89]);
      yPosition = pageHeight - 50;

      newPage.drawText(line, {
        x: 50,
        y: yPosition,
        size: 10,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 15;
    } else {
      page1.drawText(line, {
        x: 50,
        y: yPosition,
        size: 10,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 15;
    }
  }

  // Save to temp directory
  const pdfBytes = await pdfDoc.save();
  const testPdfPath = '/tmp/test-regulamento.pdf';
  writeFileSync(testPdfPath, pdfBytes);

  console.log(`✅ Created test PDF: ${testPdfPath}`);
  console.log(`   Size: ${(pdfBytes.length / 1024).toFixed(1)} KB`);
  console.log(`   Pages: ${pdfDoc.getPageCount()}`);

  // Update aviso to use local file
  const aviso = await prisma.aviso.findFirst({
    where: { codigo: 'TEST-PDF-001' }
  });

  if (aviso) {
    // Manually copy the PDF to storage
    const storagePath = join(
      process.cwd(),
      'storage/pdfs/PORTUGAL2030/TEST-PDF-001'
    );

    if (!existsSync(storagePath)) {
      mkdirSync(storagePath, { recursive: true });
    }

    const destPath = join(storagePath, 'regulamento.pdf');
    copyFileSync(testPdfPath, destPath);

    console.log(`\n📁 Copied to: ${destPath}`);
    console.log(`\n✅ Ready for extraction test!`);
  }

  return testPdfPath;
}

createTestPDF()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
