#!/usr/bin/env node
/**
 * Import avisos from local JSON file (backup method when database is unavailable)
 * This script reads from avisos_ready_for_import_FIXED.json and prepares SQL
 */

const fs = require('fs');
const path = require('path');

// Load the avisos from the prepared JSON file
const avisosPath = path.join(__dirname, '..', '..', '..', 'avisos_ready_for_import_FIXED.json');
const avisos = JSON.parse(fs.readFileSync(avisosPath, 'utf-8'));

console.log(`📦 Loaded ${avisos.length} avisos from local JSON file\n`);

// Filter only Portugal 2030 avisos (first 5 items)
const portugal2030Avisos = avisos.slice(0, 5);

console.log('🇵🇹 Portugal 2030 Avisos (Ready for import):');
console.log('='.repeat(80));

portugal2030Avisos.forEach((aviso, index) => {
  console.log(`\n${index + 1}. ${aviso.nome}`);
  console.log(`   Código: ${aviso.codigo}`);
  console.log(`   Portal: ${aviso.portal}`);
  console.log(`   Programa: ${aviso.programa}`);
  console.log(`   Data Abertura: ${aviso.dataInicioSubmissao}`);
  console.log(`   Data Fecho: ${aviso.dataFimSubmissao}`);
  console.log(`   Montante Máximo: €${aviso.montanteMaximo?.toLocaleString() || 'N/A'}`);
  console.log(`   Link: ${aviso.link}`);
  console.log(`   Urgente: ${aviso.urgente ? '🔴 SIM' : 'Não'}`);
  console.log(`   Dias Restantes: ${aviso.diasRestantes || 'N/A'}`);
});

console.log('\n' + '='.repeat(80));
console.log('\n📊 Summary:');
console.log(`   Total avisos: ${portugal2030Avisos.length}`);
console.log(`   Urgent (< 15 days): ${portugal2030Avisos.filter(a => a.urgente).length}`);
console.log(`   Active: ${portugal2030Avisos.filter(a => a.ativo).length}`);

// Generate SQL INSERT statements for manual database import
console.log('\n📝 SQL INSERT Statements (for manual import):');
console.log('='.repeat(80));

const sqlStatements = portugal2030Avisos.map(aviso => {
  const nome = aviso.nome.replace(/'/g, "''");
  const programa = aviso.programa.replace(/'/g, "''");
  const descricao = (aviso.descricao || '').replace(/'/g, "''");
  const link = aviso.link || '';
  const dataInicio = aviso.dataInicioSubmissao || new Date().toISOString();
  const dataFim = aviso.dataFimSubmissao || new Date().toISOString();

  return `
-- ${aviso.codigo}: ${aviso.nome}
INSERT INTO avisos (
  id, nome, portal, programa, codigo,
  "dataInicioSubmissao", "dataFimSubmissao",
  "montanteMaximo", "descrição", link,
  regiao, urgente, ativo, "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  '${nome}',
  '${aviso.portal}',
  '${programa}',
  '${aviso.codigo}',
  '${dataInicio}'::timestamp,
  '${dataFim}'::timestamp,
  ${aviso.montanteMaximo || 'NULL'},
  '${descricao}',
  '${link}',
  '${aviso.regiao || 'Nacional'}',
  ${aviso.urgente},
  ${aviso.ativo},
  NOW(),
  NOW()
) ON CONFLICT (codigo) DO UPDATE SET
  nome = EXCLUDED.nome,
  "dataFimSubmissao" = EXCLUDED."dataFimSubmissao",
  "montanteMaximo" = EXCLUDED."montanteMaximo",
  urgente = EXCLUDED.urgente,
  ativo = EXCLUDED.ativo,
  "updatedAt" = NOW();
`.trim();
});

console.log(sqlStatements.join('\n\n'));

// Save SQL to file
const sqlFilePath = path.join(__dirname, 'import_avisos.sql');
fs.writeFileSync(sqlFilePath, sqlStatements.join('\n\n') + '\n', 'utf-8');

console.log('\n\n✅ SQL file saved to:', sqlFilePath);
console.log('\n📋 Next steps:');
console.log('   1. Check database connectivity (might be hibernated/firewalled)');
console.log('   2. Import SQL file manually using Supabase dashboard or psql');
console.log('   3. Or wait for database to be accessible and run: node import_apify_dataset.js');
