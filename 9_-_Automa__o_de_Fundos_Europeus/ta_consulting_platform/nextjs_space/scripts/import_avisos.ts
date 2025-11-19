// Import script for avisos data
// Run with: npx tsx scripts/import_avisos.ts

import { PrismaClient, Portal } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

async function importAvisos() {
  console.log('📦 Importing avisos to database...\n');

  try {
    // Read the prepared data
    const dataPath = path.join(__dirname, '..', '..', '..', 'avisos_for_import.json');
    const avisos = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    let inserted = 0;
    let updated = 0;
    let errors = 0;

    for (const aviso of avisos) {
      try {
        // Check if exists
        const existing = await prisma.aviso.findFirst({
          where: { codigo: aviso.codigo },
        });

        if (existing) {
          // Update
          await prisma.aviso.update({
            where: { id: existing.id },
            data: {
              ...aviso,
              dataInicioSubmissao: aviso.dataInicioSubmissao ? new Date(aviso.dataInicioSubmissao) : null,
              dataFimSubmissao: aviso.dataFimSubmissao ? new Date(aviso.dataFimSubmissao) : null,
            },
          });
          updated++;
          console.log(`✏️ Updated: ${aviso.codigo}`);
        } else {
          // Insert
          await prisma.aviso.create({
            data: {
              ...aviso,
              dataInicioSubmissao: aviso.dataInicioSubmissao ? new Date(aviso.dataInicioSubmissao) : null,
              dataFimSubmissao: aviso.dataFimSubmissao ? new Date(aviso.dataFimSubmissao) : null,
            },
          });
          inserted++;
          console.log(`✅ Inserted: ${aviso.codigo}`);
        }
      } catch (error) {
        console.error(`❌ Error with ${aviso.codigo}:`, error instanceof Error ? error.message : String(error));
        errors++;
      }
    }

    console.log('\n📊 RESULTS:');
    console.log(`  • Total processed: ${avisos.length}`);
    console.log(`  • Inserted: ${inserted}`);
    console.log(`  • Updated: ${updated}`);
    console.log(`  • Errors: ${errors}`);

  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importAvisos();
