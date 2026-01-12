import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic"

/**
 * API endpoint для торгового бота
 * Возвращает всех пользователей с активными подписками и их конфигурациями
 * 
 * Аутентификация через API ключ (BOT_API_KEY в env)
 */
export async function GET(request: NextRequest) {
  try {
    // Проверка API ключа
    const authHeader = request.headers.get('authorization')
    const apiKey = process.env.BOT_API_KEY
    
    if (!apiKey) {
      console.error('BOT_API_KEY not configured in environment variables')
      return NextResponse.json(
        { error: 'Bot API key not configured' },
        { status: 500 }
      )
    }

    if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized. Invalid API key' },
        { status: 401 }
      )
    }

    // Получаем всех пользователей с активными подписками
    const users = await prisma.user.findMany({
      where: {
        subscriptions: {
          some: {
            status: 'ACTIVE',
            endDate: {
              gte: new Date() // Подписка еще не истекла
            }
          }
        },
        configs: {
          some: {
            apiKey: {
              not: null
            },
            apiSecret: {
              not: null
            }
          }
        }
      },
      include: {
        subscriptions: {
          where: {
            status: 'ACTIVE',
            endDate: {
              gte: new Date()
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1 // Берем только последнюю активную подписку
        },
        configs: {
          where: {
            apiKey: {
              not: null
            },
            apiSecret: {
              not: null
            }
          },
          take: 1 // Берем только первую конфигурацию
        }
      }
    })

    // Формируем данные для бота
    const botUsers = users
      .filter(user => user.subscriptions.length > 0 && user.configs.length > 0)
      .map(user => {
        const subscription = user.subscriptions[0]
        const config = user.configs[0]

        // Определяем profit_limit на основе плана
        let profitLimit = '25' // default
        if (subscription.planName === 'Basic') {
          profitLimit = '25'
        } else if (subscription.planName === 'Professional') {
          profitLimit = '40'
        } else if (subscription.planName === 'Premium') {
          profitLimit = 'unlim'
        }

        // Определяем период подписки
        const subPeriod = subscription.planType === 'monthly' ? '30' : '90'

        // Вычисляем оставшиеся дни подписки
        const daysRemaining = subscription.endDate
          ? Math.ceil((new Date(subscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          : 0

        return {
          user_id: user.id,
          user_name: user.name || user.email.split('@')[0],
          email: user.email,
          exchange: config.exchange, // 'binance' или 'bybit'
          api_key: config.apiKey,
          api_secret: config.apiSecret,
          subscription: {
            plan_name: subscription.planName,
            plan_type: subscription.planType,
            profit_limit: profitLimit,
            sub_period: subPeriod,
            start_date: subscription.startDate?.toISOString(),
            end_date: subscription.endDate?.toISOString(),
            days_remaining: daysRemaining,
            status: subscription.status
          },
          config: {
            config_id: config.id,
            is_active: config.isActive,
            bot_status: config.botStatus,
            last_activity: config.lastActivity?.toISOString(),
            total_trades: config.totalTrades,
            current_profit_percent: config.currentProfitPercent,
            profitable_trades: config.profitableTrades,
            losing_trades: config.losingTrades,
            last_trade_date: config.lastTradeDate?.toISOString(),
            error_count: config.errorCount,
            last_error: config.lastError
          }
        }
      })

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      total_users: botUsers.length,
      users: botUsers
    })

  } catch (error) {
    console.error('Bot API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

