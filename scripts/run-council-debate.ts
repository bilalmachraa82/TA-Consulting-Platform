#!/usr/bin/env npx tsx
/**
 * AI Council Debate CLI Script
 * 
 * Runs a full council debate session and generates a report.
 * 
 * Usage: npx tsx scripts/run-council-debate.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
import 'dotenv/config';

// Dynamic import to handle module resolution
async function main() {
    console.log('\n🧠 AI COUNCIL - STRATEGIC DEBATE\n');

    // Check for OpenRouter API key
    if (!process.env.OPENROUTER_API_KEY) {
        console.error('❌ OPENROUTER_API_KEY not set in environment');
        console.log('   Set it in .env or export OPENROUTER_API_KEY=your_key');
        process.exit(1);
    }

    // Import orchestrator
    const { runCouncilDebate } = await import('../lib/council/orchestrator');

    // Load the AI Council prompt - use absolute path
    const promptPath = '/Users/bilal/.gemini/antigravity/brain/c49c52ca-7082-476a-8aea-3a7424d7486c/ai_council_prompt.md';

    let context = '';
    if (fs.existsSync(promptPath)) {
        context = fs.readFileSync(promptPath, 'utf-8');
        console.log('📄 Loaded AI Council prompt from artifacts\n');
    } else {
        // Fallback context - NO PRICE ASSUMPTIONS
        context = `
# CONTEXTO: TA CONSULTING PLATFORM

## FACTOS (ÚNICOS DADOS VÁLIDOS)
- Horas trabalhadas: 40 horas
- Taxa horária mínima: €65/hora
- Custo de produção: €2,600
- Módulos: 3 (RAG, Scraping, Deep Analysis)
- Cliente: Fernando (aguarda orçamento)

## BENCHMARKS PORTUGAL
- Developer Sénior: €40-65/hora
- App Web com BD: €15,000-€25,000
- Fee Consultoria Fundos: €2,000-€10,000

## OBJETIVO
Calcular preço justo baseado no custo + margem + valor de mercado PT.
NÃO há preço prévio acordado.
`;
    }

    // Run the debate
    const report = await runCouncilDebate({
        topic: 'Estratégia de Pricing e Comunicação para TA Consulting Platform',
        context,
        maxRounds: 3,
        enableTools: true,
        budgetLimit: 2, // €2 budget limit for testing
        verbose: true,
    });

    // Save report to absolute artifact path
    const reportPath = '/Users/bilal/.gemini/antigravity/brain/c49c52ca-7082-476a-8aea-3a7424d7486c/council_report.md';
    const reportDir = path.dirname(reportPath);

    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportContent = generateMarkdownReport(report);
    fs.writeFileSync(reportPath, reportContent);

    console.log(`\n📝 Report saved to: ${reportPath}`);
    console.log('\n' + '═'.repeat(60));
    console.log('FINAL RECOMMENDATION');
    console.log('═'.repeat(60));
    console.log(`💰 Preço Recomendado: €${report.recommendation.pricing.recommended}`);
    console.log(`📋 Estratégia: ${report.recommendation.strategy.approach}`);
    console.log(`✅ Próximos Passos:`);
    report.recommendation.nextSteps.forEach((step: string, i: number) => {
        console.log(`   ${i + 1}. ${step}`);
    });
}

/**
 * Generate markdown report from council output
 */
function generateMarkdownReport(report: any): string {
    const { metadata, summary, roundSummaries, agentPositions, consensus, conflicts, recommendation } = report;

    let md = `# 📊 AI COUNCIL REPORT
## ${metadata.topic}

---

**Session ID:** \`${metadata.sessionId}\`  
**Duration:** ${metadata.duration}  
**Total Rounds:** ${metadata.totalRounds}  
**Tokens Used:** ${metadata.totalTokens.toLocaleString()}  
**Estimated Cost:** ${metadata.estimatedCost}  
**Generated:** ${new Date(metadata.generatedAt).toISOString()}

---

## 📋 SUMMARY

${summary}

---

## 🔄 ROUND SUMMARIES

`;

    for (const round of roundSummaries) {
        md += `### Round ${round.round} - ${round.phase}\n`;
        md += round.highlights.map((h: string) => `- ${h}`).join('\n');
        md += '\n\n';
    }

    md += `---

## 🤖 AGENT POSITIONS

`;

    for (const agent of agentPositions) {
        md += `### ${agent.emoji} ${agent.agentName}

**Initial Position:**
${agent.initialPosition}

**Final Position:**
${agent.finalPosition}

**Key Arguments:** ${agent.keyArguments.join(', ') || 'N/A'}

**Tools Used:** ${agent.toolsUsed.join(', ') || 'None'}

---

`;
    }

    md += `## ✅ CONSENSUS POINTS

`;

    if (consensus.length > 0) {
        for (const item of consensus) {
            md += `- **${item.topic}**: ${item.position} (Confidence: ${(item.confidence * 100).toFixed(0)}%)\n`;
        }
    } else {
        md += '*No consensus reached*\n';
    }

    md += `

## ⚠️ CONFLICT POINTS

`;

    if (conflicts.length > 0) {
        for (const item of conflicts) {
            md += `### ${item.topic} (${item.severity})\n`;
            for (const pos of item.positions) {
                md += `- **${pos.agentId}**: ${pos.position}\n`;
            }
            md += '\n';
        }
    } else {
        md += '*No major conflicts*\n';
    }

    md += `

---

## 🎯 FINAL RECOMMENDATION

### Pricing
| Metric | Value |
|--------|-------|
| **Recommended** | €${recommendation.pricing.recommended} |
| **Minimum** | €${recommendation.pricing.minimum} |
| **Maximum** | €${recommendation.pricing.maximum} |

**Justification:** ${recommendation.pricing.justification}

### Strategy
**Approach:** ${recommendation.strategy.approach}

**Key Points:**
${recommendation.strategy.keyPoints.map((p: string) => `- ${p}`).join('\n')}

**Risks:**
${recommendation.strategy.risks.map((r: string) => `- ⚠️ ${r}`).join('\n')}

**Mitigations:**
${recommendation.strategy.mitigations.map((m: string) => `- ✓ ${m}`).join('\n')}

### Next Steps
${recommendation.nextSteps.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}

### Unanimous Points
${recommendation.unanimousPoints.map((p: string) => `- ✅ ${p}`).join('\n')}

`;

    if (recommendation.minorityOpinions && recommendation.minorityOpinions.length > 0) {
        md += `### Minority Opinions\n`;
        for (const opinion of recommendation.minorityOpinions) {
            md += `- **${opinion.agentId}**: ${opinion.opinion}\n`;
        }
    }

    md += `

---

*Report generated by AI Council v1.0*
`;

    return md;
}

// Run
main().catch(error => {
    console.error('❌ Council debate failed:', error);
    process.exit(1);
});
