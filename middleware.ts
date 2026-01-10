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
        // Exclude public routes like /apresentacao
    ]
}
