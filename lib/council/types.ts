/**
 * AI Council - Type Definitions
 * 
 * Complete type system for the multi-agent debate orchestrator.
 */

// ============ Agent Types ============

// Specialized Agents (Tier 1)
export type SpecializedAgentId =
    | 'llm-architect'
    | 'prompt-engineer'
    | 'search-specialist'
    | 'data-engineer'
    | 'typescript-expert'
    | 'qa-expert';

// Tier 2 Agents
export type Tier2AgentId =
    | 'security-auditor'
    | 'api-designer'
    | 'backend-developer'
    | 'frontend-developer'
    | 'business-analyst'
    | 'technical-writer';

export type AgentId =
    | 'estratega'
    | 'advogado'
    | 'tecnico'
    | 'devils'
    | 'moderator'
    | SpecializedAgentId
    | Tier2AgentId;

export type AgentRole =
    | 'ESTRATEGA_COMERCIAL'
    | 'ADVOGADO_CLIENTE'
    | 'TECNICO_PRODUCT'
    | 'DEVILS_ADVOCATE'
    | 'MODERATOR'
    | 'LLM Architect'
    | 'Prompt Engineer'
    | 'Search Specialist'
    | 'Data Engineer'
    | 'TypeScript Expert'
    | 'QA Expert'
    | 'Security Auditor'
    | 'API Designer'
    | 'Backend Developer'
    | 'Frontend Developer'
    | 'Business Analyst'
    | 'Technical Writer';

export interface AgentConfig {
    id: AgentId;
    role: AgentRole;
    name: string;
    model: string;
    systemPrompt: string;
    tools: ToolName[];
    bias: string;
    emoji: string;
}

// ============ Tool Types ============

export type ToolName =
    | 'code_search'
    | 'web_search'
    | 'rag_docs'
    | 'db_query'
    | 'read_file'
    | 'write_file'
    | 'list_dir'
    | 'run_command';

export interface ToolResult {
    tool: ToolName;
    success: boolean;
    data: any;
    error?: string;
    executionTimeMs: number;
}

// Code Search Tool
export interface CodeSearchParams {
    query: string;
    type: 'grep' | 'count_files' | 'count_lines' | 'list_modules';
    path?: string;
}

export interface CodeSearchResult {
    results: string[];
    count: number;
    matchedFiles?: string[];
}

// Web Search Tool
export interface WebSearchParams {
    query: string;
    region: 'pt' | 'eu' | 'global';
    maxResults?: number;
}

export interface WebSearchResult {
    snippets: {
        title: string;
        content: string;
        url: string;
    }[];
}

// RAG Docs Tool
export interface RAGDocsParams {
    query: string;
    sources: ('prd' | 'candidaturas' | 'docs_archive' | 'github')[];
    maxChunks?: number;
}

export interface RAGDocsResult {
    chunks: {
        content: string;
        source: string;
        score: number;
    }[];
}

// DB Query Tool
export interface DBQueryParams {
    entity: 'candidaturas' | 'empresas' | 'avisos';
    aggregation: 'count' | 'sum' | 'list' | 'stats';
    filters?: Record<string, any>;
    limit?: number;
}

export interface DBQueryResult {
    data: any;
    count: number;
}

// ============ Message Types ============

export interface AgentMessage {
    agentId: AgentId;
    round: number;
    timestamp: Date;
    content: string;
    toolCalls?: ToolResult[];
    citations?: string[];
    confidence?: number;
}

export interface ToolCallRequest {
    tool: ToolName;
    params: CodeSearchParams | WebSearchParams | RAGDocsParams | DBQueryParams;
    reason: string;
}

// ============ Debate Types ============

export interface DebateRound {
    roundNumber: number;
    phase: 'INITIAL' | 'CROSS_EXAM' | 'CONVERGENCE' | 'SYNTHESIS';
    messages: AgentMessage[];
    startTime: Date;
    endTime?: Date;
}

export interface ConsensusItem {
    topic: string;
    position: string;
    supportingAgents: AgentId[];
    confidence: number;
}

