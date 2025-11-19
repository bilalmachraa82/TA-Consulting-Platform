const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const user = await prisma.user.create({
      data: {
        name: 'Admin TA Consulting',
        email: 'admin@taconsulting.pt',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    console.log('✅ Utilizador criado com sucesso:', user.email);
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('Utilizador já existe. A atualizar password...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const user = await prisma.user.update({
        where: { email: 'admin@taconsulting.pt' },
        data: { password: hashedPassword },
      });
      console.log('✅ Password atualizada com sucesso');
    } else {
      console.error('❌ Erro:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
