import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = "force-dynamic"

/**
 * API endpoint для админа: проверка активных пользователей в базе данных
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const exchange = searchParams.get('exchange')?.toLowerCase() || null

    // Получаем всех активных пользователей
    const whereClause: any = {
      isActive: true,
      apiKey: { not: null },
      apiSecret: { not: null },
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
      users: formattedUsers
    })

  } catch (error) {
    console.error('Check active users error:', error)
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

