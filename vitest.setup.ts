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

// Silence console.log in tests unless needed
if (process.env.CI) {
    console.log = vi.fn()
    console.warn = vi.fn()
}
