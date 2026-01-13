/**
 * Final comprehensive Bitrix integration test
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('     BITRIX INTEGRATION - FINAL COMPREHENSIVE TEST');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Test 1: Get valid companies (not CAE 00)
    const validCAECompanies = await prisma.empresa.findMany({
        where: {
            ativa: true,
            cae: { not: '00' }
        },
        take: 20
    });

    console.log('1. Companies with valid CAE (not 00):', validCAECompanies.length);
    validCAECompanies.slice(0, 10).forEach(e => {
        console.log(`   ${e.nome}: CAE=${e.cae}, Setor=${e.setor}`);
    });

    // Test 2: Count by CAE prefix
    const allEmpresas = await prisma.empresa.findMany({ where: { ativa: true } });
    const caeCounts: Record<string, number> = {};
    allEmpresas.forEach(e => {
        const prefix = e.cae.substring(0, 2);
        caeCounts[prefix] = (caeCounts[prefix] || 0) + 1;
    });

    console.log('\n2. CAE Distribution:');
    Object.entries(caeCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .forEach(([cae, count]) => {
            console.log(`   CAE ${cae}: ${count} companies`);
        });

    // Test 3: Get sample avisos
    const avisos = await prisma.aviso.findMany({ where: { ativo: true }, take: 5 });
    console.log('\n3. Sample Avisos:');
    avisos.forEach(a => {
        console.log(`   - ${a.nome}`);
        console.log(`     Setores: ${a.setoresElegiveis.slice(0, 3).join(', ')}`);
        console.log(`     Região: ${a.regiao || 'Nacional'}`);
    });

    // Test 4: Test matching with a specific company
    const techCompany = await prisma.empresa.findFirst({
        where: { cae: { startsWith: '62' } }
    });

    if (techCompany) {
        console.log('\n4. Matching Test for Tech Company:');
        console.log(`   Company: ${techCompany.nome}`);
        console.log(`   CAE: ${techCompany.cae}, Setor: ${techCompany.setor}`);

        // Find matching avisos for I&D/Tech companies (CAE 62-63, 72-74)
        const techAvisos = avisos.filter(a =>
            a.setoresElegiveis.some(s =>
                s.toLowerCase().includes('tecnologia') ||
                s.toLowerCase().includes('i&d') ||
                s.toLowerCase().includes('digital')
            )
        );

        console.log(`   Matching Avisos (${techAvisos.length}):`);
        techAvisos.forEach(a => {
            console.log(`     - ${a.nome}`);
        });
    }

    // Test 5: Test matching for agriculture company
    const agriCompany = await prisma.empresa.findFirst({
        where: { cae: { startsWith: '01' } }
    });

    if (agriCompany) {
        console.log('\n5. Matching Test for Agriculture Company:');
        console.log(`   Company: ${agriCompany.nome}`);
        console.log(`   CAE: ${agriCompany.cae}, Setor: ${agriCompany.setor}`);

        const agriAvisos = avisos.filter(a =>
            a.setoresElegiveis.some(s =>
                s.toLowerCase().includes('agricultura')
            )
        );

        console.log(`   Matching Avisos (${agriAvisos.length}):`);
        agriAvisos.forEach(a => {
            console.log(`     - ${a.nome}`);
        });
    }

    await prisma.$disconnect();
}

main().catch(console.error);
