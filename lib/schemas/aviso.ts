import { z } from 'zod';

export const PortalEnum = z.enum([
  'PORTUGAL2030',
  'PEPAC',
  'PRR',
  'HORIZON_EUROPE',
  'EUROPA_CRIATIVA',
  'IPDJ',
  'BASE_GOV'
]);

export const CreateAvisoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(200),
  portal: PortalEnum,
  codigo: z.string().min(1, 'Código é obrigatório'),
  programa: z.string().optional(),
  dataInicioSubmissao: z.coerce.date().optional(),
  dataFimSubmissao: z.coerce.date().optional(),
  montanteMinimo: z.number().positive().optional(),
  montanteMaximo: z.number().positive().optional(),
  objetivo: z.string().optional(),
  descricao: z.string().optional(),
  ativo: z.boolean().default(true),
}).refine(
  (data) => {
    if (!data.dataInicioSubmissao || !data.dataFimSubmissao) return true;
    return data.dataFimSubmissao > data.dataInicioSubmissao;
  },
  { message: "Data fim deve ser posterior a data início" }
);

export const UpdateAvisoSchema = CreateAvisoSchema.partial();

export type CreateAvisoInput = z.infer<typeof CreateAvisoSchema>;
export type UpdateAvisoInput = z.infer<typeof UpdateAvisoSchema>;
