/**
 * BITRIX → LOCAL DB SYNC SCRIPT (Shadow DB)
 * ==========================================
 * Sincroniza empresas do Bitrix para a base de dados local (Prisma/PostgreSQL).
 * 
 * Objectivo: Ter dados locais para matchmaking rápido (ms), sem depender da API Bitrix (segundos).
 * 
 * Usage:
 *   npx tsx scripts/sync-bitrix-to-db.ts
 *   npx tsx scripts/sync-bitrix-to-db.ts --full    # Full resync (ignores lastSync)
 * 
 * Cronjob recomendado: Todos os dias às 03:00 AM
 */

import { PrismaClient, DimensaoEmpresa } from '@prisma/client';

const BITRIX_WEBHOOK = process.env.BITRIX_WEBHOOK_URL ||
    "https://taconsulting.bitrix24.com/rest/744/dm213axt003upvfk/";

const prisma = new PrismaClient();

// CAE Field ID from Bitrix audit
const CAE_FIELD = 'UF_CRM_1738505715849';

// CAE ID to 2-digit code mapping (from Bitrix)
const CAE_ID_TO_CODE: Record<string, string> = {
    "6058": "01",
    "6060": "02",
    "6070": "10",
    "6076": "13",
    "6094": "22",
    "6128": "41",
    "6130": "42",
    "6132": "43",
    "6136": "46",
    "6138": "47",
    "6160": "62",
    "6174": "70",
    "6198": "84",
    "6200": "85",
    "6202": "86",
    // Add more as needed - this is a subset
};

// Map Bitrix EMPLOYEES to DimensaoEmpresa
function mapDimensao(employees: string | null): DimensaoEmpresa {
    if (!employees) return 'MICRO';

    switch (employees) {
        case 'EMPLOYEES_1': return 'MICRO';      // < 10
        case 'EMPLOYEES_2': return 'PEQUENA';     // 10-49  
        case 'EMPLOYEES_3': return 'MEDIA';       // 50-249
        case 'EMPLOYEES_4': return 'GRANDE';      // 250+
        default: return 'MICRO';
    }
}

// Map region from Bitrix ADDRESS_REGION
function mapRegiao(region: string | null): string | null {
    if (!region) return null;

    // Common Portuguese regions
    const regionMap: Record<string, string> = {
        'Norte': 'Norte',
        'Centro': 'Centro',
        'Lisboa': 'Lisboa',
        'Alentejo': 'Alentejo',
        'Algarve': 'Algarve',
        'Açores': 'Açores',
        'Madeira': 'Madeira',
    };

    return regionMap[region] || region;
}

// Extract phone/email from Bitrix array format
function extractContact(arr: any[] | undefined, type: 'PHONE' | 'EMAIL'): string | null {
    if (!arr || arr.length === 0) return null;
    const item = arr.find((i: any) => i.TYPE_ID === type || true);
    return item?.VALUE || null;
}

interface BitrixCompany {
    ID: string;
    TITLE: string;
    EMPLOYEES: string | null;
    ADDRESS: string | null;
    ADDRESS_CITY: string | null;
    ADDRESS_REGION: string | null;
    ADDRESS_POSTAL_CODE: string | null;
    PHONE: any[];
    EMAIL: any[];
    UF_CRM_1738505715849: string | null; // CAE field
    [key: string]: any;
}

async function fetchBitrixCompanies(start: number = 0): Promise<{
    companies: BitrixCompany[];
    total: number;
    next?: number;
}> {
    const url = new URL(`${BITRIX_WEBHOOK}crm.company.list.json`);
    url.searchParams.append('start', String(start));

    // Select only fields we need
    const fields = [
        'ID', 'TITLE', 'EMPLOYEES', 'ADDRESS', 'ADDRESS_CITY',
        'ADDRESS_REGION', 'ADDRESS_POSTAL_CODE', 'PHONE', 'EMAIL',
        CAE_FIELD
    ];
    fields.forEach((f, i) => url.searchParams.append(`select[${i}]`, f));

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.error) {
        throw new Error(`Bitrix API Error: ${data.error_description || data.error}`);
    }

    return {
        companies: data.result || [],
        total: data.total || 0,
        next: data.next,
    };
}

