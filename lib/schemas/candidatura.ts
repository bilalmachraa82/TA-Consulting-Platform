import { z } from 'zod';

export const EstadoCandidaturaEnum = z.enum([
  'A_PREPARAR',
  'SUBMETIDA',
  'EM_ANALISE',
  'APROVADA',
  'REJEITADA',
  'CANCELADA'
]);

export const CreateCandidaturaSchema = z.object({
  empresaId: z.string().min(1, 'Empresa é obrigatória'),
  avisoId: z.string().min(1, 'Aviso é obrigatório'),
  estado: EstadoCandidaturaEnum.default('A_PREPARAR'),
  notas: z.string().optional(),
  dataSubmissao: z.coerce.date().optional(),
});

export const UpdateCandidaturaSchema = CreateCandidaturaSchema.partial();

export type CreateCandidaturaInput = z.infer<typeof CreateCandidaturaSchema>;
export type UpdateCandidaturaInput = z.infer<typeof UpdateCandidaturaSchema>;
