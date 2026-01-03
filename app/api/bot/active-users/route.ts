import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic"

/**
 * API endpoint для получения списка активных пользователей для торгового бота
 * Используется ботом для загрузки пользователей при старте и при сбросе дня
 */
export async function GET(request: NextRequest) {
  try {
    // Проверка авторизации через API ключ (можно добавить позже)
    const apiKey = request.headers.get('x-api-key')
    // TODO: Добавить проверку API ключа для безопасности
    
    // Получаем параметр exchange из query string
    const { searchParams } = new URL(request.url)
    const exchange = searchParams.get('exchange')?.toLowerCase() // bybit или binance
    
    if (!exchange || !['bybit', 'binance'].includes(exchange)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing or invalid exchange parameter. Use ?exchange=bybit or ?exchange=binance' 
        },
        { status: 400 }
      )
    }
    
    // Получаем активных пользователей с активными подписками для указанной биржи
    const activeUsers = await prisma.tradingConfig.findMany({
      where: {
        isActive: true,
        exchange: exchange, // Фильтруем по бирже
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
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        subscriptionStartDate: 'asc' // Старые подписки первыми
      }
    })

    // Форматируем данные для бота
    const formattedUsers = activeUsers.map(config => ({
      userId: config.userId,
      userName: config.user?.name || config.user?.email || 'Unknown',
      exchange: config.exchange,
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
      profitLimit: config.profitLimit,
      subPeriodDays: config.subPeriodDays,
      subscriptionStartDate: config.subscriptionStartDate,
      currentProfitPercent: config.currentProfitPercent,
      totalTrades: config.totalTrades,
      profitableTrades: config.profitableTrades,
      losingTrades: config.losingTrades,
      errorCount: config.errorCount,
      lastError: config.lastError
    }))

    return NextResponse.json({
      success: true,
      count: formattedUsers.length,
      users: formattedUsers
    })

  } catch (error) {
    console.error('Get active users error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

