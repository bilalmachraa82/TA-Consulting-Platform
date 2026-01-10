
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 FORENSIC DATA CHECK: ANEXOS');

    // Check Horizon
    const horizon = await prisma.aviso.findFirst({
        where: { portal: 'HORIZON_EUROPE', anexos: { not: [] } }, // Prisma JSON filter might be tricky, checking raw
    });

    console.log('\n🇪🇺 HORIZON SAMPLE:');
    if (horizon) {
        console.log(`Title: ${horizon.nome.slice(0, 50)}...`);
        console.log(`Anexos Type: ${typeof horizon.anexos}`);
        console.log(`Anexos Content:`, JSON.stringify(horizon.anexos, null, 2).slice(0, 500));
    } else {
        console.log('❌ No Horizon records with attachments found.');
    }

    // Check PRR (should be empty or different?)
    const prr = await prisma.aviso.findFirst({
        where: { portal: 'PRR' }
    });

    console.log('\n🇵🇹 PRR SAMPLE:');
    if (prr) {
        console.log(`Title: ${prr.nome.slice(0, 50)}...`);
        console.log(`Anexos Content:`, JSON.stringify(prr.anexos, null, 2).slice(0, 200));
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
