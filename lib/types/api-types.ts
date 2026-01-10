
/**
 * Standard API Response Types
 * 
 * Centralized types for API responses to ensure consistency across the application.
 */

import { NextResponse } from 'next/server';

// Standard Success Response
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        pages?: number;
        [key: string]: any;
    };
}

// Standard Error Response
export interface ApiError {
    success: false;
    error: string;
    details?: any;
    code?: string;
}

// Helper to create consistent JSON responses
export class Api {
    static success<T>(data: T, meta?: ApiResponse['meta'], status = 200) {
        return NextResponse.json(
            { success: true, data, meta } as ApiResponse<T>,
            { status }
        );
    }

    static error(message: string, details?: any, status = 500, code?: string) {
        return NextResponse.json(
            { success: false, error: message, details, code } as ApiError,
            { status }
        );
    }

    static created<T>(data: T) {
        return Api.success(data, undefined, 201);
    }

    static notFound(message = 'Not Found') {
        return Api.error(message, undefined, 404, 'NOT_FOUND');
    }

    static unauthorized(message = 'Unauthorized') {
        return Api.error(message, undefined, 401, 'UNAUTHORIZED');
    }

    static forbidden(message = 'Forbidden') {
        return Api.error(message, undefined, 403, 'FORBIDDEN');
    }

    static badRequest(message: string, details?: any) {
        return Api.error(message, details, 400, 'BAD_REQUEST');
    }
}
