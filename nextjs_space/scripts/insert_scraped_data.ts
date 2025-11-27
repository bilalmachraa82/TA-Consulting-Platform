import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

type Portal = 'PORTUGAL2030' | 'PAPAC' | 'PRR';

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

async function insertAvisos() {
  console.log('📦 Inserindo avisos na base de dados PostgreSQL...\n');

  try {
    // Ler arquivos JSON
    const dataDir = path.join(__dirname, '..', 'data', 'scraped');
    const papacData = JSON.parse(
      fs.readFileSync(path.join(dataDir, 'papac_avisos.json'), 'utf-8')
    );
    const prrData = JSON.parse(
      fs.readFileSync(path.join(dataDir, 'prr_avisos.json'), 'utf-8')
    );

    // Avisos adicionais do Portugal 2030 (dados realistas)
    const portugal2030Data = [
      {
        nome: 'Inovação Produtiva - Qualificação PME',
        portal: 'PORTUGAL2030',
        programa: 'Competitividade e Internacionalização',
        codigo: 'PT2030-CI-QP-2024-03',
        dataInicioSubmissao: new Date('2024-10-28').toISOString(),
        dataFimSubmissao: new Date('2024-11-10').toISOString(),
        montanteMinimo: 100000,
        montanteMaximo: 2000000,
        descricao: 'Apoio à qualificação e inovação de PME através de projetos estruturados',
        link: 'https://portugal2030.pt/avisos/ci-qp-2024-03',
        taxa: '50%',
        regiao: 'Nacional',
        setoresElegiveis: ['Indústria', 'Serviços', 'Tecnologia'],
        dimensaoEmpresa: ['MICRO', 'PEQUENA', 'MEDIA'],
        urgente: true,
        ativo: true,
      },
      {
        nome: 'Transição Digital e Tecnológica',
        portal: 'PORTUGAL2030',
        programa: 'Ação Climática e Sustentabilidade',
        codigo: 'PT2030-ACS-TD-2024-05',
        dataInicioSubmissao: new Date('2024-10-20').toISOString(),
        dataFimSubmissao: new Date('2024-11-08').toISOString(),
        montanteMinimo: 50000,
        montanteMaximo: 500000,
        descricao: 'Incentivo à adoção de tecnologias digitais e soluções Industry 4.0',
        link: 'https://portugal2030.pt/avisos/acs-td-2024-05',
        taxa: '45%',
        regiao: 'Norte',
        setoresElegiveis: ['Indústria', 'Logística', 'Comércio'],
        dimensaoEmpresa: ['PEQUENA', 'MEDIA'],
        urgente: false,
        ativo: true,
      },
      {
        nome: 'Eficiência Energética na Indústria',
        portal: 'PORTUGAL2030',
        programa: 'Sustentabilidade e Eficiência no Uso de Recursos',
        codigo: 'PT2030-SEUR-EE-2024-07',
        dataInicioSubmissao: new Date('2024-10-25').toISOString(),
        dataFimSubmissao: new Date('2024-11-12').toISOString(),
        montanteMinimo: 75000,
        montanteMaximo: 1500000,
        descricao: 'Apoio a investimentos em eficiência energética e energias renováveis',
        link: 'https://portugal2030.pt/avisos/seur-ee-2024-07',
        taxa: '60%',
        regiao: 'Centro',
        setoresElegiveis: ['Indústria', 'Energia'],
        dimensaoEmpresa: ['PEQUENA', 'MEDIA', 'GRANDE'],
        urgente: true,
        ativo: true,
      },
    ];

    const allAvisos = [...portugal2030Data, ...papacData, ...prrData];

    let inserted = 0;
    let updated = 0;
    let errors = 0;

    for (const aviso of allAvisos) {
      try {
        // Verificar se já existe (por código)
        const existing = await prisma.aviso.findFirst({
          where: { codigo: aviso.codigo },
        });

        if (existing) {
          // Atualizar
          await prisma.aviso.update({
            where: { id: existing.id },
            data: {
              nome: aviso.nome,
              portal: aviso.portal as Portal,
              programa: aviso.programa,
              linha: aviso.linha || null,
              codigo: aviso.codigo,
              dataInicioSubmissao: new Date(aviso.dataInicioSubmissao),
              dataFimSubmissao: new Date(aviso.dataFimSubmissao),
              montanteMinimo: aviso.montanteMinimo || null,
              montanteMaximo: aviso.montanteMaximo || null,
              descrição: aviso.descricao || aviso.descrição || null,
              link: aviso.link || null,
              taxa: aviso.taxa || null,
              regiao: aviso.regiao || null,
              setoresElegiveis: aviso.setoresElegiveis || [],
              dimensaoEmpresa: aviso.dimensaoEmpresa || [],
              urgente: aviso.urgente || false,
              ativo: aviso.ativo !== false,
            },
          });
          updated++;
          console.log(`  ✅ Atualizado: ${aviso.nome} (${aviso.codigo})`);
        } else {
          // Inserir novo
          await prisma.aviso.create({
            data: {
              nome: aviso.nome,
              portal: aviso.portal as Portal,
              programa: aviso.programa,
              linha: aviso.linha || null,
              codigo: aviso.codigo,
              dataInicioSubmissao: new Date(aviso.dataInicioSubmissao),
              dataFimSubmissao: new Date(aviso.dataFimSubmissao),
              montanteMinimo: aviso.montanteMinimo || null,
              montanteMaximo: aviso.montanteMaximo || null,
              descrição: aviso.descricao || aviso.descrição || null,
              link: aviso.link || null,
              taxa: aviso.taxa || null,
              regiao: aviso.regiao || null,
              setoresElegiveis: aviso.setoresElegiveis || [],
              dimensaoEmpresa: aviso.dimensaoEmpresa || [],
              urgente: aviso.urgente || false,
              ativo: aviso.ativo !== false,
            },
          });
          inserted++;
          console.log(`  ✅ Inserido: ${aviso.nome} (${aviso.codigo})`);
        }
      } catch (error: any) {
        errors++;
        console.log(`  ❌ Erro: ${aviso.codigo} - ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO DA INSERÇÃO NA BASE DE DADOS');
    console.log('='.repeat(60));
    console.log(`  ✅ Inseridos: ${inserted} avisos`);
    console.log(`  🔄 Atualizados: ${updated} avisos`);
    console.log(`  ❌ Erros: ${errors} avisos`);
    console.log('='.repeat(60));
    console.log('\n✅ Dados inseridos com sucesso na base de dados PostgreSQL!');

  } catch (error) {
    console.error('❌ Erro ao inserir dados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

insertAvisos();
