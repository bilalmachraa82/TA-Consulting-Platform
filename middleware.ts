import { withAuth } from "next-auth/middleware"

export default withAuth({
    pages: {
        signIn: '/auth/signin',
    },
})

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/api/candidaturas/:path*',
        '/api/empresas/:path*',
        '/api/documentos/:path*',
        // Public routes excluded: /apresentacao*, /proposta*, /auth/*, /api/auth/*,
        // /api/monitoring/health, /api/lead-chat/*, and the landing page.
    ]
}
