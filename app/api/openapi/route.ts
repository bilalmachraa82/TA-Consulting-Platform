import { NextRequest, NextResponse } from 'next/server';
import { openApiSpec, getOpenApiJson } from '@/lib/api/openapi-spec';

export const dynamic = 'force-dynamic';

/**
 * Origins permitidos para acessar a API OpenAPI
 * Isso previne CORS aberto e reduz riscos de segurança
 */
const ALLOWED_ORIGINS = [
    process.env.NEXTAUTH_URL || 'http://localhost:3000',
    'https://taconsulting.pt',
    'https://app.taconsulting.pt',
    'https://www.taconsulting.pt',
].filter(Boolean);

/**
 * Verifica se a origin é permitida
 */
function isOriginAllowed(origin: string | null): boolean {
    if (!origin) return false; // Requisições same-origin não precisam de CORS

    // Permitir origins específicos
    if (ALLOWED_ORIGINS.includes(origin)) return true;

    // Permitir qualquer subdomínio de vercel.app para desenvolvimento
    // (pode ser removido em produção se não necessário)
    if (process.env.NODE_ENV === 'development' && origin.endsWith('.vercel.app')) {
        return true;
    }

    return false;
}

/**
 * GET /api/openapi
 *
 * Retorna a especificação OpenAPI 3.1 da plataforma.
 * Pode ser usada com Swagger UI, Redocly, ou Postman.
 *
 * CORS é aplicado apenas para origins permitidos por segurança.
 */
export async function GET(request: NextRequest) {
    const origin = request.headers.get('origin');

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    // Adicionar CORS headers apenas para origins permitidos
    if (isOriginAllowed(origin)) {
        headers['Access-Control-Allow-Origin'] = origin!;
        headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS';
        headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
        headers['Access-Control-Max-Age'] = '86400'; // 24 horas
    }

    return new NextResponse(getOpenApiJson(), { headers });
}

/**
 * OPTIONS /api/openapi
 *
 * Responde a preflight requests CORS
 */
export async function OPTIONS(request: NextRequest) {
    const origin = request.headers.get('origin');

    const headers: Record<string, string> = {};

    if (isOriginAllowed(origin)) {
        headers['Access-Control-Allow-Origin'] = origin!;
        headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS';
        headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
        headers['Access-Control-Max-Age'] = '86400';
    }

    return new NextResponse(null, { headers });
}
