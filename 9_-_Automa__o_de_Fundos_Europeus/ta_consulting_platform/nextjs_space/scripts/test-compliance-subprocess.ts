#!/usr/bin/env tsx
/**
 * Test Compliance Engine Subprocess Integration
 * Validates TypeScript → Python compliance engine communication
 */

import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface ComplianceResult {
  overall_status: string;
  passed: number;
  failed: number;
  total_rules: number;
  rules?: any[];
}

async function testComplianceEngine(): Promise<ComplianceResult> {
  return new Promise((resolve, reject) => {
    // Path to compliance engine
    // From scripts/ → nextjs_space/ → ta_consulting_platform/ → 9_-_Automa__o_de_Fundos_Europeus/ → TA-Consulting-Platform/
    const projectRoot = path.resolve(__dirname, '../../../..');
    const complianceEnginePath = path.join(
      projectRoot,
      'compliance',
      'engine',
      'compliance_engine.py'
    );

    // Test data (mock extracted fields from LLM)
    const inputData = {
      aviso_id: 'COMPETE2030-2025-4',
      programa: 'PT2030',
      empresa: {},  // Mock - would come from database
      candidatura: {},  // Mock - would come from database
      aviso: {
        codigo: 'COMPETE2030-2025-4',
        fundo: 'FEDER',
        programa: 'COMPETE 2030',
        // Add some mock extracted fields
        tiposBeneficiarios: ['EMPRESAS', 'ASSOCIACOES'],
        custosElegiveis: ['Equipamento', 'Software'],
      },
    };

    // Write input to temp file
    const tmpFile = `/tmp/compliance_test_${Date.now()}.json`;
    fs.writeFileSync(tmpFile, JSON.stringify(inputData));

    console.log('🧪 Testing Compliance Engine Subprocess Call\n');
    console.log('='.repeat(80));
    console.log(`\n📝 Input data:`);
    console.log(`   Aviso: ${inputData.aviso_id}`);
    console.log(`   Programa: ${inputData.programa}`);
    console.log(`   Temp file: ${tmpFile}\n`);

    // Call Python compliance engine via subprocess
    const python = spawn('python3', [
      '-c',
      `
import sys
import json
sys.path.insert(0, '${path.dirname(complianceEnginePath)}')
from compliance_engine import ComplianceEngine
from pathlib import Path

# Load input
with open('${tmpFile}', 'r') as f:
    data = json.load(f)

# Run compliance check
rulesets_dir = Path('${path.dirname(complianceEnginePath)}') / '..' / 'rulesets'
engine = ComplianceEngine(rulesets_dir)

report = engine.check_compliance(
    aviso_id=data['aviso_id'],
    programa=data['programa'],
    empresa=data.get('empresa'),
    candidatura=data.get('candidatura'),
    aviso=data.get('aviso')
)

# Output report as JSON
print(json.dumps(report.to_dict()))
      `.trim()
    ]);

    let output = '';
    let errorOutput = '';

    python.stdout.on('data', (data) => {
      output += data.toString();
    });

    python.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    python.on('close', (code) => {
      // Clean up temp file
      try {
        fs.unlinkSync(tmpFile);
      } catch (e) {}

      if (code !== 0) {
        console.error('❌ Python process failed');
        console.error('   Exit code:', code);
        console.error('   stderr:', errorOutput);
        reject(new Error(`Compliance engine failed with code ${code}: ${errorOutput}`));
        return;
      }

      try {
        // Parse JSON from last line (after any logging)
        const lines = output.trim().split('\n');
        const jsonLine = lines[lines.length - 1];
        const result = JSON.parse(jsonLine);
        resolve(result);
      } catch (e: any) {
        console.error('❌ Failed to parse JSON output');
        console.error('   Raw output:', output);
        reject(new Error(`Failed to parse compliance output: ${e.message}`));
      }
    });
  });
}

async function main() {
  try {
    console.log('⚖️  Step: Running Compliance Engine via subprocess...\n');

    const result = await testComplianceEngine();

    console.log('\n✅ Compliance Engine Response:');
    console.log(`   Overall Status: ${result.overall_status}`);
    console.log(`   Total Rules: ${result.total_rules}`);
    console.log(`   Passed: ${result.passed}`);
    console.log(`   Failed: ${result.failed}`);
    console.log(`   Pass Rate: ${((result.passed / result.total_rules) * 100).toFixed(1)}%`);

    if (result.rules && result.rules.length > 0) {
      const sampleRules = result.rules.slice(0, 5);
      console.log(`\n   Sample Rules:`);
      sampleRules.forEach((rule: any) => {
        const status = rule.result === 'PASS' ? '✅' : rule.result === 'FAIL' ? '❌' : '⚠️';
        console.log(`     ${status} ${rule.rule_id}: ${rule.result}`);
      });
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ COMPLIANCE SUBPROCESS INTEGRATION TEST PASSED\n');
    console.log('Summary:');
    console.log(`   • TypeScript → Python subprocess: ✅ WORKS`);
    console.log(`   • Compliance engine execution: ✅ WORKS`);
    console.log(`   • JSON response parsing: ✅ WORKS`);
    console.log(`   • Rules tested: ${result.total_rules}`);

  } catch (error: any) {
    console.error('\n❌ Test FAILED:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
