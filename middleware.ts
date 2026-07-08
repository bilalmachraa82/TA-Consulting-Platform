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
        '/leads/:path*',
        '/api/candidaturas/:path*',
        '/api/empresas/:path*',
        '/api/documentos/:path*',
        // Public routes excluded: /apresentacao*, /proposta*, /auth/*, /api/auth/*,
        // /api/monitoring/health, /api/lead-chat/*, and the landing page.
        // /api/leads/* fica público: submit e validate-nif servem o funil de
        // captação de leads (lead-magnet) usado por visitantes sem sessão.
    ]
}
