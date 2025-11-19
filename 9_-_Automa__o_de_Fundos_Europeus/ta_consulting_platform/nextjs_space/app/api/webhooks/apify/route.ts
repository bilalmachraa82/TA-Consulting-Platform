import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { ApifyClient } from 'apify-client';

const prisma = new PrismaClient();

const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_TOKEN || ''
});

interface ApifyWebhookPayload {
  eventType: string;
  resource: {
    id: string;
    actorId: string;
    status: string;
    defaultDatasetId: string;
    startedAt: string;
    finishedAt?: string;
  };
}

interface AvisoData {
  title: string;
  codigo: string;
  description?: string;
  url: string;
  dataPublicacao?: string;
  dataAbertura?: string;
  dataFecho: string;
  estado: string;
  programa?: string;
  montante?: string;
  taxa?: string;
  regiao?: string;
  portal: string;
}

// Map portal name to Portal enum
function mapPortalEnum(portal: string): string {
  const mapping: Record<string, string> = {
    'Portugal 2030': 'PORTUGAL2030',
    'PRR': 'PRR',
    'PEPACC': 'PEPACC',
    'PAPAC': 'PAPAC'
  };
  return mapping[portal] || 'PORTUGAL2030';
}

// Parse Portuguese date (dd/mm/yyyy or ISO)
function parseDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;

  try {
    // Try ISO format first
    const iso = new Date(dateStr);
    if (!isNaN(iso.getTime())) return iso;

    // Try Portuguese format (dd/mm/yyyy)
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

// Extract amount from string
function extractAmount(str: string | null | undefined): number | null {
  if (!str) return null;

  const cleaned = str.replace(/[€\s.,]/g, '');
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? null : num;
}

// Check if aviso is urgent (<15 days to deadline)
function isUrgent(dataFecho: Date | null): boolean {
  if (!dataFecho) return false;

  const now = new Date();
  const diffTime = dataFecho.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays <= 15 && diffDays >= 0;
}

// Map Apify data to Prisma format
function mapToPrisma(item: AvisoData) {
  const dataFecho = parseDate(item.dataFecho);
  const dataAbertura = parseDate(item.dataAbertura || item.dataPublicacao);

  return {
    nome: item.title.trim(),
    portal: mapPortalEnum(item.portal),
    programa: item.programa || 'N/A',
    linha: null,
    codigo: item.codigo.trim(),
    dataInicioSubmissao: dataAbertura || new Date(),
    dataFimSubmissao: dataFecho || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default to 30 days from now
    montanteMinimo: null,
    montanteMaximo: extractAmount(item.montante),
    descrição: item.description?.substring(0, 500) || '',
    link: item.url,
    taxa: item.taxa || '',
    regiao: item.regiao || 'Nacional',
    setoresElegiveis: [],
    dimensaoEmpresa: [],
    urgente: isUrgent(dataFecho),
    ativo: item.estado?.toLowerCase().includes('aberto') || true,
  };
}

export async function POST(request: NextRequest) {
  try {
    const payload: ApifyWebhookPayload = await request.json();

    console.log('📨 Received Apify webhook:', payload.eventType);

    // Handle different event types
    if (payload.eventType === 'ACTOR.RUN.SUCCEEDED') {
      await handleSuccessfulRun(payload.resource);
      return NextResponse.json({ success: true, message: 'Data imported successfully' });
    } else if (payload.eventType === 'ACTOR.RUN.FAILED') {
      await handleFailedRun(payload.resource);
      return NextResponse.json({ success: true, message: 'Failure logged' }, { status: 200 });
    }

    return NextResponse.json({ success: true, message: 'Event acknowledged' });
  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function handleSuccessfulRun(resource: any) {
  const { id: runId, defaultDatasetId, actorId, startedAt, finishedAt } = resource;

  console.log(`✅ Processing successful run: ${runId}`);
  console.log(`   Actor ID: ${actorId}`);
  console.log(`   Dataset ID: ${defaultDatasetId}`);

  try {
    // Fetch data from Apify dataset
    const dataset = await apifyClient.dataset(defaultDatasetId);
    const { items } = await dataset.listItems();

    console.log(`📦 Found ${items.length} items in dataset`);

    if (items.length === 0) {
      console.warn('⚠️  Dataset is empty, skipping import');
      return;
    }

    // Import to database
    const stats = await importAvisosToDatabase(items as any);

    console.log('📊 Import stats:', stats);

    // Log success to database (optional - if you have a WorkflowLog table)
    try {
      // Uncomment if you have WorkflowLog model
      // await prisma.workflowLog.create({
      //   data: {
      //     workflowId: 'apify-scraping', // You'll need to create this workflow
      //     dataExecucao: new Date(),
      //     sucesso: true,
      //     mensagem: `Imported ${stats.inserted} new, updated ${stats.updated} avisos`,
      //     dados: stats as any
      //   }
      // });
    } catch (logError) {
      console.error('Error logging to WorkflowLog:', logError);
      // Continue even if logging fails
    }

    console.log('✅ Import completed successfully');
  } catch (error: any) {
    console.error('❌ Error processing run:', error);

    // Log error (optional)
    try {
      // await prisma.workflowLog.create({
      //   data: {
      //     workflowId: 'apify-scraping',
      //     dataExecucao: new Date(),
      //     sucesso: false,
      //     mensagem: error.message,
      //     dados: { error: error.stack } as any
      //   }
      // });
    } catch (logError) {
      console.error('Error logging failure:', logError);
    }

    throw error;
  }
}

async function handleFailedRun(resource: any) {
  const { id: runId, actorId } = resource;

  console.log(`❌ Run failed: ${runId}`);
  console.log(`   Actor ID: ${actorId}`);

  // You can add email notification here
  // await sendErrorNotification({ runId, actorId });
}

async function importAvisosToDatabase(items: AvisoData[]) {
  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  const errors: any[] = [];

  for (const item of items) {
    try {
      // Validate required fields
      if (!item.title || !item.codigo) {
        errors.push({ codigo: item.codigo, error: 'Missing required fields' });
        skipped++;
        continue;
      }

      // Map to Prisma format
      const avisoData = mapToPrisma(item);

      // Upsert (insert or update based on codigo)
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
      } else {
        // Insert new
        await prisma.aviso.create({
          data: {
            ...avisoData,
            portal: avisoData.portal as any, // Cast to Portal enum
          }
        });
        inserted++;
      }
    } catch (error: any) {
      console.error(`Error importing aviso ${item.codigo}:`, error);
      errors.push({ codigo: item.codigo, error: error.message });
    }
  }

  return { inserted, updated, skipped, errors, total: items.length };
}
