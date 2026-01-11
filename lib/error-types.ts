/**
 * Tipos de erro centralizados
 */

export type ErrorContext = {
  userId?: string;
  action?: string;
  resource?: string;
  timestamp?: string;
  path?: string;
};

export type ErrorResponse = {
  success: false;
  error: string;
  details?: unknown;
  context?: ErrorContext;
  code?: string;
};

export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; details?: unknown; code?: string };

/**
 * Tipos de erro HTTP
 */
export type HttpErrorType =
  | 'BadRequest'
  | 'Unauthorized'
  | 'Forbidden'
  | 'NotFound'
  | 'Conflict'
  | 'UnprocessableEntity'
  | 'InternalServerError';

export interface HttpError extends Error {
  statusCode: number;
  type: HttpErrorType;
  details?: unknown;
}
