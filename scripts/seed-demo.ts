
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Avisos para Demo...');

    // Check and Create Demo User
    const demoEmail = 'fernando@demo.taconsulting.pt';
    const userExists = await prisma.user.findUnique({ where: { email: demoEmail } });

    if (!userExists) {
        console.log('👤 Criando Utilizador de Demo...');
        // Hash password 'demo2026'
        const hashedPassword = await bcrypt.hash('demo2026', 10);

        await prisma.user.create({
            data: {
                email: demoEmail,
                name: 'Fernando (Demo)',
                password: hashedPassword,
                role: 'ADMIN',
            }
        });
        console.log('✅ Utilizador Demo Criado: fernando@demo.taconsulting.pt / demo2026');
    } else {
        console.log('ℹ️ Utilizador Demo já existe.');
    }

    // Check Avisos
    const count = await prisma.aviso.count();
    if (count > 0) {
        console.log('✅ Base de dados já tem avisos. Skipping avisos seed.');
        return;
    }

    // Criar avisos de demonstração se a tabela estiver vazia
    await prisma.aviso.createMany({
        data: [
            {
                nome: 'SI Inovação Produtiva - PME',
                codigo: 'COMPETE-2030-2025-01',
                portal: 'PORTUGAL2030',
                programa: 'COMPETE 2030',
                dataInicioSubmissao: new Date(),
                dataFimSubmissao: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // +90 dias
                montanteMinimo: 250000,
                montanteMaximo: 5000000,
                taxa: 'Até 75%',
                setoresElegiveis: ['Indústria', 'Turismo'],
                dimensaoEmpresa: ['MICRO', 'PEQUENA', 'MEDIA'],
                regiao: 'Norte, Centro, Alentejo',
                ativo: true,
                descricao: 'Apoio à inovação produtiva em PME.',
                link: 'https://portugal2030.pt'
            },
            {
                nome: 'Vouchers para Startups - Novos Produtos Verdes',
                codigo: 'PRR-C05-i01-2025',
                portal: 'PRR',
                programa: 'PRR',
                dataInicioSubmissao: new Date(),
                dataFimSubmissao: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 dias
                montanteMinimo: 0,
                montanteMaximo: 30000,
                taxa: '100% financiamento',
                setoresElegiveis: ['Todos'],
                dimensaoEmpresa: ['MICRO', 'PEQUENA'],
                regiao: 'Nacional',
                ativo: true,
                descricao: 'Apoio a startups para desenvolvimento de produtos verdes.',
                link: 'https://recuperarportugal.gov.pt'
            },
            {
                nome: 'Internacionalização PME 2025',
                codigo: 'INT-2025-02',
                portal: 'PORTUGAL2030',
                programa: 'COMPETE 2030',
                dataInicioSubmissao: new Date(),
                dataFimSubmissao: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // +60 dias
                montanteMinimo: 50000,
                montanteMaximo: 500000,
                taxa: '50% Fundo Perdido',
                setoresElegiveis: ['Comércio', 'Indústria'],
                dimensaoEmpresa: ['PEQUENA', 'MEDIA'],
                regiao: 'Nacional',
                ativo: true,
                descricao: 'Apoio à expansão internacional.',
                link: 'https://portugal2030.pt'
            }
        ]
    });

    console.log('✅ Avisos de Demo Criados com Sucesso!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
