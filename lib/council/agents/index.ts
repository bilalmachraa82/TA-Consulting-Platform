/**
 * Council Agents
 * 
 * All 4 specialized agents for the council debate.
 */

import { BaseAgent, type AgentContext, type AgentResponse } from './base-agent';
export { BaseAgent, type AgentContext, type AgentResponse };
import { AGENT_CONFIGS, type AgentConfig } from '../types';

// Re-export specialized agents
export * from './specialized-agents';


// ============ Estratega Comercial ============

export class EstrategaAgent extends BaseAgent {
    constructor(verbose = false) {
        super(AGENT_CONFIGS.estratega, verbose);
    }

    protected buildPrompt(context: AgentContext): string {
        let prompt = super.buildPrompt(context);

        // Add comercial-specific context
        prompt += `\n\n# FOCO ESTRATÉGICO
- Qual é o preço que maximiza valor sem arruinar a relação?
- Que modelo de negócio (one-time, recorrente, partnership) é melhor?
- Como posicionar o over-delivery como vantagem negocial?

Se precisares de benchmarks de mercado, pede a ferramenta web_search.
Para dados históricos, usa db_query.`;

        return prompt;
    }
}

// ============ Advogado do Cliente ============

export class AdvogadoAgent extends BaseAgent {
    constructor(verbose = false) {
        super(AGENT_CONFIGS.advogado, verbose);
    }

    protected buildPrompt(context: AgentContext): string {
        let prompt = super.buildPrompt(context);

        // Add client-focused context
        prompt += `\n\n# FOCO NO CLIENTE
- Como é que o Fernando vai perceber esta proposta?
- O over-delivery cria expectativa ou goodwill?
- A relação prévia (formação de IA) deve influenciar o preço?

Se precisares de contexto sobre o histórico, pede a ferramenta rag_docs.`;

        return prompt;
    }
}

// ============ Técnico/Product ============

export class TecnicoAgent extends BaseAgent {
    constructor(verbose = false) {
        super(AGENT_CONFIGS.tecnico, verbose);
    }

    protected buildPrompt(context: AgentContext): string {
        let prompt = super.buildPrompt(context);

        // Add technical context
        prompt += `\n\n# FOCO TÉCNICO
- Quantas horas reais foram investidas?
- Que features são diferenciadoras (IP)?
- Como se compara com alternativas open-source?

FERRAMENTAS DISPONÍVEIS:
- code_search: para analisar o código e contar módulos
- rag_docs: para contexto do PRD original

Usa code_search para quantificar:
{ "toolRequests": [{ "tool": "code_search", "params": { "type": "count_lines" }, "reason": "Contar linhas de código" }] }`;

        return prompt;
    }
}

// ============ Devil's Advocate ============

export class DevilsAdvocateAgent extends BaseAgent {
    constructor(verbose = false) {
        super(AGENT_CONFIGS.devils, verbose);
    }

    protected buildPrompt(context: AgentContext): string {
        let prompt = super.buildPrompt(context);

        // Add skeptical context
        prompt += `\n\n# FOCO CRÍTICO
- Que objeções vai o Fernando levantar?
- O mercado português suporta estes preços?
- Qual é o pior cenário se a proposta for rejeitada?
- Há alternativas (Granter.AI) que possam competir?

Usa web_search para investigar concorrência e mercado.`;

        return prompt;
    }
}

// Specialized Agents
import {
    LLMArchitectAgent,
    PromptEngineerAgent,
    SearchSpecialistAgent,
    DataEngineerAgent,
    TypeScriptExpertAgent,
    QAExpertAgent
} from './specialized-agents';

// Tier 2 Agents
import {
    SecurityAuditorAgent,
    ApiDesignerAgent,
    BackendDeveloperAgent,
    FrontendDeveloperAgent,
    BusinessAnalystAgent,
    TechnicalWriterAgent
} from './tier2-agents';

export * from './tier2-agents';

// ============ Factory ============

export function createAgent(agentId: string, verbose = false): BaseAgent {
    switch (agentId) {
        // Base Agents
        case 'estratega': return new EstrategaAgent(verbose);
        case 'advogado': return new AdvogadoAgent(verbose);
        case 'tecnico': return new TecnicoAgent(verbose);
        case 'devils': return new DevilsAdvocateAgent(verbose);

        // Tier 1 Specialized
        case 'llm-architect': return new LLMArchitectAgent(verbose);
        case 'prompt-engineer': return new PromptEngineerAgent(verbose);
        case 'search-specialist': return new SearchSpecialistAgent(verbose);
        case 'data-engineer': return new DataEngineerAgent(verbose);
        case 'typescript-expert': return new TypeScriptExpertAgent(verbose);
        case 'qa-expert': return new QAExpertAgent(verbose);

        // Tier 2 Specialized
        case 'security-auditor': return new SecurityAuditorAgent(verbose);
        case 'api-designer': return new ApiDesignerAgent(verbose);
        case 'backend-developer': return new BackendDeveloperAgent(verbose);
        case 'frontend-developer': return new FrontendDeveloperAgent(verbose);
        case 'business-analyst': return new BusinessAnalystAgent(verbose);
        case 'technical-writer': return new TechnicalWriterAgent(verbose);

        default:
            throw new Error(`Unknown agent: ${agentId}`);
    }
}

export function createAllAgents(verbose = false): BaseAgent[] {
    return [
        new EstrategaAgent(verbose),
        new AdvogadoAgent(verbose),
        new TecnicoAgent(verbose),
        new DevilsAdvocateAgent(verbose),
        // Specialized agents are available but not instantiated by default in "all" 
        // to save resources, unless specifically requested in a dedicated flow.
        // But for completeness in tests/debug, we could add them. 
        // For now, keeping the core council as the default return.
    ];
}
