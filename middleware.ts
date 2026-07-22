import { withAuth } from "next-auth/middleware"

export default withAuth({
    pages: {
        // Tem de coincidir com authOptions.pages.signIn (lib/auth.ts) — /auth/signin não existe.
        signIn: '/auth/login',
    },
})

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/api/candidaturas/:path*',
        '/api/empresas/:path*',
        '/api/documentos/:path*',
        '/api/exportar-pdf/:path*',
        // Public routes excluded: /apresentacao*, /proposta*, /auth/*, /api/auth/*,
        // /api/monitoring/health, /api/lead-chat/*, and the landing page.
    ]
}
