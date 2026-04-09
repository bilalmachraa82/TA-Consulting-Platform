import { PrismaClient, Portal } from '@prisma/client';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { loadScrapedAvisos } from '@/lib/scraped-avisos';

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

async function insertAvisos() {
  console.log('📦 Inserindo avisos na base de dados PostgreSQL...\n');

  try {
    const dataDir = path.join(__dirname, '..', 'data', 'scraped');
    const allAvisos = loadScrapedAvisos({
      dataDir,
      refreshExpiredOpenDates: true,
      now: new Date(),
    });

    let inserted = 0;
    let updated = 0;
    let errors = 0;

    for (const aviso of allAvisos) {
      try {
        const data = {
          nome: aviso.nome,
          portal: aviso.portal as Portal,
          programa: aviso.programa,
          linha: aviso.linha || null,
          dataInicioSubmissao: new Date(aviso.dataInicioSubmissao),
          dataFimSubmissao: new Date(aviso.dataFimSubmissao),
          montanteMinimo: aviso.montanteMinimo || null,
          montanteMaximo: aviso.montanteMaximo || null,
          descrição: aviso.descrição || null,
          link: aviso.link || null,
          taxa: aviso.taxa || null,
          regiao: aviso.regiao || null,
          setoresElegiveis: aviso.setoresElegiveis || [],
          dimensaoEmpresa: aviso.dimensaoEmpresa || [],
          urgente: aviso.urgente || false,
          ativo: aviso.ativo !== false,
        };

        const result = await prisma.aviso.upsert({
          where: { codigo: aviso.codigo },
          update: data,
          create: { ...data, codigo: aviso.codigo },
        });

        // Detect insert vs update by comparing createdAt and updatedAt
        const wasInserted = result.createdAt.getTime() === result.updatedAt.getTime();
        if (wasInserted) {
          inserted++;
          console.log(`  ✅ Inserido: ${aviso.nome} (${aviso.codigo})`);
        } else {
          updated++;
          console.log(`  ✅ Atualizado: ${aviso.nome} (${aviso.codigo})`);
        }
      } catch (error: any) {
        errors++;
        console.log(`  ❌ Erro: ${aviso.codigo} - ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO DA INSERÇÃO NA BASE DE DADOS');
    console.log('='.repeat(60));
    console.log(`  ✅ Inseridos: ${inserted} avisos`);
    console.log(`  🔄 Atualizados: ${updated} avisos`);
    console.log(`  ❌ Erros: ${errors} avisos`);
    console.log('='.repeat(60));
    console.log('\n✅ Dados inseridos com sucesso na base de dados PostgreSQL!');

  } catch (error) {
    console.error('❌ Erro ao inserir dados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

insertAvisos();
