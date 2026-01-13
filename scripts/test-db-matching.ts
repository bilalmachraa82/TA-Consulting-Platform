/**
 * Test matching with database companies
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Setor to CAE prefixes mapping
const SETOR_TO_CAE_PREFIXES: Record<string, string[]> = {
    'Indústria Transformadora': ['10', '11', '13', '14', '15', '16', '17', '18', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33'],
    'Indústria': ['10', '11', '13', '14', '15', '16', '17', '18', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33'],
    'Serviços e Comércio': ['45', '46', '47', '55', '56', '58', '59', '60', '61', '62', '63', '69', '70', '71', '72', '73', '74'],
    'I&D e Tecnologia': ['62', '63', '72', '73', '74'],
    'Agricultura': ['01', '02', '03'],
    'Turismo': ['55', '56'],
    'Todos os setores': [],
};

async function main() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('     BITRIX INTEGRATION - MATCHING TEST WITH DB DATA');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Get sample avisos from database
    const avisos = await prisma.aviso.findMany({
        where: { ativo: true },
        take: 5
    });

    console.log('📋 Sample Avisos from Database:');
    avisos.forEach(a => {
        console.log(`  - ${a.nome}`);
        console.log(`    CAE elegíveis: ${a.setoresElegiveis.join(', ')}`);
        console.log(`    Região: ${a.regiao || 'Nacional'}`);
        console.log(`    Dimensões: ${a.dimensaoEmpresa.join(', ')}\n`);
    });

    // Test matching for first aviso
    if (avisos.length > 0) {
        const aviso = avisos[0];
        console.log(`\n🔍 Testing matching for: ${aviso.nome}`);

        // Get companies
        const empresas = await prisma.empresa.findMany({
            where: { ativa: true },
            take: 1000
        });

        console.log(`  Analyzing ${empresas.length} companies...\n`);

        // Simple matching logic
        const matches = [];
        for (const emp of empresas) {
            let score = 0;
            const reasons = [];

            // CAE match
            if (aviso.setoresElegiveis.length > 0) {
                const caePrefix = emp.cae.substring(0, 2);
                if (aviso.setoresElegiveis.some(s => s.includes(caePrefix) || s.includes(emp.setor))) {
                    score += 50;
                    reasons.push(`CAE ${emp.cae} compatível`);
                }
            }

            // Region match
            const isNational = !aviso.regiao || aviso.regiao.toLowerCase() === 'nacional';
            const regionMatch = emp.regiao && aviso.regiao.toLowerCase().includes(emp.regiao.toLowerCase());
            if (isNational || regionMatch) {
                score += 30;
                reasons.push(`Região ${emp.regiao || 'Nacional'} compatível`);
            }

            // Dimension match
            if (aviso.dimensaoEmpresa.includes(emp.dimensao)) {
                score += 20;
                reasons.push(`Dimensão ${emp.dimensao} elegível`);
            }

            if (score >= 70) {
                matches.push({
                    nome: emp.nome,
                    nipc: emp.nipc,
                    cae: emp.cae,
                    regiao: emp.regiao,
                    dimensao: emp.dimensao,
                    score,
                    reasons
                });
            }
        }

        matches.sort((a, b) => b.score - a.score);

        console.log(`  ✓ Matches found (score >= 70): ${matches.length}\n`);

        console.log('  Top 10 matches:');
        matches.slice(0, 10).forEach((m, i) => {
            console.log(`    ${i + 1}. ${m.nome} (Score: ${m.score}/100)`);
            console.log(`       NIPC: ${m.nipc}, CAE: ${m.cae}, Região: ${m.regiao}, Dimensão: ${m.dimensao}`);
            console.log(`       Reasons: ${m.reasons.join(', ')}\n`);
        });
    }

    await prisma.$disconnect();
}

main().catch(console.error);
