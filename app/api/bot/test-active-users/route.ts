import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic"

/**
 * Тестовый endpoint для проверки активных пользователей (без авторизации)
 * ВАЖНО: Это только для тестирования! В продакшене используйте /api/admin/check-active-users
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const exchange = searchParams.get('exchange')?.toLowerCase() || null

    // Получаем всех активных пользователей
    const whereClause: any = {
      isActive: true,
      subscriptionStartDate: { not: null },
      user: {
        subscriptions: {
          some: {
            status: 'ACTIVE',
            endDate: { gte: new Date() }
          }
        }
      }
    }

    if (exchange && ['bybit', 'binance'].includes(exchange)) {
      whereClause.exchange = exchange
    }

    const activeUsers = await prisma.tradingConfig.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        subscriptionStartDate: 'desc'
      }
    })

    // Форматируем для удобного просмотра
    const formattedUsers = activeUsers.map(config => ({
      userId: config.userId,
      userName: config.user?.name || config.user?.email || 'Unknown',
      userEmail: config.user?.email,
      exchange: config.exchange,
      isActive: config.isActive,
      botStatus: config.botStatus,
      profitLimit: config.profitLimit,
      subPeriodDays: config.subPeriodDays,
      subscriptionStartDate: config.subscriptionStartDate,
      currentProfitPercent: config.currentProfitPercent,
      totalTrades: config.totalTrades,
      profitableTrades: config.profitableTrades,
      losingTrades: config.losingTrades,
      hasApiKeys: !!(config.apiKey && config.apiSecret),
      errorCount: config.errorCount,
      lastError: config.lastError,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt
    }))

    return NextResponse.json({
      success: true,
      count: formattedUsers.length,
      exchange: exchange || 'all',
      message: 'Это тестовый endpoint. В продакшене используйте /api/admin/check-active-users',
      users: formattedUsers
    })

  } catch (error) {
    console.error('Test active users error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