export interface ConflictItem {
    topic: string;
    positions: {
        agentId: AgentId;
        position: string;
    }[];
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface DebateState {
    sessionId: string;
    topic: string;
    currentRound: number;
    maxRounds: number;
    rounds: DebateRound[];
    consensus: ConsensusItem[];
    conflicts: ConflictItem[];
    moderatorNotes: string[];
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
    startTime: Date;
    endTime?: Date;
    totalTokens?: number;
    totalCost?: number;
}

// ============ Final Output Types ============

export interface FinalRecommendation {
    pricing: {
        recommended: number;
        minimum: number;
        maximum: number;
        currency: 'EUR';
        justification: string;
    };
    strategy: {
        approach: string;
        keyPoints: string[];
        risks: string[];
        mitigations: string[];
    };
    nextSteps: string[];
    unanimousPoints: string[];
    minorityOpinions: {
        agentId: AgentId;
        opinion: string;
    }[];
}

export interface CouncilReport {
    metadata: {
        sessionId: string;
        topic: string;
        duration: string;
        totalRounds: number;
        totalTokens: number;
        estimatedCost: string;
        generatedAt: Date;
    };
    summary: string;
    roundSummaries: {
        round: number;
        phase: string;
        highlights: string[];
    }[];
    agentPositions: {
        agentId: AgentId;
        agentName: string;
        emoji: string;
        initialPosition: string;
        finalPosition: string;
        keyArguments: string[];
        toolsUsed: ToolName[];
    }[];
    consensus: ConsensusItem[];
    conflicts: ConflictItem[];
    recommendation: FinalRecommendation;
}

// ============ Input Types ============

export interface CouncilInput {
    topic: string;
    context: string;
    customPrompt?: string;
    maxRounds?: number;
    enableTools?: boolean;
    budgetLimit?: number; // Max cost in EUR
    verbose?: boolean;
}

// ============ Agent Configurations ============

export const AGENT_CONFIGS: Record<AgentId, AgentConfig> = {
    estratega: {
        id: 'estratega',
        role: 'ESTRATEGA_COMERCIAL',
        name: 'Estratega Comercial',
        model: 'openai/gpt-5.2',
        emoji: '🔵',
        bias: 'Maximizar receita e proteger margens',
        tools: ['web_search', 'db_query'],
        systemPrompt: `És o Estratega Comercial num conselho de IA.
PERSONA: CFO / Head of Sales com 15 anos de experiência.
FOCUS: Pricing, margens, ROI, modelos de negócio sustentáveis.
BIAS: Maximizar valor do deal sem arruinar a relação.

REGRAS:
1. Fundamenta SEMPRE com números e benchmarks de mercado
2. Considera o contexto português (PMEs, budgets limitados)
3. Propõe cenários concretos com valores específicos
4. Usa ferramentas para validar dados de mercado

OUTPUT: JSON com { position, keyArguments, pricingSuggestion, toolRequests }`,
    },

    advogado: {
        id: 'advogado',
        role: 'ADVOGADO_CLIENTE',
        name: 'Advogado do Cliente',
        model: 'anthropic/claude-opus-4.5',
        emoji: '🟢',
        bias: 'Proteger relação e garantir satisfação do cliente',
        tools: ['rag_docs'],
        systemPrompt: `És o Advogado do Cliente num conselho de IA.
PERSONA: Customer Success Manager empático e experiente.
FOCUS: Perspectiva do cliente, valor percebido, relação a longo prazo.
BIAS: O cliente tem de se sentir tratado com justiça.

REGRAS:
1. Coloca-te no lugar do Fernando (o cliente)
2. Considera o histórico de relação (formação prévia, confiança)
3. Antecipa objeções e preocupações do cliente
4. O over-delivery deve ser visto como gift, não upsell

OUTPUT: JSON com { position, clientPerspective, relationshipImpact, toolRequests }`,
    },

    tecnico: {
        id: 'tecnico',
        role: 'TECNICO_PRODUCT',
        name: 'Técnico/Product',
        model: 'google/gemini-3-pro-preview',
        emoji: '🟠',
        bias: 'Valorizar corretamente o trabalho técnico',
        tools: ['code_search', 'rag_docs'],
        systemPrompt: `És o Técnico/Product num conselho de IA.
PERSONA: CTO / Tech Lead com profundo conhecimento do código.
FOCUS: Esforço real, complexidade técnica, diferenciação, IP.
BIAS: Trabalho técnico de qualidade merece valorização justa.

REGRAS:
1. Analisa o código para quantificar o esforço
2. Identifica features diferenciadores (Fact-Locked Writer, Eligibility Engine)
3. Compara com alternativas open-source
4. Justifica horas reais vs estimadas

OUTPUT: JSON com { position, technicalAnalysis, effortBreakdown, ipAssets, toolRequests }`,
    },

    devils: {
        id: 'devils',
        role: 'DEVILS_ADVOCATE',
        name: "Devil's Advocate",
        model: 'z-ai/glm-4.7',
        emoji: '🔴',
        bias: 'Encontrar falhas e riscos que outros ignoram',
        tools: ['web_search'],
        systemPrompt: `És o Devil's Advocate num conselho de IA.
PERSONA: Risk Analyst cético e rigoroso.
FOCUS: Riscos, objeções, worst-case scenarios, realidade do mercado PT.
BIAS: Se há uma razão para falhar, tu encontras.

REGRAS:
1. Questiona TODAS as suposições dos outros agentes
2. Pesquisa concorrência e alternativas (Granter.AI, etc.)
3. Considera cenários de rejeição e como mitigar
4. O mercado português tem especificidades - não ignores

OUTPUT: JSON com { position, risks, objections, worstCase, mitigations, toolRequests }`,
    },

    moderator: {
        id: 'moderator',
        role: 'MODERATOR',
        name: 'Moderador',
        model: 'anthropic/claude-opus-4.5',
        emoji: '🎩',
        bias: 'Encontrar a melhor decisão para todas as partes',
        tools: [],
        systemPrompt: `És o Moderador do conselho de IA.
PAPEL: Orquestrar debate, identificar consenso/conflito, sintetizar.

RESPONSABILIDADES:
1. ROUND 0: Distribuir contexto, definir agenda clara
2. ROUND 1: Facilitar cross-examination entre agentes
3. ROUND 2: Identificar pontos de consenso e conflito
4. ROUND 3: Produzir recomendação final unificada

REGRAS:
1. Nunca tomes partido - mantém neutralidade
2. Força agentes a fundamentar opiniões
3. Destaca argumentos fortes de qualquer lado
4. A recomendação final deve ser acionável e específica

OUTPUT: Varia por round - instruções, resumos, ou recomendação final`,
    },

    // Tier 1 Specialized (Populated by classes)
    'llm-architect': {} as AgentConfig,
    'prompt-engineer': {} as AgentConfig,
    'search-specialist': {} as AgentConfig,
    'data-engineer': {} as AgentConfig,
    'typescript-expert': {} as AgentConfig,
    'qa-expert': {} as AgentConfig,

    // Tier 2 Specialized (Populated by classes)
    'security-auditor': {} as AgentConfig,
    'api-designer': {} as AgentConfig,
    'backend-developer': {} as AgentConfig,
    'frontend-developer': {} as AgentConfig,
    'business-analyst': {} as AgentConfig,
    'technical-writer': {} as AgentConfig,
};

// ============ Model Costs (OpenRouter Dec 2025) ============

export const MODEL_COSTS: Record<string, { input: number; output: number }> = {
    'openai/gpt-4o': { input: 2.5, output: 10 }, // per 1M tokens
    'anthropic/claude-sonnet-4': { input: 3, output: 15 },
    'deepseek/deepseek-r1:free': { input: 0, output: 0 },
    'mistralai/mistral-large-2512': { input: 2, output: 6 },
};
