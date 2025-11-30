/**
 * Database client with fallback to JSON data provider
 * Uses Prisma when available, falls back to data-provider.ts when Prisma binaries are not accessible
 */

import { dataProvider } from './data-provider';

// Type for the database client (supports both Prisma and fallback)
type DatabaseClient = {
  aviso: {
    findMany: (options?: any) => Promise<any[]>;
    findUnique: (options: any) => Promise<any | null>;
    count: (options?: any) => Promise<number>;
    create: (options: any) => Promise<any>;
    update: (options: any) => Promise<any>;
    upsert: (options: any) => Promise<any>;
    groupBy: (options: any) => Promise<any[]>;
  };
  empresa: {
    findMany: (options?: any) => Promise<any[]>;
    findUnique: (options: any) => Promise<any | null>;
    count: (options?: any) => Promise<number>;
    create: (options: any) => Promise<any>;
    update: (options: any) => Promise<any>;
    upsert: (options: any) => Promise<any>;
    groupBy: (options: any) => Promise<any[]>;
  };
  candidatura: {
    findMany: (options?: any) => Promise<any[]>;
    findUnique: (options: any) => Promise<any | null>;
    findFirst: (options?: any) => Promise<any | null>;
    count: (options?: any) => Promise<number>;
    create: (options: any) => Promise<any>;
    update: (options: any) => Promise<any>;
    groupBy: (options: any) => Promise<any[]>;
  };
  documento: {
    findMany: (options?: any) => Promise<any[]>;
    findUnique: (options: any) => Promise<any | null>;
    count: (options?: any) => Promise<number>;
    create: (options: any) => Promise<any>;
    update: (options: any) => Promise<any>;
    delete: (options: any) => Promise<any>;
  };
  workflow: {
    findMany: (options?: any) => Promise<any[]>;
    findUnique: (options: any) => Promise<any | null>;
    count: (options?: any) => Promise<number>;
    create: (options: any) => Promise<any>;
    update: (options: any) => Promise<any>;
  };
  workflowLog: {
    findMany: (options?: any) => Promise<any[]>;
    create: (options: any) => Promise<any>;
  };
  notificacao: {
    findMany: (options?: any) => Promise<any[]>;
    create: (options: any) => Promise<any>;
  };
  user: {
    findUnique: (options: any) => Promise<any | null>;
    findFirst: (options?: any) => Promise<any | null>;
    create: (options: any) => Promise<any>;
  };
  $connect: () => Promise<void>;
  $disconnect: () => Promise<void>;
};

// Try to use Prisma if available
let prismaClient: any = null;
let usePrisma = false;

try {
  // Dynamic import to avoid build-time errors
  const PrismaClientModule = require('@prisma/client');
  const PrismaClient = PrismaClientModule.PrismaClient;

  // Try to instantiate - this will fail if binaries are missing
  prismaClient = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

  usePrisma = true;
  console.log('✅ Using Prisma client for database access');
} catch (error: any) {
  console.log('⚠️ Prisma client not available, using JSON data provider');
  console.log('   Reason:', error.message?.substring(0, 100));
  usePrisma = false;
}

// Helper function to implement groupBy
function groupByField(items: any[], field: string): any[] {
  const groups: { [key: string]: number } = {};
  for (const item of items) {
    const value = item[field] ?? 'null';
    groups[value] = (groups[value] || 0) + 1;
  }
  return Object.entries(groups).map(([key, count]) => ({
    [field]: key === 'null' ? null : key,
    _count: { [field]: count },
  }));
}

// Fallback client using data provider
const fallbackClient: DatabaseClient = {
  aviso: {
    findMany: async (options?: any) => {
      return dataProvider.avisos.findMany(options);
    },
    findUnique: async (options: any) => {
      return dataProvider.avisos.findUnique(options);
    },
    count: async (options?: any) => {
      return dataProvider.avisos.count(options);
    },
    create: async (options: any) => {
      console.warn('Create operation not fully supported in fallback mode');
      return { ...options.data, id: `temp_${Date.now()}` };
    },
    update: async (options: any) => {
      console.warn('Update operation not fully supported in fallback mode');
      const existing = await dataProvider.avisos.findUnique({ where: options.where });
      return { ...existing, ...options.data };
    },
    upsert: async (options: any) => {
      const existing = await dataProvider.avisos.findUnique({ where: options.where });
      if (existing) {
        return { ...existing, ...options.update };
      }
      return { ...options.create, id: `temp_${Date.now()}` };
    },
    groupBy: async (options: any) => {
      let avisos = await dataProvider.avisos.findMany(options?.where ? { where: options.where } : undefined);
      const byField = Array.isArray(options.by) ? options.by[0] : options.by;
      return groupByField(avisos, byField);
    },
  },
  empresa: {
    findMany: async (options?: any) => {
      return dataProvider.empresas.findMany(options);
    },
    findUnique: async (options: any) => {
      return dataProvider.empresas.findUnique(options);
    },
    count: async (options?: any) => {
      return dataProvider.empresas.count();
    },
    create: async (options: any) => {
      console.warn('Create operation not fully supported in fallback mode');
      return { ...options.data, id: `temp_${Date.now()}` };
    },
    update: async (options: any) => {
      console.warn('Update operation not fully supported in fallback mode');
      const existing = await dataProvider.empresas.findUnique({ where: options.where });
      return { ...existing, ...options.data };
    },
    upsert: async (options: any) => {
      const existing = await dataProvider.empresas.findUnique({ where: options.where });
      if (existing) {
        return { ...existing, ...options.update };
      }
      return { ...options.create, id: `temp_${Date.now()}` };
    },
    groupBy: async (options: any) => {
      let empresas = await dataProvider.empresas.findMany(options?.where ? { where: options.where } : undefined);
      const byField = Array.isArray(options.by) ? options.by[0] : options.by;
      return groupByField(empresas, byField);
    },
  },
  candidatura: {
    findMany: async () => [],
    findUnique: async () => null,
    findFirst: async () => null,
    count: async () => 0,
    create: async (options: any) => ({ ...options.data, id: `temp_${Date.now()}` }),
    update: async (options: any) => options.data,
    groupBy: async () => [],
  },
  documento: {
    findMany: async () => [],
    findUnique: async () => null,
    count: async () => 0,
    create: async (options: any) => ({ ...options.data, id: `temp_${Date.now()}` }),
    update: async (options: any) => options.data,
    delete: async (options: any) => ({ id: options.where?.id }),
  },
  workflow: {
    findMany: async () => [],
    findUnique: async () => null,
    count: async () => 0,
    create: async (options: any) => ({ ...options.data, id: `temp_${Date.now()}` }),
    update: async (options: any) => options.data,
  },
  workflowLog: {
    findMany: async () => [],
    create: async (options: any) => ({ ...options.data, id: `temp_${Date.now()}` }),
  },
  notificacao: {
    findMany: async () => [],
    create: async (options: any) => ({ ...options.data, id: `temp_${Date.now()}` }),
  },
  user: {
    findUnique: async () => null,
    findFirst: async () => null,
    create: async (options: any) => ({ ...options.data, id: `temp_${Date.now()}` }),
  },
  $connect: async () => {},
  $disconnect: async () => {},
};

// Export the appropriate client
export const prisma: DatabaseClient = usePrisma && prismaClient ? prismaClient : fallbackClient;

// Export utilities
export const isPrismaAvailable = () => usePrisma;
export const getDataProvider = () => dataProvider;

// For direct data access (useful for APIs)
export { dataProvider };
