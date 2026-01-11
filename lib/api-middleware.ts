import { NextRequest } from 'next/server';
import { ZodSchema } from 'zod';
import { handleApiError, ValidationError, UnauthorizedError, ForbiddenError } from './api-error-handler';

/**
 * Middleware de validação com Zod
 */
export async function withValidation<T>(
  request: NextRequest,
  schema: ZodSchema<T>,
  handler: (data: T, request: NextRequest) => Promise<Response>
): Promise<Response> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return handleApiError(result.error);
    }

    return handler(result.data, request);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Middleware de autenticação básica
 */
export function withAuth(
  handler: (request: NextRequest, session: any) => Promise<Response>
) {
  return async (request: NextRequest) => {
    // Import dinâmico para evitar issues em server components
    const { getServerSession } = await import('next-auth');
    const { authOptions } = await import('@/lib/auth');

    const session = await getServerSession(authOptions);

    if (!session) {
      throw new UnauthorizedError('Autenticação necessária');
    }

    return handler(request, session);
  };
}

/**
 * Middleware de verificação de roles
 */
export function withRole(allowedRoles: string[]) {
  return async (
    request: NextRequest,
    handler: (request: NextRequest, session: any) => Promise<Response>
  ) => {
    const { getServerSession } = await import('next-auth');
    const { authOptions } = await import('@/lib/auth');

    const session = await getServerSession(authOptions);

    if (!session) {
      throw new UnauthorizedError();
    }

    if (!allowedRoles.includes(session.user?.role)) {
      throw new ForbiddenError(`Acesso restrito a: ${allowedRoles.join(', ')}`);
    }

    return handler(request, session);
  };
}
