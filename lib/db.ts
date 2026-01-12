import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Проверка DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set!')
  throw new Error('DATABASE_URL environment variable is not set')
}

// Проверка, что используется Connection Pooling URL для production (Vercel)
if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
  const dbUrl = process.env.DATABASE_URL
  // Supabase Connection Pooling использует порт 6543
  if (dbUrl && !dbUrl.includes(':6543') && !dbUrl.includes('pooler')) {
    console.warn('⚠️ WARNING: DATABASE_URL might not be using Connection Pooling (port 6543). This can cause connection issues on Vercel.')
    console.warn('For Supabase, use Connection Pooling URL: postgresql://...@pooler.supabase.com:6543/postgres')
  }
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

// Проверка подключения при инициализации
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Функция для проверки подключения к БД
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database connection check failed:', error)
    return false
  }
}
