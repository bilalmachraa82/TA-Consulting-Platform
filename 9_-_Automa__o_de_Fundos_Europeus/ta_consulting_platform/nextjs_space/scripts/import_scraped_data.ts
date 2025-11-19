// Import script for scraped avisos data from multiple sources
// Run with: npx tsx scripts/import_scraped_data.ts

import { PrismaClient, Portal } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

async function importScrapedData() {
  console.log('📦 Importing scraped avisos from multiple sources...\n');

  try {
    // Define file paths - pointing to the correct location where scrapers create the files
    const files = [
      { name: 'portugal2030', path: path.join(__dirname, '..', '..', '..', '..', 'portugal2030_avisos.json'), portal: 'PORTUGAL2030' as Portal },
      { name: 'prr', path: path.join(__dirname, '..', '..', '..', '..', 'prr_avisos.json'), portal: 'PRR' as Portal },
      { name: 'papac', path: path.join(__dirname, '..', '..', '..', '..', 'papac_avisos.json'), portal: 'PAPAC' as Portal }
    ];

    let totalInserted = 0;
    let totalUpdated = 0;
    let totalErrors = 0;

    for (const file of files) {
      console.log(`\n📄 Processing ${file.name.toUpperCase()} data...`);

      if (!fs.existsSync(file.path)) {
        console.log(`⚠️  File not found: ${file.path}`);
        continue;
      }

      try {
        const avisos = JSON.parse(fs.readFileSync(file.path, 'utf-8'));
        console.log(`📊 Found ${avisos.length} avisos in ${file.name}`);

        let inserted = 0;
        let updated = 0;
        let errors = 0;

        for (const aviso of avisos) {
          try {
            // Convert to our database format
            const avisoData = {
              codigo: aviso.codigo || aviso.id || `${file.portal}-${Date.now()}`,
              nome: aviso.nome || aviso.title || aviso.name || 'Sem nome',
              portal: file.portal,
              programa: aviso.programa || aviso.program || aviso.programa_name || 'N/A',
              linha: aviso.linha || aviso.line || null,
              dataInicioSubmissao: aviso.dataInicioSubmissao ? new Date(aviso.dataInicioSubmissao) : new Date(),
              dataFimSubmissao: aviso.dataFimSubmissao || aviso.deadline ? new Date(aviso.dataFimSubmissao || aviso.deadline) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
              montanteMinimo: aviso.montanteMinimo || aviso.funding_min || null,
              montanteMaximo: aviso.montanteMaximo || aviso.funding_max || null,
              descrição: aviso.descrição || aviso.description || aviso.excerpt || null,
              link: aviso.link || aviso.url || aviso.permalink || null,
              taxa: aviso.taxa || aviso.rate || null,
              regiao: aviso.regiao || aviso.region || null,
              setoresElegiveis: aviso.setoresElegiveis || aviso.sectors || [],
              dimensaoEmpresa: aviso.dimensaoEmpresa || aviso.company_size || [],
              urgente: aviso.urgente || aviso.urgent || false,
              ativo: aviso.ativo !== false, // Default to true
            };

            // Check if aviso already exists
            const existingAviso = await prisma.aviso.findFirst({
              where: { codigo: avisoData.codigo }
            });

            if (existingAviso) {
              // Update existing
              await prisma.aviso.update({
                where: { id: existingAviso.id },
                data: {
                  ...avisoData,
                  portal: avisoData.portal as any, // Cast to Portal enum
                  updatedAt: new Date()
                }
              });
              updated++;
              console.log(`✅ Updated: ${avisoData.codigo}`);
            } else {
              // Insert new
              await prisma.aviso.create({
                data: {
                  ...avisoData,
                  portal: avisoData.portal as any, // Cast to Portal enum
                }
              });
              inserted++;
              console.log(`✅ Inserted: ${avisoData.codigo}`);
            }
          } catch (error) {
            console.error(`❌ Error with ${aviso.codigo || aviso.id}:`, error instanceof Error ? error.message : String(error));
            errors++;
          }
        }

        console.log(`\n📈 ${file.name.toUpperCase()} Summary:`);
        console.log(`   ✅ Inserted: ${inserted}`);
        console.log(`   🔄 Updated: ${updated}`);
        console.log(`   ❌ Errors: ${errors}`);

        totalInserted += inserted;
        totalUpdated += updated;
        totalErrors += errors;

      } catch (error) {
        console.error(`❌ Error processing ${file.name}:`, error instanceof Error ? error.message : String(error));
        totalErrors++;
      }
    }

    console.log('\n🎉 Overall Summary:');
    console.log(`   ✅ Total Inserted: ${totalInserted}`);
    console.log(`   🔄 Total Updated: ${totalUpdated}`);
    console.log(`   ❌ Total Errors: ${totalErrors}`);

    // Get database statistics
    const totalAvisos = await prisma.aviso.count();
    const avisosByPortal = await prisma.aviso.groupBy({
      by: ['portal'],
      _count: true
    });

    console.log('\n📊 Database Statistics:');
    console.log(`   📝 Total Avisos: ${totalAvisos}`);
    avisosByPortal.forEach(stat => {
      console.log(`   📋 ${stat.portal}: ${stat._count}`);
    });

  } catch (error) {
    console.error('❌ Fatal error:', error instanceof Error ? error.message : String(error));
    throw error;
  }

  console.log('\n✅ Import completed!');
}

// Run import function
importScrapedData()
  .catch((error) => {
    console.error('❌ Import failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });