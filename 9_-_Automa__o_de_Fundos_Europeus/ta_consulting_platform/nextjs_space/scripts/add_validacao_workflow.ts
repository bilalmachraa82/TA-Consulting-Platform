
import { config } from 'dotenv';
import { PrismaClient, TipoWorkflow } from '@prisma/client';

// Carregar variáveis de ambiente
config();

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Adicionando workflow de validação de documentos...');

  // Verificar se o workflow já existe
  const existingWorkflow = await prisma.workflow.findFirst({
    where: { tipo: TipoWorkflow.VALIDACAO_DOCUMENTOS },
  });

  if (existingWorkflow) {
    console.log('✅ Workflow de validação já existe!');
    console.log(`   ID: ${existingWorkflow.id}`);
    console.log(`   Nome: ${existingWorkflow.nome}`);
    return;
  }

  // Criar workflow de validação de documentos
  const workflow = await prisma.workflow.create({
    data: {
      nome: 'Validação de Documentos',
      tipo: TipoWorkflow.VALIDACAO_DOCUMENTOS,
      ativo: true,
      frequencia: '0 9 * * *', // Diariamente às 9:00 AM
      parametros: {
        diasAlerta: [30, 15, 7],
        enviarEmails: true,
        atualizarStatus: true,
      },
    },
  });

  console.log('✅ Workflow de validação criado com sucesso!');
  console.log(`   ID: ${workflow.id}`);
  console.log(`   Nome: ${workflow.nome}`);
  console.log(`   Frequência: Diária às 9:00 AM`);
  console.log(`   Status: ${workflow.ativo ? 'Ativo' : 'Inativo'}`);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao adicionar workflow:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
