/**
 * OpenAPI 3.1 Specification - TA Consulting Platform
 * 
 * Auto-documentação base das APIs da plataforma.
 * Para gerar UI, usar: npx @redocly/cli preview-docs openapi.json
 */

export const openApiSpec = {
    openapi: '3.1.0',
    info: {
        title: 'TA Consulting Platform API',
        version: '1.0.0',
        description: 'API para gestão de avisos, candidaturas e sistema RAG de fundos europeus.',
        contact: {
            name: 'TA Consulting',
            email: 'support@ta-consulting.pt',
        },
    },
    servers: [
        {
            url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
            description: 'Server actual',
        },
    ],
    paths: {
        '/api/avisos': {
            get: {
                summary: 'Listar avisos abertos',
                operationId: 'getAvisos',
                tags: ['Avisos'],
                parameters: [
                    { name: 'portal', in: 'query', schema: { type: 'string' } },
                    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 100 } },
                ],
                responses: {
                    '200': {
                        description: 'Lista de avisos',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        avisos: { type: 'array', items: { $ref: '#/components/schemas/Aviso' } },
                                        pagination: { $ref: '#/components/schemas/Pagination' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            post: {
                summary: 'Criar novo aviso',
                operationId: 'createAviso',
                tags: ['Avisos'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/AvisoInput' },
                        },
                    },
                },
                responses: {
                    '201': { description: 'Aviso criado' },
                    '401': { description: 'Unauthorized' },
                    '403': { description: 'Forbidden' },
                },
            },
        },
        '/api/candidaturas': {
            get: {
                summary: 'Listar candidaturas',
                operationId: 'getCandidaturas',
                tags: ['Candidaturas'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': { description: 'Lista de candidaturas' },
                },
            },
        },
        '/api/chatbot': {
            post: {
                summary: 'Chat com assistente IA',
                operationId: 'chatbot',
                tags: ['AI'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['message'],
                                properties: {
                                    message: { type: 'string' },
                                    conversationHistory: { type: 'array' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    '200': { description: 'Stream de resposta IA' },
                    '429': { description: 'Rate limit exceeded' },
                },
            },
        },
        '/api/leads/submit': {
            post: {
                summary: 'Submeter lead (público)',
                operationId: 'submitLead',
                tags: ['Leads'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/LeadInput' },
                        },
                    },
                },
                responses: {
                    '200': { description: 'Lead processado com matches' },
                    '429': { description: 'Rate limit exceeded' },
                },
            },
        },
        '/api/quick-match': {
            post: {
                summary: 'Quick Match (público)',
                operationId: 'quickMatch',
                tags: ['Leads'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/QuickMatchInput' },
                        },
                    },
                },
                responses: {
                    '200': { description: 'Top 5 avisos matching' },
                },
            },
        },
    },
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
        schemas: {
            Aviso: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    nome: { type: 'string' },
                    codigo: { type: 'string' },
                    portal: { type: 'string', enum: ['PORTUGAL2030', 'PRR', 'PEPAC', 'IPDJ'] },
                    dataFimSubmissao: { type: 'string', format: 'date' },
                    diasRestantes: { type: 'integer' },
                    urgencia: { type: 'string', enum: ['alta', 'media', 'baixa'] },
                },
            },
            AvisoInput: {
                type: 'object',
                required: ['nome', 'portal', 'codigo', 'dataInicioSubmissao', 'dataFimSubmissao'],
                properties: {
                    nome: { type: 'string' },
                    portal: { type: 'string' },
                    codigo: { type: 'string' },
                    dataInicioSubmissao: { type: 'string', format: 'date' },
                    dataFimSubmissao: { type: 'string', format: 'date' },
                    descricao: { type: 'string' },
                },
            },
            LeadInput: {
                type: 'object',
                required: ['nomeEmpresa', 'email', 'distrito', 'tipoProjetoDesejado'],
                properties: {
                    nomeEmpresa: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    distrito: { type: 'string' },
                    tipoProjetoDesejado: { type: 'string' },
                    cae: { type: 'string' },
                    dimensao: { type: 'string', enum: ['MICRO', 'PEQUENA', 'MEDIA', 'GRANDE'] },
                },
            },
            QuickMatchInput: {
                type: 'object',
                required: ['setor', 'regiao', 'dimensao', 'objetivo'],
                properties: {
                    setor: { type: 'string' },
                    regiao: { type: 'string' },
                    dimensao: { type: 'string', enum: ['MICRO', 'PEQUENA', 'MEDIA', 'GRANDE'] },
                    objetivo: { type: 'string' },
                    nif: { type: 'string', minLength: 9, maxLength: 9 },
                },
            },
            Pagination: {
                type: 'object',
                properties: {
                    total: { type: 'integer' },
                    pages: { type: 'integer' },
                    page: { type: 'integer' },
                    limit: { type: 'integer' },
                },
            },
        },
    },
};

// Export JSON for external tools
export function getOpenApiJson() {
    return JSON.stringify(openApiSpec, null, 2);
}
