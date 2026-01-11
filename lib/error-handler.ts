/**
 * Utilitários de error handling
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Parse JSON seguro com fallback
 */
export function safeJSONParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}

/**
 * Wrapper para funções assíncronas com error handling
 */
export function asyncHandler<T extends (...args: any[]) => Promise<any>>(
  fn: T
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error('Async handler error:', error);
      throw error;
    }
  }) as T;
}

/**
 * Criar erro HTTP específico
 */
export function createHttpError(statusCode: number, message: string, details?: unknown) {
  const error = new Error(message) as any;
  error.statusCode = statusCode;
  error.details = details;
  return error;
}
