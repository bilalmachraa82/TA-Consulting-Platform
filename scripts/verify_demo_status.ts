
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

async function main() {
    console.log('--- DEMO VALIDATION SCRIPT ---');

    // 1. Environment Check
    console.log('\n[1] Checking Environment:');
    console.log('Gemini API Key:', process.env.GEMINI_API_KEY ? '✅ Present' : '❌ MISSING');
    console.log('Database URL:', process.env.DATABASE_URL ? '✅ Present' : '❌ MISSING');

    // 2. Database Check
    console.log('\n[2] Checking Database (Neon via Prisma):');
    const prisma = new PrismaClient();
    try {
        await prisma.$connect();
        console.log('✅ Connected to Database');

        const countTotal = await prisma.aviso.count();
        console.log(`Total Avisos in DB: ${countTotal}`);

        const now = new Date();
        const countActive = await prisma.aviso.count({
            where: {
                ativo: true,
                dataFimSubmissao: {
                    gte: now
                }
            }
        });
        console.log(`Active Avisos (Future Deadline): ${countActive}`);

        // Check companies
        const countEmpresas = await prisma.empresa.count();
        console.log(`Total Empresas in DB: ${countEmpresas}`);

    } catch (err) {
        console.error('❌ Database Connection Failed:', err);
    } finally {
        await prisma.$disconnect();
    }

    // 3. Files Check
    console.log('\n[3] Checking Json Files (Fallback/Fake Data):');
    const scrapedDir = path.join(process.cwd(), 'data/scraped');
    if (fs.existsSync(scrapedDir)) {
        const files = fs.readdirSync(scrapedDir);
        console.log(`Found ${files.length} files in data/scraped/`);
        files.forEach(f => console.log(` - ${f} (${fs.statSync(path.join(scrapedDir, f)).size} bytes)`));
    } else {
        console.log('data/scraped directory does not exist or is not found');
    }

    console.log('\n--- VALIDATION COMPLETE ---');
}

main().catch(console.error);