async function syncCompany(bitrixCompany: BitrixCompany): Promise<void> {
    // Skip companies without a title
    if (!bitrixCompany.TITLE) return;

    // Generate a pseudo-NIPC from Bitrix ID (real NIPC would need a custom field)
    const pseudoNipc = `BTX${bitrixCompany.ID.padStart(9, '0')}`;

    // Extract CAE code
    const caeId = bitrixCompany[CAE_FIELD];
    const caeCode = caeId ? (CAE_ID_TO_CODE[caeId] || caeId.substring(0, 2)) : '00';

    // Map to Prisma format
    const empresaData = {
        nipc: pseudoNipc,
        nome: bitrixCompany.TITLE,
        cae: caeCode,
        setor: caeCode, // Simplified - could map to sector names
        dimensao: mapDimensao(bitrixCompany.EMPLOYEES),
        email: extractContact(bitrixCompany.EMAIL, 'EMAIL') || `bitrix-${bitrixCompany.ID}@placeholder.local`,
        telefone: extractContact(bitrixCompany.PHONE, 'PHONE'),
        morada: bitrixCompany.ADDRESS,
        localidade: bitrixCompany.ADDRESS_CITY,
        codigoPostal: bitrixCompany.ADDRESS_POSTAL_CODE,
        regiao: mapRegiao(bitrixCompany.ADDRESS_REGION),
        ativa: true,
    };

    // Upsert - create or update
    await prisma.empresa.upsert({
        where: { nipc: pseudoNipc },
        create: empresaData,
        update: {
            nome: empresaData.nome,
            cae: empresaData.cae,
            setor: empresaData.setor,
            dimensao: empresaData.dimensao,
            telefone: empresaData.telefone,
            morada: empresaData.morada,
            localidade: empresaData.localidade,
            codigoPostal: empresaData.codigoPostal,
            regiao: empresaData.regiao,
            ativa: empresaData.ativa,
        },
    });
}

async function main() {
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║       BITRIX → LOCAL DB SYNC (Shadow DB)                 ║');
    console.log('╚══════════════════════════════════════════════════════════╝');

    const startTime = Date.now();
    let totalSynced = 0;
    let errors = 0;
    let nextPage = 0;

    // Test connection first
    console.log('\n📡 Testing Bitrix connection...');
    const testResponse = await fetch(`${BITRIX_WEBHOOK}profile.json`);
    const testData = await testResponse.json();
    console.log(`✅ Connected as: ${testData.result?.NAME} ${testData.result?.LAST_NAME}`);

    // Sync loop with pagination
    console.log('\n🔄 Starting sync...\n');

    do {
        try {
            const batch = await fetchBitrixCompanies(nextPage);
            console.log(`📦 Processing batch: ${nextPage}-${nextPage + batch.companies.length} (Total: ${batch.total})`);

            for (const company of batch.companies) {
                try {
                    await syncCompany(company);
                    totalSynced++;
                } catch (err) {
                    errors++;
                    if (errors <= 5) {
                        console.error(`  ⚠️ Error syncing ${company.TITLE}: ${err}`);
                    }
                }
            }

            nextPage = batch.next || 0;

            // Rate limiting - Bitrix allows ~2 req/sec
            await new Promise(r => setTimeout(r, 600));

        } catch (err) {
            console.error(`❌ Batch error at ${nextPage}:`, err);
            break;
        }

    } while (nextPage > 0);

    const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(2);

    console.log('\n' + '='.repeat(60));
    console.log('📊 SYNC COMPLETE');
    console.log('='.repeat(60));
    console.log(`  ✅ Companies synced: ${totalSynced}`);
    console.log(`  ⚠️ Errors: ${errors}`);
    console.log(`  ⏱️ Duration: ${duration} minutes`);
    console.log('='.repeat(60));

    // Update sync metadata
    try {
        await prisma.workflow.upsert({
            where: { id: 'bitrix-sync' },
            create: {
                id: 'bitrix-sync',
                nome: 'Bitrix Company Sync',
                tipo: 'SCRAPING_PORTUGAL2030', // Reusing enum, ideally add BITRIX_SYNC
                frequencia: 'daily',
                ultimaExecucao: new Date(),
                proximaExecucao: new Date(Date.now() + 24 * 60 * 60 * 1000),
                parametros: {
                    totalSynced,
                    errors,
                    durationMinutes: parseFloat(duration)
                },
            },
            update: {
                ultimaExecucao: new Date(),
                proximaExecucao: new Date(Date.now() + 24 * 60 * 60 * 1000),
                parametros: { totalSynced, errors, durationMinutes: parseFloat(duration) },
            },
        });
        console.log('\n✅ Sync metadata saved to Workflow table.');
    } catch (err) {
        console.log('\n⚠️ Could not save sync metadata:', err);
    }

    await prisma.$disconnect();
}

main().catch(console.error);
