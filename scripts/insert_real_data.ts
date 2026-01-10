import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

type Portal = 'PORTUGAL2030' | 'PEPAC' | 'PRR';

// Função para mapear portal
function mapPortal(fonte: string): Portal {
  if (fonte.includes('Portugal 2030') || fonte === 'Portugal 2030') {
    return 'PORTUGAL2030';
  } else if (fonte === 'PEPAC') {
    return 'PEPAC';
  } else if (fonte === 'PRR') {
    return 'PRR';
  }
  return 'PORTUGAL2030'; // default
}

// Função para mapear dimensão de empresa
function mapDimensaoEmpresa(tipo: string): string[] {
  const tipo_lower = tipo.toLowerCase();
  if (tipo_lower.includes('pme')) {
    return ['MICRO', 'PEQUENA', 'MEDIA'];
  } else if (tipo_lower.includes('micro')) {
    return ['MICRO'];
  } else if (tipo_lower.includes('pequena')) {
    return ['PEQUENA'];
  } else if (tipo_lower.includes('média') || tipo_lower.includes('media')) {
    return ['MEDIA'];
  } else if (tipo_lower.includes('grande')) {
    return ['GRANDE'];
  }
  return ['MICRO', 'PEQUENA', 'MEDIA', 'GRANDE'];
}

// Função para determinar se é urgente (menos de 30 dias)
function isUrgente(dataFecho: Date): boolean {
  const hoje = new Date();
  const diffDias = Math.floor((dataFecho.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  return diffDias <= 30 && diffDias >= 0;
}

async function insertRealData() {
  console.log('📦 Inserindo dados reais dos 3 portais na base de dados...\n');

  try {
    // Ler arquivos JSON
    const dataDir = path.join(__dirname, '..', 'data', 'scraped');
    const portugal2030Data = JSON.parse(
      fs.readFileSync(path.join(dataDir, 'portugal2030_avisos.json'), 'utf-8')
    );
    const pepacData = JSON.parse(
      fs.readFileSync(path.join(dataDir, 'pepac_avisos.json'), 'utf-8')
    );
    const prrData = JSON.parse(
      fs.readFileSync(path.join(dataDir, 'prr_avisos.json'), 'utf-8')
    );

    const allData = [
      ...portugal2030Data.map((item: any) => ({ ...item, source: 'Portugal 2030' })),
      ...pepacData.map((item: any) => ({ ...item, source: 'PEPAC' })),
      ...prrData.map((item: any) => ({ ...item, source: 'PRR' }))
    ];

    let inserted = 0;
    let updated = 0;
    let errors = 0;

    for (const item of allData) {
      try {
        // Validar campos obrigatórios
        if (!item.id || !item.titulo || !item.fonte) {
          console.log(`  ⚠️ Aviso incompleto ignorado: ${item.id || 'sem ID'}`);
          continue;
        }

        // Preparar dados
        const dataAbertura = item.data_abertura ? new Date(item.data_abertura) : new Date();
        const dataFecho = item.data_fecho ? new Date(item.data_fecho) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
        
        const avisoData = {
          nome: item.titulo,
          portal: mapPortal(item.fonte),
          programa: item.setor || 'Diversos',
          linha: null,
          codigo: item.id,
          dataInicioSubmissao: dataAbertura,
          dataFimSubmissao: dataFecho,
          montanteMinimo: item.montante_min ? parseFloat(item.montante_min) : null,
          montanteMaximo: item.montante_max ? parseFloat(item.montante_max) : null,
          descrição: item.descricao || null,
          link: item.url || null,
          taxa: item.taxa_apoio ? `${item.taxa_apoio}%` : null,
          regiao: item.regiao || 'Nacional',
          setoresElegiveis: item.setor ? [item.setor] : [],
          dimensaoEmpresa: mapDimensaoEmpresa(item.tipo_beneficiario || 'PME'),
          urgente: isUrgente(dataFecho),
          ativo: item.status === 'Aberto',
        };

        // Verificar se já existe (por código)
        const existing = await prisma.aviso.findFirst({
          where: { codigo: item.id },
        });

        if (existing) {
          // Atualizar
          await prisma.aviso.update({
            where: { id: existing.id },
            data: avisoData,
          });
          updated++;
          console.log(`  🔄 Atualizado: ${item.titulo} (${item.id})`);
        } else {
          // Inserir novo
          await prisma.aviso.create({
            data: avisoData,
          });
          inserted++;
          console.log(`  ✅ Inserido: ${item.titulo} (${item.id})`);
        }
      } catch (error: any) {
        errors++;
        console.log(`  ❌ Erro: ${item.id} - ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('📊 RESUMO DA INSERÇÃO DE DADOS REAIS');
    console.log('='.repeat(70));
    console.log(`  ✅ Inseridos: ${inserted} avisos`);
    console.log(`  🔄 Atualizados: ${updated} avisos`);
    console.log(`  ❌ Erros: ${errors} avisos`);
    console.log(`  📈 Total processado: ${inserted + updated} avisos`);
    console.log('='.repeat(70));
    console.log('\n✅ Dados reais inseridos com sucesso na base de dados PostgreSQL!\n');

  } catch (error) {
    console.error('❌ Erro ao inserir dados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

insertRealData();
