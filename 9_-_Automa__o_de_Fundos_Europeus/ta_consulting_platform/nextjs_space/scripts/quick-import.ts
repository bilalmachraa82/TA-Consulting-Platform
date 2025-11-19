import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function importAvisos() {
  const data = JSON.parse(fs.readFileSync('data/scraped/portugal2030_avisos.json', 'utf-8'));
  
  for (const item of data) {
    await prisma.aviso.create({
      data: {
        nome: item.titulo,
        codigo: item.id,
        programa: 'Portugal 2030',
        portal: 'PORTUGAL2030',
        dataInicioSubmissao: new Date(item.data_abertura),
        dataFimSubmissao: new Date(item.data_fecho),
        descrição: item.descricao,
        link: item.url,
        taxa: item.taxa_apoio ? `${item.taxa_apoio}%` : null,
        regiao: item.regiao,
        montanteMinimo: item.montante_min ? parseFloat(item.montante_min) : null,
        montanteMaximo: item.montante_max ? parseFloat(item.montante_max) : null,
        setoresElegiveis: item.setor ? [item.setor] : [],
        dimensaoEmpresa: item.tipo_beneficiario ? [item.tipo_beneficiario] : [],
        ativo: item.status === 'Aberto',
      }
    });
    console.log(`✅ Imported: ${item.id} - ${item.titulo}`);
  }
  
  console.log(`\n✅ Imported ${data.length} avisos`);
  await prisma.$disconnect();
}

importAvisos().catch(console.error);
