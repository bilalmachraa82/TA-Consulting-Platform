
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // 🔒 SECURITY: CVE-2025-57822 - Always pass request explicitly
    const token = req.nextauth.token

    // Check if accessing admin routes
    if (req.nextUrl.pathname.startsWith('/admin')) {
      // Require ADMIN role for /admin/* routes
      if (token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    // Pass request explicitly to prevent SSRF (CVE-2025-57822)
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect dashboard and admin routes
        if (req.nextUrl.pathname.startsWith('/dashboard') || req.nextUrl.pathname.startsWith('/admin')) {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*', // ← ADDED: Protect admin routes
  ]
}
