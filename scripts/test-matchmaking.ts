/**
 * Test Matchmaking Engine with Real Data
 * Run: npx tsx scripts/test-matchmaking.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function calculateMatchScore(aviso: any, company: any) {
    let total = 0;
    const reasons: string[] = [];

    // CAE Match
    if (aviso.setoresElegiveis?.length > 0) {
        const caeMatch = aviso.setoresElegiveis.some((s: string) =>
            s.toLowerCase().includes(company.cae?.substring(0, 2)) ||
            company.setor?.toLowerCase().includes(s.toLowerCase())
        );
        if (caeMatch) {
            total += 50;
            reasons.push(`CAE ${company.cae} compatível`);
        }
    }

    // Region Match
    if (aviso.regiao && company.regiao) {
        if (aviso.regiao.toLowerCase() === "nacional" ||
            aviso.regiao.toLowerCase().includes(company.regiao?.toLowerCase())) {
            total += 30;
            reasons.push(`Região ${company.regiao} elegível`);
        }
    }

    // Dimensao Match
    if (aviso.dimensaoEmpresa?.length > 0 && company.dimensao) {
        if (aviso.dimensaoEmpresa.includes(company.dimensao)) {
            total += 20;
            reasons.push(`Dimensão ${company.dimensao} permitida`);
        }
    }

    return { total, reasons };
}

async function main() {
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║         MATCHMAKING ENGINE TEST                          ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    // Get a sample aviso
    const aviso = await prisma.aviso.findFirst({
        where: { ativo: true }
    });

    if (!aviso) {
        console.log('❌ No active avisos found');
        return;
    }

    console.log(`🎯 Testing with Aviso: ${aviso.nome}`);
    console.log(`   Setores: ${aviso.setoresElegiveis.join(', ')}`);
    console.log(`   Região: ${aviso.regiao}`);
    console.log(`   Dimensões: ${aviso.dimensaoEmpresa.join(', ')}\n`);

    // Get companies
    const empresas = await prisma.empresa.findMany({
        where: { ativa: true },
        take: 500 // Limit for testing
    });

    console.log(`📊 Empresas na DB local: ${empresas.length}\n`);

    // Calculate matches
    const matches = [];
    for (const empresa of empresas) {
        const score = await calculateMatchScore(aviso, empresa);
        if (score.total > 0) {
            matches.push({
                id: empresa.id,
                nome: empresa.nome,
                cae: empresa.cae,
                regiao: empresa.regiao,
                dimensao: empresa.dimensao,
                score: score.total,
                reasons: score.reasons
            });
        }
    }

    // Sort by score
    matches.sort((a, b) => b.score - a.score);

    console.log('═'.repeat(60));
    console.log('📈 RESULTADOS DO MATCHMAKING');
    console.log('═'.repeat(60));
    console.log(`Total matches: ${matches.length}`);
    console.log(`Score >= 80: ${matches.filter(m => m.score >= 80).length}`);
    console.log(`Score 50-79: ${matches.filter(m => m.score >= 50 && m.score < 80).length}`);
    console.log(`Score < 50: ${matches.filter(m => m.score < 50).length}\n`);

    // Show top 10
    console.log('🏆 TOP 10 MATCHES:');
    console.log('-'.repeat(60));

    matches.slice(0, 10).forEach((m, i) => {
        console.log(`${i + 1}. ${m.nome}`);
        console.log(`   CAE: ${m.cae} | Região: ${m.regiao} | Dimensão: ${m.dimensao}`);
        console.log(`   Score: ${m.score}/100 | ${m.reasons.join(', ')}`);
        console.log('');
    });

    // Summary
    console.log('═'.repeat(60));
    console.log('✅ MATCHMAKING TEST COMPLETE');
    console.log(`   Ready to export ${matches.filter(m => m.score >= 50).length} leads to Bitrix`);
    console.log('═'.repeat(60));

    await prisma.$disconnect();
}

main().catch(console.error);
