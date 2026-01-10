import { NextResponse } from 'next/server';
import { openApiSpec, getOpenApiJson } from '@/lib/api/openapi-spec';

export const dynamic = 'force-dynamic';

/**
 * GET /api/openapi
 * 
 * Retorna a especificação OpenAPI 3.1 da plataforma.
 * Pode ser usada com Swagger UI, Redocly, ou Postman.
 */
export async function GET() {
    return new NextResponse(getOpenApiJson(), {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
    });
}
