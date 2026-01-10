import { z } from 'zod';

export const AvisoSchema = z.object({
    titulo: z.string().describe("Título do aviso ou concurso"),
    descricao: z.string().optional().describe("Descrição resumida do aviso"),
    id: z.string().optional().describe("Código ou identificador único do aviso se disponível"),

    // Datas
    data_abertura: z.string().optional().describe("Data de abertura no formato YYYY-MM-DD"),
    data_fecho: z.string().optional().describe("Data de fecho ou deadline no formato YYYY-MM-DD"),

    // Financeiro
    montante_total: z.string().optional().describe("Montante total ou orçamento disponível (apenas números)"),
    taxa_apoio: z.string().optional().describe("Taxa de co-financiamento em percentagem (ex: 85%)"),
    montante_min: z.string().optional(),
    montante_max: z.string().optional(),

    // Filtros
    programa: z.string().optional().describe("Nome do programa financiador (ex: Portugal 2030, PRR)"),
    setor: z.array(z.string()).optional().describe("Setores de atividade abrangidos"),
    beneficiarios: z.array(z.string()).optional().describe("Tipos de entidades beneficiárias"),
    regiao: z.array(z.string()).optional().describe("Regiões elegíveis"),

    // Links & Documentos
    url: z.string().describe("URL original da página do aviso"),
    pdf_url: z.string().optional().describe("URL direto para o PDF regulamento principal"),
    anexos: z.array(z.object({
        nome: z.string(),
        url: z.string()
    })).optional().describe("Lista de documentos anexos"),

    // Estado
    status: z.enum(['Aberto', 'Fechado', 'A abrir', 'Suspenso']).optional().describe("Estado atual do aviso"),
});

export type AvisoFirecrawl = z.infer<typeof AvisoSchema>;
