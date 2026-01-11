import { z } from 'zod';

const NIPC_REGEX = /^\d{9}$/;

export const DimensaoEmpresaEnum = z.enum(['MICRO', 'PEQUENA', 'MEDIA', 'GRANDE']);

export const CreateEmpresaSchema = z.object({
  nome: z.string().min(2, 'Nome muito curto').max(200, 'Nome muito longo'),
  nipc: z.string().regex(NIPC_REGEX, 'NIPC deve ter 9 dígitos'),
  cae: z.string().optional(),
  setor: z.string().optional(),
  regiao: z.string().optional(),
  dimensao: DimensaoEmpresaEnum.optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefone: z.string().optional(),
  morada: z.string().optional(),
  codigoPostal: z.string().optional(),
  localidade: z.string().optional(),
  consultorId: z.string().optional(),
  descricao: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
});

export const UpdateEmpresaSchema = CreateEmpresaSchema.partial();

export type CreateEmpresaInput = z.infer<typeof CreateEmpresaSchema>;
export type UpdateEmpresaInput = z.infer<typeof UpdateEmpresaSchema>;
