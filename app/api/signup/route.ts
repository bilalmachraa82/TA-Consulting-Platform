
export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { z } from 'zod'

/**
 * Schema de validação robusto para signup usando Zod
 * Garante que os dados de entrada estejam formatados corretamente
 * e que a senha atenda aos requisitos de segurança mínimos
 */
const signupSchema = z.object({
  email: z.string()
    .min(1, 'Email é obrigatório')
    .email('Formato de email inválido')
    .toLowerCase()
    .trim()
    .refine(email => {
      // Validação adicional para prevenir emails maliciosos ou inválidos
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailRegex.test(email);
    }, 'Email inválido'),
  nome: z.string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim()
    .refine(nome => {
      // Prevenir injeção de código ou caracteres perigosos
      return !/[<>\"'&]/.test(nome);
    }, 'Nome contém caracteres inválidos'),
  password: z.string()
    .min(12, 'Senha deve ter no mínimo 12 caracteres')
    .max(128, 'Senha deve ter no máximo 128 caracteres')
    .refine(password => {
      // Pelo menos uma letra maiúscula
      return /[A-Z]/.test(password);
    }, 'Senha deve conter pelo menos uma letra maiúscula')
    .refine(password => {
      // Pelo menos uma letra minúscula
      return /[a-z]/.test(password);
    }, 'Senha deve conter pelo menos uma letra minúscula')
    .refine(password => {
      // Pelo menos um número
      return /[0-9]/.test(password);
    }, 'Senha deve conter pelo menos um número')
    .refine(password => {
      // Pelo menos um caractere especial
      return /[^A-Za-z0-9]/.test(password);
    }, 'Senha deve conter pelo menos um caractere especial')
    .refine(password => {
      // Prevenir senhas comuns ou fracas conhecidas
      const commonPasswords = ['password', '123456789', 'qwerty', 'abc123', 'password123'];
      return !commonPasswords.some(common => password.toLowerCase().includes(common));
    }, 'Senha é muito comum ou fraca'),
  role: z.enum(['USER', 'ADMIN']).optional().default('USER')
});

/**
 * Tipo inferido do schema para uso no código
 */
type SignupInput = z.infer<typeof signupSchema>;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validar entrada com Zod
    const validationResult = signupSchema.safeParse(body);

    if (!validationResult.success) {
      // Retornar erros de validação detalhados
      const flattenedErrors = validationResult.error.flatten();
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: {
            fieldErrors: flattenedErrors.fieldErrors,
            formErrors: flattenedErrors.formErrors
          }
        },
        { status: 400 }
      );
    }

    const { email, nome, password, role } = validationResult.data as SignupInput & { role: string };

    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'User already exists',
          code: 'USER_EXISTS'
        },
        { status: 409 } // 409 Conflict é mais apropriado aqui
      );
    }

    // Hash da senha com salt rounds de 12
    const hashedPassword = await bcrypt.hash(password, 12);

    // Criar usuário com role normalizada para minúsculas
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: nome,
        role: role.toLowerCase()
      }
    });

    // Remover senha da resposta
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      message: 'User created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);

    // Tratamento específico para erros conhecidos do Prisma
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string; meta?: { target?: string[] } };

      if (prismaError.code === 'P2002') {
        return NextResponse.json(
          {
            success: false,
            error: 'User already exists',
            code: 'DUPLICATE_ENTRY'
          },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}
