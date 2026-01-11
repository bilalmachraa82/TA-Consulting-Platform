import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';

const URL = 'http://localhost:3003/proposta-fernando';
const OUTPUT_DIR = path.join(process.cwd(), '.tmp', 'pdf');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'proposta-fernando.pdf');

const TOTAL_SLIDES = 15; // Known from the component

async function generatePDF() {
  console.log('🚀 Iniciando geração do PDF...');

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Set viewport to a standard presentation size
  await page.setViewport({ width: 1920, height: 1080 });

  console.log(`📄 Navegando para: ${URL}`);
  await page.goto(URL, { waitUntil: 'networkidle0', timeout: 60000 });

  // Wait for page to fully load
  await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 3000)));

  const pdfBuffers: Buffer[] = [];

  // Navigate through each slide using arrow keys
  for (let i = 0; i < TOTAL_SLIDES; i++) {
    console.log(`📸 Capturing slide ${i + 1}/${TOTAL_SLIDES}...`);

    // Wait for animation to settle
    await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 1000)));

    // Take screenshot
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: false
    });

    pdfBuffers.push(screenshot as Buffer);

    // Navigate to next slide (except for the last one)
    if (i < TOTAL_SLIDES - 1) {
      await page.keyboard.press('ArrowRight');
    }
  }

  await browser.close();

  console.log(`✅ Captured ${pdfBuffers.length} slides`);

  // Save individual images
  const imagesDir = path.join(OUTPUT_DIR, 'slides');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  for (let i = 0; i < pdfBuffers.length; i++) {
    const imagePath = path.join(imagesDir, `slide-${String(i + 1).padStart(2, '0')}.png`);
    fs.writeFileSync(imagePath, pdfBuffers[i]);
  }

  console.log(`💾 Slides salvos em: ${imagesDir}/`);

  // Create PDF from images
  console.log('📄 Creating PDF from screenshots...');

  try {
    const pdfDoc = await PDFDocument.create();

    for (const buffer of pdfBuffers) {
      const image = await pdfDoc.embedPng(buffer);
      const page = pdfDoc.addPage([1920, 1080]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: 1920,
        height: 1080,
      });
    }

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(OUTPUT_FILE, pdfBytes);

    console.log(`✅ PDF criado: ${OUTPUT_FILE}`);
  } catch (error) {
    console.log('⚠️ Could not create combined PDF, but individual slides are saved.');
    console.log('💡 To combine manually: Open all slides in Preview, File > Print > Save as PDF');
  }

  console.log('\n📋 Summary:');
  console.log(`   📁 Slides: ${imagesDir}/`);
  console.log(`   📄 PDF: ${OUTPUT_FILE}`);

  return {
    success: true,
    slidesCount: pdfBuffers.length,
    outputDir: OUTPUT_DIR,
    pdfFile: OUTPUT_FILE
  };
}

generatePDF()
  .then((result) => {
    console.log('\n✅ Done!');
  })
  .catch((error) => {
    console.error('❌ Error generating PDF:', error);
    process.exit(1);
  });
