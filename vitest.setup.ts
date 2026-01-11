import { vi } from 'vitest'
import '@testing-library/jest-dom'

// Mock next-auth for testing
vi.mock('next-auth', () => ({
    getServerSession: vi.fn(),
}))

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
    useSession: vi.fn(() => ({ data: null, status: 'unauthenticated' })),
    signIn: vi.fn(),
    signOut: vi.fn(),
}))

// Mock environment variables
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.NEXTAUTH_SECRET = 'test-secret'

// Mock Next.js headers
vi.mock('next/headers', () => ({
    headers: vi.fn(() => ({
        get: vi.fn((key: string) => {
            if (key === 'cookie') return 'session=mock-session'
            return null
        }),
    })),
}))

// Mock next/cache
vi.mock('next/cache', () => ({
    unstable_cache: (fn: any) => fn,
    revalidatePath: vi.fn(),
    revalidateTag: vi.fn(),
}))

// Setup global test utilities
global.console = {
    ...console,
    // Suppress console logs during tests unless needed
    log: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    // Keep errors and warnings for debugging
    warn: console.warn,
    error: console.error,
}

// Reset all mocks before each test
beforeEach(() => {
    vi.clearAllMocks()
})

// Silence console.log in CI
if (process.env.CI) {
    console.log = vi.fn()
    console.warn = vi.fn()
    console.debug = vi.fn()
    console.info = vi.fn()
}
