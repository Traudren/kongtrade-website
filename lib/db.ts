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
  if (dbUrl) {
    const hasPooler = dbUrl.includes('pooler') || dbUrl.includes(':6543')
    if (!hasPooler) {
      console.error('❌ CRITICAL: DATABASE_URL is NOT using Connection Pooling!')
      console.error('Current URL contains:', dbUrl.includes(':5432') ? 'port 5432 (direct connection)' : 'unknown format')
      console.error('For Vercel/Supabase, you MUST use Connection Pooling URL with port 6543')
      console.error('Example: postgresql://...@aws-0-eu-north-1.pooler.supabase.com:6543/postgres')
    } else {
      console.log('✅ DATABASE_URL is using Connection Pooling (correct for Vercel)')
    }
  } else {
    console.error('❌ DATABASE_URL is not set in production!')
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
