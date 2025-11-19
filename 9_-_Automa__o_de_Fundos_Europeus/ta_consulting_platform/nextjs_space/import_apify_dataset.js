const { ApifyClient } = require('apify-client');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_TOKEN || 'REDACTED_APIFY_TOKEN'
});

// Dataset ID from the latest run (Portugal 2030 actor)
const DATASET_ID = 'OJ28QWFYGn63gg4Bn';

// Map portal name to Portal enum
function mapPortalEnum(portal) {
  const mapping = {
    'Portugal 2030': 'PORTUGAL2030',
    'PRR': 'PRR',
    'PEPACC': 'PEPACC',
    'PAPAC': 'PAPAC'
  };
  return mapping[portal] || 'PORTUGAL2030';
}

// Parse date
function parseDate(dateStr) {
  if (!dateStr) return null;

  try {
    const iso = new Date(dateStr);
    if (!isNaN(iso.getTime())) return iso;

    const parts = dateStr.split(/[/-]/);
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
    }
  } catch (error) {
    console.error('Error parsing date:', dateStr, error);
  }

  return null;
}

// Extract amount
function extractAmount(str) {
  if (!str) return null;
  const cleaned = str.replace(/[€\\s.,]/g, '');
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? null : num;
}

// Check if urgent
function isUrgent(dataFecho) {
  if (!dataFecho) return false;
  const now = new Date();
  const diffTime = dataFecho.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 15 && diffDays >= 0;
}

async function importDataset() {
  console.log(`📦 Fetching dataset ${DATASET_ID}...`);

  const dataset = apifyClient.dataset(DATASET_ID);
  const { items } = await dataset.listItems();

  console.log(`Found ${items.length} items`);

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const item of items) {
    try {
      if (!item.title || !item.codigo) {
        console.log(`⚠️  Skipping item: missing required fields`);
        skipped++;
        continue;
      }

      const dataFecho = parseDate(item.dataFecho);
      const dataAbertura = parseDate(item.dataAbertura || item.dataPublicacao);

      const avisoData = {
        nome: item.title.trim(),
        portal: mapPortalEnum(item.portal),
        programa: item.programa || 'N/A',
        linha: null,
        codigo: item.codigo.trim(),
        dataInicioSubmissao: dataAbertura || new Date(),
        dataFimSubmissao: dataFecho || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        montanteMinimo: null,
        montanteMaximo: extractAmount(item.montante),
        descrição: (item.description || '').substring(0, 500),
        link: item.url,
        taxa: item.taxa || '',
        regiao: item.regiao || 'Nacional',
        setoresElegiveis: [],
        dimensaoEmpresa: [],
        urgente: isUrgent(dataFecho),
        ativo: item.estado?.toLowerCase().includes('aberto') !== false,
      };

      const existingAviso = await prisma.aviso.findFirst({
        where: { codigo: avisoData.codigo }
      });

      if (existingAviso) {
        await prisma.aviso.update({
          where: { id: existingAviso.id },
          data: {
            ...avisoData,
            updatedAt: new Date()
          }
        });
        console.log(`✏️  Updated: ${avisoData.codigo}`);
        updated++;
      } else {
        await prisma.aviso.create({
          data: avisoData
        });
        console.log(`✅ Inserted: ${avisoData.codigo}`);
        inserted++;
      }
    } catch (error) {
      console.error(`❌ Error importing ${item.codigo}:`, error.message);
      skipped++;
    }
  }

  console.log(`\n📊 Import complete:`);
  console.log(`   ✅ Inserted: ${inserted}`);
  console.log(`   ✏️  Updated: ${updated}`);
  console.log(`   ⚠️  Skipped: ${skipped}`);
  console.log(`   📦 Total: ${items.length}`);

  await prisma.$disconnect();
}

importDataset().catch(console.error);
