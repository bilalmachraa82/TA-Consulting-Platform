import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Em produção, sempre cria nova instância
// Em desenvolvimento, reutiliza para evitar muitas conexões
export const prisma = globalThis.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}
