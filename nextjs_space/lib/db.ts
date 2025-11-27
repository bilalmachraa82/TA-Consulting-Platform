/* eslint-disable @typescript-eslint/no-explicit-any */
const globalForPrisma = globalThis as unknown as {
  prisma: any | undefined
}

// Create a mock client for build time
const createMockPrisma = (): any => new Proxy({} as any, {
  get: (_target, prop) => {
    // Return mock methods that return empty arrays or objects
    if (prop === '$connect' || prop === '$disconnect') {
      return () => Promise.resolve()
    }
    if (prop === 'then') {
      return undefined // Prevent treating as thenable
    }
    // For model methods like findMany, create, etc.
    return new Proxy({} as any, {
      get: (_t, method) => {
        if (method === 'then') return undefined
        return (..._args: any[]) => Promise.resolve(method === 'count' ? 0 : [])
      }
    })
  }
})

// Check if we're in build phase
const isBuildPhase = () => {
  return process.env.NEXT_PHASE === 'phase-production-build'
}

// Lazy getter for prisma client
function getPrismaClient(): any {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma
  }

  // During build time, return mock
  if (isBuildPhase()) {
    console.log('[Prisma] Build phase detected, using mock client')
    return createMockPrisma()
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaClient } = require('@prisma/client')
    const client = new PrismaClient()
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = client
    }
    return client
  } catch (error) {
    console.warn('[Prisma] Client not available, using mock:', (error as Error).message)
    return createMockPrisma()
  }
}

// Export a proxy that lazily gets the real client
export const prisma: any = new Proxy({} as any, {
  get: (_target, prop) => {
    if (prop === 'then') return undefined // Prevent treating as thenable
    const client = getPrismaClient()
    const value = client[prop]
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  }
})
