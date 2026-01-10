import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env manually
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            process.env[key.trim()] = valueParts.join('=').replace(/^['"]|['"]$/g, '').trim();
        }
    });
}

const prisma = new PrismaClient();

// Map portal strings to enum values
const portalMap: Record<string, string> = {
    'PRR': 'PRR',
    'PEPAC': 'PEPAC',
    'PT2030': 'PORTUGAL2030',
    'PORTUGAL2030': 'PORTUGAL2030',
    'HORIZON': 'HORIZON_EUROPE',
    'HORIZON_EUROPE': 'HORIZON_EUROPE',
    'EUROPA_CRIATIVA': 'EUROPA_CRIATIVA',
    'IPDJ': 'IPDJ',
};

async function importAvisos() {
    console.log('📦 Importing avisos from all-avisos.json to Neon DB...\n');

    try {
        // Read the scraped data
        const dataPath = path.join(__dirname, '..', 'apify-actors', 'super-scraper', 'src', 'data', 'all-avisos.json');
        const rawData = fs.readFileSync(dataPath, 'utf-8');
        const data = JSON.parse(rawData);

        const avisos = data.avisos || [];
        console.log(`📊 Found ${avisos.length} avisos to import\n`);

        let inserted = 0;
        let updated = 0;
        let skipped = 0;
        let errors = 0;

        for (const aviso of avisos) {
            try {
                // Skip if no codigo
                if (!aviso.codigo) {
                    skipped++;
                    continue;
                }

                // Map portal
                const portal = portalMap[aviso.portal] || portalMap[aviso.fonte] || 'PORTUGAL2030';

                // Parse dates
                const dataInicio = aviso.dataAbertura ? new Date(aviso.dataAbertura) : new Date();
                const dataFim = aviso.dataFecho ? new Date(aviso.dataFecho) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

                // Check if exists
                const existing = await prisma.aviso.findFirst({
                    where: { codigo: aviso.codigo },
                });

                // Helper to extract region
                const detectRegion = (text: string): string => {
                    const t = text.toLowerCase();
                    if (t.includes('norte')) return 'Norte';
                    if (t.includes('centro')) return 'Centro';
                    if (t.includes('lisboa')) return 'Lisboa';
                    if (t.includes('alentejo')) return 'Alentejo';
                    if (t.includes('algarve')) return 'Algarve';
                    if (t.includes('açores') || t.includes('acores')) return 'Açores';
                    if (t.includes('madeira')) return 'Madeira';
                    return 'Nacional';
                };

                const fullText = `${aviso.titulo} ${aviso.descricao || ''}`;
                const detectedRegion = detectRegion(fullText);

                const avisoData = {
                    nome: aviso.titulo || aviso.nome || `Aviso ${aviso.codigo}`,
                    portal: portal as any,
                    programa: aviso.programa || 'Não especificado',
                    linha: aviso.linha || aviso.subLinha || null,
                    codigo: aviso.codigo,
                    dataInicioSubmissao: dataInicio,
                    dataFimSubmissao: dataFim,
                    montanteMinimo: null,
                    montanteMaximo: aviso.dotacao || null,
                    descricao: aviso.descricao || null,
                    link: aviso.url || null,
                    taxa: null,
                    regiao: detectedRegion,
                    setoresElegiveis: aviso.beneficiarios || [],
                    dimensaoEmpresa: [],
                    urgente: aviso.status === 'Aberto' && dataFim <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    ativo: aviso.status === 'Aberto' || aviso.status === 'Em Avaliação',
                };

                if (existing) {
                    await prisma.aviso.update({
                        where: { id: existing.id },
                        data: avisoData,
                    });
                    updated++;
                } else {
                    await prisma.aviso.create({
                        data: avisoData,
                    });
                    inserted++;
                }

                // Progress indicator
                if ((inserted + updated) % 100 === 0) {
                    console.log(`  ⏳ Progress: ${inserted + updated} processed...`);
                }

            } catch (error: any) {
                errors++;
                if (errors <= 5) {
                    console.log(`  ❌ Error on ${aviso.codigo}: ${error.message}`);
                }
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('📊 IMPORT SUMMARY');
        console.log('='.repeat(60));
        console.log(`  ✅ Inserted: ${inserted} avisos`);
        console.log(`  🔄 Updated: ${updated} avisos`);
        console.log(`  ⏭️ Skipped: ${skipped} avisos (no codigo)`);
        console.log(`  ❌ Errors: ${errors} avisos`);
        console.log('='.repeat(60));

        // Verify count
        const count = await prisma.aviso.count();
        console.log(`\n✅ Total avisos in DB: ${count}`);

    } catch (error) {
        console.error('❌ Import error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

importAvisos();
