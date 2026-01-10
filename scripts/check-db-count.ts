
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const avisos = await prisma.aviso.count();
        const empresas = await prisma.empresa.count();
        console.log(`✅ Conexão OK!`);
        console.log(`📊 Avisos: ${avisos}`);
        console.log(`🏭 Empresas: ${empresas}`);

        if (avisos === 0) {
            console.log('⚠️ AVISO: A tabela de avisos está vazia. É necessário popular para a demo.');
        }
    } catch (e) {
        console.error('❌ Erro de conexão:', e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
